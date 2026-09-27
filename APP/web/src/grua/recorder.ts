import { GRUA_LEVEL, STRINGMAN, STRINGMAN_SOURCE } from "./profile";
import { BINS, ITEM_KINDS, bearingTo, gripper, lengths, suspendedMass, type GruaEvent, type Round } from "./round";

// Turns a Grúa round into state/action episodes shaped like Stringman's LeRobot recordings
// (nf_robot/ml/lerobot/stringman.py). Opt-in only; nothing here leaves the device.

export const SCHEMA = "fina-calle.grua.teleop/v1";

// Stringman's "dual_vel_contact" action space, in its order.
export const ACTION_NAMES = [
  "vel_x", "vel_y", "vel_z", "room_vel_x", "room_vel_y", "wrist_speed", "finger_speed",
  "contact_vec_x", "contact_vec_y", "contact_vec_z", "episode_end",
] as const;

// Stringman observation names we can fill truthfully, then Grúa-only extras (sim_*).
export const STATE_NAMES = [
  "vel_x", "vel_y", "vel_z", "wrist_speed", "finger_speed",
  "gripper_pos_x", "gripper_pos_y", "gripper_pos_z", "spin",
  "finger_angle", "laser_rangefinder", "wrist_angle",
  "trashcan_bearing", "trashcan_distance", "swing_cancellation_on",
  "tension_0", "tension_1", "tension_2", "tension_3",
  "gantry_position_x", "gantry_position_y", "gantry_position_z",
  "sim_dishtub_bearing", "sim_dishtub_distance",
  "sim_swing_x", "sim_swing_y", "sim_swing_rate_x", "sim_swing_rate_y",
  "sim_payload_kg", "sim_holding",
  "sim_line_length_0", "sim_line_length_1", "sim_line_length_2", "sim_line_length_3",
  "sim_strained", "sim_floor_contact",
] as const;

const HOLDING = STATE_NAMES.indexOf("sim_holding");

// Stringman features this game cannot measure, so they are left out rather than faked.
export const MISSING_FEATURES = [
  "camera images", "gripper_rot_0..5", "finger_pressure", "target_force",
  "visual_pos_*", "hang_pos_*", "hamper/toybox/gamepad/parking bearings",
];

type Frame = { t: number; action: number[]; state: number[]; gripper: [number, number, number] };

export type Episode = {
  episode_index: number;
  task: string;
  outcome: { kind: "delivered" | "misplaced" | "dropped_on_floor" | "incomplete"; item: string | null; destination: string | null; points: number };
  grab_attempts: number;
  steady_grabs: number;
  strain_events: number;
  length: number;
  timestamp: number[];
  action: number[][];
  state: number[][];
};

const r4 = (v: number) => Math.round(v * 1e4) / 1e4;

export class GruaRecorder {
  private frames: Frame[] = [];
  private grabPoint: [number, number, number] | null = null;
  private attempts = 0;
  private steady = 0;
  private strains = 0;
  readonly episodes: Episode[] = [];

  constructor(private readonly seed: number) {}

  /** Sample one frame (call at GRUA_LEVEL.recordHz of robot time) and fold in events. */
  sample(round: Round, events: GruaEvent[]) {
    const g = gripper(round);
    const [cx, cy, cz] = round.commanded;
    const tub = bearingTo(round, BINS.tub.at);
    const trash = bearingTo(round, BINS.trash.at);
    const holding = round.items.find((i) => i.id === round.holding);
    this.frames.push({
      // LeRobot convention: timestamp = frame_index / fps within the episode.
      t: this.frames.length / GRUA_LEVEL.recordHz,
      gripper: [g[0], g[1], g[2]],
      // Stringman's recorder writes the same commanded motion in both frames; spin is 0 here.
      action: [cx, cy, cz, cx, cy, 0, round.fingerSpeed, 0, 0, 0, 0],
      state: [
        round.velocity[0], round.velocity[1], round.velocity[2], 0, round.fingerSpeed,
        g[0], g[1], g[2], 0,
        round.finger, Math.max(0, g[2]), 0,
        trash.bearing, trash.distance, 0,
        ...round.tensions,
        ...round.gantry,
        tub.bearing, tub.distance,
        round.swing.angle[0], round.swing.angle[1], round.swing.rate[0], round.swing.rate[1],
        suspendedMass(round) - STRINGMAN.suspendedMass, holding ? 1 : 0,
        ...lengths(round),
        round.straining ? 1 : 0,
        // At the bottom of a grab the gripper rests on the floor, which carries part of the
        // weight; tension_* there is the hanging-load upper bound (see replay check).
        round.gantry[2] <= GRUA_LEVEL.grabAltitude + 0.02 ? 1 : 0,
      ],
    });
    for (const event of events) this.onEvent(event, round);
  }

  private onEvent(event: GruaEvent, round: Round) {
    if (event.type === "grab") {
      this.attempts += 1;
      if (event.steady) this.steady += 1;
      if (event.itemId) this.grabPoint = [event.at[0], event.at[1], event.at[2]];
    } else if (event.type === "strain") this.strains += 1;
    else if (event.type === "drop") {
      const item = round.items.find((i) => i.id === event.itemId);
      const kind = item ? ITEM_KINDS[item.kind].label : "item";
      const destination = event.into === "floor" ? "floor" : BINS[event.into].label;
      const task = event.into === "floor" ? `Move the ${kind}` : `Put the ${kind} in the ${destination}`;
      this.close(task, {
        kind: event.into === "floor" ? "dropped_on_floor" : event.correct ? "delivered" : "misplaced",
        item: kind, destination, points: event.points,
      }, [event.at[0], event.at[1], event.at[2]]);
    } else if (event.type === "over" && this.frames.length > 0) {
      this.close("Clear the café floor", { kind: "incomplete", item: null, destination: null, points: 0 }, null);
    }
  }

  /** Close the running episode and fill the hindsight fields Stringman leaves as zeros:
   * contact_vec points to where the gripper will next grasp (then, once holding, to where
   * it releases); episode_end is 1 for the final half second, as the author proposes in
   * docs/notes_on_pick_and_place.md. */
  private close(task: string, outcome: Episode["outcome"], releasePoint: [number, number, number] | null) {
    const frames = this.frames;
    if (frames.length === 0) return;
    const grabIndex = this.grabPoint ? frames.findIndex((f) => f.state[HOLDING] === 1) : -1;
    const end = frames[frames.length - 1].t;
    frames.forEach((f, i) => {
      const target = grabIndex >= 0 && i < grabIndex ? this.grabPoint : releasePoint ?? (grabIndex >= 0 ? this.grabPoint : null);
      if (target) {
        f.action[7] = target[0] - f.gripper[0];
        f.action[8] = target[1] - f.gripper[1];
        f.action[9] = target[2] - f.gripper[2];
      }
      f.action[10] = end - f.t <= 0.5 ? 1 : 0;
    });
    this.episodes.push({
      episode_index: this.episodes.length, task, outcome,
      grab_attempts: this.attempts, steady_grabs: this.steady, strain_events: this.strains,
      length: frames.length,
      timestamp: frames.map((f) => r4(f.t)),
      action: frames.map((f) => f.action.map(r4)),
      state: frames.map((f) => f.state.map(r4)),
    });
    this.frames = [];
    this.grabPoint = null;
    this.attempts = 0; this.steady = 0; this.strains = 0;
  }

  frameCount() { return this.episodes.reduce((n, e) => n + e.length, 0) + this.frames.length; }

  export(createdAt: string) {
    return {
      schema: SCHEMA,
      created_at: createdAt,
      privacy: "Crane motion only. No name, account, photo, location, device ID or network address.",
      source: { game: "grua", level: GRUA_LEVEL.id, seed: this.seed, time_scale: GRUA_LEVEL.timeScale },
      robot_profile: {
        name: "Stringman Arpeggio, carbon270 pole (game approximation)",
        source: STRINGMAN_SOURCE,
        corners_m: STRINGMAN.corners, pole_offset_m: STRINGMAN.poleOffset, swing_length_m: STRINGMAN.swingLength,
        suspended_mass_kg: STRINGMAN.suspendedMass, max_speed_mps: STRINGMAN.maxSpeed, accel_mps2: STRINGMAN.accel,
        max_safe_tension_n: STRINGMAN.maxSafeTension, finger_scale: [STRINGMAN.fingerOpen, STRINGMAN.fingerClosed],
        level: GRUA_LEVEL,
        notes: [
          "Static tensions from a rigid-line, point-mass model: within 1% of Stringman's MuJoCo model at settled poses; 9-11% gap while moving; overstated when sim_floor_contact = 1.",
          "Gripper frame equals room frame (wrist fixed, spin 0).",
          "Grab descent, finger close/open and ascent are automated; lateral velocity is always the player's.",
          "finger_angle positive = closed, inferred from gripper_arp_server.py; verify on hardware.",
        ],
      },
      fps: GRUA_LEVEL.recordHz,
      action_space: "dual_vel_contact",
      action_names: ACTION_NAMES,
      state_names: STATE_NAMES,
      missing_stringman_features: MISSING_FEATURES,
      episodes: this.episodes,
    };
  }
}
