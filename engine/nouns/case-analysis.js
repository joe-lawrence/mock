/**
 * Sentence analysis deck for the Case step after mixed sentences.
 * Choose asks for one label (role or case). Proofread judges a sentence
 * or a label. The array order is the learning sequence.
 */

export const CASE_ANALYSIS_UNIT = "case.analysis";

export const ANALYSIS_ROLE_CHOICES = Object.freeze([
  "Subject",
  "Accusative object",
  "Dative object",
]);

export const ANALYSIS_CASE_CHOICES = Object.freeze([
  "Nominative",
  "Accusative",
  "Dative",
]);

const CHOOSE_SENTENCE = Object.freeze({
  presetId: "choose",
  stimulus: "sentence",
  response: "multi-select",
});

const CHOOSE_VALUE = Object.freeze({
  presetId: "choose",
  stimulus: "value",
  response: "multi-select",
});

const PROOFREAD = Object.freeze({
  presetId: "proofread",
  stimulus: "proofread-frame",
  response: "binary",
});

const ROLE_KEY = Object.freeze({
  Subject: "subject",
  "Accusative object": "accusative-object",
  "Dative object": "dative-object",
});

/**
 * @param {object} card
 */
function freezeCard(card) {
  return Object.freeze({
    ...card,
    choices: Object.freeze([...(card.choices || [])]),
    interaction: Object.freeze({ ...card.interaction }),
  });
}

/**
 * @param {object} item
 * @param {string} stage
 */
function roleCard(item, stage) {
  return freezeCard({
    id: `case.analysis.${item.id}.role`,
    playId: `play:role:${item.id}`,
    unitId: CASE_ANALYSIS_UNIT,
    quizType: "role",
    promptKind: "analysis",
    stage,
    family: "Grammatical role",
    sentence: item.sentence,
    prompt: item.sentence,
    focusPhrase: item.phrase,
    lemma: item.lemma || "",
    gender: item.gender || "",
    case: item.case,
    choices: ANALYSIS_ROLE_CHOICES,
    correct: item.role,
    assesses: `recognize.role.${ROLE_KEY[item.role]}`,
    cue: "",
    answerCue: item.roleCue || `${item.phrase} is the ${item.role.toLowerCase()}.`,
    help: item.help || "Name the role of the underlined phrase.",
    referenceId: item.referenceId || "",
    interaction: CHOOSE_SENTENCE,
  });
}

/**
 * @param {object} item
 * @param {string} stage
 */
function caseCard(item, stage) {
  return freezeCard({
    id: `case.analysis.${item.id}.case`,
    playId: `play:case:${item.id}`,
    unitId: CASE_ANALYSIS_UNIT,
    quizType: "case-name",
    promptKind: "analysis",
    stage,
    family: "Case",
    sentence: item.sentence,
    prompt: item.sentence,
    focusPhrase: item.phrase,
    lemma: item.lemma || "",
    gender: item.gender || "",
    case: item.case,
    choices: ANALYSIS_CASE_CHOICES,
    correct: item.case,
    assesses: `recognize.case.${item.case.toLowerCase()}`,
    cue: "",
    answerCue: item.caseCue || `${item.phrase} is ${item.case.toLowerCase()}.`,
    help: item.help || "Name the case of the underlined phrase.",
    referenceId: item.referenceId || "",
    interaction: CHOOSE_SENTENCE,
  });
}

/**
 * Role card, then case card, for the same highlighted phrase.
 * @param {readonly object[]} items
 * @param {string} stage
 */
function pairs(items, stage) {
  /** @type {object[]} */
  const cards = [];
  for (const item of items) {
    cards.push(roleCard(item, stage), caseCard(item, stage));
  }
  return cards;
}

const GEFALLEN_HELP =
  "Das Buch is the grammatical subject, nominative. dem Mann is the dative object, the person who likes the book. English makes that person the subject of “like.”";

const TRANSITIVE = pairs(
  [
    {
      id: "sieht-mann",
      sentence: "Der Mann sieht den Hund.",
      phrase: "Der Mann",
      lemma: "Mann",
      gender: "masculine",
      role: "Subject",
      case: "Nominative",
    },
    {
      id: "sieht-hund",
      sentence: "Der Mann sieht den Hund.",
      phrase: "den Hund",
      lemma: "Hund",
      gender: "masculine",
      role: "Accusative object",
      case: "Accusative",
    },
  ],
  "transitive"
);

const DATIVE_VERB = pairs(
  [
    {
      id: "hilft-lehrer",
      sentence: "Der Lehrer hilft dem Schüler.",
      phrase: "Der Lehrer",
      lemma: "Lehrer",
      gender: "masculine",
      role: "Subject",
      case: "Nominative",
    },
    {
      id: "hilft-schueler",
      sentence: "Der Lehrer hilft dem Schüler.",
      phrase: "dem Schüler",
      lemma: "Schüler",
      gender: "masculine",
      role: "Dative object",
      case: "Dative",
    },
  ],
  "dative-verb"
);

const THREE_PHRASE = pairs(
  [
    {
      id: "gibt-ich",
      sentence: "Ich gebe dem Kind den Ball.",
      phrase: "Ich",
      lemma: "Ich",
      role: "Subject",
      case: "Nominative",
    },
    {
      id: "gibt-kind",
      sentence: "Ich gebe dem Kind den Ball.",
      phrase: "dem Kind",
      lemma: "Kind",
      gender: "neuter",
      role: "Dative object",
      case: "Dative",
    },
    {
      id: "gibt-ball",
      sentence: "Ich gebe dem Kind den Ball.",
      phrase: "den Ball",
      lemma: "Ball",
      gender: "masculine",
      role: "Accusative object",
      case: "Accusative",
    },
    {
      id: "zeigt-frau",
      sentence: "Die Frau zeigt dem Mann das Buch.",
      phrase: "Die Frau",
      lemma: "Frau",
      gender: "feminine",
      role: "Subject",
      case: "Nominative",
    },
    {
      id: "zeigt-mann",
      sentence: "Die Frau zeigt dem Mann das Buch.",
      phrase: "dem Mann",
      lemma: "Mann",
      gender: "masculine",
      role: "Dative object",
      case: "Dative",
    },
    {
      id: "zeigt-buch",
      sentence: "Die Frau zeigt dem Mann das Buch.",
      phrase: "das Buch",
      lemma: "Buch",
      gender: "neuter",
      role: "Accusative object",
      case: "Accusative",
    },
  ],
  "three-phrase"
);

const REQUIREMENTS = [
  ["sehen", "the person or thing seen", "Accusative", "sehen takes the accusative for the person or thing seen."],
  ["haben", "the thing had", "Accusative", "haben takes the accusative for the thing had."],
  ["für", "the noun after für", "Accusative", "für takes the accusative for the noun after für."],
  ["ohne", "the noun after ohne", "Accusative", "ohne takes the accusative for the noun after ohne."],
  ["brauchen", "the thing needed", "Accusative", "brauchen takes the accusative for the thing needed."],
  ["suchen", "the thing sought", "Accusative", "suchen takes the accusative for the thing sought."],
  ["nehmen", "the thing taken", "Accusative", "nehmen takes the accusative for the thing taken."],
  ["finden", "the thing found", "Accusative", "finden takes the accusative for the thing found."],
  [
    "warten auf",
    "the noun after auf",
    "Accusative",
    "In warten auf, the noun after auf is accusative.",
  ],
  ["helfen", "the person being helped", "Dative", "helfen takes the dative for the person being helped."],
  ["mit", "the noun after mit", "Dative", "mit takes the dative for the noun after mit."],
  ["aus", "the noun after aus", "Dative", "aus takes the dative for the noun after aus."],
  ["danken", "the person thanked", "Dative", "danken takes the dative for the person thanked."],
  [
    "gefallen",
    "the person who likes it",
    "Dative",
    "gefallen takes the dative for the person who likes it. The thing that pleases them is the subject.",
  ],
  ["passen zu", "the noun after zu", "Dative", "In passen zu, the noun after zu is dative."],
].map(([name, target, grammaticalCase, answerCue]) => {
  const id = String(name).replace(/\s+/g, "-");
  return freezeCard({
    id: `case.analysis.req.${id}`,
    playId: `play:requirement:${id}`,
    unitId: CASE_ANALYSIS_UNIT,
    quizType: "case-requirement",
    promptKind: "analysis",
    stage: "requirements",
    family: "Case requirements",
    sentence: "",
    prompt: `${name} — ${target}`,
    focusPhrase: "",
    lemma: "",
    gender: "",
    case: grammaticalCase,
    choices: ANALYSIS_CASE_CHOICES,
    correct: grammaticalCase,
    assesses: `apply.${id}.${grammaticalCase.toLowerCase()}`,
    cue: "",
    answerCue,
    help: "Pick the case this familiar construction requires for the phrase named here.",
    referenceId: name === "gefallen" ? "case.verb.gefallen" : "",
    interaction: CHOOSE_VALUE,
  });
});

const PROOF_CARDS = [
  {
    id: "article-sieht",
    foil: "article",
    prompt: "Der Mann sieht dem Hund.",
    sentence: "Der Mann sieht den Hund.",
    focusPhrase: "dem Hund",
    cue: "",
    correct: "Falsch",
    assesses: "judge.article.sehen.accusative",
    answerCue: "sehen takes an accusative object: den Hund.",
    help: "Decide whether the article in this sentence is the one this construction takes.",
  },
  {
    id: "article-hilft",
    foil: "article",
    prompt: "Der Lehrer hilft dem Schüler.",
    sentence: "Der Lehrer hilft dem Schüler.",
    focusPhrase: "dem Schüler",
    cue: "",
    correct: "Richtig",
    assesses: "judge.article.helfen.dative",
    answerCue: "helfen takes the dative: dem Schüler.",
    help: "Decide whether the article in this sentence is the one this construction takes.",
  },
  {
    id: "article-gibt",
    foil: "article",
    prompt: "Ich gebe den Kind den Ball.",
    sentence: "Ich gebe dem Kind den Ball.",
    focusPhrase: "den Kind",
    cue: "",
    correct: "Falsch",
    assesses: "judge.article.geben.dative",
    answerCue: "The person given something is dative: dem Kind.",
    help: "Decide whether the article in this sentence is the one this construction takes.",
  },
  {
    id: "article-zeigt",
    foil: "article",
    prompt: "Die Frau zeigt dem Mann den Buch.",
    sentence: "Die Frau zeigt dem Mann das Buch.",
    focusPhrase: "den Buch",
    cue: "",
    correct: "Falsch",
    assesses: "judge.article.zeigen.accusative",
    answerCue: "The thing shown is accusative: das Buch.",
    help: "Decide whether the article in this sentence is the one this construction takes.",
  },
  {
    id: "role-hund",
    foil: "role",
    prompt: "Der Mann sieht den Hund.",
    sentence: "Der Mann sieht den Hund.",
    focusPhrase: "den Hund",
    cue: "Dative object",
    correct: "Falsch",
    assesses: "judge.role.accusative-object",
    answerCue: "den Hund is the accusative object.",
    help: "Decide whether this role label matches the underlined phrase.",
  },
  {
    id: "role-lehrer",
    foil: "role",
    prompt: "Der Lehrer hilft dem Schüler.",
    sentence: "Der Lehrer hilft dem Schüler.",
    focusPhrase: "Der Lehrer",
    cue: "Subject",
    correct: "Richtig",
    assesses: "judge.role.subject",
    answerCue: "Der Lehrer is the subject.",
    help: "Decide whether this role label matches the underlined phrase.",
  },
  {
    id: "role-kind",
    foil: "role",
    prompt: "Ich gebe dem Kind den Ball.",
    sentence: "Ich gebe dem Kind den Ball.",
    focusPhrase: "dem Kind",
    cue: "Accusative object",
    correct: "Falsch",
    assesses: "judge.role.dative-object",
    answerCue: "dem Kind is the dative object.",
    help: "Decide whether this role label matches the underlined phrase.",
  },
  {
    id: "role-buch",
    foil: "role",
    prompt: "Die Frau zeigt dem Mann das Buch.",
    sentence: "Die Frau zeigt dem Mann das Buch.",
    focusPhrase: "das Buch",
    cue: "Accusative object",
    correct: "Richtig",
    assesses: "judge.role.accusative-object",
    answerCue: "das Buch is the accusative object.",
    help: "Decide whether this role label matches the underlined phrase.",
  },
  {
    id: "case-schueler",
    foil: "case",
    prompt: "Der Lehrer hilft dem Schüler.",
    sentence: "Der Lehrer hilft dem Schüler.",
    focusPhrase: "dem Schüler",
    cue: "Accusative",
    correct: "Falsch",
    assesses: "judge.case.dative",
    answerCue: "dem Schüler is dative.",
    help: "Decide whether this case label matches the underlined phrase.",
  },
  {
    id: "case-mann",
    foil: "case",
    prompt: "Der Mann sieht den Hund.",
    sentence: "Der Mann sieht den Hund.",
    focusPhrase: "Der Mann",
    cue: "Nominative",
    correct: "Richtig",
    assesses: "judge.case.nominative",
    answerCue: "Der Mann is nominative.",
    help: "Decide whether this case label matches the underlined phrase.",
  },
  {
    id: "case-ball",
    foil: "case",
    prompt: "Ich gebe dem Kind den Ball.",
    sentence: "Ich gebe dem Kind den Ball.",
    focusPhrase: "den Ball",
    cue: "Dative",
    correct: "Falsch",
    assesses: "judge.case.accusative",
    answerCue: "den Ball is accusative.",
    help: "Decide whether this case label matches the underlined phrase.",
  },
].map((item) =>
  freezeCard({
    id: `case.analysis.proof.${item.id}`,
    playId: `play:proof:${item.id}`,
    unitId: CASE_ANALYSIS_UNIT,
    quizType: "proofread",
    promptKind: "analysis",
    stage: "proofread",
    family: "Proofread",
    foil: item.foil,
    sentence: item.sentence,
    prompt: item.prompt,
    focusPhrase: item.focusPhrase,
    lemma: "",
    gender: "",
    choices: ["Richtig", "Falsch"],
    correct: item.correct,
    assesses: item.assesses,
    cue: item.cue,
    answerCue: item.answerCue,
    help: item.help,
    referenceId: "",
    interaction: PROOFREAD,
  })
);

const GEFALLEN = pairs(
  [
    {
      id: "gefaellt-buch",
      sentence: "Das Buch gefällt dem Mann.",
      phrase: "Das Buch",
      lemma: "Buch",
      gender: "neuter",
      role: "Subject",
      case: "Nominative",
      roleCue: "Das Buch is the grammatical subject. The book pleases the man.",
      caseCue: "Das Buch is nominative because it is the subject.",
      help: GEFALLEN_HELP,
      referenceId: "case.verb.gefallen",
    },
    {
      id: "gefaellt-mann",
      sentence: "Das Buch gefällt dem Mann.",
      phrase: "dem Mann",
      lemma: "Mann",
      gender: "masculine",
      role: "Dative object",
      case: "Dative",
      roleCue: "dem Mann is the dative object, the person who likes the book.",
      caseCue: "dem Mann is dative. English makes this person the subject of “like,” but the German subject is Das Buch.",
      help: GEFALLEN_HELP,
      referenceId: "case.verb.gefallen",
    },
  ],
  "gefallen"
);

/**
 * Ordered practice deck. Case identification on mixed sentences stays on
 * that unit. This deck starts at grammatical roles.
 * @returns {readonly object[]}
 */
export function buildCaseAnalysisDeck() {
  return Object.freeze([
    ...TRANSITIVE,
    ...DATIVE_VERB,
    ...THREE_PHRASE,
    ...REQUIREMENTS,
    ...PROOF_CARDS,
    ...GEFALLEN,
  ]);
}
