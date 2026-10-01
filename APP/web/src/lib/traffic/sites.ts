// Verified production, customer-facing sites only. The shared AMMA project
// serves more than one brand, so hostname AND public path scope are required.
export type TrafficSite = {
  id: "bodega" | "fina-calle" | "colattao";
  name: string;
  projectId: string;
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
    projectId: "prj_Y9350Up2cl8sLjYBCZ05lM2lZ0E4",
    domains: ["bodegacafe757.com", "www.bodegacafe757.com"],
    publicPaths: ["/", "/demo/bodega", "/bodega-sessions-review", "/bodega-vibra-rules"],
    publicPathPrefixes: [],
    importantPaths: ["/demo/bodega", "/bodega-sessions-review"],
  },
  {
    id: "fina-calle",
    name: "Fina Calle OS",
    projectId: "prj_Y9350Up2cl8sLjYBCZ05lM2lZ0E4",
    domains: ["finacalleos.com", "www.finacalleos.com"],
    // Marketing/editorial pages only. Hosted client menus, games, demos,
    // owner/customer portals and internal tools are deliberately not counted
    // as Fina Calle traffic merely because they share this hostname.
    publicPaths: [
      "/", "/for-restaurants", "/systems", "/contact", "/case-studies",
      "/case-studies/colattao", "/news", "/news/about",
    ],
    publicPathPrefixes: ["/news/"],
    importantPaths: ["/for-restaurants", "/contact", "/case-studies"],
  },
  {
    id: "colattao",
    name: "Colattao Coffee House",
    projectId: "prj_QQgDyof5KInoe8v8M02Q3iDuUWG9",
    // Current READY production deployment's stable public alias (2026-10-01).
    // No custom Colattao hostname was present in its production aliases.
    domains: ["colattao-cafe-rush.vercel.app"],
    publicPaths: ["/", "/menu", "/penalty", "/market", "/get-started"],
    publicPathPrefixes: [],
    importantPaths: ["/menu", "/penalty", "/market"],
  },
] as const;

const SAFE_PUBLIC_PATH = /^\/[A-Za-z0-9/_-]*$/;
const SAFE_HOST = /^[a-z0-9.-]+$/;

function quoted(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

/** A fail-closed OData filter: project + verified hostname + explicit public paths. */
export function siteFilter(site: TrafficSite): string {
  if (!site.projectId.startsWith("prj_") || !site.domains.length ||
      site.domains.some((host) => !SAFE_HOST.test(host)) ||
      [...site.publicPaths, ...site.publicPathPrefixes].some((path) => !SAFE_PUBLIC_PATH.test(path)) ||
      (!site.publicPaths.length && !site.publicPathPrefixes.length)) {
    throw new Error(`Invalid traffic site registry entry: ${site.id}`);
  }
  const hosts = site.domains.map((host) => `requestHostname eq ${quoted(host)}`).join(" or ");
  const paths = [
    ...site.publicPaths.map((path) => `requestPath eq ${quoted(path)}`),
    ...site.publicPathPrefixes.map((prefix) => `startswith(requestPath, ${quoted(prefix)})`),
  ].join(" or ");
  return `(${hosts}) and (${paths})`;
}

export function trafficSite(id: string): TrafficSite | undefined {
  return TRAFFIC_SITES.find((site) => site.id === id);
}

/** Strictly attribute a drain event; never treat an unknown host as a site. */
export function siteForPublicVisit(hostname: string, pathname: string): TrafficSite | undefined {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  const path = pathname.split(/[?#]/, 1)[0].replace(/\/$/, "") || "/";
  return TRAFFIC_SITES.find((site) =>
    site.domains.includes(host) &&
    (site.publicPaths.includes(path) || site.publicPathPrefixes.some((prefix) => path.startsWith(prefix)))
  );
}
