/**
 * Build presentation exercises from engine truth + scaffolding mode.
 */

import { scaffoldingFor, TEMPLATES, EXERCISE_LAYER_VERSION } from "./modes.js";
import {
  articleExercise,
  pluralExercise,
  wugExercise,
  categoryGenderRecognitionExercise,
  categoryArticleApplicationExercise,
  categoryGenderImposterExercise,
  categorySentenceValidationExercise,
} from "../nouns/index.js";
import {
  constructionExercise,
  decimalExercise,
  moneyExercise,
  fractionExercise,
  mixedFractionExercise,
  clockExercise,
  digitalTimeExercise,
  durationExercise,
  ordinalExercise,
  ordinalAmExercise,
  weekdayExercise,
  monthExercise,
  calendarDateExercise,
  measureExercise,
} from "../numbers/index.js";

function splitCue(lemma, cue) {
  const ending = String(cue || "").replace(/^-/, "");
  if (ending && lemma.endsWith(ending)) {
    return { stem: lemma.slice(0, -ending.length), ending };
  }
  return { stem: lemma, ending: "" };
}

/**
 * @param {string} lemma
 * @param {{ mode?: import("./modes.js").DifficultyMode, answerParts?: object[] }} [opts]
 */
export function createNounArticleExercise(lemma, opts = {}) {
  const mode = opts.mode || "assisted";
  const truth = articleExercise(lemma);
  const templateId = TEMPLATES.NOUN_ARTICLE_CHOICE;
  const scaffolding = scaffoldingFor(templateId, mode);
  const { stem, ending } = splitCue(truth.lemma, truth.cue);

  return {
    id: `ex.${templateId}.${truth.lemma}.${mode}`,
    templateId,
    territoryId: "nouns",
    mode,
    layerVersion: EXERCISE_LAYER_VERSION,
    target: {
      lemma: truth.lemma,
      grammaticalState: {
        case: "nominative",
        number: "singular",
        gender: truth.gender,
      },
    },
    scaffolding,
    prompt: {
      kind: "choose-article",
      lemma: truth.lemma,
      stem,
      ending,
      cue: truth.cue,
      showSuffixBadge: !!(scaffolding.showSuffixBadge && truth.cue),
      translation: scaffolding.showEnglish ? truth.translation : null,
      highlightSuffix: !!(scaffolding.showSuffixMark && ending),
      genderClass: scaffolding.showPromptGenderColors ? truth.gender : null,
    },
    materials: {
      choices: ["der", "die", "das"],
      patternBlurb: truth.pattern,
      cue: truth.cue,
      patternId: truth.patternId,
      answerParts: opts.answerParts || null,
    },
    resolution: {
      article: truth.article,
      gender: truth.gender,
      translation: truth.translation,
      rules: truth.rules,
    },
  };
}

/**
 * Association = same linguistic task as articles, tagged for family mastery tracking.
 * Used by Suffixes / Real Words family drills (not Categories).
 * @param {string} lemma
 * @param {{ mode?: import("./modes.js").DifficultyMode }} [opts]
 */
export function createNounAssociationExercise(lemma, opts = {}) {
  const mode = opts.mode || "assisted";
  const truth = articleExercise(lemma);
  const templateId = TEMPLATES.NOUN_ASSOCIATION_CHOICE;
  const scaffolding = scaffoldingFor(templateId, mode);
  const { stem, ending } = splitCue(truth.lemma, truth.cue);

  return {
    id: `ex.${templateId}.${truth.lemma}.${mode}`,
    templateId,
    territoryId: "nouns",
    mode,
    layerVersion: EXERCISE_LAYER_VERSION,
    target: {
      lemma: truth.lemma,
      grammaticalState: {
        case: "nominative",
        number: "singular",
        gender: truth.gender,
      },
    },
    scaffolding,
    prompt: {
      kind: "associate-gender",
      lemma: truth.lemma,
      stem,
      ending,
      cue: truth.cue,
      showSuffixBadge: false,
      translation: null,
      highlightSuffix: !!(scaffolding.showSuffixMark && ending),
      genderClass: scaffolding.showPromptGenderColors ? truth.gender : null,
    },
    materials: {
      choices: ["der", "die", "das"],
      patternBlurb: truth.pattern,
      cue: truth.cue,
      patternId: truth.patternId,
      familySuffix: truth.cue ? truth.cue.replace(/^-/, "") : null,
    },
    resolution: {
      article: truth.article,
      gender: truth.gender,
      translation: truth.translation,
      rules: truth.rules,
      patternId: truth.patternId,
    },
  };
}

/**
 * Categories — Gender Recognition: examples → associated gender.
 * @param {string} categoryId
 * @param {{ mode?: import("./modes.js").DifficultyMode }} [opts]
 */
export function createNounCategoryGenderRecognitionExercise(categoryId, opts = {}) {
  const mode = opts.mode || "assisted";
  const truth = categoryGenderRecognitionExercise(categoryId);
  const templateId = TEMPLATES.NOUN_CATEGORY_GENDER_RECOGNITION;
  const scaffolding = scaffoldingFor(templateId, mode);

  return {
    id: `ex.${templateId}.${truth.categoryId}.${mode}`,
    templateId,
    territoryId: "nouns",
    mode,
    layerVersion: EXERCISE_LAYER_VERSION,
    target: {
      categoryId: truth.categoryId,
      expectedAssociation: truth.expectedAssociation,
    },
    scaffolding,
    prompt: {
      kind: "category-gender-recognition",
      categoryId: truth.categoryId,
      categoryName: truth.categoryName,
      text: "What gender is associated with this category?",
      description: null,
    },
    materials: {
      choices: [...truth.choices],
      choiceLabels: { ...truth.choiceLabels },
    },
    resolution: {
      expected: truth.expectedAssociation,
      expectedAssociation: truth.expectedAssociation,
      association: truth.association,
      strength: truth.strength,
      categoryName: truth.categoryName,
      feedbackOk: `Correct. ${truth.categoryName} → ${truth.choiceLabel.toLowerCase()} (${truth.strength.replace("_", " ")} shortcut).`,
      feedbackBad: `${truth.categoryName} is associated with ${truth.choiceLabel.toLowerCase()}.`,
    },
  };
}

/**
 * Categories — Article Application: blanked authored sentence → article.
 * @param {string} itemId
 * @param {{ mode?: import("./modes.js").DifficultyMode }} [opts]
 */
export function createNounCategoryArticleApplicationExercise(itemId, opts = {}) {
  const mode = opts.mode || "assisted";
  const truth = categoryArticleApplicationExercise(itemId);
  const templateId = TEMPLATES.NOUN_CATEGORY_ARTICLE_APPLICATION;
  const scaffolding = scaffoldingFor(templateId, mode);

  return {
    id: `ex.${templateId}.${truth.itemId}.${mode}`,
    templateId,
    territoryId: "nouns",
    mode,
    layerVersion: EXERCISE_LAYER_VERSION,
    target: {
      categoryId: truth.categoryId,
      lemma: truth.lemma,
      itemId: truth.itemId,
      expectedArticle: truth.correct,
    },
    scaffolding,
    prompt: {
      kind: "category-article-application",
      categoryId: truth.categoryId,
      categoryName: truth.categoryName,
      lemma: truth.lemma,
      text: truth.promptText,
      header: "",
    },
    materials: {
      choices: [...truth.choices],
      choiceLabels: Object.fromEntries(truth.choices.map((c) => [c, c])),
    },
    resolution: {
      expected: truth.correct,
      expectedAssociation: truth.expectedAssociation,
      association: truth.association,
      strength: truth.strength,
      categoryName: truth.categoryName,
      lemma: truth.lemma,
      feedbackOk: `Correct. ${truth.categoryName} → ${truth.choiceLabel.toLowerCase()} → ${truth.correct}.`,
      feedbackBad: `${truth.categoryName} → ${truth.choiceLabel.toLowerCase()} → ${truth.correct}.`,
    },
  };
}

/**
 * Categories — Gender Imposter: find the noun with the odd lexical gender.
 * @param {string} categoryId
 * @param {{ mode?: import("./modes.js").DifficultyMode }} [opts]
 */
export function createNounCategoryGenderImposterExercise(categoryId, opts = {}) {
  const mode = opts.mode || "assisted";
  const truth = categoryGenderImposterExercise(categoryId);
  const templateId = TEMPLATES.NOUN_CATEGORY_GENDER_IMPOSTER;
  const scaffolding = scaffoldingFor(templateId, mode);

  return {
    id: `ex.${templateId}.${truth.categoryId}.${truth.imposter}.${mode}`,
    templateId,
    territoryId: "nouns",
    mode,
    layerVersion: EXERCISE_LAYER_VERSION,
    target: {
      categoryId: truth.categoryId,
      expectedLemma: truth.expectedLemma,
      expectedAssociation: truth.expectedAssociation,
      imposterGender: truth.imposterGender,
    },
    scaffolding,
    prompt: {
      kind: "category-gender-imposter",
      categoryId: truth.categoryId,
      // Deliberately omit categoryName/header — those spoil the odd-gender task.
      text: "Three nouns share the same gender. Which is the imposter?",
      header: "",
    },
    materials: {
      choices: [...truth.choices],
      choiceLabels: { ...truth.choiceLabels },
      hint: "Assign der/die/das to each noun (suffix or lexical knowledge). Find the one that doesn’t match the other three.",
    },
    resolution: {
      expected: truth.expectedLemma,
      expectedLemma: truth.expectedLemma,
      expectedAssociation: truth.expectedAssociation,
      association: truth.association,
      strength: truth.strength,
      categoryName: truth.categoryName,
      imposterGender: truth.imposterGender,
      majorityGender: truth.majorityGender,
      feedbackOk: truth.feedbackOk,
      feedbackBad: truth.feedbackBad,
    },
  };
}

/**
 * Categories — Sentence Validation: authored sentence → Correct / Incorrect.
 * @param {string} itemId
 * @param {{ mode?: import("./modes.js").DifficultyMode }} [opts]
 */
export function createNounCategorySentenceValidationExercise(itemId, opts = {}) {
  const mode = opts.mode || "assisted";
  const truth = categorySentenceValidationExercise(itemId);
  const templateId = TEMPLATES.NOUN_CATEGORY_SENTENCE_VALIDATION;
  const scaffolding = scaffoldingFor(templateId, mode);

  return {
    id: `ex.${templateId}.${truth.itemId}.${mode}`,
    templateId,
    territoryId: "nouns",
    mode,
    layerVersion: EXERCISE_LAYER_VERSION,
    target: {
      categoryId: truth.categoryId,
      lemma: truth.lemma,
      itemId: truth.itemId,
      sentenceCorrect: truth.correct,
    },
    scaffolding,
    prompt: {
      kind: "category-sentence-validation",
      categoryId: truth.categoryId,
      categoryName: truth.categoryName,
      lemma: truth.lemma,
      text: "Is this sentence correct?",
      sentence: truth.sentence,
      header: "",
    },
    materials: {
      choices: [...truth.choices],
      choiceLabels: { ...truth.choiceLabels },
    },
    resolution: {
      expected: truth.expected,
      correct: truth.correct,
      expectedAssociation: truth.association,
      association: truth.association,
      strength: truth.strength,
      categoryName: truth.categoryName,
      lemma: truth.lemma,
      sentence: truth.sentence,
      feedbackOk: truth.correct
        ? `Correct — the article matches ${truth.categoryName} → ${truth.choiceLabel.toLowerCase()}.`
        : `Correct — the article does not match ${truth.categoryName} → ${truth.choiceLabel.toLowerCase()}.`,
      feedbackBad: truth.correct
        ? `The sentence is correct: category ${truth.categoryName} → ${truth.choiceLabel.toLowerCase()}.`
        : `The sentence is incorrect: category ${truth.categoryName} → ${truth.choiceLabel.toLowerCase()}.`,
    },
  };
}

/**
 * @param {string} form — nonce wug form
 * @param {{ mode?: import("./modes.js").DifficultyMode }} [opts]
 */
export function createNounWugExercise(form, opts = {}) {
  const mode = opts.mode || "assisted";
  const truth = wugExercise(form);
  const templateId = TEMPLATES.NOUN_WUG_CHOICE;
  const scaffolding = scaffoldingFor(templateId, mode);

  return {
    id: `ex.${templateId}.${truth.form}.${mode}`,
    templateId,
    territoryId: "nouns",
    mode,
    layerVersion: EXERCISE_LAYER_VERSION,
    target: {
      lemma: truth.form,
      grammaticalState: {
        case: "nominative",
        number: "singular",
        gender: truth.intendedGender,
      },
      wug: true,
      patternId: truth.patternId,
    },
    scaffolding,
    prompt: {
      kind: "wug-article",
      lemma: truth.form,
      stem: truth.stem,
      ending: truth.ending,
      cue: truth.cue,
      showSuffixBadge: false,
      translation: null,
      highlightSuffix: !!(scaffolding.showSuffixMark && truth.ending),
      // Never color the nonce by intended gender — that gives the answer away.
      genderClass: null,
    },
    materials: {
      choices: ["der", "die", "das", "insufficient"],
      patternBlurb: truth.note,
      cue: truth.cue,
      patternId: truth.patternId,
      hint: truth.hint,
      allowInsufficient: true,
    },
    resolution: {
      article: truth.article || "insufficient",
      gender: truth.intendedGender,
      translation: null,
      note: truth.note,
      rules: truth.rules,
      patternId: truth.patternId,
    },
  };
}

/**
 * @param {string} lemma
 * @param {{ mode?: import("./modes.js").DifficultyMode, translation?: string, answerParts?: object[] }} [opts]
 */
export function createNounPluralExercise(lemma, opts = {}) {
  const mode = opts.mode || "assisted";
  const truth = pluralExercise(lemma, { translation: opts.translation });
  const templateId = TEMPLATES.NOUN_PLURAL_CONSTRUCTION;
  const scaffolding = scaffoldingFor(templateId, mode);

  return {
    id: `ex.${templateId}.${truth.lemma}.${mode}`,
    templateId,
    territoryId: "nouns",
    mode,
    layerVersion: EXERCISE_LAYER_VERSION,
    target: {
      lemma: truth.lemma,
      grammaticalState: {
        case: "nominative",
        number: "plural",
      },
    },
    scaffolding,
    prompt: {
      kind: "build-plural",
      lemma: truth.lemma,
      translation: scaffolding.showEnglish
        ? opts.translation || truth.translation
        : null,
    },
    materials: {
      parts: truth.parts,
      distractors: scaffolding.chipTray ? truth.distractors : [],
      form: truth.form,
      hint: truth.hint,
      answerParts: opts.answerParts || null,
    },
    resolution: {
      parts: truth.parts,
      form: truth.form,
      singularArticle: truth.singularArticle,
      translation: opts.translation || truth.translation,
      rules: truth.rules,
    },
  };
}

/**
 * @param {number} value
 * @param {{ mode?: import("./modes.js").DifficultyMode, grain?: string, english?: string, answerParts?: object[] }} [opts]
 */
export function createNumberConstructionExercise(value, opts = {}) {
  const mode = opts.mode || "assisted";
  const grain = opts.grain || "construction";
  const truth = constructionExercise(value, {
    grain,
    english: opts.english,
  });
  const templateId = TEMPLATES.NUMBER_CARDINAL_CONSTRUCTION;
  const scaffolding = scaffoldingFor(templateId, mode);

  return {
    id: `ex.${templateId}.${value}.${grain}.${mode}`,
    templateId,
    territoryId: "numbers",
    mode,
    layerVersion: EXERCISE_LAYER_VERSION,
    target: {
      value,
      grain,
      grammaticalState: null,
    },
    scaffolding,
    prompt: {
      kind: "build-cardinal",
      value,
      english: scaffolding.showEnglish ? opts.english || truth.english : null,
    },
    materials: {
      parts: truth.parts,
      distractors: scaffolding.chipTray ? truth.distractors : [],
      form: truth.form,
      hint: truth.hint,
      grain,
      answerParts: opts.answerParts || null,
    },
    resolution: {
      parts: truth.parts,
      form: truth.form,
      grain,
      english: opts.english || truth.english,
      rules: truth.rules,
    },
  };
}

/**
 * @param {number} whole
 * @param {number[]} fracDigits
 * @param {{ mode?: import("./modes.js").DifficultyMode, grain?: string, english?: string, answerParts?: object[] }} [opts]
 */
export function createDecimalConstructionExercise(whole, fracDigits, opts = {}) {
  const mode = opts.mode || "assisted";
  const grain = opts.grain === "spoken" ? "spoken" : "construction";
  const truth = decimalExercise(whole, fracDigits, {
    grain,
    english: opts.english,
  });
  const templateId = TEMPLATES.NUMBER_DECIMAL_CONSTRUCTION;
  const scaffolding = scaffoldingFor(templateId, mode);

  return {
    id: `ex.${templateId}.${truth.written}.${grain}.${mode}`,
    templateId,
    territoryId: "numbers",
    mode,
    layerVersion: EXERCISE_LAYER_VERSION,
    target: {
      kind: "decimal",
      whole,
      fracDigits: [...fracDigits],
      grain,
    },
    scaffolding,
    prompt: {
      kind: "build-decimal",
      written: truth.written,
      english: scaffolding.showEnglish
        ? opts.english || truth.english
        : null,
    },
    materials: {
      parts: truth.parts,
      distractors: scaffolding.chipTray ? truth.distractors : [],
      form: truth.form,
      written: truth.written,
      hint: truth.hint,
      grain,
      answerParts: opts.answerParts || null,
    },
    resolution: {
      parts: truth.parts,
      form: truth.form,
      written: truth.written,
      whole,
      fracDigits: [...fracDigits],
      grain,
      english: opts.english || truth.english,
      rules: truth.rules,
    },
  };
}

/**
 * @param {number} euros
 * @param {number} cents
 * @param {{ mode?: import("./modes.js").DifficultyMode, grain?: string, english?: string, answerParts?: object[] }} [opts]
 */
export function createMoneyConstructionExercise(euros, cents, opts = {}) {
  const mode = opts.mode || "assisted";
  const grain = opts.grain === "spoken" ? "spoken" : "construction";
  const truth = moneyExercise(euros, cents, { grain, english: opts.english });
  const templateId = TEMPLATES.NUMBER_MONEY_CONSTRUCTION;
  const scaffolding = scaffoldingFor(templateId, mode);

  return {
    id: `ex.${templateId}.${euros}.${cents}.${grain}.${mode}`,
    templateId,
    territoryId: "numbers",
    mode,
    layerVersion: EXERCISE_LAYER_VERSION,
    target: {
      kind: "money",
      euros,
      cents,
      grain,
    },
    scaffolding,
    prompt: {
      kind: "build-money",
      written: truth.written,
      english: scaffolding.showEnglish
        ? opts.english || truth.english
        : null,
    },
    materials: {
      parts: truth.parts,
      distractors: scaffolding.chipTray ? truth.distractors : [],
      form: truth.form,
      written: truth.written,
      hint: truth.hint,
      grain,
      answerParts: opts.answerParts || null,
    },
    resolution: {
      parts: truth.parts,
      form: truth.form,
      written: truth.written,
      euros,
      cents,
      grain,
      english: opts.english || truth.english,
      rules: truth.rules,
    },
  };
}

/**
 * @param {number} numerator
 * @param {number} denominator
 * @param {{ mode?: import("./modes.js").DifficultyMode, english?: string, answerParts?: object[] }} [opts]
 */
export function createFractionConstructionExercise(numerator, denominator, opts = {}) {
  const mode = opts.mode || "assisted";
  const truth = fractionExercise(numerator, denominator, { english: opts.english });
  const templateId = TEMPLATES.NUMBER_FRACTION_CONSTRUCTION;
  const scaffolding = scaffoldingFor(templateId, mode);

  return {
    id: `ex.${templateId}.${numerator}.${denominator}.${mode}`,
    templateId,
    territoryId: "numbers",
    mode,
    layerVersion: EXERCISE_LAYER_VERSION,
    target: { kind: "fraction", numerator, denominator },
    scaffolding,
    prompt: {
      kind: "build-fraction",
      written: truth.written,
      english: scaffolding.showEnglish ? opts.english || truth.english : null,
    },
    materials: {
      parts: truth.parts,
      distractors: scaffolding.chipTray ? truth.distractors : [],
      form: truth.form,
      written: truth.written,
      hint: truth.hint,
      answerParts: opts.answerParts || null,
    },
    resolution: {
      kind: "fraction",
      parts: truth.parts,
      form: truth.form,
      written: truth.written,
      numerator,
      denominator,
      english: opts.english || truth.english,
      rules: truth.rules,
    },
  };
}

/**
 * @param {number} whole
 * @param {number} numerator
 * @param {number} denominator
 * @param {{ mode?: import("./modes.js").DifficultyMode, english?: string, answerParts?: object[] }} [opts]
 */
export function createMixedFractionConstructionExercise(
  whole,
  numerator,
  denominator,
  opts = {}
) {
  const mode = opts.mode || "assisted";
  const truth = mixedFractionExercise(whole, numerator, denominator, {
    english: opts.english,
  });
  const templateId = TEMPLATES.NUMBER_MIXED_FRACTION_CONSTRUCTION;
  const scaffolding = scaffoldingFor(templateId, mode);

  return {
    id: `ex.${templateId}.${whole}.${numerator}.${denominator}.${mode}`,
    templateId,
    territoryId: "numbers",
    mode,
    layerVersion: EXERCISE_LAYER_VERSION,
    target: { kind: "mixed-fraction", whole, numerator, denominator },
    scaffolding,
    prompt: {
      kind: "build-mixed-fraction",
      written: truth.written,
      english: scaffolding.showEnglish ? opts.english || truth.english : null,
    },
    materials: {
      parts: truth.parts,
      distractors: scaffolding.chipTray ? truth.distractors : [],
      form: truth.form,
      written: truth.written,
      hint: truth.hint,
      answerParts: opts.answerParts || null,
    },
    resolution: {
      kind: "mixed-fraction",
      parts: truth.parts,
      form: truth.form,
      written: truth.written,
      whole,
      numerator,
      denominator,
      english: opts.english || truth.english,
      rules: truth.rules,
    },
  };
}

/**
 * @param {number} hours
 * @param {number} minutes
 * @param {{ mode?: import("./modes.js").DifficultyMode, english?: string, answerParts?: object[] }} [opts]
 */
export function createClockConstructionExercise(hours, minutes, opts = {}) {
  const mode = opts.mode || "assisted";
  const truth = clockExercise(hours, minutes, { english: opts.english });
  const templateId = TEMPLATES.NUMBER_CLOCK_CONSTRUCTION;
  const scaffolding = scaffoldingFor(templateId, mode);

  return {
    id: `ex.${templateId}.${hours}.${minutes}.${mode}`,
    templateId,
    territoryId: "numbers",
    mode,
    layerVersion: EXERCISE_LAYER_VERSION,
    target: { kind: "clock", hours, minutes },
    scaffolding,
    prompt: {
      kind: "build-clock",
      written: truth.written,
      english: scaffolding.showEnglish ? opts.english || truth.english : null,
    },
    materials: {
      parts: truth.parts,
      distractors: scaffolding.chipTray ? truth.distractors : [],
      form: truth.form,
      written: truth.written,
      hint: truth.hint,
      answerParts: opts.answerParts || null,
    },
    resolution: {
      kind: "clock",
      parts: truth.parts,
      form: truth.form,
      written: truth.written,
      hours,
      minutes,
      english: opts.english || truth.english,
      rules: truth.rules,
    },
  };
}

/**
 * @param {number} hours
 * @param {number} minutes
 * @param {{ mode?: import("./modes.js").DifficultyMode, english?: string, answerParts?: object[] }} [opts]
 */
export function createDigitalTimeConstructionExercise(hours, minutes, opts = {}) {
  const mode = opts.mode || "assisted";
  const truth = digitalTimeExercise(hours, minutes, { english: opts.english });
  const templateId = TEMPLATES.NUMBER_DIGITAL_TIME_CONSTRUCTION;
  const scaffolding = scaffoldingFor(templateId, mode);

  return {
    id: `ex.${templateId}.${hours}.${minutes}.${mode}`,
    templateId,
    territoryId: "numbers",
    mode,
    layerVersion: EXERCISE_LAYER_VERSION,
    target: { kind: "digital-time", hours, minutes },
    scaffolding,
    prompt: {
      kind: "build-digital-time",
      written: truth.written,
      english: scaffolding.showEnglish ? opts.english || truth.english : null,
    },
    materials: {
      parts: truth.parts,
      distractors: scaffolding.chipTray ? truth.distractors : [],
      form: truth.form,
      written: truth.written,
      hint: truth.hint,
      answerParts: opts.answerParts || null,
    },
    resolution: {
      kind: "digital-time",
      parts: truth.parts,
      form: truth.form,
      written: truth.written,
      hours,
      minutes,
      english: opts.english || truth.english,
      rules: truth.rules,
    },
  };
}

/**
 * @param {{ hours?: number, minutes?: number }} dur
 * @param {{ mode?: import("./modes.js").DifficultyMode, english?: string, answerParts?: object[] }} [opts]
 */
export function createDurationConstructionExercise(dur, opts = {}) {
  const mode = opts.mode || "assisted";
  const truth = durationExercise(dur, { english: opts.english });
  const templateId = TEMPLATES.NUMBER_DURATION_CONSTRUCTION;
  const scaffolding = scaffoldingFor(templateId, mode);
  const hours = truth.hours;
  const minutes = truth.minutes;

  return {
    id: `ex.${templateId}.${hours}.${minutes}.${mode}`,
    templateId,
    territoryId: "numbers",
    mode,
    layerVersion: EXERCISE_LAYER_VERSION,
    target: { kind: "duration", hours, minutes },
    scaffolding,
    prompt: {
      kind: "build-duration",
      written: truth.written,
      english: scaffolding.showEnglish ? opts.english || truth.english : null,
    },
    materials: {
      parts: truth.parts,
      distractors: scaffolding.chipTray ? truth.distractors : [],
      form: truth.form,
      written: truth.written,
      hint: truth.hint,
      answerParts: opts.answerParts || null,
    },
    resolution: {
      kind: "duration",
      parts: truth.parts,
      form: truth.form,
      written: truth.written,
      hours,
      minutes,
      english: opts.english || truth.english,
      rules: truth.rules,
    },
  };
}

function numberBuildShell({
  templateId,
  idSuffix,
  target,
  promptKind,
  truth,
  mode,
  opts,
  resolutionExtras = {},
}) {
  const scaffolding = scaffoldingFor(templateId, mode);
  return {
    id: `ex.${templateId}.${idSuffix}.${mode}`,
    templateId,
    territoryId: "numbers",
    mode,
    layerVersion: EXERCISE_LAYER_VERSION,
    target,
    scaffolding,
    prompt: {
      kind: promptKind,
      written: truth.written,
      english: scaffolding.showEnglish ? opts.english || truth.english : null,
    },
    materials: {
      parts: truth.parts,
      distractors: scaffolding.chipTray ? truth.distractors : [],
      form: truth.form,
      written: truth.written,
      hint: truth.hint,
      answerParts: opts.answerParts || null,
    },
    resolution: {
      kind: target.kind,
      parts: truth.parts,
      form: truth.form,
      written: truth.written,
      english: opts.english || truth.english,
      rules: truth.rules,
      ...resolutionExtras,
    },
  };
}

/**
 * @param {number} n
 * @param {{ mode?: import("./modes.js").DifficultyMode, english?: string, answerParts?: object[] }} [opts]
 */
export function createOrdinalConstructionExercise(n, opts = {}) {
  const mode = opts.mode || "assisted";
  const truth = ordinalExercise(n, { english: opts.english });
  return numberBuildShell({
    templateId: TEMPLATES.NUMBER_ORDINAL_CONSTRUCTION,
    idSuffix: String(n),
    target: { kind: "ordinal", n },
    promptKind: "build-ordinal",
    truth,
    mode,
    opts,
    resolutionExtras: { n },
  });
}

/**
 * @param {number} n
 * @param {{ mode?: import("./modes.js").DifficultyMode, english?: string, answerParts?: object[] }} [opts]
 */
export function createOrdinalAmConstructionExercise(n, opts = {}) {
  const mode = opts.mode || "assisted";
  const truth = ordinalAmExercise(n, { english: opts.english });
  return numberBuildShell({
    templateId: TEMPLATES.NUMBER_ORDINAL_AM_CONSTRUCTION,
    idSuffix: String(n),
    target: { kind: "ordinal-am", n },
    promptKind: "build-ordinal-am",
    truth,
    mode,
    opts,
    resolutionExtras: { n },
  });
}

/**
 * @param {number} index
 * @param {{ mode?: import("./modes.js").DifficultyMode, english?: string, answerParts?: object[] }} [opts]
 */
export function createWeekdayConstructionExercise(index, opts = {}) {
  const mode = opts.mode || "assisted";
  const truth = weekdayExercise(index, { english: opts.english });
  return numberBuildShell({
    templateId: TEMPLATES.NUMBER_WEEKDAY_CONSTRUCTION,
    idSuffix: String(index),
    target: { kind: "weekday", index },
    promptKind: "build-weekday",
    truth,
    mode,
    opts,
    resolutionExtras: { index },
  });
}

/**
 * @param {number} month
 * @param {{ mode?: import("./modes.js").DifficultyMode, english?: string, answerParts?: object[] }} [opts]
 */
export function createMonthConstructionExercise(month, opts = {}) {
  const mode = opts.mode || "assisted";
  const truth = monthExercise(month, { english: opts.english });
  return numberBuildShell({
    templateId: TEMPLATES.NUMBER_MONTH_CONSTRUCTION,
    idSuffix: String(month),
    target: { kind: "month", month },
    promptKind: "build-month",
    truth,
    mode,
    opts,
    resolutionExtras: { month },
  });
}

/**
 * @param {{ day: number, month: number, year?: number }} date
 * @param {{ mode?: import("./modes.js").DifficultyMode, english?: string, answerParts?: object[] }} [opts]
 */
export function createCalendarDateConstructionExercise(date, opts = {}) {
  const mode = opts.mode || "assisted";
  const truth = calendarDateExercise(date, { english: opts.english });
  return numberBuildShell({
    templateId: TEMPLATES.NUMBER_CALENDAR_DATE_CONSTRUCTION,
    idSuffix: `${truth.day}.${truth.month}.${truth.year ?? ""}`,
    target: {
      kind: "calendar-date",
      day: truth.day,
      month: truth.month,
      year: truth.year,
    },
    promptKind: "build-calendar-date",
    truth,
    mode,
    opts,
    resolutionExtras: {
      day: truth.day,
      month: truth.month,
      year: truth.year,
    },
  });
}

/**
 * @param {number} value
 * @param {string} unit
 * @param {{ mode?: import("./modes.js").DifficultyMode, english?: string, answerParts?: object[] }} [opts]
 */
export function createMeasureConstructionExercise(value, unit, opts = {}) {
  const mode = opts.mode || "assisted";
  const truth = measureExercise(value, unit, { english: opts.english });
  return numberBuildShell({
    templateId: TEMPLATES.NUMBER_MEASURE_CONSTRUCTION,
    idSuffix: `${value}.${unit}`,
    target: { kind: "measure", value, unit },
    promptKind: "build-measure",
    truth,
    mode,
    opts,
    resolutionExtras: { value, unit },
  });
}

/**
 * @param {{ templateId: string, target: object, mode?: string, extras?: object }} spec
 */
export function createExercise(spec) {
  const mode = spec.mode || "assisted";
  switch (spec.templateId) {
    case TEMPLATES.NOUN_ARTICLE_CHOICE:
      return createNounArticleExercise(spec.target.lemma, {
        mode,
        answerParts: spec.extras?.answerParts,
      });
    case TEMPLATES.NOUN_ASSOCIATION_CHOICE:
      return createNounAssociationExercise(spec.target.lemma, { mode });
    case TEMPLATES.NOUN_CATEGORY_GENDER_RECOGNITION:
      return createNounCategoryGenderRecognitionExercise(spec.target.categoryId, {
        mode,
      });
    case TEMPLATES.NOUN_CATEGORY_ARTICLE_APPLICATION:
      return createNounCategoryArticleApplicationExercise(spec.target.itemId, {
        mode,
      });
    case TEMPLATES.NOUN_CATEGORY_GENDER_IMPOSTER:
      return createNounCategoryGenderImposterExercise(spec.target.categoryId, {
        mode,
      });
    case TEMPLATES.NOUN_CATEGORY_SENTENCE_VALIDATION:
      return createNounCategorySentenceValidationExercise(spec.target.itemId, {
        mode,
      });
    case TEMPLATES.NOUN_WUG_CHOICE:
      return createNounWugExercise(spec.target.form || spec.target.lemma, {
        mode,
      });
    case TEMPLATES.NOUN_PLURAL_CONSTRUCTION:
      return createNounPluralExercise(spec.target.lemma, {
        mode,
        translation: spec.extras?.translation,
        answerParts: spec.extras?.answerParts,
      });
    case TEMPLATES.NUMBER_CARDINAL_CONSTRUCTION:
      return createNumberConstructionExercise(spec.target.value, {
        mode,
        grain: spec.target.grain,
        english: spec.extras?.english,
        answerParts: spec.extras?.answerParts,
      });
    case TEMPLATES.NUMBER_DECIMAL_CONSTRUCTION:
      return createDecimalConstructionExercise(
        spec.target.whole,
        spec.target.fracDigits,
        {
          mode,
          grain: spec.target.grain,
          english: spec.extras?.english,
          answerParts: spec.extras?.answerParts,
        }
      );
    case TEMPLATES.NUMBER_MONEY_CONSTRUCTION:
      return createMoneyConstructionExercise(
        spec.target.euros,
        spec.target.cents,
        {
          mode,
          grain: spec.target.grain,
          english: spec.extras?.english,
          answerParts: spec.extras?.answerParts,
        }
      );
    case TEMPLATES.NUMBER_FRACTION_CONSTRUCTION:
      return createFractionConstructionExercise(
        spec.target.numerator,
        spec.target.denominator,
        {
          mode,
          english: spec.extras?.english,
          answerParts: spec.extras?.answerParts,
        }
      );
    case TEMPLATES.NUMBER_MIXED_FRACTION_CONSTRUCTION:
      return createMixedFractionConstructionExercise(
        spec.target.whole,
        spec.target.numerator,
        spec.target.denominator,
        {
          mode,
          english: spec.extras?.english,
          answerParts: spec.extras?.answerParts,
        }
      );
    case TEMPLATES.NUMBER_CLOCK_CONSTRUCTION:
      return createClockConstructionExercise(
        spec.target.hours,
        spec.target.minutes,
        {
          mode,
          english: spec.extras?.english,
          answerParts: spec.extras?.answerParts,
        }
      );
    case TEMPLATES.NUMBER_DIGITAL_TIME_CONSTRUCTION:
      return createDigitalTimeConstructionExercise(
        spec.target.hours,
        spec.target.minutes,
        {
          mode,
          english: spec.extras?.english,
          answerParts: spec.extras?.answerParts,
        }
      );
    case TEMPLATES.NUMBER_DURATION_CONSTRUCTION:
      return createDurationConstructionExercise(
        { hours: spec.target.hours, minutes: spec.target.minutes },
        {
          mode,
          english: spec.extras?.english,
          answerParts: spec.extras?.answerParts,
        }
      );
    case TEMPLATES.NUMBER_ORDINAL_CONSTRUCTION:
      return createOrdinalConstructionExercise(spec.target.n, {
        mode,
        english: spec.extras?.english,
        answerParts: spec.extras?.answerParts,
      });
    case TEMPLATES.NUMBER_ORDINAL_AM_CONSTRUCTION:
      return createOrdinalAmConstructionExercise(spec.target.n, {
        mode,
        english: spec.extras?.english,
        answerParts: spec.extras?.answerParts,
      });
    case TEMPLATES.NUMBER_WEEKDAY_CONSTRUCTION:
      return createWeekdayConstructionExercise(spec.target.index, {
        mode,
        english: spec.extras?.english,
        answerParts: spec.extras?.answerParts,
      });
    case TEMPLATES.NUMBER_MONTH_CONSTRUCTION:
      return createMonthConstructionExercise(spec.target.month, {
        mode,
        english: spec.extras?.english,
        answerParts: spec.extras?.answerParts,
      });
    case TEMPLATES.NUMBER_CALENDAR_DATE_CONSTRUCTION:
      return createCalendarDateConstructionExercise(
        {
          day: spec.target.day,
          month: spec.target.month,
          year: spec.target.year ?? undefined,
        },
        {
          mode,
          english: spec.extras?.english,
          answerParts: spec.extras?.answerParts,
        }
      );
    case TEMPLATES.NUMBER_MEASURE_CONSTRUCTION:
      return createMeasureConstructionExercise(
        spec.target.value,
        spec.target.unit,
        {
          mode,
          english: spec.extras?.english,
          answerParts: spec.extras?.answerParts,
        }
      );
    default:
      throw new Error(`Unknown templateId: ${spec.templateId}`);
  }
}
