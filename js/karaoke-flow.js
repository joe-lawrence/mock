/**
 * Shared karaoke timing — duration-weighted `.is-active` syllable highlight.
 * Extracted from Schnapp `mock.js` `playKaraokeFlow` so WortMatch can reuse it.
 */

/**
 * Estimate utterance length; refine from prior onend measurements when available.
 * @param {string} text
 * @param {number} [rate=1]
 * @param {number|null} [measuredMsPerChar]
 */
export function estimateUtteranceMs(text, rate = 1, measuredMsPerChar = null) {
  if (measuredMsPerChar && measuredMsPerChar > 25 && measuredMsPerChar < 180) {
    return Math.max(480, measuredMsPerChar * String(text || "").length);
  }
  // ~11 German graphemes/sec at rate 1 (rough browser/Piper baseline)
  const charsPerSec = 11 * rate;
  return Math.max(520, (String(text || "").length / charsPerSec) * 1000 + 140);
}

/**
 * Clear pending karaoke highlight timers.
 * @param {ReturnType<typeof setTimeout>[]} [timers]
 */
export function clearKaraokeTimers(timers) {
  if (!timers) return;
  timers.forEach(clearTimeout);
  timers.length = 0;
}

/**
 * Full-word TTS with flowing syllable highlight.
 *
 * @param {string} tts spoken text
 * @param {Array<{ text?: string, stress?: boolean }>} syllables
 * @param {Element[]} nodes DOM nodes aligned 1:1 with syllables
 * @param {object} opts
 * @param {(text: string, speakOpts: {
 *   rate: number,
 *   onStart?: (info?: { durationMs?: number }) => void,
 *   onEnd?: () => void,
 *   onError?: (err?: unknown) => void,
 * }) => void} opts.speak TTS entry (Piper / speechSynthesis)
 * @param {() => void} [opts.onBeforeStart] e.g. stop prior speech
 * @param {ReturnType<typeof setTimeout>[]} [opts.timers] mutable timer bag (caller clears on dismiss)
 * @param {() => (number|null|undefined)} [opts.getMsPerChar]
 * @param {(ms: number) => void} [opts.setMsPerChar]
 * @param {() => void} [opts.onEnd]
 * @param {() => void} [opts.onError]
 * @param {number} [opts.rate=1]
 * @returns {ReturnType<typeof setTimeout>[]} timer bag
 */
export function playKaraokeFlow(tts, syllables, nodes, opts = {}) {
  const {
    rate = 1,
    speak,
    onBeforeStart,
    timers: timersIn,
    getMsPerChar,
    setMsPerChar,
    onEnd,
    onError,
  } = opts;

  onBeforeStart?.();

  const timers = timersIn || [];
  timers.length = 0;

  if (!nodes?.length || !tts || typeof speak !== "function") {
    onError?.();
    return timers;
  }

  const weights = syllables.map((s) =>
    Math.max(2, (s.text || "").length + (s.stress ? 1 : 0))
  );
  const totalW = weights.reduce((a, b) => a + b, 0) || 1;
  const estimated = estimateUtteranceMs(tts, rate, getMsPerChar?.() ?? null);

  const clearActive = () => {
    nodes.forEach((n) => n?.classList?.remove("is-active"));
  };

  const schedule = (totalMs) => {
    clearKaraokeTimers(timers);
    clearActive();
    let t = 60;
    const usable = Math.max(320, totalMs - 100);
    syllables.forEach((_, i) => {
      const slice = (weights[i] / totalW) * usable;
      const at = t;
      timers.push(
        setTimeout(() => {
          clearActive();
          nodes[i]?.classList?.add("is-active");
        }, at)
      );
      t += slice;
    });
  };

  let startedAt = 0;
  let finished = false;
  const finish = (fn) => {
    if (finished) return;
    finished = true;
    fn?.();
  };

  speak(tts, {
    rate,
    onStart: (info) => {
      startedAt = performance.now();
      const durationMs =
        info && typeof info.durationMs === "number" && info.durationMs > 0
          ? info.durationMs
          : estimated;
      schedule(durationMs);
    },
    onEnd: () => {
      const actual = Math.max(300, performance.now() - startedAt);
      setMsPerChar?.(actual / Math.max(1, String(tts).length));
      clearActive();
      nodes[nodes.length - 1]?.classList?.add("is-active");
      timers.push(
        setTimeout(() => {
          clearActive();
          finish(onEnd);
        }, 320)
      );
    },
    onError: () => {
      clearActive();
      finish(onError || onEnd);
    },
  });

  return timers;
}
