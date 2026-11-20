import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getReference } from "./generated/reference.js";
import { renderTuneCardHtml } from "./reference-tune.js";

describe("Reference Tune", () => {
  it("compiles Blue Danube tune onto case.prep.dat", () => {
    const u = getReference("case.prep.dat");
    assert.ok(u?.tune);
    assert.equal(u.tune.bpm, 144);
    assert.equal(u.tune.instrument, "marimba");
    assert.equal(u.tune.keys.length, 8);
    assert.equal(u.tune.keys[0].word, "aus");
    assert.deepEqual(u.tune.keys[1].notes, ["D4", "F#4"]);
    assert.equal(u.tune.keys[1].beats.length, 2);
    assert.ok(Array.isArray(u.tune.keys[1].syllableOffsetsSec));
    assert.equal(u.tune.keys[1].syllableOffsetsSec.length, 2);
    assert.ok(u.tune.keys[4].lineBreakBefore);
    // außer starts at beat 1 → first syllable offset = 60/144
    assert.ok(Math.abs(u.tune.keys[1].syllableOffsetsSec[0] - 60 / 144) < 1e-9);
  });

  it("renders Learn tune card with karaoke captions (no pitch chrome)", () => {
    const tune = getReference("case.prep.dat").tune;
    const html = renderTuneCardHtml(tune);
    assert.match(html, /data-ref-tune/);
    assert.match(html, /data-ref-tune-play/);
    assert.match(html, /data-ref-tune-key="0"/);
    assert.match(html, /lang="de">aus</);
    assert.match(html, /ref-tune-break/);
    assert.match(html, /ref-tune-caption/);
    assert.match(html, /has-caption/);
    assert.match(html, />ows</);
    assert.match(html, /data-ref-tune-syl="0">OW</);
    assert.match(html, /data-ref-tune-syl="1">sser</);
    assert.equal(html.includes("ref-tune-subtitle"), false);
    assert.equal(html.includes("ref-tune-badge"), false);
    assert.equal(html.includes("ref-tune-label"), false);
    assert.equal(html.includes("D4"), false);
  });

  it("omits tune card HTML when tune is null", () => {
    assert.equal(renderTuneCardHtml(null), "");
    assert.equal(renderTuneCardHtml({ keys: [] }), "");
  });
});
