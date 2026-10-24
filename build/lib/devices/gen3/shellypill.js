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
exports.shellypill = void 0;
const shellyHelperGen2 = __importStar(require("../gen2-helper"));
/**
 * Shelly Pill / shellypill
 *
 * https://shelly-api-docs.shelly.cloud/gen3/Devices/Gen3/ShellyPill ??? not yet available ???
 *
 * NOTE: Due to missing documentation this implemenation is very heuristic currently
 */
const shellypill = {};
exports.shellypill = shellypill;
shellyHelperGen2.addInput(shellypill, 200);
shellyHelperGen2.addInput(shellypill, 201);
shellyHelperGen2.addInput(shellypill, 202);
// shellyHelperGen2.addAnalogInput(shellypill, 200);
// as ranges are device specific, lets add the translation locally
// shellypill[`Input100.Range`].common.states = {
//     0: '0 - 15 VDC',
//     1: '0 - 30 VDC',
// };
shellyHelperGen2.addSwitch(shellypill, 200, false);
shellyHelperGen2.addSwitch(shellypill, 201, false);
shellyHelperGen2.addSwitch(shellypill, 202, false);
shellyHelperGen2.addHumiditySensor(shellypill, 200);
shellyHelperGen2.addTemperatureSensor(shellypill, 200);
shellyHelperGen2.addTemperatureSensor(shellypill, 201);
shellyHelperGen2.addTemperatureSensor(shellypill, 202);
shellyHelperGen2.addTemperatureSensor(shellypill, 203);
shellyHelperGen2.addTemperatureSensor(shellypill, 204);
shellyHelperGen2.addVoltmeterSensor(shellypill, 200);
//# sourceMappingURL=shellypill.js.map