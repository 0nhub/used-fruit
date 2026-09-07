# Backend-Prüfung: Web, iOS und Benachrichtigungen

Stand: 5. September 2026. Bestandsprüfung; die unten vorgeschlagenen Schnittstellen sind **noch nicht implementiert**. Die parallele iOS-Entwicklung wurde nur gelesen, nicht verändert.

## Ergebnis

Used Fruit hat einen laufenden Next.js-Server mit wenigen API-Routen, aber **keine angeschlossene gemeinsame Marktplatzdatenbank**. Inserate, Profile, Favoriten und Chats werden im Web lokal im Browser gespeichert. Die native iOS-App speichert ihre eigenen Daten lokal in UserDefaults. Beide Anwendungen teilen bisher nur exportierte Katalog-/Demodaten, keinen aktuellen Nutzerzustand.

Ein Web-Inserat wird deshalb nicht für andere Geräte veröffentlicht. Eine Chatnachricht wird lokal gespeichert und nicht an ein anderes Nutzerkonto zugestellt. Apple-Anmeldung und eingerichtete SES-Absender ändern diese Grenzen nicht.

## Geprüfter Bestand

| Bereich | Aktuelle Umsetzung | Konsequenz |
|---|---|---|
| Web-Inserate | `src/lib/useListings.ts`: localStorage, zusammengeführt mit `SEED_LISTINGS` | Kein gemeinsamer Bestand; Hinzufügen, Ändern und Verkauf bleiben lokal |
| Web-Profile | `src/lib/profile.ts`: localStorage | Kein dauerhaftes serverseitiges Nutzerprofil |
| Web-Chats | `src/lib/messages.ts`: lokales Thread-Array | Keine echte Zustellung, keine serverseitigen Teilnehmerrechte |
| Favoriten, Notizen, Bewertungen | Browser-Speicher in den jeweiligen Hooks/Hilfen | Kein Abgleich mit iOS oder anderen Browsern |
| Blockieren/Stummschalten | Lokale Listen anhand normalisierter Namen | Keine verlässliche gegenseitige Sperre zwischen Konten |
| Web-Login | Apple-Token serverseitig validiert; signiertes HttpOnly-Cookie | Echte Anmeldung, aber kein Nutzer-Datensatz in einer Datenbank |
| E-Mail-Adresse | Scope `email` angefragt; `verifyAppleToken` gibt nur `sub` zurück | Verifizierte Empfängeradresse wird nicht gespeichert |
| Katalogmodelle | TypeScript-Daten, API liefert daraus erzeugte Zeilen | Leseschnittstelle vorhanden |
| Katalogbilder | Anbindung an Appbackend-Tabelle | Spezialisierter Fotodienst, kein Marktplatz-Backend |
| iOS | `ios/UsedFruit/Store.swift`: UserDefaults je Identität, Demo-Angebote | Zweiter lokaler Prototyp ohne Netzwerkabgleich |
| iOS-Login | AuthenticationServices; Apple-ID im Keychain; Berechtigungsstatus geprüft | Kein Austausch mit Used-Fruit-Server, kein API-Zugriffstoken |
| iOS-Katalog | `WebCatalog.json`, Exportskript aus Web-Daten | Statischer Snapshot; spätere Katalogänderungen benötigen neuen Export/App-Update |
| E-Mail-Versand | SES-Domain/DKIM bestätigt; Apple-Absender registriert | App-Anbindung, Empfängerdaten, Einstellungen und Versandverarbeitung fehlen |

### Existierende API-Routen

- `GET /api/auth/login`: Apple-Web-Login starten.
- `POST /api/auth/callback`: Web-Callback prüfen und Sitzung setzen. GET weist alte Callbacks ab.
- `GET /api/auth/session`: aktuelle Cookie-Sitzung lesen.
- `POST /api/auth/logout`: Web-Cookies löschen, mit Origin-Prüfung.
- `GET /api/catalog-models`: erzeugte Katalogmodellzeilen lesen.
- `GET /api/catalog-photos`: Katalogbilder lesen.
- `GET /api/mapkit-token`: MapKit-Token beziehen.

Keine Routen zum Veröffentlichen von Inseraten, Bearbeiten zentraler Profile, Senden/Empfangen von Chats oder Synchronisieren von Favoriten gefunden. Kein Datenbanktreiber oder Migrationssystem im Web-Paket vorhanden.

### Live-Server

- Aktiver Dienst: `used-fruit.service`, Release `/opt/used-fruit-releases/profile-20260905`.
- API-Routen im aktiven Release entsprechen obiger Liste.
- SHA-256 von `useListings.ts` und `messages.ts` stimmt zwischen lokalem Repository und Live-Release überein: Der lokale Befund trifft für die beiden zentralen Datenflüsse auch live zu.
- PostgreSQL läuft im Container `bookmer-db`; die gelesene Datenbankliste enthält bestehende andere Produkte, aber keine Used-Fruit-Datenbank. Das Container-Image allein belegt keinen verfügbaren Supabase-API-Dienst.
- Die Architekturprüfung hat keine Tabelleninhalte fremder Produkte gelesen. Eine ungenutzte Tabelle in einer fremden Datenbank lässt sich damit nicht ausschließen; entscheidend ist, dass Used Fruit keinerlei Anbindung daran hat.
- Dateisystem: 75 GB insgesamt, 70 GB belegt, rund 2 GB verfügbar, 98 % Auslastung laut `df`. Kapazität vor zusätzlichen Releases/Datenbanken erweitern oder gezielt bereinigen; keine Löschung durchgeführt.
- Backup-/Wiederherstellungsfähigkeit bestehender Datenbanken wurde nicht geprüft.

## Empfohlene gemeinsame Architektur

Web und iOS verwenden dieselbe versionierte HTTPS-API unter `https://usedfruit.de/api/v1`. Die API kann zunächst im vorhandenen Next.js-Server entstehen; ein zweiter Framework-Server ist dafür nicht erforderlich. Fachlogik und Datenzugriff sollten getrennt von den Route-Dateien liegen.

Eine eigene PostgreSQL-Datenbank mit eigener eingeschränkter Anwendungsrolle hält den verbindlichen Datenbestand. Bestehende Bookmer-Tabellen werden nicht für Used Fruit umfunktioniert. Ob dieselbe PostgreSQL-Instanz mit eigener Datenbank oder ein separater Datenbankdienst genutzt wird, erst nach Kapazitäts- und Backup-Prüfung entscheiden. PostgreSQL unterstützt Zugriffsrechte über Rollen: [offizielle Dokumentation](https://www.postgresql.org/docs/17/user-manag.html).

Browser-Speicher und iOS-UserDefaults bleiben für Entwürfe, Cache und Oberflächeneinstellungen geeignet. Veröffentlichte Daten müssen vom Server bestätigt werden. Profilbilder/Cover gehören in einen kontrollierten Dateispeicher; öffentliche Bild-URLs und Metadaten in die Datenbank.

### Gemeinsame Identitäten und Anmeldung

- Interne unveränderliche `userId`; separate Tabelle für geprüfte Apple-Identität. Anzeigename und E-Mail sind keine Identitätsschlüssel.
- Web behält sichere HttpOnly-Cookies. Native App tauscht ihren Apple-Anmeldenachweis über eine dafür vorgesehene Route gegen eine Used-Fruit-Sitzung aus; Zugangstoken kurzlebig, erneuerbare Sitzung widerrufbar, Geheimnisse im Keychain.
- Server prüft Apple-Signatur, Issuer, Ablauf, Nonce, Audience und Replay-Schutz. Native Bundle-ID `de.usedfruit.app` und Web-Services-ID `de.usedfruit.web` benötigen jeweils die passende Audience-Prüfung. Die lokale iOS-Prüfung von `credential.user` ersetzt das nicht. [Apple: serverseitige Verifikation](https://developer.apple.com/documentation/signinwithapple/verifying-a-user).
- iOS verwendet laut Xcode-Projekt Team `AUP84ZCD2B` und Bundle-ID `de.usedfruit.app`; die Web-Zuordnung ist in DEPLOYMENT dokumentiert. Die effektive Gruppierung im Apple-Portal und derselbe Account auf beiden Plattformen müssen vor Freigabe end-to-end überprüft werden. Keine Konten anhand gleicher Namen/E-Mails zusammenführen. [Apple: Gruppierung von Apps und Websites](https://developer.apple.com/help/account/capabilities/about-sign-in-with-apple/).
- Verifizierte E-Mail inklusive Private-Relay-Adresse serverseitig behalten; fehlende spätere Profildaten dürfen vorhandene Daten nicht leeren. Konto löschen muss nach Umstellung auch serverseitige Daten/Sitzungen und erforderliche Provider-Verknüpfungen behandeln.

### Datenmodell als Arbeitsgrundlage

| Daten | Zentrale Beziehung/Regel |
|---|---|
| users, auth_identities, sessions | Interne Nutzer-ID, geprüfte Provider-ID, widerrufbare Sitzungen |
| listings | `sellerId` als Fremdschlüssel; getrennte numerische Anzeigenummer; Status und Version |
| catalog_models, variants bzw. versionierter Katalogexport | Einheitliche Modell-/Farb-/Kategorie-IDs für Web und iOS |
| conversations, participants, messages | Teilnehmer-IDs; Absender aus Sitzung; Lesestand/Archiv je Teilnehmer |
| offers | Zustandswechsel serverseitig; Annahme/Verkauf atomar, keine Doppelannahme |
| favorites, listing_notes | Je Nutzer/Inserat eindeutig; Notizen privat |
| user_blocks, conversation_preferences | Sperren beidseitig bei Suche, Details und Nachrichten durchsetzen |
| notification_preferences | E-Mail und später Push getrennt; serverseitig gespeicherte Auswahl |
| notification_outbox | Dauerhafte Versandaufträge, Wiederholungen und Duplikatschutz |
| reports, moderation_actions | Meldungen und nachvollziehbare Sperrentscheidungen |
| ratings | An reale abgeschlossene Transaktionen und berechtigte Teilnehmer binden |

### Vorgeschlagene API-Flächen — noch nicht verfügbar

| Funktion | Geplante Routen |
|---|---|
| Nativer Login | `POST /api/v1/auth/apple`, `/auth/refresh`, `/auth/logout`; Nonce-Challenge nach finalem Auth-Vertrag |
| Eigenes Konto | `GET/PATCH/DELETE /api/v1/me` |
| Anbieterprofil | `GET /api/v1/users/{userId}` mit ausschließlich öffentlichen Feldern |
| Katalog/Filter | `GET /api/v1/catalog` mit Version und erlaubten Varianten |
| Suche/Inserate | `GET/POST /api/v1/listings`, `GET/PATCH/DELETE /api/v1/listings/{id}` |
| Eigene Inserate | `GET /api/v1/me/listings` einschließlich eigener inaktiver Angebote |
| Favoriten/Notizen | `GET /api/v1/me/favorites`, `PUT/DELETE /api/v1/me/favorites/{listingId}`, `PUT/DELETE /api/v1/me/notes/{listingId}` |
| Chats | `GET/POST /api/v1/conversations`, `GET/POST /api/v1/conversations/{id}/messages`, `PATCH /api/v1/conversations/{id}/preferences` |
| Angebote | `POST /api/v1/conversations/{id}/offers`, `POST /api/v1/offers/{id}/accept` bzw. `/decline` |
| Sperren | `GET /api/v1/me/blocks`, `PUT/DELETE /api/v1/me/blocks/{userId}` |
| Benachrichtigungen | `GET/PATCH /api/v1/me/notification-preferences`; später Geräte-Token für APNs |
| Meldungen | `POST /api/v1/reports` |

Vor Implementierung als OpenAPI-Vertrag mit konkreten DTOs, Fehlercodes und Beispielen festhalten. OpenAPI beschreibt HTTP-Schnittstellen sprachunabhängig und ist damit die gemeinsame Grundlage für Swift und TypeScript: [Spezifikation](https://spec.openapis.org/oas/latest.html).

Vertragsregeln: Geld als Integer-Cent/EUR statt uneinheitlichem Double, Zeiten in UTC/ISO-8601, stabile IDs, klar definierte Nullwerte/Enums, Cursor-Paginierung, serverseitige Filtervalidierung, Idempotenz für Veröffentlichung/Nachricht/Angebot. Fremde private Felder, genaue Adressen und Seriennummern nicht pauschal in öffentlichen Listing-Antworten ausgeben. Eigentümer und Absender immer aus der Serversitzung ableiten. Bestehende Web-Sicherheitsprüfungen nicht einfach für native Requests abschalten.

## Reihenfolge der Umstellung

1. Kapazität, separate Datenbank, eingeschränkte Rolle, Migrationen und getestete Backups vorbereiten; API-/Datenvertrag mit der parallelen iOS-Arbeit teilen.
2. Zentrale Nutzerprofile und Apple-Anmeldung für beide Plattformen mit derselben internen Nutzer-ID umsetzen.
3. Inserate, Katalog, Suche und Favoriten anbinden; Web-Hooks und iOS-Store auf dieselbe API umstellen.
4. Echte Chats mit Teilnehmerrechten, Leseständen, Angeboten und gegenseitigen Sperren bereitstellen. Zunächst Polling möglich; Echtzeit-Transport später ergänzen.
5. Nachricht und Versandauftrag in derselben Transaktion speichern. Worker prüft Empfänger, E-Mail-Auswahl, Block/Mute-Regeln und versendet über SES. Zustellfehler/Bounces/Complaints verarbeiten. APNs ist für native Push-Mitteilungen eine zusätzliche Integration.
6. Meldungen, Reputation und Kontolöschung vollständig serverseitig ergänzen; verbliebene lokale Produktfunktionen klar abgrenzen.

Lokale Daten nicht automatisch als vertrauenswürdige echte Veröffentlichungen importieren: Seed-Angebote und Demo-Chats bleiben Testdaten. Vorhandene Nutzer-Entwürfe können nach erneuter Anmeldung zur Prüfung angeboten und dann als neue servervalidierte Inserate veröffentlicht werden. Favoriten lassen sich nur auf tatsächlich vorhandene zentrale IDs übernehmen. Browserdaten dürfen keine fremde Verkäuferschaft oder historische Chatnachrichten beweisen.

## Abnahme vor Live-Freigabe

- Konto A inseriert im Web; Konto B sieht das Inserat in iOS und kann antworten.
- Dasselbe echte Apple-Konto erhält auf Web und iOS dieselbe interne Nutzer-ID.
- Fremdes Konto kann weder Inserat ändern noch fremde Konversationen lesen; Namen ändern ändert keine Rechte.
- Nachricht wird auch bei geschlossenem Empfängergerät gespeichert; aktivierte E-Mail wird zugestellt, deaktivierte nicht.
- Wiederholte Requests erzeugen keine doppelten Inserate/Nachrichten; gleichzeitige Annahmen verkaufen ein Gerät nicht mehrfach.
- Gegenseitige Sperre wirkt in Web und iOS; Kontowechsel zeigt keine fremden privaten Cache-Daten.
- Serverneustart und Backup-Wiederherstellung erhalten Daten; keine Geheimnisse im Client.

Es wurden keine realen Inserate veröffentlicht, keine Nachrichten gesendet, keine Datenbanken angelegt und keine Produktdateien geändert. Build-/UI-Tests waren für diese Bestandsprüfung nicht erforderlich; ein plattformübergreifender Login-Test wurde nicht ausgeführt.
