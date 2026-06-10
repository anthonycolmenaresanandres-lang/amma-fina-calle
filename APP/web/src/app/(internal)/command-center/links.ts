// Command Center link registry — the single source of truth for the internal hub.
// Edit this list to add/remove anything; the page renders straight from it.
// Docs link to GitHub on `main` (always current, renders markdown); tools link to
// in-app routes; external links open elsewhere. Keep it curated, not exhaustive.

export type LinkKind = "tool" | "doc" | "folder" | "pdf" | "code" | "external";

export interface HubLink {
  label: string;
  href: string;
  note?: string;
  kind: LinkKind;
}

export interface HubSection {
  title: string;
  blurb?: string;
  links: HubLink[];
}

const REPO = "https://github.com/anthonycolmenaresanandres-lang/amma-fina-calle";
const blob = (p: string): string => `${REPO}/blob/main/${p}`;
const tree = (p: string): string => `${REPO}/tree/main/${p}`;

export const sections: HubSection[] = [
  {
    title: "Live tools",
    blurb: "Things you can open and use right now.",
    links: [
      { label: "Lead Arcade (Conquest)", href: "/lead-arcade", kind: "tool", note: "your live pipeline as a game" },
      { label: "Conquest demo", href: "/conquest", kind: "tool", note: "public-facing demo" },
      { label: "Penalty Shootout", href: "/penalty-shootout", kind: "tool", note: "branded mini-game" },
      { label: "Content Engine", href: "/content-engine", kind: "tool", note: "prompt systems, copy-to-clipboard" },
      { label: "Case Studies", href: "/case-studies", kind: "tool" },
      { label: "Systems overview", href: "/systems", kind: "tool" },
    ],
  },
  {
    title: "Business & strategy",
    blurb: "The plan and where everything starts.",
    links: [
      { label: "AMMA Ventures Business Plan", href: blob("BUSINESS/AMMA_VENTURES_BUSINESS_PLAN.md"), kind: "doc" },
      { label: "Project Portfolio Triage", href: blob("BUSINESS/PROJECT_PORTFOLIO_TRIAGE.md"), kind: "doc" },
      { label: "START HERE (orientation)", href: blob("START_HERE.md"), kind: "doc" },
      { label: "Master Handoff", href: blob("HANDOFF.md"), kind: "doc" },
      { label: "Project Memory (CLAUDE.md)", href: blob("CLAUDE.md"), kind: "doc" },
    ],
  },
  {
    title: "Growth & acquisition",
    blurb: "How AMMA gets and keeps clients.",
    links: [
      { label: "Client Acquisition Loop", href: blob("GROWTH/AMMA_CLIENT_ACQUISITION_LOOP.md"), kind: "doc" },
      { label: "Client Dossier System", href: blob("GROWTH/CLIENT_DOSSIER_SYSTEM.md"), kind: "doc" },
      { label: "Lead Arcade / Conquest Spec", href: blob("GROWTH/LEAD_ARCADE_CONQUEST_SPEC.md"), kind: "doc" },
      { label: "Lean Demo Mockup Factory", href: blob("GROWTH/LEAN_DEMO_MOCKUP_FACTORY.md"), kind: "doc" },
    ],
  },
  {
    title: "Product modules",
    blurb: "The reusable products on the Fina Calle OS engine.",
    links: [
      { label: "Module Library (index of 11)", href: blob("PRODUCT_MODULES/MODULE_LIBRARY.md"), kind: "doc" },
      { label: "AI Phone Assistant — plan", href: blob("PRODUCT_MODULES/AI_PHONE_ASSISTANT_PLAN.md"), kind: "doc", note: "BUILT v0.11" },
      { label: "Voice Gateway — service & README", href: blob("services/voice-gateway/README.md"), kind: "code", note: "the built bot" },
      { label: "AI Company Scheduler — concept", href: blob("PRODUCT_MODULES/AI_COMPANY_SCHEDULER_CONCEPT.md"), kind: "doc" },
      { label: "AI Company Scheduler — spec", href: blob("PRODUCT_MODULES/AI_COMPANY_SCHEDULER_SPEC.md"), kind: "doc" },
      { label: "Content Engine module", href: blob("PRODUCT_MODULES/FINA_CALLE_CONTENT_ENGINE.md"), kind: "doc" },
      { label: "PayBridge (payments)", href: blob("PRODUCT_MODULES/FINA_CALLE_PAYBRIDGE.md"), kind: "doc" },
      { label: "Web Studio Protocol", href: blob("PRODUCT_MODULES/FINA_CALLE_WEB_STUDIO_PROTOCOL.md"), kind: "doc" },
      { label: "Game Customization Protocol", href: blob("PRODUCT_MODULES/GAME_CUSTOMIZATION_PROTOCOL.md"), kind: "doc" },
    ],
  },
  {
    title: "Games",
    blurb: "The game-package catalog and the penalty build.",
    links: [
      { label: "Game Package Library", href: blob("GAME_LIBRARY/GAME_PACKAGE_LIBRARY.md"), kind: "doc" },
      { label: "Penalty Shootout — package", href: blob("GAME_LIBRARY/PENALTY_SHOOTOUT.md"), kind: "doc" },
      { label: "Penalty Shootout V2 — plan", href: blob("GAME_LIBRARY/PENALTY_SHOOTOUT_V2_PLAN.md"), kind: "doc" },
      { label: "Penalty Campaign Pack — status", href: blob("GAME_LIBRARY/PENALTY_SHOOTOUT_CAMPAIGN_PACK_STATUS.md"), kind: "doc" },
    ],
  },
  {
    title: "Assets, specs & prompts",
    blurb: "Art specs, the asset registry, characters, and prompt packs.",
    links: [
      { label: "Asset Specs", href: tree("ASSET_SPECS"), kind: "folder" },
      { label: "Asset Registry", href: tree("ASSET_REGISTRY"), kind: "folder" },
      { label: "Character Library", href: tree("CHARACTER_LIBRARY"), kind: "folder" },
      { label: "Prompt packs", href: tree("PROMPTS"), kind: "folder" },
      { label: "Skills (AI agent systems)", href: tree("SKILLS"), kind: "folder" },
      { label: "Storyboards & shot matrices", href: tree("STORYBOARDS"), kind: "folder" },
    ],
  },
  {
    title: "Sales & demo",
    blurb: "Everything for pitching and field work.",
    links: [
      { label: "Sales Demo Package", href: tree("SALES_DEMO_PACKAGE"), kind: "folder" },
      { label: "Demo URLs & Talk Track", href: blob("SALES_DEMO_PACKAGE/DEMO_URLS_AND_TALK_TRACK.md"), kind: "doc" },
      { label: "Sales Demo Script", href: blob("SALES_DEMO_PACKAGE/FINA_CALLE_SALES_DEMO_SCRIPT.md"), kind: "doc" },
      { label: "Restaurant Depot Flyer (PDF)", href: blob("SALES_DEMO_PACKAGE/restaurant-depot-flyer-letter.pdf"), kind: "pdf" },
      { label: "Colattanini Print Guide", href: blob("PRINT/colattanini/PRINT_GUIDE.md"), kind: "doc" },
    ],
  },
  {
    title: "Case study — Colattao",
    blurb: "The flagship client build.",
    links: [
      { label: "Colattao Subproject Map", href: blob("CASE_STUDIES/COLATTAO/COLATTAO_SUBPROJECT_MAP.md"), kind: "doc" },
      { label: "Colattao Docs", href: tree("CASE_STUDIES/COLATTAO/DOCS"), kind: "folder" },
    ],
  },
  {
    title: "Tech & architecture",
    blurb: "Infra, domains, handoffs, deployment.",
    links: [
      { label: "Project Code Atlas", href: "/command-center/code", kind: "tool", note: "every project: stack, state, move" },
      { label: "Tech Architecture", href: tree("TECH_ARCHITECTURE"), kind: "folder" },
      { label: "Infrastructure Plan", href: blob("TECH_ARCHITECTURE/FINA_CALLE_OS_INFRASTRUCTURE_PLAN.md"), kind: "doc" },
      { label: "Domain Operations (finacalleos.com)", href: blob("TECH_ARCHITECTURE/FINACALLEOS_DOMAIN_OPERATIONS.md"), kind: "doc" },
      { label: "Handoffs", href: tree("HANDOFFS"), kind: "folder" },
      { label: "Local Code Inventory", href: blob("HANDOFFS/LOCAL_CODE_INVENTORY.md"), kind: "doc" },
    ],
  },
  {
    title: "External",
    blurb: "Off-repo destinations.",
    links: [
      { label: "finacalleos.com (live site)", href: "https://finacalleos.com", kind: "external" },
      { label: "GitHub — this repo", href: REPO, kind: "external" },
      { label: "GitHub — all my repos", href: "https://github.com/anthonycolmenaresanandres-lang?tab=repositories", kind: "external", note: "colattao-cafe-rush, VBFH, etc." },
      { label: "Vercel — deployments", href: "https://vercel.com/anthonycolmenaresanandres-8844s-projects/amma-fina-calle", kind: "external" },
      { label: "Instagram — @fina_calle", href: "https://www.instagram.com/fina_calle", kind: "external" },
    ],
  },
];
