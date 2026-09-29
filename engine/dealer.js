/**
 * Lightweight Dealer — chooses the next exercise descriptor for a guided session.
 *
 * This is intentionally decoupled from the deterministic linguistic engines and
 * from the mock's curriculum: the caller supplies candidate descriptors and the
 * recent attempt log, and the Dealer returns which candidate to run next plus a
 * human-readable reasonCode ("review" / "new" / "continue").
 *
 * Keeping the interface data-only lets the UI layer own curriculum shape while
 * this module owns scheduling policy.
 */

/**
 * @typedef {object} DealCandidate
 * @property {string} key            Stable identity (e.g. "cardinals:tens").
 * @property {string} territory      "numbers" | "nouns" | ...
 * @property {string} [topicId]
 * @property {string} [stepId]
 * @property {string} [learnUnitId]
 * @property {string} [mode]
 */

/**
 * @typedef {object} ReasonCode
 * @property {"review"|"new"|"continue"} code
 * @property {string} label          Short badge text.
 * @property {string} hint           Sentence-length explanation for a tooltip.
 */

/** @type {Record<string, ReasonCode>} */
export const DEALER_REASONS = {
  review: {
    code: "review",
    label: "Review",
    hint: "You missed this recently — let’s lock it in.",
  },
  new: {
    code: "new",
    label: "New",
    hint: "Fresh material for this session.",
  },
  continue: {
    code: "continue",
    label: "Continue",
    hint: "Keep the streak going.",
  },
};

/** Mastery threshold — accuracy below this on a seen key is due for review. */
export const WEAK_ACCURACY = 0.67;

function accuracy(stat) {
  if (!stat || !stat.total) return null;
  return stat.correct / stat.total;
}

/**
 * Pick the next candidate + reason across the whole candidate set.
 *
 * Policy (order + competency):
 *   1) Review — a previously seen candidate whose accuracy is weak (lowest first).
 *   2) New — the first not-yet-seen candidate, in curriculum order.
 *   3) Continue — once everything's been seen, keep drilling the weakest.
 *
 * @param {{ candidates?: DealCandidate[], seen?: string[], stats?: Record<string, {correct:number,total:number}> }} [input]
 * @returns {{ candidate: DealCandidate, reasonCode: ReasonCode } | null}
 */
export function dealExercise({ candidates, seen = [], stats = {} } = {}) {
  const list = Array.isArray(candidates) ? candidates.filter(Boolean) : [];
  if (!list.length) return null;
  const seenSet = new Set(seen);

  // 1) Review — weakest seen candidate under the mastery threshold.
  let weakest = null;
  for (const c of list) {
    if (!seenSet.has(c.key)) continue;
    const acc = accuracy(stats[c.key]);
    if (acc == null || acc >= WEAK_ACCURACY) continue;
    if (!weakest || acc < weakest.acc) weakest = { c, acc };
  }
  if (weakest) return { candidate: weakest.c, reasonCode: DEALER_REASONS.review };

  // 2) New — first unseen candidate in curriculum order.
  const fresh = list.find((c) => !seenSet.has(c.key));
  if (fresh) return { candidate: fresh, reasonCode: DEALER_REASONS.new };

  // 3) Continue — everything seen; keep the lowest-accuracy one moving.
  let pick = null;
  for (const c of list) {
    const acc = accuracy(stats[c.key]);
    const score = acc == null ? 1 : acc;
    if (!pick || score < pick.score) pick = { c, score };
  }
  return { candidate: pick?.c || list[0], reasonCode: DEALER_REASONS.continue };
}
