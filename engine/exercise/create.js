/**
 * Build presentation exercises from engine truth + scaffolding mode.
 */

import { scaffoldingFor, TEMPLATES, EXERCISE_LAYER_VERSION } from "./modes.js";
import {
  articleExercise,
  pluralExercise,
  wugExercise,
} from "../nouns/index.js";
import { constructionExercise } from "../numbers/index.js";

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
    default:
      throw new Error(`Unknown templateId: ${spec.templateId}`);
  }
}
