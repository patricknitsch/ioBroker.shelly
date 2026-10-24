![Logo](../../admin/shelly.png)

# ioBroker.shelly

This is the German documentation - [🇺🇸 English version](../en/protocol-mqtt.md)

## MQTT

![iobroker_general_mqtt](./img/iobroker_general_mqtt.png)

Der Adapter unterstützt zwei MQTT-Modi (Einstellung **MQTT-Modus** im Tab **MQTT Einstellungen**):

1. **MQTT-Broker (intern)** (Standard): Der Shelly-Adapter startet einen eigenen MQTT-Broker. Die Shelly-Geräte verbinden sich direkt mit ioBroker.
2. **MQTT-Client (externer Broker)**: Der Shelly-Adapter verbindet sich als Client mit einem bestehenden MQTT-Broker (z.B. Mosquitto), mit dem die Shelly-Geräte verbunden sind. Siehe [Externer MQTT-Broker](#externer-mqtt-broker-client-modus).

### Wichtige Hinweise

- Der Shelly-Adapter startet einen eigenen MQTT-Broker, welcher auf dem Port `1882` gestartet wird, um einen Konflikt mit anderen MQTT-Brokern auf dem gleichen System zu vermeiden (Standard-Port für MQTT ist `1883`)
- Es ist nicht möglich, einen MQTT-Client (wie z.B. MQTT-Explorer) gegen den internen MQTT-Broker zu verbinden
- Der Standard-Port des internen MQTT-Brokers kann in der Konfiguration des Adapters angepasst werden
- **Es ist kein Wissen über das MQTT-Protokoll erforderlich** - sämtliche Kommunikation wird intern behandelt

Fragen? Schaue zuerst in die [FAQ](faq.md)!

>[!IMPORTANT]
>Geräte, die über NAT angebunden sind (z.B. viele VPN-Konfigurationen oder der Shelly Range Extender), sind von ioBroker aus nicht per HTTP erreichbar. Die MQTT-Verbindung funktioniert (Zustände, Befehle, RSSI, Laufzeit und Online-Status werden per MQTT aktualisiert), aber alle Funktionen, die HTTP benötigen (z.B. abgefragte Einstellungen, Firmware-Updates, Skript-Download), stehen für diese Geräte nicht zur Verfügung.

### Konfiguration

1. Öffne die Shelly-Adapter Konfiguration im ioBroker
2. Wähle `MQTT (und HTTP)` als *Protokoll* in den *Allgemeinen Einstellungen*
3. Öffne das Tab **MQTT Einstellungen**
4. Belasse den **MQTT-Modus** auf `MQTT-Broker (intern)`
5. Wähle einen Benutzernamen und ein sicheres Passwort (diese Informationen müssen auf allen Shelly-Geräten hinterlegt werden)

> Der Shelly-Adapter startet einen eigenen MQTT-Broker (intern). Der konfigurierte Benutzername und das Passwort muss auf allen Shelly-Geräten hinterlegt werden, welche sich mit diesem Broker verbinden sollen.

![iobroker_mqtt](./img/iobroker_mqtt.png)

MQTT muss auf allen Shelly-Geräten aktiviert werden.

### Generation 2+ Geräte (Plus und Pro)

1. Öffne die Shelly-Webkonfiguration in einem Browser (nicht in der Shelly App!)
2. Öffne das Tab `Settings` und gehe zu `Networks -> Mqtt`
3. Aktiviere MQTT und gib die gerade konfigurierten Benutzerdaten und die IP-Adresse des Systems an, auf welchen ioBroker installiert ist - gefolgt vom konfigurierten Port (beispielsweise `192.168.1.2:1882`)
4. Speichere die Konfiguration - der Shelly startet automatisch neu

- **Ändere nicht die "client id" in dieser Konfiguration**
- **Für Generation 2+ Geräte (Gen2+) müssen alle RPC-Optionen aktiviert werden (siehe Screenshots)!**
- SSL/TLS darf nicht aktiviert werden

![shelly gen2](./img/shelly_mqtt-gen2.png)

### Generation 1 Geräte

1. Öffne die Shelly-Webkonfiguration in einem Browser (nicht in der Shelly App!)
2. Gehe zu `Internet & Security settings -> Advanced - Developer settings`
3. Aktiviere MQTT und gib die gerade konfigurierten Benutzerdaten und die IP-Adresse des Systems an, auf welchen ioBroker installiert ist - gefolgt vom konfigurierten Port (beispielsweise `192.168.1.2:1882`)
4. Speichere die Konfiguration - der Shelly startet automatisch neu

![shelly gen1](./img/shelly_mqtt-gen1.png)

### Externer MQTT-Broker (Client-Modus)

Dieser Modus ist für Installationen gedacht, in denen bereits ein zentraler MQTT-Broker (z.B. Mosquitto, EMQX) läuft, mit dem die Shelly-Geräte verbunden sind (oder werden sollen). Der Shelly-Adapter startet in diesem Modus **keinen** eigenen Broker - er verbindet sich als Client mit dem Broker, erkennt die Shelly-Geräte anhand ihrer Topics und sendet Befehle über den Broker.

#### Konfiguration

1. Öffne die Shelly-Adapter Konfiguration im ioBroker
2. Wähle `MQTT (und HTTP)` als *Protokoll* in den *Allgemeinen Einstellungen*
3. Öffne das Tab **MQTT Einstellungen**
4. Setze den **MQTT-Modus** auf `MQTT-Client (externer Broker)`
5. Trage den **MQTT-Broker-Host** (IP-Adresse oder Hostname, z.B. `192.168.1.10`) und den **MQTT-Broker-Port** (Standard `1883`) ein. Eine URL wie `mqtts://broker.local:8883` oder `ws://broker.local:9001` ist ebenfalls möglich.
6. Trage Benutzername und Passwort des Brokers ein (falls der Broker eine Anmeldung erfordert) - oder wähle zentrale Zugangsdaten aus (siehe [ioBroker-Zugangsdaten](#iobroker-zugangsdaten-secrets))
7. Konfiguriere alle Shelly-Geräte so, dass sie sich mit deinem Broker verbinden (wie oben für Gen1 / Gen2+ beschrieben, aber mit der Adresse deines Brokers)

#### Hinweise

- Verwende das **Standard-Topic-Präfix** (z.B. `shellyplus1pm-44179394d4d4`) oder das Standard-Präfix mit einem vorangestellten Ordner (z.B. `shelly/shellyplus1pm-44179394d4d4`). Der Adapter erkennt das Gerät am Topic-Präfix (Gerätetyp + Seriennummer), **nicht** an der MQTT-Client-ID.
- Der Adapter abonniert `shellies/#` (Gen1) sowie `+/online`, `+/events/#`, `+/status/#`, `+/debug/#` und dieselben Topics mit einem Ordner (`+/+/...`) für Gen2+ Geräte. Die Antworten der Geräte werden über `iobroker/rpc` und `iobroker-init/rpc` empfangen.
- **Generation 2+ Geräte:** alle RPC-Benachrichtigungsoptionen aktivieren (siehe Screenshot oben)
- Um veraltete Retained-Topics von entfernten Geräten zu ignorieren, wird ein neues Gerät erst nach einer Live-Nachricht oder einer Retained-Nachricht `online` = `true` angelegt. Gen2+ Geräte, die bereits in ioBroker existieren, werden direkt nach dem Verbindungsaufbau zum Broker angelegt.
- Der Online-Status eines Geräts wird aus seinem `online`-Topic (Last Will) übernommen. Bricht die Verbindung zum Broker ab, werden alle Geräte auf offline gesetzt.
- Wenn beide Protokolle (MQTT und CoAP) aktiviert sind, sollten Gen1 Geräte nur eines davon verwenden.

### ioBroker-Zugangsdaten (Secrets)

Seit Admin 8 können Zugangsdaten zentral in den Admin-Einstellungen hinterlegt werden (*Einstellungen → Zugangsdaten*). Statt Benutzername und Passwort in jeder Instanz einzutragen, können solche Zugangsdaten der Form **„Login & Passwort“** ausgewählt werden:

- **MQTT Einstellungen → Zugangsdaten**: Benutzername und Passwort des internen Brokers (die auf den Shelly-Geräten hinterlegt werden müssen) bzw. des externen Brokers
- **Allgemeine Einstellungen → Zugangsdaten**: Benutzername und Passwort für den eingeschränkten Login (HTTP) der Geräte

Sind Zugangsdaten ausgewählt, werden die manuell eingetragenen Werte ignoriert. Die Werte werden beim Start der Instanz gelesen - werden die Zugangsdaten geändert oder gelöscht, startet die Instanz automatisch neu.

### Quality of Service (QoS)

Es gibt 3 QoS-Stufen in MQTT:

- At most once (0) - keine Zustellungsgarantie (Fire and Forget)
- At least once (1) - garantiert, dass eine Nachricht mindestens einmal beim Empfänger ankommt
- Exactly once (2) - garantiert, dass jede Nachricht genau einmal beim Empfänger ankommt
