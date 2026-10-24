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
exports.st1820 = void 0;
// import * as shellyHelperGen2 from '../gen2-helper';
const shellyHelperVirtual = __importStar(require("../virtual-helper"));
/**
 * SHELLY_PBS_ST_ST1820 / st1820
 * Shelly LinkedGo smartes Heizungsthermostat
 *
 * https://shelly-api-docs.shelly.cloud/ - not available -
 * https://www.shelly.com/de/blogs/documentation/ - not available -
 *
 */
// NOTE: This is only a temporary basic implemention to aid gathering more information
const st1820 = {};
exports.st1820 = st1820;
shellyHelperVirtual.addBoolean(st1820, 200, 'crw', {}); // Anti-freeze
shellyHelperVirtual.addBoolean(st1820, 201, 'crw', {}); // Child lock
shellyHelperVirtual.addBoolean(st1820, 202, 'crw', {}); // Enable thermostat
shellyHelperVirtual.addNumber(st1820, 200, 'cr', { unit: '%', min: 0, max: 100 }); // Current humidity
shellyHelperVirtual.addNumber(st1820, 201, 'cr', { unit: 'C/F' }); // Current temperature
shellyHelperVirtual.addNumber(st1820, 202, 'crw', { unit: 'C/F' }); // Target temperature
//# sourceMappingURL=st1820.js.map