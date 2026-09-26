"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Game } from "phaser";
import type { CafeRushCatch, CafeRushSpawn, CafeRushStatus } from "@/caferush/types";
import { BODEGA_CHAPTERS, BODEGA_ITEM_SCALE, MUFFIN_TERMS, makeBodegaRound, type BodegaRun } from "@/bodega-fall/challenge";
import { BODEGA_LEVELS } from "@/bodega-fall/level";
import { BODEGA_CATCH_SKIN } from "@/bodega-fall/skin";
import { BodegaCatchAudio } from "@/bodega-fall/audio";
import { useMuffinRewards } from "@/bodega-fall/useMuffinRewards";
import type { RewardCampaignSession } from "@/lib/bodega-rewards/contracts";
import MuffinClaim from "./MuffinClaim";
import MuffinMeter from "./MuffinMeter";
import styles from "./page.module.css";

const FINALE = "/assets/bodega/fall/collection-complete.png";
const BAD_VIBES_ART = "/assets/bodega/fall/bad-vibes.webp";
const FIND_ART = [
  "/assets/bodega/fall/spanish-latte.webp",
  "/assets/bodega/menu/green-drink.webp",
  "/assets/bodega/fall/cereal-bites.webp",
  "/assets/bodega/fall/vinyl-record.png",
  "/assets/bodega/fall/cinnamon-muffin.webp",
];
type Campaign = { mode: "practice" | "prize"; id?: string; seed: number; chapterIndex: number; runs: BodegaRun[] };
type View = "landing" | "playing" | "chapter" | "loss" | "victory";

export default function BodegaSessionsClient() {
  const [view, setView] = useState<View>("landing");
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [prizePlan, setPrizePlan] = useState<RewardCampaignSession | null>(null);
  const [runNonce, setRunNonce] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [startMessage, setStartMessage] = useState("");
  const [roundCatches, setRoundCatches] = useState<CafeRushCatch[]>([]);
  const [status, setStatus] = useState<CafeRushStatus>({ score: 0, seconds: BODEGA_LEVELS[0].rules.durationSec, target: BODEGA_LEVELS[0].rules.targetScore, over: false });
  const [muted, setMuted] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [lossReason, setLossReason] = useState<"bad-vibes" | "round">("round");
  const [lossProgress, setLossProgress] = useState(0);
  const mount = useRef<HTMLDivElement>(null);
  const game = useRef<Game | null>(null);
  const audio = useRef<BodegaCatchAudio | null>(null);
  const pausedRef = useRef(false);
  const preparingRef = useRef(false);
  const rewards = useMuffinRewards();
  const finishReward = rewards.finish;
  const chapterIndex = campaign?.chapterIndex ?? 0;
  const chapter = BODEGA_CHAPTERS[chapterIndex];
  const plan: CafeRushSpawn[] | undefined = useMemo(() => {
    if (!campaign || !chapter) return undefined;
    return campaign.mode === "prize"
      ? prizePlan && prizePlan.id === campaign.id ? prizePlan.plans[chapterIndex] : undefined
      : makeBodegaRound(campaign.seed, chapterIndex);
  }, [campaign, chapter, chapterIndex, prizePlan]);
  const badVibesCaught = roundCatches.some((event) => plan?.[event.id]?.itemId === "bad-vibes");
  const chapterWon = Boolean(chapter && status.over && !badVibesCaught && status.score >= chapter.targetScore
    && roundCatches.some((event) => plan?.[event.id]?.itemId === chapter.required));
  const displayScore = Math.max(0, Math.min(status.score, status.target));

  useEffect(() => () => { audio.current?.dispose(); audio.current = null; }, []);
  useEffect(() => {
    // Clear saves from previous releases. A visit now always starts at round one.
    try {
      for (const version of [1, 2, 3, 4]) window.localStorage.removeItem("bodega-fall-campaign-v" + version);
    } catch { /* Storage may be unavailable; in-memory play still works. */ }
    // Browser back can restore a page from its back-forward cache with React state intact.
    const resetOnRestore = (event: PageTransitionEvent) => { if (event.persisted) window.location.reload(); };
    window.addEventListener("pageshow", resetOnRestore);
    return () => window.removeEventListener("pageshow", resetOnRestore);
  }, []);
  useEffect(() => {
    if (view !== "victory") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setReveal(true); return; }
    const timer = window.setTimeout(() => setReveal(true), 2800);
    return () => window.clearTimeout(timer);
  }, [view]);
  useEffect(() => {
    if (view !== "playing") return;
    const mobile = window.matchMedia("(max-width: 700px), (max-height: 500px) and (pointer: coarse)");
    const previous = document.body.style.overflow;
    const sync = () => { document.body.style.overflow = mobile.matches ? "hidden" : previous; };
    sync(); mobile.addEventListener("change", sync);
    return () => { mobile.removeEventListener("change", sync); document.body.style.overflow = previous; };
  }, [view]);
  useEffect(() => {
    if (view !== "playing" || !campaign || !chapterWon || !status.over) return;
    const timer = window.setTimeout(() => {
      const runs = [...campaign.runs, { chapterIndex, events: roundCatches }];
      const complete = runs.length === BODEGA_CHAPTERS.length;
      setCampaign({ ...campaign, chapterIndex: chapterIndex + 1, runs });
      setView(complete ? "victory" : "chapter");
      if (complete && campaign.mode === "prize" && campaign.id) void finishReward(campaign.id, runs);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [view, campaign, chapterWon, status.over, chapterIndex, roundCatches, finishReward]);
  useEffect(() => {
    if (view !== "playing" || !campaign || !status.over || chapterWon) return;
    setLossReason(badVibesCaught ? "bad-vibes" : "round");
    setLossProgress(campaign.runs.length);
    setCampaign({ ...campaign, seed: campaign.mode === "practice" ? crypto.getRandomValues(new Uint32Array(1))[0] : campaign.seed, chapterIndex: 0, runs: [] });
    setView("loss");
  }, [view, campaign, status.over, chapterWon, badVibesCaught]);
  useEffect(() => {
    if (view !== "chapter" || !campaign || campaign.chapterIndex >= BODEGA_CHAPTERS.length) return;
    const timer = window.setTimeout(() => {
      setRoundCatches([]);
      setStatus({ score: 0, seconds: BODEGA_LEVELS[campaign.chapterIndex].rules.durationSec, target: BODEGA_LEVELS[campaign.chapterIndex].rules.targetScore, over: false });
      setPaused(false); pausedRef.current = false;
      setLoading(true); setError(false); setView("playing");
      setRunNonce((n) => n + 1);
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [view, campaign]);

  useEffect(() => {
    if (view !== "playing" || !campaign || !plan || !mount.current || !chapter) return;
    let cancelled = false;
    const catches: CafeRushCatch[] = [];
    const init = async () => {
      const [{ default: Phaser }, { CafeRushScene }] = await Promise.all([
        import("phaser"), import("@/caferush/CafeRushScene"),
      ]);
      if (cancelled || !mount.current) return;
      class BodegaCatchScene extends CafeRushScene {
        create() {
          this.events.on("cafe-status", (next: CafeRushStatus) => {
            if (cancelled) return;
            setStatus(next);
            if (next.over) {
              setRoundCatches([...catches]);
            }
          });
          this.events.on("cafe-catch-record", (event: CafeRushCatch) => { if (!cancelled) catches.push(event); });
          this.events.on("cafe-catch", (id: string) => { if (!cancelled) audio.current?.play(id); });
          super.create();
          if (cancelled) return;
          setLoading(false);
          if (pausedRef.current) this.scene.pause();
        }
      }
      const scene = new BodegaCatchScene(BODEGA_LEVELS[chapterIndex], BODEGA_CATCH_SKIN, {
        externalHud: true, catchLight: true, itemScale: BODEGA_ITEM_SCALE, separateSpawns: true,
        roundPlan: plan, reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      });
      game.current = new Phaser.Game({
        type: Phaser.CANVAS, parent: mount.current, width: mount.current.clientWidth, height: mount.current.clientHeight,
        backgroundColor: "#f4e7d1", scene: [scene], audio: { noAudio: true },
        scale: { mode: Phaser.Scale.RESIZE }, fps: { target: 60 },
      });
      game.current.canvas.setAttribute("aria-label", `Round ${chapterIndex + 1} of five. Catch ${chapter.keepsake} and reach ${chapter.targetScore} points in ten seconds. Touching Bad Vibes ends the run. Arrow keys select an item; Space or Enter catches it.`);
      mount.current.focus({ preventScroll: true });
    };
    void init().catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    const pauseForBackground = () => {
      audio.current?.pause(); pausedRef.current = true;
      game.current?.scene.getScenes(false).forEach((scene) => scene.scene.pause());
      setPaused(true);
    };
    const hide = () => { if (document.hidden) pauseForBackground(); };
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("pagehide", pauseForBackground);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("pagehide", pauseForBackground);
      game.current?.destroy(true); game.current = null;
    };
  }, [view, chapterIndex, campaign, plan, runNonce, chapter]);

  function unlockAudio() {
    if (!audio.current) audio.current = new BodegaCatchAudio();
    audio.current.setMuted(muted);
  }
  function togglePause() {
    const next = !pausedRef.current;
    pausedRef.current = next; setPaused(next);
    if (next) audio.current?.pause(); else unlockAudio();
    game.current?.scene.getScenes(false).forEach((scene) => next ? scene.scene.pause() : scene.scene.resume());
    if (!next) mount.current?.focus({ preventScroll: true });
  }
  function beginStage(nextCampaign: Campaign, prepared?: RewardCampaignSession) {
    if (nextCampaign.mode === "prize" && prepared?.id !== nextCampaign.id && prizePlan?.id !== nextCampaign.id) {
      setStartMessage("Start a new muffin challenge to play.");
      return;
    }
    setCampaign(nextCampaign);
    setRoundCatches([]);
    setStatus({ score: 0, seconds: BODEGA_LEVELS[nextCampaign.chapterIndex].rules.durationSec, target: BODEGA_LEVELS[nextCampaign.chapterIndex].rules.targetScore, over: false });
    setPaused(false); pausedRef.current = false;
    setLossReason("round");
    setLoading(true); setError(false); setView("playing");
    setRunNonce((n) => n + 1);
    unlockAudio();
  }
  function beginPractice() {
    const next: Campaign = { mode: "practice", seed: crypto.getRandomValues(new Uint32Array(1))[0], chapterIndex: 0, runs: [] };
    setStartMessage("");
    beginStage(next);
  }
  async function beginPrize() {
    if (preparingRef.current || rewards.verifying) return;
    preparingRef.current = true; setPreparing(true); setStartMessage("");
    try {
      const session = await rewards.startPrize();
      setPrizePlan(session);
      const next: Campaign = { mode: "prize", id: session.id, seed: session.seed, chapterIndex: 0, runs: [] };
      beginStage(next, session);
    } catch (cause) {
      setStartMessage(cause instanceof Error ? cause.message : "Prize rounds are unavailable. Play for fun instead.");
      void rewards.refresh();
    } finally { preparingRef.current = false; setPreparing(false); }
  }
  return <section id="fall-game" className={styles.game} data-playing={view === "playing"} aria-label="Bodega Fall Rush">
    <div className={styles.stage}>
      {view === "landing" && <div className={styles.landing}>
        <span className={styles.eyebrow}>BODEGA CAFE · FALL RUSH</span>
        <h1>WIN A FREE<br />MUFFIN</h1>
        <p className={styles.offerState}>{rewards.enabled ? "THE CHALLENGE IS OPEN" : "COMING SOON · PLAY FOR FUN TODAY"}</p>
        <div className={styles.heroArt}>
          <Image src="/assets/bodega/fall/cinnamon-muffin.webp" width={320} height={320} alt="Bodega cinnamon muffin" priority />
        </div>
        <div className={styles.rules} aria-label="How to play">
          <h2>GOOD FINDS.<br />ZERO BAD VIBES.</h2>
          <div className={styles.rulesSamples}>
            <div><Image src={FIND_ART[0]} alt="Spanish latte to catch" width={72} height={72} /><span>CATCH THE GOOD STUFF</span></div>
            <div><Image src={BAD_VIBES_ART} alt="Bad Vibes item to avoid" width={72} height={72} /><span>LET THIS FALL</span></div>
          </div>
          <ol className={styles.rulesList}>
            <li><strong>Catch café favorites.</strong><span>Find the featured item and reach your points goal.</span></li>
            <li><strong>Ten seconds. Five rounds.</strong><span>Each round falls faster.</span></li>
            <li><strong>Avoid Bad Vibes.</strong><span>One touch ends your run. Leave or lose and start at round one.</span></li>
          </ol>
        </div>
        {rewards.receipt && <MuffinClaim receipt={rewards.receipt} />}
        {rewards.enabled && !rewards.receipt && <div className={styles.prizeOffer}>
          <label className={styles.eligibility}><input type="checkbox" checked={eligible} onChange={(event) => setEligible(event.target.checked)} />I can redeem in-store today and have not received this promotion before.</label>
          <button className={styles.playButton} disabled={!eligible || preparing} onClick={() => { void beginPrize(); }}>{preparing ? "GETTING READY…" : "PLAY FOR A MUFFIN"}</button>
          <p className={styles.offerRules}>{MUFFIN_TERMS} Redeem during cafe hours.</p>
        </div>}
        <button className={rewards.enabled ? styles.practiceButton : styles.playButton} onClick={() => beginPractice()}>PLAY FOR FUN</button>
        <p className={styles.landingNote}>Leave or lose and the muffin meter resets to 0%.</p>
        <p className={styles.offerRules} role="status">{startMessage || rewards.message || (rewards.checking ? "Checking prize availability…" : !rewards.enabled ? "Muffin claims are not active yet." : "Practice play does not issue a muffin claim.")}</p>
        <MuffinMeter completedRounds={0} />
      </div>}
      {view === "playing" && campaign && chapter && <div className={styles.catchLayout}>
        <div className={styles.catchControls}>
          <Link className={styles.backLink} href="/demo/bodega" prefetch={false}>← Back to menu</Link>
          <button className={styles.pause} onClick={() => { const next = !muted; setMuted(next); if (!audio.current) audio.current = new BodegaCatchAudio(); audio.current.setMuted(next); }} aria-pressed={muted} aria-label={muted ? "Unmute catch sounds" : "Mute catch sounds"}>{muted ? "Sound off" : "Sound on"}</button>
          <button className={styles.pause} onClick={togglePause} disabled={loading || error || status.over}>{paused ? "Resume" : "Pause"}</button>
        </div>
        <div className={styles.chapterHeading}><span>ROUND {chapterIndex + 1} OF 5 · 10 SECONDS</span><strong>{chapter.title}</strong><small>Catch {chapter.keepsake} · reach {chapter.targetScore} points</small></div>
        <MuffinMeter completedRounds={campaign.runs.length} compact />
        <div className={styles.hud} aria-label="Game progress and time">
          <div className={styles.scoreReadout}><span>{status.score >= status.target ? "GOAL COMPLETE" : "POINTS"}</span><strong>{displayScore}<small>/{status.target}</small></strong></div>
          <div className={styles.scoreTrack} role="progressbar" aria-label="Round points" aria-valuemin={0} aria-valuemax={status.target} aria-valuenow={displayScore}><span style={{ width: `${displayScore / status.target * 100}%` }} /></div>
          <div className={styles.timerReadout}><strong data-urgent={status.seconds <= 3}>{status.seconds}</strong><span>SEC</span></div>
        </div>
        <div className={styles.catchBoard}>
          <div ref={mount} className={styles.catchCanvas} tabIndex={0} onPointerDownCapture={() => { if (!paused && !loading && !status.over) unlockAudio(); }} role="region" aria-label="Tap falling items to catch. Arrow keys select an item; Space or Enter catches it." onKeyDown={(event) => {
            if (paused || loading || error || status.over || !["ArrowLeft", "ArrowRight", " ", "Enter"].includes(event.key) || event.repeat) return;
            event.preventDefault(); unlockAudio();
            game.current?.scene.getScenes(true).forEach((scene) => (scene as import("@/caferush/CafeRushScene").CafeRushScene).handleKey(event.key));
          }} />
          {(loading || paused || error || status.over) && <div className={styles.catchOverlay} role="status">
            <h2>{error ? "The game couldn’t load." : loading ? "Opening the bodega…" : paused ? "Paused." : chapterWon ? "Find collected." : badVibesCaught ? "Nah, not today." : "Missed your stop."}</h2>
            {status.over && <p>{chapterWon ? `${chapter.keepsake} is in your collection. Next round starts now.` : badVibesCaught ? "Bad Vibes caught you. Back to the first stop." : "The rush got away. Back to the first stop."}<br />{status.score} points</p>}
            {error ? <button className={styles.primary} onClick={() => window.location.reload()}>Reload game</button>
              : paused ? <button className={styles.primary} onClick={togglePause}>Resume catching</button>
              : null}
            {paused && <><p>Pause here or leave and start again at round one.</p><Link className={styles.backLink} href="/demo/bodega" prefetch={false}>Back to menu</Link></>}
          </div>}
        </div>
        <p className={styles.catchLegend}>Tap café finds · Avoid Bad Vibes</p>
      </div>}
      {view === "loss" && campaign && <div className={styles.loss} data-reason={lossReason} role="status">
        <Image src={lossReason === "bad-vibes" ? BAD_VIBES_ART : "/assets/bodega/fall/cinnamon-muffin.webp"} alt={lossReason === "bad-vibes" ? "Bad Vibes painted X" : "Faded Bodega muffin"} width={176} height={176} />
        <span>MUFFIN METER RESET TO 0%</span>
        <h2>{lossReason === "bad-vibes" ? "NAH, NOT TODAY." : "MISSED YOUR STOP."}</h2>
        <p>{lossReason === "bad-vibes" ? "Bad Vibes caught you." : "The rush got away."} Back to the first stop.</p>
        <MuffinMeter completedRounds={0} previousRounds={lossProgress} compact />
        <button className={styles.playButton} onClick={() => beginStage(campaign)}>RUN IT BACK</button>
        <Link className={styles.backLink} href="/demo/bodega" prefetch={false}>← Back to menu</Link>
      </div>}
      {view === "chapter" && campaign && <div className={styles.chapterInterlude}>
        <Image src={FIND_ART[campaign.runs.length - 1]} alt="" width={136} height={136} />
        <span>FIND {campaign.runs.length} OF 5</span>
        <h2>{BODEGA_CHAPTERS[campaign.runs.length - 1]?.keepsake} collected.</h2>
        <p>Next: {BODEGA_CHAPTERS[campaign.chapterIndex]?.title}. Keep going. Leaving resets your muffin meter.</p>
        <MuffinMeter completedRounds={campaign.runs.length} compact />
        <button className={styles.playButton} onClick={() => beginStage(campaign)}>NEXT ROUND NOW</button>
        <Link className={styles.backLink} href="/demo/bodega" prefetch={false}>← Back to menu</Link>
      </div>}
      {view === "victory" && <div className={styles.victory} data-revealed={reveal}>
        <div className={styles.victoryArt}><Image src={FINALE} alt="A glowing muffin on the Bodega counter, the cat watching beside espresso and a vinyl record" fill sizes="(max-width:700px) 100vw, 720px" /></div>
        <div className={styles.victoryCopy}>
          <span>FIVE FINDS · ONE FINAL RUSH</span>
          <h2>COLLECTION COMPLETE</h2>
          <p>You collected them all.</p>
          <MuffinMeter completedRounds={5} compact />
          {campaign?.mode === "prize" ? rewards.receipt?.status === "valid" ? <strong>THE MUFFIN IS YOURS.</strong>
            : rewards.verifying ? <strong>Confirming your muffin…</strong>
            : rewards.receipt?.status === "redeemed" ? <strong>Your muffin has been redeemed.</strong>
            : rewards.receipt?.status === "expired" ? <strong>Your claim has expired.</strong>
            : <strong>Collection complete. Your claim needs checking.</strong>
            : <strong>Muffin challenge coming soon.</strong>}
          {rewards.message && <p role="status">{rewards.message}</p>}
          {rewards.receipt && <MuffinClaim receipt={rewards.receipt} />}
          {campaign?.mode === "prize" && rewards.message && <button className={styles.primary} disabled={rewards.verifying} onClick={rewards.retry}>Retry result check</button>}
          {!reveal && <button className={styles.skipReveal} onClick={() => setReveal(true)}>Skip reveal</button>}
          <Link className={styles.playButton} href="/demo/bodega" prefetch={false}>← BACK TO MENU</Link>
          <button className={styles.practiceButton} onClick={() => { setReveal(false); beginPractice(); }}>Play again for fun</button>
        </div>
      </div>}
    </div>
  </section>;
}
