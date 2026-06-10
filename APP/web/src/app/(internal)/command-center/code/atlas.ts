// Project Code Atlas — the code-infrastructure map of every local project.
// Single source of truth for /command-center/code. Edit this list to keep it current.
//
// Derived from HANDOFFS/LOCAL_CODE_INVENTORY.md (the raw scan) + BUSINESS/
// PROJECT_PORTFOLIO_TRIAGE.md (the strategic move per project). Grouped by the
// triage's four tiers. Philosophy: Managerial Factory — prefer reusable modules,
// cap work-in-progress (1–2 active builds), park or archive the rest.

export type Move =
  | "Double-down"
  | "Productize / Sell"
  | "Ship"
  | "Integrate"
  | "Salvage"
  | "Keep (internal)"
  | "Park"
  | "Archive";

export interface AtlasProject {
  /** Display name. */
  name: string;
  /** Local path on Anthony's machine. */
  path: string;
  /** Languages / frameworks / notable libs. */
  stack: string;
  /** What kind of thing it is. */
  type: string;
  /** works / WIP / stale / empty, plus a key fact if useful. */
  state: string;
  /** Git remote, or "local-only" (repo, no remote), or "no git". */
  git: string;
  /** The triage move. */
  move: Move;
  /** One-line why + next action. */
  note: string;
  /** GitHub repo URL when one exists (makes the card a link). */
  repo?: string;
  /** Flag the single active build #1. */
  flagship?: boolean;
}

export interface AtlasTier {
  title: string;
  blurb: string;
  projects: AtlasProject[];
}

const GH = "https://github.com/anthonycolmenaresanandres-lang";

export const updatedAt = "2026-06-10";

export const atlas: AtlasTier[] = [
  {
    title: "Tier 1 — AMMA core",
    blurb: "The company itself. Ship / consolidate; this is where everything lands.",
    projects: [
      {
        name: "AMMA Ventures (canonical repo)",
        path: "Desktop\\AMMA Ventures LLC DBA Fina Calle",
        stack: "TypeScript · Next.js · React · Phaser · Supabase · Python ops",
        type: "Web app + company workspace",
        state: "WIP / active — the hub (this app lives in APP/web)",
        git: "remote: amma-fina-calle",
        repo: `${GH}/amma-fina-calle`,
        move: "Double-down",
        note: "Source of truth — all work lands here. Keep canonical; the 4 clones below mirror this remote.",
      },
      {
        name: "AMMA variant clones ×4",
        path: "Desktop\\AMMA Fina Calle {Colattao Adzone · Campaign Wiring · Stadium Ball Kicker · Stadium Chrome}",
        stack: "Same core APP/web stack (Next.js · React · Phaser · Supabase)",
        type: "Clone / variant checkouts",
        state: "WIP — stale working copies of the same remote",
        git: "remote: amma-fina-calle (same as canonical)",
        repo: `${GH}/amma-fina-calle`,
        move: "Salvage",
        note: "Per-campaign working copies. → Confirm nothing unmerged vs remote, then delete the local clones (CLONE_CONTROL hygiene).",
      },
      {
        name: "Fina Calle Landing",
        path: "Desktop\\Fina Calle Landing",
        stack: "TypeScript · Next.js · React · Tailwind",
        type: "Static marketing site",
        state: "WIP / active — ~done, no backend",
        git: "remote: fina-calle-landing",
        repo: `${GH}/fina-calle-landing`,
        move: "Ship",
        note: "Quick win. → Confirm it's the deployed public site and point the domain.",
      },
      {
        name: "Colattao Cafe Rush",
        path: "Desktop\\Colattao Rush",
        stack: "TypeScript · Next.js · React · Phaser · Tailwind · Supabase · Resend",
        type: "Web app / promo game",
        state: "WIP / active — live client promo game",
        git: "remote: colattao-cafe-rush",
        repo: `${GH}/colattao-cafe-rush`,
        move: "Ship",
        note: "Catch-game → discount + QR/menu. → Ship for Colattao; harvest reusable patterns into the OS game library.",
      },
      {
        name: "Asset / script annexes ×3",
        path: "Documents\\clone · Desktop\\fina-calle-anime-pack · _finacalle_build",
        stack: "Python handoff scripts · JS · docx/marked build tooling · static assets",
        type: "Asset workflow / scratch build utilities",
        state: "WIP / recent",
        git: "clone: local-only · others: no git",
        move: "Salvage",
        note: "→ Move useful assets into ASSET_REGISTRY/ and scripts into tools/, then archive the folders.",
      },
      {
        name: "Shadow Engineer (RPA)",
        path: "Desktop\\Shadow Engineer",
        stack: "TypeScript · Node · tsx · zod · OCR/screenshot tooling",
        type: "CLI / automation governance",
        state: "WIP / active",
        git: "remote: shadow-engineer-rpa",
        repo: `${GH}/shadow-engineer-rpa`,
        move: "Keep (internal)",
        note: "Safe local executor + clone-control governance. → Fold the ops watchdog into it. Internal force-multiplier, not sold.",
      },
      {
        name: "Fina Calle ops watchdog",
        path: "fina-calle-ops",
        stack: "PowerShell · git CLI",
        type: "Scheduled ops script",
        state: "WIP / active — zero-token deterministic task",
        git: "no git",
        move: "Keep (internal)",
        note: "Watches the canonical repo, raises NEEDS_CLAUDE.flag only on judgment calls. → Fold into Shadow Engineer.",
      },
    ],
  },
  {
    title: "Tier 2 — Build bets",
    blurb: "Separate sellable products. WIP-capped: build one at a time.",
    projects: [
      {
        name: "VBFH Media Engine",
        path: "Documents\\soccer\\VBFH APP email",
        stack: "TypeScript · Next.js · React · Tailwind · Playwright · Sharp · pptxgenjs · Nodemailer · Vitest · zod",
        type: "Web app + scheduled automation",
        state: "WIP / active #1 — 185 tests green; last full run 2026-05-18; scheduler never installed (runs are manual)",
        git: "local-only (no remote yet)",
        move: "Productize / Sell",
        note: "FIRST. Sports-facility media automation (scrape schedules → branded recaps + captions + PPTX + email). → Stabilize the trigger, then multi-tenant. Push to a remote for review.",
        flagship: true,
      },
      {
        name: "Dual Perspective Newsroom",
        path: "Documents\\New project",
        stack: "TypeScript · Next.js · React · Prisma · Tailwind · Vercel Blob · Sharp · zod",
        type: "Web app / social-news automation",
        state: "WIP / active — large engine (~1,336 files)",
        git: "remote: newsroom-agent",
        repo: `${GH}/newsroom-agent`,
        move: "Integrate",
        note: "2nd bet. IG/X, fact-vs-claim separation, Fina Calle publish. → Decide standalone product vs the Fina Calle 'content engine' module.",
      },
    ],
  },
  {
    title: "Tier 3 — Park",
    blurb: "Real potential, off-core. Frozen with a revisit trigger until the core has revenue.",
    projects: [
      {
        name: "PermitReadyFencePacket",
        path: "APP Designs",
        stack: "Python · Streamlit · pydantic · ReportLab · PyMuPDF · pytest",
        type: "Web app / PDF document generator",
        state: "WIP / active",
        git: "local-only",
        move: "Park",
        note: "Genuinely sellable permitting SaaS, but a different market. → Park → productize as a separate vertical once core has momentum.",
      },
      {
        name: "Kalshi Research Terminal (ex Cigar-Butt)",
        path: "cigar-butt-scanner",
        stack: "TypeScript · Next.js · React · Drizzle · SQLite/libSQL",
        type: "Web app / research CLI",
        state: "Paused pivot — original scanner shelved, Kalshi paper-trading active",
        git: "local-only",
        move: "Park",
        note: "Personal fin-research; off-thesis.",
      },
      {
        name: "Franchise Certainty",
        path: "Desktop\\Franchise Certainty",
        stack: "Python · Arduino/C++",
        type: "Sim + firmware PoC",
        state: "WIP — early",
        git: "local-only",
        move: "Park",
        note: "Conveyor/throughput 'Certainty Index' PoC. Off-core hardware.",
      },
      {
        name: "New Project 2 (Unity)",
        path: "Documents\\New project 2",
        stack: "C# · Unity · PowerShell test runner",
        type: "Unity game / test harness",
        state: "WIP / recent",
        git: "local-only",
        move: "Park",
        note: "Game experiment. → Revisit only if it feeds the OS game library.",
      },
      {
        name: "Local AI Agent",
        path: "Documents\\Local AI Agent",
        stack: "Python http.server · PowerShell · JS",
        type: "Local desktop web agent (127.0.0.1:8765)",
        state: "Unknown / usable-looking",
        git: "no git",
        move: "Park",
        note: "Likely superseded by Codex + Shadow Engineer. → Harvest ideas, don't maintain.",
      },
    ],
  },
  {
    title: "Tier 4 — Archive",
    blurb: "Dead or off-core. Documented and stopped — nothing is lost, it's recorded.",
    projects: [
      {
        name: "VBFH desktop placeholder",
        path: "Desktop\\VBFH",
        stack: "none detected",
        type: "Empty / placeholder folder",
        state: "stale / empty (real VBFH is the soccer app in Tier 2)",
        git: "no git",
        move: "Archive",
        note: "Remove the confusing empty twin.",
      },
      {
        name: "CLMH_Analysis",
        path: "Desktop\\CLMH_Analysis",
        stack: "Python + FITS astronomy datasets",
        type: "Data-analysis scratch",
        state: "stale — zero-byte Python stubs + large FITS files",
        git: "no git",
        move: "Archive",
        note: "Off-core astronomy scratch.",
      },
      {
        name: "first-game / first-game-ever",
        path: "Documents\\first-game · Documents\\first-game-ever",
        stack: "Godot 4.3",
        type: "Game prototypes",
        state: "stale / abandoned (2025)",
        git: "no git",
        move: "Archive",
        note: "Early Godot prototypes.",
      },
      {
        name: "Hail Marry",
        path: "Desktop\\Hail marry",
        stack: "Python · pydicom · HTML",
        type: "DICOM metadata utils + HTML mockups",
        state: "WIP / recent",
        git: "no git",
        move: "Archive",
        note: "Medical/DICOM — personal, off-core, regulated data. Keep out of company repos.",
      },
      {
        name: "Newsroom hardware sketch",
        path: "Documents\\New project\\docs\\hardware",
        stack: "Arduino/C++",
        type: "Nested firmware sketch",
        state: "Unknown — appendix inside the Newsroom repo",
        git: "inherited from Newsroom",
        move: "Archive",
        note: "Nested PoC appendix, not the main Newsroom app.",
      },
    ],
  },
];
