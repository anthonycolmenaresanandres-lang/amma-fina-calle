# Grúa tools

`replay_in_stringman_sim.py` drives Stringman's own MuJoCo model along the gantry path in a Grúa export. It reports how closely the robot model follows the path and whether its line tensions match the game's. PASS thresholds are fixed in the script header.

```bash
python3 -m venv venv && ./venv/bin/pip install mujoco numpy
git clone --depth 1 https://github.com/nhnifong/cranebot3-firmware.git
# The model's textures are Git LFS files: run `git lfs pull` in that checkout, or fetch
# simulator/meshes/gantry_tex.png and hardware/boards/{origin,cal_assist_1,2,3}.png from
# media.githubusercontent.com and check each SHA-256 against its LFS pointer.

# Scripted reference runs (from APP/web):
npx tsx scripts/grua-bot-export.ts ../../grua-runs 7 11 42

./venv/bin/python tools/grua/replay_in_stringman_sim.py cranebot3-firmware grua-runs/*.json
```

Exit code 0 means every file passed. Keys starting with `diag_` are diagnostics, not pass criteria.
