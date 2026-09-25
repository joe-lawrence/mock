/**
 * Lexical noun facts + high-confidence suffix patterns.
 * Lexical gender/plural are authoritative; patterns are predictive only.
 */

export const DATA_VERSION = "0.1.0";

export const ARTICLES = Object.freeze({
  masculine: "der",
  feminine: "die",
  neuter: "das",
});

/** Nominative plural definite article is always die. */
export const PLURAL_ARTICLE = "die";

/**
 * Suffix → predicted gender. Longest match wins.
 * strength is pedagogical metadata, not a probability float.
 */
export const SUFFIX_PATTERNS = Object.freeze([
  Object.freeze({
    id: "suf.ung",
    suffix: "ung",
    gender: "feminine",
    strength: "very-strong",
    note: "almost always feminine",
  }),
  Object.freeze({
    id: "suf.heit",
    suffix: "heit",
    gender: "feminine",
    strength: "very-strong",
    note: "almost always feminine",
  }),
  Object.freeze({
    id: "suf.keit",
    suffix: "keit",
    gender: "feminine",
    strength: "very-strong",
    note: "almost always feminine",
  }),
  Object.freeze({
    id: "suf.schaft",
    suffix: "schaft",
    gender: "feminine",
    strength: "strong",
    note: "strong feminine clue",
  }),
  Object.freeze({
    id: "suf.ion",
    suffix: "ion",
    gender: "feminine",
    strength: "strong",
    note: "strong feminine clue (loan)",
  }),
  Object.freeze({
    id: "suf.chen",
    suffix: "chen",
    gender: "neuter",
    strength: "near-certain",
    note: "diminutives are neuter",
  }),
  Object.freeze({
    id: "suf.lein",
    suffix: "lein",
    gender: "neuter",
    strength: "near-certain",
    note: "diminutives are neuter",
  }),
  Object.freeze({
    id: "suf.ment",
    suffix: "ment",
    gender: "neuter",
    strength: "strong",
    note: "often neuter (loan)",
  }),
  Object.freeze({
    id: "suf.ling",
    suffix: "ling",
    gender: "masculine",
    strength: "strong",
    note: "strong masculine clue",
  }),
  Object.freeze({
    id: "suf.ismus",
    suffix: "ismus",
    gender: "masculine",
    strength: "strong",
    note: "strong masculine clue",
  }),
]);

/**
 * Authoritative lexicon (demo + chart coverage).
 * plural.ending "—" means no ending (form === stem).
 */
export const LEXICON = Object.freeze({
  Zeitung: Object.freeze({
    gender: "feminine",
    gloss: "newspaper",
    plural: Object.freeze({ form: "Zeitungen", stem: "Zeitung", ending: "en" }),
  }),
  Freiheit: Object.freeze({
    gender: "feminine",
    gloss: "freedom",
    plural: Object.freeze({ form: "Freiheiten", stem: "Freiheit", ending: "en" }),
  }),
  Möglichkeit: Object.freeze({
    gender: "feminine",
    gloss: "possibility",
    plural: Object.freeze({ form: "Möglichkeiten", stem: "Möglichkeit", ending: "en" }),
  }),
  Freundschaft: Object.freeze({
    gender: "feminine",
    gloss: "friendship",
    plural: Object.freeze({ form: "Freundschaften", stem: "Freundschaft", ending: "en" }),
  }),
  Nation: Object.freeze({
    gender: "feminine",
    gloss: "nation",
    plural: Object.freeze({ form: "Nationen", stem: "Nation", ending: "en" }),
  }),
  Frühling: Object.freeze({
    gender: "masculine",
    gloss: "spring (season)",
    plural: Object.freeze({ form: "Frühlinge", stem: "Frühling", ending: "e" }),
  }),
  Tourismus: Object.freeze({
    gender: "masculine",
    gloss: "tourism",
    plural: null, // often uncounted; no demo plural
  }),
  Lehrer: Object.freeze({
    gender: "masculine",
    gloss: "teacher",
    plural: Object.freeze({ form: "Lehrer", stem: "Lehrer", ending: "—" }),
  }),
  Mädchen: Object.freeze({
    gender: "neuter",
    gloss: "girl",
    plural: Object.freeze({ form: "Mädchen", stem: "Mädchen", ending: "—" }),
  }),
  Büchlein: Object.freeze({
    gender: "neuter",
    gloss: "booklet",
    plural: Object.freeze({ form: "Büchlein", stem: "Büchlein", ending: "—" }),
  }),
  Instrument: Object.freeze({
    gender: "neuter",
    gloss: "instrument",
    plural: Object.freeze({ form: "Instrumente", stem: "Instrument", ending: "e" }),
  }),
  Tag: Object.freeze({
    gender: "masculine",
    gloss: "day",
    plural: Object.freeze({ form: "Tage", stem: "Tag", ending: "e" }),
  }),
  Buch: Object.freeze({
    gender: "neuter",
    gloss: "book",
    plural: Object.freeze({ form: "Bücher", stem: "Büch", ending: "er" }),
  }),
  Auto: Object.freeze({
    gender: "neuter",
    gloss: "car",
    plural: Object.freeze({ form: "Autos", stem: "Auto", ending: "s" }),
  }),
});

/**
 * Curated nonce nouns for Wug tests (productive suffix application).
 * intendedGender null ⇒ insufficient-information is the correct response.
 */
export const WUGS = Object.freeze([
  Object.freeze({
    form: "Klappung",
    patternId: "suf.ung",
    intendedGender: "feminine",
    note: "strong -ung cue",
  }),
  Object.freeze({
    form: "Trechheit",
    patternId: "suf.heit",
    intendedGender: "feminine",
    note: "strong -heit cue",
  }),
  Object.freeze({
    form: "Blöndchen",
    patternId: "suf.chen",
    intendedGender: "neuter",
    note: "diminutive -chen → neuter",
  }),
  Object.freeze({
    form: "Murfling",
    patternId: "suf.ling",
    intendedGender: "masculine",
    note: "strong -ling cue",
  }),
  Object.freeze({
    form: "Norkschaft",
    patternId: "suf.schaft",
    intendedGender: "feminine",
    note: "strong -schaft cue",
  }),
  Object.freeze({
    form: "Plork",
    patternId: null,
    intendedGender: null,
    note: "no high-confidence suffix — insufficient information",
  }),
  Object.freeze({
    form: "Tramsel",
    patternId: null,
    intendedGender: null,
    note: "no high-confidence suffix — insufficient information",
  }),
]);
