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
exports.shellyprodm2pm = void 0;
const shellyHelperGen2 = __importStar(require("../gen2-helper"));
/**
 * Shelly Pro Dimmer 2 PM / shellyprodm2pm
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyProDimmer2PM/
 */
const shellyprodm2pm = {};
exports.shellyprodm2pm = shellyprodm2pm;
shellyHelperGen2.addLight(shellyprodm2pm, 0, true);
shellyHelperGen2.addLight(shellyprodm2pm, 1, true);
shellyHelperGen2.addInput(shellyprodm2pm, 0);
shellyHelperGen2.addInput(shellyprodm2pm, 1);
shellyHelperGen2.addInput(shellyprodm2pm, 2);
shellyHelperGen2.addInput(shellyprodm2pm, 3);
//# sourceMappingURL=shellyprodm2pm.js.map