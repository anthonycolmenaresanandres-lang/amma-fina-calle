"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { Game } from "phaser";
import type { CafeRushCatch, CafeRushSpawn, CafeRushStatus } from "@/caferush/types";
import { BODEGA_CHAPTERS, BODEGA_ITEM_SCALE, MUFFIN_TERMS, makeBodegaRound, type BodegaRun } from "@/bodega-fall/challenge";
import { BODEGA_LEVELS } from "@/bodega-fall/level";
import { BODEGA_CATCH_SKIN } from "@/bodega-fall/skin";
import { BodegaCatchAudio } from "@/bodega-fall/audio";
import { useMuffinRewards } from "@/bodega-fall/useMuffinRewards";
import type { RewardCampaignSession } from "@/lib/bodega-rewards/contracts";
import MuffinClaim from "./MuffinClaim";
import styles from "./page.module.css";

const STORAGE_KEY = "bodega-fall-campaign-v2";
const FINALE = "/assets/bodega/fall/collection-complete.png";
type Campaign = { mode: "practice" | "prize"; id?: string; seed: number; chapterIndex: number; runs: BodegaRun[] };
type View = "landing" | "playing" | "chapter" | "victory";

function readSaved(): Campaign | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw || raw.length > 100000) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const saved = value as Campaign;
    if (!["practice", "prize"].includes(saved.mode) || !Number.isInteger(saved.seed) || saved.seed < 0 || saved.seed > 0xffffffff
      || !Number.isInteger(saved.chapterIndex) || saved.chapterIndex < 0 || saved.chapterIndex > BODEGA_CHAPTERS.length
      || !Array.isArray(saved.runs) || saved.runs.length !== saved.chapterIndex) return null;
    if (saved.mode === "prize" && typeof saved.id !== "string") return null;
    return saved;
  } catch { return null; }
}

function Illustration({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  return <span className={styles.productArt} aria-hidden="true">
    {!failed && <Image src={src} alt="" width={320} height={320} unoptimized onError={() => setFailed(true)} />}
  </span>;
}

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
  const [hydrated, setHydrated] = useState(false);
  const mount = useRef<HTMLDivElement>(null);
  const game = useRef<Game | null>(null);
  const audio = useRef<BodegaCatchAudio | null>(null);
  const pausedRef = useRef(false);
  const preparingRef = useRef(false);
  const recoveryAttempted = useRef(false);
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
  const chapterWon = Boolean(chapter && status.over && status.score >= chapter.targetScore
    && roundCatches.some((event) => plan?.[event.id]?.itemId === chapter.required));

  useEffect(() => () => { audio.current?.dispose(); audio.current = null; }, []);
  useEffect(() => {
    const saved = readSaved();
    if (saved) { setCampaign(saved); if (saved.chapterIndex === BODEGA_CHAPTERS.length) setView("victory"); }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    if (campaign) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(campaign));
    else window.localStorage.removeItem(STORAGE_KEY);
  }, [campaign, hydrated]);
  useEffect(() => {
    if (campaign?.mode === "prize" && rewards.campaign && rewards.campaign.id === campaign.id) setPrizePlan(rewards.campaign);
  }, [campaign?.id, campaign?.mode, rewards.campaign]);
  useEffect(() => {
    if (recoveryAttempted.current || !hydrated || rewards.checking || campaign?.mode !== "prize"
      || campaign.chapterIndex !== BODEGA_CHAPTERS.length || rewards.receipt || !campaign.id) return;
    recoveryAttempted.current = true;
    void finishReward(campaign.id, campaign.runs);
  }, [campaign, finishReward, hydrated, rewards.checking, rewards.receipt]);
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
            if (next.over) setRoundCatches([...catches]);
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
      game.current.canvas.setAttribute("aria-label", `Chapter ${chapterIndex + 1}. Catch ${chapter.keepsake} and reach ${chapter.targetScore} points. Avoid spills. Arrow keys select an item; Space or Enter catches it.`);
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
    if (nextCampaign.mode === "prize" && !prepared && !prizePlan && !rewards.campaign) {
      setStartMessage("Reconnecting to your saved prize session. Try again in a moment.");
      return;
    }
    setCampaign(nextCampaign);
    setRoundCatches([]);
    setStatus({ score: 0, seconds: BODEGA_LEVELS[nextCampaign.chapterIndex].rules.durationSec, target: BODEGA_LEVELS[nextCampaign.chapterIndex].rules.targetScore, over: false });
    setPaused(false); pausedRef.current = false;
    setLoading(true); setError(false); setView("playing");
    setRunNonce((n) => n + 1);
    unlockAudio();
  }
  function beginPractice(fresh = false) {
    const next: Campaign = !fresh && campaign?.mode === "practice" && campaign.chapterIndex < BODEGA_CHAPTERS.length
      ? campaign : { mode: "practice", seed: crypto.getRandomValues(new Uint32Array(1))[0], chapterIndex: 0, runs: [] };
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
  function completeChapter() {
    if (!campaign || !chapterWon || !chapter) return;
    const runs = [...campaign.runs, { chapterIndex, events: roundCatches }];
    const complete = runs.length === BODEGA_CHAPTERS.length;
    setCampaign({ ...campaign, chapterIndex: chapterIndex + 1, runs });
    setView(complete ? "victory" : "chapter");
    if (complete && campaign.mode === "prize" && campaign.id) void finishReward(campaign.id, runs);
  }

  const hasPrizeResume = campaign?.mode === "prize" && campaign.chapterIndex < BODEGA_CHAPTERS.length
    && prizePlan && prizePlan.id === campaign.id && Date.parse(prizePlan.expiresAt) > Date.now();
  return <section id="fall-game" className={styles.game} data-playing={view === "playing"} aria-label="Bodega Fall Rush">
    <div className={styles.stage}>
      {view === "landing" && <div className={styles.landing}>
        <h1>FALL RUSH</h1>
        <div className={styles.productComposition} aria-hidden="true">
          <Illustration src="/assets/bodega/fall/spanish-latte.webp" />
          <Illustration src="/assets/bodega/menu/green-drink.webp" />
          <Illustration src="/assets/bodega/fall/cereal-bites.webp" />
        </div>
        <p className={styles.landingInstruction}>Five chapters. Five finds. One final rush.</p>
        <span className={styles.landingNote}>About 10 minutes · Completed chapters save automatically</span>
        {campaign && campaign.chapterIndex < BODEGA_CHAPTERS.length && <p className={styles.progressNote}>Saved: {campaign.runs.length} of 5 finds · Next: {BODEGA_CHAPTERS[campaign.chapterIndex].title}</p>}
        {rewards.receipt && <MuffinClaim receipt={rewards.receipt} />}
        {rewards.enabled && !rewards.receipt && <div className={styles.prizeOffer}>
          <p className={styles.offerCopy}>Collect all five. Earn one free muffin.</p>
          <p className={styles.offerRules}>{MUFFIN_TERMS} Redeem during cafe hours.</p>
          <label className={styles.eligibility}><input type="checkbox" checked={eligible} onChange={(event) => setEligible(event.target.checked)} />I can redeem in-store today and have not received this promotion before.</label>
          <button className={styles.playButton} disabled={!eligible || preparing} onClick={() => { void beginPrize(); }}>{preparing ? "GETTING READY…" : "PLAY FOR A MUFFIN"}</button>
        </div>}
        {hasPrizeResume && campaign && <button className={styles.playButton} onClick={() => beginStage(campaign)}>RESUME PRIZE GAME · CHAPTER {chapterIndex + 1}</button>}
        <button className={rewards.enabled ? styles.practiceButton : styles.playButton} onClick={() => beginPractice()}>
          {campaign?.mode === "practice" && campaign.chapterIndex < BODEGA_CHAPTERS.length ? "RESUME FOR FUN" : "PLAY BODEGA RUSH"}
        </button>
        <p className={styles.offerRules} role="status">{startMessage || rewards.message || (rewards.checking ? "Checking prize availability…" : !rewards.enabled ? "Play for fun. Muffin claims are not active yet." : "Practice play does not issue a muffin claim.")}</p>
        {campaign?.mode === "prize" && !hasPrizeResume && !rewards.checking && !rewards.receipt && <p className={styles.offerRules}>Your previous prize session is unavailable. You can play for fun while the offer is checked.</p>}
      </div>}
      {view === "playing" && campaign && chapter && <div className={styles.catchLayout}>
        <div className={styles.catchControls}>
          <button className={styles.pause} onClick={() => { audio.current?.pause(); setView("landing"); }}>Save &amp; leave</button>
          <button className={styles.pause} onClick={() => { const next = !muted; setMuted(next); if (!audio.current) audio.current = new BodegaCatchAudio(); audio.current.setMuted(next); }} aria-pressed={muted} aria-label={muted ? "Unmute catch sounds" : "Mute catch sounds"}>{muted ? "Sound off" : "Sound on"}</button>
          <button className={styles.pause} onClick={togglePause} disabled={loading || error || status.over}>{paused ? "Resume" : "Pause"}</button>
        </div>
        <div className={styles.chapterHeading}><span>CHAPTER {chapterIndex + 1} / 5</span><strong>{chapter.title}</strong><small>Catch {chapter.keepsake} · {chapter.targetScore} points</small></div>
        <div className={styles.collectionStrip} aria-label="Collection progress">
          {BODEGA_CHAPTERS.map((entry, index) => <span key={entry.id} data-collected={index < campaign.runs.length}>{index < campaign.runs.length ? "◆" : "◇"}<span className={styles.srOnly}>{entry.keepsake} {index < campaign.runs.length ? "collected" : "remaining"}</span></span>)}
        </div>
        <div className={styles.hud} aria-label="Game score and time">
          <div><span>Score</span><strong>{status.score}</strong></div>
          <div><span>Target</span><strong>{status.target}</strong></div>
          <div><span>Seconds</span><strong data-urgent={status.seconds <= 10}>{status.seconds}</strong></div>
        </div>
        <div className={styles.catchBoard}>
          <div ref={mount} className={styles.catchCanvas} tabIndex={0} onPointerDownCapture={() => { if (!paused && !loading && !status.over) unlockAudio(); }} role="region" aria-label="Tap falling items to catch. Arrow keys select an item; Space or Enter catches it." onKeyDown={(event) => {
            if (paused || loading || error || status.over || !["ArrowLeft", "ArrowRight", " ", "Enter"].includes(event.key) || event.repeat) return;
            event.preventDefault(); unlockAudio();
            game.current?.scene.getScenes(true).forEach((scene) => (scene as import("@/caferush/CafeRushScene").CafeRushScene).handleKey(event.key));
          }} />
          {(loading || paused || error || status.over) && <div className={styles.catchOverlay} role="status">
            <h2>{error ? "The game couldn’t load." : loading ? "Opening the bodega…" : paused ? "Coffee break." : chapterWon ? "Find secured." : "One more round."}</h2>
            {status.over && <p>{chapterWon ? `You found ${chapter.keepsake}.` : `Catch ${chapter.keepsake} and reach ${chapter.targetScore} points.`}<br />{status.score} / {status.target} points</p>}
            {error ? <button className={styles.primary} onClick={() => window.location.reload()}>Reload game</button>
              : paused ? <button className={styles.primary} onClick={togglePause}>Resume catching</button>
              : status.over ? <button className={styles.primary} onClick={chapterWon ? completeChapter : () => beginStage(campaign)}>{chapterWon ? chapterIndex === 4 ? "Reveal the collection" : "Collect & continue" : "Retry this chapter"}</button> : null}
            {paused && <><p>Completed chapters stay saved. This chapter will restart.</p><button className={styles.pause} onClick={() => setView("landing")}>My food’s here · Leave chapter</button></>}
          </div>}
        </div>
        <p className={styles.catchLegend}>{chapterIndex === 0 ? "Tap café finds · Spills arrive in later chapters" : "Tap café finds · Skip spills (−25)"}</p>
      </div>}
      {view === "chapter" && campaign && <div className={styles.chapterInterlude}>
        <span>FIND {campaign.runs.length} / 5</span>
        <h2>{BODEGA_CHAPTERS[campaign.runs.length - 1]?.keepsake} collected.</h2>
        <p>Your completed chapters are saved. Next: {BODEGA_CHAPTERS[campaign.chapterIndex]?.title}.</p>
        <button className={styles.playButton} onClick={() => beginStage(campaign)}>NEXT CHAPTER</button>
        <button className={styles.practiceButton} onClick={() => setView("landing")}>My food’s here · Save progress</button>
      </div>}
      {view === "victory" && <div className={styles.victory} data-revealed={reveal}>
        <div className={styles.victoryArt}><Image src={FINALE} alt="A glowing muffin on the Bodega counter, the cat watching beside espresso and a vinyl record" fill sizes="(max-width:700px) 100vw, 720px" /></div>
        <div className={styles.victoryCopy}>
          <span>FIVE OF FIVE FINDS</span>
          <h2>COLLECTION COMPLETE</h2>
          <p>You collected them all.</p>
          {campaign?.mode === "prize" ? rewards.receipt?.status === "valid" ? <strong>THE MUFFIN IS YOURS.</strong>
            : rewards.verifying ? <strong>Confirming your muffin…</strong>
            : rewards.receipt?.status === "redeemed" ? <strong>Your muffin has been redeemed.</strong>
            : rewards.receipt?.status === "expired" ? <strong>Your claim has expired.</strong>
            : <strong>Collection complete. Your claim needs checking.</strong>
            : <strong>Play for fun · Muffin claims are not active.</strong>}
          {rewards.message && <p role="status">{rewards.message}</p>}
          {rewards.receipt && <MuffinClaim receipt={rewards.receipt} />}
          {campaign?.mode === "prize" && rewards.message && <button className={styles.primary} disabled={rewards.verifying} onClick={rewards.retry}>Retry result check</button>}
          {!reveal && <button className={styles.skipReveal} onClick={() => setReveal(true)}>Skip reveal</button>}
          <button className={styles.practiceButton} onClick={() => { setReveal(false); setView("landing"); }}>Back to game</button>
          <button className={styles.practiceButton} onClick={() => { setReveal(false); beginPractice(true); }}>Play again for fun</button>
        </div>
      </div>}
    </div>
  </section>;
}
