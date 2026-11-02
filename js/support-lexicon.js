/**
 * Support-word questions for Numbers units.
 * Zahl, Nummer, Anzahl, Menge, and zählen are patterns. A whole number in
 * the pattern's range is drawn when the card is dealt. Other sentences are
 * fixed, with one natural match. Fraction words (Hälfte, doppelt, einmal,
 * zweimal) are the answer themselves.
 */

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

/** Build one card for a pattern and a number. The other choices are other numbers in range. */
export function realizeNumberPrompt(template, n) {
  const value = Number(n);
  const min = Number.isInteger(template?.min) ? template.min : 0;
  const max = Number.isInteger(template?.max) ? template.max : 9;
  const others = otherNumbers(value, min, max, 3);
  const pattern = template?.pattern;
  let english = "";
  let form = "";
  let choices = [];
  if (pattern === "zahl-phrase") {
    english = `the number ${value}`;
    form = `die Zahl ${value}`;
    choices = [form, ...others.map((digit) => `die Zahl ${digit}`)];
  } else if (pattern === "zahl-sentence") {
    english = `The number is ${value}.`;
    form = `Die Zahl ist ${value}.`;
    choices = [form, ...others.map((digit) => `Die Zahl ist ${digit}.`)];
  } else if (pattern === "nummer-phrase") {
    english = `ticket number ${value}`;
    form = `die Nummer ${value}`;
    choices = [form, ...others.map((digit) => `die Nummer ${digit}`)];
  } else if (pattern === "zahl-nummer") {
    english = `the number ${value}`;
    form = `die Zahl ${value}`;
    choices = [form, `die Nummer ${value}`];
  } else if (pattern === "anzahl-sentence") {
    english = `The count is ${value}.`;
    form = `Die Anzahl ist ${value}.`;
    choices = [form, ...others.map((digit) => `Die Anzahl ist ${digit}.`)];
  } else if (pattern === "menge-sentence") {
    english = `The amount is ${value}.`;
    form = `Die Menge ist ${value}.`;
    choices = [form, ...others.map((digit) => `Die Menge ist ${digit}.`)];
  } else if (pattern === "zaehlen-sentence") {
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
  // Patterns only. Guided fills in a digit that has not just been used.
  "number-words": [
    prompt({
      id: "zahl-phrase",
      pattern: "zahl-phrase",
      word: "Zahl",
      token: "Zahl",
      ask: "Choose the German phrase",
      sampleTake: 2,
      hint: "die Zahl is a number. Match the digit.",
    }),
    prompt({
      id: "zahl-sentence",
      pattern: "zahl-sentence",
      word: "Zahl",
      token: "Zahl",
      hint: "Die Zahl ist … means the number is that digit.",
    }),
  ],
  "number-senses": [
    prompt({
      id: "nummer-phrase",
      max: 99,
      pattern: "nummer-phrase",
      word: "Nummer",
      token: "Nummer",
      ask: "Choose the German phrase",
      hint: "Nummer identifies something, such as a ticket. Match the digit.",
    }),
    prompt({
      id: "zahl-nummer",
      max: 99,
      pattern: "zahl-nummer",
      word: "Zahl",
      token: "Zahl",
      ask: "Choose the German phrase",
      hint: "Zahl is a number you count or calculate with. Nummer identifies a ticket or phone.",
    }),
    prompt({
      id: "anzahl-sentence",
      max: 99,
      pattern: "anzahl-sentence",
      word: "Anzahl",
      token: "Anzahl",
      hint: "Anzahl is how many things there are.",
    }),
  ],
  "amount-words": [
    prompt({
      id: "menge-sentence",
      max: 99,
      pattern: "menge-sentence",
      word: "Menge",
      token: "Menge",
      hint: "Menge is an amount of something.",
    }),
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
      english: "half",
      form: "die Hälfte",
      expect: "half",
      choices: ["half", "quarter", "double", "once"],
      hint: "die Hälfte is the noun for a half.",
    }),
    word({
      id: "doppelt-de",
      word: "doppelt",
      prompt: "double",
      promptLang: "en",
      english: "double",
      form: "doppelt",
      expect: "doppelt",
      choices: ["doppelt", "zweimal", "die Hälfte", "einmal"],
      hint: "doppelt means double.",
    }),
    word({
      id: "doppelt-en",
      word: "doppelt",
      prompt: "doppelt",
      promptLang: "de",
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
      english: "once",
      form: "einmal",
      expect: "einmal",
      choices: ["einmal", "zweimal", "ein", "doppelt"],
      hint: "einmal means once, one time.",
    }),
    word({
      id: "einmal-en",
      word: "einmal",
      prompt: "einmal",
      promptLang: "de",
      english: "once",
      form: "einmal",
      expect: "once",
      choices: ["once", "twice", "double", "one"],
      hint: "einmal means once.",
    }),
    word({
      id: "zweimal-de",
      word: "zweimal",
      prompt: "twice",
      promptLang: "en",
      english: "twice",
      form: "zweimal",
      expect: "zweimal",
      choices: ["zweimal", "einmal", "zwei", "doppelt"],
      hint: "zweimal means twice.",
    }),
    word({
      id: "zweimal-en",
      word: "zweimal",
      prompt: "zweimal",
      promptLang: "de",
      english: "twice",
      form: "zweimal",
      expect: "twice",
      choices: ["twice", "once", "two", "double"],
      hint: "zweimal means twice.",
    }),
  ],
};
