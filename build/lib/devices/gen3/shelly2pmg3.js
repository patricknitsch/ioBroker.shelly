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
exports.shelly2pmg3 = void 0;
const shellyHelperGen2 = __importStar(require("../gen2-helper"));
const shellyHotfixesGen2 = __importStar(require("../gen2-hotfixes"));
/**
 * Shelly 2 PM Gen 3 / shelly2pmg3
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/Shelly2PMG3
 */
const shelly2pmg3 = {
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
                switch: 'relay',
                cover: 'shutter',
            },
        },
    },
};
exports.shelly2pmg3 = shelly2pmg3;
shellyHelperGen2.addSwitch(shelly2pmg3, 0, true);
shellyHelperGen2.addSwitch(shelly2pmg3, 1, true);
// Firmware bug: the switch output is reported outdated on the status topic
// right after a change (see issue #1627). Derive it from the NotifyStatus message instead.
shellyHotfixesGen2.fixMqttOutdatedSwitchStatus(shelly2pmg3, 0);
shellyHotfixesGen2.fixMqttOutdatedSwitchStatus(shelly2pmg3, 1);
shellyHelperGen2.addInput(shelly2pmg3, 0);
shellyHelperGen2.addInput(shelly2pmg3, 1);
shellyHelperGen2.addCover(shelly2pmg3, 0, true);
shellyHelperGen2.addPlusAddon(shelly2pmg3);
//# sourceMappingURL=shelly2pmg3.js.map