// formen_liste.mjs – erzeugt werkzeuge/formen_liste.md aus der Datenliste src/verben.js
// (alle Verben in allen Personen in Präsens, Präteritum, Perfekt und Futur – zum Prüfen für die Lehrkraft).
// Aufruf im Repo-Ordner:  node werkzeuge/formen_liste.mjs
// Abhängigkeiten: nur Node 20 (keine Pakete). Liest dieselben Formen, die auch die App benutzt.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const hier = path.dirname(fileURLToPath(import.meta.url));
const quelle = fs.readFileSync(path.join(hier, '..', 'src', 'verben.js'), 'utf8');
const V = await import('data:text/javascript;charset=utf-8,' + encodeURIComponent(quelle));
const { VERBEN, PERSONEN, FAMILIEN, alleFormen, besonderheit } = V;

// Hinweise: ⚠ = bitte entscheiden, ✔ = von der Lehrkraft entschieden (20.11.2026), ℹ = nur zur Info
const HINWEISE = {
  rollen:   '✔ Perfekt mit sein – Sätze nur „Der Ball ist ins Tor gerollt.“',
  hüpfen:   'ℹ Perfekt mit sein (Bewegung von einem Ort zum anderen).',
  putzen:   '✔ du putzt (Stamm auf z): Stufe 3, aber nicht in der Endungs-Maschine der Stufe 3; in Stufe 4 dort als Profi.',
  tanzen:   'ℹ du tanzt (Stamm auf z). Nicht im Spiel „haben oder sein?“.',
  reisen:   'ℹ du reist (Stamm auf s), Perfekt mit sein.',
  reden:    'ℹ -e- nach d: du redest, er redet, er redete, geredet.',
  arbeiten: 'ℹ -e- nach t.',
  warten:   'ℹ -e- nach t.',
  baden:    'ℹ -e- nach d.',
  sammeln:  '✔ ich sammle – „ich sammele“ gilt beim Tippen auch als richtig (Duden: samm[e]le). wir/sie sammel|n: Endung -n, in Stufe 4 steht -n in der Leiste.',
  wandern:  '✔ wir/sie wander|n: Endung -n, in Stufe 4 steht -n in der Leiste der Endungs-Maschine. Perfekt mit sein.',
  schreien: 'ℹ Partizip „geschrien“ (nicht „geschrieen“); wir schrien, ihr schriet.',
  schneiden:'✔ du schnittest, ihr schnittet werden nicht abgefragt.',
  streiten: '✔ du strittest, ihr strittet werden nicht abgefragt.',
  finden:   '✔ du fandest, ihr fandet werden nicht abgefragt.',
  beginnen: 'ℹ Partizip ohne ge-: begonnen.',
  verlieren:'ℹ Partizip ohne ge-: verloren.',
  ziehen:   'ℹ haben (festgelegt: nur „an etwas ziehen“).',
  frieren:  'ℹ haben (festgelegt: nur „mir ist kalt“).',
  fliegen:  'ℹ sein (festgelegt: nur „selbst fliegen“).',
  schwimmen:'ℹ sein (festgelegt).',
  essen:    '✔ du aßest (Präteritum) wird nicht abgefragt.',
  lesen:    '✔ du lasest (Präteritum) wird nicht abgefragt; ihr lest / ihr last.',
  halten:   '✔ du hieltest, ihr hieltet werden nicht abgefragt. Präsens: er hält (ohne -et), aber ihr haltet.',
  fahren:   'ℹ sein – Sätze nur „selbst fahren“ (nicht „Papa hat das Auto gefahren“).',
  waschen:  'ℹ du wäschst (mit sch-st).',
  stehen:   '✔ du standest, ihr standet werden nicht abgefragt. Perfekt mit haben (süddeutsch auch „bin gestanden“).',
  sitzen:   '✔ du saßest wird nicht abgefragt. Perfekt mit haben (süddeutsch auch „bin gesessen“).',
  liegen:   'ℹ haben (süddeutsch auch „bin gelegen“). Verwechslungsgefahr mit legen (regelmäßig).',
  legen:    'ℹ Verwechslungsgefahr mit liegen (lag, gelegen).',
  tun:      '✔ du tatest, ihr tatet werden nicht abgefragt. Präsens: ich tue.',
  werden:   '✔ Futur nur in Sätzen, in denen es natürlich klingt („Ich werde später Tierärztin werden.“). Präsens „ich werde müde“ ist im Detektiv eine Falle.',
  besuchen: '✔ nur Perfekt-Werkstatt, Profi in Stufe 4 (Partizip ohne ge-).',
  erzählen: '✔ nur Perfekt-Werkstatt, Profi in Stufe 4 (Partizip ohne ge-).',
  telefonieren: '✔ nur Perfekt-Werkstatt, Profi in Stufe 4 (Partizip ohne ge-).',
  aufwachen:'✔ nur Perfekt-Werkstatt, Profi in Stufe 4 (ge- in der Mitte). Trennbar: ich wache … auf.',
  einkaufen:'✔ nur Perfekt-Werkstatt, Profi in Stufe 4 (ge- in der Mitte). Trennbar: ich kaufe … ein.',
};

const BES = { dt: 'Stamm auf d/t', sz: 'Stamm auf s/ß/z', eln: '-eln/-ern' };

// Präsens/Präteritum regelmäßiger Verben mit Trennstrich Stamm|Endung (so färbt die App)
// In einer Markdown-Tabelle muss der Strich als \| stehen, sonst beginnt eine neue Spalte.
const zeige = f => (f.stamm !== undefined ? `${f.stamm}\\|${f.endung}` : f.text);

const zeilen = [];
const z = s => zeilen.push(s);

z('# Formenliste – Zeitreise');
z('');
z(`Erzeugt am ${new Date().toLocaleDateString('de-DE')} aus \`src/verben.js\` mit \`node werkzeuge/formen_liste.mjs\` – dieselben Formen benutzt die App. Alle Prüfpunkte wurden am 20.11.2026 mit der Lehrkraft entschieden (✔). Änderungen macht Claude in \`src/verben.js\`, nicht in dieser Datei.`);
z('');
z('**Lesehilfe:** `mal|e` = Wortstamm | Endung (nur bei regelmäßigen Verben; in der App: Stamm schwarz unterstrichen, Endung in der Zeitfarbe). Stufe 3 = schon in Klasse 3 (`?stufe=3`), Stufe 4 = erst in Klasse 4. Hilfsverb = Perfekt mit haben oder sein. ⚠ = bitte entscheiden, ✔ = entschieden, ℹ = nur zur Info.');
z('');

// --- Zum Prüfen
const offen = VERBEN.filter(v => (HINWEISE[v.g] || '').startsWith('⚠'));
const entschieden = VERBEN.filter(v => (HINWEISE[v.g] || '').startsWith('✔'));
z(`## Noch offen: ${offen.length} Punkte mit ⚠`);
z('');
offen.forEach(v => z(`- **${v.g}:** ${HINWEISE[v.g].slice(2)}`));
if (!offen.length) z('Keine.');
z('');
z(`## Entschieden am 20.11.2026: ${entschieden.length} Punkte mit ✔`);
z('');
entschieden.forEach(v => z(`- **${v.g}:** ${HINWEISE[v.g].slice(2)}`));
z('- **Futur in Stufe 3:** alle Verben der Stufe 3.');
z('- **beißen:** gestrichen (kommt in der App nicht vor).');
z('- **ihr last, ihr aßt, ihr saßt:** werden normal abgefragt.');
z('');

// --- Zählung
const regel = VERBEN.filter(v => v.art === 'r' && !v.nur), unreg = VERBEN.filter(v => v.art === 'u'), extra = VERBEN.filter(v => v.nur);
const st = (liste, s) => liste.filter(v => v.stufe === s).length;
z('## Übersicht');
z('');
z(`- Regelmäßig: ${regel.length} Verben (Stufe 3: ${st(regel, 3)}, Stufe 4: ${st(regel, 4)})`);
z(`- Unregelmäßig: ${unreg.length} Verben (Stufe 3: ${st(unreg, 3)}, Stufe 4: ${st(unreg, 4)}), Perfekt mit sein: ${unreg.filter(v => v.hv === 'sein').length}`);
z(`- Nur Perfekt-Werkstatt: ${extra.length} Verben`);
z('');
z('| Nr | Grundform | Art | Familie | Stufe | Hilfsverb | ich (Präsens) | ich (Präteritum) | Partizip | Besonderheit |');
z('|---|---|---|---|---|---|---|---|---|---|');
VERBEN.forEach((v, i) => {
  const f = alleFormen(v);
  const bes = v.art === 'r' ? (BES[besonderheit(v)] || '') : '';
  z(`| ${i + 1} | ${v.g} | ${v.art === 'r' ? 'regelmäßig' : 'unregelmäßig'} | ${v.fam ? FAMILIEN[v.fam].titel : '–'} | ${v.stufe} | ${v.hv} | ${f.praesens[0].text} | ${f.praeteritum[0].text} | ${f.partizip} | ${bes}${v.nur ? ' nur Perfekt-Werkstatt' : ''} |`);
});
z('');

const block = v => {
  const f = alleFormen(v);
  const teile = [v.art === 'r' ? 'regelmäßig' : 'unregelmäßig'];
  if (v.fam) teile.push('Familie ' + FAMILIEN[v.fam].titel);
  teile.push('Stufe ' + v.stufe, 'Perfekt mit ' + v.hv);
  if (v.art === 'r' && besonderheit(v)) teile.push(BES[besonderheit(v)]);
  z(`### ${v.g}`);
  z('');
  z(teile.join(' · '));
  if (HINWEISE[v.g]) { z(''); z(HINWEISE[v.g]); }
  z('');
  z('| Person | Präsens | Präteritum | Perfekt | Futur |');
  z('|---|---|---|---|---|');
  PERSONEN.forEach((p, i) => z(`| ${p} | ${zeige(f.praesens[i])} | ${zeige(f.praeteritum[i])} | ${f.perfekt[i].text} | ${f.futur[i].text} |`));
  z('');
};

z('## Regelmäßige Verben');
z('');
regel.forEach(block);
z('## Unregelmäßige Verben');
z('');
for (const fam of Object.keys(FAMILIEN)) {
  const liste = unreg.filter(v => v.fam === fam);
  if (!liste.length) continue;
  z(`## Familie ${FAMILIEN[fam].titel}`);
  z('');
  liste.forEach(block);
}
z('## Nur für die Perfekt-Werkstatt (Profi, Stufe 4)');
z('');
z('Diese Verben nennt der Auftrag beim Spiel 10 (Partizipien ohne ge- und mit ge- in der Mitte). Freigegeben am 20.11.2026, sie kommen nur dort vor.');
z('');
extra.forEach(block);

fs.writeFileSync(path.join(hier, 'formen_liste.md'), zeilen.join('\n'));
console.log(`formen_liste.md: ${VERBEN.length} Verben, ${offen.length} offen, ${entschieden.length} entschieden`);
