// ============================================================================
// ZEITREISE – Zeitformen der Verben (Klasse 3/4, Grundschule NRW)
// ============================================================================
// Aufbau (Suchbegriffe in Großbuchstaben):
//   EINSTELLUNGEN      BASIS, ADMIN_PASSWORD, VORLESEN (nur Basis), readUrlSettings (?stufe=3, ?anim=0), settingsLink
//   FARBEN             ZEITEN (Farbcodierung der Zeitformen, Tailwind-Klassen ausgeschrieben)
//   SPIELE             GAMES, GAME_ORDER (nie umsortieren!), STATIONEN, UNLOCK_REQ, BASICS
//   KÖNNEN             SKILLS (nie umsortieren!), GAME_SKILLS, skillLevel, SkillContext, useTrack
//   ZEITREISE-CODE     generateCode, parseCode
//   TON & VORLESEN     tonWecken, ton, sprich
//   ANZEIGE-BAUSTEINE  Wortform, Klammersatz, FormenTabelle, Modal, Erzaehler, TippFenster, Sterne
//   MERKSÄTZE          MERKSAETZE, LEUCHTTAFEL, Leuchttafel (Rahmen für alle farbcodierten Inhalte), MerksatzKarte, MerksaetzeFenster
//   HILFE              HILFE, HilfeFenster („Reise-Hilfe“ wie „Zauber-Hilfe“)
//   SPIELE             mische, waehle, useRunde, RundenRahmen, TippFeld, diagnose; EndungsMaschine/TeWerkstatt, ToreSpiel (Tore + Detektiv),
//                      FindeUnterschied, TextZeitmaschine/ZeitChaos, SeinHaben, WoerterbuchForscher, VerbFamilien, FormenTabelleSpiel,
//                      FuturSpiel, PerfektWerkstatt, SaetzeBauenPerfekt; SPIEL_KOMPONENTE (Spiel-id → Komponente)
//   KARTE              ZONE, PFAD, naechstesSpiel, MenuButton, Station, Karte
//   FENSTER            ErgebnisSeite, CodeFenster, KoennenFenster, AdminAnmeldung, LehrerBereich, ImpressumModal
//   ERKUNDEN           ErkundeZeiten (Werkzeug „Erkunde die Zeiten“ = Zeit-Schieberegler, Beam durch die Zeit)
//   ZEITSPRUNG         Zeitsprung (Animation beim Zonenwechsel), ZEITSPRUNG_ZIEL, ZEITSPRUNG_FARBE
//   APP                KopfLeiste, export default function App
//
// Look: dunkel wie die Schwester-Apps (feste Kopfleiste mit Leuchtknöpfen, dunkle Fenster, Tailwind-Standardschrift),
// eigenes Thema: Sternenhimmel in Tiefblau mit EINER Leitfarbe (Cyan = Zeitmaschine). Die vier Zeitfarben leuchten nur als
// Neon-Akzente (ZONE). Inhalte mit Farbcodierung (Endungen, Verbklammer) stehen auf einer Leuchttafel: helle Karte mit den
// Farben wie auf Papier, außen ein leuchtender Rahmen in der Zeitfarbe.
import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, Award, BookA, BookOpen, Blocks, CircleHelp, Cog, Copy, DoorOpen, Gauge,
  Hammer, Hourglass, House, Key, Lock, Play, Puzzle, RotateCcw, Rocket, ScanEye, ScrollText, Search, Settings,
  Printer, SlidersHorizontal, Sparkles, Star, X, Trophy, Zap, Flame, CloudRain, Keyboard, Table2, TableProperties, Target, Volume2, Wrench, Shuffle, Users,
} from 'lucide-react';
import qrcode from 'qrcode-generator';
import { createPortal } from 'react-dom';
import { SAETZE } from './saetze';
import {
  PERSONEN, VERBEN, FAMILIEN, verbByGrundform, praesens, praeteritum, perfekt, futur, partizip, wortstamm, besonderheit, formRichtig, schwerePraeteritumForm,
} from './verben';
import {
  rahmenDerStufe, baueSatz, satzErlaubt, textTeile, texteDerStufe, SEIN_HABEN, DETEKTIV_FALLEN, FUTUR_FEHLER, futurFehlersatz,
} from './aufgaben';

// ==========================================
// EINSTELLUNGEN
// ==========================================
// Ein Quelltext für beide Versionen. Der Bau setzt __BASIS__ (werkzeuge/lokal_bauen.sh).
// Heute nur normal (__BASIS__=false); Etappe 3: Basis-Version unter …/basis/ mit __BASIS__=true.
// Alle Unterschiede später über if (BASIS) kapseln. GAME_ORDER und SKILLS sind in beiden gleich → Codes passen in beide.
const BASIS = typeof __BASIS__ !== 'undefined' && __BASIS__;

const ADMIN_PASSWORD = 'Zeit123'; // von der Lehrkraft festgelegt (20.11.2026)

// Vorlesen (Knöpfe „Nochmal hören“ / „Vorlesen“) nur in der Basis-Version (Entscheidung der Lehrkraft 20.11.2026).
// Die Texte mit festen Schlüsseln in src/saetze.js bleiben für die Basis-Version erhalten.
const VORLESEN = BASIS;

const STANDARD = { stufe: 4, anim: true };

// Link-Parameter: ?stufe=3 → Präsens, Präteritum und Futur (ohne Perfekt; Futur in Stufe 3 seit 20.11.2026). Ohne Parameter: Stufe 4 (alles).
// ?anim=0 → keine Zeitsprung-Animationen (fallen auch weg, wenn das Gerät „Bewegung reduzieren“ eingestellt hat).
function readUrlSettings() {
  const p = new URLSearchParams(window.location.search), s = { ...STANDARD };
  if (p.get('stufe') === '3') s.stufe = 3;
  if (p.get('anim') === '0') s.anim = false;   // Zeitsprung-Animationen aus
  return s;
}

// Link mit allen Abweichungen vom Standard (für Lehrer-Bereich und QR-Code)
function settingsLink(s) {
  const basis = window.location.origin + window.location.pathname;
  const p = [];
  if (s.stufe !== STANDARD.stufe) p.push('stufe=' + s.stufe);
  if (!s.anim) p.push('anim=0');
  return p.length ? basis + '?' + p.join('&') : basis;
}

// ==========================================
// FARBEN – Farbcodierung (in App, Regeln und Arbeitsblättern gleich)
// ==========================================
// Pastell-Fläche, kräftiger Rand/Text – für Inhalte auf hellen Karten. Klassen immer vollständig ausschreiben.
// deutsch: deutsche Erklärung zum Fachwort (Entscheidung der Lehrkraft 20.11.2026), steht bei Merksätzen, Zeitstrahl,
// Leuchttafel und Stationen. Vorgelesen über die Schlüssel deutsch_<zeit> in src/saetze.js.
const ZEITEN = {
  praesens:    { name: 'Präsens',    deutsch: 'Gegenwart',                     flaeche: 'bg-rose-100',  rand: 'border-rose-500',  text: 'text-rose-700',  stroke: 'stroke-rose-500' },
  praeteritum: { name: 'Präteritum', deutsch: 'Vergangenheit (beim Schreiben)', flaeche: 'bg-amber-100', rand: 'border-amber-500', text: 'text-amber-700', stroke: 'stroke-amber-500' },
  perfekt:     { name: 'Perfekt',    deutsch: 'Vergangenheit (beim Erzählen)',  flaeche: 'bg-lime-100',  rand: 'border-lime-600',  text: 'text-lime-800',  stroke: 'stroke-lime-600' },
  futur:       { name: 'Futur',      deutsch: 'Zukunft',                       flaeche: 'bg-sky-100',   rand: 'border-sky-500',   text: 'text-sky-700',   stroke: 'stroke-sky-500' },
};

// ==========================================
// SPIELE
// ==========================================
// ACHTUNG: Die Reihenfolge in GAMES (= GAME_ORDER) ist Teil des Zeitreise-Codes – nie umsortieren!
// stufe: 3 = in Stufe 3 und 4, 4 = nur Stufe 4. merksatz: Schlüssel in MERKSAETZE (oder Liste mehrerer).
const GAMES = [
  { id: 'endungJetzt',      titel: 'Endungs-Maschine',     station: 1, stufe: 3, icon: Cog,        merksatz: 'praesens' },
  { id: 'tore',             titel: 'Zeit-Regen',           station: 2, stufe: 3, icon: CloudRain,  merksatz: 'erkennen' },   // bis 21.11.2026 „Zeitmaschinen-Tore“
  { id: 'zwillinge',        titel: 'Finde den Unterschied', station: 2, stufe: 3, icon: ScanEye,      merksatz: 'erkennen' },
  { id: 'teWerkstatt',      titel: 'te-Werkstatt',         station: 3, stufe: 3, icon: Wrench,     merksatz: 'praeteritum' },
  { id: 'seinHaben',        titel: 'sein & haben',         station: 3, stufe: 3, icon: Table2,     merksatz: 'seinHaben' },
  { id: 'woerterbuch',      titel: 'Wörterbuch-Forscher',  station: 4, stufe: 3, icon: BookA,   merksatz: 'unregelmaessig' },
  { id: 'familien',         titel: 'Verb-Familien',        station: 4, stufe: 3, icon: House,      merksatz: 'familien' },
  { id: 'treppe',           titel: 'Formen-Tabelle',       station: 4, stufe: 3, icon: TableProperties, merksatz: 'treppe' },   // bis 20.11.2026 „Formen-Treppe“
  { id: 'textmaschine',     titel: 'Text-Zeitmaschine',    station: 5, stufe: 3, icon: ScrollText, merksatz: 'text' },
  { id: 'perfektWerkstatt', titel: 'Perfekt-Werkstatt',    station: 6, stufe: 4, icon: Puzzle,     merksatz: ['perfekt', 'hilfsverb'] },
  { id: 'klammerPerfekt',   titel: 'Sätze bauen: Perfekt', station: 6, stufe: 4, icon: Blocks,       merksatz: 'perfekt' },
  { id: 'futur',            titel: 'Sätze bauen: Futur',   station: 7, stufe: 3, icon: Blocks,     merksatz: 'futur' },
  { id: 'detektiv',         titel: 'Zeitform-Detektiv',    station: 8, stufe: 3, icon: Search,     merksatz: 'detektiv' },
  { id: 'zeitchaos',        titel: 'Zeit-Chaos reparieren', station: 5, stufe: 3, icon: Hammer,    merksatz: 'zeitchaos' },
];
const GAME_ORDER = GAMES.map(g => g.id);
const gameById = id => GAMES.find(g => g.id === id);
const spieleDerStufe = stufe => GAMES.filter(g => g.stufe <= stufe);

// Stationen in der Reihenfolge der Reise (Anzeige darf von GAME_ORDER abweichen).
// zone: wo die Station auf dem Zeitstrahl liegt; farbe: Schlüssel in ZONE; spiele in Menü-Reihenfolge.
const STATIONEN = [
  { nr: 1, titel: 'Kontrollraum',          zone: 'jetzt',     farbe: 'praesens',    stufe: 3, icon: Gauge,      spiele: ['endungJetzt'] },
  { nr: 2, titel: 'Jetzt oder früher?',   zone: 'jetzt',     farbe: 'grenze',      stufe: 3, icon: DoorOpen,   spiele: ['tore', 'zwillinge'] },
  { nr: 3, titel: 'Präteritum bauen',     zone: 'früher',    farbe: 'praeteritum', stufe: 3, icon: Wrench,     spiele: ['teWerkstatt', 'seinHaben'] },
  { nr: 4, titel: 'Unregelmäßige Verben', zone: 'früher',    farbe: 'praeteritum', stufe: 3, icon: BookOpen,   spiele: ['woerterbuch', 'familien', 'treppe'] },
  { nr: 5, titel: 'Texte verwandeln',     zone: 'früher',    farbe: 'praeteritum', stufe: 3, icon: ScrollText, spiele: ['textmaschine', 'zeitchaos'] },
  { nr: 6, titel: 'Perfekt',              zone: 'früher',    farbe: 'perfekt',     stufe: 4, icon: Puzzle,     spiele: ['perfektWerkstatt', 'klammerPerfekt'] },
  { nr: 7, titel: 'Futur',                zone: 'später',    farbe: 'futur',       stufe: 3, icon: Rocket,     spiele: ['futur'] },
  { nr: 8, titel: 'Finale: Die Zeitmaschine', kurz: 'Finale', zone: 'alle Zeiten', farbe: 'finale', stufe: 3, icon: Hourglass, spiele: ['detektiv'] },
];
const stationenDerStufe = stufe => STATIONEN.filter(s => s.stufe <= stufe);

// Welche Spiele müssen vorher mit 9 Sternen geschafft sein? (alle in der Liste)
const UNLOCK_REQ = stufe => ({
  teWerkstatt: ['endungJetzt'],
  seinHaben: ['teWerkstatt'],
  familien: ['woerterbuch'],
  treppe: ['familien'],
  textmaschine: ['seinHaben', 'treppe'],
  klammerPerfekt: ['perfektWerkstatt'],
  detektiv: stufe === 4 ? ['textmaschine', 'klammerPerfekt', 'futur'] : ['textmaschine', 'futur'],
  zeitchaos: ['textmaschine'],
});
// Von Anfang an frei (Grundlagen)
// Futur ist seit 20.11.2026 von Anfang an frei (Entscheidung der Lehrkraft: Futur ist leicht und hängt fachlich nicht vom Perfekt ab).
// „Finde den Unterschied“ seit 21.11.2026 frei: Das Schnellspiel Zeit-Regen soll keine Hürde für langsame Leser sein (Baukasten Typ 4).
const BASICS = ['endungJetzt', 'tore', 'zwillinge', 'woerterbuch', 'perfektWerkstatt', 'futur'];
const FREI_AB = 9;

// ==========================================
// KÖNNEN – „Das kann ich schon“
// ==========================================
// ACHTUNG: Reihenfolge ist Teil des Zeitreise-Codes – nie umsortieren!
// Die Bausteine entsprechen den Zeilen der Kompetenzraster der Schule.
const SKILLS = [
  { id: 'erkennen',       titel: 'Ich erkenne die Zeitform eines Verbs.',                    stufe: 3 },
  { id: 'praesens',       titel: 'Ich kann Verben ins Präsens setzen.',                      stufe: 3 },
  { id: 'praeteritum',    titel: 'Ich kann regelmäßige Verben ins Präteritum setzen.',       stufe: 3 },
  { id: 'unregelmaessig', titel: 'Ich kenne unregelmäßige Verben (auch sein und haben).',    stufe: 3 },
  { id: 'text',           titel: 'Ich kann einen Text in eine andere Zeitform setzen.',      stufe: 3 },
  { id: 'perfekt',        titel: 'Ich kann Verben ins Perfekt setzen.',                      stufe: 4 },
  { id: 'futur',          titel: 'Ich kann Verben ins Futur setzen.',                        stufe: 3 },
];
const GAME_SKILLS = {
  endungJetzt: ['praesens'], tore: ['erkennen'], zwillinge: ['erkennen'], teWerkstatt: ['praeteritum'],
  seinHaben: ['unregelmaessig'], woerterbuch: ['unregelmaessig'], familien: ['unregelmaessig'], treppe: ['unregelmaessig'],
  textmaschine: ['text'], perfektWerkstatt: ['perfekt'], klammerPerfekt: ['perfekt'], futur: ['futur'],
  detektiv: ['erkennen'], zeitchaos: ['text'],
};

// Stufe 0–3 aus den letzten bis zu 10 Ergebnissen (Grenzen wie im Kern)
const skillLevel = (entry) => {
  const win = entry?.window || [];
  if (win.length < 4) return 0;
  const quote = win.filter(Boolean).length / win.length;
  if (quote >= 0.9) return 3;
  if (quote >= 0.7) return 2;
  return 1;
};
const SKILL_LEVEL_UI = {
  3: { label: '💪 Kann ich!', cls: 'bg-lime-400/20 text-lime-300 border-lime-400/60' },
  2: { label: '🙂 Fast!', cls: 'bg-amber-400/20 text-amber-300 border-amber-400/60' },
  1: { label: '🎯 Übe ich noch', cls: 'bg-rose-400/20 text-rose-300 border-rose-400/60' },
  0: { label: '🔍 Noch zu wenig Aufgaben', cls: 'bg-slate-700/40 text-slate-400 border-slate-600' },
};
// Startwerte, wenn eine Stufe aus dem Zeitreise-Code geladen wird
const START_WINDOWS = { 3: [true, true, true, true], 2: [true, true, true, false], 1: [true, false, false, false], 0: [] };
const skillLogFromLevels = (levels) => {
  const log = {};
  SKILLS.forEach(s => { const l = levels[s.id] || 0; if (l > 0) log[s.id] = { window: [...START_WINDOWS[l]] }; });
  return log;
};

// Die Spiele melden Ergebnisse über diesen Context: track(skillId, richtig). Nur der erste Versuch zählt.
const SkillContext = createContext({ track: () => {} });
const useTrack = () => useContext(SkillContext).track;

// ==========================================
// ZEITREISE-CODE
// ==========================================
// Format 1 (14 Zeichen, XXXX-XXXXX-XXXXX): 14 Spiele à 0–10 Sterne (GAME_ORDER) + 7 Bausteine à Stufe 0–3 (SKILLS),
// als Zahl in 13 Base-32-Ziffern + 1 Prüfzeichen. In Stufe 3 und 4 derselbe Code (ausgeblendete Spiele behalten ihre Sterne).
// Neue Spiele oder Bausteine brauchen ein neues Format (andere Länge) – dieses muss weiter lesbar bleiben.
const CODE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const CODE_ZIFFERN = 13;
const CODE_MAX = (11n ** BigInt(GAME_ORDER.length)) * (4n ** BigInt(SKILLS.length));
const code32Check = (digits) => CODE32[digits.reduce((acc, v, i) => acc + v * (i + 1), 0) % 31];
const CODE_GRUPPEN = [4, 5, 5];
const gruppiere = (raw) => {
  const teile = []; let i = 0;
  for (const n of CODE_GRUPPEN) { if (i >= raw.length) break; teile.push(raw.slice(i, i + n)); i += n; }
  return teile.join('-');
};

function generateCode(progress, levels) {
  let n = 0n;
  for (const g of GAME_ORDER) n = n * 11n + BigInt(Math.min(10, Math.max(0, progress[g] || 0)));
  for (const s of SKILLS) n = n * 4n + BigInt(Math.min(3, Math.max(0, levels[s.id] || 0)));
  const digits = [];
  for (let i = 0; i < CODE_ZIFFERN; i++) { digits.unshift(Number(n % 32n)); n /= 32n; }
  return gruppiere(digits.map(v => CODE32[v]).join('') + code32Check(digits));
}

// Eingabe verzeiht O (→ 0) sowie I und L (→ 1), Leerzeichen und Bindestriche
function parseCode(input) {
  const clean = input.toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1').replace(/[^0-9A-Z]/g, '');
  if (clean.length !== CODE_ZIFFERN + 1) return null;
  if ([...clean].some(ch => !CODE32.includes(ch))) return null;
  const digits = [...clean.slice(0, CODE_ZIFFERN)].map(ch => CODE32.indexOf(ch));
  if (clean[CODE_ZIFFERN] !== code32Check(digits)) return null;
  let n = digits.reduce((acc, v) => acc * 32n + BigInt(v), 0n);
  if (n >= CODE_MAX) return null;
  const skills = {};
  [...SKILLS].reverse().forEach(s => { skills[s.id] = Number(n % 4n); n /= 4n; });
  const progress = {};
  [...GAME_ORDER].reverse().forEach(g => { const v = Number(n % 11n); n /= 11n; if (v > 0) progress[g] = v; });
  return { progress, skills };
}
const formatCodeInput = (value) => gruppiere(value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, CODE_ZIFFERN + 1));

// ==========================================
// TON & VORLESEN
// ==========================================
// Das Tonsystem wird beim ersten Antippen „aufgeweckt“ und bleibt wach (sonst schneidet das iPad Wortanfänge ab).
let audioCtx = null;
function tonWecken() {
  try {
    if (!audioCtx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; audioCtx = new C(); }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const b = audioCtx.createBuffer(1, 1, 22050), s = audioCtx.createBufferSource();
    s.buffer = b; s.connect(audioCtx.destination); s.start(0);
  } catch (e) { /* ohne Ton weiter */ }
}
const TOENE = { richtig: [660, 880], falsch: [300, 220], stern: [523, 659, 784, 1047] };
function ton(art) {
  if (!audioCtx) return;
  const t0 = audioCtx.currentTime;
  (TOENE[art] || []).forEach((f, i) => {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t0 + i * 0.12);
    g.gain.exponentialRampToValueAtTime(0.15, t0 + i * 0.12 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.12 + 0.2);
    o.connect(g); g.connect(audioCtx.destination); o.start(t0 + i * 0.12); o.stop(t0 + i * 0.12 + 0.22);
  });
}

// Vorlesen über feste Schlüssel aus src/saetze.js. Zuerst Gerätestimme.
// Später: Thorsten-Datei audio/thorsten/saetze/<schlüssel>.mp3 bevorzugen (Liste liste.json, Vorbild Redezeichen-Helden).
let deStimme = null;
function deutscheStimme() {
  if (deStimme || !('speechSynthesis' in window)) return deStimme;
  const alle = window.speechSynthesis.getVoices() || [];
  deStimme = alle.find(v => v.lang === 'de-DE' && v.localService) || alle.find(v => (v.lang || '').startsWith('de')) || null;
  return deStimme;
}
function sprich(...schluessel) {
  const text = schluessel.map(k => SAETZE[k]).filter(Boolean).join(' ');
  if (!text || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE'; u.rate = 0.9;
    const v = deutscheStimme(); if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch (e) { /* ohne Vorlesen weiter */ }
}

// ==========================================
// ANZEIGE-BAUSTEINE
// ==========================================
// Wortstamm schwarz unterstrichen, Endung in der Farbe der Zeitform (mal|e rot, mal|te gelb) – auf heller Karte
function Wortform({ stamm, endung, zeit }) {
  return (
    <span className="whitespace-nowrap">
      <span className="underline decoration-2 decoration-slate-900 underline-offset-4">{stamm}</span>
      <span className={`font-bold ${ZEITEN[zeit].text}`}>{endung}</span>
    </span>
  );
}
const zeigeForm = (f, zeit) => (f.stamm !== undefined
  ? <Wortform stamm={f.stamm} endung={f.endung} zeit={zeit} />
  : <span className={`font-bold ${ZEITEN[zeit].text}`}>{f.text}</span>);

// Perfekt/Futur: Hilfsverb und zweites Verb in der Zeitfarbe, eingerahmt und durch einen Bogen verbunden (Verbklammer)
// teile: [{ t: 'Ich' }, { t: 'habe', k: true }, { t: 'ein Bild' }, { t: 'gemalt', k: true }], am Ende steht der Punkt fest.
function Klammersatz({ teile, zeit, punkt = '.' }) {
  const box = useRef(null), refs = useRef([]);
  const [bogen, setBogen] = useState(null);
  const schluessel = teile.map(p => p.t + (p.k ? '*' : '')).join(' ');
  useLayoutEffect(() => {
    const ks = teile.map((p, i) => (p.k ? i : -1)).filter(i => i >= 0);
    const messen = () => {
      if (ks.length < 2 || !box.current || !refs.current[ks[0]] || !refs.current[ks[1]]) return;
      // offset-Werte statt getBoundingClientRect: unabhängig von CSS-Transforms (Beam in „Erkunde die Zeiten“ skaliert den Satz)
      const a = refs.current[ks[0]], c = refs.current[ks[1]];
      // Stehen Hilfsverb und zweites Verb nicht in derselben Zeile, kein Bogen (die Rahmen zeigen die Klammer weiter)
      if (Math.abs(a.offsetTop - c.offsetTop) > 4) { setBogen(null); return; }
      const neu = { x1: a.offsetLeft + a.offsetWidth / 2, x2: c.offsetLeft + c.offsetWidth / 2, w: box.current.offsetWidth, y: a.offsetTop };
      setBogen(alt => (alt && alt.x1 === neu.x1 && alt.x2 === neu.x2 && alt.w === neu.w && alt.y === neu.y ? alt : neu));
    };
    messen();
    window.addEventListener('resize', messen);
    return () => window.removeEventListener('resize', messen);
  }, [schluessel]);
  const Z = ZEITEN[zeit];
  return (
    <span ref={box} className="relative inline-block pt-5 leading-relaxed">
      {bogen && (
        <svg className="absolute left-0 top-0 pointer-events-none" width={bogen.w} height={bogen.y + 4} aria-hidden="true">
          <path d={`M ${bogen.x1} ${bogen.y + 2} Q ${(bogen.x1 + bogen.x2) / 2} ${-bogen.y * 0.6} ${bogen.x2} ${bogen.y + 2}`} fill="none" strokeWidth="2.5" className={Z.stroke} />
        </svg>
      )}
      {teile.map((p, i) => (
        <React.Fragment key={i}>
          {i > 0 && ' '}
          <span ref={el => { refs.current[i] = el; }} className={p.k ? `font-bold ${Z.text} border-2 ${Z.rand} rounded-md px-1` : ''}>{p.t}</span>
        </React.Fragment>
      ))}
      {punkt}
    </span>
  );
}

// Formen eines Verbs in allen Personen, gefärbt nach Zeitform (auf heller Karte)
function FormenTabelle({ grundform, zeiten }) {
  const v = verbByGrundform[grundform];
  const formen = { praesens: praesens(v), praeteritum: praeteritum(v) };
  return (
    <table className="text-base md:text-lg border-separate border-spacing-x-3">
      <thead>
        <tr className="text-sm text-stone-500">
          <th className="text-left font-normal">Person</th>
          {zeiten.map(z => <th key={z} className={`text-left font-bold ${ZEITEN[z].text}`}>{ZEITEN[z].name}</th>)}
        </tr>
      </thead>
      <tbody>
        {PERSONEN.map((p, i) => (
          <tr key={p}>
            <td className="text-stone-600 pr-2">{p}</td>
            {zeiten.map(z => <td key={z} className="py-0.5">{zeigeForm(formen[z][i], z)}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Dunkles Fenster wie in den Schwester-Apps
function Modal({ onClose, children, breit = false, titel, untertitel, rand = 'border-slate-600', titelFarbe = 'text-white', icon: Icon }) {
  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className={`bg-slate-900 border-4 ${rand} rounded-3xl w-full ${breit ? 'max-w-2xl' : 'max-w-md'} max-h-[88dvh] flex flex-col anim-pop relative text-slate-200`}>
        <div className="flex justify-between items-start gap-4 p-5 md:p-6 pb-3 border-b-2 border-slate-800">
          <div className="text-left">
            <h3 className={`text-2xl md:text-4xl font-black ${titelFarbe} flex items-center gap-3 drop-shadow-md`}>{Icon && <Icon className="w-8 h-8 flex-shrink-0 anim-float" />}{titel}</h3>
            {untertitel && <p className="text-slate-400 italic">{untertitel}</p>}
          </div>
          <button onClick={onClose} aria-label="Schließen" className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full p-2 transition-colors flex-shrink-0">✕</button>
        </div>
        <div className="overflow-y-auto custom-scrollbar px-5 md:px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// Der Erzähler: Text steht immer auch da, mit „Nochmal hören“
function Erzaehler({ schluessel, children }) {
  return (
    <div className="flex items-start gap-3 bg-slate-900/70 backdrop-blur-md border-2 border-cyan-400/40 rounded-2xl px-4 py-3 shadow-[0_0_20px_rgba(34,211,238,0.15)] text-left">
      <Hourglass className="w-7 h-7 text-cyan-300 flex-shrink-0 mt-0.5 anim-float" />
      <p className="flex-1 text-slate-100 md:text-lg">{children || SAETZE[schluessel]}</p>
      {VORLESEN && (
        <button onClick={() => sprich(schluessel)} className="flex-shrink-0 flex items-center gap-1 text-cyan-300 hover:text-white font-bold text-sm" aria-label="Nochmal hören">
          <Volume2 className="w-6 h-6" /><span className="hidden sm:inline">Nochmal hören</span>
        </button>
      )}
    </div>
  );
}

// Tipp nach 3 Fehlern in Folge (die Spiele rufen onTipp(text) auf)
function TippFenster({ text, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-indigo-950 border-4 border-amber-400 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-[0_0_40px_rgba(251,191,36,0.3)] anim-pop relative text-center">
        <div className="bg-amber-400/20 p-4 rounded-full inline-block mb-4"><Hourglass className="w-10 h-10 text-amber-400 anim-twinkle" /></div>
        <h3 className="text-2xl md:text-3xl font-black text-amber-400 mb-4">Tipp aus der Zeitmaschine!</h3>
        <p className="text-indigo-50 text-lg md:text-xl mb-8 leading-relaxed">{text}</p>
        <button onClick={onClose} className="w-full bg-amber-500 hover:bg-amber-400 text-amber-950 font-black py-4 rounded-xl shadow-[0_4px_0_rgba(180,83,9,1)] active:translate-y-1 uppercase tracking-wider">
          Weiterreisen!
        </button>
      </div>
    </div>
  );
}

function Sterne({ n, max = 10, gross = false }) {
  return (
    <span className="inline-flex flex-wrap justify-center gap-0.5" aria-label={`${n} von ${max} Sternen`}>
      {Array.from({ length: max }, (_, i) => (
        <Star key={i} className={`${gross ? 'w-7 h-7 md:w-9 md:h-9' : 'w-4 h-4'} ${i < n ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]' : 'text-slate-600'}`} />
      ))}
    </span>
  );
}

// ==========================================
// MERKSÄTZE – Karte beim ersten Öffnen eines Spiels, danach über „?“ oder „Merksätze“ in der Kopfleiste
// ==========================================
// Texte in src/saetze.js (merksatz_…), Beispiele hier mit den Farben der App (auf heller Karte).
const Beispielzeile = ({ children }) => <div className="text-lg md:text-xl py-1">{children}</div>;

const MERKSAETZE = {
  praesens: {
    titel: 'Präsens', zeit: 'praesens', stufe: 3, saetze: ['merksatz_praesens'],
    Beispiel: () => (<>
      <Beispielzeile>Die Sonne scheint. Ich gehe jeden Mittwoch zum Chor.</Beispielzeile>
      <FormenTabelle grundform="malen" zeiten={['praesens']} />
    </>),
  },
  erkennen: {
    titel: 'Jetzt oder früher?', zeit: 'praesens', stufe: 3, saetze: ['merksatz_erkennen'],
    Beispiel: () => (<>
      <Beispielzeile><span className="text-sm text-rose-700 font-bold mr-2">jetzt</span>ich <Wortform stamm="spiel" endung="e" zeit="praesens" /></Beispielzeile>
      <Beispielzeile><span className="text-sm text-amber-700 font-bold mr-2">früher</span>ich <Wortform stamm="spiel" endung="te" zeit="praeteritum" /></Beispielzeile>
    </>),
  },
  praeteritum: {
    titel: 'Präteritum', zeit: 'praeteritum', stufe: 3, saetze: ['merksatz_praeteritum'],
    Beispiel: () => (<>
      <Beispielzeile>Gestern regnete es.</Beispielzeile>
      <Beispielzeile><Wortform stamm="lach" endung="en" zeit="praesens" /> – <Wortform stamm="lach" endung="te" zeit="praeteritum" /></Beispielzeile>
      <FormenTabelle grundform="malen" zeiten={['praeteritum']} />
    </>),
  },
  seinHaben: {
    titel: 'sein und haben', zeit: 'praeteritum', stufe: 3, saetze: ['merksatz_seinHaben'],
    Beispiel: () => (<div className="flex flex-wrap gap-6">
      <FormenTabelle grundform="sein" zeiten={['praesens', 'praeteritum']} />
      <FormenTabelle grundform="haben" zeiten={['praesens', 'praeteritum']} />
    </div>),
  },
  unregelmaessig: {
    titel: 'Regelmäßig oder unregelmäßig?', zeit: 'praeteritum', stufe: 3, saetze: ['merksatz_unregelmaessig'],
    Beispiel: () => (<>
      <Beispielzeile>regelmäßig: <Wortform stamm="lach" endung="en" zeit="praesens" /> – <Wortform stamm="lach" endung="te" zeit="praeteritum" /></Beispielzeile>
      <Beispielzeile>unregelmäßig: gehen – <span className="font-bold text-amber-700">ging</span></Beispielzeile>
      <div className="mt-2 inline-block bg-stone-50 border-2 border-stone-300 rounded-lg px-4 py-2 font-serif text-lg">
        <div><b>ge·hen</b>, ging, ge·gan·gen</div>
        <div><b>ma·len</b></div>
      </div>
    </>),
  },
  familien: {
    titel: 'Verb-Familien', zeit: 'praeteritum', stufe: 3, saetze: ['merksatz_familien'],
    Beispiel: () => (<>
      <Beispielzeile>s<b className="text-amber-700">i</b>ngen – s<b className="text-amber-700">a</b>ng</Beispielzeile>
      <Beispielzeile>tr<b className="text-amber-700">i</b>nken – tr<b className="text-amber-700">a</b>nk</Beispielzeile>
      <p className="text-stone-600">Familie i → a</p>
    </>),
  },
  treppe: {
    titel: 'Formen-Tabelle', zeit: 'praeteritum', stufe: 3, saetze: ['merksatz_treppe'],
    Beispiel: ({ stufe }) => (<table className="text-lg border-collapse">
      <thead><tr className="text-sm">
        <th className="border border-stone-300 bg-stone-200 px-3 py-1 text-left">Grundform</th>
        <th className="border border-amber-500 bg-amber-100 text-amber-800 px-3 py-1 text-left">Präteritum</th>
        {stufe === 4 && <th className="border border-lime-600 bg-lime-100 text-lime-800 px-3 py-1 text-left">Perfekt</th>}
      </tr></thead>
      <tbody><tr>
        <td className="border border-stone-300 px-3 py-2 font-bold">gehen</td>
        <td className="border border-amber-500 px-3 py-2">ich <b className="text-amber-700">ging</b></td>
        {stufe === 4 && <td className="border border-lime-600 px-3 py-2">ich <b className="text-lime-800">bin gegangen</b></td>}
      </tr></tbody>
    </table>),
  },
  text: {
    titel: 'Texte verwandeln', zeit: 'praeteritum', stufe: 3, saetze: ['merksatz_text', 'merksatz_praeteritum'],
    Beispiel: () => (<>
      <Beispielzeile>Ich <Wortform stamm="spiel" endung="e" zeit="praesens" /> im Garten.</Beispielzeile>
      <Beispielzeile>Ich <Wortform stamm="spiel" endung="te" zeit="praeteritum" /> im Garten.</Beispielzeile>
    </>),
  },
  zeitchaos: {
    titel: 'Aus der Zeit gefallen', zeit: 'praeteritum', stufe: 3, saetze: ['merksatz_zeitchaos'],
    Beispiel: () => (<>
      <Beispielzeile>Gestern <Wortform stamm="spiel" endung="te" zeit="praeteritum" /> ich im Garten. Dann <span className="line-through decoration-rose-600 decoration-2"><Wortform stamm="hol" endung="e" zeit="praesens" /></span> <Wortform stamm="hol" endung="te" zeit="praeteritum" /> ich einen Ball.</Beispielzeile>
    </>),
  },
  perfekt: {
    titel: 'Perfekt', zeit: 'perfekt', stufe: 4, saetze: ['merksatz_perfekt'],
    Beispiel: () => (<>
      <Beispielzeile><Klammersatz teile={[{ t: 'Ich' }, { t: 'habe', k: true }, { t: 'ein Bild' }, { t: 'gemalt', k: true }]} zeit="perfekt" /></Beispielzeile>
      <Beispielzeile><Klammersatz teile={[{ t: 'Ich' }, { t: 'bin', k: true }, { t: 'nach Hause' }, { t: 'gelaufen', k: true }]} zeit="perfekt" /></Beispielzeile>
    </>),
  },
  hilfsverb: {
    titel: 'haben oder sein?', zeit: 'perfekt', stufe: 4, saetze: ['merksatz_hilfsverb'],
    Beispiel: () => (<>
      <Beispielzeile><Klammersatz teile={[{ t: 'Ich' }, { t: 'bin', k: true }, { t: 'nach Hause' }, { t: 'gelaufen', k: true }]} zeit="perfekt" /> <span className="text-sm text-stone-500">(Bewegung)</span></Beispielzeile>
      <Beispielzeile><Klammersatz teile={[{ t: 'Ich' }, { t: 'habe', k: true }, { t: 'ein Bild' }, { t: 'gemalt', k: true }]} zeit="perfekt" /></Beispielzeile>
    </>),
  },
  futur: {
    titel: 'Futur', zeit: 'futur', stufe: 3, saetze: ['merksatz_futur'],
    Beispiel: () => (<Beispielzeile><Klammersatz teile={[{ t: 'Morgen' }, { t: 'werde', k: true }, { t: 'ich ein Eis' }, { t: 'essen', k: true }]} zeit="futur" /></Beispielzeile>),
  },
  detektiv: {
    titel: 'Alle Zeitformen', zeit: null, stufe: 3, saetze: ['merksatz_detektiv'],
    Beispiel: ({ stufe }) => (<div className="space-y-1">
      <Beispielzeile><span className="inline-block w-44 align-top text-sm font-bold text-amber-700 leading-tight">Präteritum<span className="block font-medium text-stone-500">{ZEITEN.praeteritum.deutsch}</span></span>Ich <Wortform stamm="mal" endung="te" zeit="praeteritum" /> ein Bild.</Beispielzeile>
      {stufe === 4 && <Beispielzeile><span className="inline-block w-44 align-top text-sm font-bold text-lime-800 leading-tight">Perfekt<span className="block font-medium text-stone-500">{ZEITEN.perfekt.deutsch}</span></span><Klammersatz teile={[{ t: 'Ich' }, { t: 'habe', k: true }, { t: 'ein Bild' }, { t: 'gemalt', k: true }]} zeit="perfekt" /></Beispielzeile>}
      <Beispielzeile><span className="inline-block w-44 align-top text-sm font-bold text-rose-700 leading-tight">Präsens<span className="block font-medium text-stone-500">{ZEITEN.praesens.deutsch}</span></span>Ich <Wortform stamm="mal" endung="e" zeit="praesens" /> ein Bild.</Beispielzeile>
      <Beispielzeile><span className="inline-block w-44 align-top text-sm font-bold text-sky-700 leading-tight">Futur<span className="block font-medium text-stone-500">{ZEITEN.futur.deutsch}</span></span><Klammersatz teile={[{ t: 'Ich' }, { t: 'werde', k: true }, { t: 'ein Bild' }, { t: 'malen', k: true }]} zeit="futur" /></Beispielzeile>
    </div>),
  },
};

// Inhalt eines Merksatzes: Regel auf Pastellfläche der Zeitform, gelöstes Beispiel auf heller Karte
// LEUCHTTAFEL (Entscheidung der Lehrkraft 20.11.2026, Variante B der Farbvorschau):
// Jeder Inhalt mit Farbcodierung steht auf einer hellen Karte mit genau den Farben aus dem Auftrag (wie auf dem Arbeitsblatt).
// Außen ein leuchtender Rahmen mit dunkler Kopfleiste in der Zeitfarbe – die Karte wirkt wie ein Bildschirm der Zeitmaschine.
// Auch die Spiele (1b/1c) setzen ihre Aufgaben in eine Leuchttafel. zeit = null → alle Zeiten (Cyan).
const LEUCHTTAFEL = {
  praesens:    { name: 'PRÄSENS · GEGENWART',  rahmen: 'border-rose-400 shadow-[0_0_25px_rgba(251,113,133,0.45)]',  kopf: 'text-rose-300' },
  praeteritum: { name: 'PRÄTERITUM · VERGANGENHEIT (BEIM SCHREIBEN)', rahmen: 'border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.45)]',  kopf: 'text-amber-300' },
  perfekt:     { name: 'PERFEKT · VERGANGENHEIT (BEIM ERZÄHLEN)', rahmen: 'border-lime-400 shadow-[0_0_25px_rgba(163,230,53,0.45)]',   kopf: 'text-lime-300' },
  futur:       { name: 'FUTUR · ZUKUNFT',      rahmen: 'border-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.45)]',    kopf: 'text-sky-300' },
  vergangenheit: { name: 'PRÄTERITUM UND PERFEKT · VERGANGENHEIT', rahmen: 'border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.45)]', kopf: 'text-amber-300' },
  alle:        { name: 'ALLE ZEITFORMEN',      rahmen: 'border-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.45)]',   kopf: 'text-cyan-200' },
};

function Leuchttafel({ zeit, titel, children, innen = 'p-4' }) {
  const L = LEUCHTTAFEL[zeit || 'alle'];
  return (
    <div className={`rounded-2xl bg-slate-950 p-1.5 border-2 ${L.rahmen}`}>
      <div className="flex items-center justify-between gap-3 px-2.5 py-1.5">
        <span className={`text-xs font-black tracking-widest flex items-center gap-1.5 ${L.kopf}`}><span className="w-2 h-2 rounded-full bg-current flex-shrink-0" />{L.name}</span>
        {titel && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">{titel}</span>}
      </div>
      <div className={`bg-amber-50 text-slate-900 rounded-xl ${innen}`}>{children}</div>
    </div>
  );
}

// Bereiche im Fenster „Merksätze“ (Entscheidung der Lehrkraft 20.11.2026): erst die Zeitformen, dann weitere Regeln
const MERKSATZ_BEREICHE = [
  { titel: 'Zeitformen', ids: ['praesens', 'praeteritum', 'perfekt', 'futur', 'detektiv'] },
  { titel: 'Weitere Regeln', ids: ['erkennen', 'unregelmaessig', 'seinHaben', 'familien', 'treppe', 'hilfsverb', 'text', 'zeitchaos'] },
];
const istZeitform = id => MERKSATZ_BEREICHE[0].ids.includes(id) && !!MERKSAETZE[id].zeit;
// Was „Vorlesen“ vorliest: bei einer Zeitform zuerst die deutsche Erklärung („Präsens bedeutet Gegenwart.“)
const merksatzSaetze = id => (istZeitform(id) ? ['deutsch_' + MERKSAETZE[id].zeit] : []).concat(MERKSAETZE[id].saetze);

// Inhalt eines Merksatzes: Regel auf Pastellfläche der Zeitform und gelöstes Beispiel, zusammen auf einer Leuchttafel.
// Bei einer Zeitform steht oben groß das Fachwort mit der deutschen Erklärung („Präsens = Gegenwart“).
function MerksatzInhalt({ id, stufe }) {
  const m = MERKSAETZE[id];
  const Z = m.zeit ? ZEITEN[m.zeit] : null;
  return (
    <Leuchttafel zeit={m.zeit} titel="Merksatz">
      <div className="space-y-3">
        {istZeitform(id) && (
          <p className={`text-2xl md:text-3xl font-black leading-tight ${Z.text}`}>{Z.name} <span className="text-stone-400 font-bold">=</span> {Z.deutsch}</p>
        )}
        <div className={`rounded-xl border-2 p-4 ${Z ? `${Z.flaeche} ${Z.rand}` : 'bg-cyan-100 border-cyan-500'}`}>
          {m.saetze.map(k => <p key={k} className="text-lg mb-2 last:mb-0">{SAETZE[k]}</p>)}
        </div>
        <div className="bg-white rounded-xl border-2 border-dashed border-stone-300 p-4">
          <p className="text-sm font-bold text-stone-500 mb-1 flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-500" /> Beispiel</p>
          <m.Beispiel stufe={stufe} />
        </div>
      </div>
    </Leuchttafel>
  );
}

function MerksatzKarte({ id, stufe, onClose }) {
  const ids = [].concat(id);
  return (
    <Modal onClose={onClose} breit titel={`Merksatz: ${ids.map(i => MERKSAETZE[i].titel).join(' · ')}`} rand="border-cyan-500" titelFarbe="text-cyan-300" icon={BookOpen}>
      <div className="space-y-5">{ids.map(i => <MerksatzInhalt key={i} id={i} stufe={stufe} />)}</div>
      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        {VORLESEN && <button onClick={() => sprich(...ids.flatMap(merksatzSaetze))} className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold rounded-xl py-3 uppercase tracking-wider active:scale-95"><Volume2 className="w-5 h-5" /> Vorlesen</button>}
        <button onClick={onClose} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-black rounded-xl py-3 text-lg uppercase tracking-wider shadow-[0_4px_0_rgba(14,116,144,1)] active:translate-y-1">Los geht’s!</button>
      </div>
    </Modal>
  );
}

// Alle Merksätze der Stufe (Knopf „Merksätze“ links in der Kopfleiste, wie „Zauber-Regeln“ in Pronomen-Magie)
function MerksaetzeFenster({ stufe, onClose }) {
  const bereiche = MERKSATZ_BEREICHE.map(b => ({ ...b, ids: b.ids.filter(id => MERKSAETZE[id].stufe <= stufe) }));
  const [offen, setOffen] = useState(bereiche[0].ids[0]);
  const CHIP_ZEIT = {
    praesens: 'border-rose-400/60 text-rose-200', praeteritum: 'border-amber-400/60 text-amber-200',
    perfekt: 'border-lime-400/60 text-lime-200', futur: 'border-sky-400/60 text-sky-200',
  };
  return (
    <Modal onClose={onClose} breit titel="Merksätze" rand="border-cyan-500" titelFarbe="text-cyan-300" icon={BookOpen}>
      {bereiche.map(b => (
        <div key={b.titel} className="mb-4">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">{b.titel}</p>
          <div className="flex flex-wrap gap-2">
            {b.ids.map(id => {
              const zf = istZeitform(id), z = MERKSAETZE[id].zeit;
              return (
                <button key={id} onClick={() => setOffen(id)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-colors text-left leading-tight ${offen === id ? 'bg-cyan-500 border-cyan-300 text-cyan-950' : `bg-slate-800 hover:bg-slate-700 ${zf ? CHIP_ZEIT[z] : 'border-slate-700 text-slate-300'}`}`}>
                  {MERKSAETZE[id].titel}
                  {zf && <span className="block text-[11px] font-semibold opacity-80">{ZEITEN[z].deutsch}</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <MerksatzInhalt id={offen} stufe={stufe} />
      {VORLESEN && <button onClick={() => sprich(...merksatzSaetze(offen))} className="mt-4 flex items-center gap-2 text-cyan-300 hover:text-white font-bold"><Volume2 className="w-5 h-5" /> Vorlesen</button>}
    </Modal>
  );
}

// ==========================================
// HILFE – „Reise-Hilfe“ (wie „Zauber-Hilfe“ in Pronomen-Magie): je Spiel „So funktioniert’s“ und „Das lernst du“
// ==========================================
const HILFE = {
  endungJetzt: { play: 'Grundform und Personalpronomen stehen schon da. Wähle die passende Endung aus der Leiste. Dann siehst du die fertige Verbform.', learn: 'Du lernst, welche Endung das Verb im Präsens bei jeder Person bekommt.' },
  tore: { play: 'Verbformen fallen von oben. Ist es jetzt (Präsens) oder früher (Präteritum)? Tippe das richtige Tor, bevor das Wort unten ankommt. Treffer in Folge bringen eine Combo. Es wird immer schneller.', learn: 'Du lernst, Präsens und Präteritum blitzschnell zu unterscheiden.' },
  zwillinge: { play: 'Der gleiche Text steht zweimal da. Tippe im zweiten Text alle Wörter an, die sich verändert haben. Dann prüfe.', learn: 'Du entdeckst, dass sich die Verben verändern, wenn ein Text in einer anderen Zeitform steht.' },
  teWerkstatt: { play: 'Hänge die richtige Endung mit -te an den Wortstamm. Danach füllst du eine ganze Tabelle aus.', learn: 'Du lernst, wie regelmäßige Verben das Präteritum bilden.' },
  seinHaben: { play: 'Ziehe die Formen von sein und haben in die richtige Zeile. Danach wählst du in Sätzen die passende Form.', learn: 'Du lernst die Formen von sein und haben im Präsens und im Präteritum.' },
  woerterbuch: { play: 'Schau dir den Wörterbuch-Ausschnitt an. Steht hinter der Grundform noch etwas? Dann ist das Verb unregelmäßig. Dort findest du auch das Präteritum.', learn: 'Du lernst, unregelmäßige Verben mit dem Wörterbuch zu erkennen.' },
  familien: { play: 'Jede Karte zeigt ein Verb in der Grundform und im Präteritum. Ziehe die Karten in die Häuser ihrer Familien.', learn: 'Du lernst, dass sich viele unregelmäßige Verben nach demselben Muster verändern.' },
  treppe: { play: 'Oben steht die Grundform. Schreibe die Formen für alle Personen in die Tabelle, in Einzahl und Mehrzahl. Über jeder Tafel steht, welche Zeitform gemeint ist. Beim Perfekt schreibst du die ge-Form nur einmal.', learn: 'Du lernst, die Formen unregelmäßiger Verben sicher zu schreiben.' },
  textmaschine: { play: 'Tippe zuerst alle Verben im Text an. Dann schreibe jedes Verb in der neuen Zeitform.', learn: 'Du lernst, einen ganzen Text in eine andere Zeitform zu setzen.' },
  perfektWerkstatt: { play: 'Entscheide zuerst, ob haben oder sein in die Lücke passt. Dann baust du die ge-Form aus Bausteinen.', learn: 'Du lernst, wie das Perfekt gebildet wird.' },
  klammerPerfekt: { play: 'Bringe die Satzbausteine in die richtige Reihenfolge. Das Hilfsverb steht an zweiter Stelle, die ge-Form am Ende. Zum Schluss schreibst du drei Sätze selbst im Perfekt.', learn: 'Du lernst, wo die zwei Teile des Perfekts im Satz stehen.' },
  futur: { play: 'Baue Sätze mit werden und der Grundform. Danach findest du Fehler in Sätzen und reparierst sie. Zum Schluss schreibst du drei Sätze selbst im Futur.', learn: 'Du lernst, wie man im Futur über die Zukunft spricht.' },
  detektiv: { play: 'Lies den Satz und bestimme die Zeitform. Vorsicht: In der zweiten Hälfte warten Fallen!', learn: 'Du lernst, die Zeitform an der Form des Verbs zu erkennen.' },
  zeitchaos: { play: 'In der Geschichte sind einige Verben aus der Zeit gefallen. Finde sie und repariere sie.', learn: 'Du lernst, dass eine Geschichte in ihrer Zeitform bleibt.' },
};
const HILFE_FARBE = {
  praesens: 'text-rose-300 bg-rose-900/30 border-rose-500/50 hover:bg-rose-800/50',
  grenze: 'text-rose-200 bg-rose-900/30 border-rose-400/50 hover:bg-rose-800/50',
  praeteritum: 'text-amber-300 bg-amber-900/30 border-amber-500/50 hover:bg-amber-800/50',
  perfekt: 'text-lime-300 bg-lime-900/30 border-lime-500/50 hover:bg-lime-800/50',
  futur: 'text-sky-300 bg-sky-900/30 border-sky-500/50 hover:bg-sky-800/50',
  finale: 'text-cyan-300 bg-cyan-900/30 border-cyan-400/50 hover:bg-cyan-800/50',
};

function HilfeFenster({ stufe, onClose }) {
  const [gewaehlt, setGewaehlt] = useState(null);
  // in der Reihenfolge der Reise
  const spiele = stationenDerStufe(stufe).flatMap(st => st.spiele.map(gameById).filter(g => g.stufe <= stufe).map(g => ({ ...g, farbe: st.farbe })));
  return (
    <Modal onClose={onClose} breit titel="Reise-Hilfe" rand="border-indigo-500" titelFarbe="text-indigo-300" icon={CircleHelp}>
      {!gewaehlt ? (<>
        <p className="text-slate-200 text-lg mb-6 leading-relaxed text-left">Willkommen im Reise-Handbuch! Tippe auf ein Spiel. Dann erfährst du, wie es funktioniert und was du dabei lernst.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {spiele.map(g => (
            <button key={g.id} onClick={() => setGewaehlt(g)} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95 text-center ${HILFE_FARBE[g.farbe]}`}>
              <g.icon className="w-10 h-10 mb-1" />
              <span className="text-xs md:text-sm font-bold leading-tight">{g.titel}</span>
            </button>
          ))}
        </div>
      </>) : (
        <div className="anim-pop">
          <div className="flex flex-col items-center mb-8">
            <div className={`p-4 rounded-full border-2 mb-4 ${HILFE_FARBE[gewaehlt.farbe]}`}><gewaehlt.icon className="w-12 h-12" /></div>
            <h3 className="text-3xl font-black text-white text-center">{gewaehlt.titel}</h3>
          </div>
          <div className="bg-slate-800/80 p-5 md:p-6 rounded-2xl mb-4 border border-slate-700 shadow-inner text-left">
            <h4 className="text-amber-400 font-bold text-xl mb-3 flex items-center gap-2"><Hourglass className="w-6 h-6" /> So funktioniert’s:</h4>
            <p className="text-slate-200 text-lg leading-relaxed">{HILFE[gewaehlt.id].play}</p>
          </div>
          <div className="bg-slate-800/80 p-5 md:p-6 rounded-2xl mb-8 border border-slate-700 shadow-inner text-left">
            <h4 className="text-lime-400 font-bold text-xl mb-3 flex items-center gap-2"><Award className="w-6 h-6" /> Das lernst du:</h4>
            <p className="text-slate-200 text-lg leading-relaxed">{HILFE[gewaehlt.id].learn}</p>
          </div>
          <button onClick={() => setGewaehlt(null)} className="w-full bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-white font-bold py-4 rounded-xl shadow-md active:translate-y-1 uppercase tracking-wider flex justify-center items-center gap-2">
            <ArrowRight className="w-5 h-5 rotate-180" /> Zurück zur Übersicht
          </button>
        </div>
      )}
    </Modal>
  );
}

// ==========================================
// SPIELE – gemeinsames Gerüst (Etappe 1b)
// ==========================================
// Jede Runde: Aufgaben werden nach Stufe gezogen, steigen an (leicht → mittel → profi), wiederholen sich nicht und
// meiden die Aufgaben der letzten 2 Runden (nur im Arbeitsspeicher). Es zählt nur der erste Versuch.
// Falsch gelöste Aufgaben bleiben stehen, bis sie richtig sind, und kommen am Ende der Runde noch einmal
// (zählt nicht für Sterne oder „Das kann ich schon“). Tipp nach 3 Fehlern in Folge.

const mische = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
const zufall = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Zuletzt gespielte Aufgaben je Spiel (2 Runden), nur bis zum Neuladen
const ZULETZT = {};
function waehle(spielId, kandidaten, n, schluessel = (x) => x.key) {
  const alt = new Set((ZULETZT[spielId] || []).flat());
  let frisch = mische(kandidaten.filter(k => !alt.has(schluessel(k))));
  if (frisch.length < n) frisch = frisch.concat(mische(kandidaten.filter(k => alt.has(schluessel(k)))));
  const gewaehlt = frisch.slice(0, n);
  ZULETZT[spielId] = [...(ZULETZT[spielId] || []), gewaehlt.map(schluessel)].slice(-2);
  return gewaehlt;
}
// Dasselbe Verb nie zweimal hintereinander (so gut es geht umsortieren)
function nichtHintereinander(liste, verb = (x) => x.verb) {
  const a = [...liste];
  for (let i = 1; i < a.length; i++) {
    if (verb(a[i]) === verb(a[i - 1])) {
      const j = a.findIndex((x, k) => k > i && verb(x) !== verb(a[i - 1]));
      if (j > 0) [a[i], a[j]] = [a[j], a[i]];
    }
  }
  return a;
}
const verbenFuer = (stufe, filter = () => true) => VERBEN.filter(v => !v.nur && v.stufe <= stufe && filter(v));
const LOB = ['Super!', 'Richtig!', 'Klasse!', 'Genau!', 'Prima!', 'Stark!'];

// Rekord „längste Serie ohne Fehler“ je Spiel (Wunsch der Lehrkraft 21.11.2026). Nur Arbeitsspeicher wie ZULETZT:
// gilt bis zum Neuladen, nicht im Zeitreise-Code, ändert keine Sterne. AKTIVES_SPIEL setzt die App beim Öffnen eines Spiels.
const SERIEN_REKORD = {};
const AKTIVES_SPIEL = { id: null };
const rekordVorher = () => SERIEN_REKORD[AKTIVES_SPIEL.id] || 0;
// Meldet einmal je Runde, sobald der alte Rekord (mindestens 3) überboten wird
function useNeuerRekord(serie) {
  const [alt] = useState(rekordVorher);
  const [gemeldet, setGemeldet] = useState(null);
  useEffect(() => { if (gemeldet === null && alt >= 3 && serie > alt) setGemeldet(serie); }, [serie]);
  return { alt, neu: gemeldet };
}
function RekordMeldung({ serie, wort = 'ohne Fehler' }) {
  return (
    <span key={serie} className="inline-flex items-center gap-1.5 rounded-full border-2 border-amber-300 bg-amber-400/20 px-3 py-0.5 text-sm md:text-base font-black text-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.6)] anim-pop">
      <Trophy className="w-4 h-4 md:w-5 md:h-5" /> Neuer Rekord: {serie} {wort}!
    </span>
  );
}

// Runde: steuert Reihenfolge, Punkte (erster Versuch), Wiederholung am Ende, Tipps
function useRunde({ aufgaben, skill, onFinish, onTipp }) {
  const track = useTrack();
  const [phase, setPhase] = useState('haupt');            // haupt | wiederholung
  const [pos, setPos] = useState(0);
  const [wdh, setWdh] = useState([]);
  const [geloest, setGeloest] = useState(false);
  const [msg, setMsg] = useState(null);                    // { art: 'gut' | 'falsch' | 'info', text }
  const [combo, setCombo] = useState(0);                   // Aufgaben ohne Fehler in Folge (nur Anzeige, ändert keine Sterne)
  const fehlerHier = useRef(false);                        // gab es in der aktuellen Aufgabe schon einen Fehler?
  const besteSerie = useRef(0);
  useEffect(() => { besteSerie.current = Math.max(besteSerie.current, combo); }, [combo]);
  const rekord = useNeuerRekord(combo);
  const erste = useRef({});                                // `${aufgabe}:${teil}` -> richtig
  const abzug = useRef(0);
  const folge = useRef(0);
  const idx = phase === 'haupt' ? pos : wdh[pos];
  const anzahl = phase === 'haupt' ? aufgaben.length : wdh.length;
  const maxPunkte = aufgaben.reduce((s, a) => s + (a.punkte || 1), 0);

  // Erster Versuch eines Teils der aktuellen Aufgabe (zählt nur in der Hauptrunde)
  // mitBaustein = false: nur Sterne, „Das kann ich schon“ meldet das Spiel selbst (z. B. eine Tabelle = ein Ergebnis)
  const erst = (teil, richtig, mitBaustein = true) => {
    if (phase !== 'haupt') return;
    const k = `${idx}:${teil}`;
    if (k in erste.current) return;
    erste.current[k] = richtig;
    if (skill && mitBaustein) track(skill, richtig);
  };
  const gut = (text) => { folge.current = 0; ton('richtig'); setMsg({ art: 'gut', text: text || zufall(LOB) }); };
  const falsch = (text, tipp) => {
    ton('falsch');
    fehlerHier.current = true; setCombo(0);
    folge.current += 1;
    if (folge.current >= 3 && tipp) { folge.current = 0; onTipp(tipp); }
    setMsg({ art: 'falsch', text });
  };
  const info = (text) => setMsg({ art: 'info', text });
  const leer = () => setMsg(null);                         // richtiger Zwischenschritt: alte Fehlermeldung weg
  const geschafft = (text) => {
    if (text !== undefined) gut(text);
    if (!fehlerHier.current) setCombo(c => c + 1);
    setGeloest(true);
  };
  // Nach mehreren Fehlversuchen Lösung zeigen (ohne Feuerwerk, ohne Combo)
  const aufloesen = (text) => { setMsg({ art: 'info', text }); setGeloest(true); };
  const minus = (n) => { if (phase === 'haupt') abzug.current += n; };

  const weiter = () => {
    setMsg(null); setGeloest(false); fehlerHier.current = false;
    if (pos + 1 < anzahl) { setPos(pos + 1); return; }
    if (phase === 'haupt') {
      const falschGeloest = aufgaben.map((_, i) => i).filter(i => Object.entries(erste.current).some(([k, r]) => k.startsWith(i + ':') && !r));
      if (falschGeloest.length) { setWdh(falschGeloest); setPhase('wiederholung'); setPos(0); return; }
    }
    const punkte = Math.max(0, Object.values(erste.current).filter(Boolean).length - abzug.current);
    onFinish(Math.round((punkte / Math.max(1, maxPunkte)) * 10), 10, { serie: Math.max(besteSerie.current, combo) });
  };
  return { aufgabe: aufgaben[idx], idx, nr: pos + 1, anzahl, phase, schluessel: `${phase}-${pos}`, geloest, msg, combo, rekord, erst, gut, falsch, info, leer, geschafft, aufloesen, minus, weiter };
}

// „Zeitenergie“ (Wunsch der Lehrkraft 21.11.2026): Jede Aufgabe ohne Fehler lädt ein Feld. Über der Leiste steigt bei jedem
// neuen Feld ein Lobwort auf, je voller desto größer. Bei 5 Feldern: großes Lobwort über der Aufgabe und eine neue Energie-Stufe
// (Farbe wechselt gelb → orange → pink → türkis, die Leiste leuchtet von Stufe zu Stufe stärker).
// Nur Anzeige – Sterne und „Das kann ich schon“ bleiben unverändert.
const ENERGIE_MAX = 5;
const ENERGIE_LOB = ['', '', '', 'Weiter so!', 'Fast voll!'];   // nur bei Feld 3 und 4 (nicht nach jedem Wort, Wunsch der Lehrkraft)
const ENERGIE_VOLL = ['Volle Energie!', 'Blitzschnell!', 'Zeitmeister!', 'Unaufhaltsam!', 'Spitze!', 'Super-Zeitreise!'];
const ENERGIE_STUFE = [   // Farbe je Energie-Stufe (alles ausgeschrieben für Tailwind)
  { feld: 'bg-yellow-300 border-yellow-100', glanz: 'shadow-[0_0_8px_rgba(253,224,71,0.8)]', text: 'text-yellow-200', blitz: 'text-yellow-300 fill-yellow-300', ring: 'border-yellow-300 shadow-[0_0_25px_rgba(253,224,71,0.8)]', rgb: '253,224,71' },
  { feld: 'bg-orange-400 border-orange-200', glanz: 'shadow-[0_0_12px_rgba(251,146,60,0.95)]', text: 'text-orange-200', blitz: 'text-orange-400 fill-orange-400', ring: 'border-orange-400 shadow-[0_0_30px_rgba(251,146,60,0.9)]', rgb: '251,146,60' },
  { feld: 'bg-pink-400 border-pink-200', glanz: 'shadow-[0_0_16px_rgba(244,114,182,1)]', text: 'text-pink-200', blitz: 'text-pink-400 fill-pink-400', ring: 'border-pink-400 shadow-[0_0_35px_rgba(244,114,182,0.95)]', rgb: '244,114,182' },
  { feld: 'bg-cyan-300 border-cyan-100', glanz: 'shadow-[0_0_20px_rgba(103,232,249,1)]', text: 'text-cyan-200', blitz: 'text-cyan-300 fill-cyan-300', ring: 'border-cyan-300 shadow-[0_0_40px_rgba(103,232,249,1)]', rgb: '103,232,249' },
];
const energieStufe = (combo) => ENERGIE_STUFE[Math.min(ENERGIE_STUFE.length - 1, Math.floor(Math.max(0, combo - 1) / ENERGIE_MAX))];
function ZeitEnergie({ combo }) {
  const felder = combo > 0 && combo % ENERGIE_MAX === 0 ? ENERGIE_MAX : combo % ENERGIE_MAX;
  const S = energieStufe(combo);
  const stufeNr = Math.floor(Math.max(0, combo - 1) / ENERGIE_MAX) + 1;
  // gerade ein Feld dazugekommen? (als Zustand, damit das Lobwort nicht beim nächsten Neuzeichnen verschwindet)
  const vorher = useRef(combo);
  const [frisch, setFrisch] = useState(null);
  useEffect(() => {
    const mehr = combo > vorher.current;
    vorher.current = combo;
    if (!mehr) { setFrisch(null); return; }
    setFrisch(combo);
    const t = setTimeout(() => setFrisch(null), 1500);
    return () => clearTimeout(t);
  }, [combo]);
  const neu = frisch === combo && combo > 0;
  const lob = neu && felder < ENERGIE_MAX ? ENERGIE_LOB[felder] : '';
  return (
    <div className="relative flex items-center gap-1.5" title="Zeitenergie: Aufgaben ohne Fehler in Folge" aria-label={`Zeitenergie ${felder} von ${ENERGIE_MAX}`}>
      {/* Lobwort steigt über der Leiste auf, je voller desto größer */}
      {lob && <span key={'lob' + combo} className={`absolute -top-7 right-0 whitespace-nowrap font-black pointer-events-none wort-steigt ${S.text} text-sm`} style={{ textShadow: `0 0 10px rgba(${S.rgb},0.9)` }}>{lob}</span>}
      <Zap className={`w-5 h-5 transition-all ${felder ? S.blitz : 'text-slate-600'} ${felder === ENERGIE_MAX ? 'anim-hud' : ''}`} />
      {Array.from({ length: ENERGIE_MAX }, (_, i) => (
        <span key={i + (i === felder - 1 && neu ? '-neu' + combo : '')}
          className={`h-5 rounded-sm border transition-all duration-300 ${i < felder ? `${S.feld} ${S.glanz}` : 'bg-slate-800 border-slate-600'} ${i === felder - 1 && neu ? 'feld-pop' : ''} ${felder === ENERGIE_MAX && i < felder ? 'energie-puls' : ''}`}
          style={{ width: i < felder ? `${14 + i * 2}px` : '14px' }} />
      ))}
      {combo >= 2 && <span key={combo} className={`ml-1 text-sm font-black anim-pop ${S.text}`}>×{combo}</span>}
      {stufeNr >= 2 && <span className={`ml-1 text-[10px] md:text-xs font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${S.text} border-current`}>Stufe {stufeNr}</span>}
    </div>
  );
}
function EnergieVoll({ combo }) {
  const S = energieStufe(combo);
  const stufeNr = Math.floor((combo - 1) / ENERGIE_MAX) + 1;
  const [wort] = useState(() => ENERGIE_VOLL[(stufeNr - 1) % ENERGIE_VOLL.length]);
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30" aria-hidden="true">
      {[0, 1, 2, 3].map(i => <div key={i} className={`absolute w-32 h-32 rounded-full border-4 ${S.ring} zs-ring`} style={{ animationDelay: `${i * 0.13}s` }} />)}
      <div className="relative energie-voll flex flex-col items-center gap-1">
        <Zap className={`w-16 h-16 md:w-20 md:h-20 ${S.blitz}`} style={{ filter: `drop-shadow(0 0 16px rgba(${S.rgb},1))` }} />
        <span className={`font-black text-4xl md:text-6xl tracking-wide ${S.text}`} style={{ textShadow: `0 0 20px rgba(${S.rgb},1), 0 4px 0 rgba(2,6,23,0.9)`, WebkitTextStroke: '1.5px rgba(2,6,23,0.85)' }}>{wort}</span>
        <span className="bg-slate-950/90 border-2 border-current text-sm md:text-base font-black uppercase tracking-widest px-3 py-0.5 rounded-xl" style={{ color: `rgb(${S.rgb})` }}>{combo} ohne Fehler · Energie-Stufe {stufeNr}</span>
      </div>
    </div>
  );
}

// Kopf mit Fortschritt, Rückmeldung und Weiter-Knopf
function RundenRahmen({ runde, children }) {
  const { nr, anzahl, phase, msg, geloest, weiter, schluessel, combo } = runde;
  const voll = combo > 0 && combo % ENERGIE_MAX === 0;
  // Großes Feuerwerk nur für große Leistungen: ganze Tabelle / Text / Familien-Sortieren (mehrere Punkte),
  // die letzte Aufgabe der Runde oder volle Zeitenergie. Sonst kleine Funken.
  const grosseAufgabe = (runde.aufgabe?.punkte || 1) >= 3 || runde.aufgabe?.tabelle;
  const gross = grosseAufgabe || voll || (phase === 'haupt' && nr === anzahl);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-sm font-bold text-slate-300 whitespace-nowrap">{phase === 'wiederholung' ? 'Noch einmal üben' : 'Aufgabe'} {nr} von {anzahl}</span>
        <div className="flex-1 min-w-[6rem] h-2.5 rounded-full bg-slate-800 overflow-hidden">
          <div className={`h-full rounded-full ${phase === 'wiederholung' ? 'bg-amber-400' : 'bg-cyan-400'}`} style={{ width: `${((nr - 1) / anzahl) * 100}%` }} />
        </div>
        <ZeitEnergie combo={combo} />
      </div>
      {runde.rekord.neu && combo >= runde.rekord.neu && <div className="-mt-2 text-right"><RekordMeldung serie={combo} /></div>}
      {phase === 'wiederholung' && nr === 1 && <p className="text-amber-200 text-sm">Diese Aufgaben waren schwierig. Übe sie noch einmal. Das zählt nicht für die Sterne.</p>}
      {/* Erfolgs-Feuerwerk in allen Spielen, sobald eine Aufgabe gelöst ist (Wunsch der Lehrkraft 20.11.2026) */}
      <div className="relative">
        {children}
        {geloest && msg?.art === 'gut' && <Funken key={'funken-' + schluessel} gross={gross} />}   {/* eigener Schlüssel! Gleicher Schlüssel wie die Aufgabe ließ alte Aufgaben stehen */}
        {geloest && voll && msg?.art === 'gut' && <EnergieVoll key={'energie-' + combo} combo={combo} />}
      </div>
      <div className="min-h-[3.5rem] flex flex-col sm:flex-row items-center gap-3">
        {msg && (
          <p className={`flex-1 rounded-xl px-4 py-3 font-bold text-left anim-pop ${msg.art === 'gut' ? 'bg-lime-500/15 border-2 border-lime-400/60 text-lime-200' : msg.art === 'falsch' ? 'bg-rose-500/15 border-2 border-rose-400/60 text-rose-200' : 'bg-slate-800 border-2 border-slate-600 text-slate-200'}`}>{msg.text}</p>
        )}
        {geloest && (
          <button onClick={weiter} className="bg-cyan-400 hover:bg-cyan-300 text-cyan-950 font-black text-lg py-3 px-8 rounded-xl shadow-[0_4px_0_rgba(14,116,144,1)] active:translate-y-1 uppercase tracking-wider flex items-center gap-2 flex-shrink-0">
            Weiter <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

// Echtes Ziehen (Drag & Drop, Wunsch der Lehrkraft 21.11.2026) mit Pointer-Events: funktioniert mit Finger (iPad),
// Stift und Maus; HTML5-Drag-and-Drop wird bewusst nicht benutzt (auf dem iPad unzuverlässig).
// Antippen + Ziel antippen funktioniert weiterhin: Erst ab 8 px Bewegung wird gezogen, sonst bleibt es ein Klick.
// griff(id) an den ziehbaren Knopf, ziel(id) an das Ablagefeld; onAblegen(id, zielId) wird beim Loslassen über einem Ziel gerufen.
function useZiehen(onAblegen) {
  const [zug, setZug] = useState(null);          // { id, x, y, w, h, inhalt }
  const [ueber, setUeber] = useState(null);      // Ziel unter dem Finger
  const start = useRef(null), gezogen = useRef(false), ablegen = useRef(onAblegen);
  ablegen.current = onAblegen;
  useEffect(() => {
    const zielUnter = (x, y) => document.elementFromPoint(x, y)?.closest('[data-ziel]')?.getAttribute('data-ziel') ?? null;
    const bewegen = (e) => {
      const s = start.current;
      if (!s || e.pointerId !== s.pid) return;
      if (!s.aktiv && Math.hypot(e.clientX - s.x0, e.clientY - s.y0) < 8) return;
      s.aktiv = true;
      e.preventDefault();
      setZug({ id: s.id, inhalt: s.inhalt, w: s.w, h: s.h, x: e.clientX - s.dx, y: e.clientY - s.dy });
      setUeber(zielUnter(e.clientX, e.clientY));
    };
    const loslassen = (e) => {
      const s = start.current;
      if (!s || e.pointerId !== s.pid) return;
      start.current = null;
      if (!s.aktiv) return;
      gezogen.current = true;                      // folgenden Klick verschlucken (danach zurücksetzen, falls keiner kommt)
      setTimeout(() => { gezogen.current = false; }, 80);
      setZug(null); setUeber(null);
      const z = e.type === 'pointercancel' ? null : zielUnter(e.clientX, e.clientY);
      if (z !== null) ablegen.current(s.id, z);
    };
    window.addEventListener('pointermove', bewegen, { passive: false });
    window.addEventListener('pointerup', loslassen);
    window.addEventListener('pointercancel', loslassen);
    return () => { window.removeEventListener('pointermove', bewegen); window.removeEventListener('pointerup', loslassen); window.removeEventListener('pointercancel', loslassen); };
  }, []);
  const griff = (id, inhalt) => ({
    onPointerDown: (e) => {
      if (e.button > 0) return;
      const r = e.currentTarget.getBoundingClientRect();
      start.current = { id, inhalt, pid: e.pointerId, x0: e.clientX, y0: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, w: r.width, h: r.height, aktiv: false };
      gezogen.current = false;
    },
    onClickCapture: (e) => { if (gezogen.current) { gezogen.current = false; e.stopPropagation(); e.preventDefault(); } },
    style: { touchAction: 'none', opacity: zug?.id === id ? 0.35 : undefined },
  });
  const ziel = (id) => ({ 'data-ziel': String(id) });
  const istUeber = (id) => ueber === String(id);
  // „Geist“: schwebende Kopie unter dem Finger
  const geist = zug && createPortal(
    <div className="fixed z-[500] pointer-events-none rounded-xl border-2 border-b-4 border-cyan-500 bg-cyan-100 text-cyan-950 font-bold text-xl flex items-center justify-center shadow-[0_12px_30px_rgba(0,0,0,0.45)] scale-110 rotate-2"
      style={{ left: zug.x, top: zug.y, width: zug.w, height: zug.h }}>{zug.inhalt}</div>,
    document.body
  );
  return { griff, ziel, istUeber, geist, zieht: !!zug };
}

// Großer Knopf auf heller Karte (Auswahl, Endungen); weitere Eigenschaften (z. B. zum Ziehen) werden durchgereicht
function WahlKnopf({ onClick, children, aus = false, cls = '', ...rest }) {
  return (
    <button {...rest} onClick={onClick} disabled={aus}
      className={`min-w-[4rem] rounded-xl border-2 border-b-4 px-4 py-3 text-xl font-bold transition-all active:translate-y-0.5 disabled:opacity-40 ${cls || 'bg-white border-stone-300 text-slate-800 hover:bg-stone-50 hover:border-slate-400'}`}>
      {children}
    </button>
  );
}

// Eingabefeld für Verbformen (Großschreibung zählt als Fehler, keine Autokorrektur)
function TippFeld({ wert, setWert, status, onEnter, breite = 'w-36', label }) {
  const farbe = status === 'richtig' ? 'border-lime-600 bg-lime-50 text-lime-900' : status === 'falsch' ? 'border-rose-500 bg-rose-50 text-rose-900' : status === 'leer' ? 'border-amber-500 border-dashed bg-amber-50 text-slate-900' : 'border-slate-400 bg-white text-slate-900';
  return (
    <input value={wert} onChange={e => setWert(e.target.value)} onKeyDown={e => e.key === 'Enter' && onEnter && onEnter()}
      autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck="false" aria-label={label}
      disabled={status === 'richtig'}
      className={`${breite} inline-block align-baseline rounded-lg border-2 px-2 py-1 text-xl font-bold text-center outline-none focus:ring-4 focus:ring-cyan-300/60 ${farbe}`} />
  );
}

// Gezielte Hinweise bei Fast-Treffern (zählt trotzdem als Fehler)
function diagnose(eingabe, richtig, v, zeit) {
  const e = eingabe.trim();
  if (!e) return 'Schreib die Verbform in das Feld.';
  if (e.toLowerCase() === richtig.toLowerCase() && e !== richtig) return 'Verben schreibt man klein.';
  if (e.replace(/ss/g, 'ß') === richtig) return 'Nach einem langen Selbstlaut schreibt man ß.';
  if (e.replace(/ß/g, 'ss') === richtig) return 'Nach einem kurzen Selbstlaut schreibt man ss.';
  if (richtig.includes('ie') && e === richtig.replace('ie', 'i')) return `Hier schreibt man ie: ${richtig}.`;
  for (let i = 1; i < richtig.length; i++) {
    if (richtig[i] === richtig[i - 1] && /[bcdfgklmnprstz]/.test(richtig[i]) && richtig.slice(0, i) + richtig.slice(i + 1) === e) return `Hier steht ein doppelter Buchstabe: ${richtig[i]}${richtig[i]}.`;
  }
  for (let i = 1; i < e.length; i++) {
    if (e[i] === e[i - 1] && e.slice(0, i) + e.slice(i + 1) === richtig) return `Hier steht nur ein ${e[i]}: ${richtig}.`;
  }
  if (v && zeit === 'praeteritum') {
    const s = wortstamm(v);
    if (v.art === 'u' && (e === s + 'te' || e === s + 'ete' || e === s + 'test' || e === s + 'ten' || e === s + 'tet')) return `„${v.g}“ ist unregelmäßig. Schau ins Wörterbuch!`;
    if (besonderheit(v) === 'dt' && e === richtig.replace(/ete/, 'te')) return 'Nach d oder t kommt ein -e- dazu: redete, arbeitete.';
  }
  if (v && zeit === 'partizip' && v.art === 'u' && e === 'ge' + wortstamm(v) + 't') return `„${v.g}“ ist unregelmäßig. Die ge-Form endet auf -en.`;
  return 'Das stimmt noch nicht. Schau genau hin.';
}

// Personalpronomen für Aufgaben ohne Satz (3. Person wechselnd, Mehrzahl mit Hinweis)
function pronomen(person) {
  if (person === 2) return { t: zufall(['er', 'sie', 'es']), hinweis: null };
  if (person === 5) return { t: 'sie', hinweis: 'viele' };
  return { t: PERSONEN[person], hinweis: null };
}

// ==========================================
// SPIEL 1 + 4: Endungs-Maschine (Präsens) und te-Werkstatt (Präteritum)
// ==========================================
const ENDUNGS_TIPP = {
  praesens: ['Bei „ich“ endet das Verb im Präsens auf -e: ich male.', 'Bei „du“ endet das Verb auf -st: du malst.', 'Bei „er, sie, es“ endet das Verb auf -t: er malt.', 'Bei „wir“ endet das Verb auf -en: wir malen.', 'Bei „ihr“ endet das Verb auf -t: ihr malt.', 'Bei „sie“ (viele) endet das Verb auf -en: sie malen.'],
  praeteritum: ['Im Präteritum bekommt „ich“ die Endung -te: ich malte.', '„du“ bekommt -test: du maltest.', '„er, sie, es“ bekommt -te: er malte.', '„wir“ bekommt -ten: wir malten.', '„ihr“ bekommt -tet: ihr maltet.', '„sie“ (viele) bekommt -ten: sie malten.'],
};
const BESONDERHEIT_TIPP = {
  dt: 'Endet der Wortstamm auf d oder t, kommt ein e dazwischen: du redest, er redete.',
  sz: 'Endet der Wortstamm auf s, ß oder z, bekommt „du“ nur ein -t: du tanzt.',
  eln: 'Verben auf -eln und -ern bekommen bei „wir“ und „sie“ nur ein -n: wir wandern.',
};
const LEISTE = {
  praesens: { 3: ['e', 'st', 't', 'en'], 4: ['e', 'st', 't', 'en', 'est', 'et', 'n'] },
  praeteritum: { 3: ['te', 'test', 'ten', 'tet'], 4: ['te', 'test', 'ten', 'tet', 'ete', 'etest', 'eten', 'etet'] },
};

// Personen, bei denen die Besonderheit sichtbar wird (Profi-Aufgaben)
const PROFI_PERSONEN = {
  praesens: { dt: [1, 2, 4], sz: [1], eln: [3, 5] },
  praeteritum: { dt: [0, 1, 2, 3, 4, 5] },
};
function endungsAufgaben(spielId, stufe, zeit, n) {
  // Stufe 3: nur regelmäßige Verben ohne Besonderheit (also z. B. nie putzen); Stufe 4 zusätzlich Profi-Aufgaben am Ende
  const leicht = verbenFuer(stufe, v => v.art === 'r' && !besonderheit(v));
  const profi = stufe === 4 ? verbenFuer(4, v => v.art === 'r' && PROFI_PERSONEN[zeit][besonderheit(v)]) : [];
  const nProfi = profi.length ? Math.round(n * 0.2) : 0;
  const personen = mische([0, 1, 2, 3, 4, 5, ...mische([0, 1, 2, 3, 4, 5])]);   // alle sechs Personen kommen vor
  const a = waehle(spielId, leicht.map(v => ({ key: v.g, v })), n - nProfi)
    .map((x, i) => ({ key: `${x.v.g}-${personen[i]}`, verb: x.v.g, person: personen[i] }));
  const b = mische(profi).slice(0, nProfi)
    .map(v => { const p = zufall(PROFI_PERSONEN[zeit][besonderheit(v)]); return { key: `${v.g}-${p}`, verb: v.g, person: p }; });
  return [...nichtHintereinander(a), ...b];
}

function EndungsAufgabe({ runde, aufgabe, zeit, stufe }) {
  const v = verbByGrundform[aufgabe.verb];
  const f = (zeit === 'praesens' ? praesens(v) : praeteritum(v))[aufgabe.person];
  const [pr] = useState(() => pronomen(aufgabe.person));
  const [gewaehlt, setGewaehlt] = useState(null);
  const leiste = LEISTE[zeit][stufe];
  const Z = ZEITEN[zeit];
  const tippe = (e) => {
    if (runde.geloest) return;
    const ok = e === f.endung;
    runde.erst(0, ok);
    if (ok) { setGewaehlt(e); runde.geschafft(`${zufall(LOB)} ${pr.t} ${f.text}`); }
    else {
      const b = besonderheit(v);
      runde.falsch(`„${pr.t}${pr.hinweis ? ` (${pr.hinweis})` : ''} ${f.stamm}${e}“ stimmt nicht.`, b ? BESONDERHEIT_TIPP[b] : ENDUNGS_TIPP[zeit][aufgabe.person]);
    }
  };
  return (
    <Leuchttafel zeit={zeit} titel={zeit === 'praesens' ? 'Endungs-Maschine' : 'te-Werkstatt'}>
      <p className="text-stone-500 text-base">Grundform: <b className="text-slate-800">{v.g}</b></p>
      <p {...(gewaehlt ? { 'data-loesung': '' } : {})} className="text-4xl md:text-5xl font-bold text-center my-6">
        <span className="text-slate-700 mr-3">{pr.t}{pr.hinweis && <span className="text-sm text-stone-400 font-semibold ml-1">({pr.hinweis})</span>}</span>
        <span className="underline decoration-[3px] decoration-slate-900 underline-offset-8">{f.stamm}</span>
        {gewaehlt
          ? <span className={`font-black ${Z.text}`}>{gewaehlt}</span>
          : <span className="inline-block w-20 h-12 align-middle border-4 border-dashed border-stone-300 rounded-lg ml-1" />}
      </p>
      <div className="flex flex-wrap justify-center gap-2 md:gap-3">
        {leiste.map(e => <WahlKnopf key={e} onClick={() => tippe(e)} aus={runde.geloest}>-{e}</WahlKnopf>)}
      </div>
    </Leuchttafel>
  );
}

// Tabelle (te-Werkstatt, letzte Aufgabe): ein regelmäßiges Verb in allen Personen, Endungen der Reihe nach einsetzen
function EndungsTabelle({ runde, aufgabe, zeit, stufe }) {
  const v = verbByGrundform[aufgabe.verb];
  const formen = (zeit === 'praesens' ? praesens(v) : praeteritum(v));
  const [fertig, setFertig] = useState([]);
  const aktiv = fertig.length;
  const leiste = LEISTE[zeit][stufe];
  const Z = ZEITEN[zeit];
  const zz = useZiehen((e) => tippe(e));          // Endung in die aktive Zeile ziehen
  const tippe = (e) => {
    if (runde.geloest) return;
    const f = formen[aktiv];
    if (e === f.endung) {
      const neu = [...fertig, e];
      setFertig(neu);
      if (neu.length === 6) { runde.erst(0, true); runde.geschafft('Die ganze Tabelle stimmt!'); } else runde.leer();
    } else {
      runde.erst(0, false);
      runde.falsch(`„${PERSONEN[aktiv]} ${f.stamm}${e}“ stimmt nicht.`, ENDUNGS_TIPP[zeit][aktiv]);
    }
  };
  return (
    <Leuchttafel zeit={zeit} titel="Tabelle">
      <p className="text-stone-500 text-base mb-2">Setze die Endungen ein: <b className="text-slate-800">{v.g}</b> im {ZEITEN[zeit].name}. Ziehe die Endung in die helle Zeile oder tippe sie an.</p>
      <table className="mx-auto text-2xl md:text-3xl"><tbody>
        {PERSONEN.map((p, i) => (
          <tr key={p} {...(i === aktiv && !runde.geloest ? zz.ziel('aktiv') : {})} className={i === aktiv && !runde.geloest ? (zz.istUeber('aktiv') ? 'bg-cyan-300 outline outline-4 outline-cyan-500' : 'bg-cyan-100') : ''}>
            <td className="pr-4 py-1 text-stone-500 text-xl">{p}</td>
            <td className="py-1"><span className="underline decoration-2 decoration-slate-900 underline-offset-4">{formen[i].stamm}</span>
              {i < aktiv ? <span className={`font-black ${Z.text}`}>{fertig[i]}</span> : <span className="inline-block w-14 h-8 align-middle border-2 border-dashed border-stone-300 rounded ml-1" />}</td>
          </tr>
        ))}
      </tbody></table>
      <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-4">
        {leiste.map(e => <WahlKnopf key={e} {...zz.griff(e, '-' + e)} onClick={() => tippe(e)} aus={runde.geloest}>-{e}</WahlKnopf>)}
      </div>
      {zz.geist}
    </Leuchttafel>
  );
}

function EndungsSpiel({ spiel, stufe, onFinish, onTipp, zeit }) {
  const [aufgaben] = useState(() => {
    const n = zeit === 'praesens' ? 10 : 8;
    const liste = endungsAufgaben(spiel.id, stufe, zeit, n);
    if (zeit === 'praeteritum') {
      const tab = zufall(verbenFuer(stufe, v => v.art === 'r' && (stufe === 4 || !besonderheit(v))));
      liste.push({ key: 'tabelle-' + tab.g, verb: tab.g, tabelle: true });
    }
    return liste;
  });
  const runde = useRunde({ aufgaben, skill: zeit === 'praesens' ? 'praesens' : 'praeteritum', onFinish, onTipp });
  const A = runde.aufgabe.tabelle ? EndungsTabelle : EndungsAufgabe;
  return <RundenRahmen runde={runde}><A key={runde.schluessel} runde={runde} aufgabe={runde.aufgabe} zeit={zeit} stufe={stufe} /></RundenRahmen>;
}
const EndungsMaschine = (p) => <EndungsSpiel {...p} zeit="praesens" />;
const TeWerkstatt = (p) => <EndungsSpiel {...p} zeit="praeteritum" />;

// ==========================================
// SPIEL 2 + 13: Zeitmaschinen-Tore und Zeitform-Detektiv
// ==========================================
const TOR = {
  praeteritum: { titel: 'früher', cls: 'bg-amber-100 border-amber-500 text-amber-800 hover:bg-amber-200' },
  perfekt:     { titel: 'früher', cls: 'bg-lime-100 border-lime-600 text-lime-900 hover:bg-lime-200' },
  praesens:    { titel: 'jetzt', cls: 'bg-rose-100 border-rose-500 text-rose-800 hover:bg-rose-200' },
  futur:       { titel: 'später', cls: 'bg-sky-100 border-sky-500 text-sky-800 hover:bg-sky-200' },
};
// Begründung am konkreten Satz
function grundFuer(satz) {
  const verb = satz.teile.find(x => x.rolle === 'verb'), hv = satz.teile.find(x => x.rolle === 'hv'), zw = satz.teile.find(x => x.rolle === 'zweites');
  if (satz.zeit === 'praesens') return `„${verb.t}“ ist Präsens. Es passiert jetzt.`;
  if (satz.zeit === 'praeteritum') return `„${verb.t}“ ist Präteritum. Es ist früher passiert.`;
  if (satz.zeit === 'perfekt') return `„${hv.t} … ${zw.t}“: Hilfsverb und ge-Form. Das ist Perfekt.`;
  return `„${hv.t} … ${zw.t}“: werden und Grundform. Das ist Futur.`;
}

function torAufgaben(spielId, stufe, art) {
  const rahmen = rahmenDerStufe(stufe);
  const ziehe = (zeit, mitSatz) => {
    for (let k = 0; k < 50; k++) {
      const r = zufall(rahmen), p = r.wer ? zufall(r.wer) : Math.floor(Math.random() * 6);
      if (!satzErlaubt(r, p, zeit)) continue;
      const vv = verbByGrundform[r.v];
      if (!mitSatz && praesens(vv)[p].text === praeteritum(vv)[p].text) continue;
      const satz = baueSatz(r, p, zeit, Math.floor(Math.random() * 6));
      if (!mitSatz) {
        const pr = r.subj ? (PRONOMEN_KLEIN[satz.teile[0].t] || satz.teile[0].t) : pronomen(p).t;
        satz.text = `${pr} ${satz.teile.find(x => x.rolle === 'verb').t}`;
      }
      return { key: `${r.v}-${p}-${zeit}-${mitSatz}`, verb: r.v, zeit, satz, grund: grundFuer(satz) };
    }
  };
  if (art === 'regen') {
    // Zeit-Regen: 30 kurze Verbformen mit Pronomen, halb Präsens, halb Präteritum, keine doppelt
    const zeiten = mische([...Array(REGEN_ANZAHL / 2).fill('praesens'), ...Array(REGEN_ANZAHL / 2).fill('praeteritum')]);
    const schon = new Set(), liste = [];
    for (const z of zeiten) {
      for (let k = 0; k < 30; k++) {
        const a = ziehe(z, false);
        if (a && !schon.has(a.satz.text)) { schon.add(a.satz.text); liste.push({ ...a, text: a.satz.text }); break; }
      }
    }
    return nichtHintereinander(liste);
  }
  if (art === 'tore') {
    // 20 Aufgaben, halb Präsens halb Präteritum; erst Verbformen mit Pronomen, dann Sätze
    const zeiten = mische([...Array(10).fill('praesens'), ...Array(10).fill('praeteritum')]);
    const liste = zeiten.map((z, i) => ziehe(z, i >= 10));
    return nichtHintereinander(liste);
  }
  // Detektiv: 15 Sätze, erste Hälfte eindeutig, zweite Hälfte mit Fallen
  const zeiten = stufe === 4 ? ['praeteritum', 'perfekt', 'praesens', 'futur'] : ['praeteritum', 'praesens', 'futur'];
  const eindeutig = mische([...zeiten, ...zeiten, ...zeiten]).slice(0, 7).map(z => ziehe(z, true));
  const fallen = waehle(spielId, DETEKTIV_FALLEN.filter(f => f.stufe <= stufe).map(f => ({ ...f, key: f.satz })), 5)
    .map(f => ({ key: f.key, verb: f.satz, zeit: f.zeit, satz: { text: f.satz }, grund: f.grund, falle: true }));
  const rest = mische(zeiten).slice(0, 3).map(z => ziehe(z, true));
  return [...nichtHintereinander(eindeutig), ...mische([...fallen, ...rest])];
}

function TorAufgabe({ runde, aufgabe, zeiten }) {
  const tippe = (z) => {
    if (runde.geloest) return;
    const ok = z === aufgabe.zeit;
    runde.erst(0, ok);
    if (ok) runde.geschafft(`${zufall(LOB)} ${aufgabe.grund}`);
    // Rückmeldung nennt den Grund am konkreten Satz (Auftrag); die Aufgabe bleibt stehen, bis das richtige Tor gewählt ist
    else runde.falsch(`Nicht ${ZEITEN[z].name}. ${aufgabe.grund}`, 'Schau auf das Verb: Gibt es ein zweites Verb am Satzende? Hat es -te oder einen anderen Selbstlaut?');
  };
  return (
    <div className="space-y-5">
      <Leuchttafel zeit={null} titel={aufgabe.falle ? 'Vorsicht, Falle?' : 'Welche Zeitform?'}>
        <p className="text-3xl md:text-4xl font-bold text-center py-6 text-slate-900">{aufgabe.satz.text}</p>
      </Leuchttafel>
      <div className={`grid gap-3 ${zeiten.length === 2 ? 'grid-cols-2' : zeiten.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
        {zeiten.map(z => (
          <button key={z} onClick={() => tippe(z)} disabled={runde.geloest}
            className={`rounded-2xl border-4 border-b-8 py-4 md:py-6 flex flex-col items-center gap-1 font-black transition-all active:translate-y-1 disabled:opacity-60 ${TOR[z].cls}`}>
            <DoorOpen className="w-8 h-8 md:w-10 md:h-10" />
            <span className="text-lg md:text-2xl uppercase tracking-wider">{TOR[z].titel}</span>
            <span className="text-sm md:text-base">{ZEITEN[z].name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ToreSpiel({ spiel, stufe, onFinish, onTipp }) {
  const detektiv = spiel.id === 'detektiv';
  const [aufgaben] = useState(() => torAufgaben(spiel.id, stufe, detektiv ? 'detektiv' : 'tore'));
  const zeiten = detektiv ? (stufe === 4 ? ['praeteritum', 'perfekt', 'praesens', 'futur'] : ['praeteritum', 'praesens', 'futur']) : ['praesens', 'praeteritum'];
  const runde = useRunde({ aufgaben, skill: 'erkennen', onFinish, onTipp });
  return <RundenRahmen runde={runde}><TorAufgabe key={runde.schluessel} runde={runde} aufgabe={runde.aufgabe} zeiten={zeiten} /></RundenRahmen>;
}

// ==========================================
// SPIEL 2: Zeit-Regen (bis 21.11.2026 „Zeitmaschinen-Tore“; id 'tore' bleibt wegen des Zeitreise-Codes)
// ==========================================
// Schnellspiel nach Baukasten Typ 4 (Vorbild Wörter-Regen der Redezeichen-Helden): 30 Verbformen fallen nacheinander,
// das Kind tippt vor dem Aufprall das Tor JETZT (Präsens) oder FRÜHER (Präteritum). Combo bei Treffern in Folge,
// das Tempo steigt mit jedem Wort; Klasse 3 fällt langsamer. Auch mit Tastatur: ← / 1 = JETZT, → / 2 = FRÜHER.
// Sterne: jede Entscheidung zählt, ein ohne Tippen gefallenes Wort zählt als Fehler (nicht für „Das kann ich schon“).
const REGEN_ANZAHL = 30;
const REGEN_TORE = [
  { zeit: 'praesens', titel: 'jetzt', taste: ['ArrowLeft', '1'], cls: 'border-rose-400 bg-rose-950/60 text-rose-100', an: 'border-lime-300 bg-lime-700 text-white shadow-[0_0_50px_rgba(163,230,53,0.8)]' },
  { zeit: 'praeteritum', titel: 'früher', taste: ['ArrowRight', '2'], cls: 'border-amber-400 bg-amber-950/60 text-amber-100', an: 'border-lime-300 bg-lime-700 text-white shadow-[0_0_50px_rgba(163,230,53,0.8)]' },
];
function ZeitRegen({ spiel, stufe, onFinish }) {
  const [woerter] = useState(() => torAufgaben(spiel.id, stufe, 'regen'));
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState('start');          // start | faellt | pause
  const [fall, setFall] = useState(0);                  // 0 … 100 (Prozent der Fallhöhe)
  const [combo, setCombo] = useState(0);
  const [besteCombo, setBesteCombo] = useState(0);
  const [treffer, setTreffer] = useState(0);
  const [antwort, setAntwort] = useState(null);         // { tor, richtig }
  const punkte = useRef(0), fallRef = useRef(0), uhr = useRef(null), besteComboRef = useRef(0);
  const rekord = useNeuerRekord(combo);
  const track = useTrack();
  const wort = woerter[idx];
  useEffect(() => () => clearTimeout(uhr.current), []);

  const weiter = () => {
    fallRef.current = 0; setFall(0); setAntwort(null);
    if (idx + 1 < woerter.length) { setIdx(i => i + 1); setPhase('faellt'); }
    else onFinish(Math.round((punkte.current * 10) / woerter.length), 10, { serie: besteComboRef.current, combo: true });
  };
  const entscheide = (tor) => {
    if (phase !== 'faellt') return;
    setPhase('pause');
    const richtig = tor !== null && tor === wort.zeit;
    if (tor !== null) track('erkennen', richtig);   // heruntergefallen = keine Entscheidung
    if (richtig) {
      punkte.current += 1; setTreffer(punkte.current); ton('richtig');
      setCombo(c => { const n = c + 1; setBesteCombo(b => Math.max(b, n)); besteComboRef.current = Math.max(besteComboRef.current, n); return n; });
    } else { ton('falsch'); setCombo(0); }
    setAntwort({ tor, richtig });
    uhr.current = setTimeout(weiter, richtig ? 650 : 1600);
  };

  // Fallen: Tempo steigt mit jedem Wort (Wort 1 ca. 7 s, Wort 30 ca. 3 s; Klasse 3 etwas langsamer)
  useEffect(() => {
    if (phase !== 'faellt') return;
    const schritt = (stufe === 3 ? 0.36 : 0.42) * (1 + idx * 0.042);
    const t = setInterval(() => {
      fallRef.current = Math.min(100, fallRef.current + schritt);
      setFall(fallRef.current);
      if (fallRef.current >= 100) { clearInterval(t); entscheide(null); }
    }, 30);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx]);

  // Tastatur (digitale Tafel, Laptop)
  useEffect(() => {
    const taste = (e) => {
      if (phase === 'start' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setPhase('faellt'); return; }
      const tor = REGEN_TORE.find(t => t.taste.includes(e.key));
      if (tor) { e.preventDefault(); entscheide(tor.zeit); }
    };
    window.addEventListener('keydown', taste);
    return () => window.removeEventListener('keydown', taste);
  });

  const feuer = combo >= 6, warm = combo >= 3;
  const tempo = Math.min(5, 1 + Math.floor(idx / 6));
  const torKlasse = (t) => {
    const basis = 'relative flex-1 flex flex-col items-center justify-end gap-1 pb-4 md:pb-5 rounded-t-[3rem] md:rounded-t-[5rem] border-x-8 border-t-8 h-[130px] md:h-[160px] font-black transition-all select-none ';
    if (antwort?.richtig && antwort.tor === t.zeit) return basis + t.an + ' tor-jubel';
    if (antwort && !antwort.richtig) return basis + (antwort.tor === t.zeit ? 'border-rose-600 bg-rose-950 text-rose-200 opacity-70' : 'border-slate-700 bg-slate-900 text-slate-400 opacity-60');
    if (feuer) return basis + t.cls + ' feuer-glut';
    if (warm) return basis + t.cls + ' shadow-[0_0_20px_rgba(234,179,8,0.45)]';
    return basis + t.cls + ' hover:brightness-125 active:scale-95';
  };
  return (
    <div className="space-y-3 select-none">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-bold text-slate-300">Wort {Math.min(idx + 1, woerter.length)} von {woerter.length} · Treffer <b className="text-lime-300">{treffer}</b></span>
        <span className="flex items-center gap-1 text-sm font-bold text-slate-400" title="Tempo">
          Tempo {Array.from({ length: 5 }, (_, i) => <span key={i} className={`w-2 h-3 rounded-sm ${i < tempo ? 'bg-cyan-300' : 'bg-slate-700'}`} />)}
        </span>
        <span key={'c' + combo} className={`flex items-center gap-1 font-black text-xl md:text-2xl transition-all ${feuer ? 'text-orange-400 scale-125 drop-shadow-[0_0_14px_rgba(249,115,22,1)]' : warm ? 'text-yellow-300 scale-110 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'text-slate-400'} ${combo ? 'anim-pop' : ''}`}>
          {feuer && <Flame className="w-6 h-6" />} COMBO {combo}
        </span>
      </div>
      {phase === 'start' ? (
        <div className="rounded-2xl border-4 border-cyan-500/40 bg-slate-950/60 h-[440px] md:h-[520px] flex flex-col items-center justify-center text-center px-6 anim-pop">
          <CloudRain className="w-20 h-20 text-cyan-300 mb-4 anim-float" />
          <p className="text-slate-100 text-lg md:text-xl max-w-lg mb-2">Verbformen regnen aus der Zeitmaschine! Ist es <b className="text-rose-300">jetzt</b> (Präsens) oder <b className="text-amber-300">früher</b> (Präteritum)?</p>
          <p className="text-slate-400 mb-8">Tippe das richtige Tor, bevor das Wort unten ankommt. Richtige Treffer in Folge bringen eine Combo. Es wird immer schneller!</p>
          <button onClick={() => setPhase('faellt')} className="bg-cyan-400 hover:bg-cyan-300 text-cyan-950 font-black text-2xl py-4 px-12 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.6)] active:scale-95 uppercase tracking-wider">Start!</button>
        </div>
      ) : (
        <div className={`relative rounded-2xl border-4 bg-slate-950/70 overflow-hidden h-[440px] md:h-[520px] flex flex-col ${feuer ? 'border-orange-500/70' : 'border-cyan-500/40'} ${antwort && !antwort.richtig ? 'anim-shake' : ''}`}>
          <div className="relative flex-1">
            <div className={`absolute left-1/2 whitespace-nowrap rounded-2xl border-4 px-6 md:px-8 py-3 md:py-4 text-3xl md:text-4xl font-black shadow-2xl ${antwort?.richtig ? 'regen-sog bg-lime-500 border-lime-200 text-white'
              : antwort ? 'bg-rose-800 border-rose-300 text-rose-50 -translate-x-1/2'
              : feuer ? 'bg-orange-500 border-yellow-200 text-white shadow-[0_0_30px_rgba(234,88,12,0.8)] -translate-x-1/2'
              : 'bg-amber-50 border-cyan-300 text-slate-900 -translate-x-1/2'}`}
              style={{ top: `calc(${fall}% * 0.82)` }}>
              {wort.text}
              {antwort && !antwort.richtig && <div className="text-base font-bold mt-1">→ {wort.zeit === 'praesens' ? 'jetzt (Präsens)' : 'früher (Präteritum)'}</div>}
            </div>
          </div>
          <div className="flex gap-3 md:gap-4 px-3 md:px-4">
            {REGEN_TORE.map(t => (
              <button key={t.zeit} onPointerDown={() => entscheide(t.zeit)} disabled={phase !== 'faellt'} className={torKlasse(t)}>
                <DoorOpen className="w-8 h-8 md:w-10 md:h-10" />
                <span className="text-xl md:text-3xl uppercase tracking-wider">{t.titel}</span>
                <span className="text-xs md:text-sm opacity-80">{ZEITEN[t.zeit].name}</span>
              </button>
            ))}
          </div>
          {antwort && antwort.tor === null && <div className="absolute inset-0 bg-rose-600/25 pointer-events-none" />}
        </div>
      )}
      {rekord.neu && combo >= rekord.neu && <div className="text-center"><RekordMeldung serie={combo} wort="Treffer in Folge" /></div>}
      {besteCombo >= 3 && <p className="text-center text-sm text-slate-400">Beste Combo: <b className="text-yellow-300">{besteCombo}</b>{rekord.alt >= 3 && <> · Rekord: <b className="text-amber-300">{Math.max(rekord.alt, besteCombo)}</b></>}</p>}
    </div>
  );
}

// ==========================================
// SPIEL 3, 9, 14: Texte (Finde den Unterschied, Text-Zeitmaschine, Zeit-Chaos reparieren)
// ==========================================
// Text in antippbare Wörter zerlegen. zeitFuer(i) = Zeitform des i-ten Verbs (praesens | praeteritum | perfekt).
// Perfekt: Das Hilfsverb steht an der Stelle des Verbs, das Partizip wandert vor das Satzzeichen am Satzende.
// (Für Perfekt nur Texte mit höchstens einem Verb pro Satz verwenden: perfektTauglich.)
function textWoerter(textObj, zeitFuer) {
  const woerter = [];
  let vi = 0, offen = [];
  const setzePartizipien = (zeichen) => { offen.forEach((w, k) => woerter.push({ ...w, nach: k === offen.length - 1 ? zeichen : '' })); offen = []; };
  for (const t of textTeile(textObj, 'praesens')) {
    if (t.v) {
      const z = zeitFuer(vi), v = verbByGrundform[t.v];
      if (z === 'perfekt') {
        const f = perfekt(v)[t.p];
        woerter.push({ t: f.hilfsverb, nach: '', verb: true, vi, v: t.v, p: t.p, zeit: z, teil: 'hv' });
        offen.push({ t: f.zweites, verb: true, vi, v: t.v, p: t.p, zeit: z, teil: 'p2' });
      } else {
        woerter.push({ t: (z === 'praeteritum' ? praeteritum(v) : praesens(v))[t.p].text, nach: '', verb: true, vi, v: t.v, p: t.p, zeit: z, teil: 'ganz' });
      }
      vi++;
      continue;
    }
    for (const s of t.t.split(/\s+/)) {
      if (!s) continue;
      if (/^[.,!?;:]+$/.test(s)) {
        if (offen.length && /[.!?]/.test(s)) setzePartizipien(s);
        else if (woerter.length) woerter[woerter.length - 1].nach += s;
        continue;
      }
      const m = s.match(/^(.*?)([.,!?;:]*)$/);
      if (offen.length && /[.!?]/.test(m[2])) { woerter.push({ t: m[1], nach: '', verb: false }); setzePartizipien(m[2]); }
      else woerter.push({ t: m[1], nach: m[2], verb: false });
    }
  }
  return woerter;
}
// Höchstens ein Verb pro Satz → das Partizip lässt sich eindeutig ans Satzende stellen
const perfektTauglich = (textObj) => textObj.text.split(/[.!?]/).every(satz => (satz.match(/\{/g) || []).length <= 1);

// Antippbarer Text; felder: Wort-Index -> Eingabefeld (mit Ausgangsform klein darüber)
function TippText({ woerter, markiert, onTipp, status = {}, felder = null, aus = false }) {
  return (
    <p className="text-xl md:text-2xl leading-[2.6rem] md:leading-[3rem] text-slate-900">
      {woerter.map((w, i) => {
        const f = felder && felder[i];
        return (
          <React.Fragment key={i}>
            {f ? (
              // Das Ausgangsverb bleibt klein über dem Feld sichtbar, damit das Kind weiß, was es verwandelt
              <span className="inline-flex flex-col items-center align-bottom mx-0.5">
                <span className="text-xs md:text-sm text-stone-500 leading-none mb-0.5">{f.oben}</span>
                <TippFeld {...f} />
              </span>
            ) : (
              <button onClick={() => !aus && onTipp(i)} disabled={aus}
                className={`rounded-md px-1 -mx-0.5 transition-colors ${status[i] === 'richtig' ? 'bg-lime-200 text-lime-900 font-bold' : status[i] === 'falsch' ? 'bg-rose-200 text-rose-900 line-through decoration-2' : markiert.has(i) ? 'bg-cyan-200 font-bold' : 'hover:bg-stone-200'}`}>
                {w.t}
              </button>
            )}
            {w.nach}{' '}
          </React.Fragment>
        );
      })}
    </p>
  );
}

// Hilfsfunktion: angetippte Wörter prüfen. soll(w) = soll das Wort markiert sein?
function pruefeMarkierung(woerter, markiert, soll) {
  const status = {}; let gefunden = 0, falschGetippt = 0, gesucht = 0;
  woerter.forEach((w, i) => {
    const s = soll(w), m = markiert.has(i);
    if (s) gesucht++;
    if (s && m) { gefunden++; status[i] = 'richtig'; }
    if (!s && m) { falschGetippt++; status[i] = 'falsch'; }
  });
  return { status, gefunden, gesucht, falschGetippt, allesRichtig: gefunden === gesucht && falschGetippt === 0 };
}
const umschalten = (set, i) => { const n = new Set(set); n.has(i) ? n.delete(i) : n.add(i); return n; };
// Für jedes Verb (vi): wurden alle seine Teile richtig eingeordnet?
function proVerb(woerter, gut) {
  const r = {};
  woerter.forEach((w, i) => { if (w.verb) r[w.vi] = (r[w.vi] ?? true) && gut(w, i); });
  return r;
}

// --- Spiel 3: Finde den Unterschied (Stufe 4 Profi: Text B im Perfekt – beide Teile antippen)
function UnterschiedAufgabe({ runde, aufgabe }) {
  const zielB = aufgabe.zielB;
  const a = useMemo(() => textWoerter(aufgabe.text, () => 'praesens'), [aufgabe]);
  const b = useMemo(() => textWoerter(aufgabe.text, () => zielB), [aufgabe]);
  const [markiert, setMarkiert] = useState(new Set());
  const [status, setStatus] = useState({});
  const [geprueft, setGeprueft] = useState(false);
  const pruefe = () => {
    const r = pruefeMarkierung(b, markiert, w => w.verb);
    setStatus(r.status);
    if (!geprueft) {
      Object.entries(proVerb(b, (w, i) => markiert.has(i))).forEach(([vi, ok]) => runde.erst('v' + vi, ok));
      runde.minus(r.falschGetippt); setGeprueft(true);
    }
    if (r.allesRichtig) runde.geschafft(zielB === 'perfekt'
      ? `${zufall(LOB)} Jedes Verb hat sich verändert. Im Perfekt hat es zwei Teile: Hilfsverb und ge-Form.`
      : `${zufall(LOB)} Alle ${r.gesucht} Verben haben sich verändert. Sie stehen jetzt im Präteritum.`);
    else runde.falsch(`Du hast ${r.gefunden} von ${r.gesucht} veränderten Wörtern gefunden${r.falschGetippt ? `, ${r.falschGetippt} rot markierte Wörter sind gleich geblieben` : ''}.`,
      zielB === 'perfekt' ? 'Im Perfekt hat jedes Verb zwei Teile: „haben“ oder „sein“ und die ge-Form am Satzende. Tippe beide an.' : 'Vergleiche Satz für Satz: Welches Wort sieht unten anders aus als oben? Das sind die Verben.');
  };
  return (
    <div className="space-y-4">
      <Leuchttafel zeit="praesens" titel="Text A"><p className="text-xl md:text-2xl leading-relaxed text-slate-900">{a.map((w, i) => <React.Fragment key={i}>{w.t}{w.nach} </React.Fragment>)}</p></Leuchttafel>
      <Leuchttafel zeit={zielB} titel="Text B: Tippe alle Wörter an, die anders sind">
        <TippText woerter={b} markiert={markiert} status={status} aus={runde.geloest} onTipp={i => { setMarkiert(m => umschalten(m, i)); setStatus({}); }} />
      </Leuchttafel>
      {!runde.geloest && <button onClick={pruefe} className="w-full md:w-auto bg-cyan-400 hover:bg-cyan-300 text-cyan-950 font-black text-lg py-3 px-8 rounded-xl shadow-[0_4px_0_rgba(14,116,144,1)] active:translate-y-1 uppercase tracking-wider">Prüfen</button>}
    </div>
  );
}
function FindeUnterschied({ spiel, stufe, onFinish, onTipp }) {
  const [aufgaben] = useState(() => {
    const texte = waehle(spiel.id, texteDerStufe(stufe).map(t => ({ key: t.id, text: t })), 3);
    // Stufe 4: der letzte perfekt-taugliche Text wird zum Profi-Zwilling Präsens/Perfekt
    const profi = stufe === 4 ? [...texte].reverse().find(x => perfektTauglich(x.text)) : null;
    return texte.map(x => ({ ...x, zielB: x === profi ? 'perfekt' : 'praeteritum', punkte: textTeile(x.text, 'praesens').filter(y => y.v).length }))
      .sort((x, y) => (x.zielB === 'perfekt') - (y.zielB === 'perfekt'));
  });
  const runde = useRunde({ aufgaben, skill: 'erkennen', onFinish, onTipp });
  return <RundenRahmen runde={runde}><UnterschiedAufgabe key={runde.schluessel} runde={runde} aufgabe={runde.aufgabe} /></RundenRahmen>;
}

// --- Spiel 9 und 14: Text verwandeln / Zeit-Chaos reparieren
// verwandeln: alle Verben finden (Text in „quelle“), dann in „ziel“ setzen (Stufe 4 auch ins Perfekt: zwei Felder).
// chaos: Geschichte in „basis“ (Präteritum, Stufe 4 auch Perfekt), einige Verben stehen in „chaosZeit“ – finden und reparieren.
function TextAufgabe({ runde, aufgabe, modus }) {
  const { quelle, ziel, chaos = [], basis, chaosZeit } = aufgabe;
  const istChaos = (vi) => modus === 'chaos' && chaos.includes(vi);
  const woerter = useMemo(() => textWoerter(aufgabe.text, i => (modus === 'chaos' ? (istChaos(i) ? chaosZeit : basis) : quelle)), [aufgabe]);
  const zielWoerter = useMemo(() => textWoerter(aufgabe.text, i => (modus === 'chaos' ? (istChaos(i) ? ziel : basis) : ziel)), [aufgabe]);
  const soll = (w) => (modus === 'chaos' ? w.verb && istChaos(w.vi) : w.verb);
  const zuSchreiben = (w) => w.verb && (modus !== 'chaos' || istChaos(w.vi));
  const [schritt, setSchritt] = useState('finden');
  const [markiert, setMarkiert] = useState(new Set());
  const [status, setStatus] = useState({});
  const [eingaben, setEingaben] = useState({});
  const [feldStatus, setFeldStatus] = useState({});
  const [hinweise, setHinweise] = useState([]);
  const ersteSuche = useRef(null);       // vi -> beim ersten Prüfen richtig eingeordnet?
  const ersteSchreib = useRef(false);
  const ausgang = (vi) => woerter.filter(w => w.verb && w.vi === vi).map(w => w.t).join(' … ');

  const pruefeFinden = () => {
    const r = pruefeMarkierung(woerter, markiert, soll);
    setStatus(r.status);
    if (!ersteSuche.current) {
      ersteSuche.current = proVerb(woerter, (w, i) => markiert.has(i) === soll(w));
      runde.minus(woerter.filter((w, i) => !w.verb && markiert.has(i)).length);
    }
    if (r.allesRichtig) {
      runde.gut(modus === 'chaos' ? `Gefunden! Die Geschichte spielt früher und steht im ${ZEITEN[basis].name}. Diese Verben sind aus der Zeit gefallen. Repariere sie!` : `${zufall(LOB)} Du hast alle Verben gefunden. Jetzt verwandle sie ins ${ZEITEN[ziel].name}.`);
      setSchritt('schreiben');
    } else {
      runde.falsch(modus === 'chaos'
        ? `Du hast ${r.gefunden} von ${r.gesucht} Verben gefunden, die aus der Zeit gefallen sind${r.falschGetippt ? '. Rot: Diese Wörter stehen richtig' : ''}.`
        : `Du hast ${r.gefunden} von ${r.gesucht} Verben gefunden${r.falschGetippt ? '. Rot: Das sind keine Verben' : ''}.`,
      modus === 'chaos'
        ? (basis === 'perfekt' ? 'Die Geschichte wird im Perfekt erzählt: „haben“ oder „sein“ und die ge-Form. Suche Verben, die nur aus einem Wort bestehen.' : 'Die Geschichte spielt früher (Präteritum). Suche Verben, die im Jetzt (Präsens) stehen.')
        : 'Verben sagen, was jemand tut oder was passiert. Probe: Kannst du „ich“, „du“ oder „wir“ davorsetzen?');
    }
  };
  const pruefeSchreiben = () => {
    const neuStatus = {}, h = [];
    zielWoerter.forEach((w, i) => {
      if (!zuSchreiben(w)) return;
      const v = verbByGrundform[w.v], ein = (eingaben[i] || '').trim();
      const ok = w.teil === 'ganz' ? formRichtig(v, ziel, w.p, ein) : ein === w.t;
      neuStatus[i] = ok ? 'richtig' : 'falsch';
      if (!ok) h.push(`${ein || '…'}: ${w.teil === 'hv' ? `„${v.g}“ bildet das Perfekt mit „${v.hv}“.` : diagnose(ein, w.t, v, w.teil === 'p2' ? 'partizip' : ziel)}`);
    });
    setFeldStatus(neuStatus); setHinweise(h);
    if (!ersteSchreib.current) {
      ersteSchreib.current = true;
      const geschrieben = proVerb(zielWoerter, (w, i) => !zuSchreiben(w) || neuStatus[i] === 'richtig');
      Object.keys(geschrieben).forEach(vi => runde.erst('v' + vi, ersteSuche.current[vi] && geschrieben[vi]));
    }
    if (h.length === 0) runde.geschafft(modus === 'chaos' ? `${zufall(LOB)} Jetzt steht die ganze Geschichte wieder im ${ZEITEN[basis].name}.` : `${zufall(LOB)} Der Text steht jetzt im ${ZEITEN[ziel].name}.`);
    else runde.falsch(`${h.length === 1 ? 'Ein Feld stimmt' : `${h.length} Felder stimmen`} noch nicht.`, ziel === 'perfekt' ? 'Perfekt: „haben“ oder „sein“ an die Stelle des Verbs, die ge-Form ans Satzende.' : `Bilde das ${ZEITEN[ziel].name} von jedem Verb. Unregelmäßige Verben findest du im Wörterbuch.`);
  };
  const felder = schritt === 'schreiben' ? Object.fromEntries(zielWoerter.map((w, i) => [w, i]).filter(([w]) => zuSchreiben(w)).map(([w, i]) => [i, {
    wert: eingaben[i] || '', status: feldStatus[i], breite: w.teil === 'hv' ? 'w-24 md:w-28' : 'w-32 md:w-36', label: `${ausgang(w.vi)} im ${ZEITEN[ziel].name}`, onEnter: pruefeSchreiben,
    oben: w.teil === 'p2' ? 'ge-Form' : ausgang(w.vi),
    setWert: (x) => { setEingaben(e => ({ ...e, [i]: x })); setFeldStatus(s => ({ ...s, [i]: s[i] === 'richtig' ? 'richtig' : '' })); },
  }])) : null;
  const anzeigeZeit = modus === 'chaos' ? basis : (schritt === 'finden' ? quelle : ziel);
  return (
    <div className="space-y-4">
      <Leuchttafel zeit={anzeigeZeit} titel={aufgabe.text.titel}>
        <p className="text-sm text-stone-500 mb-2">
          {schritt === 'finden'
            ? (modus === 'chaos' ? `Die Geschichte steht im ${ZEITEN[basis].name}. Tippe die Verben an, die aus der Zeit gefallen sind.` : `Tippe alle Verben an. (Der Text steht im ${ZEITEN[quelle].name}.)`)
            : (modus === 'chaos' ? `Repariere die Verben: Schreibe sie im ${ZEITEN[ziel].name}.` : `Schreibe jedes Verb im ${ZEITEN[ziel].name}.`)}
        </p>
        <TippText woerter={schritt === 'finden' ? woerter : zielWoerter} markiert={schritt === 'finden' ? markiert : new Set()} status={schritt === 'finden' ? status : {}} felder={felder} aus={runde.geloest || schritt !== 'finden'}
          onTipp={i => { setMarkiert(m => umschalten(m, i)); setStatus({}); }} />
      </Leuchttafel>
      {hinweise.length > 0 && <ul className="text-rose-200 text-left space-y-1">{hinweise.map((x, i) => <li key={i}>• {x}</li>)}</ul>}
      {!runde.geloest && (
        <button onClick={schritt === 'finden' ? pruefeFinden : pruefeSchreiben} className="w-full md:w-auto bg-cyan-400 hover:bg-cyan-300 text-cyan-950 font-black text-lg py-3 px-8 rounded-xl shadow-[0_4px_0_rgba(14,116,144,1)] active:translate-y-1 uppercase tracking-wider">Prüfen</button>
      )}
    </div>
  );
}
function TextSpiel({ spiel, stufe, onFinish, onTipp, modus }) {
  const [aufgaben] = useState(() => {
    const pool = texteDerStufe(stufe).map(t => ({ key: t.id, text: t }));
    const erster = waehle(spiel.id, pool, 1)[0];
    // Stufe 4: der zweite Text ist (wenn möglich) ein Perfekt-Text – dafür nur perfekt-taugliche Texte
    const perfektZweiter = stufe === 4 && (modus === 'chaos' || Math.random() < 0.5);
    const rest = pool.filter(x => x.key !== erster.key && (!perfektZweiter || perfektTauglich(x.text)));
    const zweiter = zufall(rest.length ? rest : pool.filter(x => x.key !== erster.key));
    const nV = (t) => textTeile(t, 'praesens').filter(y => y.v).length;
    const baue = (x, k) => {
      const n = nV(x.text), perfekt = k === 1 && perfektZweiter && perfektTauglich(x.text);
      if (modus === 'chaos') {
        // Im Perfekt-Text nie sein oder haben als Fehler einbauen (im mündlichen Erzählen ist „ich war“, „ich hatte“ normal)
        const verben = textTeile(x.text, 'praesens').filter(y => y.v);
        const kandidaten = [...Array(n).keys()].filter(i => !perfekt || !['sein', 'haben'].includes(verben[i].v));
        const chaos = mische(kandidaten).slice(0, n >= 5 ? 3 : 2);
        return perfekt
          ? { ...x, chaos, basis: 'perfekt', chaosZeit: 'praeteritum', ziel: 'perfekt', punkte: n }
          : { ...x, chaos, basis: 'praeteritum', chaosZeit: 'praesens', ziel: 'praeteritum', punkte: n };
      }
      if (k === 0) return { ...x, quelle: 'praesens', ziel: 'praeteritum', punkte: n };
      if (stufe === 4) return { ...x, quelle: 'praeteritum', ziel: perfekt ? 'perfekt' : 'praesens', punkte: n };
      return { ...x, quelle: 'praesens', ziel: 'praeteritum', punkte: n };
    };
    return [baue(erster, 0), baue(zweiter, 1)];
  });
  const runde = useRunde({ aufgaben, skill: 'text', onFinish, onTipp });
  return <RundenRahmen runde={runde}><TextAufgabe key={runde.schluessel} runde={runde} aufgabe={runde.aufgabe} modus={modus} /></RundenRahmen>;
}
const TextZeitmaschine = (p) => <TextSpiel {...p} modus="verwandeln" />;
const ZeitChaos = (p) => <TextSpiel {...p} modus="chaos" />;

// ==========================================
// SPIEL 5: sein & haben (Tabelle + Lückensätze)
// ==========================================
const SEIN_HABEN_TIPP = {
  sein: { praesens: 'sein im Präsens: ich bin, du bist, er ist, wir sind, ihr seid, sie sind.', praeteritum: 'sein im Präteritum: ich war, du warst, er war, wir waren, ihr wart, sie waren.' },
  haben: { praesens: 'haben im Präsens: ich habe, du hast, er hat, wir haben, ihr habt, sie haben.', praeteritum: 'haben im Präteritum: ich hatte, du hattest, er hatte, wir hatten, ihr hattet, sie hatten.' },
};
function SeinHabenTabelle({ runde, aufgabe }) {
  const v = verbByGrundform[aufgabe.verb];
  const soll = { praesens: praesens(v).map(f => f.text), praeteritum: praeteritum(v).map(f => f.text) };
  const [bloecke] = useState(() => mische([...soll.praesens, ...soll.praeteritum].map((t, i) => ({ id: i, t }))));
  const [platz, setPlatz] = useState({});        // `${zeit}-${person}` -> Text
  const [benutzt, setBenutzt] = useState(new Set());
  const [wahl, setWahl] = useState(null);
  const fehler = useRef(false);
  const zz = useZiehen((id, ziel) => { const [z, pp] = ziel.split('-'); setze(z, Number(pp), Number(id)); });
  const setze = (zeit, p, id = wahl) => {
    if (runde.geloest || id === null || platz[`${zeit}-${p}`]) return;
    const b = bloecke.find(x => x.id === id);
    if (b.t === soll[zeit][p]) {
      const neu = { ...platz, [`${zeit}-${p}`]: b.t };
      setPlatz(neu); setBenutzt(new Set([...benutzt, b.id])); setWahl(null);
      if (Object.keys(neu).length === 12) { runde.erst(0, !fehler.current); runde.geschafft(`${zufall(LOB)} Die Tabelle von „${v.g}“ ist fertig.`); } else runde.leer();
    } else {
      fehler.current = true; runde.erst(0, false);
      runde.falsch(`„${b.t}“ passt nicht zu „${PERSONEN[p]}“ im ${ZEITEN[zeit].name}.`, SEIN_HABEN_TIPP[v.g][zeit]);
    }
  };
  return (
    <Leuchttafel zeit="praeteritum" titel={`Tabelle: ${v.g}`}>
      <p className="text-sm text-stone-500 mb-3">Ziehe jedes Wort in das passende Feld. Du kannst auch erst das Wort und dann das Feld antippen.</p>
      <table className="w-full text-lg md:text-2xl border-separate border-spacing-1">
        <thead><tr className="text-sm md:text-base"><th /><th className="text-rose-700 font-bold">Präsens</th><th className="text-amber-700 font-bold">Präteritum</th></tr></thead>
        <tbody>{PERSONEN.map((pr, p) => (
          <tr key={pr}><td className="text-stone-500 pr-2 text-base md:text-xl">{pr}</td>
            {['praesens', 'praeteritum'].map(z => (
              <td key={z}><button {...zz.ziel(`${z}-${p}`)} onClick={() => setze(z, p)} className={`w-full h-11 md:h-12 rounded-lg border-2 font-bold transition-colors ${platz[`${z}-${p}`] ? (z === 'praesens' ? 'bg-rose-100 border-rose-500 text-rose-700' : 'bg-amber-100 border-amber-500 text-amber-700') : zz.istUeber(`${z}-${p}`) ? 'border-cyan-500 bg-cyan-200 border-solid' : 'border-dashed border-stone-300 hover:bg-cyan-50'}`}>{platz[`${z}-${p}`] || ''}</button></td>
            ))}</tr>
        ))}</tbody>
      </table>
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {bloecke.filter(b => !benutzt.has(b.id)).map(b => (
          <WahlKnopf key={b.id} {...zz.griff(b.id, b.t)} onClick={() => setWahl(b.id)} cls={wahl === b.id ? 'bg-cyan-200 border-cyan-600 text-cyan-950' : ''}>{b.t}</WahlKnopf>
        ))}
      </div>
      {zz.geist}
    </Leuchttafel>
  );
}
function SeinHabenLuecke({ runde, aufgabe }) {
  const [wahl] = useState(() => mische(aufgabe.wahl));
  const [gesetzt, setGesetzt] = useState(null);
  const [teil1, teil2] = aufgabe.satz.split('___');
  const tippe = (w) => {
    if (runde.geloest) return;
    const ok = w === aufgabe.luecke;
    runde.erst(0, ok);
    if (ok) { setGesetzt(w); runde.geschafft(); }
    else runde.falsch(w === 'seit' ? '„seit“ ist ein anderes Wort (seit gestern). Hier ist das Verb „sein“ gemeint. Das schreibt man mit d.'
      : /^wahr/.test(w) ? `„${w}“ schreibt man ohne h, wenn das Verb „sein“ gemeint ist.` : `„${w}“ passt hier nicht. Schau, wer im Satz gemeint ist.`, SEIN_HABEN_TIPP[aufgabe.verb][aufgabe.zeit]);
  };
  const Z = ZEITEN[aufgabe.zeit];
  return (
    <Leuchttafel zeit={aufgabe.zeit} titel={`${aufgabe.verb} · Lückensatz`}>
      <p className="text-2xl md:text-3xl text-center py-6 text-slate-900">{teil1}{gesetzt ? <b data-loesung="" className={Z.text}>{gesetzt}</b> : <span className="inline-block w-24 border-b-4 border-dashed border-stone-400 mx-1" />}{teil2}</p>
      <div className="flex flex-wrap justify-center gap-3">{wahl.map(w => <WahlKnopf key={w} onClick={() => tippe(w)} aus={runde.geloest}>{w}</WahlKnopf>)}</div>
    </Leuchttafel>
  );
}
function SeinHaben({ spiel, onFinish, onTipp }) {
  const [aufgaben] = useState(() => [
    { key: 'tabelle', tabelle: true, verb: zufall(['sein', 'haben']) },
    ...nichtHintereinander(waehle(spiel.id, SEIN_HABEN.map(s => ({ ...s, key: s.satz })), 9), x => x.verb + x.zeit),
  ]);
  const runde = useRunde({ aufgaben, skill: 'unregelmaessig', onFinish, onTipp });
  const A = runde.aufgabe.tabelle ? SeinHabenTabelle : SeinHabenLuecke;
  return <RundenRahmen runde={runde}><A key={runde.schluessel} runde={runde} aufgabe={runde.aufgabe} /></RundenRahmen>;
}

// ==========================================
// SPIEL 6: Wörterbuch-Forscher
// ==========================================
// Typischer Fehler mit anderem Selbstlaut (ging → gang)
function vokalTausch(wort) {
  const m = wort.match(/(ie|ei|au|[aeiouäöü])/);
  if (!m) return wort + 'e';
  const tausch = { ie: 'ei', ei: 'ie', au: 'a', a: 'u', e: 'a', i: 'a', o: 'a', u: 'a', ä: 'a', ö: 'o', ü: 'u' }[m[1]];
  return wort.slice(0, m.index) + tausch + wort.slice(m.index + m[1].length);
}
function WoerterbuchAufgabe({ runde, aufgabe }) {
  const v = verbByGrundform[aufgabe.verb];
  const unreg = v.art === 'u';
  const [teil, setTeil] = useState(1);
  const [optionen] = useState(() => {
    const p = praeteritum(v)[0].text, s = wortstamm(v);
    const d = [s + 'te', vokalTausch(p), p + 'te'].filter((x, i, a) => x !== p && a.indexOf(x) === i && !praesens(v).some(f => f.text === x));
    return mische([p, ...d.slice(0, 2)]);
  });
  const eintrag = (w) => {
    const x = verbByGrundform[w];
    return <div key={w} className={`py-1 px-2 rounded ${w === v.g ? 'bg-amber-100' : ''}`}><b>{x.g}</b>{x.art === 'u' && <span>, {praeteritum(x)[0].text}, {partizip(x)}</span>}</div>;
  };
  const antwort1 = (istUnreg) => {
    if (teil !== 1 || runde.geloest) return;
    const ok = istUnreg === unreg;
    runde.erst(1, ok);
    if (!ok) { runde.falsch(unreg ? `Hinter „${v.g}“ stehen im Wörterbuch weitere Formen. Also ist es unregelmäßig.` : `Hinter „${v.g}“ steht nichts. Also ist es regelmäßig: ${v.g} – ${praeteritum(v)[0].text}.`, 'Steht hinter der Grundform im Wörterbuch noch etwas? Dann ist das Verb unregelmäßig.'); return; }
    if (unreg) { runde.gut(`Richtig, „${v.g}“ ist unregelmäßig. Wie heißt das Präteritum?`); setTeil(2); }
    else runde.geschafft(`Richtig, „${v.g}“ ist regelmäßig: ich ${praeteritum(v)[0].text}.`);
  };
  const antwort2 = (f) => {
    if (runde.geloest) return;
    const ok = f === praeteritum(v)[0].text;
    runde.erst(2, ok);
    if (ok) runde.geschafft(`${zufall(LOB)} ${v.g} – ich ${f}.`);
    else runde.falsch(`Schau in den Eintrag: Hinter „${v.g}“ steht als Erstes das Präteritum.`, `Im Wörterbuch steht: ${v.g}, ${praeteritum(v)[0].text}, ${partizip(v)}. Die zweite Form ist das Präteritum.`);
  };
  return (
    <div className="space-y-4">
      <Leuchttafel zeit="praeteritum" titel="Wörterbuch">
        <div className="font-serif text-xl md:text-2xl space-y-0.5 bg-white border-2 border-stone-300 rounded-lg p-3">{aufgabe.eintraege.map(eintrag)}</div>
        <p className="text-xl md:text-2xl text-center mt-5 font-bold text-slate-900">
          {teil === 1 ? <>Ist „{v.g}“ regelmäßig oder unregelmäßig?</> : <>Präteritum: ich …?</>}
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {teil === 1
            ? <><WahlKnopf onClick={() => antwort1(false)} aus={runde.geloest}>regelmäßig</WahlKnopf><WahlKnopf onClick={() => antwort1(true)} aus={runde.geloest}>unregelmäßig</WahlKnopf></>
            : optionen.map(o => <WahlKnopf key={o} onClick={() => antwort2(o)} aus={runde.geloest}>ich {o}</WahlKnopf>)}
        </div>
      </Leuchttafel>
    </div>
  );
}
function WoerterbuchForscher({ spiel, stufe, onFinish, onTipp }) {
  const [aufgaben] = useState(() => {
    const unreg = waehle(spiel.id + '-u', verbenFuer(stufe, v => v.art === 'u').map(v => ({ key: v.g, v })), 5);
    const reg = waehle(spiel.id + '-r', verbenFuer(stufe, v => v.art === 'r').map(v => ({ key: v.g, v })), 5);
    const alle = verbenFuer(stufe);
    return mische([...unreg, ...reg]).map(x => {
      const andere = mische(alle.filter(v => v.g !== x.v.g)).slice(0, 3).map(v => v.g);
      return { key: x.v.g, verb: x.v.g, punkte: x.v.art === 'u' ? 2 : 1, eintraege: [x.v.g, ...andere].sort((a, b) => a.localeCompare(b, 'de')) };
    });
  });
  const runde = useRunde({ aufgaben, skill: 'unregelmaessig', onFinish, onTipp });
  return <RundenRahmen runde={runde}><WoerterbuchAufgabe key={runde.schluessel} runde={runde} aufgabe={runde.aufgabe} /></RundenRahmen>;
}

// ==========================================
// SPIEL 7: Verb-Familien (in 3–4 Familien-Häuser sortieren)
// ==========================================
// Selbstlaut hervorheben, der sich ändert (z. B. s|i|ngen – s|a|ng)
function markiereVokal(wort, vokal) {
  let i = vokal ? wort.indexOf(vokal) : -1, len = vokal ? vokal.length : 0;
  if (i < 0) { const m = wort.match(/(ie|ei|au|äu|eu|[aeiouäöü])/); i = m ? m.index : 0; len = m ? m[1].length : 0; }
  return <>{wort.slice(0, i)}<b className="text-amber-700 underline decoration-2">{wort.slice(i, i + len)}</b>{wort.slice(i + len)}</>;
}
function FamilienSortieren({ runde, aufgabe }) {
  const [platz, setPlatz] = useState({});        // Karten-Index -> Familie
  const [wahl, setWahl] = useState(null);
  const karten = aufgabe.karten;
  const zz = useZiehen((i, fam) => setze(fam, Number(i)));
  const setze = (fam, wahlJetzt = wahl) => {
    if (runde.geloest || wahlJetzt === null || wahlJetzt in platz) return;
    const k = karten[wahlJetzt], v = verbByGrundform[k];
    const ok = v.fam === fam;
    runde.erst('k' + wahlJetzt, ok);
    if (ok) {
      const neu = { ...platz, [wahlJetzt]: fam };
      setPlatz(neu); setWahl(null);
      if (Object.keys(neu).length === karten.length) runde.geschafft(`${zufall(LOB)} Alle Verben wohnen bei ihrer Familie.`);
      else runde.gut();
    } else runde.falsch(`„${v.g} – ${praeteritum(v)[0].text}“ gehört nicht in das Haus „${FAMILIEN[fam].titel}“. Vergleiche den Selbstlaut.`, 'Sprich beide Formen langsam: Welcher Selbstlaut ändert sich? Aus i wird a, aus ei wird ie …');
  };
  return (
    <Leuchttafel zeit="praeteritum" titel="Verb-Familien">
      <p className="text-sm text-stone-500 mb-3">Ziehe jede Karte in das Haus ihrer Familie. Du kannst auch erst die Karte und dann das Haus antippen.</p>
      <div className="flex flex-wrap justify-center gap-2 mb-5 min-h-[3rem]">
        {karten.map((k, i) => !(i in platz) && (
          <button key={k} {...zz.griff(i, `${k} – ${praeteritum(verbByGrundform[k])[0].text}`)} onClick={() => setWahl(i)} className={`rounded-xl border-2 border-b-4 px-3 py-2 text-lg md:text-xl ${wahl === i ? 'bg-cyan-200 border-cyan-600' : 'bg-white border-stone-300 hover:bg-stone-50'}`}>
            {markiereVokal(k, FAMILIEN[verbByGrundform[k].fam].vokal?.[0])} – {markiereVokal(praeteritum(verbByGrundform[k])[0].text, FAMILIEN[verbByGrundform[k].fam].vokal?.[1])}
          </button>
        ))}
      </div>
      <div className={`grid gap-3 ${aufgabe.familien.length === 4 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
        {aufgabe.familien.map(f => (
          <button key={f} {...zz.ziel(f)} onClick={() => setze(f)} className={`rounded-2xl border-2 p-3 text-left min-h-[7rem] transition-all ${zz.istUeber(f) ? 'border-cyan-500 bg-cyan-200 scale-[1.03] shadow-[0_0_20px_rgba(34,211,238,0.6)]' : 'border-amber-500 bg-amber-100 hover:bg-amber-200'}`}>
            <span className="flex items-center gap-2 font-black text-amber-800 text-lg"><House className="w-6 h-6" /> {FAMILIEN[f].titel}</span>
            <span className="block mt-1 text-slate-800">{karten.map((k, i) => platz[i] === f && <span key={k} className="inline-block mr-3">{k} – {praeteritum(verbByGrundform[k])[0].text}</span>)}</span>
          </button>
        ))}
      </div>
      {zz.geist}
    </Leuchttafel>
  );
}
function VerbFamilien({ spiel, stufe, onFinish, onTipp }) {
  const [aufgaben] = useState(() => {
    const moeglich = Object.keys(FAMILIEN).filter(f => f !== 'misch' && f !== 'einzel' && verbenFuer(stufe, v => v.fam === f).length >= 2);
    const familien = waehle(spiel.id, moeglich.map(f => ({ key: f })), Math.min(4, moeglich.length)).map(x => x.key);
    let karten = [];
    familien.forEach(f => { karten = karten.concat(mische(verbenFuer(stufe, v => v.fam === f)).slice(0, 4).map(v => v.g)); });
    karten = mische(karten).slice(0, 12);
    return [{ key: familien.join('-'), familien, karten: mische(karten), punkte: karten.length }];
  });
  const runde = useRunde({ aufgaben, skill: 'unregelmaessig', onFinish, onTipp });
  return <RundenRahmen runde={runde}><FamilienSortieren key={runde.schluessel} runde={runde} aufgabe={runde.aufgabe} /></RundenRahmen>;
}

// ==========================================
// SPIEL 8: Formen-Tabelle (bis 20.11.2026 „Formen-Treppe“; id 'treppe' bleibt wegen des Zeitreise-Codes)
// ==========================================
// Alle Personen × Zeitformen (Entscheidung der Lehrkraft 20.11.2026), Aufbau und Animationen wie die
// Verwandlungs-Tabelle der Verben-Expedition: je Zeitform eine Tafel mit EINZAHL | MEHRZAHL, jede Person ein Schild,
// falsche Felder wackeln, bei richtiger Tabelle leuchtet die Tafel auf und Funken sprühen.
// Stufe 3: Präteritum; Stufe 4: Präteritum + Perfekt (Partizip EINMAL eintippen, je Person nur das Hilfsverb).
// Schwere Präteritum-Formen (du aßest, ihr fandet …) stehen grau schon da und zählen nicht.
// Sterne: jedes Feld beim ersten Prüfen. „Das kann ich schon“: eine Tabelle = ein Ergebnis (wie die anderen Tabellen).
const TABELLE_SPALTE = {
  praeteritum: { kopf: 'bg-amber-100 text-amber-800 border-amber-300', rand: 'border-amber-500', schild: 'bg-amber-100/70 border-amber-300', linie: 'border-amber-300' },
  perfekt:     { kopf: 'bg-lime-100 text-lime-800 border-lime-300',    rand: 'border-lime-600',  schild: 'bg-lime-100/70 border-lime-300',   linie: 'border-lime-300' },
};
const tabellenFelder = (v, stufe) => [
  ...PERSONEN.map((_, p) => p).filter(p => !schwerePraeteritumForm(v, p)).map(p => 'prt' + p),
  ...(stufe === 4 ? ['p2', ...PERSONEN.map((_, p) => 'hv' + p)] : []),
];

// Erfolgs-Feuerwerk, sobald eine Aufgabe gelöst ist – in allen Spielen über RundenRahmen (Idee: SuccessSparkles der Verben-Expedition, größer und in den
// Farben der Zeitmaschine): Lichtblitz und Leuchtring aus der Mitte, dazu zwei Wellen großer Funken, die weit über die Tafel fliegen.
const FUNKEN_FARBEN = ['text-cyan-300', 'text-amber-300', 'text-lime-300', 'text-sky-300', 'text-yellow-200'];
// Abgestuft (Wunsch der Lehrkraft 21.11.2026, „nicht zu überschwänglich“): klein = ein paar kleine Funken nach einer
// normalen Aufgabe; gross = Lichtblitz, Leuchtring und 32 große Funken nur für große Leistungen (siehe RundenRahmen).
// Wo wurde zuletzt getippt? Kleine Funken knallen genau dort (am richtigen Knopf), Wunsch der Lehrkraft 21.11.2026.
const letzterTipp = { x: 0, y: 0, t: 0 };
// pointerup: beim Ziehen zählt die Stelle, an der losgelassen wurde (das Ziel)
if (typeof window !== 'undefined') window.addEventListener('pointerup', (e) => { letzterTipp.x = e.clientX; letzterTipp.y = e.clientY; letzterTipp.t = Date.now(); }, true);
function Funken({ gross = false }) {
  // Kleiner Knall am angetippten Knopf, wenn gerade getippt wurde (sonst, z. B. nach Enter, in der Mitte der Aufgabe)
  // Reihenfolge (Wunsch der Lehrkraft 21.11.2026): 1. dort, wo die Lösung jetzt steht (Element mit data-loesung,
  // z. B. das fertige Wort „ich lerne“ oder die gefüllte Lücke); 2. sonst am angetippten Knopf (Tore, Richtig/Fehler,
  // beim Ziehen am Ziel); 3. sonst in der Mitte der Aufgabe.
  const [ort, setOrt] = useState(() => (!gross && Date.now() - letzterTipp.t < 1500 ? { x: letzterTipp.x, y: letzterTipp.y } : null));
  useLayoutEffect(() => {
    if (gross) return;
    const loesung = [...document.querySelectorAll('.spielflaeche [data-loesung]')].pop();
    if (!loesung) return;
    const r = loesung.getBoundingClientRect();
    setOrt({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  }, []);
  const [teile] = useState(() => Array.from({ length: gross ? 32 : 12 }, (_, i) => {
    const welle = gross && i >= 18 ? 1 : 0;
    const winkel = gross ? ((i % 18) * 20 + Math.random() * 14 + welle * 10) * Math.PI / 180 : (i * 30 + Math.random() * 18) * Math.PI / 180;
    const weit = !gross ? 11 + Math.random() * 9 : welle ? 18 + Math.random() * 16 : 30 + Math.random() * 24;   // vmin – passt sich der Bildschirmgröße an
    return {
      tx: (Math.cos(winkel) * weit).toFixed(1) + 'vmin', ty: (Math.sin(winkel) * weit).toFixed(1) + 'vmin',
      rot: Math.round(Math.random() * 720 - 360) + 'deg', groesse: gross ? Math.round(30 + Math.random() * 30) : Math.round(22 + Math.random() * 14),
      Icon: [Sparkles, Star, Hourglass, Star][i % 4], farbe: FUNKEN_FARBEN[i % 5], verz: welle ? 0.18 : 0,
    };
  }));
  const inhalt = (<>
      {gross && <div className="absolute w-64 h-64 rounded-full erfolg-blitz" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.95), rgba(163,230,53,0.55) 40%, rgba(163,230,53,0) 70%)' }} />}
      {gross && <div className="absolute w-40 h-40 rounded-full border-4 border-lime-300 erfolg-ring" style={{ boxShadow: '0 0 30px rgba(163,230,53,0.9), inset 0 0 30px rgba(163,230,53,0.6)' }} />}
      {!gross && <div className="absolute w-20 h-20 rounded-full border-4 border-lime-300 knall-ring" style={{ boxShadow: '0 0 22px rgba(163,230,53,0.95), inset 0 0 14px rgba(163,230,53,0.6)' }} />}
      {!gross && <div className="absolute w-16 h-16 rounded-full knall-blitz" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.95), rgba(163,230,53,0.5) 45%, rgba(163,230,53,0) 70%)' }} />}
      {teile.map((t, i) => (
        <t.Icon key={i} className={`absolute ${t.farbe} anim-burst drop-shadow-[0_0_10px_rgba(255,255,255,0.7)] ${t.Icon !== Sparkles ? 'fill-current' : ''}`}
          style={{ width: t.groesse, height: t.groesse, '--tx': t.tx, '--ty': t.ty, '--rot': t.rot, animationDelay: `${t.verz}s` }} />
      ))}
    </>);
  if (ort) return createPortal(
    <div className="fixed z-[450] pointer-events-none flex items-center justify-center w-0 h-0" style={{ left: ort.x, top: ort.y }} aria-hidden="true">{inhalt}</div>,
    document.body);
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20" aria-hidden="true">{inhalt}</div>
  );
}

function TabelleAufgabe({ runde, aufgabe, stufe }) {
  const v = verbByGrundform[aufgabe.verb];
  const track = useTrack();
  const felder = tabellenFelder(v, stufe);
  const soll = (f) => f === 'p2' ? partizip(v) : f.startsWith('hv') ? perfekt(v)[+f.slice(2)].hilfsverb : praeteritum(v)[+f.slice(3)].text;
  const richtig = (f, e) => f.startsWith('prt') ? formRichtig(v, 'praeteritum', +f.slice(3), e) : e === soll(f);
  const [ein, setEin] = useState({});
  const [st, setSt] = useState({});
  const [hinweise, setHinweise] = useState([]);
  const [versuch, setVersuch] = useState(0);          // neu zählen → falsche Felder wackeln bei jedem Prüfen
  const gewertet = useRef(false);
  const pruefe = () => {
    if (runde.geloest) return;
    // Leere Felder zählen nicht als Fehler (wie Adjektiv-Detektive): erst alles ausfüllen
    const leer = felder.filter(f => st[f] !== 'richtig' && !(ein[f] || '').trim());
    if (leer.length) { setSt(s => { const n = { ...s }; leer.forEach(f => { n[f] = 'leer'; }); return n; }); runde.info(leer.length === 1 ? 'Ein Feld ist noch leer. Fülle zuerst alle Felder aus.' : 'Fülle zuerst alle Felder aus.'); return; }
    const neu = {}, h = [];
    let fehlt = 0;
    felder.forEach(f => {
      if (st[f] === 'richtig') { neu[f] = 'richtig'; return; }
      const e = (ein[f] || '').trim(), ok = richtig(f, e);
      neu[f] = ok ? 'richtig' : 'falsch';
      runde.erst(f, ok, false);
      if (ok) return;
      fehlt += 1;
      // je Spalte nur EIN Hinweis, damit es übersichtlich bleibt
      if (f.startsWith('prt') && !h.some(x => x.spalte === 'prt')) h.push({ spalte: 'prt', text: `Präteritum, ${PERSONEN[+f.slice(3)]}: ${e ? diagnose(e, soll(f), v, 'praeteritum') : 'Hier fehlt noch die Form.'}` });
      if (f === 'p2') h.push({ spalte: 'p2', text: `ge-Form: ${e ? diagnose(e, soll(f), v, 'partizip') : 'Schreibe zuerst die ge-Form.'}` });
      if (f.startsWith('hv') && !h.some(x => x.spalte === 'hv')) h.push({ spalte: 'hv', text: `„${v.g}“ bildet das Perfekt mit „${v.hv}“: ich ${perfekt(v)[0].hilfsverb}, du ${perfekt(v)[1].hilfsverb} …` });
    });
    if (!gewertet.current && runde.phase === 'haupt') { gewertet.current = true; track('unregelmaessig', fehlt === 0); }
    setSt(neu); setHinweise(h.map(x => x.text)); setVersuch(n => n + 1);
    if (!fehlt) runde.geschafft(`${zufall(LOB)} Die Tabelle von „${v.g}“ stimmt: ich ${soll('prt0')}${stufe === 4 ? ` – ich ${soll('hv0')} ${soll('p2')}` : ''}.`);
    else runde.falsch(fehlt === 1 ? 'Ein Feld stimmt noch nicht.' : `${fehlt} Felder stimmen noch nicht.`, `Unregelmäßige Verben musst du dir merken. Im Wörterbuch steht: ${v.g}, ${soll('prt0')}, ${partizip(v)}.`);
  };
  // Eingabefeld; falsche Felder wackeln (Schlüssel mit dem Prüf-Zähler startet die Animation neu)
  const feld = (f, breite, label) => (
    <span key={f + (st[f] === 'falsch' ? '-' + versuch : '')} className={`inline-block ${st[f] === 'falsch' ? 'anim-shake' : ''}`}>
      <TippFeld wert={ein[f] || ''} status={st[f]} breite={breite} label={label} onEnter={pruefe}
        setWert={x => { setEin(e => ({ ...e, [f]: x })); setSt(s => ({ ...s, [f]: s[f] === 'richtig' ? 'richtig' : '' })); }} />
    </span>
  );
  const p2 = (ein.p2 || '').trim();
  const tafel = (art, inhalt, vorne) => {
    const S = TABELLE_SPALTE[art], deutsch = ZEITEN[art].deutsch;
    return (
      <div className={`rounded-xl border-2 ${S.rand} overflow-hidden bg-white/60`}>
        <div className={`px-4 py-2 border-b-2 ${S.kopf} flex flex-wrap items-baseline gap-x-2`}>
          <b className="text-lg md:text-xl"><span className="uppercase tracking-widest">{ZEITEN[art].name}</span> von <span className="text-slate-900 underline decoration-2 underline-offset-4">{v.g}</span></b>
          <span className="text-sm">{deutsch.replace(/ \(.*\)$/, '')}<span className="opacity-75"> {deutsch.match(/\(.*\)/)[0]}</span></span>
        </div>
        {vorne}
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 p-3 md:p-4">
          {[[0, 1, 2], [3, 4, 5]].map((gruppe, gi) => (
            <div key={gi} className="flex flex-col gap-2">
              <h4 className={`text-center font-black text-sm md:text-base uppercase tracking-widest text-stone-500 border-b-2 ${S.linie} pb-1`}>{gi ? 'Mehrzahl' : 'Einzahl'}</h4>
              {gruppe.map(p => (
                <div key={p} className={`flex items-center justify-between gap-2 rounded-lg border-2 ${S.schild} px-3 py-2 text-xl md:text-2xl`}>
                  <span className="text-slate-700 font-semibold">{PERSONEN[p]}</span>
                  <span className="flex items-center gap-2">{inhalt(p)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div className="space-y-4">
      <p className="text-slate-200 text-lg md:text-xl text-center">
        Schreibe alle Formen von <b className="text-cyan-300">{v.g}</b> in die Tabelle.
        {stufe === 4 && <span className="block text-base text-slate-400 mt-2">Beim Perfekt: Schreibe zuerst die ge-Form, dann zu jeder Person „haben“ oder „sein“.</span>}
      </p>
      <div className={`relative rounded-2xl transition-all ${runde.geloest ? 'anim-pop shadow-[0_0_35px_rgba(163,230,53,0.55)]' : ''}`}>
        <Leuchttafel zeit={stufe === 4 ? 'vergangenheit' : 'praeteritum'} titel="Formen-Tabelle">
          <div className="space-y-4">
            {/* Grundform groß und deutlich: Mit diesem Verb wird die ganze Tabelle gefüllt */}
            <div className="flex flex-col items-center gap-1 py-2">
              <span className="text-xs md:text-sm font-black text-stone-500 uppercase tracking-widest">Grundform</span>
              <span className="inline-block bg-white border-4 border-stone-400 border-b-8 rounded-2xl px-8 md:px-12 py-2 md:py-3 text-4xl md:text-6xl font-black text-slate-900 shadow-[0_6px_20px_rgba(0,0,0,0.15)]">{v.g}</span>
            </div>
            {tafel('praeteritum', p => schwerePraeteritumForm(v, p)
              ? <span className="text-stone-400" title="Diese Form brauchst du nicht zu schreiben.">{praeteritum(v)[p].text}</span>
              : feld('prt' + p, 'w-28 md:w-36', `Präteritum, ${PERSONEN[p]}`))}
            {stufe === 4 && tafel('perfekt',
              p => <>{feld('hv' + p, 'w-20', `Perfekt, ${PERSONEN[p]}: haben oder sein`)}<span className={`min-w-[5rem] ${p2 ? 'text-lime-800 font-semibold' : 'text-stone-400'}`}>{p2 || '…'}</span></>,
              <div className="flex flex-wrap items-center gap-3 px-4 pt-3 text-xl md:text-2xl">
                <span className="text-base font-black text-lime-800 tracking-wide">ge-Form</span>
                {feld('p2', 'w-40', 'ge-Form')}
                <span className="text-sm text-stone-500">gilt für alle Personen</span>
              </div>)}
          </div>
        </Leuchttafel>
      </div>
      {hinweise.length > 0 && <ul className="text-rose-200 text-left space-y-1">{hinweise.map((x, i) => <li key={i}>• {x}</li>)}</ul>}
      {!runde.geloest && <button onClick={pruefe} className="w-full md:w-auto bg-cyan-400 hover:bg-cyan-300 text-cyan-950 font-black text-lg py-3 px-8 rounded-xl shadow-[0_4px_0_rgba(14,116,144,1)] active:translate-y-1 uppercase tracking-wider">Prüfen</button>}
    </div>
  );
}
function FormenTabelleSpiel({ spiel, stufe, onFinish, onTipp }) {
  const [aufgaben] = useState(() => waehle(spiel.id, verbenFuer(stufe, v => v.art === 'u').map(v => ({ key: v.g, verb: v.g, punkte: tabellenFelder(v, stufe).length })), 5));
  const runde = useRunde({ aufgaben, skill: 'unregelmaessig', onFinish, onTipp });
  return <RundenRahmen runde={runde}><TabelleAufgabe key={runde.schluessel} runde={runde} aufgabe={runde.aufgabe} stufe={stufe} /></RundenRahmen>;
}

// ==========================================
// SPIEL 12: Sätze bauen: Futur (Bausteine ordnen + Richtig oder Fehler?)
// ==========================================
const PRONOMEN_KLEIN = { Ich: 'ich', Du: 'du', Wir: 'wir', Ihr: 'ihr', 'Die Kinder': 'die Kinder', 'Meine Geschwister': 'meine Geschwister', 'Der Ball': 'der Ball', 'Die Bälle': 'die Bälle' };
const gross = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Satzbaukasten für Futur (Spiel 12) und Perfekt (Spiel 11): Hilfsverb an 2. Stelle, zweites Verb am Satzende.
// Jede Reihenfolge mit dieser Klammer gilt (Auftrag, „Was als richtig gilt“ Nr. 8).
const BAU_TIPP = {
  futur: 'Im Futur steht „werden“ an zweiter Stelle und die Grundform ganz am Ende.',
  perfekt: 'Im Perfekt steht „haben“ oder „sein“ an zweiter Stelle und die ge-Form ganz am Ende.',
};
const BAU_CHIP = { futur: 'bg-sky-100 border-sky-400', perfekt: 'bg-lime-100 border-lime-500' };
function FuturBauen({ runde, aufgabe }) {
  const { satz, zeitwort } = aufgabe;
  const zeit = satz.zeit;
  const [bausteine] = useState(() => {
    const t = satz.teile.map((x, i) => ({ id: i, t: x.rolle === 'subj' ? (PRONOMEN_KLEIN[x.t] || x.t) : x.t, rolle: x.rolle }));
    if (zeitwort) t.push({ id: 9, t: zeitwort, rolle: 'zeit' });
    return mische(t);
  });
  const [reihe, setReihe] = useState([]);
  const hv = bausteine.find(b => b.rolle === 'hv'), zw = bausteine.find(b => b.rolle === 'zweites');
  const fertig = reihe.length === bausteine.length;
  const pruefe = () => {
    const ok = reihe[1] === hv.id && reihe[reihe.length - 1] === zw.id;
    runde.erst(0, ok);
    if (ok) runde.geschafft(`${zufall(LOB)} „${hv.t}“ steht an zweiter Stelle, „${zw.t}“ am Satzende.`);
    else runde.falsch(reihe[1] !== hv.id ? `„${hv.t}“ muss an zweiter Stelle stehen.` : `„${zw.t}“ gehört ans Satzende.`, BAU_TIPP[zeit]);
  };
  const text = (id, i) => { const b = bausteine.find(x => x.id === id); return i === 0 ? gross(b.t) : b.t; };
  return (
    <Leuchttafel zeit={zeit} titel="Sätze bauen">
      <p className="text-sm text-stone-500 mb-3">Tippe die Bausteine der Reihe nach an. Antippen im Satz legt sie zurück.</p>
      <div {...(runde.geloest ? { 'data-loesung': '' } : {})} className="min-h-[5rem] rounded-xl border-2 border-dashed border-stone-300 bg-white p-3 text-2xl md:text-3xl text-center">
        {runde.geloest
          ? <Klammersatz zeit={zeit} teile={reihe.map((id, i) => ({ t: text(id, i), k: id === hv.id || id === zw.id }))} />
          : <>{reihe.map((id, i) => <button key={id} onClick={() => setReihe(reihe.filter(x => x !== id))} className={`mx-1 my-1 rounded-lg border-2 px-2 ${BAU_CHIP[zeit]}`}>{text(id, i)}</button>)}{fertig && '.'}</>}
      </div>
      {!runde.geloest && (
        <>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {bausteine.filter(b => !reihe.includes(b.id)).map(b => <WahlKnopf key={b.id} onClick={() => setReihe([...reihe, b.id])}>{b.t}</WahlKnopf>)}
          </div>
          {fertig && <div className="text-center mt-4"><button onClick={pruefe} className="bg-cyan-400 hover:bg-cyan-300 text-cyan-950 font-black text-lg py-3 px-8 rounded-xl shadow-[0_4px_0_rgba(14,116,144,1)] active:translate-y-1 uppercase tracking-wider">Prüfen</button></div>}
        </>
      )}
    </Leuchttafel>
  );
}
function FuturRichtigFehler({ runde, aufgabe }) {
  const [schritt, setSchritt] = useState(1);
  const [optionen] = useState(() => (aufgabe.fehler ? mische([aufgabe.fehler.fix, aufgabe.anders]) : []));
  const urteil = (sagtFehler) => {
    if (runde.geloest || schritt !== 1) return;
    const istFehler = !!aufgabe.fehler;
    if (sagtFehler !== istFehler) {
      runde.erst(0, false);
      runde.falsch(istFehler ? 'Schau noch einmal genau hin. In diesem Satz steckt ein Fehler.' : 'Dieser Satz ist richtig: „werden“ an zweiter Stelle, die Grundform am Ende.', 'Prüfe: Passt „werden“ zur Person? Steht am Satzende die Grundform?');
      return;
    }
    if (!istFehler) { runde.erst(0, true); runde.geschafft('Richtig! Der Satz stimmt.'); return; }
    runde.gut(`Gut erkannt! ${aufgabe.fehler.warum} Welcher Satz ist richtig?`);
    setSchritt(2);
  };
  const repariere = (o) => {
    if (runde.geloest) return;
    const ok = o === aufgabe.fehler.fix;
    runde.erst(0, ok);
    if (ok) runde.geschafft(`${zufall(LOB)} ${aufgabe.fehler.fix}`);
    else runde.falsch('Dieser Satz hat auch einen Fehler.', aufgabe.fehler.warum);
  };
  return (
    <Leuchttafel zeit="futur" titel="Richtig oder Fehler?">
      <p className="text-2xl md:text-3xl text-center py-5 text-slate-900">{aufgabe.text}</p>
      {schritt === 1
        ? <div className="flex justify-center gap-3"><WahlKnopf onClick={() => urteil(false)} aus={runde.geloest} cls="bg-lime-100 border-lime-600 text-lime-900">Richtig</WahlKnopf><WahlKnopf onClick={() => urteil(true)} aus={runde.geloest} cls="bg-rose-100 border-rose-500 text-rose-800">Fehler!</WahlKnopf></div>
        : <div className="flex flex-col items-center gap-2">{optionen.map(o => <WahlKnopf key={o} onClick={() => repariere(o)} aus={runde.geloest}>{o}</WahlKnopf>)}</div>}
    </Leuchttafel>
  );
}
// Ganzen Satz selbst tippen (Baukasten Typ 14, Wunsch der Lehrkraft 21.11.2026): Ein Satz steht im Präsens da,
// das Kind schreibt ihn komplett im Perfekt bzw. Futur. Richtig sind beide Wortstellungen mit Hilfsverb an 2. Stelle
// und zweitem Verb am Ende („Ich habe ein Eis gekauft.“ / „Ein Eis habe ich gekauft.“). Leerzeichen, Punkt am Ende und
// groß/klein am Satzanfang zählen nicht als Fehler (es geht um die Verbformen und die Wortstellung) – ein Hinweis erscheint.
// Die App nennt den konkreten Fehler; nach 3 Fehlversuchen steht die Lösung da.
const SATZ_ZEIT = { perfekt: { hv: 'haben oder sein', zw: 'die ge-Form' }, futur: { hv: 'werden', zw: 'die Grundform' } };
function satzWoerter(t) { return t.trim().replace(/[.!?]+$/, '').split(/\s+/).filter(Boolean); }
function SatzTippen({ runde, aufgabe }) {
  const { satz, vorlage } = aufgabe;
  const zeit = satz.zeit, v = verbByGrundform[satz.verb];
  const [ein, setEin] = useState('');
  const [versuche, setVersuche] = useState(0);
  const [status, setStatus] = useState('');
  const teile = satz.teile.map(x => ({ ...x, t: x.t }));
  const subj = teile.find(x => x.rolle === 'subj'), hv = teile.find(x => x.rolle === 'hv'), rest = teile.find(x => x.rolle === 'rest'), zw = teile.find(x => x.rolle === 'zweites');
  const klein = (w) => w.toLowerCase();
  // erlaubte Lösungen als Wortlisten (ohne Punkt); nur das erste Wort darf groß oder klein sein
  const loesungen = [
    [subj.t, hv.t, rest?.t, zw.t],
    ...(rest ? [[gross(rest.t), hv.t, PRONOMEN_KLEIN[subj.t] || subj.t, zw.t]] : []),
  ].map(l => l.filter(Boolean).join(' ').split(' '));
  const gleich = (l, w, ohneGross) => l.length === w.length && l.every((x, i) => (i === 0 || ohneGross) ? klein(x) === klein(w[i]) : x === w[i]);
  const pruefe = () => {
    if (runde.geloest) return;
    const woerter = satzWoerter(ein);
    if (!woerter.length) { runde.info('Schreibe zuerst den ganzen Satz.'); return; }
    const w = woerter.map(klein);
    const ok = loesungen.some(l => gleich(l, woerter, false));
    runde.erst(0, ok);
    if (ok) {
      setStatus('richtig');
      const hinweis = [];
      if (woerter[0][0] !== woerter[0][0].toUpperCase()) hinweis.push('Denk beim nächsten Mal an den Großbuchstaben am Satzanfang.');
      if (!/[.!?]\s*$/.test(ein)) hinweis.push('Am Satzende fehlt noch der Punkt.');
      runde.geschafft(`${zufall(LOB)}${hinweis.length ? ' ' + hinweis.join(' ') : ''}`);
      return;
    }
    setStatus('falsch');
    const n = versuche + 1; setVersuche(n);
    // Konkreten Fehler nennen
    const hvSoll = klein(hv.t), zwSoll = klein(zw.t);
    const letztes = w[w.length - 1];
    let text;
    if (!w.includes(hvSoll)) {
      const andereHv = zeit === 'perfekt' ? [...HV_FORMEN.haben, ...HV_FORMEN.sein] : ['werde', 'wirst', 'wird', 'werden', 'werdet'];
      const gefunden = w.find(x => andereHv.includes(x));
      text = zeit === 'perfekt' && gefunden && !HV_FORMEN[v.hv].includes(gefunden) ? `„${v.g}“ bildet das Perfekt mit „${v.hv}“.`
        : gefunden ? `„${gefunden}“ passt nicht zur Person. Welche Form von „${zeit === 'perfekt' ? v.hv : 'werden'}“ gehört zu „${PRONOMEN_KLEIN[subj.t] || subj.t}“?`
        : `Im ${ZEITEN[zeit].name} brauchst du ${SATZ_ZEIT[zeit].hv}.`;
    } else if (w.indexOf(hvSoll) !== 1 && !(rest && w.indexOf(hvSoll) === rest.t.split(' ').length)) text = `„${hv.t}“ muss an zweiter Stelle stehen.`;
    else if (!w.includes(zwSoll)) text = zeit === 'perfekt'
      ? `Prüfe die ge-Form von „${v.g}“. ${letztes && letztes !== zwSoll && /^ge|t$|en$/.test(letztes) ? diagnose(letztes, zwSoll, v, 'partizip') : ''}`.trim()
      : `Am Satzende steht beim Futur die Grundform von „${v.g}“.`;
    else if (letztes !== zwSoll) text = `„${zw.t}“ gehört ans Satzende.`;
    else if (loesungen.some(l => gleich(l, woerter, true))) text = 'Fast! Achte auf die Groß- und Kleinschreibung.';
    else text = 'Die Verben stimmen. Prüfe die anderen Wörter: Schreibe sie genau wie im Satz oben.';
    if (n >= 3) runde.aufloesen(`So heißt der Satz: ${satz.text}`);
    else runde.falsch(text, `Im ${ZEITEN[zeit].name} steht ${SATZ_ZEIT[zeit].hv} an zweiter Stelle und ${SATZ_ZEIT[zeit].zw} ganz am Ende.`);
  };
  const farbe = status === 'richtig' ? 'border-lime-600 bg-lime-50' : status === 'falsch' ? 'border-rose-500 bg-rose-50' : 'border-slate-400 bg-white';
  return (
    <Leuchttafel zeit={zeit} titel="Satz schreiben">
      <p className="text-stone-600 text-base md:text-lg mb-2 flex items-center gap-2"><Keyboard className="w-5 h-5 flex-shrink-0" /> Schreibe den Satz im {ZEITEN[zeit].name}.</p>
      <p className="text-2xl md:text-3xl text-center py-3 text-slate-900"><span className="text-xs font-black text-rose-700 uppercase tracking-widest block mb-1">Präsens</span>{vorlage}</p>
      <textarea value={ein} rows={2} disabled={runde.geloest}
        onChange={e => { setEin(e.target.value.replace(/\n/g, '')); if (status === 'falsch') setStatus(''); }}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); pruefe(); } }}
        autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck="false" aria-label={`Satz im ${ZEITEN[zeit].name}`}
        placeholder={`Hier den Satz im ${ZEITEN[zeit].name} schreiben …`}
        className={`w-full rounded-xl border-2 px-4 py-3 text-2xl md:text-3xl font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-cyan-300/60 resize-none ${farbe} ${status === 'falsch' ? 'anim-shake' : ''}`} />
      {runde.geloest && status === 'richtig' && <p data-loesung="" className="text-2xl md:text-3xl text-center pt-4"><Klammersatz zeit={zeit} teile={satz.teile.map(x => ({ t: x.t, k: x.rolle === 'hv' || x.rolle === 'zweites' }))} /></p>}
      {!runde.geloest && <div className="text-center mt-4"><button onClick={pruefe} className="bg-cyan-400 hover:bg-cyan-300 text-cyan-950 font-black text-lg py-3 px-8 rounded-xl shadow-[0_4px_0_rgba(14,116,144,1)] active:translate-y-1 uppercase tracking-wider">Prüfen</button></div>}
    </Leuchttafel>
  );
}
// Aufgaben zum Tippen: kurze Sätze (Klasse 3: höchstens 2 Wörter im Satzrest), Subjekt meist ein Pronomen
function tippAufgaben(stufe, zeit, n, schonVerben) {
  const rahmen = rahmenDerStufe(stufe).filter(r => !schonVerben.includes(r.v) && !(zeit === 'futur' && verbByGrundform[r.v].futurNurImSatz) && (stufe === 4 || (r.rest || '').split(' ').length <= 2));
  return mische(rahmen).slice(0, n).map((r, i) => {
    const moegl = (r.wer || [0, 1, 2, 3, 4, 5]).filter(p => satzErlaubt(r, p, 'praesens'));
    const p = zufall(moegl);
    const satz = baueSatz(r, p, zeit, i), vorlage = baueSatz(r, p, 'praesens', i).text;
    return { key: 'tippen-' + r.v, verb: r.v, tippen: true, satz, vorlage };
  });
}
function FuturSpiel({ spiel, stufe, onFinish, onTipp }) {
  const [aufgaben] = useState(() => {
    const rahmen = rahmenDerStufe(stufe);
    const zieh = () => { for (;;) { const r = zufall(rahmen), p = r.wer ? zufall(r.wer) : Math.floor(Math.random() * 6); if (satzErlaubt(r, p, 'futur')) return { r, p }; } };
    const bauen = waehle(spiel.id, rahmen.map(r => ({ key: r.v, r })), 5).map((x, i) => {
      const p = x.r.wer ? zufall(x.r.wer) : Math.floor(Math.random() * 6);
      return { key: x.r.v, verb: x.r.v, bauen: true, satz: baueSatz(x.r, p, 'futur', i), zeitwort: i % 2 ? zufall(['morgen', 'bald', 'am Wochenende']) : null };
    });
    const arten = FUTUR_FEHLER.filter(f => f.stufe <= stufe).map(f => f.art);
    const urteile = mische([false, false, true, true]).map((mitFehler, i) => {
      for (let k = 0; k < 30; k++) {
        const { r, p } = zieh();
        if (!mitFehler) return { key: `rf-${r.v}-${p}`, verb: r.v, text: baueSatz(r, p, 'futur', i).text };
        const art = zufall(arten), f = futurFehlersatz(r, p, art, i);
        const anders = arten.filter(a => a !== art).map(a => futurFehlersatz(r, p, a, i)).find(Boolean);
        if (f && anders) return { key: `rf-${r.v}-${p}-${art}`, verb: r.v, text: f.text, fehler: f, anders: anders.text };
      }
    });
    const tippen = tippAufgaben(stufe, 'futur', 3, bauen.map(b => b.verb));
    return [...nichtHintereinander(bauen), ...urteile, ...tippen];
  });
  const runde = useRunde({ aufgaben, skill: 'futur', onFinish, onTipp });
  const A = runde.aufgabe.bauen ? FuturBauen : runde.aufgabe.tippen ? SatzTippen : FuturRichtigFehler;
  return <RundenRahmen runde={runde}><A key={runde.schluessel} runde={runde} aufgabe={runde.aufgabe} /></RundenRahmen>;
}

// ==========================================
// SPIEL 10: Perfekt-Werkstatt (Teil A „haben oder sein?“, Teil B „Partizip bauen“)
// ==========================================
const HV_FORMEN = { haben: ['habe', 'hast', 'hat', 'haben', 'habt', 'haben'], sein: ['bin', 'bist', 'ist', 'sind', 'seid', 'sind'] };
// Begründung, warum ein Verb „haben“ oder „sein“ bekommt (Hilfsverb-Regel der App)
function hvGrund(v) {
  if (v.hv === 'sein') return ['sein', 'bleiben', 'werden'].includes(v.g)
    ? `Bei „sein“, „bleiben“ und „werden“ nimmst du „sein“.`
    : v.g === 'aufwachen' ? `„aufwachen“ ist eine Veränderung. Deshalb nimmst du „sein“.` : `„${v.g}“ ist eine Bewegung von einem Ort zum anderen. Deshalb nimmst du „sein“.`;
  return `Bei „${v.g}“ nimmst du „haben“, weil es keine Bewegung von einem Ort zum anderen ist.`;
}

function HilfsverbAufgabe({ runde, aufgabe }) {
  const v = verbByGrundform[aufgabe.satz.verb];
  const p = aufgabe.satz.person;
  const [wahl] = useState(() => mische([HV_FORMEN.haben[p], HV_FORMEN.sein[p]]));
  const [gesetzt, setGesetzt] = useState(null);
  const tippe = (w) => {
    if (runde.geloest) return;
    const ok = w === HV_FORMEN[v.hv][p];
    runde.erst(0, ok);
    if (ok) { setGesetzt(w); runde.geschafft(`${zufall(LOB)} ${hvGrund(v)}`); }
    else runde.falsch(`Nicht „${w}“. ${hvGrund(v)}`, 'Du nimmst „sein“ bei einer Bewegung von einem Ort zum anderen oder bei einer Veränderung, außerdem bei sein, bleiben und werden. Sonst nimmst du „haben“.');
  };
  return (
    <Leuchttafel zeit="perfekt" titel="haben oder sein?">
      <p className="text-2xl md:text-3xl text-center py-6 text-slate-900">
        {aufgabe.satz.teile.map((x, i) => (
          <React.Fragment key={i}>
            {i > 0 && ' '}
            {x.rolle === 'hv'
              ? (gesetzt ? <b data-loesung="" className="text-lime-800 border-2 border-lime-600 rounded-md px-1">{gesetzt}</b> : <span className="inline-block w-20 border-b-4 border-dashed border-stone-400" />)
              : x.rolle === 'zweites' ? <b className="text-lime-800">{x.t}</b> : x.t}
          </React.Fragment>
        ))}.
      </p>
      <div className="flex justify-center gap-3">{wahl.map(w => <WahlKnopf key={w} onClick={() => tippe(w)} aus={runde.geloest}>{w}</WahlKnopf>)}</div>
    </Leuchttafel>
  );
}

// Partizip in Bausteine zerlegen: { vor, stamm, endung } – gegangen = ge + gang + en, aufgewacht = aufge + wach + t
function partizipTeile(v) {
  const p2 = partizip(v);
  let vor = '', rest = p2;
  if (v.teil) { vor = v.teil + 'ge'; rest = p2.slice(vor.length); }
  else if (!v.ohneGe && p2.startsWith('ge')) { vor = 'ge'; rest = p2.slice(2); }
  const endung = rest.endsWith('en') ? 'en' : (rest.endsWith('et') && besonderheit(v) === 'dt') ? 'et' : rest.endsWith('t') ? 't' : 'n';
  return { vor, stamm: rest.slice(0, rest.length - endung.length), endung };
}
const OHNE = '–';   // Baustein „kein ge-“
function PartizipAufgabe({ runde, aufgabe }) {
  const v = verbByGrundform[aufgabe.verb];
  const soll = partizipTeile(v);
  const [optionen] = useState(() => {
    const vor = v.teil ? [soll.vor, 'ge', v.teil] : ['ge', OHNE];
    const prt = praeteritum(v)[0].text.replace(/te$/, '');
    const stamm = [soll.stamm, wortstamm(v), prt].filter((x, i, a) => x && a.indexOf(x) === i).slice(0, 3);
    const endung = ['t', 'en', ...(besonderheit(v) === 'dt' ? ['et'] : []), ...(soll.endung === 'n' ? ['n'] : [])];
    return { vor: mische(vor), stamm: mische(stamm), endung };
  });
  const [wahl, setWahl] = useState({ vor: null, stamm: null, endung: null });
  const wort = (wahl.vor && wahl.vor !== OHNE ? wahl.vor : '') + (wahl.stamm || '…') + (wahl.endung || '');
  const fertig = wahl.vor && wahl.stamm && wahl.endung;
  const pruefe = () => {
    const vor = wahl.vor === OHNE ? '' : wahl.vor;
    const ok = vor === soll.vor && wahl.stamm === soll.stamm && wahl.endung === soll.endung;
    runde.erst(0, ok);
    if (ok) { runde.geschafft(`${zufall(LOB)} ${v.g} – ${partizip(v)}.`); return; }
    let text;
    if (vor !== soll.vor) text = v.teil ? `Bei „${v.g}“ steht ge- in der Mitte: ${partizip(v)}.` : soll.vor ? 'Hier gehört ge- an den Anfang.' : `„${v.g}“ bekommt kein ge-. Verben, die mit be-, er- oder ver- anfangen, und Verben auf -ieren bekommen kein ge-.`;
    else if (wahl.stamm !== soll.stamm) text = v.art === 'u' ? `„${v.g}“ ist unregelmäßig. Der Wortstamm ändert sich. Im Wörterbuch steht: ${v.g}, ${praeteritum(v)[0].text}, ${partizip(v)}.` : `Bei „${v.g}“ bleibt der Wortstamm gleich: ${soll.stamm}.`;
    else text = v.art === 'u' ? 'Unregelmäßige Verben enden in der ge-Form meistens auf -en.' : besonderheit(v) === 'dt' ? 'Nach d oder t kommt ein e dazu: -et.' : 'Regelmäßige Verben enden in der ge-Form auf -t.';
    runde.falsch(text, 'Die ge-Form beginnt meistens mit ge-. Regelmäßige Verben enden auf -t (gemalt), unregelmäßige meistens auf -en (gegangen).');
  };
  // Hilfsfunktion (keine eigene Komponente, damit die Knöpfe beim Antippen nicht neu erzeugt werden)
  const spalte = (name, titel, liste) => (
    <div key={name} className="flex flex-col items-center gap-2">
      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">{titel}</span>
      {liste.map(x => (
        <WahlKnopf key={x} onClick={() => !runde.geloest && setWahl(w => ({ ...w, [name]: x }))} aus={runde.geloest}
          cls={wahl[name] === x ? 'bg-lime-200 border-lime-600 text-lime-900' : ''}>{x === OHNE ? 'kein ge-' : (v.teil && x === v.teil + 'ge') ? `${v.teil} + ge` : x}</WahlKnopf>
      ))}
    </div>
  );
  return (
    <div className="space-y-4">
      <Leuchttafel zeit="perfekt" titel="ge-Form bauen">
        <p className="text-stone-500 text-base">Grundform: <b className="text-slate-800">{v.g}</b> · Baue die ge-Form.</p>
        <p {...(runde.geloest ? { 'data-loesung': '' } : {})} className="text-4xl md:text-5xl font-bold text-center my-5 text-lime-800">{wort}</p>
        <div className="flex justify-center gap-4 md:gap-8">
          {spalte('vor', 'Anfang', optionen.vor)}
          {spalte('stamm', 'Stamm', optionen.stamm)}
          {spalte('endung', 'Ende', optionen.endung)}
        </div>
      </Leuchttafel>
      {!runde.geloest && fertig && <button onClick={pruefe} className="w-full md:w-auto bg-cyan-400 hover:bg-cyan-300 text-cyan-950 font-black text-lg py-3 px-8 rounded-xl shadow-[0_4px_0_rgba(14,116,144,1)] active:translate-y-1 uppercase tracking-wider">Prüfen</button>}
    </div>
  );
}
function PerfektWerkstatt({ spiel, stufe, onFinish, onTipp }) {
  const [aufgaben] = useState(() => {
    // Teil A: etwa halb haben, halb sein; tanzen nicht (Auftrag)
    const rahmen = rahmenDerStufe(stufe).filter(r => r.v !== 'tanzen');
    const satzZu = (r, i) => { const p = r.wer ? zufall(r.wer) : Math.floor(Math.random() * 6); return baueSatz(r, p, 'perfekt', i); };
    const sein = waehle(spiel.id + '-s', rahmen.filter(r => verbByGrundform[r.v].hv === 'sein').map(r => ({ key: r.v, r })), 2 + (Math.random() < 0.5 ? 1 : 0));
    const haben = waehle(spiel.id + '-h', rahmen.filter(r => verbByGrundform[r.v].hv === 'haben').map(r => ({ key: r.v, r })), 5 - sein.length);
    const teilA = mische([...sein, ...haben]).map((x, i) => ({ key: 'hv-' + x.r.v, verb: x.r.v, hilfsverb: true, satz: satzZu(x.r, i) }));
    // Teil B: Partizip bauen – erst normale Verben, Stufe 4 am Ende 2 Profi-Partizipien (ohne ge-, ge- in der Mitte)
    const normal = verbenFuer(stufe, v => !['verlieren', 'beginnen'].includes(v.g));
    const profi = VERBEN.filter(v => v.nur === 'perfekt' || ['verlieren', 'beginnen'].includes(v.g));
    const teilB = [
      ...waehle(spiel.id + '-p', normal.map(v => ({ key: v.g, verb: v.g })), stufe === 4 ? 3 : 5),
      ...(stufe === 4 ? mische(profi).slice(0, 2).map(v => ({ key: v.g, verb: v.g })) : []),
    ];
    return [...nichtHintereinander(teilA), ...teilB];
  });
  const runde = useRunde({ aufgaben, skill: 'perfekt', onFinish, onTipp });
  const A = runde.aufgabe.hilfsverb ? HilfsverbAufgabe : PartizipAufgabe;
  return <RundenRahmen runde={runde}><A key={runde.schluessel} runde={runde} aufgabe={runde.aufgabe} /></RundenRahmen>;
}

// ==========================================
// SPIEL 11: Sätze bauen: Perfekt (Satzbausteine ordnen, Hilfsverb an 2. Stelle, Partizip am Ende)
// ==========================================
function SaetzeBauenPerfekt({ spiel, stufe, onFinish, onTipp }) {
  const [aufgaben] = useState(() => {
    const bauen = waehle(spiel.id, rahmenDerStufe(stufe).map(r => ({ key: r.v, r })), 7).map((x, i) => {
      const p = x.r.wer ? zufall(x.r.wer) : Math.floor(Math.random() * 6);
      return { key: x.r.v, verb: x.r.v, satz: baueSatz(x.r, p, 'perfekt', i), zeitwort: i % 2 ? zufall(['gestern', 'am Wochenende', 'letzte Woche']) : null };
    });
    return [...bauen, ...tippAufgaben(stufe, 'perfekt', 3, bauen.map(b => b.verb))];
  });
  const runde = useRunde({ aufgaben, skill: 'perfekt', onFinish, onTipp });
  const A = runde.aufgabe.tippen ? SatzTippen : FuturBauen;
  return <RundenRahmen runde={runde}><A key={runde.schluessel} runde={runde} aufgabe={runde.aufgabe} /></RundenRahmen>;
}

// Welche Komponente zu welchem Spiel gehört (alle 14 Spiele seit Etappe 1c)
const SPIEL_KOMPONENTE = {
  endungJetzt: EndungsMaschine, tore: ZeitRegen, zwillinge: FindeUnterschied, teWerkstatt: TeWerkstatt, seinHaben: SeinHaben,
  woerterbuch: WoerterbuchForscher, familien: VerbFamilien, treppe: FormenTabelleSpiel, textmaschine: TextZeitmaschine,
  futur: FuturSpiel, detektiv: ToreSpiel, zeitchaos: ZeitChaos, perfektWerkstatt: PerfektWerkstatt, klammerPerfekt: SaetzeBauenPerfekt,
};

// ==========================================
// KARTE – Lernpfade wie in den anderen Deutsch-Apps (Pronomen-Magie)
// ==========================================
// Titel-Kasten, eigene Karte „Erkunde die Zeiten“ (Zeit-Schieberegler), darunter die Stationen als Lernpfad-Kästen (zwei nebeneinander)
// mit großen Spielkarten und Pfeilen. Farben der Kästen = Zeitform der Station. Reihenfolge = Reise (STATIONEN).

// Zeitform und deutsche Erklärung je Station (Etiketten), Zone für den Zeitsprung
const ZONE = {
  praesens:    { zeit: 'JETZT',   form: 'Präsens',    deutsch: 'Gegenwart', text: 'text-rose-300',   chip: 'bg-rose-500/15 text-rose-200 border-rose-400/50',
                 rand: 'border-rose-400/40',   glow: 'shadow-[0_0_30px_rgba(251,113,133,0.18)]', knoten: 'bg-rose-400 shadow-[0_0_20px_rgba(251,113,133,0.7)]',
                 icon: 'bg-rose-500/15 text-rose-300', hover: 'hover:border-rose-300 hover:bg-slate-800/90' },
  grenze:      { zeit: 'JETZT · FRÜHER', form: 'Präsens oder Präteritum', deutsch: 'Gegenwart oder Vergangenheit', text: 'text-rose-200', chip: 'bg-gradient-to-r from-rose-500/15 to-amber-500/15 text-rose-100 border-rose-300/50',
                 rand: 'border-rose-300/40',   glow: 'shadow-[0_0_30px_rgba(251,146,60,0.18)]', knoten: 'bg-gradient-to-br from-rose-400 to-amber-400 shadow-[0_0_20px_rgba(251,146,60,0.7)]',
                 icon: 'bg-orange-500/15 text-orange-200', hover: 'hover:border-orange-300 hover:bg-slate-800/90' },
  praeteritum: { zeit: 'FRÜHER',  form: 'Präteritum', deutsch: 'Vergangenheit (beim Schreiben)', text: 'text-amber-300',  chip: 'bg-amber-500/15 text-amber-200 border-amber-400/50',
                 rand: 'border-amber-400/40',  glow: 'shadow-[0_0_30px_rgba(251,191,36,0.15)]', knoten: 'bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.7)]',
                 icon: 'bg-amber-500/15 text-amber-300', hover: 'hover:border-amber-300 hover:bg-slate-800/90' },
  perfekt:     { zeit: 'FRÜHER',  form: 'Perfekt',    deutsch: 'Vergangenheit (beim Erzählen)', text: 'text-lime-300',   chip: 'bg-lime-500/15 text-lime-200 border-lime-400/50',
                 rand: 'border-lime-400/40',   glow: 'shadow-[0_0_30px_rgba(163,230,53,0.15)]', knoten: 'bg-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.7)]',
                 icon: 'bg-lime-500/15 text-lime-300', hover: 'hover:border-lime-300 hover:bg-slate-800/90' },
  futur:       { zeit: 'SPÄTER',  form: 'Futur',      deutsch: 'Zukunft', text: 'text-sky-300',    chip: 'bg-sky-500/15 text-sky-200 border-sky-400/50',
                 rand: 'border-sky-400/40',    glow: 'shadow-[0_0_30px_rgba(56,189,248,0.18)]', knoten: 'bg-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.7)]',
                 icon: 'bg-sky-500/15 text-sky-300', hover: 'hover:border-sky-300 hover:bg-slate-800/90' },
  finale:      { zeit: 'ALLE ZEITEN', form: 'Finale',  deutsch: 'alle Zeitformen', text: 'text-cyan-200',   chip: 'bg-cyan-500/15 text-cyan-100 border-cyan-300/50',
                 rand: 'border-cyan-300/50',   glow: 'shadow-[0_0_40px_rgba(34,211,238,0.25)]', knoten: 'bg-gradient-to-br from-amber-300 via-rose-400 to-sky-400 shadow-[0_0_25px_rgba(34,211,238,0.8)]',
                 icon: 'bg-cyan-500/15 text-cyan-200', hover: 'hover:border-cyan-200 hover:bg-slate-800/90' },
};
// Wo liegt eine Station auf dem Zeitstrahl? (für „Du bist hier“)
const STRAHL_ZONE = { praesens: 'jetzt', grenze: 'jetzt', praeteritum: 'frueher', perfekt: 'frueher', futur: 'spaeter', finale: null };

// Das nächste Spiel für die Markierung „Hier weiter!“: das erste freie Spiel der Reise ohne 9 Sterne, sonst das erste ohne 10.
function naechstesSpiel(stufe, progress, sperreVon) {
  const reihe = stationenDerStufe(stufe).flatMap(st => st.spiele.map(gameById).filter(g => g.stufe <= stufe));
  const frei = reihe.filter(g => !sperreVon(g.id));
  return frei.find(g => (progress[g.id] || 0) < FREI_AB) || frei.find(g => (progress[g.id] || 0) < 10) || null;
}
const stationVon = id => STATIONEN.find(st => st.spiele.includes(id));

// Farben der Lernpfad-Kästen und Spielkarten (wie Pronomen-Magie, in den Farben der Zeitformen)
const PFAD = {
  praesens:    { kasten: 'bg-rose-900/20 border-rose-500/30',   kopf: 'text-rose-300',   pfeil: 'text-rose-400/50',
                 karte: 'text-rose-300 border-rose-500/30 hover:border-rose-400 hover:shadow-[0_0_25px_rgba(251,113,133,0.25)]' },
  grenze:      { kasten: 'bg-gradient-to-r from-rose-900/20 to-amber-900/20 border-orange-400/30', kopf: 'text-orange-200', pfeil: 'text-orange-300/50',
                 karte: 'text-orange-200 border-orange-400/30 hover:border-orange-300 hover:shadow-[0_0_25px_rgba(251,146,60,0.25)]' },
  praeteritum: { kasten: 'bg-amber-900/20 border-amber-500/30', kopf: 'text-amber-300',  pfeil: 'text-amber-400/50',
                 karte: 'text-amber-300 border-amber-500/30 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(251,191,36,0.25)]' },
  perfekt:     { kasten: 'bg-lime-900/20 border-lime-500/30',   kopf: 'text-lime-300',   pfeil: 'text-lime-400/50',
                 karte: 'text-lime-300 border-lime-500/30 hover:border-lime-400 hover:shadow-[0_0_25px_rgba(163,230,53,0.25)]' },
  futur:       { kasten: 'bg-sky-900/20 border-sky-500/30',     kopf: 'text-sky-300',    pfeil: 'text-sky-400/50',
                 karte: 'text-sky-300 border-sky-500/30 hover:border-sky-400 hover:shadow-[0_0_25px_rgba(56,189,248,0.25)]' },
  finale:      { kasten: 'bg-cyan-900/20 border-cyan-400/30',   kopf: 'text-cyan-200',   pfeil: 'text-cyan-300/50',
                 karte: 'text-cyan-200 border-cyan-400/30 hover:border-cyan-300 hover:shadow-[0_0_25px_rgba(34,211,238,0.3)]' },
};

// Spielkarte (wie MenuButton in Pronomen-Magie): großes Symbol, Titel, Kurztext; Schloss-Leiste, Sterne-Etikett, „Hier weiter!“
function MenuButton({ spiel, farbe, sterne, sperre, istNaechstes, onClick }) {
  const Icon = spiel.icon;
  const isLocked = !!sperre, isCompleted = sterne > 0;
  let cardStyle = `bg-slate-900/60 hover:bg-slate-800/80 border-2 ${PFAD[farbe].karte}`;
  if (isLocked) cardStyle = 'bg-slate-900/60 border-2 border-slate-700/50 cursor-not-allowed';
  else if (istNaechstes) cardStyle = 'bg-cyan-900/20 hover:bg-cyan-900/40 border-2 border-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.4)] text-cyan-200';
  else if (isCompleted) cardStyle = 'bg-amber-900/20 hover:bg-amber-900/40 border-2 border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.3)]';
  return (
    <button onClick={onClick} disabled={isLocked}
      className={`relative flex-1 w-full flex flex-col items-center text-center p-4 md:p-6 rounded-2xl transition-all overflow-hidden group select-none touch-manipulation ${isLocked ? 'pb-14 md:pb-16' : 'active:scale-95 hover:scale-105'} ${cardStyle}`}>
      {isLocked && (
        <div className="absolute bottom-0 left-0 w-full bg-slate-950/90 border-t border-slate-800 flex items-center justify-center py-2 px-3 z-20">
          <Lock className="w-4 h-4 md:w-5 md:h-5 text-slate-400 mr-2 flex-shrink-0" />
          <span className="text-[10px] md:text-xs font-bold text-slate-300 leading-tight">{sperre}</span>
        </div>
      )}
      {isCompleted && !isLocked && (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 text-xs font-black px-2 py-1 rounded-md flex items-center gap-1 shadow-md rotate-3 z-10">
          {sterne >= 10 ? <Award className="w-3.5 h-3.5" /> : <Star className="w-3 h-3 fill-amber-950" />} {sterne}/10
        </div>
      )}
      {istNaechstes && !isLocked && (
        <div className="absolute bottom-0 left-0 w-full bg-cyan-400 text-cyan-950 text-[10px] md:text-xs font-black py-1 text-center uppercase tracking-widest z-10 flex items-center justify-center gap-1">
          <Play className="w-3 h-3 fill-cyan-950" /> Hier weiter!
        </div>
      )}
      <div className={`w-full flex flex-col items-center ${isLocked ? 'opacity-70' : ''} ${istNaechstes ? 'pb-3' : ''}`}>
        <Icon className={`w-12 h-12 md:w-14 md:h-14 mb-3 md:mb-4 mx-auto flex-shrink-0 transition-all ${isLocked ? 'text-slate-400' : 'group-hover:scale-110'} ${isCompleted && !isLocked && !istNaechstes ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : ''}`} />
        <h3 className={`w-full text-base md:text-lg font-bold mb-2 uppercase tracking-wider break-words hyphens-auto leading-tight ${isCompleted && !istNaechstes ? 'text-amber-100' : isLocked ? 'text-slate-300' : 'text-slate-100'}`}>{spiel.titel}</h3>
        <p className={`w-full text-xs md:text-sm break-words leading-snug ${isCompleted && !istNaechstes ? 'text-amber-200/80' : isLocked ? 'text-slate-500' : 'text-slate-400'}`}>{SAETZE[`spiel_${spiel.id}`]}</p>
      </div>
    </button>
  );
}

// Ein Lernpfad = eine Station (Kasten in der Farbe ihrer Zeitform, Spiele mit Pfeilen verbunden)
function Station({ station, stufe, progress, sperreVon, naechstes, onStart, breit }) {
  const F = PFAD[station.farbe], z = ZONE[station.farbe];
  const Icon = station.icon;
  const spiele = station.spiele.map(gameById).filter(g => g.stufe <= stufe);
  return (
    <section className={`border rounded-3xl p-4 md:p-6 backdrop-blur-sm ${F.kasten} ${breit ? 'xl:col-span-2' : ''}`}>
      <h2 className={`${F.kopf} font-bold text-lg md:text-xl uppercase tracking-widest flex items-center justify-center gap-3 text-center`}>
        <Icon className="w-6 h-6 flex-shrink-0" /> {station.titel}
      </h2>
      <p className={`${F.kopf} opacity-70 text-xs md:text-sm font-semibold text-center mt-1 mb-4`}>{z.form} · {z.deutsch}</p>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        {spiele.map((g, i) => (
          <React.Fragment key={g.id}>
            {i > 0 && <ArrowRight className={`w-10 h-10 ${F.pfeil} rotate-90 md:rotate-0 flex-shrink-0`} />}
            <MenuButton spiel={g} farbe={station.farbe} sterne={progress[g.id] || 0} sperre={sperreVon(g.id)} istNaechstes={naechstes?.id === g.id} onClick={() => onStart(g.id)} />
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

function Karte({ stufe, progress, sperreVon, onStart, onSchieberegler }) {
  const stationen = stationenDerStufe(stufe);
  const naechstes = naechstesSpiel(stufe, progress, sperreVon);
  return (
    <>
      {/* Titel-Kasten (kompakt, mittig): Sanduhr oben, Titel, Untertitel „Zeitformen der Verben“ und ein Einladungssatz */}
      <div className="bg-slate-950/60 backdrop-blur-md rounded-3xl px-5 py-5 md:px-8 md:py-6 border-2 border-cyan-400/30 relative overflow-hidden mb-6 shadow-[0_0_40px_rgba(34,211,238,0.12)] flex flex-col items-center gap-2 md:gap-3 text-center">
        <Hourglass className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 text-cyan-200 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] anim-float" />
        <div className="min-w-0">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-sky-300 to-indigo-300 pb-1">Zeitreise</h1>
          <p className="text-cyan-100/80 text-sm md:text-lg font-bold tracking-wide">Zeitformen der Verben</p>
          <p className="text-slate-300 text-sm md:text-base mt-1">{SAETZE.karte_einladung}</p>
        </div>
      </div>
      {/* „Erkunde die Zeiten“ (Zeit-Schieberegler): eigene Karte vor den Lernpfaden – ein Werkzeug, kein Spiel
          (ohne Sterne, nie gesperrt). Gut zu finden, auch an der digitalen Tafel. */}
      <button onClick={onSchieberegler}
        className="w-full mb-8 flex items-center gap-4 md:gap-5 text-left bg-slate-950/60 backdrop-blur-md hover:bg-sky-950/60 border-2 border-sky-400/40 hover:border-sky-300 rounded-3xl p-4 md:p-6 transition-all active:scale-[0.99] shadow-[0_0_30px_rgba(56,189,248,0.12)] hover:shadow-[0_0_30px_rgba(56,189,248,0.3)] group">
        <span className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-sky-500/15 border-2 border-sky-400/50 flex items-center justify-center flex-shrink-0">
          <SlidersHorizontal className="w-8 h-8 text-sky-300" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sky-300 font-black text-lg md:text-2xl uppercase tracking-widest">Erkunde die Zeiten</span>
          <span className="block text-slate-200 text-sm md:text-lg">Schiebe einen Satz durch die Zeit.</span>
          <span className="block text-slate-500 text-xs md:text-sm font-semibold mt-0.5">ohne Sterne · jederzeit offen</span>
        </span>
        <ArrowRight className="w-8 h-8 text-sky-300/70 group-hover:translate-x-1 transition-transform flex-shrink-0" />
      </button>
      {/* Lernpfade, zwei nebeneinander (auf schmalen Bildschirmen untereinander); Station 3 und 4 (Präteritum, drei Spiele) über die volle Breite */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {stationen.map(st => (
          <Station key={st.nr} station={st} stufe={stufe} progress={progress} sperreVon={sperreVon} naechstes={naechstes} onStart={onStart} breit={st.nr === 3 || st.nr === 4} />
        ))}
      </div>
    </>
  );
}

// ==========================================
// FENSTER
// ==========================================
function ErgebnisSeite({ ergebnis, onNochmal, onKarte, onKoennen }) {
  const { spiel, sterne, abzeichenNeu, neuFrei, serie = 0, rekordAlt = 0, comboSpiel } = ergebnis;
  const stufe = Math.floor(serie / ENERGIE_MAX);
  const neuerRekord = rekordAlt > 0 && serie > rekordAlt;
  const titel = sterne >= 10 ? 'Abzeichen geschafft!' : sterne >= FREI_AB ? 'Reise geschafft!' : 'Gut gemacht!';
  return (
    <div className="bg-slate-900/80 backdrop-blur-md max-w-lg w-full mx-auto rounded-3xl shadow-2xl border-2 border-cyan-400/30 p-8 md:p-12 text-center anim-pop">
      <Award className="w-24 h-24 mx-auto mb-6 text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] anim-float" />
      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-sky-300 mb-2 pb-1">{titel}</h2>
      <p className="text-slate-400 font-bold uppercase tracking-wider text-sm mb-3">{spiel.titel}</p>
      <div className="mb-4"><Sterne n={sterne} gross /></div>
      <p className="text-2xl text-cyan-100 mb-2">
        Du hast <strong className="text-white">{sterne}</strong> von <strong className="text-white">10</strong> Sternen gesammelt!
      </p>
      {sterne < FREI_AB && <p className="text-cyan-200/80 mb-2">Mit {FREI_AB} Sternen geht die Reise weiter.</p>}
      {abzeichenNeu && <p className="mt-2 inline-flex items-center gap-2 bg-amber-400/20 border-2 border-amber-400/60 rounded-full px-4 py-1 font-bold text-amber-300"><Award className="w-5 h-5" /> Neues Abzeichen!</p>}
      {neuFrei.length > 0 && <p className="mt-3 text-lg text-lime-300 font-bold">Jetzt frei: {neuFrei.map(g => `„${g.titel}“`).join(', ')}</p>}
      {/* Zeitenergie: längste Serie dieser Runde, erreichte Energie-Stufe, Rekord (nur bis zum Neuladen) */}
      {serie > 0 && (
        <div className={`mt-5 rounded-2xl border-2 px-4 py-3 ${neuerRekord ? 'border-amber-300 bg-amber-400/15 shadow-[0_0_25px_rgba(251,191,36,0.4)]' : 'border-yellow-300/40 bg-slate-950/50'}`}>
          <p className="flex items-center justify-center gap-2 text-lg font-bold text-yellow-200">
            <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
            {comboSpiel ? 'Längste Combo' : 'Längste Serie ohne Fehler'}: <span className="text-2xl font-black text-white">{serie}</span>
          </p>
          {!comboSpiel && stufe >= 1 && <p className="text-yellow-100/90">Energie-Stufe {stufe} erreicht!</p>}
          {neuerRekord && <p className="mt-1 inline-flex items-center gap-2 font-black text-amber-300"><Trophy className="w-5 h-5" /> Neuer Rekord! (vorher {rekordAlt})</p>}
          {!neuerRekord && rekordAlt > serie && <p className="text-sm text-slate-400 mt-1">Dein Rekord: {rekordAlt}. Schaffst du ihn beim nächsten Mal?</p>}
        </div>
      )}
      <div className="flex flex-col gap-4 mt-8">
        <button onClick={onKoennen} className="flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 border-2 border-lime-500/60 text-lime-300 font-bold text-lg py-4 px-6 rounded-xl uppercase tracking-wider active:scale-95"><Target className="w-6 h-6" /> Das kann ich schon</button>
        <button onClick={onNochmal} className="flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-lg py-4 px-6 rounded-xl uppercase tracking-wider active:scale-95"><RotateCcw className="w-6 h-6" /> Noch einmal versuchen</button>
        <button onClick={onKarte} className="flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-lg py-4 px-6 rounded-xl uppercase tracking-wider active:scale-95">Zurück zur Karte</button>
      </div>
    </div>
  );
}

function CodeFenster({ onClose, progress, skillLog, onLaden }) {
  const [eingabe, setEingabe] = useState('');
  const [meldung, setMeldung] = useState(null);
  const [kopiert, setKopiert] = useState(false);
  const code = useMemo(() => {
    const levels = {};
    SKILLS.forEach(s => { levels[s.id] = skillLevel(skillLog[s.id]); });
    return generateCode(progress, levels);
  }, [progress, skillLog]);
  const laden = () => {
    const r = parseCode(eingabe);
    if (!r) { setMeldung({ ok: false, text: 'Dieser Code stimmt nicht. Prüfe jedes Zeichen.' }); return; }
    onLaden(r);
    setMeldung({ ok: true, text: 'Geschafft! Deine Sterne sind wieder da.' });
  };
  return (
    <Modal onClose={onClose} titel="Zeitreise-Code" rand="border-emerald-500" titelFarbe="text-emerald-300" icon={Key}>
      <p className="text-slate-300">Schreibe deinen Code ab. Damit kannst du nächstes Mal weiterreisen.</p>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 text-center font-mono text-2xl md:text-3xl font-black tracking-wider bg-slate-950 border-2 border-emerald-500/50 text-emerald-300 rounded-2xl py-3 select-all">{code}</div>
        <button onClick={() => { navigator.clipboard?.writeText(code).then(() => setKopiert(true), () => {}); }} aria-label="Code kopieren" className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"><Copy className="w-5 h-5" /></button>
      </div>
      {kopiert && <p className="text-sm text-emerald-300 mt-1">Kopiert.</p>}
      <hr className="my-5 border-slate-800" />
      <p className="font-bold text-slate-200 uppercase tracking-wider text-sm">Code eingeben</p>
      <input value={eingabe} onChange={e => { setEingabe(formatCodeInput(e.target.value)); setMeldung(null); }}
        onKeyDown={e => e.key === 'Enter' && laden()}
        autoCapitalize="characters" autoCorrect="off" autoComplete="off" spellCheck="false"
        placeholder="XXXX-XXXXX-XXXXX" className="mt-2 w-full font-mono text-xl text-center bg-slate-950 text-white border-2 border-slate-700 rounded-2xl py-3 focus:border-emerald-400 outline-none" />
      {meldung && <p className={`mt-2 font-bold ${meldung.ok ? 'text-emerald-300' : 'text-rose-300'}`}>{meldung.text}</p>}
      <button onClick={laden} className="mt-3 w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black rounded-xl py-3 text-lg uppercase tracking-wider shadow-[0_4px_0_rgba(4,120,87,1)] active:translate-y-1">Code laden</button>
    </Modal>
  );
}

function KoennenFenster({ onClose, stufe, skillLog, fokus }) {
  const skills = SKILLS.filter(s => s.stufe <= stufe && (!fokus || (GAME_SKILLS[fokus] || []).includes(s.id)));
  return (
    <Modal onClose={onClose} breit titel="Das kann ich schon" untertitel="Es zählt nur der erste Versuch bei jeder Aufgabe." rand="border-lime-500" titelFarbe="text-lime-300" icon={Target}>
      <div className="space-y-3">
        {skills.map(s => {
          const ui = SKILL_LEVEL_UI[skillLevel(skillLog[s.id])];
          const spiele = spieleDerStufe(stufe).filter(g => (GAME_SKILLS[g.id] || []).includes(s.id));
          return (
            <div key={s.id} className="bg-slate-800/60 border-2 border-slate-700 rounded-2xl p-3 text-left">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-white">{s.titel}</p>
                <span className={`text-sm font-bold border-2 rounded-full px-3 py-0.5 ${ui.cls}`}>{ui.label}</span>
              </div>
              <p className="text-sm text-slate-400 mt-1">Geübt in: {spiele.map(g => g.titel).join(', ')}</p>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

function QrBild({ text }) {
  const svg = useMemo(() => {
    try { const q = qrcode(0, 'M'); q.addData(text); q.make(); return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); } catch (e) { return ''; }
  }, [text]);
  return <div className="w-40 h-40 bg-white rounded-lg flex-shrink-0" dangerouslySetInnerHTML={{ __html: svg }} />;
}

function AdminAnmeldung({ onLogin, onClose, onImpressum }) {
  const [pwd, setPwd] = useState('');
  const [fehler, setFehler] = useState(false);
  const pruefen = () => { if (pwd === ADMIN_PASSWORD) onLogin(); else setFehler(true); };
  return (
    <Modal onClose={onClose} titel="Lehrer-Bereich" icon={Settings}>
      <input type="password" autoFocus value={pwd} onChange={e => { setPwd(e.target.value); setFehler(false); }} onKeyDown={e => e.key === 'Enter' && pruefen()}
        placeholder="Passwort" autoComplete="off" className="w-full bg-slate-950 text-white border-2 border-slate-700 rounded-xl px-4 py-3 text-lg focus:border-cyan-400 outline-none" />
      {fehler && <p className="text-rose-300 mt-2 font-bold">Das Passwort stimmt nicht.</p>}
      <button onClick={pruefen} className="mt-3 w-full bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-black rounded-xl py-3 text-lg uppercase tracking-wider shadow-[0_4px_0_rgba(14,116,144,1)] active:translate-y-1">Öffnen</button>
      <button onClick={onImpressum} className="mt-4 w-full text-sm text-slate-500 hover:text-slate-300 underline-offset-2 hover:underline">Impressum &amp; Datenschutz</button>
    </Modal>
  );
}

function LehrerBereich({ onClose, einst, setEinst, progress, setProgress, setSkillLog, onKoennen, onSchieberegler, onImpressum, onBlaetter }) {
  const [loeschen, setLoeschen] = useState(false);
  const [kopiert, setKopiert] = useState(false);
  const link = settingsLink(einst);
  const sichtbar = spieleDerStufe(einst.stufe).map(g => g.id);
  const setze = ids => { const neu = { ...progress }; ids.forEach(id => { neu[id] = 10; }); setProgress(neu); onClose(); };
  const Knopf = ({ onClick, children, cls = 'bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200' }) => (
    <button onClick={onClick} className={`w-full font-bold rounded-xl py-3 px-4 ${cls}`}>{children}</button>
  );
  return (
    <Modal onClose={onClose} breit titel="Lehrer-Bereich" icon={Settings}>
      <p className="font-bold text-slate-200 uppercase tracking-wider text-sm">Stufe</p>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {[[3, 'Stufe 3', 'Präsens, Präteritum und Futur'], [4, 'Stufe 4', 'alle vier Zeitformen']].map(([s, t, d]) => (
          <button key={s} onClick={() => setEinst({ ...einst, stufe: s })}
            className={`rounded-xl border-2 p-3 text-left ${einst.stufe === s ? 'bg-cyan-600 border-cyan-300 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}>
            <span className="block font-bold">{t}</span><span className="block text-sm opacity-80">{d}</span>
          </button>
        ))}
      </div>
      <p className="font-bold text-slate-200 uppercase tracking-wider text-sm mt-4">Zeitsprung-Animationen</p>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {[[true, 'An'], [false, 'Aus']].map(([wert, t]) => (
          <button key={t} onClick={() => setEinst({ ...einst, anim: wert })}
            className={`rounded-xl border-2 p-3 font-bold ${einst.anim === wert ? 'bg-cyan-600 border-cyan-300 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}>{t}</button>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-2">Gilt bis zum Neuladen. Dauerhaft für die Klasse: diesen Link oder QR-Code verwenden.</p>
      <div className="mt-3 flex flex-col sm:flex-row gap-4 items-start">
        <QrBild text={link} />
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm break-all bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-300">{link}</p>
          <button onClick={() => navigator.clipboard?.writeText(link).then(() => setKopiert(true), () => {})} className="mt-2 inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 rounded-xl px-3 py-2 font-bold text-slate-200"><Copy className="w-4 h-4" /> Link kopieren</button>
          {kopiert && <span className="ml-2 text-sm text-emerald-300">Kopiert.</span>}
        </div>
      </div>
      <hr className="my-5 border-slate-800" />
      <div className="grid gap-3">
        <Knopf onClick={() => setze(sichtbar)} cls="bg-amber-600 hover:bg-amber-500 text-white">Alles freischalten</Knopf>
        <Knopf onClick={() => setze(BASICS.filter(id => sichtbar.includes(id)))} cls="bg-teal-600 hover:bg-teal-500 text-white">Grundlagen abschließen</Knopf>
        {!loeschen
          ? <Knopf onClick={() => setLoeschen(true)} cls="bg-red-600 hover:bg-red-500 text-white">Fortschritt löschen</Knopf>
          : <Knopf onClick={() => { setProgress({}); setSkillLog({}); onClose(); }} cls="bg-red-800 hover:bg-red-700 text-white">Wirklich löschen? Noch einmal tippen.</Knopf>}
        <Knopf onClick={onKoennen}>„Das kann ich schon“ ansehen</Knopf>
        <Knopf onClick={onSchieberegler}>Erkunde die Zeiten</Knopf>
        <Knopf onClick={onBlaetter}>Arbeitsblätter</Knopf>
        <Knopf onClick={onImpressum}>Impressum &amp; Datenschutz</Knopf>
      </div>
      <p className="text-xs text-slate-500 mt-4">„Alles freischalten“ setzt alle Spiele der Stufe auf 10 Sterne, „Grundlagen abschließen“ nur die freien Spiele. Version: {BASIS ? 'Basis' : 'normal'} · Stufe {einst.stufe}</p>
    </Modal>
  );
}

// ==========================================
// IMPRESSUM & DATENSCHUTZ
// ==========================================
// Gleicher Rechtstext wie in allen Apps (übernommen aus „Die Redezeichen-Helden“), nur Name der App und des Codes angepasst;
// die Schriften-Zeile entfällt, weil die Zeitreise keine Schriftdateien mitliefert. Änderungen nur nach Freigabe der Lehrkraft.
// Erreichbar ohne Passwort: Fußzeile und Link im Lehrer-Bereich. section = 'datenschutz' springt zum Abschnitt „Datenschutz“.
const IMPRESSUM_EMAIL = 'p.brandsch@ggs-roesrath.de';
const GITHUB_PRIVACY_URL = 'https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement';

function ImpressumModal({ onClose, section }) {
  const datenschutzRef = useRef(null);
  useEffect(() => { if (section === 'datenschutz' && datenschutzRef.current) datenschutzRef.current.scrollIntoView({ block: 'start' }); }, [section]);
  const Mail = () => <a href={`mailto:${IMPRESSUM_EMAIL}`} className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200 break-all">{IMPRESSUM_EMAIL}</a>;
  const H2 = ({ children, innerRef }) => <h4 ref={innerRef} className="text-xl font-bold text-amber-200 mt-6 mb-2 scroll-mt-2">{children}</h4>;
  const H3 = ({ children }) => <h5 className="font-bold text-slate-100 mt-4 mb-1">{children}</h5>;
  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[250] flex items-center justify-center p-4">
      <div className="bg-slate-900 border-4 border-slate-500 rounded-3xl max-w-2xl w-full shadow-[0_0_40px_rgba(148,163,184,0.25)] anim-pop relative flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-start gap-4 p-5 md:p-6 pb-3 border-b-2 border-slate-800">
          <div className="text-left">
            <h3 className="text-2xl md:text-3xl font-bold text-white">Impressum &amp; Datenschutz</h3>
            <p className="text-slate-400 italic">Infos für Erwachsene</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full p-2 transition-colors flex-shrink-0">✕</button>
        </div>

        <div className="overflow-y-auto px-5 md:px-6 pb-6 text-left text-slate-300 leading-relaxed">
          <H2>Impressum</H2>
          <p>Angaben gemäß § 18 Abs. 1 Medienstaatsvertrag (MStV)</p>
          <p className="mt-3">Peter Brandsch<br />Sandweg 13<br />51503 Rösrath</p>
          <p className="mt-3">E-Mail: <Mail /></p>
          <p className="mt-3">Die Zeitreise ist ein kostenloses Lernangebot ohne Werbung.</p>

          <H3>Haftung für Inhalte</H3>
          <p>Die Inhalte dieser App wurden mit großer Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann ich jedoch keine Gewähr übernehmen. Hinweise auf Fehler nehme ich gern per E-Mail entgegen.</p>

          <H3>Urheberrecht und Lizenzen</H3>
          <p>
            Texte, Aufgaben, Figuren und Gestaltung der App: © 2026 Peter Brandsch.<br />
            Verwendete Bausteine anderer Urheber:<br />
            – Symbole: Lucide (ISC-Lizenz)<br />
            – React (MIT-Lizenz), Tailwind CSS (MIT-Lizenz), qrcode-generator (MIT-Lizenz)
          </p>

          <H2 innerRef={datenschutzRef}>Datenschutz</H2>

          <H3>1. Verantwortlich</H3>
          <p>Peter Brandsch, Sandweg 13, 51503 Rösrath, E-Mail: <Mail /></p>

          <H3>2. Das Wichtigste in Kürze</H3>
          <p>Die App funktioniert ohne Anmeldung und ohne Namen. Sie setzt keine Cookies, speichert nichts im Browser und verwendet keine Analyse-, Werbe- oder Trackingdienste. Der Spielstand besteht nur, solange die Seite geöffnet ist. Der Zeitreise-Code wird ausschließlich auf dem Gerät angezeigt und eingegeben. Er wird nicht an mich oder an Dritte übertragen. Schriften und Gestaltungsdateien werden direkt mit der App ausgeliefert, es werden keine Verbindungen zu Google oder anderen Drittanbietern aufgebaut.</p>

          <H3>3. Bereitstellung über GitHub Pages</H3>
          <p>Die App wird über GitHub Pages bereitgestellt, einen Dienst der GitHub Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA. Beim Aufruf der App verarbeitet GitHub technisch notwendige Daten, insbesondere die IP-Adresse, Datum und Uhrzeit des Abrufs sowie Angaben zum verwendeten Browser. Dies ist erforderlich, um die Seite auszuliefern und ihre Sicherheit zu gewährleisten. Dabei können Daten in die USA übermittelt werden. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Mein berechtigtes Interesse liegt in einer sicheren und zuverlässigen Bereitstellung der App. Ich selbst erhalte keine Zugriffsdaten und werte keine aus. Weitere Informationen: Datenschutzerklärung von GitHub (<a href={GITHUB_PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200 break-all">{GITHUB_PRIVACY_URL}</a>).</p>

          <H3>4. Deine Rechte</H3>
          <p>Du hast das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18) und Widerspruch (Art. 21). Wende dich dazu an die oben genannte E-Mail-Adresse. Außerdem kannst du dich bei einer Datenschutz-Aufsichtsbehörde beschweren, in Nordrhein-Westfalen bei der Landesbeauftragten für Datenschutz und Informationsfreiheit NRW (LDI NRW).</p>

          <p className="mt-6 text-slate-400">Stand: September 2026</p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ERKUNDE DIE ZEITEN – Werkzeug ohne Sterne (Zeit-Schieberegler)
// ==========================================
// Ein Satz steht groß in der Mitte; ein Regler auf dem Zeitstrahl verwandelt ihn (Präteritum · Perfekt · Präsens · Futur,
// Stufe 3: Präteritum · Präsens · Futur). Was sich ändert, leuchtet in der Zeitfarbe; das zweite Verb gleitet ans Satzende.
// Bei jedem Wechsel ein Beam durch die Zeit IN der Satz-Tafel (ca. 1,1 s, kein Vollbild): der Satz löst sich auf, Lichtstrahlen
// schießen aus der Mitte, ein Lichtband fährt in Reiserichtung durch (← Vergangenheit, → Zukunft), Blitz, der Satz in der neuen
// Zeitform setzt sich wieder zusammen. Aus mit ?anim=0 / Lehrer-Bereich / „Bewegung reduzieren“. Bedienung auch mit großen Pfeil-Knöpfen (digitale Tafel, iPad). Nicht im Zeitreise-Code.
const ERKUNDEN_ZEITEN = { 3: ['praeteritum', 'praesens', 'futur'], 4: ['praeteritum', 'perfekt', 'praesens', 'futur'] };
const BEAM_RGB = { praesens: '251,113,133', praeteritum: '251,191,36', perfekt: '163,230,53', futur: '56,189,248' };
const BEAM_AUS = 650, BEAM_DAUER = 1700;   // ms: Satz wechselt (mitten im Tunnel) · ganzer Beam
// Lichtstrahlen aus der Mitte (feste Werte, damit es bei jedem Sprung gleich ruhig aussieht)
const BEAM_STRAHLEN = Array.from({ length: 36 }, (_, i) => ({ winkel: i * 10 + (i % 3) * 3, laenge: 14 + (i * 37) % 26, verz: 0.15 + ((i * 53) % 35) / 100, dicke: i % 4 === 0 ? 3 : 2, weiss: i % 3 === 0 }));

function ErkundeZeiten({ stufe, anim, onZurueck }) {
  const zeiten = ERKUNDEN_ZEITEN[stufe];
  const [art, setArt] = useState(() => zufall(['r', 'u']));
  const rahmenListe = (a) => rahmenDerStufe(stufe).filter(r => verbByGrundform[r.v].art === a && r.v !== 'werden');
  const [rahmen, setRahmen] = useState(() => zufall(rahmenListe(art)));
  const erlaubtePersonen = (r) => (r.wer || [0, 1, 2, 3, 4, 5]);
  const [person, setPerson] = useState(() => zufall(erlaubtePersonen(rahmen)));
  const [n] = useState(() => Math.floor(Math.random() * 6));
  const [zi, setZi] = useState(zeiten.indexOf('praesens'));        // Zeitform, in der der Satz gerade steht
  const [ziel, setZiel] = useState(zeiten.indexOf('praesens'));    // Stellung des Reglers (springt sofort)
  const [beam, setBeam] = useState(null);              // { zaehler, richtung, zeit, phase: 'aus' | 'ein' }
  const [angekommen, setAngekommen] = useState(false);   // Satz kam per Beam → danach nicht noch einmal einblenden
  const uhren = useRef([]);
  useEffect(() => () => uhren.current.forEach(clearTimeout), []);
  const zeit = zeiten[zi];
  const zeigeAnim = anim && !bewegungReduziert();

  const wechsle = (neu) => {
    if (neu < 0 || neu >= zeiten.length || neu === ziel) return;
    setZiel(neu);
    if (!zeigeAnim) { setZi(neu); return; }
    uhren.current.forEach(clearTimeout);
    setBeam(b => ({ zaehler: (b?.zaehler || 0) + 1, richtung: neu < ziel ? 'rueck' : 'vor', zeit: zeiten[neu], phase: 'aus' }));
    uhren.current = [
      setTimeout(() => { setZi(neu); setAngekommen(true); setBeam(b => b && { ...b, phase: 'ein' }); }, BEAM_AUS),
      setTimeout(() => setBeam(null), BEAM_DAUER),
    ];
  };
  const andererSatz = (a = art) => {
    const liste = rahmenListe(a).filter(r => r !== rahmen);
    const r = zufall(liste.length ? liste : rahmenListe(a));
    setAngekommen(false);
    setRahmen(r);
    if (!erlaubtePersonen(r).includes(person)) setPerson(zufall(erlaubtePersonen(r)));
  };
  const anderePerson = () => {
    const liste = erlaubtePersonen(rahmen).filter(p => p !== person);
    if (liste.length) { setAngekommen(false); setPerson(zufall(liste)); }
  };
  // Präteritum-Formen wie „du aßest“ kommen nicht vor → dann Person wechseln
  const p = satzErlaubt(rahmen, person, zeit) ? person : erlaubtePersonen(rahmen).find(x => satzErlaubt(rahmen, x, zeit));
  const satz = baueSatz(rahmen, p, zeit, n);
  const v = verbByGrundform[rahmen.v];
  const Z = ZEITEN[zeit];

  // Satz zeichnen: Präsens/Präteritum mit Wortstamm + Endung (regelmäßig) bzw. ganzem Verb in Zeitfarbe; Perfekt/Futur als Verbklammer
  let anzeige;
  if (zeit === 'perfekt' || zeit === 'futur') {
    anzeige = <Klammersatz zeit={zeit} teile={satz.teile.map(x => ({ t: x.t, k: x.rolle === 'hv' || x.rolle === 'zweites' }))} />;
  } else {
    const f = (zeit === 'praesens' ? praesens(v) : praeteritum(v))[p];
    anzeige = (
      <span>
        {satz.teile.map((x, i) => (
          <React.Fragment key={i}>
            {i > 0 && ' '}
            {x.rolle === 'verb'
              ? (v.art === 'r' && f.stamm !== undefined ? <Wortform stamm={f.stamm} endung={f.endung} zeit={zeit} /> : <b className={Z.text}>{x.t}</b>)
              : x.t}
          </React.Fragment>
        ))}.
      </span>
    );
  }

  const pfeil = 'w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-900/80 border-2 border-sky-400/60 text-sky-200 hover:bg-sky-500 hover:text-sky-950 flex items-center justify-center active:scale-95 disabled:opacity-30 disabled:hover:bg-slate-900/80 disabled:hover:text-sky-200 flex-shrink-0';
  const knopf = 'flex items-center gap-2 bg-slate-900/80 border-2 border-slate-600 hover:border-sky-400 text-slate-100 font-bold py-3 px-4 rounded-xl active:scale-95';
  return (
    <div className="space-y-6">
      <p className="text-slate-300 text-center md:text-lg">Schiebe den Regler oder tippe auf die Pfeile. Dann reist der Satz durch die Zeit.</p>
      {/* Satz-Tafel mit Beam durch die Zeit */}
      <div className="relative">
        {beam && (() => {
          const rgb = BEAM_RGB[beam.zeit];
          return (<>
            {/* Leuchten um die Tafel */}
            <div key={'g' + beam.zaehler} className="absolute -inset-1 rounded-2xl pointer-events-none beam-glow" style={{ boxShadow: `0 0 36px 10px rgba(${rgb},0.75), inset 0 0 24px rgba(${rgb},0.6)` }} aria-hidden="true" />
            <div key={'b' + beam.zaehler} className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-10" aria-hidden="true">
              {/* Die Tafel wird kurz zum dunklen Zeittunnel */}
              <div className="absolute inset-0 beam-nacht" style={{ background: `radial-gradient(circle at 50% 55%, rgba(${rgb},0.45), #020617 70%)` }} />
              {/* Wirbel: zwei Lichtfächer drehen sich gegeneinander → Sog in die Tiefe */}
              {[0, 1].map(i => (
                <div key={'w' + i} className="absolute left-1/2 top-[55%] w-[170%] aspect-square -translate-x-1/2 -translate-y-1/2">
                  <div className={`w-full h-full rounded-full ${(beam.richtung === 'vor') === (i === 0) ? 'beam-wirbel-rechts' : 'beam-wirbel-links'}`}
                    style={{
                      background: `repeating-conic-gradient(from ${i * 9}deg, rgba(${rgb},0) 0deg, rgba(${rgb},${i ? 0.35 : 0.6}) 7deg, rgba(255,255,255,${i ? 0.2 : 0.45}) 10deg, rgba(${rgb},0) 18deg)`,
                      WebkitMaskImage: 'radial-gradient(circle, transparent 3%, black 16%, black 34%, transparent 62%)',
                      maskImage: 'radial-gradient(circle, transparent 3%, black 16%, black 34%, transparent 62%)',
                    }} />
                </div>
              ))}
              {/* Ringe fliegen aus der Tiefe auf uns zu (Flug durch den Tunnel) */}
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={'r' + i} className="absolute left-1/2 top-[55%] w-[45%] aspect-square -translate-x-1/2 -translate-y-1/2">
                  <div className="w-full h-full rounded-full beam-ring" style={{ animationDelay: `${0.05 + i * 0.12}s`, border: `3px solid rgba(${rgb},0.9)`, boxShadow: `0 0 14px rgba(${rgb},0.9), inset 0 0 14px rgba(${rgb},0.7)` }} />
                </div>
              ))}
              {/* Lichtstrahlen aus der Mitte */}
              <div className="absolute left-1/2 top-[55%]">
                {BEAM_STRAHLEN.map((st, i) => (
                  <div key={i} className="absolute left-0 top-0" style={{ transform: `rotate(${st.winkel}deg)`, transformOrigin: '0 0' }}>
                    <div className="beam-strahl" style={{ width: `${st.laenge}vmin`, height: st.dicke, animationDelay: `${st.verz}s`, background: st.weiss ? 'linear-gradient(90deg, rgba(255,255,255,0), #fff)' : `linear-gradient(90deg, rgba(${rgb},0), rgba(${rgb},1) 60%, #fff)`, boxShadow: `0 0 6px rgba(${rgb},0.9)` }} />
                  </div>
                ))}
              </div>
              {/* Lichtschein in der Mitte des Tunnels */}
              <div className="absolute left-1/2 top-[55%] w-40 h-40 -translate-x-1/2 -translate-y-1/2">
                <div className="w-full h-full rounded-full beam-kern" style={{ background: `radial-gradient(circle, rgba(255,255,255,0.95), rgba(${rgb},0.6) 35%, rgba(${rgb},0) 70%)` }} />
              </div>
              {/* Blitz beim Ankommen */}
              <div className="absolute inset-0 beam-blitz" style={{ background: `radial-gradient(circle at 50% 55%, rgba(255,255,255,0.95), rgba(${rgb},0.55) 40%, rgba(${rgb},0) 75%)` }} />
            </div>
            {/* Große Uhr in der Mitte: Zifferblatt mit 12 Strichen, Zeiger drehen rückwärts (Vergangenheit) oder vorwärts (Zukunft) */}
            <div key={'u' + beam.zaehler} className="absolute left-1/2 top-[55%] z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
              <div className="w-24 h-24 md:w-32 md:h-32 beam-uhr" style={{ filter: `drop-shadow(0 0 12px rgba(${rgb},0.95))` }}>
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="46" fill="#020617" fillOpacity="0.85" stroke={`rgb(${rgb})`} strokeWidth="5" />
                  <circle cx="50" cy="50" r="39" fill="none" stroke={`rgba(${rgb},0.35)`} strokeWidth="1.5" />
                  {Array.from({ length: 12 }, (_, i) => (
                    <line key={i} x1="50" y1={i % 3 === 0 ? 8 : 10} x2="50" y2={i % 3 === 0 ? 19 : 15} stroke={i % 3 === 0 ? '#fff' : `rgb(${rgb})`} strokeWidth={i % 3 === 0 ? 4 : 2.5} strokeLinecap="round" transform={`rotate(${i * 30} 50 50)`} />
                  ))}
                  <g className={beam.richtung === 'rueck' ? 'beam-stunde-rueck' : 'beam-stunde-vor'} style={{ transformOrigin: '50px 50px' }}>
                    <line x1="50" y1="50" x2="50" y2="30" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" />
                  </g>
                  <g className={beam.richtung === 'rueck' ? 'beam-minute-rueck' : 'beam-minute-vor'} style={{ transformOrigin: '50px 50px' }}>
                    <line x1="50" y1="56" x2="50" y2="17" stroke={`rgb(${rgb})`} strokeWidth="3.5" strokeLinecap="round" />
                  </g>
                  <circle cx="50" cy="50" r="5" fill="#fff" stroke={`rgb(${rgb})`} strokeWidth="2" />
                </svg>
              </div>
            </div>
          </>);
        })()}
        <Leuchttafel zeit={zeit} titel={`${v.g} · ${v.art === 'r' ? 'regelmäßig' : 'unregelmäßig'}`}>
          <p key={`${zeit}-${rahmen.v}-${p}`} className={`text-2xl md:text-4xl font-semibold text-center py-8 md:py-12 text-slate-900 leading-snug ${beam?.phase === 'aus' ? 'beam-aus' : beam?.phase === 'ein' ? 'beam-ein' : zeigeAnim && !angekommen ? 'anim-ein' : ''}`}>{anzeige}</p>
        </Leuchttafel>
      </div>

      {/* Regler auf dem Zeitstrahl */}
      {/* Auf schmalen Bildschirmen stehen die Pfeile unter dem Regler, damit die Zeitformen Platz haben */}
      <div className="flex items-center gap-3 md:gap-5">
        <button onClick={() => wechsle(ziel - 1)} disabled={ziel === 0} className={`${pfeil} hidden md:flex`} aria-label="Weiter in die Vergangenheit"><ArrowRight className="w-9 h-9 rotate-180" /></button>
        <div className="flex-1">
          <input type="range" min="0" max={zeiten.length - 1} step="1" value={ziel} onChange={e => wechsle(Number(e.target.value))}
            aria-label="Zeitform" className="w-full h-3 accent-sky-400 cursor-pointer" />
          <div className="grid mt-2" style={{ gridTemplateColumns: `repeat(${zeiten.length}, minmax(0, 1fr))` }}>
            {zeiten.map((z, i) => (
              <button key={z} onClick={() => wechsle(i)} className={`text-center rounded-lg py-1 ${i === ziel ? 'bg-slate-800' : ''}`}>
                <span className={`block font-black text-xs sm:text-sm md:text-lg ${{ praesens: 'text-rose-300', praeteritum: 'text-amber-300', perfekt: 'text-lime-300', futur: 'text-sky-300' }[z]}`}>{ZEITEN[z].name}</span>
                {/* deutsche Bedeutung unter dem Fachwort (Wunsch der Lehrkraft 20.11.2026), Zusatz „beim Schreiben/Erzählen“ kleiner darunter */}
                <span className="block text-[11px] md:text-sm text-slate-200 font-semibold leading-tight mt-0.5 px-0.5">{ZEITEN[z].deutsch.replace(/ \(.*\)$/, '').replace('Vergangenheit', 'Vergangen­heit')}</span>
                {/\(/.test(ZEITEN[z].deutsch) && <span className="block text-[10px] md:text-xs text-slate-400 leading-tight">{ZEITEN[z].deutsch.match(/\((.*)\)/)[1]}</span>}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => wechsle(ziel + 1)} disabled={ziel === zeiten.length - 1} className={`${pfeil} hidden md:flex`} aria-label="Weiter in die Zukunft"><ArrowRight className="w-9 h-9" /></button>
      </div>
      <div className="flex md:hidden justify-between">
        <button onClick={() => wechsle(ziel - 1)} disabled={ziel === 0} className={pfeil} aria-label="Weiter in die Vergangenheit"><ArrowRight className="w-9 h-9 rotate-180" /></button>
        <button onClick={() => wechsle(ziel + 1)} disabled={ziel === zeiten.length - 1} className={pfeil} aria-label="Weiter in die Zukunft"><ArrowRight className="w-9 h-9" /></button>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={() => andererSatz()} className={knopf}><Shuffle className="w-5 h-5" /> Anderer Satz</button>
        <button onClick={anderePerson} className={knopf}><Users className="w-5 h-5" /> Anderes Personalpronomen</button>
        <button onClick={() => { const a = art === 'r' ? 'u' : 'r'; setArt(a); andererSatz(a); }} className={knopf}>
          <BookA className="w-5 h-5" /> {art === 'r' ? 'Unregelmäßiges Verb' : 'Regelmäßiges Verb'}
        </button>
      </div>
      <div className="text-center">
        <button onClick={onZurueck} className="text-slate-400 hover:text-white font-bold uppercase tracking-wider text-sm">Zurück zur Karte</button>
      </div>
    </div>
  );
}

// ==========================================
// ZEITSPRUNG – Animation beim Wechsel der Zeitzone (Karte → Spiel)
// ==========================================
// Öffnet ein Kind ein Spiel in einer anderen Zone (JETZT → FRÜHER → SPÄTER), fliegt es ca. 1 Sekunde durch einen
// Zeittunnel in der Zeitfarbe; die Uhr dreht rückwärts (Vergangenheit) oder vorwärts (Zukunft). Antippen überspringt.
// Aus mit ?anim=0, im Lehrer-Bereich oder über die Systemeinstellung „Bewegung reduzieren“.
const ZEITSPRUNG_DAUER = 1300;
const ZEITSPRUNG_ZIEL = {
  frueher: { text: 'Zeitsprung in die Vergangenheit!', richtung: 'rueck' },
  jetzt:   { text: 'Zurück ins Jetzt!',                richtung: 'vor' },
  spaeter: { text: 'Zeitsprung in die Zukunft!',       richtung: 'vor' },
  finale:  { text: 'Ab in die Zeitmaschine!',          richtung: 'vor' },
};
const ZEITSPRUNG_FARBE = {
  praesens:    { ring: 'border-rose-400',   text: 'text-rose-300',   glow: 'shadow-[0_0_60px_rgba(251,113,133,0.6)]' },
  grenze:      { ring: 'border-orange-300', text: 'text-orange-200', glow: 'shadow-[0_0_60px_rgba(251,146,60,0.6)]' },
  praeteritum: { ring: 'border-amber-400',  text: 'text-amber-300',  glow: 'shadow-[0_0_60px_rgba(251,191,36,0.6)]' },
  perfekt:     { ring: 'border-lime-400',   text: 'text-lime-300',   glow: 'shadow-[0_0_60px_rgba(163,230,53,0.6)]' },
  futur:       { ring: 'border-sky-400',    text: 'text-sky-300',    glow: 'shadow-[0_0_60px_rgba(56,189,248,0.6)]' },
  finale:      { ring: 'border-cyan-300',   text: 'text-cyan-200',   glow: 'shadow-[0_0_60px_rgba(34,211,238,0.6)]' },
};
const bewegungReduziert = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Zeitsprung({ sprung, onFertig }) {
  const ziel = ZEITSPRUNG_ZIEL[sprung.zone], f = ZEITSPRUNG_FARBE[sprung.farbe];
  useEffect(() => { const t = setTimeout(onFertig, ZEITSPRUNG_DAUER); return () => clearTimeout(t); }, []);
  return (
    <div onClick={onFertig} role="button" aria-label="Weiter" className="fixed inset-0 z-[400] bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer zs-blende">
      <div className="relative flex flex-col items-center gap-5 zs-mitte">
        {/* Uhr mit den Schallwellen-Ringen: Ringe sitzen genau um die Uhr (nicht um Uhr + Text) */}
        <div className="relative w-28 h-28 md:w-36 md:h-36">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className={`absolute w-40 h-40 md:w-56 md:h-56 rounded-full border-4 ${f.ring} ${f.glow} zs-ring`} style={{ animationDelay: `${i * 0.14}s` }} />
            ))}
          </div>
          <div className={`relative w-full h-full rounded-full border-4 ${f.ring} ${f.glow} bg-slate-950 flex items-center justify-center`}>
            {/* Zeiger: unteres Ende genau in der Mitte (left = 50 % minus halbe Zeigerbreite) */}
            <div className={`absolute left-[calc(50%-3px)] w-1.5 h-10 md:h-14 rounded-full bg-current ${f.text} origin-bottom bottom-1/2 ${ziel.richtung === 'rueck' ? 'zs-zeiger-rueck' : 'zs-zeiger-vor'}`} />
            <div className={`absolute left-[calc(50%-3px)] w-1.5 h-7 md:h-9 rounded-full bg-current ${f.text} origin-bottom bottom-1/2 ${ziel.richtung === 'rueck' ? 'zs-zeiger-rueck-langsam' : 'zs-zeiger-vor-langsam'}`} />
            <div className={`w-4 h-4 rounded-full bg-current ${f.text}`} />
          </div>
        </div>
        <p className={`text-2xl md:text-4xl font-black uppercase tracking-wider text-center px-4 ${f.text}`}>{ziel.text}</p>
      </div>
    </div>
  );
}

// ==========================================
// ARBEITSBLÄTTER (Etappe 2, Teil 1 – 21.11.2026; A4 hoch, Druck über den Browser, auch in Schwarz-Weiß)
// ==========================================
// Vorbild Technik: Redezeichen-Helden (BlattStudio) und „Erkennen und Zerlegen“. Zugang: blasses Drucker-Symbol oben
// neben dem Zahnrad (ohne Passwort) und Knopf „Arbeitsblätter“ im Lehrer-Bereich.
// Alle Aufgaben kommen aus denselben Datenlisten wie die Spiele (VERBEN, SATZRAHMEN/baueSatz, TEXTE, FAMILIEN) –
// nie fertige Sätze abtippen. Zufall nur über neuerZufall(Nummer …), nicht Math.random: dieselbe Nummer erzeugt
// dasselbe Blatt wieder (steht in der Fußzeile, auch auf der Lösung).
// Jedes Blatt: Name/Datum, Symbol, Titel, kleiner Aufgabentext für die Lehrkraft, erste Aufgabe als gelöstes Beispiel
// (gestrichelt, Stern), Lösungsblatt in Violett. Lineatur, wo geschrieben wird: Klasse 3 Zebra-Lineatur ohne Häuschen,
// Klasse 4 einfache Linien. Zeitformen in den App-Farben, aber immer auch mit Namen beschriftet (Schwarz-Weiß).
// Fachwörter wie in der App: „ge-Form“ statt „Partizip“.

const sheetStyles = `
  .sheet-page { width: 210mm; height: 297mm; padding: 11mm 14mm 0; background: #fff; color: #111827; box-sizing: border-box; position: relative; overflow: hidden; font-family: ui-sans-serif, system-ui, 'Segoe UI', Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .sheet-page * { box-sizing: border-box; }
  @media print {
    @page { size: A4 portrait; margin: 0; }
    html, body { background: #fff !important; }
    .no-print { display: none !important; }
    .sheet-studio { position: static !important; inset: auto !important; overflow: visible !important; background: #fff !important; padding: 0 !important; display: block !important; }
    .sheet-scroll { overflow: visible !important; padding: 0 !important; background: #fff !important; }
    .sheet-huelle { width: auto !important; height: auto !important; margin: 0 !important; }
    .sheet-scale { transform: none !important; margin: 0 !important; width: auto !important; height: auto !important; gap: 0 !important; }
    .sheet-scale > div { box-shadow: none !important; }
    .sheet-page { box-shadow: none !important; margin: 0 !important; break-after: page; page-break-after: always; }
    .sheet-scale > div:last-child .sheet-page { break-after: auto; page-break-after: auto; }
  }
`;

// ---------- Farben und Maße ----------
const BF = { ink: '#111827', grau: '#6b7280', hell: '#d1d5db', sol: '#7c3aed', bsp: '#374151', zebra: '#e5e7eb' };
const ZF = {   // Zeitfarben wie in der App (Tafelmaterial der Schule), für Papier
  praesens:    { rand: '#e11d48', flaeche: '#ffe4e6', text: '#9f1239' },
  praeteritum: { rand: '#d97706', flaeche: '#fef3c7', text: '#92400e' },
  perfekt:     { rand: '#65a30d', flaeche: '#ecfccb', text: '#3f6212' },
  futur:       { rand: '#0284c7', flaeche: '#e0f2fe', text: '#075985' },
};
const bm = (v) => `${Math.round(v * 100) / 100}mm`;

// ---------- Zufall mit Startwert ----------
function zufallsGenerator(text) {
  let h = 2166136261;
  for (const ch of String(text)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function neuerZufall(text) {
  const rnd = zufallsGenerator(text);
  const mix = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  return { rnd, mix, pick };
}
const neueNummer = () => String(1000 + Math.floor(Math.random() * 9000));

// ---------- Bausteine ----------
function SternIcon({ size = 5.4 }) {
  return <svg viewBox="0 0 24 24" style={{ width: bm(size), height: bm(size), display: 'block', flexShrink: 0 }}><path d="M12 2.5l2.9 6.2 6.6.7-5 4.5 1.4 6.6L12 17.2 6.1 20.5l1.4-6.6-5-4.5 6.6-.7z" fill="#facc15" stroke="#a16207" strokeWidth="1.4" strokeLinejoin="round" /></svg>;
}
function NrKreis({ n, bsp }) {
  if (bsp) return <span style={{ width: '6mm', flexShrink: 0, display: 'flex', justifyContent: 'center' }}><SternIcon /></span>;
  return <span style={{ width: '6mm', height: '6mm', borderRadius: '50%', flexShrink: 0, border: `0.35mm solid ${BF.ink}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.2mm', fontWeight: 700 }}>{n}</span>;
}
function BspRahmen({ children, stil = {} }) {
  return (
    <div style={{ border: '0.45mm dashed #6b7280', borderRadius: '2.5mm', padding: '1.6mm 2.5mm', position: 'relative', ...stil }}>
      <span style={{ position: 'absolute', top: '-2mm', left: '9mm', background: '#fff', padding: '0 1mm', fontSize: '2.6mm', fontWeight: 700, color: BF.grau, lineHeight: 1.2 }}>Beispiel</span>
      {children}
    </div>
  );
}
function Ankreuz({ an, farbe = BF.sol, label, zeit }) {
  const Z = zeit && ZF[zeit];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1.2mm', fontSize: '3.3mm', fontWeight: 700, whiteSpace: 'nowrap', color: Z ? Z.text : BF.ink }}>
      <span style={{ width: '4.6mm', height: '4.6mm', border: `0.4mm solid ${Z ? Z.rand : BF.ink}`, background: Z ? Z.flaeche : '#fff', borderRadius: '1mm', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {an && <svg viewBox="0 0 10 10" style={{ width: '90%', height: '90%' }}><path d="M1.5 1.5 L8.5 8.5 M8.5 1.5 L1.5 8.5" stroke={farbe} strokeWidth="1.8" strokeLinecap="round" /></svg>}
      </span>
      {label}
    </span>
  );
}
// Schreibzeile: Klasse 3 Zebra-Lineatur ohne Häuschen (Oberband, graues Mittelband, Unterband), Klasse 4 einfache Linie.
// text = Lösung oder Beispiel (steht auf der Grundlinie)
function Schreibzeile({ klasse, text = null, farbe = BF.sol, breite = null, band = 3.4, groesse = null, wachsen = true, einzug = 1.5 }) {
  const fs = groesse || (klasse === 3 ? band * 1.85 : 5);
  const stil = { position: 'relative', flex: breite || !wachsen ? 'none' : 1, width: breite ? bm(breite) : wachsen ? undefined : '100%', minWidth: 0 };
  if (klasse === 3) {
    return (
      <span style={{ ...stil, display: 'inline-block', height: bm(band * 3), verticalAlign: 'bottom' }}>
        <span style={{ position: 'absolute', left: 0, right: 0, top: bm(band), height: bm(band), background: BF.zebra }} />
        {[0, 1, 2, 3].map(i => <span key={i} style={{ position: 'absolute', left: 0, right: 0, top: bm(i * band), borderTop: `${i === 2 ? 0.35 : 0.2}mm solid ${i === 2 ? '#4b5563' : '#9ca3af'}` }} />)}
        {text && <span style={{ position: 'absolute', left: bm(einzug), bottom: bm(band - fs * 0.2), fontSize: bm(fs), lineHeight: 1, fontWeight: 600, color: farbe, whiteSpace: 'nowrap' }}>{text}</span>}
      </span>
    );
  }
  return (
    <span style={{ ...stil, display: 'inline-block', height: '9mm', borderBottom: '0.3mm solid #4b5563', verticalAlign: 'bottom' }}>
      {text && <span style={{ position: 'absolute', left: bm(einzug), bottom: '0.9mm', fontSize: bm(fs), lineHeight: 1, fontWeight: 600, color: farbe, whiteSpace: 'nowrap' }}>{text}</span>}
    </span>
  );
}
// Zeitform-Etikett (Farbe + Name, auch in Schwarz-Weiß lesbar)
function ZeitEtikett({ zeit, klein = false }) {
  const Z = ZF[zeit];
  return <span style={{ display: 'inline-block', border: `0.4mm solid ${Z.rand}`, background: Z.flaeche, color: Z.text, borderRadius: '1.2mm', padding: klein ? '0 1.2mm' : '0.4mm 1.8mm', fontSize: klein ? '2.7mm' : '3.4mm', fontWeight: 800, whiteSpace: 'nowrap' }}>{ZEITEN[zeit].name}</span>;
}
function BlattKopf({ Icon, titel, text, loesung }) {
  return (
    <div style={{ marginBottom: '5mm' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8mm', fontSize: '3.6mm', marginBottom: '3mm' }}>
        <span style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5mm' }}>Name:<span style={{ display: 'inline-block', width: '62mm', borderBottom: `0.3mm solid ${BF.ink}` }} /></span>
        <span style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5mm' }}>Datum:<span style={{ display: 'inline-block', width: '30mm', borderBottom: `0.3mm solid ${BF.ink}` }} /></span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4mm' }}>
        <span style={{ width: '17mm', height: '17mm', borderRadius: '50%', border: `0.7mm solid ${BF.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon style={{ width: '10mm', height: '10mm' }} strokeWidth={1.8} /></span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '8.5mm', fontWeight: 800, lineHeight: 1.05 }}>{titel}{loesung && <span style={{ color: BF.sol }}> – Lösung</span>}</div>
          <div style={{ fontSize: '3.4mm', color: '#4b5563', marginTop: '1mm' }}>{text}</div>
        </div>
      </div>
    </div>
  );
}
function BlattSeite({ fuss, nr, seite, children }) {
  return (
    <div className="sheet-page">
      <div className="sheet-inhalt" style={{ height: '274mm', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>{children}</div>
      <div style={{ position: 'absolute', left: '14mm', right: '14mm', bottom: '6mm', borderTop: `0.3mm solid ${BF.hell}`, paddingTop: '1.4mm', display: 'flex', justifyContent: 'space-between', fontSize: '2.8mm', color: BF.grau }}>
        <span>Zeitreise – Zeitformen der Verben · {fuss}</span><span>Nr. {nr}</span><span>{seite}</span>
      </div>
    </div>
  );
}
// Stamm schwarz unterstrichen (wie in der App), Endung je nach Zustand
// Person mit Hinweis wie in der App: „sie (viele)“
const PersonText = ({ p }) => p === 5 ? <>sie <span style={{ fontSize: '0.6em', color: BF.grau, fontWeight: 500 }}>(viele)</span></> : PERSONEN[p];
const StammUnter = ({ children }) => <span style={{ borderBottom: `0.5mm solid ${BF.ink}`, paddingBottom: '0.3mm' }}>{children}</span>;

// ---------- Blatttypen ----------
const BLATT_TYPEN = {
  formen:    { titel: 'Formen-Tabelle', Icon: TableProperties, text: (k) => `Schreibe die Formen mit „ich“ in die Tabelle${k === 4 ? ' (Präsens, Präteritum, Perfekt und Futur)' : ' (Präsens und Präteritum)'}. Wie in der Prüfung.` },
  endungen:  { titel: 'Endungen einsetzen', Icon: Cog, text: () => 'Setze die passende Endung ein und kreise sie ein. Der Wortstamm ist unterstrichen. Über jedem Wort steht die Zeitform.', option: 'endZeit' },
  personal:  { titel: 'Personalformen', Icon: Users, text: () => 'Schreibe das Verb für alle Personen im Präsens und im Präteritum auf. Graue Formen stehen schon da.' },
  luecken:   { titel: 'Lückentext', Icon: ScrollText, text: () => 'Setze das Verb aus der Klammer in der angegebenen Zeitform ein.', option: 'lueckZeit' },
  bestimmen: { titel: 'Zeitform bestimmen', Icon: Search, text: (k) => `Unterstreiche das Verb${k === 4 ? ' (beide Teile)' : ''} und kreuze die Zeitform an.` },
  familien:  { titel: 'Verb-Familien', Icon: House, text: () => 'Schreibe jedes Verbpaar in das Haus seiner Familie. Streiche es im Kasten durch.' },
};
const BLATT_GRUPPEN = [
  { titel: 'Formen bilden', typen: ['formen', 'endungen', 'personal'] },
  { titel: 'Texte und Sätze', typen: ['luecken', 'bestimmen'] },
  { titel: 'Unregelmäßige Verben', typen: ['familien'] },
];
const BLATT_OPTIONEN = {
  endZeit: { label: 'Zeitform', werte: () => [['praesens', 'Präsens'], ['praeteritum', 'Präteritum'], ['gemischt', 'gemischt']] },
  lueckZeit: { label: 'Zeitform der Lücken', werte: (k) => [['praesens', 'Präsens'], ['praeteritum', 'Präteritum'], ...(k === 4 ? [['perfekt', 'Perfekt'], ['futur', 'Futur']] : [])] },
};

// 1. Formen-Tabelle wie in der Prüfung (1. Person Singular)
function FormenBlatt({ z, klasse, sol }) {
  const zeiten = klasse === 4 ? ['praesens', 'praeteritum', 'perfekt', 'futur'] : ['praesens', 'praeteritum'];
  const n = klasse === 4 ? 9 : 10;
  const unreg = z.mix(verbenFuer(klasse, v => v.art === 'u' && v.g !== 'werden'));
  const reg = z.mix(verbenFuer(klasse, v => v.art === 'r'));
  const verben = z.mix([...unreg.slice(0, Math.ceil(n * 0.6)), ...reg.slice(0, n - Math.ceil(n * 0.6))]);
  const form = (v, zeit) => zeit === 'praesens' ? praesens(v)[0].text : zeit === 'praeteritum' ? praeteritum(v)[0].text : zeit === 'perfekt' ? perfekt(v)[0].text : futur(v)[0].text;
  const spalteB = klasse === 4 ? 38 : 72;
  const zelle = { borderRight: `0.3mm solid ${BF.hell}`, padding: '1.5mm 2mm', display: 'flex', alignItems: 'flex-end', gap: '1.5mm' };
  return (
    <div style={{ border: `0.4mm solid ${BF.ink}`, borderRadius: '2mm', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', marginBottom: '4mm' }}>
      <div style={{ display: 'flex', borderBottom: `0.4mm solid ${BF.ink}`, background: '#f3f4f6' }}>
        <div style={{ ...zelle, width: '30mm', fontWeight: 800, fontSize: '3.6mm', alignItems: 'center' }}>Grundform</div>
        {zeiten.map(t => <div key={t} style={{ ...zelle, width: bm(spalteB), alignItems: 'center', background: ZF[t].flaeche, borderBottom: `1mm solid ${ZF[t].rand}` }}><span style={{ fontWeight: 800, fontSize: '3.6mm', color: ZF[t].text }}>{ZEITEN[t].name}</span></div>)}
      </div>
      {verben.map((v, i) => {
        const bsp = i === 0, zeig = sol || bsp, farbe = bsp ? BF.bsp : BF.sol;
        return (
          <div key={v.g} style={{ flex: 1, display: 'flex', borderBottom: i < verben.length - 1 ? `0.3mm solid ${BF.hell}` : 'none', ...(bsp ? { outline: '0.45mm dashed #6b7280', outlineOffset: '-1.2mm' } : {}) }}>
            <div style={{ ...zelle, width: '30mm', fontSize: '4.4mm', fontWeight: 700, alignItems: 'center', gap: '2mm' }}>{bsp && <SternIcon size={4.4} />}{v.g}</div>
            {zeiten.map(t => {
              const f = form(v, t), [hv, ...rest] = f.split(' ');
              return (
                <div key={t} style={{ ...zelle, width: bm(spalteB), fontSize: '4mm', ...(klasse === 4 ? { flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-end', gap: '0.5mm' } : {}) }}>
                  {/* Klasse 4: „ich“ über der Linie, damit „bin geschwommen“ Platz hat */}
                  <span style={{ fontWeight: 600, paddingBottom: klasse === 3 ? '3.3mm' : 0, fontSize: klasse === 4 ? '3.4mm' : undefined }}>ich</span>
                  <Schreibzeile klasse={klasse} text={zeig ? (t === 'perfekt' || t === 'futur' ? `${hv} ${rest.join(' ')}` : f) : null} farbe={farbe} band={3.2} groesse={klasse === 4 ? 3.8 : null} wachsen={klasse === 3} einzug={klasse === 4 ? 0.3 : 1.5} />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// 2. Endungen einsetzen (regelmäßige Verben)
function EndungenBlatt({ z, klasse, sol, option }) {
  const verben = z.mix(verbenFuer(klasse, v => v.art === 'r' && (klasse === 4 || !besonderheit(v)) && !(klasse === 3 && v.g === 'putzen')));
  const n = 16;
  const items = Array.from({ length: n }, (_, i) => {
    const v = verben[i % verben.length], p = Math.floor(z.rnd() * 6);
    const zeit = option === 'gemischt' ? (z.rnd() < 0.5 ? 'praesens' : 'praeteritum') : option;
    const f = (zeit === 'praesens' ? praesens(v) : praeteritum(v))[p];
    return { v, p, zeit, f };
  });
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '8mm', rowGap: '5mm' }}>
      {items.map((it, i) => {
        const bsp = i === 0, zeig = sol || bsp, farbe = bsp ? BF.bsp : BF.sol;
        const inhalt = (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5mm' }}>
            <NrKreis n={i} bsp={bsp} />
            <div>
              <div style={{ marginBottom: '1mm' }}><ZeitEtikett zeit={it.zeit} klein /> <span style={{ fontSize: '2.8mm', color: BF.grau }}>({it.v.g})</span></div>
              <div style={{ fontSize: '6mm', fontWeight: 600, display: 'flex', alignItems: 'flex-end', gap: '2mm' }}>
                <span><PersonText p={it.p} /></span>
                <span><StammUnter>{it.f.stamm}</StammUnter></span>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '14mm', height: '9mm', border: zeig ? `0.5mm solid ${farbe}` : '0.4mm dashed #6b7280', borderRadius: zeig ? '50%' : '1.5mm', color: farbe, padding: '0 1.5mm', marginLeft: '-1.5mm' }}>{zeig ? it.f.endung : ''}</span>
              </div>
            </div>
          </div>
        );
        return <div key={i}>{bsp ? <BspRahmen>{inhalt}</BspRahmen> : inhalt}</div>;
      })}
    </div>
  );
}

// 3. Personalformen-Tabelle (Präsens und Präteritum) – zwei Verben
function PersonalBlatt({ z, klasse, sol }) {
  const reg = z.pick(verbenFuer(klasse, v => v.art === 'r' && (klasse === 4 || !besonderheit(v))));
  const unreg = z.pick(verbenFuer(klasse, v => v.art === 'u' && v.g !== 'werden'));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7mm' }}>
      {[reg, unreg].map((v, k) => (
        <div key={v.g} style={{ border: `0.4mm solid ${BF.ink}`, borderRadius: '2mm', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: `0.4mm solid ${BF.ink}`, background: '#f3f4f6' }}>
            <div style={{ width: '34mm', padding: '2mm', fontWeight: 800, fontSize: '5mm' }}>{v.g}</div>
            {['praesens', 'praeteritum'].map(t => <div key={t} style={{ flex: 1, padding: '2mm', background: ZF[t].flaeche, borderLeft: `0.3mm solid ${BF.hell}`, borderBottom: `1mm solid ${ZF[t].rand}`, color: ZF[t].text, fontWeight: 800, fontSize: '3.8mm' }}>{ZEITEN[t].name}</div>)}
          </div>
          {PERSONEN.map((pr, p) => {
            const bsp = k === 0 && p === 0;
            return (
              <div key={pr} style={{ display: 'flex', borderTop: p ? `0.3mm solid ${BF.hell}` : 'none', ...(bsp ? { outline: '0.45mm dashed #6b7280', outlineOffset: '-1mm' } : {}) }}>
                <div style={{ width: '34mm', padding: '1.5mm 2mm', fontSize: '4.2mm', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2mm' }}>{bsp && <SternIcon size={4.4} />}<PersonText p={p} /></div>
                {['praesens', 'praeteritum'].map(t => {
                  const f = (t === 'praesens' ? praesens(v) : praeteritum(v))[p].text;
                  const schon = t === 'praeteritum' && schwerePraeteritumForm(v, p);   // wie in der App: steht grau schon da
                  return (
                    <div key={t} style={{ flex: 1, padding: '1.5mm 3mm', borderLeft: `0.3mm solid ${BF.hell}`, display: 'flex' }}>
                      <Schreibzeile klasse={klasse} text={schon || sol || bsp ? f : null} farbe={schon ? '#9ca3af' : bsp ? BF.bsp : BF.sol} />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// 4. Lückentext: Text mit Lücken und Grundform in Klammern; Perfekt/Futur: Hilfsverb an der Verbstelle, zweiter Teil am Satzende
function lueckenWoerter(textObj, zeit) {
  const woerter = [];
  let offen = null, vi = 0;
  for (const t of textTeile(textObj, 'praesens')) {
    if (t.v) {
      const v = verbByGrundform[t.v];
      if (zeit === 'perfekt' || zeit === 'futur') {
        const f = (zeit === 'perfekt' ? perfekt(v) : futur(v))[t.p];
        woerter.push({ luecke: f.hilfsverb, g: v.g, vi });
        offen = { luecke: f.zweites, ende: true, vi };
      } else woerter.push({ luecke: (zeit === 'praeteritum' ? praeteritum(v) : praesens(v))[t.p].text, g: v.g, vi });
      vi++;
      continue;
    }
    // Text zwischen den Verben; beim Satzende den zweiten Teil einfügen
    const teile = t.t.split(/([.!?])/);
    teile.forEach(s => {
      if (/^[.!?]$/.test(s)) { if (offen) { woerter.push(offen); offen = null; } woerter.push({ t: s, zeichen: true }); }
      else if (s) woerter.push({ t: s });
    });
  }
  return woerter;
}
function LueckenBlatt({ z, klasse, sol, option }) {
  const zeit = option;
  const tauglich = (x) => x.text.split(/[.!?]/).every(s => (s.match(/\{/g) || []).length <= 1);
  const texte = z.mix(texteDerStufe(klasse).filter(x => (zeit === 'perfekt' || zeit === 'futur') ? tauglich(x) : true)).slice(0, 2);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8mm' }}>
      <div style={{ fontSize: '3.6mm', display: 'flex', alignItems: 'center', gap: '2mm' }}>Schreibe alle Verben im <ZeitEtikett zeit={zeit} /> <span style={{ color: BF.grau }}>{ZEITEN[zeit].deutsch}</span></div>
      {texte.map((x, k) => (
        <div key={x.id}>
          <div style={{ fontSize: '5mm', fontWeight: 800, marginBottom: '2mm' }}>{x.titel}</div>
          <div style={{ fontSize: '5mm', lineHeight: klasse === 3 ? 2.6 : 2.3 }}>
            {lueckenWoerter(x, zeit).map((w, i) => {
              if (w.t !== undefined) return <span key={i}>{w.t}</span>;
              const bsp = k === 0 && w.vi === 0;   // Beispiel: das erste Verb des ersten Textes (beim Perfekt/Futur beide Teile)
              const zeig = sol || bsp;
              return (
                <span key={i} style={{ whiteSpace: 'nowrap' }}>
                  {i > 0 && !w.ende ? '' : ' '}
                  <span style={{ display: 'inline-block', minWidth: '30mm', borderBottom: `0.35mm solid ${BF.ink}`, textAlign: 'center', color: bsp ? BF.bsp : BF.sol, fontWeight: 700, lineHeight: 1.3, ...(bsp ? { outline: '0.4mm dashed #6b7280', outlineOffset: '0.8mm', borderRadius: '1mm' } : {}) }}>
                    {bsp && <span style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '1mm' }}><SternIcon size={3.6} /></span>}{zeig ? w.luecke : ' '}
                  </span>
                  {w.g && <span style={{ fontSize: '3.4mm', color: BF.grau }}> ({w.g})</span>}
                  {w.ende ? '' : ' '}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// 5. Zeitform bestimmen: Verb unterstreichen, Zeitform ankreuzen
function BestimmenBlatt({ z, klasse, sol }) {
  const zeiten = klasse === 4 ? ['praesens', 'praeteritum', 'perfekt', 'futur'] : ['praesens', 'praeteritum', 'futur'];
  const rahmen = z.mix(rahmenDerStufe(klasse).filter(r => r.v !== 'werden'));
  const folge = z.mix([...zeiten, ...zeiten, ...zeiten, ...zeiten]).slice(0, 11);
  const saetze = folge.map((zeit, i) => {
    const r = rahmen[i % rahmen.length];
    const personen = (r.wer || [0, 1, 2, 3, 4, 5]).filter(p => satzErlaubt(r, p, zeit));
    return baueSatz(r, personen[Math.floor(z.rnd() * personen.length)], zeit, Math.floor(z.rnd() * 6));
  });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4.2mm' }}>
      {saetze.map((s, i) => {
        const bsp = i === 0, zeig = sol || bsp, farbe = bsp ? BF.bsp : BF.sol;
        const inhalt = (
          <div style={{ display: 'flex', alignItems: 'center', gap: '3mm' }}>
            <NrKreis n={i} bsp={bsp} />
            <div style={{ flex: 1, fontSize: '5mm', fontWeight: 500 }}>
              {s.teile.map((x, k) => {
                const verb = x.rolle === 'verb' || x.rolle === 'hv' || x.rolle === 'zweites';
                return <React.Fragment key={k}>{k > 0 && ' '}<span style={verb && zeig ? { borderBottom: `0.7mm solid ${farbe}`, paddingBottom: '0.3mm' } : {}}>{x.t}</span></React.Fragment>;
              })}.
            </div>
            <div style={{ display: 'flex', gap: '2.5mm', flexShrink: 0 }}>
              {zeiten.map(t => <Ankreuz key={t} zeit={t} an={zeig && s.zeit === t} farbe={farbe} label={ZEITEN[t].name} />)}
            </div>
          </div>
        );
        return <div key={i}>{bsp ? <BspRahmen>{inhalt}</BspRahmen> : inhalt}</div>;
      })}
    </div>
  );
}

// 6. Verb-Familien sortieren
function FamilienBlatt({ z, klasse, sol }) {
  const moeglich = Object.keys(FAMILIEN).filter(f => f !== 'misch' && f !== 'einzel' && verbenFuer(klasse, v => v.fam === f).length >= 3);
  const familien = z.mix(moeglich).slice(0, klasse === 4 ? 4 : 3);
  const proHaus = 3;
  const paare = familien.flatMap(f => z.mix(verbenFuer(klasse, v => v.fam === f)).slice(0, proHaus).map(v => ({ v, f })));
  const kasten = z.mix(paare);
  const bsp = kasten[0];
  const paarText = (v) => `${v.g} – ${praeteritum(v)[0].text}`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6mm' }}>
      <div style={{ border: `0.45mm solid ${BF.ink}`, borderRadius: '3mm', padding: '3mm 4mm', display: 'flex', flexWrap: 'wrap', gap: '2.5mm 6mm', fontSize: '4.6mm', fontWeight: 600 }}>
        {kasten.map(({ v }) => <span key={v.g} style={{ textDecoration: (sol || v === bsp.v) ? `line-through ${v === bsp.v ? BF.bsp : BF.sol}` : 'none', textDecorationThickness: '0.5mm' }}>{paarText(v)}</span>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: familien.length === 4 ? '1fr 1fr' : '1fr', gap: '5mm' }}>
        {familien.map(f => {
          const drin = paare.filter(p => p.f === f);
          return (
            <div key={f} style={{ border: `0.5mm solid ${ZF.praeteritum.rand}`, borderRadius: '3mm', padding: '2.5mm 4mm 3mm', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2mm', fontWeight: 800, fontSize: '4.4mm', color: ZF.praeteritum.text, marginBottom: '1.5mm' }}>
                <House style={{ width: '6mm', height: '6mm' }} /> Familie {FAMILIEN[f].titel}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: klasse === 3 ? '4.5mm' : '2.5mm' }}>
                {drin.map((p, i) => {
                  const istBsp = p.v === bsp.v;
                  return <div key={i} style={{ display: 'flex', alignItems: 'flex-end', gap: '2mm' }}>{istBsp && <SternIcon size={4.4} />}<Schreibzeile klasse={klasse} text={sol || istBsp ? paarText(p.v) : null} farbe={istBsp ? BF.bsp : BF.sol} /></div>;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const BLATT_INHALT = { formen: FormenBlatt, endungen: EndungenBlatt, personal: PersonalBlatt, luecken: LueckenBlatt, bestimmen: BestimmenBlatt, familien: FamilienBlatt };

// Seiten eines Blattes: Aufgabe + (auf Wunsch) Lösung, beide aus demselben Startwert
function blattSeiten(typ, nummer, klasse, option, loesung) {
  const T = BLATT_TYPEN[typ], Inhalt = BLATT_INHALT[typ];
  const seite = (sol) => {
    const z = neuerZufall(`${typ}|${klasse}|${option || ''}|${nummer}`);
    return (
      <BlattSeite key={sol ? 'l' : 'a'} fuss={`${T.titel} · Klasse ${klasse}${option && option !== 'gemischt' && BLATT_OPTIONEN[T.option] ? ' · ' + (BLATT_OPTIONEN[T.option].werte(klasse).find(w => w[0] === option) || [, option])[1] : ''}`} nr={nummer} seite={sol ? 'Lösung' : 'Aufgaben'}>
        <BlattKopf Icon={T.Icon} titel={T.titel} text={T.text(klasse)} loesung={sol} />
        <Inhalt z={z} klasse={klasse} sol={sol} option={option} />
      </BlattSeite>
    );
  };
  return loesung ? [seite(false), seite(true)] : [seite(false)];
}

function BlattStudio({ stufe, onClose }) {
  const [typ, setTyp] = useState('formen');
  const [klasse, setKlasse] = useState(stufe);
  const [loesung, setLoesung] = useState(true);
  const [optionen, setOptionen] = useState({ endZeit: 'gemischt', lueckZeit: 'praeteritum' });
  const [nummer, setNummer] = useState(neueNummer);
  const [eingabe, setEingabe] = useState(nummer);
  const T = BLATT_TYPEN[typ];
  const optDef = T.option ? BLATT_OPTIONEN[T.option] : null;
  const werte = optDef ? optDef.werte(klasse) : [];
  const option = optDef ? (werte.some(w => w[0] === optionen[T.option]) ? optionen[T.option] : werte[0][0]) : null;
  const seiten = useMemo(() => blattSeiten(typ, nummer, klasse, option, loesung), [typ, nummer, klasse, option, loesung]);
  const scrollRef = useRef(null), scaleRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [ueberlauf, setUeberlauf] = useState([]);
  useEffect(() => {
    const fit = () => { const w = scrollRef.current ? scrollRef.current.clientWidth - 32 : 800; setScale(Math.min(1, w / 794)); };
    fit(); window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit);
  }, []);
  // Läuft eine Seite über? (Schutz – sollte nie vorkommen)
  useEffect(() => {
    const t = setTimeout(() => {
      if (!scaleRef.current) return;
      const els = [...scaleRef.current.querySelectorAll('.sheet-inhalt')];
      setUeberlauf(els.map((el, i) => (el.scrollHeight > el.clientHeight + 2 ? i + 1 : null)).filter(Boolean));
    }, 300);
    return () => clearTimeout(t);
  }, [seiten]);
  const neu = () => { const n = neueNummer(); setNummer(n); setEingabe(n); };
  const knopf = (aktiv) => `px-3 py-2 rounded-xl text-sm font-bold border-2 ${aktiv ? 'bg-cyan-400 text-cyan-950 border-cyan-300' : 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-100'}`;
  const klein = (aktiv) => `px-3 py-1.5 rounded-lg font-bold ${aktiv ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700'}`;
  return (
    <div className="sheet-studio fixed inset-0 z-[270] bg-slate-950/95 flex flex-col">
      <div className="no-print bg-slate-900 border-b-2 border-cyan-400/40 p-3 md:p-4 text-slate-100 max-h-[55vh] overflow-y-auto">
        <div className="max-w-6xl mx-auto flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <h3 className="text-xl sm:text-2xl font-black text-cyan-300 flex items-center gap-2 min-w-0"><Printer className="w-7 h-7 flex-shrink-0" /> <span className="truncate">Arbeitsblätter</span></h3>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button onClick={() => window.print()} className="inline-flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-cyan-950 px-4 sm:px-6 py-3 rounded-2xl font-black text-lg shadow-[0_4px_0_rgba(14,116,144,1)] active:translate-y-1 active:shadow-none"><Printer className="w-6 h-6" /> Drucken</button>
              <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 rounded-full p-2" aria-label="Schließen"><X className="w-6 h-6" /></button>
            </div>
          </div>
          {BLATT_GRUPPEN.map(g => (
            <div key={g.titel} className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 text-sm w-full sm:w-48">{g.titel}:</span>
              {g.typen.map(id => <button key={id} onClick={() => setTyp(id)} className={knopf(typ === id)}>{BLATT_TYPEN[id].titel}</button>)}
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="flex items-center gap-2"><span className="text-slate-400">Klasse:</span>{[3, 4].map(k => <button key={k} onClick={() => setKlasse(k)} className={klein(klasse === k)}>{k}</button>)}</span>
            {optDef && (
              <span className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400">{optDef.label}:</span>
                {werte.map(([w, l]) => <button key={w} onClick={() => setOptionen(o => ({ ...o, [T.option]: w }))} className={klein(option === w)}>{l}</button>)}
              </span>
            )}
            <label className="flex items-center gap-2"><input type="checkbox" checked={loesung} onChange={ev => setLoesung(ev.target.checked)} /> Lösungsblatt dazu</label>
            <label className="flex items-center gap-2">
              <span className="text-slate-400">Nummer:</span>
              <input value={eingabe} inputMode="numeric" maxLength={4} aria-label="Blatt-Nummer" onChange={ev => { const v = ev.target.value.replace(/\D/g, '').slice(0, 4); setEingabe(v); if (v.length === 4) setNummer(v); }} className="w-20 bg-slate-950 border-2 border-slate-700 focus:border-cyan-500 rounded-lg px-2 py-1 text-center font-bold tracking-widest outline-none" />
            </label>
            <button onClick={neu} className="ml-auto inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-xl font-bold"><Shuffle className="w-4 h-4" /> Neue Aufgaben</button>
          </div>
          <p className="text-xs text-slate-400">
            {seiten.length} Seite{seiten.length > 1 ? 'n' : ''} · Die Nummer steht unten auf jeder Seite. Gibt man sie hier ein (gleiche Klasse und Einstellung), entsteht genau dieses Blatt noch einmal. Im Druckfenster „A4“ und „Ränder: keine“ wählen. Für Farbe „Hintergrundgrafiken“ einschalten – die Blätter funktionieren auch in Schwarz-Weiß.
            {ueberlauf.length > 0 && <span className="text-rose-300 font-bold"> Achtung: Seite {ueberlauf.join(', ')} ist zu voll – bitte „Neue Aufgaben“ drücken.</span>}
          </p>
        </div>
      </div>
      <div ref={scrollRef} className="sheet-scroll flex-1 overflow-auto p-4 bg-slate-700">
        <div className="sheet-huelle mx-auto" style={{ width: `${794 * scale}px`, height: `${seiten.length * (297 * 3.78 + 24) * scale}px` }}>
          <div ref={scaleRef} className="sheet-scale flex flex-col items-center gap-6" style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: '210mm' }}>
            {seiten.map(p => <div key={p.key} className="shadow-2xl">{p}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// APP
// ==========================================
// Feste Kopfleiste wie in Pronomen-Magie: links Merksätze, Mitte Reise-Hilfe/Code/Können + blasses Zahnrad, rechts Sterne
function KopfLeiste({ stufe, progress, hudAnim, onHudEnde, onMerksaetze, onHilfe, onCode, onKoennen, onAdmin, onBlaetter }) {
  const spiele = spieleDerStufe(stufe);
  const summe = spiele.reduce((a, g) => a + (progress[g.id] || 0), 0);
  const pill = 'pointer-events-auto whitespace-nowrap flex items-center gap-2 md:gap-3 bg-slate-900/90 backdrop-blur-md border-2 font-bold py-2 md:py-3 px-3 md:px-6 rounded-full transition-all active:scale-95';
  return (
    <div className="fixed top-4 left-4 right-4 md:top-6 md:left-6 md:right-6 z-[150] flex justify-between items-start gap-2 pointer-events-none">
      <div className="flex-1 flex justify-start">
        <button onClick={onMerksaetze} className={`${pill} hover:bg-cyan-500 border-cyan-400/50 text-cyan-300 hover:text-cyan-950 shadow-[0_0_20px_rgba(34,211,238,0.2)]`}>
          <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
          <span className="hidden lg:inline text-sm md:text-base uppercase tracking-wider">Merksätze</span>
        </button>
      </div>
      <div className="flex-none flex justify-center gap-2 md:gap-3">
        <button onClick={onHilfe} title="Reise-Hilfe" className={`${pill} hover:bg-indigo-500 border-indigo-500/50 text-indigo-300 hover:text-indigo-950 shadow-[0_0_20px_rgba(99,102,241,0.2)]`}>
          <CircleHelp className="w-5 h-5 md:w-6 md:h-6" />
          <span className="hidden md:inline text-sm md:text-base uppercase tracking-wider">Reise-Hilfe</span>
        </button>
        <button onClick={onCode} title="Zeitreise-Code" className={`${pill} hover:bg-emerald-500 border-emerald-500/50 text-emerald-300 hover:text-emerald-950 shadow-[0_0_20px_rgba(16,185,129,0.2)]`}>
          <Key className="w-5 h-5 md:w-6 md:h-6" />
          <span className="hidden md:inline text-sm md:text-base uppercase tracking-wider">Zeitreise-Code</span>
        </button>
        <button onClick={onKoennen} title="Das kann ich schon" className={`${pill} hover:bg-lime-500 border-lime-500/50 text-lime-300 hover:text-lime-950 shadow-[0_0_20px_rgba(132,204,22,0.2)]`}>
          <Target className="w-5 h-5 md:w-6 md:h-6" />
          <span className="hidden xl:inline text-sm md:text-base uppercase tracking-wider">Das kann ich schon</span>
        </button>
        <button onClick={onBlaetter} aria-label="Arbeitsblätter" title="Arbeitsblätter" className="pointer-events-auto opacity-30 hover:opacity-100 transition-opacity p-2 -mr-2">
          <Printer className="w-5 h-5 text-slate-400" />
        </button>
        <button onClick={onAdmin} aria-label="Lehrer-Bereich" className="pointer-events-auto opacity-30 hover:opacity-100 transition-opacity p-2">
          <Settings className="w-5 h-5 text-slate-400" />
        </button>
      </div>
      <div className="flex-1 flex justify-end">
        <div onAnimationEnd={onHudEnde}
          className={`pointer-events-auto bg-slate-900/90 backdrop-blur-md border-2 border-amber-400 py-2 md:py-3 px-3 md:px-6 rounded-full flex items-center gap-2 md:gap-3 shadow-[0_0_20px_rgba(251,191,36,0.4)] ${hudAnim ? 'anim-hud' : ''}`}>
          <Star className="text-amber-400 w-5 h-5 md:w-6 md:h-6 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          <span className="text-white font-black text-xl md:text-2xl flex items-baseline gap-1">
            {summe} <span className="text-amber-400/70 text-sm md:text-lg font-bold hidden sm:inline">/ {spiele.length * 10}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function Fusszeile({ onImpressum }) {
  return (
    <footer className="mt-10 text-center text-xs sm:text-sm text-slate-500">
      <button onClick={() => onImpressum('impressum')} className="hover:text-slate-300 hover:underline underline-offset-2 transition-colors">Impressum</button>
      <span className="mx-2" aria-hidden="true">·</span>
      <button onClick={() => onImpressum('datenschutz')} className="hover:text-slate-300 hover:underline underline-offset-2 transition-colors">Datenschutz</button>
    </footer>
  );
}

// Sternenhimmel der Zeitreise (tiefes Blau mit Sternen und Cyan-Schimmer, src/tailwind-input.css)
const HINTERGRUND = {
  menu: 'sternenhimmel',
  spiel: 'sternenhimmel',
  ergebnis: 'sternenhimmel',
};

export default function App() {
  const [einst, setEinst] = useState(readUrlSettings);
  const stufe = einst.stufe;
  const [seite, setSeite] = useState('menu');              // menu | spiel | ergebnis | erkunden
  const [spielId, setSpielId] = useState(null);
  const [spielLauf, setSpielLauf] = useState(0);           // neuer Schlüssel = neue Runde
  const [progress, setProgress] = useState({});            // { [spielId]: beste Sterne 0–10 }
  const [skillLog, setSkillLog] = useState({});            // { [skillId]: { window: [bool …] } }
  const [merksatzGesehen, setMerksatzGesehen] = useState({});
  const [ergebnis, setErgebnis] = useState(null);
  const [fenster, setFenster] = useState(null);            // merksaetze | code | koennen | admin | lehrer | schieberegler | belohnung
  const [koennenFokus, setKoennenFokus] = useState(null);
  const [merksatz, setMerksatz] = useState(null);
  const [tipp, setTipp] = useState(null);
  const [impressum, setImpressum] = useState(null);
  const [hudAnim, setHudAnim] = useState(false);
  const [zone, setZone] = useState('jetzt');               // wo die Zeitmaschine gerade steht (für den Zeitsprung)
  const [zeitsprung, setZeitsprung] = useState(null);      // { id, zone, farbe } während der Animation

  useEffect(() => { document.title = BASIS ? 'Zeitreise – Basis' : 'Zeitreise – Zeitformen der Verben'; }, []);

  const req = UNLOCK_REQ(stufe);
  const sperreFuer = (id, prog) => {
    const fehlt = (req[id] || []).filter(r => (prog[r] || 0) < FREI_AB);
    if (!fehlt.length) return null;
    return `Du brauchst ${FREI_AB} Sterne in ${fehlt.map(r => `„${gameById(r).titel}“`).join(' und ')}`;
  };
  const sperreVon = id => sperreFuer(id, progress);
  const alleAbzeichen = prog => spieleDerStufe(stufe).every(g => (prog[g.id] || 0) >= 10);

  const track = (skillId, ok) => setSkillLog(prev => {
    const alt = prev[skillId]?.window || [];
    return { ...prev, [skillId]: { window: [...alt, !!ok].slice(-10) } };
  });
  const skillContext = useMemo(() => ({ track }), []);

  // Zone eines Spiels auf dem Zeitstrahl (Finale = eigene Zone)
  const zoneVon = id => STRAHL_ZONE[stationVon(id).farbe] || 'finale';

  const starteSpiel = (id) => {
    if (sperreVon(id)) return;
    const ziel = zoneVon(id);
    if (ziel !== zone && einst.anim && !bewegungReduziert()) {
      setZeitsprung({ id, zone: ziel, farbe: stationVon(id).farbe });
      return;
    }
    oeffneSpiel(id);
  };

  const oeffneSpiel = (id) => {
    setZeitsprung(null);
    setZone(zoneVon(id));
    AKTIVES_SPIEL.id = id;
    setSpielId(id); setSpielLauf(n => n + 1); setSeite('spiel');
    window.scrollTo(0, 0);
    const m = gameById(id).merksatz;
    if (!merksatzGesehen[m]) { setMerksatz(m); setMerksatzGesehen(s => ({ ...s, [m]: true })); }
  };

  const beendeSpiel = (sterne, max = 10, extra = {}) => {
    const serie = extra.serie || 0, alt = SERIEN_REKORD[spielId] || 0;
    if (serie > alt) SERIEN_REKORD[spielId] = serie;
    const s = Math.round((Math.max(0, Math.min(max, sterne)) / max) * 10);
    const vorher = progress[spielId] || 0;
    const neu = { ...progress, [spielId]: Math.max(vorher, s) };
    const neuFrei = spieleDerStufe(stufe).filter(g => sperreFuer(g.id, progress) && !sperreFuer(g.id, neu));
    if (s > vorher) setHudAnim(true);
    setProgress(neu);
    setErgebnis({ spiel: gameById(spielId), sterne: s, abzeichenNeu: s >= 10 && vorher < 10, neuFrei, serie, rekordAlt: alt, comboSpiel: !!extra.combo });
    setSeite('ergebnis');
    window.scrollTo(0, 0);
    ton(s >= FREI_AB ? 'stern' : 'richtig');
    if (alleAbzeichen(neu) && !alleAbzeichen(progress)) setFenster('belohnung');
  };

  const oeffneErkunden = () => { setSeite('erkunden'); window.scrollTo(0, 0); };
  const codeLaden = (r) => { setProgress(r.progress); setSkillLog(skillLogFromLevels(r.skills)); };
  const zeigeKoennen = (fokus = null) => { setKoennenFokus(fokus); setFenster('koennen'); };
  const spiel = spielId ? gameById(spielId) : null;
  const [blaetter, setBlaetter] = useState(false);   // Arbeitsblatt-Generator offen?

  return (
    <SkillContext.Provider value={skillContext}>
      <style>{sheetStyles}</style>
      {blaetter && <BlattStudio stufe={stufe} onClose={() => setBlaetter(false)} />}
      {/* Erstes Antippen weckt das Tonsystem (iPad); beim Drucken der Arbeitsblätter ist die App ausgeblendet */}
      <div onPointerDown={tonWecken} className={`text-slate-100 ${blaetter ? 'no-print' : ''}`}>
        <KopfLeiste stufe={stufe} progress={progress} hudAnim={hudAnim} onHudEnde={() => setHudAnim(false)}
          onMerksaetze={() => setFenster('merksaetze')} onHilfe={() => setFenster('hilfe')}
          onCode={() => setFenster('code')} onKoennen={() => zeigeKoennen(seite === 'spiel' ? spielId : null)} onAdmin={() => setFenster('admin')} onBlaetter={() => setBlaetter(true)} />

        {seite === 'menu' && (
          <div className={`min-h-screen ${HINTERGRUND.menu} p-4 font-sans flex justify-center relative overflow-x-hidden`}>
            <div className="max-w-[1400px] w-full pt-24 md:pt-28 pb-12">
              <Karte stufe={stufe} progress={progress} sperreVon={sperreVon} onStart={starteSpiel} onSchieberegler={oeffneErkunden} />
              <Fusszeile onImpressum={setImpressum} />
            </div>
          </div>
        )}

        {seite === 'spiel' && spiel && (
          <div className={`min-h-screen ${HINTERGRUND.spiel} pt-24 pb-8 px-4 font-sans flex flex-col items-center relative w-full`}>
            <div className="max-w-4xl w-full spielflaeche">
              <div className="grid grid-cols-3 items-center mb-8 bg-black/40 backdrop-blur-md p-4 px-6 rounded-2xl shadow-lg border border-white/10 text-white/80">
                <div className="flex justify-start">
                  <button onClick={() => setSeite('menu')} className="font-bold flex items-center gap-2 hover:text-white transition-colors uppercase text-sm active:scale-95">
                    <ArrowRight className="w-4 h-4 rotate-180" /> <span className="hidden sm:inline">Zurück</span>
                  </button>
                </div>
                <div className="font-black tracking-widest uppercase text-xs md:text-base px-2 text-center opacity-80 whitespace-nowrap">{spiel.titel}</div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setMerksatz(spiel.merksatz)} title="Merksatz" aria-label="Merksatz" className="flex items-center gap-1 bg-slate-800/60 hover:bg-slate-700 text-cyan-300 font-bold px-3 py-2 rounded-xl border border-cyan-400/40 active:scale-95"><CircleHelp className="w-5 h-5" /><span className="hidden md:inline text-sm">Merksatz</span></button>
                </div>
              </div>
              <div className="bg-black/20 backdrop-blur-sm w-full rounded-3xl shadow-2xl border border-white/10 p-6 md:p-10 relative overflow-hidden min-h-[400px]">
                {(() => { const Spiel = SPIEL_KOMPONENTE[spiel.id]; return <Spiel key={spielLauf} spiel={spiel} stufe={stufe} onFinish={beendeSpiel} onTipp={setTipp} />; })()}
              </div>
            </div>
          </div>
        )}

        {seite === 'erkunden' && (
          <div className={`min-h-screen ${HINTERGRUND.spiel} pt-24 pb-8 px-4 font-sans flex flex-col items-center relative w-full`}>
            <div className="max-w-4xl w-full">
              <div className="grid grid-cols-3 items-center mb-8 bg-black/40 backdrop-blur-md p-4 px-6 rounded-2xl shadow-lg border border-white/10 text-white/80">
                <div className="flex justify-start">
                  <button onClick={() => setSeite('menu')} className="font-bold flex items-center gap-2 hover:text-white transition-colors uppercase text-sm active:scale-95">
                    <ArrowRight className="w-4 h-4 rotate-180" /> <span className="hidden sm:inline">Zurück</span>
                  </button>
                </div>
                <div className="font-black tracking-widest uppercase text-xs md:text-base px-2 text-center opacity-80 whitespace-nowrap">Erkunde die Zeiten</div>
                <div />
              </div>
              <div className="bg-black/20 backdrop-blur-sm w-full rounded-3xl shadow-2xl border border-white/10 p-5 md:p-10">
                <ErkundeZeiten stufe={stufe} anim={einst.anim} onZurueck={() => setSeite('menu')} />
              </div>
            </div>
          </div>
        )}

        {seite === 'ergebnis' && ergebnis && (
          <div className={`min-h-screen ${HINTERGRUND.ergebnis} flex items-center justify-center p-4 pt-24 font-sans`}>
            <ErgebnisSeite ergebnis={ergebnis} onNochmal={() => starteSpiel(ergebnis.spiel.id)} onKarte={() => setSeite('menu')} onKoennen={() => zeigeKoennen(ergebnis.spiel.id)} />
          </div>
        )}

        {merksatz && <MerksatzKarte id={merksatz} stufe={stufe} onClose={() => setMerksatz(null)} />}
        {tipp && <TippFenster text={tipp} onClose={() => setTipp(null)} />}
        {fenster === 'merksaetze' && <MerksaetzeFenster stufe={stufe} onClose={() => setFenster(null)} />}
        {fenster === 'hilfe' && <HilfeFenster stufe={stufe} onClose={() => setFenster(null)} />}
        {fenster === 'code' && <CodeFenster onClose={() => setFenster(null)} progress={progress} skillLog={skillLog} onLaden={codeLaden} />}
        {fenster === 'koennen' && <KoennenFenster onClose={() => setFenster(null)} stufe={stufe} skillLog={skillLog} fokus={koennenFokus} />}
        {fenster === 'admin' && <AdminAnmeldung onClose={() => setFenster(null)} onLogin={() => setFenster('lehrer')} onImpressum={() => { setFenster(null); setImpressum('impressum'); }} />}
        {fenster === 'lehrer' && (
          <LehrerBereich onClose={() => setFenster(null)} einst={einst} setEinst={setEinst} progress={progress} setProgress={setProgress} setSkillLog={setSkillLog}
            onKoennen={() => zeigeKoennen(null)} onSchieberegler={() => { setFenster(null); oeffneErkunden(); }} onImpressum={() => { setFenster(null); setImpressum('impressum'); }} onBlaetter={() => { setFenster(null); setBlaetter(true); }} />
        )}
        {fenster === 'belohnung' && (
          <Modal onClose={() => setFenster(null)} titel="Geschafft!" rand="border-amber-400">
            <div className="text-center">
              <Award className="w-24 h-24 mx-auto my-2 text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] anim-float" />
              <p className="text-xl text-slate-100">{SAETZE.belohnung}</p>
              {VORLESEN && <button onClick={() => sprich('belohnung')} className="mt-3 inline-flex items-center gap-2 text-cyan-300 font-bold"><Volume2 className="w-5 h-5" /> Nochmal hören</button>}
            </div>
          </Modal>
        )}
        {impressum && <ImpressumModal section={impressum} onClose={() => setImpressum(null)} />}
        {zeitsprung && <Zeitsprung sprung={zeitsprung} onFertig={() => oeffneSpiel(zeitsprung.id)} />}

        <div className="bitte-drehen fixed inset-0 z-[300] bg-slate-950/95 text-white items-center justify-center text-center p-6 text-2xl font-bold">
          Bitte drehe dein Gerät.
        </div>
      </div>
    </SkillContext.Provider>
  );
}
