import { sections, type HubLink } from "./links";

export type PlaceId = "sales" | "clients" | "studio" | "product" | "infrastructure";
export interface Place {
  id: PlaceId;
  name: string;
  shortName: string;
  purpose: string;
  description: string;
  links: HubLink[];
  x: number;
  y: number;
  width: number;
  depth: number;
  height: number;
}
const section = (title: string) => sections.find((item) => item.title === title)?.links ?? [];
const tools = section("App destinations");
const tool = (href: string) => tools.filter((item) => item.href === href);
const modules = section("Product modules");

// Each original registry entry belongs to one place. The client ledger is an
// existing authenticated destination; this directory neither fetches nor grants access.
export const places: Place[] = [
  {
    id: "sales", name: "Sales", shortName: "Sales", purpose: "Start the next conversation",
    description: "Acquisition plans, field materials, and the tools for preparing a pitch.",
    links: [...tool("/lead-arcade"), ...tool("/conquest"), ...section("Growth & acquisition"), ...section("Sales & demo")],
    x: 55, y: 60, width: 155, depth: 115, height: 92,
  },
  {
    id: "clients", name: "Client Operations", shortName: "Client Ops", purpose: "Keep delivery moving",
    description: "Open the client ledger, review the company plan, and find client handoffs.",
    links: [{ label: "Client ledger", href: "/customers", kind: "tool", note: "Authenticated client and billing records; sign-in required" }, ...tool("/case-studies"), ...section("Business & strategy"), ...section("Case study — Colattao")],
    x: 315, y: 65, width: 175, depth: 115, height: 112,
  },
  {
    id: "studio", name: "Content Studio", shortName: "Content Studio", purpose: "Turn ideas into material",
    description: "The content engine, creative assets, prompts, and production references.",
    links: [...tool("/content-engine"), ...modules.filter((item) => item.label === "Content Engine module"), ...section("Assets, specs & prompts")],
    x: 50, y: 315, width: 155, depth: 110, height: 84,
  },
  {
    id: "product", name: "Product Lab", shortName: "Product Lab", purpose: "Build the next experience",
    description: "Reusable modules, voice systems, game packages, and product specifications.",
    links: [...tool("/penalty-shootout"), ...modules.filter((item) => item.label !== "Content Engine module"), ...section("Games")],
    x: 290, y: 310, width: 150, depth: 135, height: 90,
  },
  {
    id: "infrastructure", name: "Infrastructure", shortName: "Infrastructure", purpose: "Find the systems behind it",
    description: "The code atlas, architecture, domain runbooks, and external workspaces.",
    links: [...tool("/systems"), ...section("Tech & architecture"), ...section("External")],
    x: 485, y: 280, width: 70, depth: 150, height: 133,
  },
];

export const destinationCount = places.reduce((sum, place) => sum + place.links.length, 0);
