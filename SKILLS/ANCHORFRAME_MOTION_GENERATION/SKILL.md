---
name: anchorframe-motion-generation
description: How to generate AnchorFrame anchor motion video — what Claude-cloud can and cannot execute, verified paths, and the decision tree. Use when any agent needs to produce or troubleshoot anchor motion clips.
---

# AnchorFrame Motion Generation — verified execution paths

_Verified empirically 2026-07-08 in the Claude cloud container. Do not re-discover; follow the tree._

## Attempt log (what was actually tried, in order)

**Path 1 — Claude tool layer ("my way"):**
- `ToolSearch("gemini veo video generation")` → **no Gemini/Veo tool exists**. Only motion tools
  wired to Claude-cloud are the **Runway MCP** family (`generate_video`, `generate_multishot_video`,
  `generate_image`, uploads). Result: Gemini via tools = impossible; Runway via tools = possible (paid).

**Path 2 — Claude drives a browser like a human:**
- Container has Chromium at `/opt/pw-browsers/chromium`; `pip install playwright` works; headless
  launch + navigation works in principle.
- `page.goto("https://gemini.google.com/app")` → `net::ERR_TUNNEL_CONNECTION_FAILED`.
- Proxy status (`$HTTPS_PROXY/__agentproxy/status`) shows the cause: the egress gateway answers
  **403 to CONNECT for `gemini.google.com:443` and `www.google.com:443`** — a network **policy
  denial**. The login page is unreachable; auth never even enters the picture (and Claude must not
  handle Google logins anyway). **Result: browser path from the cloud container = hard-blocked.**
  Do NOT attempt to bypass egress policy.

## Decision tree (current, verified)

```
Need anchor motion clip?
├─ FREE ($0): Gemini web — ONLY possible on Anthony's machine (signed-in browser, open network)
│   ├─ Operator: Codex (needs: file at exact path + chrome://extensions -> Codex ->
│   │   "Allow access to file URLs" ON), or
│   └─ Operator: Anthony manually (fastest, ~3 min: Gemini -> Crear video -> 9:16 ->
│       upload keyframe -> paste motion prompt -> download)
└─ PAID: Runway MCP from Claude-cloud — the ONLY motion path Claude can execute itself
    ├─ Gate: Anthony's explicit budget (balance / account owner / max credits per clip)
    ├─ Input: upload keyframe via init_upload -> PUT -> complete_upload -> generate_video
    │   with startFrame + promptText, ratio 9:16 (model gen-4.5 for premium)
    └─ Never run for exploration — final motion only.
```

## Standing inputs

- **Keyframe (identity carrier):** `anchorOne_likeness_v2.png` — owner-approved adult Anchor One.
  Canonical local home: `C:\Users\antho\OneDrive\Desktop\AnchorFrame\out\`. Never upload the minor's
  reference photos for motion; the keyframe carries the identity.
- **Motion prompt (locked):** static tripod camera, 5–8 s, 9:16, anchor speaks calmly to camera,
  natural blinks/head movement/breathing, preserve face/hair/wardrobe/desk/lighting, no
  text/captions/graphics/logos/transitions/zooms, silent clean plate.

## Hard rules (unchanged)

No publishing · clean plates · codename "Anchor One" only · STOP on refusal/CAPTCHA/payment/login ·
free tier before paid · Runway only with owner budget.
