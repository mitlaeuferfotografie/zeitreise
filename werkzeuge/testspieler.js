// testspieler.js – Hilfe zum Durchspielen der Auswahl-Spiele im Browser (nur lokal, wird NICHT ausgeliefert).
// Laden: nach  bash werkzeuge/lokal_bauen.sh  die Datei nach _site/ kopieren (cp werkzeuge/testspieler.js _site/)
// und in der Browser-Konsole:  await import('/testspieler.js')
// Dann:  await __freischalten();  await __oeffne('Zeitmaschinen-Tore');  __spiele();  … später  __bericht()
// Der Testspieler probiert Antworten durch, bis eine stimmt – so laufen Fehlermeldungen, Tipps, Wiederholung und Ergebnis.
window.__w = ms => new Promise(r => setTimeout(r, ms));
window.__k = t => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === t || b.textContent.includes(t)); if (b) b.click(); return !!b; };
window.__karte = async () => { for (let i = 0; i < 3 && !document.querySelector('section'); i++) { __k('Zurück zur Karte') || __k('Zurück'); await __w(300); } };
window.__freischalten = async () => {
  document.querySelector('[aria-label="Lehrer-Bereich"]').click(); await __w(300);
  const i = document.querySelector('input[type=password]');
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(i, 'Zeit123');
  i.dispatchEvent(new Event('input', { bubbles: true })); await __w(100);
  __k('Öffnen'); await __w(300); __k('Alles freischalten'); await __w(300);
};
window.__oeffne = async (titel) => {
  await __karte();
  const b = [...document.querySelectorAll('section button')].find(b => b.textContent.includes(titel));
  if (!b) return 'nicht gefunden';
  b.click(); await __w(500); __k('Los geht'); await __w(300);
  return document.querySelector('.spielflaeche') ? 'offen' : '?';
};
window.__tippe = (feld, text) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(feld, text); feld.dispatchEvent(new Event('input', { bubbles: true })); };
window.__spiele = async (max = 700) => {
  const log = { aufgaben: 0, fehler: 0, meldungen: new Set(), wiederholung: false, fertig: false };
  window.__lauf = log;
  let versucht = new Set(), letzteNr = '';
  for (let s = 0; s < max; s++) {
    await __w(25);
    const text = document.body.innerText;
    if (/von 10 Sternen gesammelt/.test(text)) { log.ergebnis = text.match(/Du hast (\d+) von 10/)?.[1]; break; }
    if (/Noch einmal üben/.test(text)) log.wiederholung = true;
    const nr = text.match(/(Aufgabe|Noch einmal üben) (\d+) von (\d+)/)?.[0] || '';
    if (nr !== letzteNr) { versucht = new Set(); letzteNr = nr; log.aufgaben++; }
    const weiter = [...document.querySelectorAll('button')].find(b => /^Weiter/.test(b.textContent.trim()));
    if (weiter) { weiter.click(); continue; }
    const optionen = [...document.querySelectorAll('.spielflaeche button')].filter(b => !b.disabled && !/Zurück|Merksatz|Prüfen/.test(b.textContent) && b.closest('.bg-amber-50, .grid'));
    const neu = optionen.find(b => !versucht.has(b.textContent.trim()));
    if (!neu) { log.haengt = nr + ' | ' + optionen.map(b => b.textContent.trim()).join(','); break; }
    versucht.add(neu.textContent.trim());
    neu.click();
    await __w(25);
    const pp = [...document.querySelectorAll('p.anim-pop')].pop();
    if (pp && /rose/.test(pp.className)) { log.fehler++; log.meldungen.add(pp.textContent.slice(0, 160)); } else versucht = new Set();
  }
  log.fertig = true;
  return log;
};
window.__bericht = () => JSON.stringify({ fertig: __lauf.fertig, haengt: __lauf.haengt, aufgaben: __lauf.aufgaben, fehler: __lauf.fehler, ergebnis: __lauf.ergebnis, wdh: __lauf.wiederholung, meldungen: [...__lauf.meldungen].slice(0, 12) });
export default true;
