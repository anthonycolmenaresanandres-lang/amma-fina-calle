"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./portal.module.css";

type GameKey = "trivia" | "picks" | "reflex" | "penalty" | "duel";

const triviaQuestions = [
  {
    question: "How many players from one basketball team are on the court at once?",
    choices: ["4", "5", "6", "7"],
    answer: "5",
  },
  {
    question: "How many points is a successful free throw worth?",
    choices: ["1", "2", "3", "4"],
    answer: "1",
  },
  {
    question: "How many outs end one team's half-inning in baseball?",
    choices: ["2", "3", "4", "5"],
    answer: "3",
  },
  {
    question: "Which menu section offers orders of 6, 10 or 20?",
    choices: ["Burgers", "Wings", "Desserts", "Main Events"],
    answer: "Wings",
  },
  {
    question: "How many points does a touchdown score before any extra attempt?",
    choices: ["3", "5", "6", "7"],
    answer: "6",
  },
] as const;

const pickRounds = [
  { home: "Green City", away: "Harbor Red", winner: "Harbor Red", prompt: "Who takes the basketball matchup?" },
  { home: "Coastal Gold", away: "Night Blue", winner: "Coastal Gold", prompt: "Who wins the football matchup?" },
  { home: "Home Nine", away: "Road Nine", winner: "Home Nine", prompt: "Who finishes the baseball matchup ahead?" },
] as const;

function TriviaGame(): React.JSX.Element {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const finalScoreRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (complete) finalScoreRef.current?.focus();
  }, [complete]);

  const question = triviaQuestions[questionIndex];
  const correct = selected === question.answer;

  function answer(choice: string): void {
    if (selected) return;
    setSelected(choice);
    if (choice === question.answer) setScore((value) => value + 1);
  }

  function next(): void {
    if (questionIndex === triviaQuestions.length - 1) {
      setComplete(true);
      return;
    }
    setQuestionIndex((value) => value + 1);
    setSelected(null);
  }

  function reset(): void {
    setQuestionIndex(0);
    setScore(0);
    setSelected(null);
    setComplete(false);
  }

  if (complete) {
    return (
      <div className={styles.gameBody}>
        <p className={styles.gameKicker}>Final score</p>
        <h3 ref={finalScoreRef} className={styles.gameTitle} role="status" tabIndex={-1}>{score} / {triviaQuestions.length}</h3>
        <p className={styles.gameCopy}>Pass the phone and see whether the next player can top it.</p>
        <button className={styles.actionButton} type="button" onClick={reset}>Play again</button>
      </div>
    );
  }

  return (
    <div className={styles.gameBody}>
      <p className={styles.gameKicker}>Question {questionIndex + 1} of {triviaQuestions.length} · Score {score}</p>
      <h3 className={styles.gameTitle}>Holland Road Huddle</h3>
      <p className={styles.gameCopy}>{question.question}</p>
      <div className={styles.choiceGrid}>
        {question.choices.map((choice) => (
          <button key={choice} className={styles.choiceButton} type="button" disabled={Boolean(selected)} onClick={() => answer(choice)}>
            {choice}
          </button>
        ))}
      </div>
      <div aria-live="polite">
        {selected ? (
          <>
            <p className={styles.gameStatus}>{correct ? "Correct — points on the board." : `The answer is ${question.answer}.`}</p>
            <button className={styles.actionButton} type="button" onClick={next}>
              {questionIndex === triviaQuestions.length - 1 ? "See final score" : "Next question"}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

function PicksGame(): React.JSX.Element {
  const [round, setRound] = useState(0);
  const [points, setPoints] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const finalScoreRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (complete) finalScoreRef.current?.focus();
  }, [complete]);

  const matchup = pickRounds[round];

  function makePick(pick: string): void {
    if (result) return;
    const winner = matchup.winner;
    const won = pick === winner;
    if (won) setPoints((value) => value + 100);
    setResult(`${winner} gets the simulated result. ${won ? "+100 points." : "No points this round."}`);
  }

  function next(): void {
    if (round === pickRounds.length - 1) {
      setComplete(true);
      return;
    }
    setRound((value) => value + 1);
    setResult(null);
  }

  function reset(): void {
    setRound(0);
    setPoints(0);
    setResult(null);
    setComplete(false);
  }

  if (complete) {
    return (
      <div className={styles.gameBody}>
        <p className={styles.gameKicker}>Points-only final</p>
        <h3 ref={finalScoreRef} className={styles.gameTitle} role="status" tabIndex={-1}>{points} points</h3>
        <p className={styles.gameCopy}>Entertainment only. Points never have monetary or prize value.</p>
        <button className={styles.actionButton} type="button" onClick={reset}>Make new picks</button>
      </div>
    );
  }

  return (
    <div className={styles.gameBody}>
      <p className={styles.gameKicker}>Round {round + 1} of {pickRounds.length} · {points} points</p>
      <h3 className={styles.gameTitle}>Call the winner</h3>
      <p className={styles.gameCopy}>{matchup.prompt} These are fictional teams with a pre-set simulated result.</p>
      <div className={styles.choiceGrid}>
        {[matchup.home, matchup.away].map((team) => (
          <button key={team} className={styles.choiceButton} type="button" disabled={Boolean(result)} onClick={() => makePick(team)}>
            Pick {team}
          </button>
        ))}
      </div>
      <div aria-live="polite">
        {result ? (
          <>
            <p className={styles.gameStatus}>{result}</p>
            <button className={styles.actionButton} type="button" onClick={next}>
              {round === pickRounds.length - 1 ? "See points" : "Next matchup"}
            </button>
          </>
        ) : null}
      </div>
      <p className={styles.responsibleNote}>Free play only: no money, odds, deposit, purchase, cash value, prize, redemption or alcohol reward.</p>
    </div>
  );
}

type ReflexState = "idle" | "waiting" | "ready" | "result" | "early";

function ReflexGame(): React.JSX.Element {
  const [state, setState] = useState<ReflexState>("idle");
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readyAtRef = useRef(0);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  function start(): void {
    if (timerRef.current) clearTimeout(timerRef.current);
    setReactionMs(null);
    setState("waiting");
    const delay = 1200 + Math.floor(Math.random() * 2200);
    timerRef.current = setTimeout(() => {
      readyAtRef.current = performance.now();
      setState("ready");
    }, delay);
  }

  function tap(): void {
    if (state === "waiting") {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      setState("early");
      return;
    }
    if (state === "ready") {
      setReactionMs(Math.round(performance.now() - readyAtRef.current));
      setState("result");
    }
  }

  const padLabel = state === "waiting" ? "Hold…" : state === "ready" ? "Tap!" : state === "early" ? "Too soon" : state === "result" ? `${reactionMs} ms` : "Start";

  return (
    <div className={styles.gameBody}>
      <p className={styles.gameKicker}>One phone · fastest hand wins</p>
      <h3 className={styles.gameTitle}>Gator reflex</h3>
      <p className={styles.gameCopy}>Start, wait for the gold flash, then tap. Go early and the round is lost.</p>
      <button
        type="button"
        className={`${styles.reactionPad} ${state === "ready" ? styles.reactionReady : ""}`}
        onClick={state === "idle" || state === "early" || state === "result" ? start : tap}
      >
        {padLabel}
      </button>
      <p className="sr-only" role="status" aria-live="assertive">{state === "ready" ? "Tap now." : ""}</p>
      <p className={styles.gameStatus} aria-live="polite">
        {state === "result" ? `${reactionMs} milliseconds. Pass the phone to the next player.` : state === "early" ? "False start. Tap to reset." : "Best time wins local bragging rights only."}
      </p>
    </div>
  );
}

function PenaltyPromo(): React.JSX.Element {
  return (
    <div className={styles.gameBody}>
      <p className={styles.gameKicker}>Full game · Gator colors</p>
      <h3 className={styles.gameTitle}>Penalty shootout</h3>
      <p className={styles.gameCopy}>
        Five shots from the spot against a diving keeper, in A.J. Gator&apos;s green and gold.
        Three keeper levels, street to pro. Best score at the table wins bragging rights only.
      </p>
      <a className={styles.actionButton} href="/penalty-shootout?skin=ajgators">
        Play the shootout
      </a>
    </div>
  );
}

function TableDuelPromo(): React.JSX.Element {
  return (
    <div className={styles.gameBody}>
      <p className={styles.gameKicker}>2–6 players · own phones</p>
      <h3 className={styles.gameTitle}>Table duel</h3>
      <p className={styles.gameCopy}>
        Everyone at the table hides three boats, then fires at each other blind. One person
        starts a game and reads out the code; the rest join from their own phones. Last fleet
        floating wins the table.
      </p>
      <a className={styles.actionButton} href="/table-duel?skin=ajgators">
        Start a table game
      </a>
    </div>
  );
}

const games: Array<{ key: GameKey; label: string }> = [
  { key: "trivia", label: "Sports trivia" },
  { key: "picks", label: "Points-only picks" },
  { key: "reflex", label: "Reflex challenge" },
  { key: "penalty", label: "Penalty shootout" },
  { key: "duel", label: "Table duel" },
];

export default function GameHub(): React.JSX.Element {
  const [activeGame, setActiveGame] = useState<GameKey>("trivia");

  return (
    <div className={styles.gameStage}>
      <div className={styles.gameTabs} role="group" aria-label="Choose a game">
        {games.map((game) => (
          <button
            key={game.key}
            type="button"
            aria-pressed={activeGame === game.key}
            className={`${styles.gameTab} ${activeGame === game.key ? styles.gameTabActive : ""}`}
            onClick={() => setActiveGame(game.key)}
          >
            {game.label}
          </button>
        ))}
      </div>

      {activeGame === "trivia" ? <TriviaGame /> : null}
      {activeGame === "picks" ? <PicksGame /> : null}
      {activeGame === "reflex" ? <ReflexGame /> : null}
      {activeGame === "penalty" ? <PenaltyPromo /> : null}
      {activeGame === "duel" ? <TableDuelPromo /> : null}

    </div>
  );
}
