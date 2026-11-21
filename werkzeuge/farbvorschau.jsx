// farbvorschau.jsx – Vergleichsseite für die Lehrkraft: drei Varianten, wie farbige Markierungen in der dunklen App
// aussehen könnten (gleiche Beispiele in jeder Variante). Wird NICHT mit der App ausgeliefert.
// Bauen und ansehen (Git Bash im Repo-Ordner, nach bash werkzeuge/lokal_bauen.sh):
//   bash werkzeuge/farbvorschau.sh     → http://localhost:5173/farbvorschau.html (node werkzeuge/server.mjs)
import React, { useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

// Klassen je Variante und Zeitform (vollständig ausgeschrieben für Tailwind)
const V = {
  papier: {
    name: 'A · So wie jetzt (Papier-Karte)',
    info: 'Helle Karte, Farben genau wie im Auftrag und auf dem Arbeitsblatt.',
    karte: 'bg-white text-slate-900 rounded-2xl border-2 border-stone-300 p-4',
    kopf: () => null,
    stamm: 'underline decoration-2 decoration-slate-900 underline-offset-4',
    zeit: {
      praesens: { end: 'text-rose-700', flaeche: 'bg-rose-100 border-rose-500', klammer: 'text-rose-700 border-rose-500', stroke: '#f43f5e' },
      praeteritum: { end: 'text-amber-700', flaeche: 'bg-amber-100 border-amber-500', klammer: 'text-amber-700 border-amber-500', stroke: '#f59e0b' },
      perfekt: { end: 'text-lime-800', flaeche: 'bg-lime-100 border-lime-600', klammer: 'text-lime-800 border-lime-600', stroke: '#65a30d' },
    },
    knopf: 'bg-stone-100 border-stone-300 text-slate-800', knopfAn: 'bg-rose-100 border-rose-500 text-rose-700',
    tor: { jetzt: 'bg-rose-100 border-rose-500 text-rose-700', frueher: 'bg-amber-100 border-amber-500 text-amber-700' },
    leise: 'text-stone-500',
  },
  tafel: {
    name: 'B · Leuchttafel (empfohlen)',
    info: 'Innen dieselben Farben wie auf Papier, außen ein leuchtender Rahmen mit Kopfleiste in der Zeitfarbe.',
    karte: 'bg-amber-50 text-slate-900 rounded-xl p-4',
    rahmen: {
      praesens: 'border-2 border-rose-400 shadow-[0_0_25px_rgba(251,113,133,0.45)]',
      praeteritum: 'border-2 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.45)]',
      perfekt: 'border-2 border-lime-400 shadow-[0_0_25px_rgba(163,230,53,0.45)]',
    },
    kopfText: { praesens: 'text-rose-300', praeteritum: 'text-amber-300', perfekt: 'text-lime-300' },
    stamm: 'underline decoration-2 decoration-slate-900 underline-offset-4',
    zeit: {
      praesens: { end: 'text-rose-700', flaeche: 'bg-rose-100 border-rose-500', klammer: 'text-rose-700 border-rose-500', stroke: '#f43f5e' },
      praeteritum: { end: 'text-amber-700', flaeche: 'bg-amber-100 border-amber-500', klammer: 'text-amber-700 border-amber-500', stroke: '#f59e0b' },
      perfekt: { end: 'text-lime-800', flaeche: 'bg-lime-100 border-lime-600', klammer: 'text-lime-800 border-lime-600', stroke: '#65a30d' },
    },
    knopf: 'bg-white border-stone-300 text-slate-800', knopfAn: 'bg-rose-100 border-rose-500 text-rose-700',
    tor: { jetzt: 'bg-rose-100 border-rose-500 text-rose-700', frueher: 'bg-amber-100 border-amber-500 text-amber-700' },
    leise: 'text-stone-500',
  },
  neon: {
    name: 'C · Ganz dunkel mit Neon',
    info: 'Alles auf dunklem Grund, Endungen und Klammer leuchten. Gleicher Farbton, aber hellere Stufe als auf Papier.',
    karte: 'bg-slate-900 text-slate-100 rounded-2xl border-2 border-slate-700 p-4',
    stamm: 'underline decoration-2 decoration-slate-100 underline-offset-4',
    zeit: {
      praesens: { end: 'text-rose-300', flaeche: 'bg-rose-400/10 border-rose-400', klammer: 'text-rose-300 border-rose-400', stroke: '#fb7185' },
      praeteritum: { end: 'text-amber-300', flaeche: 'bg-amber-400/10 border-amber-400', klammer: 'text-amber-300 border-amber-400', stroke: '#fbbf24' },
      perfekt: { end: 'text-lime-300', flaeche: 'bg-lime-400/10 border-lime-400', klammer: 'text-lime-300 border-lime-400', stroke: '#a3e635' },
    },
    knopf: 'bg-slate-800 border-slate-600 text-slate-200', knopfAn: 'bg-rose-400/15 border-rose-400 text-rose-300',
    tor: { jetzt: 'bg-rose-400/10 border-rose-400 text-rose-300', frueher: 'bg-amber-400/10 border-amber-400 text-amber-300' },
    leise: 'text-slate-400',
  },
};

const NAMEN = { praesens: 'PRÄSENS · JETZT', praeteritum: 'PRÄTERITUM · FRÜHER', perfekt: 'PERFEKT · FRÜHER' };

function Form({ v, stamm, endung, zeit }) {
  return <span className="whitespace-nowrap"><span className={v.stamm}>{stamm}</span><span className={`font-bold ${v.zeit[zeit].end}`}>{endung}</span></span>;
}

function Klammer({ v, teile, zeit }) {
  const box = useRef(null), refs = useRef([]);
  const [b, setB] = useState(null);
  useLayoutEffect(() => {
    const ks = teile.map((p, i) => (p.k ? i : -1)).filter(i => i >= 0);
    const r = box.current.getBoundingClientRect(), a = refs.current[ks[0]].getBoundingClientRect(), c = refs.current[ks[1]].getBoundingClientRect();
    setB({ x1: a.left - r.left + a.width / 2, x2: c.left - r.left + c.width / 2, w: r.width, y: a.top - r.top });
  }, []);
  const z = v.zeit[zeit];
  return (
    <span ref={box} className="relative inline-block pt-5 text-xl whitespace-nowrap">
      {b && <svg className="absolute left-0 top-0" width={b.w} height={b.y + 4}><path d={`M ${b.x1} ${b.y + 2} Q ${(b.x1 + b.x2) / 2} ${-b.y * 0.6} ${b.x2} ${b.y + 2}`} fill="none" strokeWidth="2.5" stroke={z.stroke} /></svg>}
      {teile.map((p, i) => <React.Fragment key={i}>{i > 0 && ' '}<span ref={el => { refs.current[i] = el; }} className={p.k ? `font-bold border-2 rounded-md px-1 ${z.klammer}` : ''}>{p.t}</span></React.Fragment>)}.
    </span>
  );
}

// Hülle: bei der Leuchttafel mit Neon-Rahmen und dunkler Kopfleiste
function Huelle({ vk, zeit, titel, children }) {
  const v = V[vk];
  if (vk !== 'tafel') {
    return (
      <div className={v.karte}>
        <p className={`text-xs font-black uppercase tracking-wider mb-2 ${v.leise}`}>{titel}</p>
        {children}
      </div>
    );
  }
  return (
    <div className={`rounded-2xl bg-slate-950 p-1.5 ${v.rahmen[zeit]}`}>
      <div className="flex items-center justify-between px-2.5 py-1.5">
        <span className={`text-xs font-black tracking-widest flex items-center gap-1.5 ${v.kopfText[zeit]}`}><span className="w-2 h-2 rounded-full bg-current" />{NAMEN[zeit]}</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{titel}</span>
      </div>
      <div className={v.karte}>{children}</div>
    </div>
  );
}

function Reihe({ vk }) {
  const v = V[vk];
  const personen = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie'], endungen = ['te', 'test', 'te', 'ten', 'tet', 'ten'];
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-black text-white">{v.name}</h2>
      <p className="text-slate-400 mb-4">{v.info}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        <Huelle vk={vk} zeit="praeteritum" titel="Merksatz">
          <div className={`rounded-xl border-2 p-3 mb-3 ${v.zeit.praeteritum.flaeche}`}>Das Präteritum erzählt von Vergangenem, meistens beim Schreiben.</div>
          <table className="text-lg"><tbody>
            {personen.map((p, i) => <tr key={p}><td className={`pr-3 ${v.leise}`}>{p}</td><td><Form v={v} stamm="mal" endung={endungen[i]} zeit="praeteritum" /></td></tr>)}
          </tbody></table>
        </Huelle>
        <Huelle vk={vk} zeit="praesens" titel="Endungs-Maschine">
          <p className="text-2xl text-center my-4">du <Form v={v} stamm="mal" endung="st" zeit="praesens" /></p>
          <div className="grid grid-cols-4 gap-2">
            {['-e', '-st', '-t', '-en'].map(e => <span key={e} className={`text-center font-bold text-lg rounded-xl border-2 py-2 ${e === '-st' ? v.knopfAn : v.knopf}`}>{e}</span>)}
          </div>
        </Huelle>
        <Huelle vk={vk} zeit="perfekt" titel="Verbklammer">
          <div className="py-3"><Klammer v={v} zeit="perfekt" teile={[{ t: 'Ich' }, { t: 'habe', k: true }, { t: 'ein Bild' }, { t: 'gemalt', k: true }]} /></div>
          <div className="py-2"><Klammer v={v} zeit="perfekt" teile={[{ t: 'Ich' }, { t: 'bin', k: true }, { t: 'nach Hause' }, { t: 'gelaufen', k: true }]} /></div>
        </Huelle>
        <Huelle vk={vk} zeit="praeteritum" titel="Zeitmaschinen-Tore">
          <p className="text-2xl text-center my-4 font-bold">wir spielten</p>
          <div className="grid grid-cols-2 gap-3">
            <span className={`text-center rounded-xl border-2 py-3 font-black ${v.tor.jetzt}`}>jetzt<span className="block text-xs font-bold">Präsens</span></span>
            <span className={`text-center rounded-xl border-2 py-3 font-black ${v.tor.frueher}`}>früher<span className="block text-xs font-bold">Präteritum</span></span>
          </div>
        </Huelle>
      </div>
    </section>
  );
}

function Seite() {
  return (
    <div className="sternenhimmel min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-sky-300 to-indigo-300 mb-1">Farbvorschau: Markierungen</h1>
        <p className="text-slate-300 mb-8">Gleiche Beispiele, drei Varianten. Hintergrund wie in der App.</p>
        <Reihe vk="papier" />
        <Reihe vk="tafel" />
        <Reihe vk="neon" />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<Seite />);
