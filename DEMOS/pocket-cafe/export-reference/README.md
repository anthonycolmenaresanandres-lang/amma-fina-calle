# Pocket Collector

An original true-3D arcade browser and mobile game built in React Three Fiber (R3F) and Three.js. Steer an expanding circular collector around compact arenas in fast-paced 60-second solo rounds, swallowing smaller props to grow capacity and unlock larger objects across swappable themes.

---

## 🎮 Gameplay & Features

- **60-Second Solo Rounds**: Fast, high-stakes arcade sprints with instant restart capability.
- **3 Balanced Levels**:
  - **Level 1**: *Sunny Plaza / Bistro Corner* (36x36 arena, dense Tier 1-2 items, 1,800 pt target)
  - **Level 2**: *Grand Promenade / Grand Dining Hall* (44x44 arena, balanced Tier 1-4 items, 3,800 pt target)
  - **Level 3**: *Metropolitan Commons / Royal Feast* (52x52 arena, massive prop density and Tier 5 landmarks, 6,800 pt target)
- **5-Tier Growth Mechanics**:
  - **Tier 1 (Micro Collector)**: Radius 0.95 — Swallows leaves, acorns, sugar cubes, and mint leaves.
  - **Tier 2 (Pocket Sweeper)**: Radius 1.50 — Swallows soda cans, takeout cups, mustard bottles, and espresso demitasses.
  - **Tier 3 (Urban Vacuum)**: Radius 2.30 — Swallows park benches, recycling bins, burger plates, and teapots.
  - **Tier 4 (Mega Vortex)**: Radius 3.30 — Swallows picnic tables, street lamps, pizza platters, and sundae glasses.
  - **Tier 5 (Cosmic Singularity)**: Radius 4.60 — Swallows park gazebos, bronze statue fountains, lazy susans, and grand wedding cakes.
- **Obstacle Locking**: Objects larger than current collector radius act as rigid static blockers, pushing the player back until the required tier is achieved.
- **Controlled Sink Physics**: Props seamlessly interpolate and spiral down into the collector vortex with scale decay.
- **Controls**:
  - **Touch/Mobile**: Dynamic one-thumb virtual joystick with touch-capture.
  - **Mouse**: Pointer follow / click-drag.
  - **Keyboard**: `W`/`A`/`S`/`D` or `Arrow Keys` to move, `Escape` or `P` for Game Menu.

---

## 🎨 Reusable Skin Architecture

The game strictly decouples **Rules / Gameplay**, **Level Data**, **3D Rendering**, and **Skin Configurations**:

1. **Gameplay Rules (`gameplay.ts`)**: Defines logical item IDs (`item_tiny_1` through `item_huge_2`), collision radiuses, mass thresholds, point values, and physical clamping rules.
2. **Level Data (`levels.ts`)**: Defines spatial dimensions, item density distributions, time limits, and target score thresholds.
3. **Skin Configuration (`skins.ts`)**: Defines theme display names, color palettes, ground procedural textures, perimeter barriers, lighting colors, and 3D procedural mesh mappings.
4. **Active Skins**:
   - 🌳 **Park Promenade**: Low-poly lush grass, cobblestone curbs, wooden fences, autumn leaves, picnic drinks, benches, lamps, and gazebos.
   - 🍽️ **Bistro Tabletop**: Red & white checkered diner tablecloth, polished mahogany borders, sugar cubes, condiments, burger plates, pizza platters, and wedding cakes.

### Switching Skins
Skins can be switched at runtime from both the **Start Menu** and the **In-Game Pause Menu** without modifying any game code.

---

## 📦 Asset & Replacement Guidelines

All 3D assets in Pocket Collector are generated natively through procedural Three.js geometries and procedural canvas textures, ensuring instant loading and static bundle portability with zero CDN dependencies.

### Replacing Procedural Assets with Custom GLB Models
To swap in custom GLB assets:
1. Load the GLB into the `ProceduralItemMesh` component in `Game.tsx` or register the asset path in `skins.ts`.
2. Ensure the custom model's pivot rests at `Y = 0` (bottom-most boundary on the floor plane).
3. Align the asset's bounding diameter with the `radius` defined in `gameplay.ts` for its respective logical ID:
   - **Tier 1**: Diameter ~0.7 units
   - **Tier 2**: Diameter ~1.4 units
   - **Tier 3**: Diameter ~2.5 units
   - **Tier 4**: Diameter ~4.0 units
   - **Tier 5**: Diameter ~6.0 units

---

## 🛠️ Dependency Manifest

| Package | Version | License | Usage |
| :--- | :--- | :--- | :--- |
| `react` | `^18.2.0` | MIT | Component tree & State |
| `react-dom` | `^18.2.0` | MIT | DOM rendering |
| `three` | `^0.160.0` | MIT | 3D WebGL engine & geometries |
| `@react-three/fiber` | `^8.15.0` | MIT | React declarative Three.js renderer |
| `@react-three/postprocessing` | `^2.16.0` | MIT | Bloom & tone mapping effects |
| `lucide-react` | `^0.344.0` | ISC | UI icons |
| Web Audio API | Native Browser | W3C Standard | Procedural audio synthesis |

---

## 🚀 Local HTTP Preview & Static Hosting

Pocket Collector runs completely offline with no backend database, external CDN, or authentication requirements.

1. **Serve Locally**:
   ```bash
   npx serve .
   # or
   python3 -m http.server 8000
   ```
2. **Static Export**: Deploy static files to GitHub Pages, Cloudflare Pages, Netlify, or AWS S3.
