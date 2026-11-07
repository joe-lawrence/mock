/**
 * Pure spaced-repetition helpers for Artikel Climber / Snow-Nomen (testable without canvas).
 */

export const ACTIVE_SIZE = 5;
export const TARGET_STREAK = 3;

/** Prefer not reusing an answer key that appeared in this many recent targets. */
export const ANSWER_SPACING = 3;

/**
 * Gate / article answer identity for spacing (der|die|das or masc|fem|neut).
 * @param {{ article?: string, gender?: string }|null|undefined} word
 */
export function wordAnswerKey(word) {
  const article = String(word?.article || "")
    .trim()
    .toLowerCase();
  if (article) return article;
  return String(word?.gender || "")
    .trim()
    .toLowerCase();
}

/**
 * @param {object[]} vocab — mutable word objects (streak fields attached in place)
 */
export function shuffleCopy(vocab) {
  const list = [...(vocab || [])];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

/**
 * @param {object[]} vocab
 * @returns {{ unseenPool: object[], activePool: object[], graduatedPool: object[] }}
 */
export function initClimberPools(vocab) {
  const unseenPool = shuffleCopy(vocab);
  const activePool = [];
  const graduatedPool = [];
  while (activePool.length < ACTIVE_SIZE && unseenPool.length > 0) {
    const w = unseenPool.pop();
    w.streak = 0;
    w.wrongStreak = 0;
    w.showHint = true;
    activePool.push(w);
  }
  return { unseenPool, activePool, graduatedPool };
}

/**
 * Prefer candidates whose answer key is outside the recent window, then
 * at least different from the last answer, then any candidate.
 * @param {object[]} candidates
 * @param {string[]} recentAnswers
 * @param {(w: object) => string} keyOf
 */
export function preferSpacedAnswers(
  candidates,
  recentAnswers,
  keyOf = wordAnswerKey
) {
  if (!candidates?.length) return [];
  const recent = Array.isArray(recentAnswers) ? recentAnswers : [];
  const window = recent.slice(-ANSWER_SPACING);
  const windowSet = new Set(window.filter(Boolean));
  if (windowSet.size) {
    const fresh = candidates.filter((w) => !windowSet.has(keyOf(w)));
    if (fresh.length) return fresh;
  }
  const last = window[window.length - 1];
  if (last) {
    const changed = candidates.filter((w) => keyOf(w) !== last);
    if (changed.length) return changed;
  }
  return candidates;
}

/**
 * @param {{ unseenPool: object[], activePool: object[], graduatedPool: object[], current?: object|null }} pools
 * @param {() => number} [random]
 * @param {{
 *   recentAnswers?: string[],
 *   answerKeyOf?: (w: object) => string,
 * }} [opts]
 */
export function pickClimberWord(pools, random = Math.random, opts = {}) {
  const { unseenPool, activePool, graduatedPool, current } = pools;
  const recentAnswers = opts.recentAnswers || [];
  const keyOf = opts.answerKeyOf || wordAnswerKey;

  const choose = (list) => {
    const spaced = preferSpacedAnswers(list, recentAnswers, keyOf);
    const pool = spaced.length ? spaced : list;
    if (!pool.length) return null;
    return pool[Math.floor(random() * pool.length)];
  };

  if (!activePool.length && !unseenPool.length) {
    if (!graduatedPool.length) return null;
    return choose(graduatedPool);
  }
  if (graduatedPool.length > 0 && random() < 0.15) {
    const fromGrad = choose(graduatedPool);
    if (fromGrad) return fromGrad;
  }
  let candidates = activePool.filter((w) => w !== current);
  if (!candidates.length) candidates = activePool;
  if (!candidates.length) return null;
  return choose(candidates);
}

/**
 * @param {{ unseenPool: object[], activePool: object[], graduatedPool: object[] }} pools
 * @param {object} word
 */
export function markClimberCorrect(pools, word) {
  if (!word || !pools.activePool.includes(word)) return pools;
  word.streak = (word.streak || 0) + 1;
  word.wrongStreak = 0;
  if (word.streak >= 2) word.showHint = false;
  if (word.streak >= TARGET_STREAK) {
    pools.activePool = pools.activePool.filter((w) => w !== word);
    pools.graduatedPool.push(word);
    if (pools.unseenPool.length > 0) {
      const next = pools.unseenPool.pop();
      next.streak = 0;
      next.wrongStreak = 0;
      next.showHint = true;
      pools.activePool.push(next);
    }
  }
  return pools;
}

/**
 * @param {{ unseenPool: object[], activePool: object[], graduatedPool: object[] }} pools
 * @param {object} word
 */
export function markClimberIncorrect(pools, word) {
  if (!word) return pools;
  word.streak = 0;
  word.wrongStreak = (word.wrongStreak || 0) + 1;
  if (word.wrongStreak >= 2) word.showHint = true;
  if (pools.activePool.includes(word)) return pools;
  if (pools.graduatedPool.includes(word)) {
    pools.graduatedPool = pools.graduatedPool.filter((w) => w !== word);
    pools.activePool.push(word);
  }
  return pools;
}
