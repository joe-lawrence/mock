import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  compassPlaceholder,
  freeformPlaceholder,
} from "./answer-placeholders.js";

describe("freeform placeholders", () => {
  it("uses a format sample and skips the item on screen", () => {
    assert.equal(
      freeformPlaceholder({ kind: "cardinal", value: 13, form: "dreizehn" }),
      "e.g. vierzehn"
    );
    assert.equal(
      freeformPlaceholder(
        { kind: "cardinal", value: 14, form: "vierzehn" },
        { reverse: true }
      ),
      "e.g. 13"
    );
    assert.equal(
      freeformPlaceholder(
        { kind: "cardinal", value: 13, form: "dreizehn", written: "13" },
        { reverse: true }
      ),
      "e.g. 16"
    );
  });

  it("splits whole euros from cents, and clock from digital", () => {
    assert.equal(
      freeformPlaceholder({ kind: "money", cents: 0, form: "drei Euro" }),
      "e.g. ein Euro"
    );
    assert.equal(
      freeformPlaceholder({ kind: "money", cents: 50, form: "ein Euro fünfzig" }),
      "e.g. zwei Euro fünfzig"
    );
    assert.equal(
      freeformPlaceholder(
        { kind: "money", cents: 0, written: "3,00 €" },
        { reverse: true }
      ),
      "e.g. 3 €"
    );
    assert.equal(
      freeformPlaceholder(
        { kind: "money", cents: 50, written: "3,50 €" },
        { reverse: true }
      ),
      "e.g. 12,50 €"
    );
    assert.equal(
      freeformPlaceholder({ kind: "clock", form: "zehn nach drei" }),
      "e.g. fünf vor halb zwei"
    );
    assert.equal(
      freeformPlaceholder(
        { kind: "clock", written: "03:30", form: "halb vier" },
        { reverse: true }
      ),
      "e.g. 9:15"
    );
    assert.equal(
      freeformPlaceholder(
        { kind: "clock", written: "21:15", form: "Viertel nach neun" },
        { reverse: true }
      ),
      "e.g. 14:05 (24h)"
    );
    assert.equal(
      freeformPlaceholder(
        { kind: "clock", written: "09:15", form: "Viertel nach neun" },
        { reverse: true }
      ),
      "e.g. 3:30"
    );
    assert.equal(
      freeformPlaceholder(
        { kind: "digital-time", written: "14:05" },
        { reverse: true }
      ),
      "e.g. 8:00"
    );
  });

  it("picks the measure unit’s own format", () => {
    assert.equal(
      freeformPlaceholder({ kind: "measure", unit: "Liter", form: "drei Liter" }),
      "e.g. ein Liter"
    );
    assert.equal(
      freeformPlaceholder(
        { kind: "measure", unit: "Stundenkilometer", written: "50 km/h" },
        { reverse: true }
      ),
      "e.g. 30 km/h"
    );
    assert.equal(
      freeformPlaceholder(
        { kind: "measure", unit: "Grad", written: "10 °C" },
        { reverse: true }
      ),
      "e.g. 21 °C"
    );
  });

  it("gives the compass a direction that is not the cue", () => {
    assert.equal(compassPlaceholder(false, ["Nordosten"]), "e.g. Norden");
    assert.equal(compassPlaceholder(true, ["Northeast"]), "e.g. North");
  });
});
