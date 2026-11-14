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
exports.shellywalldisplay = void 0;
const shellyHelperGen2 = __importStar(require("../gen2-helper"));
/**
 * Shelly Wall Display / shellywalldisplay
 */
const shellywalldisplay = {
    'UI.screensaverEnabled': {
        mqtt: {
            http_publish: '/rpc/UI.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value).screen_saver.enable : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'UI.SetConfig',
                    params: { config: { screen_saver: { enable: value } } },
                });
            },
        },
        common: {
            name: 'Screensaver',
            type: 'boolean',
            role: 'switch.enable',
            read: true,
            write: true,
        },
    },
    'UI.screensaverLock': {
        mqtt: {
            http_publish: '/rpc/UI.GetConfig',
            http_publish_funct: value => (value ? JSON.parse(value).lock_type : undefined),
            mqtt_cmd: '<mqttprefix>/rpc',
            mqtt_cmd_funct: (value, self) => {
                return JSON.stringify({
                    id: self.getNextMsgId(),
                    src: 'iobroker',
                    method: 'UI.SetConfig',
                    params: { config: { lock_type: value } },
                });
            },
        },
        common: {
            name: 'Lock screen',
            type: 'string',
            role: 'state',
            read: true,
            write: true,
            states: {
                none: 'none',
                home: 'home',
                sett: 'settings',
                full: 'full',
            },
        },
    },
    // https://community.shelly.cloud/topic/1793-walldisplay-list-for-useful-rpc-commands/
    // http://<IPofWalldisplay>/rpc/Ui.Tap?x=300&y=300 [0..719]
    //     payload: '{"jsonrpc": "2.0",  "method": "Ui.Tap",  "params": {},  "id": 1}'
};
exports.shellywalldisplay = shellywalldisplay;
shellyHelperGen2.addSwitch(shellywalldisplay, 0, false);
shellyHelperGen2.addInput(shellywalldisplay, 0);
shellyHelperGen2.addHumiditySensor(shellywalldisplay, 0);
shellyHelperGen2.addTemperatureSensor(shellywalldisplay, 0);
shellyHelperGen2.addIlluminanceSensor(shellywalldisplay, 0);
//# sourceMappingURL=shellywalldisplay.js.map