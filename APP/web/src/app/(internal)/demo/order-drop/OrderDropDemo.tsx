"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./order-drop.module.css";

type ScreenId = "s1" | "s2" | "s3" | "s4";

// Original CSS/SVG latte illustration — no third-party photos or logos.
function LatteArt(): React.JSX.Element {
  return (
    <svg viewBox="0 0 320 320" role="img" aria-label="Churro latte illustration">
      <g stroke="#FBEBD3" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.8}>
        <path className={styles.steam} d="M150 120 q-10 -16 0 -30 q10 -14 0 -28" />
        <path className={`${styles.steam} ${styles.steamB}`} d="M170 122 q10 -16 0 -30 q-10 -14 0 -28" />
        <path className={`${styles.steam} ${styles.steamC}`} d="M188 124 q-8 -14 0 -26" />
      </g>
      <ellipse cx={160} cy={252} rx={96} ry={20} fill="#5E3417" />
      <ellipse cx={160} cy={246} rx={96} ry={20} fill="#8A4E27" />
      <path d="M96 150 h128 l-12 78 a20 20 0 0 1 -20 17 h-64 a20 20 0 0 1 -20 -17 z" fill="#F6EFE4" />
      <path d="M96 150 h128 l-3 20 h-122 z" fill="#EADFCB" />
      <ellipse cx={160} cy={152} rx={64} ry={16} fill="#FBF6EC" />
      <path d="M160 140 q-14 6 0 14 q14 -8 0 -14" fill="#C88A4E" opacity={0.65} />
      <path d="M160 150 q-22 4 0 10 q22 -6 0 -10" fill="#C88A4E" opacity={0.45} />
      <path d="M224 168 q34 4 30 34 q-4 26 -32 24" fill="none" stroke="#F6EFE4" strokeWidth={13} />
      <g transform="rotate(18 236 210)">
        <rect x={228} y={120} width={16} height={120} rx={8} fill="#B26A2E" />
        <g stroke="#7E4820" strokeWidth={2.4} opacity={0.7}>
          <line x1={228} y1={138} x2={244} y2={132} />
          <line x1={228} y1={158} x2={244} y2={152} />
          <line x1={228} y1={178} x2={244} y2={172} />
          <line x1={228} y1={198} x2={244} y2={192} />
          <line x1={228} y1={218} x2={244} y2={212} />
        </g>
      </g>
    </svg>
  );
}

function Check(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
      <path d="M5 12l5 5 9-11" />
    </svg>
  );
}

export default function OrderDropDemo(): React.JSX.Element {
  const [screen, setScreen] = useState<ScreenId>("s1");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const go = useCallback((id: ScreenId) => {
    clear();
    setScreen(id);
    if (id === "s2") {
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      timer.current = setTimeout(() => setScreen("s3"), reduce ? 700 : 1700);
    }
  }, []);

  useEffect(() => clear, []);

  const cls = (id: ScreenId, extra?: string) =>
    `${styles.screen} ${extra ?? ""} ${screen === id ? styles.screenActive : ""}`;

  return (
    <div className={styles.wrap}>
      <span className={styles.eyebrow}>Fina Calle OS · Module preview · PR #220</span>
      <h1 className={styles.h1}>The Order Drop</h1>
      <p className={styles.lede}>
        One featured item, one Instagram post, one tap — handed to a rail everyone already trusts.
      </p>

      <div className={styles.stage}>
        {/* PHONE */}
        <div className={styles.phoneCol}>
          <div className={styles.phone} aria-label="Interactive phone demo">
            <div className={styles.screenwin}>
              {/* SCREEN 1 — Instagram promo */}
              <section className={cls("s1")} aria-label="Instagram promo" aria-hidden={screen !== "s1"}>
                <div className={styles.statusbar}>
                  <span>9:41</span>
                  <span className={styles.dots}>
                    <i />
                    <i />
                    <i />
                    <span style={{ marginLeft: 4 }}>100%</span>
                  </span>
                </div>
                <div className={styles.igHead}>
                  <div className={styles.ava}>
                    <span>C</span>
                  </div>
                  <div className={styles.who}>
                    <b>colattao</b>
                    <small>Sponsored · Featured drop</small>
                  </div>
                  <div className={styles.more}>···</div>
                </div>
                <div className={styles.igMedia}>
                  <span className={styles.dropBadge}>This week only</span>
                  <LatteArt />
                </div>
                <div className={styles.igActions} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
                    <path d="M20.8 8.6c0 5-8.8 10.4-8.8 10.4S3.2 13.6 3.2 8.6A4.4 4.4 0 0 1 12 6.4a4.4 4.4 0 0 1 8.8 2.2Z" />
                  </svg>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
                    <path d="M21 11.5a8.4 8.4 0 0 1-11.5 7.8L3 21l1.7-6.5A8.4 8.4 0 1 1 21 11.5Z" />
                  </svg>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
                    <path d="M22 3 11 14M22 3l-7 19-4-8-8-4 19-7Z" />
                  </svg>
                  <svg className={styles.save} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
                    <path d="M6 3h12v18l-6-4-6 4V3Z" />
                  </svg>
                </div>
                <div className={styles.igCap}>
                  <b>colattao</b> The <b>Churro Latte</b> is back for the drop — cinnamon-sugar foam,
                  real churro on the side. <span className={styles.price}>$5.50</span>{" "}
                  <span className={styles.muted}>· pickup or delivery</span>
                </div>
                <div className={styles.ctaWrap}>
                  <button className={styles.cta} onClick={() => go("s2")} type="button">
                    Order now <small>· Uber Eats</small>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </button>
                </div>
              </section>

              {/* SCREEN 2 — handoff */}
              <section
                className={cls("s2", styles.handoff)}
                aria-label="Handing off to Uber Eats"
                aria-hidden={screen !== "s2"}
              >
                <div className={styles.spin} aria-hidden="true" />
                <h3>Taking you to Uber Eats</h3>
                <p>Your order is already loaded. No app to install, no new account.</p>
                <div className={styles.rail}>
                  <div>
                    <Check /> Signed in as you
                  </div>
                  <div>
                    <Check /> Your saved card
                  </div>
                  <div>
                    <Check /> Delivery in ~25 min
                  </div>
                </div>
              </section>

              {/* SCREEN 3 — delivery app (illustrative) */}
              <section className={cls("s3")} aria-label="Uber Eats item, illustrative" aria-hidden={screen !== "s3"}>
                <div className={styles.ueTop}>
                  <span className={styles.back}>‹</span>
                  <span className={styles.brand}>
                    Uber <b>Eats</b>
                  </span>
                  <span className={styles.ueIllus}>Illustrative</span>
                </div>
                <div className={styles.ueBody}>
                  <div className={styles.ueHero}>
                    <svg viewBox="0 0 320 118" role="img" aria-label="Colattao café">
                      <circle cx={60} cy={60} r={34} fill="#F6EFE4" opacity={0.2} />
                      <text x={20} y={70} fontFamily="var(--font-fraunces), serif" fontSize={30} fill="#FBEFDD" fontWeight={600}>
                        Colattao
                      </text>
                    </svg>
                  </div>
                  <div className={styles.ueShop}>
                    <h3>Colattao Café</h3>
                    <div className={styles.ueMeta}>
                      <span>★ 4.9</span>
                      <span>25–35 min</span>
                      <span>$0.99 delivery</span>
                    </div>
                  </div>
                  <div className={styles.ueItem}>
                    <div className={styles.thumb}>
                      <svg viewBox="0 0 58 58">
                        <path d="M14 26h30l-3 20a6 6 0 0 1-6 5H23a6 6 0 0 1-6-5z" fill="#F6EFE4" />
                        <ellipse cx={29} cy={27} rx={15} ry={4} fill="#FBF6EC" />
                        <path d="M44 30q9 1 8 9-1 7-9 6" fill="none" stroke="#F6EFE4" strokeWidth={3.4} />
                      </svg>
                    </div>
                    <div className={styles.txt}>
                      <h4>
                        Churro Latte <span className={styles.itemPrice}>$5.50</span>
                      </h4>
                      <p>
                        Double shot, steamed milk, cinnamon-sugar foam. Served with a warm churro.
                        This week’s featured drop.
                      </p>
                    </div>
                  </div>
                  <div className={styles.ueInbag}>
                    <span className={styles.qty}>1 ×</span>
                    <span className={styles.nm}>Churro Latte</span>
                    <span className={styles.pr}>$5.50</span>
                  </div>
                </div>
                <div className={styles.ueFoot}>
                  <div className={styles.ueLine}>
                    <span>Subtotal</span>
                    <span>$5.50</span>
                  </div>
                  <div className={styles.ueLine}>
                    <span>Delivery</span>
                    <span>$0.99</span>
                  </div>
                  <div className={`${styles.ueLine} ${styles.ueLineTot}`}>
                    <span>Total</span>
                    <span>$6.49</span>
                  </div>
                  <button className={styles.btnGood} onClick={() => go("s4")} type="button">
                    Place order · $6.49
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </button>
                </div>
              </section>

              {/* SCREEN 4 — placed */}
              <section className={cls("s4", styles.done)} aria-label="Order placed" aria-hidden={screen !== "s4"}>
                <div className={styles.check} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
                    <path d="M4 12l5 6 11-13" />
                  </svg>
                </div>
                <h3>Order placed</h3>
                <p>
                  Colattao is making your Churro Latte. Uber has the delivery — you’ll get their
                  live tracking.
                </p>
                <div className={styles.eta}>Arriving ~25 min · driver assigned</div>
              </section>
            </div>
          </div>
          <p className={styles.taps}>
            <b>2</b> taps from post to placed order
          </p>
          <button className={styles.replay} onClick={() => go("s1")} type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <path d="M4 12a8 8 0 1 1 2.3 5.6M4 12V7m0 5h5" />
            </svg>
            Replay the flow
          </button>
        </div>

        {/* NARRATIVE */}
        <div className={styles.info}>
          <div className={styles.flowmap} aria-label="Flow">
            <span className={styles.node}>
              <b>Instagram post</b>
            </span>
            <span className={styles.arr}>→</span>
            <span className={styles.node}>
              <b>One tap</b>
            </span>
            <span className={styles.arr}>→</span>
            <span className={`${styles.node} ${styles.nodePay}`}>
              <b>Uber Eats — pays &amp; delivers</b>
            </span>
          </div>

          <div className={styles.seam}>
            <h2>Seamless for everybody</h2>
            <p className={styles.sub}>Nobody in the chain has to learn anything new.</p>
            <div className={styles.cards}>
              <div className={styles.card}>
                <div className={styles.ico}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <circle cx={12} cy={8} r={4} />
                    <path d="M4 21a8 8 0 0 1 16 0" />
                  </svg>
                </div>
                <span className={styles.tag}>The customer</span>
                <h3>No new app</h3>
                <p>
                  Taps the post, lands in Uber Eats already signed in, pays with their saved card
                  and gets delivery exactly the way they always do.
                </p>
              </div>
              <div className={styles.card}>
                <div className={styles.ico}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d="M4 9h16v11H4z" />
                    <path d="M4 9l2-5h12l2 5M9 13h6" />
                  </svg>
                </div>
                <span className={styles.tag}>The restaurant</span>
                <h3>Nothing to learn</h3>
                <p>
                  The order arrives in Uber Eats like every other order — same tablet, same kitchen
                  ticket, same drivers. Zero new training or hardware.
                </p>
              </div>
              <div className={styles.card}>
                <div className={styles.ico}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <span className={styles.tag}>You — AMMA</span>
                <h3>Nothing to babysit</h3>
                <p>
                  No Stripe custody, no Meta app, no migration, no server on call. You just point
                  demand at one item. Shippable this week.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.noteBox}>
            <span className={styles.noteH}>Where it fits in the #220 plan</span>
            This is the <b>zero-dependency on-ramp</b>. It earns from a link-in-bio, a story, or the
            printed QR <b>today</b> — with no Meta App Review and no order backend — while the full
            commission-free <b>Order Core</b> (direct Stripe Connect checkout) is built behind it.
            The trade-off is honest: on this rail Uber takes its commission and owns the customer.
            That’s the price of shipping now. When P2 lands, the same featured item graduates to
            your own checkout and the Uber link becomes the fallback, not the destination.
          </div>

          <div className={styles.ctaRow}>
            <a className={styles.linkUe} href="https://www.ubereats.com" target="_blank" rel="noopener noreferrer">
              Open the real Uber Eats
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </a>
            <span className={styles.swap}>
              deep-link swaps to DoorDash, Toast, or your own checkout — same flow
            </span>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <b>Prototype.</b> The handoff screen is an illustrative representation of a delivery app,
        not a functional Uber Eats page — the real “Order now” opens ubereats.com with the item
        pre-selected. Item art is original CSS/SVG; no third-party logos are reproduced. Colattao is
        an AMMA / Fina Calle client; menu item and pricing shown are for demonstration.
      </footer>
    </div>
  );
}
