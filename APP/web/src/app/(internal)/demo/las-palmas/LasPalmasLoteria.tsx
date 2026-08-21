"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./LasPalmasLoteria.module.css";

// Lotería de Las Palmas — the prospect hero.
//
// Why a game first: the Fina Calle differentiator is "branded mini-game +
// collectible set", and the previous hero hid both behind a button labelled
// "Game". Lotería is the honest frame for that pair — it is a Mexican game
// built on numbered collectible cards, so the numbering carries real meaning
// instead of decorating the layout.
//
// Guardrails honoured here: the keeper is a non-human mascot (gecko), every
// visual is drawn from primitives so there is no asset that can 404, no client
// logo is generated, and nothing claims ordering, payment, or POS. Card names
// are real rows from the curated Lynnhaven dataset.

type Dish = {
  readonly n: number;
  readonly name: string;
  readonly art: keyof typeof ART;
};

// Seven real menu rows + the mascot. Numbers are lotería-style, not menu ids.
const DISHES: readonly Dish[] = [
  { n: 1, name: "La Palma", art: "palm" },
  { n: 7, name: "El Molcajete", art: "pot" },
  { n: 12, name: "El Guacamole", art: "avo" },
  { n: 19, name: "La Birria", art: "taco" },
  { n: 23, name: "El Ceviche", art: "shell" },
  { n: 31, name: "El Queso Fundido", art: "queso" },
  { n: 38, name: "El Limón", art: "lime" },
  { n: 45, name: "El Gecko", art: "gecko" },
];

const ART = {
  lime: (
    <>
      <circle cx="30" cy="30" r="21" fill="#A8C43A" />
      <circle cx="30" cy="30" r="15" fill="#cfe07a" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line
          key={i}
          x1="30"
          y1="30"
          x2={30 + 15 * Math.cos((i * Math.PI) / 3)}
          y2={30 + 15 * Math.sin((i * Math.PI) / 3)}
          stroke="#7d9a2b"
          strokeWidth="1.4"
        />
      ))}
    </>
  ),
  palm: (
    <>
      <path d="M30 54 Q31 38 29 24" stroke="#7d8a91" strokeWidth="3" fill="none" />
      {[-70, -35, 0, 35, 70].map((a) => (
        <ellipse key={a} cx="30" cy="20" rx="4" ry="16" fill="#aeb5bb" transform={`rotate(${a} 30 24)`} />
      ))}
    </>
  ),
  taco: (
    <>
      <path d="M8 40 A22 22 0 0 1 52 40 Z" fill="#f0c05a" />
      <path d="M12 38 A18 18 0 0 1 48 38 Z" fill="#d5322d" />
      <path d="M15 36 A15 15 0 0 1 45 36 Z" fill="#a9b8a9" />
    </>
  ),
  shell: (
    <>
      <path d="M30 50 Q8 40 12 20 Q30 8 48 20 Q52 40 30 50Z" fill="#f7f8f9" stroke="#aeb5bb" strokeWidth="1.2" />
      {[-24, -12, 0, 12, 24].map((o) => (
        <path key={o} d={`M30 50 Q${30 + o} 30 ${30 + o * 1.5} 18`} stroke="#aeb5bb" strokeWidth="1" fill="none" />
      ))}
    </>
  ),
  avo: (
    <>
      <ellipse cx="30" cy="32" rx="18" ry="22" fill="#4b7b3a" />
      <ellipse cx="30" cy="32" rx="13" ry="17" fill="#cfe07a" />
      <ellipse cx="30" cy="34" rx="7" ry="8" fill="#8a5a2b" />
    </>
  ),
  pot: (
    <>
      <path d="M12 26 Q30 18 48 26 L44 50 Q30 56 16 50 Z" fill="#5b5f60" />
      <ellipse cx="30" cy="26" rx="18" ry="6" fill="#7d8a91" />
      <path d="M20 24 Q30 14 40 24" stroke="#d5322d" strokeWidth="2.5" fill="none" />
    </>
  ),
  queso: (
    <>
      <rect x="12" y="26" width="36" height="22" rx="4" fill="#8a5a2b" />
      <rect x="8" y="22" width="44" height="7" rx="3" fill="#a06a34" />
      <path d="M18 26 Q24 34 30 26 Q36 34 42 26" stroke="#f0c05a" strokeWidth="3" fill="none" />
    </>
  ),
  gecko: (
    <>
      <ellipse cx="30" cy="32" rx="11" ry="16" fill="#4b7b3a" />
      <circle cx="30" cy="16" r="8" fill="#5d9147" />
      <circle cx="27" cy="14" r="1.8" fill="#06130d" />
      <circle cx="33" cy="14" r="1.8" fill="#06130d" />
      <path d="M30 48 Q34 56 26 58" stroke="#4b7b3a" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="18" cy="28" rx="6" ry="3" fill="#5d9147" />
      <ellipse cx="42" cy="28" rx="6" ry="3" fill="#5d9147" />
    </>
  ),
} as const;

// Short pitch on purpose: the lotería row must stay inside the first phone
// viewport, otherwise the collectible is hidden again and the hero repeats the
// problem it replaced.
const W = 720;
const H = 560;
const GOAL = { x: 96, y: 96, w: 528, h: 236 };
const SPOT = { x: 360, y: 470 };

type Particle = { x: number; y: number; vx: number; vy: number; life: number };

export default function LasPalmasLoteria(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [won, setWon] = useState<readonly number[]>([]);
  const [shot, setShot] = useState(1);
  const [nudge, setNudge] = useState(true);
  const [shout, setShout] = useState<{ text: string; miss: boolean } | null>(null);

  const award = useCallback(() => {
    setWon((prev) => {
      const pool = DISHES.filter((d) => !prev.includes(d.n));
      if (pool.length === 0) return prev;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      return [...prev, pick.n];
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const cx = canvas?.getContext("2d");
    if (!canvas || !cx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ball = { x: SPOT.x, y: SPOT.y, r: 22, vx: 0, vy: 0, flying: false, t: 0 };
    const keeper = { x: 360, y: GOAL.y + GOAL.h - 30, tx: 360, w: 74, h: 78 };
    let aim: { x: number; y: number } | null = null;
    let particles: Particle[] = [];
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const reset = () => {
      ball.x = SPOT.x;
      ball.y = SPOT.y;
      ball.vx = 0;
      ball.vy = 0;
      ball.flying = false;
      ball.t = 0;
      keeper.tx = 360;
    };

    const burst = (x: number, y: number) => {
      if (reduce) return;
      for (let i = 0; i < 26; i += 1) {
        particles.push({ x, y, vx: (Math.random() - 0.5) * 13, vy: (Math.random() - 0.5) * 13 - 3, life: 1 });
      }
    };

    const finish = (text: string, miss: boolean) => {
      setShout({ text, miss });
      ball.flying = false;
      timer = setTimeout(() => {
        setShout(null);
        setShot((s) => (s >= 5 ? 1 : s + 1));
        reset();
      }, 1000);
    };

    const palms = () => {
      ([[52, 1], [668, -1]] as const).forEach(([bx, dir]) => {
        cx.strokeStyle = "rgba(125,138,145,.85)";
        cx.lineWidth = 7;
        cx.lineCap = "round";
        cx.beginPath();
        cx.moveTo(bx, H);
        cx.quadraticCurveTo(bx + dir * 12, 330, bx + dir * 3, 188);
        cx.stroke();
        for (let i = 0; i < 6; i += 1) {
          const a = -dir * (0.55 + i * 0.34);
          const L = 96 - i * 6;
          cx.save();
          cx.translate(bx + dir * 3, 188);
          cx.rotate(a - Math.PI / 2);
          cx.fillStyle = `rgba(174,181,187,${0.5 - i * 0.05})`;
          cx.beginPath();
          cx.ellipse(0, -L / 2, 9, L / 2, 0, 0, Math.PI * 2);
          cx.fill();
          cx.restore();
        }
      });
    };

    const goal = () => {
      cx.strokeStyle = "rgba(223,227,230,.92)";
      cx.lineWidth = 8;
      cx.lineCap = "round";
      cx.beginPath();
      cx.moveTo(GOAL.x, GOAL.y + GOAL.h);
      cx.lineTo(GOAL.x, GOAL.y);
      cx.lineTo(GOAL.x + GOAL.w, GOAL.y);
      cx.lineTo(GOAL.x + GOAL.w, GOAL.y + GOAL.h);
      cx.stroke();
      cx.strokeStyle = "rgba(223,227,230,.17)";
      cx.lineWidth = 1.5;
      for (let x = GOAL.x + 22; x < GOAL.x + GOAL.w; x += 22) {
        cx.beginPath();
        cx.moveTo(x, GOAL.y);
        cx.lineTo(x, GOAL.y + GOAL.h);
        cx.stroke();
      }
      for (let y = GOAL.y + 20; y < GOAL.y + GOAL.h; y += 20) {
        cx.beginPath();
        cx.moveTo(GOAL.x, y);
        cx.lineTo(GOAL.x + GOAL.w, y);
        cx.stroke();
      }
    };

    const drawKeeper = () => {
      const { x, y, w, h } = keeper;
      const lean = (x - 360) / 300; // -1 .. 1, which way the gecko is committing
      const tailSide = lean >= 0 ? -1 : 1; // tail counterbalances the dive

      // curling tail first, so the body overlaps its root
      cx.strokeStyle = "#3f6a31";
      cx.lineWidth = 9;
      cx.lineCap = "round";
      cx.beginPath();
      cx.moveTo(x, y + h / 3);
      cx.quadraticCurveTo(x + tailSide * 34, y + h / 2.1, x + tailSide * 46, y + h / 6);
      cx.stroke();

      // splayed feet
      cx.strokeStyle = "#5d9147";
      cx.lineWidth = 7;
      [-1, 1].forEach((s) => {
        cx.beginPath();
        cx.moveTo(x + s * 10, y + h / 5);
        cx.lineTo(x + s * 26, y + h / 2.6);
        cx.stroke();
      });

      // body + head
      cx.fillStyle = "#4b7b3a";
      cx.beginPath();
      cx.ellipse(x, y, w / 2.8, h / 2.3, lean * 0.22, 0, Math.PI * 2);
      cx.fill();

      const hx = x + lean * 5;
      const hy = y - h / 2.15;
      cx.fillStyle = "#5d9147";
      cx.beginPath();
      cx.ellipse(hx, hy, 17, 13, lean * 0.25, 0, Math.PI * 2); // snout, not a ball
      cx.fill();

      cx.fillStyle = "#cfe07a"; // eye ring reads at thumbnail size
      cx.beginPath();
      cx.arc(hx - 7, hy - 3, 5, 0, Math.PI * 2);
      cx.fill();
      cx.beginPath();
      cx.arc(hx + 7, hy - 3, 5, 0, Math.PI * 2);
      cx.fill();
      cx.fillStyle = "#06130d";
      cx.beginPath();
      cx.arc(hx - 7 + lean * 1.6, hy - 3, 2.4, 0, Math.PI * 2);
      cx.fill();
      cx.beginPath();
      cx.arc(hx + 7 + lean * 1.6, hy - 3, 2.4, 0, Math.PI * 2);
      cx.fill();

      // arms reach toward the dive
      const reach = (x - 360) / 7;
      cx.strokeStyle = "#5d9147";
      cx.lineWidth = 11;
      cx.beginPath();
      cx.moveTo(x - 12, y - 8);
      cx.lineTo(x - 36 - Math.max(0, -reach), y - 26);
      cx.stroke();
      cx.beginPath();
      cx.moveTo(x + 12, y - 8);
      cx.lineTo(x + 36 + Math.max(0, reach), y - 26);
      cx.stroke();
    };

    const drawBall = () => {
      cx.save();
      cx.translate(ball.x, ball.y);
      cx.rotate(ball.t * 0.25);
      cx.fillStyle = "#A8C43A";
      cx.beginPath();
      cx.arc(0, 0, ball.r, 0, Math.PI * 2);
      cx.fill();
      cx.fillStyle = "#cfe07a";
      cx.beginPath();
      cx.arc(0, 0, ball.r * 0.68, 0, Math.PI * 2);
      cx.fill();
      cx.strokeStyle = "#7d9a2b";
      cx.lineWidth = 2;
      for (let i = 0; i < 6; i += 1) {
        cx.beginPath();
        cx.moveTo(0, 0);
        cx.lineTo(ball.r * 0.66 * Math.cos((i * Math.PI) / 3), ball.r * 0.66 * Math.sin((i * Math.PI) / 3));
        cx.stroke();
      }
      cx.restore();
    };

    const loop = () => {
      cx.clearRect(0, 0, W, H);
      const g = cx.createLinearGradient(0, GOAL.y + GOAL.h - 40, 0, H);
      g.addColorStop(0, "rgba(11,43,27,.9)");
      g.addColorStop(1, "rgba(6,19,13,1)");
      cx.fillStyle = g;
      cx.fillRect(0, GOAL.y + GOAL.h - 40, W, H);
      palms();
      goal();

      keeper.x += (keeper.tx - keeper.x) * 0.14;
      drawKeeper();

      if (ball.flying) {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vy += 0.13;
        ball.t += 1;
        const inGoal = ball.y < GOAL.y + GOAL.h && ball.x > GOAL.x && ball.x < GOAL.x + GOAL.w;
        const caught =
          Math.abs(ball.x - keeper.x) < keeper.w / 2 + ball.r && Math.abs(ball.y - keeper.y) < keeper.h / 2 + ball.r;
        if (caught) {
          burst(ball.x, ball.y);
          finish("¡Atajada!", true);
        } else if (inGoal && ball.y < GOAL.y + GOAL.h - 8) {
          burst(ball.x, ball.y);
          award();
          finish("¡GOL!", false);
        } else if (ball.y < -60 || ball.x < -60 || ball.x > W + 60) {
          finish("Fuera", true);
        }
      }

      particles = particles.filter((p) => p.life > 0);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3;
        p.life -= 0.026;
        cx.fillStyle = `rgba(207,224,122,${Math.max(0, p.life)})`;
        cx.beginPath();
        cx.arc(p.x, p.y, 3.4, 0, Math.PI * 2);
        cx.fill();
      });

      if (aim) {
        cx.strokeStyle = "rgba(168,196,58,.55)";
        cx.lineWidth = 3;
        cx.setLineDash([9, 9]);
        cx.beginPath();
        cx.moveTo(ball.x, ball.y);
        cx.lineTo(aim.x, aim.y);
        cx.stroke();
        cx.setLineDash([]);
      }
      drawBall();
      raf = requestAnimationFrame(loop);
    };

    const at = (e: MouseEvent | TouchEvent) => {
      const r = canvas.getBoundingClientRect();
      const t = "touches" in e ? e.touches[0] : e;
      if (!t) return null;
      return { x: (t.clientX - r.left) * (W / r.width), y: (t.clientY - r.top) * (H / r.height) };
    };
    const start = (e: MouseEvent | TouchEvent) => {
      if (ball.flying) return;
      aim = at(e);
      e.preventDefault();
    };
    const move = (e: MouseEvent | TouchEvent) => {
      if (!aim || ball.flying) return;
      aim = at(e);
      e.preventDefault();
    };
    const release = (e: MouseEvent | TouchEvent) => {
      if (!aim || ball.flying) return;
      const dx = aim.x - ball.x;
      const dy = aim.y - ball.y;
      const power = Math.min(1, Math.hypot(dx, dy) / 260);
      ball.vx = dx * 0.062 * (0.6 + power);
      ball.vy = dy * 0.062 * (0.6 + power) - 1.4;
      ball.flying = true;
      aim = null;
      setNudge(false);
      keeper.tx = 360 + (Math.random() - 0.5) * 340;
      e.preventDefault();
    };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", release);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", release, { passive: false });

    reset();
    loop();

    return () => {
      cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", release);
      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", move);
      canvas.removeEventListener("touchend", release);
    };
  }, [award]);

  return (
    <div className={styles.wrap}>
      <div className={styles.marca}>
        <h1>
          Las Palmas <em>·</em> Lotería
        </h1>
        <span className={styles.lugar}>Lynnhaven</span>
      </div>

      <div className={styles.cancha}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          role="img"
          aria-label="Penalty shootout: drag the lime to shoot past the gecko keeper and win a lotería card."
        />
        <div className={styles.marcador}>
          <span>
            Tiro <b>{shot}</b>/5
          </span>
          <span>
            Cartas <b>{won.length}</b>/{DISHES.length}
          </span>
        </div>
        <p className={`${styles.pista} ${nudge ? "" : styles.pistaOculta}`}>Arrastra para tirar · Drag to shoot</p>
        {shout ? (
          <div className={`${styles.grito} ${styles.gritoVer} ${shout.miss ? styles.gritoFallo : ""}`} role="status">
            {shout.text}
          </div>
        ) : null}
      </div>

      <section aria-label="Lotería de Las Palmas">
        <div className={styles.coleccionTit}>
          <h2>Tu lotería</h2>
          <span>Gana una carta por gol</span>
        </div>
        <ul className={styles.cartas}>
          {DISHES.map((d) => {
            const has = won.includes(d.n);
            const label = String(d.n).padStart(2, "0");
            return (
              <li
                key={d.n}
                className={`${styles.carta} ${has ? styles.ganada : styles.vacia}`}
                data-n={label}
                aria-label={has ? `${label} ${d.name}, won` : `Card ${label}, not won yet`}
              >
                {has ? (
                  <>
                    <span className={styles.marco} aria-hidden />
                    <span className={styles.num} aria-hidden>
                      {label}
                    </span>
                    <svg viewBox="0 0 60 60" aria-hidden focusable="false">
                      {ART[d.art]}
                    </svg>
                    <span className={styles.nombre} aria-hidden>
                      {d.name}
                    </span>
                  </>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
