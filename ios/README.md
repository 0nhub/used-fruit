# Used Fruit für iPhone

> **Gemeinsames Backend:** Der aktuelle Store verwendet die Staging-API, native Apple-Anmeldung und Keychain-Tokens. Vertrag und Freigabesperren: [API](../docs/api/README.md), [Umsetzungsprotokoll](../docs/backend-implementation.md). Der Debug-Testzugang dient ausschließlich lokalen Screenshots und ist kein Backend-Testkonto. Echte Abnahme benötigt zwei Apple-Konten und ein physisches iPhone.

Native SwiftUI-App für **iPhone mit iOS 26 oder neuer**, ohne WebView und ohne Drittanbieter-Abhängigkeiten. Lokaler interaktiver Prototyp, noch keine App-Store-Veröffentlichung.

## Lokal starten

1. `ios/UsedFruit.xcodeproj` in Xcode 26 öffnen.
2. Scheme **UsedFruit**, einen iPhone-Simulator auswählen.
3. **⌘R** drücken.
4. Auf dem Startbildschirm **Mit Test-Account starten** wählen.

Das Projekt wurde mit Xcode 26.6 im iPhone-17-Pro-Simulator (iOS 26.5) gebaut, installiert und gestartet. Debug- und Release-Simulatorbuilds sind erfolgreich. Der Testzugang ist mit `#if DEBUG` eingeschlossen; der Release-Build enthält weder die Schaltfläche noch `enterDemo`. Das App-Icon verwendet das bestehende Used-Fruit-Logo.

## Erste Abläufe

- **Entdecken:** Raster wie die Website, Geräteabbildungen, kreisrunde Herzen, horizontale Filter-/Sortier-/Kategoriezeile. Standort und Umkreis, Preis, Modell, Größe, Jahr, Farbe, RAM, Speicher, Tastatur, Zustand, Verpackung, Garantie, Batterie und Versand. Sortierung nach Aktualität, Preis oder Entfernung.
- **Favoriten unter Konto:** Angebote merken und entfernen; lokal gespeichert.
- **Inserieren:** dynamische Web-Schrittfolge von Kategorie und Modell über Chip/Jahr und Ausstattung bis Zustand, Verpackung, Garantie, Batterie, Preis, PLZ/Ortsteil und Versand. SIM-Lock nur für iPhone/Cellular-iPad; Tastatur nur für MacBooks. Eindeutige Optionen automatisch gesetzt. Entwurf bleibt über Tabwechsel und App-Neustart erhalten. Zurück und Weiter stehen direkt unter der Auswahl; die Fortschrittsanzeige entfällt.
- **Nachrichten:** Drei Beispiel-Unterhaltungen im Testkonto; Unterhaltung aus einem Angebot öffnen, lokale Nachrichten schreiben, zum Angebot springen.
- **Konto:** Profilbild antippen für die Emoji-Auswahl; Name, Standort, Beschreibung, Favoriten, eigene Angebote, blockierte Profile, Rechtliches und Abmeldung. Die E-Mail-Einstellung ist ausdrücklich als lokale Vormerkung gekennzeichnet; sie versendet noch keine E-Mails.

Die native `TabView` übernimmt Liquid Glass vom System. Vier Tabs (Entdecken, Inserieren, Nachrichten, Konto) zeigen ausschließlich Icons; nur der aktive Tab verwendet die gefüllte Variante. VoiceOver-Bezeichnungen bleiben erhalten. Schriftgrößen, Kontraste und Bedienelemente verwenden SwiftUI-Systemstandards. Produktdarstellungen sind native Canvas-Zeichnungen nach den vorhandenen Web-Illustrationen, keine offiziellen Produktfotos.

## Anmeldung und Daten

Der Einstieg sperrt die Plattform bis zur Apple-Anmeldung oder dem Debug-Testzugang. Der native Apple-Button nutzt AuthenticationServices. Die Apple-Benutzerkennung liegt im Keychain; beim App-Start wird der Berechtigungsstatus geprüft, Widerruf meldet ab. Namen werden beim ersten Apple-Login übernommen, später lokal gelesen. Apple-Schlüssel oder Client-Secrets gehören niemals in die App.

Für ein echtes iPhone muss Xcode mit dem berechtigten Developer-Team angemeldet sein und das Provisioning für `de.usedfruit.app` mit Sign in with Apple aktiv sein. Die bestehenden Team-/Bundle-IDs sind vorkonfiguriert. Eine erfolgreiche persönliche Apple-Anmeldung auf Hardware wurde nicht geprüft.

**Die App ist derzeit ein lokaler Prototyp:** Demo-Angebote, Inserate, Favoriten und Nachrichten werden pro Identität in UserDefaults gespeichert. Es werden keine Nachrichten verschickt, keine Zahlungen ausgelöst und keine Inserate auf usedfruit.de veröffentlicht. Auch ein Apple-Login ändert diese Grenze nicht. Der Test-Account erhält keine Serversitzung. Die bestehende Website hat bislang ebenfalls keine gemeinsame Marktplatzdatenbank.

## Nächste Umsetzung

1. Gemeinsame API und Datenbank mit stabilen Nutzer-IDs, serverseitigen Zugriffsrechten und Medien-Uploads.
2. Native Apple-Token serverseitig gegen Audience, Issuer, Nonce und Ablauf prüfen und App-Sitzungen ausgeben; PKCE/Nonce-Konzept vor der Netzwerkanbindung ergänzen.
3. Reale Chats, Push über APNs, Melden/Blockieren, Kontolöschung und geräteübergreifende Synchronisierung.
4. Fotos und vollständige Inseratvalidierung, echte Produktdaten, Fehler-/Offlinezustände.
5. Weitere Integrationstests, Hardwareprüfung, App-Store-Datenschutz und TestFlight.

## Dateien

- `Store.swift`: lokale Daten, Demo-Account, Apple-Zugang, Keychain.
- `UsedFruitApp.swift`: Einstieg und vier Icon-Tabs.
- `MarketplaceViews.swift`: Katalog, Favoriten, Details.
- `AccountAndMessages.swift`: Chat, Konto und Profil-Auswahl.

## Apple-Referenzen

- [SwiftUI und das neue Design / native TabView](https://developer.apple.com/videos/play/wwdc2025/323/)
- [Offizielle Sign-in-with-Apple-Schaltflächen](https://developer.apple.com/documentation/signinwithapple/displaying-sign-in-with-apple-buttons-in-your-app)

## Gemeinsame Kataloglogik und Prüfungen

`node ios/scripts/export-web-catalog.cjs` (im Repository-Stamm) exportiert die vorhandenen TypeScript-Daten und Web-Schrittfolgen nach `UsedFruit/WebCatalog.json`: 15 Modelle, 22 Seed-Inserate, Ortsverzeichnis, Optionslisten und 249 Vergleichsfälle. Bei Änderungen an Web-Modellen den Export neu ausführen. Die native UI verwendet diese Daten; es gibt keinen zweiten, vereinfachten Vier-Geräte-Katalog mehr.

`WebCatalog.swift` enthält native Optionsauflösung und Validierung. `CatalogFilters.swift` filtert die Angebotsdaten, `ListingWizardView.swift` zeigt den dynamischen Ablauf. Der Datenexport ist im Xcode-Projekt als Ressource enthalten.

Prüfen aus dem Repository-Stamm:

```sh
swiftc ios/UsedFruit/WebCatalog.swift ios/Tests/CatalogParity.swift -o /tmp/usedfruit-catalog-parity
/tmp/usedfruit-catalog-parity ios/UsedFruit/WebCatalog.json
```

249 Schrittfolgen stimmen mit dem Web-Code überein; Grenzwerte für Batterie/Preis, Tastaturlayout und Standort wurden geprüft. Der Xcode-UI-Test (`⌘U`) prüft die vier Tabs, Filtersektionen, den iPhone-Wizard bis zum aktivierten Speichern-Button und Favoriten unter Konto. Er schreibt kein Inserat. Debug- und Release-Builds bleiben getrennt.

## UI und API-Prüfung — 2026-09-05

Entdecken enthält keine Suchleiste und keinen Navigationstitel. Das zweispaltige Raster hat Trennlinien und feste Titelhöhen für gleich ausgerichtete Preise. Tastaturinformationen erscheinen ausschließlich in den Details. Filter verwenden kompakte einzeilige Tastaturbezeichnungen.

Der Simulator-UI-Test prüft außerdem identische Preishöhen, fehlende Suche und Fortschrittsanzeige, drei Demo-Chats, Profil-Icon-Auswahl und Kontoeinstellungen. Testdaten sind mit `--ui-testing` vom normalen Testkonto getrennt.

Die angefragte gemeinsame API konnte nicht gefunden werden: `/api/v1/catalog`, `/api/v1/me` und `/api/v1/listings` liefern auf usedfruit.de HTTP 404. Die vorhandene Backend-Dokumentation beschreibt einen Plan; SES-Einrichtung allein stellt keine Marktplatz-API bereit. Für die Integration wird der tatsächliche API-Vertrag samt erreichbarer Basis-URL benötigt. Es gibt keinen stillen Fallback, der lokale Speicherung als Serversynchronisierung ausgibt.

## Chat, Avatare und Filter

Im geöffneten Chat ist die untere Tab-Leiste ausgeblendet; die Eingabe steht in einem eigenen umrandeten Bereich. Die Zurück-Navigation bleibt erreichbar. Die Avatar-Auswahl enthält zahlreiche Vorschläge und akzeptiert ein frei eingegebenes Emoji einschließlich zusammengesetzter Sequenzen und Hautfarben. Die iPhone-Emoji-Tastatur stellt die vollständige systemseitige Auswahl bereit.

Filterbereiche sind standardmäßig geöffnet, mit Trennlinien und einspaltigen Auswahlflächen. Sie lassen sich animiert einklappen; reduzierte Bewegung wird berücksichtigt. Der Simulator-UI-Test prüft Einklappen, Nachrichteneingabe ohne Tab-Leiste sowie das Speichern eines zusammengesetzten Avatar-Emojis.

## Inseratdetails und Nachrichtenübersicht

Die native Detailansicht verwendet die exportierten Hardware- und Anbieterinformationen der Website, einschließlich Emoji, Mitgliedsdatum, Rang, Bewertungszahl, positivem Anteil und Auszeichnungen. Die Daten sind ein gemeinsamer Katalogexport, keine Live-Synchronisierung von Browser-Profilen. Anbieter lassen sich mit ihren Inseraten öffnen. Native MapKit-Karten zeigen den PLZ-/Stadtmittelpunkt mit Vollbild und Apple-Karten-Link; die Vorschau nimmt keine Scroll-Gesten entgegen.

„Nachricht“ öffnet das Gespräch. „Kaufen“ öffnet die Bestätigung eines Angebots zum angezeigten Inseratspreis und speichert es über die gemeinsame Angebote-API. Eine Zahlung wird dabei nicht ausgelöst. Die Nachrichtenliste zeigt Name, Vorschau und Zeitpunkt ohne Gerätetitel; neue Nachrichten speichern `sentAt`. Alte Nachrichten ohne gespeicherten Zeitpunkt erhalten keine erfundene Uhrzeit. Datumsangaben verwenden Tag.Monat.Jahr, heutige Nachrichtenvorschauen HH:mm.

Geprüft: Inserat öffnen, Teilen-/Herz-Aktionen vorhanden, Karte und Vollbild, Anbieterbereich und Kaufabsicht im Chat. Zusätzlich bestehen der bisherige Filter-/Wizard-/Konto-UI-Test und alle 249 Katalogvergleichsfälle.

## UI-Abgleich am 05.09.2026, 17:41

Filteroptionen stehen zweispaltig. Im Konto sind Standort, Kurzbeschreibung, rechtliche Links und der Testkonto-Untertitel entfernt; Antippen des Namens öffnet einen Namensdialog. Die Nachrichtenübersicht verwendet Gerätebilder und Datum/Uhrzeit.

Inserat-Aktionen stehen in der oberen Navigationszeile; zusätzliche Abschnittstitel und Standort-Icons entfallen. Kauf-/Nachricht-Aktionen schweben mit Glass-Stil ohne vollflächigen Hintergrund. Kartenaktionen nutzen gleiche Breiten ohne Vollbild-Pfeil.

Im Wizard ist die Kapazität als Drehrad von 100 bis 70 Prozent (70 oder weniger) auswählbar. Der Preis öffnet automatisch den Zahlenblock. Bei kurzem Inhalt steht Weiter unten rechts, bei langem Inhalt unter der Auswahl. Die Straße wird nur bei aktivierter genauer Adressanzeige in die Inseratdaten übernommen. Für diese Einstellung hat der Nutzer die Adress-Geokodierung über Apple ausdrücklich freigegeben; bei Fehlern bleibt die Karte als ungefähre Ortsanzeige beschriftet.

Die Simulator-UI-Tests vor Abschluss der parallelen API-Umstellung bestehen. Diese Prüfung ist keine Verifikation der gleichzeitig bearbeiteten Live-API.

## Kaufangebote

„Kaufen“ zeigt Produkt, Betrag und Verkäufer vor dem Absenden. „Verbindlich anbieten“ legt über POST /conversations/{id}/offers ein serverseitiges Angebot an. Derselbe Idempotenzschlüssel bleibt bei einem fehlgeschlagenen Versuch für die Wiederholung erhalten; laufende Anfragen sperren die Schaltflächen.

Das Gespräch zeigt den festen Betrag und den Serverstatus. Der Empfänger kann ablehnen oder nach einer weiteren Bestätigung annehmen (PATCH /offers/{id}). Das vorhandene Backend markiert die Anzeige bei Annahme transaktional als verkauft und lehnt andere offene Angebote ab. Eine Annahme des eigenen Angebots ist serverseitig ausgeschlossen.

Zahlungsabwicklung, Treuhand, Auszahlungen und Versandabschluss sind nicht implementiert. „Kauf vereinbart“ bedeutet ausdrücklich keinen bestätigten Zahlungseingang. Der native Client nutzt weiterhin Staging; kein Produktionsrelease durch diese UI-Änderung.
