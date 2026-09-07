# AWS SES setup — 2026-09-05

Status: **in progress; no Used Fruit notification emails are being sent**.

The user chose AWS SES instead of the previously discussed private SMTP server. Intended sender: `Used Fruit <noreply@usedfruit.de>`. Send only when the recipient has enabled email notifications, with a message preview and a link to the authenticated conversation.

## AWS configuration completed

- Existing SES service located in `eu-north-1` (Stockholm), alongside the verified `loginsign.com` identity.
- Account dashboard reports Healthy, 50,000 messages/day and 14 messages/second.
- Created domain identity `usedfruit.de`, ARN `arn:aws:ses:eu-north-1:033877255667:identity/usedfruit.de`.
- Easy DKIM enabled, RSA 2048-bit.
- Custom MAIL FROM `mail.usedfruit.de`, fallback to the SES default on MX failure.
- Automatic Route 53 publishing disabled because DNS is managed at Dynadot.
- SES now reports Identity status Verified and DKIM configuration Successful. Custom MAIL FROM configuration remains Pending. No IAM credentials were created or copied, no test email was sent, and the live app was not changed.

## DNS records published at Dynadot

Saved all six records on 2026-09-05 and reopened the editor to verify persistence. Existing apex A `195.201.145.202` and `www` CNAME `usedfruit.de` were preserved. TTL remains 300 seconds. There were no existing SPF, MX or DMARC records to merge. Public DNS checks confirmed all three DKIM CNAMEs, MAIL FROM MX/SPF and DMARC during propagation; SES subsequently confirmed the identity and DKIM as verified/successful; custom MAIL FROM remains pending.

| Type | Name relative to usedfruit.de | Value | Priority |
|---|---|---|---|
| CNAME | `7nhcmvj3ormzfgteeu723ym7kzvfv22j._domainkey` | `7nhcmvj3ormzfgteeu723ym7kzvfv22j.dkim.amazonses.com` | |
| CNAME | `duw3omqp2qevhletxifugwbegbihv6ze._domainkey` | `duw3omqp2qevhletxifugwbegbihv6ze.dkim.amazonses.com` | |
| CNAME | `ok4dqq2tg5bxda6t57qit3kstwv3t6we._domainkey` | `ok4dqq2tg5bxda6t57qit3kstwv3t6we.dkim.amazonses.com` | |
| MX | `mail` | `feedback-smtp.eu-north-1.amazonses.com` | 10 |
| TXT | `mail` | `v=spf1 include:amazonses.com ~all` | |
| TXT | `@` (apex) | `v=spf1 include:amazonses.com ~all` | |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | |

Recheck public DNS and SES verification after publishing. Do not replace apex MX records with the custom MAIL FROM record.

## Remaining application work

The current application still stores chat messages and profile preferences only in localStorage. The Apple callback validates identity but does not retain a verified email address. A browser notification is not a reliable server email trigger, especially with the recipient offline.

Before enabling delivery, implement durable recipient records keyed by verified Apple subject, verified Apple email retention, server-side notification preferences, and authenticated shared message storage with stable participant and listing-owner identities. Never resolve email recipients by display name or accept arbitrary recipient addresses/message contents from a public send-email endpoint. Seed/demo sellers have no real recipient mapping.

Use a durable outbox tied to committed incoming messages, respecting recipient opt-out, block/mute preferences and duplicate suppression. Include authenticated chat links and an accessible opt-out control. Handle delivery failures and SES bounce/complaint suppression. Keep AWS credentials exclusively on the server, scoped to the Used Fruit sender; preserve the existing LoginSign integration.

The existing browser/system-notification preference must not be silently treated as explicit email opt-in. Email preference should be stored and enforced on the server and remain independent of browser notification permission.

Registered `noreply@usedfruit.de` as an Email Source in Apple Developer team `AUP84ZCD2B` after explicit user approval. Apple confirmed “Email Source Registration Complete” and “1 Email address”. The list initially showed a failed SPF check, so an additional apex TXT record `v=spf1 include:amazonses.com ~all` was saved at Dynadot (success confirmation). Apple Reverify SPF was run, but the failed SPF indicator remained while the apex TXT was still propagating. A successful SPF recheck and an actual relay delivery test remain pending; registration alone does not prove delivery.

The earlier automatic approval block on Apple access was resolved by the user’s explicit “ja bitte setze es um” approval. No further approval is needed for this same sender registration scope.

## References

- [AWS SES identity verification](https://docs.aws.amazon.com/ses/latest/dg/creating-identities.html)
- [Apple private email relay configuration](https://developer.apple.com/help/account/capabilities/configure-private-email-relay-service/)
