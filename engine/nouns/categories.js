/**
 * Gender Shortcuts — Categories & Associations (curriculum data).
 * Association is a soft gender shortcut, never a lexical override.
 * Practice modes: Gender Recognition → Article Application → Gender Imposter → Sentence Validation.
 * See spec Appendix G.
 */

import { LEXICON } from "./data.js";
import { ARTICLES } from "./data.js";

/** @typedef {"masculine"|"feminine"|"neuter"|"mixed"|"none"} CategoryAssociation */
/** @typedef {"very_strong"|"strong"|"moderate"|"weak"} CategoryStrength */

/**
 * @typedef {object} GenderCategory
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {CategoryAssociation} association
 * @property {CategoryStrength} strength
 * @property {string} [applyNounLabel]
 * @property {string[]} [conditions]
 * @property {string[]} memberLexemeIds
 * @property {string[]} [teachingMemberIds]
 * @property {string[]} [transferMemberIds]
 * @property {string[]} [exceptionLexemeIds]
 * @property {boolean} [chartOnly]
 * @property {string} [chartNote]
 */

/** @type {readonly GenderCategory[]} */
export const GENDER_CATEGORIES = Object.freeze([
  // —— Masculine ——
  Object.freeze({
    id: "weekdays",
    name: "Weekdays",
    description: "Names of the days of the week.",
    association: "masculine",
    strength: "very_strong",
    applyNounLabel: "weekday",
    memberLexemeIds: Object.freeze([
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "Freitag",
      "Samstag",
      "Sonntag",
    ]),
    teachingMemberIds: Object.freeze(["Montag", "Mittwoch", "Freitag"]),
    transferMemberIds: Object.freeze(["Dienstag", "Donnerstag"]),
    chartNote: "tend masculine (der Montag) — very strong cue",
  }),
  Object.freeze({
    id: "months",
    name: "Months",
    description: "Names of the months.",
    association: "masculine",
    strength: "very_strong",
    applyNounLabel: "month",
    memberLexemeIds: Object.freeze([
      "Januar",
      "Februar",
      "März",
      "April",
      "Mai",
      "Juni",
      "Juli",
      "August",
      "September",
      "Oktober",
      "November",
      "Dezember",
    ]),
    teachingMemberIds: Object.freeze(["Januar", "März", "August"]),
    transferMemberIds: Object.freeze(["Februar", "September"]),
    chartNote: "tend masculine (der Januar) — very strong cue",
  }),
  Object.freeze({
    id: "seasons",
    name: "Seasons",
    description: "The four seasons.",
    association: "masculine",
    strength: "very_strong",
    applyNounLabel: "season",
    memberLexemeIds: Object.freeze([
      "Frühling",
      "Sommer",
      "Herbst",
      "Winter",
    ]),
    teachingMemberIds: Object.freeze(["Sommer", "Winter"]),
    transferMemberIds: Object.freeze(["Frühling", "Herbst"]),
    chartNote: "tend masculine (der Sommer) — very strong cue",
  }),
  Object.freeze({
    id: "directions",
    name: "Cardinal directions",
    description: "Norden, Süden, Osten, Westen as nouns.",
    association: "masculine",
    strength: "strong",
    applyNounLabel: "cardinal direction",
    memberLexemeIds: Object.freeze(["Norden", "Süden", "Osten", "Westen"]),
    teachingMemberIds: Object.freeze(["Norden", "Süden"]),
    transferMemberIds: Object.freeze(["Osten", "Westen"]),
    chartNote: "tend masculine (der Norden) — strong cue",
  }),
  Object.freeze({
    id: "weather",
    name: "Weather nouns",
    description: "Common precipitation and air nouns (Regen, Schnee, Wind, …).",
    association: "masculine",
    strength: "moderate",
    applyNounLabel: "weather noun",
    memberLexemeIds: Object.freeze(["Regen", "Schnee", "Wind", "Nebel", "Hagel"]),
    teachingMemberIds: Object.freeze(["Regen", "Wind"]),
    transferMemberIds: Object.freeze(["Schnee", "Nebel"]),
    chartNote: "often masculine (der Regen) — useful but not exception-free",
  }),
  Object.freeze({
    id: "occupations",
    name: "Occupations (unmarked)",
    description:
      "Unmarked occupation nouns (Arzt, Lehrer, …) — masculine association; feminine -in forms are a separate cue.",
    association: "masculine",
    strength: "strong",
    applyNounLabel: "occupation",
    memberLexemeIds: Object.freeze(["Arzt", "Lehrer", "Schüler", "Koch"]),
    teachingMemberIds: Object.freeze(["Arzt", "Lehrer"]),
    transferMemberIds: Object.freeze(["Schüler", "Koch"]),
    chartNote: "unmarked occupation forms tend masculine (der Arzt) — -in is separate",
  }),

  // —— Feminine ——
  Object.freeze({
    id: "rivers",
    name: "Rivers (German-speaking areas)",
    description:
      "Many river names in German-speaking Europe — soft feminine tendency; known masculine exceptions (Rhein, Main, …).",
    association: "feminine",
    strength: "moderate",
    applyNounLabel: "river",
    memberLexemeIds: Object.freeze([
      "Elbe",
      "Donau",
      "Oder",
      "Mosel",
      "Spree",
      "Rhein",
      "Main",
    ]),
    teachingMemberIds: Object.freeze(["Elbe", "Donau"]),
    transferMemberIds: Object.freeze(["Oder", "Mosel", "Spree"]),
    exceptionLexemeIds: Object.freeze(["Rhein", "Main"]),
    chartNote: "often feminine (die Elbe) — exceptions: der Rhein, der Main, …",
  }),
  Object.freeze({
    id: "flowers",
    name: "Flower names",
    description: "Many flower names — soft feminine tendency.",
    association: "feminine",
    strength: "moderate",
    applyNounLabel: "flower",
    memberLexemeIds: Object.freeze([
      "Rose",
      "Tulpe",
      "Lilie",
      "Nelke",
      "Narzisse",
    ]),
    teachingMemberIds: Object.freeze(["Rose", "Tulpe"]),
    transferMemberIds: Object.freeze(["Lilie", "Nelke", "Narzisse"]),
    chartNote: "often feminine (die Rose) — moderate cue",
  }),

  // —— Neuter ——
  Object.freeze({
    id: "metals",
    name: "Metals / elements",
    description: "Chemical element and metal names used as nouns.",
    association: "neuter",
    strength: "strong",
    applyNounLabel: "metal / element",
    memberLexemeIds: Object.freeze([
      "Gold",
      "Silber",
      "Eisen",
      "Kupfer",
      "Blei",
      "Zinn",
    ]),
    teachingMemberIds: Object.freeze(["Gold", "Eisen"]),
    transferMemberIds: Object.freeze(["Silber", "Kupfer", "Blei", "Zinn"]),
    chartNote: "tend neuter (das Gold) — strong cue",
  }),
  Object.freeze({
    id: "venues",
    name: "Hotels / cafés / cinemas",
    description: "Common establishment loanwords (Hotel, Café, Kino, …).",
    association: "neuter",
    strength: "strong",
    applyNounLabel: "venue / establishment",
    memberLexemeIds: Object.freeze([
      "Hotel",
      "Café",
      "Restaurant",
      "Kino",
      "Museum",
    ]),
    teachingMemberIds: Object.freeze(["Hotel", "Kino"]),
    transferMemberIds: Object.freeze(["Café", "Restaurant", "Museum"]),
    chartNote: "tend neuter (das Hotel, das Kino) — strong cue for these loans",
  }),

  // —— Chart notes (no gender-discrimination practice) ——
  Object.freeze({
    id: "people",
    name: "People / occupations (broad)",
    description:
      "The broad category “person / job” alone does not predict grammatical gender — natural gender and form cues matter separately.",
    association: "none",
    strength: "weak",
    chartOnly: true,
    chartNote: "too broad — no useful gender shortcut from the category alone",
  }),
  Object.freeze({
    id: "no-cue",
    name: "No useful category cue",
    description:
      "When no reliable semantic (or morphological) shortcut applies, do not invent a rule.",
    association: "none",
    strength: "weak",
    chartOnly: true,
    chartNote: "Insufficient information → learn the lexical fact",
  }),
  Object.freeze({
    id: "form-over-meaning",
    name: "Form over meaning",
    description:
      "Semantic “young person” does not set gender when a strong form cue (e.g. -chen) applies — das Mädchen is neuter by form.",
    association: "none",
    strength: "weak",
    memberLexemeIds: Object.freeze([]),
    chartOnly: true,
    chartNote: "das Mädchen is neuter by -chen, not by meaning — not a semantic category drill",
  }),
]);

export function getGenderCategory(id) {
  return GENDER_CATEGORIES.find((c) => c.id === id) || null;
}

/**
 * Playable Categories practice: member-backed with a concrete gender association.
 */
export function practiceCategories() {
  return GENDER_CATEGORIES.filter(
    (c) =>
      !c.chartOnly &&
      (c.association === "masculine" ||
        c.association === "feminine" ||
        c.association === "neuter") &&
      (c.memberLexemeIds || []).filter((id) => !!LEXICON[id]).length >= 2
  );
}

export function categoryMembers(categoryId) {
  const c = getGenderCategory(categoryId);
  if (!c) return [];
  return (c.memberLexemeIds || []).filter((id) => !!LEXICON[id]);
}

export function categoryTeachingMembers(categoryId) {
  const c = getGenderCategory(categoryId);
  if (!c) return [];
  const teaching = (c.teachingMemberIds || []).filter((id) => !!LEXICON[id]);
  if (teaching.length >= 2) return teaching;
  return categoryMembers(categoryId);
}

export function categoryTransferMembers(categoryId) {
  const c = getGenderCategory(categoryId);
  if (!c) return categoryMembers(categoryId);
  const transfer = c.transferMemberIds || [];
  const pool = transfer.length ? transfer : c.memberLexemeIds || [];
  return pool.filter((id) => !!LEXICON[id]);
}

/** Members whose lexical gender matches the category association (excludes exceptions). */
export function categoryMatchingMembers(categoryId) {
  const c = getGenderCategory(categoryId);
  if (!c || !c.association || c.association === "none" || c.association === "mixed") {
    return [];
  }
  const exceptions = new Set(c.exceptionLexemeIds || []);
  return categoryMembers(categoryId).filter(
    (id) => !exceptions.has(id) && LEXICON[id]?.gender === c.association
  );
}

export function definiteArticleForGender(gender) {
  return ARTICLES[gender] || null;
}

export function withDefiniteArticle(lemma) {
  const gender = LEXICON[lemma]?.gender;
  const art = definiteArticleForGender(gender);
  return art ? `${art} ${lemma}` : lemma;
}

/** Learner-facing association label for choices / feedback. */
export function associationChoiceLabel(association) {
  switch (association) {
    case "masculine":
      return "Masculine";
    case "feminine":
      return "Feminine";
    case "neuter":
      return "Neuter";
    case "mixed":
    case "none":
      return "No useful gender association";
    default:
      return String(association);
  }
}

/** Gender Recognition choices (no “none” — practice categories always have a gender). */
export const CATEGORY_GENDER_CHOICES = Object.freeze([
  "masculine",
  "feminine",
  "neuter",
]);

export const CATEGORY_ASSOCIATION_CHOICES = Object.freeze([
  "masculine",
  "feminine",
  "neuter",
  "none",
]);
