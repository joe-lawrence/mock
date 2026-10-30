/**
 * Shared rotation for green answer keys.
 *
 * Pass a stable key and the phrases for that item. The next call with the
 * same key returns the next phrase, then wraps. Put the phrase on the
 * question as `revealDe` and set `revealKaraoke` to `"sentence"` so the
 * reveal speaks it with sentence karaoke instead of the bare headword.
 */

const cursors = new Map();

/**
 * @param {string} key
 * @param {string[]} phrases
 * @returns {string}
 */
export function rotatePhrase(key, phrases) {
  const list = (Array.isArray(phrases) ? phrases : []).filter(Boolean);
  if (!list.length) return "";
  const id = String(key || "");
  const index = cursors.get(id) || 0;
  cursors.set(id, (index + 1) % list.length);
  return list[index];
}

/** Clear one key, or every key when called with no argument. */
export function resetPhraseRotation(key) {
  if (key == null) cursors.clear();
  else cursors.delete(String(key));
}
