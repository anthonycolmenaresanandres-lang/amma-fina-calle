// Project Code Atlas — the code infrastructure of every project, grouped by the
// portfolio triage tiers (BUSINESS/PROJECT_PORTFOLIO_TRIAGE.md) and sourced from
// HANDOFFS/LOCAL_CODE_INVENTORY.md. Edit here; the page renders straight from it.

export type Move =
  | "Double-down" | "Ship" | "Productize" | "Salvage" | "Keep" | "Park" | "Archive";

export interface AtlasProject {
  name: string;
  stack: string;
  type: string;
  state: string;
  move: Move;
  remote?: string; // GitHub URL if it has one; omitted = local-only
  note?: string;   // the triage "next action" / why
  flagship?: boolean;
}

export interface AtlasTier {
  title: string;
  blurb: string;
  projects: AtlasProject[];
}

const GH = "https://github.com/anthonycolmenaresanandres-lang";

export const tiers: AtlasTier[] = [
  {
    title: "Tier 1 — AMMA core",
    blurb: "Ship / consolidate. This is the company.",
    projects: [
      {
        name: "AMMA Ventures (canonical repo)",
        stack: "Next.js · React · Phaser · Supabase · TS · Python ops",
        type: "Company workspace + web app",
        state: "Active",
        move: "Double-down",
        remote: `${GH}/amma-fina-calle`,
        note: "The hub — source of truth; everything lands here (incl. finacalleos.com + the voice gateway).",
      },
      {
        name: "AMMA variant clones ×4",
        stack: "Next.js · React · Phaser · Supabase",
        type: "Local clones of the canonical remote",
        state: "Stale",
        move: "Salvage",
        remote: `${GH}/amma-fina-calle`,
        note: "Adzone · Campaign Wiring · Ball Kicker · Stadium Chrome — confirm nothing unmerged, then delete (CLONE_CONTROL hygiene).",
      },
      {
        name: "Fina Calle Landing",
        stack: "Next.js · React · Tailwind · TS",
        type: "Static marketing site",
        state: "~Done",
        move: "Ship",
        remote: `${GH}/fina-calle-landing`,
        note: "Confirm it's the deployed public site; point the domain. Quick win.",
      },
      {
        name: "Colattao Cafe Rush",
        stack: "Next.js · React · Phaser · Supabase · Resend · Vercel",
        type: "Promo web game + client surfaces",
        state: "Active",
        move: "Ship",
        remote: `${GH}/colattao-cafe-rush`,
        note: "Ship for Colattao; harvest reusable patterns into the OS game library.",
      },
      {
        name: "Asset & script annexes",
        stack: "Python · JS · docs/assets",
        type: "Colattao asset clone · anime pack · _finacalle_build",
        state: "Active",
        move: "Salvage",
        note: "Move assets into ASSET_REGISTRY/ + scripts into tools/, then archive the folders.",
      },
      {
        name: "Shadow Engineer (RPA) + ops watchdog",
        stack: "TypeScript · Node · zod · PowerShell",
        type: "CLI automation / clone-control governance",
        state: "Active",
        move: "Keep",
        remote: `${GH}/shadow-engineer-rpa`,
        note: "Fold the watchdog into Shadow Engineer; internal force-multiplier, not sold.",
      },
    ],
  },
  {
    title: "Tier 2 — Build bets",
    blurb: "Separate sellable products — one at a time.",
    projects: [
      {
        name: "VBFH Media Engine",
        stack: "Next.js · React · Playwright · Sharp · pptxgenjs · Nodemailer · TS",
        type: "Sports-facility media automation",
        state: "WIP / active · 185 tests green",
        move: "Productize",
        note: "FIRST bet. Engine works; the gap is the trigger (never installed). Path: stabilize → multi-tenant (de-VBFH via brandConfig) → hosted scheduler. Push to a remote so cloud can review.",
        flagship: true,
      },
      {
        name: "Dual Perspective Newsroom",
        stack: "Next.js · React · Prisma · OpenAI · Vercel Blob · TS",
        type: "Social newsroom automation (IG/X)",
        state: "WIP / active",
        move: "Productize",
        remote: `${GH}/newsroom-agent`,
        note: "2nd bet — decide standalone product vs the Fina Calle 'content engine' module.",
      },
    ],
  },
  {
    title: "Tier 3 — Park",
    blurb: "Real potential, off-core. Revisit when the core has revenue.",
    projects: [
      {
        name: "PermitReadyFencePacket",
        stack: "Python · Streamlit · ReportLab · PyMuPDF",
        type: "Permit-packet PDF generator",
        state: "WIP",
        move: "Park",
        note: "Sellable construction/permitting SaaS — but a different market. Park until core has momentum.",
      },
      {
        name: "Kalshi Research Terminal",
        stack: "Next.js · React · Drizzle · SQLite/libSQL · TS",
        type: "Market-research / paper-trading (ex Cigar-Butt)",
        state: "Paused pivot",
        move: "Park",
        note: "Personal fin-research; off-thesis.",
      },
      {
        name: "Franchise Certainty",
        stack: "Python · Arduino/C++",
        type: "Conveyor-throughput sim + firmware PoC",
        state: "WIP",
        move: "Park",
        note: "Early hardware PoC; off-core.",
      },
      {
        name: "New Project 2 (Unity)",
        stack: "Unity · C# · PowerShell",
        type: "Unity game prototype + test harness",
        state: "Recent",
        move: "Park",
        note: "Revisit only if it feeds the OS game library.",
      },
      {
        name: "Local AI Agent",
        stack: "Python · PowerShell · JS",
        type: "Local desktop web agent (127.0.0.1:8765)",
        state: "Unknown",
        move: "Park",
        note: "Likely superseded by Codex + Shadow Engineer; harvest ideas, don't maintain.",
      },
    ],
  },
  {
    title: "Tier 4 — Archive",
    blurb: "Dead / off-core. Recorded so nothing is 'lost', then stop.",
    projects: [
      { name: "VBFH desktop placeholder", stack: "—", type: "Empty folder", state: "Stale/empty", move: "Archive", note: "Real VBFH is the Tier-2 soccer app." },
      { name: "CLMH_Analysis", stack: "Python · FITS", type: "Astronomy analysis scratch", state: "Stale", move: "Archive", note: "Zero-byte stubs + large datasets." },
      { name: "first-game / first-game-ever", stack: "Godot 4.3", type: "Game prototypes (2025)", state: "Abandoned", move: "Archive", note: "Earliest experiments." },
      { name: "Hail Marry", stack: "Python · pydicom · HTML", type: "DICOM/medical utilities + mockups", state: "Recent", move: "Archive", note: "Off-core / personal." },
      { name: "Newsroom hardware sketch", stack: "Arduino/C++", type: "Nested firmware appendix", state: "Unknown", move: "Archive", note: "Lives inside the Newsroom docs; not standalone." },
    ],
  },
];
