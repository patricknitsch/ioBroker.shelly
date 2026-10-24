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
exports.shellyplusrgbwpm = void 0;
const shellyHelperGen2 = __importStar(require("../gen2-helper"));
/**
 * Shelly Plus RGBW PM / shellyplusrgbwpm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPlusRGBWPM
 */
const shellyplusrgbwpm = {
    'Sys.deviceMode': {
        mqtt: {
            init_funct: self => self.getDeviceMode(),
            http_publish: '/rpc/Sys.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value).device.profile : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'Shelly.SetProfile',
                    params: { name: value },
                });
            },
        },
        common: {
            name: 'Mode / Profile',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                light: '4xLight',
                rgb: 'RGB',
                rgbw: 'RGBW',
            },
        },
    },
    'PLUSRGBWPM.HighFrequency': {
        mqtt: {
            http_publish: '/rpc/PlusRGBWPM.GetStatus',
            http_publish_funct: value => (value ? JSON.parse(value).hf_mode : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'PlusRGBWPM.SetConfig',
                    params: { hf_mode: value },
                });
            },
        },
        common: {
            name: 'High Frequency',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true,
            states: {
                true: 'HF on',
                false: 'HF off',
            },
        },
    },
};
exports.shellyplusrgbwpm = shellyplusrgbwpm;
shellyHelperGen2.addLight(shellyplusrgbwpm, 0, true);
shellyHelperGen2.addLight(shellyplusrgbwpm, 1, true);
shellyHelperGen2.addLight(shellyplusrgbwpm, 2, true);
shellyHelperGen2.addLight(shellyplusrgbwpm, 3, true);
shellyHelperGen2.addRGB(shellyplusrgbwpm, 0, true);
shellyHelperGen2.addRGBW(shellyplusrgbwpm, 0, true);
shellyHelperGen2.addInput(shellyplusrgbwpm, 0);
shellyHelperGen2.addInput(shellyplusrgbwpm, 1);
shellyHelperGen2.addInput(shellyplusrgbwpm, 2);
shellyHelperGen2.addInput(shellyplusrgbwpm, 3);
shellyHelperGen2.addPlusAddon(shellyplusrgbwpm);
//# sourceMappingURL=shellyplusrgbwpm.js.map