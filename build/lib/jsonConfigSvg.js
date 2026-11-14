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
// Build-time helper: convert the SVG files in /icons to base64 data URLs and store them in
// admin/jsonConfig.json. Run via `npm run update-svg` (which builds first, then runs the
// compiled build/lib/jsonConfigSvg.js). Paths are resolved relative to the repository root so
// the script works regardless of the current working directory.
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
// build/lib/jsonConfigSvg.js -> repository root is two levels up.
const root = path.join(__dirname, '..', '..');
const jsonConfigPath = path.join(root, 'admin', 'jsonConfig.json');
const iconsDir = path.join(root, 'icons');
const jsonConfig = JSON.parse(fs.readFileSync(jsonConfigPath, 'utf8'));
let changed = false;
/**
 * Recursively walks a jsonConfig (sub)tree and assigns the given base64 icon to every matching
 * node. A node matches when its key equals `name`, or when its key equals `_${name}` and it
 * already has an `icon` that differs from `base64icon`. The `config` object is mutated in place.
 *
 * @param config - the jsonConfig node (or the whole document) to walk and mutate
 * @param name - the config/icon key to match (the SVG file name without its `.svg` extension)
 * @param base64icon - the `data:image/svg+xml;base64,…` data URL to assign to matching nodes
 * @returns `true` if at least one node's icon was changed, otherwise `false`
 */
function updateConfig(config, name, base64icon) {
    let didChange = false;
    for (const key in config) {
        const child = config[key];
        if (typeof child === 'object' && child !== null) {
            const node = child;
            if (key === name || (key === `_${name}` && node.icon && node.icon !== base64icon)) {
                didChange = true;
                node.icon = base64icon;
            }
            didChange = updateConfig(node, name, base64icon) || didChange;
        }
    }
    return didChange;
}
for (const file of fs.readdirSync(iconsDir)) {
    if (file.endsWith('.svg')) {
        const svg = fs.readFileSync(path.join(iconsDir, file), 'utf8');
        const base64 = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
        if (updateConfig(jsonConfig, file.replace('.svg', ''), base64)) {
            changed = true;
        }
    }
}
if (changed) {
    fs.writeFileSync(jsonConfigPath, JSON.stringify(jsonConfig, null, 4));
}
//# sourceMappingURL=jsonConfigSvg.js.map