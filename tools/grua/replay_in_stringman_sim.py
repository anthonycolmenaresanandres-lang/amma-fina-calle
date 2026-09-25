"""Replay a Grúa export through Stringman's own MuJoCo model and report how faithful it is.

The question this answers: if a real Stringman were driven along the gantry path a player
flew in the game, would it follow that path, and would its lines carry the tensions the
game showed? If yes, the game's state/action recordings describe motion the robot can
actually make.

Method: for each recorded frame, command every spool to the free span from its last
eyelet to its hook on the gantry at the recorded gantry position (open loop, exactly as
simulator/README.md describes driving the model), step the physics for 1/30 s, then
compare the simulated gantry position and line tensions with the game's.

PASS thresholds, fixed before the first run (2026-09-25):
  - gantry tracking error: RMS <= 0.05 m and 95th percentile <= 0.10 m
  - quasi-static tension (game speed < 0.05 m/s): median |sim - game| / game <= 25 %
  - no line saturates at the model's 25 N force cap
The first 5 s after reaching the start pose are excluded as settling.

Requires: pip install mujoco numpy, and a checkout of
https://github.com/nhnifong/cranebot3-firmware (model: simulator/stringman_arp_carbon270.xml).
Usage: python replay_in_stringman_sim.py <cranebot3-firmware dir> <grua-export.json> [...]
"""

import json
import sys
from pathlib import Path

import mujoco
import numpy as np

EYELETS = ["a0_direct", "eyelet_A", "a1_direct", "eyelet_B"]  # last eyelet per line, Stringman line order
HOOKS = ["hook_0", "hook_1", "hook_2", "hook_3"]
SETTLE_S = 5.0
FORCE_CAP = 25.0


def spans(model, data, gantry_pos):
    """Free span per line if the gantry origin were at gantry_pos with its current attitude."""
    gid = model.body("gantry").id
    rot = data.xmat[gid].reshape(3, 3)
    out = []
    for eyelet, hook in zip(EYELETS, HOOKS):
        hook_world = gantry_pos + rot @ model.site(hook).pos
        out.append(np.linalg.norm(data.site(eyelet).xpos - hook_world))
    return np.array(out)


def replay(model_path, export_path):
    model = mujoco.MjModel.from_xml_path(str(model_path))
    data = mujoco.MjData(model)
    mujoco.mj_resetDataKeyframe(model, data, model.key("hang").id)
    mujoco.mj_forward(model, data)

    run = json.loads(Path(export_path).read_text())
    names = run["state_names"]
    ix = {n: names.index(n) for n in names}
    fps = run["fps"]
    gripper_body = model.body("gripper").id
    base_gripper_mass = model.body_mass[gripper_body]
    sensor = {n: model.sensor(n).adr[0] for n in ["gantry_pos", "tension_0", "tension_1", "tension_2", "tension_3"]}

    frames = [row for ep in run["episodes"] for row in ep["state"]]
    first = np.array([frames[0][ix["gantry_position_x"]], frames[0][ix["gantry_position_y"]], frames[0][ix["gantry_position_z"]]])

    # Ease from the keyframe pose to the first recorded pose, then hold to settle.
    start = data.sensordata[sensor["gantry_pos"]:sensor["gantry_pos"] + 3].copy()
    steps_per_frame = round(1 / fps / model.opt.timestep)
    for k in range(int(3 * fps)):
        target = start + (first - start) * (k + 1) / (3 * fps)
        data.ctrl[:4] = spans(model, data, target)
        for _ in range(steps_per_frame):
            mujoco.mj_step(model, data)
    for _ in range(int(SETTLE_S * fps)):
        data.ctrl[:4] = spans(model, data, first)
        for _ in range(steps_per_frame):
            mujoco.mj_step(model, data)

    errors, rel_tension, max_force = [], [], 0.0
    # Diagnostics beyond the fixed PASS criteria (added after the first run, see GRUA spec):
    # where the tension gap comes from, and whether Stringman's passive_safety() would trip.
    by_kind = {"cruise_static": [], "grab_bottom": [], "moving": []}
    over_limit_frames, ema, ema_over, ema_peak = 0, np.zeros(4), 0, 0.0
    frames_per_ema = max(1, round(0.2 * fps))  # passive_safety samples tension every 0.2 s
    for n, row in enumerate(frames):
        want = np.array([row[ix["gantry_position_x"]], row[ix["gantry_position_y"]], row[ix["gantry_position_z"]]])
        model.body_mass[gripper_body] = base_gripper_mass + row[ix["sim_payload_kg"]]
        data.ctrl[:4] = spans(model, data, want)
        for _ in range(steps_per_frame):
            mujoco.mj_step(model, data)
        got = data.sensordata[sensor["gantry_pos"]:sensor["gantry_pos"] + 3]
        errors.append(np.linalg.norm(got - want))
        sim_t = -np.array([data.sensordata[sensor[f"tension_{i}"]] for i in range(4)])
        max_force = max(max_force, sim_t.max())
        game_t = np.array([row[ix[f"tension_{i}"]] for i in range(4)])
        speed = np.hypot(row[ix["vel_x"]], row[ix["vel_y"]])
        if speed < 0.05 and game_t.max() > 1:
            rel_tension.append(abs(sim_t.max() - game_t.max()) / game_t.max())
        rel = abs(sim_t.max() - game_t.max()) / max(game_t.max(), 1e-6)
        if want[2] < 0.6:
            by_kind["grab_bottom"].append(rel)
        elif speed < 0.05 and abs(row[ix["vel_z"]]) < 0.01:
            by_kind["cruise_static"].append(rel)
        else:
            by_kind["moving"].append(rel)
        over_limit_frames += int(sim_t.max() > 16)
        if n % frames_per_ema == 0:
            ema = ema * 0.9 + sim_t * 0.1
            ema_peak = max(ema_peak, float(ema.max()))
            ema_over += int(ema.max() > 16)

    errors = np.array(errors)
    result = {
        "file": Path(export_path).name,
        "frames": len(frames),
        "track_rms_m": float(np.sqrt(np.mean(errors ** 2))),
        "track_p95_m": float(np.percentile(errors, 95)),
        "track_max_m": float(errors.max()),
        "tension_median_rel": float(np.median(rel_tension)) if rel_tension else None,
        "tension_samples": len(rel_tension),
        "max_line_force_n": float(max_force),
        "diag_tension_median_rel": {k: (round(float(np.median(v)), 3) if v else None) for k, v in by_kind.items()},
        "diag_frames": {k: len(v) for k, v in by_kind.items()},
        "diag_frames_over_16n": over_limit_frames,
        "diag_passive_safety_ema_peak_n": round(ema_peak, 2),
        "diag_passive_safety_trips": ema_over,
    }
    result["pass"] = bool(
        result["track_rms_m"] <= 0.05 and result["track_p95_m"] <= 0.10
        and result["tension_median_rel"] is not None and result["tension_median_rel"] <= 0.25
        and max_force < FORCE_CAP - 1e-6
    )
    return result


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(2)
    model_path = Path(sys.argv[1]) / "simulator" / "stringman_arp_carbon270.xml"
    results = [replay(model_path, p) for p in sys.argv[2:]]
    for r in results:
        print(json.dumps(r))
    sys.exit(0 if all(r["pass"] for r in results) else 1)


if __name__ == "__main__":
    main()
