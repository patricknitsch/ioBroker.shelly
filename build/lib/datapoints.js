"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pollTime = exports.deviceTypes = exports.deviceKnowledgeBase = exports.deviceIcons = exports.deviceGroupMap = exports.deviceGen = exports.devices = void 0;
exports.getAllDeviceDefinitions = getAllDeviceDefinitions;
exports.getDeviceByClass = getDeviceByClass;
exports.getDeviceClassByType = getDeviceClassByType;
exports.getDeviceGroupByClass = getDeviceGroupByClass;
exports.getDeviceGen = getDeviceGen;
exports.getDeviceIcon = getDeviceIcon;
exports.getDeviceTypeByClass = getDeviceTypeByClass;
exports.getKnowledgeBaseUrlByClass = getKnowledgeBaseUrlByClass;
exports.getPollTime = getPollTime;
// Defaults
const default_1 = require("./devices/default");
// Gen 1
const shelly1_1 = require("./devices/gen1/shelly1");
const shelly1l_1 = require("./devices/gen1/shelly1l");
const shelly1pm_1 = require("./devices/gen1/shelly1pm");
const shelly2led_1 = require("./devices/gen1/shelly2led");
const shelly4pro_1 = require("./devices/gen1/shelly4pro");
const shellybulb_1 = require("./devices/gen1/shellybulb");
const shellybulbduo_1 = require("./devices/gen1/shellybulbduo");
const shellybutton1_1 = require("./devices/gen1/shellybutton1");
const shellycolorbulb_1 = require("./devices/gen1/shellycolorbulb");
const shellydimmer_1 = require("./devices/gen1/shellydimmer");
const shellydimmer2_1 = require("./devices/gen1/shellydimmer2");
const shellydw_1 = require("./devices/gen1/shellydw");
const shellydw2_1 = require("./devices/gen1/shellydw2");
const shellyem_1 = require("./devices/gen1/shellyem");
const shellyem3_1 = require("./devices/gen1/shellyem3");
const shellyflood_1 = require("./devices/gen1/shellyflood");
const shellygas_1 = require("./devices/gen1/shellygas");
const shellyht_1 = require("./devices/gen1/shellyht");
const shellyix3_1 = require("./devices/gen1/shellyix3");
const shellymotion2_1 = require("./devices/gen1/shellymotion2");
const shellymotionsensor_1 = require("./devices/gen1/shellymotionsensor");
const shellyplug_1 = require("./devices/gen1/shellyplug");
const shellyplugs_1 = require("./devices/gen1/shellyplugs");
const shellyrgbw2_1 = require("./devices/gen1/shellyrgbw2");
const shellysense_1 = require("./devices/gen1/shellysense");
const shellysmoke_1 = require("./devices/gen1/shellysmoke");
const shellyswitch_1 = require("./devices/gen1/shellyswitch");
const shellyswitch25_1 = require("./devices/gen1/shellyswitch25");
const shellytrv_1 = require("./devices/gen1/shellytrv");
const shellyuni_1 = require("./devices/gen1/shellyuni");
const shellyvintage_1 = require("./devices/gen1/shellyvintage");
// Gen 2
const shelly1mini_1 = require("./devices/gen2/shelly1mini");
const shelly1pmmini_1 = require("./devices/gen2/shelly1pmmini");
const shellyblugw_1 = require("./devices/gen2/shellyblugw");
const shellyplus010v_1 = require("./devices/gen2/shellyplus010v");
const shellyplus1_1 = require("./devices/gen2/shellyplus1");
const shellyplus1pm_1 = require("./devices/gen2/shellyplus1pm");
const shellyplus2pm_1 = require("./devices/gen2/shellyplus2pm");
const shellyplusht_1 = require("./devices/gen2/shellyplusht");
const shellyplusi4_1 = require("./devices/gen2/shellyplusi4");
const shellyplusplugs_1 = require("./devices/gen2/shellyplusplugs");
const shellyplusrgbwpm_1 = require("./devices/gen2/shellyplusrgbwpm");
const shellyplussmoke_1 = require("./devices/gen2/shellyplussmoke");
const shellyplusuni_1 = require("./devices/gen2/shellyplusuni");
const shellypmmini_1 = require("./devices/gen2/shellypmmini");
const shellypro0110pm_1 = require("./devices/gen2/shellypro0110pm");
const shellypro1_1 = require("./devices/gen2/shellypro1");
const shellypro1pm_1 = require("./devices/gen2/shellypro1pm");
const shellypro2_1 = require("./devices/gen2/shellypro2");
const shellypro2cover_1 = require("./devices/gen2/shellypro2cover");
const shellypro2pm_1 = require("./devices/gen2/shellypro2pm");
const shellypro3_1 = require("./devices/gen2/shellypro3");
const shellypro3em_1 = require("./devices/gen2/shellypro3em");
const shellypro3em400_1 = require("./devices/gen2/shellypro3em400");
const shellypro3em63_1 = require("./devices/gen2/shellypro3em63");
const shellypro4pm_1 = require("./devices/gen2/shellypro4pm");
const shellyprodm1pm_1 = require("./devices/gen2/shellyprodm1pm");
const shellyprodm2pm_1 = require("./devices/gen2/shellyprodm2pm");
const shellyproem50_1 = require("./devices/gen2/shellyproem50");
const shellyprorgbwwpm_1 = require("./devices/gen2/shellyprorgbwwpm");
const shellywalldisplay_1 = require("./devices/gen2/shellywalldisplay");
// Gen 3
const shelly0110dimg3_1 = require("./devices/gen3/shelly0110dimg3");
const shelly1g3_1 = require("./devices/gen3/shelly1g3");
const shelly1lg3_1 = require("./devices/gen3/shelly1lg3");
const shelly1minig3_1 = require("./devices/gen3/shelly1minig3");
const shelly1pmg3_1 = require("./devices/gen3/shelly1pmg3");
const shelly1pmminig3_1 = require("./devices/gen3/shelly1pmminig3");
const shelly2lg3_1 = require("./devices/gen3/shelly2lg3");
const shelly2pmg3_1 = require("./devices/gen3/shelly2pmg3");
const shelly3em63g3_1 = require("./devices/gen3/shelly3em63g3");
const shellyazht_1 = require("./devices/gen3/shellyazht");
const shellyazplug_1 = require("./devices/gen3/shellyazplug");
const shellyblugwg3_1 = require("./devices/gen3/shellyblugwg3");
const shellycamera_1 = require("./devices/gen3/shellycamera");
const shellyddimmerg3_1 = require("./devices/gen3/shellyddimmerg3");
const shellydimmerg3_1 = require("./devices/gen3/shellydimmerg3");
const shellycolorblbg3_1 = require("./devices/gen3/shellycolorblbg3");
const shellyduobulbg3_1 = require("./devices/gen3/shellyduobulbg3");
const shellyemg3_1 = require("./devices/gen3/shellyemg3");
const shellyhtg3_1 = require("./devices/gen3/shellyhtg3");
const shellyi4g3_1 = require("./devices/gen3/shellyi4g3");
const shellyoutdoorsg3_1 = require("./devices/gen3/shellyoutdoorsg3");
const shellypill_1 = require("./devices/gen3/shellypill");
const shellyplugmg3_1 = require("./devices/gen3/shellyplugmg3");
const shellyplugpmg3_1 = require("./devices/gen3/shellyplugpmg3");
const shellyplugsg3_1 = require("./devices/gen3/shellyplugsg3");
const shellypmminig3_1 = require("./devices/gen3/shellypmminig3");
const shellyshutter_1 = require("./devices/gen3/shellyshutter");
// Gen 4
const shelly0110dimg4_1 = require("./devices/gen4/shelly0110dimg4");
const shelly1g4_1 = require("./devices/gen4/shelly1g4");
const shelly1lg4_1 = require("./devices/gen4/shelly1lg4");
const shelly1minig4_1 = require("./devices/gen4/shelly1minig4");
const shelly1pmg4_1 = require("./devices/gen4/shelly1pmg4");
const shelly1pmminig4_1 = require("./devices/gen4/shelly1pmminig4");
const shelly2lg4_1 = require("./devices/gen4/shelly2lg4");
const shelly2pmg4_1 = require("./devices/gen4/shelly2pmg4");
const shellydimmerg4_1 = require("./devices/gen4/shellydimmerg4");
const shellyemg4_1 = require("./devices/gen4/shellyemg4");
const shellyemminig4_1 = require("./devices/gen4/shellyemminig4");
const shellyfloodg4_1 = require("./devices/gen4/shellyfloodg4");
const shellyfloodsg4_1 = require("./devices/gen4/shellyfloodsg4");
const shellyi4g4_1 = require("./devices/gen4/shellyi4g4");
const shellypresence_1 = require("./devices/gen4/shellypresence");
const shellypstripg4_1 = require("./devices/gen4/shellypstripg4");
// Pwowered by Shelly
const cury_1 = require("./devices/poweredbyshelly/cury");
const hiluxds8_1 = require("./devices/poweredbyshelly/hiluxds8");
const irrigation_1 = require("./devices/poweredbyshelly/irrigation");
const neowatervalve_1 = require("./devices/poweredbyshelly/neowatervalve");
const ogemray25a_1 = require("./devices/poweredbyshelly/ogemray25a");
const st1820_1 = require("./devices/poweredbyshelly/st1820");
const topacportableevcharger_1 = require("./devices/poweredbyshelly/topacportableevcharger");
const watervalve_1 = require("./devices/poweredbyshelly/watervalve");
const devices = {
    // Gen 1
    shelly1: shelly1_1.shelly1,
    shelly1l: shelly1l_1.shelly1l,
    shelly1pm: shelly1pm_1.shelly1pm,
    shelly2led: shelly2led_1.shelly2led,
    shelly4pro: shelly4pro_1.shelly4pro,
    shellybulb: shellybulb_1.shellybulb,
    ShellyBulbDuo: shellybulbduo_1.shellybulbduo,
    shellybutton1: shellybutton1_1.shellybutton1,
    shellycolorbulb: shellycolorbulb_1.shellycolorbulb,
    shellydimmer: shellydimmer_1.shellydimmer,
    shellydimmer2: shellydimmer2_1.shellydimmer2,
    shellydw: shellydw_1.shellydw,
    shellydw2: shellydw2_1.shellydw2,
    shellyem: shellyem_1.shellyem,
    shellyem3: shellyem3_1.shellyem3,
    shellyflood: shellyflood_1.shellyflood,
    shellygas: shellygas_1.shellygas,
    shellyht: shellyht_1.shellyht,
    shellyix3: shellyix3_1.shellyix3,
    shellymotion2: shellymotion2_1.shellymotion2,
    shellymotionsensor: shellymotionsensor_1.shellymotionsensor,
    shellyplug: shellyplug_1.shellyplug,
    'shellyplug-s': shellyplugs_1.shellyplugs,
    shellyrgbw2: shellyrgbw2_1.shellyrgbw2,
    shellysense: shellysense_1.shellysense,
    shellysmoke: shellysmoke_1.shellysmoke,
    shellyswitch: shellyswitch_1.shellyswitch,
    shellyswitch25: shellyswitch25_1.shellyswitch25,
    shellytrv: shellytrv_1.shellytrv,
    shellyuni: shellyuni_1.shellyuni,
    ShellyVintage: shellyvintage_1.shellyvintage,
    // Gen 2
    shelly1mini: shelly1mini_1.shelly1mini,
    shelly1pmmini: shelly1pmmini_1.shelly1pmmini,
    shellyblugw: shellyblugw_1.shellyblugw,
    shellyplus010v: shellyplus010v_1.shellyplus010v,
    shellyplus1: shellyplus1_1.shellyplus1,
    shellyplus1pm: shellyplus1pm_1.shellyplus1pm,
    shellyplus2pm: shellyplus2pm_1.shellyplus2pm,
    shellyplusht: shellyplusht_1.shellyplusht,
    shellyplusi4: shellyplusi4_1.shellyplusi4,
    shellyplusplugs: shellyplusplugs_1.shellyplusplugs,
    shellyplusrgbwpm: shellyplusrgbwpm_1.shellyplusrgbwpm,
    shellyplussmoke: shellyplussmoke_1.shellyplussmoke,
    shellyplusuni: shellyplusuni_1.shellyplusuni,
    shellypmmini: shellypmmini_1.shellypmmini,
    shellypro0110pm: shellypro0110pm_1.shellypro0110pm,
    shellypro1: shellypro1_1.shellypro1,
    shellypro1pm: shellypro1pm_1.shellypro1pm,
    shellypro2: shellypro2_1.shellypro2,
    shellypro2cover: shellypro2cover_1.shellypro2cover,
    shellypro2pm: shellypro2pm_1.shellypro2pm,
    shellypro3: shellypro3_1.shellypro3,
    shellypro3em: shellypro3em_1.shellypro3em,
    shellypro3em400: shellypro3em400_1.shellypro3em400,
    shellypro3em63: shellypro3em63_1.shellypro3em63,
    shellypro4pm: shellypro4pm_1.shellypro4pm,
    shellyprodm1pm: shellyprodm1pm_1.shellyprodm1pm,
    shellyprodm2pm: shellyprodm2pm_1.shellyprodm2pm,
    shellyproem50: shellyproem50_1.shellyproem50,
    shellyprorgbwwpm: shellyprorgbwwpm_1.shellyprorgbwwpm,
    ShellyWallDisplay: shellywalldisplay_1.shellywalldisplay,
    // Gen 3
    shelly0110dimg3: shelly0110dimg3_1.shelly0110dimg3,
    shelly1g3: shelly1g3_1.shelly1g3,
    shelly1lg3: shelly1lg3_1.shelly1lg3,
    shelly1minig3: shelly1minig3_1.shelly1minig3,
    shelly1pmg3: shelly1pmg3_1.shelly1pmg3,
    shelly1pmminig3: shelly1pmminig3_1.shelly1pmminig3,
    shelly2lg3: shelly2lg3_1.shelly2lg3,
    shelly2pmg3: shelly2pmg3_1.shelly2pmg3,
    shelly3em63g3: shelly3em63g3_1.shelly3em63g3,
    shellyazht: shellyazht_1.shellyazht,
    shellyazplug: shellyazplug_1.shellyazplug,
    shellyblugwg3: shellyblugwg3_1.shellyblugwg3,
    shellycamera: shellycamera_1.shellycamera,
    shellyddimmerg3: shellyddimmerg3_1.shellyddimmerg3,
    shellydimmerg3: shellydimmerg3_1.shellydimmerg3,
    shellycolorblbg3: shellycolorblbg3_1.shellycolorblbg3,
    shellyduobulbg3: shellyduobulbg3_1.shellyduobulbg3,
    shellyemg3: shellyemg3_1.shellyemg3,
    shellyhtg3: shellyhtg3_1.shellyhtg3,
    shellyi4g3: shellyi4g3_1.shellyi4g3,
    shellyoutdoorsg3: shellyoutdoorsg3_1.shellyoutdoorsg3,
    shellypill: shellypill_1.shellypill,
    shellyplugmg3: shellyplugmg3_1.shellyplugmg3,
    shellyplugpmg3: shellyplugpmg3_1.shellyplugpmg3,
    shellyplugsg3: shellyplugsg3_1.shellyplugsg3,
    shellypmminig3: shellypmminig3_1.shellypmminig3,
    shellyshutter: shellyshutter_1.shellyshutter,
    // Gen 4
    shelly0110dimg4: shelly0110dimg4_1.shelly0110dimg4,
    shelly1g4: shelly1g4_1.shelly1g4,
    shelly1lg4: shelly1lg4_1.shelly1lg4,
    shelly1minig4: shelly1minig4_1.shelly1minig4,
    shelly1pmg4: shelly1pmg4_1.shelly1pmg4,
    shelly1pmminig4: shelly1pmminig4_1.shelly1pmminig4,
    shelly2lg4: shelly2lg4_1.shelly2lg4,
    shelly2pmg4: shelly2pmg4_1.shelly2pmg4,
    shellydimmerg4: shellydimmerg4_1.shellydimmerg4,
    shellyemg4: shellyemg4_1.shellyemg4,
    shellyemminig4: shellyemminig4_1.shellyemminig4,
    shellyfloodg4: shellyfloodg4_1.shellyfloodg4,
    shellyfloodsg4: shellyfloodsg4_1.shellyfloodsg4,
    shellyi4g4: shellyi4g4_1.shellyi4g4,
    shellypresence: shellypresence_1.shellypresence,
    shellypstripg4: shellypstripg4_1.shellypstripg4,
    // poweredbyshelly
    cury: cury_1.cury,
    hiluxds8: hiluxds8_1.hiluxds8,
    irrigation: irrigation_1.irrigation,
    neowatervalve: neowatervalve_1.neowatervalve,
    ogemray25a: ogemray25a_1.ogemray25a,
    st1820: st1820_1.st1820,
    topacportableevcharger: topacportableevcharger_1.topacportableevcharger,
    watervalve: watervalve_1.watervalve,
};
exports.devices = devices;
const deviceGen = {
    // Gen 1
    shelly1: 1,
    shelly1l: 1,
    shelly1pm: 1,
    shelly2led: 1,
    shelly4pro: 1,
    shellybulb: 1,
    ShellyBulbDuo: 1,
    shellybutton1: 1,
    shellycolorbulb: 1,
    shellydimmer: 1,
    shellydimmer2: 1,
    shellydw: 1,
    shellydw2: 1,
    shellyem: 1,
    shellyem3: 1,
    shellyflood: 1,
    shellygas: 1,
    shellyht: 1,
    shellyix3: 1,
    shellymotion2: 1,
    shellymotionsensor: 1,
    shellyplug: 1,
    'shellyplug-s': 1,
    shellyrgbw2: 1,
    shellysense: 1,
    shellysmoke: 1,
    shellyswitch: 1,
    shellyswitch25: 1,
    shellytrv: 1,
    shellyuni: 1,
    ShellyVintage: 1,
    // Gen 2
    shelly1mini: 2,
    shelly1pmmini: 2,
    shellyblugw: 2,
    shellyplus010v: 2,
    shellyplus1: 2,
    shellyplus1pm: 2,
    shellyplus2pm: 2,
    shellyplusht: 2,
    shellyplusi4: 2,
    shellyplusplugs: 2,
    shellyplusrgbwpm: 2,
    shellyplussmoke: 2,
    shellyplusuni: 2,
    shellypmmini: 2,
    shellypro0110pm: 2,
    shellypro1: 2,
    shellypro1pm: 2,
    shellypro2: 2,
    shellypro2cover: 2,
    shellypro2pm: 2,
    shellypro3: 2,
    shellypro3em: 2,
    shellypro3em400: 2,
    shellypro3em63: 2,
    shellypro4pm: 2,
    shellyprodm1pm: 2,
    shellyprodm2pm: 2,
    shellyproem50: 2,
    shellyprorgbwwpm: 2,
    ShellyWallDisplay: 2,
    // Gen 3
    shelly0110dimg3: 3,
    shelly1g3: 3,
    shelly1lg3: 3,
    shelly1minig3: 3,
    shelly1pmg3: 3,
    shelly1pmminig3: 3,
    shelly2lg3: 3,
    shelly2pmg3: 3,
    shelly3em63g3: 3,
    shellyazht: 3,
    shellyazplug: 3,
    shellyblugwg3: 3,
    shellycamera: 3,
    shellyddimmerg3: 3,
    shellydimmerg3: 3,
    shellycolorblbg3: 3,
    shellyduobulbg3: 3,
    shellyemg3: 3,
    shellyhtg3: 3,
    shellyi4g3: 3,
    shellyoutdoorsg3: 3,
    shellypill: 3,
    shellyplugmg3: 3,
    shellyplugpmg3: 3,
    shellyplugsg3: 3,
    shellypmminig3: 3,
    shellyshutter: 3,
    // Gen 4
    shelly0110dimg4: 4,
    shelly1g4: 4,
    shelly1lg4: 4,
    shelly1minig4: 4,
    shelly1pmg4: 4,
    shelly1pmminig4: 4,
    shelly2lg4: 4,
    shelly2pmg4: 4,
    shellydimmerg4: 4,
    shellyemg4: 4,
    shellyemminig4: 4,
    shellyfloodg4: 4,
    shellyfloodsg4: 4,
    shellyi4g4: 4,
    shellypresence: 4,
    shellypstripg4: 4,
    // Powered by Shelly
    cury: 3,
    hiluxds8: 3,
    irrigation: 3,
    neowatervalve: 3,
    ogemray25a: 3,
    st1820: 3,
    topacportableevcharger: 3,
    watervalve: 3,
};
exports.deviceGen = deviceGen;
/** Map device class to group key */
const deviceGroupMap = {
    // Gen 1
    shelly1: 'relay',
    shelly1l: 'relay',
    shelly1pm: 'relay',
    shelly2led: 'light',
    shelly4pro: 'relay',
    shellybulb: 'light',
    ShellyBulbDuo: 'light',
    shellybutton1: 'input',
    shellycolorbulb: 'light',
    shellydimmer: 'dimmer',
    shellydimmer2: 'dimmer',
    shellydw: 'sensor',
    shellydw2: 'sensor',
    shellyem: 'meter',
    shellyem3: 'meter',
    shellyflood: 'sensor',
    shellygas: 'sensor',
    shellyht: 'sensor',
    shellyix3: 'input',
    shellymotion2: 'sensor',
    shellymotionsensor: 'sensor',
    shellyplug: 'plug',
    'shellyplug-s': 'plug',
    shellyrgbw2: 'light',
    shellysense: 'sensor',
    shellysmoke: 'sensor',
    shellyswitch: 'relay',
    shellyswitch25: 'relay',
    shellytrv: 'climate',
    shellyuni: 'gateway',
    ShellyVintage: 'light',
    // Gen 2
    shelly1mini: 'relay',
    shelly1pmmini: 'relay',
    shellyblugw: 'gateway',
    shellyplus010v: 'dimmer',
    shellyplus1: 'relay',
    shellyplus1pm: 'relay',
    shellyplus2pm: 'relay',
    shellyplusht: 'sensor',
    shellyplusi4: 'input',
    shellyplusplugs: 'plug',
    shellyplusrgbwpm: 'light',
    shellyplussmoke: 'sensor',
    shellyplusuni: 'gateway',
    shellypmmini: 'meter',
    shellypro0110pm: 'dimmer',
    shellypro1: 'relay',
    shellypro1pm: 'relay',
    shellypro2: 'relay',
    shellypro2cover: 'cover',
    shellypro2pm: 'relay',
    shellypro3: 'relay',
    shellypro3em: 'meter',
    shellypro3em400: 'meter',
    shellypro3em63: 'meter',
    shellypro4pm: 'relay',
    shellyprodm1pm: 'dimmer',
    shellyprodm2pm: 'dimmer',
    shellyproem50: 'meter',
    shellyprorgbwwpm: 'light',
    ShellyWallDisplay: 'gateway',
    // Gen 3
    shelly0110dimg3: 'dimmer',
    shelly1g3: 'relay',
    shelly1lg3: 'relay',
    shelly1minig3: 'relay',
    shelly1pmg3: 'relay',
    shelly1pmminig3: 'relay',
    shelly2lg3: 'relay',
    shelly2pmg3: 'relay',
    shelly3em63g3: 'meter',
    shellyazht: 'sensor',
    shellyazplug: 'plug',
    shellyblugwg3: 'gateway',
    shellycamera: 'camera',
    shellyddimmerg3: 'dimmer',
    shellydimmerg3: 'dimmer',
    shellycolorblbg3: 'light',
    shellyduobulbg3: 'light',
    shellyemg3: 'meter',
    shellyhtg3: 'sensor',
    shellyi4g3: 'input',
    shellyoutdoorsg3: 'sensor',
    shellypill: 'sensor',
    shellyplugmg3: 'plug',
    shellyplugpmg3: 'plug',
    shellyplugsg3: 'plug',
    shellypmminig3: 'meter',
    shellyshutter: 'cover',
    // Gen 4
    shelly0110dimg4: 'dimmer',
    shelly1g4: 'relay',
    shelly1lg4: 'relay',
    shelly1minig4: 'relay',
    shelly1pmg4: 'relay',
    shelly1pmminig4: 'relay',
    shelly2lg4: 'relay',
    shelly2pmg4: 'relay',
    shellydimmerg4: 'dimmer',
    shellyemg4: 'meter',
    shellyemminig4: 'meter',
    shellyfloodg4: 'sensor',
    shellyfloodsg4: 'sensor',
    shellyi4g4: 'input',
    shellypresence: 'sensor',
    shellypstripg4: 'light',
    // Powered by Shelly
    cury: 'other',
    hiluxds8: 'light',
    irrigation: 'other',
    neowatervalve: 'other',
    ogemray25a: 'other',
    st1820: 'other',
    topacportableevcharger: 'other',
    watervalve: 'other',
};
exports.deviceGroupMap = deviceGroupMap;
const deviceIcons = {
    // Gen 1 - product images where available, fallback to similar device
    shelly1: 'shelly1',
    shelly1l: 'shelly1l',
    shelly1pm: 'shelly1pm',
    shelly2led: 'shelly2led',
    shelly4pro: 'shelly4pro',
    shellybulb: 'shellybulb',
    ShellyBulbDuo: 'shellybulbduo',
    shellybutton1: 'shellybutton1',
    shellycolorbulb: 'shellycolorbulb',
    shellydimmer: 'shellydimmer',
    shellydimmer2: 'shellydimmer2',
    shellydw: 'shellydw',
    shellydw2: 'shellydw2',
    shellyem: 'shellyem',
    shellyem3: 'shellyem3',
    shellyflood: 'shellyflood',
    shellygas: 'shellygas',
    shellyht: 'shellyht',
    shellyix3: 'shellyix3',
    shellymotion2: 'shellymotion2',
    shellymotionsensor: 'shellymotionsensor',
    shellyplug: 'shellyplug',
    'shellyplug-s': 'shellyplugs',
    shellyrgbw2: 'shellyrgbw2',
    shellysense: 'shellysense',
    shellysmoke: 'shellysmoke',
    shellyswitch: 'shellyswitch',
    shellyswitch25: 'shellyswitch25',
    shellytrv: 'shellytrv',
    shellyuni: 'shellyuni',
    ShellyVintage: 'shellyvintage',
    // Gen 2
    shelly1mini: 'shelly1mini',
    shelly1pmmini: 'shelly1pmmini',
    shellyblugw: 'shellyblugw',
    shellyplus010v: 'shellyplus010v',
    shellyplus1: 'shellyplus1',
    shellyplus1pm: 'shellyplus1pm',
    shellyplus2pm: 'shellyplus2pm',
    shellyplusht: 'shellyplusht',
    shellyplusi4: 'shellyplusi4',
    shellyplusplugs: 'shellyplusplugs',
    shellyplusrgbwpm: 'shellyplusrgbwpm',
    shellyplussmoke: 'shellyplussmoke',
    shellyplusuni: 'shellyplusuni',
    shellypmmini: 'shellypmmini',
    shellypro0110pm: 'shellypro0110pm',
    shellypro1: 'shellypro1',
    shellypro1pm: 'shellypro1pm',
    shellypro2: 'shellypro2',
    shellypro2cover: 'shellypro2cover',
    shellypro2pm: 'shellypro2pm',
    shellypro3: 'shellypro3',
    shellypro3em: 'shellypro3em',
    shellypro3em400: 'shellypro3em400',
    shellypro3em63: 'shellypro3em63',
    shellypro4pm: 'shellypro4pm',
    shellyprodm1pm: 'shellyprodm1pm',
    shellyprodm2pm: 'shellyprodm2pm',
    shellyproem50: 'shellyproem50',
    shellyprorgbwwpm: 'shellyprorgbwwpm',
    ShellyWallDisplay: 'shellywalldisplay',
    // Gen 3
    shelly0110dimg3: 'shelly0110dimg3',
    shelly1g3: 'shelly1g3',
    shelly1lg3: 'shelly1lg3',
    shelly1minig3: 'shelly1minig3',
    shelly1pmg3: 'shelly1pmg3',
    shelly1pmminig3: 'shelly1pmminig3',
    shelly2lg3: 'shelly2lg3',
    shelly2pmg3: 'shelly2pmg3',
    shelly3em63g3: 'shelly3em63g3',
    shellyazht: 'shellyazht',
    shellyazplug: 'shellyazplug',
    shellyblugwg3: 'shellyblugwg3',
    shellycamera: 'shellycamera',
    shellyddimmerg3: 'shellyddimmerg3',
    shellydimmerg3: 'shellydimmerg3',
    shellycolorblbg3: 'shellycolorblbg3',
    shellyduobulbg3: 'shellyduobulbg3',
    shellyemg3: 'shellyemg3',
    shellyhtg3: 'shellyhtg3',
    shellyi4g3: 'shellyi4g3',
    shellyoutdoorsg3: 'shellyoutdoorsg3',
    shellypill: 'shellypill',
    shellyplugmg3: 'shellyplugmg3',
    shellyplugpmg3: 'shellyplugpmg3',
    shellyplugsg3: 'shellyplugsg3',
    shellypmminig3: 'shellypmminig3',
    shellyshutter: 'shellyshutter',
    // Gen 4
    shelly0110dimg4: 'shelly0110dimg4',
    shelly1g4: 'shelly1g4',
    shelly1lg4: 'shelly1lg4',
    shelly1minig4: 'shelly1minig4',
    shelly1pmg4: 'shelly1pmg4',
    shelly1pmminig4: 'shelly1pmminig4',
    shelly2lg4: 'shelly2lg4',
    shelly2pmg4: 'shelly2pmg4',
    shellydimmerg4: 'shellydimmerg4',
    shellyemg4: 'shellyemg4',
    shellyemminig4: 'shellyemminig4',
    shellyfloodg4: 'shellyfloodg4',
    shellyfloodsg4: 'shellyfloodsg4',
    shellyi4g4: 'shellyi4g4',
    shellypresence: 'shellypresence',
    shellypstripg4: 'shellypstripg4',
    // Powered by Shelly
    cury: 'cury',
    hiluxds8: 'hiluxds8',
    irrigation: 'irrigation',
    neowatervalve: 'neowatervalve',
    ogemray25a: 'ogemray25a',
    st1820: 'st1820',
    topacportableevcharger: 'topacportableevcharger',
    watervalve: 'watervalve',
};
exports.deviceIcons = deviceIcons;
// https://shelly.cloud/knowledge-base/devices/
const deviceKnowledgeBase = {
    // Gen 1
    shelly1: 'https://kb.shelly.cloud/knowledge-base/shelly-1',
    shelly1l: 'https://kb.shelly.cloud/knowledge-base/shelly-1l',
    shelly1pm: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-1pm',
    shelly2led: undefined,
    shelly4pro: 'https://kb.shelly.cloud/knowledge-base/4shelly-pro-4pm',
    shellybulb: undefined,
    ShellyBulbDuo: 'https://kb.shelly.cloud/knowledge-base/shelly-bulb-duo-rgbw',
    shellybutton1: 'https://kb.shelly.cloud/knowledge-base/shelly-button-1',
    shellycolorbulb: undefined,
    shellydimmer: undefined,
    shellydimmer2: 'https://kb.shelly.cloud/knowledge-base/shelly-dimmer-2',
    shellydw: undefined,
    shellydw2: 'https://kb.shelly.cloud/knowledge-base/shelly-door-window-2',
    shellyem: 'https://kb.shelly.cloud/knowledge-base/shelly-em',
    shellyem3: 'https://kb.shelly.cloud/knowledge-base/shelly-3em',
    shellyflood: 'https://kb.shelly.cloud/knowledge-base/shelly-flood',
    shellygas: 'https://kb.shelly.cloud/knowledge-base/shelly-gas',
    shellyht: 'https://kb.shelly.cloud/knowledge-base/shelly-h-t',
    shellyix3: 'https://kb.shelly.cloud/knowledge-base/shelly-i3',
    shellymotion2: 'https://kb.shelly.cloud/knowledge-base/shelly-motion-2',
    shellymotionsensor: 'https://kb.shelly.cloud/knowledge-base/shelly-motion',
    shellyplug: 'https://kb.shelly.cloud/knowledge-base/shelly-plug',
    'shellyplug-s': 'https://kb.shelly.cloud/knowledge-base/shelly-plug-s',
    shellyrgbw2: 'https://kb.shelly.cloud/knowledge-base/shelly-rgbw2',
    shellysense: undefined,
    shellysmoke: undefined,
    shellyswitch: undefined,
    shellyswitch25: 'https://kb.shelly.cloud/knowledge-base/shelly-2-5',
    shellytrv: 'https://kb.shelly.cloud/knowledge-base/shelly-trv',
    shellyuni: 'https://kb.shelly.cloud/knowledge-base/shelly-uni',
    ShellyVintage: 'https://kb.shelly.cloud/knowledge-base/shelly-vintage',
    // Gen 2
    shelly1mini: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-1-mini',
    shelly1pmmini: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-1pm-mini',
    shellyblugw: 'https://kb.shelly.cloud/knowledge-base/shellyblu-gateway',
    shellyplus010v: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-0-10v-dimmer',
    shellyplus1: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-1',
    shellyplus1pm: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-1pm',
    shellyplus2pm: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-2pm',
    shellyplusht: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-h-t',
    shellyplusi4: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-i4',
    shellyplusplugs: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-plug-s',
    shellyplusrgbwpm: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-rgbw-pm',
    shellyplussmoke: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-smoke',
    shellyplusuni: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-uni',
    shellypmmini: 'https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlusPMMini',
    shellypro0110pm: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-dimmer-0-1-10v-pm',
    shellypro1: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-1',
    shellypro1pm: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-1pm',
    shellypro2: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-2',
    shellypro2cover: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-dual-cover-pm',
    shellypro2pm: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-2pm',
    shellypro3: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-3-v1',
    shellypro3em: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-3em',
    shellypro3em400: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-3em-3ct400',
    shellypro3em63: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-3em-3ct63',
    shellypro4pm: 'https://kb.shelly.cloud/knowledge-base/4shelly-pro-4pm',
    shellyprodm1pm: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-dimmer-1pm',
    shellyprodm2pm: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-dimmer-2pm',
    shellyproem50: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-em-50',
    shellyprorgbwwpm: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-rgbww-pm',
    ShellyWallDisplay: 'https://kb.shelly.cloud/knowledge-base/shelly-wall-display',
    // Gen 3
    shelly0110dimg3: 'https://kb.shelly.cloud/knowledge-base/shelly-dimmer-0-1-10v-pm-gen3',
    shelly1g3: 'https://kb.shelly.cloud/knowledge-base/shelly-1-gen3',
    shelly1lg3: 'https://kb.shelly.cloud/knowledge-base/shelly-1l-gen3',
    shelly1minig3: 'https://kb.shelly.cloud/knowledge-base/shelly-1-mini-gen3',
    shelly1pmg3: 'https://kb.shelly.cloud/knowledge-base/shelly-1pm-gen3',
    shelly1pmminig3: 'https://kb.shelly.cloud/knowledge-base/shelly-1pm-mini-gen3',
    shelly2lg3: 'https://kb.shelly.cloud/knowledge-base/shelly-2l-gen3',
    shelly2pmg3: 'https://kb.shelly.cloud/knowledge-base/shelly-2pm-gen3',
    shelly3em63g3: 'https://kb.shelly.cloud/knowledge-base/shelly-3em-63-gen3',
    shellyazht: 'https://kb.shelly.cloud/knowledge-base/shelly-az-h-t',
    shellyazplug: 'https://kb.shelly.cloud/knowledge-base/shelly-az-plug',
    shellyblugwg3: 'https://kb.shelly.cloud/knowledge-base/shelly-blu-gateway-gen3',
    shellycamera: 'https://kb.shelly.cloud/knowledge-base/shelly-camera',
    shellyddimmerg3: 'https://kb.shelly.cloud/knowledge-base/shelly-dali-dimmer-gen3',
    shellydimmerg3: 'https://kb.shelly.cloud/knowledge-base/shelly-dimmer-gen3',
    shellycolorblbg3: 'https://kb.shelly.cloud/knowledge-base/shelly-multicolor-bulb-e27-gen3',
    shellyduobulbg3: 'https://kb.shelly.cloud/knowledge-base/shelly-duo-bulb-e27-gen3',
    shellyemg3: 'https://kb.shelly.cloud/knowledge-base/shelly-em-gen3',
    shellyhtg3: 'https://kb.shelly.cloud/knowledge-base/shelly-h-t-gen3',
    shellyi4g3: 'https://kb.shelly.cloud/knowledge-base/shelly-i4-gen3',
    shellyoutdoorsg3: 'https://kb.shelly.cloud/knowledge-base/outdoor-plug-s-gen3',
    shellypill: 'https://kb.shelly.cloud/knowledge-base/the-pill-by-shelly',
    shellyplugmg3: 'https://kb.shelly.cloud/knowledge-base/shelly-plug-m-gen3',
    shellyplugpmg3: 'https://kb.shelly.cloud/knowledge-base/shelly-plug-pm-gen3',
    shellyplugsg3: 'https://kb.shelly.cloud/knowledge-base/shelly-plug-s-mtr-gen3',
    shellypmminig3: 'https://kb.shelly.cloud/knowledge-base/shelly-pm-mini-gen3',
    shellyshutter: 'https://kb.shelly.cloud/knowledge-base/shelly-shutter',
    // Gen 4
    shelly0110dimg4: 'https://kb.shelly.cloud/knowledge-base/shelly-dimmer-0-1-10v-pm-gen4',
    shelly1g4: 'https://kb.shelly.cloud/knowledge-base/shelly-1-gen4',
    shelly1lg4: 'https://kb.shelly.cloud/knowledge-base/shelly-1l-gen4',
    shelly1minig4: 'https://kb.shelly.cloud/knowledge-base/shelly-1-mini-gen4',
    shelly1pmg4: 'https://kb.shelly.cloud/knowledge-base/shelly-1pm-gen4',
    shelly1pmminig4: 'https://kb.shelly.cloud/knowledge-base/shelly-1pm-mini-gen4',
    shelly2lg4: 'https://kb.shelly.cloud/knowledge-base/shelly-2l-gen4',
    shelly2pmg4: 'https://kb.shelly.cloud/knowledge-base/shelly-2pm-gen4',
    shellydimmerg4: 'https://kb.shelly.cloud/knowledge-base/shelly-dimmer-gen4',
    shellyemg4: 'https://kb.shelly.cloud/knowledge-base/shelly-em-gen4',
    shellyemminig4: 'https://kb.shelly.cloud/knowledge-base/shelly-em-mini-gen4',
    shellyfloodg4: 'https://kb.shelly.cloud/knowledge-base/shelly-flood-gen4',
    shellyfloodsg4: 'https://kb.shelly.cloud/knowledge-base/shelly-flood-s-gen4',
    shellyi4g4: 'https://kb.shelly.cloud/knowledge-base/shelly-i4-gen4',
    shellypresence: 'https://kb.shelly.cloud/knowledge-base/shelly-presence-gen4',
    shellypstripg4: 'https://kb.shelly.cloud/knowledge-base/shelly-power-strip-gen4',
    // Powered by Shelly
    cury: 'https://kb.shelly.cloud/knowledge-base/cury',
    hiluxds8: undefined, // no knowledgebase entry exists
    irrigation: undefined, // no knowledgebase entry exists
    neowatervalve: 'https://www.shelly.com/blogs/documentation/neo-smart-water-valve',
    ogemray25a: 'https://www.shelly.com/de/products/ogemray-25a-smart-relay',
    st1820: undefined, // no knowledgebase entry exists,
    topacportableevcharger: undefined, // no knowledgebase entry exists,
    watervalve: undefined, // no knowledgebase entry exists,
};
exports.deviceKnowledgeBase = deviceKnowledgeBase;
const deviceTypes = {
    // '<deviceClass>': ['<deviceType>', '<deviceType>'],
    // Gen 1
    shelly1: ['SHSW-1'],
    shelly1l: ['SHSW-L'],
    shelly1pm: ['SHSW-PM'],
    shelly2led: ['SH2LED'],
    shelly4pro: ['SHSW-44'],
    shellybulb: ['SHBLB-1'],
    ShellyBulbDuo: ['SHBDUO-1'],
    shellybutton1: ['SHBTN-1', 'SHBTN-2'],
    shellycolorbulb: ['SHCB-1'],
    shellydimmer: ['SHDM-1'],
    shellydimmer2: ['SHDM-2'],
    shellydw: ['SHDW-1'],
    shellydw2: ['SHDW-2'],
    shellyem: ['SHEM'],
    shellyem3: ['SHEM-3'],
    shellyflood: ['SHWT-1'],
    shellygas: ['SHGS-1'],
    shellyht: ['SHHT-1'],
    shellyix3: ['SHIX3-1'],
    shellymotion2: ['SHMOS-02'],
    shellymotionsensor: ['SHMOS-01'],
    shellyplug: ['SHPLG-1'],
    'shellyplug-s': ['SHPLG-S', 'SHPLG2-1'],
    shellyrgbw2: ['SHRGBW2'],
    shellysense: ['SHSEN-1'],
    shellysmoke: ['SHSM-01'],
    shellyswitch: ['SHSW-21'],
    shellyswitch25: ['SHSW-25'],
    shellytrv: ['SHTRV-01'],
    shellyuni: ['SHUNI-1'],
    ShellyVintage: ['SHVIN-1'],
    // Gen 2
    shelly1mini: ['shelly1mini'],
    shelly1pmmini: ['shelly1pmmini'],
    shellyblugw: ['shellyblugw'],
    shellyplus010v: ['shellyplus010v'],
    shellyplus1: ['shellyplus1'],
    shellyplus1pm: ['shellyplus1pm'],
    shellyplus2pm: ['shellyplus2pm'],
    shellyplusht: ['shellyplusht'],
    shellyplusi4: ['shellyplusi4'],
    shellyplusplugs: ['shellyplusplugs'],
    shellyplusrgbwpm: ['shellyplusrgbwpm'],
    shellyplussmoke: ['shellyplussmoke'],
    shellyplusuni: ['shellyplusuni'],
    shellypmmini: ['shellypmmini'],
    shellypro0110pm: ['shellypro0110pm'],
    shellypro1: ['shellypro1'],
    shellypro1pm: ['shellypro1pm'],
    shellypro2: ['shellypro2'],
    shellypro2cover: ['shellypro2cover'],
    shellypro2pm: ['shellypro2pm'],
    shellypro3: ['shellypro3'],
    shellypro3em: ['shellypro3em'],
    shellypro3em400: ['shellypro3em400'],
    shellypro3em63: ['shellypro3em63'],
    shellypro4pm: ['shellypro4pm'],
    shellyprodm1pm: ['shellyprodm1pm'],
    shellyprodm2pm: ['shellyprodm2pm'],
    shellyproem50: ['shellyproem50'],
    shellyprorgbwwpm: ['shellyprorgbwwpm'],
    ShellyWallDisplay: ['ShellyWallDisplay'],
    // Gen 3
    shelly0110dimg3: ['shelly0110dimg3'],
    shelly1g3: ['shelly1g3'],
    shelly1lg3: ['shelly1lg3'],
    shelly1minig3: ['shelly1minig3'],
    shelly1pmg3: ['shelly1pmg3'],
    shelly1pmminig3: ['shelly1pmminig3'],
    shelly2lg3: ['shelly2lg3'],
    shelly2pmg3: ['shelly2pmg3'],
    shelly3em63g3: ['shelly3em63g3'],
    shellyazht: ['shellyazht'],
    shellyazplug: ['shellyazplug'],
    shellyblugwg3: ['shellyblugwg3'],
    shellycamera: ['shellycamera'],
    shellyddimmerg3: ['shellyddimmerg3'],
    shellydimmerg3: ['shellydimmerg3'],
    shellycolorblbg3: ['shellycolorblbg3'],
    shellyduobulbg3: ['shellyduobulbg3'],
    shellyemg3: ['shellyemg3'],
    shellyhtg3: ['shellyhtg3'],
    shellyi4g3: ['shellyi4g3'],
    shellyoutdoorsg3: ['shellyoutdoorsg3'],
    shellypill: ['shellypill'],
    shellyplugmg3: ['shellyplugmg3'],
    shellyplugpmg3: ['shellyplugpmg3'],
    shellyplugsg3: ['shellyplugsg3'],
    shellypmminig3: ['shellypmminig3'],
    shellyshutter: ['shellyshutter'],
    // Gen 4
    shelly0110dimg4: ['shelly0110dimg4'],
    shelly1g4: ['shelly1g4'],
    shelly1lg4: ['shelly1lg4'],
    shelly1minig4: ['shelly1minig4'],
    shelly1pmg4: ['shelly1pmg4'],
    shelly1pmminig4: ['shelly1pmminig4'],
    shelly2lg4: ['shelly2lg4'],
    shelly2pmg4: ['shelly2pmg4'],
    shellydimmerg4: ['shellydimmerg4'],
    shellyemg4: ['shellyemg4'],
    shellyemminig4: ['shellyemminig4'],
    shellyfloodg4: ['shellyfloodg4'],
    shellyfloodsg4: ['shellyfloodsg4'],
    shellyi4g4: ['shellyi4g4'],
    shellypresence: ['shellypresence'],
    shellypstripg4: ['shellypstripg4'],
    // Powered by Shelly
    cury: ['cury'],
    hiluxds8: ['hiluxds8'],
    irrigation: ['irrigation'],
    neowatervalve: ['neowatervalve'],
    ogemray25a: ['ogemray25a'],
    st1820: ['st1820'],
    topacportableevcharger: ['topacportableevcharger'],
    watervalve: ['watervalve'],
};
exports.deviceTypes = deviceTypes;
/**
 * Poll time of battery-powered devices (sec)
 */
const pollTime = {
    // Gen 1
    shellybutton1: 3600,
    shellydw: 3600,
    shellydw2: 3600,
    shellyflood: 3600,
    shellygas: 3600,
    shellyht: 3600,
    shellymotion2: 3600,
    shellymotionsensor: 3600,
    shellysense: 3600,
    shellysmoke: 3600,
    // Gen 2
    shellyplusht: 3600,
    shellyplussmoke: 3600,
    // Gen 3
    shellyazht: 3600,
    shellyhtg3: 3600,
    // Gen 4
    shellyfloodg4: 3600,
    shellyfloodsg4: 3600,
};
exports.pollTime = pollTime;
/**
 * Copy an object
 *
 * @param obj
 */
function clone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    const source = obj;
    if ('isActiveClone' in source) {
        return obj;
    }
    let temp;
    if (source instanceof Date) {
        temp = new source.constructor(); // or new Date(obj);
    }
    else {
        temp = source.constructor();
    }
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            source.isActiveClone = null;
            temp[key] = clone(source[key]);
            delete source.isActiveClone;
        }
    }
    return temp;
}
function deleteNoDisplay(device, protocol, mode, firmwareVersion) {
    if (protocol === 'coap' || protocol === 'mqtt') {
        for (const key in device) {
            const dev = device[key];
            if (dev?.[protocol]?.no_display) {
                delete device[key];
                continue;
            }
            // Device Mode - just filter if mode is configured!
            if (mode && dev?.device_mode) {
                if (dev.device_mode !== mode) {
                    delete device[key];
                    continue;
                }
            }
            // Firmware version minimum - remove state if firmware version is unknown or too old
            if (dev?.firmware_version_min) {
                if (!firmwareVersion || !isSemverAtLeast(firmwareVersion, dev.firmware_version_min)) {
                    delete device[key];
                }
            }
        }
    }
    return device;
}
/**
 * Compare two semver strings. Returns true if a >= b.
 *
 * @param a - semver string like '2.0.0'
 * @param b - semver string like '2.0.0'
 */
function isSemverAtLeast(a, b) {
    const parse = (v) => v.split('.').map(Number);
    const [aMaj, aMin, aPat] = parse(a);
    const [bMaj, bMin, bPat] = parse(b);
    if (aMaj !== bMaj) {
        return aMaj > bMaj;
    }
    if (aMin !== bMin) {
        return aMin > bMin;
    }
    return aPat >= bPat;
}
function getDeviceByClass(deviceClass, protocol, mode, firmwareVersion) {
    if (!devices[deviceClass]) {
        return;
    }
    let device;
    switch (getDeviceGen(deviceClass)) {
        case 4:
            device = clone(Object.assign(Object.assign({}, default_1.defaultsgen4), devices[deviceClass]));
            break;
        case 3:
            device = clone(Object.assign(Object.assign({}, default_1.defaultsgen3), devices[deviceClass]));
            break;
        case 2:
            device = clone(Object.assign(Object.assign({}, default_1.defaultsgen2), devices[deviceClass]));
            break;
        default:
            device = clone(Object.assign(Object.assign({}, default_1.defaultsgen1), devices[deviceClass]));
    }
    device = deleteNoDisplay(device, protocol, mode, firmwareVersion);
    return device;
}
function getDeviceClassByType(deviceType) {
    return Object.keys(deviceTypes).find(key => deviceType !== undefined && deviceTypes[key].includes(deviceType));
}
function getDeviceIcon(deviceClass) {
    return deviceIcons?.[deviceClass] || 'relay';
}
function getDeviceGen(deviceClass) {
    return deviceGen?.[deviceClass] ?? 1;
}
function getDeviceGroupByClass(deviceClass) {
    return deviceGroupMap[deviceClass] || 'other';
}
function getDeviceTypeByClass(deviceClass) {
    return deviceTypes[deviceClass] ? deviceTypes[deviceClass][0] : undefined;
}
function getKnowledgeBaseUrlByClass(deviceClass) {
    return deviceKnowledgeBase?.[deviceClass];
}
function getPollTime(deviceClass) {
    return pollTime?.[deviceClass];
}
function getAllDeviceDefinitions() {
    return Object.entries(devices).reduce((o, [deviceClass, device]) => {
        switch (getDeviceGen(deviceClass)) {
            case 4:
                o[deviceClass] = clone(Object.assign(Object.assign({}, default_1.defaultsgen4), device));
                break;
            case 3:
                o[deviceClass] = clone(Object.assign(Object.assign({}, default_1.defaultsgen3), device));
                break;
            case 2:
                o[deviceClass] = clone(Object.assign(Object.assign({}, default_1.defaultsgen2), device));
                break;
            default:
                o[deviceClass] = clone(Object.assign(Object.assign({}, default_1.defaultsgen1), device));
        }
        return o;
    }, {});
}
//# sourceMappingURL=datapoints.js.map