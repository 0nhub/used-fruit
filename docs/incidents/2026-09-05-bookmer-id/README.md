# Bookmer-ID-Ausfall am 5. September 2026

**Status: Betrieb wiederhergestellt; dauerhafte Absicherung des Deployments noch offen.**

Dieser Bericht dokumentiert die Untersuchung des Anmeldeausfalls von Bookmer. Er trennt belegte Ereignisse, technische Schlussfolgerungen und offene Fragen. Eine README kann einen Ausfall nicht allein verhindern. Die unten beschriebenen technischen Freigabekriterien müssen vor dem nächsten produktiven Dependency-Install oder Plattform-Neustart umgesetzt und geprüft werden.

## 1. Ergebnis und Auswirkungen

Bookmer ID konnte sein Express-Backend `loginsign-api` nicht mehr starten. Die produktive Startzeile lautet `node --import tsx server/index.ts`. Das erforderliche Paket `tsx` fehlte. Nach dessen Wiederherstellung verhinderte außerdem ein nicht auflösbares `object-inspect` den Start über die Express-Abhängigkeitskette.

Die Fehler waren für Nutzer als nicht funktionierende Plattform beziehungsweise Anmeldung wahrnehmbar. Ein vollständiger Ausfall aller HTTP-Seiten ist dagegen nicht belegt: Bei der Untersuchung antworteten `bookmer.com/` und `id.bookmer.com/` mit HTTP 200, während der ID-Backend-Port 4000 fehlte und `https://id.bookmer.com/api/health` HTTP 500 lieferte. Eine geladene Anmeldeseite bedeutet deshalb nicht, dass die Anmeldung funktioniert.

Die PM2-Protokolle zeigen eine Absturzschleife von **06:01:41 bis 08:09:46 UTC** am 5. September, ungefähr **2 Stunden 8 Minuten**. In diesem Zeitfenster wurden 157.024 Exit-Ereignisse mit Code 1 für `loginsign-api` gezählt. Dies ist eine Prozessbeobachtung, keine Messung der Anzahl betroffener Nutzer oder fehlgeschlagener Logins. Der abschließende Neustart erfolgte um 08:09:47 UTC. Danach waren Listener und öffentlicher Healthcheck wieder vorhanden.

Es gibt in dieser Untersuchung keinen Nachweis von Datenverlust. Eine vollständige Datenintegritätsprüfung wurde nicht durchgeführt. Ebenso wurde kein vollständiger Login mit einem echten Nutzerkonto ausgeführt und keine Test-E-Mail versandt.

## 2. Belegte Ursache und technischer Mechanismus

### 2.1 Ein Backend-Install veränderte den gemeinsamen Workspace

Das npm-Protokoll `2026-09-04T15_17_38_726Z-debug-0.log` belegt:

```text
info using npm@10.9.7
info using node@v22.22.2
info config found workspace root at /opt/bookmer-platform
verbose title npm install
verbose argv "install" "--omit" "dev" "--prefer-offline"
verbose cwd /opt/bookmer-platform/apps/bookmer/backend
verbose exit 0
```

Die laufende Plattform besitzt ein übergeordnetes `package.json` mit diesen Workspaces:

```text
apps/bookmer
apps/bookmer/backend
apps/bookmer-id
```

Ein Wechsel in das Unterverzeichnis `backend` isolierte den Installationsvorgang somit nicht. npm erkannte den Eltern-Workspace und veränderte dessen gemeinsamen Abhängigkeitsbaum. Das Protokoll dokumentiert ausdrücklich die Entfernung:

```text
439 silly reify mark deleted [
439 silly reify   '/opt/bookmer-platform/node_modules/tsx',
439 silly reify   '/opt/bookmer-platform/node_modules/.bin/tsx'
439 silly reify ]
```

Diese Zeilen stehen an den physischen Dateizeilen 772–775 der gesicherten Datei. Auch `esbuild` und weitere Entwicklungspakete wurden als gelöscht protokolliert. Der npm-Prozess endete erfolgreich: Für npm war das Entfernen von Entwicklungspaketen bei `--omit dev` erwartetes Verhalten.

### 2.2 Eine produktive Abhängigkeit war als Entwicklungsabhängigkeit deklariert

Im auf dem Server gelesenen Bookmer-ID-Manifest steht `tsx` unter `devDependencies` (`^4.19.0`). Gleichzeitig benötigt der produktive Startbefehl dieses Paket unmittelbar. Das Bookmer-ID-Lockfile enthält Version 4.21.0.

Damit widersprechen sich Paketdeklaration und Betriebsweise: Ein Produktionsinstall ohne Entwicklungspakete kann erfolgreich sein und trotzdem den produktiven API-Start unmöglich machen. Die gemeinsame Workspace-Struktur übertrug dieses Risiko vom Bookmer-Backend auf den separaten Authentifizierungsdienst.

### 2.3 Der Neustart machte den latenten Defekt sichtbar

Am 5. September um 06:01:40 UTC wurden laut PM2 alle vier Bookmer-Prozesse gestoppt. Um 06:01:41 UTC startete `loginsign-api` erneut und beendete sich sofort mit Code 1. Die Neustartschleife folgte direkt darauf.

Dass ein bereits laufender Node-Prozess bis zum Neustart weiterlaufen kann, obwohl Dateien seiner geladenen Module fehlen, erklärt die Verzögerung technisch. Das ist eine Schlussfolgerung aus der Modul-Lebensdauer und der dokumentierten Reihenfolge, keine lückenlose Verfügbarkeitsmessung zwischen Install und Neustart.

Die Person, Automatisierung oder konkrete Bedienaktion hinter dem Neustart um 06:01:40 UTC wurde nicht identifiziert. Ein gezielter Angriff, ein bestimmter Entwickler oder eine bestimmte KI darf daraus nicht abgeleitet werden.

### 2.4 Zweiter Startfehler: object-inspect

Nach Wiederherstellung von `tsx` zeigte der Start diese Kette:

```text
Cannot find module 'object-inspect'
side-channel-list -> qs/node_modules/side-channel -> qs
-> express/lib/middleware/query -> express -> server/index.ts
```

Die Auflösung erfolgte über Pakete im gemeinsamen `/opt/bookmer-platform/node_modules`. Dort fehlte ein für diese Kette erreichbares `object-inspect`. Das untersuchte Install-Protokoll enthält eine Installation unter `qs/node_modules/object-inspect`; das ist nicht dasselbe wie eine für `side-channel-list` erreichbare Installation. Der genaue vorherige Zustand und die konkrete Operation, die diesen zweiten Defekt erzeugte, sind nicht vollständig belegt. Er wird deshalb **nicht als zweifelsfrei durch denselben Install verursachte Löschung** dargestellt.

Die Wiederherstellung von Version 1.13.4, entsprechend dem Bookmer-ID-Lockfile, beseitigte diesen zweiten Startblocker. Die produktive Dependency-Struktur muss trotzdem in einer sauberen, isolierten Installation reproduziert und korrigiert werden.

## 3. Chronologie

Alle Serverzeiten unten sind UTC; deutsche Ortszeit war MESZ/UTC+2. Zeitpunkte mit „ca.“ stammen aus Prüfungen dieser Sitzung, nicht aus einem kontinuierlichen Monitoring.

| UTC | MESZ | Ereignis und Beleg |
| --- | --- | --- |
| 04.09. 15:17:38 | 04.09. 17:17:38 | npm-Install im Bookmer-Backend beginnt, erkennt den Plattform-Workspace und entfernt u. a. `tsx`; Exit 0. |
| 05.09. 01:34:55 | 05.09. 03:34:55 | Used-Fruit-Installation: separates `npm ci` in `apps/used-fruit`; eigenes npm-Protokoll, Exit 0. |
| 05.09. ca. 01:36–01:40 | 05.09. ca. 03:36–03:40 | Used Fruit wird als eigener systemd-Dienst bereitgestellt und anschließend eine CSS-Korrektur veröffentlicht. |
| 05.09. 06:01:40 | 05.09. 08:01:40 | PM2 protokolliert das Stoppen aller vier Bookmer-Prozesse. Initiator nicht festgestellt. |
| 05.09. 06:01:41 | 05.09. 08:01:41 | Erste dokumentierte API-Abstürze mit Exit 1 nach diesem Neustart. |
| 05.09. 07:34:25 | 05.09. 09:34:25 | Ergänzung der Used-Fruit-Domainblöcke in Caddy; die API-Absturzschleife läuft bereits. |
| 05.09. ca. 07:52–07:53 | 05.09. ca. 09:52–09:53 | Aktivierung des domainbeschränkten MapKit-Tokens und Neustart ausschließlich von `used-fruit.service`. |
| 05.09. ca. 08:07 | 05.09. ca. 10:07 | Untersuchung nach Nutzermeldung: Frontends 200, ID-Backend nicht betriebsbereit, Port 4000 fehlt. |
| 05.09. 08:08:40 | 05.09. 10:08:40 | Installation von `tsx@4.21.0` in isoliertem Wiederherstellungsverzeichnis. |
| 05.09. 08:09:46–47 | 05.09. 10:09:46–47 | `object-inspect@1.13.4` ergänzt; abschließender Neustart von `loginsign-api`. |
| 05.09. danach | 05.09. danach | Port 4000 verfügbar, öffentlicher ID-Healthcheck 200 mit `ok: true`, stabile PID und sichtbares Login-Widget geprüft. |

## 4. Zusammenhang mit Used Fruit und Verantwortung dieser Sitzung

Die belegte Entfernung von `tsx` erfolgte rund zehn Stunden **vor** dem Used-Fruit-Install. Das npm-Protokoll der Used-Fruit-Installation zeigt als Arbeitsverzeichnis `apps/used-fruit`; Used Fruit ist nicht in der oben aufgeführten Workspace-Liste enthalten. Die dokumentierten Used-Fruit-Befehle enthalten keinen Neustart aller PM2-Prozesse.

Der Vergleich der aktuellen Caddy-Konfiguration mit der Sicherung vor Used Fruit zeigt ausschließlich zusätzliche Hostblöcke für die Vorschau-IP, `usedfruit.de` und `www.usedfruit.de`. Die Bookmer-Hostblöcke sind unverändert. Beim Incident-Check standen ungefähr 4,4 GiB RAM zur Verfügung und 13 GiB Plattenplatz waren frei; dies liefert keinen Hinweis auf aktuelle Ressourcenerschöpfung. Frühere kurzzeitige Ressourcenspitzen wurden damit nicht ausgeschlossen.

**Fazit der Beweislage:** Der konkret nachgewiesene `tsx`-Defekt entstand bei dem vorherigen Workspace-Install. Der Used-Fruit-Upload ist nicht als dessen Ursache belegt. Der spätere Plattform-Neustart ist ein separater, nicht zugeordneter Auslöser der sichtbaren Störung.

Die Used-Fruit-Arbeit hatte dennoch Prüflücken, die offen benannt werden müssen:

- Die frühe Aussage, Bookmer funktioniere weiterhin, stützte sich auf Frontend-HTTP-200-Prüfungen. Das war zu schwach, um die Funktionsfähigkeit des Authentifizierungsdienstes zu bestätigen.
- Next.js meldete bei Used-Fruit-Builds einen erkannten Eltern-Workspace. Eine Build-Root-Warnung ist kein Löschungsnachweis, hätte aber eine frühere Prüfung der Betriebsgrenzen nahegelegt.
- Die definitive Entfernung der fehlenden Pakete war im ersten Kurzbericht noch unbekannt. Erst die nachträgliche npm-Protokollanalyse erlaubte die präzisere Zuordnung von `tsx`.

## 5. Wiederherstellung und aktueller Zustand

Es wurde nur das betroffene Backend gestoppt und neu gestartet. Keine Datenbank wurde zurückgesetzt, kein Nutzerkonto geändert und kein kompletter Plattform-Install ausgeführt.

Wiederhergestellt wurden:

| Paket | Version | Installationsort |
| --- | --- | --- |
| tsx | 4.21.0 | `/opt/bookmer-runtime/node_modules/tsx` |
| object-inspect | 1.13.4 | `/opt/bookmer-runtime/node_modules/object-inspect` |

Die vorher fehlenden Pfade wurden durch Symlinks wieder verfügbar gemacht:

```text
/opt/bookmer-platform/apps/bookmer-id/node_modules/tsx
  -> /opt/bookmer-runtime/node_modules/tsx
/opt/bookmer-platform/node_modules/object-inspect
  -> /opt/bookmer-runtime/node_modules/object-inspect
```

Diese Reparatur ist persistent auf der Platte und wurde im laufenden Betrieb geprüft. Sie ist **kein Ersatz für eine korrigierte Paketdeklaration und einen reproduzierbaren Release**. Ein späteres `npm ci`, eine Bereinigung oder ein Verzeichnisaustausch kann die Symlinks entfernen. Die Recovery-Pakete dürfen erst entfernt werden, wenn ein regulärer Release nachweislich ohne sie funktioniert.

Geprüft wurden:

- ID-Backend-Listener auf Port 4000 und Healthcheck über den öffentlichen HTTPS-Proxy, HTTP 200 mit `ok: true`.
- Wiederholt stabile Backend-PID nach der Reparatur; PM2 allein wurde nicht als Nachweis verwendet.
- Bookmer-Startseite, Bookmer-ID-Seite, E-Mail-Formular und eingebettetes Bookmer-Login-Widget im Browser.
- Fortbestehender Betrieb von Used Fruit.

Nicht geprüft: vollständiger OTP-/OAuth-/Passkey-Login mit einem echten Konto, alle authentifizierten Bookmark-Funktionen, alle Hintergrundjobs und historische Datenintegrität. Es gibt keine Grundlage für eine Garantie, dass jede Plattformfunktion fehlerfrei ist.

## 6. Verbindliche Betriebsregeln vor dem nächsten Deployment

### Paket- und Dienstgrenzen

1. **Keine Installationen oder Prune-Befehle im aktiven gemeinsamen Produktionsbaum.** `cd backend` und `npm --prefix …` gelten nicht als Nachweis einer isolierten Installation. Vorher effektiven Workspace, Installationswurzel und Schreibbereich prüfen.
2. Neue Releases in einem isolierten Verzeichnis mit eigenem Abhängigkeitsbaum erzeugen. Falls Dienste absichtlich einen Workspace teilen, den gesamten Workspace als gemeinsame Release-Einheit testen und zurückrollen.
3. Produktiv benötigte Loader gehören in Produktionsabhängigkeiten. Für Bookmer ID entweder `tsx` mit aktualisiertem Lockfile nach `dependencies` verschieben oder vorab in JavaScript übersetzen und das gebaute JavaScript starten. Umsetzung gehört in das Repository von Bookmer ID, nicht in dessen Verbraucher `Bookmer/app`.
4. Saubere Installation aus dem vorgesehenen Lockfile auf passender Plattform prüfen. Nicht durch wahlloses Nachinstallieren weiterer Root-Pakete einen defekten Dependency-Baum dauerhaft verdecken.
5. Runtime-Dateien, Secrets und Datenbanken bleiben außerhalb austauschbarer Releases. Keine `.env`, Tokens, Rohlogs oder Datenbank-Dumps auf GitHub veröffentlichen.

### Neustart, Healthchecks und Rückfall

6. Neustarts auf explizit benannte Dienste begrenzen. Kein automatischer Fallback auf `pm2 reload all` für ein Einzelprojekt. Gemeinsame Wartung separat planen und protokollieren.
7. Vor Umschaltung den exakten Produktionsstart in isolierter Umgebung prüfen, einschließlich Modulauflösung und API-Readiness. Testprozesse dürfen keine produktiven E-Mails, Löschjobs oder anderen Hintergrundaktionen auslösen.
8. Nach Umschaltung Status **und Inhalt** von API-Readiness prüfen. Bei `id.bookmer.com/api/health` sind HTTP 200 und `ok === true` erforderlich. Bei geschützten APIs kann ein erwartetes 401 sinnvoll sein; ein beliebiger Nicht-000-Status einschließlich 500 ist kein Erfolg.
9. Ein roter Healthcheck muss das Deployment mit Exitcode ungleich null abbrechen und zum vorherigen geprüften Release zurückführen. Vorherigen Code **und** vorherige Abhängigkeiten aufbewahren; bloßes Zurücksetzen einer Frontend-`.next`-Datei repariert kein Auth-Backend.
10. Neustartzahl und stabile Laufzeit überwachen. PM2 `online` unmittelbar nach dem Start ist kein Readiness-Signal. Backoff, sinnvolle Grenzen und Alarmierung verhindern unbemerkte Neustartschleifen.
11. Nach einem Auth-Release einen autorisierten vollständigen Login mit Testkonto und einen authentifizierten API-Aufruf prüfen. Keine echten Kundendaten als Testmaterial verwenden.

### Änderungen über mehrere Aufgaben oder Projekte

12. Gemeinsame Deployments durch eine gemeinsame Serversperre serialisieren. Eine GitHub-Workflow-Concurrency-Gruppe schützt nur die darüber laufenden Jobs, nicht unabhängige SSH-Sitzungen oder andere Repositories.
13. Sofort vor jeder Änderung die aktuelle Datei lesen, nur den erforderlichen Abschnitt ändern und eine passende Sicherung erstellen. Fremde Änderungen niemals mit einem alten Snapshot überschreiben.
14. Release-Protokoll mit UTC-Zeit, Commit-SHA, ausführendem Workflow/Operator, betroffenen Diensten, Readiness-Ergebnis und Rollback-Ergebnis führen. Zugangsdaten niemals protokollieren.

## 7. Noch offene technische Maßnahmen

Diese Tabelle beschreibt erforderliche Folgearbeit; sie behauptet nicht, dass dieser Dokumentations-Commit die Maßnahmen implementiert.

| Priorität | Maßnahme / Eigentümer | Abnahmekriterium | Status |
| --- | --- | --- | --- |
| P0 vor nächstem Dependency-Deploy | Bookmer ID: produktive `tsx`-Deklaration oder vorkompiliertes Backend | Produktionsinstall und exakter Start funktionieren ohne Recovery-Symlink | Offen |
| P0 vor nächstem Dependency-Deploy | Plattform/Bookmer Deploy: Installationen aus gemeinsamem Live-Baum entfernen | Deploy von Bookmer ändert keine ID-Abhängigkeiten; automatisierter Nachweis | Offen |
| P0 | Dependency-Auflösung einschließlich `side-channel-list`/`object-inspect` reproduzieren | Saubere Installation, Backend-Start und Healthcheck erfolgreich | Offen |
| P0 | API-Readiness als verpflichtendes Release-Gate plus Rollback | Absichtlich fehlendes `tsx` führt in isoliertem Test zum Abbruch vor Umschaltung | Offen |
| P1 | Ungezielte PM2-Neustarts entfernen und gemeinsame Deploy-Sperre einführen | Nur freigegebene Dienste werden neu gestartet; konkurrierender Deploy wartet | Offen |
| P1 | Überwachung für ID-Readiness und Neustartschleifen, mit benanntem Empfänger | Simulierter Fehler löst zeitnah einen Alarm aus | Offen |
| P1 | Neustart um 06:01:40 und zweiten Moduldefekt zuordnen | Abgleich mit Deploy-Jobs/Auditdaten statt Vermutung | Offen |
| P1 | Authentifizierter End-to-End-Test | Testkonto: Login, Callback, Session und geschützter API-Aufruf erfolgreich | Offen |
| Erledigt | Gezielte Recovery, öffentliche API-Prüfung, Bericht und Beweissicherung | Siehe Abschnitte 5 und 8 | Erledigt |

Im untersuchten `scripts/remote-selfhosted-runtime.sh` stehen weiterhin ein Backend-Install mit `--omit=dev`, ein möglicher `pm2 reload all`-Fallback und ein API-Check, der jeden Nicht-000-Status akzeptiert. Zudem endet dessen abschließende Prüfung mit `pm2 status`, ohne einen fehlgeschlagenen Healthcheck ausdrücklich in einen Fehler-Exit umzuwandeln. Diese Risiken sind anhand des Quelltexts nachvollziehbar; daraus folgt nicht automatisch, dass genau dieser Workflow den untersuchten Vorgang ausgelöst hat.

Auch `/opt/bookmer-platform/scripts/deploy-platform-safe.sh` prüft abschließend nur die beiden Frontend-Seiten. Die Auth-API muss als eigene Abhängigkeit in die Freigabe aufgenommen werden.

## 8. Beweissicherung und Grenzen

Ausgewählte Originalprotokolle wurden vor weiterer npm-Logrotation unter `/opt/bookmer-runtime/incident-2026-09-05/` root-exklusiv gesichert. **Diese Dateien bleiben auf dem Server**, da Rohprotokolle sensible Inhalte enthalten können. Dieser Bericht enthält nur notwendige technische Auszüge, keine Tokens, Cookies, privaten Schlüssel, Nutzeradressen oder kompletten Logs.

| Gesicherte Datei | SHA-256 |
| --- | --- |
| `2026-09-04T15_17_38_726Z-debug-0.log` | `bc0357a0a185b770af9aee9601aef6a6a93ccfac591b9884005822e252577052` |
| `2026-09-05T01_34_55_141Z-debug-0.log` | `54d439f1f9b407b6da68deaccb16416494a034daaf1259fbe448fa276c5657bd` |
| `pm2-snapshot.log` | `f8c288dc2659d82cb963457fb510b23252f2a3ffb81d2affa693e06f492d8815` |

Die Prüfsummen identifizieren den bei der Untersuchung gesicherten Stand. Sie ersetzen keine lückenlose externe Auditspur und beweisen nicht die Unveränderlichkeit vor der Sicherung.

Weitere geprüfte Quellen: produktives Plattform- und Bookmer-ID-Manifest, PM2-Startkonfiguration, öffentlicher Healthcheck, Caddy-Vergleich mit der Sicherung vor Used Fruit, aktuelle Deployment-Skripte sowie Browserprüfungen. Der erste Kurzbericht „Ursache der fehlenden Pakete noch offen“ wird für `tsx` durch Abschnitt 2 präzisiert; für `object-inspect` bleibt die Ursachenzuordnung offen.

## 9. Veröffentlichung dieses Berichts

Der Bericht liegt als eigene README im Bookmer-Repository und wird von der Haupt-README und dem Agentenleitfaden verlinkt. Die bestehende Produktdokumentation bleibt erhalten.

Ein Push auf `main` löst laut `.github/workflows/deploy-selfhosted.yml` automatisch ein Produktionsdeployment aus. Deshalb wird dieser Bericht auf einem Dokumentationsbranch mit Pull Request veröffentlicht. **Vor einem Merge muss der oben beschriebene unsichere Deployment-Pfad behoben oder für diese reine Dokumentationsänderung nachweislich ausgenommen sein.** Dieser Bericht allein ist keine Freigabe für einen erneuten produktiven Install.
