# Project Seed October 2026 concept assets

**Superseded visual direction:** Anthony rejected the displayed flyer and cartoon cup illustrations after review. The flyer is retained as a copy source only; its image and the v1 illustrations/backdrop are no longer used by the active pages. See `VISUAL_CLEANUP_20260930.md` for the restored product art, roof/map background, and flag sources.

**Source:** Anthony supplied three image attachments on September 30, 2026: a café interior photograph, the circular Project Seed Coffee logo, and an October menu flyer. Copied byte-for-byte to `APP/web/public/assets/project-seed/brand/` before implementation. The October menu wording is transcribed from that flyer. The official site menu is a separate source for the regular menu.

**Use:** Labeled noindex Fina Calle Project Seed concept menu and Seed Rush game at `/demo/project-seed` and `/play/project-seed`. Project Seed approval and confirmation of product prices, availability, foam preparation, and image rights are pending. Anthony authorized implementation and merge of this concept on September 30; this record does not claim client approval or an official channel launch.

**Original supplied files:**

| File | SHA-256 |
|---|---|
| `brand/cafe-interior-reference.png` | `1DF5D51B77FC037A7E7075EB12B1BD868314C9E4A4CE28C24CCD4B16B711F00A` |
| `brand/project-seed-logo-reference.png` | `7667BEC34D3BD6F2D97124CAB16F8C6485F73D92A5E8F3EE98BDCECC747335D1` |
| `brand/october-menu-reference.png` | `0E64D1080EEBFEF43B2C3E8537B57579135E1BDA2874C7AD401FF6936C1CD0EC` |

**Locally authored game art:** `APP/web/scripts/project-seed-october-art.mjs` produces six 256 × 256 WebP drink illustrations and `october/cafe-backdrop-v1.webp`. The backdrop incorporates the supplied café photograph beneath original roof, woven lamp, counter, and plant shapes. The six drinks depict ingredient cues from the flyer; they are illustrations, not product photos. The supplied logo is used as an unchanged file and is never generated or traced. All game art has a primitive fallback if it fails to load.

**Review boundary:** Replace these concept assets if Project Seed supplies approved higher-resolution logo/product art or declines any depiction. Keep the seasonal copy tied to the October 1 launch and avoid invented prices or health claims.
