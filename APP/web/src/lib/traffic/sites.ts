import { sanitizePath } from "./sanitize";
// Verified public routes, including explicitly labeled concepts. Presence does
// not establish client approval, a contract, or active collection. The AMMA project
// serves more than one brand, so hostname AND public path scope are required.
export type TrafficSite = {
  id: string;
  name: string;
  kind: "customer-site" | "marketing" | "concept" | "public-experience";
  projectId: string;
  analyticsUrl: string;
  domains: readonly string[];
  publicPaths: readonly string[];
  publicPathPrefixes: readonly string[];
  importantPaths: readonly string[];
};

export const TRAFFIC_TEAM_ID = "team_MwMFazBLYzRGQnqRAJOPDPH3";

export const TRAFFIC_SITES: readonly TrafficSite[] = [
  {
    id: "bodega",
    name: "Bodega Cafe",
    kind: "customer-site",
    projectId: "prj_Y9350Up2cl8sLjYBCZ05lM2lZ0E4",
    analyticsUrl: "https://vercel.com/anthonycolmenaresanandres-8844s-projects/amma-fina-calle/analytics",
    domains: ["bodegacafe757.com", "www.bodegacafe757.com", "finacalleos.com", "www.finacalleos.com"],
    publicPaths: ["/", "/demo/bodega", "/bodega-sessions-review", "/bodega-vibra-rules"],
    publicPathPrefixes: [],
    importantPaths: ["/demo/bodega", "/bodega-sessions-review"],
  },
  {
    id: "fina-calle",
    name: "Fina Calle OS",
    kind: "marketing",
    projectId: "prj_Y9350Up2cl8sLjYBCZ05lM2lZ0E4",
    analyticsUrl: "https://vercel.com/anthonycolmenaresanandres-8844s-projects/amma-fina-calle/analytics",
    domains: ["finacalleos.com", "www.finacalleos.com"],
    // Marketing/editorial pages only. Hosted client menus, games, demos,
    // owner/customer portals and internal tools are deliberately not counted
    // as Fina Calle traffic merely because they share this hostname.
    publicPaths: [
      "/", "/for-restaurants", "/systems", "/contact", "/case-studies",
      "/case-studies/colattao", "/news", "/news/about",
      "/news/:article",
      "/content-engine", "/rd", "/research-and-development/paybridge", "/request-update", "/discover", "/band",
    ],
    publicPathPrefixes: [],
    importantPaths: ["/for-restaurants", "/contact", "/case-studies"],
  },
  {
    id: "colattao",
    name: "Colattao Coffee House",
    kind: "customer-site",
    projectId: "prj_QQgDyof5KInoe8v8M02Q3iDuUWG9",
    analyticsUrl: "https://vercel.com/anthonycolmenaresanandres-8844s-projects/colattao-cafe-rush/analytics",
    // Current READY production deployment's stable public alias (2026-10-01).
    // No custom Colattao hostname was present in its production aliases.
    domains: ["colattao-cafe-rush.vercel.app"],
    publicPaths: ["/", "/menu", "/penalty", "/market", "/get-started"],
    publicPathPrefixes: [],
    importantPaths: ["/menu", "/penalty", "/market"],
  },
] as const;

// Exact rendered routes verified against production 576c1ce. Redirect-only
// routes are omitted; count the destination once. No wildcard /demo or /m.
const hosted = (id: string, name: string, paths: string[]): TrafficSite => ({
  id, name, kind: "concept", projectId: TRAFFIC_SITES[0].projectId, analyticsUrl: TRAFFIC_SITES[0].analyticsUrl,
  domains: ["finacalleos.com", "www.finacalleos.com"],
  publicPaths: paths, publicPathPrefixes: [], importantPaths: paths.slice(0, 1),
});
export const HOSTED_TRAFFIC_SITES: readonly TrafficSite[] = [
  hosted("maracaibo", "Maracaibo", ["/play/maracaibo-street-football", "/table/maracaibo/:table"]),
  hosted("olympia", "Olympia", ["/olympia", "/olympia/play", "/demo/olympia-sandwich/index.html"]),
  hosted("project-seed", "Project Seed", ["/demo/project-seed", "/play/project-seed"]),
  hosted("vital-vibes", "Vital Vibes", ["/vital-vibes"]),
  hosted("scrambled", "Scrambled", ["/demo/scrambled"]),
  hosted("las-palmas", "Las Palmas", ["/demo/las-palmas", "/play/las-palmas", "/table/las-palmas-lynnhaven/:table"]),
  hosted("gran-patron", "Gran Patron", ["/demo/gran-patron", "/play/gran-patron"]),
  hosted("royal-chocolate", "Royal Chocolate", ["/royal-chocolate", "/royal-chocolate/play"]),
  hosted("aji-ichiban", "Aji Ichiban", ["/aji-ichiban", "/aji-ichiban/play"]),
  hosted("elsas-place", "Elsa's Place", ["/elsas-place", "/elsas-place/play"]),
  hosted("havana-58", "Havana 58", ["/havana-58", "/havana-58/play"]),
  hosted("burger-plus", "Burger Plus concept", ["/burger-plus.html", "/burger-plus-menu.html"]),
  hosted("pocket-cafe", "Pocket Cafe concept", ["/demo/pocket-cafe", "/demo/pocket-cafe/game/index.html"]),
  hosted("aj-gators", "A.J. Gator's guest portal concept", ["/demo/aj-gators"]),
  { ...hosted("fina-experiences", "Fina Calle public game concepts", ["/cafe-rush", "/conquest", "/penalty-shootout", "/table-duel"]), kind: "public-experience" },
];
export const ALL_TRAFFIC_SITES: readonly TrafficSite[] = [...TRAFFIC_SITES, ...HOSTED_TRAFFIC_SITES];

export function trafficSite(id: string): TrafficSite | undefined {
  return ALL_TRAFFIC_SITES.find((site) => site.id === id);
}

/** Strictly attribute a drain event; never treat an unknown host as a site. */
export function siteForPublicVisit(hostname: string, pathname: string): TrafficSite | undefined {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  const path = sanitizePath(pathname);
  if (!path) return undefined;
  const eligible = ALL_TRAFFIC_SITES.filter((site) => !(site.id === "bodega" &&
    ["finacalleos.com", "www.finacalleos.com"].includes(host) && path === "/"));
  return eligible.find((site) =>
    site.domains.includes(host) &&
    (site.publicPaths.includes(path) || site.publicPathPrefixes.some((prefix) => path.startsWith(prefix)))
  );
}
