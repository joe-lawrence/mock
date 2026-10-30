/**
 * Shared Back / Forward trail for every quiz.
 * Back returns to the previous question, including one from another unit.
 * Forward walks that trail, and deals a new question only at the tip.
 */

const TRAIL_LIMIT = 60;

export function emptyQuizNav() {
  return { trail: [], index: -1 };
}

export function quizNavAtTip(nav) {
  const trail = nav?.trail || [];
  const index = nav?.index ?? -1;
  return index < 0 || index >= trail.length - 1;
}

export function quizNavBackDisabled(nav) {
  return (nav?.index ?? -1) <= 0;
}

/**
 * Record the question now on screen. Same key as the tip refreshes that entry.
 * Ignored while the learner is reviewing an earlier question.
 * @param {{ trail: object[], index: number }} nav
 * @param {{ view: string, key: string }} entry
 */
export function noteQuizNavEntry(nav, entry) {
  const current = nav || emptyQuizNav();
  if (!entry?.view || !entry?.key) return current;
  if (!quizNavAtTip(current)) return current;
  const trail = current.trail.slice();
  const last = trail[trail.length - 1];
  if (last && last.view === entry.view && last.key === entry.key) {
    trail[trail.length - 1] = entry;
    return { trail, index: trail.length - 1 };
  }
  trail.push(entry);
  let index = trail.length - 1;
  if (trail.length > TRAIL_LIMIT) {
    trail.shift();
    index = Math.max(0, index - 1);
  }
  return { trail, index };
}

/** @returns {{ nav: { trail: object[], index: number }, entry: object|null }} */
export function stepQuizNavBack(nav) {
  const current = nav || emptyQuizNav();
  const index = current.index ?? -1;
  if (index <= 0) return { nav: current, entry: null };
  const nextIndex = index - 1;
  return {
    nav: { trail: current.trail, index: nextIndex },
    entry: current.trail[nextIndex] || null,
  };
}

/**
 * @returns {{ nav: { trail: object[], index: number }, entry: object|null, kind: "history"|"tip" }}
 */
export function stepQuizNavForward(nav) {
  const current = nav || emptyQuizNav();
  const trail = current.trail || [];
  const index = current.index ?? -1;
  if (index >= 0 && index < trail.length - 1) {
    const nextIndex = index + 1;
    return {
      nav: { trail, index: nextIndex },
      entry: trail[nextIndex] || null,
      kind: "history",
    };
  }
  return { nav: current, entry: null, kind: "tip" };
}
