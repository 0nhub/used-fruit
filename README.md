# Used Fruit

Unabhängiger Online-Marktplatz für **gebrauchte Apple-Geräte** in Deutschland.  
UI und Browse-Erfahrung lehnen sich an den Apple Refurbished Store an, ohne Apple-Partner zu sein und ohne offizielle Apple-Produktfotos zu verwenden.

**Repo:** [github.com/0nhub/used-fruit](https://github.com/0nhub/used-fruit)  
**Live:** [usedfruit.de](https://usedfruit.de/)  
**Release:** 2026-09-05, konsolidierte öffentliche Version (Betrieb und Rollback: [DEPLOYMENT.md](./DEPLOYMENT.md))  
**Sprache der Oberfläche:** Deutsch  
**Stand der App:** Sign in with Apple mit serverseitiger Sitzung; Marktplatzdaten weiterhin lokal im Browser (`localStorage`), keine echte Zahlung.

Wenn du den Code ändern oder eine KI darauf ansetzen willst, lies zuerst **[AGENTS.md](./AGENTS.md)**. Dort steht die Dateikarte, der Datenfluss und die Regeln, die man nicht überschreiben darf.

---

## iPhone-App

Der native SwiftUI-Prototyp liegt unter [ios/](./ios/README.md). Öffne `ios/UsedFruit.xcodeproj` in Xcode und starte den iPhone-Simulator mit ⌘R. Der Test-Account ist ausschließlich im Debug-Build verfügbar.

## Was die App heute kann

- Katalog für **Mac**, **iPad** und **iPhone** (Watch, AirPods usw. sind noch nicht im Datenmodell)
- Filter: Modell, Größe, Jahr, Farbe, RAM, Speicher, Zustand, Garantie, Batterie, Preis, Versand, Originalkarton, Umkreis
- Sortierung: neueste, Preis aufsteigend, Entfernung
- Inserieren über einen mehrstufigen Wizard
- Detailseite mit Modellgalerie, Hardware-Specs, Karte, Anbieter und Chat/Angebot
- Favoriten, persönliche Notizen zu Inseraten, eigene Inserate (öffentlich / reserviert / inaktiv)
- Nachrichten mit Text und Preisangebot; annehmen markiert das Inserat als verkauft
- Anbieter-Shop unter `/anbieter/[slug]`
- Reputation (Rang, Medaillen, Bewertungen nach Handel)
- Rechtstexte: Impressum, AGB, Datenschutz, Nutzerbedingungen
- Anmeldung über **Sign in with Apple** (OAuth, signiertes HttpOnly-Session-Cookie)

---

## Technischer Stack

| Schicht | Technik |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, Tokens in `src/app/globals.css` (`uf-*`) |
| Daten der Nutzer | `localStorage` / `sessionStorage` im Browser |
| Seed-Katalog | TypeScript-Module unter `src/data/` |
| Katalogfotos | Appbackend-Tabelle, gelesen über `/api/catalog-photos` |
| Karte | Apple MapKit JS, Token über `/api/mapkit-token` |
| Alias | `@/` → `src/` |

Used Fruit besitzt keine eigene Datenbank. Apple übernimmt die Anmeldung; `/api/auth/login`, `/api/auth/callback`, `/api/auth/session` und `/api/auth/logout` verwalten den OAuth-Ablauf und die einstündige Sitzung. `used-fruit-session` ist nur ein UI-Cache und kein Authentifizierungsnachweis. Es wird ausschließlich Sign in with Apple angeboten.

Betrieb, aktive Release-Pfade und Sicherheitsgrenzen: [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## Start

Voraussetzung: **Node.js 18+**

```bash
cd "/Users/gabriel/Used Fruit"
npm install
npm run dev
```

Dev-Server: [http://127.0.0.1:3000](http://127.0.0.1:3000) (gebunden an localhost, siehe `package.json`).

| Befehl | Bedeutung |
|---|---|
| `npm run dev` | Entwicklung |
| `npm run build` | Production-Build |
| `npm run start` | Production-Server |
| `npm run lint` | ESLint |

Falls der Dev-Server auf macOS wegen `EMFILE` keine Routen findet:

```bash
ulimit -n 65536
npm run build && npm run start
```

---

## Umgebungsvariablen

Datei: **`.env.local`** (liegt in `.gitignore`, niemals committen).

| Variable | Pflicht | Zweck |
|---|---|---|
| `APPBACKEND_TABLE_ID` | nein | Tabelle für Katalogfotos. Fallback im Code: `aMYWSrgiDN8b` |
| `APPBACKEND_API_KEY` | für Fotos ja | Query-Key für `https://v1.appbackend.io/v1/rows/…` |
| `APPLE_CLIENT_ID` | für Login ja | Apple Services ID (`de.usedfruit.web`) |
| `APPLE_TEAM_ID` | für Login ja | Apple Developer Team ID |
| `APPLE_KEY_ID` | für Login ja | Kennung des Sign-in-Schlüssels |
| `APPLE_PRIVATE_KEY_PATH` | für Login ja | Serverpfad der geschützten .p8-Datei |
| `USED_FRUIT_SESSION_SECRET` | für Login ja | Zufälliger Signaturschlüssel, mindestens 32 Zeichen |
| `MAPKIT_TOKEN` | eine Variante | Fertiges MapKit-JWT |
| `NEXT_PUBLIC_MAPKIT_TOKEN` | Alternative | Gleicher Token, falls öffentlich im Client |
| `MAPKIT_TEAM_ID` | Alternative | Team-ID, wenn der Server das JWT selbst signiert |
| `MAPKIT_KEY_ID` | Alternative | Key-ID der Maps-.p8-Datei |
| `MAPKIT_PRIVATE_KEY` | Alternative | Inhalt der `.p8`-Datei (Newlines als `\n` möglich) |

Ohne MapKit-Variablen liefert `/api/mapkit-token` **404**; die Karte bleibt leer.  
Ohne Appbackend-Key liefert `/api/catalog-photos` oft eine leere Liste; Inserate nutzen dann Platzhalter.

---

## Routen

| Pfad | Datei | Inhalt |
|---|---|---|
| `/` | `src/app/page.tsx` → `HomeClient` → `CatalogPage` | Katalog |
| `/?kategorie=mac\|ipad\|iphone` | `CategoryNav` / `useCatalogFilters` | Kategorie im Query |
| `/listing/[id]` | `src/app/listing/[id]/page.tsx` | Inserat-Detail |
| `/inserieren` | `src/app/inserieren/page.tsx` | Wizard (neu) |
| `/inserieren?edit=<id>` | dieselbe Seite | Wizard (bearbeiten) |
| `/anmelden?next=…` | `src/app/anmelden/page.tsx` | Sign in with Apple, danach interner Redirect |
| `/profil` | `src/app/profil/page.tsx` | Name, Emoji, Bio, Ort, Benachrichtigung |
| `/meine-inserate` | `src/app/meine-inserate/page.tsx` | Eigene Inserate + Listenansicht |
| `/favoriten` | `src/app/favoriten/page.tsx` | Gemerkte Inserate + Notizen |
| `/nachrichten` | `src/app/nachrichten/page.tsx` | Inbox / Thread |
| `/anbieter/[slug]` | `src/app/anbieter/[slug]/page.tsx` | Öffentlicher Shop |
| `/impressum` `/agb` `/datenschutz` `/nutzerbedingungen` | jeweilige `page.tsx` | Rechtstexte aus `src/lib/legal.ts` |
| `/api/catalog-photos` | `src/app/api/catalog-photos/route.ts` | JSON `{ photos: CatalogPhoto[] }` |
| `/api/catalog-models` | `src/app/api/catalog-models/route.ts` | Flache Modellzeilen für Backends |
| `/api/mapkit-token` | `src/app/api/mapkit-token/route.ts` | JWT als `text/plain` |

Katalog-Listen (`/`, `/favoriten`, `/meine-inserate`) teilen sich die Kategorie-Navigation. Andere Pfade leiten `?kategorie=` nach `/` um (`catalogBasePath` in `CategoryNav.tsx`).

---

## Architektur in einem Satz

**Next.js rendert die Seiten. Fast der gesamte Marktplatz-Zustand lebt im Browser.** Seed-Inserate kommen aus dem Repo; Nutzer-Inserate, Profil, Chats, Favoriten, Notizen, Bewertungen und Verkäufe liegen in `localStorage`. Ein Custom-Event `used-fruit-data` plus das `storage`-Event halten die Hooks synchron.

```
Browser
  CatalogPage / Listing / Wizard / Inbox
        │
        ├── Hooks (useListings, useProfile, useMessages, …)
        │         └── localStorage + Event "used-fruit-data"
        │
        ├── Seed: src/data/listings.ts, catalog.ts, hardware.ts
        │
        └── fetch
              /api/catalog-photos  → Appbackend
              /api/mapkit-token    → MapKit JWT
              /api/catalog-models  → statische Modellzeilen
```

`AppProviders` wrappt nur `MobileNavProvider`. Es gibt keinen globalen Redux-/Zustand-Store.

---

## Verzeichnis

```
src/
  app/                 Next-Routen, globals.css, API-Routen
  components/          UI (Katalog, Wizard, Header, Chat-Hilfen)
  data/                Statische Katalog-, Ort-, Seed- und Spec-Daten
  lib/                 Typen, Persistenz, Hooks, Formatierung
scripts/               Einmalige Backfill-Skripte (Appbackend)
```

Pfad-Alias: `@/components/…`, `@/lib/…`, `@/data/…`.

---

## Datenmodell (Kern)

Definiert in `src/lib/types.ts`.

**Kategorien:** `mac` | `ipad` | `iphone`  
**Zustände:** `neu` | `sehr-gut` | `gut` | `akzeptabel` | `defekt`  
**Versand:** `local` | `deutschland`  
**Sichtbarkeit:** `public` | `reserved` | `inactive` (fehlender Wert = öffentlich)

Ein **Listing** ist ein konkretes Gerät: Modell, Farbe, optional Chip/Größe/Jahr/RAM/Speicher/Connectivity, Zustand, Preis, Ort (Stadt, PLZ, optional Ortsteil/Straße), Radius, Versand, Verkäufername, optional Garantie, Batterie, Seriennummer, `soldAt`, `visibility`.

**Öffentlicher Katalog** (`useListings().listings`): Nutzer-Inserate + `SEED_LISTINGS`, ohne Verkaufte, ohne `reserved`/`inactive`.  
**Alle inkl. eigener unsichtbarer** (`allListings`): für „Meine Inserate“ und Owner-Aktionen.

---

## Persistenz

Alles clientseitig, Keys in `src/lib/profile.ts` und verwandten Modulen:

| Key | Speicher | Inhalt |
|---|---|---|
| `used-fruit-profile` | localStorage | Name, Emoji, Bio, Ort, Notify-Flag |
| `used-fruit-session` | localStorage | `{ signedIn }` |
| `used-fruit-listings` | localStorage | Nur **vom Nutzer angelegte** Inserate |
| `used-fruit-favorites` | localStorage | Listing-IDs |
| `used-fruit-listing-notes` | localStorage | `{ [listingId]: string }` max. 200 Zeichen |
| `used-fruit-location` | localStorage | Katalog-Standort für Distanzfilter |
| `used-fruit-messages` | localStorage | Chat-Threads |
| `used-fruit-blocked` / `used-fruit-muted` | localStorage | Personen-Keys |
| `used-fruit-sold` | localStorage | `{ [listingId]: ISO-Zeit }` |
| `used-fruit-ratings` | localStorage | Bewertungen nach Handel |
| `used-fruit-seller-pages` | localStorage | Öffentliche Shop-Bios |
| `used-fruit-inbox-width` | localStorage | Inbox-Layout |
| `used-fruit-listing-draft` | **sessionStorage** | Wizard-Entwurf |

Änderungen feuern `window.dispatchEvent(new Event("used-fruit-data"))` (`PROFILE_EVENT`). Hooks hören darauf und auf `storage`.

Seed-Inserate stehen **nicht** in `localStorage`. `soldAt` kann sie trotzdem über `used-fruit-sold` überdecken.

Konto löschen: `wipeAllUserData()` in `profile.ts` leert die Nutzer-Keys.

---

## Katalog und Bilder

1. **Modelle** — `src/data/catalog.ts` (`MODELS`, Farben, Speicher, …).  
2. **Jahres-/Chip-Varianten** — `src/data/modelYears.ts`.  
3. **Hardware-Texte** (Display, Anschlüsse) — `src/data/hardware.ts`.  
4. **Fotos** — nicht im Git, sondern Appbackend. Felder: `model_id`, `color_id`, `view` (`front`/`back`/`side`), `position`, `image`.  
   Server: `src/lib/catalogPhotos.server.ts` → Client: `useCatalogPhotos`.  
5. **Galerie** — `ProductGallery` / `ProductImage` / `ProductCard`. Fehlt ein Foto, Platzhalter.

Offizielle Apple-Produktbilder dürfen **nicht** von apple.com kopiert werden. Es gibt keine schriftliche Apple-Lizenz. Platzhalter oder eigene/lizenzierte Assets verwenden.

Seed-Skript für leere Foto-Zeilen (ohne Bilddateien):

```bash
node scripts/seedCatalogPhotos.mjs
```

Liest `APPBACKEND_API_KEY` aus `.env.local`.

---

## Inserieren

Logik der Schritte: `src/lib/listingWizard.ts` (`buildWizardSteps`).  
UI: `src/components/ListingWizard.tsx`.  
Seite: `src/app/inserieren/page.tsx` + `UnsavedGuard`.

Typische Folge: Kategorie → Modell → ggf. Chip/Jahr/Farbe/Größe/RAM/Speicher → bei iPad Connectivity → Zustand → Karton → Garantie → Batterie (iPhone/iPad: Kapazität %, MacBook: Zyklen) → Preis → Ort → Versand.

Einzelschritte, die nur eine Option haben, werden übersprungen (`soleSpecValues`).

---

## Nachrichten, Verkauf, Reputation

- Thread-ID: `th-<listingId>-<buyer-slug>` (`src/lib/messages.ts`).
- Nachrichtenarten: `text` | `offer` | `accept` | `decline`.
- Angenommenes Angebot → `markListingSold` → Inserat verschwindet aus dem öffentlichen Katalog.
- Nach dem Verkauf kann `RatingPrompt` eine Bewertung anstoßen (Delay `RATING_DELAY_MS` = 2 Tage).
- Ränge: Bauer → Händler → Kaufmann → Großhändler → Handelsmagnat → Mogul (`src/lib/reputation.ts`).
- Seed-Bewertungen: `src/data/seedRatings.ts`.

---

## Design

Apple-ähnliche, aber eigene Oberfläche. Kein Apple-Logo, keine Apple-Trade-Dress-Kopie als Marke.

Tokens in `src/app/globals.css`: `--uf-bg`, `--uf-text`, `--uf-link`, `--uf-border`, Schrift SF Pro / System.  
Tailwind: `bg-uf-bg`, `text-uf-text-secondary`, `border-uf-border-soft`, …

Header: `SiteHeader` (Logo, Kategorien, Aktionen). `Header.tsx` ist nur ein dünner Wrapper.

---

## Rechtliches / Betreiber

Kontaktdaten der Rechtstexte: `src/lib/legal.ts` (Name, Anschrift, Telefon, `hello@sgroi.ga`).  
Used Fruit ist **kein** Apple Authorized Reseller und **nicht** von Apple autorisiert, gesponsert oder empfohlen.

---

## Git

- Remote: `git@github.com:0nhub/used-fruit.git`
- Branch: `main`
- `.env.local`, `node_modules`, `.next` sind ignoriert
