# Maracaibo subtle flag wave - local review

Base: de44790b96d40e5ecd2c81ef47161e3657831e8a.
Branch: codex/maracaibo-flag-wave-20261004.

The original Venezuela flag now gently sways from its hoist edge for 4.8 seconds when it appears on Home or the Play chooser, then rests. A single existing image uses perspective/rotate/skew/scale transforms only. No filters, JavaScript animation loop, new bitmap, dependencies, colors, stars or layout changes. Reduced-motion mode remains static through the existing page rule. The bounded motion avoids adding a pause control.

Only MaracaiboMarks.tsx gains the flag class; maracaibo.module.css gains the transform keyframes. Original artwork is unchanged.

Verification: scoped ESLint and TypeScript pass; fresh touched-file guideline review passes. Local Chromium at 390 and 1440px verifies distinct phase transforms, unchanged wrapper geometry, no overflow, rest at 4.8 seconds, static reduced motion and the chooser flag. Zero runtime errors or attempted application writes. Existing dependencies reused; no broad gameplay suite or production build.

Service check, read-only: showRequestPreview only stores the selected label in local React state. Water -> Preview request displays Water / Preview only. Nothing sent. Browser confirmation attempts no write. No staff notification, staff screen or integration was added.

Screenshot: libfile_81d14fcef2e08191a8b7890d5e3304f7.
Local captures and receipts: .review/flag-checks.json and .review/Maracaibo-flag-wave-review.png.
No push, merge or deployment. Concurrent traffic work, canonical dirty edits and paused reliability branches remain untouched.
