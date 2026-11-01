/**
 * Guided scheduling across sessions.
 *
 * This run's evidence stays in the session store (audit, report card).
 * The dealer also reads a snapshot of the profile taken at Start, so a
 * return visit continues from units already practiced.
 */

import { emptyEvidenceStore, EVIDENCE_GRAIN } from "./multi-grain-evidence.js";

/** @param {import("./multi-grain-evidence.js").EvidenceStore|null|undefined} store */
export function cloneEvidenceStore(store) {
  /** @type {Record<string, object>} */
  const grains = {};
  for (const [key, stat] of Object.entries(store?.grains || {})) {
    if (!stat || typeof stat !== "object") continue;
    grains[key] = { ...stat };
  }
  return { grains };
}

/**
 * Unit grain, including older rows that never stored `kind`.
 * Preset and item keys contain "×"; concept keys are prefixed.
 * @param {string} key
 * @param {{ kind?: string, total?: number }|null|undefined} stat
 */
export function isUnitGrain(key, stat) {
  if (!stat?.total) return false;
  if (stat.kind === EVIDENCE_GRAIN.UNIT) return true;
  if (stat.kind) return false;
  const id = String(key || "");
  if (!id || id.startsWith("concept:") || id.includes("×")) return false;
  return true;
}

/** @param {import("./multi-grain-evidence.js").EvidenceStore|null|undefined} store */
export function unitKeysFromEvidence(store) {
  /** @type {string[]} */
  const keys = [];
  for (const [key, stat] of Object.entries(store?.grains || {})) {
    if (isUnitGrain(key, stat)) keys.push(key);
  }
  return keys;
}

/**
 * Previous-session counts plus this run. Same key sums; labels come from
 * whichever side recorded them.
 * @param {import("./multi-grain-evidence.js").EvidenceStore|null|undefined} history
 * @param {import("./multi-grain-evidence.js").EvidenceStore|null|undefined} session
 */
export function mergeEvidenceStores(history, session) {
  const out = cloneEvidenceStore(history || emptyEvidenceStore());
  for (const [key, stat] of Object.entries(session?.grains || {})) {
    if (!stat?.total) continue;
    const existing = out.grains[key];
    if (!existing) {
      out.grains[key] = { ...stat };
      continue;
    }
    existing.correct = (existing.correct || 0) + (stat.correct || 0);
    existing.total = (existing.total || 0) + stat.total;
    if (stat.kind) existing.kind = stat.kind;
    if (stat.conceptId) existing.conceptId = stat.conceptId;
    if (stat.presetId) existing.presetId = stat.presetId;
    if (stat.label) existing.label = stat.label;
  }
  return out;
}

/**
 * Evidence and seen-set for the next guided deal.
 * `sessionSeen` covers deals and jumps this run that may not have a score yet.
 * @param {{
 *   history?: import("./multi-grain-evidence.js").EvidenceStore|null,
 *   sessionEvidence?: import("./multi-grain-evidence.js").EvidenceStore|null,
 *   sessionSeen?: Iterable<string>|null,
 * }} [input]
 * @returns {{ evidence: import("./multi-grain-evidence.js").EvidenceStore, seen: Set<string> }}
 */
export function guidedSchedulingView({
  history = null,
  sessionEvidence = null,
  sessionSeen = null,
} = {}) {
  const evidence = mergeEvidenceStores(history, sessionEvidence);
  const seen = new Set(sessionSeen || []);
  for (const key of unitKeysFromEvidence(evidence)) seen.add(key);
  return { evidence, seen };
}
