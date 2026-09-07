// The campaign, as data. Every headline, proof line and CTA lives here so a
// weekly refresh is a data edit, not a redesign — and so every claim can be
// checked against SALES_DEMO_PACKAGE/FEATURE_STATUS_TABLE.md in one place.
//
// HONESTY RULE: a line may only claim something the feature table marks live.
// Live: a real client's digital menu, the playable game demos, the build-request
// intake. NOT live, never advertise: ordering, payments, POS, loyalty, delivery,
// analytics dashboards, or any "increase sales by X%" promise.

export const OFFER = {
  price: "$199/month",
  terms: "month-to-month",
  market: "Virginia Beach",
  site: "finacalleos.com",
  landing: "https://finacalleos.com/for-restaurants",
};

/**
 * Ad variants. Each is one testable idea, not a reworded twin — the point of a
 * variant set is to learn which ANGLE works, so these differ on the promise:
 * A = the printed-menu pain, B = the price, C = the game differentiator.
 */
export const VARIANTS = [
  {
    id: "a-one-scan",
    angle: "Pain: paper menus go stale the moment prices change",
    kicker: "Virginia Beach restaurants",
    headline: "Your menu,\none scan away.",
    sub: "Change a price at 9am. Every table sees it at 9:01.",
    proof: "Live today for a local café.",
    cta: "See a real one",
  },
  {
    id: "b-flat-price",
    angle: "Price: flat, no setup fee, cancel anytime",
    kicker: "QR menus, built for you",
    headline: "$199 a month.\nThat's the whole price.",
    sub: "No setup fee. No contract. Cancel any month.",
    proof: "Built and hosted for you.",
    cta: "See what's included",
  },
  {
    id: "c-table-game",
    angle: "Differentiator: the menu people actually stay on",
    kicker: "More than a menu",
    headline: "The menu\nthey play with.",
    sub: "Your menu, plus a game your guests play at the table.",
    proof: "Playable demo — no signup.",
    cta: "Play the demo",
  },
];

/**
 * Placement sizes. Meta and Google both accept these; the renderer names each
 * file <variant>-<size>.png so uploading is drag-and-drop.
 */
export const SIZES = [
  { id: "square", w: 1080, h: 1080, note: "Instagram + Facebook feed" },
  { id: "portrait", w: 1080, h: 1350, note: "Instagram feed, best mobile reach" },
  { id: "story", w: 1080, h: 1920, note: "Stories and Reels" },
  { id: "landscape", w: 1200, h: 628, note: "Google Display + Facebook link" },
];
