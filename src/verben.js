// ============================================================================
// VERBEN – die zentrale Datenliste der Zeitreise
// ============================================================================
// Alle Spiele, der Zeit-Schieberegler und später die Arbeitsblätter lesen aus DIESER Liste.
// Formen werden aus Bausteinen erzeugt (Stamm + Endung), unregelmäßige Formen stehen ausdrücklich da.
// Prüfübersicht für die Lehrkraft: werkzeuge/formen_liste.md (erzeugt mit  node werkzeuge/formen_liste.mjs).
//
// Felder:
//   g      Grundform
//   art    'r' = regelmäßig, 'u' = unregelmäßig
//   stufe  3 = schon in Klasse 3, 4 = erst in Klasse 4
//   hv     Hilfsverb im Perfekt: 'haben' oder 'sein' (genau eins pro Verb, festgelegt von der Lehrkraft)
//   fam    nur unregelmäßige Verben: Familie (Schlüssel aus FAMILIEN)
//   prt    nur unregelmäßige Verben: Präteritum-Stamm (= ich-Form), z. B. 'ging'
//   p2     Partizip, wenn es nicht regelmäßig gebildet wird (ge + Stamm + t)
//   praes  Präsens-Formen, die von der Regel abweichen: { 0: ich, 1: du, 2: er/sie/es, 3: wir, 4: ihr, 5: sie }
//   nur    'perfekt' = nur für die Perfekt-Werkstatt (Partizip-Profi in Stufe 4, freigegeben 20.11.2026)
//   teil   trennbarer Teil (aufwachen → 'auf'), nur bei nur: 'perfekt'
//   ohneGe Partizip ohne ge- (besucht, erzählt, telefoniert)
//   auchRichtig  weitere richtige Formen (Doppelformen laut Duden), z. B. { praes: { 0: ['sammele'] } } – gilt beim Tippen auch als richtig,
//                in Auswahl-Aufgaben steht nur die Hauptform
//   futurNurImSatz  Futur nur in Sätzen abfragen, in denen es natürlich klingt (werden: „Ich werde später Tierärztin werden.“)
//
// Stand: 20.11.2026 – alle Prüfpunkte der Formenliste von der Lehrkraft entschieden:
//   rollen: Perfekt mit sein (Sätze nur „Der Ball ist ins Tor gerollt.“, nie „Ich habe … gerollt“).
//   putzen: Stufe 3, aber nicht in der Endungs-Maschine der Stufe 3 (du putzt); in Stufe 4 dort als Profi.
//   sammeln: „ich sammle“ und „ich sammele“ gelten beide als richtig (auchRichtig).
//   wandern/sammeln: Endung -n (wir wander|n) – Leiste der Endungs-Maschine in Stufe 4 um -n erweitern.
//   Präteritum-Formen mit -est/-et bei unregelmäßigen Verben (du aßest, ihr fandet …) werden nie abgefragt (schwerePraeteritumForm),
//   dürfen aber in Tabellen zum Nachschlagen stehen.
//   werden: Futur nur in Sätzen, in denen es natürlich klingt (futurNurImSatz).
//   Futur in Stufe 3: alle Verben der Stufe 3.
//   beißen gestrichen (Entscheidung der Lehrkraft 20.11.2026). ihr last, ihr aßt, ihr saßt werden normal abgefragt.

export const PERSONEN = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie'];

export const FAMILIEN = {
  'ei-ie':  { titel: 'ei → ie', vokal: ['ei', 'ie'] },
  'ei-i':   { titel: 'ei → i',  vokal: ['ei', 'i'] },
  'i-a':    { titel: 'i → a',   vokal: ['i', 'a'] },
  'ie-o':   { titel: 'ie → o',  vokal: ['ie', 'o'] },
  'e-a':    { titel: 'e → a',   vokal: ['e', 'a'] },
  'a-ie':   { titel: 'a/au/u → ie/i', vokal: null },
  'a-u':    { titel: 'a → u',   vokal: ['a', 'u'] },
  'misch':  { titel: 'Mischverben (Vokal und -te)', vokal: null },
  'einzel': { titel: 'Einzelgänger', vokal: null },
};

export const VERBEN = [
  // ---------- Regelmäßige Verben (Spiele 1, 2, 4, Texte) ----------
  { g: 'kaufen',   art: 'r', stufe: 3, hv: 'haben' },
  { g: 'lachen',   art: 'r', stufe: 3, hv: 'haben' },
  { g: 'malen',    art: 'r', stufe: 3, hv: 'haben' },
  { g: 'spielen',  art: 'r', stufe: 3, hv: 'haben' },
  { g: 'lernen',   art: 'r', stufe: 3, hv: 'haben' },
  { g: 'machen',   art: 'r', stufe: 3, hv: 'haben' },
  { g: 'sagen',    art: 'r', stufe: 3, hv: 'haben' },
  { g: 'hören',    art: 'r', stufe: 3, hv: 'haben' },
  { g: 'holen',    art: 'r', stufe: 3, hv: 'haben' },
  { g: 'kochen',   art: 'r', stufe: 3, hv: 'haben' },
  { g: 'bauen',    art: 'r', stufe: 3, hv: 'haben' },
  { g: 'wohnen',   art: 'r', stufe: 3, hv: 'haben' },
  { g: 'fragen',   art: 'r', stufe: 3, hv: 'haben' },
  { g: 'suchen',   art: 'r', stufe: 3, hv: 'haben' },
  { g: 'zeigen',   art: 'r', stufe: 3, hv: 'haben' },
  { g: 'legen',    art: 'r', stufe: 3, hv: 'haben' },
  { g: 'träumen',  art: 'r', stufe: 3, hv: 'haben' },
  { g: 'rollen',   art: 'r', stufe: 3, hv: 'sein' },   // nur „Der Ball ist ins Tor gerollt.“ (Entscheidung 20.11.2026)
  { g: 'hüpfen',   art: 'r', stufe: 3, hv: 'sein' },
  { g: 'turnen',   art: 'r', stufe: 3, hv: 'haben' },
  { g: 'putzen',   art: 'r', stufe: 3, hv: 'haben' },  // du putzt → Besonderheit s/ß/z: nicht in der Endungs-Maschine der Stufe 3
  { g: 'kleben',   art: 'r', stufe: 3, hv: 'haben' },
  { g: 'packen',   art: 'r', stufe: 3, hv: 'haben' },
  { g: 'schenken', art: 'r', stufe: 3, hv: 'haben' },
  // Stufe-4-Profi
  { g: 'reden',    art: 'r', stufe: 4, hv: 'haben' },
  { g: 'arbeiten', art: 'r', stufe: 4, hv: 'haben' },
  { g: 'warten',   art: 'r', stufe: 4, hv: 'haben' },
  { g: 'baden',    art: 'r', stufe: 4, hv: 'haben' },
  { g: 'tanzen',   art: 'r', stufe: 4, hv: 'haben' },  // nicht im Spiel „haben oder sein?“
  { g: 'reisen',   art: 'r', stufe: 4, hv: 'sein' },
  { g: 'wandern',  art: 'r', stufe: 4, hv: 'sein' },
  { g: 'sammeln',  art: 'r', stufe: 4, hv: 'haben', auchRichtig: { praes: { 0: ['sammele'] } } },

  // ---------- Unregelmäßige Verben ----------
  // ei → ie
  { g: 'bleiben',   art: 'u', fam: 'ei-ie', stufe: 3, hv: 'sein',  prt: 'blieb',   p2: 'geblieben' },
  { g: 'schreiben', art: 'u', fam: 'ei-ie', stufe: 3, hv: 'haben', prt: 'schrieb', p2: 'geschrieben' },
  { g: 'schreien',  art: 'u', fam: 'ei-ie', stufe: 4, hv: 'haben', prt: 'schrie',  p2: 'geschrien' },
  { g: 'steigen',   art: 'u', fam: 'ei-ie', stufe: 4, hv: 'sein',  prt: 'stieg',   p2: 'gestiegen' },
  // ei → i
  { g: 'schneiden', art: 'u', fam: 'ei-i', stufe: 4, hv: 'haben', prt: 'schnitt', p2: 'geschnitten' },
  { g: 'pfeifen',   art: 'u', fam: 'ei-i', stufe: 4, hv: 'haben', prt: 'pfiff',   p2: 'gepfiffen' },
  { g: 'streiten',  art: 'u', fam: 'ei-i', stufe: 4, hv: 'haben', prt: 'stritt',  p2: 'gestritten' },
  // i → a
  { g: 'singen',    art: 'u', fam: 'i-a', stufe: 3, hv: 'haben', prt: 'sang',    p2: 'gesungen' },
  { g: 'trinken',   art: 'u', fam: 'i-a', stufe: 3, hv: 'haben', prt: 'trank',   p2: 'getrunken' },
  { g: 'finden',    art: 'u', fam: 'i-a', stufe: 3, hv: 'haben', prt: 'fand',    p2: 'gefunden' },
  { g: 'springen',  art: 'u', fam: 'i-a', stufe: 4, hv: 'sein',  prt: 'sprang',  p2: 'gesprungen' },
  { g: 'schwimmen', art: 'u', fam: 'i-a', stufe: 4, hv: 'sein',  prt: 'schwamm', p2: 'geschwommen' },
  { g: 'beginnen',  art: 'u', fam: 'i-a', stufe: 4, hv: 'haben', prt: 'begann',  p2: 'begonnen' },
  // ie → o
  { g: 'fliegen',   art: 'u', fam: 'ie-o', stufe: 3, hv: 'sein',  prt: 'flog',   p2: 'geflogen' },
  { g: 'verlieren', art: 'u', fam: 'ie-o', stufe: 4, hv: 'haben', prt: 'verlor', p2: 'verloren' },
  { g: 'riechen',   art: 'u', fam: 'ie-o', stufe: 4, hv: 'haben', prt: 'roch',   p2: 'gerochen' },
  { g: 'ziehen',    art: 'u', fam: 'ie-o', stufe: 4, hv: 'haben', prt: 'zog',    p2: 'gezogen' },
  { g: 'frieren',   art: 'u', fam: 'ie-o', stufe: 4, hv: 'haben', prt: 'fror',   p2: 'gefroren' },
  // e → a
  { g: 'geben',     art: 'u', fam: 'e-a', stufe: 3, hv: 'haben', prt: 'gab',    p2: 'gegeben',    praes: { 1: 'gibst', 2: 'gibt' } },
  { g: 'lesen',     art: 'u', fam: 'e-a', stufe: 3, hv: 'haben', prt: 'las',    p2: 'gelesen',    praes: { 1: 'liest', 2: 'liest' } },
  { g: 'essen',     art: 'u', fam: 'e-a', stufe: 3, hv: 'haben', prt: 'aß',     p2: 'gegessen',   praes: { 1: 'isst', 2: 'isst' } },
  { g: 'sehen',     art: 'u', fam: 'e-a', stufe: 3, hv: 'haben', prt: 'sah',    p2: 'gesehen',    praes: { 1: 'siehst', 2: 'sieht' } },
  { g: 'sprechen',  art: 'u', fam: 'e-a', stufe: 4, hv: 'haben', prt: 'sprach', p2: 'gesprochen', praes: { 1: 'sprichst', 2: 'spricht' } },
  { g: 'helfen',    art: 'u', fam: 'e-a', stufe: 4, hv: 'haben', prt: 'half',   p2: 'geholfen',   praes: { 1: 'hilfst', 2: 'hilft' } },
  { g: 'nehmen',    art: 'u', fam: 'e-a', stufe: 4, hv: 'haben', prt: 'nahm',   p2: 'genommen',   praes: { 1: 'nimmst', 2: 'nimmt' } },
  { g: 'treffen',   art: 'u', fam: 'e-a', stufe: 4, hv: 'haben', prt: 'traf',   p2: 'getroffen',  praes: { 1: 'triffst', 2: 'trifft' } },
  // a/au/u → ie/i
  { g: 'schlafen',  art: 'u', fam: 'a-ie', stufe: 3, hv: 'haben', prt: 'schlief', p2: 'geschlafen', praes: { 1: 'schläfst', 2: 'schläft' } },
  { g: 'laufen',    art: 'u', fam: 'a-ie', stufe: 3, hv: 'sein',  prt: 'lief',    p2: 'gelaufen',   praes: { 1: 'läufst', 2: 'läuft' } },
  { g: 'rufen',     art: 'u', fam: 'a-ie', stufe: 3, hv: 'haben', prt: 'rief',    p2: 'gerufen' },
  { g: 'fallen',    art: 'u', fam: 'a-ie', stufe: 4, hv: 'sein',  prt: 'fiel',    p2: 'gefallen',   praes: { 1: 'fällst', 2: 'fällt' } },
  { g: 'halten',    art: 'u', fam: 'a-ie', stufe: 4, hv: 'haben', prt: 'hielt',   p2: 'gehalten',   praes: { 1: 'hältst', 2: 'hält' } },
  { g: 'fangen',    art: 'u', fam: 'a-ie', stufe: 4, hv: 'haben', prt: 'fing',    p2: 'gefangen',   praes: { 1: 'fängst', 2: 'fängt' } },
  // a → u
  { g: 'fahren',    art: 'u', fam: 'a-u', stufe: 3, hv: 'sein',  prt: 'fuhr',  p2: 'gefahren',  praes: { 1: 'fährst', 2: 'fährt' } },
  { g: 'tragen',    art: 'u', fam: 'a-u', stufe: 3, hv: 'haben', prt: 'trug',  p2: 'getragen',  praes: { 1: 'trägst', 2: 'trägt' } },
  { g: 'waschen',   art: 'u', fam: 'a-u', stufe: 4, hv: 'haben', prt: 'wusch', p2: 'gewaschen', praes: { 1: 'wäschst', 2: 'wäscht' } },
  // Mischverben (Vokal und -te)
  { g: 'rennen',    art: 'u', fam: 'misch', stufe: 3, hv: 'sein',  prt: 'rannte',  p2: 'gerannt' },
  { g: 'bringen',   art: 'u', fam: 'misch', stufe: 4, hv: 'haben', prt: 'brachte', p2: 'gebracht' },
  { g: 'denken',    art: 'u', fam: 'misch', stufe: 4, hv: 'haben', prt: 'dachte',  p2: 'gedacht' },
  { g: 'kennen',    art: 'u', fam: 'misch', stufe: 4, hv: 'haben', prt: 'kannte',  p2: 'gekannt' },
  // Einzelgänger
  { g: 'sein',      art: 'u', fam: 'einzel', stufe: 3, hv: 'sein',  prt: 'war',   p2: 'gewesen',
    praes: { 0: 'bin', 1: 'bist', 2: 'ist', 3: 'sind', 4: 'seid', 5: 'sind' } },
  { g: 'haben',     art: 'u', fam: 'einzel', stufe: 3, hv: 'haben', prt: 'hatte', p2: 'gehabt', praes: { 1: 'hast', 2: 'hat' } },
  { g: 'gehen',     art: 'u', fam: 'einzel', stufe: 3, hv: 'sein',  prt: 'ging',  p2: 'gegangen' },
  { g: 'kommen',    art: 'u', fam: 'einzel', stufe: 3, hv: 'sein',  prt: 'kam',   p2: 'gekommen' },
  { g: 'stehen',    art: 'u', fam: 'einzel', stufe: 3, hv: 'haben', prt: 'stand', p2: 'gestanden' },
  { g: 'sitzen',    art: 'u', fam: 'einzel', stufe: 3, hv: 'haben', prt: 'saß',   p2: 'gesessen' },
  { g: 'liegen',    art: 'u', fam: 'einzel', stufe: 4, hv: 'haben', prt: 'lag',   p2: 'gelegen' },
  { g: 'tun',       art: 'u', fam: 'einzel', stufe: 4, hv: 'haben', prt: 'tat',   p2: 'getan',
    praes: { 0: 'tue', 1: 'tust', 2: 'tut', 3: 'tun', 4: 'tut', 5: 'tun' } },
  { g: 'werden',    art: 'u', fam: 'einzel', stufe: 4, hv: 'sein',  prt: 'wurde', p2: 'geworden', praes: { 1: 'wirst', 2: 'wird' }, futurNurImSatz: true },

  // ---------- Nur Perfekt-Werkstatt, Profi in Stufe 4 (Spiel 10, Teil B) – freigegeben 20.11.2026 ----------
  { g: 'besuchen',     art: 'r', stufe: 4, hv: 'haben', nur: 'perfekt', ohneGe: true },
  { g: 'erzählen',     art: 'r', stufe: 4, hv: 'haben', nur: 'perfekt', ohneGe: true },
  { g: 'telefonieren', art: 'r', stufe: 4, hv: 'haben', nur: 'perfekt', ohneGe: true },
  { g: 'aufwachen',    art: 'r', stufe: 4, hv: 'sein',  nur: 'perfekt', teil: 'auf' },
  { g: 'einkaufen',    art: 'r', stufe: 4, hv: 'haben', nur: 'perfekt', teil: 'ein' },
];

export const verbByGrundform = Object.fromEntries(VERBEN.map(v => [v.g, v]));

// ----------------------------------------------------------------------------
// Formen bilden
// ----------------------------------------------------------------------------
// Ergebnis jeder Form: { text, stamm, endung } – stamm/endung nur bei regelmäßigen Verben
// (für die Farbcodierung: Wortstamm schwarz unterstrichen, Endung in der Farbe der Zeitform).

const ohneTeil = v => (v.teil ? v.g.slice(v.teil.length) : v.g);

// Wortstamm der Grundform: malen → mal, sammeln → sammel, wandern → wander, tun → tu
export function wortstamm(v) {
  const g = ohneTeil(v);
  if (/(el|er)n$/.test(g)) return g.slice(0, -1);
  if (g.endsWith('en')) return g.slice(0, -2);
  return g.slice(0, -1);
}

// Besonderheiten regelmäßiger Verben (Stufe 3 übt nur Verben ohne Besonderheit):
//   'dt'  Stamm auf d/t   → du redest, er redet, er redete
//   'sz'  Stamm auf s/ß/z → du tanzt, du reist
//   'eln' -eln/-ern       → ich sammle, wir wandern
export function besonderheit(v) {
  const g = ohneTeil(v);
  if (/(el|er)n$/.test(g)) return 'eln';
  const s = wortstamm(v);
  if (/[dt]$/.test(s)) return 'dt';
  if (/[sßzx]$/.test(s) && !/sch$/.test(s)) return 'sz';
  return null;
}

const ENDUNG_PRAES = ['e', 'st', 't', 'en', 't', 'en'];
const ENDUNG_PRAET = ['te', 'test', 'te', 'ten', 'tet', 'ten'];

function praesensRegel(v) {
  const s = wortstamm(v), b = besonderheit(v);
  return ENDUNG_PRAES.map((e, i) => {
    let stamm = s, endung = e;
    if (b === 'dt' && (i === 1 || i === 2 || i === 4)) endung = 'e' + e;     // redest, redet
    if (b === 'sz' && i === 1) endung = 't';                                // du tanzt
    if (b === 'eln') {
      if (i === 3 || i === 5) endung = 'n';                                 // wir wandern
      if (i === 0 && s.endsWith('el')) stamm = s.slice(0, -2) + 'l';        // ich sammle
    }
    return { stamm, endung };
  });
}

export function praesens(v) {
  const regel = praesensRegel(v);
  return regel.map((f, i) => {
    const eigen = v.praes && v.praes[i];
    if (eigen) return { text: eigen };
    const text = f.stamm + f.endung;
    return v.art === 'r' ? { text, stamm: f.stamm, endung: f.endung } : { text };
  });
}

export function praeteritum(v) {
  if (v.art === 'r') {
    const s = wortstamm(v), b = besonderheit(v);
    return ENDUNG_PRAET.map(e => {
      const endung = b === 'dt' ? 'e' + e : e;                              // redete, arbeitete
      return { text: s + endung, stamm: s, endung };
    });
  }
  // unregelmäßig: ich ging, du gingst, er ging, wir gingen, ihr gingt, sie gingen
  const p = v.prt;
  const aufE = p.endsWith('e');                       // rannte, wurde, hatte, schrie
  const aufDT = /[dt]$/.test(p);                      // fand, stand, hielt, tat, schnitt
  const aufSZ = /[sßz]$/.test(p);                     // aß, las, saß
  const du = aufE ? p + 'st' : (aufDT || aufSZ) ? p + 'est' : p + 'st';
  const wir = aufE ? p + 'n' : p + 'en';
  const ihr = aufE ? p + 't' : aufDT ? p + 'et' : p + 't';
  return [p, du, p, wir, ihr, wir].map(text => ({ text }));
}

export function partizip(v) {
  if (v.p2) return v.p2;
  const s = wortstamm(v), b = besonderheit(v);
  const kern = s + (b === 'dt' ? 'et' : 't');
  if (v.ohneGe) return kern;
  return (v.teil || '') + 'ge' + kern;
}

const HABEN = ['habe', 'hast', 'hat', 'haben', 'habt', 'haben'];
const SEIN = ['bin', 'bist', 'ist', 'sind', 'seid', 'sind'];
const WERDEN = ['werde', 'wirst', 'wird', 'werden', 'werdet', 'werden'];

// Perfekt und Futur: zwei Teile (Hilfsverb in der Personalform + Partizip bzw. Grundform am Satzende)
export function perfekt(v) {
  const hv = v.hv === 'sein' ? SEIN : HABEN, p = partizip(v);
  return hv.map(h => ({ text: h + ' ' + p, hilfsverb: h, zweites: p }));
}

export function futur(v) {
  return WERDEN.map(w => ({ text: w + ' ' + v.g, hilfsverb: w, zweites: v.g }));
}

// Trennbare Verben (nur Perfekt-Werkstatt): Präsens/Präteritum mit abgetrenntem Teil am Satzende
function mitTeil(v, formen) {
  if (!v.teil) return formen;
  return formen.map(f => ({ text: f.text + ' … ' + v.teil }));
}

export function alleFormen(v) {
  return {
    praesens: mitTeil(v, praesens(v)),
    praeteritum: mitTeil(v, praeteritum(v)),
    perfekt: perfekt(v),
    futur: futur(v),
    partizip: partizip(v),
  };
}

// Präteritum-Formen unregelmäßiger Verben mit eingeschobenem -e- (du aßest, du fandest, ihr fandet …):
// werden nie abgefragt (Entscheidung der Lehrkraft 20.11.2026), dürfen aber in Tabellen stehen.
export function schwerePraeteritumForm(v, person) {
  if (v.art !== 'u' || !v.prt || v.prt.endsWith('e')) return false;
  const f = praeteritum(v)[person].text;
  return (person === 1 && f.endsWith('est')) || (person === 4 && f.endsWith('et'));
}

// Ist eine getippte Form richtig? Hauptform oder eine erlaubte Doppelform (auchRichtig)
export function formRichtig(v, zeit, person, eingabe) {
  const haupt = { praesens, praeteritum }[zeit](v)[person].text;
  const auch = (v.auchRichtig && v.auchRichtig[zeit === 'praesens' ? 'praes' : 'prt'] && v.auchRichtig[zeit === 'praesens' ? 'praes' : 'prt'][person]) || [];
  return [haupt, ...auch].includes(eingabe);
}

// Auswahl für eine Stufe (Stufe 3 sieht nur Verben der Stufe 3)
export const verbenDerStufe = (stufe, filter = () => true) =>
  VERBEN.filter(v => v.stufe <= stufe && !v.nur && filter(v));
