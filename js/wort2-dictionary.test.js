import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDictionaryCard,
  formatDictionaryCitation,
  dictionaryRevealFlags,
} from './wort2-dictionary.js';

describe('wort2-dictionary', () => {
  const noun = {
    pos: 'noun',
    domain: 'nouns',
    word: 'Zeitung',
    trait: 'die',
    meaning: 'newspaper',
    pluralForm: 'Zeitungen',
    pluralEnding: 'en',
  };

  const prep = {
    pos: 'prep',
    domain: 'case',
    word: 'mit',
    trait: 'Dat',
    meaning: 'with',
  };

  const verb = {
    pos: 'verb',
    domain: 'case',
    word: 'sehen',
    trait: 'Akk',
    meaning: 'to see',
  };

  it('sorting non-learning: bare lemma only', () => {
    const card = buildDictionaryCard(noun, { full: false, revealAnswer: false });
    assert.equal(card.citation, 'Zeitung');
    assert.equal(card.bullets.length, 0);
  });

  it('nouns after Check: Lemma, art; genitive, plural', () => {
    const card = buildDictionaryCard(noun, { full: true, revealAnswer: true });
    assert.equal(card.citation, 'Zeitung, die; -, -en');
    assert.ok(card.bullets.some((b) => b.startsWith('die:')));
    assert.equal(card.showTraitPill, false);
  });

  it('nouns Learning while sorting: bare lemma (gender is the answer)', () => {
    const flags = dictionaryRevealFlags(noun, { full: true, revealAnswer: false });
    assert.equal(flags.article, false);
    assert.equal(flags.plural, false);
    assert.equal(formatDictionaryCitation(noun, flags), 'Zeitung');
  });

  it('plurals Learning while sorting: article ok, no plural ending', () => {
    const pl = { ...noun, domain: 'plurals', trait: '+en', genderArticle: 'die' };
    const flags = dictionaryRevealFlags(pl, { full: true, revealAnswer: false });
    assert.equal(flags.article, true);
    assert.equal(flags.plural, false);
    // Article + conventional feminine genitive; plural ending withheld.
    assert.equal(formatDictionaryCitation(pl, flags), 'Zeitung, die; -');
  });

  it('prep after Check: Präp. mit Dat.', () => {
    const card = buildDictionaryCard(prep, { full: true, revealAnswer: true });
    assert.equal(card.citation, 'mit <Präp. mit Dat.>');
    assert.equal(card.showTraitPill, false);
  });

  it('verb after Check: V. mit Akk.', () => {
    const card = buildDictionaryCard(verb, { full: true, revealAnswer: true });
    assert.equal(card.citation, 'sehen <V. mit Akk.>');
  });

  it('case Learning while sorting: no case governance', () => {
    const flags = dictionaryRevealFlags(prep, { full: true, revealAnswer: false });
    assert.equal(flags.caseGov, false);
    assert.equal(formatDictionaryCitation(prep, flags), 'mit');
  });
});
