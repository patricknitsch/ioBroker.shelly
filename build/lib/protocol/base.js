"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseServer = exports.BaseClient = void 0;
const datapoints = __importStar(require("../datapoints"));
const ble_gateway_script_1 = require("../ble-gateway-script");
const axios_1 = __importDefault(require("axios"));
const adapter_core_1 = require("@iobroker/adapter-core");
const crypto = __importStar(require("node:crypto"));
/**
 * Whether `funct` is an `async` function (so the caller knows to `await` its result).
 *
 * @param funct
 */
function isAsync(funct) {
    if (typeof funct === 'function' && funct.constructor) {
        return funct.constructor.name === 'AsyncFunction';
    }
    return undefined;
}
/**
 * Base class shared by the MQTT and CoAP protocol clients. Holds the per-device state and
 * implements the generic state<->device mapping: it walks the device definition, wires up the
 * `*_publish_funct`/`*_cmd_funct` callbacks, polls HTTP, and creates/deletes ioBroker objects.
 * Abstract pieces (serial id, device class/type, value publishing) are implemented by subclasses.
 */
class BaseClient {
    type;
    config;
    adapter;
    /**
     * The shared object/state queue helper (build/lib/objectHelper). Heterogeneous partial-object
     * factory whose `setOrUpdateObject(id, { type?, common, native? }, …)` fills in defaults, so it is
     * deliberately left untyped here rather than fighting its loose contract.
     */
    objectHelper;
    eventEmitter;
    httpIoBrokerStateTimeout;
    msgId;
    /** Last value written per full state id, used to suppress duplicate updates. */
    stateValueCache;
    /** The resolved device definition for the connected device. */
    device;
    /** Map of HTTP poll url -> list of state ids served by that url. */
    http;
    deviceId; // e.g. SHBDUO-1#8CAAB5616291#2 (used in object IDs)
    ip; // e.g. 192.168.1.2
    id; // e.g. ShellyBulbDuo-8CAAB5616291
    deviceType; // e.g. SHBDUO-1 or SHRGBW2
    deviceMode; // e.g. color or white / relay or roller
    deviceFirmwareVersion; // parsed semver, e.g. 1.7.1
    deviceClass; // e.g. ShellyBulbDuo or shellyrgbw2
    serialId; // e.g. 8CAAB5616291
    deviceGen; // 1 or 2
    nonceCount;
    lastNonce;
    httpTimeout;
    constructor(type, adapter, objectHelper, eventEmitter) {
        this.type = type; // mqtt or coap
        this.adapter = adapter;
        this.config = adapter.config;
        this.objectHelper = objectHelper;
        this.eventEmitter = eventEmitter;
        this.httpIoBrokerStateTimeout = null;
        this.msgId = 1;
        this.stateValueCache = {};
        this.device = {};
        this.http = {};
        this.nonceCount = 0;
        this.lastNonce = undefined;
        this.httpTimeout = 8 * 1000;
        // Handle firmware updates
        this.eventEmitter.on('onFirmwareUpdate', async () => await this.firmwareUpdate());
        // Handle script download
        this.eventEmitter.on('onScriptDownload', async () => await this.downloadAllScripts());
    }
    /**
     * Perform an HTTP request to the device. Without `postData` a GET request is sent, otherwise the
     * data is sent as JSON body of a POST request - which is required for RPC calls with a payload
     * too large for the URL (e.g. `Script.PutCode`).
     *
     * @param url path of the request, e.g. `/rpc/Script.List`
     * @param postData body of a POST request. If omitted, a GET request is performed.
     */
    async requestAsync(url, postData) {
        const method = postData === undefined ? 'get' : 'post';
        let httpDebugDir = '';
        if (this.adapter.config.saveHttpResponses) {
            httpDebugDir = `httpDebug/${this.getDirectoryName()}`;
            await this.adapter.mkdirAsync(this.adapter.namespace, 'httpDebug');
            await this.adapter.mkdirAsync(this.adapter.namespace, httpDebugDir);
        }
        return new Promise((resolve, reject) => {
            if (!this.getIP()) {
                reject(new Error(`[requestAsync] Unable to perform HTTP request "${url}" - IP address is unknown of ${this.getLogInfo()}`));
                return;
            }
            const httpDebugFilePath = `${httpDebugDir}/${url.replace(/[^a-zA-Z0-9-_.]/g, '_')}.json`;
            let axiosRequestObj = {
                method,
                responseType: 'text',
                transformResponse: (res) => {
                    return res; // Avoid automatic json parse
                },
                baseURL: `http://${this.getIP()}`,
                timeout: this.httpTimeout,
                url,
                data: postData,
            };
            if (this.getDeviceGen() === 1) {
                if (this.adapter.config.httpusername && this.adapter.config.httppassword) {
                    // Add basic auth if configured
                    this.adapter.log.silly(`[requestAsync] HTTP request to gen 1 device with basic auth: "${axiosRequestObj.baseURL}${url}"`);
                    axiosRequestObj = {
                        ...axiosRequestObj,
                        auth: {
                            username: this.adapter.config.httpusername,
                            password: this.adapter.config.httppassword,
                        },
                    };
                }
                else {
                    this.adapter.log.silly(`[requestAsync] HTTP request to gen 1 device: "${axiosRequestObj.baseURL}${url}"`);
                }
                (0, axios_1.default)(axiosRequestObj)
                    .then(response => {
                    this.adapter.log.silly(`[requestAsync] HTTP response of gen 1 device: "${axiosRequestObj.baseURL}${url}" -> "${response.data}"`);
                    if (this.adapter.config.saveHttpResponses) {
                        this.adapter.log.silly(`[requestAsync] Saving HTTP debug file to ${httpDebugFilePath}`);
                        this.adapter
                            .writeFileAsync(this.adapter.namespace, httpDebugFilePath, response.data)
                            .catch((e) => this.adapter.log.debug(`[requestAsync] Could not save HTTP debug file: ${String(e)}`));
                    }
                    resolve(response.data);
                })
                    .catch(reject);
            }
            else if (this.getDeviceGen() >= 2) {
                this.adapter.log.silly(`[requestAsync] HTTP request to Gen 2+ device (with digest auth): "${axiosRequestObj.baseURL}${url}"`);
                const saveAndResolve = (data) => {
                    if (this.adapter.config.saveHttpResponses) {
                        this.adapter.log.silly(`[requestAsync] Saving HTTP debug file to ${httpDebugFilePath}`);
                        let fileContent = data;
                        try {
                            fileContent = JSON.stringify(JSON.parse(data), null, 2);
                        }
                        catch {
                            // keep raw response if it is not valid JSON
                        }
                        this.adapter
                            .writeFileAsync(this.adapter.namespace, httpDebugFilePath, fileContent)
                            .catch((e) => this.adapter.log.debug(`[requestAsync] Could not save HTTP debug file: ${String(e)}`));
                    }
                    resolve(data);
                };
                // Send the request; on a 401 digest challenge (re)compute the Authorization header and
                // retry. Firmware 2.x manages nonces per RFC 7616 and may answer an authenticated request
                // with "401 stale=true" once a nonce expires - in that case retry once with the fresh nonce
                // instead of treating it as a credential error.
                const attempt = (config, staleRetriesLeft) => {
                    (0, axios_1.default)(config)
                        .then(response => {
                        this.adapter.log.silly(`[requestAsync] HTTP response of Gen 2+ device: "${axiosRequestObj.baseURL}${url}" -> "${response.data}"`);
                        saveAndResolve(response.data);
                    })
                        .catch(err => {
                        const wwwAuthenticate = err?.response?.status === 401 && err.response?.headers?.['www-authenticate'];
                        if (!wwwAuthenticate) {
                            reject(err instanceof Error ? err : new Error(String(err)));
                            return;
                        }
                        const wasAuthenticated = !!config.headers
                            ?.Authorization;
                        const authDetails = this.parseDigestChallenge(wwwAuthenticate);
                        const isStale = String(authDetails.stale).toLowerCase() === 'true';
                        // Already authenticated and the device still rejects with a non-stale nonce
                        // -> genuine credential error. Also stop once the stale retries are exhausted.
                        if (wasAuthenticated && (!isStale || staleRetriesLeft <= 0)) {
                            reject(err instanceof Error ? err : new Error(String(err)));
                            return;
                        }
                        const authorization = this.buildDigestAuthHeader(authDetails, method, url);
                        attempt({ ...axiosRequestObj, headers: { Authorization: authorization } }, wasAuthenticated ? staleRetriesLeft - 1 : staleRetriesLeft);
                    });
                };
                attempt(axiosRequestObj, 1);
            }
        });
    }
    /**
     * Parse a Gen2+ "WWW-Authenticate: Digest ..." challenge header into a key/value map.
     * The value is split on the FIRST "=" only so Base64 nonces (which end in "=" padding per
     * RFC 7616) are kept intact.
     *
     * @param header the raw www-authenticate header value
     */
    parseDigestChallenge(header) {
        header = header.replace(/^\s*Digest\s+/i, '');
        // Split on commas that are NOT inside quoted strings (e.g. qop="auth,auth-int")
        const parts = [];
        let buf = '';
        let inQuotes = false;
        for (let i = 0; i < header.length; i++) {
            const ch = header[i];
            if (ch === '"' && header[i - 1] !== '\\') {
                inQuotes = !inQuotes;
            }
            if (ch === ',' && !inQuotes) {
                parts.push(buf);
                buf = '';
                continue;
            }
            buf += ch;
        }
        if (buf) {
            parts.push(buf);
        }
        return parts.reduce((acc, pair) => {
            const eq = pair.indexOf('=');
            if (eq === -1) {
                return acc;
            }
            const key = pair.slice(0, eq).trim();
            const value = pair
                .slice(eq + 1)
                .trim()
                .replace(/^"|"$/g, '');
            acc[key] = value;
            return acc;
        }, {});
    }
    /**
     * Build a Gen2+ digest Authorization header for the given challenge.
     *
     * @param authDetails parsed challenge (realm/nonce/...)
     * @param method the HTTP method of the request
     * @param url the request URI
     */
    buildDigestAuthHeader(authDetails, method, url) {
        const username = 'admin';
        const password = this.adapter.config.httppassword;
        if (authDetails.nonce !== this.lastNonce) {
            this.lastNonce = authDetails.nonce;
            this.nonceCount = 0;
        }
        this.nonceCount++;
        const nonceCount = this.nonceCount.toString(16).padStart(8, '0');
        const cnonce = crypto.randomBytes(24).toString('hex');
        const realm = authDetails.realm;
        const nonce = authDetails.nonce;
        const sha256 = (str) => crypto.createHash('sha256').update(str).digest('hex');
        const HA1 = sha256(`${username}:${realm}:${password}`);
        const HA2 = sha256(`${method.toUpperCase()}:${url}`);
        const response = sha256(`${HA1}:${nonce}:${nonceCount}:${cnonce}:auth:${HA2}`);
        return `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${url}", cnonce="${cnonce}", nc=${nonceCount}, qop=auth, response="${response}", algorithm=SHA-256`;
    }
    getNextMsgId() {
        return this.msgId++ & 0xffff;
    }
    /**
     * Returns the polltime for a device (in seconds)
     */
    getPollTime() {
        if (this.adapter.config.polltime === 0) {
            return 0;
        }
        const configPollTime = parseInt(this.adapter.config.polltime, 10) || 0;
        const deviceClass = this.getDeviceClass();
        let pollTime;
        if (deviceClass) {
            pollTime = datapoints.getPollTime(deviceClass) ?? configPollTime;
            if (configPollTime > pollTime) {
                pollTime = configPollTime;
            }
            return pollTime;
        }
        return configPollTime; // Default = instance config
    }
    /**
     * ID of the Shelly device
     * Example: shellyplug-s-12345
     *
     * @returns
     */
    getId() {
        return this.id;
    }
    /**
     * Serial id of the Shelly device
     * Example: shellyplug-s-12345
     */
    getSerialId() {
        throw new Error('You have to implement the method getSerialId!');
    }
    /**
     * @returns
     */
    getDeviceClass() {
        throw new Error('You have to implement the method getDeviceClass!');
    }
    /**
     * @returns
     */
    getDeviceType() {
        throw new Error('You have to implement the method getDeviceType!');
    }
    /** MQTT topic prefix for this device; implemented by the MQTT client subclass. */
    getMqttPrefix() {
        throw new Error('You have to implement the method getMqttPrefix!');
    }
    publishStateValue(cmd, value) {
        throw new Error(`You have to implement the method publishStateValue! ${cmd} ${String(value)}`);
    }
    getDirectoryName() {
        // The id is cleared by destroy(), so it can be undefined while an async operation is still running
        return (this.getId() ?? 'unknown').replace(/[^a-zA-Z0-9-_.]/g, '_');
    }
    getDeviceMode() {
        return this.deviceMode;
    }
    async setDeviceMode(newDeviceMode) {
        if (newDeviceMode !== this.deviceMode) {
            if (this.deviceMode) {
                this.adapter.log.info(`Device mode of ${this.getLogInfo()} changed from "${this.deviceMode}" to "${newDeviceMode}" - recreating states NOW!`);
            }
            this.deviceMode = newDeviceMode;
            await this.adapter.setState(`${this.getDeviceId()}.Sys.deviceMode`, { val: newDeviceMode, ack: true });
            await this.deleteOldStates();
            await this.createObjects();
        }
    }
    async initDeviceModeFromState() {
        if (!this.deviceMode) {
            const deviceModeState = await this.adapter.getStateAsync(`${this.getDeviceId()}.Sys.deviceMode`);
            if (deviceModeState && deviceModeState?.val) {
                this.deviceMode = deviceModeState.val;
                this.adapter.log.debug(`Configured device mode of ${this.getLogInfo()} by state "${this.getDeviceId()}.Sys.deviceMode" (fallback): ${this.deviceMode}`);
            }
        }
    }
    /**
     * Parse a semver string from a Shelly firmware version string.
     * Input example: "20250924-062655/1.7.1-gd336f31" or "1.7.1-gd336f31"
     * Returns the semver string (e.g. "1.7.1") or undefined if not parseable.
     *
     * @param rawVersion - raw firmware version string
     */
    static parseFirmwareSemver(rawVersion) {
        // Extract the part after the last '/' if present
        const afterSlash = rawVersion.includes('/') ? (rawVersion.split('/').pop() ?? rawVersion) : rawVersion;
        const match = /^(\d+\.\d+\.\d+)/.exec(afterSlash);
        return match ? match[1] : undefined;
    }
    /**
     * Compare two semver strings. Returns true if a >= b.
     *
     * @param a - semver string
     * @param b - semver string
     */
    static isSemverAtLeast(a, b) {
        const parse = (v) => v.split('.').map(Number);
        const [aMaj, aMin, aPat] = parse(a);
        const [bMaj, bMin, bPat] = parse(b);
        if (aMaj !== bMaj) {
            return aMaj > bMaj;
        }
        if (aMin !== bMin) {
            return aMin > bMin;
        }
        return aPat >= bPat;
    }
    getDeviceFirmwareVersion() {
        return this.deviceFirmwareVersion;
    }
    async setDeviceFirmwareVersion(rawVersionString) {
        const parsed = BaseClient.parseFirmwareSemver(rawVersionString);
        this.adapter.log.debug(`[setDeviceFirmwareVersion] ${this.getLogInfo()} raw: "${rawVersionString}", parsed: ${parsed ?? '<unknown>'}`);
        if (!parsed) {
            // Cannot determine version — treat as too old, no PLUGS_UI
            return;
        }
        if (parsed !== this.deviceFirmwareVersion) {
            const wasAboveThreshold = this.deviceFirmwareVersion !== undefined &&
                BaseClient.isSemverAtLeast(this.deviceFirmwareVersion, '2.0.0');
            const isAboveThreshold = BaseClient.isSemverAtLeast(parsed, '2.0.0');
            this.deviceFirmwareVersion = parsed;
            // Re-create objects only if the PLUGS_UI eligibility changed
            if (wasAboveThreshold !== isAboveThreshold) {
                this.adapter.log.info(`[setDeviceFirmwareVersion] ${this.getLogInfo()} firmware version changed to ${parsed} - recreating states`);
                await this.deleteOldStates();
                await this.createObjects();
            }
        }
    }
    /**
     * IP of Shelly device
     * Example 192.168.1.2
     *
     * @returns
     */
    getIP() {
        return this.ip;
    }
    async setIP(ip, source) {
        if (!ip) {
            return;
        }
        this.ip = ip;
        this.adapter.log.debug(`[setIP] New IP for device ${this.getDeviceId()}: ${ip} (source: ${source})`);
        const hostNameObj = await this.adapter.getObjectAsync(`${this.getDeviceId()}.hostname`);
        if (hostNameObj) {
            await this.adapter.setState(`${this.getDeviceId()}.hostname`, { val: ip, ack: true, c: source });
        }
    }
    async initIPFromState() {
        if (!this.ip) {
            const ipState = await this.adapter.getStateAsync(`${this.getDeviceId()}.hostname`);
            if (ipState && ipState?.val) {
                this.ip = ipState.val;
                this.adapter.log.debug(`Configured IP of ${this.getLogInfo()} by state "${this.getDeviceId()}.hostname" (fallback): ${this.ip}`);
            }
        }
    }
    /**
     * Returns a string for logging with the IP address, name of device and type
     *
     * @returns
     */
    getLogInfo() {
        return `${this.getIP() ?? ''} (${this.getDeviceClass()} / ${this.getId()} / ${this.getDeviceId()})`.trim();
    }
    /**
     * Change Device ID from #2 to #1 (firmware version >= 1.8)
     * Example SHRGBW2#1234#2 will change to SHRGBW2#1234#1
     *
     * @param deviceId
     */
    getOldDeviceInfo(deviceId) {
        if (deviceId && deviceId.substr(-2) === '#2') {
            return `${deviceId.substr(0, deviceId.length - 2)}#1`;
        }
        return deviceId;
    }
    /**
     * Get the Shelly Device type with the serial number of the device back.
     * Device type could be for example SHRGBW2. The serial number of the
     * device like 1234 will be added
     * Example: SHRGBW2#1234#1
     */
    getDeviceId() {
        return this.deviceId ? this.getOldDeviceInfo(this.deviceId) : undefined;
    }
    /**
     * Shelly device configuration exists
     * If missing: Add the configuration in the ./lib/devices directory (see docs)
     */
    deviceExists() {
        return !!datapoints.getDeviceTypeByClass(this.getDeviceClass());
    }
    /**
     * Checks if Shelly supports rpc api
     * you have to add a configuration in the ./lib/devices directory
     */
    getDeviceGen() {
        if (this.deviceGen === undefined) {
            const deviceClass = this.getDeviceClass();
            this.deviceGen = datapoints.getDeviceGen(deviceClass);
        }
        return this.deviceGen ?? 1;
    }
    /**
     * Returns the url to Shelly knowledge base
     */
    getKnowledgeBaseUrl() {
        return datapoints.getKnowledgeBaseUrlByClass(this.getDeviceClass());
    }
    isOnline() {
        return this.adapter.isOnline(this.getDeviceId());
    }
    getAllTypePublishStates() {
        const states = [];
        for (const i in this.device) {
            const state = this.device[i];
            if (this.type === 'mqtt') {
                if (state?.mqtt?.mqtt_publish) {
                    states.push(state);
                }
            }
            else if (this.type === 'coap') {
                if (state?.coap?.coap_publish) {
                    states.push(state);
                }
            }
        }
        return states;
    }
    /**
     * Missing data will be pulled by HTTP
     */
    async httpIoBrokerState() {
        if (!this.isOnline() || !this.getIP()) {
            this.adapter.log.silly(`[httpIoBrokerState] Device ${this.getLogInfo()} is offline (or IP is unknown) - waiting`);
            this.httpIoBrokerStateTimeout = setTimeout(async () => await this.httpIoBrokerState(), this.adapter.config.polltime * 1000);
            return;
        }
        this.adapter.log.silly(`[httpIoBrokerState] Running for ${this.getLogInfo()}: ${JSON.stringify(this.http)}`);
        let pollTime = this.getPollTime();
        for (const httpUrl in this.http) {
            const dps = this.http[httpUrl];
            try {
                const body = await this.requestAsync(httpUrl);
                for (const id of dps) {
                    const dp = this.device[id];
                    if (dp?.state) {
                        const fullStateId = `${this.getDeviceId()}.${dp.state}`;
                        let value = body;
                        try {
                            this.adapter.log.silly(`[httpIoBrokerState] Updating state ${fullStateId} for ${this.getLogInfo()}: ${body}`);
                            const block = dp[this.type];
                            if (block?.http_publish_funct) {
                                value = isAsync(block.http_publish_funct)
                                    ? await block.http_publish_funct(value, this)
                                    : block.http_publish_funct(value, this);
                            }
                            if (dp.common.type === 'boolean' && value === 'false') {
                                value = false;
                            }
                            if (dp.common.type === 'boolean' && value === 'true') {
                                value = true;
                            }
                            if (dp.common.type === 'number' && value !== undefined && value !== null) {
                                value = Number(value);
                            }
                            if (Object.prototype.hasOwnProperty.call(this.device, dp.state)) {
                                if (value !== undefined &&
                                    (!Object.prototype.hasOwnProperty.call(this.stateValueCache, fullStateId) ||
                                        this.stateValueCache[fullStateId] !== value ||
                                        this.adapter.config.updateUnchangedObjects)) {
                                    this.adapter.log.debug(`[httpIoBrokerState] State change ${this.getLogInfo()}: state: ${fullStateId}, value: ${JSON.stringify(value)}`);
                                    this.stateValueCache[fullStateId] = value;
                                    this.objectHelper.setOrUpdateObject(fullStateId, {
                                        type: 'state',
                                        common: dp.common,
                                    }, ['name'], value);
                                }
                            }
                        }
                        catch (err) {
                            if (err.name?.startsWith('TypeError')) {
                                this.adapter.log.debug(`[httpIoBrokerState] Could not find property for state ${fullStateId} for ${this.getLogInfo()} "${httpUrl}": ${err}`);
                            }
                            else {
                                this.adapter.log.error(`[httpIoBrokerState] Error for state ${fullStateId} for ${this.getLogInfo()} "${httpUrl}": ${err} - value: "${value}"`);
                            }
                        }
                    }
                }
                this.objectHelper.processObjectQueue(() => { });
            }
            catch (err) {
                // Increase polltime on http error
                if (pollTime > 0 && pollTime < 60) {
                    pollTime = 60;
                }
                if (err?.response?.status == 401) {
                    this.adapter.log.error(`[httpIoBrokerState] HTTP request error for ${this.getLogInfo()} "${httpUrl}": Wrong http username or http password! Please enter user credentials for restricted login.`);
                }
                else if (err?.response?.status == 404) {
                    this.adapter.log.debug(`[httpIoBrokerState] HTTP request error for ${this.getLogInfo()} "${httpUrl}": 404 Not Found - this can happen if the current device configuration doesn't support this feature.`);
                }
                else {
                    this.adapter.log.debug(`[httpIoBrokerState] HTTP request error for ${this.getLogInfo()} "${httpUrl}": ${err}`);
                }
            }
        }
        if (this.http && Object.keys(this.http).length > 0 && pollTime > 0) {
            this.httpIoBrokerStateTimeout = setTimeout(async () => await this.httpIoBrokerState(), pollTime * 1000);
        }
    }
    /**
     * Create objects in shelly.X. for a new Shelly device
     * The Shelly device must exist in the ./lib/devices/gen<X>/ directory
     */
    async createObjects() {
        return new Promise((resolve, reject) => {
            try {
                this.adapter.log.debug(`[createObjects] Starting object creation of ${this.getLogInfo()} for mode: ${this.getDeviceMode() ?? '<not set>'}`);
                const deviceStatesHttp = {};
                const deviceStates = datapoints.getDeviceByClass(this.getDeviceClass(), this.type, this.getDeviceMode(), this.getDeviceFirmwareVersion());
                if (deviceStates) {
                    for (const stateId in deviceStates) {
                        const state = deviceStates[stateId];
                        state.state = stateId;
                        let hasTypeCmd = false;
                        let hasTypePublishCmd = false;
                        if (this.type === 'coap') {
                            hasTypeCmd = !!state?.coap?.coap_cmd;
                            hasTypePublishCmd = !!state?.coap?.coap_publish;
                        }
                        if (this.type === 'mqtt') {
                            hasTypeCmd = !!state.mqtt?.mqtt_cmd;
                            hasTypePublishCmd = !!state?.mqtt?.mqtt_publish;
                        }
                        const deviceId = this.getDeviceId();
                        if (!deviceId) {
                            this.adapter.log.warn('No ID');
                            continue;
                        }
                        const iconName = datapoints.getDeviceIcon(this.getDeviceClass());
                        this.objectHelper.setOrUpdateObject(deviceId, {
                            type: 'device',
                            common: {
                                name: `Device ${deviceId}`,
                                desc: `Gen ${this.getDeviceGen()}`,
                                icon: `icons/${iconName}.png`,
                                statusStates: {
                                    onlineId: `${this.adapter.namespace}.${deviceId}.online`,
                                },
                            },
                            native: {},
                        }, ['name']);
                        const channel = stateId.split('.').slice(0, 1).join();
                        if (channel !== stateId) {
                            const channelId = `${deviceId}.${channel}`;
                            this.objectHelper.setOrUpdateObject(channelId, {
                                type: 'channel',
                                common: {
                                    name: `Channel ${channel}`,
                                },
                            }, ['name']);
                        }
                        const fullStateId = `${deviceId}.${stateId}`;
                        let controlFunction;
                        // HTTP
                        const httpBlock = state[this.type];
                        if (httpBlock?.http_cmd && !hasTypeCmd) {
                            this.adapter.log.silly(`[http controlFunction] Found ${this.type}.http_cmd of state ${fullStateId} for ${this.getLogInfo()}`);
                            controlFunction = async (value) => {
                                if (this.isOnline()) {
                                    let publishValue = value;
                                    this.adapter.log.silly(`[http controlFunction] Entered ${this.type}.http_cmd of state ${fullStateId} for ${this.getLogInfo()} with value: ${value}`);
                                    // Modify value with http_cmd_funct (if exists)
                                    if (httpBlock?.http_cmd_funct) {
                                        try {
                                            publishValue = isAsync(httpBlock.http_cmd_funct)
                                                ? await httpBlock.http_cmd_funct(value, this)
                                                : httpBlock.http_cmd_funct(value, this);
                                            this.adapter.log.debug(`[http controlFunction] Executing state.${this.type}.http_cmd_funct of state ${fullStateId} for ${this.getLogInfo()} with value: ${value} -> ${JSON.stringify(publishValue)}`);
                                        }
                                        catch (err) {
                                            this.adapter.log.error(`[http controlFunction] Error in function state.${this.type}.http_cmd_funct of state ${fullStateId} for ${this.getLogInfo()}: ${err}`);
                                        }
                                    }
                                    let body;
                                    try {
                                        if (this.getDeviceGen() === 1) {
                                            // Append value parameters
                                            const url = new URL(`http://${this.getIP()}${httpBlock?.http_cmd}`);
                                            if (typeof publishValue === 'object') {
                                                Object.keys(publishValue).forEach(key => url.searchParams.append(key, publishValue[key]));
                                            }
                                            this.adapter.log.debug(`[http controlFunction] Executing gen 1 state.${this.type}.http_cmd of state ${fullStateId} for ${this.getLogInfo()} from url: ${url.href}`);
                                            body = await this.requestAsync(url.pathname + url.search);
                                            if (body === 'Bad default state and button type combination!') {
                                                this.adapter.log.error(`[http controlFunction] Error in function state.${this.type}.http_cmd of state ${fullStateId} for ${this.getLogInfo()}: ${body}`);
                                            }
                                        }
                                        else if (this.getDeviceGen() >= 2) {
                                            // Not supported
                                            this.adapter.log.error(`[http controlFunction] Error in function state.${this.type}.http_cmd of state ${fullStateId} for ${this.getLogInfo()}: Not supported for Gen 2+ devices (${this.getDeviceGen()})`);
                                        }
                                    }
                                    catch (err) {
                                        if (err?.response?.status == 401) {
                                            this.adapter.log.error(`[http controlFunction] Error in function state.${this.type}.http_cmd of state ${fullStateId} for ${this.getLogInfo()}: Wrong http username or http password! Please enter user credentials for restricted login.`);
                                        }
                                        else {
                                            this.adapter.log.error(`[http controlFunction] Error in function state.${this.type}.http_cmd of state ${fullStateId} for ${this.getLogInfo()}: ${err}`);
                                        }
                                    }
                                    if (value == this.stateValueCache?.[fullStateId]) {
                                        this.adapter.log.debug(`[http controlFunction] Ack state.${this.type}.http_cmd of state ${fullStateId} for ${this.getLogInfo()} in adapter: Value not changed`);
                                        await this.adapter.setState(fullStateId, {
                                            val: value,
                                            ack: true,
                                            c: `UNCHANGED_AUTO_ACK`,
                                        });
                                    }
                                    else {
                                        // Remove from cache, since value changed
                                        delete this.stateValueCache[fullStateId];
                                    }
                                }
                                else {
                                    this.adapter.log.warn(`[http controlFunction] Unable to perform request - device ${this.getLogInfo()} is offline`);
                                }
                            };
                        }
                        // MQTT
                        if (this.type === 'mqtt' && httpBlock && hasTypeCmd) {
                            this.adapter.log.silly(`[mqtt controlFunction] Found ${this.type}.mqtt_cmd of state ${fullStateId} for ${this.getLogInfo()}`);
                            controlFunction = async (value) => {
                                if (this.isOnline()) {
                                    let publishValue = value;
                                    this.adapter.log.silly(`[mqtt controlFunction] Entered ${this.type}.mqtt_cmd of state ${fullStateId} for ${this.getLogInfo()} with value: ${value}`);
                                    // Modify value with mqtt_cmd_funct (if exists)
                                    if (httpBlock?.mqtt_cmd_funct) {
                                        try {
                                            publishValue = isAsync(httpBlock.mqtt_cmd_funct)
                                                ? await httpBlock.mqtt_cmd_funct(value, this)
                                                : httpBlock.mqtt_cmd_funct(value, this);
                                            this.adapter.log.debug(`[mqtt controlFunction] Executing state.${this.type}.mqtt_cmd_funct of state ${fullStateId} for ${this.getLogInfo()} with value: ${value} -> ${publishValue}`);
                                        }
                                        catch (err) {
                                            this.adapter.log.error(`[mqtt controlFunction] Error in function state.${this.type}.mqtt_cmd_funct of state ${fullStateId} for ${this.getLogInfo()}: ${err}`);
                                        }
                                    }
                                    if (this.publishStateValue !== undefined) {
                                        this.publishStateValue(httpBlock?.mqtt_cmd ?? '', publishValue);
                                    }
                                    if (value == this.stateValueCache?.[fullStateId]) {
                                        this.adapter.log.debug(`[mqtt controlFunction] Ack state.${this.type}.mqtt_cmd of state ${fullStateId} for ${this.getLogInfo()} in adapter: Value not changed`);
                                        await this.adapter.setState(fullStateId, {
                                            val: value,
                                            ack: true,
                                            c: `UNCHANGED_AUTO_ACK`,
                                        });
                                    }
                                    else {
                                        // Remove from cache, since value changed
                                        delete this.stateValueCache[fullStateId];
                                    }
                                }
                                else {
                                    this.adapter.log.warn(`[mqtt controlFunction] Unable to perform request - device ${this.getLogInfo()} is offline`);
                                }
                            };
                        }
                        // Fill this.http object for httpIoBrokerState()
                        // For MQTT a state may define both mqtt_publish (live push) and http_publish
                        // (periodic/connect reseed) - this is used for devices whose MQTT push value
                        // is unreliable (e.g. shelly1lg3, see issue #1318). For CoAP the historic
                        // either/or behaviour is kept.
                        if (httpBlock?.http_publish && (this.type === 'mqtt' || !hasTypePublishCmd)) {
                            const key = httpBlock.http_publish;
                            if (!deviceStatesHttp[key]) {
                                deviceStatesHttp[key] = [stateId];
                            }
                            else {
                                deviceStatesHttp[key].push(stateId);
                            }
                        }
                        // Init value or funct
                        let value;
                        if (httpBlock?.init_value) {
                            value = httpBlock.init_value;
                        }
                        else if (httpBlock?.init_funct) {
                            value = httpBlock.init_funct(this);
                        }
                        this.objectHelper.setOrUpdateObject(fullStateId, {
                            type: 'state',
                            common: state.common,
                        }, ['name'], value, controlFunction, false);
                    }
                }
                this.objectHelper.processObjectQueue(() => {
                    this.http = deviceStatesHttp;
                    this.device = deviceStates ?? {};
                    this.adapter.log.debug(`[createObjects] Finished object creation of ${this.getLogInfo()}`);
                    resolve(true);
                });
            }
            catch (err) {
                reject(err instanceof Error ? err : new Error(String(err)));
            }
        });
    }
    /**
     * delete old states in objects unter shelly.X.
     * For example if the configuration for the device change
     */
    async deleteOldStates() {
        const deviceId = this.getDeviceId();
        const objList = await this.adapter.getAdapterObjectsAsync();
        const dps = datapoints.getDeviceByClass(this.getDeviceClass(), this.type, this.getDeviceMode(), this.getDeviceFirmwareVersion());
        if (dps) {
            for (const o in objList) {
                const tmpObj = objList[o];
                if (tmpObj && tmpObj._id && tmpObj.type) {
                    // remove namespace
                    const stateId = tmpObj._id.replace(`${this.adapter.namespace}.${deviceId}.`, '');
                    // Just delete states of this device!
                    if (tmpObj.type === 'state' && tmpObj._id.startsWith(`${this.adapter.namespace}.${deviceId}`)) {
                        if (!dps[stateId]) {
                            try {
                                if (this.objectHelper.getObject(tmpObj._id)) {
                                    this.objectHelper.deleteObject(tmpObj._id);
                                }
                                else {
                                    await this.adapter.delForeignObjectAsync(tmpObj._id);
                                }
                                delete objList[tmpObj._id];
                                delete this.device[stateId];
                                this.adapter.log.debug(`Deleted unused state "${tmpObj._id}"`);
                            }
                            catch (err) {
                                this.adapter.log.error(`Could not delete unused state "${tmpObj._id}": ${err}`);
                            }
                        }
                    }
                }
            }
        }
        // Delete empty channels
        for (const o in objList) {
            const tmpObj = objList[o];
            if (tmpObj && tmpObj.type && tmpObj._id && tmpObj.type === 'channel') {
                // Search for states in current channel
                let found = false;
                for (const j in objList) {
                    const tmpIDj = objList[j];
                    if (!tmpIDj) {
                        continue;
                    }
                    if (tmpIDj?.type && tmpIDj._id && tmpIDj.type === 'state' && tmpIDj._id.startsWith(tmpObj._id)) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    try {
                        if (this.objectHelper.getObject(tmpObj._id)) {
                            this.objectHelper.deleteObject(tmpObj._id);
                        }
                        else {
                            await this.adapter.delForeignObjectAsync(tmpObj._id, { recursive: true });
                        }
                        delete objList[tmpObj._id];
                        this.adapter.log.debug(`Deleted unused channel "${tmpObj._id}"`);
                    }
                    catch (err) {
                        this.adapter.log.error(`Could not delete unused channel "${tmpObj._id}": ${err}`);
                    }
                }
            }
        }
    }
    async firmwareUpdate() {
        if (this.getDeviceId() === undefined) {
            return;
        }
        if (!this.isOnline() || !this.getIP()) {
            this.adapter.log.debug(`[firmwareUpdate] Device is offline (or IP is unknown) ${this.getLogInfo()}`);
            return;
        }
        try {
            const firmwareUpdateState = await this.adapter.getStateAsync(`${this.getDeviceId()}.firmware`);
            this.adapter.log.silly(`[firmwareUpdate] received state ${JSON.stringify(firmwareUpdateState)} for ${this.getLogInfo()}`);
            // Check if device has firmware update
            if (firmwareUpdateState && firmwareUpdateState.val) {
                this.adapter.log.debug(`[firmwareUpdate] Update available for ${this.getLogInfo()} - performing update process`);
                if (this.getDeviceGen() === 1) {
                    const body = await this.requestAsync('/ota?update=true');
                    this.adapter.log.debug(`[firmwareUpdate] Update result for ${this.getLogInfo()}: ${body}`);
                }
                else if (this.getDeviceGen() >= 2) {
                    const body = await this.requestAsync('/rpc/Shelly.Update');
                    this.adapter.log.debug(`[firmwareUpdate] Update result for ${this.getLogInfo()}: ${body}`);
                }
            }
        }
        catch (err) {
            this.adapter.log.error(`[firmwareUpdate] Error in update request for ${this.getLogInfo()}: ${err}`);
        }
    }
    async downloadAllScripts() {
        if (this.getDeviceId() === undefined) {
            return;
        }
        if (!this.isOnline()) {
            this.adapter.log.debug(`[downloadAllScripts] Device is offline ${this.getLogInfo()}`);
            return;
        }
        try {
            if (this.getDeviceGen() >= 2) {
                const scriptDir = `scripts/${this.getDirectoryName()}`;
                await this.adapter.mkdirAsync(this.adapter.namespace, scriptDir);
                const body = await this.requestWithRetry('/rpc/Script.List');
                this.adapter.log.debug(`[downloadAllScripts] Found scripts on device ${this.getLogInfo()}: ${body}`);
                const scriptList = JSON.parse(body);
                let downloadCounter = 0;
                for (const script of scriptList.scripts) {
                    if (script.id && script.name) {
                        const bodyCode = await this.requestAsync(`/rpc/Script.GetCode?id=${script.id}`);
                        const scriptCode = JSON.parse(bodyCode);
                        await this.adapter.writeFileAsync(this.adapter.namespace, `${scriptDir}/${script.id}-${script.name}.js`, scriptCode.data);
                        downloadCounter++;
                    }
                }
                this.adapter.log.info(`[downloadAllScripts] Downloaded ${downloadCounter} scripts of ${this.getLogInfo()} to files`);
            }
        }
        catch (err) {
            this.adapter.log.error(`[downloadAllScripts] Error ${this.getLogInfo()}: ${err}`);
        }
    }
    /**
     * Look for the ioBroker BLE gateway script on the device and read its version out of the code.
     *
     * @returns information about the installed script or `null` if it is not installed
     */
    /**
     * Perform an HTTP request and retry it if the device answers with 429 (too many requests).
     * Shelly devices reject a request which arrives while they are still busy with another one - and
     * the adapter polls the same device over HTTP in parallel, so that happens easily.
     *
     * @param url path of the request, e.g. `/rpc/Script.List`
     * @param postData body of a POST request. If omitted, a GET request is performed.
     */
    async requestWithRetry(url, postData) {
        let lastError;
        for (let attempt = 0; attempt < 4; attempt++) {
            if (attempt) {
                // 300 ms, 600 ms, 1200 ms - the device only needs to finish its current request
                const delay = 300 * 2 ** (attempt - 1);
                this.adapter.log.debug(`[requestWithRetry] ${this.getLogInfo()}: device is busy (429), repeating "${url}" in ${delay} ms`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            try {
                return await this.requestAsync(url, postData);
            }
            catch (err) {
                if (err?.response?.status !== 429) {
                    throw err;
                }
                lastError = err;
            }
        }
        throw lastError;
    }
    async getBleGatewayScript() {
        return (await this.getBleGatewayScripts())[0] ?? null;
    }
    /**
     * All scripts on the device which forward BLE advertisements to this adapter. There is normally
     * one, but a device can end up with several - e.g. if the script was added manually twice. They
     * all have to be found, otherwise an old one keeps running and keeps reporting its version.
     */
    async getBleGatewayScripts() {
        const body = await this.requestWithRetry('/rpc/Script.List');
        const scriptList = JSON.parse(body);
        const scripts = scriptList.scripts ?? [];
        // Our own name first, so it becomes the script which is updated
        const candidates = [
            ...scripts.filter(s => s.name === ble_gateway_script_1.bleGatewayScriptName),
            ...scripts.filter(s => s.name !== ble_gateway_script_1.bleGatewayScriptName),
        ];
        const found = [];
        for (const script of candidates) {
            // Scripts which were added manually (as described in the documentation) have any name,
            // so a script is also recognized by its content
            const code = await this.getScriptCode(script.id);
            if (script.name === ble_gateway_script_1.bleGatewayScriptName || (code.includes('/events/ble') && code.includes('BTHOME'))) {
                const version = /SCRIPT_VERSION\s*=\s*'([^']+)'/.exec(code);
                found.push({
                    id: script.id,
                    name: script.name,
                    version: version ? version[1] : null,
                    running: !!script.running,
                });
            }
        }
        return found;
    }
    /**
     * Read the complete code of a script. The device answers `Script.GetCode` with a limited amount
     * of data and reports the remainder in `left`, so it has to be read in several requests.
     *
     * @param id id of the script on the device
     */
    async getScriptCode(id) {
        let code = '';
        for (let guard = 0; guard < 20; guard++) {
            const body = await this.requestWithRetry(`/rpc/Script.GetCode?id=${id}&offset=${code.length}`);
            const chunk = JSON.parse(body);
            code += chunk.data ?? '';
            if (!chunk.left || !chunk.data) {
                break;
            }
        }
        return code;
    }
    /**
     * Install or update the ioBroker BLE gateway script on a Gen2+ device. An already installed
     * script with the current version is not touched, so this can be called for every device.
     *
     * Bluetooth is enabled first if required, because the script refuses to start without it. The
     * code is uploaded in chunks (the device rejects a single large request) and read back
     * afterwards - a `Script.PutCode` which is aborted in the middle leaves an incomplete script on
     * the device, and that must not be reported as success.
     *
     * @param force upload the code even if the installed version is already the expected one
     */
    async installBleGatewayScript(force = false) {
        if (this.getDeviceGen() < 2) {
            return { status: 'error', message: 'Scripts are only supported by Gen2+ devices' };
        }
        if (!this.isOnline()) {
            return { status: 'error', message: 'Device is offline' };
        }
        try {
            this.adapter.log.info(`[installBleGatewayScript] ${this.getLogInfo()}: looking for the gateway script on the device`);
            const foundScripts = await this.getBleGatewayScripts();
            const installed = foundScripts[0] ?? null;
            this.adapter.log.info(installed
                ? `[installBleGatewayScript] ${this.getLogInfo()}: found script id ${installed.id} "${installed.name}", version ${installed.version ?? '<unknown>'}, ${installed.running ? 'running' : 'stopped'}`
                : `[installBleGatewayScript] ${this.getLogInfo()}: no gateway script installed yet`);
            // A second gateway script would keep sending its own (old) version, so stop the others
            for (const duplicate of foundScripts.slice(1)) {
                this.adapter.log.warn(`[installBleGatewayScript] ${this.getLogInfo()}: stopping additional gateway script id ${duplicate.id} "${duplicate.name}" (version ${duplicate.version ?? '<unknown>'})`);
                await this.requestWithRetry(`/rpc/Script.Stop?id=${duplicate.id}`).catch(() => {
                    /* may not be running */
                });
                await this.requestWithRetry('/rpc/Script.SetConfig', {
                    id: duplicate.id,
                    config: { enable: false },
                }).catch(() => {
                    /* not fatal - it is only stopped until the next restart then */
                });
            }
            // Also for an up to date script, because a running script without Bluetooth does nothing
            const restartRequired = await this.enableBle();
            if (!force && installed && installed.version === ble_gateway_script_1.bleGatewayScriptVersion && installed.running) {
                this.adapter.log.info(`[installBleGatewayScript] ${this.getLogInfo()}: version ${installed.version} is up to date and running - nothing to do`);
                await this.setBleGatewayScriptVersionState(installed.version);
                return {
                    status: 'uptodate',
                    version: installed.version,
                    message: `Script version ${installed.version} is already installed`,
                    restartRequired,
                };
            }
            // The script must not run while its code is replaced
            let scriptId;
            if (installed) {
                scriptId = installed.id;
                this.adapter.log.info(`[installBleGatewayScript] ${this.getLogInfo()}: stopping script ${scriptId}`);
                await this.requestWithRetry(`/rpc/Script.Stop?id=${scriptId}`).catch(() => {
                    /* the script may not be running - not an error */
                });
            }
            else {
                const createBody = await this.requestWithRetry('/rpc/Script.Create', {
                    name: ble_gateway_script_1.bleGatewayScriptName,
                });
                const created = JSON.parse(createBody);
                if (typeof created.id !== 'number') {
                    return { status: 'error', message: `Device did not create a script: ${createBody}` };
                }
                scriptId = created.id;
                this.adapter.log.info(`[installBleGatewayScript] ${this.getLogInfo()}: created script "${ble_gateway_script_1.bleGatewayScriptName}" with id ${scriptId}`);
            }
            // The device limits the size of a single request, so the code is sent in chunks. The
            // first chunk replaces the existing code, the following ones are appended.
            const chunkSize = 1024;
            const chunks = Math.ceil(ble_gateway_script_1.bleGatewayScriptCode.length / chunkSize);
            this.adapter.log.info(`[installBleGatewayScript] ${this.getLogInfo()}: uploading version ${ble_gateway_script_1.bleGatewayScriptVersion} (${ble_gateway_script_1.bleGatewayScriptCode.length} bytes in ${chunks} chunks)`);
            let storedLength = 0;
            for (let offset = 0; offset < ble_gateway_script_1.bleGatewayScriptCode.length; offset += chunkSize) {
                this.adapter.log.debug(`[installBleGatewayScript] ${this.getLogInfo()}: chunk ${Math.floor(offset / chunkSize) + 1}/${chunks}`);
                const putResult = await this.requestWithRetry('/rpc/Script.PutCode', {
                    id: scriptId,
                    code: ble_gateway_script_1.bleGatewayScriptCode.substring(offset, offset + chunkSize),
                    append: offset > 0,
                });
                storedLength = JSON.parse(putResult).len ?? 0;
            }
            // The device reports the length of the stored code - comparing that is more reliable
            // than reading the code back, which the device only delivers in pieces.
            if (storedLength !== ble_gateway_script_1.bleGatewayScriptCode.length) {
                this.adapter.log.warn(`[installBleGatewayScript] ${this.getLogInfo()}: the device stored ${storedLength} of ${ble_gateway_script_1.bleGatewayScriptCode.length} bytes`);
                return {
                    status: 'error',
                    message: `Only ${storedLength} of ${ble_gateway_script_1.bleGatewayScriptCode.length} bytes have been stored on the device - please retry`,
                };
            }
            this.adapter.log.debug(`[installBleGatewayScript] ${this.getLogInfo()}: ${storedLength} bytes stored, enabling and starting script ${scriptId}`);
            // enable = start automatically after a reboot of the device. The name is set as well, so
            // an adopted script is found by its name the next time.
            await this.requestWithRetry('/rpc/Script.SetConfig', {
                id: scriptId,
                config: { enable: true, name: ble_gateway_script_1.bleGatewayScriptName },
            });
            await this.requestWithRetry(`/rpc/Script.Start?id=${scriptId}`);
            const started = await this.getBleGatewayScript();
            this.adapter.log.info(`[installBleGatewayScript] ${this.getLogInfo()}: device reports script id ${started?.id ?? '?'}, version ${started?.version ?? '<unknown>'}, ${started?.running ? 'running' : 'NOT running'}`);
            await this.setBleGatewayScriptVersionState(ble_gateway_script_1.bleGatewayScriptVersion);
            this.adapter.log.info(`[installBleGatewayScript] ${this.getLogInfo()}: script version ${ble_gateway_script_1.bleGatewayScriptVersion} is ${installed ? 'updated' : 'installed'} and started${restartRequired ? ' - the device must be restarted to activate Bluetooth' : ''}`);
            return {
                status: installed ? 'updated' : 'installed',
                version: ble_gateway_script_1.bleGatewayScriptVersion,
                message: `Script version ${ble_gateway_script_1.bleGatewayScriptVersion} has been ${installed ? 'updated' : 'installed'}`,
                restartRequired,
            };
        }
        catch (err) {
            this.adapter.log.warn(`[installBleGatewayScript] Error for ${this.getLogInfo()}: ${err}`);
            // 429 survived all retries - the device is permanently busy, a plain axios message
            // ("Request failed with status code 429") would not tell the user anything
            const message = err?.response?.status === 429
                ? 'The device rejected the request because it is busy (429) - please try again in a moment'
                : String(err);
            return { status: 'error', message };
        }
    }
    /**
     * Enable Bluetooth on the device if it is disabled - the gateway script does not run without it.
     *
     * @returns `true` if the device must be restarted to apply the change
     */
    async enableBle() {
        const bleConfigBody = await this.requestWithRetry('/rpc/BLE.GetConfig');
        const bleConfig = JSON.parse(bleConfigBody);
        if (bleConfig.enable === true) {
            this.adapter.log.debug(`[installBleGatewayScript] ${this.getLogInfo()}: Bluetooth is enabled`);
            return false;
        }
        this.adapter.log.info(`[installBleGatewayScript] Enabling Bluetooth of ${this.getLogInfo()}`);
        const result = await this.requestWithRetry('/rpc/BLE.SetConfig', { config: { enable: true } });
        return !!JSON.parse(result).restart_required;
    }
    async setBleGatewayScriptVersionState(version) {
        const deviceId = this.getDeviceId();
        if (!deviceId) {
            return;
        }
        try {
            // The object is normally created by createObjects(), but not yet if the device connected
            // with an older adapter version and has not reconnected since - without it the value
            // would be lost and the version would stay invisible in the device manager.
            await this.adapter.extendObject(`${deviceId}.BLE`, {
                type: 'channel',
                common: { name: 'Channel BLE' },
                native: {},
            });
            await this.adapter.extendObject(`${deviceId}.BLE.scriptVersion`, {
                type: 'state',
                common: {
                    name: adapter_core_1.I18n.getTranslatedObject('Version of the BLE gateway script'),
                    type: 'string',
                    role: 'text',
                    read: true,
                    write: false,
                },
                native: {},
            });
            await this.adapter.setState(`${deviceId}.BLE.scriptVersion`, { val: version, ack: true });
        }
        catch (err) {
            this.adapter.log.warn(`[installBleGatewayScript] ${this.getLogInfo()}: cannot set the script version state: ${err}`);
        }
    }
    /**
     * @param setOffline - false if the device is still online (e.g. a newer connection of the same device took over)
     */
    destroy(setOffline = true) {
        this.adapter.log.debug(`[BaseClient] Destroying ${this.getLogInfo()}`);
        if (setOffline) {
            this.adapter
                .deviceStatusUpdate(this.getDeviceId(), false) // Device offline
                .catch((e) => this.adapter.log.error(`[BaseClient] deviceStatusUpdate failed: ${String(e)}`));
        }
        if (this.httpIoBrokerStateTimeout) {
            clearTimeout(this.httpIoBrokerStateTimeout);
        }
        this.msgId = 1;
        this.stateValueCache = {};
        this.device = {};
        this.http = {};
        this.deviceId = undefined;
        this.ip = undefined;
        this.id = undefined;
        this.deviceType = undefined;
        this.deviceMode = undefined;
        this.deviceFirmwareVersion = undefined;
        this.deviceClass = undefined;
        this.serialId = undefined;
        this.deviceGen = undefined;
    }
}
exports.BaseClient = BaseClient;
/** Base class shared by the MQTT and CoAP servers (holds adapter/objectHelper/eventEmitter). */
class BaseServer {
    adapter;
    objectHelper;
    eventEmitter;
    constructor(adapter, objectHelper, eventEmitter) {
        this.adapter = adapter;
        this.objectHelper = objectHelper;
        this.eventEmitter = eventEmitter;
    }
    destroy() {
        this.adapter.log.debug(`[BaseServer] Destroying`);
    }
}
exports.BaseServer = BaseServer;
//# sourceMappingURL=base.js.map