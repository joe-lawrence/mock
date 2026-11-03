/**
 * What a guided unit must practice, and which item comes next.
 *
 * A correct streak does not finish a unit. Each ladder skill owns a slice of
 * the unit's required items. The slice is a spread of the range, not its
 * first few entries. The next item is uncovered content, then a miss, and
 * only then a deliberate review of something already answered.
 */

export const SPAN_LIMIT = 12;

export const GUIDED_PICK = Object.freeze({
  cover: {
    code: "cover",
    label: "New example",
    hint: "This required item has not been answered correctly yet.",
  },
  repair: {
    code: "repair",
    label: "Try again",
    hint: "The last answer on this item was not correct.",
  },
  retrieve: {
    code: "retrieve",
    label: "Review",
    hint: "The required items are done. This one comes back after the others.",
  },
  contrast: {
    code: "contrast",
    label: "Contrast peek",
    hint: "A related sense word so the thin unit does not hammer one surface.",
  },
});

/**
 * Surface fingerprint for Zahl/Nummer/Anzahl cards (lemma + task + direction + cue).
 * Coverage still uses slot ids; this only de-dupes what the learner sees.
 */
export function numberSenseSurfaceKey(meta) {
  const word = String(meta?.word || "");
  const task = String(meta?.task || "");
  const direction = String(meta?.direction || "");
  const prompt = normalizeQuestionText(meta?.prompt || "");
  const n = Number.isInteger(meta?.value) ? String(meta.value) : "";
  return `${word}|${task}|${direction}|${prompt}|${n}`;
}

/** Ignore case, punctuation, and spacing when comparing a prompt to an earlier one. */
export function normalizeQuestionText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Stable id for the thing a card tests. Format changes keep the same id. */
export function contentKeyOf(meta) {
  if (meta == null || meta === "") return "";
  if (typeof meta === "number" && Number.isFinite(meta)) return `n:${meta}`;
  if (typeof meta === "string") return `s:${normalizeQuestionText(meta)}`;
  if (meta.play && meta.answer != null) return `sound:${meta.play}:${meta.answer}`;
  if (meta.pattern && Number.isInteger(Number(meta.value))) {
    return `${meta.pattern}:${Number(meta.value)}`;
  }
  if (meta.playId) return `id:${meta.playId}`;
  if (meta.id) return `id:${meta.id}`;
  if (meta.lemma && meta.quizType) return `lemma:${meta.lemma}:${meta.quizType}`;
  if (meta.lemma) return `lemma:${meta.lemma}`;
  if (
    typeof meta.value === "number" &&
    (meta.kind == null || meta.kind === "cardinal")
  ) {
    return `n:${meta.value}`;
  }
  if (meta.kind === "clock" || meta.kind === "digital-time") {
    return `clock:${meta.kind}:${meta.hours}:${meta.minutes}`;
  }
  if (meta.kind === "duration") return `dur:${meta.hours}:${meta.minutes}`;
  if (meta.kind === "weekday") return `wd:${meta.index}`;
  if (meta.kind === "month") return `mo:${meta.month}`;
  if (meta.kind === "ordinal" || meta.kind === "ordinal-am") {
    return `ord:${meta.kind}:${meta.n}`;
  }
  if (meta.kind === "measure") return `meas:${meta.unit}:${meta.value ?? meta.n ?? ""}`;
  if (meta.kind === "calendar-date") {
    return `cal:${meta.day}.${meta.month}.${meta.year ?? ""}`;
  }
  if (meta.form) return `f:${normalizeQuestionText(meta.form)}`;
  return "";
}

const FULL_RANGE_SUFFIXES = [
  ":base",
  ":teens",
  ":tens",
  ":number-words",
  ":number-senses",
  ":amount-words",
  ":money-context",
  ":time-words",
  ":fraction-words",
  ":date-context",
  ":measure-context",
  ":weekdays",
  ":months",
];

function compareContentKeys(a, b) {
  const as = String(a).split(/(\d+)/);
  const bs = String(b).split(/(\d+)/);
  const n = Math.max(as.length, bs.length);
  for (let i = 0; i < n; i++) {
    const ap = as[i] ?? "";
    const bp = bs[i] ?? "";
    const an = /^\d+$/.test(ap) ? Number(ap) : NaN;
    const bn = /^\d+$/.test(bp) ? Number(bp) : NaN;
    if (!Number.isNaN(an) && !Number.isNaN(bn) && an !== bn) return an - bn;
    if (ap !== bp) return ap < bp ? -1 : 1;
  }
  return 0;
}

/** Lesson cards keep authored order. Other pools sort so a shuffle cannot change the required set. */
export function orderedContentKeys(keys, keepOrder = false) {
  const list = [...(keys || [])].filter(Boolean);
  if (keepOrder) return list;
  return list.sort(compareContentKeys);
}

/** How many items from this unit's pool are required. Small lessons use every card. */
export function coverageTake(unitKey, count) {
  const n = Math.max(0, Number(count) || 0);
  if (!n) return 0;
  const key = String(unitKey || "");
  if (FULL_RANGE_SUFFIXES.some((suffix) => key.endsWith(suffix))) return n;
  if (n <= 16) return n;
  return Math.min(SPAN_LIMIT, n);
}

/**
 * Evenly spaced keys, including both ends. A long pool does not collapse to its first items.
 * @param {readonly string[]} keys
 */
export function spanSample(keys, take) {
  const list = [...(keys || [])].filter(Boolean);
  const limit = Math.max(0, Number(take) || 0);
  if (!limit || list.length <= limit) return list;
  if (limit === 1) return [list[0]];
  const out = [];
  for (let i = 0; i < limit; i++) {
    const index = Math.round((i * (list.length - 1)) / (limit - 1));
    const key = list[index];
    if (!out.includes(key)) out.push(key);
  }
  return out;
}

/**
 * Hand the required keys to the ladder skills in turn, so each skill sees a spread.
 * @param {readonly string[]} contentKeys
 * @param {readonly string[]} ladder
 */
export function slicesForLadder(contentKeys, ladder) {
  const skills = (ladder || []).map(String).filter(Boolean);
  const names = skills.length ? skills : ["practice"];
  /** @type {Record<string, string[]>} */
  const slices = {};
  for (const name of names) slices[name] = [];
  for (let i = 0; i < (contentKeys || []).length; i++) {
    const key = contentKeys[i];
    if (!key) continue;
    slices[names[i % names.length]].push(key);
  }
  return slices;
}

export function sliceCovered(slice, correct) {
  const need = (slice || []).filter(Boolean);
  if (!need.length) return false;
  const done = new Set(correct || []);
  return need.every((key) => done.has(key));
}

export function coverageSummary(correct, slice) {
  const done = new Set(correct || []);
  const required = (slice || []).filter(Boolean);
  const remaining = required.filter((key) => !done.has(key));
  return {
    covered: required.length - remaining.length,
    required: required.length,
    remaining,
  };
}

/**
 * @param {{ slice?: readonly string[], correct?: readonly string[], wrong?: readonly string[], recent?: readonly string[] }} input
 */
function rotateKeys(list, salt) {
  if (list.length < 2) return list;
  const offset = Math.abs(Number(salt) || 0) % list.length;
  return list.slice(offset).concat(list.slice(0, offset));
}

/** Zero is still required, but it is not the opening question while others remain. */
function deferZero(list) {
  if (list.length < 2 || list[0] !== "n:0") return list;
  return [...list.slice(1), list[0]];
}

/**
 * One slot per time the learner should answer that pattern.
 * The number inside the card is drawn when the slot is dealt.
 * @param {readonly { pattern?: string, sampleTake?: number }[]} templates
 */
export function promptSlots(templates) {
  const slots = [];
  const seen = new Set();
  for (const template of templates || []) {
    const pattern = String(template?.pattern || "");
    if (!pattern || seen.has(pattern)) continue;
    seen.add(pattern);
    const take = Math.max(1, Number(template.sampleTake) || 1);
    for (let i = 1; i <= take; i++) slots.push(`${pattern}#${i}`);
  }
  return slots;
}

/**
 * Random pick from a discrete value list.
 * Skips values in `avoid` when the pool still has another choice.
 * `random` returns a number in [0, 1), like Math.random.
 */
export function drawFromPool(pool, avoid = [], random = Math.random) {
  const values = (Array.isArray(pool) ? pool : [])
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n));
  if (!values.length) return null;
  const skip = new Set((avoid || []).map(Number).filter((n) => Number.isFinite(n)));
  const open = values.filter((n) => !skip.has(n));
  const pick = open.length ? open : values;
  const roll = Number(random());
  const index = Math.min(
    pick.length - 1,
    Math.floor((Number.isFinite(roll) ? roll : 0) * pick.length)
  );
  return pick[Math.max(0, index)];
}

/**
 * Random whole number from min through max, inclusive.
 * Skips values in `avoid` when the range still has another choice.
 * `random` returns a number in [0, 1), like Math.random.
 */
export function drawPromptNumber(min, max, avoid = [], random = Math.random) {
  const lo = Math.ceil(Number(min));
  const hi = Math.floor(Number(max));
  const span = [];
  for (let n = lo; n <= hi; n++) span.push(n);
  if (!span.length) return lo;
  return drawFromPool(span, avoid, random);
}

export function parsePromptKey(contentKey) {
  const text = String(contentKey || "");
  const cut = text.lastIndexOf(":");
  if (cut <= 0) return null;
  const pattern = text.slice(0, cut);
  const digit = Number(text.slice(cut + 1));
  if (!pattern || !Number.isInteger(digit)) return null;
  return { pattern, digit };
}

export function pickGuidedContent({ slice, correct = [], wrong = [], recent = [], salt = 0 } = {}) {
  const list = (slice || []).filter(Boolean);
  const done = new Set(correct || []);
  const weak = new Set(wrong || []);
  const seen = recent || [];
  const last = seen.length ? seen[seen.length - 1] : "";
  const numeric = list.length > 0 && list.every((key) => /^n:\d+$/.test(key));
  const choose = (candidates, reason) => {
    if (!candidates.length) return null;
    const ordered = numeric ? deferZero(rotateKeys(candidates, salt)) : candidates;
    const fresh = ordered.filter((key) => key !== last);
    return { contentKey: (fresh.length ? fresh : ordered)[0], reason };
  };
  const unseen = list.filter((key) => !done.has(key) && !weak.has(key));
  const missed = list.filter((key) => weak.has(key));
  const retrieval = [...list].sort((a, b) => {
    const ai = seen.lastIndexOf(a);
    const bi = seen.lastIndexOf(b);
    return (ai < 0 ? -1 : ai) - (bi < 0 ? -1 : bi);
  });
  return (
    choose(unseen, GUIDED_PICK.cover) ||
    choose(missed, GUIDED_PICK.repair) ||
    choose(retrieval, GUIDED_PICK.retrieve) || { contentKey: "", reason: GUIDED_PICK.cover }
  );
}

export function emptyCoverageRow() {
  return { correct: [], wrong: [], recent: [], required: [] };
}

export function normalizeCoverage(raw) {
  if (!raw || typeof raw !== "object") return {};
  /** @type {Record<string, { correct: string[], wrong: string[], recent: string[] }>} */
  const out = {};
  for (const [unit, row] of Object.entries(raw)) {
    if (!unit || !row || typeof row !== "object") continue;
    const correct = [];
    const seen = new Set();
    for (const key of row.correct || []) {
      const id = String(key || "");
      if (!id || seen.has(id)) continue;
      seen.add(id);
      correct.push(id);
    }
    const wrong = [];
    const wrongSeen = new Set();
    for (const key of row.wrong || []) {
      const id = String(key || "");
      if (!id || seen.has(id) || wrongSeen.has(id)) continue;
      wrongSeen.add(id);
      wrong.push(id);
    }
    const recent = [];
    for (const key of row.recent || []) {
      const id = String(key || "");
      if (!id) continue;
      recent.push(id);
    }
    const required = [];
    const requiredSeen = new Set();
    for (const key of row.required || []) {
      const id = String(key || "");
      if (!id || requiredSeen.has(id)) continue;
      requiredSeen.add(id);
      required.push(id);
    }
    out[unit] = {
      correct,
      wrong,
      recent: recent.slice(-24),
      required,
      planRev: Math.max(0, Math.floor(Number(row.planRev) || 0)),
    };
  }
  return out;
}

/**
 * @param {Record<string, { correct: string[], wrong: string[], recent: string[] }>} coverage
 */
export function markCoverage(coverage, unitKey, contentKey, correct) {
  const next = normalizeCoverage(coverage);
  const unit = String(unitKey || "");
  const key = String(contentKey || "");
  if (!unit || !key) return next;
  const row = next[unit] || emptyCoverageRow();
  const recent = [...row.recent, key].slice(-24);
  const required = row.required || [];
  const planRev = row.planRev || 0;
  if (correct) {
    next[unit] = {
      correct: row.correct.includes(key) ? row.correct : [...row.correct, key],
      wrong: row.wrong.filter((item) => item !== key),
      recent,
      required,
      planRev,
    };
  } else {
    next[unit] = {
      correct: row.correct.filter((item) => item !== key),
      wrong: row.wrong.includes(key) ? row.wrong : [...row.wrong, key],
      recent,
      required,
      planRev,
    };
  }
  return next;
}

export function rememberRequired(coverage, unitKey, required) {
  const next = normalizeCoverage(coverage);
  const unit = String(unitKey || "");
  if (!unit) return next;
  const row = next[unit] || emptyCoverageRow();
  next[unit] = {
    ...row,
    required: [...(required || [])].filter(Boolean),
    planRev: row.planRev || 0,
  };
  return next;
}
