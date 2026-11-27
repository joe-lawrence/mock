import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  estimateUtteranceMs,
  clearKaraokeTimers,
  playKaraokeFlow,
} from "./karaoke-flow.js";

describe("estimateUtteranceMs", () => {
  it("scales with text length", () => {
    const short = estimateUtteranceMs("ab", 1);
    const long = estimateUtteranceMs("abcdefghijklmnop", 1);
    assert.ok(long > short);
    assert.ok(short >= 520);
  });

  it("uses measured ms/char when in range", () => {
    const ms = estimateUtteranceMs("abcd", 1, 50);
    assert.equal(ms, Math.max(480, 50 * 4));
  });
});

describe("playKaraokeFlow", () => {
  it("schedules highlights from onStart durationMs", async () => {
    const makeNode = () => ({
      classList: {
        _set: new Set(),
        add(c) {
          this._set.add(c);
        },
        remove(c) {
          this._set.delete(c);
        },
      },
    });
    const nodes = [makeNode(), makeNode()];
    const syllables = [{ text: "Leh", stress: true }, { text: "rer" }];

    const done = new Promise((resolve) => {
      playKaraokeFlow("Lehrer", syllables, nodes, {
        speak: (_text, { onStart, onEnd }) => {
          onStart({ durationMs: 400 });
          setTimeout(() => onEnd(), 50);
        },
        onEnd: () => resolve(),
      });
    });

    await done;
    // After finish delay, active class is cleared.
    assert.equal(nodes.some((n) => n.classList._set.has("is-active")), false);
  });

  it("clearKaraokeTimers empties the bag", () => {
    const timers = [setTimeout(() => {}, 9999)];
    clearKaraokeTimers(timers);
    assert.equal(timers.length, 0);
  });
});
