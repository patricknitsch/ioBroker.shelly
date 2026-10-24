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
exports.shellymotion2 = void 0;
const shellyHelper = __importStar(require("../../shelly-helper"));
/**
 * Shelly Motion 2 / SHMOS-02 / shellymotion2
 * CoAP:
 *
 * CoAP Version >= 1.8
 *  Shelly Motion 2 SHMOS-02:    {"blk":[{"I":1,"D":"sensor_0"},{"I":2,"D":"device"}],"sen":[{"I":6107,"T":"A","D":"motion","R":["0/1","-1"],"L":1},{"I":3119,"T":"S","D":"timestamp","U":"s","R":["U32","-1"],"L":1},{"I":3120,"T":"A","D":"motionActive","R":["0/1","-1"],"L":1},{"I":6110,"T":"A","D":"vibration","R":["0/1","-1"],"L":1},{"I":3106,"T":"L","D":"luminosity","R":["U32","-1"],"L":1},{"I":3111,"T":"B","D":"battery","R":["0/100","-1"],"L":2},{"I":9103,"T":"EVC","D":"cfgChanged","R":"U16","L":2}]}
 */
const shellymotion2 = {
    'sensor.battery': {
        coap: {
            coap_publish: '3111',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/status',
            mqtt_publish_funct: value => (value ? JSON.parse(value).bat : undefined),
        },
        common: {
            name: 'Battery capacity',
            type: 'number',
            role: 'value.battery',
            read: true,
            write: false,
            min: 0,
            max: 100,
            unit: '%',
        },
    },
    'sensor.lux': {
        coap: {
            coap_publish: '3106',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/status',
            mqtt_publish_funct: value => (value ? JSON.parse(value).lux : undefined),
        },
        common: {
            name: 'Illuminance',
            type: 'number',
            role: 'value.brightness',
            read: true,
            write: false,
            unit: 'Lux',
        },
    },
    'sensor.vibration': {
        coap: {
            coap_publish: '6110',
            coap_publish_funct: value => {
                return value != 0;
            },
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/status',
            mqtt_publish_funct: value => (value ? JSON.parse(value).vibration : undefined),
        },
        common: {
            name: 'Vibration',
            type: 'boolean',
            role: 'sensor',
            read: true,
            write: false,
        },
    },
    'sensor.motion': {
        coap: {
            coap_publish: '6107',
            coap_publish_funct: value => value === 1,
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/status',
            mqtt_publish_funct: value => (value ? JSON.parse(value).motion : undefined),
        },
        common: {
            name: 'Motion',
            type: 'boolean',
            role: 'sensor.motion',
            read: true,
            write: false,
        },
    },
    'sensor.temperatureC': {
        coap: {
            coap_publish: '3101',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/status',
            mqtt_publish_funct: value => {
                if (value) {
                    const valObj = JSON.parse(value);
                    if (valObj.tmp.units === 'C') {
                        return valObj.tmp.value;
                    }
                    else if (valObj.tmp.units === 'F') {
                        return shellyHelper.fahrenheitToCelsius(valObj.tmp.value);
                    }
                }
                return undefined;
            },
        },
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
    },
    'sensor.temperatureF': {
        coap: {
            coap_publish: '3102',
        },
        mqtt: {
            mqtt_publish: 'shellies/<mqttprefix>/status',
            mqtt_publish_funct: value => {
                if (value) {
                    const valObj = JSON.parse(value);
                    if (valObj.tmp.units === 'C') {
                        return shellyHelper.celsiusToFahrenheit(valObj.tmp.value);
                    }
                    else if (valObj.tmp.units === 'F') {
                        return valObj.tmp.value;
                    }
                }
                return undefined;
            },
        },
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°F',
        },
    },
};
exports.shellymotion2 = shellymotion2;
//# sourceMappingURL=shellymotion2.js.map