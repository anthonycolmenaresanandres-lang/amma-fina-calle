// Robot profile for Grúa. Every number here is copied from the open-source Stringman
// robot so that a player's run is a physically plausible teleoperation of that robot.
// Source: github.com/nhnifong/cranebot3-firmware @48123d3 (nf_robot 6.9.1, Apache-2.0).
// Where a value is ours rather than theirs, the comment says so.

export type Vec3 = readonly [number, number, number];

export const STRINGMAN_SOURCE = {
  repo: "https://github.com/nhnifong/cranebot3-firmware",
  commit: "48123d3",
  version: "nf_robot 6.9.1",
  license: "Apache-2.0",
} as const;

export const STRINGMAN = {
  // simulator/stringman_arp_carbon270.xml: 4 m square room. The last eyelet each line
  // leaves from, in Stringman's line order (anchor0 direct, anchor0 indirect via post A,
  // anchor1 direct, anchor1 indirect via post B). Room frame is z-up, floor at z = 0.
  corners: [
    [2, 2, 1.97],
    [-2, 2, 1.97],
    [-2, -2, 1.97],
    [2, -2, 1.97],
  ] as readonly Vec3[],
  // definitions.py pole_offset_carbon270: gripper hangs this far below the gantry.
  poleOffset: 0.4457,
  // definitions.py pole_length_carbon270: effective pendulum length for the swing.
  swingLength: 0.3089,
  // simulator README mass estimates: gantry 0.35 + pole 0.045 + gripper 0.60 + fingers 0.08.
  suspendedMass: 1.075,
  // observer.py seek(): MAX_SPEED 0.4 m/s, ACCEL 0.15 m/s^2.
  maxSpeed: 0.4,
  accel: 0.15,
  // observer.py NUDGE_SPEED_MPS: slow lateral centring speed used near the floor.
  nudgeSpeed: 0.12,
  // observer.py DEFAULT_MAX_SAFE_TENSION: the robot backs off above this, in newtons.
  maxSafeTension: 16,
  // gripper_arp_server.py drives the finger on a fictitious -90..90 scale; a positive
  // speed closes it (the pressure trigger only fires while desired_finger_speed > 0).
  fingerOpen: -90,
  fingerClosed: 90,
  gravity: 9.81,
} as const;

// Game-side choices, not Stringman constants. Each is recorded in every export.
export const GRUA_LEVEL = {
  id: "grua-closeout-v1",
  // Robot seconds per screen second. Physics and recordings stay in robot time.
  timeScale: 3,
  roundScreenSeconds: 60,
  // Travel height for the gantry. Below observer.py's 1.3 m ideal because this room has
  // no furniture to clear and lower lines carry less tension.
  cruiseAltitude: 0.8,
  // Gantry height at the bottom of a grab: puts the grasp point ~5 cm above the floor.
  grabAltitude: 0.52,
  verticalSpeed: 0.25,
  fingerSpeedDegPerSec: 240,
  // Light natural damping on the pole swing (ours; the real robot also runs active
  // swing cancellation, which this game leaves off so steadiness is the player's job).
  swingDampingRatio: 0.02,
  // Keep the gantry this far inside the eyelets so no line goes slack.
  wallLimit: 1.8,
  steadyGrabMeters: 0.004,
  // Tension overload response, after observer.py passive_safety(): motors damped for 1 s.
  // The sag rate is ours; the real gantry falls however gravity and line damping allow.
  sagSeconds: 1,
  sagSpeed: 0.1,
  physicsHz: 120,
  recordHz: 30,
} as const;
