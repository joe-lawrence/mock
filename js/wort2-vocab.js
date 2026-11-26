/**
 * WortMatch vocab corpus + pack/compound enrichment.
 * Edit here instead of wort2.html.
 */
export const VOCAB_CORE = [
      // --- NOUN GENDER: FEMININE (die) ---
      { id: 'vocab.nouns.zeitung', domain: 'nouns', pos: 'noun', word: 'Zeitung', trait: 'die', meaning: 'newspaper', note: '-ung suffix → feminine', initialScore: 0 },
      { id: 'vocab.nouns.wohnung', domain: 'nouns', pos: 'noun', word: 'Wohnung', trait: 'die', meaning: 'apartment / flat', note: '-ung suffix → feminine', initialScore: 3 },
      { id: 'vocab.nouns.rechnung', domain: 'nouns', pos: 'noun', word: 'Rechnung', trait: 'die', meaning: 'bill / invoice', note: '-ung suffix → feminine', initialScore: 6 },
      { id: 'vocab.nouns.meinung', domain: 'nouns', pos: 'noun', word: 'Meinung', trait: 'die', meaning: 'opinion', note: '-ung suffix → feminine', initialScore: 0 },
      { id: 'vocab.nouns.pruefung', domain: 'nouns', pos: 'noun', word: 'Prüfung', trait: 'die', meaning: 'exam / test', note: '-ung suffix → feminine', initialScore: 3 },
      { id: 'vocab.nouns.gesundheit', domain: 'nouns', pos: 'noun', word: 'Gesundheit', trait: 'die', meaning: 'health', note: '-heit suffix → feminine', initialScore: 6 },
      { id: 'vocab.nouns.freundlichkeit', domain: 'nouns', pos: 'noun', word: 'Freundlichkeit', trait: 'die', meaning: 'friendliness', note: '-keit suffix → feminine', initialScore: 0 },
      { id: 'vocab.nouns.mannschaft', domain: 'nouns', pos: 'noun', word: 'Mannschaft', trait: 'die', meaning: 'team', note: '-schaft suffix → feminine', initialScore: 3 },
      { id: 'vocab.nouns.tradition', domain: 'nouns', pos: 'noun', word: 'Tradition', trait: 'die', meaning: 'tradition', note: '-ion suffix → feminine', initialScore: 6 },
      { id: 'vocab.nouns.sonnenblume', domain: 'nouns', pos: 'noun', word: 'Sonnenblume', trait: 'die', meaning: 'sunflower', note: 'Plants/flowers → feminine', initialScore: 3 },
      { id: 'vocab.nouns.aktion', domain: 'nouns', pos: 'noun', word: 'Aktion', trait: 'die', meaning: 'special offer', note: '-ion suffix → feminine', initialScore: 0 },
      { id: 'vocab.nouns.bedeutung', domain: 'nouns', pos: 'noun', word: 'Bedeutung', trait: 'die', meaning: 'meaning', note: '-ung suffix → feminine', initialScore: 3 },
      { id: 'vocab.nouns.bewegung', domain: 'nouns', pos: 'noun', word: 'Bewegung', trait: 'die', meaning: 'movement', note: '-ung suffix → feminine', initialScore: 0 },
      { id: 'vocab.nouns.botschaft', domain: 'nouns', pos: 'noun', word: 'Botschaft', trait: 'die', meaning: 'message', note: '-schaft suffix → feminine', initialScore: 3 },
      { id: 'vocab.nouns.diskussion', domain: 'nouns', pos: 'noun', word: 'Diskussion', trait: 'die', meaning: 'discussion', note: '-ion suffix → feminine', initialScore: 6 },
      { id: 'vocab.nouns.ehrlichkeit', domain: 'nouns', pos: 'noun', word: 'Ehrlichkeit', trait: 'die', meaning: 'honesty', note: '-keit suffix → feminine', initialScore: 0 },
      { id: 'vocab.nouns.einheit', domain: 'nouns', pos: 'noun', word: 'Einheit', trait: 'die', meaning: 'unit / unity', note: '-heit suffix → feminine', initialScore: 3 },
      { id: 'vocab.nouns.einladung', domain: 'nouns', pos: 'noun', word: 'Einladung', trait: 'die', meaning: 'invitation', note: '-ung suffix → feminine', initialScore: 6 },
      { id: 'vocab.nouns.erfahrung', domain: 'nouns', pos: 'noun', word: 'Erfahrung', trait: 'die', meaning: 'experience', note: '-ung suffix → feminine', initialScore: 0 },
      { id: 'vocab.nouns.erzaehlung', domain: 'nouns', pos: 'noun', word: 'Erzählung', trait: 'die', meaning: 'story / narrative', note: '-ung suffix → feminine', initialScore: 3 },
      { id: 'vocab.nouns.faehigkeit', domain: 'nouns', pos: 'noun', word: 'Fähigkeit', trait: 'die', meaning: 'ability', note: '-keit suffix → feminine', initialScore: 0 },
      { id: 'vocab.nouns.freiheit', domain: 'nouns', pos: 'noun', word: 'Freiheit', trait: 'die', meaning: 'freedom', note: '-heit suffix → feminine', initialScore: 6 },
      { id: 'vocab.nouns.freundschaft', domain: 'nouns', pos: 'noun', word: 'Freundschaft', trait: 'die', meaning: 'friendship', note: '-schaft suffix → feminine', initialScore: 3 },
      { id: 'vocab.nouns.geschwindigkeit', domain: 'nouns', pos: 'noun', word: 'Geschwindigkeit', trait: 'die', meaning: 'speed', note: '-keit suffix → feminine', initialScore: 0 },
      { id: 'vocab.nouns.gesellschaft', domain: 'nouns', pos: 'noun', word: 'Gesellschaft', trait: 'die', meaning: 'society / company', note: '-schaft suffix → feminine', initialScore: 3 },
      { id: 'vocab.nouns.hoffnung', domain: 'nouns', pos: 'noun', word: 'Hoffnung', trait: 'die', meaning: 'hope', note: '-ung suffix → feminine', initialScore: 6 },
      { id: 'vocab.nouns.information', domain: 'nouns', pos: 'noun', word: 'Information', trait: 'die', meaning: 'information', note: '-ion suffix → feminine', initialScore: 6 },
      { id: 'vocab.nouns.klarheit', domain: 'nouns', pos: 'noun', word: 'Klarheit', trait: 'die', meaning: 'clarity', note: '-heit suffix → feminine', initialScore: 0 },
      { id: 'vocab.nouns.krankheit', domain: 'nouns', pos: 'noun', word: 'Krankheit', trait: 'die', meaning: 'illness', note: '-heit suffix → feminine', initialScore: 3 },
      { id: 'vocab.nouns.landschaft', domain: 'nouns', pos: 'noun', word: 'Landschaft', trait: 'die', meaning: 'landscape', note: '-schaft suffix → feminine', initialScore: 3 },
      { id: 'vocab.nouns.loesung', domain: 'nouns', pos: 'noun', word: 'Lösung', trait: 'die', meaning: 'solution', note: '-ung suffix → feminine', initialScore: 6 },
      { id: 'vocab.nouns.million', domain: 'nouns', pos: 'noun', word: 'Million', trait: 'die', meaning: 'million', note: '-ion suffix → feminine', initialScore: 6 },
      { id: 'vocab.nouns.moeglichkeit', domain: 'nouns', pos: 'noun', word: 'Möglichkeit', trait: 'die', meaning: 'possibility', note: '-keit suffix → feminine', initialScore: 0 },
      { id: 'vocab.nouns.nation', domain: 'nouns', pos: 'noun', word: 'Nation', trait: 'die', meaning: 'nation', note: '-ion suffix → feminine', initialScore: 3 },
      { id: 'vocab.nouns.partnerschaft', domain: 'nouns', pos: 'noun', word: 'Partnerschaft', trait: 'die', meaning: 'partnership', note: '-schaft suffix → feminine', initialScore: 0 },
      { id: 'vocab.nouns.region', domain: 'nouns', pos: 'noun', word: 'Region', trait: 'die', meaning: 'region', note: '-ion suffix → feminine', initialScore: 3 },
      { id: 'vocab.nouns.richtung', domain: 'nouns', pos: 'noun', word: 'Richtung', trait: 'die', meaning: 'direction', note: '-ung suffix → feminine', initialScore: 3 },
      { id: 'vocab.nouns.schoenheit', domain: 'nouns', pos: 'noun', word: 'Schönheit', trait: 'die', meaning: 'beauty', note: '-heit suffix → feminine', initialScore: 0 },
      { id: 'vocab.nouns.schwierigkeit', domain: 'nouns', pos: 'noun', word: 'Schwierigkeit', trait: 'die', meaning: 'difficulty', note: '-keit suffix → feminine', initialScore: 0 },
      { id: 'vocab.nouns.sicherheit', domain: 'nouns', pos: 'noun', word: 'Sicherheit', trait: 'die', meaning: 'safety / security', note: '-heit suffix → feminine', initialScore: 3 },
      { id: 'vocab.nouns.situation', domain: 'nouns', pos: 'noun', word: 'Situation', trait: 'die', meaning: 'situation', note: '-ion suffix → feminine', initialScore: 6 },
      { id: 'vocab.nouns.station', domain: 'nouns', pos: 'noun', word: 'Station', trait: 'die', meaning: 'stop / ward', note: '-ion suffix → feminine', initialScore: 3 },
      { id: 'vocab.nouns.uebung', domain: 'nouns', pos: 'noun', word: 'Übung', trait: 'die', meaning: 'exercise / practice', note: '-ung suffix → feminine', initialScore: 6 },
      { id: 'vocab.nouns.wahrheit', domain: 'nouns', pos: 'noun', word: 'Wahrheit', trait: 'die', meaning: 'truth', note: '-heit suffix → feminine', initialScore: 3 },
      { id: 'vocab.nouns.wirklichkeit', domain: 'nouns', pos: 'noun', word: 'Wirklichkeit', trait: 'die', meaning: 'reality', note: '-keit suffix → feminine', initialScore: 0 },
      { id: 'vocab.nouns.wirtschaft', domain: 'nouns', pos: 'noun', word: 'Wirtschaft', trait: 'die', meaning: 'economy', note: '-schaft suffix → feminine', initialScore: 3 },
      { id: 'vocab.nouns.wissenschaft', domain: 'nouns', pos: 'noun', word: 'Wissenschaft', trait: 'die', meaning: 'science', note: '-schaft suffix → feminine', initialScore: 0 },
      { id: 'vocab.nouns.lilie', domain: 'nouns', pos: 'noun', word: 'Lilie', trait: 'die', meaning: 'lily', note: 'Flowers → feminine', initialScore: 0 },
      { id: 'vocab.nouns.narzisse', domain: 'nouns', pos: 'noun', word: 'Narzisse', trait: 'die', meaning: 'daffodil', note: 'Flowers → feminine', initialScore: 0 },
      { id: 'vocab.nouns.nelke', domain: 'nouns', pos: 'noun', word: 'Nelke', trait: 'die', meaning: 'carnation', note: 'Flowers → feminine', initialScore: 3 },
      { id: 'vocab.nouns.orchidee', domain: 'nouns', pos: 'noun', word: 'Orchidee', trait: 'die', meaning: 'orchid', note: 'Flowers → feminine', initialScore: 0 },
      { id: 'vocab.nouns.rose', domain: 'nouns', pos: 'noun', word: 'Rose', trait: 'die', meaning: 'rose', note: 'Flowers → feminine', initialScore: 6 },
      { id: 'vocab.nouns.tulpe', domain: 'nouns', pos: 'noun', word: 'Tulpe', trait: 'die', meaning: 'tulip', note: 'Flowers → feminine', initialScore: 3 },

      // --- NOUN GENDER: MASCULINE (der) ---
      { id: 'vocab.nouns.lehrer', domain: 'nouns', pos: 'noun', word: 'Lehrer', trait: 'der', meaning: 'teacher', note: '-er agent suffix → masculine', initialScore: 0 },
      { id: 'vocab.nouns.lehrerin', domain: 'nouns', pos: 'noun', word: 'Lehrerin', trait: 'die', meaning: 'female teacher', note: '-in feminine agent → feminine', initialScore: 0 },
      { id: 'vocab.nouns.schuelerin', domain: 'nouns', pos: 'noun', word: 'Schülerin', trait: 'die', meaning: 'female pupil', note: '-in feminine agent → feminine', initialScore: 0 },
      { id: 'vocab.nouns.aerztin', domain: 'nouns', pos: 'noun', word: 'Ärztin', trait: 'die', meaning: 'female doctor', note: '-in feminine agent → feminine', initialScore: 0 },
      { id: 'vocab.nouns.koechin', domain: 'nouns', pos: 'noun', word: 'Köchin', trait: 'die', meaning: 'female cook / chef', note: '-in feminine agent → feminine', initialScore: 0 },
      { id: 'vocab.nouns.mann', domain: 'nouns', pos: 'noun', word: 'Mann', trait: 'der', meaning: 'man', note: 'People → masculine', initialScore: 6 },
      { id: 'vocab.nouns.frau', domain: 'nouns', pos: 'noun', word: 'Frau', trait: 'die', meaning: 'woman', note: 'People → feminine', initialScore: 6 },
      { id: 'vocab.nouns.kind', domain: 'nouns', pos: 'noun', word: 'Kind', trait: 'das', meaning: 'child', note: 'Young people / -kind → neuter', initialScore: 6 },
      { id: 'vocab.nouns.junge', domain: 'nouns', pos: 'noun', word: 'Junge', trait: 'der', meaning: 'boy', note: 'People → masculine', initialScore: 3 },
      { id: 'vocab.nouns.freund', domain: 'nouns', pos: 'noun', word: 'Freund', trait: 'der', meaning: 'friend (male)', note: 'People → masculine', initialScore: 3 },
      { id: 'vocab.nouns.freundin', domain: 'nouns', pos: 'noun', word: 'Freundin', trait: 'die', meaning: 'friend (female)', note: '-in feminine agent → feminine', initialScore: 3 },
      { id: 'vocab.nouns.tourist', domain: 'nouns', pos: 'noun', word: 'Tourist', trait: 'der', meaning: 'tourist', note: '-ist suffix → masculine', initialScore: 0 },
      { id: 'vocab.nouns.touristin', domain: 'nouns', pos: 'noun', word: 'Touristin', trait: 'die', meaning: 'female tourist', note: '-in feminine agent → feminine', initialScore: 0 },
      { id: 'vocab.nouns.polizist', domain: 'nouns', pos: 'noun', word: 'Polizist', trait: 'der', meaning: 'police officer', note: '-ist suffix → masculine', initialScore: 0 },
      { id: 'vocab.nouns.polizistin', domain: 'nouns', pos: 'noun', word: 'Polizistin', trait: 'die', meaning: 'female police officer', note: '-in feminine agent → feminine', initialScore: 0 },

      { id: 'vocab.nouns.fahrer', domain: 'nouns', pos: 'noun', word: 'Fahrer', trait: 'der', meaning: 'driver', note: '-er agent suffix → masculine', initialScore: 3 },
      { id: 'vocab.nouns.baecker', domain: 'nouns', pos: 'noun', word: 'Bäcker', trait: 'der', meaning: 'baker', note: '-er agent suffix → masculine', initialScore: 6 },
      { id: 'vocab.nouns.schmetterling', domain: 'nouns', pos: 'noun', word: 'Schmetterling', trait: 'der', meaning: 'butterfly', note: '-ling suffix → masculine', initialScore: 0 },
      { id: 'vocab.nouns.zwilling', domain: 'nouns', pos: 'noun', word: 'Zwilling', trait: 'der', meaning: 'twin', note: '-ling suffix → masculine', initialScore: 3 },
      { id: 'vocab.nouns.montag', domain: 'nouns', pos: 'noun', word: 'Montag', trait: 'der', meaning: 'Monday', note: 'Days of week → masculine', initialScore: 6 },
      { id: 'vocab.nouns.sturm', domain: 'nouns', pos: 'noun', word: 'Sturm', trait: 'der', meaning: 'storm', note: 'Weather phenomena → masculine', initialScore: 3 },
      { id: 'vocab.nouns.kellner', domain: 'nouns', pos: 'noun', word: 'Kellner', trait: 'der', meaning: 'waiter', note: '-er agent suffix → masculine', initialScore: 6 },
      { id: 'vocab.nouns.arbeiter', domain: 'nouns', pos: 'noun', word: 'Arbeiter', trait: 'der', meaning: 'worker', note: '-er agent suffix → masculine', initialScore: 3 },
      { id: 'vocab.nouns.dezember', domain: 'nouns', pos: 'noun', word: 'Dezember', trait: 'der', meaning: 'December', note: 'Months → masculine', initialScore: 6 },
      { id: 'vocab.nouns.donner', domain: 'nouns', pos: 'noun', word: 'Donner', trait: 'der', meaning: 'thunder', note: 'Weather phenomena → masculine', initialScore: 0 },
      { id: 'vocab.nouns.fluechtling', domain: 'nouns', pos: 'noun', word: 'Flüchtling', trait: 'der', meaning: 'refugee', note: '-ling suffix → masculine', initialScore: 0 },
      { id: 'vocab.nouns.fruehling', domain: 'nouns', pos: 'noun', word: 'Frühling', trait: 'der', meaning: 'spring (season)', note: 'Seasons & -ling → masculine', initialScore: 3 },
      { id: 'vocab.nouns.gaertner', domain: 'nouns', pos: 'noun', word: 'Gärtner', trait: 'der', meaning: 'gardener', note: '-er agent suffix → masculine', initialScore: 3 },
      { id: 'vocab.nouns.journalismus', domain: 'nouns', pos: 'noun', word: 'Journalismus', trait: 'der', meaning: 'journalism', note: '-ismus suffix → masculine', initialScore: 0 },
      { id: 'vocab.nouns.kapitalismus', domain: 'nouns', pos: 'noun', word: 'Kapitalismus', trait: 'der', meaning: 'capitalism', note: '-ismus suffix → masculine', initialScore: 0 },
      { id: 'vocab.nouns.lehrling', domain: 'nouns', pos: 'noun', word: 'Lehrling', trait: 'der', meaning: 'apprentice', note: '-ling suffix → masculine', initialScore: 3 },
      { id: 'vocab.nouns.liebling', domain: 'nouns', pos: 'noun', word: 'Liebling', trait: 'der', meaning: 'favorite / darling', note: '-ling suffix → masculine', initialScore: 3 },
      { id: 'vocab.nouns.november', domain: 'nouns', pos: 'noun', word: 'November', trait: 'der', meaning: 'November', note: 'Months → masculine', initialScore: 6 },
      { id: 'vocab.nouns.oktober', domain: 'nouns', pos: 'noun', word: 'Oktober', trait: 'der', meaning: 'October', note: 'Months → masculine', initialScore: 6 },
      { id: 'vocab.nouns.optimismus', domain: 'nouns', pos: 'noun', word: 'Optimismus', trait: 'der', meaning: 'optimism', note: '-ismus suffix → masculine', initialScore: 0 },
      { id: 'vocab.nouns.partner', domain: 'nouns', pos: 'noun', word: 'Partner', trait: 'der', meaning: 'partner', note: '-er suffix → masculine', initialScore: 6 },
      { id: 'vocab.nouns.rentner', domain: 'nouns', pos: 'noun', word: 'Rentner', trait: 'der', meaning: 'retiree', note: '-er agent suffix → masculine', initialScore: 3 },
      { id: 'vocab.nouns.schueler', domain: 'nouns', pos: 'noun', word: 'Schüler', trait: 'der', meaning: 'student / pupil', note: '-er agent suffix → masculine', initialScore: 6 },
      { id: 'vocab.nouns.september', domain: 'nouns', pos: 'noun', word: 'September', trait: 'der', meaning: 'September', note: 'Months → masculine', initialScore: 6 },
      { id: 'vocab.nouns.sommer', domain: 'nouns', pos: 'noun', word: 'Sommer', trait: 'der', meaning: 'summer', note: 'Seasons → masculine', initialScore: 6 },
      { id: 'vocab.nouns.tourismus', domain: 'nouns', pos: 'noun', word: 'Tourismus', trait: 'der', meaning: 'tourism', note: '-ismus suffix → masculine', initialScore: 3 },
      { id: 'vocab.nouns.verkaeufer', domain: 'nouns', pos: 'noun', word: 'Verkäufer', trait: 'der', meaning: 'salesperson', note: '-er agent suffix → masculine', initialScore: 3 },
      { id: 'vocab.nouns.winter', domain: 'nouns', pos: 'noun', word: 'Winter', trait: 'der', meaning: 'winter', note: 'Seasons → masculine', initialScore: 6 },
      { id: 'vocab.nouns.april', domain: 'nouns', pos: 'noun', word: 'April', trait: 'der', meaning: 'April', note: 'Months → masculine', initialScore: 6 },
      { id: 'vocab.nouns.arzt', domain: 'nouns', pos: 'noun', word: 'Arzt', trait: 'der', meaning: 'doctor', note: 'Male professions → masculine', initialScore: 6 },
      { id: 'vocab.nouns.august', domain: 'nouns', pos: 'noun', word: 'August', trait: 'der', meaning: 'August', note: 'Months → masculine', initialScore: 6 },
      { id: 'vocab.nouns.dienstag', domain: 'nouns', pos: 'noun', word: 'Dienstag', trait: 'der', meaning: 'Tuesday', note: 'Days of week → masculine', initialScore: 6 },
      { id: 'vocab.nouns.donnerstag', domain: 'nouns', pos: 'noun', word: 'Donnerstag', trait: 'der', meaning: 'Thursday', note: 'Days of week → masculine', initialScore: 3 },
      { id: 'vocab.nouns.februar', domain: 'nouns', pos: 'noun', word: 'Februar', trait: 'der', meaning: 'February', note: 'Months → masculine', initialScore: 6 },
      { id: 'vocab.nouns.freitag', domain: 'nouns', pos: 'noun', word: 'Freitag', trait: 'der', meaning: 'Friday', note: 'Days of week → masculine', initialScore: 6 },
      { id: 'vocab.nouns.frost', domain: 'nouns', pos: 'noun', word: 'Frost', trait: 'der', meaning: 'frost', note: 'Weather phenomena → masculine', initialScore: 0 },
      { id: 'vocab.nouns.hagel', domain: 'nouns', pos: 'noun', word: 'Hagel', trait: 'der', meaning: 'hail', note: 'Weather phenomena → masculine', initialScore: 0 },
      { id: 'vocab.nouns.herbst', domain: 'nouns', pos: 'noun', word: 'Herbst', trait: 'der', meaning: 'autumn / fall', note: 'Seasons → masculine', initialScore: 3 },
      { id: 'vocab.nouns.januar', domain: 'nouns', pos: 'noun', word: 'Januar', trait: 'der', meaning: 'January', note: 'Months → masculine', initialScore: 6 },
      { id: 'vocab.nouns.juli', domain: 'nouns', pos: 'noun', word: 'Juli', trait: 'der', meaning: 'July', note: 'Months → masculine', initialScore: 6 },
      { id: 'vocab.nouns.juni', domain: 'nouns', pos: 'noun', word: 'Juni', trait: 'der', meaning: 'June', note: 'Months → masculine', initialScore: 6 },
      { id: 'vocab.nouns.koch', domain: 'nouns', pos: 'noun', word: 'Koch', trait: 'der', meaning: 'cook / chef', note: 'Male professions → masculine', initialScore: 3 },
      { id: 'vocab.nouns.mai', domain: 'nouns', pos: 'noun', word: 'Mai', trait: 'der', meaning: 'May', note: 'Months → masculine', initialScore: 6 },
      { id: 'vocab.nouns.maerz', domain: 'nouns', pos: 'noun', word: 'März', trait: 'der', meaning: 'March', note: 'Months → masculine', initialScore: 3 },
      { id: 'vocab.nouns.mittwoch', domain: 'nouns', pos: 'noun', word: 'Mittwoch', trait: 'der', meaning: 'Wednesday', note: 'Days of week → masculine', initialScore: 3 },
      { id: 'vocab.nouns.nebel', domain: 'nouns', pos: 'noun', word: 'Nebel', trait: 'der', meaning: 'fog', note: 'Weather phenomena → masculine', initialScore: 0 },
      { id: 'vocab.nouns.norden', domain: 'nouns', pos: 'noun', word: 'Norden', trait: 'der', meaning: 'north', note: 'Compass directions → masculine', initialScore: 3 },
      { id: 'vocab.nouns.osten', domain: 'nouns', pos: 'noun', word: 'Osten', trait: 'der', meaning: 'east', note: 'Compass directions → masculine', initialScore: 3 },
      { id: 'vocab.nouns.regen', domain: 'nouns', pos: 'noun', word: 'Regen', trait: 'der', meaning: 'rain', note: 'Weather phenomena → masculine', initialScore: 6 },
      { id: 'vocab.nouns.samstag', domain: 'nouns', pos: 'noun', word: 'Samstag', trait: 'der', meaning: 'Saturday', note: 'Days of week → masculine', initialScore: 6 },
      { id: 'vocab.nouns.schnee', domain: 'nouns', pos: 'noun', word: 'Schnee', trait: 'der', meaning: 'snow', note: 'Weather phenomena → masculine', initialScore: 6 },
      { id: 'vocab.nouns.sonntag', domain: 'nouns', pos: 'noun', word: 'Sonntag', trait: 'der', meaning: 'Sunday', note: 'Days of week → masculine', initialScore: 6 },
      { id: 'vocab.nouns.sueden', domain: 'nouns', pos: 'noun', word: 'Süden', trait: 'der', meaning: 'south', note: 'Compass directions → masculine', initialScore: 3 },
      { id: 'vocab.nouns.westen', domain: 'nouns', pos: 'noun', word: 'Westen', trait: 'der', meaning: 'west', note: 'Compass directions → masculine', initialScore: 3 },
      { id: 'vocab.nouns.wind', domain: 'nouns', pos: 'noun', word: 'Wind', trait: 'der', meaning: 'wind', note: 'Weather phenomena → masculine', initialScore: 6 },

      // --- NOUN GENDER: NEUTER (das) ---
      { id: 'vocab.nouns.kaetzchen', domain: 'nouns', pos: 'noun', word: 'Kätzchen', trait: 'das', meaning: 'kitten', note: '-chen diminutive → neuter', initialScore: 0 },
      { id: 'vocab.nouns.element', domain: 'nouns', pos: 'noun', word: 'Element', trait: 'das', meaning: 'element', note: '-ment suffix → neuter', initialScore: 3 },
      { id: 'vocab.nouns.theater', domain: 'nouns', pos: 'noun', word: 'Theater', trait: 'das', meaning: 'theater', note: 'Public venues → neuter', initialScore: 6 },
      { id: 'vocab.nouns.krankenhaus', domain: 'nouns', pos: 'noun', word: 'Krankenhaus', trait: 'das', meaning: 'hospital', note: 'Compound with das Haus → neuter', initialScore: 6 },
      { id: 'vocab.nouns.argument', domain: 'nouns', pos: 'noun', word: 'Argument', trait: 'das', meaning: 'argument', note: '-ment suffix → neuter', initialScore: 3 },
      { id: 'vocab.nouns.bluemlein', domain: 'nouns', pos: 'noun', word: 'Blümlein', trait: 'das', meaning: 'little flower', note: '-lein diminutive → neuter', initialScore: 0 },
      { id: 'vocab.nouns.broetchen', domain: 'nouns', pos: 'noun', word: 'Brötchen', trait: 'das', meaning: 'bread roll', note: '-chen diminutive → neuter', initialScore: 6 },
      { id: 'vocab.nouns.buechlein', domain: 'nouns', pos: 'noun', word: 'Büchlein', trait: 'das', meaning: 'booklet', note: '-lein diminutive → neuter', initialScore: 0 },
      { id: 'vocab.nouns.dokument', domain: 'nouns', pos: 'noun', word: 'Dokument', trait: 'das', meaning: 'document', note: '-ment suffix → neuter', initialScore: 3 },
      { id: 'vocab.nouns.experiment', domain: 'nouns', pos: 'noun', word: 'Experiment', trait: 'das', meaning: 'experiment', note: '-ment suffix → neuter', initialScore: 3 },
      { id: 'vocab.nouns.fraeulein', domain: 'nouns', pos: 'noun', word: 'Fräulein', trait: 'das', meaning: 'young woman (dated)', note: '-lein diminutive → neuter', initialScore: 0 },
      { id: 'vocab.nouns.haeuschen', domain: 'nouns', pos: 'noun', word: 'Häuschen', trait: 'das', meaning: 'little house', note: '-chen diminutive → neuter', initialScore: 3 },
      { id: 'vocab.nouns.haeuslein', domain: 'nouns', pos: 'noun', word: 'Häuslein', trait: 'das', meaning: 'little house', note: '-lein diminutive → neuter', initialScore: 0 },
      { id: 'vocab.nouns.huendchen', domain: 'nouns', pos: 'noun', word: 'Hündchen', trait: 'das', meaning: 'puppy / little dog', note: '-chen diminutive → neuter', initialScore: 0 },
      { id: 'vocab.nouns.instrument', domain: 'nouns', pos: 'noun', word: 'Instrument', trait: 'das', meaning: 'instrument', note: '-ment suffix → neuter', initialScore: 6 },
      { id: 'vocab.nouns.kaninchen', domain: 'nouns', pos: 'noun', word: 'Kaninchen', trait: 'das', meaning: 'rabbit', note: '-chen ending → neuter', initialScore: 3 },
      { id: 'vocab.nouns.kindlein', domain: 'nouns', pos: 'noun', word: 'Kindlein', trait: 'das', meaning: 'little child', note: '-lein diminutive → neuter', initialScore: 0 },
      { id: 'vocab.nouns.maedchen', domain: 'nouns', pos: 'noun', word: 'Mädchen', trait: 'das', meaning: 'girl', note: '-chen diminutive → neuter', initialScore: 6 },
      { id: 'vocab.nouns.maerchen', domain: 'nouns', pos: 'noun', word: 'Märchen', trait: 'das', meaning: 'fairy tale', note: '-chen diminutive → neuter', initialScore: 3 },
      { id: 'vocab.nouns.medikament', domain: 'nouns', pos: 'noun', word: 'Medikament', trait: 'das', meaning: 'medication', note: '-ment suffix → neuter', initialScore: 3 },
      { id: 'vocab.nouns.monument', domain: 'nouns', pos: 'noun', word: 'Monument', trait: 'das', meaning: 'monument', note: '-ment suffix → neuter', initialScore: 0 },
      { id: 'vocab.nouns.buero', domain: 'nouns', pos: 'noun', word: 'Büro', trait: 'das', meaning: 'office', note: 'Places/venues → neuter', initialScore: 6 },
      { id: 'vocab.nouns.caf', domain: 'nouns', pos: 'noun', word: 'Café', trait: 'das', meaning: 'café', note: 'Places/venues → neuter', initialScore: 6 },
      { id: 'vocab.nouns.hotel', domain: 'nouns', pos: 'noun', word: 'Hotel', trait: 'das', meaning: 'hotel', note: 'Places/venues → neuter', initialScore: 6 },
      { id: 'vocab.nouns.kino', domain: 'nouns', pos: 'noun', word: 'Kino', trait: 'das', meaning: 'cinema', note: 'Places/venues → neuter', initialScore: 6 },
      { id: 'vocab.nouns.museum', domain: 'nouns', pos: 'noun', word: 'Museum', trait: 'das', meaning: 'museum', note: '-um suffix → neuter', initialScore: 6 },
      { id: 'vocab.nouns.restaurant', domain: 'nouns', pos: 'noun', word: 'Restaurant', trait: 'das', meaning: 'restaurant', note: 'Places/venues → neuter', initialScore: 6 },

      // --- CASE GOVERNANCE: ACCUSATIVE (Akk) ---
      { id: 'vocab.case.sehen', domain: 'case', pos: 'verb', word: 'sehen', trait: 'Akk', meaning: 'to see', note: 'Transitive verb → Accusative', initialScore: 6 },
      { id: 'vocab.case.haben', domain: 'case', pos: 'verb', word: 'haben', trait: 'Akk', meaning: 'to have', note: 'Transitive verb → Accusative', initialScore: 6 },
      { id: 'vocab.case.fuer', domain: 'case', pos: 'prep', word: 'für', trait: 'Akk', meaning: 'for', note: 'Accusative preposition', initialScore: 6 },
      { id: 'vocab.case.ohne', domain: 'case', pos: 'prep', word: 'ohne', trait: 'Akk', meaning: 'without', note: 'Accusative preposition', initialScore: 3 },
      { id: 'vocab.case.brauchen', domain: 'case', pos: 'verb', word: 'brauchen', trait: 'Akk', meaning: 'to need', note: 'Transitive verb → Accusative', initialScore: 6 },
      { id: 'vocab.case.suchen', domain: 'case', pos: 'verb', word: 'suchen', trait: 'Akk', meaning: 'to look for', note: 'Transitive verb → Accusative', initialScore: 3 },
      { id: 'vocab.case.nehmen', domain: 'case', pos: 'verb', word: 'nehmen', trait: 'Akk', meaning: 'to take', note: 'Transitive verb → Accusative', initialScore: 3 },
      { id: 'vocab.case.finden', domain: 'case', pos: 'verb', word: 'finden', trait: 'Akk', meaning: 'to find', note: 'Transitive verb → Accusative', initialScore: 6 },
      { id: 'vocab.case.warten-auf', domain: 'case', pos: 'verb+prep', word: 'warten auf', trait: 'Akk', meaning: 'to wait for', note: 'auf + Accusative', initialScore: 0 },
      { id: 'vocab.case.um', domain: 'case', pos: 'prep', word: 'um', trait: 'Akk', meaning: 'around / for', note: 'Accusative preposition', initialScore: 0 },
      { id: 'vocab.case.durch', domain: 'case', pos: 'prep', word: 'durch', trait: 'Akk', meaning: 'through', note: 'Accusative preposition', initialScore: 3 },
      { id: 'vocab.case.entlang', domain: 'case', pos: 'prep', word: 'entlang', trait: 'Akk', meaning: 'along', note: 'Accusative preposition (often after the noun: den Weg entlang)', initialScore: 0 },
      { id: 'vocab.case.gegen', domain: 'case', pos: 'prep', word: 'gegen', trait: 'Akk', meaning: 'against', note: 'Accusative preposition', initialScore: 0 },

      // --- CASE GOVERNANCE: DATIVE (Dat) ---
      { id: 'vocab.case.helfen', domain: 'case', pos: 'verb', word: 'helfen', trait: 'Dat', meaning: 'to help', note: 'Dative verb', initialScore: 6 },
      { id: 'vocab.case.mit', domain: 'case', pos: 'prep', word: 'mit', trait: 'Dat', meaning: 'with', note: 'Dative preposition', initialScore: 6 },
      { id: 'vocab.case.aus', domain: 'case', pos: 'prep', word: 'aus', trait: 'Dat', meaning: 'out of / from', note: 'Dative preposition', initialScore: 6 },
      { id: 'vocab.case.danken', domain: 'case', pos: 'verb', word: 'danken', trait: 'Dat', meaning: 'to thank', note: 'Dative verb', initialScore: 3 },
      { id: 'vocab.case.gefallen', domain: 'case', pos: 'verb', word: 'gefallen', trait: 'Dat', meaning: 'to be pleasing', note: 'Dative verb', initialScore: 0 },
      { id: 'vocab.case.passen-zu', domain: 'case', pos: 'verb+prep', word: 'passen zu', trait: 'Dat', meaning: 'to fit with', note: 'zu + Dative', initialScore: 0 },
      { id: 'vocab.case.ausser', domain: 'case', pos: 'prep', word: 'außer', trait: 'Dat', meaning: 'except / besides', note: 'Dative preposition', initialScore: 0 },
      { id: 'vocab.case.bei', domain: 'case', pos: 'prep', word: 'bei', trait: 'Dat', meaning: 'at / with', note: 'Dative preposition', initialScore: 6 },
      { id: 'vocab.case.nach', domain: 'case', pos: 'prep', word: 'nach', trait: 'Dat', meaning: 'after / to', note: 'Dative preposition', initialScore: 6 },
      { id: 'vocab.case.seit', domain: 'case', pos: 'prep', word: 'seit', trait: 'Dat', meaning: 'since', note: 'Dative preposition', initialScore: 3 },
      { id: 'vocab.case.von', domain: 'case', pos: 'prep', word: 'von', trait: 'Dat', meaning: 'from / of', note: 'Dative preposition', initialScore: 6 },
      { id: 'vocab.case.zu', domain: 'case', pos: 'prep', word: 'zu', trait: 'Dat', meaning: 'to', note: 'Dative preposition', initialScore: 6 },
      { id: 'vocab.case.antworten', domain: 'case', pos: 'verb', word: 'antworten', trait: 'Dat', meaning: 'to answer', note: 'Dative verb', initialScore: 3 },
      { id: 'vocab.case.gehoeren', domain: 'case', pos: 'verb', word: 'gehören', trait: 'Dat', meaning: 'to belong to', note: 'Dative verb', initialScore: 3 },
      { id: 'vocab.case.passen', domain: 'case', pos: 'verb', word: 'passen', trait: 'Dat', meaning: 'to fit (someone)', note: 'Dative verb', initialScore: 3 },
      { id: 'vocab.case.kaufen', domain: 'case', pos: 'verb', word: 'kaufen', trait: 'Akk', meaning: 'to buy', note: 'Transitive verb → Accusative', initialScore: 6 },
      { id: 'vocab.case.essen', domain: 'case', pos: 'verb', word: 'essen', trait: 'Akk', meaning: 'to eat', note: 'Transitive verb → Accusative', initialScore: 6 },
      { id: 'vocab.case.trinken', domain: 'case', pos: 'verb', word: 'trinken', trait: 'Akk', meaning: 'to drink', note: 'Transitive verb → Accusative', initialScore: 6 },
      { id: 'vocab.case.lesen', domain: 'case', pos: 'verb', word: 'lesen', trait: 'Akk', meaning: 'to read', note: 'Transitive verb → Accusative', initialScore: 6 },
      { id: 'vocab.case.machen', domain: 'case', pos: 'verb', word: 'machen', trait: 'Akk', meaning: 'to make / do', note: 'Transitive verb → Accusative', initialScore: 6 },
      { id: 'vocab.case.besuchen', domain: 'case', pos: 'verb', word: 'besuchen', trait: 'Akk', meaning: 'to visit', note: 'Transitive verb → Accusative', initialScore: 3 },
      { id: 'vocab.case.fragen', domain: 'case', pos: 'verb', word: 'fragen', trait: 'Akk', meaning: 'to ask', note: 'Transitive verb → Accusative', initialScore: 3 },
      { id: 'vocab.case.zeigen', domain: 'case', pos: 'verb', word: 'zeigen', trait: 'Dat', meaning: 'to show', note: 'Dative recipient (+ Accusative thing)', initialScore: 3 },
      { id: 'vocab.case.geben', domain: 'case', pos: 'verb', word: 'geben', trait: 'Dat', meaning: 'to give', note: 'Dative recipient (+ Accusative thing)', initialScore: 6 },
      { id: 'vocab.case.erzaehlen', domain: 'case', pos: 'verb', word: 'erzählen', trait: 'Dat', meaning: 'to tell', note: 'Dative listener', initialScore: 3 },
      { id: 'vocab.case.glauben', domain: 'case', pos: 'verb', word: 'glauben', trait: 'Dat', meaning: 'to believe', note: 'Dative verb', initialScore: 0 },
      { id: 'vocab.case.folgen', domain: 'case', pos: 'verb', word: 'folgen', trait: 'Dat', meaning: 'to follow', note: 'Dative verb', initialScore: 0 },
      { id: 'vocab.case.bitten-um', domain: 'case', pos: 'verb+prep', word: 'bitten um', trait: 'Akk', meaning: 'to ask for', note: 'um + Accusative', initialScore: 0 },
      { id: 'vocab.case.denken-an', domain: 'case', pos: 'verb+prep', word: 'denken an', trait: 'Akk', meaning: 'to think of', note: 'an + Accusative', initialScore: 0 },
      { id: 'vocab.case.sprechen-mit', domain: 'case', pos: 'verb+prep', word: 'sprechen mit', trait: 'Dat', meaning: 'to speak with', note: 'mit + Dative', initialScore: 3 },
    ];

export const SCENE_NOUN_ENTRIES = [
      ['die', 'Stadt', 'city'],
      ['die', 'Straße', 'street'],
      ['die', 'Fußgängerzone', 'pedestrian zone'],
      ['die', 'Kreuzung', 'intersection'],
      ['die', 'Ampel', 'traffic light'],
      ['der', 'Zebrastreifen', 'crosswalk'],
      ['der', 'Bürgersteig', 'sidewalk'],
      ['das', 'Fahrrad', 'bicycle'],
      ['die', 'Straßenbahn', 'tram / streetcar'],
      ['die', 'Haltestelle', 'transit stop'],
      ['das', 'Taxi', 'taxi'],
      ['das', 'Geschäft', 'shop / store'],
      ['die', 'Buchhandlung', 'bookstore'],
      ['das', 'Schaufenster', 'shop window'],
      ['der', 'Kiosk', 'kiosk'],
      ['der', 'Briefkasten', 'mailbox'],
      ['das', 'Schild', 'sign / shield'],
      ['der', 'Mülleimer', 'trash can'],
      ['der', 'Hund', 'dog'],
      ['der', 'Fußgänger', 'pedestrian'],
      ['die', 'Tür', 'door'],
      ['der', 'Eingang', 'entrance'],
      ['der', 'Ausgang', 'exit'],
      ['die', 'Bank', 'bench'],
      ['die', 'Laterne', 'streetlamp'],
      ['der', 'Bahnhof', 'train station'],
      ['der', 'Zug', 'train'],
      ['das', 'Gleis', 'track'],
      ['der', 'Bahnsteig', 'platform'],
      ['die', 'Fahrkarte', 'ticket'],
      ['der', 'Fahrkartenautomat', 'ticket machine'],
      ['die', 'Abfahrtstafel', 'departure board'],
      ['die', 'Verspätung', 'delay'],
      ['der', 'Aufzug', 'elevator'],
      ['die', 'Treppe', 'stairs'],
      ['der', 'Koffer', 'suitcase'],
      ['der', 'Rucksack', 'backpack'],
      ['die', 'Tasche', 'bag'],
      ['das', 'Gepäck', 'luggage'],
      ['der', 'Fahrgast', 'passenger'],
      ['der', 'Schaffner', 'conductor'],
      ['die', 'Toilette', 'restroom / toilet'],
      ['das', 'Smartphone', 'smartphone'],
      ['die', 'Uhr', 'clock / watch'],
      ['das', 'Gleisschild', 'track sign'],
      ['der', 'Tisch', 'table'],
      ['der', 'Stuhl', 'chair'],
      ['die', 'Theke', 'counter'],
      ['der', 'Barhocker', 'bar stool'],
      ['die', 'Speisekarte', 'menu'],
      ['die', 'Tasse', 'cup'],
      ['der', 'Teller', 'plate'],
      ['das', 'Glas', 'glass'],
      ['das', 'Besteck', 'cutlery'],
      ['der', 'Löffel', 'spoon'],
      ['die', 'Gabel', 'fork'],
      ['das', 'Messer', 'knife'],
      ['der', 'Kaffee', 'coffee'],
      ['der', 'Kuchen', 'cake'],
      ['das', 'Croissant', 'croissant'],
      ['die', 'Kasse', 'cash register / checkout'],
      ['der', 'Gast', 'guest'],
      ['die', 'Kellnerin', 'waitress'],
      ['das', 'Fenster', 'window'],
      ['die', 'Espressomaschine', 'espresso machine'],
      ['der', 'Supermarkt', 'supermarket'],
      ['der', 'Einkaufswagen', 'shopping cart'],
      ['der', 'Einkaufskorb', 'shopping basket'],
      ['die', 'Einkaufstasche', 'shopping bag'],
      ['das', 'Kassenband', 'checkout conveyor belt'],
      ['die', 'Kassenkraft', 'cashier'],
      ['das', 'Regal', 'shelf'],
      ['der', 'Gang', 'aisle / hallway'],
      ['das', 'Brot', 'bread'],
      ['die', 'Milch', 'milk'],
      ['der', 'Käse', 'cheese'],
      ['der', 'Apfel', 'apple'],
      ['die', 'Banane', 'banana'],
      ['die', 'Kartoffel', 'potato'],
      ['die', 'Karotte', 'carrot'],
      ['die', 'Flasche', 'bottle'],
      ['das', 'Angebot', 'offer / special'],
      ['die', 'Schlange', 'queue / line'],
      ['das', 'Geld', 'money'],
      ['die', 'Tüte', 'bag'],
      ['die', 'Dose', 'tin can'],
      ['der', 'Joghurt', 'yogurt'],
      ['die', 'Tiefkühltruhe', 'chest freezer'],
      ['die', 'Rezeption', 'reception'],
      ['das', 'Zimmer', 'room'],
      ['der', 'Schlüssel', 'key'],
      ['die', 'Schlüsselkarte', 'key card'],
      ['das', 'Bett', 'bed'],
      ['der', 'Schrank', 'wardrobe / cabinet'],
      ['das', 'Badezimmer', 'bathroom'],
      ['die', 'Dusche', 'shower'],
      ['das', 'Handtuch', 'towel'],
      ['der', 'Spiegel', 'mirror'],
      ['der', 'Kofferwagen', 'luggage cart'],
      ['die', 'Rezeptionistin', 'female receptionist'],
      ['die', 'Lampe', 'lamp'],
      ['der', 'Nachttisch', 'nightstand'],
      ['die', 'Minibar', 'minibar'],
      ['die', 'Kneipe', 'pub / tavern'],
      ['der', 'Tresen', 'bar counter'],
      ['die', 'Zapfanlage', 'beer tap system'],
      ['der', 'Bierkrug', 'beer mug'],
      ['das', 'Bier', 'beer'],
      ['der', 'Bierdeckel', 'beer coaster'],
      ['die', 'Brezel', 'pretzel'],
      ['die', 'Wurst', 'sausage'],
      ['die', 'Getränkekarte', 'drink menu'],
      ['der', 'Wirt', 'innkeeper / host'],
      ['der', 'Stammtisch', 'regulars’ table'],
      ['die', 'Kreidetafel', 'chalkboard'],
      ['der', 'Hocker', 'stool'],
      ['die', 'Serviette', 'napkin'],
      ['der', 'Garderobenhaken', 'coat hook'],
      ['der', 'Wochenmarkt', 'weekly market'],
      ['der', 'Marktstand', 'market stall'],
      ['die', 'Verkäuferin', 'female salesperson'],
      ['der', 'Korb', 'basket'],
      ['die', 'Waage', 'scale'],
      ['die', 'Kiste', 'crate / box'],
      ['die', 'Birne', 'pear'],
      ['die', 'Tomate', 'tomato'],
      ['die', 'Zwiebel', 'onion'],
      ['die', 'Blume', 'flower'],
      ['der', 'Blumenstrauß', 'bouquet of flowers'],
      ['der', 'Preis', 'price'],
      ['der', 'Sonnenschirm', 'parasol / sun umbrella'],
      ['das', 'Zelt', 'tent'],
      ['die', 'Traube', 'grape'],
      ['der', 'Kürbis', 'pumpkin'],
      ['die', 'Münze', 'coin'],
      ['der', 'Flughafen', 'airport'],
      ['das', 'Terminal', 'terminal'],
      ['der', 'Check-in-Schalter', 'check-in counter'],
      ['das', 'Gate', 'gate'],
      ['die', 'Anzeige', 'display / screen'],
      ['der', 'Abflug', 'departure'],
      ['die', 'Ankunft', 'arrival'],
      ['die', 'Sicherheitskontrolle', 'security check'],
      ['die', 'Passkontrolle', 'passport control'],
      ['die', 'Gepäckabgabe', 'baggage drop'],
      ['das', 'Handgepäck', 'hand luggage'],
      ['die', 'Bordkarte', 'boarding pass'],
      ['der', 'Reisepass', 'passport'],
      ['der', 'Gepäckwagen', 'luggage trolley'],
      ['das', 'Flugzeug', 'airplane'],
      ['der', 'Sitzplatz', 'seat'],
      ['das', 'Förderband', 'conveyor belt'],
      ['die', 'Küche', 'kitchen'],
      ['der', 'Kühlschrank', 'refrigerator'],
      ['der', 'Herd', 'stove'],
      ['der', 'Backofen', 'oven'],
      ['die', 'Spüle', 'kitchen sink'],
      ['der', 'Wasserhahn', 'faucet / tap'],
      ['die', 'Schublade', 'drawer'],
      ['die', 'Arbeitsplatte', 'countertop'],
      ['der', 'Topf', 'pot'],
      ['die', 'Pfanne', 'pan'],
      ['das', 'Schneidebrett', 'cutting board'],
      ['der', 'Wasserkocher', 'electric kettle'],
      ['das', 'Geschirrtuch', 'dish towel'],
      ['die', 'Schüssel', 'bowl'],
      ['der', 'Stadtpark', 'city park'],
      ['der', 'Biergarten', 'beer garden'],
      ['der', 'Baum', 'tree'],
      ['die', 'Parkbank', 'park bench'],
      ['der', 'Brunnen', 'fountain'],
      ['der', 'Parkweg', 'park path'],
      ['der', 'Spielplatz', 'playground'],
      ['die', 'Schaukel', 'swing'],
      ['die', 'Rutsche', 'slide'],
      ['der', 'Parkplan', 'park map'],
      ['der', 'Ball', 'ball'],
      ['die', 'Decke', 'blanket / ceiling'],
      ['die', 'Bäckerei', 'bakery'],
      ['die', 'Bäckerin', 'female baker'],
      ['der', 'Laib', 'loaf'],
      ['das', 'Gebäck', 'pastry / baked goods'],
      ['die', 'Auslage', 'display case'],
      ['das', 'Backblech', 'baking sheet'],
      ['der', 'Ofen', 'oven'],
      ['das', 'Mehl', 'flour'],
      ['der', 'Teig', 'dough'],
      ['die', 'Zange', 'tongs'],
      ['die', 'Papiertüte', 'paper bag'],
      ['der', 'Kunde', 'customer'],
      ['die', 'Apotheke', 'pharmacy'],
      ['der', 'Apotheker', 'pharmacist'],
      ['die', 'Apothekerin', 'female pharmacist'],
      ['die', 'Tablette', 'tablet / pill'],
      ['die', 'Packung', 'pack / box'],
      ['die', 'Salbe', 'ointment'],
      ['das', 'Pflaster', 'band-aid / plaster'],
      ['der', 'Verband', 'bandage'],
      ['das', 'Thermometer', 'thermometer'],
      ['die', 'Creme', 'cream'],
      ['der', 'Hustensaft', 'cough syrup'],
      ['die', 'Schachtel', 'cardboard box'],
      ['das', 'Rezept', 'prescription'],
      ['die', 'Kundin', 'female customer'],
      ['der', 'Beipackzettel', 'package leaflet'],
      ['die', 'Bushaltestelle', 'bus stop'],
      ['die', 'Straßenbahnhaltestelle', 'tram stop'],
      ['der', 'Bus', 'bus'],
      ['die', 'Fahrerin', 'female driver'],
      ['der', 'Fahrplan', 'timetable / schedule'],
      ['die', 'Linie', 'transit line'],
      ['die', 'Sitzbank', 'bench'],
      ['das', 'Wartehäuschen', 'bus shelter'],
      ['das', 'Dach', 'roof'],
      ['der', 'Knopf', 'button'],
      ['die', 'Haltestange', 'handrail'],
      ['der', 'Kinderwagen', 'stroller'],
      ['der', 'Regenschirm', 'umbrella'],
      ['das', 'Wohnhaus', 'apartment building'],
      ['das', 'Gebäude', 'building'],
      ['die', 'Haustür', 'front door'],
      ['die', 'Klingel', 'doorbell'],
      ['der', 'Flur', 'hallway'],
      ['das', 'Treppenhaus', 'stairwell'],
      ['der', 'Balkon', 'balcony'],
      ['die', 'Fußmatte', 'doormat'],
      ['der', 'Hof', 'courtyard'],
      ['die', 'Mülltonne', 'trash bin'],
      ['die', 'Pflanze', 'plant'],
      ['das', 'Paket', 'package / parcel'],
      ['die', 'Ausstellung', 'exhibition'],
      ['das', 'Bild', 'picture / painting'],
      ['das', 'Gemälde', 'painting'],
      ['der', 'Bilderrahmen', 'picture frame'],
      ['die', 'Skulptur', 'sculpture'],
      ['die', 'Statue', 'statue'],
      ['der', 'Sockel', 'pedestal'],
      ['die', 'Vitrine', 'display case'],
      ['der', 'Text', 'text'],
      ['die', 'Eintrittskarte', 'admission ticket'],
      ['der', 'Saal', 'hall'],
      ['die', 'Wand', 'wall'],
      ['der', 'Boden', 'floor / ground'],
      ['der', 'Besucher', 'visitor'],
      ['die', 'Besucherin', 'female visitor'],
      ['der', 'Führer', 'guide'],
      ['die', 'Führerin', 'female guide'],
      // --- Everyday expansions: synonyms, hypernyms, related lemmas ---
      ['der', 'Laden', 'shop'],
      ['das', 'WC', 'toilet / restroom'],
      ['die', 'Quittung', 'receipt'],
      ['die', 'Abfahrt', 'departure (rail / bus)'],
      ['das', 'Auto', 'car'],
      ['die', 'U-Bahn', 'subway / metro'],
      ['die', 'S-Bahn', 'suburban train'],
      ['die', 'Verbindung', 'connection'],
      ['der', 'Anschluss', 'transfer / connection'],
      ['das', 'Wasser', 'water'],
      ['der', 'Tee', 'tea'],
      ['der', 'Wein', 'wine'],
      ['die', 'Suppe', 'soup'],
      ['der', 'Salat', 'salad'],
      ['das', 'Ei', 'egg'],
      ['die', 'Butter', 'butter'],
      ['das', 'Fleisch', 'meat'],
      ['der', 'Fisch', 'fish'],
      ['die', 'Schokolade', 'chocolate'],
      ['das', 'Eis', 'ice cream / ice'],
      ['die', 'Pizza', 'pizza'],
      ['das', 'Wohnzimmer', 'living room'],
      ['das', 'Schlafzimmer', 'bedroom'],
      ['das', 'Esszimmer', 'dining room'],
      ['der', 'Keller', 'basement / cellar'],
      ['die', 'Garage', 'garage'],
      ['das', 'Sofa', 'sofa'],
      ['der', 'Sessel', 'armchair'],
      ['der', 'Tag', 'day'],
      ['die', 'Woche', 'week'],
      ['der', 'Monat', 'month'],
      ['das', 'Jahr', 'year'],
      ['die', 'Stunde', 'hour'],
      ['die', 'Minute', 'minute'],
      ['das', 'Wochenende', 'weekend'],
      ['das', 'Wetter', 'weather'],
      ['die', 'Sonne', 'sun'],
      ['die', 'Wolke', 'cloud'],
      ['der', 'Himmel', 'sky'],
      ['die', 'Jacke', 'jacket'],
      ['die', 'Hose', 'pants / trousers'],
      ['der', 'Schuh', 'shoe'],
      ['das', 'Hemd', 'shirt'],
      ['der', 'Mantel', 'coat'],
      ['die', 'Hand', 'hand'],
      ['der', 'Fuß', 'foot'],
      ['der', 'Kopf', 'head'],
      ['das', 'Auge', 'eye'],
      ['der', 'Markt', 'market'],
      ['die', 'Kreditkarte', 'credit card'],
      ['der', 'Schein', 'banknote'],
      ['das', 'Kleingeld', 'small change'],
      ['der', 'Beutel', 'pouch / small bag'],
    ];

export const COMPOUND_ROOT_ENTRIES = [
      ['das', 'Haus', 'house'],
      ['die', 'Karte', 'card'],
      ['der', 'Automat', 'machine / dispenser'],
      ['die', 'Tafel', 'board'],
      ['der', 'Wagen', 'cart / carriage'],
      ['das', 'Band', 'belt / ribbon'],
      ['das', 'Tuch', 'cloth'],
      ['der', 'Krug', 'mug / pitcher'],
      ['der', 'Deckel', 'lid / coaster'],
      ['der', 'Park', 'park'],
      ['der', 'Haken', 'hook'],
      ['der', 'Stand', 'stand / booth'],
      ['der', 'Schirm', 'umbrella / screen'],
      ['der', 'Schalter', 'service counter'],
      ['die', 'Kontrolle', 'check / inspection'],
      ['der', 'Pass', 'passport'],
      ['der', 'Platz', 'place / square / seat'],
      ['die', 'Platte', 'plate / counter'],
      ['das', 'Brett', 'board'],
      ['der', 'Garten', 'garden'],
      ['der', 'Weg', 'path / way'],
      ['der', 'Plan', 'plan / map'],
      ['der', 'Saft', 'juice'],
      ['der', 'Zettel', 'note / slip of paper'],
      ['die', 'Stange', 'pole / bar'],
      ['die', 'Matte', 'mat'],
      ['die', 'Tonne', 'bin / barrel'],
      ['der', 'Rahmen', 'frame'],
      ['der', 'Eimer', 'bucket'],
      ['der', 'Kasten', 'box'],
      ['der', 'Markt', 'market'],
      ['das', 'Zimmer', 'room'],
      ['die', 'Bahn', 'rail / train / way'],
      ['das', 'Ende', 'end'],
      ['das', 'Geld', 'money']
    ];

export const COMPOUND_BREAKDOWNS = {
      'Sonnenblume': { prefix: 'Sonnen', rootWord: 'Blume' },
      'Krankenhaus': { prefix: 'Kranken', rootWord: 'Haus' },
      'Wohnhaus': { prefix: 'Wohn', rootWord: 'Haus' },
      'Treppenhaus': { prefix: 'Treppen', rootWord: 'Haus' },
      'Wartehäuschen': { prefix: 'Warte', rootWord: 'Häuschen' },
      'Fahrkarte': { prefix: 'Fahr', rootWord: 'Karte' },
      'Speisekarte': { prefix: 'Speise', rootWord: 'Karte' },
      'Getränkekarte': { prefix: 'Getränke', rootWord: 'Karte' },
      'Schlüsselkarte': { prefix: 'Schlüssel', rootWord: 'Karte' },
      'Bordkarte': { prefix: 'Bord', rootWord: 'Karte' },
      'Eintrittskarte': { prefix: 'Eintritts', rootWord: 'Karte' },
      'Fahrkartenautomat': { prefix: 'Fahrkarten', rootWord: 'Automat' },
      'Abfahrtstafel': { prefix: 'Abfahrts', rootWord: 'Tafel' },
      'Kreidetafel': { prefix: 'Kreide', rootWord: 'Tafel' },
      'Einkaufswagen': { prefix: 'Einkaufs', rootWord: 'Wagen' },
      'Kofferwagen': { prefix: 'Koffer', rootWord: 'Wagen' },
      'Gepäckwagen': { prefix: 'Gepäck', rootWord: 'Wagen' },
      'Kinderwagen': { prefix: 'Kinder', rootWord: 'Wagen' },
      'Kassenband': { prefix: 'Kassen', rootWord: 'Band' },
      'Förderband': { prefix: 'Förder', rootWord: 'Band' },
      'Handtuch': { prefix: 'Hand', rootWord: 'Tuch' },
      'Geschirrtuch': { prefix: 'Geschirr', rootWord: 'Tuch' },
      'Bierkrug': { prefix: 'Bier', rootWord: 'Krug' },
      'Bierdeckel': { prefix: 'Bier', rootWord: 'Deckel' },
      'Garderobenhaken': { prefix: 'Garderoben', rootWord: 'Haken' },
      'Marktstand': { prefix: 'Markt', rootWord: 'Stand' },
      'Sonnenschirm': { prefix: 'Sonnen', rootWord: 'Schirm' },
      'Regenschirm': { prefix: 'Regen', rootWord: 'Schirm' },
      'Check-in-Schalter': { prefix: 'Check-in-', rootWord: 'Schalter' },
      'Sicherheitskontrolle': { prefix: 'Sicherheits', rootWord: 'Kontrolle' },
      'Passkontrolle': { prefix: 'Pass', rootWord: 'Kontrolle' },
      'Sitzplatz': { prefix: 'Sitz', rootWord: 'Platz' },
      'Spielplatz': { prefix: 'Spiel', rootWord: 'Platz' },
      'Arbeitsplatte': { prefix: 'Arbeits', rootWord: 'Platte' },
      'Schneidebrett': { prefix: 'Schneide', rootWord: 'Brett' },
      'Biergarten': { prefix: 'Bier', rootWord: 'Garten' },
      'Parkweg': { prefix: 'Park', rootWord: 'Weg' },
      'Parkplan': { prefix: 'Park', rootWord: 'Plan' },
      'Fahrplan': { prefix: 'Fahr', rootWord: 'Plan' },
      'Hustensaft': { prefix: 'Husten', rootWord: 'Saft' },
      'Haltestange': { prefix: 'Halte', rootWord: 'Stange' },
      'Fußmatte': { prefix: 'Fuß', rootWord: 'Matte' },
      'Mülltonne': { prefix: 'Müll', rootWord: 'Tonne' },
      'Bilderrahmen': { prefix: 'Bilder', rootWord: 'Rahmen' },
      'Mülleimer': { prefix: 'Müll', rootWord: 'Eimer' },
      'Briefkasten': { prefix: 'Brief', rootWord: 'Kasten' },
      'Bushaltestelle': { prefix: 'Bus', rootWord: 'Haltestelle' },
      'Straßenbahnhaltestelle': { prefix: 'Straßenbahn', rootWord: 'Haltestelle' },
      'Schaufenster': { prefix: 'Schau', rootWord: 'Fenster' },
      'Gleisschild': { prefix: 'Gleis', rootWord: 'Schild' },
      'Barhocker': { prefix: 'Bar', rootWord: 'Hocker' },
      'Einkaufskorb': { prefix: 'Einkaufs', rootWord: 'Korb' },
      'Einkaufstasche': { prefix: 'Einkaufs', rootWord: 'Tasche' },
      'Badezimmer': { prefix: 'Bade', rootWord: 'Zimmer' },
      'Nachttisch': { prefix: 'Nacht', rootWord: 'Tisch' },
      'Stammtisch': { prefix: 'Stamm', rootWord: 'Tisch' },
      'Wochenmarkt': { prefix: 'Wochen', rootWord: 'Markt' },
      'Handgepäck': { prefix: 'Hand', rootWord: 'Gepäck' },
      'Stadtpark': { prefix: 'Stadt', rootWord: 'Park' },
      'Parkbank': { prefix: 'Park', rootWord: 'Bank' },
      'Sitzbank': { prefix: 'Sitz', rootWord: 'Bank' },
      'Papiertüte': { prefix: 'Papier', rootWord: 'Tüte' },
      'Haustür': { prefix: 'Haus', rootWord: 'Tür' }
    };

/**
 * Mutates a fresh vocab array: assigns packs, compounds, buildsCompounds.
 * @returns { VOCAB_DATA: object[], LEVEL_DEFINITIONS: { nouns: object[], case: object[] } }
 */
export function buildWort2Vocab() {
  const VOCAB_DATA = VOCAB_CORE.map((w) => ({ ...w }));
  const LEVEL_DEFINITIONS = {
    nouns: [],
    case: []
  };


    // Assign Case packs
    const CASE_PACK_1 = new Set([
      'sehen', 'haben', 'für', 'ohne', 'brauchen', 'suchen', 'helfen', 'mit', 'aus', 'danken', 'bei', 'nach', 'von', 'zu'
    ]);
    const CASE_PACK_2 = new Set([
      'kaufen', 'essen', 'trinken', 'lesen', 'machen', 'geben', 'zeigen', 'besuchen', 'fragen',
      'nehmen', 'finden', 'antworten', 'gehören', 'passen', 'durch', 'entlang', 'seit'
    ]);
    LEVEL_DEFINITIONS.case = [
      { id: 1, title: 'Pack 1 · Core' },
      { id: 2, title: 'Pack 2 · Everyday' },
      { id: 3, title: 'Pack 3 · Patterns' }
    ];
    VOCAB_DATA.forEach(w => {
      if (w.domain === 'case') {
        if (CASE_PACK_1.has(w.word)) w.level = 1;
        else if (CASE_PACK_2.has(w.word)) w.level = 2;
        else w.level = 3;
      }
    });

    const existingNounKeys = new Set(
      VOCAB_DATA.filter(w => w.domain === 'nouns').map(w => `${w.trait}:${w.word.toLowerCase()}`)
    );

    // Add standalone compound root nouns
    COMPOUND_ROOT_ENTRIES.forEach(([trait, word, meaning], idx) => {
      const key = `${trait}:${word.toLowerCase()}`;
      if (existingNounKeys.has(key)) return;
      existingNounKeys.add(key);
      const slug = word.toLowerCase()
        .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]+/g, '-');
      VOCAB_DATA.push({
        id: `vocab.root.${slug}.${idx}`,
        domain: 'nouns',
        pos: 'noun',
        word,
        trait,
        meaning,
        isRoot: true,
        initialScore: 0
      });
    });

    // Add deduplicated scene nouns
    SCENE_NOUN_ENTRIES.forEach(([trait, word, meaning], idx) => {
      const key = `${trait}:${word.toLowerCase()}`;
      if (existingNounKeys.has(key)) return;
      existingNounKeys.add(key);
      const slug = word.toLowerCase()
        .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]+/g, '-');
      VOCAB_DATA.push({
        id: `vocab.scene.${slug}.${idx}`,
        domain: 'nouns',
        pos: 'noun',
        word,
        trait,
        meaning,
        initialScore: 0
      });
    });

    // Link each compound word to its root word ID & split metadata
    const nounByWordLower = new Map();
    VOCAB_DATA.filter(w => w.domain === 'nouns').forEach(w => {
      nounByWordLower.set(w.word.toLowerCase(), w);
    });

    VOCAB_DATA.forEach(w => {
      if (w.domain !== 'nouns') return;
      const spec = COMPOUND_BREAKDOWNS[w.word];
      if (spec) {
        const rootObj = nounByWordLower.get(spec.rootWord.toLowerCase());
        w.compound = {
          prefix: spec.prefix,
          rootWord: spec.rootWord,
          rootTrait: rootObj ? rootObj.trait : w.trait,
          rootId: rootObj ? rootObj.id : null
        };
      }
    });

    // Reverse index: root word → compounds that end with it (for "Builds:" hints)
    const compoundsByRoot = new Map();
    Object.entries(COMPOUND_BREAKDOWNS).forEach(([compoundWord, spec]) => {
      const key = spec.rootWord.toLowerCase();
      if (!compoundsByRoot.has(key)) compoundsByRoot.set(key, []);
      compoundsByRoot.get(key).push(compoundWord);
    });
    VOCAB_DATA.forEach(w => {
      if (w.domain !== 'nouns') return;
      const builds = compoundsByRoot.get(w.word.toLowerCase());
      if (builds && builds.length) {
        w.buildsCompounds = builds;
      }
    });

    // Partition all Noun Gender words into balanced ~18-word interleaved packs (~6 der + 6 die + 6 das),
    // ensuring standalone root nouns are placed in earlier packs than the compound nouns that depend on them.
    const allNouns = VOCAB_DATA.filter(w => w.domain === 'nouns');
    const rootWordSet = new Set(
      Object.values(COMPOUND_BREAKDOWNS).map(spec => spec.rootWord.toLowerCase())
    );

    const prioritySort = (a, b) => {
      const aIsRoot = rootWordSet.has(a.word.toLowerCase()) ? 0 : 1;
      const bIsRoot = rootWordSet.has(b.word.toLowerCase()) ? 0 : 1;
      if (aIsRoot !== bIsRoot) return aIsRoot - bIsRoot;
      const aIsComp = a.compound ? 1 : 0;
      const bIsComp = b.compound ? 1 : 0;
      if (aIsComp !== bIsComp) return aIsComp - bIsComp;
      return 0;
    };

    const derPool = allNouns.filter(w => w.trait === 'der').sort(prioritySort);
    const diePool = allNouns.filter(w => w.trait === 'die').sort(prioritySort);
    const dasPool = allNouns.filter(w => w.trait === 'das').sort(prioritySort);

    const PER_TRAIT_PER_PACK = 6; // 6 der + 6 die + 6 das = 18 words per pack
    const totalPacks = Math.max(
      Math.ceil(derPool.length / PER_TRAIT_PER_PACK),
      Math.ceil(diePool.length / PER_TRAIT_PER_PACK),
      Math.ceil(dasPool.length / PER_TRAIT_PER_PACK)
    );

    for (let p = 0; p < totalPacks; p++) {
      const packId = p + 1;
      const sliceStart = p * PER_TRAIT_PER_PACK;
      const sliceEnd = sliceStart + PER_TRAIT_PER_PACK;
      derPool.slice(sliceStart, sliceEnd).forEach(w => { w.level = packId; });
      diePool.slice(sliceStart, sliceEnd).forEach(w => { w.level = packId; });
      dasPool.slice(sliceStart, sliceEnd).forEach(w => { w.level = packId; });
      LEVEL_DEFINITIONS.nouns.push({
        id: packId,
        title: `Pack ${packId}`
      });
    }

    // Guarantee every compound sits in a strictly higher pack number than its root noun
    allNouns.forEach(w => {
      if (w.compound && w.compound.rootId) {
        const rootObj = VOCAB_DATA.find(item => item.id === w.compound.rootId);
        if (rootObj && w.level <= rootObj.level) {
          w.level = Math.min(totalPacks, rootObj.level + 1);
        }
      }
    });
    

  return { VOCAB_DATA, LEVEL_DEFINITIONS };
}
