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
exports.neowatervalve = void 0;
const shellyHelperVirtual = __importStar(require("../virtual-helper"));
/**
 * SHELLY_??? / neowatervalve
 * Neo Smart Water Valve NAS-WV02W
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyX/XT1/SmartWaterValve
 * https://www.shelly.com/de/products/neo-smart-water-valve-nas-wv02w
 * https://www.shelly.com/blogs/documentation/neo-smart-water-valve
 *
 * Component log see https://github.com/iobroker-community-adapters/ioBroker.shelly/issues/1322#issuecomment-4405971916
 *
 */
const neowatervalve = {};
exports.neowatervalve = neowatervalve;
// boolean:200 - State (valve closed/open)
shellyHelperVirtual.addBoolean(neowatervalve, 200, 'crw', {});
// number:200 - Flow rate
shellyHelperVirtual.addNumber(neowatervalve, 200, 'cr', { unit: 'm3/min', min: 0, max: 0.075 });
// number:201 - Water pressure
shellyHelperVirtual.addNumber(neowatervalve, 201, 'cr', { unit: 'kPa', min: 0, max: 1350 });
// number:202 - Water temperature
shellyHelperVirtual.addNumber(neowatervalve, 202, 'cr', { unit: '°C', min: -25, max: 80 });
//# sourceMappingURL=neowatervalve.js.map