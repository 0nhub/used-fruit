# Gemeinsames Backend: Umsetzungs- und Prüfprotokoll

Stand: 05.09.2026, Abend-Bestandsaufnahme. **Keine Produktionsfreigabe.**

Website und native App verwenden im aktuellen Quellstand `/api/v1`. Die öffentliche Website läuft weiterhin auf dem bisherigen Release. Neue Funktionen werden auf https://staging.usedfruit.de geprüft. Produktion wird weder migriert noch umgeschaltet, bevor die gemeinsame Abnahme vollständig bestanden ist.

## Schritt 1 – Datenhaltung und Betrieb

**Implementiert und geprüft.** Native PostgreSQL 16, getrennte Datenbanken `usedfruit_staging` und `usedfruit_prod`, eigene eingeschränkte Rollen; Zugriff nur intern. Drei versionierte Migrationen ausschließlich auf Staging angewandt. Produktion enthält noch kein Marktplatzschema.

- Aktiver öffentlicher Release: `/opt/used-fruit-releases/titles-20260905`.
- Rückfallstände `profile-20260905`, `smooth-20260905` und verlinkte gemeinsame Abhängigkeiten erhalten. Vor einem späteren Wechsel alle Referenzen erneut prüfen.
- 20 unbenutzte Used-Fruit-Releases nach Quellenarchivierung und SHA-256-Prüfung entfernt. Keine pauschale Docker-/Bookmer-Bereinigung.
- Mehr als 10 GB frei vor Installationen und Builds; letzte Betriebsprüfung rund 11,7 GB frei.
- Staging-Code mit eigenen Abhängigkeiten: `/opt/used-fruit-backend-staging`.
- Medien: `/var/lib/used-fruit/{staging,prod}/media`; Löschungen werden vom Worker in `media-trash` verschoben und erst nach sieben Tagen entfernt.
- Täglicher Backup-Timer 03:20 UTC: sieben tägliche und vier wöchentliche Datenbankstände. Root-geschützte Konfigurationssicherung enthält die für verschlüsselte Apple-Tokens notwendigen Schlüssel.
- Wiederherstellung in einer temporären Datenbank erfolgreich: Nutzer-, Inserat-, Nachrichten- und Outbox-Zahlen sowie Nachrichtentext-Prüfsumme identisch. Testdaten und Wiederherstellungsdatenbank anschließend entfernt.
- Lokale Sicherungen ersetzen kein Backup außerhalb dieses Servers.

## Schritt 2 – Vertrag und Konten

**Implementiert; echte Apple-Konten noch abzunehmen.** OpenAPI 3.1: `docs/api/openapi.json`; Clienthinweise: `docs/api/README.md`.

Benutzerrechte basieren auf UUIDs, nicht Namen/E-Mail. Öffentliche DTOs enthalten keine E-Mail oder privaten Geräteseriennummern. Web nutzt signierte HttpOnly-Cookies plus Datenbanksitzung und Origin-Prüfung. iOS nutzt serverseitige Apple-Challenge, geprüfte ID-Tokens und Authorization-Code-Austausch, 15-Minuten-Zugangstokens und rotierende 30-Tage-Refresh-Tokens in der Keychain. Wiederverwendung widerruft die Tokenfamilie. Apple-Refresh-Tokens werden verschlüsselt gespeichert; Kontolöschung legt einen dauerhaften Apple-Widerrufsauftrag an.

Web-Service-ID `de.usedfruit.web` ist Apples primärer App-ID `de.usedfruit.app` zugeordnet. Staging-Callback in Apple Developer gespeichert. Dasselbe reale Apple-Konto auf Web/iPhone muss noch denselben internen Nutzer bestätigen.

## Schritt 3 – Inserate, Profile, Katalog

**Implementiert und automatisiert geprüft; angemeldete UI-Abnahme offen.** Serverseitige Modell-/Varianten-/Tastatur-/SIM-Lock-Validierung, Integer-Cent, feste Verkäufer-ID und numerische Anzeigenummer. Suche mit Filtern, Cursor-Seiten, Preis-/Zeit-/Entfernungssortierung und Umkreis auf Basis des vorhandenen Ortsverzeichnisses. Unbekannte Koordinaten werden bei Entfernungssuche nicht erfunden.

Web-Hooks und nativer Store lesen und schreiben die API. Lokale Altbestände werden nicht automatisch hochgeladen; lokale Speicherung dient Entwürfen, Cache und Darstellung. Veröffentlichung bleibt bei Fehlern im Entwurf. Wiederholungen verwenden denselben Idempotenzschlüssel. Profilcover werden autorisiert hochgeladen, auf JPEG/PNG/WebP, 8 MiB und 24 MP begrenzt und serverseitig ohne Metadaten neu kodiert. Native Bearbeitung, Status, Favoriten, private Notizen und Cover sind angebunden.

Staging-Karten verwenden einen eigenen auf `staging.usedfruit.de` begrenzten MapKit-Token. Der Produktions-Token wurde nicht verändert.

## Schritt 4 – Chats, Angebote, Sperren

**Implementiert und automatisiert geprüft; Zwei-Konten-UI-Abnahme offen.** Teilnehmer- und Absender-IDs stammen aus der Sitzung. Aktive Clients aktualisieren alle fünf Sekunden; unveränderte Gesprächsverläufe werden wiederverwendet. Cursor-Paginierung für Gespräche und Nachrichten. Archiv und Stummschaltung je Konto. Beidseitige Sperren in Suche, Details, Profil und Kommunikation.

Leseposition und tatsächliche Sichtbarkeit sind getrennt: `message_reads` speichert nur angezeigte Nachrichten. Überspringen zu einer neueren Nachricht unterdrückt keine Mail für eine ungesehene ältere Nachricht. Angebotsannahme und Verkauf erfolgen in einer Transaktion; nur ein Angebot kann angenommen werden. Nach Kontolöschung bleiben anonymisierte Verläufe lesbar, neue Kommunikation ist gesperrt.

## Schritt 5 – E-Mail und Push

**SES eingerichtet und geprüft; APNs-Schlüssel und laufender Worker noch offen.**

- Sichtbare, vorausgewählte E-Mail-Option beim Onboarding; Entscheidung zentral gespeichert. Browser-/iOS-Berechtigung unabhängig davon.
- SES Stockholm: `usedfruit.de` verifiziert, DKIM erfolgreich, MAIL FROM `mail.usedfruit.de` erfolgreich.
- Absender `Used Fruit <noreply@usedfruit.de>`. Eigener SMTP-Nutzer mit auf diese SES-Identität und Absenderadresse begrenzter Inline-Berechtigung. Keine Änderung der Bookmer-Berechtigungen.
- Simulatorversand erfolgreich. Bounce und Complaint über eigenes SNS-Thema an den signaturgeprüften HTTPS-Webhook bestätigt; beide Simulatorereignisse gespeichert.
- Jeder Nachrichtenauftrag dauerhaft in derselben Transaktion, E-Mail fällig nach 120 Sekunden. Vor Übergabe Lesebeleg, Einstellung, Sperre und Stummschaltung erneut prüfen. Keine Bündelung.
- Push-Transport, Gerätesitzungen, ungültige Tokens, Deep Links, aktive Unterhaltung und native Berechtigungsabfrage implementiert. Maximal fünf aktive Push-Geräte pro Konto begrenzen Laufzeit und Ressourcen.
- Worker-Unit vorbereitet/installiert, **nicht aktiviert**, weil der APNs-Schlüssel fehlt. Sie verarbeitet auch Medienbereinigung und Apple-Widerrufe. Noch keine vollständige Ende-zu-Ende-Benachrichtigungsabnahme.
- Die automatische Freigabeprüfung verlangt eine ausdrückliche Nutzerbestätigung für einen APNs-Schlüssel mit „Sandbox & Production“; Frage wurde gestellt. Apple lässt diesen Umfang nach Speicherung nicht ändern.
- Bekannte technische Grenze: Nach unklarer externer Übergabe wird `uncertain` gespeichert und nicht blind erneut gesendet. Bereits an SES/APNs übergebene Sendungen können nicht zurückgerufen werden.

## Schritt 6 – Community und Kontoverwaltung

**Implementiert und teilweise automatisiert geprüft; Moderator-/Bewertungs-UI-Abnahme offen.** Meldungen zentral, `/verwaltung` serverseitig auf explizite Administratoren begrenzt. Kein Konto automatisch zum Administrator ernannt. Bewertungen nur durch Teilnehmer eines angenommenen Angebots nach zwei Tagen; Reputation nur aus zentralen Vorgängen. Kontolöschung entfernt öffentliche Inhalte/Privatdaten, widerruft Sitzungen und anonymisiert das Profil.

## Schritt 7 – Staging und Abnahme

**Staging aktiv, Produktionsfreigabe gesperrt.** Eigene Domain, HTTPS, interne App-Adresse `10.0.3.1:3003`, eigener systemd-Dienst. Caddy-Änderung ausschließlich zusätzliche Staging-Site, `noindex`. Datenbankmigrationen additiv; vorherige Migrationsdateien werden per Checksumme geschützt.

- 22 Backend-Prüfgruppen in `tests/backend/integration.ts` (einschließlich anonymisierter Verlauf nach Kontolöschung). In dieser Sitzung nicht erneut gegen die Staging-Datenbank ausgeführt: keine lokale `DATABASE_URL` und kein SSH-Zugang zum Hetzner-Host aus dieser Arbeitsumgebung.
- Wiederherstellung mit gefüllten synthetischen Daten erfolgreich. Tests bereinigen ausschließlich ihre eigenen Datensätze.
- Web-Produktionsbuild und iOS-Simulatorbuilds erfolgreich. Release-Konfiguration enthält keinen Demo-Zugang. Debug-Screenshotmodus aus der parallelen iOS-Aufgabe bleibt ausschließlich lokal und blockiert API-Schreibaktionen.
- Lokale Überwachung alle fünf Minuten: freier Speicher, API, API-Fehlerhäufung, Backupfehler/Alter und hängen gebliebene/fehlgeschlagene Versandaufträge. Status `/var/lib/used-fruit/health.json`, systemd-Journal; kein externer Alarmkanal eingerichtet.
- Die parallele Aufgabe „iOS App“ hat weitere Dateiänderungen während dieser Integration ausdrücklich pausiert. Ein dort bereits hochgeladener App-Store-Connect-Build ist nicht automatisch eine Abnahme dieses neuesten Quellstands.

### Noch zwingend vor öffentlicher Freigabe

1. Nutzerentscheidung zur APNs-Schlüsselumgebung, Schlüssel sicher installieren, Staging-Worker starten und echten Push prüfen.
2. Zwei echte Apple-Testkonten; persönliche Anmeldung/Systemfreigaben durch den Nutzer. Aktuelle App auf physischem iPhone verwenden.
3. Im Web veröffentlichen, auf anderem iPhone sehen/kontaktieren; gleiche Identität über beide Clients; unbefugte Zugriffe, Kontowechsel, Sperren, Archiv/Mute und Profil-/Medienänderungen im UI prüfen.
4. Reale Mailfristen (vor/nach zwei Minuten), einzelne Mails, E-Mail aus, Sperre und Mute. Push Vordergrund/Hintergrund/aktiver Chat/abgelehnte Berechtigung/Linköffnung.
5. Moderatorrolle ausdrücklich einem vereinbarten Testkonto zuweisen und Meldungsablauf sowie Bewertung nach bestätigtem Abschluss abnehmen.
6. Erst nach vollständiger dokumentierter Abnahme Produktionsmigrationen und Releasewechsel. Leerer Produktionsstart, Rückfallrelease und frische Datenbanksicherung erhalten. App-Store-Veröffentlichung gesondert.

## Bestandsaufnahme 05.09.2026 (diese Sitzung)

Lokaler Arbeitsbaum `/Users/gabriel/Used Fruit`, Branch `main`, zwei lokale Commits vor `origin/main`, zusätzlich viele uncommittete Backend-/Web-/iOS-Dateien. Gemeinsam genutzte Dateien (`ListingWizard.tsx`, `types.ts`, `useListings.ts`, `listing/[id]/page.tsx`) zuletzt 20:00 Uhr geändert; iOS `Store.swift` 19:21. Keine parallelen Schreibzugriffe in dieser Sitzung. Freier Speicher lokal rund 325 GB. Produktion nicht angefasst.

HTTPS-Staging von diesem Rechner: `https://staging.usedfruit.de/` → 200, `GET /api/v1/catalog` → 200 mit Kategorien Mac/iPad/iPhone. SES-Webhook liegt unter `/api/webhooks/ses` und gehört bewusst nicht in den `/api/v1`-Vertrag.

OpenAPI 3.1 und `src/app/api/v1/[...path]/route.ts` haben dieselben 44 Operationen. Ergänzt: fehlende `operationId` `get_me_ratings` für `GET /me/ratings`.

Kontowechsel im Code (noch keine UI-Abnahme mit zwei Apple-Konten): Web archiviert `used-fruit-*` unter `used-fruit-account:<uuid>` und schreibt das neue Profil aus der API; Gast-Entwurf überlebt nur den OAuth-Callback. iOS leert Speicher bei Identitätswechsel, hält Entwürfe und Idempotenzschlüssel kontospezifisch, Keychain-Tokens werden bei Logout gelöscht. Der Katalog-Cache (`backend.catalog.cache`) ist öffentlich und bewusst geteilt. APNs-Gerätetoken bleibt geräteweit und wird beim nächsten Login dem aktuellen Konto zugeordnet.

**Gestoppt vor Punkt 1:** APNs-Schlüssel mit Umgebung „Sandbox & Production“ ist nach dem Speichern bei Apple nicht mehr änderbar. Keine Schlüsselanlage, keine Serverablage, kein Worker-Start ohne ausdrückliche Zustimmung.
