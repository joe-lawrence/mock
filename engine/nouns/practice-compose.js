/**
 * Constrained Practice composer — Article Application & Sentence Validation.
 *
 * Pipeline: eligible category members → context template → surface forms
 * (engine articles) → validate → exercise item. Never invents forms.
 *
 * Contexts are a small beginner library; expand only when engine+curriculum
 * can supply every required form.
 */

import { LEXICON } from "./data.js";
import { articleForm, nounAnalysis } from "./noun.js";
import {
  practiceCategories,
  categoryMatchingMembers,
  getGenderCategory,
} from "./categories.js";
import {
  gateContextCompatibility,
} from "./context-compatibility.js";

/** Bump when pool membership / Phase B gates change (cache / deck fingerprint). */
export const COMPOSE_VERSION = "0.5.1";

export {
  CONTEXT_FAILURE,
  LEXEME_CONTEXT_RESTRICTIONS,
  resolveContextRestrictions,
  assessContextCompatibility,
  gateContextCompatibility,
  previewCompositionCandidate,
  recordComposeDiscard,
  getComposeDiscards,
  clearComposeDiscards,
  contextVerbFrame,
} from "./context-compatibility.js";

const GENDERS = Object.freeze(["masculine", "feminine", "neuter"]);

/**
 * @typedef {object} PracticeContext
 * @property {string} id
 * @property {string} label
 * @property {string[]} requires
 * @property {"definite"|"indefinite"} articleKind
 * @property {"nominative"|"accusative"|"dative"} case
 * @property {"singular"|"plural"} number
 * @property {string} before — text before the article blank (may be "")
 * @property {(nounForm: string) => string} after — text after the article
 * @property {(article: string, nounForm: string) => string} sentence
 */

/**
 * Concepts unlocked for Gender Shortcuts → Categories practice.
 * Accusative / plural / verb frames stay out until Articles & Case (and Plurals) teach them.
 * @type {readonly string[]}
 */
export const CATEGORIES_PRACTICE_CONCEPTS = Object.freeze([
  "nominative",
  "definite_article",
  "indefinite_article",
  "wo_ist",
  "hier_ist",
  "das_ist",
]);

/**
 * @typedef {object} ContextEligibility
 * @property {Iterable<string>} [concepts] — context eligible iff every `requires` tag is present
 * @property {Iterable<"nominative"|"accusative">} [cases]
 * @property {Iterable<"singular"|"plural">} [numbers]
 */

/**
 * Whether a practice context is eligible under the given curriculum gates.
 * @param {PracticeContext} ctx
 * @param {ContextEligibility} [opts]
 */
export function contextIsEligible(ctx, opts = {}) {
  if (!ctx) return false;
  if (opts.concepts) {
    const have = opts.concepts instanceof Set ? opts.concepts : new Set(opts.concepts);
    if (!ctx.requires.every((r) => have.has(r))) return false;
  }
  if (opts.cases) {
    const allowed = opts.cases instanceof Set ? opts.cases : new Set(opts.cases);
    if (!allowed.has(ctx.case)) return false;
  }
  if (opts.numbers) {
    const allowed = opts.numbers instanceof Set ? opts.numbers : new Set(opts.numbers);
    if (!allowed.has(ctx.number)) return false;
  }
  return true;
}

/**
 * Filter PRACTICE_CONTEXTS by case / number / required concepts.
 * @param {ContextEligibility} [opts]
 * @returns {readonly PracticeContext[]}
 */
export function eligiblePracticeContexts(opts = {}) {
  if (!opts.concepts && !opts.cases && !opts.numbers) {
    return PRACTICE_CONTEXTS;
  }
  return Object.freeze(PRACTICE_CONTEXTS.filter((ctx) => contextIsEligible(ctx, opts)));
}

/** @type {readonly PracticeContext[]} */
export const PRACTICE_CONTEXTS = Object.freeze([
  Object.freeze({
    id: "wo_ist_def",
    label: "Where is …?",
    requires: ["nominative", "definite_article", "wo_ist"],
    articleKind: "definite",
    case: "nominative",
    number: "singular",
    before: "Wo ist ",
    after: (n) => ` ${n}?`,
    sentence: (a, n) => `Wo ist ${a} ${n}?`,
  }),
  Object.freeze({
    id: "hier_ist_def",
    label: "Here is …",
    requires: ["nominative", "definite_article", "hier_ist"],
    articleKind: "definite",
    case: "nominative",
    number: "singular",
    before: "Hier ist ",
    after: (n) => ` ${n}.`,
    sentence: (a, n) => `Hier ist ${a} ${n}.`,
  }),
  Object.freeze({
    id: "das_ist_indef",
    label: "That is a …",
    requires: ["nominative", "indefinite_article", "das_ist"],
    articleKind: "indefinite",
    case: "nominative",
    number: "singular",
    before: "Das ist ",
    after: (n) => ` ${n}.`,
    sentence: (a, n) => `Das ist ${a} ${n}.`,
  }),
  Object.freeze({
    id: "das_ist_def",
    label: "That is the …",
    requires: ["nominative", "definite_article", "das_ist"],
    articleKind: "definite",
    case: "nominative",
    number: "singular",
    before: "Das ist ",
    after: (n) => ` ${n}.`,
    sentence: (a, n) => `Das ist ${a} ${n}.`,
  }),
  Object.freeze({
    id: "ich_sehe_acc_def",
    label: "I see …",
    requires: ["accusative", "definite_article", "verb.sehen"],
    articleKind: "definite",
    case: "accusative",
    number: "singular",
    before: "Ich sehe ",
    after: (n) => ` ${n}.`,
    sentence: (a, n) => `Ich sehe ${a} ${n}.`,
  }),
  Object.freeze({
    id: "ich_sehe_acc_indef",
    label: "I see a …",
    requires: ["accusative", "indefinite_article", "verb.sehen"],
    articleKind: "indefinite",
    case: "accusative",
    number: "singular",
    before: "Ich sehe ",
    after: (n) => ` ${n}.`,
    sentence: (a, n) => `Ich sehe ${a} ${n}.`,
  }),
  Object.freeze({
    id: "ich_habe_acc_def",
    label: "I have …",
    requires: ["accusative", "definite_article", "verb.haben"],
    articleKind: "definite",
    case: "accusative",
    number: "singular",
    before: "Ich habe ",
    after: (n) => ` ${n}.`,
    sentence: (a, n) => `Ich habe ${a} ${n}.`,
  }),
  Object.freeze({
    id: "ich_habe_acc_indef",
    label: "I have a …",
    requires: ["accusative", "indefinite_article", "verb.haben"],
    articleKind: "indefinite",
    case: "accusative",
    number: "singular",
    before: "Ich habe ",
    after: (n) => ` ${n}.`,
    sentence: (a, n) => `Ich habe ${a} ${n}.`,
  }),
  Object.freeze({
    id: "ich_mag_acc_def",
    label: "I like …",
    requires: ["accusative", "definite_article", "verb.mögen"],
    articleKind: "definite",
    case: "accusative",
    number: "singular",
    before: "Ich mag ",
    after: (n) => ` ${n}.`,
    sentence: (a, n) => `Ich mag ${a} ${n}.`,
  }),
  Object.freeze({
    id: "es_gibt_acc_indef",
    label: "There is …",
    requires: ["accusative", "indefinite_article", "es_gibt"],
    articleKind: "indefinite",
    case: "accusative",
    number: "singular",
    before: "Es gibt ",
    after: (n) => ` ${n}.`,
    sentence: (a, n) => `Es gibt ${a} ${n}.`,
  }),
  Object.freeze({
    id: "wo_sind_pl_def",
    label: "Where are …?",
    requires: ["nominative", "definite_article", "plural", "wo_sind"],
    articleKind: "definite",
    case: "nominative",
    number: "plural",
    before: "Wo sind ",
    after: (n) => ` ${n}?`,
    sentence: (a, n) => `Wo sind ${a} ${n}?`,
  }),
]);

/**
 * First Case slice frames: masculine change and unchanged accusative
 * on Ich sehe / Ich habe. Dative (`helfen`) is not in this list.
 * @type {readonly string[]}
 */
export const CASE_ACCUSATIVE_FRAMES = Object.freeze([
  "ich_sehe_acc_def",
  "ich_sehe_acc_indef",
  "ich_habe_acc_def",
  "ich_habe_acc_indef",
]);

/**
 * Concepts that introduce every first-slice frame.
 * A frame stays ineligible until each of its own `requires` tags is present.
 * @type {readonly string[]}
 */
export const CASE_ACCUSATIVE_CONCEPTS = Object.freeze([
  "accusative",
  "definite_article",
  "indefinite_article",
  "verb.sehen",
  "verb.haben",
]);

/**
 * Ich sehe / Ich habe sentences that get a listen card.
 * Keyed by context and lemma so "Ich sehe den Mann" can be heard
 * while "Ich habe den Mann" stays off the listen deck.
 * @type {ReadonlySet<string>}
 */
export const CASE_ACCUSATIVE_LISTEN = new Set([
  "ich_sehe_acc_def:Ball",
  "ich_sehe_acc_def:Bus",
  "ich_sehe_acc_def:Hund",
  "ich_sehe_acc_def:Mann",
  "ich_sehe_acc_def:Schlüssel",
  "ich_sehe_acc_def:Stift",
  "ich_sehe_acc_def:Zug",
  "ich_sehe_acc_indef:Ball",
  "ich_sehe_acc_indef:Bus",
  "ich_sehe_acc_indef:Hund",
  "ich_sehe_acc_indef:Mann",
  "ich_sehe_acc_indef:Schlüssel",
  "ich_sehe_acc_indef:Stift",
  "ich_sehe_acc_indef:Zug",
  "ich_habe_acc_def:Ball",
  "ich_habe_acc_def:Hund",
  "ich_habe_acc_def:Schlüssel",
  "ich_habe_acc_def:Stift",
  "ich_habe_acc_indef:Ball",
  "ich_habe_acc_indef:Hund",
  "ich_habe_acc_indef:Schlüssel",
  "ich_habe_acc_indef:Stift",
  "ich_sehe_acc_def:Buch",
  "ich_sehe_acc_def:Frau",
  "ich_sehe_acc_def:Katze",
  "ich_sehe_acc_def:Kind",
  "ich_sehe_acc_indef:Buch",
  "ich_sehe_acc_indef:Frau",
  "ich_sehe_acc_indef:Katze",
  "ich_sehe_acc_indef:Kind",
  "ich_habe_acc_def:Buch",
  "ich_habe_acc_def:Katze",
  "ich_habe_acc_indef:Buch",
  "ich_habe_acc_indef:Katze",
]);

/**
 * Lesson nouns allowed in Case accusative frames.
 * Not the whole lexicon — suffix-lesson lemmas stay out.
 * @type {readonly string[]}
 */
export const CASE_ACCUSATIVE_ALLOWLIST = Object.freeze([
  "Mann",
  "Frau",
  "Hund",
  "Kind",
  "Bus",
  "Zug",
  "Stadt",
  "Stift",
  "Ball",
  "Schlüssel",
  "Geschenk",
  "Katze",
  "Buch",
]);

/** Masculine accusative unit: der→den, ein→einen. */
export const CASE_ACC_MASC_GENDERS = Object.freeze(["masculine"]);

/** Unchanged accusative unit: die, das, eine, ein. */
export const CASE_ACC_UNCHANGED_GENDERS = Object.freeze(["feminine", "neuter"]);

/**
 * Dative plural noun forms that differ from the lexicon plural.
 * Regular -s plurals (Autos, Büros) stay on the lexicon form and are not listed here.
 */
export const DATIVE_PLURAL_FORMS = Object.freeze({
  Kind: "Kindern",
  Hund: "Hunden",
  /** Nominative plural already ends in -n, so the dative plural does not add another. */
  Frau: "Frauen",
});

/**
 * Listed Case frames after the accusative slice.
 * Each `lemmas` array is the allowlist. A frame with `closed: true` also
 * freezes the rest of the sentence (gefallen’s subject stays Das Buch).
 * `listen: true` on a frame or lemma adds a listen card for that sentence.
 * `geben` is not a frame.
 * @type {Readonly<Record<string, { concepts: readonly string[], frames: readonly object[] }>>}
 */
export const CASE_FRAME_UNITS = Object.freeze({
  "case.dat.helfen": {
    concepts: ["dative", "definite_article", "indefinite_article", "verb.helfen"],
    frames: [
      {
        id: "ich_helfe_dat_def",
        requires: ["dative", "definite_article", "verb.helfen"],
        construction: "helfen",
        cue: "helfen takes the dative.",
        target: "article",
        articleKind: "definite",
        case: "dative",
        number: "singular",
        before: "Ich helfe ",
        listen: true,
        lemmas: ["Mann", "Frau", "Kind", "Arzt", "Lehrer", "Hund", "Katze"],
      },
      {
        id: "ich_helfe_dat_indef",
        requires: ["dative", "indefinite_article", "verb.helfen"],
        construction: "helfen",
        cue: "helfen takes the dative.",
        target: "article",
        articleKind: "indefinite",
        case: "dative",
        number: "singular",
        before: "Ich helfe ",
        listen: true,
        lemmas: ["Mann", "Frau", "Kind", "Arzt", "Lehrer", "Hund", "Katze"],
      },
    ],
  },
  "case.dat.indef": {
    concepts: ["dative", "indefinite_article", "verb.helfen", "prep.mit", "prep.aus"],
    frames: [
      {
        id: "ich_helfe_dat_indef",
        requires: ["dative", "indefinite_article", "verb.helfen"],
        construction: "helfen",
        cue: "helfen takes the dative.",
        target: "article",
        articleKind: "indefinite",
        case: "dative",
        number: "singular",
        before: "Ich helfe ",
        listen: true,
        lemmas: ["Mann", "Frau", "Kind", "Arzt"],
      },
      {
        id: "mit_dat_indef",
        requires: ["dative", "indefinite_article", "prep.mit"],
        construction: "mit",
        cue: "mit takes the dative.",
        target: "article",
        articleKind: "indefinite",
        case: "dative",
        number: "singular",
        before: "Ich fahre mit ",
        listen: true,
        lemmas: ["Bus", "Auto"],
      },
      {
        id: "aus_dat_indef",
        requires: ["dative", "indefinite_article", "prep.aus"],
        construction: "aus",
        cue: "aus takes the dative.",
        target: "article",
        articleKind: "indefinite",
        case: "dative",
        number: "singular",
        before: "Er kommt aus ",
        listen: true,
        lemmas: ["Stadt", "Haus", "Hotel"],
      },
    ],
  },
  "case.prep.mit": {
    concepts: ["dative", "definite_article", "indefinite_article", "prep.mit"],
    frames: [
      {
        id: "mit_dat_def",
        requires: ["dative", "definite_article", "prep.mit"],
        construction: "mit",
        cue: "mit takes the dative.",
        target: "article",
        articleKind: "definite",
        case: "dative",
        number: "singular",
        before: "Ich fahre mit ",
        listen: true,
        lemmas: [
          { lemma: "Bus", before: "Ich fahre mit " },
          { lemma: "Zug", before: "Ich fahre mit " },
          { lemma: "Auto", before: "Ich fahre mit " },
          { lemma: "Kind", before: "Ich spiele mit " },
          { lemma: "Hund", before: "Ich spiele mit " },
          { lemma: "Katze", before: "Ich spiele mit " },
          { lemma: "Ball", before: "Ich spiele mit " },
        ],
      },
      {
        id: "mit_unit_dat_indef",
        requires: ["dative", "indefinite_article", "prep.mit"],
        construction: "mit",
        cue: "mit takes the dative.",
        target: "article",
        articleKind: "indefinite",
        case: "dative",
        number: "singular",
        before: "Ich fahre mit ",
        listen: true,
        lemmas: [
          { lemma: "Bus", before: "Ich fahre mit " },
          { lemma: "Zug", before: "Ich fahre mit " },
          { lemma: "Auto", before: "Ich fahre mit " },
          { lemma: "Kind", before: "Ich spiele mit " },
          { lemma: "Hund", before: "Ich spiele mit " },
          { lemma: "Katze", before: "Ich spiele mit " },
          { lemma: "Ball", before: "Ich spiele mit " },
        ],
      },
    ],
  },
  "case.prep.warten-auf": {
    concepts: ["accusative", "definite_article", "indefinite_article", "prep.warten-auf"],
    frames: [
      {
        id: "warten_auf_acc_def",
        requires: ["accusative", "definite_article", "prep.warten-auf"],
        construction: "warten-auf",
        cue: "warten auf takes the accusative.",
        target: "article",
        articleKind: "definite",
        case: "accusative",
        number: "singular",
        before: "Ich warte auf ",
        listen: true,
        lemmas: ["Mann", "Frau", "Kind", "Zug", "Bus", "Arzt", "Lehrer"],
      },
      {
        id: "warten_auf_acc_indef",
        requires: ["accusative", "indefinite_article", "prep.warten-auf"],
        construction: "warten-auf",
        cue: "warten auf takes the accusative.",
        target: "article",
        articleKind: "indefinite",
        case: "accusative",
        number: "singular",
        before: "Ich warte auf ",
        listen: true,
        lemmas: ["Mann", "Frau", "Kind", "Zug", "Bus", "Arzt", "Lehrer"],
      },
    ],
  },
  "case.verb.danken": {
    concepts: ["dative", "definite_article", "indefinite_article", "verb.danken"],
    frames: [
      {
        id: "ich_danke_dat_def",
        requires: ["dative", "definite_article", "verb.danken"],
        construction: "danken",
        cue: "danken takes the dative.",
        target: "article",
        articleKind: "definite",
        case: "dative",
        number: "singular",
        before: "Ich danke ",
        listen: true,
        lemmas: ["Mann", "Frau", "Kind", "Arzt", "Lehrer"],
      },
      {
        id: "ich_danke_dat_indef",
        requires: ["dative", "indefinite_article", "verb.danken"],
        construction: "danken",
        cue: "danken takes the dative.",
        target: "article",
        articleKind: "indefinite",
        case: "dative",
        number: "singular",
        before: "Ich danke ",
        listen: true,
        lemmas: ["Mann", "Frau", "Kind", "Arzt", "Lehrer"],
      },
    ],
  },
  "case.verb.gefallen": {
    concepts: ["dative", "definite_article", "verb.gefallen"],
    frames: [
      {
        id: "gefallen_dat_def",
        requires: ["dative", "definite_article", "verb.gefallen"],
        construction: "gefallen",
        cue: "gefallen takes the dative.",
        target: "article",
        articleKind: "definite",
        case: "dative",
        number: "singular",
        before: "Das Buch gefällt ",
        closed: true,
        listen: true,
        lemmas: ["Mann", "Frau", "Kind"],
      },
    ],
  },
  "case.prep.aus": {
    concepts: ["dative", "definite_article", "indefinite_article", "prep.aus"],
    frames: [
      {
        id: "aus_dat_def",
        requires: ["dative", "definite_article", "prep.aus"],
        construction: "aus",
        cue: "aus takes the dative.",
        target: "article",
        articleKind: "definite",
        case: "dative",
        number: "singular",
        before: "Er kommt aus ",
        listen: true,
        lemmas: [
          "Stadt",
          "Haus",
          "Hotel",
          "Büro",
          "Museum",
          "Kino",
          "Theater",
          "Restaurant",
          "Café",
          "Krankenhaus",
        ],
      },
      {
        id: "aus_unit_dat_indef",
        requires: ["dative", "indefinite_article", "prep.aus"],
        construction: "aus",
        cue: "aus takes the dative.",
        target: "article",
        articleKind: "indefinite",
        case: "dative",
        number: "singular",
        before: "Er kommt aus ",
        listen: true,
        lemmas: [
          "Stadt",
          "Haus",
          "Hotel",
          "Büro",
          "Museum",
          "Kino",
          "Theater",
          "Restaurant",
          "Café",
          "Krankenhaus",
        ],
      },
    ],
  },
  "case.prep.fuer": {
    concepts: ["accusative", "definite_article", "indefinite_article", "prep.fuer"],
    frames: [
      {
        id: "fuer_acc_def",
        requires: ["accusative", "definite_article", "prep.fuer"],
        construction: "fuer",
        cue: "für takes the accusative.",
        target: "article",
        articleKind: "definite",
        case: "accusative",
        number: "singular",
        before: "Das Geschenk ist für ",
        listen: true,
        lemmas: ["Mann", "Frau", "Kind", "Hund", "Katze"],
      },
      {
        id: "fuer_acc_indef",
        requires: ["accusative", "indefinite_article", "prep.fuer"],
        construction: "fuer",
        cue: "für takes the accusative.",
        target: "article",
        articleKind: "indefinite",
        case: "accusative",
        number: "singular",
        before: "Das ist für ",
        listen: true,
        lemmas: ["Mann", "Frau", "Kind"],
      },
    ],
  },
  "case.prep.ohne": {
    concepts: ["accusative", "definite_article", "indefinite_article", "prep.ohne"],
    frames: [
      {
        id: "ohne_acc_def",
        requires: ["accusative", "definite_article", "prep.ohne"],
        construction: "ohne",
        cue: "ohne takes the accusative.",
        target: "article",
        articleKind: "definite",
        case: "accusative",
        number: "singular",
        before: "Ich gehe ohne ",
        listen: true,
        lemmas: [
          "Schlüssel",
          "Tasche",
          "Ticket",
          "Buch",
          "Jacke",
          "Hemd",
          "Stift",
          "Ball",
          "Hund",
          "Katze",
          "Auto",
        ],
      },
      {
        id: "ohne_acc_indef",
        requires: ["accusative", "indefinite_article", "prep.ohne"],
        construction: "ohne",
        cue: "ohne takes the accusative.",
        target: "article",
        articleKind: "indefinite",
        case: "accusative",
        number: "singular",
        before: "Ich gehe ohne ",
        listen: true,
        lemmas: ["Schlüssel"],
      },
    ],
  },
  "case.acc.verbs": {
    concepts: [
      "accusative",
      "definite_article",
      "indefinite_article",
      "verb.brauchen",
      "verb.suchen",
      "verb.nehmen",
      "verb.finden",
    ],
    frames: [
      {
        id: "brauche_acc_def",
        requires: ["accusative", "definite_article", "verb.brauchen"],
        construction: "brauchen",
        cue: "brauchen takes the accusative.",
        target: "article",
        articleKind: "definite",
        case: "accusative",
        number: "singular",
        before: "Ich brauche ",
        listen: true,
        lemmas: ["Schlüssel", "Tasche", "Ticket", "Buch", "Auto"],
      },
      {
        id: "suche_acc_indef",
        requires: ["accusative", "indefinite_article", "verb.suchen"],
        construction: "suchen",
        cue: "suchen takes the accusative.",
        target: "article",
        articleKind: "indefinite",
        case: "accusative",
        number: "singular",
        before: "Ich suche ",
        listen: true,
        lemmas: ["Schlüssel"],
      },
      {
        id: "nehme_acc_def",
        requires: ["accusative", "definite_article", "verb.nehmen"],
        construction: "nehmen",
        cue: "nehmen takes the accusative.",
        target: "article",
        articleKind: "definite",
        case: "accusative",
        number: "singular",
        before: "Ich nehme ",
        listen: true,
        lemmas: ["Bus", "Zug", "Tasche", "Auto"],
      },
      {
        id: "finde_acc_def",
        requires: ["accusative", "definite_article", "verb.finden"],
        construction: "finden",
        cue: "finden takes the accusative.",
        target: "article",
        articleKind: "definite",
        case: "accusative",
        number: "singular",
        before: "Ich finde ",
        listen: true,
        lemmas: ["Hotel", "Schlüssel", "Tasche", "Buch", "Bus"],
      },
    ],
  },
  "case.dat.plural": {
    concepts: ["dative", "definite_article", "verb.helfen", "prep.mit", "prep.aus", "plural"],
    frames: [
      {
        id: "helfe_dat_pl_article",
        requires: ["dative", "definite_article", "verb.helfen", "plural"],
        construction: "helfen",
        cue: "helfen takes the dative.",
        target: "article",
        articleKind: "definite",
        case: "dative",
        number: "plural",
        before: "Ich helfe ",
        listen: true,
        lemmas: [
          { lemma: "Kind", nounForm: "Kindern" },
          { lemma: "Frau", nounForm: "Frauen" },
          { lemma: "Hund", nounForm: "Hunden" },
        ],
      },
      {
        id: "mit_dat_pl_article",
        requires: ["dative", "definite_article", "prep.mit", "plural"],
        construction: "mit",
        cue: "mit takes the dative.",
        target: "article",
        articleKind: "definite",
        case: "dative",
        number: "plural",
        before: "Ich spiele mit ",
        listen: true,
        lemmas: [
          { lemma: "Hund", nounForm: "Hunden" },
          { lemma: "Kind", nounForm: "Kindern" },
          { lemma: "Frau", nounForm: "Frauen" },
        ],
      },
      {
        id: "fahre_dat_pl_article",
        requires: ["dative", "definite_article", "prep.mit", "plural"],
        construction: "mit",
        cue: "mit takes the dative.",
        target: "article",
        articleKind: "definite",
        case: "dative",
        number: "plural",
        before: "Ich fahre mit ",
        listen: true,
        lemmas: ["Auto"],
      },
      {
        id: "aus_dat_pl_article",
        requires: ["dative", "definite_article", "prep.aus", "plural"],
        construction: "aus",
        cue: "aus takes the dative.",
        target: "article",
        articleKind: "definite",
        case: "dative",
        number: "plural",
        before: "Ich komme aus ",
        listen: true,
        lemmas: ["Büro"],
      },
      {
        id: "helfe_dat_pl_noun",
        requires: ["dative", "definite_article", "verb.helfen", "plural"],
        construction: "helfen",
        cue: "This noun’s dative plural changes.",
        target: "noun",
        case: "dative",
        number: "plural",
        before: "Ich helfe den ",
        lemmas: [
          {
            lemma: "Kind",
            correct: "Kindern",
            choices: ["Kindern", "Kinder", "Kind"],
            before: "Ich helfe den ",
          },
        ],
      },
      {
        id: "mit_dat_pl_noun",
        requires: ["dative", "definite_article", "prep.mit", "plural"],
        construction: "mit",
        cue: "This noun’s dative plural changes.",
        target: "noun",
        case: "dative",
        number: "plural",
        before: "Ich spiele mit den ",
        lemmas: [
          {
            lemma: "Hund",
            correct: "Hunden",
            choices: ["Hunden", "Hunde", "Hund"],
            before: "Ich spiele mit den ",
          },
        ],
      },
      {
        id: "helfe_dat_pl_frau",
        requires: ["dative", "definite_article", "verb.helfen", "plural"],
        construction: "helfen",
        cue: "This plural already ends in -n.",
        target: "noun",
        case: "dative",
        number: "plural",
        before: "Ich helfe den ",
        lemmas: [
          {
            lemma: "Frau",
            correct: "Frauen",
            choices: ["Frauen", "Frauenn", "Frau"],
            before: "Ich helfe den ",
            cue: "This plural already ends in -n.",
          },
        ],
      },
    ],
  },
  "case.prep.passen-zu": {
    concepts: ["dative", "definite_article", "indefinite_article", "prep.passen-zu"],
    frames: [
      {
        id: "passen_hemd",
        requires: ["dative", "definite_article", "prep.passen-zu"],
        construction: "passen-zu",
        cue: "passen zu takes the dative.",
        target: "article",
        articleKind: "definite",
        case: "dative",
        number: "singular",
        before: "Die Jacke passt zu ",
        listen: true,
        lemmas: ["Hemd"],
      },
      {
        id: "passen_tasche",
        requires: ["dative", "definite_article", "prep.passen-zu"],
        construction: "passen-zu",
        cue: "passen zu takes the dative.",
        target: "article",
        articleKind: "definite",
        case: "dative",
        number: "singular",
        before: "Die Farbe passt zu ",
        listen: true,
        lemmas: ["Tasche"],
      },
      {
        id: "passen_kleid",
        requires: ["dative", "indefinite_article", "prep.passen-zu"],
        construction: "passen-zu",
        cue: "passen zu takes the dative.",
        target: "article",
        articleKind: "indefinite",
        case: "dative",
        number: "singular",
        before: "Das passt zu ",
        listen: true,
        lemmas: ["Kleid"],
      },
      {
        id: "passen_farbe_hemd",
        requires: ["dative", "definite_article", "prep.passen-zu"],
        construction: "passen-zu",
        cue: "passen zu takes the dative.",
        target: "article",
        articleKind: "definite",
        case: "dative",
        number: "singular",
        before: "Die Farbe passt zu ",
        listen: true,
        lemmas: ["Hemd"],
      },
      {
        id: "passen_farbe_jacke",
        requires: ["dative", "definite_article", "prep.passen-zu"],
        construction: "passen-zu",
        cue: "passen zu takes the dative.",
        target: "article",
        articleKind: "definite",
        case: "dative",
        number: "singular",
        before: "Die Farbe passt zu ",
        listen: true,
        lemmas: ["Jacke"],
      },
      {
        id: "passen_farbe_kleid",
        requires: ["dative", "definite_article", "prep.passen-zu"],
        construction: "passen-zu",
        cue: "passen zu takes the dative.",
        target: "article",
        articleKind: "definite",
        case: "dative",
        number: "singular",
        before: "Die Farbe passt zu ",
        listen: true,
        lemmas: ["Kleid"],
      },
      {
        id: "passen_das_hemd",
        requires: ["dative", "indefinite_article", "prep.passen-zu"],
        construction: "passen-zu",
        cue: "passen zu takes the dative.",
        target: "article",
        articleKind: "indefinite",
        case: "dative",
        number: "singular",
        before: "Das passt zu ",
        listen: true,
        lemmas: ["Hemd"],
      },
      {
        id: "passen_das_jacke",
        requires: ["dative", "indefinite_article", "prep.passen-zu"],
        construction: "passen-zu",
        cue: "passen zu takes the dative.",
        target: "article",
        articleKind: "indefinite",
        case: "dative",
        number: "singular",
        before: "Das passt zu ",
        listen: true,
        lemmas: ["Jacke"],
      },
      {
        id: "passen_das_tasche",
        requires: ["dative", "indefinite_article", "prep.passen-zu"],
        construction: "passen-zu",
        cue: "passen zu takes the dative.",
        target: "article",
        articleKind: "indefinite",
        case: "dative",
        number: "singular",
        before: "Das passt zu ",
        listen: true,
        lemmas: ["Tasche"],
      },
    ],
  },
  "case.mixed": {
    concepts: [
      "nominative",
      "accusative",
      "dative",
      "definite_article",
      "verb.sehen",
      "verb.zeigen",
      "verb.geben",
      "verb.helfen",
    ],
    frames: [
      {
        id: "zeigt_frau_mann_buch",
        requires: ["accusative", "dative", "definite_article", "verb.zeigen"],
        construction: "zeigen",
        target: "article",
        articleKind: "definite",
        case: "dative",
        number: "singular",
        before: "",
        closed: true,
        focusLemma: true,
        lemmas: [
          {
            lemma: "Mann",
            case: "dative",
            before: "Die Frau zeigt ",
            rest: " das Buch",
            cue: "zeigen takes the dative.",
          },
          {
            lemma: "Buch",
            case: "accusative",
            before: "Die Frau zeigt dem Mann ",
            rest: "",
            cue: "zeigen takes the accusative.",
          },
        ],
      },
      {
        id: "sehen_mann_hund",
        requires: ["nominative", "accusative", "definite_article", "verb.sehen"],
        construction: "sehen",
        target: "article",
        articleKind: "definite",
        case: "nominative",
        number: "singular",
        before: "",
        closed: true,
        focusLemma: true,
        lemmas: [
          {
            lemma: "Mann",
            case: "nominative",
            before: "",
            rest: " sieht den Hund",
            initial: true,
            cue: "The subject is nominative.",
          },
          {
            lemma: "Hund",
            case: "accusative",
            before: "Der Mann sieht ",
            rest: "",
            cue: "sehen takes the accusative.",
          },
        ],
      },
      {
        id: "sehen_hund_mann",
        requires: ["nominative", "accusative", "definite_article", "verb.sehen"],
        construction: "sehen",
        target: "article",
        articleKind: "definite",
        case: "nominative",
        number: "singular",
        before: "",
        closed: true,
        focusLemma: true,
        lemmas: [
          {
            lemma: "Hund",
            case: "nominative",
            before: "",
            rest: " sieht den Mann",
            initial: true,
            listen: true,
            cue: "The subject is nominative.",
          },
          {
            lemma: "Mann",
            case: "accusative",
            before: "Der Hund sieht ",
            rest: "",
            cue: "sehen takes the accusative.",
          },
        ],
      },
      {
        id: "geben_kind_ball",
        requires: ["accusative", "dative", "definite_article", "verb.geben"],
        construction: "geben",
        target: "article",
        articleKind: "definite",
        case: "dative",
        number: "singular",
        before: "",
        closed: true,
        focusLemma: true,
        lemmas: [
          {
            lemma: "Kind",
            case: "dative",
            before: "Ich gebe ",
            rest: " den Ball",
            cue: "geben takes the dative.",
          },
          {
            lemma: "Ball",
            case: "accusative",
            before: "Ich gebe dem Kind ",
            rest: "",
            listen: true,
            cue: "geben takes the accusative.",
          },
        ],
      },
      {
        id: "helfen_lehrer_schueler",
        requires: ["nominative", "dative", "definite_article", "verb.helfen"],
        construction: "helfen",
        target: "article",
        articleKind: "definite",
        case: "nominative",
        number: "singular",
        before: "",
        closed: true,
        focusLemma: true,
        lemmas: [
          {
            lemma: "Lehrer",
            case: "nominative",
            before: "",
            rest: " hilft dem Schüler",
            initial: true,
            cue: "The subject is nominative.",
          },
          {
            lemma: "Schüler",
            case: "dative",
            before: "Der Lehrer hilft ",
            rest: "",
            cue: "helfen takes the dative.",
          },
        ],
      },
    ],
  },
});

/**
 * Compose accusative Ich sehe / Ich habe items for Case.
 * Contexts missing an introduced concept are skipped.
 * Lemmas off the allowlist, of the wrong gender, or failing validation are discarded.
 * @param {{ concepts?: Iterable<string>, genders?: Iterable<string>, lemmas?: Iterable<string> }} [opts]
 * @returns {readonly object[]}
 */
export function composeCaseAccusativeItems(opts = {}) {
  if (!opts.concepts) return Object.freeze([]);
  const concepts = opts.concepts instanceof Set ? opts.concepts : new Set(opts.concepts);
  const genders = opts.genders
    ? opts.genders instanceof Set
      ? opts.genders
      : new Set(opts.genders)
    : null;
  const requested = opts.lemmas ? [...opts.lemmas] : [...CASE_ACCUSATIVE_ALLOWLIST];
  const allow = new Set(CASE_ACCUSATIVE_ALLOWLIST);
  const contexts = PRACTICE_CONTEXTS.filter(
    (ctx) =>
      CASE_ACCUSATIVE_FRAMES.includes(ctx.id) &&
      contextIsEligible(ctx, { concepts })
  );
  const out = [];
  for (const lemma of requested) {
    if (!allow.has(lemma)) continue;
    const analysis = nounAnalysis(lemma);
    if (!analysis.known || !analysis.gender) continue;
    if (genders && !genders.has(analysis.gender)) continue;
    for (const ctx of contexts) {
      const v = validateComposition(lemma, ctx);
      if (!v.ok) continue;
      out.push(
        Object.freeze({
          id: `case.acc.${ctx.id}.${lemma}`,
          lemma,
          gender: analysis.gender,
          contextId: ctx.id,
          articleKind: ctx.articleKind,
          case: ctx.case,
          number: ctx.number,
          before: ctx.before,
          after: ctx.after(v.nounForm),
          nounForm: v.nounForm,
          correct: v.expected,
          sentence: v.sentence,
          choices: articleChoices(ctx.articleKind, ctx.case),
          composeVersion: COMPOSE_VERSION,
          listen: CASE_ACCUSATIVE_LISTEN.has(`${ctx.id}:${lemma}`),
        })
      );
    }
  }
  return Object.freeze(out);
}

function slotLemma(entry) {
  return typeof entry === "string" ? entry : entry.lemma;
}

function slotBefore(frame, entry) {
  if (entry && typeof entry === "object" && "before" in entry) return entry.before;
  return frame.before;
}

function capitalizeFirst(text) {
  const s = String(text || "");
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function frameEligible(frame, concepts) {
  return frame.requires.every((tag) => concepts.has(tag));
}

function composeArticleFrameItems(frame, only) {
  const out = [];
  for (const entry of frame.lemmas) {
    const lemma = slotLemma(entry);
    if (only && !only.has(lemma)) continue;
    const slot = entry && typeof entry === "object" ? entry : {};
    const grammaticalCase = slot.case || frame.case;
    const articleKind = slot.articleKind || frame.articleKind;
    const number = slot.number || frame.number;
    const rest = typeof slot.rest === "string" ? slot.rest : "";
    const before = slotBefore(frame, entry);
    const ctx = {
      articleKind,
      case: grammaticalCase,
      number,
      before,
      after: (n) => ` ${n}${rest}.`,
      sentence: (a, n) => `${before}${a} ${n}${rest}.`,
    };
    const v = validateComposition(lemma, ctx);
    if (!v.ok) continue;
    let nounForm = v.nounForm;
    let sentence = v.sentence;
    const override = slot.nounForm || null;
    if (override) {
      if (DATIVE_PLURAL_FORMS[lemma] !== override) continue;
      nounForm = override;
      sentence = `${before}${v.expected} ${nounForm}${rest}.`;
    }
    let correct = v.expected;
    let choices = [...articleChoices(articleKind, grammaticalCase)];
    if (slot.initial) {
      correct = capitalizeFirst(correct);
      choices = choices.map(capitalizeFirst);
      sentence = capitalizeFirst(sentence);
    }
    out.push(
      Object.freeze({
        id: `${frame.id}.${lemma}`,
        lemma,
        gender: v.gender,
        contextId: frame.id,
        articleKind,
        case: grammaticalCase,
        number,
        target: "article",
        construction: frame.construction,
        guidedCue: slot.cue || frame.cue,
        focusLemma: !!frame.focusLemma,
        before,
        after: ` ${nounForm}${rest}.`,
        nounForm,
        correct,
        sentence,
        choices: Object.freeze(choices),
        composeVersion: COMPOSE_VERSION,
        closed: !!frame.closed,
        listen: !!(slot.listen || frame.listen),
      })
    );
  }
  return out;
}

function composeNounFactItems(frame, only) {
  const out = [];
  for (const entry of frame.lemmas) {
    const lemma = entry.lemma;
    if (only && !only.has(lemma)) continue;
    const fact = DATIVE_PLURAL_FORMS[lemma];
    if (!fact || entry.correct !== fact) continue;
    const analysis = nounAnalysis(lemma);
    if (!analysis.known || !analysis.gender || !analysis.plural?.form) continue;
    if (!entry.choices?.includes(fact)) continue;
    if (!entry.choices.includes(analysis.plural.form)) continue;
    let article;
    try {
      article = articleForm(analysis.gender, {
        kind: "definite",
        number: "plural",
        case: "dative",
      });
    } catch {
      continue;
    }
    if (article !== "den") continue;
    const before = entry.before || frame.before;
    out.push(
      Object.freeze({
        id: `${frame.id}.${lemma}`,
        lemma,
        gender: analysis.gender,
        contextId: frame.id,
        articleKind: null,
        case: "dative",
        number: "plural",
        target: "noun",
        construction: frame.construction,
        guidedCue: entry.cue || frame.cue,
        before,
        after: ".",
        nounForm: fact,
        correct: fact,
        sentence: `${before}${fact}.`,
        choices: Object.freeze([...entry.choices]),
        composeVersion: COMPOSE_VERSION,
      })
    );
  }
  return out;
}

/**
 * Compose one later Case unit from its listed frames.
 * No concepts → empty. Lemmas off the frame allowlist are dropped.
 * @param {string} unitId
 * @param {{ concepts?: Iterable<string>, lemmas?: Iterable<string> }} [opts]
 */
export function composeCaseFrameItems(unitId, opts = {}) {
  if (!opts.concepts) return Object.freeze([]);
  const unit = CASE_FRAME_UNITS[unitId];
  if (!unit) return Object.freeze([]);
  const concepts = opts.concepts instanceof Set ? opts.concepts : new Set(opts.concepts);
  const only = opts.lemmas ? new Set(opts.lemmas) : null;
  const out = [];
  for (const frame of unit.frames) {
    if (!frameEligible(frame, concepts)) continue;
    if (frame.target === "noun") out.push(...composeNounFactItems(frame, only));
    else out.push(...composeArticleFrameItems(frame, only));
  }
  return Object.freeze(out);
}

/**
 * Choice set for an article blank (known forms only).
 * @param {"definite"|"indefinite"} kind
 * @param {"nominative"|"accusative"|"dative"} grammaticalCase
 */
export function articleChoices(kind, grammaticalCase) {
  if (kind === "definite") {
    if (grammaticalCase === "accusative") {
      return Object.freeze(["den", "die", "das"]);
    }
    if (grammaticalCase === "dative") {
      return Object.freeze(["dem", "der", "den"]);
    }
    return Object.freeze(["der", "die", "das"]);
  }
  if (grammaticalCase === "accusative") {
    return Object.freeze(["einen", "eine", "ein"]);
  }
  if (grammaticalCase === "dative") {
    return Object.freeze(["einem", "einer", "einen"]);
  }
  return Object.freeze(["ein", "eine"]);
}

/**
 * @param {string} lemma
 * @param {PracticeContext} ctx
 */
function nounSurface(lemma, ctx) {
  const analysis = nounAnalysis(lemma);
  if (!analysis.known || !analysis.gender) return null;
  if (ctx.number === "plural") {
    if (!analysis.plural?.form) return null;
    return analysis.plural.form;
  }
  return analysis.lemma;
}

/**
 * Validate a composed surface before it becomes an exercise.
 * @returns {{ ok: true, expected: string, nounForm: string, gender: string } | { ok: false, reason: string }}
 */
export function validateComposition(lemma, ctx, { article } = {}) {
  const analysis = nounAnalysis(lemma);
  if (!analysis.known) return { ok: false, reason: "unknown_lemma" };
  if (!analysis.gender) return { ok: false, reason: "missing_gender" };

  const nounForm = nounSurface(lemma, ctx);
  if (!nounForm) return { ok: false, reason: "missing_noun_form" };

  let expected;
  try {
    expected = articleForm(analysis.gender, {
      kind: ctx.articleKind,
      number: ctx.number,
      case: ctx.case,
    });
  } catch (err) {
    return { ok: false, reason: `article_unsupported:${err.message}` };
  }

  if (!expected) return { ok: false, reason: "missing_article" };

  const choices = articleChoices(ctx.articleKind, ctx.case);
  if (!choices.includes(expected)) {
    return { ok: false, reason: "expected_not_in_choices" };
  }

  if (article != null && article !== expected) {
    // intentional foil — surface must differ from expected
    if (article === expected) return { ok: false, reason: "foil_matches_expected" };
    if (!choices.includes(article)) {
      return { ok: false, reason: "foil_not_in_choices" };
    }
  }

  const sentence = ctx.sentence(article ?? expected, nounForm);
  if (!sentence || !sentence.includes(nounForm)) {
    return { ok: false, reason: "bad_sentence" };
  }

  return {
    ok: true,
    expected,
    nounForm,
    gender: analysis.gender,
    sentence: ctx.sentence(expected, nounForm),
  };
}

/**
 * Pick a wrong-gender article that yields a different surface form.
 * @returns {string|null}
 */
export function wrongGenderArticle(gender, ctx) {
  const expected = articleForm(gender, {
    kind: ctx.articleKind,
    number: ctx.number,
    case: ctx.case,
  });
  for (const g of GENDERS) {
    if (g === gender) continue;
    try {
      const foil = articleForm(g, {
        kind: ctx.articleKind,
        number: ctx.number,
        case: ctx.case,
      });
      if (foil && foil !== expected) return foil;
    } catch {
      /* skip unsupported */
    }
  }
  return null;
}

/**
 * Compose one Article Application item, or null if validation / suitability fails.
 * Suitability failures are silent to the learner; discards are recorded for tests/dev.
 */
export function composeArticleItem(categoryId, lemma, contextId) {
  const ctx = PRACTICE_CONTEXTS.find((c) => c.id === contextId);
  if (!ctx) return null;
  const cat = getGenderCategory(categoryId);
  if (!cat) return null;

  const suit = gateContextCompatibility(categoryId, lemma, ctx);
  if (!suit.ok) return null;

  const v = validateComposition(lemma, ctx);
  if (!v.ok) return null;

  const after = ctx.after(v.nounForm);
  return Object.freeze({
    id: `gen.art.${contextId}.${lemma}`,
    categoryId,
    lemma,
    articleKind: ctx.articleKind,
    before: ctx.before,
    after,
    choices: articleChoices(ctx.articleKind, ctx.case),
    correct: v.expected,
    contextId: ctx.id,
    case: ctx.case,
    number: ctx.number,
    composeVersion: COMPOSE_VERSION,
  });
}

/**
 * Compose correct + incorrect Sentence Validation pair (incorrect may be null).
 */
export function composeValidationPair(categoryId, lemma, contextId) {
  const ctx = PRACTICE_CONTEXTS.find((c) => c.id === contextId);
  if (!ctx) return { ok: null, bad: null };
  const cat = getGenderCategory(categoryId);
  if (!cat) return { ok: null, bad: null };

  const suit = gateContextCompatibility(categoryId, lemma, ctx);
  if (!suit.ok) return { ok: null, bad: null };

  const v = validateComposition(lemma, ctx);
  if (!v.ok) return { ok: null, bad: null };

  const okItem = Object.freeze({
    id: `gen.val.${contextId}.${lemma}.ok`,
    categoryId,
    lemma,
    sentence: v.sentence,
    correct: true,
    contextId: ctx.id,
    case: ctx.case,
    number: ctx.number,
    composeVersion: COMPOSE_VERSION,
    correctArticle: v.expected,
    correctSentence: v.sentence,
  });

  const foil = wrongGenderArticle(v.gender, ctx);
  if (!foil) return { ok: okItem, bad: null };

  const foilCheck = validateComposition(lemma, ctx, { article: foil });
  if (!foilCheck.ok) return { ok: okItem, bad: null };

  const badItem = Object.freeze({
    id: `gen.val.${contextId}.${lemma}.bad`,
    categoryId,
    lemma,
    sentence: ctx.sentence(foil, v.nounForm),
    correct: false,
    contextId: ctx.id,
    case: ctx.case,
    number: ctx.number,
    composeVersion: COMPOSE_VERSION,
    foilArticle: foil,
    correctArticle: v.expected,
    correctSentence: v.sentence,
  });

  return { ok: okItem, bad: badItem };
}

/**
 * Build a validated Article Application pool for practice categories.
 * Pass `{ concepts: CATEGORIES_PRACTICE_CONCEPTS }` (or cases/numbers) to gate frames.
 * @param {ContextEligibility} [eligibility]
 * @returns {readonly object[]}
 */
export function composeArticleApplicationItems(eligibility = {}) {
  const contexts = eligiblePracticeContexts(eligibility);
  const out = [];
  const seen = new Set();
  for (const cat of practiceCategories()) {
    const members = categoryMatchingMembers(cat.id);
    for (const lemma of members) {
      if (!LEXICON[lemma]) continue;
      for (const ctx of contexts) {
        const item = composeArticleItem(cat.id, lemma, ctx.id);
        if (!item || seen.has(item.id)) continue;
        seen.add(item.id);
        out.push(item);
      }
    }
  }
  return Object.freeze(out);
}

/**
 * Build a validated Sentence Validation pool.
 * @param {ContextEligibility} [eligibility]
 * @returns {readonly object[]}
 */
export function composeSentenceValidationItems(eligibility = {}) {
  const contexts = eligiblePracticeContexts(eligibility);
  const out = [];
  const seen = new Set();
  for (const cat of practiceCategories()) {
    const members = categoryMatchingMembers(cat.id);
    for (const lemma of members) {
      if (!LEXICON[lemma]) continue;
      for (const ctx of contexts) {
        const { ok, bad } = composeValidationPair(cat.id, lemma, ctx.id);
        if (ok && !seen.has(ok.id)) {
          seen.add(ok.id);
          out.push(ok);
        }
        if (bad && !seen.has(bad.id)) {
          seen.add(bad.id);
          out.push(bad);
        }
      }
    }
  }
  return Object.freeze(out);
}
