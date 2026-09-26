/**
 * Schnapp Phase 1 design mock — hub + Numbers/Nouns/Sounds shells.
 * Numbers quiz answers come from the Phase 2 deterministic engine.
 */

import {
  createNounArticleExercise,
  createNounAssociationExercise,
  createNounWugExercise,
  createNounPluralExercise,
  createNumberConstructionExercise,
  submitExerciseAttempt,
} from "../engine/exercise/index.js";
import {
  associationLemmas,
  wugForms,
} from "../engine/nouns/index.js";

/** Bootstrap Icons (outline) — https://icons.getbootstrap.com */
const BI_PATHS = {
  chevronLeft:
    '<path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>',
  chevronRight:
    '<path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>',
  book: '<path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>',
  lightbulb:
    '<path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13a.5.5 0 0 1 0 1 .5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1 0-1 .5.5 0 0 1 0-1 .5.5 0 0 1-.46-.302l-.761-1.77a2 2 0 0 0-.453-.618A5.98 5.98 0 0 1 2 6m6-5a5 5 0 0 0-3.479 8.592c.263.254.514.564.676.941L5.83 12h4.342l.632-1.467c.162-.377.413-.687.676-.941A5 5 0 0 0 8 1"/>',
};

function biIcon(name) {
  const path = BI_PATHS[name];
  if (!path) return "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">${path}</svg>`;
}

function hydrateIconButtons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((btn) => {
    const name = btn.dataset.icon;
    if (!BI_PATHS[name]) return;
    btn.classList.add("btn-icon");
    btn.innerHTML = biIcon(name);
  });
}
const territories = [
  {
    id: "sounds",
    name: "Sounds",
    blurb: "Spelling ↔ sound, syllables, stress.",
    status: "playable",
    statusLabel: "Playable",
  },
  {
    id: "numbers",
    name: "Numbers",
    blurb: "Build deterministic number systems. Learn the app’s hands.",
    status: "playable",
    statusLabel: "Playable",
    suggested: true,
  },
  {
    id: "nouns",
    name: "Nouns",
    blurb: "Gender, articles, plurals — patterns vs lexical facts.",
    status: "playable",
    statusLabel: "Playable",
  },
  {
    id: "case",
    name: "Case",
    blurb: "Nominative → accusative → dative transformations.",
    status: "preview",
    statusLabel: "Coming soon",
  },
  {
    id: "phrases",
    name: "Phrases",
    blurb: "Adjective endings. Energy Transfer as metaphor only.",
    status: "preview",
    statusLabel: "Coming soon",
  },
  {
    id: "syntax",
    name: "Syntax",
    blurb: "V2 and preferred TMP ordering as a pattern.",
    status: "preview",
    statusLabel: "Coming soon",
  },
  {
    id: "fluency",
    name: "Fluency",
    blurb: "Produce with novel words. Wug tests.",
    status: "preview",
    statusLabel: "Coming soon",
  },
  {
    id: "reading",
    name: "Reading",
    blurb: "Context, chunks, tap-to-translate.",
    status: "preview",
    statusLabel: "Coming soon",
  },
];

const comingCopy = {
  case: "Visible masculine accusative first — then the quieter cells.",
  phrases: "Energy Transfer visualization without becoming the grammar model.",
  syntax: "Sentence pieces that snap into V2-legal orders.",
  fluency: "Generalization exercises once Nouns and Case are real.",
  reading: "Verified passages only — no silent generated curriculum.",
};

/** Full Sounds chart — curated spelling→sound clues (not exhaustive phonology). */
const soundsChart = {
  tabs: [
    {
      id: "vowels",
      label: "Vowels",
      blurb:
        "Short vs long pairs. Spelling often tips you off: double letter or h → longer; double consonant after → shorter.",
    },
    {
      id: "umlauts",
      label: "Umlauts",
      blurb:
        "Front rounded vowels English doesn’t have. Same length cues as plain vowels (h / double consonant).",
    },
    {
      id: "diphthongs",
      label: "Diphthongs",
      blurb: "Two letters, one glide. ei/ai and eu/äu are spelling twins — same sound either way.",
    },
    {
      id: "consonants",
      label: "Consonants",
      blurb:
        "English traps and German-only clusters. Examples split into syllables so you can see where the beat sits.",
    },
    {
      id: "special",
      label: "Special",
      blurb:
        "Environment rules and how to read stress. Native words usually stress the first stem syllable; CAPS + underline mark it.",
    },
  ],
  // spells = orthography variants · guide = sounds-like (silent)
  // parts = syllable chips; stress:true → CAPS guide + underline; tap example → karaoke
  vowels: [
    { spells: ["a"], guide: "ah", parts: [{ text: "Mann", guide: "mahn" }], note: "short, open — double n keeps it short" },
    { spells: ["aa", "ah"], guide: "aah", parts: [{ text: "Bahn", guide: "baahn" }], note: "longer a — aa or ah cue length" },
    { spells: ["e"], guide: "eh", parts: [{ text: "Bett", guide: "bett" }], note: "short e — double t keeps it short" },
    { spells: ["ee", "eh"], guide: "ay", parts: [{ text: "See", guide: "zay" }], note: "longer e — ee or eh" },
    { spells: ["i"], guide: "ih", parts: [{ text: "mit", guide: "mit" }], note: "short i" },
    { spells: ["ie", "ih"], guide: "ee", parts: [{ text: "sie", guide: "zee" }], note: "longer ee — ie is the usual long-i spelling" },
    { spells: ["o"], guide: "aw", parts: [{ text: "oft", guide: "awft" }], note: "short o" },
    { spells: ["oo", "oh"], guide: "oh", parts: [{ text: "Boot", guide: "boht" }], note: "longer o — oo or oh" },
    { spells: ["u"], guide: "oo", parts: [{ text: "und", guide: "oont" }], note: "short u" },
    { spells: ["uh"], guide: "oo", parts: [{ text: "Schuh", guide: "shoo" }], note: "longer u — uh marks length" },
  ],
  umlauts: [
    {
      spells: ["ä"],
      guide: "eh",
      parts: [{ text: "män", guide: "MEN", stress: true }, { text: "ner", guide: "ner" }],
      note: "like short e / airy eh — stress on first beat",
    },
    { spells: ["äh", "ä"], guide: "eh", parts: [{ text: "spät", guide: "shpeht" }], note: "longer ä — äh cues length" },
    {
      spells: ["ö"],
      guide: "oe",
      parts: [{ text: "öff", guide: "OEFF", stress: true }, { text: "nen", guide: "nen" }],
      note: "rounded; lips of o, tongue of e — not in English",
    },
    {
      spells: ["öh", "ö"],
      guide: "oe",
      parts: [{ text: "schön", guide: "shoen" }],
      note: "longer ö — contrast with schon (no umlaut)",
    },
    {
      spells: ["ü"],
      guide: "ue",
      parts: [{ text: "müs", guide: "MUES", stress: true }, { text: "sen", guide: "sen" }],
      note: "rounded; lips of u, tongue of i — not in English",
    },
    {
      spells: ["üh", "ü"],
      guide: "ue",
      parts: [{ text: "Tür", guide: "tueer" }],
      note: "longer ü — contrast with u (Tür ≠ Tour)",
    },
  ],
  diphthongs: [
    {
      spells: ["ei", "ai"],
      guide: "eye",
      parts: [{ text: "mein", guide: "mine" }],
      note: "same sound both spellings — don’t say “ay”",
    },
    { spells: ["au"], guide: "ow", parts: [{ text: "Haus", guide: "hows" }], note: "as in “house”" },
    {
      spells: ["eu", "äu"],
      guide: "oy",
      parts: [{ text: "neu", guide: "noy" }],
      note: "same sound both spellings — like “oy”",
    },
  ],
  consonants: [
    {
      spells: ["b", "d", "g"],
      guide: "b / d / g",
      parts: [{ text: "Bad", guide: "baht" }],
      note: "often softer (more like p/t/k) at word end",
    },
    {
      spells: ["ch"],
      guide: "ikh",
      parts: [{ text: "ich", guide: "ikh" }],
      note: "soft after front vowels — see Special for ach",
    },
    {
      spells: ["ck"],
      guide: "k",
      parts: [{ text: "Eck", guide: "ECK", stress: true }, { text: "e", guide: "e" }],
      note: "like k — double c keeps the vowel short",
    },
    {
      spells: ["f", "v"],
      guide: "f",
      parts: [{ text: "Va", guide: "FA", stress: true }, { text: "ter", guide: "ter" }],
      note: "v often = f (Vater ≠ “vay-ter”)",
    },
    { spells: ["w"], guide: "v", parts: [{ text: "was", guide: "vas" }], note: "like English v — not English w" },
    { spells: ["j"], guide: "y", parts: [{ text: "ja", guide: "ya" }], note: "like English y — not English j" },
    { spells: ["l"], guide: "l", parts: [{ text: "lang", guide: "lahng" }], note: "clear l (less “dark” than English)" },
    {
      spells: ["ng"],
      guide: "ng",
      parts: [{ text: "lang", guide: "lahng" }],
      note: "as in “sing” — no hard g after",
    },
    { spells: ["nk"], guide: "ngk", parts: [{ text: "Bank", guide: "bahngk" }], note: "ng + k" },
    {
      spells: ["pf"],
      guide: "pf",
      parts: [{ text: "Ap", guide: "AP", stress: true }, { text: "fel", guide: "fel" }],
      note: "both sounds — stress on first syllable",
    },
    { spells: ["qu"], guide: "kv", parts: [{ text: "Quark", guide: "kvark" }], note: "k + v — not English “kw”" },
    {
      spells: ["s"],
      guide: "z",
      parts: [{ text: "Son", guide: "ZON", stress: true }, { text: "ne", guide: "ne" }],
      note: "often like z at the start before a vowel",
    },
    { spells: ["ss", "ß"], guide: "s", parts: [{ text: "Fuß", guide: "foos" }], note: "voiceless s (never z)" },
    {
      spells: ["sch"],
      guide: "sh",
      parts: [{ text: "Schu", guide: "SHOO", stress: true }, { text: "le", guide: "le" }],
      note: "like English sh — one sound, three letters",
    },
    {
      spells: ["sp"],
      guide: "shp",
      parts: [{ text: "Spiel", guide: "shpeel" }],
      note: "word-initial — s sounds like sh",
    },
    {
      spells: ["st"],
      guide: "sht",
      parts: [{ text: "Stein", guide: "shtine" }],
      note: "word-initial — s sounds like sh",
    },
    { spells: ["z"], guide: "ts", parts: [{ text: "Zeit", guide: "tsite" }], note: "like “ts” in “cats” — never English z" },
    {
      spells: ["tz"],
      guide: "ts",
      parts: [{ text: "Kat", guide: "KAT", stress: true }, { text: "ze", guide: "tse" }],
      note: "same ts sound — t marks short vowel before",
    },
  ],
  special: [
    {
      spells: ["ich"],
      guide: "ikh",
      parts: [{ text: "ich", guide: "ikh" }],
      note: "soft ch after front vowels (i, e, ä, ö, ü, ei…)",
    },
    {
      spells: ["ach"],
      guide: "akh",
      parts: [{ text: "Buch", guide: "bookh" }],
      note: "back ch after a, o, u, au",
    },
    {
      spells: ["r"],
      guide: "r",
      parts: [{ text: "rot", guide: "roht" }],
      note: "varies by speaker; often soft / vocalic at ends",
    },
    {
      spells: ["h"],
      guide: "—",
      parts: [{ text: "ge", guide: "GE", stress: true }, { text: "hen", guide: "hen" }],
      note: "between vowels often silent — marks length on the vowel before",
    },
    {
      spells: ["tt", "pp", "ck"],
      guide: "short vowel",
      parts: [{ text: "Mut", guide: "MUT", stress: true }, { text: "ter", guide: "ter" }],
      note: "double consonant → vowel before is short (Mut-ter, not “moot”)",
    },
    {
      spells: ["stress"],
      guide: "CAPS",
      parts: [{ text: "Zei", guide: "TSAI", stress: true }, { text: "tung", guide: "toong" }],
      note: "CAPS + underline = primary stress. Default: first stem syllable (Zeitung). Loanwords may stress later (see practice).",
    },
  ],
};

/** Territory briefings = Introduce / Demonstrate before practice (spec learning loop). */
const briefings = {
  sounds: {
    title: "German sound foundation",
    lede: "Learn to hear and decode common German spelling→sound patterns before you lean on vocabulary drills.",
    blocks: [
      {
        heading: "What you’ll practice",
        html: `<ul>
          <li><strong>Syllables</strong> — spelling on top, respelling under; CAPS = stress</li>
          <li><strong>Discriminate</strong> — hear a contrast, pick the match (ü/u, schön/schon)</li>
        </ul>`,
      },
      {
        heading: "How to read a syllable card",
        html: `<p>Orthography above, English-friendly respelling below. Stress is marked with CAPS and a underline — not with IPA.</p>`,
        example: true,
      },
      {
        heading: "Full chart",
        html: `<p>Vowels, umlauts, diphthongs, consonants, and special cases are in the sound chart — open it whenever you need the map.</p>`,
      },
      {
        heading: "What this is not",
        html: `<ul>
          <li>Browser TTS is a helper, not the linguistic authority</li>
          <li>No microphone grading — listening and decoding first</li>
          <li>Respelling is approximate; regional voices vary</li>
        </ul>`,
      },
    ],
  },
  numbers: {
    title: "Numbers are algorithmic German",
    lede: "Build forms you can derive. Open the number chart for base words, teens, tens, and the ones+und+tens compound rule — tap any form to hear it.",
    blocks: [
      {
        heading: "Vocabulary",
        html: `<ul class="gender-key">
          <li><span class="g-tag g-fem">die</span> <strong>Zahl</strong>, -en — number</li>
          <li><span class="g-tag g-fem">die</span> <strong>Ziffer</strong>, -n — digit</li>
          <li><strong>null</strong> — zero <span class="brief-note">(no article)</span></li>
        </ul>`,
      },
      {
        heading: "What you’ll use in practice",
        html: `<ul>
          <li>Compounds 21–99: <strong>ones + und + tens</strong> as one word</li>
          <li>Example: 24 → vier + und + zwanzig → <strong>vierundzwanzig</strong></li>
          <li>Exceptions (elf, zwölf, zwanzig, dreißig, sech-/sieb- forms) live in the chart</li>
        </ul>`,
      },
      {
        heading: "How practice works",
        html: `<ul>
          <li>Snap pieces into slots — drag to place/remove, or tap a chip to add (tap again to undo the last field)</li>
          <li>Hint / Reference are scaffolding — not failures</li>
        </ul>`,
      },
    ],
  },
  nouns: {
    title: "Nouns: pattern before rote",
    lede: "Everything here is nominative for now. Bootstrap gender from strong suffixes, lock the association, test it on Wugs, then learn plurals as a separate die = number rule.",
    blocks: [
      {
        heading: "Nominative frame",
        html: `<ul>
          <li><strong>Singular:</strong> <span class="g-tag g-masc">der</span> / <span class="g-tag g-fem">die</span> / <span class="g-tag g-neut">das</span> mark noun gender</li>
          <li><strong>Plural:</strong> the article is always <strong>die</strong> — that is number, not feminine gender</li>
          <li>Other cases come later; don’t generalize article shapes beyond this frame yet</li>
        </ul>`,
      },
      {
        heading: "Practice spine",
        html: `<ul>
          <li><strong>Articles</strong> — suffix cue → nominative singular article</li>
          <li><strong>Association</strong> — same task by suffix family; aim ~80% before plurals feel natural</li>
          <li><strong>Wugs</strong> — apply the pattern to novel nouns (or say insufficient info)</li>
          <li><strong>Plurals</strong> — die is given (number); build stem + ending (— = no ending)</li>
        </ul>`,
      },
      {
        heading: "Gender channels",
        html: `<ul class="gender-key">
          <li><span class="g-tag g-masc">der</span> <span class="g-tag g-masc">M</span> — masculine · bold / blue</li>
          <li><span class="g-tag g-fem">die</span> <span class="g-tag g-fem">F</span> — feminine · italic / round / pink <em>(singular only)</em></li>
          <li><span class="g-tag g-neut">das</span> <span class="g-tag g-neut">N</span> — neuter · dotted underline / green</li>
        </ul>`,
      },
    ],
  },
};

/** Nouns chart — suffix → gender tendencies + common plural shapes. */
const nounsChart = {
  tabs: [
    {
      id: "feminine",
      label: "Feminine",
      blurb: "Strong suffix clues for die. Patterns, not absolute laws — lexical facts still win.",
    },
    {
      id: "masculine",
      label: "Masculine",
      blurb: "Useful masculine endings. Coverage is narrower than the big feminine suffixes.",
    },
    {
      id: "neuter",
      label: "Neuter",
      blurb: "Diminutives -chen/-lein are near-certain neuter — even when meaning feels feminine.",
    },
    {
      id: "plurals",
      label: "Plurals",
      blurb:
        "Nominative plural article is always die — that is number, not feminine gender. Ending notes refer to the singular noun’s gender tendency (der Tag → die Tage).",
    },
  ],
  feminine: [
    {
      cue: "-ung",
      note: "very strong → F",
      article: "die",
      gender: "feminine",
      parts: [
        { text: "die", guide: "dee" },
        { text: "Zei", guide: "TSAI", stress: true },
        { text: "tung", guide: "toong" },
      ],
    },
    {
      cue: "-heit",
      note: "very strong → F",
      article: "die",
      gender: "feminine",
      parts: [
        { text: "die", guide: "dee" },
        { text: "Frei", guide: "FRY", stress: true },
        { text: "heit", guide: "hite" },
      ],
    },
    {
      cue: "-keit",
      note: "very strong → F",
      article: "die",
      gender: "feminine",
      parts: [
        { text: "die", guide: "dee" },
        { text: "Mö", guide: "MUE", stress: true },
        { text: "glich", guide: "glikh" },
        { text: "keit", guide: "kite" },
      ],
    },
    {
      cue: "-schaft",
      note: "strong → F",
      article: "die",
      gender: "feminine",
      parts: [
        { text: "die", guide: "dee" },
        { text: "Freund", guide: "FROYNT", stress: true },
        { text: "schaft", guide: "shahft" },
      ],
    },
    {
      cue: "-ion",
      note: "strong → F (loan)",
      article: "die",
      gender: "feminine",
      parts: [
        { text: "die", guide: "dee" },
        { text: "Na", guide: "nah" },
        { text: "ti", guide: "TSI", stress: true },
        { text: "on", guide: "ohn" },
      ],
    },
  ],
  masculine: [
    {
      cue: "-ling",
      note: "strong → M",
      article: "der",
      gender: "masculine",
      parts: [
        { text: "der", guide: "dair" },
        { text: "Früh", guide: "FRUE", stress: true },
        { text: "ling", guide: "ling" },
      ],
    },
    {
      cue: "-ismus",
      note: "strong → M",
      article: "der",
      gender: "masculine",
      parts: [
        { text: "der", guide: "dair" },
        { text: "Tou", guide: "too" },
        { text: "ris", guide: "RIS", stress: true },
        { text: "mus", guide: "moos" },
      ],
    },
    {
      cue: "-ner",
      note: "often → M (agents)",
      article: "der",
      gender: "masculine",
      parts: [
        { text: "der", guide: "dair" },
        { text: "Lehr", guide: "LAYR", stress: true },
        { text: "er", guide: "er" },
      ],
      displayCue: "-er / -ner",
    },
  ],
  neuter: [
    {
      cue: "-chen",
      note: "near-certain → N",
      article: "das",
      gender: "neuter",
      parts: [
        { text: "das", guide: "dahs" },
        { text: "Mäd", guide: "MEHD", stress: true },
        { text: "chen", guide: "chen" },
      ],
    },
    {
      cue: "-lein",
      note: "near-certain → N",
      article: "das",
      gender: "neuter",
      parts: [
        { text: "das", guide: "dahs" },
        { text: "Büch", guide: "BUEKH", stress: true },
        { text: "lein", guide: "line" },
      ],
    },
    {
      cue: "-ment",
      note: "often → N (loan)",
      article: "das",
      gender: "neuter",
      parts: [
        { text: "das", guide: "dahs" },
        { text: "In", guide: "in" },
        { text: "stru", guide: "STROO", stress: true },
        { text: "ment", guide: "ment" },
      ],
    },
  ],
  plurals: [
    {
      cue: "+en",
      note: "often after feminine singulars",
      from: "die Zeitung",
      parts: [
        { text: "die", guide: "dee" },
        { text: "Zei", guide: "TSAI", stress: true },
        { text: "tun", guide: "toon" },
        { text: "gen", guide: "gen" },
      ],
    },
    {
      cue: "+e",
      note: "often after masculine singulars",
      from: "der Tag",
      parts: [
        { text: "die", guide: "dee" },
        { text: "Ta", guide: "TAH", stress: true },
        { text: "ge", guide: "ge" },
      ],
    },
    {
      cue: "+er",
      note: "often after neuter singulars (±umlaut)",
      from: "das Buch",
      parts: [
        { text: "die", guide: "dee" },
        { text: "Bü", guide: "BUE", stress: true },
        { text: "cher", guide: "kher" },
      ],
    },
    {
      cue: "+s",
      note: "loanwords (any singular gender)",
      from: "das Auto",
      parts: [
        { text: "die", guide: "dee" },
        { text: "Au", guide: "OW", stress: true },
        { text: "tos", guide: "tohs" },
      ],
    },
    {
      cue: "—",
      note: "no ending (some -chen, -el…)",
      from: "das Mädchen",
      parts: [
        { text: "die", guide: "dee" },
        { text: "Mäd", guide: "MEHD", stress: true },
        { text: "chen", guide: "chen" },
      ],
    },
  ],
};

/** Numbers chart — tabbed reference; tap example → karaoke like Sounds chart. */
const numbersChart = {
  tabs: [
    {
      id: "base",
      label: "0–12",
      blurb: "Foundational blocks. 11 and 12 are unique words. eins drops s in compounds (einundzwanzig).",
    },
    {
      id: "teens",
      label: "13–19",
      blurb: "Rule: base + zehn. sechzehn / siebzehn shorten sechs / sieben.",
    },
    {
      id: "tens",
      label: "20–90",
      blurb: "Rule: base + zig. Watch zwanzig, dreißig, and the sech-/sieb- shortenings.",
    },
    {
      id: "compounds",
      label: "21–99",
      blurb: "Read backward: ones + und + tens as one word (vierundzwanzig = four-and-twenty).",
    },
  ],
  base: [
    { n: "0", parts: [{ text: "null", guide: "nool" }], note: "" },
    { n: "1", parts: [{ text: "eins", guide: "ines" }], note: "→ ein in compounds" },
    { n: "2", parts: [{ text: "zwei", guide: "tsvai" }], note: "" },
    { n: "3", parts: [{ text: "drei", guide: "dry" }], note: "" },
    { n: "4", parts: [{ text: "vier", guide: "feer" }], note: "" },
    { n: "5", parts: [{ text: "fünf", guide: "fuenf" }], note: "" },
    { n: "6", parts: [{ text: "sechs", guide: "zex" }], note: "" },
    {
      n: "7",
      parts: [
        { text: "sie", guide: "ZEE", stress: true },
        { text: "ben", guide: "ben" },
      ],
      note: "",
    },
    { n: "8", parts: [{ text: "acht", guide: "ahkht" }], note: "" },
    { n: "9", parts: [{ text: "neun", guide: "noin" }], note: "" },
    { n: "10", parts: [{ text: "zehn", guide: "tsayn" }], note: "" },
    { n: "11", parts: [{ text: "elf", guide: "elf" }], note: "unique" },
    { n: "12", parts: [{ text: "zwölf", guide: "tsvuelf" }], note: "unique" },
  ],
  teens: [
    {
      n: "13",
      parts: [
        { text: "drei", guide: "DRY", stress: true },
        { text: "zehn", guide: "tsayn" },
      ],
      note: "",
    },
    {
      n: "14",
      parts: [
        { text: "vier", guide: "FEER", stress: true },
        { text: "zehn", guide: "tsayn" },
      ],
      note: "",
    },
    {
      n: "15",
      parts: [
        { text: "fünf", guide: "FUENF", stress: true },
        { text: "zehn", guide: "tsayn" },
      ],
      note: "",
    },
    {
      n: "16",
      parts: [
        { text: "sech", guide: "ZEKH", stress: true },
        { text: "zehn", guide: "tsayn" },
      ],
      note: "drops s from sechs",
    },
    {
      n: "17",
      parts: [
        { text: "sieb", guide: "ZEEP", stress: true },
        { text: "zehn", guide: "tsayn" },
      ],
      note: "drops en from sieben",
    },
    {
      n: "18",
      parts: [
        { text: "acht", guide: "AHKHT", stress: true },
        { text: "zehn", guide: "tsayn" },
      ],
      note: "",
    },
    {
      n: "19",
      parts: [
        { text: "neun", guide: "NOIN", stress: true },
        { text: "zehn", guide: "tsayn" },
      ],
      note: "",
    },
  ],
  tens: [
    {
      n: "20",
      parts: [
        { text: "zwan", guide: "TSVAN", stress: true },
        { text: "zig", guide: "tsikh" },
      ],
      note: "zwei → zwan",
    },
    {
      n: "30",
      parts: [
        { text: "drei", guide: "DRY", stress: true },
        { text: "ßig", guide: "sikh" },
      ],
      note: "ßig, not zig",
    },
    {
      n: "40",
      parts: [
        { text: "vier", guide: "FEER", stress: true },
        { text: "zig", guide: "tsikh" },
      ],
      note: "",
    },
    {
      n: "50",
      parts: [
        { text: "fünf", guide: "FUENF", stress: true },
        { text: "zig", guide: "tsikh" },
      ],
      note: "",
    },
    {
      n: "60",
      parts: [
        { text: "sech", guide: "ZEKH", stress: true },
        { text: "zig", guide: "tsikh" },
      ],
      note: "drops s from sechs",
    },
    {
      n: "70",
      parts: [
        { text: "sieb", guide: "ZEEP", stress: true },
        { text: "zig", guide: "tsikh" },
      ],
      note: "drops en from sieben",
    },
    {
      n: "80",
      parts: [
        { text: "acht", guide: "AHKHT", stress: true },
        { text: "zig", guide: "tsikh" },
      ],
      note: "",
    },
    {
      n: "90",
      parts: [
        { text: "neun", guide: "NOIN", stress: true },
        { text: "zig", guide: "tsikh" },
      ],
      note: "",
    },
  ],
  compounds: [
    {
      n: "21",
      parts: [
        { text: "ein", guide: "INE", stress: true },
        { text: "und", guide: "oont" },
        { text: "zwan", guide: "TSVAN", stress: true },
        { text: "zig", guide: "tsikh" },
      ],
      note: "one-and-twenty",
    },
    {
      n: "24",
      parts: [
        { text: "vier", guide: "FEER", stress: true },
        { text: "und", guide: "oont" },
        { text: "zwan", guide: "TSVAN", stress: true },
        { text: "zig", guide: "tsikh" },
      ],
      note: "four-and-twenty",
    },
    {
      n: "35",
      parts: [
        { text: "fünf", guide: "FUENF", stress: true },
        { text: "und", guide: "oont" },
        { text: "drei", guide: "DRY", stress: true },
        { text: "ßig", guide: "sikh" },
      ],
      note: "five-and-thirty",
    },
    {
      n: "99",
      parts: [
        { text: "neun", guide: "NOIN", stress: true },
        { text: "und", guide: "oont" },
        { text: "neun", guide: "NOIN", stress: true },
        { text: "zig", guide: "tsikh" },
      ],
      note: "nine-and-ninety",
    },
  ],
};

/** Demo prompts — forms/parts/distractors from the Numbers engine. */
const numberDemoMeta = [
  {
    value: 24,
    english: "twenty-four",
    grain: "construction",
    answerParts: [
      { text: "vier", guide: "FEER", stress: true },
      { text: "und", guide: "oont" },
      { text: "zwan", guide: "TSVAN", stress: true },
      { text: "zig", guide: "tsikh" },
    ],
  },
  {
    value: 37,
    english: "thirty-seven",
    grain: "construction",
    answerParts: [
      { text: "sie", guide: "ZEE", stress: true },
      { text: "ben", guide: "ben" },
      { text: "und", guide: "oont" },
      { text: "drei", guide: "DRY", stress: true },
      { text: "ßig", guide: "sikh" },
    ],
  },
  {
    value: 42,
    english: "forty-two",
    grain: "construction",
    answerParts: [
      { text: "zwei", guide: "TSVAI", stress: true },
      { text: "und", guide: "oont" },
      { text: "vier", guide: "FEER", stress: true },
      { text: "zig", guide: "tsikh" },
    ],
  },
  {
    value: 99,
    english: "ninety-nine",
    grain: "morph",
    answerParts: [
      { text: "neun", guide: "NOIN", stress: true },
      { text: "und", guide: "oont" },
      { text: "neun", guide: "NOIN", stress: true },
      { text: "zig", guide: "tsikh" },
    ],
  },
];

function currentNumberMeta() {
  return numberDemoMeta[state.numbersIndex % numberDemoMeta.length];
}

function currentNumberExercise() {
  const meta = currentNumberMeta();
  return createNumberConstructionExercise(meta.value, {
    grain: meta.grain,
    english: meta.english,
    mode: state.numbersDifficulty,
    answerParts: meta.answerParts,
  });
}

/** Demo article items — karaoke guides stay mock-side; truth/mode from exercise layer. */
const nounArticleMeta = [
  {
    lemma: "Zeitung",
    parts: [
      { text: "die", guide: "dee" },
      { text: "Zei", guide: "TSAI", stress: true },
      { text: "tung", guide: "toong" },
    ],
  },
  {
    lemma: "Mädchen",
    parts: [
      { text: "das", guide: "dahs" },
      { text: "Mäd", guide: "MEHD", stress: true },
      { text: "chen", guide: "chen" },
    ],
  },
  {
    lemma: "Frühling",
    parts: [
      { text: "der", guide: "dair" },
      { text: "Früh", guide: "FRUE", stress: true },
      { text: "ling", guide: "ling" },
    ],
  },
];

/** Demo plural items — forms from exercise layer; karaoke guides mock-side. */
const nounPluralMeta = [
  {
    lemma: "Zeitung",
    translation: "newspapers",
    answerParts: [
      { text: "die", guide: "dee" },
      { text: "Zei", guide: "TSAI", stress: true },
      { text: "tun", guide: "toon" },
      { text: "gen", guide: "gen" },
    ],
  },
  {
    lemma: "Tag",
    translation: "days",
    answerParts: [
      { text: "die", guide: "dee" },
      { text: "Ta", guide: "TAH", stress: true },
      { text: "ge", guide: "ge" },
    ],
  },
  {
    lemma: "Buch",
    translation: "books",
    answerParts: [
      { text: "die", guide: "dee" },
      { text: "Bü", guide: "BUE", stress: true },
      { text: "cher", guide: "kher" },
    ],
  },
  {
    lemma: "Auto",
    translation: "cars",
    answerParts: [
      { text: "die", guide: "dee" },
      { text: "Au", guide: "OW", stress: true },
      { text: "tos", guide: "tohs" },
    ],
  },
  {
    lemma: "Mädchen",
    translation: "girls",
    answerParts: [
      { text: "die", guide: "dee" },
      { text: "Mäd", guide: "MEHD", stress: true },
      { text: "chen", guide: "chen" },
    ],
  },
];

function currentNounArticleExercise() {
  const meta = nounArticleMeta[state.nounsIndex % nounArticleMeta.length];
  return createNounArticleExercise(meta.lemma, {
    mode: state.nounsDifficulty,
    answerParts: meta.parts,
  });
}

const nounAssociationPool = associationLemmas();
const nounWugPool = wugForms();

function currentNounAssociationExercise() {
  const item =
    nounAssociationPool[
      state.nounsAssociationIndex % Math.max(1, nounAssociationPool.length)
    ];
  return createNounAssociationExercise(item.lemma, {
    mode: state.nounsDifficulty,
  });
}

function currentNounWugExercise() {
  const form =
    nounWugPool[state.nounsWugIndex % Math.max(1, nounWugPool.length)];
  return createNounWugExercise(form, { mode: state.nounsDifficulty });
}

function currentNounPluralExercise() {
  const meta = nounPluralMeta[state.nounsPluralIndex % nounPluralMeta.length];
  return createNounPluralExercise(meta.lemma, {
    mode: state.nounsDifficulty,
    translation: meta.translation,
    answerParts: meta.answerParts,
  });
}

function isNounArticleLikeMode() {
  return (
    state.nounsMode === "articles" ||
    state.nounsMode === "association" ||
    state.nounsMode === "wugs"
  );
}

function recordFamilyAttempt(patternId, ok) {
  if (!patternId) return;
  const prev = state.nounFamilyStats[patternId] || { correct: 0, total: 0 };
  state.nounFamilyStats[patternId] = {
    correct: prev.correct + (ok ? 1 : 0),
    total: prev.total + 1,
  };
}

function familyProgressText(patternId, suffix) {
  if (!patternId || !suffix) return "";
  const s = state.nounFamilyStats[patternId] || { correct: 0, total: 0 };
  if (s.total === 0) {
    return `-${suffix} family · build accuracy here · ~80% feels ready for plurals`;
  }
  const pct = Math.round((100 * s.correct) / s.total);
  const ready = pct >= 80 && s.total >= 4;
  return `-${suffix} · ${s.correct}/${s.total} (${pct}%)${
    ready ? " · ready for plurals on this family" : " · aim ~80%"
  }`;
}

function joinNounPluralParts(parts) {
  return parts.map((t) => (t === "—" ? "" : t)).join("");
}

/** Discriminate set — chart-aligned contrasts. Choice captions never name `play`. */
const soundDiscriminate = [
  {
    prompt: "Which vowel did you hear?",
    play: "Tür",
    answer: "ü",
    parts: [{ text: "Tür", guide: "tueer" }],
    choices: [
      { id: "u", label: "u", sub: "back, rounded" },
      { id: "ü", label: "ü", sub: "front, rounded" },
      { id: "i", label: "i", sub: "front, unrounded" },
    ],
    hint: "Lips rounded like u, tongue farther forward — closer to i.",
    reference: {
      title: "ü vs u",
      html: `<ul>
        <li><strong>u</strong> — back, rounded (gut, Fuß)</li>
        <li><strong>ü</strong> — front, rounded (Tür, über)</li>
      </ul>`,
    },
  },
  {
    prompt: "Which vowel did you hear?",
    play: "schön",
    answer: "ö",
    parts: [{ text: "schön", guide: "shoen" }],
    choices: [
      { id: "o", label: "o", sub: "back · “already”" },
      { id: "ö", label: "ö", sub: "front rounded" },
      { id: "ei", label: "ei", sub: "“eye” glide" },
    ],
    hint: "Front rounded ö — not the back o of schon.",
    reference: {
      title: "ö vs o",
      html: `<ul>
        <li><strong>schon</strong> — back o “already”</li>
        <li><strong>schön</strong> — front rounded ö “beautiful”</li>
      </ul>`,
    },
  },
  {
    prompt: "Short or longer a?",
    play: "Mann",
    answer: "short",
    parts: [{ text: "Mann", guide: "mahn" }],
    choices: [
      { id: "short", label: "short a", sub: "double consonant after" },
      { id: "long", label: "longer a", sub: "aa / ah spelling" },
      { id: "umlaut", label: "ä", sub: "umlaut · airy eh" },
    ],
    hint: "Double n keeps the vowel short — mahn, not baahn.",
    reference: {
      title: "a length",
      html: `<ul>
        <li>Short: Mann — double consonant after</li>
        <li>Longer: Bahn — ah / aa cue length</li>
      </ul>`,
    },
  },
  {
    prompt: "Short or longer a?",
    play: "Bahn",
    answer: "long",
    parts: [{ text: "Bahn", guide: "baahn" }],
    choices: [
      { id: "short", label: "short a", sub: "double consonant after" },
      { id: "long", label: "longer a", sub: "aa / ah spelling" },
      { id: "umlaut", label: "ä", sub: "umlaut · airy eh" },
    ],
    hint: "ah in the spelling cues a longer a.",
    reference: {
      title: "a length",
      html: `<ul>
        <li>Bahn, Saal — aa / ah → longer</li>
        <li>Mann, Stadt — double consonant → short</li>
      </ul>`,
    },
  },
  {
    prompt: "Which e did you hear?",
    play: "Bett",
    answer: "short",
    parts: [{ text: "Bett", guide: "bett" }],
    choices: [
      { id: "short", label: "short e", sub: "double consonant after" },
      { id: "long", label: "longer e", sub: "ee / eh spelling" },
      { id: "schwa", label: "weak -e", sub: "unstressed ending" },
    ],
    hint: "Double t keeps it short — bett, not zay.",
    reference: {
      title: "e length",
      html: `<ul>
        <li>Short: Bett</li>
        <li>Longer: See, mehr (ee / eh)</li>
      </ul>`,
    },
  },
  {
    prompt: "Which e did you hear?",
    play: "See",
    answer: "long",
    parts: [{ text: "See", guide: "zay" }],
    choices: [
      { id: "short", label: "short e", sub: "double consonant after" },
      { id: "long", label: "longer e", sub: "ee / eh spelling" },
      { id: "ei", label: "ei", sub: "“eye” diphthong" },
    ],
    hint: "ee spelling → longer e (like “ay” in day, not English “see”).",
    reference: {
      title: "e length",
      html: `<ul>
        <li>See, Tee — ee → longer e</li>
        <li>Not the diphthong ei (mein)</li>
      </ul>`,
    },
  },
  {
    prompt: "Which i did you hear?",
    play: "mit",
    answer: "short",
    parts: [{ text: "mit", guide: "mit" }],
    choices: [
      { id: "short", label: "short i", sub: "ih · closed" },
      { id: "long", label: "longer ie", sub: "usually spelled ie" },
      { id: "ü", label: "ü", sub: "front rounded" },
    ],
    hint: "Short ih — not the long ee of sie.",
    reference: {
      title: "i length",
      html: `<ul>
        <li>Short: mit, Tisch</li>
        <li>Longer: sie, viel — usually spelled ie</li>
      </ul>`,
    },
  },
  {
    prompt: "Which i did you hear?",
    play: "sie",
    answer: "long",
    parts: [{ text: "sie", guide: "zee" }],
    choices: [
      { id: "short", label: "short i", sub: "ih · closed" },
      { id: "long", label: "longer ie", sub: "usually spelled ie" },
      { id: "ei", label: "ei", sub: "“eye” diphthong" },
    ],
    hint: "ie is the usual long-i spelling — zee, not “eye”.",
    reference: {
      title: "ie vs ei",
      html: `<ul>
        <li><strong>ie</strong> — longer ee (sie)</li>
        <li><strong>ei</strong> — diphthong “eye” (mein)</li>
      </ul>`,
    },
  },
  {
    prompt: "Which o did you hear?",
    play: "oft",
    answer: "short",
    parts: [{ text: "oft", guide: "awft" }],
    choices: [
      { id: "short", label: "short o", sub: "open · brief" },
      { id: "long", label: "longer o", sub: "oo / oh spelling" },
      { id: "ö", label: "ö", sub: "front rounded" },
    ],
    hint: "Short open o — not Boot’s longer o, and not ö.",
    reference: {
      title: "o length",
      html: `<ul>
        <li>Short: oft, Sonne</li>
        <li>Longer: Boot, ohne (oo / oh)</li>
      </ul>`,
    },
  },
  {
    prompt: "Which o did you hear?",
    play: "Boot",
    answer: "long",
    parts: [{ text: "Boot", guide: "boht" }],
    choices: [
      { id: "short", label: "short o", sub: "open · brief" },
      { id: "long", label: "longer o", sub: "oo / oh spelling" },
      { id: "au", label: "au", sub: "“ow” diphthong" },
    ],
    hint: "oo / oh cues a longer o.",
    reference: {
      title: "o length",
      html: `<ul>
        <li>Boot, Sohn — longer o</li>
        <li>Not the diphthong au (Haus)</li>
      </ul>`,
    },
  },
  {
    prompt: "Which u did you hear?",
    play: "und",
    answer: "short",
    parts: [{ text: "und", guide: "oont" }],
    choices: [
      { id: "short", label: "short u", sub: "brief · closed" },
      { id: "long", label: "longer u", sub: "uh often marks length" },
      { id: "ü", label: "ü", sub: "front rounded" },
    ],
    hint: "Short u — Schuh is longer (uh marks length).",
    reference: {
      title: "u length",
      html: `<ul>
        <li>Short: und, Mutter</li>
        <li>Longer: Schuh, Uhr — uh often marks length</li>
      </ul>`,
    },
  },
  {
    prompt: "Which u did you hear?",
    play: "Schuh",
    answer: "long",
    parts: [{ text: "Schuh", guide: "shoo" }],
    choices: [
      { id: "short", label: "short u", sub: "brief · closed" },
      { id: "long", label: "longer u", sub: "uh often marks length" },
      { id: "ü", label: "ü", sub: "front rounded" },
    ],
    hint: "uh between vowels marks a longer u — shoo, not ü.",
    reference: {
      title: "u length",
      html: `<ul>
        <li>Schuh — longer u</li>
        <li>Tür — ü (front rounded), different sound</li>
      </ul>`,
    },
  },
  {
    prompt: "Which umlaut did you hear?",
    play: "Männer",
    answer: "ä",
    parts: [
      { text: "män", guide: "MEN", stress: true },
      { text: "ner", guide: "ner" },
    ],
    choices: [
      { id: "a", label: "a", sub: "plain open a" },
      { id: "ä", label: "ä", sub: "airy eh" },
      { id: "e", label: "e", sub: "short e" },
    ],
    hint: "ä is like a short e / airy eh — not plain a.",
    reference: {
      title: "ä",
      html: `<ul>
        <li>Männer, spät — ä ≈ short e / airy eh</li>
        <li>Stress on first beat: MEN-ner</li>
      </ul>`,
    },
  },
  {
    prompt: "Which vowel did you hear?",
    play: "spät",
    answer: "ä",
    parts: [{ text: "spät", guide: "shpeht" }],
    choices: [
      { id: "a", label: "a", sub: "plain a" },
      { id: "ä", label: "ä", sub: "airy eh · longer" },
      { id: "e", label: "e", sub: "short e" },
    ],
    hint: "Longer ä — äh/ä with length, not plain a.",
    reference: {
      title: "ä length",
      html: `<ul>
        <li>spät — longer ä</li>
        <li>äh in spelling often cues length</li>
      </ul>`,
    },
  },
  {
    prompt: "Which vowel did you hear?",
    play: "öffnen",
    answer: "ö",
    parts: [
      { text: "öff", guide: "OEFF", stress: true },
      { text: "nen", guide: "nen" },
    ],
    choices: [
      { id: "o", label: "o", sub: "back rounded" },
      { id: "ö", label: "ö", sub: "front rounded" },
      { id: "e", label: "e", sub: "unrounded" },
    ],
    hint: "Rounded: lips of o, tongue of e — not in English.",
    reference: {
      title: "ö",
      html: `<ul>
        <li><strong>öffnen</strong> — short ö</li>
        <li><strong>offen</strong> — plain o (different word)</li>
      </ul>`,
    },
  },
  {
    prompt: "Which vowel did you hear?",
    play: "müssen",
    answer: "ü",
    parts: [
      { text: "müs", guide: "MUES", stress: true },
      { text: "sen", guide: "sen" },
    ],
    choices: [
      { id: "u", label: "u", sub: "back rounded" },
      { id: "ü", label: "ü", sub: "front rounded" },
      { id: "i", label: "i", sub: "front unrounded" },
    ],
    hint: "Rounded: lips of u, tongue of i.",
    reference: {
      title: "ü",
      html: `<ul>
        <li>müssen — short ü</li>
        <li>Contrast: muss / Fuß use plain u</li>
      </ul>`,
    },
  },
  {
    prompt: "Which diphthong did you hear?",
    play: "mein",
    answer: "ei",
    parts: [{ text: "mein", guide: "mine" }],
    choices: [
      { id: "ei", label: "ei / ai", sub: "“eye” glide" },
      { id: "ie", label: "ie", sub: "longer ee" },
      { id: "ee", label: "ee", sub: "longer e" },
    ],
    hint: "ei/ai = “eye” — don’t say English “ay” or “ee”.",
    reference: {
      title: "ei / ai",
      html: `<ul>
        <li>mein, Mai — same glide both spellings</li>
        <li>ie is different (sie)</li>
      </ul>`,
    },
  },
  {
    prompt: "Which diphthong did you hear?",
    play: "Haus",
    answer: "au",
    parts: [{ text: "Haus", guide: "hows" }],
    choices: [
      { id: "au", label: "au", sub: "“ow” as in house" },
      { id: "eu", label: "eu / äu", sub: "“oy” glide" },
      { id: "o", label: "o", sub: "plain longer o" },
    ],
    hint: "Like English “house” — ow, not oy.",
    reference: {
      title: "au",
      html: `<ul>
        <li>Haus, auch — au ≈ “ow”</li>
        <li>eu/äu ≈ “oy” (neu)</li>
      </ul>`,
    },
  },
  {
    prompt: "Which diphthong did you hear?",
    play: "neu",
    answer: "eu",
    parts: [{ text: "neu", guide: "noy" }],
    choices: [
      { id: "eu", label: "eu / äu", sub: "“oy” glide" },
      { id: "au", label: "au", sub: "“ow” as in house" },
      { id: "u", label: "u", sub: "plain u" },
    ],
    hint: "eu and äu are spelling twins — both “oy”.",
    reference: {
      title: "eu / äu",
      html: `<ul>
        <li>neu, Häuser — same “oy” glide</li>
        <li>Not au (Haus)</li>
      </ul>`,
    },
  },
  {
    prompt: "Which ch did you hear?",
    play: "ich",
    answer: "soft",
    parts: [{ text: "ich", guide: "ikh" }],
    choices: [
      { id: "soft", label: "soft ch", sub: "after front vowels" },
      { id: "back", label: "back ch", sub: "after a, o, u, au" },
      { id: "sch", label: "sch", sub: "like English sh" },
    ],
    hint: "Soft ch after front vowels (i, e, ä, ö, ü, ei…).",
    reference: {
      title: "ich vs ach",
      html: `<ul>
        <li><strong>ich</strong> — soft after front vowels</li>
        <li><strong>ach</strong> — back after a, o, u, au (Buch)</li>
      </ul>`,
    },
  },
  {
    prompt: "Which ch did you hear?",
    play: "Buch",
    answer: "back",
    parts: [{ text: "Buch", guide: "bookh" }],
    choices: [
      { id: "soft", label: "soft ch", sub: "after front vowels" },
      { id: "back", label: "back ch", sub: "after a, o, u, au" },
      { id: "k", label: "k", sub: "hard stop" },
    ],
    hint: "Back ch after a, o, u, au — not soft ich.",
    reference: {
      title: "ach-sound",
      html: `<ul>
        <li>Buch, auch, Nacht — back ch</li>
        <li>Environment rule, not a different letter</li>
      </ul>`,
    },
  },
  {
    prompt: "How does the v sound here?",
    play: "Vater",
    answer: "f",
    parts: [
      { text: "Va", guide: "FA", stress: true },
      { text: "ter", guide: "ter" },
    ],
    choices: [
      { id: "f", label: "like f", sub: "common for German v" },
      { id: "v", label: "like English v", sub: "as in very" },
      { id: "w", label: "like English w", sub: "as in water" },
    ],
    hint: "German v often = f — not English “vay-ter”.",
    reference: {
      title: "v / f",
      html: `<ul>
        <li>Vater, vier — v usually like f</li>
        <li>w is the letter that sounds like English v (was)</li>
      </ul>`,
    },
  },
  {
    prompt: "How does the w sound here?",
    play: "was",
    answer: "v",
    parts: [{ text: "was", guide: "vas" }],
    choices: [
      { id: "v", label: "like English v", sub: "German w default" },
      { id: "w", label: "like English w", sub: "as in water" },
      { id: "f", label: "like f", sub: "common for German v" },
    ],
    hint: "German w ≈ English v — not English w.",
    reference: {
      title: "w",
      html: `<ul>
        <li>was, wo, Wein — w like English v</li>
      </ul>`,
    },
  },
  {
    prompt: "How does the j sound here?",
    play: "ja",
    answer: "y",
    parts: [{ text: "ja", guide: "ya" }],
    choices: [
      { id: "y", label: "like English y", sub: "yes-glide" },
      { id: "j", label: "like English j", sub: "as in jam" },
      { id: "sh", label: "like sh", sub: "as in journal" },
    ],
    hint: "German j = English y — never English “j”.",
    reference: {
      title: "j",
      html: `<ul>
        <li>ja, Jahr, jung — y-glide</li>
      </ul>`,
    },
  },
  {
    prompt: "How does s sound at the start?",
    play: "Sonne",
    answer: "z",
    parts: [
      { text: "Son", guide: "ZON", stress: true },
      { text: "ne", guide: "ne" },
    ],
    choices: [
      { id: "z", label: "like z", sub: "before a vowel" },
      { id: "s", label: "voiceless s", sub: "ß / ss style" },
      { id: "sh", label: "like sh", sub: "sch style" },
    ],
    hint: "Before a vowel at the start, s is often like English z.",
    reference: {
      title: "s at start",
      html: `<ul>
        <li>Sonne, sehen — often z-like</li>
        <li>ss / ß stay voiceless s (Fuß)</li>
      </ul>`,
    },
  },
  {
    prompt: "Voiced or voiceless s?",
    play: "Fuß",
    answer: "voiceless",
    parts: [{ text: "Fuß", guide: "foos" }],
    choices: [
      { id: "voiceless", label: "voiceless s", sub: "ß / ss" },
      { id: "voiced", label: "z-like s", sub: "start before vowel" },
      { id: "sh", label: "sh", sub: "sch style" },
    ],
    hint: "ß / ss = voiceless s — never the z-like start of Sonne.",
    reference: {
      title: "ß / ss",
      html: `<ul>
        <li>Fuß, wissen — voiceless s</li>
        <li>Sonne — often z-like at the start</li>
      </ul>`,
    },
  },
  {
    prompt: "How does sch sound?",
    play: "Schule",
    answer: "sh",
    parts: [
      { text: "Schu", guide: "SHOO", stress: true },
      { text: "le", guide: "le" },
    ],
    choices: [
      { id: "sh", label: "like sh", sub: "one sound, three letters" },
      { id: "sk", label: "like sk", sub: "English “school”" },
      { id: "ch", label: "soft ch", sub: "after front vowels" },
    ],
    hint: "sch = English sh — one sound, three letters.",
    reference: {
      title: "sch",
      html: `<ul>
        <li>Schule, schon — sh</li>
        <li>Not English “sk” as in school</li>
      </ul>`,
    },
  },
  {
    prompt: "How does sp sound at the start?",
    play: "Spiel",
    answer: "shp",
    parts: [{ text: "Spiel", guide: "shpeel" }],
    choices: [
      { id: "shp", label: "shp", sub: "s → sh + p" },
      { id: "sp", label: "sp", sub: "English spin" },
      { id: "sh", label: "sh only", sub: "no p" },
    ],
    hint: "Word-initial sp → s sounds like sh (shp).",
    reference: {
      title: "sp / st",
      html: `<ul>
        <li>Spiel, Stein — word-initial s → sh</li>
        <li>Mid-word often stays s (Wespe)</li>
      </ul>`,
    },
  },
  {
    prompt: "How does st sound at the start?",
    play: "Stein",
    answer: "sht",
    parts: [{ text: "Stein", guide: "shtine" }],
    choices: [
      { id: "sht", label: "sht", sub: "s → sh + t" },
      { id: "st", label: "st", sub: "English stone" },
      { id: "sh", label: "sh only", sub: "no t" },
    ],
    hint: "Word-initial st → sht.",
    reference: {
      title: "st",
      html: `<ul>
        <li>Stein, stehen — sht at the start</li>
      </ul>`,
    },
  },
  {
    prompt: "How does z sound?",
    play: "Zeit",
    answer: "ts",
    parts: [{ text: "Zeit", guide: "tsite" }],
    choices: [
      { id: "ts", label: "ts", sub: "as in cats" },
      { id: "z", label: "English z", sub: "as in zoo" },
      { id: "s", label: "plain s", sub: "as in see" },
    ],
    hint: "German z = ts (as in cats) — never English z.",
    reference: {
      title: "z / tz",
      html: `<ul>
        <li>Zeit, zu — ts</li>
        <li>tz same sound (Katze)</li>
      </ul>`,
    },
  },
  {
    prompt: "Which cluster did you hear?",
    play: "Apfel",
    answer: "pf",
    parts: [
      { text: "Ap", guide: "AP", stress: true },
      { text: "fel", guide: "fel" },
    ],
    choices: [
      { id: "pf", label: "pf", sub: "both sounds" },
      { id: "f", label: "f only", sub: "English apple" },
      { id: "p", label: "p only", sub: "no f" },
    ],
    hint: "pf is both sounds — not English “apple”.",
    reference: {
      title: "pf",
      html: `<ul>
        <li>Apfel, Pferd — p + f</li>
        <li>Stress on first syllable: AP-fel</li>
      </ul>`,
    },
  },
  {
    prompt: "How does qu sound?",
    play: "Quark",
    answer: "kv",
    parts: [{ text: "Quark", guide: "kvark" }],
    choices: [
      { id: "kv", label: "kv", sub: "k + v" },
      { id: "kw", label: "kw", sub: "English queen" },
      { id: "k", label: "k only", sub: "no v" },
    ],
    hint: "German qu = k + v — not English “kw”.",
    reference: {
      title: "qu",
      html: `<ul>
        <li>Quark, Qualität — kv</li>
      </ul>`,
    },
  },
  {
    prompt: "What is the h doing between vowels?",
    play: "gehen",
    answer: "length",
    parts: [
      { text: "ge", guide: "GE", stress: true },
      { text: "hen", guide: "hen" },
    ],
    choices: [
      { id: "length", label: "marks length", sub: "often silent" },
      { id: "h-sound", label: "sounds like h", sub: "as in hat" },
      { id: "ch", label: "soft ch", sub: "after front vowels" },
    ],
    hint: "Between vowels, h is often silent and marks length on the vowel before.",
    reference: {
      title: "h for length",
      html: `<ul>
        <li>gehen, sehen — h often silent</li>
        <li>Stress: GE-hen</li>
      </ul>`,
    },
  },
  {
    prompt: "What does the double consonant tell you?",
    play: "Mutter",
    answer: "short",
    parts: [
      { text: "Mut", guide: "MUT", stress: true },
      { text: "ter", guide: "ter" },
    ],
    choices: [
      { id: "short", label: "vowel before is short", sub: "tt / pp / ck cue" },
      { id: "long", label: "vowel before is long", sub: "like English “moot”" },
      { id: "stress", label: "stress moves back", sub: "onto the last beat" },
    ],
    hint: "tt / pp / ck → vowel before is short. Stress stays on Mut-.",
    reference: {
      title: "double consonant",
      html: `<ul>
        <li>Mutter, Ecke, Nippel — short vowel before</li>
        <li>Not a cue to stress the second syllable</li>
      </ul>`,
    },
  },
];

/** Syllables set — multi-beat chart words + stress contrast (loanword late stress). */
const soundKaraoke = [
  {
    word: "Männer",
    tts: "Männer",
    syllables: [
      { text: "män", guide: "MEN", stress: true },
      { text: "ner", guide: "ner", stress: false },
    ],
    hint: "Default native stress: first stem syllable — MEN in caps.",
    reference: {
      title: "Männer",
      html: `<ul>
        <li>ä ≈ airy eh</li>
        <li>CAPS + underline = primary stress</li>
      </ul>`,
    },
  },
  {
    word: "öffnen",
    tts: "öffnen",
    syllables: [
      { text: "öff", guide: "OEFF", stress: true },
      { text: "nen", guide: "nen", stress: false },
    ],
    hint: "Front rounded ö on the stressed first beat.",
    reference: {
      title: "öffnen",
      html: `<ul>
        <li>ö — lips of o, tongue of e</li>
        <li>Stress: OEFF-nen</li>
      </ul>`,
    },
  },
  {
    word: "müssen",
    tts: "müssen",
    syllables: [
      { text: "müs", guide: "MUES", stress: true },
      { text: "sen", guide: "sen", stress: false },
    ],
    hint: "Front rounded ü — stress on MUES.",
    reference: {
      title: "müssen",
      html: `<ul>
        <li>ü — lips of u, tongue of i</li>
        <li>Double s keeps the vowel short</li>
      </ul>`,
    },
  },
  {
    word: "Ecke",
    tts: "Ecke",
    syllables: [
      { text: "Eck", guide: "ECK", stress: true },
      { text: "e", guide: "e", stress: false },
    ],
    hint: "ck = k; double c keeps the vowel short. Stress on Eck-.",
    reference: {
      title: "Ecke",
      html: `<ul>
        <li>ck → like k; short vowel before</li>
        <li>Weak -e on the second beat</li>
      </ul>`,
    },
  },
  {
    word: "Vater",
    tts: "Vater",
    syllables: [
      { text: "Va", guide: "FA", stress: true },
      { text: "ter", guide: "ter", stress: false },
    ],
    hint: "v often = f. Stress on FA-.",
    reference: {
      title: "Vater",
      html: `<ul>
        <li>German v ≈ f here</li>
        <li>Not English “vay-ter”</li>
      </ul>`,
    },
  },
  {
    word: "Apfel",
    tts: "Apfel",
    syllables: [
      { text: "Ap", guide: "AP", stress: true },
      { text: "fel", guide: "fel", stress: false },
    ],
    hint: "pf = both sounds. Stress on AP-, not -fel.",
    reference: {
      title: "Apfel",
      html: `<ul>
        <li>pf cluster — p + f</li>
        <li>First-stem stress (native default)</li>
      </ul>`,
    },
  },
  {
    word: "Sonne",
    tts: "Sonne",
    syllables: [
      { text: "Son", guide: "ZON", stress: true },
      { text: "ne", guide: "ne", stress: false },
    ],
    hint: "Initial s before a vowel often sounds like z. Stress on ZON-.",
    reference: {
      title: "Sonne",
      html: `<ul>
        <li>Start s → often z-like</li>
        <li>Double n → short vowel</li>
      </ul>`,
    },
  },
  {
    word: "Schule",
    tts: "Schule",
    syllables: [
      { text: "Schu", guide: "SHOO", stress: true },
      { text: "le", guide: "le", stress: false },
    ],
    hint: "sch = sh (one sound, three letters). Stress on SHOO-.",
    reference: {
      title: "Schule",
      html: `<ul>
        <li>sch → English sh</li>
        <li>Not English “sk”</li>
      </ul>`,
    },
  },
  {
    word: "Katze",
    tts: "Katze",
    syllables: [
      { text: "Kat", guide: "KAT", stress: true },
      { text: "ze", guide: "tse", stress: false },
    ],
    hint: "tz = ts. Stress on KAT-; t marks a short vowel before.",
    reference: {
      title: "Katze",
      html: `<ul>
        <li>z / tz → ts (as in cats)</li>
        <li>Never English z</li>
      </ul>`,
    },
  },
  {
    word: "gehen",
    tts: "gehen",
    syllables: [
      { text: "ge", guide: "GE", stress: true },
      { text: "hen", guide: "hen", stress: false },
    ],
    hint: "Between vowels, h is often silent and marks length. Stress on GE-.",
    reference: {
      title: "gehen",
      html: `<ul>
        <li>h between vowels → often silent / length mark</li>
        <li>Stress stays on the first beat</li>
      </ul>`,
    },
  },
  {
    word: "Mutter",
    tts: "Mutter",
    syllables: [
      { text: "Mut", guide: "MUT", stress: true },
      { text: "ter", guide: "ter", stress: false },
    ],
    hint: "Double t → vowel before is short. Stress on MUT-, not -ter.",
    reference: {
      title: "Mutter",
      html: `<ul>
        <li>tt / pp / ck → short vowel before</li>
        <li>Not a cue to move stress back</li>
      </ul>`,
    },
  },
  {
    word: "Zeitung",
    tts: "Zeitung",
    syllables: [
      { text: "Zei", guide: "TSAI", stress: true },
      { text: "tung", guide: "toong", stress: false },
    ],
    hint: "Native default: first stem syllable — TSAI in caps. z = ts.",
    reference: {
      title: "Zeitung",
      html: `<ul>
        <li>ei → “eye” glide</li>
        <li>z → ts; ng as in sing</li>
        <li>CAPS = primary stress</li>
      </ul>`,
    },
  },
  {
    word: "Universität",
    tts: "Universität",
    syllables: [
      { text: "U", guide: "oo", stress: false },
      { text: "ni", guide: "ni", stress: false },
      { text: "ver", guide: "ver", stress: false },
      { text: "si", guide: "zi", stress: false },
      { text: "tät", guide: "TEHT", stress: true },
    ],
    hint: "Loanword exception: stress near the end — TEHT in caps.",
    reference: {
      title: "Universität",
      html: `<ul>
        <li>Many -ität / foreign endings stress late</li>
        <li>Contrast with first-stem natives like Zeitung</li>
        <li>Respelling: oo-ni-ver-zi-TEHT</li>
      </ul>`,
    },
  },
];

/** English glosses for Sounds reveals / Syllables (not shown in prompts). */
const deEnGloss = {
  Tür: "door",
  schön: "beautiful",
  Mann: "man",
  Bahn: "train / track",
  Bett: "bed",
  See: "lake",
  mit: "with",
  sie: "she / they",
  oft: "often",
  Boot: "boat",
  und: "and",
  Schuh: "shoe",
  Männer: "men",
  spät: "late",
  öffnen: "to open",
  müssen: "must / to have to",
  mein: "my",
  Haus: "house",
  neu: "new",
  ich: "I",
  Buch: "book",
  Vater: "father",
  was: "what",
  ja: "yes",
  Sonne: "sun",
  Fuß: "foot",
  Schule: "school",
  Spiel: "game / play",
  Stein: "stone",
  Zeit: "time",
  Apfel: "apple",
  Quark: "quark (curd cheese)",
  gehen: "to go",
  Mutter: "mother",
  Ecke: "corner",
  Katze: "cat",
  Zeitung: "newspaper",
  Universität: "university",
};

function glossForDe(word) {
  if (!word) return "";
  return deEnGloss[word] || deEnGloss[word.replace(/^./, (c) => c.toUpperCase())] || "";
}

/**
 * Shared post-answer panel: boxed German + phonetic, English outside.
 * Hides question chrome so the reveal replaces the ask UI.
 * Returns phonetic beat nodes for karaoke highlighting.
 * @param {string} [opts.wordHtml] — optional HTML for the DE line (e.g. gendered article)
 */
function setStageAnswerMode(prefix, on) {
  const stage = document.getElementById(`${prefix}-stage`);
  if (stage) stage.classList.toggle("is-answer", !!on);
}

function fillAnswerReveal(prefix, { word, wordHtml, parts, en, ok }) {
  const root = document.getElementById(`${prefix}-reveal`);
  const wordEl = document.getElementById(`${prefix}-reveal-word`);
  const phonEl = document.getElementById(`${prefix}-reveal-phonetic`);
  const enEl = document.getElementById(`${prefix}-reveal-en`);
  if (!root || !wordEl || !phonEl) return [];

  setStageAnswerMode(prefix, true);
  root.hidden = false;
  root.classList.toggle("is-ok", ok === true);
  root.classList.toggle("is-bad", ok === false);
  if (wordHtml) wordEl.innerHTML = wordHtml;
  else wordEl.textContent = word || "";
  phonEl.innerHTML = "";

  const nodes = [];
  (parts || []).forEach((p, i) => {
    if (i > 0) {
      phonEl.appendChild(document.createTextNode(" · "));
    }
    const span = document.createElement("span");
    span.className = "phon-beat" + (p.stress ? " has-stress" : "");
    span.textContent = p.guide || p.text || "";
    phonEl.appendChild(span);
    nodes.push(span);
  });

  if (enEl) {
    if (en) {
      enEl.hidden = false;
      enEl.textContent = en;
    } else {
      enEl.hidden = true;
      enEl.textContent = "";
    }
  }

  return nodes;
}

/** Color-only tint for answer-key articles (no gender formatting). */
function articleColorClass(article, gender) {
  if (gender === "masculine" || article === "der") return "art-color-masc";
  if (gender === "feminine" || article === "die") return "art-color-fem";
  if (gender === "neuter" || article === "das") return "art-color-neut";
  return "";
}

/**
 * Answer-key DE line: colored article + lemma.
 * Assisted: Zeit-ung (hyphen + gender-colored suffix).
 * Core: Zeitung (no hyphen; gender-colored suffix only).
 */
function nounAnswerWordHtml(article, lemma, gender, opts = {}) {
  const { stem, ending, assisted = false } = opts;
  const tint = articleColorClass(article, gender);
  const art = tint
    ? `<span class="answer-art ${tint}">${article}</span>`
    : article;
  let lemmaHtml = lemma;
  if (stem && ending) {
    const join = assisted ? "-" : "";
    lemmaHtml = `<span class="answer-lemma"><span class="answer-stem">${stem}</span>${join}<span class="answer-suf ${tint}">${ending}</span></span>`;
  }
  return `${art} ${lemmaHtml}`;
}

/**
 * Plural answer-key: die + stem + ending.
 * No gender tint — plural die is number, not feminine gender of the noun.
 */
function nounPluralAnswerWordHtml(parts) {
  const [article, stem, ending] = parts;
  return `${article} ${joinNounPluralParts([stem, ending])}`;
}

function clearAnswerReveal(prefix) {
  setStageAnswerMode(prefix, false);
  const root = document.getElementById(`${prefix}-reveal`);
  if (!root) return;
  root.hidden = true;
  root.classList.remove("is-ok", "is-bad");
  const wordEl = document.getElementById(`${prefix}-reveal-word`);
  const phonEl = document.getElementById(`${prefix}-reveal-phonetic`);
  const enEl = document.getElementById(`${prefix}-reveal-en`);
  if (wordEl) {
    wordEl.textContent = "";
    wordEl.innerHTML = "";
  }
  if (phonEl) phonEl.innerHTML = "";
  if (enEl) {
    enEl.hidden = true;
    enEl.textContent = "";
  }
}

const state = {
  view: "hub",
  selectedPiece: null,
  numbersIndex: 0,
  nounsIndex: 0,
  nounsPluralIndex: 0,
  nounsAssociationIndex: 0,
  nounsWugIndex: 0,
  numbersFilled: [],
  nounsFilled: [],
  nounsArticle: null,
  soundsMode: "karaoke",
  numbersMode: "construction",
  nounsMode: "articles",
  numbersDifficulty: "assisted",
  nounsDifficulty: "assisted",
  soundsDifficulty: "assisted",
  /** Rolling accuracy per suffix family id (Association mode). */
  nounFamilyStats: {},
  currentExercise: null,
  soundsIndex: 0,
  soundsChoice: null,
  soundsChecked: false,
  numbersChecked: false,
  nounsChecked: false,
  /** Plurals: one retry after a wrong build, then reveal. */
  nounsPluralRetryUsed: false,
  soundsAdvanceTimer: null,
  nounsAdvanceTimer: null,
  numbersAdvanceTimer: null,
  karaokeTimer: null,
  karaokeTimers: [],
  ttsMsPerChar: null,
  /** In-memory attempt log (mock stand-in for persistence). */
  attemptLog: [],

  /** briefing | chart | practice */
  phase: {
    sounds: "briefing",
    numbers: "briefing",
    nouns: "briefing",
  },
  /**
   * When true, returning to practice restores the hidden stage instead of
   * remounting (so Briefing/Chart peek doesn't wipe the current question).
   */
  preservePractice: {
    sounds: false,
    numbers: false,
    nouns: false,
  },
  soundsChartTab: "vowels",
  numbersChartTab: "base",
  nounsChartTab: "feminine",
};

const els = {
  grid: document.getElementById("territory-grid"),
  views: {
    hub: document.getElementById("view-hub"),
    numbers: document.getElementById("view-numbers"),
    nouns: document.getElementById("view-nouns"),
    sounds: document.getElementById("view-sounds"),
    coming: document.getElementById("view-coming"),
  },
};

function navigate(view, opts = {}) {
  state.view = view;
  state.selectedPiece = null;
  document.body.classList.toggle("is-session", view !== "hub");
  stopSpeech();
  closeSheet();
  closeAllMenus();
  syncTerritoryChrome(view);

  Object.entries(els.views).forEach(([key, node]) => {
    const on = key === view;
    node.classList.toggle("is-active", on);
    node.hidden = !on;
  });

  if (view === "numbers" || view === "nouns" || view === "sounds") {
    if (!opts.keepPhase) {
      state.phase[view] = "practice";
      state.preservePractice[view] = false;
    }
    showTerritoryPhase(view);
  }
  if (view === "coming") {
    const titleEl = document.getElementById("coming-title");
    if (titleEl) {
      titleEl.textContent = opts.title || "Coming soon";
      titleEl.hidden = false;
    }
    document.getElementById("coming-body").textContent =
      opts.body || "This territory is on the map but not built yet.";
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function syncTerritoryChrome(view) {
  document.querySelectorAll(".territory-menu").forEach((el) => {
    el.hidden = el.dataset.territory !== view;
  });
  const coming = document.getElementById("coming-title");
  if (coming && view !== "coming") coming.hidden = true;
}

function briefingExampleHtml() {
  return `<div class="briefing-example" aria-hidden="true">
    <button type="button" class="syl has-stress" tabindex="-1">
      <span class="syl-ortho">Zei</span>
      <span class="syl-guide">TSAI</span>
    </button>
    <button type="button" class="syl" tabindex="-1">
      <span class="syl-ortho">tung</span>
      <span class="syl-guide">toong</span>
    </button>
  </div>`;
}

/** Shared syllable chip used in chart + quiz. */
function makeSylButton({
  ortho,
  guide,
  stress = false,
  say,
  lang = "de-DE",
  ariaLabel,
}) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "syl" + (stress ? " has-stress" : "");
  if (say) {
    btn.dataset.say = say;
    btn.dataset.lang = lang;
  } else {
    btn.disabled = true;
    btn.classList.add("syl-mute");
  }
  btn.setAttribute(
    "aria-label",
    ariaLabel || (say ? `Play ${say}` : `${ortho}, no audio`)
  );
  btn.innerHTML = `
    <span class="syl-ortho">${ortho}</span>
    <span class="syl-guide">${guide}</span>
  `;
  if (say) {
    btn.addEventListener("click", () => playSylChip(btn, say, lang));
  }
  return btn;
}

/**
 * Highlight chip + speak one beat (quiz syllable tap).
 */
function playSylChip(node, text, lang = "de-DE") {
  stopSpeech();
  node.classList.add("is-active");
  withUtterance(text, {
    lang,
    rate: 0.85,
    onEnd: () => {
      state.karaokeTimer = setTimeout(() => {
        node.classList.remove("is-active");
      }, 180);
    },
    onError: () => {
      node.classList.remove("is-active");
    },
  });
}

/** Build a non-clickable syllable chip (used inside chart example karaoke group). */
function makeSylDisplay({ ortho, guide, stress = false }) {
  const el = document.createElement("div");
  el.className = "syl" + (stress ? " has-stress" : "");
  el.innerHTML = `
    <span class="syl-ortho">${ortho}</span>
    <span class="syl-guide">${guide}</span>
  `;
  return el;
}

function renderSoundsChart() {
  const root = document.getElementById("sounds-chart");
  if (!root) return;

  const tab = state.soundsChartTab;
  const rows = soundsChart[tab] || [];

  const tabs = soundsChart.tabs
    .map(
      (t) =>
        `<button type="button" class="chip${t.id === tab ? " is-on" : ""}" data-chart-tab="${t.id}" aria-pressed="${t.id === tab}">${t.label}</button>`
    )
    .join("");

  const activeTab = soundsChart.tabs.find((t) => t.id === tab);
  const tabBlurb = activeTab?.blurb
    ? `<p class="chart-tab-blurb">${activeTab.blurb}</p>`
    : "";

  root.innerHTML = `
    <div class="chart-tabs" role="tablist">${tabs}</div>
    <div class="chart-scroll">
      <p class="chart-note">Curated high-value patterns — not every German sound. Left side is silent reference. Tap an example for the full word; CAPS + underline = stressed syllable.</p>
      ${tabBlurb}
      <div class="chart-list" id="chart-list"></div>
    </div>
  `;

  const list = root.querySelector("#chart-list");
  rows.forEach((r) => {
    const row = document.createElement("div");
    row.className = "chart-row";

    const pattern = document.createElement("div");
    pattern.className = "chart-pattern";
    const spells = (r.spells || [r.spell]).filter(Boolean).join(", ");
    pattern.innerHTML = `
      <p class="chart-formula">
        <span class="chart-spells">${spells}</span>
        <span class="chart-eq">=</span>
        <span class="chart-guide">${r.guide}</span>
      </p>
      ${r.note ? `<p class="chart-note-cell">${r.note}</p>` : ""}
    `;

    const example = document.createElement("button");
    example.type = "button";
    example.className = "chart-example-play";
    example.setAttribute(
      "aria-label",
      `Play ${(r.parts || []).map((p) => p.text).join("")}`
    );

    const chips = document.createElement("div");
    chips.className = "chart-chips chart-chips-example";
    const parts = r.parts || [];
    parts.forEach((p) => {
      chips.appendChild(
        makeSylDisplay({
          ortho: p.text,
          guide: p.guide,
          stress: !!p.stress,
        })
      );
    });
    example.appendChild(chips);

    example.addEventListener("click", () => {
      const nodes = [...chips.querySelectorAll(".syl")];
      const tts = parts.map((p) => p.text).join("");
      playKaraokeFlow(tts, parts, nodes);
    });

    row.append(pattern, example);
    list.appendChild(row);
  });

  root.querySelectorAll("[data-chart-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.soundsChartTab = btn.dataset.chartTab;
      renderSoundsChart();
    });
  });
}

function renderBriefing(territoryId) {
  const data = briefings[territoryId];
  const root = document.getElementById(`${territoryId}-briefing`);
  if (!data || !root) return;

  const blocks = data.blocks
    .map((b) => {
      const example = b.example ? briefingExampleHtml() : "";
      return `<div class="briefing-block">
        <h4>${b.heading}</h4>
        ${b.html}
        ${example}
      </div>`;
    })
    .join("");

  root.innerHTML = `
    <p class="briefing-kicker">Briefing</p>
    <h3>${data.title}</h3>
    <p class="briefing-lede">${data.lede}</p>
    ${blocks}
  `;
}

function syncTerritoryMenu(territoryId) {
  const menu = document.querySelector(
    `.territory-menu[data-territory="${territoryId}"]`
  );
  if (!menu) return;

  const phase = state.phase[territoryId] || "practice";
  const modeKey =
    territoryId === "numbers"
      ? state.numbersMode
      : territoryId === "nouns"
        ? state.nounsMode
        : state.soundsMode;
  const difficulty =
    territoryId === "numbers"
      ? state.numbersDifficulty
      : territoryId === "nouns"
        ? state.nounsDifficulty
        : state.soundsDifficulty;

  menu.querySelectorAll("[data-show-briefing]").forEach((btn) => {
    const on = phase === "briefing";
    btn.classList.toggle("is-on", on);
  });
  menu.querySelectorAll("[data-open-chart]").forEach((btn) => {
    const on = phase === "chart";
    btn.classList.toggle("is-on", on);
  });

  const modeAttr =
    territoryId === "numbers"
      ? "numbersMode"
      : territoryId === "nouns"
        ? "nounsMode"
        : "soundsMode";
  menu.querySelectorAll(`[data-${territoryId}-mode]`).forEach((btn) => {
    const on = phase === "practice" && btn.dataset[modeAttr] === modeKey;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", String(on));
  });

  const diffAttr =
    territoryId === "numbers"
      ? "numbersDifficulty"
      : territoryId === "nouns"
        ? "nounsDifficulty"
        : "soundsDifficulty";
  menu.querySelectorAll(`[data-${territoryId}-difficulty]`).forEach((btn) => {
    const on = btn.dataset[diffAttr] === difficulty;
    btn.classList.remove("is-on");
    btn.setAttribute("aria-checked", String(on));
    btn.removeAttribute("aria-pressed");
    const mark = btn.querySelector(".menu-check-mark");
    if (mark) mark.textContent = on ? "✓" : "";
  });
}

function showTerritoryPhase(territoryId) {
  const phase = state.phase[territoryId] || "briefing";
  const briefing = document.getElementById(`${territoryId}-briefing`);
  const stage = document.getElementById(`${territoryId}-stage`);
  const soundsChartEl = document.getElementById("sounds-chart");
  const numbersChartEl = document.getElementById("numbers-chart");
  const nounsChartEl = document.getElementById("nouns-chart");

  if (soundsChartEl) soundsChartEl.hidden = true;
  if (numbersChartEl) numbersChartEl.hidden = true;
  if (nounsChartEl) nounsChartEl.hidden = true;

  syncTerritoryMenu(territoryId);

  if (phase === "briefing") {
    if (briefing) briefing.hidden = false;
    if (stage) stage.hidden = true;
    renderBriefing(territoryId);
    stopSpeech();
    return;
  }

  if (phase === "chart") {
    if (briefing) briefing.hidden = true;
    if (stage) stage.hidden = true;
    if (territoryId === "sounds" && soundsChartEl) {
      soundsChartEl.hidden = false;
      renderSoundsChart();
      return;
    }
    if (territoryId === "numbers" && numbersChartEl) {
      numbersChartEl.hidden = false;
      renderNumbersChart();
      return;
    }
    if (territoryId === "nouns" && nounsChartEl) {
      nounsChartEl.hidden = false;
      renderNounsChart();
      return;
    }
  }

  if (briefing) briefing.hidden = true;
  if (stage) stage.hidden = false;

  const resume = state.preservePractice[territoryId];
  if (resume) state.preservePractice[territoryId] = false;

  if (territoryId === "numbers") {
    if (!resume) renderNumbers();
  } else if (territoryId === "nouns") {
    if (!resume) renderNouns();
  } else if (territoryId === "sounds") {
    if (!resume) renderSounds();
  }
}

function renderNumbersChart() {
  const root = document.getElementById("numbers-chart");
  if (!root) return;

  const tab = state.numbersChartTab;
  const rows = numbersChart[tab] || [];
  const tabs = numbersChart.tabs
    .map(
      (t) =>
        `<button type="button" class="chip${t.id === tab ? " is-on" : ""}" data-chart-tab="${t.id}" aria-pressed="${t.id === tab}">${t.label}</button>`
    )
    .join("");

  const activeTab = numbersChart.tabs.find((t) => t.id === tab);
  const tabBlurb = activeTab?.blurb
    ? `<p class="chart-tab-blurb">${activeTab.blurb}</p>`
    : "";

  root.innerHTML = `
    <div class="chart-tabs" role="tablist">${tabs}</div>
    <div class="chart-scroll">
      <p class="chart-note">Tap an example to hear the German form with syllable highlight. Left side is silent reference.</p>
      ${tabBlurb}
      <div class="chart-list" id="numbers-chart-list"></div>
    </div>
  `;

  const list = root.querySelector("#numbers-chart-list");
  rows.forEach((r) => {
    const row = document.createElement("div");
    row.className = "chart-row";

    const pattern = document.createElement("div");
    pattern.className = "chart-pattern";
    pattern.innerHTML = `
      <p class="chart-formula">
        <span class="chart-spells">${r.n}</span>
      </p>
      ${r.note ? `<p class="chart-note-cell">${r.note}</p>` : ""}
    `;

    const example = document.createElement("button");
    example.type = "button";
    example.className = "chart-example-play";
    const parts = r.parts || [];
    const word = parts.map((p) => p.text).join("");
    example.setAttribute("aria-label", `Play ${word}`);

    const chips = document.createElement("div");
    chips.className = "chart-chips chart-chips-example";
    parts.forEach((p) => {
      chips.appendChild(
        makeSylDisplay({
          ortho: p.text,
          guide: p.guide,
          stress: !!p.stress,
        })
      );
    });
    example.appendChild(chips);

    example.addEventListener("click", () => {
      const nodes = [...chips.querySelectorAll(".syl")];
      playKaraokeFlow(word, parts, nodes);
    });

    row.append(pattern, example);
    list.appendChild(row);
  });

  root.querySelectorAll("[data-chart-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.numbersChartTab = btn.dataset.chartTab;
      renderNumbersChart();
    });
  });
}

function renderNounsChart() {
  const root = document.getElementById("nouns-chart");
  if (!root) return;

  const tab = state.nounsChartTab;
  const rows = nounsChart[tab] || [];
  const tabs = nounsChart.tabs
    .map(
      (t) =>
        `<button type="button" class="chip${t.id === tab ? " is-on" : ""}" data-chart-tab="${t.id}" aria-pressed="${t.id === tab}">${t.label}</button>`
    )
    .join("");

  const activeTab = nounsChart.tabs.find((t) => t.id === tab);
  const tabBlurb = activeTab?.blurb
    ? `<p class="chart-tab-blurb">${activeTab.blurb}</p>`
    : "";

  root.innerHTML = `
    <div class="chart-tabs" role="tablist">${tabs}</div>
    <div class="chart-scroll">
      <p class="chart-note">Left = pattern cue (silent). Tap the example to hear article + noun.</p>
      ${tabBlurb}
      <div class="chart-list" id="nouns-chart-list"></div>
    </div>
  `;

  const list = root.querySelector("#nouns-chart-list");
  rows.forEach((r) => {
    const row = document.createElement("div");
    row.className = "chart-row";

    const cueLabel = r.displayCue || r.cue;
    const gClass = r.gender ? genderClass(r.gender) : "";
    const pattern = document.createElement("div");
    pattern.className = "chart-pattern";
    pattern.innerHTML = `
      <p class="chart-formula">
        <span class="chart-spells${gClass ? ` ${gClass}` : ""}">${cueLabel}</span>
      </p>
      ${r.from ? `<p class="chart-note-cell">${r.from}</p>` : ""}
      ${r.note ? `<p class="chart-note-cell">${r.note}</p>` : ""}
    `;

    const example = document.createElement("button");
    example.type = "button";
    example.className = "chart-example-play";
    const parts = r.parts || [];
    const ttsWord = parts
      .map((p, i) => {
        if (i === 0 && ["die", "der", "das"].includes(p.text)) return p.text + " ";
        return p.text;
      })
      .join("")
      .trim();
    example.setAttribute("aria-label", `Play ${ttsWord}`);

    const chips = document.createElement("div");
    chips.className = "chart-chips chart-chips-example";
    parts.forEach((p) => {
      chips.appendChild(
        makeSylDisplay({
          ortho: p.text,
          guide: p.guide,
          stress: !!p.stress,
        })
      );
    });
    example.appendChild(chips);

    example.addEventListener("click", () => {
      const nodes = [...chips.querySelectorAll(".syl")];
      playKaraokeFlow(ttsWord, parts, nodes);
    });

    row.append(pattern, example);
    list.appendChild(row);
  });

  root.querySelectorAll("[data-chart-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.nounsChartTab = btn.dataset.chartTab;
      renderNounsChart();
    });
  });
}

function renderHub() {
  els.grid.innerHTML = "";
  territories.forEach((t) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "territory";
    btn.dataset.territory = t.id;
    if (t.status !== "playable") {
      /* still clickable for coming-soon honesty */
    }
    btn.innerHTML = `
      ${t.suggested ? `<span class="territory-suggested">Suggested</span>` : ""}
      <span class="territory-name">${t.name}</span>
      <p class="territory-blurb">${t.blurb}</p>
      <span class="territory-status ${t.status}">${t.statusLabel}</span>
    `;
    btn.addEventListener("click", () => {
      if (t.id === "numbers" || t.id === "nouns" || t.id === "sounds") {
        navigate(t.id);
      } else {
        navigate("coming", {
          title: t.name,
          body: comingCopy[t.id] || "Not playable in this prototype.",
        });
      }
    });
    li.appendChild(btn);
    els.grid.appendChild(li);
  });
}

/* —— Magnetic Snap (pointer drag + tap) ——
 * - Tap tray chip → add to next empty field; tap again → remove from last field if it matches
 * - Tap filled field → snap out
 * - Drag tray chip onto a field → snap in
 * - Drag filled field away (or onto tray) → snap out; onto another field → move
 * HTML5 DnD is not used — it fails on iOS Safari.
 */

const SNAP_DRAG_THRESHOLD = 10;

function clearSelection() {
  state.selectedPiece = null;
  document.querySelectorAll(".piece.is-selected").forEach((p) => {
    p.classList.remove("is-selected");
    p.style.outline = "";
  });
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pulseSnap(el, kind) {
  if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  el.classList.remove("is-snap-in", "is-snap-out");
  // reflow so repeated pulses restart
  void el.offsetWidth;
  el.classList.add(kind === "out" ? "is-snap-out" : "is-snap-in");
  window.setTimeout(() => {
    el.classList.remove("is-snap-in", "is-snap-out");
  }, 220);
}

function slotFromPoint(clientX, clientY, slotsRoot) {
  const el = document.elementFromPoint(clientX, clientY);
  if (!el || !slotsRoot) return null;
  const slot = el.closest(".slot");
  if (!slot || !slotsRoot.contains(slot)) return null;
  if (slot.classList.contains("noun-unit") || slot.classList.contains("slot-given")) {
    return null;
  }
  return slot;
}

function overTray(clientX, clientY, trayRoot) {
  if (!trayRoot) return false;
  const el = document.elementFromPoint(clientX, clientY);
  return !!(el && trayRoot.contains(el));
}

function setHotSlot(slot) {
  document.querySelectorAll(".slot.is-hot").forEach((s) => {
    if (s !== slot) s.classList.remove("is-hot");
  });
  if (slot) slot.classList.add("is-hot");
}

function makeSnapGhost(sourceEl, label) {
  const ghost = document.createElement("div");
  ghost.className = "snap-ghost piece";
  ghost.textContent = label;
  ghost.setAttribute("aria-hidden", "true");
  // Copy gender channel classes when present
  ["g-masc", "g-fem", "g-neut", "piece-insufficient"].forEach((c) => {
    if (sourceEl.classList.contains(c)) ghost.classList.add(c);
  });
  document.body.appendChild(ghost);
  return ghost;
}

function moveSnapGhost(ghost, clientX, clientY) {
  if (!ghost) return;
  ghost.style.transform = `translate(${clientX}px, ${clientY}px) translate(-50%, -50%)`;
}

/**
 * @param {object} cfg
 * @param {() => boolean} cfg.locked
 * @param {() => (string|null)[]} cfg.getFilled
 * @param {(token: string, index: number) => void} cfg.placeAt
 * @param {(index: number) => void} cfg.clearAt
 * @param {HTMLElement} cfg.slotsRoot
 * @param {HTMLElement} cfg.trayRoot
 * @param {(slot: HTMLElement) => number} cfg.indexOfSlot
 */
function tapTrayToken(token, cfg) {
  if (cfg.locked()) return;
  const filled = cfg.getFilled();
  let last = -1;
  for (let i = filled.length - 1; i >= 0; i--) {
    if (filled[i]) {
      last = i;
      break;
    }
  }
  // Second tap on the same chip removes it from the last-filled field.
  if (last >= 0 && filled[last] === token) {
    cfg.clearAt(last);
    const slot = cfg.slotsRoot.querySelector(`[data-index="${last}"]`) ||
      cfg.slotsRoot.querySelector(".slot");
    pulseSnap(slot, "out");
    return;
  }
  const next = filled.findIndex((x) => !x);
  if (next < 0) return;
  cfg.placeAt(token, next);
  const slot =
    cfg.slotsRoot.querySelector(`[data-index="${next}"]`) ||
    cfg.slotsRoot.querySelector(".slot");
  pulseSnap(slot, "in");
}

function bindSnapTrayPiece(piece, token, cfg) {
  piece.addEventListener("pointerdown", (e) => {
    if (cfg.locked() || e.button !== 0) return;
    if (piece.disabled) return;

    const startX = e.clientX;
    const startY = e.clientY;
    let dragging = false;
    let ghost = null;
    const pointerId = e.pointerId;

    const onMove = (ev) => {
      if (ev.pointerId !== pointerId) return;
      const dist = Math.hypot(ev.clientX - startX, ev.clientY - startY);
      if (!dragging && dist < SNAP_DRAG_THRESHOLD) return;
      if (!dragging) {
        dragging = true;
        document.body.classList.add("is-snapping");
        ghost = makeSnapGhost(piece, piece.textContent.trim());
        moveSnapGhost(ghost, ev.clientX, ev.clientY);
        try {
          piece.setPointerCapture(pointerId);
        } catch (_) {
          /* ignore */
        }
      }
      moveSnapGhost(ghost, ev.clientX, ev.clientY);
      setHotSlot(slotFromPoint(ev.clientX, ev.clientY, cfg.slotsRoot));
    };

    const cleanup = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      setHotSlot(null);
      if (ghost) ghost.remove();
      document.body.classList.remove("is-snapping");
    };

    const onUp = (ev) => {
      if (ev.pointerId !== pointerId) return;
      cleanup();
      if (dragging) {
        const slot = slotFromPoint(ev.clientX, ev.clientY, cfg.slotsRoot);
        if (slot) {
          const idx = cfg.indexOfSlot(slot);
          if (idx >= 0) {
            cfg.placeAt(token, idx);
            pulseSnap(slot, "in");
          }
        }
        return;
      }
      tapTrayToken(token, cfg);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  });
}

function bindSnapSlot(slot, index, cfg) {
  slot.addEventListener("pointerdown", (e) => {
    if (cfg.locked() || e.button !== 0) return;
    const filled = cfg.getFilled();
    if (!filled[index]) return;

    const token = filled[index];
    const startX = e.clientX;
    const startY = e.clientY;
    let dragging = false;
    let ghost = null;
    const pointerId = e.pointerId;
    // Don't steal clicks from buttons inside slot (none today).

    const onMove = (ev) => {
      if (ev.pointerId !== pointerId) return;
      const dist = Math.hypot(ev.clientX - startX, ev.clientY - startY);
      if (!dragging && dist < SNAP_DRAG_THRESHOLD) return;
      if (!dragging) {
        dragging = true;
        document.body.classList.add("is-snapping");
        slot.classList.add("is-dragging-out");
        ghost = makeSnapGhost(slot, String(token === "insufficient" ? "?" : token));
        moveSnapGhost(ghost, ev.clientX, ev.clientY);
        try {
          slot.setPointerCapture(pointerId);
        } catch (_) {
          /* ignore */
        }
      }
      moveSnapGhost(ghost, ev.clientX, ev.clientY);
      const over = slotFromPoint(ev.clientX, ev.clientY, cfg.slotsRoot);
      setHotSlot(over && cfg.indexOfSlot(over) !== index ? over : null);
    };

    const cleanup = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      setHotSlot(null);
      slot.classList.remove("is-dragging-out");
      if (ghost) ghost.remove();
      document.body.classList.remove("is-snapping");
    };

    const onUp = (ev) => {
      if (ev.pointerId !== pointerId) return;
      cleanup();
      if (!dragging) {
        cfg.clearAt(index);
        pulseSnap(slot, "out");
        return;
      }
      const target = slotFromPoint(ev.clientX, ev.clientY, cfg.slotsRoot);
      const toIdx = target ? cfg.indexOfSlot(target) : -1;
      if (toIdx >= 0 && toIdx !== index) {
        const displaced = cfg.getFilled()[toIdx];
        cfg.placeAt(token, toIdx);
        if (displaced) cfg.placeAt(displaced, index);
        else cfg.clearAt(index);
        pulseSnap(target, "in");
        return;
      }
      // Away from fields (including over tray) → snap out
      if (!target || overTray(ev.clientX, ev.clientY, cfg.trayRoot)) {
        cfg.clearAt(index);
        pulseSnap(slot, "out");
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  });
}

function indexFromSlotEl(slot) {
  if (!slot) return -1;
  if (slot.dataset.index != null) return Number(slot.dataset.index);
  if (slot.dataset.slot === "article") return 0;
  return -1;
}

/* —— Numbers —— */

function renderNumbers() {
  clearNumbersAdvance();
  stopSpeech();
  const exercise = currentNumberExercise();
  const meta = currentNumberMeta();
  state.currentExercise = exercise;
  const parts = exercise.materials.parts;
  const distractors = exercise.materials.distractors;
  state.numbersFilled = Array(parts.length).fill(null);
  state.numbersChecked = false;

  const en = exercise.prompt.english
    ? `<span class="en">${exercise.prompt.english}</span>`
    : "";
  document.getElementById("numbers-prompt").innerHTML = `
    <strong>${meta.value}</strong>${en}
  `;

  clearAnswerReveal("numbers");
  const back = document.getElementById("numbers-back");
  if (back) back.disabled = state.numbersIndex <= 0;

  const hintBtn = document.getElementById("numbers-hint");
  const refBtn = document.getElementById("numbers-ref-btn");
  if (hintBtn) hintBtn.hidden = !exercise.scaffolding.showHintButton;
  if (refBtn) refBtn.hidden = !exercise.scaffolding.showReferenceButton;

  const slots = document.getElementById("numbers-slots");
  slots.innerHTML = "";
  const tray = document.getElementById("numbers-tray");
  tray.innerHTML = "";

  const snapCfg = {
    locked: () => state.numbersChecked,
    getFilled: () => state.numbersFilled,
    placeAt: (text, index) => placeNumberText(text, index),
    clearAt: (index) => clearNumberSlot(index),
    slotsRoot: slots,
    trayRoot: tray,
    indexOfSlot: indexFromSlotEl,
  };

  parts.forEach((_, i) => {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.dataset.index = String(i);
    slot.tabIndex = 0;
    slot.textContent = `Part ${i + 1}`;
    slot.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (state.numbersFilled[i]) clearNumberSlot(i);
      }
    });
    bindSnapSlot(slot, i, snapCfg);
    slots.appendChild(slot);
  });

  // Unique chip labels — reusable (same form can fill more than one slot).
  const labels = [...new Set([...parts, ...distractors])];
  shuffle(labels).forEach((text, i) => {
    const piece = document.createElement("button");
    piece.type = "button";
    piece.className = "piece";
    piece.dataset.id = `n${i}`;
    piece.dataset.text = text;
    piece.textContent = text;
    bindSnapTrayPiece(piece, text, snapCfg);
    tray.appendChild(piece);
  });

  syncTerritoryMenu("numbers");
}

function placeNumberText(text, slotIndex) {
  if (state.numbersChecked) return;
  if (slotIndex < 0 || slotIndex >= state.numbersFilled.length) return;

  state.numbersFilled[slotIndex] = text;

  const slot = document.querySelector(
    `#numbers-slots [data-index="${slotIndex}"]`
  );
  if (slot) {
    slot.classList.add("is-filled");
    slot.classList.remove("is-ok", "is-bad");
    slot.textContent = text;
    slot.setAttribute("aria-label", `${text}, tap to remove`);
  }

  clearSelection();

  if (state.numbersFilled.every(Boolean)) {
    checkNumbers();
  }
}

function clearNumberSlot(slotIndex) {
  if (state.numbersChecked) return;
  if (slotIndex < 0 || slotIndex >= state.numbersFilled.length) return;
  if (!state.numbersFilled[slotIndex]) return;

  state.numbersFilled[slotIndex] = null;
  const slot = document.querySelector(
    `#numbers-slots [data-index="${slotIndex}"]`
  );
  if (slot) {
    slot.classList.remove("is-filled", "is-ok", "is-bad");
    slot.textContent = `Part ${slotIndex + 1}`;
    slot.removeAttribute("aria-label");
  }
  clearSelection();
}

function clearNumbers() {
  if (state.numbersChecked) return;
  const exercise = currentNumberExercise();
  state.numbersFilled = Array(exercise.materials.parts.length).fill(null);
  document.querySelectorAll("#numbers-slots .slot").forEach((s, i) => {
    s.classList.remove("is-filled", "is-ok", "is-bad");
    s.textContent = `Part ${i + 1}`;
    s.removeAttribute("aria-label");
  });
  clearSelection();
}

function clearNumbersAdvance() {
  if (state.numbersAdvanceTimer) {
    clearTimeout(state.numbersAdvanceTimer);
    state.numbersAdvanceTimer = null;
  }
}

function scheduleNumbersAdvance(delayMs = 1500) {
  clearNumbersAdvance();
  state.numbersAdvanceTimer = setTimeout(() => {
    state.numbersAdvanceTimer = null;
    state.numbersIndex += 1;
    renderNumbers();
  }, delayMs);
}

function checkNumbers() {
  if (state.numbersChecked) return;
  const exercise = currentNumberExercise();
  const meta = currentNumberMeta();
  const parts = exercise.materials.parts;
  if (state.numbersFilled.some((x) => !x)) return;

  state.numbersChecked = true;
  const built = state.numbersFilled.slice();
  const { evaluation, attempt, accepted } = submitExerciseAttempt(
    exercise,
    { parts: built },
    { appVersion: "mock" }
  );
  state.attemptLog.push(attempt);

  document.querySelectorAll("#numbers-slots .slot").forEach((slot, i) => {
    const good =
      evaluation.slotMatch != null
        ? evaluation.slotMatch[i]
        : built[i] === parts[i];
    slot.classList.toggle("is-ok", !!good);
    slot.classList.toggle("is-bad", !good);
  });

  const word =
    evaluation.canonicalAnswers[0] || exercise.resolution.form || parts.join("");
  const answerParts =
    meta.answerParts || parts.map((t) => ({ text: t, guide: t }));
  const nodes = fillAnswerReveal("numbers", {
    word,
    parts: answerParts,
    en: meta.english || "",
    ok: accepted,
  });

  const afterPlay = () => scheduleNumbersAdvance(1500);
  if (!window.speechSynthesis || !nodes.length) {
    afterPlay();
    return;
  }
  playKaraokeFlow(word, answerParts, nodes, {
    keepAdvance: true,
    onEnd: afterPlay,
    onError: afterPlay,
  });
}

/* —— Nouns —— */

function genderClass(g) {
  if (g === "masculine") return "g-masc";
  if (g === "feminine") return "g-fem";
  return "g-neut";
}

/**
 * Gender channel class for tray/slot chips.
 * Articles only — plural endings stay plain so they don’t clash with die (always F).
 */
function chipGenderClass(text) {
  if (text === "der") return "g-masc";
  if (text === "die") return "g-fem";
  if (text === "das") return "g-neut";
  return "";
}

function applyChipGender(el, text, enabled) {
  el.classList.remove("g-masc", "g-fem", "g-neut");
  if (!enabled) return;
  const g = chipGenderClass(text);
  if (g) el.classList.add(g);
}

/** Lemma HTML for articles slot — Assisted: Zeit-ung (suffix gender color); Core: plain. */
function nounLemmaHtml(exercise) {
  const p = exercise.prompt;
  const markSuffix = !!(p.highlightSuffix && p.ending);
  if (markSuffix) {
    const tint = p.genderClass
      ? articleColorClass(null, p.genderClass)
      : "";
    return `<span class="noun-lemma"><span class="noun-stem">${p.stem}</span>-<span class="noun-suffix${tint ? ` ${tint}` : ""}">${p.ending}</span></span>`;
  }
  return `<span class="noun-lemma">${p.lemma}</span>`;
}

function paintNounArticleLemma(exercise) {
  const lemmaHtml = nounLemmaHtml(exercise);
  // No separate prompt question / duplicate lemma — noun lives in the slot only.
  const prompt = document.getElementById("nouns-prompt");
  if (prompt) {
    prompt.hidden = true;
    prompt.innerHTML = "";
  }
  const nounSlot = document.getElementById("nouns-noun-slot");
  if (nounSlot) {
    nounSlot.innerHTML = lemmaHtml;
  }
}

function renderNouns() {
  clearNounsAdvance();
  stopSpeech();
  clearAnswerReveal("nouns");

  syncTerritoryMenu("nouns");

  const help = document.getElementById("nouns-help");
  const translationEl = document.getElementById("nouns-translation");
  if (translationEl) {
    translationEl.hidden = true;
    translationEl.textContent = "";
  }
  if (help) {
    help.hidden = true;
    help.textContent = "";
  }

  if (state.nounsMode === "plurals") {
    const prompt = document.getElementById("nouns-prompt");
    if (prompt) prompt.hidden = false;
    const fam = document.getElementById("nouns-family-progress");
    if (fam) {
      fam.hidden = true;
      fam.textContent = "";
    }
    renderNounsPlurals();
    return;
  }

  if (state.nounsMode === "association") {
    renderNounsAssociation();
    return;
  }

  if (state.nounsMode === "wugs") {
    renderNounsWugs();
    return;
  }

  renderNounsArticles();
}

function applyNounScaffoldingChrome(exercise) {
  const sc = exercise.scaffolding;
  const legend = document.getElementById("nouns-legend");
  if (legend) {
    legend.hidden =
      state.nounsMode === "plurals" ||
      state.nounsMode === "wugs" ||
      !sc.showGenderLegend;
  }
  const hintBtn = document.getElementById("nouns-hint");
  const refBtn = document.getElementById("nouns-ref-btn");
  if (hintBtn) hintBtn.hidden = !sc.showHintButton;
  if (refBtn) refBtn.hidden = !sc.showReferenceButton;

  const help = document.getElementById("nouns-help");
  if (help) {
    help.hidden = true;
    help.textContent = "";
  }

  const translationEl = document.getElementById("nouns-translation");
  if (translationEl) {
    translationEl.hidden = true;
    translationEl.textContent = "";
  }
}

/** Shared Articles / Association / Wugs tray + slots. */
function renderNounArticleLike(exercise, { familyLine = "" } = {}) {
  state.currentExercise = exercise;
  state.nounsArticle = null;
  state.nounsFilled = [];
  state.nounsChecked = false;

  applyNounScaffoldingChrome(exercise);
  paintNounArticleLemma(exercise);

  const fam = document.getElementById("nouns-family-progress");
  if (fam) {
    if (familyLine) {
      fam.hidden = false;
      fam.textContent = familyLine;
    } else {
      fam.hidden = true;
      fam.textContent = "";
    }
  }

  const back = document.getElementById("nouns-back");
  if (back) {
    back.disabled =
      state.nounsMode === "articles"
        ? state.nounsIndex <= 0
        : state.nounsMode === "association"
          ? state.nounsAssociationIndex <= 0
          : state.nounsWugIndex <= 0;
  }

  const slotsRow = document.getElementById("nouns-slots");
  slotsRow.innerHTML = "";
  const tray = document.getElementById("nouns-tray");
  tray.innerHTML = "";

  const articleSlot = document.createElement("div");
  articleSlot.className = "slot";
  articleSlot.dataset.slot = "article";
  articleSlot.dataset.index = "0";
  articleSlot.dataset.accept = "article";
  articleSlot.tabIndex = 0;
  articleSlot.textContent = "Article";
  articleSlot.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (state.nounsArticle) clearArticleSlot();
    }
  });
  slotsRow.appendChild(articleSlot);

  const nounSlot = document.createElement("div");
  nounSlot.className = "slot is-filled noun-unit";
  nounSlot.id = "nouns-noun-slot";
  nounSlot.setAttribute("aria-live", "polite");
  slotsRow.appendChild(nounSlot);
  paintNounArticleLemma(exercise);

  const snapCfg = {
    locked: () => state.nounsChecked,
    getFilled: () => [state.nounsArticle],
    placeAt: (token) => placeArticle(token),
    clearAt: () => clearArticleSlot(),
    slotsRoot: slotsRow,
    trayRoot: tray,
    indexOfSlot: indexFromSlotEl,
  };
  bindSnapSlot(articleSlot, 0, snapCfg);

  const choiceMeta = [
    { id: "der", text: "der", gender: "masculine" },
    { id: "die", text: "die", gender: "feminine" },
    { id: "das", text: "das", gender: "neuter" },
  ];
  if (exercise.materials.allowInsufficient) {
    choiceMeta.push({ id: "insufficient", text: "?", gender: null });
  }
  const colorChoices = exercise.scaffolding.showChoiceGenderColors;
  choiceMeta.forEach((a) => {
    const piece = document.createElement("button");
    piece.type = "button";
    piece.className = "piece";
    if (a.id === "insufficient") {
      piece.classList.add("piece-insufficient");
      piece.textContent = "?";
      piece.title = "Insufficient information";
      piece.setAttribute("aria-label", "Insufficient information");
      piece.dataset.text = "insufficient";
    } else {
      applyChipGender(piece, a.text, colorChoices);
      piece.textContent = a.text;
      piece.setAttribute("aria-label", `${a.text}, ${a.gender}`);
      piece.dataset.text = a.text;
    }
    piece.dataset.id = a.id;
    bindSnapTrayPiece(piece, a.id, snapCfg);
    tray.appendChild(piece);
  });
}

function renderNounsArticles() {
  const fam = document.getElementById("nouns-family-progress");
  if (fam) {
    fam.hidden = true;
    fam.textContent = "";
  }
  renderNounArticleLike(currentNounArticleExercise());
}

function renderNounsAssociation() {
  const exercise = currentNounAssociationExercise();
  const suffix = exercise.materials.familySuffix || "family";
  renderNounArticleLike(exercise, {
    familyLine: familyProgressText(exercise.materials.patternId, suffix),
  });
}

function renderNounsWugs() {
  // No legend / “Wug · apply …” chrome — just the nonce + article choices.
  renderNounArticleLike(currentNounWugExercise(), { familyLine: "" });
}

function renderNounsPlurals() {
  const exercise = currentNounPluralExercise();
  state.currentExercise = exercise;
  const fullParts = exercise.materials.parts;
  // Article is given chrome — learner only builds stem + ending.
  const buildParts = fullParts.slice(1);
  const item = {
    lemma: exercise.target.lemma,
    parts: fullParts,
    buildParts,
    distractors: exercise.materials.distractors,
    form: exercise.materials.form,
    hint: exercise.materials.hint,
    translation: exercise.resolution.translation,
    answerParts: exercise.materials.answerParts,
  };
  state.nounsFilled = Array(buildParts.length).fill(null);
  state.nounsArticle = null;
  state.nounsChecked = false;
  state.nounsPluralRetryUsed = false;

  applyNounScaffoldingChrome(exercise);
  const legend = document.getElementById("nouns-legend");
  if (legend) legend.hidden = true;

  document.getElementById("nouns-prompt").innerHTML = `
    Plural of
    <strong>${item.lemma}</strong>
  `;

  const back = document.getElementById("nouns-back");
  if (back) back.disabled = state.nounsPluralIndex <= 0;

  const slots = document.getElementById("nouns-slots");
  slots.innerHTML = "";
  const tray = document.getElementById("nouns-tray");
  tray.innerHTML = "";

  const given = document.createElement("span");
  given.className = "slot-given";
  given.textContent = "die";
  given.title = "Nominative plural article — always die (number, not gender)";
  given.setAttribute("aria-label", "die, given");
  slots.appendChild(given);

  const snapCfg = {
    locked: () => state.nounsChecked,
    getFilled: () => state.nounsFilled,
    placeAt: (text, index) => placeNounPluralText(text, index),
    clearAt: (index) => clearNounPluralSlot(index),
    slotsRoot: slots,
    trayRoot: tray,
    indexOfSlot: indexFromSlotEl,
  };

  buildParts.forEach((_, i) => {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.dataset.index = String(i);
    slot.tabIndex = 0;
    slot.textContent = i === buildParts.length - 1 ? "Ending" : "Stem";
    slot.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (state.nounsFilled[i]) clearNounPluralSlot(i);
      }
    });
    bindSnapSlot(slot, i, snapCfg);
    slots.appendChild(slot);
  });

  orderPluralTrayLabels(buildParts, item.distractors).forEach((text, i) => {
    const piece = document.createElement("button");
    piece.type = "button";
    piece.className = "piece";
    applyChipGender(piece, text, false);
    piece.dataset.id = `np${i}`;
    piece.dataset.text = text;
    piece.textContent = text;
    if (text === "—") {
      piece.title = "No ending (plural same as singular)";
      piece.setAttribute("aria-label", "No ending — plural same as singular");
    }
    bindSnapTrayPiece(piece, text, snapCfg);
    tray.appendChild(piece);
  });
}

/** Tray order: stems → endings (not shuffled). No articles — die is given. Always include —. */
function orderPluralTrayLabels(buildParts, distractors) {
  const endingOrder = ["e", "en", "n", "er", "s", "—"];
  const endingSet = new Set(endingOrder);
  const articles = new Set(["der", "die", "das"]);
  const pool = new Set([...(buildParts || []), ...(distractors || []), "—"]);

  const stems = [...pool].filter(
    (t) => !articles.has(t) && !endingSet.has(t)
  );
  const endings = endingOrder.filter((t) => pool.has(t));
  for (const t of pool) {
    if (endingSet.has(t) || articles.has(t) || stems.includes(t)) continue;
    endings.push(t);
  }

  return [...stems, ...endings];
}

function placeArticle(id) {
  if (state.nounsChecked || !isNounArticleLikeMode()) return;
  const piece = document.querySelector(`#nouns-tray [data-id="${id}"]`);
  if (!piece || piece.disabled) return;

  document.querySelectorAll("#nouns-tray .piece").forEach((p) => {
    if (!p.disabled) p.classList.remove("is-placed");
  });

  state.nounsArticle = id === "insufficient" ? "insufficient" : id;
  piece.classList.add("is-placed");

  const slot = document.querySelector('#nouns-slots [data-slot="article"]');
  slot.classList.add("is-filled");
  const slotText = id === "insufficient" ? "?" : piece.dataset.text;
  applyChipGender(
    slot,
    id === "insufficient" ? "" : piece.dataset.text,
    !!state.currentExercise?.scaffolding?.showChoiceGenderColors &&
      id !== "insufficient"
  );
  slot.textContent = slotText;
  clearSelection();
  checkNounsArticles();
}

function clearArticleSlot() {
  if (state.nounsChecked || !isNounArticleLikeMode()) return;
  if (!state.nounsArticle) return;
  state.nounsArticle = null;
  document.querySelectorAll("#nouns-tray .piece").forEach((p) => {
    if (!p.disabled) p.classList.remove("is-placed");
  });
  const slot = document.querySelector('#nouns-slots [data-slot="article"]');
  if (slot) {
    slot.classList.remove("is-filled", "g-masc", "g-fem", "g-neut");
    slot.textContent = "Article";
  }
  clearSelection();
}

function placeNounPluralText(text, slotIndex) {
  if (state.nounsChecked) return;
  if (slotIndex < 0 || slotIndex >= state.nounsFilled.length) return;

  state.nounsFilled[slotIndex] = text;
  const slot = document.querySelector(
    `#nouns-slots [data-index="${slotIndex}"]`
  );
  if (slot) {
    slot.classList.add("is-filled");
    slot.classList.remove("is-ok", "is-bad");
    applyChipGender(slot, text, false);
    slot.textContent = text;
    slot.setAttribute("aria-label", `${text}, tap to remove`);
  }
  clearSelection();
  if (state.nounsFilled.every(Boolean)) checkNounsPlurals();
}

function clearNounPluralSlot(slotIndex) {
  if (state.nounsChecked) return;
  if (!state.nounsFilled[slotIndex]) return;
  state.nounsFilled[slotIndex] = null;
  const n = state.nounsFilled.length;
  const slot = document.querySelector(
    `#nouns-slots [data-index="${slotIndex}"]`
  );
  if (slot) {
    slot.classList.remove("is-filled", "is-ok", "is-bad", "g-masc", "g-fem", "g-neut");
    slot.textContent = slotIndex === n - 1 ? "Ending" : "Stem";
    slot.removeAttribute("aria-label");
  }
  clearSelection();
}

function clearNouns() {
  if (state.nounsChecked) return;
  if (state.nounsMode === "plurals") {
    const n = state.nounsFilled.length;
    state.nounsFilled = Array(n).fill(null);
    document.querySelectorAll("#nouns-slots .slot").forEach((s, i) => {
      s.classList.remove("is-filled", "is-ok", "is-bad", "g-masc", "g-fem", "g-neut");
      s.textContent = i === n - 1 ? "Ending" : "Stem";
      s.removeAttribute("aria-label");
    });
    clearSelection();
    return;
  }

  state.nounsArticle = null;
  document.querySelectorAll("#nouns-tray .piece").forEach((p) => {
    if (!p.disabled) p.classList.remove("is-placed");
  });
  const slot = document.querySelector('#nouns-slots [data-slot="article"]');
  if (slot) {
    slot.classList.remove("is-filled", "g-masc", "g-fem", "g-neut");
    slot.textContent = "Article";
  }
  clearSelection();
}

function clearNounsAdvance() {
  if (state.nounsAdvanceTimer) {
    clearTimeout(state.nounsAdvanceTimer);
    state.nounsAdvanceTimer = null;
  }
}

function scheduleNounsAdvance(delayMs = 1500) {
  clearNounsAdvance();
  state.nounsAdvanceTimer = setTimeout(() => {
    state.nounsAdvanceTimer = null;
    if (state.nounsMode === "plurals") state.nounsPluralIndex += 1;
    else if (state.nounsMode === "association")
      state.nounsAssociationIndex += 1;
    else if (state.nounsMode === "wugs") state.nounsWugIndex += 1;
    else state.nounsIndex += 1;
    renderNouns();
  }, delayMs);
}

function revealNounAnswer(exercise) {
  paintNounArticleLemma(exercise);

  // Wugs: no TTS for nonce words — show color-coded suffix + short note.
  if (exercise.target?.wug || state.nounsMode === "wugs") {
    const cue = exercise.materials.cue || exercise.prompt.cue;
    const gender = exercise.resolution.gender;
    const note =
      exercise.resolution.note ||
      exercise.materials.patternBlurb ||
      "";
    let wordHtml;
    if (cue) {
      const tint = articleColorClass(null, gender);
      wordHtml = `<span class="answer-wug-cue${tint ? ` ${tint}` : ""}">${cue}</span>`;
    } else {
      wordHtml = `<span class="answer-insufficient">insufficient information</span>`;
    }
    fillAnswerReveal("nouns", {
      word: cue || "insufficient information",
      wordHtml,
      parts: [],
      en: note,
      ok: true,
    });
    scheduleNounsAdvance(1600);
    return;
  }

  const art = exercise.resolution.article;
  const isInsufficient = art === "insufficient";
  const phrase = isInsufficient
    ? "insufficient information"
    : `${art} ${exercise.target.lemma}`;
  const parts = isInsufficient
    ? [{ text: "?", guide: "insufficient" }]
    : exercise.materials.answerParts || [
        { text: exercise.target.lemma, guide: exercise.target.lemma },
      ];
  const assisted = exercise.mode === "assisted";
  const wordHtml = isInsufficient
    ? `<span class="answer-insufficient">insufficient information</span>`
    : nounAnswerWordHtml(art, exercise.target.lemma, exercise.resolution.gender, {
        stem: exercise.prompt.stem,
        ending: exercise.prompt.ending,
        assisted,
      });
  const nodes = fillAnswerReveal("nouns", {
    word: phrase,
    wordHtml,
    parts,
    en: exercise.resolution.translation || "",
    ok: true,
  });
  const afterPlay = () => scheduleNounsAdvance(1500);

  if (isInsufficient || !window.speechSynthesis || !nodes.length) {
    afterPlay();
    return;
  }

  playKaraokeFlow(phrase, parts, nodes, {
    keepAdvance: true,
    onEnd: afterPlay,
    onError: afterPlay,
  });
}

function checkNounsArticles() {
  if (state.nounsChecked) return;
  const exercise =
    state.currentExercise ||
    (state.nounsMode === "association"
      ? currentNounAssociationExercise()
      : state.nounsMode === "wugs"
        ? currentNounWugExercise()
        : currentNounArticleExercise());
  if (!state.nounsArticle) return;

  const { evaluation, attempt, accepted, complete } = submitExerciseAttempt(
    exercise,
    { article: state.nounsArticle },
    { appVersion: "mock" }
  );
  state.attemptLog.push(attempt);

  if (state.nounsMode === "association") {
    recordFamilyAttempt(exercise.materials.patternId, accepted);
  }

  const chosen = document.querySelector(
    `#nouns-tray [data-id="${state.nounsArticle}"]`
  );

  if (!accepted) {
    if (chosen) {
      chosen.classList.add("is-bad");
      chosen.disabled = true;
      chosen.classList.remove("is-placed");
    }
    state.nounsArticle = null;
    const slot = document.querySelector('#nouns-slots [data-slot="article"]');
    slot.classList.remove("is-filled", "g-masc", "g-fem", "g-neut");
    slot.textContent = "Article";
    if (!complete && exercise.scaffolding.allowRetryWrongChoice) return;
  }

  state.nounsChecked = true;
  document.querySelectorAll("#nouns-tray .piece").forEach((p) => {
    p.disabled = true;
    if (p.dataset.id === exercise.resolution.article) p.classList.add("is-ok");
  });
  revealNounAnswer(exercise);
}

function checkNounsPlurals() {
  if (state.nounsChecked) return;
  const exercise = state.currentExercise || currentNounPluralExercise();
  if (state.nounsFilled.some((x) => !x)) return;

  const built = state.nounsFilled.slice();
  const partsForEval = ["die", ...built];
  const { evaluation, attempt, accepted } = submitExerciseAttempt(
    exercise,
    { parts: partsForEval },
    { appVersion: "mock" }
  );
  state.attemptLog.push(attempt);

  document.querySelectorAll("#nouns-slots .slot").forEach((slot, i) => {
    const fullIndex = i + 1; // skip given die
    const expected = exercise.materials.parts;
    const good =
      evaluation.slotMatch != null
        ? evaluation.slotMatch[fullIndex]
        : built[i] === expected[fullIndex];
    slot.classList.toggle("is-ok", !!good);
    slot.classList.toggle("is-bad", !good);
  });

  // Wrong: one second chance, then reveal the answer.
  if (
    !accepted &&
    exercise.scaffolding.allowRetryWrongChoice &&
    !state.nounsPluralRetryUsed
  ) {
    state.nounsPluralRetryUsed = true;
    window.setTimeout(() => {
      if (state.nounsChecked) return;
      clearNouns();
    }, 650);
    return;
  }

  state.nounsChecked = true;

  const phrase =
    evaluation.canonicalAnswers[0] ||
    `die ${joinNounPluralParts(exercise.materials.parts.slice(1))}`;
  const pluralForm =
    exercise.resolution.form ||
    joinNounPluralParts(exercise.materials.parts.slice(1));
  const parts = exercise.materials.answerParts || [
    { text: "die", guide: "dee" },
    { text: pluralForm, guide: pluralForm },
  ];
  const construction =
    exercise.resolution.parts || exercise.materials.parts;
  const nodes = fillAnswerReveal("nouns", {
    word: phrase,
    wordHtml: nounPluralAnswerWordHtml(construction),
    parts,
    en: exercise.resolution.translation || "",
    ok: accepted,
  });

  const afterPlay = () => scheduleNounsAdvance(1500);
  if (!window.speechSynthesis || !nodes.length) {
    afterPlay();
    return;
  }
  playKaraokeFlow(phrase, parts, nodes, {
    keepAdvance: true,
    onEnd: afterPlay,
    onError: afterPlay,
  });
}

/* —— Sounds —— */

/** Bumped on cancel so deferred speak() calls from a prior turn are dropped. */
let ttsSpeakGen = 0;
let ttsSpeakTimer = null;

/** iOS/iPadOS Safari clips utterance onsets if speak() follows cancel() too quickly. */
function isAppleTouchTTS() {
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  // iPadOS 13+ can report as Mac; treat touch Macs as Apple mobile TTS.
  return (
    navigator.platform === "MacIntel" &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1
  );
}

function stopSpeech({ keepAdvance = false } = {}) {
  ttsSpeakGen += 1;
  if (ttsSpeakTimer) {
    clearTimeout(ttsSpeakTimer);
    ttsSpeakTimer = null;
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    // Chrome can stick in paused/speaking-true after cancel; resume() can
    // re-clip the next onset on iOS — skip it there.
    if (!isAppleTouchTTS()) {
      try {
        window.speechSynthesis.resume();
      } catch (_) {
        /* ignore */
      }
    }
  }
  if (state.karaokeTimer) {
    clearTimeout(state.karaokeTimer);
    state.karaokeTimer = null;
  }
  (state.karaokeTimers || []).forEach(clearTimeout);
  state.karaokeTimers = [];
  document.querySelectorAll(".syl.is-active").forEach((el) => {
    el.classList.remove("is-active");
  });
  if (!keepAdvance) clearSoundsAdvance();
}

function assignGermanVoice(utterance) {
  const voices = window.speechSynthesis.getVoices();
  const de = voices.filter((v) => v.lang.toLowerCase().startsWith("de"));
  // Prefer non-Microsoft voices when present — MS voices often clip the onset on Chromium.
  const preferred =
    de.find((v) => /google/i.test(v.name)) ||
    de.find((v) => !/microsoft|desktop/i.test(v.name)) ||
    de[0];
  if (preferred) utterance.voice = preferred;
}

function assignEnglishVoice(utterance) {
  const voices = window.speechSynthesis.getVoices();
  const enList = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const en =
    enList.find((v) => /google/i.test(v.name) && /en-us/i.test(v.lang)) ||
    enList.find((v) => /en-us/i.test(v.lang)) ||
    enList.find((v) => /google/i.test(v.name)) ||
    enList[0];
  if (en) utterance.voice = en;
}

/**
 * Queue speak after cancel has fully settled. Desktop needs ~120ms; Apple
 * WebKit often still clips the first phoneme unless we wait for idle + ~300ms.
 */
function scheduleSpeak(speakFn, gen) {
  if (ttsSpeakTimer) clearTimeout(ttsSpeakTimer);

  const apple = isAppleTouchTTS();
  const settleMs = apple ? 300 : 120;
  const started = performance.now();

  const run = () => {
    ttsSpeakTimer = null;
    if (gen !== ttsSpeakGen) return;

    const synth = window.speechSynthesis;
    const busy = synth.speaking || synth.pending;
    // Wait out a lingering cancel on WebKit (cap so we never hang).
    if (busy && performance.now() - started < 600) {
      ttsSpeakTimer = setTimeout(run, 40);
      return;
    }

    const kick = () => {
      if (gen !== ttsSpeakGen) return;
      if (synth.getVoices().length) speakFn();
      else
        synth.addEventListener("voiceschanged", speakFn, {
          once: true,
        });
    };

    ttsSpeakTimer = setTimeout(() => {
      ttsSpeakTimer = null;
      kick();
    }, settleMs);
  };

  // Yield one frame so cancel() can apply before we poll speaking/pending.
  ttsSpeakTimer = setTimeout(run, apple ? 32 : 0);
}

function withUtterance(
  text,
  { rate = 0.9, lang = "de-DE", onStart, onEnd, onError } = {}
) {
  if (!window.speechSynthesis) {
    openSheet(
      "Audio",
      "<p>TTS unavailable on this device — visual reps still work.</p>"
    );
    return null;
  }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = rate;
  if (onStart) u.onstart = onStart;
  if (onEnd) u.onend = onEnd;
  if (onError) u.onerror = onError;

  const gen = ttsSpeakGen;
  const speak = () => {
    if (gen !== ttsSpeakGen) return;
    if (lang.toLowerCase().startsWith("de")) assignGermanVoice(u);
    else assignEnglishVoice(u);
    if (!isAppleTouchTTS()) {
      try {
        window.speechSynthesis.resume();
      } catch (_) {
        /* ignore */
      }
    }
    window.speechSynthesis.speak(u);
  };

  scheduleSpeak(speak, gen);
  return u;
}

function withGermanUtterance(text, opts = {}) {
  return withUtterance(text, { ...opts, lang: "de-DE" });
}

function speakGerman(text, rate = 0.9, onEnd) {
  stopSpeech({ keepAdvance: true });
  withUtterance(text, { rate, lang: "de-DE", onEnd });
}

function clearSoundsAdvance() {
  if (state.soundsAdvanceTimer) {
    clearTimeout(state.soundsAdvanceTimer);
    state.soundsAdvanceTimer = null;
  }
}

function scheduleSoundsAdvance(delayMs = 1400) {
  clearSoundsAdvance();
  state.soundsAdvanceTimer = setTimeout(() => {
    state.soundsAdvanceTimer = null;
    soundsContinue();
  }, delayMs);
}

/** Estimate utterance length; refine from prior onend measurements when available. */
function estimateUtteranceMs(text, rate) {
  const measured = state.ttsMsPerChar;
  if (measured && measured > 25 && measured < 180) {
    return Math.max(480, measured * text.length);
  }
  // ~11 German graphemes/sec at rate 1 for common browser voices (rough)
  const charsPerSec = 11 * rate;
  return Math.max(520, (text.length / charsPerSec) * 1000 + 140);
}

function setSoundsMode(mode) {
  stopSpeech();
  state.soundsMode = mode;
  state.soundsIndex = 0;
  state.soundsChoice = null;
  syncTerritoryMenu("sounds");
  if (state.phase.sounds === "practice") renderSounds();
}

function setSoundsDifficulty(difficulty) {
  state.soundsDifficulty = difficulty;
  syncTerritoryMenu("sounds");
  if (state.phase.sounds === "practice") renderSounds();
}

function currentSoundsItem() {
  if (state.soundsMode === "karaoke") {
    return soundKaraoke[state.soundsIndex % soundKaraoke.length];
  }
  return soundDiscriminate[state.soundsIndex % soundDiscriminate.length];
}

function openSheet(title, html) {
  const sheet = document.getElementById("app-sheet");
  document.getElementById("sheet-title").textContent = title;
  document.getElementById("sheet-body").innerHTML = html;
  sheet.hidden = false;
  bringOverlayFront(sheet);
  document.getElementById("sheet-close").focus();
}

function closeSheet() {
  const sheet = document.getElementById("app-sheet");
  sheet.hidden = true;
  sheet.style.zIndex = "";
}

function showSoundsHint() {
  const item = currentSoundsItem();
  openSheet("Hint", `<p>${item.hint}</p>`);
}

function showSoundsReference() {
  const item = currentSoundsItem();
  openSheet(
    item.reference?.title || "Reference",
    item.reference?.html || "<p>No reference for this item.</p>"
  );
}

function appendSoundsSupportActions(actions, extraButtons = []) {
  actions.append(
    ...extraButtons,
    actionBtn("Hint", showSoundsHint, "btn", null, false, "lightbulb"),
    actionBtn("Reference", showSoundsReference, "btn", null, false, "book")
  );
}

function soundsNavRow(backBtn, skipBtn, midButtons = []) {
  const row = document.createDocumentFragment();
  row.appendChild(backBtn);
  const mid = document.createElement("div");
  mid.className = "actions-mid";
  midButtons.forEach((b) => mid.appendChild(b));
  row.appendChild(mid);
  row.appendChild(skipBtn);
  return row;
}

function soundsBack() {
  if (state.soundsIndex <= 0) return;
  state.soundsIndex -= 1;
  renderSounds();
}

function soundsSkip() {
  state.soundsIndex += 1;
  renderSounds();
}

function soundsContinue() {
  state.soundsIndex += 1;
  renderSounds();
}

function renderSounds() {
  stopSpeech();
  state.soundsChoice = null;
  state.soundsChecked = false;
  closeSheet();
  syncTerritoryMenu("sounds");

  const prompt = document.getElementById("sounds-prompt");
  const help = document.getElementById("sounds-help");
  const reps = document.getElementById("sounds-reps");
  const playRow = document.getElementById("sounds-play-row");
  const reveal = document.getElementById("sounds-reveal");
  const karaoke = document.getElementById("sounds-karaoke");
  const choices = document.getElementById("sounds-choices");
  const actions = document.getElementById("sounds-actions");
  const assisted = state.soundsDifficulty === "assisted";

  reps.hidden = true;
  playRow.hidden = true;
  playRow.innerHTML = "";
  if (reveal) clearAnswerReveal("sounds");
  karaoke.hidden = true;
  karaoke.innerHTML = "";
  choices.hidden = true;
  choices.innerHTML = "";
  actions.innerHTML = "";
  actions.className = "actions actions-nav";
  help.hidden = true;
  help.textContent = "";
  help.className = "help-line";
  const stage = document.getElementById("sounds-stage");
  stage.dataset.mode = state.soundsMode;
  stage.dataset.difficulty = state.soundsDifficulty;

  const backBtn = actionBtn("Back", soundsBack, "btn", "sounds-back", false, "chevronLeft");
  backBtn.disabled = state.soundsIndex <= 0;

  if (state.soundsMode === "discriminate") {
    const skipBtn = actionBtn("Skip", soundsSkip, "btn", "sounds-skip", false, "chevronRight");
    const item =
      soundDiscriminate[state.soundsIndex % soundDiscriminate.length];
    prompt.textContent = item.prompt;

    playRow.hidden = false;
    playRow.appendChild(
      actionBtn("Play", () => speakGerman(item.play), "btn btn-primary play-btn")
    );

    choices.hidden = false;
    item.choices.forEach((c) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice";
      btn.dataset.id = c.id;
      btn.setAttribute("aria-pressed", "false");
      btn.innerHTML = assisted
        ? `${c.label}<span class="choice-sub">${c.sub}</span>`
        : c.label;
      btn.addEventListener("click", () => {
        if (state.soundsChecked) return;
        state.soundsChoice = c.id;
        checkSoundsDiscriminate(item);
      });
      choices.appendChild(btn);
    });

    const mid = [
      actionBtn("Hint", showSoundsHint, "btn", null, false, "lightbulb"),
      actionBtn("Reference", showSoundsReference, "btn", null, false, "book"),
    ];
    actions.appendChild(soundsNavRow(backBtn, skipBtn, mid));
    return;
  }

  if (state.soundsMode === "karaoke") {
    const nextBtn = actionBtn("Next", soundsSkip, "btn", "sounds-skip", false, "chevronRight");
    const item = soundKaraoke[state.soundsIndex % soundKaraoke.length];
    prompt.innerHTML = `<strong>${item.word}</strong>`;

    playRow.hidden = false;
    playRow.appendChild(
      actionBtn("Play", () => playKaraoke(item), "btn btn-primary play-btn")
    );

    karaoke.hidden = false;
    item.syllables.forEach((s) => {
      const chip = makeSylButton({
        ortho: s.text,
        guide: s.guide,
        stress: s.stress,
        say: s.text,
        ariaLabel: `Play syllable ${s.text}`,
      });
      if (!assisted) {
        const guide = chip.querySelector(".syl-guide");
        if (guide) guide.hidden = true;
      }
      karaoke.appendChild(chip);
    });

    const mid = [
      actionBtn("Hint", showSoundsHint, "btn", null, false, "lightbulb"),
      actionBtn("Reference", showSoundsReference, "btn", null, false, "book"),
    ];
    actions.appendChild(soundsNavRow(backBtn, nextBtn, mid));
  }
}

function actionBtn(label, onClick, className, id, hidden, icon) {
  const btn = document.createElement("button");
  btn.type = "button";
  if (icon) {
    btn.className = `${className} btn-icon`.trim();
    btn.innerHTML = biIcon(icon);
    btn.setAttribute("aria-label", label);
    btn.title = label;
  } else {
    btn.className = className;
    btn.textContent = label;
  }
  if (id) btn.id = id;
  if (hidden) btn.hidden = true;
  btn.addEventListener("click", onClick);
  return btn;
}

function checkSoundsDiscriminate(item) {
  if (!state.soundsChoice || state.soundsChecked) return;

  state.soundsChecked = true;
  const ok = state.soundsChoice === item.answer;
  const choices = document.getElementById("sounds-choices");

  choices.querySelectorAll(".choice").forEach((el) => {
    el.disabled = true;
    const id = el.dataset.id;
    el.setAttribute("aria-pressed", String(id === state.soundsChoice));
    if (id === item.answer) el.classList.add("is-ok");
    if (id === state.soundsChoice && !ok) el.classList.add("is-bad");
  });

  const playBtn = document.querySelector("#sounds-play-row button");
  if (playBtn) playBtn.disabled = true;

  const parts = item.parts || [{ text: item.play, guide: item.play }];
  const gloss = item.en || glossForDe(item.play);
  const nodes = fillAnswerReveal("sounds", {
    word: item.play,
    parts,
    en: gloss,
    ok,
  });

  const afterPlay = () => scheduleSoundsAdvance(1500);

  if (!window.speechSynthesis || !nodes.length) {
    afterPlay();
    return;
  }

  playKaraokeFlow(item.play, parts, nodes, {
    keepAdvance: true,
    onEnd: afterPlay,
    onError: afterPlay,
  });
}

function playKaraoke(item) {
  const nodes = [...document.querySelectorAll("#sounds-karaoke .syl")];
  playKaraokeFlow(item.tts, item.syllables, nodes);
}

/** Full-word TTS with flowing syllable highlight (chart examples + quiz Play word). */
function playKaraokeFlow(tts, syllables, nodes, opts = {}) {
  const { keepAdvance = false, onEnd, onError } = opts;
  stopSpeech({ keepAdvance });
  if (!nodes.length || !tts) {
    onError?.();
    return;
  }

  const rate = 0.7;
  const weights = syllables.map((s) =>
    Math.max(2, (s.text || "").length + (s.stress ? 1 : 0))
  );
  const totalW = weights.reduce((a, b) => a + b, 0);
  const estimated = estimateUtteranceMs(tts, rate);
  const timers = [];
  state.karaokeTimers = timers;

  const clearActive = () => {
    nodes.forEach((n) => n.classList.remove("is-active"));
  };

  const schedule = (totalMs) => {
    timers.forEach(clearTimeout);
    timers.length = 0;
    clearActive();
    let t = 60;
    const usable = Math.max(320, totalMs - 100);
    syllables.forEach((_, i) => {
      const slice = (weights[i] / totalW) * usable;
      const at = t;
      timers.push(
        setTimeout(() => {
          clearActive();
          nodes[i]?.classList.add("is-active");
        }, at)
      );
      t += slice;
    });
  };

  let startedAt = 0;
  let finished = false;
  const finish = (fn) => {
    if (finished) return;
    finished = true;
    fn?.();
  };

  withGermanUtterance(tts, {
    rate,
    onStart: () => {
      startedAt = performance.now();
      schedule(estimated);
    },
    onEnd: () => {
      const actual = Math.max(300, performance.now() - startedAt);
      state.ttsMsPerChar = actual / Math.max(1, tts.length);
      clearActive();
      nodes[nodes.length - 1]?.classList.add("is-active");
      timers.push(
        setTimeout(() => {
          clearActive();
          finish(onEnd);
        }, 320)
      );
    },
    onError: () => {
      clearActive();
      finish(onError || onEnd);
    },
  });
}

/* —— Menus / overlay stacking —— */

/** Last-opened overlay (menu chrome or sheet) gets the highest z-index. */
let overlaySeq = 40;

function nextOverlayZ() {
  overlaySeq += 1;
  return overlaySeq;
}

function bringOverlayFront(el) {
  if (!el) return;
  el.style.zIndex = String(nextOverlayZ());
}

function topbarEl() {
  return document.querySelector(".topbar");
}

function anyMenuOpen() {
  return [...document.querySelectorAll(".menu-panel")].some((p) => !p.hidden);
}

function closeAllMenus() {
  document.querySelectorAll(".menu-panel").forEach((panel) => {
    panel.hidden = true;
  });
  document.querySelectorAll(".brand-menu-btn, .territory-menu-btn").forEach((btn) => {
    btn.setAttribute("aria-expanded", "false");
  });
  const topbar = topbarEl();
  if (topbar && !anyMenuOpen()) {
    topbar.style.zIndex = "";
  }
}

function openMenuPanel(panel, btn) {
  closeAllMenus();
  panel.hidden = false;
  btn.setAttribute("aria-expanded", "true");
  // Raise whole topbar so dropdowns beat session panels + any open sheet (iOS).
  bringOverlayFront(topbarEl());
}

function wireMenus() {
  document.querySelectorAll(".brand-menu-btn, .territory-menu-btn").forEach((btn) => {
    if (btn.tagName !== "BUTTON") return;
    const menu = btn.closest(".menu");
    const panel = menu?.querySelector(".menu-panel");
    if (!panel) return;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = panel.hidden;
      if (willOpen) openMenuPanel(panel, btn);
      else closeAllMenus();
    });
  });

  document.querySelectorAll(".menu-panel").forEach((panel) => {
    panel.addEventListener("click", (e) => {
      // Keep open only for non-action clicks; action buttons close via handlers.
      if (e.target.closest("button")) closeAllMenus();
    });
  });

  document.addEventListener("click", () => closeAllMenus());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllMenus();
  });
}

/* —— wire UI —— */

function bind() {
  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      closeAllMenus();
      navigate(el.dataset.nav);
    });
  });

  wireMenus();

  document.getElementById("btn-switch-user")?.addEventListener("click", () => {
    closeAllMenus();
    openSheet(
      "Switch user",
      `<p>Profile switching will land here. For this prototype, you’re on the default local profile.</p>
       <ul>
         <li><strong>You</strong> — active</li>
         <li>Guest — coming soon</li>
       </ul>`
    );
  });

  document.getElementById("numbers-hint").addEventListener("click", () => {
    const ex = state.currentExercise || currentNumberExercise();
    openSheet("Hint", `<p>${ex.materials.hint}</p>`);
  });
  document.getElementById("numbers-ref-btn").addEventListener("click", () => {
    openSheet(
      "Reference",
      `<ul>
        <li>20–90 tens: zwanzig, dreißig, vierzig…</li>
        <li>Compound: ones + <em>und</em> + tens → vierundzwanzig</li>
        <li>Chips stay available — reuse a form when the number needs it twice</li>
      </ul>`
    );
  });
  document.getElementById("numbers-back").addEventListener("click", () => {
    clearNumbersAdvance();
    if (state.numbersIndex <= 0) return;
    state.numbersIndex -= 1;
    renderNumbers();
  });
  document.getElementById("numbers-skip").addEventListener("click", () => {
    clearNumbersAdvance();
    state.numbersIndex += 1;
    renderNumbers();
  });

  document.getElementById("nouns-hint").addEventListener("click", () => {
    if (state.nounsMode === "plurals") {
      const ex = state.currentExercise || currentNounPluralExercise();
      openSheet("Hint", `<p>${ex.materials.hint}</p>`);
      return;
    }
    if (state.nounsMode === "wugs") {
      const ex = state.currentExercise || currentNounWugExercise();
      openSheet("Hint", `<p>${ex.materials.hint}</p>`);
      return;
    }
    const ex =
      state.currentExercise ||
      (state.nounsMode === "association"
        ? currentNounAssociationExercise()
        : currentNounArticleExercise());
    const cue = ex.materials.cue || ex.prompt.cue;
    openSheet(
      "Hint",
      cue
        ? `<p>Nominative singular. Look at the ending <strong>${cue}</strong>.</p>`
        : `<p>${ex.materials.patternBlurb}</p>`
    );
  });
  document.getElementById("nouns-ref-btn").addEventListener("click", () => {
    if (state.nounsMode === "plurals") {
      openSheet(
        "Reference",
        `<ul>
          <li>Nominative plural always starts with <em>die</em> (given — number, not gender)</li>
          <li>Build the stem + ending: -en/-n, -e, -er, -s, or — (no change)</li>
          <li>Ending tendencies track the <em>singular</em> noun’s gender</li>
          <li>Umlaut is often lexical — use the stem chip as given</li>
        </ul>`
      );
      return;
    }
    if (state.nounsMode === "wugs") {
      openSheet(
        "Reference",
        `<ul>
          <li>Wugs test productive suffix → gender mapping</li>
          <li>Strong cues (-ung, -heit, -chen, -ling…) → pick der/die/das</li>
          <li>No strong cue → choose <strong>?</strong> (insufficient information)</li>
        </ul>`
      );
      return;
    }
    if (state.nounsMode === "association") {
      openSheet(
        "Reference",
        `<ul>
          <li>Same nominative-singular task as Articles, grouped by suffix family</li>
          <li>Aim ~80% on a family before plurals feel natural for that pattern</li>
          <li>This is a soft readiness signal — Plurals stays open</li>
        </ul>`
      );
      return;
    }
    const ex = state.currentExercise || currentNounArticleExercise();
    openSheet("Pattern", `<p>${ex.materials.patternBlurb}</p>`);
  });
  document.getElementById("nouns-back").addEventListener("click", () => {
    clearNounsAdvance();
    if (state.nounsMode === "plurals") {
      if (state.nounsPluralIndex <= 0) return;
      state.nounsPluralIndex -= 1;
    } else if (state.nounsMode === "association") {
      if (state.nounsAssociationIndex <= 0) return;
      state.nounsAssociationIndex -= 1;
    } else if (state.nounsMode === "wugs") {
      if (state.nounsWugIndex <= 0) return;
      state.nounsWugIndex -= 1;
    } else {
      if (state.nounsIndex <= 0) return;
      state.nounsIndex -= 1;
    }
    renderNouns();
  });
  document.getElementById("nouns-skip").addEventListener("click", () => {
    clearNounsAdvance();
    if (state.nounsMode === "plurals") state.nounsPluralIndex += 1;
    else if (state.nounsMode === "association")
      state.nounsAssociationIndex += 1;
    else if (state.nounsMode === "wugs") state.nounsWugIndex += 1;
    else state.nounsIndex += 1;
    renderNouns();
  });

  document.querySelectorAll("[data-numbers-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllMenus();
      clearNumbersAdvance();
      stopSpeech();
      state.numbersMode = btn.dataset.numbersMode;
      state.phase.numbers = "practice";
      showTerritoryPhase("numbers");
    });
  });

  document.querySelectorAll("[data-numbers-difficulty]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllMenus();
      clearNumbersAdvance();
      stopSpeech();
      state.numbersDifficulty = btn.dataset.numbersDifficulty;
      state.phase.numbers = "practice";
      showTerritoryPhase("numbers");
    });
  });

  document.querySelectorAll("[data-nouns-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllMenus();
      clearNounsAdvance();
      stopSpeech();
      state.nounsMode = btn.dataset.nounsMode;
      state.phase.nouns = "practice";
      showTerritoryPhase("nouns");
    });
  });

  document.querySelectorAll("[data-nouns-difficulty]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllMenus();
      clearNounsAdvance();
      stopSpeech();
      state.nounsDifficulty = btn.dataset.nounsDifficulty;
      state.phase.nouns = "practice";
      showTerritoryPhase("nouns");
    });
  });

  document.querySelectorAll("[data-sounds-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllMenus();
      setSoundsMode(btn.dataset.soundsMode);
      state.phase.sounds = "practice";
      showTerritoryPhase("sounds");
    });
  });

  document.querySelectorAll("[data-sounds-difficulty]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllMenus();
      setSoundsDifficulty(btn.dataset.soundsDifficulty);
      state.phase.sounds = "practice";
      showTerritoryPhase("sounds");
    });
  });

  document.querySelectorAll("[data-show-briefing]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllMenus();
      const id = btn.dataset.showBriefing;
      if (state.phase[id] === "practice") {
        state.preservePractice[id] = true;
      }
      state.phase[id] = "briefing";
      if (state.view !== id) navigate(id, { keepPhase: true });
      else showTerritoryPhase(id);
    });
  });

  document.querySelectorAll("[data-open-chart]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllMenus();
      const id = btn.dataset.openChart;
      if (state.phase[id] === "practice") {
        state.preservePractice[id] = true;
      }
      state.phase[id] = "chart";
      if (state.view !== id) navigate(id, { keepPhase: true });
      else showTerritoryPhase(id);
    });
  });

  document.getElementById("sheet-close").addEventListener("click", closeSheet);
  document.getElementById("sheet-backdrop").addEventListener("click", closeSheet);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSheet();
  });

  window.addEventListener("hashchange", () => {
    const h = location.hash.replace("#", "") || "hub";
    if (["hub", "numbers", "nouns", "sounds"].includes(h)) navigate(h);
  });
}

renderHub();
bind();
hydrateIconButtons();
if (location.hash === "#numbers") navigate("numbers");
else if (location.hash === "#nouns") navigate("nouns");
else if (location.hash === "#sounds") navigate("sounds");
