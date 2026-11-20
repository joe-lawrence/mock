/**
 * Case curriculum (Appendix H, amended 2026-11-17).
 * Soft arc: 8 units across 4 topics.
 * Chart first (Learn + grid check), then accusative constructions (OFUDGE),
 * dative constructions (Blue Danube), then mixed analysis.
 * `modes` are the interactions that unit's practice deck actually deals.
 */

import { caseUnitModes } from "../engine/nouns/case-questions.js";
import { CASE_CHART_ID as CHART_ID } from "../engine/nouns/declension-table.js";

export const CASE_CHART_ID = CHART_ID;

function caseModes(unitId) {
  return caseUnitModes(unitId);
}

export const CASE_TOPICS = [
  {
    id: "chart",
    label: "The Case Chart",
    playable: true,
    blurb:
      "Full definite and indefinite tables for nominative, accusative, and dative. Lookup plus a unified grid check.",
    steps: [
      {
        id: "chart",
        unitId: "case.chart",
        label: "Article chart",
        playable: true,
        intro: true,
        referenceId: CASE_CHART_ID,
        chartId: CASE_CHART_ID,
        modes: caseModes("case.chart"),
        blurb:
          "der/die/das and ein/eine across nominative, accusative, and dative. Skip drills if you already know the table.",
      },
    ],
  },
  {
    id: "accusative",
    label: "Accusative Constructions",
    playable: true,
    blurb:
      "OFUDGE prepositions, core accusative verbs, and warten auf. Case follows the construction.",
    steps: [
      {
        id: "prep-acc",
        unitId: "case.prep.acc",
        label: "OFUDGE prepositions",
        playable: true,
        intro: true,
        softAfter: "chart",
        referenceId: "case.prep.acc",
        chartId: CASE_CHART_ID,
        modes: caseModes("case.prep.acc"),
        blurb:
          "ohne, für, um, durch, gegen. Notes cover entlang and bis.",
      },
      {
        id: "verbs-acc",
        unitId: "case.verbs.acc",
        label: "Accusative verbs",
        playable: true,
        softAfter: "prep-acc",
        referenceId: "case.verbs.acc",
        chartId: CASE_CHART_ID,
        modes: caseModes("case.verbs.acc"),
        blurb: "brauchen, suchen, nehmen, and finden take the accusative.",
      },
      {
        id: "warten-auf",
        unitId: "case.prep.warten-auf",
        label: "warten auf",
        playable: true,
        softAfter: "verbs-acc",
        referenceId: "case.prep.warten-auf",
        chartId: CASE_CHART_ID,
        modes: caseModes("case.prep.warten-auf"),
        blurb: "warten auf takes the accusative as a fixed chunk.",
      },
    ],
  },
  {
    id: "dative",
    label: "Dative Constructions",
    playable: true,
    blurb:
      "Blue Danube prepositions, six core dative verbs, then plural dative -n.",
    steps: [
      {
        id: "prep-dat",
        unitId: "case.prep.dat",
        label: "Blue Danube prepositions",
        playable: true,
        intro: true,
        referenceId: "case.prep.dat",
        chartId: CASE_CHART_ID,
        modes: caseModes("case.prep.dat"),
        blurb:
          "aus, außer, bei, mit, nach, seit, von, zu, including passen zu. zum/zur/vom are notes, not traps.",
      },
      {
        id: "verbs-dat",
        unitId: "case.verbs.dat",
        label: "Dative verbs",
        playable: true,
        softAfter: "prep-dat",
        referenceId: "case.verbs.dat",
        chartId: CASE_CHART_ID,
        modes: caseModes("case.verbs.dat"),
        blurb:
          "helfen, danken, antworten; gefallen, gehören, passen. Contrast passen with passen zu.",
      },
      {
        id: "plural",
        unitId: "case.dat.plural",
        label: "Plural dative",
        playable: true,
        softAfter: "verbs-dat",
        referenceId: "case.dat.plural",
        chartId: CASE_CHART_ID,
        modes: caseModes("case.dat.plural"),
        blurb: "The article is den. Kindern and Hunden add -n. Frauen does not.",
      },
    ],
  },
  {
    id: "mixed",
    label: "Multi-Phrase Analysis",
    playable: true,
    blurb:
      "Several noun phrases in one sentence. Each phrase keeps the case of its own construction.",
    steps: [
      {
        id: "sentences",
        unitId: "case.mixed",
        label: "Mixed sentences",
        playable: true,
        intro: true,
        softAfter: "plural",
        referenceId: "case.mixed",
        chartId: CASE_CHART_ID,
        modes: caseModes("case.mixed"),
        blurb:
          "Name the case, judge the sentence, or pick the article. The case cue can stay off.",
      },
    ],
  },
];

export function getCaseTopic(topicId) {
  return CASE_TOPICS.find((t) => t.id === topicId) || null;
}

export function getCaseStep(topicId, stepId) {
  return getCaseTopic(topicId)?.steps?.find((s) => s.id === stepId) || null;
}

export function caseNavTopics() {
  return CASE_TOPICS.filter((topic) => topic.playable).map((topic) => ({
    id: `case:${topic.id}`,
    title: topic.label,
    type: "subtopic",
    territory: "case",
    topicId: topic.id,
    playable: true,
    children: caseNavUnits().filter((unit) => unit.topicId === topic.id),
  }));
}

export function caseNavUnits() {
  const units = [];
  for (const topic of CASE_TOPICS) {
    for (const step of topic.steps || []) {
      units.push({
        id: `case:${topic.id}:${step.id}`,
        title: step.label,
        type: "unit",
        territory: "case",
        topicId: topic.id,
        stepId: step.id,
        unitId: step.unitId,
        modes: step.modes || ["choose"],
        playable: !!(topic.playable && step.playable),
        referenceId: step.referenceId,
        chartId: step.chartId,
      });
    }
  }
  return units;
}
