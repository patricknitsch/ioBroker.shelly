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
exports.shellycamera = void 0;
const cameraHelper = __importStar(require("../camera-helper"));
/**
 * Shelly Camera / shellycamera
 *
 * Wi-Fi camera with 1080p Full HD video and infrared night vision.
 * Product code: S1CM-0DXW00
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyCamera
 * https://kb.shelly.cloud/knowledge-base/shelly-camera
 */
const shellycamera = {};
exports.shellycamera = shellycamera;
cameraHelper.addCamera(shellycamera, 0);
cameraHelper.addCameraZone(shellycamera, 0);
cameraHelper.addStreamer(shellycamera, 0);
cameraHelper.addStorage(shellycamera, 0);
//# sourceMappingURL=shellycamera.js.map