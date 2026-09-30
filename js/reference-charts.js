/**
 * Build legacy chart objects from generated Reference units.
 * Chart karaoke UI keeps the same shape; content authority is Markdown.
 */

import {
  reference,
  referenceChartIndex,
  getReference,
} from "./generated/reference.js?v=20260930-ref1";

function unitForChart(territory, chartTab) {
  const id = referenceChartIndex[`${territory}:${chartTab}`];
  return id ? reference[id] : null;
}

function tabsFromTerritory(territory, tabOrder, labels) {
  return tabOrder.map((id) => {
    const unit = unitForChart(territory, id);
    return {
      id,
      label: labels[id] || unit?.title || id,
      blurb: unit?.summary || unit?.sections?.summary || "",
    };
  });
}

/** @returns {object} soundsChart-compatible object */
export function buildSoundsChart() {
  const tabOrder = ["vowels", "umlauts", "diphthongs", "consonants", "special"];
  const labels = {
    vowels: "Vowels",
    umlauts: "Umlauts",
    diphthongs: "Diphthongs",
    consonants: "Consonants",
    special: "Special",
  };
  const chart = {
    tabs: tabsFromTerritory("sounds", tabOrder, labels),
  };
  for (const id of tabOrder) {
    chart[id] = unitForChart("sounds", id)?.chart || [];
  }
  return chart;
}

/** @returns {object} numbersChart-compatible object */
export function buildNumbersChart() {
  const tabOrder = [
    "base",
    "teens",
    "tens",
    "compounds",
    "hundreds",
    "komma",
    "money",
    "fractions",
    "time",
    "dates",
    "measure",
    "ordinals",
  ];
  const labels = {
    base: "0–12",
    teens: "13–19",
    tens: "20–90",
    compounds: "21–99",
    hundreds: "100+",
    komma: "Komma",
    money: "Euro",
    fractions: "Fractions",
    time: "Time",
    dates: "Dates",
    measure: "Measure",
    ordinals: "Ordinals",
  };
  const chart = {
    tabs: tabsFromTerritory("numbers", tabOrder, labels),
  };
  for (const id of tabOrder) {
    chart[id] = unitForChart("numbers", id)?.chart || [];
  }
  return chart;
}

/** @returns {object} nounsChart-compatible object */
export function buildNounsChart() {
  const tabOrder = ["feminine", "masculine", "neuter", "categories", "plurals"];
  const labels = {
    feminine: "Feminine",
    masculine: "Masculine",
    neuter: "Neuter",
    categories: "Categories",
    plurals: "Plurals",
  };
  const chart = {
    tabs: tabsFromTerritory("nouns", tabOrder, labels),
  };
  for (const id of tabOrder) {
    chart[id] = unitForChart("nouns", id)?.chart || [];
  }
  return chart;
}

export { getReference, reference, referenceChartIndex };
