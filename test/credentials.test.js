const assert = require('node:assert');
const { applyCredentials, getCredentialLoginValues, getSelectedCredentialIds } = require('../build/lib/credentials');

function makeAdapter(config) {
    const logs = { info: [], warn: [], debug: [] };
    return {
        config,
        logs,
        log: {
            info: msg => logs.info.push(msg),
            warn: msg => logs.warn.push(msg),
            debug: msg => logs.debug.push(msg),
        },
    };
}

function makeReader(credentials) {
    return async (_adapter, id) => {
        if (!credentials[id]) {
            throw new Error(`Credential ${id} not found`);
        }
        return credentials[id];
    };
}

describe('Test credentials', function () {
    it('Test getCredentialLoginValues', function () {
        assert.deepStrictEqual(getCredentialLoginValues({ login: ' user ', password: 'secret' }), {
            login: 'user',
            password: 'secret',
        });
        assert.deepStrictEqual(getCredentialLoginValues({ key: 'abc' }), { login: '', password: '' });
        assert.deepStrictEqual(getCredentialLoginValues(undefined), { login: '', password: '' });
    });

    it('Test getSelectedCredentialIds', function () {
        assert.deepStrictEqual(getSelectedCredentialIds({ mqttCredential: '', httpCredential: '' }), []);
        assert.deepStrictEqual(
            getSelectedCredentialIds({
                mqttCredential: 'system.credentials.mqtt',
                httpCredential: 'system.credentials.shelly',
            }),
            ['system.credentials.mqtt', 'system.credentials.shelly'],
        );
        assert.deepStrictEqual(
            getSelectedCredentialIds({
                mqttCredential: 'system.credentials.shelly',
                httpCredential: ' system.credentials.shelly ',
            }),
            ['system.credentials.shelly'],
        );
    });

    it('does nothing without a selected credential', async function () {
        const config = { mqttusername: 'manual', mqttpassword: 'manual', httpusername: 'admin', httppassword: 'pw' };
        const adapter = makeAdapter(config);
        assert.deepStrictEqual(await applyCredentials(adapter, makeReader({})), []);
        assert.strictEqual(config.mqttusername, 'manual');
        assert.strictEqual(config.httppassword, 'pw');
    });

    it('takes MQTT and HTTP user credentials from the selected credentials', async function () {
        const config = {
            mqttCredential: 'system.credentials.mqtt',
            mqttusername: 'manual',
            mqttpassword: 'manual',
            httpCredential: 'system.credentials.shelly',
            httpusername: 'admin',
            httppassword: '',
        };
        const adapter = makeAdapter(config);
        const reader = makeReader({
            'system.credentials.mqtt': { name: 'Mosquitto', values: { login: 'broker', password: 'brokerpw' } },
            'system.credentials.shelly': { name: 'Shelly', values: { login: 'admin', password: 'shellypw' } },
        });

        assert.deepStrictEqual(await applyCredentials(adapter, reader), ['mqttCredential', 'httpCredential']);
        assert.strictEqual(config.mqttusername, 'broker');
        assert.strictEqual(config.mqttpassword, 'brokerpw');
        assert.strictEqual(config.httpusername, 'admin');
        assert.strictEqual(config.httppassword, 'shellypw');
        assert.strictEqual(adapter.logs.warn.length, 0);
    });

    it('keeps the instance settings for a key credential', async function () {
        const config = { mqttCredential: 'system.credentials.key', mqttusername: 'manual', mqttpassword: 'manual' };
        const adapter = makeAdapter(config);
        const reader = makeReader({ 'system.credentials.key': { name: 'Key', values: { key: 'abc' } } });

        assert.deepStrictEqual(await applyCredentials(adapter, reader), []);
        assert.strictEqual(config.mqttusername, 'manual');
        assert.strictEqual(config.mqttpassword, 'manual');
        assert.strictEqual(adapter.logs.warn.length, 1);
    });

    it('keeps the instance settings if the credential cannot be read', async function () {
        const config = { httpCredential: 'system.credentials.deleted', httpusername: 'admin', httppassword: 'pw' };
        const adapter = makeAdapter(config);

        assert.deepStrictEqual(await applyCredentials(adapter, makeReader({})), []);
        assert.strictEqual(config.httppassword, 'pw');
        assert.strictEqual(adapter.logs.warn.length, 1);
    });
});
