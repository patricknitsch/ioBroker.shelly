"use strict";
/**
 * Shared TypeScript contract for the Shelly *device definitions*.
 *
 * Every file under `devices/<generation>/` exports one plain object that describes a single
 * Shelly model: which ioBroker states it exposes and how each state is mapped to/from the
 * device over the CoAP (Gen1) or MQTT (Gen2+) protocol — optionally falling back to HTTP.
 *
 * The protocol layer (`protocol/base.ts` and its `mqtt`/`coap` subclasses) walks these objects
 * at runtime and invokes the embedded callbacks. The types below describe that runtime contract:
 *
 *   - {@link DeviceDefinition} — the exported object: `stateId -> {@link DeviceState}`.
 *   - {@link DeviceState}      — one ioBroker state: its `common` block plus per-protocol mappings.
 *   - {@link ProtocolBlock}    — the `coap`/`mqtt` mapping (publish/command/poll/init fields).
 *   - {@link ShellyClient}     — the `self` argument every callback receives (the live client).
 *
 * Device files apply this contract with `satisfies DeviceDefinition` so the literal keeps its
 * narrow inferred shape (device-specific state ids stay known) while still being type-checked.
 *
 * Note on callback `value` typing: the data flowing through `*_publish_funct` is raw, untyped
 * wire data (a JSON string from MQTT, a response body from HTTP, a scalar from CoAP). Typing it
 * as anything narrower than `any` would force a cast at every one of the thousands of call sites
 * (`JSON.parse(value)`, `value == 1`, …) for no real safety gain, so `value` is intentionally
 * `any`. The safety payoff lives in {@link ShellyClient} (the strongly-typed `self`) and in the
 * `common` block being a real `ioBroker.StateCommon` from the ioBroker type definitions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=deviceTypes.js.map