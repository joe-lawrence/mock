/**
 * Deterministic German clock time and short durations.
 * Colloquial 12h style for halb / Viertel / nach / vor; digital uses 24h + Uhr.
 */

import { cardinalForm, constructionParts } from "./cardinal.js";

/**
 * @param {number} hours — 0–23
 * @param {number} minutes — 0–59
 */
function assertClock(hours, minutes) {
  if (!Number.isInteger(hours) || hours < 0 || hours > 23) {
    throw new RangeError(`hours out of range: ${hours}`);
  }
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 59) {
    throw new RangeError(`minutes out of range: ${minutes}`);
  }
}

/** 0–23 → 1–12 for colloquial clock face (0 and 12 → 12). */
export function toTwelveHour(hours24) {
  const h = hours24 % 12;
  return h === 0 ? 12 : h;
}

function hourParts(h12) {
  return constructionParts(h12);
}

function hourForm(h12) {
  return cardinalForm(h12);
}

/** Digital / 24h hour stem: 0 → null, 1 → ein, else construction. */
function digitalHourParts(hours) {
  if (hours === 0) return ["null"];
  if (hours === 1) return ["ein"];
  return constructionParts(hours);
}

/**
 * Colloquial clock reading (nach / vor / halb / Viertel).
 * @param {number} hours — 0–23 (converted to 12h face)
 * @param {number} minutes
 */
export function clockAnalysis(hours, minutes) {
  assertClock(hours, minutes);
  const h = toTwelveHour(hours);
  const next = toTwelveHour((hours + 1) % 24);
  const written = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  const englishWritten = written;

  if (minutes === 0) {
    const parts = [...hourParts(h), "Uhr"];
    return {
      hours,
      minutes,
      kind: "time-hour",
      form: parts.join(" "),
      written,
      englishWritten,
      segments: { construction: parts, spoken: parts },
      rules: ["time.hour"],
    };
  }

  if (minutes === 30) {
    const parts = ["halb", ...hourParts(next)];
    return {
      hours,
      minutes,
      kind: "time-half",
      form: parts.join(" "),
      written,
      englishWritten,
      segments: { construction: parts, spoken: parts },
      rules: ["time.halb"],
    };
  }

  if (minutes === 15) {
    const parts = ["Viertel", "nach", ...hourParts(h)];
    return {
      hours,
      minutes,
      kind: "time-quarter-past",
      form: parts.join(" "),
      written,
      englishWritten,
      segments: { construction: parts, spoken: parts },
      rules: ["time.viertel.nach"],
    };
  }

  if (minutes === 45) {
    const parts = ["Viertel", "vor", ...hourParts(next)];
    return {
      hours,
      minutes,
      kind: "time-quarter-to",
      form: parts.join(" "),
      written,
      englishWritten,
      segments: { construction: parts, spoken: parts },
      rules: ["time.viertel.vor"],
    };
  }

  if (minutes < 30) {
    const parts = [...constructionParts(minutes), "nach", ...hourParts(h)];
    const form = `${cardinalForm(minutes)} nach ${hourForm(h)}`;
    return {
      hours,
      minutes,
      kind: "time-past",
      form,
      written,
      englishWritten,
      segments: {
        construction: parts,
        spoken: [cardinalForm(minutes), "nach", hourForm(h)],
      },
      rules: ["time.nach"],
    };
  }

  const remain = 60 - minutes;
  const parts = [...constructionParts(remain), "vor", ...hourParts(next)];
  const form = `${cardinalForm(remain)} vor ${hourForm(next)}`;
  return {
    hours,
    minutes,
    kind: "time-to",
    form,
    written,
    englishWritten,
    segments: {
      construction: parts,
      spoken: [cardinalForm(remain), "vor", hourForm(next)],
    },
    rules: ["time.vor"],
  };
}

export function clockForm(hours, minutes) {
  return clockAnalysis(hours, minutes).form;
}

export function clockParts(hours, minutes) {
  return [...clockAnalysis(hours, minutes).segments.construction];
}

/**
 * Digital / 24h style: "vierzehn Uhr fünf"
 * Construction may split teens/compounds; form uses fused spoken hour/minutes.
 * @param {number} hours — 0–23
 * @param {number} minutes
 */
export function digitalTimeAnalysis(hours, minutes) {
  assertClock(hours, minutes);
  const written = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  const hourBits = digitalHourParts(hours);
  const hourSpoken =
    hours === 0 ? "null" : hours === 1 ? "ein" : cardinalForm(hours);

  if (minutes === 0) {
    const parts = [...hourBits, "Uhr"];
    const form = `${hourSpoken} Uhr`;
    return {
      hours,
      minutes,
      kind: "time-digital-hour",
      form,
      written,
      englishWritten: written,
      segments: { construction: parts, spoken: [hourSpoken, "Uhr"] },
      rules: ["time.digital.hour"],
    };
  }

  const minBits = constructionParts(minutes);
  const parts = [...hourBits, "Uhr", ...minBits];
  const form = `${hourSpoken} Uhr ${cardinalForm(minutes)}`;
  return {
    hours,
    minutes,
    kind: "time-digital",
    form,
    written,
    englishWritten: written,
    segments: {
      construction: parts,
      spoken: [hourSpoken, "Uhr", cardinalForm(minutes)],
    },
    rules: ["time.digital"],
  };
}

export function digitalTimeForm(hours, minutes) {
  return digitalTimeAnalysis(hours, minutes).form;
}

export function digitalTimeParts(hours, minutes) {
  return [...digitalTimeAnalysis(hours, minutes).segments.construction];
}

/**
 * Duration: minutes and/or hours.
 * Construction may split teens; form uses fused spoken cardinals.
 * @param {{ hours?: number, minutes?: number }} opts
 */
export function durationAnalysis({ hours = 0, minutes = 0 } = {}) {
  if (!Number.isInteger(hours) || hours < 0 || hours > 48) {
    throw new RangeError(`duration hours out of range: ${hours}`);
  }
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 59) {
    throw new RangeError(`duration minutes out of range: ${minutes}`);
  }
  if (hours === 0 && minutes === 0) {
    throw new RangeError("duration must be non-zero");
  }

  const parts = [];
  const spoken = [];
  if (hours > 0) {
    if (hours === 1) {
      parts.push("eine");
      spoken.push("eine");
    } else {
      parts.push(...constructionParts(hours));
      spoken.push(cardinalForm(hours));
    }
    parts.push(hours === 1 ? "Stunde" : "Stunden");
    spoken.push(hours === 1 ? "Stunde" : "Stunden");
  }
  if (minutes > 0) {
    if (minutes === 1) {
      parts.push("eine");
      spoken.push("eine");
    } else {
      parts.push(...constructionParts(minutes));
      spoken.push(cardinalForm(minutes));
    }
    parts.push(minutes === 1 ? "Minute" : "Minuten");
    spoken.push(minutes === 1 ? "Minute" : "Minuten");
  }

  const written =
    hours > 0 && minutes > 0
      ? `${hours}h ${minutes}min`
      : hours > 0
        ? `${hours}h`
        : `${minutes}min`;

  return {
    hours,
    minutes,
    kind: "time-duration",
    form: spoken.join(" "),
    written,
    englishWritten: written,
    segments: { construction: parts, spoken },
    rules: ["time.duration"],
  };
}

export function durationForm(opts) {
  return durationAnalysis(opts).form;
}

export function durationParts(opts) {
  return [...durationAnalysis(opts).segments.construction];
}
