# Used Fruit deployment

Deployed on the existing Hetzner server `bookmer` (`195.201.145.202`).

- Domain: https://usedfruit.de/
- www: redirects to https://usedfruit.de/ preserving path and query
- Preview: http://195.201.145.202/
- Active release: `/opt/used-fruit-releases/public-20260905-final`
- Previous release: `/opt/used-fruit-releases/mobile-navigation-Py98hf`
- Previous about release: `/opt/used-fruit-releases/about-PAveL1`
- Previous block-profiles release: `/opt/used-fruit-releases/block-profiles-get5ra`
- Previous chat-entry release: `/opt/used-fruit-releases/chat-entry-0npJYF`
- Previous map-favorites release: `/opt/used-fruit-releases/map-favorites-8XEUyY`
- Previous publish-login release: `/opt/used-fruit-releases/publish-login-NLXgAS`
- Previous wizard-defaults release: `/opt/used-fruit-releases/wizard-defaults-p3FugE`
- Previous footer release: `/opt/used-fruit-releases/mobile-footer-eqNIuX`
- Previous number release: `/opt/used-fruit-releases/listing-number-jlOvO0`
- Previous mobile-back release: `/opt/used-fruit-releases/mobile-back-L8hXnL`
- Previous mobile-logo release: `/opt/used-fruit-releases/mobile-logo-sMp8FH`
- Previous listing-details release: `/opt/used-fruit-releases/listing-details-82hC8U`
- Previous catalog release: `/opt/used-fruit-releases/catalog-ui-4Xpj8R`
- Previous direct-login release: `/opt/used-fruit-releases/direct-login-8C3tUx`
- Previous OAuth release: `/opt/used-fruit-releases/oauth-6y2Edt`
- Previous source/release: `/opt/bookmer-platform/apps/used-fruit` (no longer the active working directory)
- Service: `used-fruit.service`, enabled at boot, running as `usedfruit`
- Runtime: Node.js 22, production Next.js build
- Internal listener: `10.0.3.1:3002` (Docker apps bridge gateway)
- Proxy: existing `edge-proxy` Caddy container
- Proxy configuration: `/root/edge-proxy/Caddyfile`
- Previous proxy configuration: `/root/edge-proxy/Caddyfile.used-fruit-backup-1788572214`

## Checks

Production build passed with existing non-blocking lint warnings. The deployed catalog and listing detail navigation were checked in the browser. Used Fruit, Bookmer, and Bookmer ID returned HTTP 200. The service is active and enabled.

## Pending

Dynadot DNS is configured with an apex A record `195.201.145.202`, a `www` CNAME to `usedfruit.de`, and a 300-second TTL. Nameservers remain `ns1.dyna-ns.net` and `ns2.dyna-ns.net`. Caddy is configured for automatic HTTPS and a 308 redirect from www to the apex. DNS resolves to the server. Certificates for both hostnames were issued successfully. HTTPS on the apex returned 200, HTTP and www returned 308 to the canonical HTTPS URL, and the catalog loaded at https://usedfruit.de/ in the browser. The pre-domain proxy backup is `/root/edge-proxy/Caddyfile.domain-backup-1788593665`.

MapKit is active using an Apple-issued MapKit JS domain token for `usedfruit.de` with no expiration, created and deployed with explicit user authorization. The token is stored outside the source tree in `/etc/used-fruit/mapkit.env` (root-only permissions) and loaded through `/etc/systemd/system/used-fruit.service.d/mapkit.conf`. The existing `/api/mapkit-token` endpoint serves it to the MapKit client. The live listing map, marker, and zoom interaction were verified in the browser. No private signing key or local `.env.local` transfer was needed.

Catalog photo credentials remain unconfigured; the previous approval block on transferring `.env.local` does not affect the new MapKit setup. No tokens or secrets are stored in this document.

The application now authenticates exclusively through Sign in with Apple. Listings, messages, favorites and profile edits remain browser-local; this deployment does not add shared marketplace storage or server-side authorization for marketplace data.

## Operations

Inspect with `systemctl status used-fruit` and `journalctl -u used-fruit`. Restart only this service after deploying and successfully building a new release. Preserve the other applications and Caddy host blocks. Back up and reread Caddy configuration immediately before modifying it.

Package source on macOS with `COPYFILE_DISABLE=1 tar --no-xattrs` to avoid AppleDouble metadata files on Linux. Exclude `.env.local`, `.git`, `node_modules`, and `.next` from source archives.

## Bookmer ID — 2026-09-05

The Used Fruit OAuth app uses the exact callback `https://usedfruit.de/api/auth/callback` and scopes `openid email profile`. Client credentials and a random session signing key are stored only in `/etc/used-fruit/bookmer-id.env`, readable by root, loaded by systemd. Never print, commit or transfer these values to browser code.

`/etc/systemd/system/used-fruit.service.d/20-oauth-release.conf` selects the active release and the OAuth EnvironmentFile. The existing MapKit drop-in remains required. Inspect `systemctl show used-fruit -p WorkingDirectory` before any deployment; rebuilding the old source directory will not update the running app.

OAuth state is signed and expires after ten minutes. Access tokens are exchanged and used only on the server, then discarded. The app issues a signed Secure/HttpOnly/SameSite=Lax host-only cookie for one hour. No refresh token is retained. Provider revocation is not checked again during that hour. Logout clears the cookie via a same-origin POST.

The client checks the server session, including on focus and periodically. Browser data is archived per Bookmer global ID on account changes; older anonymous data is archived separately as legacy data. This separation is local convenience, not a security boundary against somebody with access to the browser. Account deletion in Used Fruit deletes local data, not the Bookmer ID account.

Validation: isolated production build and three auth helper tests passed (signature tampering/expiry, safe redirects, OAuth state). Live guest session and rejected callback checks passed; browser login reached the Bookmer account consent screen. After explicit consent to the account terms, successful callback, authenticated profile menu, logout to the guest header and repeat login were verified in the production browser. The original flow had expired while awaiting consent and correctly failed; restarting login completed successfully.

For future releases, build outside `/opt/bookmer-platform` and switch only the Used Fruit service after validation. The current release reuses the prior Used Fruit node_modules via a symlink; provision independent dependencies in future releases, never install or prune within the shared Bookmer workspace. Do not restart all PM2 apps. Check Bookmer ID `/api/health` as well as the public pages after activation.

## Direct login update — 2026-09-05

`/anmelden` now redirects server-side to the OAuth start endpoint without a confirmation screen. Existing authenticated sessions return to the safe next path. Only failed login attempts show a retry page, avoiding redirect loops. Production build passed; guest redirect with `/inserieren` preserved and error-page HTTP 200 verified. Browser logout followed by a single click on Anmelden completed login using the existing Bookmer session, with no intermediate button. Bookmer ID health returned 200. Only Used Fruit was restarted.

## Catalog UI update — 2026-09-05

Activated `/opt/used-fruit-releases/catalog-ui-4Xpj8R` with independent `npm ci` dependencies. Includes keyboard layouts, mobile category pills and centered branding, removal of the gray card hover, red filled favorite-heart hover, and the warranty label “Abgelaufen”. Production build and eight local auth/keyboard tests passed. Only Used Fruit was restarted; Used Fruit, Bookmer and Bookmer ID health returned HTTP 200. Prior service drop-in is backed up at `/tmp/usedfruit-pre-ui-release.conf`; the previous release remains available. Existing environment-file settings were preserved.

## Listing details update — 2026-09-05

Release `/opt/used-fruit-releases/listing-details-82hC8U` adds listing ID and an email report form below hardware specs, plus required explicit SIM-lock status for iPhones and cellular iPads. Existing unknown values remain unknown. Independent dependencies, production build and ten local tests passed. Browser checks covered report content, mobile rendering, SIM-lock selection and back navigation. Previous service configuration: `/tmp/usedfruit-pre-details-release.conf`. Reporting opens a prepared email; there is no server-side report inbox.

## Mobile logo and shipping filter — 2026-09-05

Release `/opt/used-fruit-releases/mobile-logo-sMp8FH` places the full brand beside the mobile menu and replaces the shipping dropdown with a “Versand möglich” check row. Production build passed; browser checks covered 320px mobile header, desktop, menu opening/closing and shipping toggle (22 to 6 listings and back). Previous service configuration: `/tmp/usedfruit-pre-header-release.conf`.

## Mobile return and numeric listing numbers — 2026-09-05

Mobile listing headers use a back arrow, returning to the catalog with in-memory filter snapshots and scroll position. Browser checks confirmed six filtered offers and identical 143px scroll position before/after navigation, direct-link fallback and desktop hiding. Numeric display IDs preserve internal URLs and references; seed uf-s-21 displays 3503968021. User IDs use a separate numeric range. Release `/opt/used-fruit-releases/listing-number-jlOvO0` passed production builds and eleven tests. Live display and prepared report email verified. Previous drop-in: `/tmp/usedfruit-pre-number-release.conf`.

## Mobile actions and wizard defaults — 2026-09-05

Mobile detail pages place Kaufen/Nachricht at the page bottom, outside seller info. Spec cells wrap and page overflow is clipped; 320px/390px iPhone and MacBook pages and desktop were checked. Wizard categories are iPhone/iPad/Mac, with first visible choices defaulted without replacing manual selections. SIM-lock now accepts only unlocked/locked; legacy unknown entries cannot publish and are not relabeled unlocked. Eleven tests and production builds passed; category selection verified live. Active release `/opt/used-fruit-releases/wizard-defaults-p3FugE`; prior service config `/tmp/usedfruit-pre-defaults-release.conf`.

## Publish login and fixed mobile actions — 2026-09-05

Release `/opt/used-fruit-releases/publish-login-NLXgAS` uses a minimal wizard header with explicit cancel confirmation, guest “Anmelden & veröffentlichen”, guest draft preservation across account initialization and duplicate publication guard. Login failures preserve the safe return target. Auth draft regression test passes (12 tests total). Existing real Bookmer OAuth remains in use; marketplace listings are still browser-local. No new real listing was published as a test. Mobile details place photos first, hide categories and fix actions at the viewport bottom; verified at scrollY 1365.5 with footer bottom 700 in a 700px viewport. Production build passed; previous config `/tmp/usedfruit-pre-login-release.conf`.

## Maps and guest favorites — 2026-09-05

Release `/opt/used-fruit-releases/map-favorites-8XEUyY` limits mobile category pills to catalog routes, adds full-screen map dialog and Apple Maps buttons in the gray caption, and requires verified login for favorite changes. Session key `used-fruit-pending-favorite` preserves a guest choice and is consumed after login; logout clears it. Draft/account regression test also verifies favorite adoption. Production build passed; map dialog checked at 390px and 1280px, messages has no mobile category nav. Local guest click reaches auth with next=/favoriten; full provider login was not repeated. Previous configuration `/tmp/usedfruit-pre-map-release.conf`.

## Direct chat and inbox transitions — 2026-09-05

Release `/opt/used-fruit-releases/chat-entry-0npJYF` uses identical explicit font properties for map buttons (verified computed 13px/500 and same family). Kaufen/Nachricht go through `/nachrichten/start?listing=…`, verify the session and resume after login, opening a thread without automatically sending text or an offer. Inline composer removed. Inbox tabs animate label width and colors over 300ms; list enters over 220ms, respecting reduced motion. Build passed. Guest login return target verified; signed-in chat/tab flow not re-tested because the browser was signed out. Previous config `/tmp/usedfruit-pre-chat-release.conf`.

## Local blocking and mission page — 2026-09-05

Mobile menu hidden on own listings, favorites and messages. Seller cards allow blocking; account has a native dialog for unblocking. Existing browser-local name-based blocklist filters catalog and detail lookup. Reciprocal account/device enforcement remains unimplemented: shared storage and stable seller identity mapping are missing. Mobile menu absence verified on all three routes; authenticated block/unblock UI not tested. About page `/ueber-uns` added with first footer link “Über Used Fruit”; mission copy covers reuse, local pickup, simple filters and community expectations without claiming automated moderation. Production build passed; 390px layout and desktop footer navigation verified. Release `/opt/used-fruit-releases/about-PAveL1`; previous configuration `/tmp/usedfruit-pre-about-release.conf`.

## FAQ — 2026-09-05

Release `/opt/used-fruit-releases/faq-Uc6ea4` adds `/faq` with 20 accordion questions in four groups and a question form that prepares an email, without claiming server-side submission. Footer link follows About. Copy states current browser-local storage and blocking limits. Build passed; accordion, empty/filled form state, 390px and 1280px layout verified. No test email sent. Previous config `/tmp/usedfruit-pre-faq-release.conf`.

## Map, touch input and block confirmation — 2026-09-05

Built from active FAQ release `/opt/used-fruit-releases/faq-Uc6ea4`, preserving its other changes. Updated only AppleMap, BlockedProfiles, globals.css and layout.tsx. Fullscreen map has no title bar, a floating close button and initial focus on the content container. Keyboard focus remains visible when navigating to the button. City-only copy no longer claims that exact addresses are never shown.

Touch-device input/select/textarea font size is 16px to avoid focus zoom. Viewport sets maximumScale=1 and userScalable=false as requested. Browsers may override zoom restrictions; physical iPhone focus/keyboard behavior has not been verified with the desktop browser.

Seller blocking requires a named native dialog; cancel is initially focused. Chat blocking already had confirmation. Production build passed with existing warnings. Desktop and narrow map layouts, close/Escape, cancel without blocking, confirmed demo-seller block and subsequent unblock were verified. Tests left no additional blocked profiles. Only Used Fruit restarted; Bookmer ID health was successful.

## Apple-only migration — activated

The replacement source uses Apple exclusively. New primary App ID `de.usedfruit.app`, Services ID `de.usedfruit.web`, team `AUP84ZCD2B`; web domain `usedfruit.de`, callback `https://usedfruit.de/api/auth/callback`. Source is staged at `/opt/used-fruit-releases/apple-login-jA19XG`, based on the active map-fullscreen release. Four authentication tests and production build passed. The Apple-only release is now active.

Apple key `WN627KUP8J` (Used Fruit Login) was created and Apple marked its download complete, but the browser tool supplied no accessible local file. The two newly created keys were not used. Replacement-key creation was explicitly approved. Key `5Y827SGT96` (Used Fruit Web Login) was created; its download was monitored via the browser download event before clicking. The event timed out and Apple again reported Downloaded, but no file was found in Downloads or accessible temporary storage. Both keys are currently unused; do not create a third key. The download problem was resolved for deployment by using the existing team Apple signing key already present on the server, without another download.

Replacement runtime variables: APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY_PATH, USED_FRUIT_SESSION_SECRET. Private key must stay outside the repository. `.p8` files are ignored. Remove the Bookmer EnvironmentFile from the active service when switching. Preserve MapKit configuration.

Apple flow uses POST form_post, short-lived Secure/HttpOnly/SameSite=None flow cookie, signed state plus nonce, server-side code exchange, and Apple RS256 key validation with exact issuer/audience/nonce/expiry checks. Client-secret ES256 JWT is generated per exchange with a five-minute lifetime. Apple access/refresh tokens are not stored. Sessions retain the one-hour lifetime. The cookie names are Apple-specific; previous Bookmer sessions are no longer accepted after activation. Local data remains archived under the previous account ID, without automatically merging unrelated identities.

### Activation result

Existing Apple signing key was checked directly against Apple for `de.usedfruit.web`; an intentionally invalid authorization code returned invalid_grant rather than invalid_client. Key material was copied internally to root-only `/etc/used-fruit/apple-signin.p8`. systemd LoadCredential exposes it read-only to Used Fruit under `/run/credentials/used-fruit.service/apple-signin-key`. `/etc/used-fruit/apple.env` holds the Apple identifiers and a new random session secret. The Bookmer EnvironmentFile was replaced in the service override; MapKit remains configured. No Bookmer OAuth requests remain in the application.

The existing Apple signing key is shared with another Apple integration on this server: do not revoke it without coordinating both integrations. The two unused keys WN627KUP8J and 5Y827SGT96 remain registered but are not used by the service.

Browser verification: guest header shows Mit Apple anmelden, clicking goes directly to appleid.apple.com with client_id de.usedfruit.web, and Apple displays “Use your Apple Account to sign in to Used Fruit”. Personal Apple account sign-in is required to verify successful callback end-to-end; the account entry screen is the current handoff. No personal Apple credentials were requested or extracted by the agent.

## Mobile navigation and Apple button alignment — 2026-09-05

Release `/opt/used-fruit-releases/mobile-navigation-Py98hf` aligns the Apple mark with the sign-in label and fixes its clipped SVG bounds. The mobile catalog now places a native sorting select before the category links, using the existing filter state. The mobile header no longer shows Inserieren; the drawer includes it as its last scrollable item. Legal links scroll with filters in the drawer and desktop sidebar.

Production build passed with the three existing warnings. Browser checks covered 320px and 390px mobile widths and 1280px desktop, price and distance sorting, disabled distance without location, expanded filters moving legal links below the viewport, and Inserieren opening the wizard. The empty test wizard was discarded and test location cleared. Physical iPhone testing was not performed. Used Fruit and Bookmer ID health returned HTTP 200 after activation. Only used-fruit.service was restarted; Apple and MapKit credential configuration was preserved. Prior configuration is `/tmp/uf-before-mobile-nav.conf`, pointing to `/opt/used-fruit-releases/apple-login-jA19XG`.

## Consolidated public release — 2026-09-05

Activated `/opt/used-fruit-releases/public-20260905-final` from the complete local source. Includes mobile filter/sorting/category layout, legal footers, privacy preferences and consent-gated MapKit, Apple sign-in artwork, listing wizard refinements, independent detail scroll panes, price-row purchase action, provider profiles, redesigned rank dialog, and the report popup. Reporting still prepares an email; marketplace data remains browser-local and payments are not implemented.

Validation: all 13 tests passed; Next.js production build passed with four non-blocking existing lint warnings. Public catalog, detail and session endpoint returned HTTP 200; report and rank dialogs opened in the public browser. Bookmer and Bookmer ID health returned HTTP 200 after activation. Only Used Fruit was restarted. A personal Apple sign-in/callback was not repeated.

The release reuses existing dependencies through a symlink without installing or pruning inside Bookmer. Apple EnvironmentFile, LoadCredential and MapKit drop-in were preserved. Service override backup: `/etc/used-fruit/pre-public-20260905.conf`. To roll back, restore that backup to `/etc/systemd/system/used-fruit.service.d/20-oauth-release.conf`, run `systemctl daemon-reload`, then restart only `used-fruit` and verify health. The previous release remains intact. Server had 2.4 GB free before build; plan separate reviewed retention cleanup before accumulating further releases.
