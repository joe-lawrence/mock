/**
 * Authoritative lexical atoms for German cardinals 0–99.
 * Pedagogical guides/IPA live outside this layer.
 */

export const DATA_VERSION = "0.1.0";

/** Standalone 0–12 (eins, not ein). */
export const ATOMIC = Object.freeze([
  "null",
  "eins",
  "zwei",
  "drei",
  "vier",
  "fünf",
  "sechs",
  "sieben",
  "acht",
  "neun",
  "zehn",
  "elf",
  "zwölf",
]);

/**
 * Ones used inside compounds (21–99): eins → ein.
 * Index = digit 1–9.
 */
export const COMPOUND_ONES = Object.freeze({
  1: "ein",
  2: "zwei",
  3: "drei",
  4: "vier",
  5: "fünf",
  6: "sechs",
  7: "sieben",
  8: "acht",
  9: "neun",
});

/** Teen prefixes 13–19 (sechs→sech, sieben→sieb). */
export const TEEN_PREFIX = Object.freeze({
  13: "drei",
  14: "vier",
  15: "fünf",
  16: "sech",
  17: "sieb",
  18: "acht",
  19: "neun",
});

/** Tens words keyed by tens digit 2–9. */
export const TENS = Object.freeze({
  2: "zwanzig",
  3: "dreißig",
  4: "vierzig",
  5: "fünfzig",
  6: "sechzig",
  7: "siebzig",
  8: "achtzig",
  9: "neunzig",
});

/**
 * Morph split of tens words for pedagogy (stem + ending).
 * dreißig uses ßig; others use zig.
 */
export const TENS_MORPH = Object.freeze({
  2: Object.freeze(["zwan", "zig"]),
  3: Object.freeze(["drei", "ßig"]),
  4: Object.freeze(["vier", "zig"]),
  5: Object.freeze(["fünf", "zig"]),
  6: Object.freeze(["sech", "zig"]),
  7: Object.freeze(["sieb", "zig"]),
  8: Object.freeze(["acht", "zig"]),
  9: Object.freeze(["neun", "zig"]),
});
