/**
 * Multi-grain mastery evidence (spec §14 / Slice 5).
 *
 * Grains:
 *   - unit              — primary (deal key / topic×unit)
 *   - unit×preset       — secondary interaction shape
 *   - concept           — morph/rule ids from evaluation evidenceIds
 *
 * Dealer v1 reads the store directly; dealerStatsFromEvidence() remains for
 * flat unit maps / legacy mirrors.
 */

import { cardinalAnalysis } from "../engine/numbers/cardinal.js";

/** @typedef {{ correct: number, total: number, kind: string, label?: string, conceptId?: string, presetId?: string }} GrainStat */
/** @typedef {{ grains: Record<string, GrainStat> }} EvidenceStore */

export const EVIDENCE_GRAIN = Object.freeze({
  UNIT: "unit",
  UNIT_PRESET: "unit×preset",
  CONCEPT: "concept",
  ITEM: "item",
});

/** @returns {EvidenceStore} */
export function emptyEvidenceStore() {
  return { grains: {} };
}

/**
 * Concept-worthy evidence ids (morph/rules). Skip noisy status tags.
 * @param {string} id
 */
export function isConceptEvidenceId(id) {
  const s = String(id || "");
  if (!s) return false;
  if (s.includes("→")) return true;
  if (/^(compound|shorten|teen|tens|lexical)\./.test(s)) return true;
  if (/^eval\.(wrong-|pattern-|wug\.|noun\.)/.test(s)) return true;
  if (/^(apply|article|recognize|construction|judge|produce)\./.test(s)) return true;
  return false;
}

/**
 * @param {{ dealKey?: string, presetId?: string|null, stimulus?: string|null, response?: string|null, evidenceIds?: string[], itemKey?: string|null, itemLabel?: string|null }} ctx
 * @returns {{ key: string, kind: string, conceptId?: string, presetId?: string }[]}
 */
export function grainKeysForAttempt(ctx = {}) {
  const out = [];
  const dealKey = ctx.dealKey ? String(ctx.dealKey) : "";
  const detail = ctx.scope === "detail";
  if (!detail && dealKey) {
    out.push({ key: dealKey, kind: EVIDENCE_GRAIN.UNIT });
  }
  const preset =
    ctx.presetId ||
    (ctx.stimulus && ctx.response
      ? `${ctx.stimulus}×${ctx.response}`
      : null);
  if (!detail && dealKey && preset) {
    out.push({
      key: `${dealKey}×${preset}`,
      kind: EVIDENCE_GRAIN.UNIT_PRESET,
      presetId: String(preset),
    });
  }
  const itemKey = ctx.itemKey ? String(ctx.itemKey) : "";
  if (dealKey && preset && itemKey) {
    out.push({
      key: `${dealKey}×${preset}×${itemKey}`,
      kind: EVIDENCE_GRAIN.ITEM,
      presetId: String(preset),
      label: ctx.itemLabel ? String(ctx.itemLabel) : "",
    });
  }
  for (const id of ctx.evidenceIds || []) {
    if (!isConceptEvidenceId(id)) continue;
    out.push({
      key: `concept:${id}`,
      kind: EVIDENCE_GRAIN.CONCEPT,
      conceptId: String(id),
    });
  }
  return out;
}

/**
 * @param {EvidenceStore} store
 * @param {string} key
 * @param {{ correct: boolean, kind: string, conceptId?: string, presetId?: string, label?: string }} bump
 */
export function bumpGrain(store, key, bump) {
  if (!store || !key) return null;
  const grains = store.grains || (store.grains = {});
  const g =
    grains[key] ||
    (grains[key] = {
      correct: 0,
      total: 0,
      kind: bump.kind,
      conceptId: bump.conceptId,
      presetId: bump.presetId,
    });
  g.total += 1;
  if (bump.correct) g.correct += 1;
  if (bump.kind) g.kind = bump.kind;
  if (bump.conceptId) g.conceptId = bump.conceptId;
  if (bump.presetId) g.presetId = bump.presetId;
  if (bump.label) g.label = bump.label;
  return g;
}

/**
 * Record one scored attempt across unit / unit×preset / concept grains.
 * @param {EvidenceStore} store
 * @param {{
 *   dealKey?: string,
 *   presetId?: string|null,
 *   stimulus?: string|null,
 *   response?: string|null,
 *   evidenceIds?: string[],
 *   itemKey?: string|null,
 *   itemLabel?: string|null,
 *   correct: boolean,
 * }} attempt
 */
export function recordAttemptEvidence(store, attempt) {
  if (!store) return [];
  const keys = grainKeysForAttempt(attempt);
  for (const k of keys) {
    bumpGrain(store, k.key, {
      correct: !!attempt.correct,
      kind: k.kind,
      conceptId: k.conceptId,
      presetId: k.presetId,
      label: k.label,
    });
  }
  return keys;
}

/**
 * Flat `{ [unitKey]: {correct,total} }` for dealExercise (unit grain only).
 * @param {EvidenceStore|null|undefined} store
 * @param {{ key: string }[]} [candidates]
 */
export function dealerStatsFromEvidence(store, candidates = []) {
  /** @type {Record<string, { correct: number, total: number }>} */
  const stats = {};
  const grains = store?.grains || {};
  for (const c of candidates) {
    const g = grains[c.key];
    if (g?.total) stats[c.key] = { correct: g.correct, total: g.total };
  }
  for (const [key, g] of Object.entries(grains)) {
    if (g.kind !== EVIDENCE_GRAIN.UNIT || !g.total) continue;
    if (!stats[key]) stats[key] = { correct: g.correct, total: g.total };
  }
  return stats;
}

/** @param {GrainStat|null|undefined} g */
export function grainAccuracy(g) {
  if (!g?.total) return null;
  return g.correct / g.total;
}

/**
 * @param {EvidenceStore} store
 * @param {string} kind
 * @returns {{ key: string, stat: GrainStat }[]}
 */
export function grainsOfKind(store, kind) {
  const out = [];
  for (const [key, stat] of Object.entries(store?.grains || {})) {
    if (stat.kind === kind) out.push({ key, stat });
  }
  return out.sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Contrast two presets on the same unit (DoD: freeform weak, MC OK).
 * @param {EvidenceStore} store
 * @param {{ dealKey: string, presetA: string, presetB: string, minTotal?: number }} opts
 */
export function contrastUnitPresets(store, opts) {
  const minTotal = opts.minTotal ?? 1;
  const aKey = `${opts.dealKey}×${opts.presetA}`;
  const bKey = `${opts.dealKey}×${opts.presetB}`;
  const a = store?.grains?.[aKey] || null;
  const b = store?.grains?.[bKey] || null;
  if (!a || !b || a.total < minTotal || b.total < minTotal) {
    return {
      ready: false,
      a,
      b,
      aAcc: grainAccuracy(a),
      bAcc: grainAccuracy(b),
    };
  }
  return {
    ready: true,
    a,
    b,
    aAcc: grainAccuracy(a),
    bAcc: grainAccuracy(b),
    aWeaker: grainAccuracy(a) < grainAccuracy(b),
    bWeaker: grainAccuracy(b) < grainAccuracy(a),
  };
}

/**
 * Weak concept grains (morph rules failing).
 * @param {EvidenceStore} store
 * @param {{ threshold?: number, minTotal?: number }} [opts]
 */
export function weakConcepts(store, opts = {}) {
  const threshold = opts.threshold ?? 0.67;
  const minTotal = opts.minTotal ?? 1;
  return grainsOfKind(store, EVIDENCE_GRAIN.CONCEPT)
    .filter(({ stat }) => {
      if (stat.total < minTotal) return false;
      const acc = grainAccuracy(stat);
      return acc != null && acc < threshold;
    })
    .sort((a, b) => grainAccuracy(a.stat) - grainAccuracy(b.stat));
}

/**
 * Derive evidence ids for a Numbers attempt (engine rules + eval tags).
 * @param {{
 *   value?: number|null,
 *   evidenceIds?: string[],
 *   status?: string|null,
 *   kind?: string|null,
 * }} input
 */
export function deriveNumbersEvidenceIds(input = {}) {
  const ids = new Set();
  for (const id of input.evidenceIds || []) {
    if (id) ids.add(String(id));
  }
  const value = input.value;
  const kind = input.kind || "cardinal";
  if (
    value != null &&
    Number.isFinite(Number(value)) &&
    (kind === "cardinal" || kind === "" || kind == null)
  ) {
    try {
      const analysis = cardinalAnalysis(Number(value));
      for (const r of analysis?.rules || []) {
        if (r) ids.add(String(r));
      }
      ids.add("eval.cardinal.construction");
    } catch {
      /* ignore */
    }
  }
  const status = input.status || "";
  if (status === "incorrect") ids.add("eval.incorrect");
  else if (status === "accepted-alternative") ids.add("eval.alt");
  return [...ids];
}

/**
 * Snapshot fields for attempt / session-audit rows.
 * @param {string[]} evidenceIds
 * @param {{ dealKey?: string, presetId?: string|null }} [ctx]
 */
export function evidenceSnapshot(evidenceIds, ctx = {}) {
  const ids = [...(evidenceIds || [])];
  const concepts = ids.filter(isConceptEvidenceId);
  return {
    evidenceIds: ids,
    conceptIds: concepts,
    unitKey: ctx.dealKey || null,
    unitPresetKey:
      ctx.dealKey && ctx.presetId ? `${ctx.dealKey}×${ctx.presetId}` : null,
  };
}
