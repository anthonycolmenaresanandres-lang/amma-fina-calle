import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import Module, { createRequire } from "node:module";
import { FootballControls } from "../src/table-os/maracaibo/football-view";
import type { LocalTableFootballInput as InputAdapter } from "../src/table-os/game/input";

// Exercise the real input adapter with only Phaser's browser dependency mocked.
// No canvas, rendering, simulation or networking is needed for these input transitions.
const runtime = Module as typeof Module & { _load: (id: string, parent: unknown, isMain: boolean) => unknown };
const originalLoad = runtime._load;
runtime._load = function (id, parent, isMain) {
  if (id === "phaser") return { Input: { Keyboard: { JustDown: (key: Key) => { const down = key.justDown; key.justDown = false; return down; } } } };
  return originalLoad.call(this, id, parent, isMain);
};
const { LocalTableFootballInput } = createRequire(import.meta.url)("../src/table-os/game/input") as { LocalTableFootballInput: typeof InputAdapter };
runtime._load = originalLoad;

type Move = -1 | 0 | 1;
type Packet = { sequence: number; move: Move; kick: boolean; targetY?: number };
type Key = { isDown: boolean; justDown: boolean; reset: () => void };
let now = 0;
const originalPerformance = globalThis.performance;
const blur = new Set<() => void>();
const visibility = new Set<() => void>();
const browserDocument = {
  hidden: false,
  addEventListener: (event: string, fn: () => void) => { if (event === "visibilitychange") visibility.add(fn); },
  removeEventListener: (event: string, fn: () => void) => { if (event === "visibilitychange") visibility.delete(fn); },
};
const browser = {
  addEventListener: (event: string, fn: () => void) => { if (event === "blur") blur.add(fn); },
  removeEventListener: (event: string, fn: () => void) => { if (event === "blur") blur.delete(fn); },
};
Object.defineProperty(globalThis, "performance", { value: { now: () => now }, configurable: true });
Object.defineProperty(globalThis, "window", { value: browser, configurable: true });
Object.defineProperty(globalThis, "document", { value: browserDocument, configurable: true });

let checks = 0;
function check(name: string, fn: () => void): void {
  now = 1000;
  fn();
  assert.equal(blur.size, 0, "Every input adapter removes its blur handler");
  assert.equal(visibility.size, 0, "Every input adapter removes its visibility handler");
  checks++;
  console.log(`PASS ${name}`);
}
function mixer() {
  const packets: Packet[] = [];
  const controls = new FootballControls((packet) => packets.push(packet), () => now);
  return { controls, packets, last: () => packets.at(-1)! };
}
function adapter(mobile = true, publish?: (packet: Packet, gesture: number) => void) {
  const events = new EventEmitter();
  const keys: Record<string, Key> = {};
  for (const name of ["W", "S", "UP", "DOWN", "SPACE", "ENTER"]) {
    const key: Key = { isDown: false, justDown: false, reset: () => { key.isDown = key.justDown = false; } };
    keys[name] = key;
  }
  const packets: Packet[] = [];
  let epoch = 0;
  let playerY = 50;
  let pitchTop = 100;
  let pitchHeight = 200;
  const scene = { input: { on: events.on.bind(events), off: events.off.bind(events), keyboard: { addKeys: () => keys } }, scale: { height: 400 } };
  const input = new LocalTableFootballInput(scene as unknown as ConstructorParameters<typeof InputAdapter>[0], {
    roomId: "controls", playerId: "home-forward", getTick: () => 0,
    pointerTarget: mobile ? () => ({ playerY, pitchTop, pitchHeight }) : undefined,
    getEpoch: mobile ? () => epoch : undefined,
    publish: (packet) => { packets.push(packet); publish?.(packet, input.gesture); },
  });
  const pointer = (id = 1, x = 120, y = 60, wasCanceled = false) => ({ id, x, y, wasCanceled });
  return { events, keys, packets, input, pointer, round: () => { epoch++; }, geometry: (player: number, top: number, height: number) => { playerY = player; pitchTop = top; pitchHeight = height; } };
}

try {
  check("touch anchors to the selected player instead of the screen midpoint", () => {
    const a = adapter(); a.geometry(30, 100, 200);
    a.events.emit("pointerdown", a.pointer(1, 120, 330)); a.input.poll();
    assert.equal(a.packets[0].targetY, 30);
    now += 40; a.events.emit("pointermove", a.pointer(1, 120, 350)); a.input.poll();
    assert.equal(a.packets.at(-1)!.targetY, 40);
    now += 40; a.events.emit("pointermove", a.pointer(1, 120, 310)); a.input.poll();
    assert.equal(a.packets.at(-1)!.targetY, 20);
    assert.ok(a.packets.every((packet) => packet.move === 0 && !packet.kick));
    a.input.destroy();
  });
  check("drag scaling follows the displayed pitch height and clamps to engine bounds", () => {
    const a = adapter(); a.geometry(60, 40, 100);
    a.events.emit("pointerdown", a.pointer(1, 120, 90)); a.input.poll();
    now += 40; a.events.emit("pointermove", a.pointer(1, 120, 105)); a.input.poll();
    assert.equal(a.packets.at(-1)!.targetY, 75);
    now += 40; a.events.emit("pointermove", a.pointer(1, 120, 190)); a.input.poll();
    assert.equal(a.packets.at(-1)!.targetY, 96);
    now += 40; a.events.emit("pointermove", a.pointer(1, 120, -10)); a.input.poll();
    assert.equal(a.packets.at(-1)!.targetY, 4); a.input.destroy();
  });
  check("tap positions the player and never requests a manual shot", () => {
    const a = adapter(); a.events.emit("pointerdown", a.pointer(1, 120, 260)); a.input.poll();
    now += 80; a.events.emit("pointerup", a.pointer(1, 122, 260)); a.input.poll();
    assert.equal(a.packets.at(-1)!.targetY, 80);
    assert.ok(a.packets.every((packet) => !packet.kick)); a.input.destroy();
  });
  check("a zero, negative or invalid pitch height cannot emit nonfinite targets", () => {
    for (const height of [0, -1, NaN]) {
      const a = adapter(); a.geometry(50, 100, height);
      a.events.emit("pointerdown", a.pointer()); a.input.poll();
      now += 40; a.events.emit("pointermove", a.pointer(1, 120, 100)); a.input.poll();
      assert.equal(a.packets.at(-1)!.targetY, 60); a.input.destroy();
    }
  });
  check("a drag retains its final target after lift rather than becoming a tap", () => {
    const a = adapter(); a.events.emit("pointerdown", a.pointer(1, 120, 260)); a.input.poll();
    now += 40; a.events.emit("pointermove", a.pointer(1, 120, 280)); a.input.poll();
    now += 40; a.events.emit("pointerup", a.pointer(1, 120, 285)); a.input.poll();
    assert.equal(a.packets.at(-1)!.targetY, 62.5);
    now += 250; a.input.poll(); assert.equal(a.packets.at(-1)!.targetY, 62.5);
    assert.ok(a.packets.every((packet) => !packet.kick)); a.input.destroy();
  });
  check("cancel and release outside clear the target immediately", () => {
    for (const outside of [false, true]) {
      const a = adapter(); a.events.emit("pointerdown", a.pointer()); a.input.poll();
      now++; a.events.emit(outside ? "pointerupoutside" : "pointerup", a.pointer(1, 120, 60, !outside)); a.input.poll();
      assert.equal(a.packets.at(-1)!.targetY, undefined); assert.equal(a.packets.at(-1)!.move, 0);
      now += 1000; a.input.poll(); assert.equal(a.packets.length, 2); a.input.destroy();
    }
  });
  check("a second finger cannot retarget or release the active drag", () => {
    const a = adapter(); a.events.emit("pointerdown", a.pointer()); a.input.poll();
    now += 40; a.events.emit("pointermove", a.pointer(1, 120, 80)); a.input.poll();
    a.events.emit("pointerdown", a.pointer(2, 120, 330));
    a.events.emit("pointermove", a.pointer(2, 120, 360));
    a.events.emit("pointerup", a.pointer(2, 120, 360));
    now += 250; a.input.poll(); assert.equal(a.packets.at(-1)!.targetY, 60);
    now += 40; a.events.emit("pointermove", a.pointer(1, 120, 100)); a.input.poll();
    assert.equal(a.packets.at(-1)!.targetY, 70); a.input.destroy();
  });
  check("steering packets stay below the session rate limit during fast drag", () => {
    const a = adapter(); a.events.emit("pointerdown", a.pointer()); a.input.poll();
    for (let frame = 1; frame <= 60; frame++) {
      now += 1000 / 60; a.events.emit("pointermove", a.pointer(1, 120, 60 + frame)); a.input.poll();
    }
    assert.ok(a.packets.length <= 26, `${a.packets.length} packets in one second`);
    assert.ok(a.packets.every((packet) => !packet.kick)); a.input.destroy();
  });
  check("target keepalives continue, while idle and cleared controls stay silent", () => {
    const f = mixer(); f.controls.poll(); f.controls.clear(); assert.equal(f.packets.length, 0);
    f.controls.fieldInput({ move: 0, kick: false, targetY: 80 }, 1);
    now += 249; f.controls.poll(); assert.equal(f.packets.length, 1);
    now++; f.controls.poll(); assert.equal(f.packets.length, 2); assert.equal(f.last().targetY, 80);
    f.controls.clear(); assert.equal(f.last().targetY, undefined);
    now += 1000; f.controls.poll(); assert.equal(f.packets.length, 3);
    assert.deepEqual(f.packets.map((packet) => packet.sequence), [1, 2, 3]);
  });
  check("blur clears the retained target and does not resurrect it", () => {
    const f = mixer(); const a = adapter(true, (packet, gesture) => f.controls.fieldInput(packet, gesture));
    a.events.emit("pointerdown", a.pointer()); a.input.poll();
    f.controls.clear(); for (const fn of blur) fn(); a.input.poll();
    assert.equal(f.last().targetY, undefined);
    now += 1000; a.input.poll(); f.controls.poll(); assert.equal(f.packets.length, 2);
    a.input.destroy();
  });
  check("a movement button blocks a retained field heartbeat until a fresh gesture", () => {
    const f = mixer();
    f.controls.fieldInput({ move: 0, kick: false, targetY: 80 }, 1);
    f.controls.move(-1, "pointer");
    now += 250; f.controls.fieldInput({ move: 0, kick: false, targetY: 80 }, 1);
    assert.equal(f.last().move, -1); assert.equal(f.last().targetY, undefined);
    f.controls.move(0, "pointer");
    assert.equal(f.last().move, 0); assert.equal(f.last().targetY, undefined);
    now += 250; f.controls.fieldInput({ move: 0, kick: false, targetY: 80 }, 1);
    assert.equal(f.packets.length, 4, "The old gesture stays blocked after button release");
    f.controls.fieldInput({ move: 0, kick: false, targetY: 80 }, 2);
    assert.equal(f.last().targetY, 80, "A fresh touch may intentionally select the same target");
  });
  check("the adapter exposes a new gesture only for a fresh primary field touch", () => {
    const a = adapter(); assert.equal(a.input.gesture, 0);
    a.events.emit("pointerdown", a.pointer()); a.input.poll(); assert.equal(a.input.gesture, 1);
    a.events.emit("pointerdown", a.pointer(2)); assert.equal(a.input.gesture, 1);
    now += 250; a.input.poll(); assert.equal(a.input.gesture, 1);
    a.events.emit("pointerup", a.pointer());
    a.events.emit("pointerdown", a.pointer(2)); assert.equal(a.input.gesture, 2);
    a.input.destroy();
  });
  check("hide and return clears targets even without window blur", () => {
    const f = mixer();
    const a = adapter(true, (packet, gesture) => f.controls.fieldInput(packet, gesture));
    a.events.emit("pointerdown", a.pointer()); a.input.poll();
    browserDocument.hidden = true; f.controls.clear(); for (const fn of visibility) fn(); a.input.poll();
    assert.equal(f.last().targetY, undefined);
    browserDocument.hidden = false; for (const fn of visibility) fn();
    now += 1000; a.input.poll(); f.controls.poll(); assert.equal(f.packets.length, 2);
    a.events.emit("pointerdown", a.pointer(2)); a.input.poll(); assert.equal(f.last().targetY, 50);
    a.input.destroy();
  });
  check("rematch silently forgets targets and waits for a fresh touch", () => {
    const f = mixer(); const a = adapter(true, (packet, gesture) => f.controls.fieldInput(packet, gesture));
    a.events.emit("pointerdown", a.pointer()); a.input.poll();
    a.round(); f.controls.reset(); now += 1000; a.input.poll(); f.controls.poll();
    assert.equal(f.packets.length, 1, "No stale target or neutral heartbeat starts the new round");
    a.events.emit("pointerdown", a.pointer(2, 120, 260)); a.input.poll();
    assert.equal(f.packets.length, 2); assert.equal(f.last().targetY, 50);
    a.input.destroy();
  });
  check("a fresh touch arriving before the first rematch frame remains usable", () => {
    const a = adapter(); a.events.emit("pointerdown", a.pointer()); a.input.poll();
    a.round(); now += 10; a.events.emit("pointerdown", a.pointer(2, 120, 260)); a.input.poll();
    now += 40; a.events.emit("pointermove", a.pointer(2, 120, 280)); a.input.poll();
    assert.equal(a.packets.at(-1)!.targetY, 60); a.input.destroy();
  });
  check("mobile steering does not capture keyboard or queue manual kicks", () => {
    const a = adapter(); a.keys.UP.isDown = true; a.keys.SPACE.justDown = true; a.input.poll();
    assert.equal(a.packets.length, 0); a.input.destroy();
  });
  check("other venues retain their existing press-to-kick pointer behavior", () => {
    const a = adapter(false); a.events.emit("pointerdown", a.pointer()); a.input.poll();
    assert.equal(a.packets[0].move, -1); assert.equal(a.packets[0].kick, true);
    assert.equal(blur.size, 0); a.input.destroy();
  });
  console.log(`MARACAIBO_CONTROLS_RESULT ${JSON.stringify({ ok: true, checks })}`);
} finally {
  Object.defineProperty(globalThis, "performance", { value: originalPerformance, configurable: true });
  Reflect.deleteProperty(globalThis, "window");
  Reflect.deleteProperty(globalThis, "document");
}
