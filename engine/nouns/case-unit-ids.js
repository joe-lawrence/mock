/**
 * Case unit identity map (Appendix H, amended 2026-11-17).
 * Canonical arc is 8 units across 4 topics. Old fine-grained ids
 * resolve here so profiles, word-bank, and legacy content can migrate.
 */

/** Soft arc order for browse / Dealer (excluding Nouns prerequisite). */
export const CASE_ARC_UNIT_IDS = Object.freeze([
  "case.chart",
  "case.prep.acc",
  "case.verbs.acc",
  "case.prep.warten-auf",
  "case.prep.dat",
  "case.verbs.dat",
  "case.dat.plural",
  "case.mixed",
]);

/** Topic 2 unit ids (first playable slice with the chart). */
export const CASE_TOPIC2_UNIT_IDS = Object.freeze([
  "case.prep.acc",
  "case.verbs.acc",
  "case.prep.warten-auf",
]);

/** Topic 3 unit ids (dative constructions). */
export const CASE_TOPIC3_UNIT_IDS = Object.freeze([
  "case.prep.dat",
  "case.verbs.dat",
  "case.dat.plural",
]);

/**
 * Old unit / chart / table ids → canonical new unit id.
 * Missing keys are left unchanged by resolveCaseUnitId.
 */
export const CASE_UNIT_ID_ALIASES = Object.freeze({
  "case.chart.definite": "case.chart",
  "case.table.definite": "case.chart",
  "case.table.indefinite": "case.chart",
  "case.acc.masc": "case.chart",
  "case.acc.unchanged": "case.chart",
  "case.prep.fuer": "case.prep.acc",
  "case.prep.ohne": "case.prep.acc",
  "case.acc.verbs": "case.verbs.acc",
  "case.prep.mit": "case.prep.dat",
  "case.prep.aus": "case.prep.dat",
  "case.prep.passen-zu": "case.prep.dat",
  "case.dat.helfen": "case.verbs.dat",
  "case.verb.danken": "case.verbs.dat",
  "case.verb.gefallen": "case.verbs.dat",
  "case.dat.indef": "case.verbs.dat",
  "case.analysis": "case.mixed",
});

/**
 * @param {string} unitId
 * @returns {string}
 */
export function resolveCaseUnitId(unitId) {
  const id = String(unitId || "");
  if (!id) return id;
  return CASE_UNIT_ID_ALIASES[id] || id;
}

/**
 * Map a list of introduced unit ids onto the canonical set (deduped, arc order).
 * @param {Iterable<string>} unitIds
 * @returns {string[]}
 */
export function migrateCaseUnitIds(unitIds) {
  const seen = new Set();
  for (const raw of unitIds || []) {
    const next = resolveCaseUnitId(raw);
    if (next) seen.add(next);
  }
  return CASE_ARC_UNIT_IDS.filter((id) => seen.has(id)).concat(
    [...seen].filter((id) => !CASE_ARC_UNIT_IDS.includes(id))
  );
}

/**
 * True when the learner has opened the chart or any Topic 2 unit.
 * @param {Iterable<string>} unitIds
 */
export function caseAccusativeUnlocked(unitIds) {
  const resolved = new Set(migrateCaseUnitIds(unitIds));
  if (resolved.has("case.chart")) return true;
  return CASE_TOPIC2_UNIT_IDS.some((id) => resolved.has(id));
}

/**
 * True when the learner has opened any Topic 3 unit.
 * @param {Iterable<string>} unitIds
 */
export function caseDativeUnlocked(unitIds) {
  const resolved = new Set(migrateCaseUnitIds(unitIds));
  return CASE_TOPIC3_UNIT_IDS.some((id) => resolved.has(id));
}
