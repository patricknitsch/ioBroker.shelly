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
exports.shellyi4g4 = void 0;
const shellyHelperGen2 = __importStar(require("../gen2-helper"));
/**
 * Shelly I4 Gen4 / shellyi4g4
 * S4SN-0A24X
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen4/ShellyI4G4
 * https://kb.shelly.cloud/knowledge-base/shelly-i4-gen4
 */
const shellyi4g4 = {};
exports.shellyi4g4 = shellyi4g4;
shellyHelperGen2.addInput(shellyi4g4, 0);
shellyHelperGen2.addInput(shellyi4g4, 1);
shellyHelperGen2.addInput(shellyi4g4, 2);
shellyHelperGen2.addInput(shellyi4g4, 3);
shellyHelperGen2.addPlusAddon(shellyi4g4);
//# sourceMappingURL=shellyi4g4.js.map