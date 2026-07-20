# Shadow Doors — Unity overlay (text assets only)

This tree is a Unity-project overlay authored without Unity: `Packages/manifest.json`, `Assets/ShadowDoors/**` (runtime C#, shader, scenario JSON). No `.meta`/`ProjectSettings`/`Library` here — Codex creates the actual Unity project on the 6000.3.19f1 machine and copies these files in.

Codex applies it per `PRODUCT_MODULES/AR_SHADOW_DOORS_MVP.md`'s build/verify ladder: create the project, overlay this tree, wire scene references (XR Origin -> ARFoundationRig / MockARRig, prefabs, UI canvas), then run `L0 compile -> L1 EditMode -> L2 PlayMode (MockARRig) -> L3 Android build -> L4 on-device smoke`.
