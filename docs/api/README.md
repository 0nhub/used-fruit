# Used Fruit API v1

Verbindlicher Staging-Vertrag: [openapi.json](./openapi.json). Basis `https://staging.usedfruit.de/api/v1`. Produktionsadresse erst nach Abnahme verwenden.

Stand 05.09.2026: 44 Operationen, deckungsgleich mit `src/app/api/v1/[...path]/route.ts`. `GET /me/ratings` hat die `operationId` `get_me_ratings`. Der SES-Feedback-Webhook bleibt außerhalb dieses Vertrags unter `/api/webhooks/ses`.

## Identität

Web: bestehender Apple-Redirect-Flow `/api/auth/login`, HttpOnly-Cookie; schreibende Browserrequests brauchen dieselbe Origin. Alte lokale Sitzungsmarker sind kein Auth-Nachweis.

iOS: `POST /auth/apple/challenge`, dessen `nonceHash` unverändert in `ASAuthorizationAppleIDRequest.nonce`. Danach `identityToken`, `authorizationCode`, `challengeId` und optional Apple-Vorname an `POST /auth/apple`. Zugangstoken als `Authorization: Bearer …`. Tokens atomar in der Keychain ersetzen. Eine gemeinsame laufende Refresh-Anfrage pro Client verhindert parallele Rotation. Bei Widerruf lokale Kontodaten entfernen. IDs niemals aus Namen oder E-Mail ableiten.

## Daten und Wiederholungen

UUIDs sind stabile Identitäten. `number` ist eine getrennte numerische Anzeigenummer als String. Geld als Integer-Cent in EUR. Zeiten als ISO-8601 UTC. Veröffentlichung und Nachrichten/Angebote benötigen `Idempotency-Key`. Bei unklarem Netzwerkfehler denselben Schlüssel mit identischem Inhalt erneut verwenden; erst bestätigten Erfolg als Abschluss darstellen. Ändern eines Inserats benötigt die zuletzt gelesene `version`; 409 verlangt Neuladen.

Öffentliche Inserate enthalten nur freigegebene Gerätespezifikationen, Stadt/PLZ. `privateSpecs` wird bei Details nur dem Eigentümer geliefert. Fotos als rohe JPEG/PNG/WebP-Bytes hochladen, kein Multipart; Server entfernt Metadaten und begrenzt Größe/Auflösung.

## Seiten und Nachrichten

`nextCursor` unverändert übernehmen, bis `null`. Bei `/listings` Filter/Sortierung beibehalten, bei `/conversations` `cursor` übergeben, bei `/conversations/{id}/messages` den Folgewert als `after`. Clients pollen aktive Nachrichten alle fünf Sekunden und beim Zurückkehren. Unveränderte Verläufe müssen nicht komplett erneut geladen werden.

`PATCH /conversations/{id}` mit `active:true` verlängert Präsenz um 15 Sekunden. `readSequences` enthält höchstens 100 tatsächlich sichtbare Nachrichten; `readSequence` ist die Einzelform. Ein höherer Positionscursor markiert ältere ungesehene Nachrichten ausdrücklich nicht als gelesen. Beim Hintergrundwechsel `active:false`; keine Lesebestätigungen aus einem unsichtbaren Chat.

E-Mail erst nach 120 Sekunden und nach erneuter Prüfung von Lesen, Einstellung, Sperre und Mute. Jede Nachricht besitzt ihren eigenen Auftrag. Push nur für registrierte native Gerätesitzungen; im aktiven Chat kein sichtbares Banner. Gerät bei Logout lösen. E-Mail-Links führen über die Anmeldung zurück zu `/nachrichten?conversation=<UUID>`; APNs enthält `conversationId`.

## Tests und Betrieb

`tests/backend/integration.ts` enthält 22 Prüfgruppen und läuft ausschließlich gegen `usedfruit_staging`, mit temporären synthetischen Nutzern und Testtransporten. `USED_FRUIT_VERIFY_RESTORE=1` prüft zusätzlich als root auf dem Server eine vollständige Wiederherstellung. Persönliche Apple-Anmeldung und reale iPhone-Push-Abnahme werden dadurch nicht ersetzt. Die Gruppen wurden in dieser Sitzung nicht erneut auf dem Server ausgeführt.

Betriebsstand und Freigabesperren: [backend-implementation.md](../backend-implementation.md). Geheimnisse gehören ausschließlich in lokale/root-geschützte Umgebungskonfiguration, nicht in den Vertrag oder die App.
