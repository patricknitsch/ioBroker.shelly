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
exports.shellyplusuni = void 0;
const shellyHelperGen2 = __importStar(require("../gen2-helper"));
/**
 * Shelly Plus Uni / shellyplusuni
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen2/ShellyPlusUni
 */
const shellyplusuni = {};
exports.shellyplusuni = shellyplusuni;
shellyHelperGen2.addInput(shellyplusuni, 0);
shellyHelperGen2.addInput(shellyplusuni, 1);
shellyHelperGen2.addCounterInput(shellyplusuni, 2);
shellyHelperGen2.addAnalogInput(shellyplusuni, 100);
// as ranges are device specific, lets add the translation locally
shellyplusuni[`Input100.Range`].common.states = {
    0: '0 - 15 VDC',
    1: '0 - 30 VDC',
};
shellyHelperGen2.addSwitch(shellyplusuni, 0, false);
shellyHelperGen2.addSwitch(shellyplusuni, 1, false);
shellyHelperGen2.addHumiditySensor(shellyplusuni, 100);
shellyHelperGen2.addTemperatureSensor(shellyplusuni, 100);
shellyHelperGen2.addTemperatureSensor(shellyplusuni, 101);
shellyHelperGen2.addTemperatureSensor(shellyplusuni, 102);
shellyHelperGen2.addTemperatureSensor(shellyplusuni, 103);
shellyHelperGen2.addTemperatureSensor(shellyplusuni, 104);
shellyHelperGen2.addVoltmeterSensor(shellyplusuni, 100);
// as ranges are device specific, lets add the translation locally
shellyplusuni[`Voltmeter100.Range`].common.states = {
    0: '0 - 15 VDC',
    1: '0 - 30 VDC',
};
//# sourceMappingURL=shellyplusuni.js.map