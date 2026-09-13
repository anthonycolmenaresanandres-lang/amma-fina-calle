"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, RotateCcw, SlidersHorizontal, TreePalm } from "lucide-react";
import { DEFAULT_PENALTY_LEVEL, PENALTY_LEVELS } from "@/penalty/config";
import type { InputMode, PenaltyLevel } from "@/penalty/types";
import FinaCalleFooter from "@/components/FinaCalleFooter";
import { LAS_PALMAS_CHARACTERS, type LasPalmasCharacter } from "./characters";
import MatchCanvas from "./MatchCanvas";
import styles from "./LasPalmasGame.module.css";

export default function LasPalmasGame() {
  const [character, setCharacter] = useState<LasPalmasCharacter>(LAS_PALMAS_CHARACTERS[0]);
  const [level, setLevel] = useState<PenaltyLevel>(DEFAULT_PENALTY_LEVEL);
  const [input, setInput] = useState<InputMode>("tap");
  const [playing, setPlaying] = useState(false);
  const [round, setRound] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);

  function start() {
    setPlaying(true);
    requestAnimationFrame(() => backButton.current?.focus());
  }
  function back() {
    setPlaying(false);
    requestAnimationFrame(() => heading.current?.focus());
  }

  return (
    <main className={styles.page}>
      {playing ? (
        <div className={styles.match}>
          <header className={styles.matchHeader}>
            <div className={styles.matchNav}>
              <button ref={backButton} type="button" onClick={back}><ArrowLeft aria-hidden="true" /> Players</button>
              <Link href="/demo/las-palmas" prefetch={false}>Menu</Link>
              <button type="button" onClick={() => setRound(value => value + 1)}><RotateCcw aria-hidden="true" /> Replay</button>
            </div>
          </header>
          <MatchCanvas key={round} character={character} level={level} input={input} />
          <p className={styles.matchNotice}>{character.name} · #{character.number}<span>Demo · pending client approval</span></p>
        </div>
      ) : (
        <div className={styles.lobby}>
          <header className={styles.lobbyHeader}>
            <Link href="/demo/las-palmas" prefetch={false}><ArrowLeft aria-hidden="true" /> Back to menu</Link>
            <span>Las Palmas · Lynnhaven</span>
          </header>
          <div className={styles.intro}>
            <p><TreePalm aria-hidden="true" /> The cantina is your stadium <TreePalm aria-hidden="true" /></p>
            <h1 ref={heading} tabIndex={-1}>Cantina<br /><span>Shootout</span></h1>
            <div>Two food legends. Five shots. Your moment.</div>
          </div>
          <section className={styles.selection} aria-labelledby="pick-player">
            <h2 id="pick-player">Pick your player</h2>
            <div className={styles.players}>
              {LAS_PALMAS_CHARACTERS.map(player => (
                <label className={styles.player} key={player.id}>
                  <input type="radio" name="character" value={player.id} checked={character.id === player.id} onChange={() => setCharacter(player)} />
                  <span className={styles.playerArt}>
                    <span className={styles.jersey} aria-hidden="true">{player.number}</span>
                    <Image src={player.image} alt="" width={player.width} height={player.height} sizes="(max-width: 600px) 40vw, 230px" loading="eager" />
                    <span className={styles.selected}><Check aria-hidden="true" /><span>Selected</span></span>
                  </span>
                  <span className={styles.playerName}>{player.name}<small>#{player.number}</small></span>
                </label>
              ))}
            </div>
            <button type="button" className={styles.kickoff} onClick={start}>Let’s play <ArrowRight aria-hidden="true" /></button>
            <p className={styles.instructions}>Playing as {character.name}. {input === "tap" ? "Tap a target in the goal to shoot." : "Swipe from the ball toward the goal."}</p>
            <details className={styles.settings}>
              <summary><SlidersHorizontal aria-hidden="true" /><span>Match settings<small>{level.levelName} · {input === "tap" ? "Tap" : "Swipe"}</small></span><ChevronDown aria-hidden="true" /></summary>
              <div className={styles.settingsFields}>
                <label>Keeper difficulty<select name="difficulty" value={level.id} onChange={event => setLevel(PENALTY_LEVELS.find(item => item.id === event.target.value) ?? DEFAULT_PENALTY_LEVEL)}>{PENALTY_LEVELS.map(item => <option key={item.id} value={item.id}>{item.levelName}</option>)}</select></label>
                <label>Shot controls<select name="controls" value={input} onChange={event => setInput(event.target.value === "swipe" ? "swipe" : "tap")}><option value="tap">Tap a target</option><option value="swipe">Swipe to shoot</option></select></label>
              </div>
            </details>
            <p className={styles.demo}>Pending client approval · demo only</p>
          </section>
          <FinaCalleFooter />
        </div>
      )}
    </main>
  );
}
