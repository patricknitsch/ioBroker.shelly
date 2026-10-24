import type { EventEmitter } from 'node:events';
import { connect as connectBroker, type IClientOptions, type MqttClient as BrokerConnection } from 'mqtt';
import mqtt, { type Connection, type MqttPacket } from 'mqtt-connection';
import * as net from 'node:net';

import { BaseClient, BaseServer } from './base';
import * as datapoints from '../datapoints';
import {
    CMD_SRC,
    getBrokerUrl,
    getExternalDeviceKey,
    INIT_SRC,
    isOnlinePayload,
    isShellyDeviceSegment,
    parseExternalTopic,
} from './mqtt-topics';
import { version as adapterVersion } from '../../../package.json';
import type { ShellyAdapter } from '../../main';
import type ObjectHelper from '../objectHelper';

/** A queued/awaited MQTT message kept for QoS>0 resends, keyed by message id. */
interface CachedMessage {
    ts: number;
    cmd: string;
    count: number;
    message?: MqttPacket;
    resendid?: NodeJS.Timeout;
}

// Whether `funct` is an `async` function (so the caller knows to `await` its result).
function isAsync(funct: unknown): boolean | undefined {
    if (typeof funct === 'function' && funct.constructor) {
        return funct.constructor.name == 'AsyncFunction';
    }
    return undefined;
}

class MQTTClient extends BaseClient {
    static clientlist: Record<string, MQTTClient>;

    /** The underlying TCP stream of this MQTT connection. */
    stream: net.Socket;
    /** MQTT topic prefix announced by the device (e.g. `shellyplus1-abc`). */
    mqttprefix: string | undefined;
    /** Running HTTP request for the mqtt prefix, so it is not requested several times in parallel */
    private mqttPrefixLookup: Promise<string | undefined> | undefined;
    /** Pending fragmented/awaited messages by id. */
    messageCache: Record<string, CachedMessage>;
    messageId: number;
    /** The MQTT "last will" packet of the device, once known. */
    will: MqttPacket | undefined;
    /** True while delaying publishes right after a new connection. */
    initializing: boolean;
    /** Publish packets queued during initialization. */
    publishQueue: MqttPacket[];
    /** Commands to the device queued during initialization, because the mqtt prefix was not known yet. */
    commandQueue: { topic: string; value: any }[];
    /** True while the publish queue is being drained. */
    processingQueue: boolean;
    /** True during destruction, to stop queuing new packets. */
    destroying: boolean;
    /** The mqtt-connection wrapper around the stream (assigned in `start()`, called from the ctor). */
    client!: Connection;

    constructor(adapter: ShellyAdapter, objectHelper: ObjectHelper, eventEmitter: EventEmitter, stream: net.Socket) {
        super('mqtt', adapter, objectHelper, eventEmitter);

        this.stream = stream;

        this.messageCache = {};
        this.messageId = 1;
        this.will = undefined;

        this.initializing = false; // use to delay publish packets after new connection
        this.publishQueue = []; // queue for publish packets during initialization
        this.commandQueue = []; // queue for commands to the device during initialization (mqtt prefix unknown)
        this.processingQueue = false; // flag to indicate queue processing is in progress
        this.destroying = false; // flag to prevent new packets from being queued during destruction

        this.start();
    }

    start(): void {
        this.client = mqtt(this.stream);
        this.listener();
    }

    /**
     * to get sure, that an instance will be start more than one, we check for running instances
     * if an instance run with same name (shellyswitch-12345), we destroy the old instance
     *
     * @param self - my instance
     */
    static _registerRun(self: MQTTClient | undefined): void {
        if (self) {
            this.clientlist = this.clientlist || {};
            const name = self.getId();
            if (name) {
                const previous = this.clientlist[name];
                // Register the new client first, so destroy() of the old client detects the replacement
                // and does not set the device offline (e.g. reconnect after an IP change behind a range extender)
                this.clientlist[name] = self;
                if (previous && previous !== self) {
                    previous
                        .destroy()
                        .catch((e: unknown) => previous.adapter.log.error(`[MQTT] destroy failed: ${String(e)}`));
                }
            }
        }
    }

    /**
     * @inheritdoc
     */
    getSerialId(): string {
        if (!this.serialId) {
            let id = this.getId();
            if (id) {
                id = id.replace(/(.+?)\/(.+?)\/(.*)/, '$2');
                this.serialId = id.replace(/(.+)-(.+)/, '$2');
            }
        }
        return this.serialId ?? '';
    }

    /**
     * @inheritdoc
     */
    getDeviceClass(): string {
        if (!this.deviceClass) {
            let id = this.getId();
            if (id) {
                id = id.replace(/(.+?)\/(.+?)\/(.*)/, '$2');
                this.deviceClass = id.replace(/(.+)-(.+)/, '$1');
            }
        }
        return this.deviceClass ?? '';
    }

    /**
     * @inheritdoc
     */
    getDeviceType(): string | undefined {
        if (!this.deviceType) {
            const deviceClass = this.getDeviceClass();
            this.deviceType = datapoints.getDeviceTypeByClass(deviceClass);
        }
        return this.deviceType;
    }

    /**
     * @inheritdoc
     */
    getDeviceId(): string | undefined {
        if (!this.deviceId) {
            const deviceType = this.getDeviceType();
            const serialId = this.getSerialId();
            if (deviceType && serialId) {
                this.deviceId = `${deviceType}#${serialId}#1`;
            }
        }
        return this.deviceId;
    }

    getMqttPrefix(): string {
        return this.mqttprefix ?? '';
    }

    replacePrefixIn(topic: string): string {
        return new String(topic).replace(new RegExp('<mqttprefix>', 'g'), this.getMqttPrefix());
    }

    /**
     * Process queued publish packets sequentially
     */
    async processPublishQueue(): Promise<void> {
        // Atomic check-and-set to prevent race conditions
        // Both operations must be synchronous (no await between them)
        if (this.processingQueue || this.publishQueue.length === 0) {
            return;
        }
        this.processingQueue = true;

        this.adapter.log.silly(
            `[MQTT] Publish: ${this.getLogInfo()} - start processing ${this.publishQueue.length} queued packets`,
        );

        try {
            while (this.publishQueue.length > 0) {
                const packet = this.publishQueue.shift();
                if (!packet) {
                    continue;
                }
                try {
                    await this.processPublishPacket(packet);
                } catch (err) {
                    this.adapter.log.error(
                        `[MQTT] Publish: ${this.getLogInfo()} - error processing packet: ${err && err.message ? err.message : err}`,
                    );
                }
            }
        } finally {
            this.processingQueue = false;
        }
        this.adapter.log.silly(`[MQTT] Publish: ${this.getLogInfo()} - processing queued packets done`);
    }

    /**
     * Send the commands which were queued during initialization (mqtt prefix was not known yet)
     */
    processCommandQueue(): void {
        const commands = this.commandQueue;
        this.commandQueue = [];

        for (const command of commands) {
            this.publishStateValue(command.topic, command.value);
        }
    }

    /**
     * Process a single publish packet
     *
     * @param packet - MQTT publish packet
     */
    async processPublishPacket(packet: MqttPacket): Promise<void> {
        if (this.adapter.isUnloaded) {
            return;
        }

        this.adapter.log.silly(`[MQTT] Publish: ${this.getLogInfo()} - ${JSON.stringify(packet)}`);

        if (packet.payload) {
            this.adapter.log.debug(
                `[MQTT] Publish: ${this.getLogInfo()} - topic: ${packet.topic}, qos: ${packet.qos}, payload: ${packet.payload.toString()}`,
            );

            // Generation 1
            if (this.getDeviceGen() === 1) {
                if (packet.topic === 'shellies/announce') {
                    try {
                        const payloadObj = JSON.parse(packet.payload.toString());

                        // Update IP address
                        const ip = payloadObj?.ip;
                        if (ip && ip !== this.getIP()) {
                            await this.setIP(ip, 'Gen 1 shellies/announce');
                            await this.adapter.deviceStatusUpdate(this.getDeviceId(), true); // Device online
                        }

                        // Device Mode information (new)
                        const newDeviceMode = payloadObj?.mode;
                        if (newDeviceMode) {
                            await this.setDeviceMode(newDeviceMode);
                        }
                    } catch {
                        // we do not change anything
                    }
                }
            }

            // Generation 2+
            if (this.getDeviceGen() >= 2) {
                if (packet.topic === 'iobroker/rpc') {
                    try {
                        const payloadObj = JSON.parse(packet.payload.toString());

                        // Error handling for Gen 2+ devices
                        if (payloadObj?.error) {
                            this.adapter.log.error(
                                `[MQTT] Received error message for ${this.getLogInfo()} - from "${payloadObj.src}": ${JSON.stringify(payloadObj.error)}`,
                            );
                        }
                    } catch (err) {
                        this.adapter.log.debug(
                            `[MQTT] Error parsing command response: ${this.getLogInfo()} - topic: ${packet.topic}, error: ${err}`,
                        );
                    }
                }

                if (packet.topic === `${INIT_SRC}/rpc`) {
                    try {
                        const payloadObj = JSON.parse(packet.payload.toString());

                        // Update IP address
                        const ip = payloadObj?.result?.eth?.ip || payloadObj?.result?.wifi?.sta_ip;
                        if (ip && ip !== this.getIP()) {
                            await this.setIP(ip, `Gen 2+ ${INIT_SRC}/rpc`);
                            await this.adapter.deviceStatusUpdate(this.getDeviceId(), true); // Device online
                        }

                        // Device Mode information (new)
                        if (payloadObj?.result?.profile) {
                            const newDeviceMode = payloadObj?.result?.profile;
                            if (newDeviceMode) {
                                await this.setDeviceMode(newDeviceMode);
                            }
                        }

                        // Firmware version (from Shelly.GetDeviceInfo response)
                        if (payloadObj?.result?.fw_id) {
                            await this.setDeviceFirmwareVersion(String(payloadObj.result.fw_id));
                        }
                    } catch (err) {
                        this.adapter.log.debug(
                            `[MQTT] Error parsing init command response: ${this.getLogInfo()} - topic: ${packet.topic}, error: ${err}`,
                        );
                    }
                }

                // Update IP address from the status notifications (e.g. after an IP change behind a range extender)
                if (
                    packet.topic === `${this.getMqttPrefix()}/status/wifi` ||
                    packet.topic === `${this.getMqttPrefix()}/status/eth`
                ) {
                    try {
                        const payloadObj = JSON.parse(packet.payload.toString());

                        const ip = payloadObj?.sta_ip || payloadObj?.ip;
                        if (ip && ip !== this.getIP()) {
                            await this.setIP(ip, `Gen 2+ ${packet.topic}`);
                            await this.adapter.deviceStatusUpdate(this.getDeviceId(), true); // Device online
                        }
                    } catch (err) {
                        this.adapter.log.debug(
                            `[MQTT] Error parsing network status: ${this.getLogInfo()} - topic: ${packet.topic}, error: ${err}`,
                        );
                    }
                }

                // Log debug messages for Gen 2+ devices (if enabled in instance configuration)
                if (packet.topic === `${this.getMqttPrefix()}/debug/log`) {
                    if (this.adapter.config.logDebugMessages) {
                        this.adapter.log.info(
                            `[Shelly Debug Message] ${this.getLogInfo()}: ${packet.payload.toString().trim()}`,
                        );
                    }
                }
            }
        }

        if (packet.topic !== undefined && packet.payload !== undefined) {
            await this.createIoBrokerState(packet.topic, packet.payload);
        }
    }

    /**
     * Checks whether the running connect initialization has to be aborted.
     *
     * The connect handler is async, so a device can close the connection while objects are created or
     * HTTP requests are pending - this happens regularly with battery powered devices, which disconnect
     * right after publishing their values. In that case destroy() is already running (and waiting for
     * this initialization), so continuing would work on a half destroyed client.
     *
     * @param step - name of the initialization step (for logging)
     * @returns true if the caller has to stop the initialization
     */
    isInitAborted(step: string): boolean {
        if (this.destroying) {
            this.adapter.log.debug(
                `[MQTT] Initialization of ${this.getLogInfo()} aborted after "${step}" - connection was closed`,
            );

            this.initializing = false; // let destroy() continue
            return true;
        }

        return false;
    }

    async destroy(): Promise<void> {
        // Set destroying flag to prevent new packets from being queued
        this.destroying = true;

        // Wait for initialization to complete
        if (this.initializing) {
            this.adapter.log.debug(`[MQTT] Destroying ${this.getLogInfo()}, waiting for initialization to complete`);
            let cnt = 5 * 60; // wait up to 60 seconds
            while (this.initializing && cnt-- > 0) {
                await this.adapter.delay(200);
            }
        }

        // Wait for queue processing to complete
        if (this.processingQueue) {
            this.adapter.log.debug(`[MQTT] Destroying ${this.getLogInfo()}, waiting for queue processing to complete`);
            let cnt = 5 * 60; // wait up to 60 seconds
            while (this.processingQueue && cnt-- > 0) {
                await this.adapter.delay(200);
            }
        }

        // Process any remaining queued packets
        if (this.publishQueue.length > 0) {
            this.adapter.log.debug(
                `[MQTT] Destroying ${this.getLogInfo()}, processing ${this.publishQueue.length} remaining queued packets`,
            );
            await this.processPublishQueue();
        }

        // Commands queued during initialization cannot be sent anymore
        if (this.commandQueue.length > 0) {
            this.adapter.log.warn(
                `[MQTT] Connection to ${this.getLogInfo()} closed during initialization - ${this.commandQueue.length} queued commands were not sent`,
            );
        }

        // If a newer connection of the same device has already been registered, the device is still online.
        // Otherwise the (async) destroy of the old connection could set the device offline after the new
        // connection brought it online again.
        const ownId = this.getId();
        const isReplaced =
            !!ownId && MQTTClient.clientlist?.[ownId] !== undefined && MQTTClient.clientlist[ownId] !== this;
        if (isReplaced) {
            this.adapter.log.debug(
                `[MQTT] Destroying ${this.getLogInfo()} - replaced by a newer connection, keeping online state`,
            );
        }

        super.destroy(!isReplaced);
        this.adapter.log.debug(`[MQTT] Destroying`);

        for (const messageId in this.messageCache) {
            if (this.messageCache[messageId].resendid) {
                clearTimeout(this.messageCache[messageId].resendid);
            }
        }

        this.messageCache = {};
        this.messageId = 1;
        this.mqttprefix = undefined;
        this.mqttPrefixLookup = undefined;
        this.will = undefined;
        this.publishQueue = [];
        this.commandQueue = [];
        this.processingQueue = false;

        if (this.client) {
            this.client.removeAllListeners();
            this.client.destroy();
        }
    }

    /**
     * @inheritdoc
     */
    publishStateValue(topic: string, value: any): void {
        if (topic.includes('<mqttprefix>') && !this.getMqttPrefix()) {
            // The device is still initializing (prefix will be determined) - send the command afterwards
            if (this.initializing && !this.destroying) {
                this.adapter.log.debug(
                    `[MQTT] Queuing message to ${this.getLogInfo()} until initialization is done (mqtt prefix not known yet): ${topic} = ${value}`,
                );
                this.commandQueue.push({ topic, value });
                return;
            }

            this.adapter.log.warn(
                `[MQTT] Unable to publish message to ${this.getLogInfo()} - mqtt prefix was not set but is required for this message: ${topic} = ${value}`,
            );

            // The prefix is normally read once while the device connects. If that failed (e.g.
            // because the device was busy), every command would be lost until it reconnects - so
            // read it again in the background, the next command then works.
            void this.setMqttPrefixHttp();
            return;
        }

        topic = this.replacePrefixIn(topic);

        const qos = Number(this.adapter.config.qos) || 0;

        this.messageId &= 0xffffffff;
        this.messageId++;

        try {
            this.adapter.log.debug(
                `[MQTT] Send state to ${this.getLogInfo()} with QoS ${qos}: ${topic} = ${value} (${this.messageId})`,
            );
            this.client.publish({ topic: topic, payload: value, qos: qos, messageId: this.messageId });
        } catch (err) {
            this.adapter.log.debug(
                `[MQTT] Unable to publish message to ${this.getLogInfo()} - received error "${err}": ${topic} = ${value}`,
            );
        }

        if (qos > 0) {
            this.deleteResendState2ClientFromTopic(topic);
            this.resendState2Client('publish', this.messageId, {
                topic,
                payload: value,
                qos,
                dup: true,
                messageId: this.messageId,
            });
        }
    }

    resendState2Client(cmd: string, messageId: number | undefined, message?: MqttPacket): void {
        if (messageId === undefined) {
            return;
        }
        const retaintime = 5 * 1000;

        if (
            !this.messageCache[messageId] ||
            this.messageCache[messageId].cmd !== cmd ||
            this.messageCache[messageId].message !== message
        ) {
            this.messageCache[messageId] = {
                ts: Date.now(),
                cmd,
                count: 0,
                message,
            };
        }

        if (this.messageCache[messageId] && this.messageCache[messageId].count < 10) {
            clearTimeout(this.messageCache[messageId].resendid);
            this.messageCache[messageId].resendid = setTimeout(() => {
                if (this.messageCache[messageId]) {
                    const ts = Date.now();
                    this.messageCache[messageId].count++;
                    this.messageCache[messageId].ts = ts;
                    switch (this.messageCache[messageId].cmd) {
                        case 'publish': {
                            const cachedMessage = this.messageCache[messageId].message;
                            try {
                                if (cachedMessage) {
                                    this.client.publish(cachedMessage);
                                }
                            } catch (err) {
                                this.adapter.log.debug(
                                    `[MQTT] Client communication error (publish): ${this.getLogInfo()} - error: ${err}`,
                                );
                            }

                            break;
                        }
                        case 'pubrel':
                            try {
                                this.client.pubrel({ messageId });
                            } catch (err) {
                                this.adapter.log.debug(
                                    `[MQTT] Client communication error (pubrel): ${this.getLogInfo()} - error: ${err}`,
                                );
                            }

                            break;
                        case 'pubrec':
                            try {
                                this.client.pubrec({ messageId });
                            } catch (err) {
                                this.adapter.log.debug(
                                    `[MQTT] Client communication error (pubrec): ${this.getLogInfo()} - error: ${err}`,
                                );
                            }

                            break;
                        case 'pubcomp':
                            try {
                                this.client.pubcomp({ messageId });
                            } catch (err) {
                                this.adapter.log.debug(
                                    `[MQTT] Client communication error (pubcomp): ${this.getLogInfo()} - error: ${err}`,
                                );
                            }

                            break;
                        default:
                            break;
                    }

                    this.resendState2Client(cmd, messageId, message);
                }
            }, retaintime);
        }
    }

    deleteResendState2Client(messageId: number | undefined): void {
        if (messageId !== undefined && this.messageCache[messageId]) {
            clearTimeout(this.messageCache[messageId].resendid);
            delete this.messageCache[messageId];
        }
    }

    deleteResendState2ClientFromTopic(topic: string): void {
        for (const messageId in this.messageCache) {
            if (
                this.messageCache[messageId].message &&
                this.messageCache[messageId].cmd === 'publish' &&
                this.messageCache[messageId].message.topic === topic
            ) {
                clearTimeout(this.messageCache[messageId].resendid);
                delete this.messageCache[messageId];
            }
        }
    }

    getCachedMessage(messageId: number | undefined): CachedMessage | undefined {
        return messageId === undefined ? undefined : this.messageCache[messageId];
    }

    /**
     * State changes from device will be saved in the ioBroker states
     *
     * @param topic
     * @param payload - object can be ervery type of value
     */
    async createIoBrokerState(topic: string, payload: Buffer | string): Promise<void> {
        this.adapter.log.silly(
            `[MQTT] Message for ${this.getLogInfo()}: ${topic} / ${JSON.stringify(payload)} (${payload.toString()})`,
        );

        const dps = this.getAllTypePublishStates();
        for (const dp of dps) {
            const deviceId = this.getDeviceId();
            const fullStateId = `${deviceId}.${dp.state}`;
            const valueStr: string = payload.toString();
            let value: any;

            this.adapter.log.silly(
                `[MQTT] Message with value for ${this.getLogInfo()}: ${topic} -> state: ${fullStateId}, value: ${valueStr}`,
            );

            try {
                if (this.replacePrefixIn(dp.mqtt?.mqtt_publish ?? '') === topic) {
                    if (dp.mqtt?.mqtt_publish_funct) {
                        value = isAsync(dp.mqtt.mqtt_publish_funct)
                            ? await dp.mqtt.mqtt_publish_funct(valueStr, this)
                            : dp.mqtt.mqtt_publish_funct(valueStr, this);
                    } else {
                        value = valueStr;
                    }

                    if (dp.common.type === 'boolean' && value === 'false') {
                        value = false;
                    } else if (dp.common.type === 'boolean' && value === 'true') {
                        value = true;
                    } else if (dp.common.type === 'number' && value !== undefined && value !== null) {
                        value = Number(value);
                    }

                    if (Object.prototype.hasOwnProperty.call(this.device, dp.state ?? '')) {
                        if (
                            value !== undefined &&
                            (!Object.prototype.hasOwnProperty.call(this.stateValueCache, fullStateId) ||
                                this.stateValueCache[fullStateId] !== value ||
                                this.adapter.config.updateUnchangedObjects)
                        ) {
                            this.adapter.log.debug(
                                `[MQTT] State change ${this.getLogInfo()}: ${topic} -> state: ${fullStateId}, value: ${JSON.stringify(value)}`,
                            );
                            this.stateValueCache[fullStateId] = value;
                            this.objectHelper.setOrUpdateObject(
                                fullStateId,
                                {
                                    type: 'state',
                                    common: dp.common,
                                },
                                ['name'],
                                value,
                            );
                        }
                    }
                }
            } catch (err) {
                this.adapter.log.error(
                    `[MQTT] Error ${err} in function dp.mqtt.mqtt_publish_funct of state ${fullStateId} for ${this.getLogInfo()}`,
                );
            }
        }

        this.objectHelper.processObjectQueue(() => {});
    }

    async setMqttPrefixHttp(): Promise<string | undefined> {
        if (this.mqttprefix) {
            return this.mqttprefix;
        }
        if (this.mqttPrefixLookup) {
            return await this.mqttPrefixLookup;
        }

        this.mqttPrefixLookup = this.requestMqttPrefixHttp().finally(() => (this.mqttPrefixLookup = undefined));

        return await this.mqttPrefixLookup;
    }

    /** The actual HTTP request of {@link setMqttPrefixHttp}, without the "already running" handling. */
    private async requestMqttPrefixHttp(): Promise<string | undefined> {
        this.adapter.log.debug(
            `[MQTT] Started mqttprefix fallback via HTTP for client ${this.getId()} (Gen ${this.getDeviceGen()})`,
        );

        if (this.getDeviceGen() == 1) {
            try {
                const body = await this.requestWithRetry('/settings');
                if (body) {
                    const settings = JSON.parse(body);
                    this.mqttprefix = settings.mqtt.id;

                    this.adapter.log.debug(
                        `[MQTT] Requested mqttprefix for client ${this.getId()} (Gen 1): ${this.mqttprefix}`,
                    );

                    return this.mqttprefix;
                }
            } catch (err) {
                if (err && err.response && err.response.status == 401) {
                    this.adapter.log.error(
                        `[MQTT] Wrong http username or http password! Please enter the user credential from restricted login for client ${this.getId()}`,
                    );
                } else {
                    this.adapter.log.error(
                        `[MQTT] Error in function setMqttPrefixHttp (Gen 1) for client ${this.getId()}: ${err}`,
                    );
                }
            }
        } else if (this.getDeviceGen() >= 2) {
            try {
                const body = await this.requestWithRetry('/rpc/Mqtt.GetConfig');
                if (body) {
                    const settings = JSON.parse(body);
                    this.mqttprefix = settings.topic_prefix;

                    this.adapter.log.debug(
                        `[MQTT] Requested mqttprefix for client ${this.getId()} (Gen 2+): ${this.mqttprefix}`,
                    );

                    return this.mqttprefix;
                }
            } catch (err) {
                this.adapter.log.error(
                    `[MQTT] Error in function setMqttPrefixHttp (Gen 2+) for client ${this.getId()}: ${err}`,
                );
            }
        }

        return undefined;
    }

    setMqttPrefixByWill(topic: string): string | undefined {
        // Gen1: "shellies/huhu-shellybutton1-A4CF12F454A3/online"
        // Gen2: "shellyplus1pm-44179394d4d4/online"

        if (this.mqttprefix) {
            return this.mqttprefix;
        }
        if (topic) {
            const arr = topic.split('/');
            if (this.getDeviceGen() === 1) {
                if (arr[0] === 'shellies') {
                    this.mqttprefix = arr[1];
                    this.adapter.log.debug(`[MQTT] setMqttPrefixByWill (Gen 1): ${this.mqttprefix}`);
                    return this.mqttprefix;
                }
            } else if (this.getDeviceGen() >= 2) {
                this.mqttprefix = arr.slice(0, -1).join('/');
                this.adapter.log.debug(`[MQTT] setMqttPrefixByWill (Gen 2+): ${this.mqttprefix}`);
                return this.mqttprefix;
            }
        }
        return undefined;
    }

    listener(): void {
        // client connected
        this.client.on('connect', async packet => {
            this.id = packet.clientId;

            this.adapter.log.debug(`[MQTT] Client connected: ${JSON.stringify(packet)}`);
            if (this.deviceExists()) {
                this.adapter.log.silly(`[MQTT] Client id "${packet.clientId}" processing existing device`);
                if (
                    packet.username === this.adapter.config.mqttusername &&
                    packet.password?.toString() === this.adapter.config.mqttpassword
                ) {
                    // check for existing instances
                    MQTTClient._registerRun(this);

                    const ip = this.stream?.remoteAddress ?? null;

                    this.adapter.log.info(`[MQTT] Device with client id "${packet.clientId}" connected from ${ip}!`);
                    this.initializing = true;

                    // Device Mode information (init)
                    this.adapter.log.silly(`[MQTT] Client id "${packet.clientId}" init device mode`);
                    await this.initDeviceModeFromState();

                    // accept connection
                    this.adapter.log.silly(`[MQTT] Client id "${packet.clientId}" accepting connection`);
                    try {
                        this.client.connack({ returnCode: 0 });
                    } catch (err) {
                        this.adapter.log.debug(
                            `[MQTT] Client communication error (connack): "${packet.clientId}" - error: ${err}`,
                        );
                        return;
                    }

                    // Save last will
                    // Gen 1:  {"retain": false, "qos": 0, "topic" :"shellies/shellyswitch25-C45BBE798F0F/online", "payload": {"type":"Buffer","data": [102,97,108,115,101]}}
                    // Gen 2+: {"retain": false, "qos": 0, "topic": "shellypro2pm-30c6f7850a64/online", "payload": {"type":"Buffer","data":[102,97,108,115,101]}}
                    if (packet.will) {
                        this.will = packet.will;
                        this.adapter.log.debug(
                            `[MQTT] Last will for client id "${packet.clientId}" saved: ${JSON.stringify(this.will)}`,
                        );
                    }

                    // Set the mqtt prefix before the objects are created - from then on commands can be sent
                    if (this.will?.topic) {
                        this.adapter.log.silly(
                            `[MQTT] Client id "${packet.clientId}" setting mqtt prefix by last will`,
                        );
                        this.setMqttPrefixByWill(this.will.topic);
                    }

                    this.adapter.log.silly(`[MQTT] Client id "${packet.clientId}" deleting old states`);
                    await this.deleteOldStates();
                    this.adapter.log.silly(`[MQTT] Client id "${packet.clientId}" create objects`);
                    await this.createObjects();

                    if (this.isInitAborted('createObjects')) {
                        return;
                    }

                    this.adapter.log.silly(`[MQTT] Client id "${packet.clientId}" setting ip`);
                    if (ip && !String(ip).endsWith('.1')) {
                        // TODO: remove workaround to skip in Docker env
                        await this.setIP(ip, 'MQTT connect');
                    } else {
                        await this.initIPFromState();
                    }

                    this.adapter.log.silly(`[MQTT] Client id "${packet.clientId}" updating device status`);
                    await this.adapter.deviceStatusUpdate(this.getDeviceId(), true); // Device online

                    this.adapter.log.silly(`[MQTT] Client id "${packet.clientId}" setting http states`);
                    await this.httpIoBrokerState();

                    if (this.isInitAborted('httpIoBrokerState')) {
                        return;
                    }

                    // No (usable) last will - request the mqtt prefix via HTTP (requires the IP address)
                    if (!this.getMqttPrefix()) {
                        this.adapter.log.silly(`[MQTT] Client id "${packet.clientId}" setting mqtt prefix by HTTP`);
                        await this.setMqttPrefixHttp();
                    }

                    if (!this.getMqttPrefix()) {
                        this.adapter.log.error(
                            `[MQTT] Unable to get mqttprefix of client with id "${packet.clientId}"`,
                        );
                    }

                    //this.adapter.log.silly(`[MQTT] Client id "${packet.clientId}" accepting connection`);
                    try {
                        //this.client.connack({ returnCode: 0 });

                        // Device Mode information (request)
                        if (this.getDeviceGen() >= 2) {
                            this.adapter.log.silly(
                                `[MQTT] Client id "${packet.clientId}" retrieving device mode information (Gen 2+)`,
                            );
                            try {
                                // Ask for more information (like IP address)
                                this.publishStateValue(
                                    '<mqttprefix>/rpc',
                                    JSON.stringify({
                                        id: this.getNextMsgId(),
                                        src: INIT_SRC,
                                        method: 'Shelly.GetDeviceInfo',
                                        params: { ident: true },
                                    }),
                                );

                                this.publishStateValue(
                                    '<mqttprefix>/rpc',
                                    JSON.stringify({
                                        id: this.getNextMsgId(),
                                        src: INIT_SRC,
                                        method: 'Shelly.GetStatus',
                                    }),
                                );

                                this.publishStateValue('<mqttprefix>/command', 'status_update');
                            } catch (err) {
                                this.adapter.log.debug(
                                    `[MQTT] Client communication error (publish): "${packet.clientId}" - error: ${err}`,
                                );
                            }
                        }
                    } catch (err) {
                        this.adapter.log.debug(
                            `[MQTT] Client communication error (connack): "${packet.clientId}" - error: ${err}`,
                        );
                    }

                    this.adapter.log.info(`[MQTT] Device with client id "${packet.clientId}" initialized.`);
                    this.initializing = false;

                    // Send commands which were received during initialization
                    if (this.commandQueue.length > 0) {
                        this.adapter.log.debug(
                            `[MQTT] Sending ${this.commandQueue.length} queued commands to ${this.getLogInfo()}`,
                        );
                        this.processCommandQueue();
                    }

                    // Process any queued publish packets
                    if (this.publishQueue.length > 0) {
                        this.adapter.log.debug(
                            `[MQTT] Processing ${this.publishQueue.length} queued packets for ${this.getLogInfo()}`,
                        );
                        try {
                            await this.processPublishQueue();
                        } catch (err) {
                            this.adapter.log.error(
                                `[MQTT] Error processing publish queue for ${this.getLogInfo()}: ${err && err.message ? err.message : err}`,
                            );
                        }
                    }
                } else {
                    if (packet.username === undefined) {
                        this.adapter.log.error(
                            `[MQTT] Wrong MQTT authentication of client "${packet.clientId}": No username transmitted by client`,
                        );
                    } else if (packet.username !== this.adapter.config.mqttusername) {
                        this.adapter.log.error(
                            `[MQTT] Wrong MQTT authentication of client "${packet.clientId}": Incorrect username (expected "${this.adapter.config.mqttusername}")`,
                        );
                    }

                    if (packet.password === undefined) {
                        this.adapter.log.error(
                            `[MQTT] Wrong MQTT authentication of client "${packet.clientId}": No password transmitted by client`,
                        );
                    } else if (packet.password?.toString() !== this.adapter.config.mqttpassword) {
                        this.adapter.log.error(
                            `[MQTT] Wrong MQTT authentication of client "${packet.clientId}": Incorrect password`,
                        );
                    }

                    try {
                        this.client.connack({ returnCode: 4 });
                    } catch (err) {
                        this.adapter.log.debug(
                            `[MQTT] Client communication error (connack): "${packet.clientId}" - error: ${err}`,
                        );
                    }
                }
            } else {
                this.adapter.log.error(
                    `[MQTT] (Shelly?) device unknown, configuration for client with id "${packet.clientId}" ${this.getLogInfo()} does not exist! Maybe this device is not supported in this adapter version (${adapterVersion}).`,
                );
                this.adapter.log.error(
                    `[MQTT] DO NOT CHANGE THE CLIENT-ID OF YOUR SHELLY DEVICES (see adapter documentation for details)`,
                );

                try {
                    this.client.connack({ returnCode: 4 });
                } catch (err) {
                    this.adapter.log.debug(
                        `[MQTT] Client communication error (connack): "${packet.clientId}" - error: ${err}`,
                    );
                }
            }
        });

        this.client.on('close', status => {
            // Don't reset this.initializing here - destroy() has to wait for a running initialization
            this.adapter.log.info(`[MQTT] Client Close: ${this.getLogInfo()} (${String(status)})`);
            this.destroy().catch((e: unknown) => this.adapter.log.error(`[MQTT] destroy failed: ${String(e)}`));
        });

        this.client.on('error', error => {
            this.adapter.log.info(`[MQTT] Client Error: ${this.getLogInfo()} (${error})`);
            // this.destroy();
        });

        this.client.on('disconnect', () => {
            // Don't reset this.initializing here - destroy() has to wait for a running initialization
            this.adapter.log.info(`[MQTT] Client Disconnect: ${this.getLogInfo()}`);
            this.destroy().catch((e: unknown) => this.adapter.log.error(`[MQTT] destroy failed: ${String(e)}`));
        });

        this.client.on('timeout', () => {
            this.adapter.log.info(`[MQTT] Client Timeout: ${this.getLogInfo()}`);
            // this.destroy();
        });

        this.client.on('publish', async packet => {
            if (this.adapter.isUnloaded) {
                return;
            }

            // Send QoS acknowledgment immediately to avoid client timeouts
            switch (packet.qos) {
                case 1:
                    this.adapter.log.silly(`[MQTT] puback: ${this.getLogInfo()}`);
                    try {
                        this.client.puback({ messageId: packet.messageId });
                    } catch (err) {
                        this.adapter.log.debug(
                            `[MQTT] Client communication error (puback): ${this.getLogInfo()} - qos: ${packet.qos}, error: ${err}`,
                        );
                    }

                    break;
                case 2:
                    this.adapter.log.silly(`[MQTT] pubrec: ${this.getLogInfo()} - messageId: ${packet.messageId}`);
                    try {
                        this.client.pubrec({ messageId: packet.messageId });
                        this.resendState2Client('pubrec', packet.messageId);
                    } catch (err) {
                        this.adapter.log.debug(
                            `[MQTT] Client communication error (pubrec): ${this.getLogInfo()} - qos: ${packet.qos}, error: ${err}`,
                        );
                    }

                    break;
                default:
                    break;
            }

            // Don't queue packets if we're being destroyed
            if (this.destroying) {
                this.adapter.log.debug(
                    `[MQTT] Publish: ${this.getLogInfo()} - destruction in progress, ignoring packet`,
                );
                return;
            }

            // Always queue packets to ensure they are processed in order
            this.publishQueue.push(packet);

            // Start processing queue if not already processing
            if (!this.processingQueue && !this.initializing) {
                await this.processPublishQueue();
            }
        });

        // this.client pinged
        this.client.on('pingreq', () => {
            try {
                this.client.pingresp();
            } catch (err) {
                this.adapter.log.debug(
                    `[MQTT] Client communication error (pingresp): ${this.getLogInfo()} - error: ${err}`,
                );
            }
        });

        // response for QoS2
        this.client.on('pubrec', packet => {
            const qosmsg = this.getCachedMessage(packet.messageId);
            if (qosmsg && qosmsg.cmd === 'publish') {
                try {
                    this.client.pubrel({ messageId: packet.messageId });
                    this.resendState2Client('pubrel', packet.messageId);
                } catch (err) {
                    this.adapter.log.debug(
                        `[MQTT] Client communication error (pubrel): ${this.getLogInfo()} - error: ${err}`,
                    );
                }
            } else {
                this.adapter.log.info(
                    `[MQTT] Client ${this.getLogInfo()} received pubrec for unknown messageId: ${packet.messageId}`,
                );
            }
        });

        // response for QoS2
        this.client.on('pubcomp', packet => {
            const qosmsg = this.getCachedMessage(packet.messageId);
            if (qosmsg && qosmsg.cmd === 'pubrec') {
                this.deleteResendState2Client(packet.messageId);
            } else {
                this.adapter.log.info(
                    `[MQTT] Client ${this.getLogInfo()} received pubcomp for unknown messageId: ${packet.messageId}`,
                );
            }
        });

        // response for QoS2
        this.client.on('pubrel', packet => {
            const qosmsg = this.getCachedMessage(packet.messageId);
            if (qosmsg && qosmsg.cmd === 'pubrec') {
                try {
                    this.deleteResendState2Client(packet.messageId);
                    this.client.pubcomp({ messageId: packet.messageId });
                } catch (err) {
                    this.adapter.log.debug(
                        `[MQTT] Client communication error (pubcomp): ${this.getLogInfo()} - error: ${err}`,
                    );
                }
            } else {
                this.adapter.log.info(
                    `[MQTT] Client ${this.getLogInfo()} received pubrel for unknown messageId: ${packet.messageId}`,
                );
            }
        });

        // response for QoS1
        this.client.on('puback', packet => {
            // remove this message from queue
            const qosmsg = this.getCachedMessage(packet.messageId);
            if (qosmsg && qosmsg.cmd === 'publish') {
                this.deleteResendState2Client(packet.messageId);
            } else {
                this.adapter.log.info(
                    `[MQTT] Client ${this.getLogInfo()} received puback for unknown messageId: ${packet.messageId}`,
                );
            }
        });

        this.client.on('unsubscribe', packet => {
            this.adapter.log.debug(`[MQTT] Unsubscribe ${this.getLogInfo()}: ${JSON.stringify(packet)}`);

            try {
                this.client.unsuback({ messageId: packet.messageId });
            } catch (err) {
                this.adapter.log.debug(
                    `[MQTT] Client communication error (unsuback): ${this.getLogInfo()} - error: ${err}`,
                );
            }
        });

        // this.client subscribed
        this.client.on('subscribe', packet => {
            // send a suback with messageId and granted QoS level
            this.adapter.log.debug(`[MQTT] Subscribe ${this.getLogInfo()}: ${JSON.stringify(packet)}`);
            const granted: number[] = [];
            for (const subscription of packet.subscriptions ?? []) {
                granted.push(subscription.qos);
            }
            if (packet.topic) {
                this.adapter.log.debug(`[MQTT] Subscribe topic ${this.getLogInfo()}: ${packet.topic}`);
            }

            try {
                this.client.suback({ granted: granted, messageId: packet.messageId });
            } catch (err) {
                this.adapter.log.debug(
                    `[MQTT] Client communication error (suback): ${this.getLogInfo()} - error: ${err}`,
                );
            }
        });
    }
}

export class MQTTServer extends BaseServer {
    /** The TCP server accepting MQTT connections. */
    private server: net.Server = new net.Server();
    /** Active MQTT clients keyed by remote address. */
    private clients: Record<string, MQTTClient> = {};

    constructor(adapter: ShellyAdapter, objectHelper: ObjectHelper, eventEmitter: EventEmitter) {
        super(adapter, objectHelper, eventEmitter);
    }

    listen(): void {
        this.server.on('connection', stream => {
            this.adapter.log.debug(`[MQTT Server] New connection from ${stream.remoteAddress}`);

            const client = new MQTTClient(this.adapter, this.objectHelper, this.eventEmitter, stream);
            this.clients[stream.remoteAddress ?? ''] = client;

            stream.on('timeout', () => {
                this.adapter.log.debug(`[MQTT Server] Timeout for ${stream.remoteAddress} (${client.getLogInfo()})`);
                client
                    .destroy()
                    .catch((e: unknown) => this.adapter.log.error(`[MQTT Server] destroy failed: ${String(e)}`));
                stream.destroy();
            });

            stream.on('unload', () => {
                this.adapter.log.debug(`[MQTT Server] Unload for ${stream.remoteAddress} (${client.getLogInfo()})`);
                client
                    .destroy()
                    .catch((e: unknown) => this.adapter.log.error(`[MQTT Server] destroy failed: ${String(e)}`));
                stream.destroy();
            });

            stream.on('error', () => {
                this.adapter.log.debug(`[MQTT Server] Error for ${stream.remoteAddress} (${client.getLogInfo()})`);
                if (client) {
                    client
                        .destroy()
                        .catch((e: unknown) => this.adapter.log.error(`[MQTT Server] destroy failed: ${String(e)}`));
                    stream.destroy();
                }
            });

            stream.on('close', () => {
                this.adapter.log.debug(`[MQTT Server] Close for ${stream.remoteAddress} (${client.getLogInfo()})`);
                delete this.clients[stream.remoteAddress ?? ''];
            });

            stream.on('end', () => {
                this.adapter.log.debug(`[MQTT Server] End for ${stream.remoteAddress} (${client.getLogInfo()})`);
                stream.end();
            });
        });

        this.server.on('close', () => this.adapter.log.debug(`[MQTT Server] Closing listener`));

        this.server.on('error', error => this.adapter.log.debug(`[MQTT Server] Error in listener: ${error}`));

        this.server.listen(this.adapter.config.port as number, this.adapter.config.bind, undefined, () =>
            this.adapter.log.debug(
                `[MQTT Server] Started listener on ${this.adapter.config.bind}:${this.adapter.config.port}`,
            ),
        );
    }

    /**
     * Find the connected client of a device, e.g. to perform an HTTP request with the credentials
     * and the IP address known by the client.
     *
     * @param deviceId ioBroker device id, e.g. `SNSN-0013A#a1b2c3#1`
     */
    getClientByDeviceId(deviceId: string): MQTTClient | undefined {
        return Object.values(this.clients).find(client => client.getDeviceId() === deviceId);
    }

    destroy(): void {
        super.destroy();
        this.adapter.log.debug(`[MQTT Server] Destroying`);

        for (const i in this.clients) {
            this.clients[i]
                .destroy()
                .catch((e: unknown) => this.adapter.log.error(`[MQTT Server] destroy failed: ${String(e)}`));
        }
        this.server.close();
    }
}

/**
 * A single Shelly device connected to an external MQTT broker. Uses the shared connection of
 * {@link MQTTServerExternal} instead of an own TCP stream - all incoming messages are routed to
 * {@link handleMessage}, all outgoing messages are published through the server.
 */
class ExternalMQTTDeviceClient extends MQTTClient {
    private readonly server: MQTTServerExternal;
    /** Objects are created and the initial requests were sent */
    initialized = false;
    /** Last online state reported via the broker (online topic / last will) */
    brokerOnline: boolean | undefined;
    /** The HTTP polling (httpIoBrokerState) is running */
    private httpPolling = false;

    constructor(
        adapter: ShellyAdapter,
        objectHelper: ObjectHelper,
        eventEmitter: EventEmitter,
        prefix: string,
        server: MQTTServerExternal,
    ) {
        // There is no own stream - start() is overwritten and does nothing
        super(adapter, objectHelper, eventEmitter, undefined as unknown as net.Socket);

        this.server = server;
        // Like the client id on the internal broker (keeps the case of the serial, e.g. for Gen 1 devices)
        this.id = prefix.split('/').pop();
        this.mqttprefix = prefix;
    }

    start(): void {
        // The connection is handled by MQTTServerExternal
    }

    /**
     * @inheritdoc
     */
    getSerialId(): string {
        if (!this.serialId && this.id) {
            this.serialId = this.id.replace(/(.+)-(.+)/, '$2');
        }
        return this.serialId ?? '';
    }

    /**
     * @inheritdoc
     */
    getDeviceClass(): string {
        if (!this.deviceClass && this.id) {
            this.deviceClass = this.id.replace(/(.+)-(.+)/, '$1');
        }
        return this.deviceClass ?? '';
    }

    /**
     * The message ids are unique over all devices, so the answers on the shared response
     * topics (`iobroker/rpc`, `iobroker-init/rpc`) can be assigned to the device.
     */
    getNextMsgId(): number {
        return this.server.registerRpcId(this);
    }

    /**
     * Changes the topic prefix (e.g. if the device publishes with a folder which was not known yet)
     *
     * @param prefix - new topic prefix
     */
    setMqttPrefix(prefix: string): void {
        if (prefix && prefix !== this.mqttprefix) {
            this.adapter.log.info(
                `[MQTT External] Topic prefix of ${this.getLogInfo()} changed from "${this.mqttprefix}" to "${prefix}"`,
            );
            this.mqttprefix = prefix;
        }
    }

    /**
     * @inheritdoc
     */
    publishStateValue(topic: string, value: any): void {
        topic = this.replacePrefixIn(topic);

        const qos = Number(this.adapter.config.qos) || 0;

        this.adapter.log.debug(
            `[MQTT External] Send state to ${this.getLogInfo()} with QoS ${qos}: ${topic} = ${value}`,
        );
        this.server.publish(topic, value, qos as 0 | 1 | 2);
    }

    /**
     * Mirrors the initialization of a device connected to the internal broker:
     * creates the objects and requests the current state of the device.
     */
    async initialize(): Promise<void> {
        if (this.initialized || this.initializing) {
            return;
        }

        if (!this.deviceExists()) {
            this.adapter.log.error(
                `[MQTT External] (Shelly?) device unknown, configuration for topic prefix "${this.getMqttPrefix()}" does not exist! Maybe this device is not supported in this adapter version (${adapterVersion}).`,
            );
            return;
        }

        this.adapter.log.info(`[MQTT External] Initializing device with topic prefix "${this.getMqttPrefix()}"`);
        this.initializing = true;

        try {
            await this.initDeviceModeFromState();
            await this.deleteOldStates();
            await this.createObjects();

            if (this.isInitAborted('createObjects')) {
                return;
            }

            await this.initIPFromState();

            // The online state might have been received before the device objects existed
            if (this.brokerOnline !== undefined) {
                await this.adapter.deviceStatusUpdate(this.getDeviceId(), this.brokerOnline);
            }

            this.initialized = true;
            this.requestStatus(true);

            this.adapter.log.info(`[MQTT External] Device with topic prefix "${this.getMqttPrefix()}" initialized.`);
        } finally {
            this.initializing = false;
        }

        if (this.publishQueue.length > 0) {
            this.adapter.log.debug(
                `[MQTT External] Processing ${this.publishQueue.length} queued packets for ${this.getLogInfo()}`,
            );
            await this.processPublishQueue();
        }

        this.startHttpPolling();
    }

    /**
     * Starts polling the states which are only available via HTTP - as soon as the device is online
     * and its IP address is known. Devices which are not reachable via HTTP (e.g. behind a range
     * extender) do not block the initialization.
     */
    startHttpPolling(): void {
        if (!this.initialized || this.httpPolling || this.destroying || !this.isOnline() || !this.getIP()) {
            return;
        }

        this.httpPolling = true;
        this.httpIoBrokerState().catch(err =>
            this.adapter.log.debug(`[MQTT External] HTTP polling of ${this.getLogInfo()} failed: ${err}`),
        );
    }

    /**
     * Stops instead of retrying while the device is offline - restarted by {@link startHttpPolling}
     */
    async httpIoBrokerState(): Promise<void> {
        if (this.destroying || !this.isOnline() || !this.getIP()) {
            this.httpPolling = false;
            return;
        }

        await super.httpIoBrokerState();
    }

    /**
     * Asks the device to publish its current state (and the device information like the IP address)
     *
     * @param withDeviceInfo - also request the device information (firmware version, profile)
     */
    requestStatus(withDeviceInfo = false): void {
        if (this.getDeviceGen() >= 2) {
            if (withDeviceInfo) {
                this.publishStateValue(
                    '<mqttprefix>/rpc',
                    JSON.stringify({
                        id: this.getNextMsgId(),
                        src: INIT_SRC,
                        method: 'Shelly.GetDeviceInfo',
                        params: { ident: true },
                    }),
                );
            }

            this.publishStateValue(
                '<mqttprefix>/rpc',
                JSON.stringify({
                    id: this.getNextMsgId(),
                    src: INIT_SRC,
                    method: 'Shelly.GetStatus',
                }),
            );

            this.publishStateValue('<mqttprefix>/command', 'status_update');
        } else {
            this.publishStateValue('shellies/<mqttprefix>/command', 'update');
        }
    }

    /**
     * Handle an incoming message of this device (queued while the device is initializing)
     *
     * @param topic - MQTT topic
     * @param payload - payload of the message
     */
    async handleMessage(topic: string, payload: Buffer): Promise<void> {
        if (this.adapter.isUnloaded || this.destroying) {
            return;
        }

        this.publishQueue.push({ topic, payload });

        if (!this.processingQueue && !this.initializing) {
            await this.processPublishQueue();
        }
    }

    async destroy(): Promise<void> {
        this.initialized = false;
        this.httpPolling = false;
        await super.destroy();
    }
}

/**
 * Connects the adapter as a client to an existing (external) MQTT broker. Subscribes to the topics of
 * all Shelly devices and creates an {@link ExternalMQTTDeviceClient} for every discovered device.
 */
export class MQTTServerExternal extends BaseServer {
    private connection: BrokerConnection | undefined;
    /** Device clients by device key (see {@link getExternalDeviceKey}) */
    private readonly deviceClients = new Map<string, ExternalMQTTDeviceClient>();
    /** Retained messages of not yet known devices (by device key), replayed when the device is created */
    private readonly pendingRetained = new Map<string, { prefix: string; messages: Map<string, Buffer> }>();
    /** Device key of the client which sent the rpc request with this id */
    private readonly rpcIds = new Map<number, string>();
    private rpcId = 1;
    /** True while the connection to the broker is established */
    private connected = false;

    constructor(adapter: ShellyAdapter, objectHelper: ObjectHelper, eventEmitter: EventEmitter) {
        super(adapter, objectHelper, eventEmitter);
    }

    listen(): void {
        let brokerUrl: string | undefined;
        try {
            brokerUrl = getBrokerUrl(this.adapter.config.mqttClientHost, this.adapter.config.mqttClientPort);
        } catch (err) {
            this.adapter.log.error(
                `[MQTT External] Invalid broker host "${this.adapter.config.mqttClientHost}" (expected e.g. "192.168.1.10" or "mqtt://broker.local:1883"): ${err}`,
            );
            return;
        }

        if (!brokerUrl) {
            this.adapter.log.error('[MQTT External] Host of the external MQTT broker is not configured!');
            return;
        }

        const options: IClientOptions = {
            clientId: `iobroker_${this.adapter.namespace.replace('.', '_')}`,
            reconnectPeriod: 5000,
            connectTimeout: 10000,
            clean: true,
        };
        if (this.adapter.config.mqttusername) {
            options.username = this.adapter.config.mqttusername;
        }
        if (this.adapter.config.mqttpassword) {
            options.password = this.adapter.config.mqttpassword;
        }

        this.adapter.log.info(`[MQTT External] Connecting to external MQTT broker ${brokerUrl}`);
        this.connection = connectBroker(brokerUrl, options);

        this.connection.on('connect', () => {
            this.connected = true;
            this.adapter.log.info(`[MQTT External] Connected to external MQTT broker ${brokerUrl}`);
            this.onConnect().catch(err => this.adapter.log.error(`[MQTT External] Error after connect: ${err}`));
        });

        this.connection.on('message', (topic, payload, packet) => {
            this.onMessage(topic, payload, !!packet?.retain).catch(err =>
                this.adapter.log.error(`[MQTT External] Error processing message on ${topic}: ${err}`),
            );
        });

        this.connection.on('error', err => {
            this.adapter.log.error(`[MQTT External] Connection error: ${err?.message ?? err}`);
        });

        this.connection.on('reconnect', () => {
            this.adapter.log.debug('[MQTT External] Reconnecting to external MQTT broker');
        });

        this.connection.on('close', () => {
            if (this.connected) {
                this.connected = false;
                this.adapter.log.warn('[MQTT External] Connection to external MQTT broker closed');
                // Without the broker, the devices cannot be reached anymore
                for (const client of this.deviceClients.values()) {
                    client.brokerOnline = undefined;
                    void this.adapter.deviceStatusUpdate(client.getDeviceId(), false);
                }
            }
        });
    }

    /**
     * Subscribe to all Shelly topics and request the current state of the known devices
     */
    private async onConnect(): Promise<void> {
        const topics = [
            // Gen 1
            'shellies/#',
            // Gen 2+ with the default topic prefix
            '+/online',
            '+/events/#',
            '+/status/#',
            '+/debug/#',
            // Gen 2+ with a folder in front of the topic prefix (e.g. shelly/<prefix>)
            '+/+/online',
            '+/+/events/#',
            '+/+/status/#',
            '+/+/debug/#',
            // Responses of the devices
            `${CMD_SRC}/rpc`,
            `${INIT_SRC}/rpc`,
        ];

        try {
            await this.connection?.subscribeAsync(topics, { qos: 0 });
        } catch (err) {
            this.adapter.log.error(`[MQTT External] Unable to subscribe to topics: ${err}`);
        }

        // Gen 1: ask all devices to announce themselves and to publish their state
        this.publish('shellies/command', 'announce', 0);
        this.publish('shellies/command', 'update', 0);

        // Gen 2+ devices do not publish their state again when the adapter (re)connects
        await this.createKnownDevices();
        for (const client of this.deviceClients.values()) {
            if (client.initialized) {
                client.requestStatus();
            }
        }
    }

    /**
     * Creates the clients of the Gen 2+ devices which already exist in ioBroker. Gen 1 devices are
     * created when they announce themselves - they might also be connected via CoAP.
     */
    private async createKnownDevices(): Promise<void> {
        try {
            for (const deviceId of await this.adapter.getAllDeviceIds()) {
                // Device ids are formatted as '<type>#<serial>#1', e.g. 'shellyplus1pm#44179394d4d4#1'
                const [deviceType, serialId] = deviceId.split('#');
                const deviceClass = datapoints.getDeviceClassByType(deviceType);
                if (!deviceClass || !serialId || datapoints.getDeviceGen(deviceClass) < 2) {
                    continue;
                }

                const defaultPrefix = `${deviceClass}-${serialId}`;
                if (this.deviceClients.has(getExternalDeviceKey(defaultPrefix))) {
                    continue;
                }

                // The configured topic prefix might contain a folder (e.g. shelly/<prefix>)
                const prefixState = await this.adapter.getStateAsync(`${deviceId}.Mqtt.topicPrefix`);
                const storedPrefix = typeof prefixState?.val === 'string' ? prefixState.val.trim() : '';
                const prefix =
                    storedPrefix && getExternalDeviceKey(storedPrefix) === getExternalDeviceKey(defaultPrefix)
                        ? storedPrefix
                        : defaultPrefix;

                this.adapter.log.debug(
                    `[MQTT External] Creating known device ${deviceId} with topic prefix "${prefix}"`,
                );
                this.getOrCreateClient(prefix);
            }
        } catch (err) {
            this.adapter.log.error(`[MQTT External] Error creating known devices: ${err}`);
        }
    }

    /**
     * Returns the client of a device - creates (and initializes) it if it does not exist yet
     *
     * @param prefix - topic prefix of the device
     */
    private getOrCreateClient(prefix: string): ExternalMQTTDeviceClient {
        const key = getExternalDeviceKey(prefix);
        let client = this.deviceClients.get(key);
        if (client) {
            client.setMqttPrefix(prefix);
            return client;
        }

        client = new ExternalMQTTDeviceClient(this.adapter, this.objectHelper, this.eventEmitter, prefix, this);
        this.deviceClients.set(key, client);

        const newClient = client;
        newClient
            .initialize()
            .catch(err => this.adapter.log.error(`[MQTT External] Error initializing device "${prefix}": ${err}`));

        // Replay retained messages which were received before the device was known
        const pending = this.pendingRetained.get(key);
        if (pending) {
            this.pendingRetained.delete(key);
            for (const [topic, payload] of pending.messages) {
                void newClient.handleMessage(topic, payload);
            }
        }

        return newClient;
    }

    private async onMessage(topic: string, payload: Buffer, retained: boolean): Promise<void> {
        if (this.adapter.isUnloaded) {
            return;
        }

        this.adapter.log.silly(
            `[MQTT External] Message: ${topic} = ${payload.toString()}${retained ? ' (retained)' : ''}`,
        );

        // Responses on the shared topics
        if (topic === `${CMD_SRC}/rpc` || topic === `${INIT_SRC}/rpc`) {
            await this.onRpcResponse(topic, payload);
            return;
        }

        // Gen 1: announce messages of all devices on the same topic
        if (topic === 'shellies/announce') {
            await this.onGen1Announce(topic, payload);
            return;
        }

        const device = parseExternalTopic(topic);
        if (!device) {
            return;
        }

        const key = getExternalDeviceKey(device.prefix);
        const isOnlineTopic = topic === `${device.prefix}/online` || topic === `shellies/${device.prefix}/online`;
        let client = this.deviceClients.get(key);

        if (!client) {
            // Retained messages of unknown devices might belong to devices which have been removed a long
            // time ago - only create a device after a live message or a retained online = true
            if (retained && !(isOnlineTopic && isOnlinePayload(payload))) {
                const pending = this.pendingRetained.get(key) ?? { prefix: device.prefix, messages: new Map() };
                pending.messages.set(topic, Buffer.from(payload));
                this.pendingRetained.set(key, pending);
                return;
            }

            this.adapter.log.info(`[MQTT External] New Shelly device discovered with topic prefix "${device.prefix}"`);
        }

        client = this.getOrCreateClient(device.prefix);

        if (isOnlineTopic) {
            const online = isOnlinePayload(payload);
            const wasOffline = client.brokerOnline === false;
            client.brokerOnline = online;
            await this.adapter.deviceStatusUpdate(client.getDeviceId(), online);

            if (online && wasOffline && client.initialized) {
                this.adapter.log.debug(`[MQTT External] ${client.getLogInfo()} is online again - requesting status`);
                client.requestStatus(true);
            }
        } else if (!retained && client.brokerOnline !== true) {
            // A live message - the device is connected to the broker
            client.brokerOnline = true;
            await this.adapter.deviceStatusUpdate(client.getDeviceId(), true);
        }

        await client.handleMessage(topic, payload);
        client.startHttpPolling();
    }

    /**
     * Assigns a response on `iobroker/rpc` or `iobroker-init/rpc` to the device which sent the request
     *
     * @param topic - MQTT topic
     * @param payload - payload of the response
     */
    private async onRpcResponse(topic: string, payload: Buffer): Promise<void> {
        let response: { id?: number; src?: string };
        try {
            response = JSON.parse(payload.toString());
        } catch {
            this.adapter.log.debug(`[MQTT External] Ignoring invalid rpc response on ${topic}: ${payload.toString()}`);
            return;
        }

        let key: string | undefined;
        if (typeof response?.id === 'number' && this.rpcIds.has(response.id)) {
            key = this.rpcIds.get(response.id);
            this.rpcIds.delete(response.id);
        } else if (typeof response?.src === 'string') {
            key = response.src.toLowerCase();
        }

        const client = key ? this.deviceClients.get(key) : undefined;
        if (!client) {
            this.adapter.log.debug(
                `[MQTT External] Ignoring rpc response of unknown device on ${topic}: ${payload.toString()}`,
            );
            return;
        }

        await client.handleMessage(topic, payload);
        client.startHttpPolling(); // the response might contain the IP address
    }

    /**
     * Gen 1 devices publish their announcement (incl. the IP address) on a shared topic
     *
     * @param topic - MQTT topic
     * @param payload - payload of the announcement
     */
    private async onGen1Announce(topic: string, payload: Buffer): Promise<void> {
        try {
            const announce = JSON.parse(payload.toString());
            if (typeof announce?.id === 'string' && isShellyDeviceSegment(announce.id)) {
                const client = this.getOrCreateClient(announce.id);
                if (client.brokerOnline !== true) {
                    client.brokerOnline = true;
                    await this.adapter.deviceStatusUpdate(client.getDeviceId(), true);
                }
                await client.handleMessage(topic, payload);
                client.startHttpPolling();
            }
        } catch {
            this.adapter.log.debug(`[MQTT External] Ignoring invalid announcement: ${payload.toString()}`);
        }
    }

    /**
     * Returns a message id which is unique over all devices and remembers the device which uses it
     *
     * @param client - device client which sends the request
     */
    registerRpcId(client: ExternalMQTTDeviceClient): number {
        this.rpcId = (this.rpcId % 0xffff) + 1;
        this.rpcIds.delete(this.rpcId);
        this.rpcIds.set(this.rpcId, getExternalDeviceKey(client.getId() ?? ''));

        // Keep only the latest ids - unanswered requests must not fill the memory
        if (this.rpcIds.size > 1000) {
            const oldest = this.rpcIds.keys().next().value;
            if (oldest !== undefined) {
                this.rpcIds.delete(oldest);
            }
        }

        return this.rpcId;
    }

    /**
     * Publish a message through the external broker
     *
     * @param topic - MQTT topic
     * @param value - payload
     * @param qos - QoS level
     */
    publish(topic: string, value: string | Buffer, qos: 0 | 1 | 2): void {
        if (!this.connection?.connected) {
            this.adapter.log.warn(`[MQTT External] Unable to publish ${topic} - not connected to the external broker`);
            return;
        }

        this.connection.publish(topic, value, { qos }, err => {
            if (err) {
                this.adapter.log.debug(`[MQTT External] Unable to publish ${topic}: ${err}`);
            }
        });
    }

    /**
     * Find the client of a device, e.g. to perform an HTTP request with the IP address known by the client.
     *
     * @param deviceId ioBroker device id, e.g. `shellyplus1pm#44179394d4d4#1`
     */
    getClientByDeviceId(deviceId: string): MQTTClient | undefined {
        return [...this.deviceClients.values()].find(client => client.getDeviceId() === deviceId);
    }

    destroy(): void {
        super.destroy();
        this.adapter.log.debug('[MQTT External] Destroying');

        for (const client of this.deviceClients.values()) {
            client
                .destroy()
                .catch((e: unknown) => this.adapter.log.error(`[MQTT External] destroy failed: ${String(e)}`));
        }
        this.deviceClients.clear();
        this.pendingRetained.clear();
        this.rpcIds.clear();

        if (this.connection) {
            this.connection.removeAllListeners();
            this.connection.end(true);
            this.connection = undefined;
        }
    }
}
