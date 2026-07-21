# Fina Calle — 3D / AR menu demo

A **standalone** proof of concept: tap a dish → spin it in 3D → "View in your space"
places it life-size on the customer's real table via their phone camera. No app install.

> **This is isolated on purpose.** It is NOT the live Colattao menu and does not touch
> `APP/web`, `/m/[id]`, `/owner/[id]`, Supabase, Stripe, or any physical-QR URL. It
> deploys as its **own** Vercel project with its **own** URL. Folding anything into the
> real menu happens later, deliberately, with Anthony driving the production merge.

## Files
- `index.html` — the page (Google's `<model-viewer>` web component via CDN; drag-to-spin
  + Android Scene Viewer / iOS Quick Look AR).
- `tools/make_menu_items.py` — headless Blender factory → `models/burger.glb`,
  `models/coffee.glb` (stylized, low-poly, material colors only, no textures).
- `vercel.json` — static hosting + correct `model/gltf-binary` headers for the GLBs.

## Generate the models (Blender machine)
```
blender --background --factory-startup --python tools/make_menu_items.py
```
Success = `MENU_ITEMS_GENERATED` + `models/burger.glb` and `models/coffee.glb`.

## Deploy (separate Vercel project — never the amma app)
From this directory:
```
vercel deploy --prod          # first run: create a NEW project (e.g. "finacalle-menu-3d"),
                              # root = this folder, framework = "Other" (static)
```
Then open the printed URL on a phone and tap "View in your space."

## Real dishes next (two routes)
1. **Stylized 3D** — extend `make_menu_items.py` with more `bpy` dishes. Fast, clean,
   "app-like," fully cloud-authorable. Not photoreal.
2. **Photogrammetry** — spin the ACTUAL dish on a turntable, ~40 phone photos, run through
   a free photogrammetry tool (e.g. Meshroom) → GLB. Best realism, and it's the real
   food, so no licensing/AI-art concerns. Heavier per-dish effort.

AR notes: Android uses Scene Viewer from the GLB (works today). iOS Quick Look wants a
USDF/USDZ (`ios-src`) — add per dish later, or newer iOS uses WebXR. Anthony's Samsung
S22+ is Android → the GLB path works now.
