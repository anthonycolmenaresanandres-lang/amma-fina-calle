// Writes scripted-pilot Grúa runs in the player export format, for the Stringman
// simulator replay check (tools/grua/replay_in_stringman_sim.py).
// Usage: npx tsx scripts/grua-bot-export.ts <out-dir> [seed ...]
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { playBotRound } from "../src/grua/bot";

const [outDir = "grua-bot-runs", ...seedArgs] = process.argv.slice(2);
const seeds = seedArgs.length ? seedArgs.map(Number) : [7, 11, 42];
mkdirSync(outDir, { recursive: true });
for (const seed of seeds) {
  const { round, recorder } = playBotRound(seed, true);
  const file = join(outDir, `grua-bot-seed-${seed}.json`);
  writeFileSync(file, JSON.stringify(recorder!.export(new Date(0).toISOString())));
  console.log(`${file}: ${recorder!.episodes.length} episodes, ${recorder!.frameCount()} frames, score ${round.score}, strain ${round.strainEvents}`);
}
