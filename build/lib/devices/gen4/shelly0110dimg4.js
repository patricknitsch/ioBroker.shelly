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
exports.shelly0110dimg4 = void 0;
const shellyHelperGen2 = __importStar(require("../gen2-helper"));
/**
 * Shelly Dimmer 0/1-10V PM Gen 4 / shelly0110dimg4
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen4/ShellyDimmer0110VPMG4
 * https://kb.shelly.cloud/knowledge-base/shelly-dimmer-0-1-10v-pm-gen4
 */
const shelly0110dimg4 = {};
exports.shelly0110dimg4 = shelly0110dimg4;
shellyHelperGen2.addLight(shelly0110dimg4, 0, true);
shellyHelperGen2.addInput(shelly0110dimg4, 0);
shellyHelperGen2.addInput(shelly0110dimg4, 1);
//# sourceMappingURL=shelly0110dimg4.js.map