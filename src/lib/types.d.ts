export interface ShellyAdapterConfig {
    protocol: 'mqtt' | 'coap' | 'both';
    httpusername: string;
    httppassword: string;
    /** Central ioBroker credential (login & password) for the HTTP login of the devices - empty = use the fields */
    httpCredential?: string;
    polltime: number | string;
    autoupdate: boolean;
    updateUnchangedObjects: boolean;
    ignoreTimezoneMismatch: boolean;
    logDebugMessages: boolean;
    saveHttpResponses: boolean;
    bind: string;
    port: number | string;
    mqttusername: string;
    mqttpassword: string;
    /** Central ioBroker credential (login & password) for MQTT - empty = use the fields */
    mqttCredential?: string;
    /** `broker`: start the internal MQTT broker, `client`: connect to an external MQTT broker */
    mqttMode?: 'broker' | 'client';
    /** Host (or URL like `mqtts://host:8883`) of the external MQTT broker */
    mqttClientHost?: string;
    /** Port of the external MQTT broker (used if the host contains no port) */
    mqttClientPort?: number | string;
    qos: 0 | 1 | 2;
    coapbind: string;
    blacklist: {
        [id: string]: string;
    }[];
    scanInterval: number | string;
}

// The ambient stubs for the two untyped runtime dependencies (shelly-iot, mqtt-connection) live
// in the script-style declaration file `external-modules.d.ts`. Ambient `declare module` blocks
// must sit in a non-module .d.ts to take effect, which this file is not (it has top-level exports).
