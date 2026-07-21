"use client";

import { useEffect } from "react";

/**
 * BrandEasterEgg — the console note for anyone poking around the source.
 *
 * This is a STATEMENT, not an instruction to anything. It doesn't touch a
 * visitor's tools, doesn't override anyone's AI, and isn't hidden from humans
 * (open DevTools and it's right there). It's the "you can copy us, but…" bit
 * aimed squarely at the person copying the code. Mounted in the root layout so
 * every page carries it.
 */
export default function BrandEasterEgg() {
  useEffect(() => {
    const title =
      "font:700 15px/1.4 Georgia,serif;color:#c8aa72;padding:6px 0";
    const line = "font:400 12px/1.6 monospace;color:#9da5aa";
    console.log(
      "%cYou can copy Fina Calle.%c\nYou'll never be Fina Calle. 😉\n\nCopiando el código? Suerte con eso. — Built in Virginia Beach.\nLike what you see? finacalleos.com",
      title,
      line,
    );
  }, []);

  return null;
}
