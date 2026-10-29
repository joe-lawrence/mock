/**
 * Case questions. Each question has one assesses id.
 * An unguided miss does not also record the article-form or construction skills.
 *
 * Play deck progression, per item, using shells that already exist:
 * 1. proofread — judge a sentence (proofread × binary). Right and wrong
 *    articles are both dealt. This is error detection, not production.
 * 2. One later ask, rotating so a unit is not one quiz type:
 *    - sentence — pick the article in the existing sentence blank
 *    - produce — type the changed article from the nominative citation
 *    - listen — hear the sentence, pick the article
 *    - build — assemble the noun phrase from chips
 * Unchanged articles are not typed: die → die is not production.
 * case-name (pick one of Nominative / Accusative / Dative) is only dealt
 * when the unit contains all three cases, so the answer is not constant.
 * Typed answers are the article or noun alone, not a blank inside a sentence.
 * Contractions such as zum and zur are reference notes, not graded forms.
 */

import {
  composeCaseAccusativeItems,
  composeCaseFrameItems,
  CASE_ACCUSATIVE_CONCEPTS,
  CASE_ACC_MASC_GENDERS,
  CASE_ACC_UNCHANGED_GENDERS,
  CASE_FRAME_UNITS,
} from "./practice-compose.js";
import { articleForm, nounAnalysis } from "./noun.js";
import { buildCaseAnalysisDeck, CASE_ANALYSIS_UNIT } from "./case-analysis.js";

export { buildCaseAnalysisDeck, CASE_ANALYSIS_UNIT };

export const CASE_PROMPT = Object.freeze({
  RECOGNIZE: "recognize",
  GUIDED: "guided",
  UNGUIDED: "unguided",
  CASE_NAME: "case-name",
  CONVERT: "convert",
});

/** Case-naming choices. The case itself is the answer, not the article. */
export const CASE_NAME_CHOICES = Object.freeze([
  "Nominative",
  "Accusative",
  "Dative",
]);

const PROMPT_ORDER = Object.freeze({
  recognize: 0,
  guided: 1,
  unguided: 2,
});

const UNIT_GENDERS = Object.freeze({
  "case.acc.masc": CASE_ACC_MASC_GENDERS,
  "case.acc.unchanged": CASE_ACC_UNCHANGED_GENDERS,
});

const TARGET_ORDER = Object.freeze({
  article: 0,
  noun: 1,
});

/**
 * @param {string} contextId
 */
export function caseVerbForContext(contextId) {
  if (String(contextId).includes("sehe")) return "sehen";
  if (String(contextId).includes("habe")) return "haben";
  return null;
}

/**
 * @param {string} verb
 */
function constructionCue(verb) {
  if (verb === "sehen") return "sehen takes the accusative.";
  if (verb === "haben") return "haben takes the accusative.";
  return "";
}

/**
 * @param {object} item
 */
function constructionOf(item) {
  return item.construction || caseVerbForContext(item.contextId);
}

/**
 * @param {{ gender?: string, articleKind?: string|null, contextId?: string, case?: string, number?: string, target?: string, construction?: string, lemma?: string }} item
 * @param {"recognize"|"guided"|"unguided"} promptKind
 */
export function assessesFor(item, promptKind) {
  const grammaticalCase = item.case || "accusative";
  const construction = constructionOf(item);
  if (item.target === "noun") {
    if (promptKind === CASE_PROMPT.RECOGNIZE) {
      return `recognize.noun.${item.lemma}.dative-plural`;
    }
    if (promptKind === CASE_PROMPT.GUIDED) {
      return `lexical.${item.lemma}.dative-plural`;
    }
    return `apply.${construction}.dative.noun.${item.lemma}`;
  }
  if (item.number === "plural") {
    if (promptKind === CASE_PROMPT.RECOGNIZE) {
      return `recognize.plural.${grammaticalCase}`;
    }
    if (promptKind === CASE_PROMPT.GUIDED) {
      return `article.plural.${grammaticalCase}`;
    }
    return `apply.${construction}.${grammaticalCase}.plural`;
  }
  if (promptKind === CASE_PROMPT.RECOGNIZE) {
    return `recognize.${item.gender}.${grammaticalCase}.${item.articleKind}`;
  }
  if (promptKind === CASE_PROMPT.GUIDED) {
    return `article.${item.gender}.${grammaticalCase}.${item.articleKind}`;
  }
  return `apply.${construction}.${grammaticalCase}.${item.gender}.${item.articleKind}`;
}

/**
 * @param {object} question
 */
function followupProbes(question) {
  if (question.target === "noun") {
    return [`lexical.${question.lemma}.dative-plural`];
  }
  const grammaticalCase = question.case || "accusative";
  const construction = question.construction || question.verb;
  if (question.number === "plural") {
    return [
      `article.plural.${grammaticalCase}`,
      `construction.${construction}.${grammaticalCase}`,
    ];
  }
  return [
    `article.${question.gender}.${grammaticalCase}.${question.articleKind}`,
    `construction.${construction}.${grammaticalCase}`,
  ];
}

/**
 * Questions for one playable unit, recognition then guided then unguided.
 * @param {string} unitId
 */
function itemsForUnit(unitId) {
  const genders = UNIT_GENDERS[unitId];
  if (genders) {
    return composeCaseAccusativeItems({
      concepts: CASE_ACCUSATIVE_CONCEPTS,
      genders,
    });
  }
  const spec = CASE_FRAME_UNITS[unitId];
  if (!spec) return [];
  return composeCaseFrameItems(unitId, { concepts: spec.concepts });
}

export function buildCaseUnitQuestions(unitId) {
  const items = itemsForUnit(unitId);
  if (!items.length) return Object.freeze([]);
  const questions = [];
  for (const item of items) {
    const construction = constructionOf(item);
    const blank = `${item.before}___${item.after}`;
    const shared = {
      unitId,
      lemma: item.lemma,
      gender: item.gender,
      articleKind: item.articleKind,
      contextId: item.contextId,
      verb: construction,
      construction,
      case: item.case || "accusative",
      number: item.number || "singular",
      target: item.target || "article",
      focusLemma: !!item.focusLemma,
      before: item.before || "",
      after: item.after || "",
      nounForm: item.nounForm || item.lemma,
      correct: item.correct,
      choices: item.choices,
      sentence: item.sentence,
      listen: !!item.listen,
    };
    questions.push({
      ...shared,
      id: `${unitId}.recognize.${item.contextId}.${item.lemma}`,
      promptKind: CASE_PROMPT.RECOGNIZE,
      assesses: assessesFor(item, CASE_PROMPT.RECOGNIZE),
      prompt: item.sentence,
      cue: "",
    });
    questions.push({
      ...shared,
      id: `${unitId}.guided.${item.contextId}.${item.lemma}`,
      promptKind: CASE_PROMPT.GUIDED,
      assesses: assessesFor(item, CASE_PROMPT.GUIDED),
      prompt: blank,
      cue: item.guidedCue || constructionCue(construction),
    });
    questions.push({
      ...shared,
      id: `${unitId}.unguided.${item.contextId}.${item.lemma}`,
      promptKind: CASE_PROMPT.UNGUIDED,
      assesses: assessesFor(item, CASE_PROMPT.UNGUIDED),
      prompt: blank,
      cue: "",
    });
  }
  questions.sort((a, b) => {
    const target = (TARGET_ORDER[a.target] ?? 0) - (TARGET_ORDER[b.target] ?? 0);
    if (target) return target;
    const group = `${a.contextId}\0${a.lemma}`.localeCompare(
      `${b.contextId}\0${b.lemma}`,
      "de"
    );
    if (group) return group;
    const kind = PROMPT_ORDER[a.promptKind] - PROMPT_ORDER[b.promptKind];
    if (kind) return kind;
    return a.id.localeCompare(b.id, "de");
  });
  return Object.freeze(questions.map((q) => Object.freeze(q)));
}

/**
 * @param {string} grammaticalCase
 */
export function caseNameLabel(grammaticalCase) {
  if (grammaticalCase === "accusative") return "Accusative";
  if (grammaticalCase === "dative") return "Dative";
  if (grammaticalCase === "nominative") return "Nominative";
  return "";
}

/**
 * Nominative citation the conversion card starts from ("der Hund", "die Kinder").
 * @param {object} question
 */
export function caseCitationForm(question) {
  if (!question) return "";
  if (question.target === "noun") {
    return nounAnalysis(question.lemma || "").plural?.form || question.lemma || "";
  }
  const kind = question.articleKind === "indefinite" ? "indefinite" : "definite";
  const number = question.number === "plural" ? "plural" : "singular";
  let article = "";
  try {
    article = articleForm(question.gender, { kind, number, case: "nominative" });
  } catch {
    return question.lemma || "";
  }
  const noun =
    number === "plural"
      ? nounAnalysis(question.lemma || "").plural?.form || question.lemma
      : question.lemma;
  return `${article} ${noun}`.trim();
}

/**
 * True when the target form differs from the nominative citation.
 * die → die is not a conversion card.
 * @param {object} question
 */
export function caseFormChanges(question) {
  if (!question) return false;
  if (question.target === "noun") {
    const from = caseCitationForm(question);
    return !!from && from !== question.correct;
  }
  const from = caseCitationForm(question).split(/\s+/)[0] || "";
  return !!from && from.toLowerCase() !== String(question.correct || "").toLowerCase();
}

/**
 * Article + noun the case-name card asks about.
 * @param {object} question
 */
export function caseFocusPhrase(question) {
  const sentence = String(question?.sentence || "");
  const article = String(question?.correct || "");
  const at = sentence.indexOf(`${article} `);
  if (at < 0) return "";
  const noun = sentence
    .slice(at + article.length + 1)
    .split(/\s/)[0]
    .replace(/[?!.,;:]+$/g, "");
  if (!noun) return "";
  return `${article} ${noun}`;
}

/** Stimulus × response pairs already registered as presets. Strings match interaction-presets.js. */
const PLAY_INTERACTION = Object.freeze({
  "case-name": Object.freeze({
    presetId: "choose",
    stimulus: "sentence",
    response: "multi-select",
  }),
  sentence: Object.freeze({
    presetId: "sentence",
    stimulus: "sentence",
    response: "multi-select",
  }),
  proofread: Object.freeze({
    presetId: "proofread",
    stimulus: "proofread-frame",
    response: "binary",
  }),
  build: Object.freeze({
    presetId: "build",
    stimulus: "value",
    response: "build-chips",
  }),
  listen: Object.freeze({
    presetId: "listen",
    stimulus: "tts",
    response: "multi-select",
  }),
  "listen-type": Object.freeze({
    presetId: "listen-type",
    stimulus: "tts",
    response: "freeform",
  }),
  "sentence-type": Object.freeze({
    presetId: "sentence-type",
    stimulus: "sentence",
    response: "freeform",
  }),
  type: Object.freeze({
    presetId: "produce",
    stimulus: "value",
    response: "freeform",
  }),
});

/**
 * @param {string} text
 * @param {number} mod
 */
function stableMod(text, mod) {
  let h = 0;
  for (const ch of String(text || "")) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  return mod ? h % mod : h;
}

/**
 * @param {string[]} items
 * @param {string} seed
 */
function stableShuffle(items, seed) {
  const arr = [...items];
  let h = stableMod(seed, 997) || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    h = (h * 33 + i + 1) >>> 0;
    const j = h % (i + 1);
    const swap = arr[i];
    arr[i] = arr[j];
    arr[j] = swap;
  }
  return arr;
}

/**
 * A plausible wrong article the learner could pick. Stays inside forms
 * already met: nominative leftover, masculine accusative overapplied,
 * or accusative where the construction wants dative.
 * @param {object} question
 */
export function foilArticle(question) {
  if (!question || question.target === "noun") {
    return (question?.choices || []).find((choice) => choice !== question.correct) || "";
  }
  const correct = String(question.correct || "");
  const lower = correct.toLowerCase();
  const gender = question.gender;
  let foil = "";
  if (lower === "den") foil = "der";
  else if (lower === "einen") foil = "ein";
  else if (lower === "dem") foil = "den";
  else if (lower === "einem") foil = "einen";
  else if (lower === "der" && gender === "feminine") foil = "die";
  else if (lower === "der") foil = "den";
  else if (lower === "die" || lower === "das") foil = "den";
  else if (lower === "ein" || lower === "eine") foil = "einen";
  else if (lower === "einer") foil = "eine";
  else {
    foil = (question.choices || []).find((choice) => choice.toLowerCase() !== lower) || "";
  }
  if (!foil || foil.toLowerCase() === lower) return "";
  if (correct[0] && correct[0] !== lower[0]) {
    foil = foil.charAt(0).toUpperCase() + foil.slice(1);
  }
  return foil;
}

/**
 * @param {object} question
 * @param {string} article
 */
function sentenceWithArticle(question, article) {
  return `${question.before || ""}${article}${question.after || ""}`;
}

/**
 * Chips and the target sequence for a build card.
 * @param {object} question
 */
function buildSpec(question) {
  if (question.target === "noun") {
    const plural = nounAnalysis(question.lemma || "").plural?.form || "";
    const correct = String(question.correct || "");
    const lemma = question.lemma || "";
    if (plural && correct.startsWith(plural) && correct.length > plural.length) {
      const ending = correct.slice(plural.length);
      return {
        chips: stableShuffle([plural, ending, lemma], question.id),
        target: [plural, ending],
        spaced: false,
      };
    }
    if (plural && correct === plural && lemma && correct.startsWith(lemma) && correct.length > lemma.length) {
      const ending = correct.slice(lemma.length);
      const distractor = ending === "n" ? "en" : "n";
      return {
        chips: stableShuffle([lemma, ending, distractor], question.id),
        target: [lemma, ending],
        spaced: false,
      };
    }
    return {
      chips: stableShuffle([...(question.choices || [correct])], question.id),
      target: [correct],
      spaced: false,
    };
  }
  const foil = foilArticle(question);
  const noun = question.nounForm || question.lemma;
  const chips = [question.correct, foil, noun].filter((part, i, all) => part && all.indexOf(part) === i);
  return {
    chips: stableShuffle(chips, question.id),
    target: [question.correct, noun],
    spaced: true,
  };
}

/**
 * The second ask on an item. Unchanged articles are judged, selected, heard,
 * or built — not typed, because the citation and the target are the same word.
 * @param {number} index
 * @param {object} question
 */
function productionRole(index, question) {
  if (question?.target === "noun") return index % 2 === 0 ? "build" : "type";
  if (!caseFormChanges(question)) {
    return ["sentence", "build", "listen"][index % 3];
  }
  return ["sentence", "type", "listen", "build"][index % 4];
}

/**
 * @param {number} index
 * @param {object} question
 * @param {boolean} allowCaseName
 */
function playRolesForSlot(index, question, allowCaseName) {
  /** @type {string[]} */
  const roles = [];
  if (allowCaseName && question?.target !== "noun" && index % 2 === 0) {
    roles.push("case-name");
  }
  roles.push("proofread");
  const production = productionRole(index, question);
  roles.push(production);
  if (question?.listen && question.target !== "noun" && production !== "listen") {
    roles.push("listen");
  }
  if (question?.target !== "noun") {
    if (question?.listen) roles.push("listen-type");
    roles.push("sentence-type");
  }
  return roles;
}

/**
 * True when article slots include a nominative, an accusative, and a dative.
 * @param {readonly { guidedQuestion?: object|null, unguidedQuestion?: object|null }[]} slots
 */
function unitOffersEveryCase(slots) {
  const cases = new Set();
  for (const slot of slots) {
    const question = slot.guidedQuestion || slot.unguidedQuestion;
    if (!question || question.target === "noun" || !question.case) continue;
    cases.add(question.case);
  }
  return cases.has("nominative") && cases.has("accusative") && cases.has("dative");
}

function caseNameCard(slot) {
  const base = slot.guidedQuestion || slot.unguidedQuestion;
  return Object.freeze({
    ...base,
    id: `${base.id}.play.case-name`,
    playId: `play:case-name:${base.target}:${base.contextId}:${base.lemma}`,
    quizType: "case-name",
    promptKind: CASE_PROMPT.CASE_NAME,
    assesses: `recognize.case.${base.case}.${base.gender || base.lemma}.${base.articleKind || "noun"}`,
    prompt: base.sentence,
    cue: "",
    answerCue: slot.guidedQuestion?.cue || "",
    focusPhrase: caseFocusPhrase(base),
    choices: CASE_NAME_CHOICES,
    correct: caseNameLabel(base.case),
    family: "",
    interaction: PLAY_INTERACTION["case-name"],
  });
}

function proofreadCard(slot, showCorrect) {
  const base = slot.guidedQuestion || slot.unguidedQuestion;
  const noun = base.target === "noun";
  const foil = noun
    ? (base.choices || []).find((choice) => choice !== base.correct) || ""
    : foilArticle(base);
  const shown = showCorrect || !foil
    ? base.sentence
    : noun
      ? `${base.before || ""}${foil}.`
      : sentenceWithArticle(base, foil);
  const ok = shown === base.sentence;
  const kind = base.articleKind || "noun";
  return Object.freeze({
    ...base,
    id: `${base.id}.play.proofread`,
    playId: `play:proofread:${base.target}:${base.contextId}:${base.lemma}`,
    quizType: "proofread",
    promptKind: "proofread",
    assesses: noun
      ? `judge.noun.${base.lemma}.dative-plural`
      : `judge.${base.construction}.${base.case}.${base.gender}.${kind}`,
    prompt: shown,
    cue: "",
    answerCue: slot.guidedQuestion?.cue || "",
    choices: Object.freeze(["Richtig", "Falsch"]),
    correct: ok ? "Richtig" : "Falsch",
    family: "",
    focusPhrase: "",
    interaction: PLAY_INTERACTION.proofread,
  });
}

function typeCard(slot) {
  const base = slot.guidedQuestion || slot.unguidedQuestion;
  const noun = base.target === "noun";
  return Object.freeze({
    ...base,
    id: `${base.id}.play.type`,
    playId: `play:type:${base.target}:${base.contextId}:${base.lemma}`,
    quizType: "type",
    promptKind: CASE_PROMPT.GUIDED,
    assesses: slot.guidedQuestion?.assesses || base.assesses,
    prompt: caseCitationForm(base),
    cue: "",
    answerCue: slot.guidedQuestion?.cue || "",
    choices: Object.freeze([]),
    correct: base.correct,
    family: noun ? "Dative plural" : caseNameLabel(base.case),
    focusPhrase: "",
    interaction: PLAY_INTERACTION.type,
  });
}

function listenTypeCard(slot) {
  const base = slot.guidedQuestion || slot.unguidedQuestion;
  const kind = base.articleKind || "noun";
  return Object.freeze({
    ...base,
    id: `${base.id}.play.listen-type`,
    playId: `play:listen-type:${base.target}:${base.contextId}:${base.lemma}`,
    quizType: "listen-type",
    promptKind: "listen-type",
    assesses: `produce.heard.${base.case}.${base.gender}.${kind}`,
    prompt: base.sentence,
    cue: "",
    answerCue: slot.guidedQuestion?.cue || "",
    choices: Object.freeze([]),
    correct: base.correct,
    family: "",
    focusPhrase: "",
    interaction: PLAY_INTERACTION["listen-type"],
  });
}

function sentenceTypeCard(slot) {
  const base = slot.unguidedQuestion || slot.guidedQuestion;
  const kind = base.articleKind || "noun";
  return Object.freeze({
    ...base,
    id: `${base.id}.play.sentence-type`,
    playId: `play:sentence-type:${base.target}:${base.contextId}:${base.lemma}`,
    quizType: "sentence-type",
    promptKind: "sentence-type",
    assesses: `produce.sentence.${base.construction}.${base.case}.${base.gender}.${kind}`,
    prompt: `${base.before || ""}___${base.after || ""}`,
    cue: "",
    cueLocked: false,
    answerCue: slot.guidedQuestion?.cue || "",
    choices: Object.freeze([]),
    correct: base.correct,
    family: "",
    focusPhrase: "",
    guidedQuestion: slot.guidedQuestion,
    unguidedQuestion: slot.unguidedQuestion,
    interaction: PLAY_INTERACTION["sentence-type"],
  });
}

function listenCard(slot) {
  const base = slot.guidedQuestion || slot.unguidedQuestion;
  const kind = base.articleKind || "noun";
  return Object.freeze({
    ...base,
    id: `${base.id}.play.listen`,
    playId: `play:listen:${base.target}:${base.contextId}:${base.lemma}`,
    quizType: "listen",
    promptKind: "listen",
    assesses: `recognize.heard.${base.case}.${base.gender}.${kind}`,
    prompt: base.sentence,
    cue: "",
    answerCue: slot.guidedQuestion?.cue || "",
    choices: base.choices,
    correct: base.correct,
    family: "",
    focusPhrase: "",
    interaction: PLAY_INTERACTION.listen,
  });
}

function buildCard(slot) {
  const base = slot.guidedQuestion || slot.unguidedQuestion;
  const spec = buildSpec(base);
  const correct = spec.spaced ? spec.target.join(" ") : spec.target.join("");
  return Object.freeze({
    ...base,
    id: `${base.id}.play.build`,
    playId: `play:build:${base.target}:${base.contextId}:${base.lemma}`,
    quizType: "build",
    promptKind: CASE_PROMPT.UNGUIDED,
    assesses: slot.unguidedQuestion?.assesses || base.assesses,
    prompt: String(base.before || "").trim() || base.construction || "",
    cue: "",
    answerCue: slot.guidedQuestion?.cue || "",
    choices: Object.freeze(spec.chips),
    buildTarget: Object.freeze(spec.target),
    buildSpaced: spec.spaced,
    correct,
    family: "",
    focusPhrase: "",
    interaction: PLAY_INTERACTION.build,
  });
}

function sentenceCard(slot, cueLocked) {
  const base = slot.unguidedQuestion || slot.guidedQuestion;
  return Object.freeze({
    ...base,
    playId: `play:${base.target}:${base.contextId}:${base.lemma}`,
    quizType: "sentence",
    cueLocked: !!cueLocked,
    answerCue: slot.guidedQuestion?.cue || "",
    guidedQuestion: slot.guidedQuestion,
    unguidedQuestion: slot.unguidedQuestion,
    family: "",
    interaction: PLAY_INTERACTION.sentence,
  });
}

/**
 * Play deck for one unit. Recognition stays in the pool.
 * Each item is judged, then asked in one other way. Case-name is added
 * only when Nominative, Accusative, and Dative are all in the unit.
 * @param {readonly object[]} questions
 */
export function buildCasePlayDeck(questions) {
  /** @type {Map<string, { guidedQuestion: object|null, unguidedQuestion: object|null }>} */
  const index = new Map();
  const slots = [];
  for (const question of questions || []) {
    if (!question || question.promptKind === CASE_PROMPT.RECOGNIZE) continue;
    if (question.promptKind !== CASE_PROMPT.GUIDED && question.promptKind !== CASE_PROMPT.UNGUIDED) {
      continue;
    }
    const key = `${question.target}\0${question.contextId}\0${question.lemma}`;
    let slot = index.get(key);
    if (!slot) {
      slot = { guidedQuestion: null, unguidedQuestion: null };
      index.set(key, slot);
      slots.push(slot);
    }
    if (question.promptKind === CASE_PROMPT.GUIDED) slot.guidedQuestion = question;
    else slot.unguidedQuestion = question;
  }

  /** @type {{ key: string, slots: typeof slots }} */
  const groups = [];
  for (const slot of slots) {
    const base = slot.unguidedQuestion || slot.guidedQuestion;
    const key = `${base.target}\0${base.contextId}`;
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.slots.push(slot);
    else groups.push({ key, slots: [slot] });
  }

  const allowCaseName = unitOffersEveryCase(slots);
  /** @type {{ key: string, slot: (typeof slots)[number], roles: string[] }[]} */
  const plans = [];
  let slotIndex = 0;
  for (const group of groups) {
    for (const slot of group.slots) {
      const base = slot.guidedQuestion || slot.unguidedQuestion;
      plans.push({
        key: group.key,
        slot,
        roles: playRolesForSlot(slotIndex, base, allowCaseName),
      });
      slotIndex += 1;
    }
  }
  if (allowCaseName) {
    const covered = new Set(
      plans
        .filter((plan) => plan.roles.includes("case-name"))
        .map((plan) => (plan.slot.guidedQuestion || plan.slot.unguidedQuestion).case)
    );
    for (const grammaticalCase of ["nominative", "accusative", "dative"]) {
      if (covered.has(grammaticalCase)) continue;
      const plan = plans.find((item) => {
        const base = item.slot.guidedQuestion || item.slot.unguidedQuestion;
        return base.target !== "noun" && base.case === grammaticalCase;
      });
      if (plan) plan.roles.unshift("case-name");
    }
  }

  const cards = [];
  const sentenceSeen = new Set();
  for (const plan of plans) {
    for (const role of plan.roles) {
      if (role === "case-name") cards.push(caseNameCard(plan.slot));
      else if (role === "proofread") {
        const base = plan.slot.guidedQuestion || plan.slot.unguidedQuestion;
        const showCorrect = stableMod(`${base.contextId}:${base.lemma}:${base.target}`, 2) === 0;
        cards.push(proofreadCard(plan.slot, showCorrect));
      } else if (role === "type") cards.push(typeCard(plan.slot));
      else if (role === "listen") cards.push(listenCard(plan.slot));
      else if (role === "listen-type") cards.push(listenTypeCard(plan.slot));
      else if (role === "sentence-type") cards.push(sentenceTypeCard(plan.slot));
      else if (role === "build") cards.push(buildCard(plan.slot));
      else {
        const cueLocked = !sentenceSeen.has(plan.key);
        sentenceSeen.add(plan.key);
        cards.push(sentenceCard(plan.slot, cueLocked));
      }
    }
  }
  return Object.freeze(cards);
}

/**
 * Preset ids this unit's practice actually deals, in deck order.
 * @param {string} unitId
 */
export function caseUnitModes(unitId) {
  const ids = [];
  const cards =
    unitId === CASE_ANALYSIS_UNIT
      ? buildCaseAnalysisDeck()
      : buildCasePlayDeck(buildCaseUnitQuestions(unitId));
  for (const card of cards) {
    const id = card.interaction?.presetId;
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

/**
 * Keep one interaction when a launch names a preset. An empty filter
 * falls back to the full progression so an unknown preset still plays.
 * @param {readonly object[]} deck
 * @param {string|null|undefined} presetId
 */
export function caseDeckForPreset(deck, presetId) {
  if (!presetId) return deck;
  const filtered = (deck || []).filter((card) => card.interaction?.presetId === presetId);
  return filtered.length ? filtered : deck;
}

/**
 * One skill id per attempt. Unguided misses schedule a narrower next question
 * and do not list the component skills as evidence.
 * @param {{ assesses: string, promptKind: string, gender?: string, articleKind?: string, verb?: string, lemma?: string, contextId?: string }} question
 * @param {boolean} correct
 */
export function caseAttemptEvidence(question, correct) {
  const evidenceIds = [question.assesses];
  if (correct || question.promptKind !== CASE_PROMPT.UNGUIDED) {
    return { evidenceIds, componentFollowup: null };
  }
  return {
    evidenceIds,
    componentFollowup: {
      reason: "component_followup",
      lemma: question.lemma,
      contextId: question.contextId,
      probes: followupProbes(question),
    },
  };
}

/**
 * Prefer the guided article question for the same sentence after an unguided miss.
 * @param {readonly object[]} pool
 * @param {{ followup?: { probes?: string[], lemma?: string, contextId?: string }|null, excludeId?: string }} [opts]
 */
export function pickNextCaseQuestion(pool, opts = {}) {
  const list = pool || [];
  const followup = opts.followup;
  if (followup?.probes?.length) {
    const probes = new Set(followup.probes);
    const sameSentence = list.find(
      (q) =>
        q.id !== opts.excludeId &&
        q.promptKind === CASE_PROMPT.GUIDED &&
        probes.has(q.assesses) &&
        q.lemma === followup.lemma &&
        q.contextId === followup.contextId
    );
    if (sameSentence) {
      return { question: sameSentence, reason: "component_followup" };
    }
    const anyGuided = list.find(
      (q) =>
        q.id !== opts.excludeId &&
        q.promptKind === CASE_PROMPT.GUIDED &&
        probes.has(q.assesses)
    );
    if (anyGuided) {
      return { question: anyGuided, reason: "component_followup" };
    }
  }
  const next = list.find((q) => q.id !== opts.excludeId) || list[0] || null;
  return { question: next, reason: next ? "continue" : "empty" };
}
