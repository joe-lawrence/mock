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
  evaluateDecimalConstruction,
  evaluateMoneyConstruction,
  evaluateFractionConstruction,
  evaluateMixedFractionConstruction,
  evaluateClockConstruction,
  evaluateDigitalTimeConstruction,
  evaluateDurationConstruction,
  evaluateOrdinalConstruction,
  evaluateOrdinalAmConstruction,
  evaluateWeekdayConstruction,
  evaluateMonthConstruction,
  evaluateCalendarDateConstruction,
  evaluateMeasureConstruction,
  recordNumberAttempt,
} from "../numbers/index.js";

function isAcceptable(status, templateId) {
  if (status === "correct") return true;
  if (
    status === "accepted-alternative" &&
    (templateId === TEMPLATES.NOUN_PLURAL_CONSTRUCTION ||
      templateId === TEMPLATES.NUMBER_CARDINAL_CONSTRUCTION ||
      templateId === TEMPLATES.NUMBER_DECIMAL_CONSTRUCTION ||
      templateId === TEMPLATES.NUMBER_MONEY_CONSTRUCTION ||
      templateId === TEMPLATES.NUMBER_FRACTION_CONSTRUCTION ||
      templateId === TEMPLATES.NUMBER_MIXED_FRACTION_CONSTRUCTION ||
      templateId === TEMPLATES.NUMBER_CLOCK_CONSTRUCTION ||
      templateId === TEMPLATES.NUMBER_DIGITAL_TIME_CONSTRUCTION ||
      templateId === TEMPLATES.NUMBER_DURATION_CONSTRUCTION ||
      templateId === TEMPLATES.NUMBER_ORDINAL_CONSTRUCTION ||
      templateId === TEMPLATES.NUMBER_ORDINAL_AM_CONSTRUCTION ||
      templateId === TEMPLATES.NUMBER_WEEKDAY_CONSTRUCTION ||
      templateId === TEMPLATES.NUMBER_MONTH_CONSTRUCTION ||
      templateId === TEMPLATES.NUMBER_CALENDAR_DATE_CONSTRUCTION ||
      templateId === TEMPLATES.NUMBER_MEASURE_CONSTRUCTION)
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
    case TEMPLATES.NUMBER_DECIMAL_CONSTRUCTION: {
      evaluation = evaluateDecimalConstruction({
        whole: exercise.target.whole,
        fracDigits: exercise.target.fracDigits,
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
    case TEMPLATES.NUMBER_MONEY_CONSTRUCTION: {
      evaluation = evaluateMoneyConstruction({
        euros: exercise.target.euros,
        cents: exercise.target.cents,
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
    case TEMPLATES.NUMBER_FRACTION_CONSTRUCTION: {
      evaluation = evaluateFractionConstruction({
        numerator: exercise.target.numerator,
        denominator: exercise.target.denominator,
        parts: rawInput.parts,
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
    case TEMPLATES.NUMBER_MIXED_FRACTION_CONSTRUCTION: {
      evaluation = evaluateMixedFractionConstruction({
        whole: exercise.target.whole,
        numerator: exercise.target.numerator,
        denominator: exercise.target.denominator,
        parts: rawInput.parts,
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
    case TEMPLATES.NUMBER_CLOCK_CONSTRUCTION: {
      evaluation = evaluateClockConstruction({
        hours: exercise.target.hours,
        minutes: exercise.target.minutes,
        parts: rawInput.parts,
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
    case TEMPLATES.NUMBER_DIGITAL_TIME_CONSTRUCTION: {
      evaluation = evaluateDigitalTimeConstruction({
        hours: exercise.target.hours,
        minutes: exercise.target.minutes,
        parts: rawInput.parts,
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
    case TEMPLATES.NUMBER_DURATION_CONSTRUCTION: {
      evaluation = evaluateDurationConstruction({
        hours: exercise.target.hours,
        minutes: exercise.target.minutes,
        parts: rawInput.parts,
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
    case TEMPLATES.NUMBER_ORDINAL_CONSTRUCTION: {
      evaluation = evaluateOrdinalConstruction({
        n: exercise.target.n,
        parts: rawInput.parts,
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
    case TEMPLATES.NUMBER_ORDINAL_AM_CONSTRUCTION: {
      evaluation = evaluateOrdinalAmConstruction({
        n: exercise.target.n,
        parts: rawInput.parts,
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
    case TEMPLATES.NUMBER_WEEKDAY_CONSTRUCTION: {
      evaluation = evaluateWeekdayConstruction({
        index: exercise.target.index,
        parts: rawInput.parts,
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
    case TEMPLATES.NUMBER_MONTH_CONSTRUCTION: {
      evaluation = evaluateMonthConstruction({
        month: exercise.target.month,
        parts: rawInput.parts,
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
    case TEMPLATES.NUMBER_CALENDAR_DATE_CONSTRUCTION: {
      evaluation = evaluateCalendarDateConstruction({
        day: exercise.target.day,
        month: exercise.target.month,
        year: exercise.target.year,
        parts: rawInput.parts,
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
    case TEMPLATES.NUMBER_MEASURE_CONSTRUCTION: {
      evaluation = evaluateMeasureConstruction({
        value: exercise.target.value,
        unit: exercise.target.unit,
        parts: rawInput.parts,
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
