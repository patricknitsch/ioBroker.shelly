import * as datapoints from '../datapoints';

/** Source of the initial requests of the adapter - devices answer on `iobroker-init/rpc` */
export const INIT_SRC = 'iobroker-init';
/** Source of the commands sent by the device definitions - devices answer on `iobroker/rpc` */
export const CMD_SRC = 'iobroker';
/** Device part of a topic prefix, e.g. `shellyplus1pm-44179394d4d4` (device class + serial / custom name) */
const DEVICE_PREFIX_PATTERN = /^(.+)-(.+)$/;
/** Gen 2+ topics below the topic prefix which are used to discover a device on an external broker */
const GEN2_DEVICE_TOPIC_PATTERN = /^(online|events\/.+|status\/.+|debug\/.+)$/;

/**
 * Last segment of a topic prefix in lower case - identifies a device independent of an optional
 * folder (`shelly/shellyplus1-abc` and `shellyplus1-abc` are the same device).
 *
 * @param prefix - MQTT topic prefix of the device
 */
export function getExternalDeviceKey(prefix: string): string {
    const parts = prefix.split('/');
    return (parts[parts.length - 1] ?? '').toLowerCase();
}

/**
 * Checks if a single topic segment is the prefix of a supported Shelly device (`<deviceClass>-<serial or name>`).
 *
 * @param segment - topic segment, e.g. `shellyplus1pm-44179394d4d4`
 */
export function isShellyDeviceSegment(segment: string | undefined): boolean {
    if (!segment || segment.includes('/')) {
        return false;
    }
    const match = DEVICE_PREFIX_PATTERN.exec(segment);
    return !!match && !!datapoints.getDeviceTypeByClass(match[1]);
}

/**
 * Extracts the topic prefix of a Shelly device from a topic received on an external broker.
 *
 * Supported topics:
 * - Gen 1: `shellies/<prefix>/...`
 * - Gen 2+ with the default prefix: `<prefix>/online|events/...|status/...|debug/...`
 * - Gen 2+ with a folder: `<folder>/<prefix>/online|events/...|status/...|debug/...` (e.g. `shelly/<prefix>/...`)
 *
 * @param topic - MQTT topic
 * @returns the topic prefix of the device and its generation (1 or 2+), or undefined if the topic belongs to no device
 */
export function parseExternalTopic(topic: string): { prefix: string; gen1: boolean } | undefined {
    const parts = topic.split('/');
    if (parts.length < 2 || parts[0] === CMD_SRC || parts[0] === INIT_SRC) {
        return undefined;
    }

    if (parts[0] === 'shellies') {
        if (parts.length >= 3 && isShellyDeviceSegment(parts[1])) {
            return { prefix: parts[1], gen1: true };
        }
        return undefined;
    }

    if (isShellyDeviceSegment(parts[0]) && GEN2_DEVICE_TOPIC_PATTERN.test(parts.slice(1).join('/'))) {
        return { prefix: parts[0], gen1: false };
    }

    if (
        parts.length >= 3 &&
        isShellyDeviceSegment(parts[1]) &&
        GEN2_DEVICE_TOPIC_PATTERN.test(parts.slice(2).join('/'))
    ) {
        return { prefix: `${parts[0]}/${parts[1]}`, gen1: false };
    }

    return undefined;
}

/**
 * Evaluates the payload of an `online` topic.
 *
 * @param payload - MQTT payload
 */
export function isOnlinePayload(payload: Buffer | string | undefined): boolean {
    const value = (payload ?? '').toString().trim().toLowerCase();
    return value === 'true' || value === '1' || value === 'on';
}

/**
 * Builds the broker URL from the instance configuration
 *
 * @param host - host name, IP address or URL (`mqtt://`, `mqtts://`, `ws://`, `wss://`)
 * @param port - port which is used if the host contains no port
 * @returns the URL, or undefined if no host is configured (throws for an invalid host)
 */
export function getBrokerUrl(host: string | undefined, port: number | string | undefined): string | undefined {
    let brokerUrl = (host ?? '').trim();
    if (!brokerUrl) {
        return undefined;
    }
    if (!brokerUrl.includes('://')) {
        brokerUrl = `mqtt://${brokerUrl}`;
    }

    const parsedUrl = new URL(brokerUrl);
    if (!parsedUrl.hostname) {
        throw new Error(`No host name in "${host}"`);
    }
    if (!parsedUrl.port) {
        parsedUrl.port = String(parseInt(String(port), 10) || 1883);
    }
    return `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname === '/' ? '' : parsedUrl.pathname}`;
}
