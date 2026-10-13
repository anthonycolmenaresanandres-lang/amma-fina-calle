/** Olympia Counter: original path geometry drawn for Olympia's display titles.
 * No font outlines, Maracaibo assets or third-party glyph data are used.
 * Coordinates use an 80-unit em; generous counters survive small phone headings.
 */
export const olympiaGlyphs: Record<string, { advance: number; path: string }> = {
  A: { advance: 54, path: "M9 64 22 13Q26 6 30 13L45 64M15 44 39 42" },
  B: { advance: 52, path: "M12 64V12H28Q43 12 42 26T27 35H12M27 35Q46 34 44 50T27 64H12" },
  C: { advance: 52, path: "M44 17Q34 8 24 11 8 14 8 37 8 63 26 65 36 67 45 56" },
  D: { advance: 54, path: "M11 12 25 11Q46 11 46 37T25 64H11Z" },
  E: { advance: 46, path: "M39 12 11 14V63H40M12 37H34" },
  F: { advance: 44, path: "M11 64V13L38 11M12 37H33" },
  G: { advance: 55, path: "M44 18Q34 8 24 11 8 14 8 37 8 64 28 65 44 65 46 54V40H31" },
  H: { advance: 54, path: "M10 12V64M44 10V64M10 38 44 35" },
  I: { advance: 30, path: "M7 12H22M15 12V64M7 64H23" },
  J: { advance: 44, path: "M35 12V49Q35 67 20 65 7 64 7 54" },
  K: { advance: 54, path: "M11 12V64M45 12 13 38 47 64" },
  L: { advance: 46, path: "M11 12V63H39" },
  M: { advance: 66, path: "M10 64 12 12 32 42 53 10 57 64" },
  N: { advance: 57, path: "M10 64V12L47 63V11" },
  O: { advance: 57, path: "M27 10Q9 10 9 36 9 65 28 65 49 65 48 37 47 10 27 10Z" },
  P: { advance: 51, path: "M11 64V12H27Q44 12 44 27T27 42H12" },
  Q: { advance: 59, path: "M27 10Q9 10 9 36 9 65 28 65 49 65 48 37 47 10 27 10ZM31 53 51 70" },
  R: { advance: 55, path: "M11 64V12H27Q44 12 44 27T27 42H12M27 42 48 65" },
  S: { advance: 50, path: "M42 17Q31 7 21 12 4 19 11 31 16 37 30 39 46 42 42 55 37 70 10 60" },
  T: { advance: 51, path: "M7 13 44 11M26 13 24 64" },
  U: { advance: 57, path: "M10 12V43Q10 65 28 65T47 43V11" },
  V: { advance: 53, path: "M8 12 23 61Q26 69 29 61L46 11" },
  W: { advance: 75, path: "M8 12 17 64 36 38 54 64 66 12" },
  X: { advance: 53, path: "M9 12 45 64M44 11 9 64" },
  Y: { advance: 52, path: "M8 12 26 38 44 11M26 38V64" },
  Z: { advance: 51, path: "M9 13 43 11 9 64H45" },
  ".": { advance: 20, path: "M10 64h.1" },
};

export function letteringWords(text: string) {
  return text.trim().toUpperCase().split(/\s+/).map(word => {
    let width = 0;
    const glyphs = [...word].map(character => {
      const glyph = olympiaGlyphs[character];
      if (!glyph) throw new Error(`Olympia lettering has no glyph for ${character}`);
      const placed = { ...glyph, x: width };
      width += glyph.advance;
      return placed;
    });
    return { word, width, glyphs };
  });
}
