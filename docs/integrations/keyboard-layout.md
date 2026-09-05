# MacBook keyboard layouts

The physical keyboard belongs to each offer/listing, not to the shared model definition. Do not infer it from the merchant's country, website language, delivery country, model name or macOS input settings.

`Listing.keyboardLayout` stores a canonical layout ID; `keyboardLayoutDetails` describes `other` layouts (1–100 trimmed characters). IDs: `de-at`, `ch`, `us`, `uk`, `international`, `fr`, `other`. German and Austrian are grouped according to Apple's identification guide: https://support.apple.com/de-at/102743. Swiss QWERTZ is distinct. US, UK/Irish and International English QWERTY are distinct.

New MacBook Neo/Air/Pro listings require an explicit selection. Existing listings without a layout remain readable and show “Nicht angegeben”. Owners can add or correct the physical layout from their listing actions. A keyboard filter excludes missing layouts and other device families. No seed keyboard values have been invented.

## Future merchant imports

There is no Awin importer in this repository yet. When adding it:

- Inspect actual feed columns and explicit keyboard values before mapping anything.
- Keep the original merchant keyboard value for auditing.
- Map only verified, unambiguous physical layouts. “QWERTZ” alone does not distinguish German/Austrian from Swiss. “QWERTY” alone does not distinguish US from UK or International English. Leave ambiguous values unknown and show that to buyers.
- Keep offers with different keyboards separate; do not merge on model/storage/color alone.
- Never copy one merchant's keyboard value to all offers for the same model.
- Do not silently interpret “other” as a verified layout without a description.
