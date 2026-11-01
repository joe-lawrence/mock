/**
 * Guided route and graduation.
 *
 * One selected unit is open. Its presets climb by seed difficulty, at most
 * three steps. Three correct answers in a row clear a step. The last step
 * graduates the unit and opens the next one on the path. Every fourth deal
 * after that is one card from a finished unit.
 *
 * Numbers order is the guided path. Nouns, Sounds, and Case keep the order
 * they are built in, after Numbers.
 */

export const STAGE_BLOCK = 3;
export const SPRINKLE_EVERY = 4;
export const LADDER_STEPS = 3;

/** Numbers units in guided order. Support-word steps open a topic, except money phrases. */
export const NUMBERS_GUIDED_ORDER = Object.freeze([
  "numbers:cardinals:number-words",
  "numbers:cardinals:base",
  "numbers:cardinals:teens",
  "numbers:cardinals:tens",
  "numbers:cardinals:compounds",
  "numbers:cardinals:hundreds",
  "numbers:decimals:komma-read",
  "numbers:decimals:place-value",
  "numbers:decimals:money-context",
  "numbers:decimals:money-euros",
  "numbers:decimals:money-cents",
  "numbers:fractions:fraction-words",
  "numbers:fractions:half-quarter",
  "numbers:fractions:unit-fractions",
  "numbers:fractions:proper-fractions",
  "numbers:fractions:mixed-numbers",
  "numbers:time:time-words",
  "numbers:time:whole-hours",
  "numbers:time:half-past",
  "numbers:time:quarters",
  "numbers:time:minutes",
  "numbers:time:digital-24h",
  "numbers:time:duration",
  "numbers:dates:date-context",
  "numbers:dates:weekdays",
  "numbers:dates:months",
  "numbers:measurement:measure-context",
  "numbers:measurement:length",
  "numbers:measurement:weight",
  "numbers:measurement:volume",
  "numbers:measurement:temp-speed",
  "numbers:ordinals:ordinal-1-12",
  "numbers:ordinals:ordinal-teens",
  "numbers:ordinals:ordinal-tens",
  "numbers:ordinals:ordinal-compounds",
]);

const NUMBERS_RANK = new Map(NUMBERS_GUIDED_ORDER.map((key, index) => [key, index]));

export const GUIDED_REASONS = Object.freeze({
  focus: {
    code: "focus_unit",
    label: "This unit",
    hint: "Three correct in a row moves you to a harder step, then the next unit.",
  },
  review: {
    code: "review",
    label: "Review",
    hint: "A quick card from a unit you already finished.",
  },
  done: {
    code: "continue",
    label: "Continue",
    hint: "Every selected unit is finished. This card keeps an earlier unit warm.",
  },
});

/** @returns {{ graduated: string[], skipped: string[], openKey: string|null, stage: number, streak: number, deals: number }} */
export function emptyGuidedProgress() {
  return {
    graduated: [],
    skipped: [],
    openKey: null,
    stage: 0,
    streak: 0,
    deals: 0,
  };
}

function stringList(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  const seen = new Set();
  for (const item of raw) {
    const key = String(item || "");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

/** @param {unknown} raw */
export function normalizeGuidedProgress(raw) {
  const base = emptyGuidedProgress();
  if (!raw || typeof raw !== "object") return base;
  const src = /** @type {Record<string, unknown>} */ (raw);
  const graduated = stringList(src.graduated);
  const graduatedSet = new Set(graduated);
  return {
    graduated,
    skipped: stringList(src.skipped).filter((key) => !graduatedSet.has(key)),
    openKey: typeof src.openKey === "string" && src.openKey ? src.openKey : null,
    stage: Math.max(0, Number(src.stage) || 0),
    streak: Math.max(0, Number(src.streak) || 0),
    deals: Math.max(0, Number(src.deals) || 0),
  };
}

export function progressIsBlank(progress) {
  const p = normalizeGuidedProgress(progress);
  return (
    !p.graduated.length &&
    !p.skipped.length &&
    !p.openKey &&
    !p.stage &&
    !p.streak &&
    !p.deals
  );
}

/**
 * Stable order: listed Numbers units, then everything else in the order given.
 * @param {readonly string[]} keys
 */
export function orderGuidedKeys(keys) {
  return [...(keys || [])].sort((a, b) => {
    const ar = NUMBERS_RANK.has(a) ? NUMBERS_RANK.get(a) : Number.MAX_SAFE_INTEGER;
    const br = NUMBERS_RANK.has(b) ? NUMBERS_RANK.get(b) : Number.MAX_SAFE_INTEGER;
    if (ar !== br) return ar - br;
    return 0;
  });
}

/**
 * Up to three presets, easiest seed first. A longer allowlist keeps the
 * easiest, a middle step, and the hardest.
 * @param {readonly string[]} modeIds
 * @param {Record<string, number>} [seeds]
 */
export function presetLadder(modeIds, seeds = {}, maxSteps = LADDER_STEPS) {
  const ranked = [];
  const seen = new Set();
  for (const id of modeIds || []) {
    const preset = String(id || "");
    if (!preset || seen.has(preset)) continue;
    seen.add(preset);
    const seed = Number(seeds?.[preset]);
    ranked.push({ id: preset, seed: Number.isFinite(seed) ? seed : 0.5 });
  }
  ranked.sort((a, b) => a.seed - b.seed || a.id.localeCompare(b.id));
  if (ranked.length <= maxSteps) return ranked.map((row) => row.id);
  const picked = [];
  for (let i = 0; i < maxSteps; i++) {
    const index = Math.round((i * (ranked.length - 1)) / (maxSteps - 1));
    const id = ranked[index].id;
    if (!picked.includes(id)) picked.push(id);
  }
  return picked;
}

/** First path key that is neither graduated nor skipped. */
export function openUnitKey(pathKeys, progress) {
  const p = normalizeGuidedProgress(progress);
  const done = new Set([...p.graduated, ...p.skipped]);
  return (pathKeys || []).find((key) => key && !done.has(key)) || null;
}

/**
 * Keep stage and streak when the open unit is unchanged.
 * @param {ReturnType<typeof emptyGuidedProgress>} progress
 * @param {readonly string[]} pathKeys
 */
export function alignGuidedProgress(progress, pathKeys) {
  const next = normalizeGuidedProgress(progress);
  const open = openUnitKey(pathKeys, next);
  if (open !== next.openKey) {
    next.openKey = open;
    next.stage = 0;
    next.streak = 0;
  }
  return next;
}

/**
 * Units with three correct answers on each ladder step count as graduated
 * when the profile has no guided progress yet.
 * @param {ReturnType<typeof emptyGuidedProgress>} progress
 * @param {readonly string[]} pathKeys
 * @param {Record<string, readonly string[]>} ladders
 * @param {{ grains?: Record<string, { correct?: number }> }|null} evidence
 */
export function hydrateGuidedProgress(progress, pathKeys, ladders, evidence) {
  const saved = normalizeGuidedProgress(progress);
  if (!progressIsBlank(saved)) return alignGuidedProgress(saved, pathKeys);
  const grains = evidence?.grains || {};
  const graduated = [];
  let stage = 0;
  for (const key of pathKeys || []) {
    const ladder = ladders?.[key]?.length ? ladders[key] : [];
    let cleared = 0;
    for (const preset of ladder) {
      const stat = grains[`${key}×${preset}`];
      if ((stat?.correct || 0) >= STAGE_BLOCK) cleared += 1;
      else break;
    }
    if (ladder.length && cleared >= ladder.length) {
      graduated.push(key);
      continue;
    }
    return alignGuidedProgress(
      { ...saved, graduated, openKey: key, stage: cleared, streak: 0 },
      pathKeys
    );
  }
  return alignGuidedProgress({ ...saved, graduated, openKey: null, stage: 0, streak: 0 }, pathKeys);
}

/**
 * @param {ReturnType<typeof emptyGuidedProgress>} progress
 * @param {{
 *   pathKeys: readonly string[],
 *   correct: boolean,
 *   review?: boolean,
 *   unitKey?: string,
 *   ladderLength?: number,
 * }} result
 */
export function applyGuidedResult(progress, result) {
  const next = normalizeGuidedProgress(progress);
  const open = openUnitKey(result.pathKeys, next);
  next.openKey = open;
  if (!open || result.review) return next;
  if (result.unitKey && result.unitKey !== open) return next;
  if (!result.correct) {
    next.streak = 0;
    return next;
  }
  next.streak += 1;
  if (next.streak < STAGE_BLOCK) return next;
  next.streak = 0;
  const length = Math.max(1, Number(result.ladderLength) || 1);
  if (next.stage + 1 < length) {
    next.stage += 1;
    return next;
  }
  if (!next.graduated.includes(open)) next.graduated = [...next.graduated, open];
  next.stage = 0;
  next.openKey = openUnitKey(result.pathKeys, next);
  return next;
}

/**
 * @param {ReturnType<typeof emptyGuidedProgress>} progress
 * @param {readonly string[]} pathKeys
 * @param {readonly string[]} skippedKeys
 */
export function skipGuidedUnits(progress, pathKeys, skippedKeys) {
  const next = normalizeGuidedProgress(progress);
  const graduated = new Set(next.graduated);
  const skipped = new Set(next.skipped);
  for (const key of skippedKeys || []) {
    if (key && !graduated.has(key)) skipped.add(key);
  }
  next.skipped = [...skipped];
  return alignGuidedProgress(next, pathKeys);
}

/**
 * Next card. `deals` on the result is the count including this card.
 * @param {{
 *   pathKeys: readonly string[],
 *   progress: ReturnType<typeof emptyGuidedProgress>,
 *   ladderOf: (key: string) => readonly string[],
 * }} input
 */
export function planGuidedStep({ pathKeys, progress, ladderOf }) {
  const keys = (pathKeys || []).filter(Boolean);
  if (!keys.length) return null;
  const aligned = alignGuidedProgress(progress, keys);
  const open = aligned.openKey;
  const graduated = aligned.graduated.filter((key) => keys.includes(key));
  const deals = aligned.deals + 1;
  const reviewTurn =
    !!open && deals % SPRINKLE_EVERY === 0 && graduated.length > 0;
  if (!open) {
    const key = graduated[graduated.length - 1] || keys[0];
    const ladder = ladderOf(key) || [];
    return {
      key,
      presetId: ladder[0] || null,
      review: true,
      reason: GUIDED_REASONS.done,
      stage: 0,
      deals,
    };
  }
  if (reviewTurn) {
    const index = (Math.floor(deals / SPRINKLE_EVERY) - 1) % graduated.length;
    const key = graduated[index];
    const ladder = ladderOf(key) || [];
    return {
      key,
      presetId: ladder[0] || null,
      review: true,
      reason: GUIDED_REASONS.review,
      stage: 0,
      deals,
    };
  }
  const ladder = ladderOf(open) || [];
  const stage =
    ladder.length > 0 ? Math.min(aligned.stage, ladder.length - 1) : 0;
  return {
    key: open,
    presetId: ladder[stage] || ladder[0] || null,
    review: false,
    reason: GUIDED_REASONS.focus,
    stage,
    deals,
  };
}
