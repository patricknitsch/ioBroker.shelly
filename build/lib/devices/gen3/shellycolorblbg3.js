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
exports.shellycolorblbg3 = void 0;
const shellyHelperGen2 = __importStar(require("../gen2-helper"));
/**
 * Shelly Multicolor Bulb E27 Gen 3 / shellycolorblbg3 / S3BL-C010007AEU
 *
 * RGB + tunable white bulb (2700 K - 6500 K) with power metering, uses the RGBCCT component.
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyRGBCCTBulbG3
 * https://kb.shelly.cloud/knowledge-base/shelly-multicolor-bulb-e27-gen3
 *
 */
const shellycolorblbg3 = {};
exports.shellycolorblbg3 = shellycolorblbg3;
shellyHelperGen2.addRGBCCT(shellycolorblbg3, 0, true);
//# sourceMappingURL=shellycolorblbg3.js.map