/**
 * Support-word questions for Numbers units.
 *
 * Zahl / Nummer / Anzahl are sense cards: English phrase or usage cue ↔ the
 * German word (and the reverse). A whole number is drawn into phrase slots
 * when the card is dealt. zählen keeps a simple number frame. Other
 * sentences are fixed, with one natural match. Fraction words (Hälfte,
 * doppelt, einmal, zweimal) are the answer themselves.
 */

export const NUMBER_SENSE = Object.freeze({
  Zahl: Object.freeze({
    article: "die",
    usage: "Abstract values, math, pure numbers",
    caption: "Zahl is used for abstract digits/values",
    phrases: Object.freeze([
      "The number is {n}.",
      "Choose a number.",
      "The number is negative.",
      "The result is a number.",
    ]),
  }),
  Nummer: Object.freeze({
    article: "die",
    usage: "IDs, labels, sequences",
    caption: "Nummer is used for IDs/labels/sequences",
    phrases: Object.freeze([
      "What is your number?",
      "I am in room number {n}.",
      "You are number one.",
      "Check the ticket number.",
    ]),
  }),
  Anzahl: Object.freeze({
    article: "die",
    usage: "Total counts, quantities of things",
    caption: "Anzahl is the exact count of things",
    phrases: Object.freeze([
      "The total number is {n}.",
      "The number of guests is small.",
      "What is the exact number?",
      "The number changes daily.",
    ]),
  }),
});

export const NUMBER_SENSE_WORDS = Object.freeze(Object.keys(NUMBER_SENSE));

const SENSE_DISTRACTORS = Object.freeze(["Preis", "Zeit", "Geld", "Uhr", "Maß"]);

function prompt(item) {
  return {
    kind: "number-prompt",
    promptLang: "en",
    min: 0,
    max: 9,
    sampleTake: 1,
    ...item,
  };
}

function sense(item) {
  const word = item.word;
  const task = item.task || "phrase";
  return {
    kind: "number-sense",
    promptLang: "en",
    min: 1,
    max: 20,
    sampleTake: 1,
    ...item,
    task,
    word,
    pattern: item.pattern || `${task}:${word}`,
  };
}

function otherNumbers(n, min, max, count) {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const width = hi - lo;
  if (width < 1) return [];
  const step = Math.max(1, Math.round(width / (count + 1)));
  const out = [];
  for (let i = 1; out.length < count && i <= width + count; i++) {
    const value = lo + ((n - lo + i * step) % (width + 1));
    if (value !== n && !out.includes(value)) out.push(value);
  }
  return out;
}

function fillPhrase(template, n) {
  return String(template || "").replace(/\{n\}/g, String(n));
}

function pickOne(list, random = Math.random) {
  if (!list?.length) return null;
  const roll = Number(random());
  const index = Math.min(
    list.length - 1,
    Math.floor((Number.isFinite(roll) ? roll : 0) * list.length)
  );
  return list[Math.max(0, index)];
}

function phraseChoices(word, filled, n, random = Math.random) {
  const choices = [filled];
  for (const other of NUMBER_SENSE_WORDS) {
    if (other === word) continue;
    const bank = NUMBER_SENSE[other].phrases;
    const raw = pickOne(bank, random);
    if (raw) {
      const next = fillPhrase(raw, n);
      if (!choices.includes(next)) choices.push(next);
    }
  }
  const pool = NUMBER_SENSE_WORDS.flatMap((key) =>
    NUMBER_SENSE[key].phrases.map((raw) => fillPhrase(raw, n))
  );
  for (const next of pool) {
    if (choices.length >= 4) break;
    if (!choices.includes(next)) choices.push(next);
  }
  return choices;
}

function wordChoices(word, random = Math.random) {
  const distractor = pickOne(
    SENSE_DISTRACTORS.filter((item) => item !== word),
    random
  );
  return [...NUMBER_SENSE_WORDS, distractor].filter(Boolean);
}

function usageChoices(word) {
  return NUMBER_SENSE_WORDS.map((key) => NUMBER_SENSE[key].usage);
}

/**
 * Build one Zahl/Nummer/Anzahl sense card.
 * Forward: phrase or usage → German word.
 * Reverse: German word → phrase or usage.
 */
export function realizeNumberSense(template, opts = {}) {
  const word = template?.word || "Zahl";
  const entry = NUMBER_SENSE[word];
  if (!entry) return null;
  const task = template?.task === "usage" ? "usage" : "phrase";
  const direction = opts.direction === "reverse" ? "reverse" : "forward";
  const min = Number.isInteger(template?.min) ? template.min : 1;
  const max = Number.isInteger(template?.max) ? template.max : 20;
  const n = Number.isInteger(opts.n) ? opts.n : min;
  const random = opts.random || Math.random;
  const labeled = `${entry.article} ${word}`;

  const caption = entry.caption || `${labeled} — ${entry.usage}.`;

  if (task === "usage") {
    if (direction === "reverse") {
      return {
        kind: "example-sentence",
        promptLang: "de",
        id: `usage:${word}:${direction}`,
        pattern: template.pattern || `usage:${word}`,
        task,
        word,
        token: word,
        direction,
        ask: "Which use matches this word?",
        hint: caption,
        english: caption,
        form: labeled,
        prompt: labeled,
        expect: entry.usage,
        choices: usageChoices(word),
        revealDe: labeled,
      };
    }
    return {
      kind: "example-sentence",
      promptLang: "en",
      id: `usage:${word}:${direction}`,
      pattern: template.pattern || `usage:${word}`,
      task,
      word,
      token: word,
      direction,
      ask: "Which German word matches this use?",
      hint: caption,
      english: caption,
      form: word,
      prompt: entry.usage,
      expect: word,
      choices: wordChoices(word, random),
      revealDe: labeled,
    };
  }

  const raw = pickOne(entry.phrases, random);
  const phrase = fillPhrase(raw, n);
  if (direction === "reverse") {
    return {
      kind: "example-sentence",
      promptLang: "de",
      id: `phrase:${word}:${n}:${direction}`,
      pattern: template.pattern || `phrase:${word}`,
      task,
      word,
      token: word,
      value: n,
      direction,
      ask: "Which English phrase uses this word?",
      hint: caption,
      english: caption,
      form: labeled,
      prompt: labeled,
      expect: phrase,
      choices: phraseChoices(word, phrase, n, random),
      revealDe: labeled,
    };
  }
  return {
    kind: "example-sentence",
    promptLang: "en",
    id: `phrase:${word}:${n}:${direction}`,
    pattern: template.pattern || `phrase:${word}`,
    task,
    word,
    token: word,
    value: n,
    direction,
    ask: "Which German word fits this phrase?",
    hint: caption,
    english: caption,
    form: word,
    prompt: phrase,
    expect: word,
    choices: wordChoices(word, random),
    revealDe: labeled,
  };
}

/** Build one card for a zählen frame (and any leftover digit patterns). */
export function realizeNumberPrompt(template, n) {
  const value = Number(n);
  const min = Number.isInteger(template?.min) ? template.min : 0;
  const max = Number.isInteger(template?.max) ? template.max : 9;
  const others = otherNumbers(value, min, max, 3);
  const pattern = template?.pattern;
  let english = "";
  let form = "";
  let choices = [];
  if (pattern === "zaehlen-sentence") {
    english = `I count to ${value}.`;
    form = `Ich zähle bis ${value}.`;
    choices = [form, ...others.map((digit) => `Ich zähle bis ${digit}.`)];
  }
  return {
    kind: "example-sentence",
    promptLang: "en",
    id: `${pattern}:${value}`,
    pattern,
    value,
    word: template?.word,
    token: template?.token,
    ask: template?.ask,
    hint: template?.hint || "",
    english,
    form,
    choices,
    prompt: english,
    expect: form,
    revealDe: form,
  };
}

function sentence(item) {
  return {
    kind: "example-sentence",
    promptLang: "en",
    ...item,
    prompt: item.english,
    expect: item.form,
    revealDe: item.form,
  };
}

function word(item) {
  return {
    kind: "lex-word",
    ...item,
    revealDe: item.revealDe || item.form,
  };
}

/** @type {Record<string, object[]>} */
export const SUPPORT_LEXICON_POOLS = {
  // Zahl alone first: phrase ↔ word and usage ↔ word.
  "number-words": [
    sense({
      id: "zahl-phrase",
      task: "phrase",
      word: "Zahl",
      sampleTake: 2,
    }),
    sense({
      id: "zahl-usage",
      task: "usage",
      word: "Zahl",
    }),
  ],
  // Then Nummer and Anzahl, still phrase/usage ↔ word.
  "number-senses": [
    sense({
      id: "nummer-phrase",
      task: "phrase",
      word: "Nummer",
      max: 99,
      sampleTake: 2,
    }),
    sense({
      id: "nummer-usage",
      task: "usage",
      word: "Nummer",
    }),
    sense({
      id: "anzahl-phrase",
      task: "phrase",
      word: "Anzahl",
      max: 99,
      sampleTake: 2,
    }),
    sense({
      id: "anzahl-usage",
      task: "usage",
      word: "Anzahl",
    }),
  ],
  "amount-words": [
    prompt({
      id: "zaehlen-sentence",
      max: 99,
      pattern: "zaehlen-sentence",
      word: "zählen",
      token: "zähle",
      hint: "zählen means to count. The form here is zähle.",
    }),
  ],
  "time-words": [
    sentence({
      id: "zeit-habe",
      word: "Zeit",
      token: "Zeit",
      form: "Ich habe Zeit.",
      english: "I have time.",
      choices: [
        "Ich habe Zeit.",
        "Ich habe eine Stunde.",
        "Es ist drei Uhr.",
        "Wie spät ist es?",
      ],
      hint: "Zeit is time you have available. Eine Stunde is one hour long. Uhr is the clock reading.",
    }),
    sentence({
      id: "zeit-hast",
      word: "Zeit",
      token: "Zeit",
      form: "Hast du Zeit?",
      english: "Do you have time?",
      choices: [
        "Hast du Zeit?",
        "Hast du eine Stunde?",
        "Wie spät ist es?",
        "Es ist drei Uhr.",
      ],
      hint: "Zeit is time you have available. Eine Stunde is one hour long.",
    }),
  ],
  "money-context": [
    sentence({
      id: "preis",
      word: "Preis",
      token: "Preis",
      form: "Der Preis ist drei Euro.",
      english: "The price is three euros.",
      choices: [
        "Der Preis ist drei Euro.",
        "Ich habe drei Euro.",
        "Hier sind drei Euro.",
        "Ich zahle drei Euro.",
      ],
      hint: "Preis is the price of something. Having or paying three euros is a different fact.",
    }),
    sentence({
      id: "kosten",
      word: "kosten",
      token: "kostet",
      form: "Das kostet fünf Euro.",
      english: "That costs five euros.",
      choices: [
        "Das kostet fünf Euro.",
        "Ich habe fünf Euro.",
        "Hier sind fünf Euro.",
        "Ich zahle fünf Euro.",
      ],
      hint: "kosten means to cost. The form here is kostet. Paying or having the money is a different fact.",
    }),
    sentence({
      id: "geld",
      word: "Geld",
      token: "Geld",
      form: "Ich habe Geld.",
      english: "I have money.",
      choices: [
        "Ich habe Geld.",
        "Das kostet Geld.",
        "Wo ist das Geld?",
        "Der Preis ist drei Euro.",
      ],
      hint: "Geld is money. The other lines use Geld or a price, with a different meaning.",
    }),
    sentence({
      id: "billig",
      word: "billig",
      token: "billig",
      form: "Das ist billig.",
      english: "That is cheap.",
      choices: [
        "Das ist billig.",
        "Das ist teuer.",
        "Das kostet fünf Euro.",
        "Ich habe Geld.",
      ],
      hint: "billig means cheap. teuer means expensive. A price in euros does not say which.",
    }),
    sentence({
      id: "teuer",
      word: "teuer",
      token: "teuer",
      form: "Das ist teuer.",
      english: "That is expensive.",
      choices: [
        "Das ist teuer.",
        "Das ist billig.",
        "Das kostet fünf Euro.",
        "Der Preis ist drei Euro.",
      ],
      hint: "teuer means expensive. billig means cheap. A price in euros does not say which.",
    }),
  ],
  "date-context": [
    sentence({
      id: "datum-wie",
      word: "Datum",
      token: "Datum",
      form: "Wie ist das Datum?",
      english: "What is the date?",
      choices: [
        "Wie ist das Datum?",
        "Wie spät ist es?",
        "Welcher Monat ist es?",
        "Welches Jahr ist es?",
      ],
      hint: "Datum is the calendar date. The other questions ask for the time, the month, or the year.",
    }),
    sentence({
      id: "datum-mai",
      word: "Datum",
      token: "Datum",
      form: "Das Datum ist der erste Mai.",
      english: "The date is the first of May.",
      choices: [
        "Das Datum ist der erste Mai.",
        "Wie ist das Datum?",
        "Es ist Mai.",
        "Heute ist Montag.",
      ],
      hint: "Datum is the calendar date. May alone, or a weekday, is not the first of May.",
    }),
  ],
  "measure-context": [
    sentence({
      id: "mass-meter",
      word: "Maß",
      token: "Maß",
      form: "Der Meter ist ein Maß.",
      english: "The meter is a unit of measure.",
      choices: [
        "Der Meter ist ein Maß.",
        "Das Maß ist ein Meter.",
        "Ich habe einen Meter.",
        "Wie lang ist das?",
      ],
      hint: "Maß here is a unit of measure. Saying the measurement is one meter is a different fact.",
    }),
    sentence({
      id: "mass-welches",
      word: "Maß",
      token: "Maß",
      form: "Welches Maß ist das?",
      english: "Which measure is that?",
      choices: [
        "Welches Maß ist das?",
        "Wie lang ist das?",
        "Welches Datum ist das?",
        "Welches Jahr ist das?",
      ],
      hint: "Maß is the measure. The other questions ask the length, the date, or the year.",
    }),
  ],
  "fraction-words": [
    word({
      id: "haelfte-de",
      word: "Hälfte",
      prompt: "a half (noun)",
      promptLang: "en",
      ask: "Choose the German noun",
      english: "a half (noun)",
      form: "die Hälfte",
      expect: "die Hälfte",
      choices: ["die Hälfte", "halb", "das Viertel", "doppelt"],
      hint: "die Hälfte is the noun, as in half of something. halb is the fraction and the clock word.",
    }),
    word({
      id: "haelfte-en",
      word: "Hälfte",
      prompt: "die Hälfte",
      promptLang: "de",
      ask: "Choose the English meaning",
      english: "a half (noun)",
      form: "die Hälfte",
      expect: "a half (noun)",
      choices: ["a half (noun)", "half (clock)", "a quarter", "double"],
      hint: "die Hälfte is the noun half.",
    }),
    word({
      id: "doppelt-de",
      word: "doppelt",
      prompt: "double",
      promptLang: "en",
      ask: "Choose the German form",
      english: "double",
      form: "doppelt",
      expect: "doppelt",
      choices: ["doppelt", "zweimal", "halb", "einmal"],
      hint: "doppelt means double. zweimal means twice.",
    }),
    word({
      id: "doppelt-en",
      word: "doppelt",
      prompt: "doppelt",
      promptLang: "de",
      ask: "Choose the English meaning",
      english: "double",
      form: "doppelt",
      expect: "double",
      choices: ["double", "twice", "half", "once"],
      hint: "doppelt means double.",
    }),
    word({
      id: "einmal-de",
      word: "einmal",
      prompt: "once",
      promptLang: "en",
      ask: "Choose the German form",
      english: "once",
      form: "einmal",
      expect: "einmal",
      choices: ["einmal", "zweimal", "doppelt", "halb"],
      hint: "einmal means once. zweimal means twice.",
    }),
    word({
      id: "einmal-en",
      word: "einmal",
      prompt: "einmal",
      promptLang: "de",
      ask: "Choose the English meaning",
      english: "once",
      form: "einmal",
      expect: "once",
      choices: ["once", "twice", "double", "half"],
      hint: "einmal means once.",
    }),
    word({
      id: "zweimal-de",
      word: "zweimal",
      prompt: "twice",
      promptLang: "en",
      ask: "Choose the German form",
      english: "twice",
      form: "zweimal",
      expect: "zweimal",
      choices: ["zweimal", "einmal", "doppelt", "halb"],
      hint: "zweimal means twice.",
    }),
    word({
      id: "zweimal-en",
      word: "zweimal",
      prompt: "zweimal",
      promptLang: "de",
      ask: "Choose the English meaning",
      english: "twice",
      form: "zweimal",
      expect: "twice",
      choices: ["twice", "once", "double", "half"],
      hint: "zweimal means twice.",
    }),
  ],
};
