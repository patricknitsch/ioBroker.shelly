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
exports.shellypro4pm = void 0;
const shellyHelperGen2 = __importStar(require("../gen2-helper"));
const shellyHotfixesGen2 = __importStar(require("../gen2-hotfixes"));
/**
 * Shelly Pro 4 PM / shellypro4pm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPro4PM
 */
const shellypro4pm = {};
exports.shellypro4pm = shellypro4pm;
shellyHelperGen2.addSwitch(shellypro4pm, 0, true);
shellyHelperGen2.addSwitch(shellypro4pm, 1, true);
shellyHelperGen2.addSwitch(shellypro4pm, 2, true);
shellyHelperGen2.addSwitch(shellypro4pm, 3, true);
// Firmware bug: the switch output is reported outdated on the status topic
// right after a change (see issue #1640). Derive it from the NotifyStatus message instead.
shellyHotfixesGen2.fixMqttOutdatedSwitchStatus(shellypro4pm, 0);
shellyHotfixesGen2.fixMqttOutdatedSwitchStatus(shellypro4pm, 1);
shellyHotfixesGen2.fixMqttOutdatedSwitchStatus(shellypro4pm, 2);
shellyHotfixesGen2.fixMqttOutdatedSwitchStatus(shellypro4pm, 3);
shellyHelperGen2.addInput(shellypro4pm, 0);
shellyHelperGen2.addInput(shellypro4pm, 1);
shellyHelperGen2.addInput(shellypro4pm, 2);
shellyHelperGen2.addInput(shellypro4pm, 3);
//# sourceMappingURL=shellypro4pm.js.map