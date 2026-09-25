/**
 * Submit learner input against an exercise — engine eval + attempt record.
 */

import { TEMPLATES, EXERCISE_LAYER_VERSION } from "./modes.js";
import {
  evaluateDefiniteArticle,
  evaluatePluralConstruction,
  evaluateWugArticle,
  recordNounAttempt,
} from "../nouns/index.js";
import {
  evaluateCardinalConstruction,
  recordNumberAttempt,
} from "../numbers/index.js";

function isAcceptable(status, templateId) {
  if (status === "correct") return true;
  if (
    status === "accepted-alternative" &&
    (templateId === TEMPLATES.NOUN_PLURAL_CONSTRUCTION ||
      templateId === TEMPLATES.NUMBER_CARDINAL_CONSTRUCTION)
  ) {
    return true;
  }
  return false;
}

/**
 * @param {object} exercise — from createExercise*
 * @param {object} rawInput — template-specific ({ article } | { parts })
 * @param {{ appVersion?: string }} [opts]
 */
export function submitExerciseAttempt(exercise, rawInput, opts = {}) {
  const appVersion = opts.appVersion || "mock";
  const scaffoldingMeta = {
    mode: exercise.mode,
    layerVersion: EXERCISE_LAYER_VERSION,
    flags: exercise.scaffolding,
  };

  let evaluation;
  let attempt;

  switch (exercise.templateId) {
    case TEMPLATES.NOUN_ARTICLE_CHOICE:
    case TEMPLATES.NOUN_ASSOCIATION_CHOICE: {
      evaluation = evaluateDefiniteArticle({
        lemma: exercise.target.lemma,
        article: rawInput.article,
      });
      attempt = recordNounAttempt({
        exerciseId: exercise.id,
        prompt: exercise.target,
        rawInput,
        normalizedInput: rawInput.article,
        evaluation,
        scaffolding: scaffoldingMeta,
        appVersion,
      });
      break;
    }
    case TEMPLATES.NOUN_WUG_CHOICE: {
      evaluation = evaluateWugArticle({
        form: exercise.target.lemma,
        article: rawInput.article,
        intendedGender: exercise.target.grammaticalState?.gender ?? null,
        patternId: exercise.target.patternId,
      });
      attempt = recordNounAttempt({
        exerciseId: exercise.id,
        prompt: exercise.target,
        rawInput,
        normalizedInput: rawInput.article,
        evaluation,
        scaffolding: scaffoldingMeta,
        appVersion,
      });
      break;
    }
    case TEMPLATES.NOUN_PLURAL_CONSTRUCTION: {
      evaluation = evaluatePluralConstruction({
        lemma: exercise.target.lemma,
        parts: rawInput.parts,
      });
      attempt = recordNounAttempt({
        exerciseId: exercise.id,
        prompt: exercise.target,
        rawInput,
        normalizedInput: (rawInput.parts || []).join(""),
        evaluation,
        scaffolding: scaffoldingMeta,
        appVersion,
      });
      break;
    }
    case TEMPLATES.NUMBER_CARDINAL_CONSTRUCTION: {
      evaluation = evaluateCardinalConstruction({
        value: exercise.target.value,
        parts: rawInput.parts,
        grain: exercise.target.grain || "construction",
      });
      attempt = recordNumberAttempt({
        exerciseId: exercise.id,
        prompt: exercise.target,
        rawInput,
        evaluation,
        scaffolding: scaffoldingMeta,
        appVersion,
      });
      break;
    }
    default:
      throw new Error(
        `submitExerciseAttempt: unknown template ${exercise.templateId}`
      );
  }

  const articleLike =
    exercise.templateId === TEMPLATES.NOUN_ARTICLE_CHOICE ||
    exercise.templateId === TEMPLATES.NOUN_ASSOCIATION_CHOICE ||
    exercise.templateId === TEMPLATES.NOUN_WUG_CHOICE;

  return {
    evaluation,
    attempt,
    accepted: isAcceptable(evaluation.status, exercise.templateId),
    complete:
      isAcceptable(evaluation.status, exercise.templateId) ||
      (!articleLike && evaluation.status !== undefined),
  };
}
