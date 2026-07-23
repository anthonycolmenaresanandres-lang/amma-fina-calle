import type PhaserType from "phaser";
import { TableFootballHost, TABLE_FOOTBALL_TICK_MS, toStateMessage } from "./engine";
import type {
  TableFootballInputMessage,
  TableFootballMatchOptions,
  TableFootballState,
  TableFootballStateMessage,
  TableFootballVenueSkin,
  TeamId,
} from "./types";

export type TableFootballMountOptions = Readonly<{
  parent: HTMLElement;
  match: TableFootballMatchOptions;
  skin: TableFootballVenueSkin;
  /** host is the local-practice fallback and can also back a Supabase host client. */
  authority?: "host" | "replica";
  localPlayerId?: string;
  initialState?: TableFootballState;
  onInput?: (message: TableFootballInputMessage) => void;
  onState?: (message: TableFootballStateMessage) => void;
}>;

export type TableFootballGameHandle = Readonly<{
  getState: () => TableFootballState;
  receiveInput: (message: TableFootballInputMessage) => boolean;
  applyState: (message: TableFootballStateMessage) => boolean;
  reset: () => void;
  destroy: () => void;
}>;

/**
 * Browser mount seam for a parent React client. `onInput` / `onState` are the
 * only transport seams needed for Supabase Broadcast; this module makes no calls.
 */
export async function mountTableFootballGame(options: TableFootballMountOptions): Promise<TableFootballGameHandle> {
  const [{ default: Phaser }, { TableFootballScene }] = await Promise.all([
    import("phaser"),
    import("./TableFootballScene"),
  ]);
  const authority = options.authority ?? "host";
  const host = authority === "host" ? new TableFootballHost(options.match) : null;
  const initialState = options.initialState ?? host?.state;
  if (!initialState) throw new Error("A replica needs an initialState before mounting.");
  let current: TableFootballState = initialState;
  let accumulator = 0;
  let game: PhaserType.Game | null = null;

  const frame = (deltaMs: number): void => {
    if (!host) return;
    accumulator += Math.min(deltaMs, 100);
    while (accumulator >= TABLE_FOOTBALL_TICK_MS) {
      accumulator -= TABLE_FOOTBALL_TICK_MS;
      const message = host.step();
      current = message.state;
      options.onState?.(message);
    }
  };
  const receiveInput = (message: TableFootballInputMessage): boolean => {
    options.onInput?.(message);
    return host ? host.receive(message) : false;
  };
  const teams: Record<TeamId, { label: string; primary: number; secondary: number }> = {
    home: options.match.home,
    away: options.match.away,
  };
  const scene = new TableFootballScene({ skin: options.skin, teams, getState: () => current, onFrame: frame, onInput: receiveInput, localPlayerId: options.localPlayerId });
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: options.parent,
    width: options.parent.clientWidth || 390,
    height: options.parent.clientHeight || 520,
    backgroundColor: `#${options.skin.table.toString(16).padStart(6, "0")}`,
    scene: [scene],
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
  });

  return {
    getState: () => current,
    receiveInput,
    applyState: (message) => {
      if (message.type !== "state" || message.roomId !== current.roomId || message.state.protocol !== current.protocol) return false;
      current = message.state;
      return true;
    },
    reset: () => {
      if (!host) return;
      const message = host.reset();
      current = message.state;
      options.onState?.(message);
    },
    destroy: () => { game?.destroy(true); game = null; },
  };
}

export { toStateMessage };
