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
exports.shellyazht = void 0;
const shellyHelperGen2 = __importStar(require("../gen2-helper"));
/**
 * Shelly AZ H&T / shellyazht
 *
 * Humidity & Temperature Smart Sensor (uses the same API as Shelly H&T Gen3)
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyHTG3
 * https://kb.shelly.cloud/knowledge-base/shelly-az-h-t
 */
const shellyazht = {
    'HTUI.DisplayUnit': {
        mqtt: {
            http_publish: '/rpc/HT_UI.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value).temperature_unit : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'HT_UI.SetConfig',
                    params: { config: { temperature_unit: value } },
                });
            },
        },
        common: {
            name: 'Unit on display',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                C: 'Celsius',
                F: 'Fahrenheit',
            },
        },
    },
};
exports.shellyazht = shellyazht;
shellyHelperGen2.addDevicePower(shellyazht, 0, true);
shellyHelperGen2.addTemperatureSensor(shellyazht, 0);
shellyHelperGen2.addHumiditySensor(shellyazht, 0);
//# sourceMappingURL=shellyazht.js.map