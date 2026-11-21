// ============================================================================
// AUFGABEN – Sätze und Texte der Zeitreise (Etappe 1b)
// ============================================================================
// Alles neu geschrieben (nichts aus dem Unterrichtsmaterial). Verbformen werden NIE eingetippt, sondern aus der
// Verbliste (src/verben.js) erzeugt – so gibt es keine Tippfehler in den Daten.
// Prüfübersicht für die Lehrkraft: werkzeuge/aufgaben_liste.md (erzeugt mit  node werkzeuge/aufgaben_liste.mjs).
//
// Regeln (Auftrag + Entscheidungen der Lehrkraft):
// - Alltag der Kinder, kurz, keine schwierigen Wörter außer den geübten Verben, keine Dopplungen in einer Liste.
// - Keine Zeitangaben wie „heute“, „gestern“, „morgen“ in Sätzen, die in alle Zeitformen verwandelt werden.
// - Jedes gebeugte Verb eines Textes ist ein Verb aus der Verbliste (sonst würde es beim Verwandeln fehlen).
// - Keine trennbaren Verben (aufstehen, hinfallen …), keine wörtliche Rede in Texten.
// - In Texten keine weiteren Verbformen außer den markierten (kein „zu regnen“, kein Spielname wie „Fangen“) –
//   in der Text-Zeitmaschine tippen Kinder ALLE Verben an.
// - Kindertauglich: keine gefährlichen Vorbilder (z. B. bei Gewitter unter einen Baum), keine Verletzungen ausmalen,
//   Subjekte passen zu Mama/Papa/Oma („Meine Geschwister“ statt „Meine Freunde“), Namen vielfältig.
// - Hilfsverb wie in der Verbliste; Sätze passen zur Bedeutung (rollen: „Der Ball ist ins Tor gerollt.“,
//   fliegen: selbst fliegen, ziehen: an etwas ziehen, frieren: Kälte spüren).
// - Präteritum-Formen mit -est/-et unregelmäßiger Verben (du aßest …) kommen nie vor (schwerePraeteritumForm).

import { VERBEN, verbByGrundform, praesens, praeteritum, perfekt, futur, schwerePraeteritumForm } from './verben';

// ---------- Satzbausteine: ein (oder zwei) Satzrahmen je Verb ----------
// v: Grundform · rest: Satzrest (steht nach dem Verb, beim Perfekt/Futur vor dem zweiten Verb)
// wer: erlaubte Personen (0 ich … 5 sie), Standard alle · subj: feste Subjekte für Personen (z. B. rollen: der Ball)
export const SATZRAHMEN = [
  // regelmäßige Verben, Stufe 3
  { v: 'kaufen', rest: 'ein Eis' },
  { v: 'lachen', rest: 'über den Witz' },
  { v: 'malen', rest: 'ein Bild' },
  { v: 'spielen', rest: 'Fußball' },
  { v: 'lernen', rest: 'das Einmaleins' },
  { v: 'machen', rest: 'die Hausaufgaben' },
  { v: 'sagen', rest: 'Hallo' },
  { v: 'hören', rest: 'Musik' },
  { v: 'holen', rest: 'Wasser' },
  { v: 'kochen', rest: 'Nudeln' },
  { v: 'bauen', rest: 'eine Sandburg' },
  { v: 'wohnen', rest: 'in einem roten Haus' },
  { v: 'fragen', rest: 'die Lehrerin' },
  { v: 'suchen', rest: 'den Schlüssel' },
  { v: 'zeigen', rest: 'das Foto' },
  { v: 'legen', rest: 'das Buch auf den Tisch' },
  { v: 'träumen', rest: 'von den Ferien' },
  { v: 'rollen', rest: 'ins Tor', wer: [2, 5], subj: { 2: ['Der Ball'], 5: ['Die Bälle'] } },
  { v: 'hüpfen', rest: 'über die Pfütze' },
  { v: 'turnen', rest: 'in der Halle' },
  { v: 'putzen', rest: 'das Fenster' },
  { v: 'kleben', rest: 'Sticker ins Heft' },
  { v: 'packen', rest: 'die Schultasche' },
  { v: 'schenken', rest: 'Mama Blumen' },
  // regelmäßige Verben, Stufe 4
  { v: 'reden', rest: 'mit Oma' },
  { v: 'arbeiten', rest: 'im Garten' },
  { v: 'warten', rest: 'auf Papa' },
  { v: 'baden', rest: 'im See' },
  { v: 'tanzen', rest: 'auf dem Fest' },
  { v: 'reisen', rest: 'nach Italien' },
  { v: 'wandern', rest: 'durch den Wald' },
  { v: 'sammeln', rest: 'Steine' },
  // unregelmäßige Verben
  { v: 'bleiben', rest: 'zu Hause' },
  { v: 'schreiben', rest: 'einen Brief' },
  { v: 'schreien', rest: 'vor Freude' },
  { v: 'steigen', rest: 'auf den Baum' },
  { v: 'schneiden', rest: 'das Brot' },
  { v: 'pfeifen', rest: 'ein Lied' },
  { v: 'streiten', rest: 'um das Spielzeug', wer: [3, 4, 5] },
  { v: 'singen', rest: 'im Chor' },
  { v: 'trinken', rest: 'Apfelsaft' },
  { v: 'finden', rest: 'einen Euro' },
  { v: 'springen', rest: 'ins Wasser' },
  { v: 'schwimmen', rest: 'im Meer' },
  { v: 'beginnen', rest: 'mit dem Spiel' },
  { v: 'fliegen', rest: 'nach Spanien' },
  { v: 'verlieren', rest: 'die Mütze' },
  { v: 'riechen', rest: 'an der Blume' },
  { v: 'ziehen', rest: 'am Seil' },
  { v: 'frieren', rest: 'an den Füßen' },
  { v: 'geben', rest: 'dem Hund Futter' },
  { v: 'lesen', rest: 'ein Buch' },
  { v: 'essen', rest: 'eine Brezel' },
  { v: 'sehen', rest: 'einen Regenbogen' },
  { v: 'sprechen', rest: 'leise' },
  { v: 'helfen', rest: 'Papa beim Kochen' },
  { v: 'nehmen', rest: 'den Bus' },
  { v: 'treffen', rest: 'Opa im Park' },
  { v: 'schlafen', rest: 'lange' },
  { v: 'laufen', rest: 'über die Wiese' },
  { v: 'rufen', rest: 'den Hund' },
  { v: 'fallen', rest: 'vom Fahrrad' },
  { v: 'halten', rest: 'den Hamster in der Hand' },
  { v: 'fangen', rest: 'den Ball' },
  { v: 'fahren', rest: 'mit dem Rad zur Schule' },
  { v: 'tragen', rest: 'die Tasche' },
  { v: 'waschen', rest: 'das Auto' },
  { v: 'rennen', rest: 'zum Spielplatz' },
  { v: 'bringen', rest: 'Oma einen Kuchen' },
  { v: 'denken', rest: 'an den Ausflug' },
  { v: 'kennen', rest: 'den Weg' },
  { v: 'sein', rest: 'müde' },
  { v: 'haben', rest: 'Hunger' },
  { v: 'gehen', rest: 'in die Schule' },
  { v: 'kommen', rest: 'zu spät' },
  { v: 'stehen', rest: 'an der Tür' },
  { v: 'sitzen', rest: 'auf dem Sofa' },
  { v: 'liegen', rest: 'im Bett' },
  { v: 'tun', rest: 'nichts' },
  { v: 'werden', rest: 'zehn Jahre alt' },   // Futur klingt hier natürlich: „Ich werde zehn Jahre alt werden.“
];

// Subjekte für die 3. Person (Einzahl / Mehrzahl), wenn der Satzrahmen keine eigenen hat
export const NAMEN = ['Mia', 'Tom', 'Aylin', 'Ben', 'Ella', 'Emir'];
export const MEHRZAHL = ['Die Kinder', 'Lea und Max', 'Meine Geschwister'];   // „Geschwister“ passt auch zu Mama, Papa, Oma
const PRONOMEN_GROSS = ['Ich', 'Du', null, 'Wir', 'Ihr', null];

export const rahmenDerStufe = stufe => SATZRAHMEN.filter(r => verbByGrundform[r.v].stufe <= stufe);

// Satz aus einem Rahmen bauen. zeit: praesens | praeteritum | perfekt | futur; n: welches Subjekt (Zufall von außen)
// Ergebnis: { teile: [{ t, rolle }], text }  rolle: subj | verb | hv | zweites | rest
export function baueSatz(rahmen, person, zeit, n = 0) {
  const v = verbByGrundform[rahmen.v];
  const subj = (rahmen.subj && rahmen.subj[person])
    ? rahmen.subj[person][n % rahmen.subj[person].length]
    : PRONOMEN_GROSS[person] || (person === 2 ? NAMEN[n % NAMEN.length] : MEHRZAHL[n % MEHRZAHL.length]);
  const teile = [{ t: subj, rolle: 'subj' }];
  if (zeit === 'praesens' || zeit === 'praeteritum') {
    teile.push({ t: (zeit === 'praesens' ? praesens(v) : praeteritum(v))[person].text, rolle: 'verb' });
    if (rahmen.rest) teile.push({ t: rahmen.rest, rolle: 'rest' });
  } else {
    const f = (zeit === 'perfekt' ? perfekt(v) : futur(v))[person];
    teile.push({ t: f.hilfsverb, rolle: 'hv' });
    if (rahmen.rest) teile.push({ t: rahmen.rest, rolle: 'rest' });
    teile.push({ t: f.zweites, rolle: 'zweites' });
  }
  return { teile, text: teile.map(x => x.t).join(' ') + '.', verb: rahmen.v, person, zeit };
}

// Darf diese Kombination vorkommen? (Personen des Rahmens, keine schweren Präteritum-Formen, werden-Futur nur im Satz)
export function satzErlaubt(rahmen, person, zeit) {
  const v = verbByGrundform[rahmen.v];
  if (rahmen.wer && !rahmen.wer.includes(person)) return false;
  if (zeit === 'praeteritum' && schwerePraeteritumForm(v, person)) return false;
  return true;
}

// ---------- Texte für „Finde den Unterschied“, „Text-Zeitmaschine“ und „Zeit-Chaos reparieren“ ----------
// Geschrieben im Präsens. {verb:person} = gebeugtes Verb (Person 0–5); daraus entstehen Präsens und Präteritum.
// Jeder Text: 4–6 Verben, keine wörtliche Rede, keine Zeitangaben, die nur zu einer Zeitform passen.
export const TEXTE = [
  // Stufe 3 (nur Verben der Stufe 3)
  { id: 'see', stufe: 3, titel: 'Am See', text: 'Lina {fahren:2} mit dem Rad zum See. Dort {spielen:2} sie mit ihrem Hund. Der Hund {rennen:2} ins Wasser. Lina {lachen:2} laut. Danach {essen:2} sie ein Eis.' },
  { id: 'kunst', stufe: 3, titel: 'Im Kunstraum', text: 'Die Kinder {malen:5} große Bilder. Ben {holen:2} die Farben aus dem Schrank. Mia {kleben:2} buntes Papier auf ihr Bild. Alle {sein:5} sehr fleißig.' },
  { id: 'schluessel', stufe: 3, titel: 'Der Schlüssel', text: 'Tom {suchen:2} seinen Schlüssel. Er {sehen:2} unter das Sofa. Doch er {finden:2} ihn nicht. Dann {fragen:2} er seine Schwester. Sie {zeigen:2} auf seine Jacke. Der Schlüssel {sein:2} in der Tasche.' },
  { id: 'pause', stufe: 3, titel: 'In der Pause', text: 'In der Pause {gehen:5} die Kinder auf den Hof. Paul und Ella {spielen:5} Fußball. Emir {sitzen:2} auf der Bank und {lesen:2} ein Buch. Nach der Pause {haben:5} alle Mathe.' },
  { id: 'geburtstag', stufe: 3, titel: 'Omas Geburtstag', text: 'Oma {haben:2} Geburtstag. Mia {schenken:2} ihr eine Kette. Papa {kochen:2} Nudeln. Alle {singen:5} ein Lied. Oma {lachen:2} und {trinken:2} einen Tee.' },
  { id: 'vogel', stufe: 3, titel: 'Der kleine Vogel', text: 'Ein kleiner Vogel {sitzen:2} auf dem Zaun. Er {singen:2} ein Lied. Die Katze {sehen:2} den Vogel. Sie {laufen:2} schnell zum Zaun. Doch der Vogel {fliegen:2} auf das Dach.' },
  { id: 'hausaufgaben', stufe: 3, titel: 'Laute Musik', text: 'Ella {machen:2} ihre Hausaufgaben. Sie {schreiben:2} eine Geschichte. Ihr Bruder {hören:2} laut Musik. Ella {rufen:2} ihn. Dann {sein:2} es endlich leise.' },
  { id: 'zoo', stufe: 3, titel: 'Im Zoo', text: 'Die Klasse {fahren:2} mit dem Bus in den Zoo. Dort {sehen:5} die Kinder Affen und Elefanten. Ein Affe {essen:2} eine Banane. Aylin {kaufen:2} eine Postkarte. Am Ende {sein:5} alle müde.' },
  // Stufe 4 (alle Verben)
  { id: 'wald', stufe: 4, titel: 'Gewitter im Wald', text: 'Die Familie {wandern:2} durch den Wald. Plötzlich {beginnen:2} ein Gewitter. Alle {rennen:5} zu einer Hütte. Paul {frieren:2} an den Händen. Nach einer Weile {sein:2} das Gewitter vorbei.' },
  { id: 'schwimmbad', stufe: 4, titel: 'Im Schwimmbad', text: 'Lea und Tim {gehen:5} ins Schwimmbad. Tim {springen:2} vom Startblock. Lea {schwimmen:2} zwei Bahnen. Danach {liegen:5} beide auf der Wiese und {trinken:5} Saft.' },
  { id: 'streit', stufe: 4, titel: 'Streit um den Ball', text: 'Max und Ella {streiten:5} um den Ball. Ella {ziehen:2} am Ball. Da {fallen:2} Max auf den Boden. Ella {helfen:2} ihm sofort. Dann {spielen:5} beide wieder zusammen.' },
  { id: 'brief', stufe: 4, titel: 'Ein Brief von Opa', text: 'Opa {schreiben:2} einen Brief an Jonas. Jonas {lesen:2} den Brief zweimal. Er {denken:2} an Opa. Dann {nehmen:2} er ein Blatt Papier und {malen:2} ein Bild für Opa.' },
  { id: 'markt', stufe: 4, titel: 'Auf dem Markt', text: 'Mama und Nele {gehen:5} auf den Markt. Nele {tragen:2} den Korb. Mama {kaufen:2} Äpfel und Käse. Der Verkäufer {geben:2} Nele eine Erdbeere. Die Erdbeere {riechen:2} süß.' },
  { id: 'fussball', stufe: 4, titel: 'Das Fußballspiel', text: 'Unsere Mannschaft {spielen:2} gegen die Tiger. Lina {fangen:2} jeden Ball. Ben {laufen:2} schnell nach vorne. Die Zuschauer {rufen:5} laut. Nach dem Spiel {sein:5} alle stolz.' },
  { id: 'reise', stufe: 4, titel: 'Ferien in Italien', text: 'Ella und ihre Eltern {reisen:5} nach Italien. Sie {fliegen:5} mit dem Flugzeug. Am Strand {bauen:2} Ella eine Sandburg. Papa {schlafen:2} in der Sonne. Abends {essen:5} alle Pizza.' },
  { id: 'hamster', stufe: 4, titel: 'Der Hamster', text: 'Leo {halten:2} seinen Hamster in der Hand. Der Hamster {riechen:2} an seinem Finger. Dann {laufen:2} er über Leos Arm. Leo {lachen:2} laut. Am Ende {sitzen:2} der Hamster wieder in seinem Käfig.' },
];

// Text in Teile zerlegen: [{ t }] für Wörter dazwischen, [{ v, p, t }] für Verben in der gewünschten Zeitform
export function textTeile(textObj, zeit) {
  const teile = [];
  const re = /\{([^:}]+):(\d)\}/g;
  let letzt = 0, m;
  while ((m = re.exec(textObj.text))) {
    if (m.index > letzt) teile.push({ t: textObj.text.slice(letzt, m.index) });
    const v = verbByGrundform[m[1]], p = Number(m[2]);
    const t = (zeit === 'praeteritum' ? praeteritum(v) : praesens(v))[p].text;
    teile.push({ v: m[1], p, t });
    letzt = re.lastIndex;
  }
  if (letzt < textObj.text.length) teile.push({ t: textObj.text.slice(letzt) });
  return teile;
}
export const textAls = (textObj, zeit) => textTeile(textObj, zeit).map(x => x.t).join('');
export const texteDerStufe = stufe => TEXTE.filter(t => t.stufe <= stufe);

// ---------- sein & haben: Lückensätze mit Auswahl (Spiel 5) ----------
// lücke: richtige Form · wahl: drei Möglichkeiten (die richtige + typische Kinderfehler). „seit“ ist bewusster Ablenker für „seid“.
// Die Lücke steht nie am Satzanfang. „ist/isst“ kommt nicht vor.
export const SEIN_HABEN = [
  // sein, Präsens
  { satz: 'Ich ___ schon wach.', luecke: 'bin', wahl: ['bin', 'ist', 'sind'], verb: 'sein', zeit: 'praesens' },
  { satz: 'Du ___ mein bester Freund.', luecke: 'bist', wahl: ['bist', 'bin', 'ist'], verb: 'sein', zeit: 'praesens' },
  { satz: 'Der Hund ___ sehr müde.', luecke: 'ist', wahl: ['ist', 'sind', 'bist'], verb: 'sein', zeit: 'praesens' },
  { satz: 'Wir ___ in der dritten Klasse.', luecke: 'sind', wahl: ['sind', 'seid', 'ist'], verb: 'sein', zeit: 'praesens' },
  { satz: 'Ihr ___ heute sehr leise.', luecke: 'seid', wahl: ['seid', 'seit', 'sind'], verb: 'sein', zeit: 'praesens' },
  { satz: 'Seid ihr schon fertig? Ja, wir ___ fertig.', luecke: 'sind', wahl: ['sind', 'seid', 'seit'], verb: 'sein', zeit: 'praesens' },
  // sein, Präteritum
  { satz: 'Letzte Woche ___ ich krank.', luecke: 'war', wahl: ['war', 'waren', 'wahr'], verb: 'sein', zeit: 'praeteritum' },
  { satz: 'Du ___ nicht in der Schule.', luecke: 'warst', wahl: ['warst', 'wahrst', 'war'], verb: 'sein', zeit: 'praeteritum' },
  { satz: 'Am Wochenende ___ wir bei Oma.', luecke: 'waren', wahl: ['waren', 'wahren', 'wart'], verb: 'sein', zeit: 'praeteritum' },
  { satz: 'Ihr ___ lange im Zoo.', luecke: 'wart', wahl: ['wart', 'wahrt', 'waren'], verb: 'sein', zeit: 'praeteritum' },
  // haben, Präsens
  { satz: 'Ich ___ einen kleinen Hund.', luecke: 'habe', wahl: ['habe', 'hat', 'hast'], verb: 'haben', zeit: 'praesens' },
  { satz: 'Du ___ eine neue Brille.', luecke: 'hast', wahl: ['hast', 'habst', 'hat'], verb: 'haben', zeit: 'praesens' },
  { satz: 'Mia ___ Geburtstag.', luecke: 'hat', wahl: ['hat', 'hatt', 'hast'], verb: 'haben', zeit: 'praesens' },
  { satz: 'Ihr ___ viele Bücher.', luecke: 'habt', wahl: ['habt', 'hapt', 'haben'], verb: 'haben', zeit: 'praesens' },
  // haben, Präteritum
  { satz: 'Nach dem Essen ___ ich Bauchweh.', luecke: 'hatte', wahl: ['hatte', 'habte', 'hate'], verb: 'haben', zeit: 'praeteritum' },
  { satz: 'Du ___ einen Schnupfen.', luecke: 'hattest', wahl: ['hattest', 'hatest', 'habtest'], verb: 'haben', zeit: 'praeteritum' },
  { satz: 'Auf der Feier ___ wir viel Spaß.', luecke: 'hatten', wahl: ['hatten', 'hattet', 'habten'], verb: 'haben', zeit: 'praeteritum' },
  { satz: 'Ihr ___ keine Zeit.', luecke: 'hattet', wahl: ['hattet', 'hatet', 'habtet'], verb: 'haben', zeit: 'praeteritum' },
];

// ---------- Zeitform-Detektiv: Fallen (zweite Hälfte der Runde) ----------
// Die Zeitform zählt nach der Form, nicht nach der Bedeutung. grund: Rückmeldung am konkreten Satz.
export const DETEKTIV_FALLEN = [
  { satz: 'Morgen gehe ich ins Kino.', zeit: 'praesens', stufe: 3, grund: '„gehe“ ist Präsens. „Morgen“ sagt nur, wann es passiert. Die Form des Verbs bleibt Präsens.' },
  { satz: 'Am Sonntag fahren wir zu Oma.', zeit: 'praesens', stufe: 3, grund: '„fahren“ ist Präsens. Es gibt kein „werden“, also ist es kein Futur.' },
  { satz: 'Ich habe Hunger.', zeit: 'praesens', stufe: 3, grund: '„habe“ ist hier das einzige Verb und steht im Präsens. Es fehlt ein zweites Verb am Satzende.' },
  { satz: 'Mia hat Durst.', zeit: 'praesens', stufe: 3, grund: '„hat“ ist das einzige Verb und steht im Präsens.' },
  { satz: 'Ich hatte Hunger.', zeit: 'praeteritum', stufe: 3, grund: '„hatte“ ist Präteritum von „haben“.' },
  { satz: 'Wir hatten Ferien.', zeit: 'praeteritum', stufe: 3, grund: '„hatten“ ist Präteritum von „haben“.' },
  { satz: 'Tom war krank.', zeit: 'praeteritum', stufe: 3, grund: '„war“ ist Präteritum von „sein“.' },
  { satz: 'Ich bin müde.', zeit: 'praesens', stufe: 3, grund: '„bin“ ist das einzige Verb und steht im Präsens.' },
  { satz: 'Ich werde schlafen.', zeit: 'futur', stufe: 3, grund: '„werde“ und die Grundform „schlafen“ am Satzende. Das ist Futur.' },
  { satz: 'Bald werden wir essen.', zeit: 'futur', stufe: 3, grund: '„werden“ und die Grundform „essen“ am Satzende. Das ist Futur.' },
  { satz: 'Ich werde müde.', zeit: 'praesens', stufe: 4, grund: '„werde“ ist hier das einzige Verb. Es fehlt die Grundform am Satzende. Also ist es Präsens von „werden“.' },
  { satz: 'Es wird dunkel.', zeit: 'praesens', stufe: 4, grund: '„wird“ ist das einzige Verb. Ohne Grundform am Ende ist es Präsens.' },
  { satz: 'Ich habe ein Eis gegessen.', zeit: 'perfekt', stufe: 4, grund: '„habe“ und die ge-Form „gegessen“ am Satzende. Das ist Perfekt.' },
  { satz: 'Ich habe ein Eis.', zeit: 'praesens', stufe: 4, grund: '„habe“ ist das einzige Verb. Es fehlt die ge-Form am Satzende. Also ist es Präsens.' },
  { satz: 'Wir sind im Garten.', zeit: 'praesens', stufe: 4, grund: '„sind“ ist das einzige Verb. Es ist Präsens von „sein“.' },
  { satz: 'Wir sind im Garten gewesen.', zeit: 'perfekt', stufe: 4, grund: '„sind“ und die ge-Form „gewesen“ am Satzende. Das ist Perfekt.' },
];

// ---------- Sätze bauen: Futur – Richtig oder Fehler? (Spiel 12, Teil B) ----------
// Fehlerarten (aus einem Satzrahmen erzeugt): falsche Form von „werden“, Personalform statt Grundform,
// Grundform nicht am Satzende; Stufe 4 zusätzlich Partizip statt Grundform.
export const FUTUR_FEHLER = [
  { art: 'werden', stufe: 3, warum: 'Die Form von „werden“ passt nicht zur Person.' },
  { art: 'personalform', stufe: 3, warum: 'Am Satzende muss die Grundform stehen.' },
  { art: 'stellung', stufe: 3, warum: 'Die Grundform gehört ans Satzende.' },
  { art: 'partizip', stufe: 4, warum: 'Beim Futur steht die Grundform am Ende, nicht die ge-Form.' },
];

// Fehlersatz bauen: { text, fix, warum } – fix ist der richtige Satz.
// null, wenn diese Fehlerart hier keinen Fehler ergibt (z. B. „personalform“ bei wir/sie: Personalform = Grundform).
export function futurFehlersatz(rahmen, person, art, n = 0) {
  const richtig = baueSatz(rahmen, person, 'futur', n);
  const v = verbByGrundform[rahmen.v];
  if (art === 'personalform' && praesens(v)[person].text === v.g) return null;
  const teile = richtig.teile.map(x => ({ ...x }));
  const hv = teile.find(x => x.rolle === 'hv'), zw = teile.find(x => x.rolle === 'zweites');
  if (art === 'werden') hv.t = person === 1 ? 'werde' : person === 0 ? 'wird' : person === 2 ? 'werden' : person === 3 ? 'wird' : person === 4 ? 'werden' : 'werdet';
  if (art === 'personalform') zw.t = praesens(v)[person].text;
  if (art === 'partizip') zw.t = perfekt(v)[person].zweites;
  let t;
  if (art === 'stellung') {
    const ohne = teile.filter(x => x !== zw);
    const i = ohne.findIndex(x => x.rolle === 'hv');
    ohne.splice(i + 1, 0, zw);
    t = ohne.map(x => x.t).join(' ') + '.';
  } else t = teile.map(x => x.t).join(' ') + '.';
  if (t === richtig.text) return null;
  return { text: t, fix: richtig.text, warum: FUTUR_FEHLER.find(f => f.art === art).warum, art };
}
