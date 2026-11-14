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
exports.addRelay = addRelay;
const shellyHelper = __importStar(require("../shelly-helper"));
/**
 * Adds a generic switch definition for gen 1 devices
 *
 * @param deviceObj
 * @param relayId
 */
function addRelay(deviceObj, relayId) {
    deviceObj[`Relay${relayId}.ChannelName`] = {
        coap: {
            http_publish: `/settings/relay/${relayId}`,
            http_publish_funct: async (value, self) => {
                return value
                    ? await shellyHelper.setChannelName(self, `Relay${relayId}`, JSON.parse(value).name)
                    : undefined;
            },
            http_cmd: `/settings/relay/${relayId}`,
            http_cmd_funct: value => ({ name: value }),
        },
        mqtt: {
            http_publish: `/settings/relay/${relayId}`,
            http_publish_funct: async (value, self) => {
                return value
                    ? await shellyHelper.setChannelName(self, `Relay${relayId}`, JSON.parse(value).name)
                    : undefined;
            },
            http_cmd: `/settings/relay/${relayId}`,
            http_cmd_funct: value => ({ name: value }),
        },
        common: {
            name: 'Channel name',
            type: 'string',
            role: 'text',
            read: true,
            write: true,
        },
    };
    deviceObj[`Relay${relayId}.Switch`] = {
        coap: {
            coap_publish: `1${relayId + 1}01`, // 1101 = Channel 1, 1201 = Channel 2, 1301 = Channel 3, ...
            coap_publish_funct: value => value == 1,
            http_cmd: `/relay/${relayId}`,
            http_cmd_funct: async (value, self) => {
                return value
                    ? { turn: 'on', timer: await shellyHelper.getSetDuration(self, `Relay${relayId}.Timer`) }
                    : { turn: 'off', timer: await shellyHelper.getSetDuration(self, `Relay${relayId}.Timer`) };
            },
        },
        mqtt: {
            mqtt_publish: `shellies/<mqttprefix>/relay/${relayId}`,
            mqtt_publish_funct: value => value === 'on',
            mqtt_cmd: `shellies/<mqttprefix>/relay/${relayId}/command`,
            mqtt_cmd_funct: value => (value ? 'on' : 'off'),
        },
        common: {
            name: 'Switch',
            type: 'boolean',
            role: 'switch',
            read: true,
            write: true,
            def: false,
        },
    };
    deviceObj[`Relay${relayId}.Input`] = {
        coap: {
            coap_publish: `2${relayId + 1}01`, // 2101 = Channel 1, 2201 = Channel 2, 2301 = Channel 3, ...
            coap_publish_funct: value => {
                return value === 1 || value === 2;
            },
        },
        mqtt: {
            mqtt_publish: `shellies/<mqttprefix>/input/${relayId}`,
            mqtt_publish_funct: value => value == 1,
        },
        common: {
            name: 'Input mode',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
            states: {
                0: 'Input',
                1: 'Detach',
            },
        },
    };
    deviceObj[`Relay${relayId}.Event`] = {
        coap: {
            coap_publish: `2${relayId + 1}02`, // 2102 = Channel 1, 2202 = Channel 2, 2302 = Channel 3, ...
        },
        mqtt: {
            mqtt_publish: `shellies/<mqttprefix>/input_event/${relayId}`,
            mqtt_publish_funct: value => (value ? JSON.parse(value).event : undefined),
        },
        common: {
            name: 'Event',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
            states: {
                S: '1xShort',
                L: 'Long',
            },
        },
    };
    deviceObj[`Relay${relayId}.EventCount`] = {
        coap: {
            coap_publish: `2${relayId + 1}03`, // 2103 = Channel 1, 2203 = Channel 2, 2303 = Channel 3, ...
        },
        mqtt: {
            mqtt_publish: `shellies/<mqttprefix>/input_event/${relayId}`,
            mqtt_publish_funct: value => (value ? JSON.parse(value).event_cnt : undefined),
        },
        common: {
            name: 'Event count',
            type: 'number',
            role: 'state',
            read: true,
            write: false,
            states: {
                S: '1xShort',
                L: 'Long',
            },
        },
    };
    deviceObj[`Relay${relayId}.longpush`] = {
        coap: {
            coap_publish: `2${relayId + 1}02`, // 2102 = Channel 1, 2202 = Channel 2, 2302 = Channel 3, ...
            coap_publish_funct: value => value == 'L',
        },
        mqtt: {
            mqtt_publish: `shellies/<mqttprefix>/longpush/${relayId}`,
            mqtt_publish_funct: value => value == 1,
        },
        common: {
            name: 'Button pushed long',
            type: 'boolean',
            role: 'state',
            read: true,
            write: false,
        },
    };
    // Just exists once
    if (relayId === 0) {
        deviceObj[`Relay${relayId}.longpushtime`] = {
            coap: {
                http_publish: '/settings',
                http_publish_funct: value => (value ? JSON.parse(value).longpush_time : undefined),
                http_cmd: '/settings',
                http_cmd_funct: value => ({ longpush_time: value }),
            },
            mqtt: {
                http_publish: '/settings',
                http_publish_funct: value => (value ? JSON.parse(value).longpush_time : undefined),
                http_cmd: '/settings',
                http_cmd_funct: value => ({ longpush_time: value }),
            },
            common: {
                name: 'Time for long button push',
                type: 'number',
                role: 'state',
                unit: 'ms',
                min: 1,
                max: 5000,
                read: true,
                write: true,
            },
        };
    }
    deviceObj[`Relay${relayId}.source`] = {
        coap: {
            http_publish: '/status',
            http_publish_funct: value => (value ? JSON.parse(value).relays[relayId].source : undefined),
        },
        mqtt: {
            http_publish: '/status',
            http_publish_funct: value => (value ? JSON.parse(value).relays[relayId].source : undefined),
        },
        common: {
            name: 'Source of last command',
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
    };
}
//# sourceMappingURL=gen1-helper.js.map