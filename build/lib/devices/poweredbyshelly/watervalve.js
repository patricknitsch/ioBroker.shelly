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
exports.watervalve = void 0;
const shellyHelperGen2 = __importStar(require("../gen2-helper"));
const shellyHelperVirtual = __importStar(require("../virtual-helper"));
/**
 * SHELLY_??? / watervalve
 * Frankever Smart Water Valve FK-V02T
 *
 * https://shelly-api-docs.shelly.cloud/ - not available -
 * https://www.shelly.com/de/products/frankever-smart-water-valve-fk-v02t
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyX/XT1/SmartWaterValve
 *
 * Component log see https://github.com/iobroker-community-adapters/ioBroker.shelly/issues/1191#issuecomment-3796990498
 *
 */
const watervalve = {};
exports.watervalve = watervalve;
shellyHelperGen2.addTemperatureSensor(watervalve, 100);
shellyHelperVirtual.addBoolean(watervalve, 200, 'cr', {});
shellyHelperVirtual.addButton(watervalve, 200, 'cw', {});
shellyHelperVirtual.addButton(watervalve, 201, 'cw', {});
shellyHelperVirtual.addNumber(watervalve, 200, 'crw', { unit: '%', min: 0, max: 100 });
//# sourceMappingURL=watervalve.js.map