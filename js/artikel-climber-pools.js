/**
 * Pure spaced-repetition helpers for Artikel Climber (testable without canvas).
 */

export const ACTIVE_SIZE = 5;
export const TARGET_STREAK = 3;

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
 * @param {{ unseenPool: object[], activePool: object[], graduatedPool: object[], current?: object|null }} pools
 * @param {() => number} [random]
 */
export function pickClimberWord(pools, random = Math.random) {
  const { unseenPool, activePool, graduatedPool, current } = pools;
  if (!activePool.length && !unseenPool.length) {
    if (!graduatedPool.length) return null;
    return graduatedPool[Math.floor(random() * graduatedPool.length)];
  }
  if (graduatedPool.length > 0 && random() < 0.15) {
    return graduatedPool[Math.floor(random() * graduatedPool.length)];
  }
  let candidates = activePool.filter((w) => w !== current);
  if (!candidates.length) candidates = activePool;
  if (!candidates.length) return null;
  return candidates[Math.floor(random() * candidates.length)];
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
