// aufgaben_liste.mjs – erzeugt werkzeuge/aufgaben_liste.md aus src/aufgaben.js (+ src/verben.js):
// alle Satzrahmen in allen Zeitformen, alle Texte im Präsens und Präteritum, sein & haben, Detektiv-Fallen, Futur-Fehler.
// Prüft dabei automatisch: Verben vorhanden, jeder Futur-Fehlersatz weicht vom richtigen Satz ab, Stufe der Texte, 4–6 Verben pro Text, keine Dopplungen, keine
// verbotenen Zeitangaben, keine schweren Präteritum-Formen, Lücke nie am Satzanfang, genau eine richtige Auswahl.
// Aufruf im Repo-Ordner:  node werkzeuge/aufgaben_liste.mjs     (nur Node 20, keine Pakete)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import os from 'node:os';
import { pathToFileURL } from 'node:url';

const hier = path.dirname(fileURLToPath(import.meta.url));
const src = f => fs.readFileSync(path.join(hier, '..', 'src', f), 'utf8');
// Zwischenkopie als .mjs (Node kennt sonst kein „import … from './verben'“ ohne Endung)
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'zeitreise-'));
fs.writeFileSync(path.join(tmp, 'verben.mjs'), src('verben.js'));
fs.writeFileSync(path.join(tmp, 'aufgaben.mjs'), src('aufgaben.js').replace("from './verben'", "from './verben.mjs'"));
const V = await import(pathToFileURL(path.join(tmp, 'verben.mjs')).href);
const A = await import(pathToFileURL(path.join(tmp, 'aufgaben.mjs')).href);
fs.rmSync(tmp, { recursive: true, force: true });
const { verbByGrundform, PERSONEN, schwerePraeteritumForm } = V;
const { SATZRAHMEN, TEXTE, SEIN_HABEN, DETEKTIV_FALLEN, baueSatz, satzErlaubt, textTeile, textAls, futurFehlersatz, FUTUR_FEHLER } = A;

const fehler = [];
const zeilen = [];
const z = s => zeilen.push(s);
const ZEITWORT = /\b(heute|gestern|morgen|vorhin|bald|jetzt|letzte|nächste)\b/i;

// ---------- Prüfungen
const rahmenVerben = new Set();
for (const r of SATZRAHMEN) {
  if (!verbByGrundform[r.v]) fehler.push(`Satzrahmen: Verb „${r.v}“ fehlt in der Verbliste`);
  if (rahmenVerben.has(r.v)) fehler.push(`Satzrahmen: „${r.v}“ doppelt`);
  rahmenVerben.add(r.v);
  if (ZEITWORT.test(r.rest)) fehler.push(`Satzrahmen „${r.v}“: Zeitangabe im Satzrest („${r.rest}“)`);
}
const reste = SATZRAHMEN.map(r => r.rest);
reste.forEach((r, i) => { if (reste.indexOf(r) !== i) fehler.push(`Satzrahmen: Satzrest „${r}“ doppelt`); });
const ohneRahmen = V.VERBEN.filter(v => !v.nur && !rahmenVerben.has(v.g)).map(v => v.g);
if (ohneRahmen.length) fehler.push(`Verben ohne Satzrahmen: ${ohneRahmen.join(', ')}`);

for (const t of TEXTE) {
  const verben = textTeile(t, 'praesens').filter(x => x.v);
  if (verben.length < 4 || verben.length > 6) fehler.push(`Text „${t.titel}“: ${verben.length} Verben (soll 4–6)`);
  for (const x of verben) {
    const v = verbByGrundform[x.v];
    if (!v) { fehler.push(`Text „${t.titel}“: Verb „${x.v}“ fehlt in der Verbliste`); continue; }
    if (v.stufe > t.stufe) fehler.push(`Text „${t.titel}“ (Stufe ${t.stufe}): „${x.v}“ ist erst Stufe ${v.stufe}`);
    if (schwerePraeteritumForm(v, x.p)) fehler.push(`Text „${t.titel}“: schwere Präteritum-Form bei „${x.v}“`);
  }
  if (/„|“|"/.test(t.text)) fehler.push(`Text „${t.titel}“: wörtliche Rede / Anführungszeichen`);
  if (ZEITWORT.test(t.text.replace(/\{[^}]+\}/g, ''))) fehler.push(`Text „${t.titel}“: Zeitangabe, die nur zu einer Zeitform passt`);
}
const titel = TEXTE.map(t => t.titel);
titel.forEach((x, i) => { if (titel.indexOf(x) !== i) fehler.push(`Texttitel „${x}“ doppelt`); });
for (const s of [3, 4]) {
  const n = TEXTE.filter(t => t.stufe === s).length;
  if (n < 8) fehler.push(`Stufe ${s}: nur ${n} Texte (soll mindestens 8)`);
}

for (const a of SEIN_HABEN) {
  if (a.satz.trim().startsWith('___')) fehler.push(`sein & haben: Lücke am Satzanfang („${a.satz}“)`);
  if (a.wahl.filter(w => w === a.luecke).length !== 1) fehler.push(`sein & haben: richtige Form nicht genau einmal („${a.satz}“)`);
  if (new Set(a.wahl).size !== a.wahl.length) fehler.push(`sein & haben: doppelte Auswahl („${a.satz}“)`);
  if (/\bisst\b/.test(a.wahl.join(' '))) fehler.push(`sein & haben: „isst“ als Auswahl („${a.satz}“)`);
  const v = verbByGrundform[a.verb];
  const formen = (a.zeit === 'praesens' ? V.praesens(v) : V.praeteritum(v)).map(f => f.text);
  if (!formen.includes(a.luecke)) fehler.push(`sein & haben: „${a.luecke}“ ist keine ${a.zeit}-Form von ${a.verb}`);
  // Ablenker, die eine echte Form desselben Verbs in der ANDEREN Zeitform sind, könnten auch passen
  // („Auf der Feier haben wir viel Spaß.“) → Fehler. Formen derselben Zeit für eine andere Person sind erlaubt.
  const andere = (a.zeit === 'praesens' ? V.praeteritum(v) : V.praesens(v)).map(f => f.text);
  const p = formen.indexOf(a.luecke);
  a.wahl.filter(w => w !== a.luecke && w === andere[p]).forEach(w => fehler.push(`sein & haben: Ablenker „${w}“ passt auch (andere Zeitform) – „${a.satz}“`));
}

// Futur-Fehlersätze: für alle Rahmen, Personen und Fehlerarten – entweder null oder wirklich anders als der richtige Satz
let fehlersaetze = 0;
for (const r of SATZRAHMEN) for (let p = 0; p < 6; p++) {
  if (!satzErlaubt(r, p, 'futur')) continue;
  for (const f of FUTUR_FEHLER) {
    const s = futurFehlersatz(r, p, f.art);
    if (!s) continue;
    fehlersaetze++;
    if (s.text === s.fix) fehler.push(`Futur-Fehlersatz gleich dem richtigen Satz: „${s.text}“`);
  }
}

// ---------- Prüfliste schreiben
z('# Sätze und Texte – Zeitreise (Etappe 1b)');
z('');
z(`Erzeugt am ${new Date().toLocaleDateString('de-DE')} aus \`src/aufgaben.js\` mit \`node werkzeuge/aufgaben_liste.mjs\`. Alle Verbformen kommen aus der Verbliste, nichts ist eingetippt. **Bitte lesen und freigeben, bevor die Spiele darauf aufbauen.**`);
z('');
z(fehler.length ? `## ⚠ Automatische Prüfung: ${fehler.length} Fehler` : '## ✔ Automatische Prüfung: keine Fehler');
z('');
z('Geprüft: alle Verben in der Liste, Stufe der Texte, 4–6 Verben pro Text, mindestens 8 Texte pro Stufe, keine doppelten Satzreste oder Titel, keine Zeitangaben wie „heute/gestern/morgen“, keine wörtliche Rede in Texten, keine schweren Präteritum-Formen (du aßest …), Lücke nie am Satzanfang, genau eine richtige Auswahl, jeder Futur-Fehlersatz weicht vom richtigen Satz ab.');
z('');
fehler.forEach(f => z(`- ${f}`));
z('');

z('## 1. Satzrahmen (Zeitmaschinen-Tore, Zeitform-Detektiv, Sätze bauen: Futur, Erkunde die Zeiten)');
z('');
z('Je Verb ein Satz. Gezeigt für **ich**, **er/sie/es** (mit einem Namen) und **sie** (Mehrzahl) in allen vier Zeitformen. In der App wechseln Personen und Namen.');
z('');
for (const stufe of [3, 4]) {
  z(`### Verben der Stufe ${stufe}`);
  z('');
  z('| Verb | Präsens | Präteritum | Perfekt | Futur |');
  z('|---|---|---|---|---|');
  for (const r of SATZRAHMEN.filter(r => verbByGrundform[r.v].stufe === stufe)) {
    const personen = [0, 2, 5].filter(p => satzErlaubt(r, p, 'praesens'));
    const zelle = zeit => personen.filter(p => satzErlaubt(r, p, zeit)).map((p, i) => baueSatz(r, p, zeit, i).text).join('<br>');
    z(`| ${r.v} | ${zelle('praesens')} | ${zelle('praeteritum')} | ${zelle('perfekt')} | ${zelle('futur')} |`);
  }
  z('');
}

z('## 2. Texte (Finde den Unterschied, Text-Zeitmaschine, Zeit-Chaos reparieren)');
z('');
z('Verben **fett**. Jeder Text kommt im Präsens und im Präteritum vor. Beim Zeit-Chaos stehen in der Präteritum-Fassung 2–3 Verben „aus der Zeit gefallen“ im Präsens. (Perfekt-Fassungen für Stufe 4 folgen in Etappe 1c.)');
z('');
for (const stufe of [3, 4]) {
  z(`### Stufe ${stufe}`);
  z('');
  for (const t of TEXTE.filter(t => t.stufe === stufe)) {
    const fett = zeit => textTeile(t, zeit).map(x => (x.v ? `**${x.t}**` : x.t)).join('');
    z(`**${t.titel}** (${textTeile(t, 'praesens').filter(x => x.v).length} Verben)`);
    z('');
    z(`- Präsens: ${fett('praesens')}`);
    z(`- Präteritum: ${fett('praeteritum')}`);
    z('');
  }
}

z('## 3. sein & haben (Lückensätze mit Auswahl)');
z('');
z('| Satz | richtig | Auswahl |');
z('|---|---|---|');
SEIN_HABEN.forEach(a => z(`| ${a.satz.replace('___', '…')} | **${a.luecke}** | ${a.wahl.join(' · ')} |`));
z('');

z('## 4. Zeitform-Detektiv: Fallen (zweite Hälfte der Runde)');
z('');
z('| Satz | Zeitform | Stufe | Rückmeldung |');
z('|---|---|---|---|');
const ZN = { praesens: 'Präsens', praeteritum: 'Präteritum', perfekt: 'Perfekt', futur: 'Futur' };
DETEKTIV_FALLEN.forEach(f => z(`| ${f.satz} | ${ZN[f.zeit]} | ${f.stufe === 3 ? '3+4' : '4'} | ${f.grund} |`));
z('');

z('## 5. Sätze bauen: Futur – Richtig oder Fehler? (Beispiele)');
z('');
z('Die Fehlersätze entstehen automatisch aus den Satzrahmen. Hier je Fehlerart drei Beispiele.');
z('');
z('| Fehlerart | Stufe | Fehlersatz | richtig | Rückmeldung |');
z('|---|---|---|---|---|');
const beispiele = ['malen', 'gehen', 'trinken'].map(v => SATZRAHMEN.find(r => r.v === v));
FUTUR_FEHLER.forEach(f => beispiele.forEach((r, i) => {
  const s = futurFehlersatz(r, [0, 1, 2][i], f.art, i);
  if (s) z(`| ${f.art} | ${f.stufe === 3 ? '3+4' : '4'} | ${s.text} | ${s.fix} | ${s.warum} |`);
}));
z('');
z(`Insgesamt ${fehlersaetze} mögliche Fehlersätze; bei „wir“ und „sie“ gibt es keinen Personalform-Fehler (dort ist die Personalform gleich der Grundform).`);
z('');

fs.writeFileSync(path.join(hier, 'aufgaben_liste.md'), zeilen.join('\n'));
console.log(`aufgaben_liste.md: ${SATZRAHMEN.length} Satzrahmen, ${TEXTE.length} Texte, ${SEIN_HABEN.length} sein/haben-Sätze, ${DETEKTIV_FALLEN.length} Fallen – ${fehler.length} Fehler`);
fehler.forEach(f => console.log('  ⚠ ' + f));
