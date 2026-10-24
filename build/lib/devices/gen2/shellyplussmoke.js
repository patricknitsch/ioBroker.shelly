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
Object.defineProperty(exports, "__esModule", { value: true });
exports.shellyplussmoke = void 0;
const shellyHelper = __importStar(require("../../shelly-helper"));
const shellyHelperGen2 = __importStar(require("../gen2-helper"));
/**
 * Shelly Plus Smoke / shellyplussmoke
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPlusSmoke
 */
const shellyplussmoke = {
    'Smoke0.ChannelName': {
        device_mode: 'switch',
        mqtt: {
            http_publish: `/rpc/Smoke.GetConfig?id=0`,
            http_publish_funct: async (value, self) => {
                return value ? await shellyHelper.setChannelName(self, 'Smoke0', JSON.parse(value).name) : undefined;
            },
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Smoke.SetConfig',
                    params: { id: 0, config: { name: value } },
                });
            },
        },
        common: {
            name: 'Channel name',
            type: 'string',
            role: 'text',
            read: true,
            write: true,
        },
    },
    'Smoke0.Alarm': {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/smoke:0`,
            mqtt_publish_funct: value => JSON.parse(value).alarm,
        },
        common: {
            name: 'Smoke detected',
            type: 'boolean',
            role: 'sensor.alarm.fire',
            read: true,
            write: false,
        },
    },
    'Smoke0.Muted': {
        mqtt: {
            mqtt_publish: `<mqttprefix>/status/smoke:0`,
            mqtt_publish_funct: value => JSON.parse(value).mute,
        },
        common: {
            name: 'Muted',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
    },
    'Smoke0.MuteAlarm': {
        mqtt: {
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Smoke.Mute',
                    params: { id: 0 },
                });
            },
        },
        common: {
            name: 'Mute alarm',
            type: 'boolean',
            role: 'button',
            read: false,
            write: true,
        },
    },
    'Smoke0.Event': {
        mqtt: {
            mqtt_publish: '<mqttprefix>/events/rpc',
            mqtt_publish_funct: value => {
                const valueObj = JSON.parse(value);
                if (valueObj?.method === 'NotifyEvent' && valueObj?.params?.events) {
                    for (const e in valueObj.params.events) {
                        const event = valueObj.params.events[e];
                        if (typeof event === 'object' && event.component === 'smoke:0') {
                            return event.event;
                        }
                    }
                }
                return undefined;
            },
        },
        common: {
            name: 'Smoke Event',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
        },
    },
};
exports.shellyplussmoke = shellyplussmoke;
shellyHelperGen2.addDevicePower(shellyplussmoke, 0, false);
//# sourceMappingURL=shellyplussmoke.js.map