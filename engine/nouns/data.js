/**
 * Lexical noun facts + high-confidence suffix patterns.
 * Lexical gender/plural are authoritative; patterns are predictive only.
 */

export const DATA_VERSION = "0.2.0";

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
 * Authoritative lexicon (quiz + chart coverage).
 * Prefer high-confidence suffix families from SUFFIX_PATTERNS (Articles / Association).
 * A few chart plural exemplars (Tag, Buch, Auto) stay for plural shapes without a strong gender cue.
 * plural.ending "—" means no ending (form === stem).
 * plural null = no count plural in this demo (uncountable / unused).
 */
export const LEXICON = Object.freeze({
  // —— -ung (F) ——
  Zeitung: Object.freeze({
    gender: "feminine",
    gloss: "newspaper",
    plural: Object.freeze({ form: "Zeitungen", stem: "Zeitung", ending: "en" }),
  }),
  Rechnung: Object.freeze({
    gender: "feminine",
    gloss: "bill / invoice",
    plural: Object.freeze({ form: "Rechnungen", stem: "Rechnung", ending: "en" }),
  }),
  Wohnung: Object.freeze({
    gender: "feminine",
    gloss: "apartment",
    plural: Object.freeze({ form: "Wohnungen", stem: "Wohnung", ending: "en" }),
  }),
  Bedeutung: Object.freeze({
    gender: "feminine",
    gloss: "meaning",
    plural: Object.freeze({ form: "Bedeutungen", stem: "Bedeutung", ending: "en" }),
  }),
  Hoffnung: Object.freeze({
    gender: "feminine",
    gloss: "hope",
    plural: Object.freeze({ form: "Hoffnungen", stem: "Hoffnung", ending: "en" }),
  }),
  Erfahrung: Object.freeze({
    gender: "feminine",
    gloss: "experience",
    plural: Object.freeze({ form: "Erfahrungen", stem: "Erfahrung", ending: "en" }),
  }),
  Übung: Object.freeze({
    gender: "feminine",
    gloss: "exercise / practice",
    plural: Object.freeze({ form: "Übungen", stem: "Übung", ending: "en" }),
  }),
  Lösung: Object.freeze({
    gender: "feminine",
    gloss: "solution",
    plural: Object.freeze({ form: "Lösungen", stem: "Lösung", ending: "en" }),
  }),
  Erzählung: Object.freeze({
    gender: "feminine",
    gloss: "story / narrative",
    plural: Object.freeze({ form: "Erzählungen", stem: "Erzählung", ending: "en" }),
  }),

  // —— -heit (F) ——
  Freiheit: Object.freeze({
    gender: "feminine",
    gloss: "freedom",
    plural: Object.freeze({ form: "Freiheiten", stem: "Freiheit", ending: "en" }),
  }),
  Schönheit: Object.freeze({
    gender: "feminine",
    gloss: "beauty",
    plural: Object.freeze({ form: "Schönheiten", stem: "Schönheit", ending: "en" }),
  }),
  Krankheit: Object.freeze({
    gender: "feminine",
    gloss: "illness",
    plural: Object.freeze({ form: "Krankheiten", stem: "Krankheit", ending: "en" }),
  }),
  Wahrheit: Object.freeze({
    gender: "feminine",
    gloss: "truth",
    plural: Object.freeze({ form: "Wahrheiten", stem: "Wahrheit", ending: "en" }),
  }),
  Sicherheit: Object.freeze({
    gender: "feminine",
    gloss: "safety / security",
    plural: Object.freeze({ form: "Sicherheiten", stem: "Sicherheit", ending: "en" }),
  }),

  // —— -keit (F) ——
  Möglichkeit: Object.freeze({
    gender: "feminine",
    gloss: "possibility",
    plural: Object.freeze({ form: "Möglichkeiten", stem: "Möglichkeit", ending: "en" }),
  }),
  Fähigkeit: Object.freeze({
    gender: "feminine",
    gloss: "ability",
    plural: Object.freeze({ form: "Fähigkeiten", stem: "Fähigkeit", ending: "en" }),
  }),
  Schwierigkeit: Object.freeze({
    gender: "feminine",
    gloss: "difficulty",
    plural: Object.freeze({ form: "Schwierigkeiten", stem: "Schwierigkeit", ending: "en" }),
  }),
  Geschwindigkeit: Object.freeze({
    gender: "feminine",
    gloss: "speed",
    plural: Object.freeze({ form: "Geschwindigkeiten", stem: "Geschwindigkeit", ending: "en" }),
  }),

  // —— -schaft (F) ——
  Freundschaft: Object.freeze({
    gender: "feminine",
    gloss: "friendship",
    plural: Object.freeze({ form: "Freundschaften", stem: "Freundschaft", ending: "en" }),
  }),
  Wirtschaft: Object.freeze({
    gender: "feminine",
    gloss: "economy",
    plural: Object.freeze({ form: "Wirtschaften", stem: "Wirtschaft", ending: "en" }),
  }),
  Landschaft: Object.freeze({
    gender: "feminine",
    gloss: "landscape",
    plural: Object.freeze({ form: "Landschaften", stem: "Landschaft", ending: "en" }),
  }),
  Wissenschaft: Object.freeze({
    gender: "feminine",
    gloss: "science",
    plural: Object.freeze({ form: "Wissenschaften", stem: "Wissenschaft", ending: "en" }),
  }),
  Gesellschaft: Object.freeze({
    gender: "feminine",
    gloss: "society",
    plural: Object.freeze({ form: "Gesellschaften", stem: "Gesellschaft", ending: "en" }),
  }),

  // —— -ion (F) ——
  Nation: Object.freeze({
    gender: "feminine",
    gloss: "nation",
    plural: Object.freeze({ form: "Nationen", stem: "Nation", ending: "en" }),
  }),
  Information: Object.freeze({
    gender: "feminine",
    gloss: "information",
    plural: Object.freeze({ form: "Informationen", stem: "Information", ending: "en" }),
  }),
  Situation: Object.freeze({
    gender: "feminine",
    gloss: "situation",
    plural: Object.freeze({ form: "Situationen", stem: "Situation", ending: "en" }),
  }),
  Station: Object.freeze({
    gender: "feminine",
    gloss: "station",
    plural: Object.freeze({ form: "Stationen", stem: "Station", ending: "en" }),
  }),
  Region: Object.freeze({
    gender: "feminine",
    gloss: "region",
    plural: Object.freeze({ form: "Regionen", stem: "Region", ending: "en" }),
  }),
  Diskussion: Object.freeze({
    gender: "feminine",
    gloss: "discussion",
    plural: Object.freeze({ form: "Diskussionen", stem: "Diskussion", ending: "en" }),
  }),

  // —— -ling (M) ——
  Frühling: Object.freeze({
    gender: "masculine",
    gloss: "spring (season)",
    plural: Object.freeze({ form: "Frühlinge", stem: "Frühling", ending: "e" }),
  }),
  Lehrling: Object.freeze({
    gender: "masculine",
    gloss: "apprentice",
    plural: Object.freeze({ form: "Lehrlinge", stem: "Lehrling", ending: "e" }),
  }),
  Flüchtling: Object.freeze({
    gender: "masculine",
    gloss: "refugee",
    plural: Object.freeze({ form: "Flüchtlinge", stem: "Flüchtling", ending: "e" }),
  }),
  Findling: Object.freeze({
    gender: "masculine",
    gloss: "foundling / glacial boulder",
    plural: Object.freeze({ form: "Findlinge", stem: "Findling", ending: "e" }),
  }),

  // —— -ismus (M) ——
  Tourismus: Object.freeze({
    gender: "masculine",
    gloss: "tourism",
    plural: null,
  }),
  Kapitalismus: Object.freeze({
    gender: "masculine",
    gloss: "capitalism",
    plural: null,
  }),
  Journalismus: Object.freeze({
    gender: "masculine",
    gloss: "journalism",
    plural: null,
  }),
  Optimismus: Object.freeze({
    gender: "masculine",
    gloss: "optimism",
    plural: null,
  }),

  // —— -chen (N) ——
  Mädchen: Object.freeze({
    gender: "neuter",
    gloss: "girl",
    plural: Object.freeze({ form: "Mädchen", stem: "Mädchen", ending: "—" }),
  }),
  Häuschen: Object.freeze({
    gender: "neuter",
    gloss: "little house",
    plural: Object.freeze({ form: "Häuschen", stem: "Häuschen", ending: "—" }),
  }),
  Brötchen: Object.freeze({
    gender: "neuter",
    gloss: "bread roll",
    plural: Object.freeze({ form: "Brötchen", stem: "Brötchen", ending: "—" }),
  }),
  Märchen: Object.freeze({
    gender: "neuter",
    gloss: "fairy tale",
    plural: Object.freeze({ form: "Märchen", stem: "Märchen", ending: "—" }),
  }),
  Kaninchen: Object.freeze({
    gender: "neuter",
    gloss: "rabbit",
    plural: Object.freeze({ form: "Kaninchen", stem: "Kaninchen", ending: "—" }),
  }),

  // —— -lein (N) ——
  Büchlein: Object.freeze({
    gender: "neuter",
    gloss: "booklet",
    plural: Object.freeze({ form: "Büchlein", stem: "Büchlein", ending: "—" }),
  }),
  Kindlein: Object.freeze({
    gender: "neuter",
    gloss: "little child",
    plural: Object.freeze({ form: "Kindlein", stem: "Kindlein", ending: "—" }),
  }),
  Fräulein: Object.freeze({
    gender: "neuter",
    gloss: "young woman (dated)",
    plural: Object.freeze({ form: "Fräulein", stem: "Fräulein", ending: "—" }),
  }),

  // —— -ment (N) ——
  Instrument: Object.freeze({
    gender: "neuter",
    gloss: "instrument",
    plural: Object.freeze({ form: "Instrumente", stem: "Instrument", ending: "e" }),
  }),
  Dokument: Object.freeze({
    gender: "neuter",
    gloss: "document",
    plural: Object.freeze({ form: "Dokumente", stem: "Dokument", ending: "e" }),
  }),
  Experiment: Object.freeze({
    gender: "neuter",
    gloss: "experiment",
    plural: Object.freeze({ form: "Experimente", stem: "Experiment", ending: "e" }),
  }),
  Argument: Object.freeze({
    gender: "neuter",
    gloss: "argument",
    plural: Object.freeze({ form: "Argumente", stem: "Argument", ending: "e" }),
  }),
  Monument: Object.freeze({
    gender: "neuter",
    gloss: "monument",
    plural: Object.freeze({ form: "Monumente", stem: "Monument", ending: "e" }),
  }),

  // —— Chart plural exemplars (no strong gender suffix; plurals mode / reference) ——
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
 * Cover each SUFFIX_PATTERNS family; mix in no-cue traps.
 */
export const WUGS = Object.freeze([
  // -ung → F
  Object.freeze({ form: "Klappung", patternId: "suf.ung", intendedGender: "feminine", note: "strong -ung cue" }),
  Object.freeze({ form: "Drömlung", patternId: "suf.ung", intendedGender: "feminine", note: "strong -ung cue" }),
  Object.freeze({ form: "Fnorzung", patternId: "suf.ung", intendedGender: "feminine", note: "strong -ung cue" }),
  Object.freeze({ form: "Spalzung", patternId: "suf.ung", intendedGender: "feminine", note: "strong -ung cue" }),
  Object.freeze({ form: "Wibrung", patternId: "suf.ung", intendedGender: "feminine", note: "strong -ung cue" }),
  Object.freeze({ form: "Tronkung", patternId: "suf.ung", intendedGender: "feminine", note: "strong -ung cue" }),
  Object.freeze({ form: "Glefzung", patternId: "suf.ung", intendedGender: "feminine", note: "strong -ung cue" }),
  Object.freeze({ form: "Murzung", patternId: "suf.ung", intendedGender: "feminine", note: "strong -ung cue" }),

  // -heit → F
  Object.freeze({ form: "Trechheit", patternId: "suf.heit", intendedGender: "feminine", note: "strong -heit cue" }),
  Object.freeze({ form: "Plinheit", patternId: "suf.heit", intendedGender: "feminine", note: "strong -heit cue" }),
  Object.freeze({ form: "Snarheit", patternId: "suf.heit", intendedGender: "feminine", note: "strong -heit cue" }),
  Object.freeze({ form: "Blöbheit", patternId: "suf.heit", intendedGender: "feminine", note: "strong -heit cue" }),
  Object.freeze({ form: "Kwirrheit", patternId: "suf.heit", intendedGender: "feminine", note: "strong -heit cue" }),
  Object.freeze({ form: "Flonkheit", patternId: "suf.heit", intendedGender: "feminine", note: "strong -heit cue" }),

  // -keit → F
  Object.freeze({ form: "Glöbigkeit", patternId: "suf.keit", intendedGender: "feminine", note: "strong -keit cue" }),
  Object.freeze({ form: "Snarfkeit", patternId: "suf.keit", intendedGender: "feminine", note: "strong -keit cue" }),
  Object.freeze({ form: "Plonigkeit", patternId: "suf.keit", intendedGender: "feminine", note: "strong -keit cue" }),
  Object.freeze({ form: "Zwiblichkeit", patternId: "suf.keit", intendedGender: "feminine", note: "strong -keit cue" }),
  Object.freeze({ form: "Drasselkeit", patternId: "suf.keit", intendedGender: "feminine", note: "strong -keit cue" }),
  Object.freeze({ form: "Krumftigkeit", patternId: "suf.keit", intendedGender: "feminine", note: "strong -keit cue" }),

  // -schaft → F
  Object.freeze({ form: "Norkschaft", patternId: "suf.schaft", intendedGender: "feminine", note: "strong -schaft cue" }),
  Object.freeze({ form: "Blimschaft", patternId: "suf.schaft", intendedGender: "feminine", note: "strong -schaft cue" }),
  Object.freeze({ form: "Quorfschaft", patternId: "suf.schaft", intendedGender: "feminine", note: "strong -schaft cue" }),
  Object.freeze({ form: "Traltschaft", patternId: "suf.schaft", intendedGender: "feminine", note: "strong -schaft cue" }),
  Object.freeze({ form: "Wibschaft", patternId: "suf.schaft", intendedGender: "feminine", note: "strong -schaft cue" }),

  // -ion → F
  Object.freeze({ form: "Tralation", patternId: "suf.ion", intendedGender: "feminine", note: "strong -ion cue" }),
  Object.freeze({ form: "Quorion", patternId: "suf.ion", intendedGender: "feminine", note: "strong -ion cue" }),
  Object.freeze({ form: "Flumption", patternId: "suf.ion", intendedGender: "feminine", note: "strong -ion cue" }),
  Object.freeze({ form: "Zarkion", patternId: "suf.ion", intendedGender: "feminine", note: "strong -ion cue" }),
  Object.freeze({ form: "Spindation", patternId: "suf.ion", intendedGender: "feminine", note: "strong -ion cue" }),
  Object.freeze({ form: "Gnorpation", patternId: "suf.ion", intendedGender: "feminine", note: "strong -ion cue" }),

  // -ling → M
  Object.freeze({ form: "Murfling", patternId: "suf.ling", intendedGender: "masculine", note: "strong -ling cue" }),
  Object.freeze({ form: "Zwibbling", patternId: "suf.ling", intendedGender: "masculine", note: "strong -ling cue" }),
  Object.freeze({ form: "Knofling", patternId: "suf.ling", intendedGender: "masculine", note: "strong -ling cue" }),
  Object.freeze({ form: "Plorling", patternId: "suf.ling", intendedGender: "masculine", note: "strong -ling cue" }),
  Object.freeze({ form: "Drössling", patternId: "suf.ling", intendedGender: "masculine", note: "strong -ling cue" }),
  Object.freeze({ form: "Quäfling", patternId: "suf.ling", intendedGender: "masculine", note: "strong -ling cue" }),

  // -ismus → M
  Object.freeze({ form: "Flurkismus", patternId: "suf.ismus", intendedGender: "masculine", note: "strong -ismus cue" }),
  Object.freeze({ form: "Prantismus", patternId: "suf.ismus", intendedGender: "masculine", note: "strong -ismus cue" }),
  Object.freeze({ form: "Blimmismus", patternId: "suf.ismus", intendedGender: "masculine", note: "strong -ismus cue" }),
  Object.freeze({ form: "Norkismus", patternId: "suf.ismus", intendedGender: "masculine", note: "strong -ismus cue" }),
  Object.freeze({ form: "Trechismus", patternId: "suf.ismus", intendedGender: "masculine", note: "strong -ismus cue" }),

  // -chen → N
  Object.freeze({ form: "Blöndchen", patternId: "suf.chen", intendedGender: "neuter", note: "diminutive -chen → neuter" }),
  Object.freeze({ form: "Quätschchen", patternId: "suf.chen", intendedGender: "neuter", note: "diminutive -chen → neuter" }),
  Object.freeze({ form: "Mürbchen", patternId: "suf.chen", intendedGender: "neuter", note: "diminutive -chen → neuter" }),
  Object.freeze({ form: "Flönkchen", patternId: "suf.chen", intendedGender: "neuter", note: "diminutive -chen → neuter" }),
  Object.freeze({ form: "Spärzchen", patternId: "suf.chen", intendedGender: "neuter", note: "diminutive -chen → neuter" }),
  Object.freeze({ form: "Wibchen", patternId: "suf.chen", intendedGender: "neuter", note: "diminutive -chen → neuter" }),
  Object.freeze({ form: "Gnorpchen", patternId: "suf.chen", intendedGender: "neuter", note: "diminutive -chen → neuter" }),

  // -lein → N
  Object.freeze({ form: "Tropflein", patternId: "suf.lein", intendedGender: "neuter", note: "diminutive -lein → neuter" }),
  Object.freeze({ form: "Wiblein", patternId: "suf.lein", intendedGender: "neuter", note: "diminutive -lein → neuter" }),
  Object.freeze({ form: "Plörklein", patternId: "suf.lein", intendedGender: "neuter", note: "diminutive -lein → neuter" }),
  Object.freeze({ form: "Snarflein", patternId: "suf.lein", intendedGender: "neuter", note: "diminutive -lein → neuter" }),
  Object.freeze({ form: "Krumftlein", patternId: "suf.lein", intendedGender: "neuter", note: "diminutive -lein → neuter" }),

  // -ment → N
  Object.freeze({ form: "Florbment", patternId: "suf.ment", intendedGender: "neuter", note: "strong -ment cue" }),
  Object.freeze({ form: "Zarkment", patternId: "suf.ment", intendedGender: "neuter", note: "strong -ment cue" }),
  Object.freeze({ form: "Quorpment", patternId: "suf.ment", intendedGender: "neuter", note: "strong -ment cue" }),
  Object.freeze({ form: "Blimment", patternId: "suf.ment", intendedGender: "neuter", note: "strong -ment cue" }),
  Object.freeze({ form: "Drasselment", patternId: "suf.ment", intendedGender: "neuter", note: "strong -ment cue" }),

  // No high-confidence cue → insufficient information
  Object.freeze({ form: "Plork", patternId: null, intendedGender: null, note: "no high-confidence suffix — insufficient information" }),
  Object.freeze({ form: "Tramsel", patternId: null, intendedGender: null, note: "no high-confidence suffix — insufficient information" }),
  Object.freeze({ form: "Gnorp", patternId: null, intendedGender: null, note: "no high-confidence suffix — insufficient information" }),
  Object.freeze({ form: "Wiblek", patternId: null, intendedGender: null, note: "no high-confidence suffix — insufficient information" }),
  Object.freeze({ form: "Drassel", patternId: null, intendedGender: null, note: "no high-confidence suffix — insufficient information" }),
  Object.freeze({ form: "Krumft", patternId: null, intendedGender: null, note: "no high-confidence suffix — insufficient information" }),
  Object.freeze({ form: "Snorb", patternId: null, intendedGender: null, note: "no high-confidence suffix — insufficient information" }),
  Object.freeze({ form: "Flemp", patternId: null, intendedGender: null, note: "no high-confidence suffix — insufficient information" }),
  Object.freeze({ form: "Quorbel", patternId: null, intendedGender: null, note: "no high-confidence suffix — insufficient information" }),
  Object.freeze({ form: "Blimker", patternId: null, intendedGender: null, note: "no high-confidence suffix — insufficient information" }),
  Object.freeze({ form: "Zwarft", patternId: null, intendedGender: null, note: "no high-confidence suffix — insufficient information" }),
  Object.freeze({ form: "Mürpel", patternId: null, intendedGender: null, note: "no high-confidence suffix — insufficient information" }),
  Object.freeze({ form: "Spindelok", patternId: null, intendedGender: null, note: "no high-confidence suffix — insufficient information" }),
  Object.freeze({ form: "Flonkert", patternId: null, intendedGender: null, note: "no high-confidence suffix — insufficient information" }),
]);
