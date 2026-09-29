/**
 * Deterministic German calendar names and short dates.
 */

import { cardinalForm, constructionParts } from "./cardinal.js";
import {
  ordinalAmAnalysis,
  ordinalAmForm,
  ordinalDativeForm,
  ordinalWritten,
} from "./ordinal.js";

export const WEEKDAYS = Object.freeze([
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
]);

export const MONTHS = Object.freeze([
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
]);

/**
 * @param {number} index — 0=Montag … 6=Sonntag
 */
export function weekdayAnalysis(index) {
  if (!Number.isInteger(index) || index < 0 || index > 6) {
    throw new RangeError(`weekday index out of range 0–6: ${index}`);
  }
  const form = WEEKDAYS[index];
  return {
    index,
    kind: "weekday",
    form,
    written: form,
    englishWritten: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ][index],
    segments: { construction: [form], spoken: [form] },
    rules: [`weekday.${index}`],
  };
}

export function weekdayForm(index) {
  return weekdayAnalysis(index).form;
}

/**
 * @param {number} month — 1–12
 */
export function monthAnalysis(month) {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError(`month out of range 1–12: ${month}`);
  }
  const form = MONTHS[month - 1];
  return {
    month,
    kind: "month",
    form,
    written: String(month).padStart(2, "0"),
    englishWritten: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ][month - 1],
    segments: { construction: [form], spoken: [form] },
    rules: [`month.${month}`],
  };
}

export function monthForm(month) {
  return monthAnalysis(month).form;
}

/** Days in month (non-leap Feb = 28 for pool simplicity). */
export function daysInMonth(month) {
  return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

/**
 * Year spoken forms for 2000–2035 (zweitausend…).
 * @param {number} year
 */
export function yearAnalysis(year) {
  if (!Number.isInteger(year) || year < 2000 || year > 2035) {
    throw new RangeError(`year out of range 2000–2035: ${year}`);
  }
  if (year === 2000) {
    const parts = ["zwei", "tausend"];
    return {
      year,
      kind: "year",
      form: "zweitausend",
      written: String(year),
      englishWritten: String(year),
      segments: { construction: parts, spoken: ["zweitausend"] },
      rules: ["year.2000"],
    };
  }
  const rem = year - 2000;
  const remParts = constructionParts(rem);
  const parts = ["zwei", "tausend", ...remParts];
  const form = `zweitausend${cardinalForm(rem)}`;
  return {
    year,
    kind: "year",
    form,
    written: String(year),
    englishWritten: String(year),
    segments: { construction: parts, spoken: [form] },
    rules: ["year.zweitausend", `year.rem.${rem}`],
  };
}

export function yearForm(year) {
  return yearAnalysis(year).form;
}

/**
 * Full calendar date: am + ordinal day + month (+ optional year).
 * @param {{ day: number, month: number, year?: number }} opts
 */
export function calendarDateAnalysis({ day, month, year } = {}) {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError(`month out of range: ${month}`);
  }
  const maxDay = daysInMonth(month);
  if (!Number.isInteger(day) || day < 1 || day > maxDay) {
    throw new RangeError(`day out of range for month ${month}: ${day}`);
  }

  const am = ordinalAmAnalysis(day);
  const mon = monthAnalysis(month);
  const parts = [...am.segments.construction, mon.form];
  const spoken = [...am.segments.spoken, mon.form];
  let written = `${day}.${month}.`;
  const rules = [...am.rules, ...mon.rules];

  if (year != null) {
    const y = yearAnalysis(year);
    parts.push(...y.segments.construction);
    spoken.push(y.form);
    written = `${day}.${month}.${year}`;
    rules.push(...y.rules);
  }

  return {
    day,
    month,
    year: year ?? null,
    kind: year != null ? "calendar-date-year" : "calendar-date",
    form: spoken.join(" "),
    written,
    englishWritten: written,
    segments: { construction: parts, spoken },
    rules,
  };
}

export function calendarDateForm(opts) {
  return calendarDateAnalysis(opts).form;
}

export function calendarDateParts(opts) {
  return [...calendarDateAnalysis(opts).segments.construction];
}

/** Re-export day-of-month helper used by Dates · ordinal-days step. */
export { ordinalAmAnalysis, ordinalAmForm, ordinalWritten, ordinalDativeForm };
