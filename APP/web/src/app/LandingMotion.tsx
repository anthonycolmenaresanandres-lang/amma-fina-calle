"use client";

import { useEffect } from "react";

const motionTargets = "[data-motion-reveal], [data-motion-plate]";

export function LandingMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-motion-root]");

    if (!root) {
      return;
    }

    const targets = Array.from(root.querySelectorAll<HTMLElement>(motionTargets));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      root.dataset.motion = "static";
      targets.forEach((target) => {
        target.dataset.motionState = "visible";
      });

      return () => {
        delete root.dataset.motion;
        targets.forEach((target) => delete target.dataset.motionState);
      };
    }

    root.dataset.motion = "ready";

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const target = entry.target as HTMLElement;
          target.dataset.motionState = "visible";
          observer.unobserve(target);
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.14,
      },
    );

    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
      delete root.dataset.motion;
      targets.forEach((target) => delete target.dataset.motionState);
    };
  }, []);

  return null;
}
