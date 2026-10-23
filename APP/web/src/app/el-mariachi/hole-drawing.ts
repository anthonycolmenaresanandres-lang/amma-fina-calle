import { WORLD_WIDTH, WORLD_HEIGHT, type HoleItem, type HoleState } from "./hole-engine";

// Original procedural courtyard art, shared by Phaser and the canvas fallback.
// No image downloads, client logo recreation, or third-party game artwork.
const C = {
  cream: "#fffaf0", green: "#244536", chili: "#9b382b", gold: "#b58a4a",
  floor: "#e6bc8c", tile: "#ddb183", grout: "#f2d3a7", clay: "#b96a42",
  shadow: "rgba(73, 44, 31, 0.20)", dark: "#101c19", lime: "#92ad3d",
};
let paving: HTMLCanvasElement | null = null;

function ellipse(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, fill: string) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function polygon(ctx: CanvasRenderingContext2D, points: number[], fill: string) {
  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function stroke(ctx: CanvasRenderingContext2D, points: number[], color: string, width = 1) {
  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1]);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function drawPaving(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = C.floor;
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  // Broad Saltillo-inspired paving leaves the collectible silhouettes readable.
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 7; col++) {
      const x = col * 64 + (row % 2 ? -30 : 2);
      const y = row * 68 - 2;
      ctx.fillStyle = (row + col) % 3 === 0 ? C.tile : C.floor;
      ctx.fillRect(x + 2, y + 2, 61, 65);
      ctx.strokeStyle = C.grout;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 1, y + 1, 63, 67);
      // A small, fixed surface mark gives texture without image noise or animation.
      stroke(ctx, [x + 14, y + 15, x + 28, y + 14], "rgba(255,245,217,.18)");
    }
  }
  // A narrow decorative tile border is outside the useful play surface.
  ctx.fillStyle = C.green;
  ctx.fillRect(0, 0, WORLD_WIDTH, 13);
  ctx.fillRect(0, WORLD_HEIGHT - 13, WORLD_WIDTH, 13);
  ctx.fillStyle = "#c9865a";
  ctx.fillRect(0, 13, 11, WORLD_HEIGHT - 26);
  ctx.fillRect(WORLD_WIDTH - 11, 13, 11, WORLD_HEIGHT - 26);
  for (let x = 14; x < WORLD_WIDTH; x += 24) {
    polygon(ctx, [x, 3, x + 4, 7, x, 11, x - 4, 7], C.gold);
    polygon(ctx, [x, WORLD_HEIGHT - 11, x + 4, WORLD_HEIGHT - 7, x, WORLD_HEIGHT - 3, x - 4, WORLD_HEIGHT - 7], C.gold);
  }

}

function backdrop(ctx: CanvasRenderingContext2D) {
  if (!paving && typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = WORLD_WIDTH;
    canvas.height = WORLD_HEIGHT;
    const ink = canvas.getContext("2d");
    if (ink) { drawPaving(ink); paving = canvas; }
  }
  if (paving) ctx.drawImage(paving, 0, 0);
  else drawPaving(ctx);
}

function lime(ctx: CanvasRenderingContext2D, r: number) {
  ellipse(ctx, 0, 0, r * 0.88, r * 0.8, "#63842b");
  ellipse(ctx, -r * 0.08, -r * 0.12, r * 0.72, r * 0.65, "#b5c957");
  ellipse(ctx, -r * 0.08, -r * 0.12, r * 0.58, r * 0.51, "#dce58a");
  for (let i = 0; i < 5; i++) {
    const angle = i * Math.PI * 2 / 5;
    stroke(ctx, [-r * 0.08, -r * 0.12, Math.cos(angle) * r * 0.5 - r * 0.08, Math.sin(angle) * r * 0.44 - r * 0.12], "#9aac48", 0.8);
  }
}

function chili(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath();
  ctx.moveTo(-r * 0.5, -r * 0.64);
  ctx.bezierCurveTo(r * 0.42, -r * 0.95, r * 1.1, r * 0.18, r * 0.18, r * 0.75);
  ctx.bezierCurveTo(-r * 0.18, r * 0.98, -r * 0.74, r * 0.83, -r * 0.84, r * 0.5);
  ctx.bezierCurveTo(-r * 0.12, r * 0.7, r * 0.17, r * 0.23, -r * 0.5, -r * 0.64);
  ctx.fillStyle = C.chili;
  ctx.fill();
  stroke(ctx, [-r * 0.52, -r * 0.66, -r * 0.4, -r * 0.96, -r * 0.12, -r * 0.97], C.green, r * 0.2);
  stroke(ctx, [-r * 0.1, -r * 0.44, r * 0.26, -r * 0.2, r * 0.33, r * 0.18], "#f18a55", r * 0.14);
}

function cup(ctx: CanvasRenderingContext2D, r: number) {
  ctx.strokeStyle = "#c98b55";
  ctx.lineWidth = r * 0.24;
  ctx.beginPath();
  ctx.ellipse(r * 0.57, r * 0.02, r * 0.31, r * 0.38, 0, 0, Math.PI * 2);
  ctx.stroke();
  ellipse(ctx, -r * 0.08, r * 0.15, r * 0.64, r * 0.7, "#c98b55");
  ellipse(ctx, -r * 0.08, -r * 0.05, r * 0.64, r * 0.62, C.cream);
  ellipse(ctx, -r * 0.08, -r * 0.05, r * 0.47, r * 0.44, "#743c26");
  ctx.beginPath();
  ctx.arc(-r * 0.08, -r * 0.05, r * 0.3, -2.7, -0.4);
  ctx.strokeStyle = "#c38a4c";
  ctx.lineWidth = r * 0.09;
  ctx.stroke();
}

function taco(ctx: CanvasRenderingContext2D, r: number) {
  ellipse(ctx, 0, r * 0.06, r * 0.96, r * 0.66, "#f8e6ba");
  ellipse(ctx, 0, 0, r * 0.82, r * 0.48, "#527140");
  for (let i = 0; i < 5; i++) {
    ellipse(ctx, (i - 2) * r * 0.27, -r * 0.12 + (i % 2) * r * 0.08, r * 0.16, r * 0.19, "#7aa44f");
    ellipse(ctx, (i - 2) * r * 0.25, r * 0.07, r * 0.12, r * 0.12, i % 2 ? "#814027" : C.chili);
  }
  ctx.beginPath();
  ctx.ellipse(0, r * 0.04, r * 0.85, r * 0.55, 0, 0, Math.PI);
  ctx.closePath();
  ctx.fillStyle = C.gold;
  ctx.fill();
  for (const x of [-0.52, -0.12, 0.35]) ellipse(ctx, r * x, r * 0.28, r * 0.055, r * 0.035, "#bd7e31");
}

function planter(ctx: CanvasRenderingContext2D, r: number) {
  ellipse(ctx, 0, r * 0.3, r * 0.54, r * 0.47, "#a45c39");
  ellipse(ctx, 0, r * 0.09, r * 0.68, r * 0.58, C.clay);
  ellipse(ctx, 0, r * 0.01, r * 0.54, r * 0.44, "#684b2c");
  for (let i = 0; i < 7; i++) {
    const angle = i * Math.PI * 2 / 7;
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-r * 0.29, -r * 0.63, 0, -r * 0.95);
    ctx.quadraticCurveTo(r * 0.23, -r * 0.55, 0, 0);
    ctx.fillStyle = i % 2 ? "#497948" : C.green;
    ctx.fill();
    stroke(ctx, [0, -r * 0.08, 0, -r * 0.78], "#86a05c", 1);
    ctx.restore();
  }
  ellipse(ctx, 0, 0, r * 0.12, r * 0.1, C.gold);
}

function chair(ctx: CanvasRenderingContext2D, r: number) {
  ctx.fillStyle = "#633c28";
  for (const x of [-0.5, 0.4]) {
    ctx.fillRect(r * x, -r * 0.45, r * 0.13, r * 1.15);
  }
  polygon(ctx, [-r * 0.62, -r * 0.12, r * 0.62, -r * 0.12, r * 0.54, r * 0.58, -r * 0.54, r * 0.58], "#8f482e");
  polygon(ctx, [-r * 0.62, -r * 0.25, r * 0.62, -r * 0.25, r * 0.54, r * 0.43, -r * 0.54, r * 0.43], C.chili);
  ctx.fillStyle = "#7e3829";
  ctx.fillRect(-r * 0.59, -r * 0.88, r * 1.18, r * 0.53);
  ctx.fillStyle = "#dc6545";
  ctx.fillRect(-r * 0.59, -r * 0.88, r * 1.18, r * 0.13);
  stroke(ctx, [-r * 0.39, -r * 0.69, r * 0.39, -r * 0.69], "#edb179", 2);
  stroke(ctx, [-r * 0.39, -r * 0.48, r * 0.39, -r * 0.48], "#edb179", 2);
  stroke(ctx, [-r * 0.39, -r * 0.04, r * 0.34, -r * 0.04], "#edb179", 1.4);
  stroke(ctx, [-r * 0.35, r * 0.17, r * 0.3, r * 0.17], "#edb179", 1.4);
}

function table(ctx: CanvasRenderingContext2D, r: number) {
  ellipse(ctx, 0, r * 0.17, r * 0.63, r * 0.57, "#774730");
  ellipse(ctx, 0, r * 0.07, r * 0.63, r * 0.57, "#c08d54");
  // An original striped parasol viewed from above; its silhouette fits the radius.
  const count = 8;
  for (let i = 0; i < count; i++) {
    const a = i * Math.PI * 2 / count;
    const b = (i + 1) * Math.PI * 2 / count;
    polygon(ctx, [0, -r * 0.12, Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.83 - r * 0.1, Math.cos(b) * r * 0.9, Math.sin(b) * r * 0.83 - r * 0.1], i % 2 ? C.cream : C.green);
    stroke(ctx, [0, -r * 0.12, Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.83 - r * 0.1], "rgba(84,77,44,.24)", 1);
  }
  ellipse(ctx, 0, -r * 0.12, r * 0.075, r * 0.07, C.gold);
}

function drawProp(ctx: CanvasRenderingContext2D, item: HoleItem, reducedMotion: boolean) {
  const sink = Math.max(0, Math.min(1, item.sink));
  const ease = sink * sink;
  const x = reducedMotion ? item.x : item.x + (item.sinkX - item.x) * ease;
  const y = reducedMotion ? item.y : item.y + (item.sinkY - item.y) * ease;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = 1 - sink;
  const scale = reducedMotion ? 1 : 1 - sink * 0.9;
  ctx.scale(scale, scale);
  if (sink === 0) ellipse(ctx, item.radius * 0.16, item.radius * 0.25, item.radius * 0.9, item.radius * 0.69, C.shadow);
  ctx.rotate(item.rotation + (reducedMotion ? 0 : sink * 0.45));
  if (item.kind === "lime") lime(ctx, item.radius);
  else if (item.kind === "chili") chili(ctx, item.radius);
  else if (item.kind === "cup") cup(ctx, item.radius);
  else if (item.kind === "taco") taco(ctx, item.radius);
  else if (item.kind === "planter") planter(ctx, item.radius);
  else if (item.kind === "chair") chair(ctx, item.radius);
  else table(ctx, item.radius);
  ctx.restore();
}

function hole(ctx: CanvasRenderingContext2D, state: HoleState, reducedMotion: boolean) {
  const { x, y, radius: r } = state;
  ellipse(ctx, x + 2, y + 5, r + 4, r + 3, "rgba(65,43,29,.24)");
  ellipse(ctx, x, y, r + 3.5, r + 3.5, C.cream);
  ellipse(ctx, x, y, r + 1.6, r + 1.6, C.gold);
  ellipse(ctx, x, y, r, r, C.dark);
  ellipse(ctx, x, y - r * 0.08, r * 0.8, r * 0.7, "#091310");
  // Restrained, low-contrast movement inside the opening never changes its hit area.
  ctx.save();
  ctx.translate(x, y);
  if (!reducedMotion && state.mode === "running") ctx.rotate(state.elapsed / 1800);
  ctx.strokeStyle = "#294838";
  ctx.lineWidth = Math.max(1, r * 0.045);
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, r * (0.37 + i * 0.26), i * 2.6, i * 2.6 + Math.PI * 1.2);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawCourtyard(ctx: CanvasRenderingContext2D, state: HoleState, reducedMotion: boolean): void {
  ctx.save();
  ctx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  backdrop(ctx);
  const remaining = state.items.filter(item => !item.collected);
  // Eligibility appears as a physical footprint, not only as a color change in the prop.
  for (const item of remaining) {
    if (item.sink > 0 || item.radius > state.radius * 0.82) continue;
    ctx.beginPath();
    ctx.arc(item.x, item.y, item.radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,245,217,.26)";
    ctx.fill();
    ctx.strokeStyle = "#99712c";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(item.x, item.y, item.radius + 2.5, 0, Math.PI * 2);
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  hole(ctx, state, reducedMotion);
  remaining.sort((a, b) => a.y - b.y);
  for (const item of remaining) if (item.sink === 0) drawProp(ctx, item, reducedMotion);
  for (const item of remaining) if (item.sink > 0) drawProp(ctx, item, reducedMotion);
  // Front lip sits above a sinking prop, making the opening feel recessed.
  ctx.beginPath();
  ctx.arc(state.x, state.y, state.radius + 1, 0.15, Math.PI - 0.15);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = C.gold;
  ctx.stroke();
  const age = state.elapsed - state.lastCollectAt;
  if (!reducedMotion && state.mode === "running" && state.lastCollectAt > 0 && age >= 0 && age < 350) {
    const fade = 1 - age / 350;
    ctx.globalAlpha = fade;
    const distance = state.radius + 6 + age / 35;
    for (let i = 0; i < 5; i++) {
      const angle = i * Math.PI * 2 / 5 - Math.PI / 2;
      ellipse(ctx, state.x + Math.cos(angle) * distance, state.y + Math.sin(angle) * distance, 2 * fade, 2 * fade, C.cream);
    }
    ctx.globalAlpha = 1;
  }
  if (state.mode === "running" && state.elapsed < 2800) {
    ctx.fillStyle = C.green;
    ctx.font = "700 9px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("YOU", state.x, Math.min(WORLD_HEIGHT - 19, state.y + state.radius + 16));
  }
  ctx.restore();
}
