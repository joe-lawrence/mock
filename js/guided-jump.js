/**
 * Steps a guided jump leaves behind: the current step through the one
 * before the chosen step. Earlier progress stays as it was.
 * @param {readonly string[]} order curriculum order
 * @param {string|null|undefined} fromKey
 * @param {string} toKey
 * @returns {string[]}
 */
export function keysSkippedByJump(order, fromKey, toKey) {
  const list = order || [];
  const to = list.indexOf(toKey);
  if (to < 0) return [];
  let from = fromKey ? list.indexOf(fromKey) : 0;
  if (from < 0) from = 0;
  if (to <= from) return [];
  return list.slice(from, to);
}
