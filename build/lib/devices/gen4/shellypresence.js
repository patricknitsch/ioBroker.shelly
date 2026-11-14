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
exports.shellypresence = void 0;
const shellyHelperGen2 = __importStar(require("../gen2-helper"));
/**
 * Shelly Presence Gen 4 / shellypresence
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen4/ShellyPresenceG4/
 */
const shellypresence = {};
exports.shellypresence = shellypresence;
shellyHelperGen2.addIlluminanceSensor(shellypresence, 0);
shellyHelperGen2.addPresence(shellypresence);
shellyHelperGen2.addPresenceZone(shellypresence, 200);
shellyHelperGen2.addPresenceZone(shellypresence, 201);
shellyHelperGen2.addPresenceZone(shellypresence, 202);
shellyHelperGen2.addPresenceZone(shellypresence, 203);
shellyHelperGen2.addPresenceZone(shellypresence, 204);
shellyHelperGen2.addPresenceZone(shellypresence, 205);
shellyHelperGen2.addPresenceZone(shellypresence, 206);
shellyHelperGen2.addPresenceZone(shellypresence, 207);
shellyHelperGen2.addPresenceZone(shellypresence, 208);
shellyHelperGen2.addPresenceZone(shellypresence, 209);
//# sourceMappingURL=shellypresence.js.map