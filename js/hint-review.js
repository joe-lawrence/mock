/**
 * One filled Help hint per curriculum unit, from the same builders the quiz uses.
 * Fixed wording is the review target; German pieces come from the sample item.
 */

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
  weekdayExercise,
  monthExercise,
  measureExercise,
} from "../engine/numbers/exercise.js";
import { pluralExercise, wugExercise } from "../engine/nouns/exercise.js";

/**
 * @typedef {{ sample: string, hint: string }} HintSample
 */

/** @type {Record<string, HintSample[]>} */
const NUMBER_SAMPLES = {
  "cardinals/base": [{ sample: "4", hint: constructionExercise(4).hint }],
  "cardinals/teens": [{ sample: "16", hint: constructionExercise(16).hint }],
  "cardinals/tens": [{ sample: "40", hint: constructionExercise(40).hint }],
  "cardinals/compounds": [
    { sample: "42", hint: constructionExercise(42).hint },
    {
      sample: "42, split tens",
      hint: constructionExercise(42, { grain: "morph" }).hint,
    },
  ],
  "cardinals/hundreds": [
    { sample: "100", hint: constructionExercise(100).hint },
    { sample: "1000", hint: constructionExercise(1000).hint },
  ],
  "decimals/komma-read": [
    { sample: "3,14", hint: decimalExercise(3, [1, 4]).hint },
  ],
  "decimals/place-value": [
    { sample: "3,14", hint: decimalExercise(3, [1, 4]).hint },
  ],
  "decimals/money-euros": [
    { sample: "2 €", hint: moneyExercise(2, 0).hint },
  ],
  "decimals/money-cents": [
    { sample: "2,50 €", hint: moneyExercise(2, 50).hint },
  ],
  "fractions/half-quarter": [
    { sample: "1/2", hint: fractionExercise(1, 2).hint },
    { sample: "1/4", hint: fractionExercise(1, 4).hint },
  ],
  "fractions/unit-fractions": [
    { sample: "1/6", hint: fractionExercise(1, 6).hint },
  ],
  "fractions/proper-fractions": [
    { sample: "2/3", hint: fractionExercise(2, 3).hint },
  ],
  "fractions/mixed-numbers": [
    { sample: "1 1/2", hint: mixedFractionExercise(1, 1, 2).hint },
    { sample: "2 1/3", hint: mixedFractionExercise(2, 1, 3).hint },
  ],
  "time/whole-hours": [{ sample: "3:00", hint: clockExercise(3, 0).hint }],
  "time/half-past": [{ sample: "2:30", hint: clockExercise(2, 30).hint }],
  "time/quarters": [{ sample: "2:15", hint: clockExercise(2, 15).hint }],
  "time/minutes": [{ sample: "2:20", hint: clockExercise(2, 20).hint }],
  "time/digital-24h": [
    { sample: "14:05", hint: digitalTimeExercise(14, 5).hint },
  ],
  "time/duration": [
    { sample: "2 hours", hint: durationExercise({ hours: 2, minutes: 0 }).hint },
  ],
  "dates/weekdays": [{ sample: "Monday", hint: weekdayExercise(0).hint }],
  "dates/months": [{ sample: "March", hint: monthExercise(3).hint }],
  "measurement/length": [
    { sample: "3 Meter", hint: measureExercise(3, "Meter").hint },
  ],
  "measurement/weight": [
    { sample: "2 Kilogramm", hint: measureExercise(2, "Kilogramm").hint },
  ],
  "measurement/volume": [
    { sample: "1 Liter", hint: measureExercise(1, "Liter").hint },
  ],
  "measurement/temp-speed": [
    { sample: "20 Grad", hint: measureExercise(20, "Grad").hint },
  ],
  "ordinals/ordinal-1-12": [{ sample: "3rd", hint: ordinalExercise(3).hint }],
  "ordinals/ordinal-teens": [{ sample: "16th", hint: ordinalExercise(16).hint }],
  "ordinals/ordinal-tens": [{ sample: "20th", hint: ordinalExercise(20).hint }],
  "ordinals/ordinal-compounds": [
    { sample: "21st", hint: ordinalExercise(21).hint },
  ],
};

const zeitung = pluralExercise("Zeitung");
const fahrer = pluralExercise("Fahrer");
const klappung = pluralExercise("Klappung");
const wugUng = wugExercise("Klappung");
const wugBare = wugExercise("Plork");

/** @type {Record<string, HintSample[]>} */
const NOUN_SAMPLES = {
  "suffixes/wugs": [
    { sample: wugUng.form, hint: wugUng.hint },
    { sample: wugBare.form, hint: wugBare.hint },
  ],
  "suffixes/real-words": [
    {
      sample: "Zeitung",
      hint: "Nominative singular. Look at the ending -ung.",
    },
  ],
  "suffixes/proofread": [
    {
      sample: "der Zeitung",
      hint: "Use the suffix cue to judge the article.",
    },
  ],
  "categories/gender-recognition": [
    {
      sample: "category",
      hint: "Retrieve the category’s gender shortcut — masculine, feminine, or neuter.",
    },
  ],
  "categories/article-application": [
    {
      sample: "category",
      hint: "Retrieve the category’s gender, then pick the matching article.",
    },
  ],
  "categories/gender-imposter": [
    {
      sample: "four nouns",
      hint: "Mentally assign der/die/das to each noun. Three share a gender — pick the odd one.",
    },
  ],
  "categories/sentence-validation": [
    {
      sample: "sentence",
      hint: "Does the article match the category’s gender shortcut?",
    },
  ],
  "categories/cardinal-directions": [
    {
      sample: "Norden",
      hint: "Name the German direction (Norden, Nordosten, …).",
    },
  ],
  "plurals/plural-patterns": [
    {
      sample: "-ung",
      hint: "Predict the plural this ending usually forms.",
    },
    {
      sample: "-ung, proofread",
      hint: "Decide whether this claim about the suffix is true.",
    },
  ],
  "plurals/plural-wugs": [{ sample: "Klappung", hint: klappung.hint }],
  "plurals/plural-real-words": [
    { sample: "Zeitung", hint: zeitung.hint },
    { sample: "Fahrer", hint: fahrer.hint },
  ],
};

/**
 * @param {string} moduleId
 * @param {string} topicId
 * @param {string} unitId
 * @returns {HintSample[]}
 */
export function hintSamplesForUnit(moduleId, topicId, unitId) {
  const key = `${topicId}/${unitId}`;
  if (moduleId === "numbers") return NUMBER_SAMPLES[key] || [];
  if (moduleId === "nouns") return NOUN_SAMPLES[key] || [];
  return [];
}
