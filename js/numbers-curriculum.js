/**
 * Numbers territory curriculum registry — Topic × Unit (step) × Quiz modality.
 *
 * Spec (§7): the unit owns Learn/reference + content pool. Modalities (build /
 * listen / convert) are reusable interactions — soft intro order, then mix —
 * not sibling curriculum cards with their own Learn trees.
 * Money lives under Decimals as later steps (not a peer topic).
 * Playable flags gate the mock menu; engines/pools fill cells over time.
 */

/** @typedef {"build"|"listen"|"convert"} NumbersQuizModeId */

/** @typedef {"introduce"|"focus"|"mix"} SessionPolicy */

/**
 * @typedef {object} NumbersStep
 * @property {string} id — unit id within the topic
 * @property {string} label
 * @property {boolean} playable
 * @property {string} [pool] — key into mock numberPools / listen filters
 * @property {NumbersQuizModeId[]} [modes] — modality allowlist; array order = soft intro order (omit = all modes)
 * @property {string} [blurb]
 * @property {string} [softAfter] — prior unit id for soft “usually after …” cue (not a lock)
 * @property {string} [chartTab] — Learn: Numbers chart tab id (unit property, not per-modality)
 * @property {string[]} [plannedModes] — modality ids to show as coming-soon chips
 */

/**
 * @typedef {object} NumbersTopic
 * @property {string} id
 * @property {string} label
 * @property {boolean} playable
 * @property {string} [blurb]
 * @property {NumbersStep[]} steps — curriculum units
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
        modes: ["build", "listen", "convert", "cloze", "proofread"],
        blurb: "Foundational blocks; 11 and 12 are unique.",
        chartTab: "base",
      },
      {
        id: "teens",
        label: "Teens",
        playable: true,
        pool: "teens",
        modes: ["build", "listen", "convert", "cloze", "proofread"],
        blurb: "13–19 as base + zehn.",
        softAfter: "base",
        chartTab: "teens",
      },
      {
        id: "tens",
        label: "Tens",
        playable: true,
        pool: "tens",
        modes: ["build", "listen", "convert", "cloze", "proofread"],
        blurb: "20–90 as stem + zig/ßig.",
        softAfter: "teens",
        chartTab: "tens",
      },
      {
        id: "compounds",
        label: "Compounds",
        playable: true,
        pool: "compounds",
        modes: ["build", "listen", "convert", "cloze", "proofread"],
        blurb: "21–99 ones + und + tens.",
        softAfter: "tens",
        chartTab: "compounds",
      },
      {
        id: "hundreds",
        label: "Hundreds+",
        playable: true,
        pool: "hundreds",
        modes: ["build", "listen", "convert", "cloze", "proofread"],
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
        modes: ["listen", "convert", "proofread"],
        blurb: "Hear/read forms like 3,14 — Komma, not Punkt.",
        chartTab: "komma",
      },
      {
        id: "place-value",
        label: "Place value",
        playable: true,
        pool: "place-value",
        modes: ["build", "listen", "cloze", "proofread"],
        blurb: "Build spoken decimals: whole + Komma + digits.",
        softAfter: "komma-read",
        chartTab: "komma",
      },
      {
        id: "write-komma",
        label: "Write with Komma",
        playable: true,
        pool: "write-komma",
        modes: ["convert", "build", "proofread"],
        blurb: "Produce written decimals (Komma) from English or speech cues.",
        softAfter: "place-value",
        chartTab: "komma",
      },
      {
        id: "money-euros",
        label: "Euro amounts",
        playable: true,
        pool: "money-euros",
        modes: ["build", "listen", "convert", "proofread"],
        blurb: "Whole euros: … Euro.",
        softAfter: "write-komma",
        chartTab: "money",
      },
      {
        id: "money-cents",
        label: "Euro + Cent",
        playable: true,
        pool: "money-cents",
        modes: ["build", "listen", "convert", "proofread"],
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
    playable: true,
    blurb: "halb, Viertel, and productive fraction patterns.",
    steps: [
      {
        id: "half-quarter",
        label: "halb & Viertel",
        playable: true,
        pool: "half-quarter",
        modes: ["listen", "build", "convert", "visual", "proofread"],
        blurb: "High-frequency halves and quarters (lexical + pattern).",
        chartTab: "fractions",
      },
      {
        id: "unit-fractions",
        label: "Unit fractions",
        playable: true,
        pool: "unit-fractions",
        modes: ["build", "listen", "convert", "visual", "proofread"],
        blurb: "Drittel, Fünftel, … — stem + -tel.",
        softAfter: "half-quarter",
        chartTab: "fractions",
      },
      {
        id: "proper-fractions",
        label: "Proper fractions",
        playable: true,
        pool: "proper-fractions",
        modes: ["build", "convert", "listen", "visual", "proofread"],
        blurb: "zwei Drittel, drei Viertel — number + fraction noun.",
        softAfter: "unit-fractions",
        chartTab: "fractions",
      },
      {
        id: "mixed-numbers",
        label: "Mixed numbers",
        playable: true,
        pool: "mixed-numbers",
        modes: ["listen", "build", "convert", "proofread"],
        blurb: "Whole + fraction (e.g. eineinhalb) — common spoken forms.",
        softAfter: "proper-fractions",
        chartTab: "fractions",
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
    playable: true,
    blurb: "Clock (Uhr) and durations.",
    steps: [
      {
        id: "whole-hours",
        label: "Whole hours",
        playable: true,
        pool: "whole-hours",
        modes: ["build", "listen", "convert", "visual", "proofread"],
        blurb: "… Uhr — es ist drei Uhr.",
        chartTab: "time",
      },
      {
        id: "half-past",
        label: "halb",
        playable: true,
        pool: "half-past",
        modes: ["listen", "convert", "build", "visual"],
        blurb: "halb vier = 3:30 — the German half-hour flip.",
        softAfter: "whole-hours",
        chartTab: "time",
      },
      {
        id: "quarters",
        label: "Viertel",
        playable: true,
        pool: "quarters",
        modes: ["listen", "build", "convert", "visual"],
        blurb: "Viertel nach / Viertel vor — regional variants noted in hints.",
        softAfter: "half-past",
        chartTab: "time",
      },
      {
        id: "minutes",
        label: "Minutes",
        playable: true,
        pool: "minutes",
        modes: ["build", "convert", "listen", "visual"],
        blurb: "… nach / … vor with minute counts.",
        softAfter: "quarters",
        chartTab: "time",
      },
      {
        id: "digital-24h",
        label: "24-hour / digital",
        playable: true,
        pool: "digital-24h",
        modes: ["convert", "listen", "build", "proofread"],
        blurb: "Reading 14:05-style times in German.",
        softAfter: "minutes",
        chartTab: "time",
      },
      {
        id: "duration",
        label: "Durations",
        playable: true,
        pool: "duration",
        modes: ["build", "listen", "convert", "proofread"],
        blurb: "Minuten, Stunden — how long something takes.",
        softAfter: "minutes",
        chartTab: "time",
      },
    ],
  },
  {
    id: "dates",
    label: "Dates",
    playable: true,
    blurb: "Calendar reading and writing (separate from clock time).",
    steps: [
      {
        id: "weekdays",
        label: "Weekdays",
        playable: true,
        pool: "weekdays",
        modes: ["listen", "build", "convert", "proofread"],
        blurb: "Montag … Sonntag — names and order.",
        chartTab: "dates",
      },
      {
        id: "months",
        label: "Months",
        playable: true,
        pool: "months",
        modes: ["listen", "build", "convert", "proofread"],
        blurb: "Januar … Dezember.",
        softAfter: "weekdays",
        chartTab: "dates",
      },
      {
        id: "ordinal-days",
        label: "Days of the month",
        playable: true,
        pool: "ordinal-days",
        modes: ["build", "convert", "listen", "proofread"],
        blurb: "am 3. / am dritten — ordinal date forms.",
        softAfter: "months",
        chartTab: "dates",
      },
      {
        id: "full-dates",
        label: "Full dates",
        playable: true,
        pool: "full-dates",
        modes: ["convert", "listen", "build", "proofread"],
        blurb: "Spoken and written calendar dates (Tag.Monat.Jahr).",
        softAfter: "ordinal-days",
        chartTab: "dates",
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
    playable: true,
    blurb: "Common units and number agreement habits.",
    steps: [
      {
        id: "length",
        label: "Length",
        playable: true,
        pool: "length",
        modes: ["build", "listen", "convert", "proofread"],
        blurb: "Meter, Zentimeter, Kilometer with numbers.",
        chartTab: "measure",
      },
      {
        id: "weight",
        label: "Weight",
        playable: true,
        pool: "weight",
        modes: ["build", "listen", "convert", "proofread"],
        blurb: "Gramm, Kilo(gramm) — shopping amounts.",
        softAfter: "length",
        chartTab: "measure",
      },
      {
        id: "volume",
        label: "Volume",
        playable: true,
        pool: "volume",
        modes: ["build", "listen", "convert", "proofread"],
        blurb: "Liter, Milliliter — drinks and recipes.",
        softAfter: "weight",
        chartTab: "measure",
      },
      {
        id: "temp-speed",
        label: "Temp & speed",
        playable: true,
        pool: "temp-speed",
        modes: ["listen", "convert", "build", "proofread"],
        blurb: "Grad, Stundenkilometer — weather and travel.",
        softAfter: "volume",
        chartTab: "measure",
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
    playable: true,
    blurb: "der erste / am 3. …",
    steps: [
      {
        id: "ordinal-1-12",
        label: "1.–12.",
        playable: true,
        pool: "ordinal-1-12",
        modes: ["build", "listen", "convert", "sentence", "proofread", "cloze"],
        blurb: "erste … zwölfte — core ordinal stems.",
        chartTab: "ordinals",
      },
      {
        id: "ordinal-teens",
        label: "13.–19.",
        playable: true,
        pool: "ordinal-teens",
        modes: ["build", "listen", "convert", "sentence", "proofread", "cloze"],
        blurb: "Ordinal teens (dreizehnte …).",
        softAfter: "ordinal-1-12",
        chartTab: "ordinals",
      },
      {
        id: "ordinal-tens",
        label: "20.–90.",
        playable: true,
        pool: "ordinal-tens",
        modes: ["build", "listen", "convert", "sentence", "proofread", "cloze"],
        blurb: "zwanzigste, dreißigste …",
        softAfter: "ordinal-teens",
        chartTab: "ordinals",
      },
      {
        id: "ordinal-compounds",
        label: "Compound ordinals",
        playable: true,
        pool: "ordinal-compounds",
        modes: ["build", "convert", "listen", "sentence", "proofread", "cloze"],
        blurb: "einundzwanzigste — ones + und + tens + -te/-ste.",
        softAfter: "ordinal-tens",
        chartTab: "ordinals",
      },
      {
        id: "ordinal-dates-use",
        label: "Ordinals in dates",
        playable: true,
        pool: "ordinal-dates-use",
        modes: ["listen", "convert", "build", "proofread"],
        blurb: "am …ten — bridging toward Dates.",
        softAfter: "ordinal-compounds",
        chartTab: "ordinals",
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
  {
    id: "cloze",
    label: "Cloze",
    playable: true,
    blurb: "Fill the missing morph piece (und / zehn / zig…).",
  },
  {
    id: "proofread",
    label: "Proofread",
    playable: true,
    blurb: "Spot and fix a wrong spelling.",
  },
  {
    id: "visual",
    label: "Visual",
    playable: true,
    blurb: "Read a pie chart or clock face.",
  },
  {
    id: "sentence",
    label: "Sentence",
    playable: true,
    blurb: "Read an ordinal inside a short sentence.",
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

/** Modalities allowed for a topic+unit cell (allowlist; order = soft intro). */
export function modesForStep(topicId, stepId) {
  const step = getNumbersStep(topicId, stepId);
  if (!step?.playable) return [];
  const allowed = step.modes || NUMBERS_MODES.map((m) => m.id);
  const byId = new Map(NUMBERS_MODES.map((m) => [m.id, m]));
  return allowed
    .map((id) => byId.get(id))
    .filter((m) => m && m.playable);
}

/** Alias — quiz modalities for a unit (spec §7). */
export function quizzesForStep(topicId, stepId) {
  return modesForStep(topicId, stepId);
}

/** Soft “try first” modality for introduce policy. */
export function introModeForStep(topicId, stepId) {
  return modesForStep(topicId, stepId)[0] || null;
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
 * Scaffolding bump → rotate modality on same unit (mix) → next unit (introduce).
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
      policy: "focus",
      reason: "Same unit, less scaffolding (focus)",
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
        policy: "mix",
        reason: "Mix modalities — recognize what you just built",
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
        policy: "mix",
        reason: "Mix modalities — type the German form from the digit",
      };
    }
  }

  if (topicId === "cardinals" && modeId === "convert" && stepId === "compounds") {
    const intro = introModeForStep("cardinals", "hundreds");
    return {
      topicId: "cardinals",
      stepId: "hundreds",
      modeId: intro?.id || "build",
      difficulty: "assisted",
      policy: "introduce",
      reason: "Introduce next unit: Hundreds+",
    };
  }

  if (topicId === "cardinals" && modeId === "listen" && stepId === "compounds") {
    const intro = introModeForStep("cardinals", "hundreds");
    return {
      topicId: "cardinals",
      stepId: "hundreds",
      modeId: intro?.id || "build",
      difficulty: "assisted",
      policy: "introduce",
      reason: "Introduce next unit: Hundreds+",
    };
  }

  if (topicId === "cardinals" && modeId === "convert" && stepId === "hundreds") {
    const intro = introModeForStep("decimals", "komma-read");
    return {
      topicId: "decimals",
      stepId: "komma-read",
      modeId: intro?.id || "listen",
      difficulty: "assisted",
      policy: "introduce",
      reason: "Introduce Decimals — Komma, not Punkt",
    };
  }

  if (topicId === "decimals" && modeId === "listen" && difficulty === "assisted") {
    return {
      topicId: "decimals",
      stepId,
      modeId: "listen",
      difficulty: "core",
      policy: "focus",
      reason: "Same unit, less scaffolding (focus)",
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
        policy: "mix",
        reason: "Mix modalities — type the German reading from the written form",
      };
    }
    const buildOk = isNumbersCellPlayable("decimals", stepId, "build");
    if (buildOk) {
      return {
        topicId: "decimals",
        stepId,
        modeId: "build",
        difficulty: "assisted",
        policy: "mix",
        reason: "Mix modalities — build the spoken form from chips",
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
      const intro = introModeForStep("decimals", next);
      return {
        topicId: "decimals",
        stepId: next,
        modeId: intro?.id || "listen",
        difficulty: "assisted",
        policy: "introduce",
        reason: `Introduce next unit: ${getNumbersStep("decimals", next)?.label}`,
      };
    }
    const intro = introModeForStep("fractions", "half-quarter");
    return {
      topicId: "fractions",
      stepId: "half-quarter",
      modeId: intro?.id || "listen",
      difficulty: "assisted",
      policy: "introduce",
      reason: "Introduce Fractions — halb & Viertel",
    };
  }

  if (topicId === "fractions") {
    const ladder = [
      "half-quarter",
      "unit-fractions",
      "proper-fractions",
      "mixed-numbers",
    ];
    const idx = ladder.indexOf(stepId);
    if (idx >= 0 && idx < ladder.length - 1) {
      const next = ladder[idx + 1];
      const intro = introModeForStep("fractions", next);
      return {
        topicId: "fractions",
        stepId: next,
        modeId: intro?.id || "build",
        difficulty: "assisted",
        policy: "introduce",
        reason: `Introduce next unit: ${getNumbersStep("fractions", next)?.label}`,
      };
    }
    const intro = introModeForStep("time", "whole-hours");
    return {
      topicId: "time",
      stepId: "whole-hours",
      modeId: intro?.id || "build",
      difficulty: "assisted",
      policy: "introduce",
      reason: "Introduce Time — whole hours",
    };
  }

  if (topicId === "time") {
    const ladder = [
      "whole-hours",
      "half-past",
      "quarters",
      "minutes",
      "digital-24h",
      "duration",
    ];
    const idx = ladder.indexOf(stepId);
    if (idx >= 0 && idx < ladder.length - 1) {
      const next = ladder[idx + 1];
      const intro = introModeForStep("time", next);
      return {
        topicId: "time",
        stepId: next,
        modeId: intro?.id || "listen",
        difficulty: "assisted",
        policy: "introduce",
        reason: `Introduce next unit: ${getNumbersStep("time", next)?.label}`,
      };
    }
    const intro = introModeForStep("dates", "weekdays");
    return {
      topicId: "dates",
      stepId: "weekdays",
      modeId: intro?.id || "listen",
      difficulty: "assisted",
      policy: "introduce",
      reason: "Introduce Dates — weekdays",
    };
  }

  if (topicId === "dates") {
    const ladder = ["weekdays", "months", "ordinal-days", "full-dates"];
    const idx = ladder.indexOf(stepId);
    if (idx >= 0 && idx < ladder.length - 1) {
      const next = ladder[idx + 1];
      const intro = introModeForStep("dates", next);
      return {
        topicId: "dates",
        stepId: next,
        modeId: intro?.id || "listen",
        difficulty: "assisted",
        policy: "introduce",
        reason: `Introduce next unit: ${getNumbersStep("dates", next)?.label}`,
      };
    }
    const intro = introModeForStep("measurement", "length");
    return {
      topicId: "measurement",
      stepId: "length",
      modeId: intro?.id || "build",
      difficulty: "assisted",
      policy: "introduce",
      reason: "Introduce Measurement — length",
    };
  }

  if (topicId === "measurement") {
    const ladder = ["length", "weight", "volume", "temp-speed"];
    const idx = ladder.indexOf(stepId);
    if (idx >= 0 && idx < ladder.length - 1) {
      const next = ladder[idx + 1];
      const intro = introModeForStep("measurement", next);
      return {
        topicId: "measurement",
        stepId: next,
        modeId: intro?.id || "build",
        difficulty: "assisted",
        policy: "introduce",
        reason: `Introduce next unit: ${getNumbersStep("measurement", next)?.label}`,
      };
    }
    const intro = introModeForStep("ordinals", "ordinal-1-12");
    return {
      topicId: "ordinals",
      stepId: "ordinal-1-12",
      modeId: intro?.id || "build",
      difficulty: "assisted",
      policy: "introduce",
      reason: "Introduce Ordinals — 1.–12.",
    };
  }

  if (topicId === "ordinals") {
    const ladder = [
      "ordinal-1-12",
      "ordinal-teens",
      "ordinal-tens",
      "ordinal-compounds",
      "ordinal-dates-use",
    ];
    const idx = ladder.indexOf(stepId);
    if (idx >= 0 && idx < ladder.length - 1) {
      const next = ladder[idx + 1];
      const intro = introModeForStep("ordinals", next);
      return {
        topicId: "ordinals",
        stepId: next,
        modeId: intro?.id || "build",
        difficulty: "assisted",
        policy: "introduce",
        reason: `Introduce next unit: ${getNumbersStep("ordinals", next)?.label}`,
      };
    }
  }

  const ladder = ["base", "teens", "tens", "compounds", "hundreds"];
  const idx = ladder.indexOf(stepId);
  if (idx >= 0 && idx < ladder.length - 1) {
    const next = ladder[idx + 1];
    const intro = introModeForStep("cardinals", next);
    return {
      topicId: "cardinals",
      stepId: next,
      modeId: intro?.id || "build",
      difficulty: "assisted",
      policy: "introduce",
      reason: `Introduce next unit: ${getNumbersStep("cardinals", next)?.label}`,
    };
  }

  if (topicId === "cardinals" && stepId === "hundreds") {
    const intro = introModeForStep("decimals", "komma-read");
    return {
      topicId: "decimals",
      stepId: "komma-read",
      modeId: intro?.id || "listen",
      difficulty: "assisted",
      policy: "introduce",
      reason: "Introduce Decimals — Komma, not Punkt",
    };
  }

  const intro = introModeForStep("cardinals", "teens");
  return {
    topicId: "cardinals",
    stepId: "teens",
    modeId: intro?.id || "build",
    difficulty: "assisted",
    policy: "introduce",
    reason: "Introduce teens",
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
