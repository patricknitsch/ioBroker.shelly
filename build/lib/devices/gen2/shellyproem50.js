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
exports.shellyproem50 = void 0;
const shellyHelperGen2 = __importStar(require("../gen2-helper"));
/**
 * Shelly Pro EM 2x50 / shellyproem50
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyProEM
 *
 * NOTE:
 * EM1Data is added twice for compatibility reasons. Shoudl be removed from EM1 with next major release.
 */
const shellyproem50 = {};
exports.shellyproem50 = shellyproem50;
shellyHelperGen2.addEM1(shellyproem50, 0, true);
shellyHelperGen2.addEM1Data(shellyproem50, 0);
shellyHelperGen2.addEM1(shellyproem50, 1, true);
shellyHelperGen2.addEM1Data(shellyproem50, 1);
shellyHelperGen2.addSwitch(shellyproem50, 0, false);
//# sourceMappingURL=shellyproem50.js.map