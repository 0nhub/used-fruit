# App Store preparation — 5 September 2026

App: Used Fruit · Apple ID 6808996505 · Bundle ID de.usedfruit.app · Version 1.0.

## Saved in App Store Connect

- German description, promotional text, keywords, subtitle, Shopping category, support and marketing URLs, copyright.
- Privacy policy: https://usedfruit.de/datenschutz.
- Ten privacy categories published with explicit owner approval: name, email, physical address, coarse location, messages, other user content, user ID, device ID, purchase history and product interaction. All for app functionality, linked to identity, no advertising tracking.
- Age questionnaire completed: user-generated content and messaging enabled; no unrestricted browsing or social media feed. Apple calculated 4+. This is a content rating; the existing marketplace terms restrict buying/selling to adults in Germany. Resolve any desired higher age override before submission.
- Free download price saved. Mac and Vision Pro distribution disabled.

## Build verification

- Fixed missing closing brace in MarketplaceViews.swift before the purchase confirmation alert.
- Fixed catch-variable shadowing in Store.propose by assigning self.error.
- AppIcon.png exists and is included in the compiled asset catalog.
- Simulator build succeeded and app launched on iPhone 17 Pro simulator.
- Signed Release archive succeeded, including PrivacyInfo.xcprivacy with UserDefaults reason CA92.1.
- Latest archive: /tmp/UsedFruit-1.0-privacy.xcarchive.
- Log: /tmp/usedfruit-release-privacy.log.
- The archive uses a command-line version override of 1.0. Project version remains 0.1.0.
- No upload or App Review submission performed. Successful compilation is not end-to-end acceptance.

## Outstanding

- The app still targets https://staging.usedfruit.de. Backend work is active in the shared repository. Validate production and native Apple login before creating the final submission build.
- Owner confirmation requested for third-party content rights; not saved.
- Germany-only availability was blocked by automatic approval review; owner confirmation requested. No region saved.
- Review contact and notes were blocked by automatic approval review; owner confirmation requested. Do not assume saved.
- Screenshots and media are uploaded exclusively by the owner.
- Required-reason API reference: https://developer.apple.com/documentation/bundleresources/app-privacy-configuration/nsprivacyaccessedapitypes/nsprivacyaccessedapitypereasons

## Prepared review notes

Used Fruit is a German marketplace for second-hand Mac, iPad and iPhone devices. Authentication uses native Sign in with Apple exclusively. Select “Mit Apple anmelden” and use an Apple Account; no separate Used Fruit username/password exists. A new profile is created on first sign-in.

Users can browse listings, save favorites, create listings, exchange messages and send purchase offers. The seller must accept an offer. Payment and handover are arranged directly between users; the app does not process payments and provides no digital in-app purchases.

Account deletion is available in the Account tab. Listings can be reported and users can be blocked.

Before using these notes for submission, verify the final production build and add concrete review-access instructions if requested by Apple. Never enter fabricated credentials.

## Build upload — 19:15 CEST

Current signed Release archive `/tmp/UsedFruit-review-1.0.xcarchive` uploaded successfully through Xcode: `Upload succeeded`, `EXPORT SUCCEEDED`. Apple is processing the package. Upload log: `/tmp/usedfruit-review-upload.log`. This is not an App Review submission or a public release.

Four screenshots are present in App Store Connect. Review notes explain native Sign in with Apple, automatic profile creation, staging backend, Debug-only local screenshot account and the unverified physical-device login. The challenge endpoint returned HTTP 200 with a challenge ID and nonce hash; this does not validate the complete login flow.

Automatic review blocked Add for Review because no build was assigned and review access was incomplete. Content-rights confirmation, country selection and review contact approvals remain outstanding.
