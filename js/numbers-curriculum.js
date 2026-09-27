/**
 * Numbers territory curriculum registry — Topic × Step × Mode.
 * Money lives under Decimals as later steps (not a peer topic).
 * Playable flags gate the mock menu; engines/pools fill cells over time.
 */

/** @typedef {"build"|"listen"|"convert"} NumbersQuizModeId */

/**
 * @typedef {object} NumbersStep
 * @property {string} id
 * @property {string} label
 * @property {boolean} playable
 * @property {string} [pool] — key into mock numberPools / listen filters
 * @property {NumbersQuizModeId[]} [modes] — if set, only these modes apply
 * @property {string} [blurb]
 * @property {string} [softAfter] — prior step id for soft “usually after …” cue (not a lock)
 * @property {string} [chartTab] — Numbers chart tab id for Learn
 * @property {string[]} [plannedModes] — mode ids to show as coming-soon chips
 */

/**
 * @typedef {object} NumbersTopic
 * @property {string} id
 * @property {string} label
 * @property {boolean} playable
 * @property {string} [blurb]
 * @property {NumbersStep[]} steps
 */

/** @type {NumbersTopic[]} */
export const NUMBERS_TOPICS = [
  {
    id: "cardinals",
    label: "Cardinals",
    playable: true,
    blurb: "0–99, then hundreds and tausend as deterministic German forms.",
    steps: [
      {
        id: "base",
        label: "0–12",
        playable: true,
        pool: "base",
        blurb: "Foundational blocks; 11 and 12 are unique.",
        chartTab: "base",
      },
      {
        id: "teens",
        label: "Teens",
        playable: true,
        pool: "teens",
        blurb: "13–19 as base + zehn.",
        softAfter: "base",
        chartTab: "teens",
      },
      {
        id: "tens",
        label: "Tens",
        playable: true,
        pool: "tens",
        blurb: "20–90 as stem + zig/ßig.",
        softAfter: "teens",
        chartTab: "tens",
      },
      {
        id: "compounds",
        label: "Compounds",
        playable: true,
        pool: "compounds",
        blurb: "21–99 ones + und + tens.",
        softAfter: "tens",
        chartTab: "compounds",
      },
      {
        id: "hundreds",
        label: "Hundreds+",
        playable: true,
        pool: "hundreds",
        blurb: "Full 100–1000 — hundert / tausend, then the 0–99 tail.",
        softAfter: "compounds",
        chartTab: "hundreds",
      },
    ],
  },
  {
    id: "decimals",
    label: "Decimals",
    playable: true,
    blurb: "Komma / place value, then money (€) as follow-on steps.",
    steps: [
      {
        id: "komma-read",
        label: "Komma reading",
        playable: true,
        pool: "komma-read",
        modes: ["listen", "convert"],
        blurb: "Hear/read forms like 3,14 — Komma, not Punkt.",
        chartTab: "komma",
      },
      {
        id: "place-value",
        label: "Place value",
        playable: true,
        pool: "place-value",
        modes: ["build", "listen"],
        blurb: "Build spoken decimals: whole + Komma + digits.",
        softAfter: "komma-read",
        chartTab: "komma",
      },
      {
        id: "write-komma",
        label: "Write with Komma",
        playable: true,
        pool: "write-komma",
        modes: ["convert", "build"],
        blurb: "Produce written decimals (Komma) from English or speech cues.",
        softAfter: "place-value",
        chartTab: "komma",
      },
      {
        id: "money-euros",
        label: "Euro amounts",
        playable: true,
        pool: "money-euros",
        modes: ["build", "listen", "convert"],
        blurb: "Whole euros: … Euro.",
        softAfter: "write-komma",
        chartTab: "money",
      },
      {
        id: "money-cents",
        label: "Euro + Cent",
        playable: true,
        pool: "money-cents",
        modes: ["build", "listen", "convert"],
        blurb: "… Euro … — cents as a cardinal after Euro.",
        softAfter: "money-euros",
        chartTab: "money",
      },
      {
        id: "money-context",
        label: "Money in phrases",
        playable: false,
        blurb: "Prices in short shopping/context lines.",
        softAfter: "money-cents",
        plannedModes: ["listen", "read"],
      },
    ],
  },
  {
    id: "fractions",
    label: "Fractions",
    playable: false,
    blurb: "halb, viertel, and productive fraction patterns.",
    steps: [
      {
        id: "half-quarter",
        label: "halb & viertel",
        playable: false,
        blurb: "High-frequency halves and quarters (lexical + pattern).",
        plannedModes: ["listen", "build"],
      },
      {
        id: "unit-fractions",
        label: "Unit fractions",
        playable: false,
        blurb: "Drittel, Fünftel, … — stem + -tel.",
        softAfter: "half-quarter",
        plannedModes: ["build", "listen"],
      },
      {
        id: "proper-fractions",
        label: "Proper fractions",
        playable: false,
        blurb: "zwei Drittel, drei Viertel — number + fraction noun.",
        softAfter: "unit-fractions",
        plannedModes: ["build", "convert"],
      },
      {
        id: "mixed-numbers",
        label: "Mixed numbers",
        playable: false,
        blurb: "Whole + fraction (e.g. eineinhalb) — common spoken forms.",
        softAfter: "proper-fractions",
        plannedModes: ["listen", "build"],
      },
      {
        id: "fraction-context",
        label: "Fractions in use",
        playable: false,
        blurb: "Recipes, shares, short contextual phrases.",
        softAfter: "mixed-numbers",
        plannedModes: ["listen", "read"],
      },
    ],
  },
  {
    id: "time",
    label: "Time",
    playable: false,
    blurb: "Clock (Uhr) and durations.",
    steps: [
      {
        id: "whole-hours",
        label: "Whole hours",
        playable: false,
        blurb: "… Uhr — es ist drei Uhr.",
        plannedModes: ["build", "listen"],
      },
      {
        id: "half-past",
        label: "halb",
        playable: false,
        blurb: "halb vier = 3:30 — the German half-hour flip.",
        softAfter: "whole-hours",
        plannedModes: ["listen", "convert", "build"],
      },
      {
        id: "quarters",
        label: "Viertel",
        playable: false,
        blurb: "Viertel nach / Viertel vor — regional variants noted in hints.",
        softAfter: "half-past",
        plannedModes: ["listen", "build"],
      },
      {
        id: "minutes",
        label: "Minutes",
        playable: false,
        blurb: "… nach / … vor with minute counts.",
        softAfter: "quarters",
        plannedModes: ["build", "convert", "listen"],
      },
      {
        id: "digital-24h",
        label: "24-hour / digital",
        playable: false,
        blurb: "Reading 14:05-style times in German.",
        softAfter: "minutes",
        plannedModes: ["convert", "listen"],
      },
      {
        id: "duration",
        label: "Durations",
        playable: false,
        blurb: "Minuten, Stunden, Tage — how long something takes.",
        softAfter: "minutes",
        plannedModes: ["build", "listen"],
      },
    ],
  },
  {
    id: "dates",
    label: "Dates",
    playable: false,
    blurb: "Calendar reading and writing (separate from clock time).",
    steps: [
      {
        id: "weekdays",
        label: "Weekdays",
        playable: false,
        blurb: "Montag … Sonntag — names and order.",
        plannedModes: ["listen", "build"],
      },
      {
        id: "months",
        label: "Months",
        playable: false,
        blurb: "Januar … Dezember.",
        softAfter: "weekdays",
        plannedModes: ["listen", "build"],
      },
      {
        id: "ordinal-days",
        label: "Days of the month",
        playable: false,
        blurb: "am 3. / der dritte — ordinal date forms.",
        softAfter: "months",
        plannedModes: ["build", "convert", "listen"],
      },
      {
        id: "full-dates",
        label: "Full dates",
        playable: false,
        blurb: "Spoken and written calendar dates (Tag.Monat.Jahr).",
        softAfter: "ordinal-days",
        plannedModes: ["convert", "listen", "build"],
      },
      {
        id: "date-context",
        label: "Dates in phrases",
        playable: false,
        blurb: "Appointments, birthdays, short contextual lines.",
        softAfter: "full-dates",
        plannedModes: ["listen", "read"],
      },
    ],
  },
  {
    id: "measurement",
    label: "Measurement",
    playable: false,
    blurb: "Common units and number agreement habits.",
    steps: [
      {
        id: "length",
        label: "Length",
        playable: false,
        blurb: "Meter, Zentimeter, Kilometer with numbers.",
        plannedModes: ["build", "listen", "convert"],
      },
      {
        id: "weight",
        label: "Weight",
        playable: false,
        blurb: "Gramm, Kilo(gramm) — shopping amounts.",
        softAfter: "length",
        plannedModes: ["build", "listen", "convert"],
      },
      {
        id: "volume",
        label: "Volume",
        playable: false,
        blurb: "Liter, Milliliter — drinks and recipes.",
        softAfter: "weight",
        plannedModes: ["build", "listen"],
      },
      {
        id: "temp-speed",
        label: "Temp & speed",
        playable: false,
        blurb: "Grad, Stundenkilometer — weather and travel.",
        softAfter: "volume",
        plannedModes: ["listen", "convert"],
      },
      {
        id: "measure-context",
        label: "Measures in phrases",
        playable: false,
        blurb: "Short real-world amount lines.",
        softAfter: "temp-speed",
        plannedModes: ["listen", "read"],
      },
    ],
  },
  {
    id: "ordinals",
    label: "Ordinals",
    playable: false,
    blurb: "der erste / am 3. …",
    steps: [
      {
        id: "ordinal-1-12",
        label: "1.–12.",
        playable: false,
        blurb: "erste … zwölfte — core ordinal stems.",
        plannedModes: ["build", "listen"],
      },
      {
        id: "ordinal-teens",
        label: "13.–19.",
        playable: false,
        blurb: "Ordinal teens (dreizehnte …).",
        softAfter: "ordinal-1-12",
        plannedModes: ["build", "listen"],
      },
      {
        id: "ordinal-tens",
        label: "20.–90.",
        playable: false,
        blurb: "zwanzigste, dreißigste …",
        softAfter: "ordinal-teens",
        plannedModes: ["build", "listen"],
      },
      {
        id: "ordinal-compounds",
        label: "Compound ordinals",
        playable: false,
        blurb: "einundzwanzigste — ones + und + tens + -te/-ste.",
        softAfter: "ordinal-tens",
        plannedModes: ["build", "convert"],
      },
      {
        id: "ordinal-dates-use",
        label: "Ordinals in dates",
        playable: false,
        blurb: "am …ten — bridging toward Dates.",
        softAfter: "ordinal-compounds",
        plannedModes: ["listen", "read", "convert"],
      },
    ],
  },
];

/** Labels for modes that appear as preview chips before those modes ship. */
export const PLANNED_MODE_LABELS = {
  build: "Build",
  listen: "Listen",
  convert: "Convert",
  read: "Read",
  discriminate: "Discriminate",
};

export function plannedModeChips(step) {
  const ids = step?.plannedModes || ["build", "listen"];
  return ids.map((id) => ({
    id,
    label: PLANNED_MODE_LABELS[id] || id,
  }));
}

/** @type {{ id: NumbersQuizModeId, label: string, playable: boolean, blurb?: string }[]} */
export const NUMBERS_MODES = [
  {
    id: "build",
    label: "Build",
    playable: true,
    blurb: "Construct the German form from pieces.",
  },
  {
    id: "listen",
    label: "Listen",
    playable: true,
    blurb: "Hear TTS, identify the value — recognition.",
  },
  {
    id: "convert",
    label: "Convert",
    playable: true,
    blurb: "See the digit, type the German form — production.",
  },
];

export function getNumbersTopic(topicId) {
  return NUMBERS_TOPICS.find((t) => t.id === topicId) || null;
}

export function getNumbersStep(topicId, stepId) {
  const topic = getNumbersTopic(topicId);
  return topic?.steps.find((s) => s.id === stepId) || null;
}

export function getNumbersMode(modeId) {
  return NUMBERS_MODES.find((m) => m.id === modeId) || null;
}

/** Modes allowed for a topic+step cell. */
export function modesForStep(topicId, stepId) {
  const step = getNumbersStep(topicId, stepId);
  if (!step?.playable) return [];
  const allowed = step.modes || NUMBERS_MODES.map((m) => m.id);
  return NUMBERS_MODES.filter((m) => m.playable && allowed.includes(m.id));
}

export function isNumbersCellPlayable(topicId, stepId, modeId) {
  const topic = getNumbersTopic(topicId);
  const step = getNumbersStep(topicId, stepId);
  const mode = getNumbersMode(modeId);
  if (!topic?.playable || !step?.playable || !mode?.playable) return false;
  return modesForStep(topicId, stepId).some((m) => m.id === modeId);
}

/**
 * Simple Dealer suggestion for the mock (no mastery engine yet).
 * Prefer: same topic → next weak-ish step, or Listen after Build on current step.
 */
export function suggestNumbersFocus(current = {}) {
  const {
    topicId = "cardinals",
    stepId = "compounds",
    modeId = "build",
    difficulty = "assisted",
  } = current;

  if (topicId === "cardinals" && modeId === "build" && difficulty === "assisted") {
    return {
      topicId: "cardinals",
      stepId,
      modeId: "build",
      difficulty: "core",
      reason: "Same step without Assisted choices",
    };
  }

  if (topicId === "cardinals" && modeId === "build") {
    const listenOk = isNumbersCellPlayable("cardinals", stepId, "listen");
    if (listenOk) {
      return {
        topicId: "cardinals",
        stepId,
        modeId: "listen",
        difficulty: "assisted",
        reason: "Recognize what you just built",
      };
    }
  }

  if (topicId === "cardinals" && modeId === "listen") {
    const convertOk = isNumbersCellPlayable("cardinals", stepId, "convert");
    if (convertOk) {
      return {
        topicId: "cardinals",
        stepId,
        modeId: "convert",
        difficulty: "assisted",
        reason: "Type the German form from the digit",
      };
    }
  }

  if (topicId === "cardinals" && modeId === "convert" && stepId === "compounds") {
    return {
      topicId: "cardinals",
      stepId: "hundreds",
      modeId: "build",
      difficulty: "assisted",
      reason: "Step up to hundert / tausend",
    };
  }

  if (topicId === "cardinals" && modeId === "listen" && stepId === "compounds") {
    return {
      topicId: "cardinals",
      stepId: "hundreds",
      modeId: "build",
      difficulty: "assisted",
      reason: "Step up to hundert / tausend",
    };
  }

  if (topicId === "cardinals" && modeId === "convert" && stepId === "hundreds") {
    return {
      topicId: "decimals",
      stepId: "komma-read",
      modeId: "listen",
      difficulty: "assisted",
      reason: "Next topic: Decimals — Komma, not Punkt",
    };
  }

  if (topicId === "decimals" && modeId === "listen" && difficulty === "assisted") {
    return {
      topicId: "decimals",
      stepId,
      modeId: "listen",
      difficulty: "core",
      reason: "Same step without Assisted choices",
    };
  }

  if (topicId === "decimals" && modeId === "listen") {
    const convertOk = isNumbersCellPlayable("decimals", stepId, "convert");
    if (convertOk) {
      return {
        topicId: "decimals",
        stepId,
        modeId: "convert",
        difficulty: "assisted",
        reason: "Type the German reading from the written form",
      };
    }
    const buildOk = isNumbersCellPlayable("decimals", stepId, "build");
    if (buildOk) {
      return {
        topicId: "decimals",
        stepId,
        modeId: "build",
        difficulty: "assisted",
        reason: "Build the spoken form from chips",
      };
    }
  }

  if (topicId === "decimals") {
    const ladder = [
      "komma-read",
      "place-value",
      "write-komma",
      "money-euros",
      "money-cents",
    ];
    const idx = ladder.indexOf(stepId);
    if (idx >= 0 && idx < ladder.length - 1) {
      const next = ladder[idx + 1];
      const modes = modesForStep("decimals", next);
      return {
        topicId: "decimals",
        stepId: next,
        modeId: modes[0]?.id || "listen",
        difficulty: "assisted",
        reason: `Next Decimals step: ${getNumbersStep("decimals", next)?.label}`,
      };
    }
  }

  const ladder = ["base", "teens", "tens", "compounds", "hundreds"];
  const idx = ladder.indexOf(stepId);
  if (idx >= 0 && idx < ladder.length - 1) {
    const next = ladder[idx + 1];
    return {
      topicId: "cardinals",
      stepId: next,
      modeId: "build",
      difficulty: "assisted",
      reason: `Next Cardinals step: ${getNumbersStep("cardinals", next)?.label}`,
    };
  }

  if (topicId === "cardinals" && stepId === "hundreds") {
    return {
      topicId: "decimals",
      stepId: "komma-read",
      modeId: "listen",
      difficulty: "assisted",
      reason: "Next topic: Decimals — Komma, not Punkt",
    };
  }

  return {
    topicId: "cardinals",
    stepId: "teens",
    modeId: "build",
    difficulty: "assisted",
    reason: "Warm-up on teens",
  };
}

/** Playable steps eligible for Mix checkboxes. */
export function mixableSteps(topicId = "cardinals", modeId = "build") {
  const topic = getNumbersTopic(topicId);
  if (!topic?.playable) return [];
  return topic.steps.filter((s) => {
    if (!s.playable) return false;
    const modes = modesForStep(topicId, s.id);
    return modes.some((m) => m.id === modeId || modeId === "either");
  });
}

export function formatNumbersFocusLabel({ topicId, stepId, modeId, difficulty }) {
  const topic = getNumbersTopic(topicId)?.label || topicId;
  const step = getNumbersStep(topicId, stepId)?.label || stepId;
  const mode = getNumbersMode(modeId)?.label || modeId;
  const diff =
    difficulty === "core" ? "Core" : difficulty === "overdrive" ? "Overdrive" : "Assisted";
  return `${topic} · ${step} · ${mode} · ${diff}`;
}
