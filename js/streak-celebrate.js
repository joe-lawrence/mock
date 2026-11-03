/**
 * Consecutive-correct milestones for the answer key.
 * Every 10 in a row (10, 20, 30…) opens a celebration reveal.
 */

/** Testing: every 2. Restore to 10 before ship. */
export const STREAK_MILESTONE = 2;

/** Pause after the original answer-key karaoke before congrats + fireballs. */
export const STREAK_CELEBRATE_PAUSE_MS = 1000;

/** @typedef {{ de: string, en: string, spoken: string, parts: { text: string, guide: string, stress?: boolean }[] }} StreakPhrase */

/** @type {readonly StreakPhrase[]} */
export const STREAK_PHRASES = Object.freeze([
  Object.freeze({
    de: "Sehr gut!",
    en: "Very good!",
    spoken: "Sehr gut!",
    parts: Object.freeze([
      Object.freeze({ text: "Sehr", guide: "zair", stress: true }),
      Object.freeze({ text: "gut", guide: "goot" }),
    ]),
  }),
  Object.freeze({
    de: "Wunderbar!",
    en: "Wonderful!",
    spoken: "Wunderbar!",
    parts: Object.freeze([
      Object.freeze({ text: "Wun", guide: "VOON", stress: true }),
      Object.freeze({ text: "der", guide: "der" }),
      Object.freeze({ text: "bar", guide: "bar" }),
    ]),
  }),
  Object.freeze({
    de: "Toll gemacht!",
    en: "Well done!",
    spoken: "Toll gemacht!",
    parts: Object.freeze([
      Object.freeze({ text: "Toll", guide: "tol", stress: true }),
      Object.freeze({ text: "ge", guide: "guh" }),
      Object.freeze({ text: "macht", guide: "makht", stress: true }),
    ]),
  }),
  Object.freeze({
    de: "Fantastisch!",
    en: "Fantastic!",
    spoken: "Fantastisch!",
    parts: Object.freeze([
      Object.freeze({ text: "Fan", guide: "fan" }),
      Object.freeze({ text: "tas", guide: "TAS", stress: true }),
      Object.freeze({ text: "tisch", guide: "tish" }),
    ]),
  }),
  Object.freeze({
    de: "Spitze!",
    en: "Excellent!",
    spoken: "Spitze!",
    parts: Object.freeze([
      Object.freeze({ text: "Spit", guide: "SHPIT", stress: true }),
      Object.freeze({ text: "ze", guide: "suh" }),
    ]),
  }),
  Object.freeze({
    de: "Weiter so!",
    en: "Keep it up!",
    spoken: "Weiter so!",
    parts: Object.freeze([
      Object.freeze({ text: "Wei", guide: "VY", stress: true }),
      Object.freeze({ text: "ter", guide: "ter" }),
      Object.freeze({ text: "so", guide: "zoh" }),
    ]),
  }),
]);

/**
 * @param {number} streak
 * @returns {boolean}
 */
export function isCorrectStreakMilestone(streak) {
  const n = Math.floor(Number(streak) || 0);
  return n > 0 && n % STREAK_MILESTONE === 0;
}

/**
 * Phrase for this milestone (rotates 10→0, 20→1, …).
 * @param {number} streak
 * @returns {StreakPhrase & { verdict: string, streak: number }}
 */
export function streakCelebrationFor(streak) {
  const n = Math.max(0, Math.floor(Number(streak) || 0));
  const milestoneIndex = Math.max(0, Math.floor(n / STREAK_MILESTONE) - 1);
  const phrase = STREAK_PHRASES[milestoneIndex % STREAK_PHRASES.length];
  return {
    ...phrase,
    parts: phrase.parts.map((p) => ({ ...p })),
    streak: n,
    verdict: `${n} in a row!`,
  };
}

/**
 * @param {number} streak
 * @returns {number}
 */
export function bumpCorrectStreak(streak) {
  return Math.max(0, Math.floor(Number(streak) || 0)) + 1;
}
