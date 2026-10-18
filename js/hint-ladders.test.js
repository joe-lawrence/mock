import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  HELP_LADDER_RUNGS,
  ladderForFormats,
  toggleableLayersForFormats,
  freshSupportVector,
  climbHelpRung,
  hintDepthFromVector,
  independenceWeight,
  supportSnapshot,
  helpRungDepth,
  applySupportPrefs,
  setSupportLayer,
  supportPresetName,
  SUPPORT_LAYER_DEFS,
} from "./hint-ladders.js";
import { STIMULUS, RESPONSE } from "./interaction-presets.js";
import { ATTEMPT_RECORD_FIELDS } from "./guidance-contracts.js";

describe("hint ladders (Slice 4)", () => {
  it("defines Help climb order", () => {
    assert.deepEqual(HELP_LADDER_RUNGS, [
      "hint",
      "vocab",
      "pattern",
      "full",
    ]);
    assert.equal(helpRungDepth("hint"), 1);
    assert.equal(helpRungDepth("full"), 4);
  });

  it("merges stimulus + response format ladders", () => {
    const ladder = ladderForFormats({
      stimulus: STIMULUS.DIGIT,
      response: RESPONSE.FREEFORM,
    });
    assert.ok(ladder.question.includes("hint"));
    assert.ok(ladder.answer.includes("liveCheck"));
    assert.ok(ladder.answer.includes("english"));
  });

  it("toggleable layers follow format (wugs choose → choice highlight only)", () => {
    const defs = toggleableLayersForFormats({
      stimulus: STIMULUS.VALUE,
      response: RESPONSE.MULTI_SELECT,
    });
    assert.deepEqual(
      defs.map((d) => d.id),
      ["choiceHighlight"]
    );
    assert.equal(SUPPORT_LAYER_DEFS.find((d) => d.id === "english")?.label, "English cue");
  });

  it("Assisted seeds more support than Core", () => {
    const a = freshSupportVector("assisted");
    const c = freshSupportVector("core");
    assert.equal(a.liveCheck, true);
    assert.equal(c.liveCheck, false);
    assert.equal(a.helpRung, 0);
    assert.equal(c.english, false);
  });

  it("climbHelpRung keeps max depth and records opens", () => {
    let v = freshSupportVector("core");
    v = climbHelpRung(v, "hint");
    v = climbHelpRung(v, "pattern");
    v = climbHelpRung(v, "hint");
    assert.equal(v.helpRung, 3);
    assert.deepEqual(v.helpRungsOpened, ["hint", "pattern"]);
    assert.ok(hintDepthFromVector(v) >= 3);
  });

  it("independenceWeight drops as hint depth rises", () => {
    assert.equal(independenceWeight(0), 1);
    assert.ok(independenceWeight(2) < independenceWeight(0));
    assert.ok(independenceWeight(99) >= 0.15);
  });

  it("supportSnapshot matches attempt contract fields", () => {
    let v = climbHelpRung(freshSupportVector("assisted"), "vocab");
    const snap = supportSnapshot(v, {
      stimulus: STIMULUS.DIGIT,
      response: RESPONSE.FREEFORM,
      presetId: "convert",
    });
    assert.ok(ATTEMPT_RECORD_FIELDS.includes("supportVector"));
    assert.ok(ATTEMPT_RECORD_FIELDS.includes("hintDepth"));
    assert.equal(snap.interactionPreset, "convert");
    assert.equal(snap.supportVector.helpRung, 2);
    assert.ok(snap.hintDepth >= 2);
  });

  it("layer prefs compose a custom vector (not Assisted/Core scalar)", () => {
    assert.ok(SUPPORT_LAYER_DEFS.some((d) => d.id === "english"));
    let v = freshSupportVector("assisted");
    assert.equal(supportPresetName(v), "assisted");
    v = setSupportLayer(v, "english", false);
    assert.equal(supportPresetName(v), "custom");
    v = applySupportPrefs(freshSupportVector("core"), {
      english: true,
      liveCheck: false,
      choiceHighlight: false,
    });
    assert.equal(v.english, true);
    assert.equal(v.liveCheck, false);
    assert.equal(supportPresetName(v), "custom");
  });
});
