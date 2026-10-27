/**
 * Case curriculum (Appendix H).
 * Accusative constructions, then dative constructions, then mixed sentences.
 * The definite/indefinite table is a Learn chart, not a production unit.
 * `modes` are the interactions that unit's practice deck actually deals.
 */

import { caseUnitModes } from "../../engine/nouns/case-questions.js";

export const CASE_CHART_ID = "case.chart.definite";

function caseModes(unitId) {
  return caseUnitModes(unitId);
}

export const CASE_TOPICS = [
  {
    id: "accusative",
    label: "Accusative",
    playable: true,
    blurb:
      "Accusative articles with sehen, haben, für, ohne, a few everyday verbs, and warten auf.",
    steps: [
      {
        id: "masc",
        unitId: "case.acc.masc",
        label: "Masculine change",
        playable: true,
        intro: true,
        referenceId: "case.acc.masc",
        chartId: CASE_CHART_ID,
        modes: caseModes("case.acc.masc"),
        blurb: "der → den and ein → einen with sehen and haben.",
      },
      {
        id: "unchanged",
        unitId: "case.acc.unchanged",
        label: "Unchanged forms",
        playable: true,
        softAfter: "masc",
        referenceId: "case.acc.unchanged",
        chartId: CASE_CHART_ID,
        modes: caseModes("case.acc.unchanged"),
        blurb: "die, das, eine, and ein stay put in the accusative.",
      },
      {
        id: "fuer",
        unitId: "case.prep.fuer",
        label: "für",
        playable: true,
        softAfter: "unchanged",
        referenceId: "case.prep.fuer",
        chartId: CASE_CHART_ID,
        modes: caseModes("case.prep.fuer"),
        blurb: "für takes the accusative.",
      },
      {
        id: "ohne",
        unitId: "case.prep.ohne",
        label: "ohne",
        playable: true,
        softAfter: "fuer",
        referenceId: "case.prep.ohne",
        chartId: CASE_CHART_ID,
        modes: caseModes("case.prep.ohne"),
        blurb: "ohne takes the accusative.",
      },
      {
        id: "verbs",
        unitId: "case.acc.verbs",
        label: "Accusative verbs",
        playable: true,
        softAfter: "ohne",
        referenceId: "case.acc.verbs",
        chartId: CASE_CHART_ID,
        modes: caseModes("case.acc.verbs"),
        blurb: "brauchen, suchen, nehmen, and finden take the accusative.",
      },
      {
        id: "warten-auf",
        unitId: "case.prep.warten-auf",
        label: "warten auf",
        playable: true,
        softAfter: "verbs",
        referenceId: "case.prep.warten-auf",
        chartId: CASE_CHART_ID,
        modes: caseModes("case.prep.warten-auf"),
        blurb: "warten auf takes the accusative.",
      },
    ],
  },
  {
    id: "dative",
    label: "Dative",
    playable: true,
    blurb:
      "helfen, mit, and aus come first. Indefinite and plural dative come after those constructions.",
    steps: [
      {
        id: "helfen",
        unitId: "case.dat.helfen",
        label: "Helfen",
        playable: true,
        intro: true,
        referenceId: "case.dat.helfen",
        chartId: CASE_CHART_ID,
        modes: caseModes("case.dat.helfen"),
        blurb: "Singular definite dem, der, and dem with helfen.",
      },
      {
        id: "mit",
        unitId: "case.prep.mit",
        label: "mit",
        playable: true,
        softAfter: "helfen",
        referenceId: "case.prep.mit",
        chartId: CASE_CHART_ID,
        modes: caseModes("case.prep.mit"),
        blurb: "mit takes the dative.",
      },
      {
        id: "aus",
        unitId: "case.prep.aus",
        label: "aus",
        playable: true,
        softAfter: "mit",
        referenceId: "case.prep.aus",
        chartId: CASE_CHART_ID,
        modes: caseModes("case.prep.aus"),
        blurb: "aus takes the dative.",
      },
      {
        id: "danken",
        unitId: "case.verb.danken",
        label: "danken",
        playable: true,
        softAfter: "aus",
        referenceId: "case.verb.danken",
        chartId: CASE_CHART_ID,
        modes: caseModes("case.verb.danken"),
        blurb: "danken takes the dative.",
      },
      {
        id: "gefallen",
        unitId: "case.verb.gefallen",
        label: "gefallen",
        playable: true,
        softAfter: "danken",
        referenceId: "case.verb.gefallen",
        chartId: CASE_CHART_ID,
        modes: caseModes("case.verb.gefallen"),
        blurb: "Das Buch gefällt plus dem, der, or dem. The subject stays fixed.",
      },
      {
        id: "indef",
        unitId: "case.dat.indef",
        label: "Indefinite dative",
        playable: true,
        softAfter: "gefallen",
        referenceId: "case.dat.indef",
        chartId: CASE_CHART_ID,
        modes: caseModes("case.dat.indef"),
        blurb: "einem and einer after definite dative.",
      },
      {
        id: "plural",
        unitId: "case.dat.plural",
        label: "Plural dative",
        playable: true,
        softAfter: "indef",
        referenceId: "case.dat.plural",
        chartId: CASE_CHART_ID,
        modes: caseModes("case.dat.plural"),
        blurb: "The article is den. Kindern and Hunden add -n. Frauen does not.",
      },
      {
        id: "passen-zu",
        unitId: "case.prep.passen-zu",
        label: "passen zu",
        playable: true,
        softAfter: "plural",
        referenceId: "case.prep.passen-zu",
        chartId: CASE_CHART_ID,
        modes: caseModes("case.prep.passen-zu"),
        blurb: "passen zu takes the dative.",
      },
    ],
  },
  {
    id: "mixed",
    label: "Mixed",
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
