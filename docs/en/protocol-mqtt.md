![Logo](../../admin/shelly.png)

# ioBroker.shelly

This is the English documentation - [🇩🇪 German version](../de/protocol-mqtt.md)

## MQTT

![iobroker_general_mqtt](./img/iobroker_general_mqtt.png)

The adapter supports two MQTT modes (setting **MQTT mode** in the **MQTT Settings** tab):

1. **MQTT broker (internal)** (default): The Shelly adapter starts its own MQTT broker. The Shelly devices connect directly to ioBroker.
2. **MQTT client (external broker)**: The Shelly adapter connects as a client to an existing MQTT broker (e.g. Mosquitto), which the Shelly devices are connected to. See [External MQTT broker](#external-mqtt-broker-client-mode).

### Important notes

- The Shelly adapter starts an own MQTT broker which is running on the (non-default) port `1882` to avoid conflicts with other MQTT brokers on the same system (the default port for MQTT is `1883`)
- It is not possible to connect a MQTT client (e.g., MQTT-Explorer) to the internal MQTT broker
- You can change the port of the internal MQTT broker in the instance settings
- **You don't need any knowledge about MQTT to use it** - everything is handled internally

Questions? Check the [FAQ](faq.md) section first!

>[!IMPORTANT]
>Devices which are connected via NAT (e.g. most VPNs or the Shelly range extender) are not reachable via HTTP from ioBroker. The MQTT connection works (states, commands, RSSI, uptime and online state are updated via MQTT), but all functions which require HTTP (e.g. polled settings, firmware updates, script download) are not available for these devices.

### Configuration

1. Open the Shelly Adapter configuration in ioBroker
2. Choose `MQTT (and HTTP)` as *protocol* in the *general settings*
3. Open the **MQTT Settings** tab
4. Keep **MQTT mode** at `MQTT broker (internal)`
5. Choose a username and a secure password (you have to configure this information on all Shelly devices)

> The Shelly adapter will start an own MQTT broker internally. The configured username and password must be used on all Shelly devices that should connect to this broker.

![iobroker_mqtt](./img/iobroker_mqtt.png)

Activate MQTT on all your Shelly devices.

### Generation 2+ devices (Plus and Pro)

1. Open the Shelly web configuration in your web browser (not in the Shelly App!)
2. Open the `Settings` tab and go to `Networks -> Mqtt`
3. Enable MQTT and enter the previously configured username, password and the ip address of the system where ioBroker is installed, followed by the configured port (e.g. `192.168.1.2:1882`)
4. Apply the configuration. The Shelly will reboot automatically

- **Do not change the "client id" in this configuration**
- **You have to enable all RPC notification options for generation 2+ (Gen2+) devices (see screenshots)!**
- SSL/TLS has to be disabled!

![shelly gen2](./img/shelly_mqtt-gen2.png)

### Generation 1 devices

1. Open the Shelly web configuration in your web browser (not in the Shelly App!)
2. Go to `Internet & Security settings -> Advanced - Developer settings`
3. Enable MQTT and enter the previously configured username, password and the IP address of the system where ioBroker is installed, followed by the configured port (e.g. `192.168.1.2:1882`)
4. Save the configuration. The Shelly will reboot automatically

![shelly gen1](./img/shelly_mqtt-gen1.png)

### External MQTT broker (client mode)

Use this mode if you already have a central MQTT broker (e.g. Mosquitto, EMQX) and your Shelly devices are (or should be) connected to it. The Shelly adapter does **not** start its own broker in this mode - it connects to your broker as a client, discovers the Shelly devices by their topics and sends commands via the broker.

#### Configuration

1. Open the Shelly Adapter configuration in ioBroker
2. Choose `MQTT (and HTTP)` as *protocol* in the *general settings*
3. Open the **MQTT Settings** tab
4. Set **MQTT mode** to `MQTT client (external broker)`
5. Enter the **MQTT broker host** (IP address or host name, e.g. `192.168.1.10`) and the **MQTT broker port** (default `1883`). A URL like `mqtts://broker.local:8883` or `ws://broker.local:9001` is also possible.
6. Enter the username and password of the broker (if the broker requires authentication) - or select a central credential (see [ioBroker credentials](#iobroker-credentials-secrets))
7. Configure all Shelly devices to connect to your broker (as described above for Gen1 / Gen2+, but with the address of your broker)

#### Notes

- Keep the **default MQTT topic prefix** (e.g. `shellyplus1pm-44179394d4d4`) or the default prefix with one folder in front of it (e.g. `shelly/shellyplus1pm-44179394d4d4`). The adapter identifies the device by the topic prefix (device type + serial number), **not** by the MQTT client id.
- The adapter subscribes to `shellies/#` (Gen1) and `+/online`, `+/events/#`, `+/status/#`, `+/debug/#` as well as the same topics with one folder (`+/+/...`) for Gen2+ devices. The answers of the devices are received on `iobroker/rpc` and `iobroker-init/rpc`.
- **Generation 2+ devices:** enable all RPC notification options (see screenshot above)
- To avoid stale retained topics of devices which have been removed, a new device is only created after a live message or a retained `online` = `true` message. Gen2+ devices which already exist in ioBroker are created directly after the connection to the broker.
- The online state of a device is taken from its `online` topic (last will). If the connection to the broker is lost, all devices are set offline.
- If both protocols (MQTT and CoAP) are enabled, Gen1 devices should only use one of them.

### ioBroker credentials (secrets)

Since Admin 8, credentials can be stored centrally in the ioBroker Admin settings (*Settings → Credentials*). Instead of entering the username and password in every instance, you can select such a credential of the form **"Login & password"**:

- **MQTT settings → Credential**: user name and password of the internal broker (which have to be configured on the Shelly devices) or of the external broker
- **General settings → Credential**: user name and password for the restricted login (HTTP) of the devices

If a credential is selected, the manually entered username and password are ignored. The values are only read at the start of the instance - if the credential is changed or deleted, the instance restarts automatically.

### Quality of Service (QoS)

There are 3 QoS levels in MQTT:

- At most once (0) - no guarantee of delivery (fire and forget)
- At least once (1) - guarantees that a message is delivered at least one time to the receiver
- Exactly once (2) - guarantees that each message is received only once by the intended recipients
