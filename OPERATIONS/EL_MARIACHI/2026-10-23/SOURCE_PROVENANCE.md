# El Mariachi official source research

Retrieved on 2026-10-23 for an independent site demo. The restaurant has not been contacted, and this research does not establish an owner commission, endorsement, asset license, or owner validation.

## Jacksonville menu

- Exact source: https://fromtherestaurant.com/el-mariachi-mex-and-grill/menu/1305-N-Marine-Blvd/
- Data: `jacksonville-menu.json`
- Downloaded evidence: `jacksonville-menu-source.html`
- Reproducible parser: `extract_menu.py`
- Captured directly from the public URL with PowerShell `Invoke-WebRequest` and parsed from its HTML. The source has 260 items in 20 categories; all extracted category item counts match the numbers displayed in that HTML.
- Item `id` is the provider's own hidden `iid`. Each item's `orderUrl` is derived from the provider's published GET form action and the exact `iid`; it opens that item on the existing restaurant ordering service.
- Names and category ordering are preserved. Source descriptions are preserved in `sourceDescription`; display `description` only replaces source tilde separators with spaces. Empty descriptions are intentional: no description was published for those items.
- Prices are published online ordering base prices in USD at retrieval time. They may differ from in-store prices. Options/modifiers, taxes, and service charges are not included. Availability and prices may change.
- No prices or menu text were taken from restaurantselmariachi.com or another restaurant's menu.

### Stale search cache warning

The web search tool's indexed copy of this exact URL was marked crawled 1.1 years ago. It showed an older menu with an `Appetizer` category (22 items), a `Tacos` category (32 items), and Cheese Dip at $5.24. The direct HTML downloaded today shows `Appetizers` (19 items), `Tacos A La Parrilla` (13 items), and Cheese Dip at $5.72. Use the saved direct-download JSON, not the search engine's cached extract.

### Editorial notes for implementation

- The source misspells the second category `Spups & Salads`. The UI may display `Soups & Salads` while retaining sourceName for auditability.
- Do not infer single-taco quantities from the current `Tacos A La Parrilla` names. Most source entries omit descriptions and are priced at $15.08; the exact source names are retained.
- The source contains two separate `Burrito Chipotle` entries with different item IDs and slightly different descriptions. Both are retained to avoid silently deleting menu entries.
- `Pizza Birria` has a $17.67 base price and its description also mentions a large price of 27.03. Preserve the base price and direct customers to the existing item order page for options.
- Featured items can be selected from current source data; do not label them bestsellers unless separately supported. Examples: Quesabirria $15.59, Fajitas Texanas $18.71, El Mariachi $19.24, Burrito California $16.22, Arroz Con Pollo $14.55, Churros $5.99.

## Official brand and location sources

- Official homepage: https://www.elmariachimexandgrillnc.com/
- Official ordering locations: https://elmariachimexandgrillnc.com/el-mariachi-mex-and-grill/locations/
- Downloaded evidence: `official-home-source.html`, `official-locations-source.html`
- Use per-location hours on the homepage. The ordering locations page presents one generic hours block and explicitly says hours may vary by location.
- `locations.json` and `assets.json`, plus the original files in `assets/`, are derived from these official pages. Their individual records document provenance and practical limits. See `locations-assets-provenance.md` for further details.
- Six direct menu links were checked against the public provider's location-specific menu title and self-link. All six locations list pickup. Burgaw has no delivery button on the official locations page; the other five expose delivery.
- Actual official logo: https://d2gqo3h0psesgi.cloudfront.net/auto/el-mariachi-mex-and-grill-jxn7kcl3-logo.png
- Food and banner downloads are unchanged public files referenced by the official homepage. Two food photos contain embedded dish labels (`Fajitas fundida` and `Pizza Birria`). The other images are described visually without asserting an unverified menu-item match.

## Verification boundary

Only public source research and data extraction were performed. No app tests, browser QA, manual smoke tests, restaurant contact, ordering, account changes, or messaging were performed.
