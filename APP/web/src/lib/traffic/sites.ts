// Verified production, customer-facing sites only. The shared AMMA project
// serves more than one brand, so hostname AND public path scope are required.
export type TrafficSite = {
  id: "bodega" | "fina-calle" | "colattao";
  name: string;
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
    projectId: "prj_Y9350Up2cl8sLjYBCZ05lM2lZ0E4",
    analyticsUrl: "https://vercel.com/anthonycolmenaresanandres-8844s-projects/amma-fina-calle/analytics",
    domains: ["bodegacafe757.com", "www.bodegacafe757.com"],
    publicPaths: ["/", "/demo/bodega", "/bodega-sessions-review", "/bodega-vibra-rules"],
    publicPathPrefixes: [],
    importantPaths: ["/demo/bodega", "/bodega-sessions-review"],
  },
  {
    id: "fina-calle",
    name: "Fina Calle OS",
    projectId: "prj_Y9350Up2cl8sLjYBCZ05lM2lZ0E4",
    analyticsUrl: "https://vercel.com/anthonycolmenaresanandres-8844s-projects/amma-fina-calle/analytics",
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
    analyticsUrl: "https://vercel.com/anthonycolmenaresanandres-8844s-projects/colattao-cafe-rush/analytics",
    // Current READY production deployment's stable public alias (2026-10-01).
    // No custom Colattao hostname was present in its production aliases.
    domains: ["colattao-cafe-rush.vercel.app"],
    publicPaths: ["/", "/menu", "/penalty", "/market", "/get-started"],
    publicPathPrefixes: [],
    importantPaths: ["/menu", "/penalty", "/market"],
  },
] as const;

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
