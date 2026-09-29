/**
 * Authored Category practice items — Article Application & Sentence Validation.
 * Engine never invents surface forms; every blank/sentence is authored here.
 */

import { practiceCategories } from "./categories.js";

/**
 * @typedef {object} CategoryArticleItem
 * @property {string} id
 * @property {string} categoryId
 * @property {string} lemma
 * @property {"definite"|"indefinite"} articleKind
 * @property {string} before
 * @property {string} after
 * @property {string[]} choices
 * @property {string} correct
 */

/**
 * @typedef {object} CategoryValidationItem
 * @property {string} id
 * @property {string} categoryId
 * @property {string} lemma
 * @property {string} sentence
 * @property {boolean} correct
 */

/** @type {readonly CategoryArticleItem[]} */
export const CATEGORY_ARTICLE_ITEMS = Object.freeze([
  // weekdays
  Object.freeze({
    id: "art.weekdays.dienstag.def",
    categoryId: "weekdays",
    lemma: "Dienstag",
    articleKind: "definite",
    before: "",
    after: " Dienstag ist ein Wochentag.",
    choices: Object.freeze(["der", "die", "das"]),
    correct: "der",
  }),
  Object.freeze({
    id: "art.weekdays.donnerstag.def",
    categoryId: "weekdays",
    lemma: "Donnerstag",
    articleKind: "definite",
    before: "",
    after: " Donnerstag kommt nach dem Mittwoch.",
    choices: Object.freeze(["der", "die", "das"]),
    correct: "der",
  }),
  Object.freeze({
    id: "art.weekdays.montag.indef",
    categoryId: "weekdays",
    lemma: "Montag",
    articleKind: "indefinite",
    before: "Das ist ",
    after: " Montag.",
    choices: Object.freeze(["ein", "eine"]),
    correct: "ein",
  }),

  // months
  Object.freeze({
    id: "art.months.februar.def",
    categoryId: "months",
    lemma: "Februar",
    articleKind: "definite",
    before: "",
    after: " Februar ist kurz.",
    choices: Object.freeze(["der", "die", "das"]),
    correct: "der",
  }),
  Object.freeze({
    id: "art.months.september.def",
    categoryId: "months",
    lemma: "September",
    articleKind: "definite",
    before: "",
    after: " September ist ein Herbstmonat.",
    choices: Object.freeze(["der", "die", "das"]),
    correct: "der",
  }),
  Object.freeze({
    id: "art.months.maerz.indef",
    categoryId: "months",
    lemma: "März",
    articleKind: "indefinite",
    before: "Das ist ",
    after: " März.",
    choices: Object.freeze(["ein", "eine"]),
    correct: "ein",
  }),

  // seasons
  Object.freeze({
    id: "art.seasons.herbst.def",
    categoryId: "seasons",
    lemma: "Herbst",
    articleKind: "definite",
    before: "",
    after: " Herbst ist eine Jahreszeit.",
    choices: Object.freeze(["der", "die", "das"]),
    correct: "der",
  }),
  Object.freeze({
    id: "art.seasons.fruehling.def",
    categoryId: "seasons",
    lemma: "Frühling",
    articleKind: "definite",
    before: "",
    after: " Frühling bringt warme Tage.",
    choices: Object.freeze(["der", "die", "das"]),
    correct: "der",
  }),
  Object.freeze({
    id: "art.seasons.sommer.indef",
    categoryId: "seasons",
    lemma: "Sommer",
    articleKind: "indefinite",
    before: "Das ist ",
    after: " Sommer.",
    choices: Object.freeze(["ein", "eine"]),
    correct: "ein",
  }),

  // directions
  Object.freeze({
    id: "art.directions.osten.def",
    categoryId: "directions",
    lemma: "Osten",
    articleKind: "definite",
    before: "",
    after: " Osten liegt vor uns.",
    choices: Object.freeze(["der", "die", "das"]),
    correct: "der",
  }),
  Object.freeze({
    id: "art.directions.westen.def",
    categoryId: "directions",
    lemma: "Westen",
    articleKind: "definite",
    before: "",
    after: " Westen liegt hinter den Bergen.",
    choices: Object.freeze(["der", "die", "das"]),
    correct: "der",
  }),
  Object.freeze({
    id: "art.directions.norden.indef",
    categoryId: "directions",
    lemma: "Norden",
    articleKind: "indefinite",
    before: "Das ist ",
    after: " Norden.",
    choices: Object.freeze(["ein", "eine"]),
    correct: "ein",
  }),

  // weather
  Object.freeze({
    id: "art.weather.schnee.def",
    categoryId: "weather",
    lemma: "Schnee",
    articleKind: "definite",
    before: "",
    after: " Schnee liegt auf dem Dach.",
    choices: Object.freeze(["der", "die", "das"]),
    correct: "der",
  }),
  Object.freeze({
    id: "art.weather.nebel.def",
    categoryId: "weather",
    lemma: "Nebel",
    articleKind: "definite",
    before: "",
    after: " Nebel macht die Straße unsicher.",
    choices: Object.freeze(["der", "die", "das"]),
    correct: "der",
  }),
  Object.freeze({
    id: "art.weather.regen.indef",
    categoryId: "weather",
    lemma: "Regen",
    articleKind: "indefinite",
    before: "Das ist ",
    after: " Regen.",
    choices: Object.freeze(["ein", "eine"]),
    correct: "ein",
  }),

  // occupations
  Object.freeze({
    id: "art.occupations.arzt.indef",
    categoryId: "occupations",
    lemma: "Arzt",
    articleKind: "indefinite",
    before: "Das ist ",
    after: " Arzt.",
    choices: Object.freeze(["ein", "eine"]),
    correct: "ein",
  }),
  Object.freeze({
    id: "art.occupations.schueler.indef",
    categoryId: "occupations",
    lemma: "Schüler",
    articleKind: "indefinite",
    before: "Das ist ",
    after: " Schüler.",
    choices: Object.freeze(["ein", "eine"]),
    correct: "ein",
  }),
  Object.freeze({
    id: "art.occupations.koch.def",
    categoryId: "occupations",
    lemma: "Koch",
    articleKind: "definite",
    before: "",
    after: " Koch arbeitet in der Küche.",
    choices: Object.freeze(["der", "die", "das"]),
    correct: "der",
  }),

  // rivers
  Object.freeze({
    id: "art.rivers.oder.def",
    categoryId: "rivers",
    lemma: "Oder",
    articleKind: "definite",
    before: "",
    after: " Oder fließt nach Norden.",
    choices: Object.freeze(["der", "die", "das"]),
    correct: "die",
  }),
  Object.freeze({
    id: "art.rivers.mosel.def",
    categoryId: "rivers",
    lemma: "Mosel",
    articleKind: "definite",
    before: "",
    after: " Mosel ist bekannt für Wein.",
    choices: Object.freeze(["der", "die", "das"]),
    correct: "die",
  }),
  Object.freeze({
    id: "art.rivers.elbe.indef",
    categoryId: "rivers",
    lemma: "Elbe",
    articleKind: "indefinite",
    before: "Das ist ",
    after: " Elbe.",
    choices: Object.freeze(["ein", "eine"]),
    correct: "eine",
  }),

  // flowers
  Object.freeze({
    id: "art.flowers.lilie.def",
    categoryId: "flowers",
    lemma: "Lilie",
    articleKind: "definite",
    before: "",
    after: " Lilie duftet stark.",
    choices: Object.freeze(["der", "die", "das"]),
    correct: "die",
  }),
  Object.freeze({
    id: "art.flowers.nelke.def",
    categoryId: "flowers",
    lemma: "Nelke",
    articleKind: "definite",
    before: "",
    after: " Nelke steht in der Vase.",
    choices: Object.freeze(["der", "die", "das"]),
    correct: "die",
  }),
  Object.freeze({
    id: "art.flowers.rose.indef",
    categoryId: "flowers",
    lemma: "Rose",
    articleKind: "indefinite",
    before: "Das ist ",
    after: " Rose.",
    choices: Object.freeze(["ein", "eine"]),
    correct: "eine",
  }),

  // metals
  Object.freeze({
    id: "art.metals.silber.def",
    categoryId: "metals",
    lemma: "Silber",
    articleKind: "definite",
    before: "",
    after: " Silber glänzt.",
    choices: Object.freeze(["der", "die", "das"]),
    correct: "das",
  }),
  Object.freeze({
    id: "art.metals.kupfer.def",
    categoryId: "metals",
    lemma: "Kupfer",
    articleKind: "definite",
    before: "",
    after: " Kupfer leitet Strom.",
    choices: Object.freeze(["der", "die", "das"]),
    correct: "das",
  }),
  Object.freeze({
    id: "art.metals.gold.indef",
    categoryId: "metals",
    lemma: "Gold",
    articleKind: "indefinite",
    before: "Das ist ",
    after: " Gold.",
    choices: Object.freeze(["ein", "eine"]),
    correct: "ein",
  }),

  // venues
  Object.freeze({
    id: "art.venues.cafe.def",
    categoryId: "venues",
    lemma: "Café",
    articleKind: "definite",
    before: "",
    after: " Café ist geöffnet.",
    choices: Object.freeze(["der", "die", "das"]),
    correct: "das",
  }),
  Object.freeze({
    id: "art.venues.museum.def",
    categoryId: "venues",
    lemma: "Museum",
    articleKind: "definite",
    before: "",
    after: " Museum schließt um sechs.",
    choices: Object.freeze(["der", "die", "das"]),
    correct: "das",
  }),
  Object.freeze({
    id: "art.venues.hotel.indef",
    categoryId: "venues",
    lemma: "Hotel",
    articleKind: "indefinite",
    before: "Das ist ",
    after: " Hotel.",
    choices: Object.freeze(["ein", "eine"]),
    correct: "ein",
  }),
]);

/** @type {readonly CategoryValidationItem[]} */
export const CATEGORY_VALIDATION_ITEMS = Object.freeze([
  // weekdays
  Object.freeze({
    id: "val.weekdays.dienstag.ok",
    categoryId: "weekdays",
    lemma: "Dienstag",
    sentence: "Der Dienstag ist ein Wochentag.",
    correct: true,
  }),
  Object.freeze({
    id: "val.weekdays.dienstag.bad",
    categoryId: "weekdays",
    lemma: "Dienstag",
    sentence: "Die Dienstag ist ein Wochentag.",
    correct: false,
  }),

  // months
  Object.freeze({
    id: "val.months.februar.ok",
    categoryId: "months",
    lemma: "Februar",
    sentence: "Der Februar ist kurz.",
    correct: true,
  }),
  Object.freeze({
    id: "val.months.februar.bad",
    categoryId: "months",
    lemma: "Februar",
    sentence: "Das Februar ist kurz.",
    correct: false,
  }),

  // seasons
  Object.freeze({
    id: "val.seasons.herbst.ok",
    categoryId: "seasons",
    lemma: "Herbst",
    sentence: "Der Herbst ist eine Jahreszeit.",
    correct: true,
  }),
  Object.freeze({
    id: "val.seasons.herbst.bad",
    categoryId: "seasons",
    lemma: "Herbst",
    sentence: "Ein Herbst ist eine Jahreszeit.",
    correct: false,
  }),

  // directions
  Object.freeze({
    id: "val.directions.osten.ok",
    categoryId: "directions",
    lemma: "Osten",
    sentence: "Der Osten liegt vor uns.",
    correct: true,
  }),
  Object.freeze({
    id: "val.directions.osten.bad",
    categoryId: "directions",
    lemma: "Osten",
    sentence: "Die Osten liegt vor uns.",
    correct: false,
  }),

  // weather
  Object.freeze({
    id: "val.weather.schnee.ok",
    categoryId: "weather",
    lemma: "Schnee",
    sentence: "Der Schnee liegt auf dem Dach.",
    correct: true,
  }),
  Object.freeze({
    id: "val.weather.schnee.bad",
    categoryId: "weather",
    lemma: "Schnee",
    sentence: "Das Schnee liegt auf dem Dach.",
    correct: false,
  }),

  // occupations
  Object.freeze({
    id: "val.occupations.arzt.ok",
    categoryId: "occupations",
    lemma: "Arzt",
    sentence: "Das ist ein Arzt.",
    correct: true,
  }),
  Object.freeze({
    id: "val.occupations.arzt.bad",
    categoryId: "occupations",
    lemma: "Arzt",
    sentence: "Das ist eine Arzt.",
    correct: false,
  }),

  // rivers
  Object.freeze({
    id: "val.rivers.oder.ok",
    categoryId: "rivers",
    lemma: "Oder",
    sentence: "Die Oder fließt nach Norden.",
    correct: true,
  }),
  Object.freeze({
    id: "val.rivers.oder.bad",
    categoryId: "rivers",
    lemma: "Oder",
    sentence: "Der Oder fließt nach Norden.",
    correct: false,
  }),

  // flowers
  Object.freeze({
    id: "val.flowers.lilie.ok",
    categoryId: "flowers",
    lemma: "Lilie",
    sentence: "Die Lilie duftet stark.",
    correct: true,
  }),
  Object.freeze({
    id: "val.flowers.lilie.bad",
    categoryId: "flowers",
    lemma: "Lilie",
    sentence: "Das Lilie duftet stark.",
    correct: false,
  }),

  // metals
  Object.freeze({
    id: "val.metals.silber.ok",
    categoryId: "metals",
    lemma: "Silber",
    sentence: "Das Silber glänzt.",
    correct: true,
  }),
  Object.freeze({
    id: "val.metals.silber.bad",
    categoryId: "metals",
    lemma: "Silber",
    sentence: "Der Silber glänzt.",
    correct: false,
  }),

  // venues
  Object.freeze({
    id: "val.venues.hotel.ok",
    categoryId: "venues",
    lemma: "Hotel",
    sentence: "Das ist ein Hotel.",
    correct: true,
  }),
  Object.freeze({
    id: "val.venues.hotel.bad",
    categoryId: "venues",
    lemma: "Hotel",
    sentence: "Das ist eine Hotel.",
    correct: false,
  }),
]);

export function getCategoryArticleItem(id) {
  return CATEGORY_ARTICLE_ITEMS.find((x) => x.id === id) || null;
}

export function getCategoryValidationItem(id) {
  return CATEGORY_VALIDATION_ITEMS.find((x) => x.id === id) || null;
}

export function categoryArticleItems() {
  const playable = new Set(practiceCategories().map((c) => c.id));
  return CATEGORY_ARTICLE_ITEMS.filter((x) => playable.has(x.categoryId));
}

export function categoryValidationItems() {
  const playable = new Set(practiceCategories().map((c) => c.id));
  return CATEGORY_VALIDATION_ITEMS.filter((x) => playable.has(x.categoryId));
}
