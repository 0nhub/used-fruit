# AGENTS.md — Used Fruit für spätere KIs und Entwickler

Dieses Dokument ist die **Karte des Repos**. Lies es, bevor du Dateien änderst.  
Produktdoku und Start: [README.md](./README.md).

Arbeitsverzeichnis: `/Users/gabriel/Used Fruit`. Mehrere Chats können denselben Tree bearbeiten.

**Backend-Umstellung 05.09.2026:** Für den aktuellen Quellstand zuerst [docs/backend-implementation.md](docs/backend-implementation.md) und [docs/api/README.md](docs/api/README.md) lesen. `src/server`, `migrations` und `/api/v1` sind die zentrale Datenhaltung; Web-Hooks und iOS verwenden diese API. Die unten beschriebene lokale Marktplatzpersistenz ist der frühere Produktionsstand, nicht der neue Staging-Datenfluss. Produktion ist ausdrücklich bis zur gemeinsamen Abnahme gesperrt.

---

## Harte Regeln

1. **Nicht aus einem Chat-Snapshot eine ganze Shared-Datei überschreiben.** Sofort vor jeder Änderung von Disk lesen. Mit `StrReplace` mergen.
2. Diese Dateien nicht mit einer älteren Version aus dem Chat ersetzen:
   - `src/components/ListingWizard.tsx`
   - `src/lib/listingWizard.ts`
   - `src/components/SiteHeader.tsx`
   - `src/components/ProfileMenu.tsx`
   - `src/app/listing/[id]/page.tsx`
   - `src/components/CatalogPage.tsx`
   - `src/lib/types.ts`
   - `src/lib/useListings.ts`
3. Es gibt keine zuverlässige lokale Git-Historie als Rettungsnetz, wenn jemand Dateien überschreibt. Späteres Work liegt auf GitHub (`0nhub/used-fruit`).
4. **Keine Secrets committen.** `.env.local` bleibt lokal.
5. **Keine Apple-Fotos von apple.com** in den Katalog legen. Keine Partnerschaft andeuten (kein Apple-Logo, kein „authorized“).
6. UI auf Deutsch, Code-Bezeichner und Commit-Messages auf Englisch (bestehende Mischung beibehalten: UI `de`, Code oft englisch).
7. Nur das ändern, was die Aufgabe braucht. Keine Drive-by-Refactors.

---

## Was das System ist

Next.js-App-Router-Frontend. **Local-first Marktplatz.**  
Nutzerzustand = `localStorage`. Katalogdefinitionen = TypeScript unter `src/data/`. Fotos = Appbackend. Karte = MapKit.

Auth läuft ausschließlich über Sign in with Apple und `/api/auth/{login,callback,session,logout}`. `auth.ts` prüft signierte HttpOnly-Cookies; `authClient.ts` synchronisiert die Sitzung und trennt lokale Daten nach Apple-sub mit Präfix `apple:`. `used-fruit-session` ist nur ein Cache, niemals ein Auth-Nachweis. `appleAuth.ts` validiert Apples signiertes ID-Token, Audience, Issuer, Nonce und Ablaufzeit. Der Callback verwendet POST (form_post), das kurzlebige Flow-Cookie SameSite=None. Bookmer-Sitzungen werden nicht mehr akzeptiert. Betrieb und aktive Release-Pfade: [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## Wo was liegt

### Routen — `src/app/`

| Datei | Rolle |
|---|---|
| `layout.tsx` | `lang="de"`, Metadata, `AppProviders` |
| `globals.css` | Tailwind 4 + Design-Tokens `uf-*` |
| `page.tsx` | Start → `HomeClient` (SSR aus, lädt `CatalogPage`) |
| `listing/[id]/page.tsx` | Detail, Kontakt, Angebot, Owner-Aktionen |
| `inserieren/page.tsx` | Wizard-Host, Draft, UnsavedGuard |
| `anmelden/page.tsx` | Apple-Login, sichere interne Weiterleitung über `?next=` |
| `profil/page.tsx` + `profil/layout.tsx` | Profil |
| `meine-inserate/page.tsx` | Owner-Liste (`ListingListPage`) |
| `favoriten/page.tsx` | Favoriten + Notizen |
| `nachrichten/page.tsx` | Threads |
| `anbieter/[slug]/page.tsx` | Shop (`SellerShop`) |
| `impressum` `agb` `datenschutz` `nutzerbedingungen` | `LegalDocument` + `LEGAL` |
| `error.tsx` | Fehlergrenze |
| `api/catalog-photos/route.ts` | GET Fotos, Cache 60s |
| `api/catalog-models/route.ts` | GET Modellzeilen, Cache 300s |
| `api/mapkit-token/route.ts` | GET JWT oder 404 |

### UI — `src/components/`

| Datei | Rolle |
|---|---|
| `AppProviders.tsx` | Nur `MobileNavProvider` |
| `SiteHeader.tsx` | Echter Header (Logo, Nav, Aktionen) |
| `Header.tsx` | Wrapper um `SiteHeader` |
| `CatalogPage.tsx` | Startkatalog: Filter + Grid |
| `FilterSidebar.tsx` | Filter-UI |
| `CategoryNav.tsx` | Alle / Mac / iPad / iPhone, Query `kategorie` |
| `ProductCard.tsx` | Kachel |
| `ProductGallery.tsx` / `ProductImage.tsx` | Detail- und Listenbilder |
| `ListingWizard.tsx` | Inserat-Wizard |
| `UnsavedGuard.tsx` | Verlässt die Seite nicht ohne Warnung |
| `ListingListPage.tsx` / `ListingListRow.tsx` | Tabellenartige Listen |
| `OwnerListingActions.tsx` | Sichtbarkeit, Bearbeiten, Löschen |
| `FavoriteListingActions.tsx` / `FavoriteButton.tsx` | Merken |
| `ListingNoteField.tsx` | Private Notiz (200 Zeichen) |
| `SellerShop.tsx` | Anbieterseite |
| `ReputationBadge.tsx` / `ReputationSheet.tsx` / `RatingPrompt.tsx` | Reputation |
| `NavActions.tsx` | Gast: Inserieren + Mit Apple anmelden; eingeloggt: Chat, Favoriten, Menü |
| `ProfileMenu.tsx` | Profil-Dropdown |
| `MobileNav.tsx` | Off-Canvas + Context |
| `MessageNotifier.tsx` | Ungelesen / Desktop-Notify |
| `AppleSignInButton.tsx` | Apple-Anmeldeschaltfläche und AppleMark |
| `AppleMap.tsx` | MapKit, holt Token von `/api/mapkit-token` |
| `LocationPicker.tsx` / `LocationAutocomplete.tsx` | Ort + PLZ |
| `LegalNav.tsx` / `LegalDocument.tsx` / `SimplePage.tsx` | Rechtliches Layout |
| `icons.tsx` / `StatusIcons.tsx` | Icons |
| `ShareButton.tsx` / `EmojiPicker.tsx` / `DateField.tsx` / `ConditionHint.tsx` | Kleinteile |

### Daten — `src/data/`

| Datei | Rolle |
|---|---|
| `catalog.ts` | `CATEGORIES`, `CONDITIONS`, `MODELS`, Farben, Radius, Connectivity |
| `modelYears.ts` | Chip/Jahr → erlaubte Specs |
| `hardware.ts` | Spec-Texte pro Modell/Größe |
| `listings.ts` | `SEED_LISTINGS` (Demo-Angebote) |
| `locations.ts` | PLZ/Ort + `distanceKm` / `findPlace` |
| `appleIdentity.ts` | Interne Apple-Modellnamen/Identifier für Exportzeilen |
| `catalogBackendRows.ts` | Flache Zeilen für `/api/catalog-models` |
| `seedRatings.ts` | Demo-Bewertungen |
| `serialRegistry.ts` | Seriennummern-Hilfen |
| `emojis.ts` | Emoji-Set fürs Profil |

### Logik — `src/lib/`

| Datei | Rolle |
|---|---|
| `types.ts` | **Kanonische Typen** (`Listing`, Filter, Kategorie, …) |
| `profile.ts` | Storage-Keys, Profil, Session, `wipeAllUserData`, `PROFILE_EVENT` |
| `useProfile.ts` | Hook: login/logout/save/delete, sync Shop-Seite |
| `useListings.ts` | Seed + User-Listings, add/update/remove, Visibility, soldAt |
| `useMessages.ts` / `messages.ts` | Threads, Angebote, Block/Mute |
| `useFavorites.ts` | Favoriten-IDs |
| `useListingNotes.ts` / `listingNotes.ts` | Private Notizen |
| `useReputation.ts` / `reputation.ts` | Ränge, Medaillen, Stats |
| `useCatalogFilters.ts` | Filter-State + URL `?kategorie=` |
| `useCatalogPhotos.ts` / `catalogPhotos.ts` / `catalogPhotos.server.ts` | Fotos |
| `useUserLocation.ts` | Standort für „Entfernung“ |
| `listingWizard.ts` | Welche Wizard-Schritte, Validierung |
| `listingDraft.ts` | `sessionStorage`-Draft + `safeNextPath` |
| `listingSold.ts` | `markListingSold` |
| `seller.ts` | Seed-Emojis, Beitrittsdatum |
| `sellerPage.ts` | Slug `/anbieter/…`, Seed-Shops (Studio Nord, Anna M.) |
| `device.ts` | Batterie-Metrik, Garantie-Label, Ortsformat |
| `format.ts` | Preis, Sortierung, `filterListings`, Titelzeilen |
| `legal.ts` | Impressum-Konstanten + Footer-Links |
| `mapkitToken.ts` | Statisches JWT oder ES256-Signatur |
| `notify.ts` | Browser-Notifications |
| `dateInput.ts` | Datumsfelder |

### Scripts

| Datei | Rolle |
|---|---|
| `scripts/seedCatalogPhotos.mjs` | Legt Appbackend-Zeilen front/back/side je Modell+Farbe an (ohne Bilddatei) |

---

## Datenfluss: Inserat anlegen

1. Nutzer öffnet `/inserieren` (Gast wird oft nach `/anmelden?next=/inserieren` geschickt — je nach Seite).
2. `ListingWizard` schreibt Entwurf nach `sessionStorage` (`used-fruit-listing-draft`).
3. `buildWizardSteps(modelId, year, chip)` bestimmt die sichtbaren Schritte.
4. Abschluss → `useListings().addListing` → Array in `used-fruit-listings` → Event `used-fruit-data`.
5. Katalog und „Meine Inserate“ lesen denselben Hook.

## Datenfluss: Kaufen / Chat

1. Detailseite `/listing/[id]`. Ohne Login → `/anmelden?next=/listing/<id>`.
2. `openThread` / `send` in `messages.ts`.
3. Angebot annehmen → `kind: "accept"` + `markListingSold(id)`.
4. `useListings` merged `soldAt` → öffentlicher Katalog filtert das Inserat raus.
5. Später `RatingPrompt` / `reputation.ts`.

## Datenfluss: Katalogfotos

1. Client: `useCatalogPhotos` → `GET /api/catalog-photos`.
2. Server: `fetchCatalogPhotos()` paginiert Appbackend (`PAGE_SIZE` 100, Cache 60s im Modul).
3. Zuordnung: `modelId` + `colorId`, Views `front` | `back` | `side`.
4. Cover: `view === "front"` oder `position === 1` (`coverPhoto` in `catalogPhotos.ts`).

---

## Storage-Keys (vollständig)

Nicht umbenennen, ohne Migration zu schreiben. Alte Browser behalten die alten Keys.

```
used-fruit-auth-identity
used-fruit-onboarding
used-fruit-account:<globalId oder legacy> (Archiv für Kontowechsel)
used-fruit-profile
used-fruit-session
used-fruit-listings
used-fruit-favorites
used-fruit-listing-notes
used-fruit-location
used-fruit-messages
used-fruit-blocked
used-fruit-muted
used-fruit-sold
used-fruit-ratings
used-fruit-seller-pages
used-fruit-inbox-width
used-fruit-listing-draft   (sessionStorage)
```

Personen werden oft über `personKey(name)` = `name.trim().toLowerCase()` identifiziert (Chats, Block, Reputation). Anbieter-URLs über `sellerSlug` (Umlaute → ae/oe/ue).

---

## Ein neues Gerätemodell hinzufügen

1. `MODELS` in `src/data/catalog.ts` (id, categoryId, name, colors, Speicher, …).
2. Varianten in `src/data/modelYears.ts`, falls Chip/Jahr die Optionen ändern.
3. Specs in `src/data/hardware.ts`.
4. Optional Identifier in `src/data/appleIdentity.ts`.
5. Foto-Zeilen in Appbackend (oder `scripts/seedCatalogPhotos.mjs` um `VARIANTS` erweitern, dann Bilder hochladen).
6. Batterie: iPhone/iPad → Kapazität; `macbook-neo` / `macbook-air` / `macbook-pro` → Zyklen (`device.ts`). Andere Macs ohne Batterie-Schritt.

**Watch / Vision / AirPods** gibt es in `CategoryId` nicht. Dafür zuerst `types.ts` + `CATEGORIES` + Wizard + Filter erweitern.

---

## Eine neue Seite hinzufügen

1. `src/app/<pfad>/page.tsx`.
2. Navigation: `NavActions`, `ProfileMenu` oder `MobileNav` — nicht drei verschiedene Header erfinden. `SiteHeader` wiederverwenden.
3. Client-State: bestehenden Hook nutzen, nicht einen zweiten Storage-Key für dasselbe Konzept.
4. Nach UI-Änderungen im Browser den Flow prüfen (nicht nur Screenshot), inkl. anderer Seiten, die denselben State lesen.

---

## UI-Konventionen

- Deutsch in der Oberfläche, „Sie“/„du“: die App duzt (`dein Namen`, `Bitte zuerst…`).
- Farben und Abstände über `uf-*`, nicht neue Hex-Werte erfinden.
- Header 48px (`--uf-nav-height`), `safe-area-inset-top`.
- Katalog-Karten: Modellfoto + Preis + Ort, keine User-Uploads als Hauptbild.
- Unabhängigkeit: kein Apple-Logo, kein Claim „Official“ / „Authorized“.

---

## Typische Fallen

- `useListings().listings` ist **nicht** die Owner-Liste. Eigene reservierte/inaktive Inserate nur in `allListings` bzw. über Owner-Filter.
- Seed-IDs beginnen mit `uf-s-`. Nutzer-IDs kommen aus `createId()` in `format.ts`.
- `visibility` fehlt = öffentlich.
- `HomeClient` lädt `CatalogPage` mit `ssr: false`, weil Filter/Storage window brauchen.
- `next.config.ts` pollt im Dev (2s), wegen Dateiwächtern auf macOS.
- MapKit: Origin-Header wird ins JWT geschrieben, wenn der Server selbst signiert.
- `safeNextPath` erlaubt nur interne Pfade, sonst `/`.

---

## Verifikation nach UI-Änderungen

Browser-Flow, nicht nur Render:

1. Betroffene Seite end-to-end (klicken, tippen, speichern, navigieren).
2. Jede andere Route, die denselben State liest (z. B. Inserat anlegen → Katalog, Meine Inserate, Detail, Anbieter-Shop).
3. Leere Zustände: nicht angemeldet, keine Favoriten, kein Chat, unbekanntes Listing.
4. Bei Layout: Desktop und schmales Viewport.

Kein Browser verfügbar: `npm run build` und ehrlich sagen, was nicht geprüft wurde.
