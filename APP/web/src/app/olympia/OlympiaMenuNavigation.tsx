"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./olympia.module.css";

// Keep the server-rendered menu and native disclosures; enhance only hash navigation.
export function OlympiaMenuNavigation({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    function openCategory(hash: string) {
      let id: string;
      try { id = decodeURIComponent(hash.slice(1)); } catch { return null; }
      const target = document.getElementById(id);
      if (!target || !root?.contains(target)) return null;
      const category = target.closest<HTMLDetailsElement>("details[data-menu-category]")
        ?? target.querySelector<HTMLDetailsElement>(":scope > details[data-menu-category]");
      if (!category) return null;
      category.open = true;
      return target;
    }

    function revealHash() {
      openCategory(window.location.hash)?.scrollIntoView({ block: "start" });
    }

    function openBeforeNavigation(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href^='#']") : null;
      if (!link || !root?.contains(link) || link.target === "_blank" || link.hasAttribute("download")) return;
      // Capture runs before the link's native anchor scroll, even for the current hash.
      openCategory(link.hash);
    }

    root.addEventListener("click", openBeforeNavigation, true);
    window.addEventListener("hashchange", revealHash);
    revealHash();
    return () => {
      root.removeEventListener("click", openBeforeNavigation, true);
      window.removeEventListener("hashchange", revealHash);
    };
  }, []);

  return <div className={styles.olympia} ref={rootRef}>{children}</div>;
}
