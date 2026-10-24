"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const adapter_core_1 = require("@iobroker/adapter-core");
class ObjectHelper {
    adapter;
    stateChangeTrigger = {};
    objectQueue = [];
    existingStates = {};
    adapterObjects = {};
    constructor(adapterInstance) {
        this.adapter = adapterInstance;
    }
    setOrUpdateObject(id, obj, obtainCustomFields, value, stateChangeCallback, createNow = true, callback) {
        // The caller passes `common` by reference from the device definition (see base.ts, mqtt.ts,
        // coap.ts). Work on a copy, so neither the normalization below nor the obtainCustomFields
        // delete in processObjectQueue() modifies that definition - otherwise every following call
        // would build a different object and defeat the isEquivalent() guard below, causing a
        // needless extendObject() (and thus an onObjectChange event) on every device update.
        // Only own properties of the object and of common are ever changed, so a shallow copy is
        // enough and keeps this hot path (every state update) free of deep-clone overhead.
        obj = { ...obj, common: { ...obj.common }, native: { ...obj.native } };
        obj.type ||= 'state';
        obj.common ||= {};
        obj.native ||= {};
        // Device definitions store common.name as a plain English i18n key (see deviceTypes.ts).
        // Resolve it to a full translation object at runtime - I18n is initialized in onReady before
        // any object is created. Names that are not dictionary keys fall back to `{ en: <name> }`.
        if (typeof obj.common.name === 'string') {
            obj.common.name = adapter_core_1.I18n.getTranslatedObject(obj.common.name);
        }
        if (obj.common && obj.common.type === undefined) {
            if (value !== null && value !== undefined) {
                obj.common.type = typeof value;
            }
            else if (obj.common.def !== undefined) {
                obj.common.type = typeof obj.common.def;
            }
            else if (obj.type === 'state') {
                obj.common.type = 'mixed';
            }
        }
        if (obj.common && obj.common.read === undefined) {
            obj.common.read = true; //!(obj.common.type === 'boolean' && !!stateChangeCallback);
        }
        if (obj.common && obj.common.write === undefined) {
            obj.common.write = !!stateChangeCallback || !!this.stateChangeTrigger[id];
        }
        /*    if (obj.common && obj.common.def === undefined && value !== null && value !== undefined) {
                obj.common.def = value;
            }*/
        if (obj.common && obj.common.name === undefined) {
            obj.common.name = id.split('.').pop() || '';
        }
        if (!this.adapterObjects[id] && this.existingStates[id]) {
            this.adapterObjects[id] = this.existingStates[id];
            if (this.adapterObjects[id].from) {
                delete this.adapterObjects[id].from;
            }
            if (this.adapterObjects[id].ts) {
                delete this.adapterObjects[id].ts;
            }
            if (this.adapterObjects[id].acl) {
                delete this.adapterObjects[id].acl;
            }
            if (this.adapterObjects[id]._id) {
                // @ts-expect-error it is Ok
                delete this.adapterObjects[id]._id;
            }
            if (obj.common.def === undefined && this.adapterObjects[id].common.def !== undefined) {
                delete this.adapterObjects[id].common.def;
            }
            if (obj.common.unit === undefined && this.adapterObjects[id].common.unit !== undefined) {
                delete this.adapterObjects[id].common.unit;
            }
            if (obj.common.min === undefined && this.adapterObjects[id].common.min !== undefined) {
                delete this.adapterObjects[id].common.min;
            }
            if (obj.common.max === undefined && this.adapterObjects[id].common.max !== undefined) {
                delete this.adapterObjects[id].common.max;
            }
            value = undefined; // when exists, and it is first time do not overwrite value!
        }
        if (this.existingStates[id]) {
            delete this.existingStates[id];
        }
        if (this.adapterObjects[id] && this.isEquivalent(obj, this.adapterObjects[id])) {
            //adapter.log.debug('Object unchanged for ' + id + ': ' + JSON.stringify(this.adapterObjects[id]) + ' - update only: ' + JSON.stringify(value));
            if (value !== undefined) {
                this.adapter
                    .setState(id, value, true)
                    .catch((e) => this.adapter.log.error(`[objectHelper] setState failed: ${String(e)}`));
            }
            if (stateChangeCallback) {
                this.stateChangeTrigger[id] = stateChangeCallback;
            }
            return;
        }
        // adapter.log.debug('Add Object for ' + id + ': ' + JSON.stringify(this.adapterObjects[id]) + '/' + JSON.stringify(obj));
        this.objectQueue.push({
            id,
            value,
            obj: obj,
            stateChangeCallback,
            obtainCustomFields,
        });
        this.adapterObjects[id] = JSON.parse(JSON.stringify(obj));
        // adapter.log.debug('Create object for ' + id + ': ' + JSON.stringify(obj) + ' with value: ' + JSON.stringify(value));
        if (createNow) {
            this.processObjectQueue(callback);
        }
    }
    deleteObject(id) {
        const obj = this.adapterObjects[id];
        if (obj?.type) {
            if (obj.type !== 'state') {
                Object.keys(this.adapterObjects).forEach(objId => {
                    if (objId.startsWith(`${id}.`)) {
                        this.adapter.delObject(objId, (err) => {
                            this.adapter.log.info(`${this.adapterObjects[objId].type} ${objId} deleted${err ? ` (${err})` : ''}`);
                            if (!err) {
                                delete this.adapterObjects[objId];
                                delete this.stateChangeTrigger[objId];
                            }
                        });
                    }
                });
            }
            this.adapter.delObject(id, err => {
                this.adapter.log.info(`${this.adapterObjects[id].type} ${id} deleted (${err})`);
                if (!err) {
                    delete this.adapterObjects[id];
                    delete this.stateChangeTrigger[id];
                }
            });
        }
    }
    isEquivalent(a, b) {
        // this.adapter.log.debug('Compare ' + JSON.stringify(a) + ' with ' +  JSON.stringify(b));
        // Create arrays of property names
        if (a === null || a === undefined || b === null || b === undefined) {
            return a === b;
        }
        const objA = a;
        const objB = b;
        const aProps = Object.getOwnPropertyNames(objA);
        const bProps = Object.getOwnPropertyNames(objB);
        // If number of properties is different,
        // objects are not equivalent
        if (aProps.length !== bProps.length) {
            //console.log('num props different: ' + JSON.stringify(aProps) + ' / ' + JSON.stringify(bProps));
            return false;
        }
        for (let i = 0; i < aProps.length; i++) {
            const propName = aProps[i];
            if (typeof objA[propName] !== typeof objB[propName]) {
                // console.log('type props ' + propName + ' different');
                return false;
            }
            if (typeof objA[propName] === 'object') {
                if (!this.isEquivalent(objA[propName], objB[propName])) {
                    return false;
                }
            }
            else {
                // If values of same property are not equal,
                // objects are not equivalent
                if (objA[propName] !== objB[propName]) {
                    // console.log('props ' + propName + ' different');
                    return false;
                }
            }
        }
        // If we made it this far, objects
        // are considered equivalent
        return true;
    }
    processObjectQueue(callback) {
        if (!this.objectQueue.length) {
            callback?.();
            return;
        }
        const handleValue = (queueEntry, callback) => {
            if (queueEntry.value === null || queueEntry.value === undefined) {
                if (queueEntry.stateChangeCallback) {
                    this.stateChangeTrigger[queueEntry.id] = queueEntry.stateChangeCallback;
                }
                return callback?.();
            }
            void this.adapter.setState(queueEntry.id, queueEntry.value, true, () => {
                if (queueEntry.stateChangeCallback) {
                    this.stateChangeTrigger[queueEntry.id] = queueEntry.stateChangeCallback;
                }
                return callback?.();
            });
        };
        const handleObject = (queueEntry, callback) => {
            if (!queueEntry.obj) {
                handleValue(queueEntry, () => callback?.());
            }
            this.adapter.getObject(queueEntry.id, (err, obj) => {
                if (!err && obj) {
                    if (Array.isArray(queueEntry.obtainCustomFields)) {
                        queueEntry.obtainCustomFields.forEach(name => {
                            if (queueEntry.obj.common?.[name]) {
                                delete queueEntry.obj.common[name];
                            }
                        });
                    }
                    this.adapter.extendObject(queueEntry.id, queueEntry.obj, () => handleValue(queueEntry, () => callback?.()));
                }
                else {
                    this.adapter.setObject(queueEntry.id, queueEntry.obj, () => handleValue(queueEntry, () => callback?.()));
                }
            });
        };
        const queueEntry = this.objectQueue.shift();
        if (queueEntry) {
            handleObject(queueEntry, () => this.processObjectQueue(callback));
        }
        else {
            this.processObjectQueue(callback);
        }
    }
    getObject(id) {
        return this.adapterObjects[id];
    }
    loadExistingObjects(callback) {
        void this.adapter.getAdapterObjects(res => {
            const objectKeys = Object.keys(res);
            for (let i = 0; i < objectKeys.length; i++) {
                if (objectKeys[i].indexOf(`${this.adapter.namespace}.info`) === 0) {
                    continue;
                }
                this.existingStates[objectKeys[i].substr(this.adapter.namespace.length + 1)] = res[objectKeys[i]];
            }
            // this.adapter.log.debug('Existing States: ' + JSON.stringify(Object.keys(this.existingStates), null, 4));
            // devId + '.Bluetooth' = device , ChannelsOd = MACs
            // devId + '.Notifications' = channel, statesOf ??
            // devId + '.Routines' = channel, statesOf
            callback?.();
        });
    }
    handleStateChange(id, state) {
        if (!state || state.ack) {
            return;
        }
        id = id.substring(this.adapter.namespace.length + 1);
        if (typeof this.stateChangeTrigger[id] === 'function') {
            const obj = this.adapterObjects[id];
            if (obj?.common?.type && obj.common.type !== 'mixed') {
                if (obj.common.type === 'boolean') {
                    if (state.val === 'true') {
                        state.val = true;
                    }
                    else if (state.val === 'false') {
                        state.val = false;
                    }
                    state.val = !!state.val;
                }
                if (typeof state.val !== obj.common.type) {
                    this.adapter.log.error(`Datatype for ${id} differs from expected, ignore state change! Please write correct datatype (${obj.common.type})`);
                    return;
                }
            }
            this.stateChangeTrigger[id](state.val, state);
        }
    }
}
exports.default = ObjectHelper;
//# sourceMappingURL=objectHelper.js.map