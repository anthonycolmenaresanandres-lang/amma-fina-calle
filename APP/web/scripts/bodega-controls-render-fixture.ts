import { readFileSync } from "node:fs";
import ts from "typescript";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { menuControlAttributes } from "../src/venue-menu/menu-controls";
import * as source from "../src/app/(internal)/demo/bodega/menu-draft";
import { projectBodegaMenu, type BodegaMenuState } from "../src/lib/bodega-controls/overlay";
import { BODEGA_MANIFEST } from "../src/lib/bodega-controls/catalog";
import { BODEGA_FIXTURE_COMMIT } from "../src/lib/bodega-controls/fixtures";

// Execute actual leaf renderers with CSS/image transport replaced, not menu logic.
function load(file: string, dependencies: Record<string,unknown>) {
  const css = new Proxy({}, { get: (_target,key) => key === "__esModule" ? false : String(key) });
  const image = (props: { src: string; alt: string; width?: number; height?: number; sizes?: string }) => React.createElement("img", { src: props.src, alt: props.alt, width: props.width, height: props.height, sizes: props.sizes });
  const code = ts.transpileModule(readFileSync(new URL(file,import.meta.url),"utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  const testModule = { exports: {} as Record<string,React.ComponentType<Record<string,unknown>>> };
  const mocks = { "react/jsx-runtime": jsxRuntime, "next/image": image, "./menu-draft": source, "./menu-controls": { menuControlAttributes }, "@/venue-menu/menu-controls": { menuControlAttributes }, ...dependencies };
  new Function("require","module","exports",code)((name: string) => { if (name.endsWith(".module.css")) return css; if (!(name in mocks)) throw new Error(`Unexpected renderer dependency: ${name}`); return mocks[name as keyof typeof mocks]; },testModule,testModule.exports);
  return testModule.exports;
}
const { VenueMenuSection } = load("../src/venue-menu/VenueMenuSection.tsx",{});
const { VenueMenuLayout } = load("../src/venue-menu/VenueMenuLayout.tsx",{});
const { FallSessions } = load("../src/app/(internal)/demo/bodega/fall-sessions.tsx",{});
const { BodegaMenuItems } = load("../src/app/(internal)/demo/bodega/bodega-menu-items.tsx",{ "@/venue-menu/VenueMenuSection": { VenueMenuSection } });
export function renderBodegaControlFixture(state: BodegaMenuState): string {
  const menu = projectBodegaMenu(state);
  const markup = React.createElement(VenueMenuLayout, {
    brandName: "Bodega Cafe",brand: null,nav: null,
    featured: React.createElement(FallSessions,{ drinks: menu.seasonal }),
    menu: React.createElement(BodegaMenuItems,{ menu }),game: null,visit: null,engagement: null,footer: null,
    skipHref: "#bodega-classics",skipLabel: "Skip to menu prices",
    readback: menu.state.mode === "off" ? undefined : { source: "bodega-controls-v1",mode: menu.state.mode,manifest: BODEGA_MANIFEST.hash,version: menu.state.snapshot?.snapshot_version,deploymentCommit: BODEGA_FIXTURE_COMMIT },
  });
  return `<!doctype html><html><body>${renderToStaticMarkup(markup)}</body></html>`;
}
