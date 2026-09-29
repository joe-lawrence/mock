/**
 * Deterministic German measurement amounts (number + unit).
 */

import { cardinalForm, constructionParts } from "./cardinal.js";

/**
 * @typedef {"Meter"|"Zentimeter"|"Kilometer"|"Gramm"|"Kilo"|"Kilogramm"|"Liter"|"Milliliter"|"Grad"|"Stundenkilometer"} MeasureUnit
 */

/** Unit metadata: singular label + whether 1 takes "ein". */
export const MEASURE_UNITS = Object.freeze({
  Meter: { singular: "Meter", plural: "Meter", ein: "ein", category: "length" },
  Zentimeter: {
    singular: "Zentimeter",
    plural: "Zentimeter",
    ein: "ein",
    category: "length",
  },
  Kilometer: {
    singular: "Kilometer",
    plural: "Kilometer",
    ein: "ein",
    category: "length",
  },
  Gramm: { singular: "Gramm", plural: "Gramm", ein: "ein", category: "weight" },
  Kilo: { singular: "Kilo", plural: "Kilo", ein: "ein", category: "weight" },
  Kilogramm: {
    singular: "Kilogramm",
    plural: "Kilogramm",
    ein: "ein",
    category: "weight",
  },
  Liter: { singular: "Liter", plural: "Liter", ein: "ein", category: "volume" },
  Milliliter: {
    singular: "Milliliter",
    plural: "Milliliter",
    ein: "ein",
    category: "volume",
  },
  Grad: { singular: "Grad", plural: "Grad", ein: "ein", category: "temp" },
  Stundenkilometer: {
    singular: "Stundenkilometer",
    plural: "Stundenkilometer",
    ein: "ein",
    category: "speed",
  },
});

const UNIT_ABBR = Object.freeze({
  Meter: "m",
  Zentimeter: "cm",
  Kilometer: "km",
  Gramm: "g",
  Kilo: "kg",
  Kilogramm: "kg",
  Liter: "l",
  Milliliter: "ml",
  Grad: "°C",
  Stundenkilometer: "km/h",
});

/**
 * @param {number} value — integer ≥ 1 (pools stay modest)
 * @param {MeasureUnit} unit
 */
export function measureAnalysis(value, unit) {
  if (!Number.isInteger(value) || value < 1 || value > 1000) {
    throw new RangeError(`measure value out of range: ${value}`);
  }
  const meta = MEASURE_UNITS[unit];
  if (!meta) throw new RangeError(`unknown measure unit: ${unit}`);

  const unitWord = value === 1 ? meta.singular : meta.plural;
  const numParts =
    value === 1 ? [meta.ein] : constructionParts(value > 1000 ? 1000 : value);
  // constructionParts max 1000 — already capped
  const numSpoken = value === 1 ? meta.ein : cardinalForm(value);
  const parts = [...numParts, unitWord];
  const abbr = UNIT_ABBR[unit] || unit;
  const written = `${value} ${abbr}`;

  return {
    value,
    unit,
    category: meta.category,
    kind: "measure",
    form: `${numSpoken} ${unitWord}`,
    written,
    englishWritten: written,
    segments: {
      construction: parts,
      spoken: [numSpoken, unitWord],
    },
    rules: [`measure.${unit}`, `measure.value.${value}`],
  };
}

export function measureForm(value, unit) {
  return measureAnalysis(value, unit).form;
}

export function measureParts(value, unit) {
  return [...measureAnalysis(value, unit).segments.construction];
}
