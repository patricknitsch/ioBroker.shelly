const assert = require('node:assert');
const {
    getBrokerUrl,
    getExternalDeviceKey,
    isOnlinePayload,
    isShellyDeviceSegment,
    parseExternalTopic,
} = require('../build/lib/protocol/mqtt-topics');

describe('Test external MQTT broker', function () {
    it('Test isShellyDeviceSegment', function () {
        assert.strictEqual(isShellyDeviceSegment('shellyplus1pm-44179394d4d4'), true);
        assert.strictEqual(isShellyDeviceSegment('shellyswitch25-C45BBE798F0F'), true);
        assert.strictEqual(isShellyDeviceSegment('shellyplus1pm-kitchen'), true);
        assert.strictEqual(isShellyDeviceSegment('zigbee2mqtt-bridge'), false);
        assert.strictEqual(isShellyDeviceSegment('shellyplus1pm'), false);
        assert.strictEqual(isShellyDeviceSegment(''), false);
        assert.strictEqual(isShellyDeviceSegment(undefined), false);
    });

    it('Test parseExternalTopic (Gen 1)', function () {
        assert.deepStrictEqual(parseExternalTopic('shellies/shellyswitch25-C45BBE798F0F/relay/0'), {
            prefix: 'shellyswitch25-C45BBE798F0F',
            gen1: true,
        });
        assert.deepStrictEqual(parseExternalTopic('shellies/shellyswitch25-C45BBE798F0F/online'), {
            prefix: 'shellyswitch25-C45BBE798F0F',
            gen1: true,
        });
        assert.strictEqual(parseExternalTopic('shellies/announce'), undefined);
        assert.strictEqual(parseExternalTopic('shellies/command'), undefined);
    });

    it('Test parseExternalTopic (Gen 2+)', function () {
        assert.deepStrictEqual(parseExternalTopic('shellyplus1pm-44179394d4d4/status/switch:0'), {
            prefix: 'shellyplus1pm-44179394d4d4',
            gen1: false,
        });
        assert.deepStrictEqual(parseExternalTopic('shellyplus1pm-44179394d4d4/online'), {
            prefix: 'shellyplus1pm-44179394d4d4',
            gen1: false,
        });
        assert.deepStrictEqual(parseExternalTopic('shellyplus1pm-44179394d4d4/events/rpc'), {
            prefix: 'shellyplus1pm-44179394d4d4',
            gen1: false,
        });
        assert.deepStrictEqual(parseExternalTopic('shelly/shellyplus1pm-44179394d4d4/status/sys'), {
            prefix: 'shelly/shellyplus1pm-44179394d4d4',
            gen1: false,
        });

        // Commands to the device and foreign topics are no device messages
        assert.strictEqual(parseExternalTopic('shellyplus1pm-44179394d4d4/rpc'), undefined);
        assert.strictEqual(parseExternalTopic('shellyplus1pm-44179394d4d4/command'), undefined);
        assert.strictEqual(parseExternalTopic('iobroker/rpc'), undefined);
        assert.strictEqual(parseExternalTopic('iobroker-init/rpc'), undefined);
        assert.strictEqual(parseExternalTopic('tasmota/status/power'), undefined);
        assert.strictEqual(parseExternalTopic('zigbee2mqtt/bridge/state'), undefined);
    });

    it('Test getExternalDeviceKey', function () {
        assert.strictEqual(getExternalDeviceKey('shellyplus1pm-44179394d4d4'), 'shellyplus1pm-44179394d4d4');
        assert.strictEqual(getExternalDeviceKey('shelly/shellyplus1pm-44179394D4D4'), 'shellyplus1pm-44179394d4d4');
    });

    it('Test isOnlinePayload', function () {
        assert.strictEqual(isOnlinePayload(Buffer.from('true')), true);
        assert.strictEqual(isOnlinePayload(' TRUE '), true);
        assert.strictEqual(isOnlinePayload('1'), true);
        assert.strictEqual(isOnlinePayload(Buffer.from('false')), false);
        assert.strictEqual(isOnlinePayload(''), false);
        assert.strictEqual(isOnlinePayload(undefined), false);
    });

    it('Test getBrokerUrl', function () {
        assert.strictEqual(getBrokerUrl('192.168.1.10', 1883), 'mqtt://192.168.1.10:1883');
        assert.strictEqual(getBrokerUrl(' broker.local ', '1884'), 'mqtt://broker.local:1884');
        assert.strictEqual(getBrokerUrl('broker.local', undefined), 'mqtt://broker.local:1883');
        assert.strictEqual(getBrokerUrl('mqtts://broker.local:8883', 1883), 'mqtts://broker.local:8883');
        assert.strictEqual(getBrokerUrl('ws://broker.local:9001/mqtt', 1883), 'ws://broker.local:9001/mqtt');
        assert.strictEqual(getBrokerUrl('', 1883), undefined);
        assert.strictEqual(getBrokerUrl(undefined, 1883), undefined);
        assert.throws(() => getBrokerUrl('mqtt://', 1883));
    });
});
