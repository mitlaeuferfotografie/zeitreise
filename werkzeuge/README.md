# Werkzeuge (werden nicht ausgeliefert)

| Skript | Zweck | Aufruf |
|---|---|---|
| `lokal_bauen.sh` | Baut die App nach `_site/` (gleiche Schritte wie `.github/workflows/pages.yml`, hängt `?v=<Commit>` an). | `bash werkzeuge/lokal_bauen.sh` |
| `server.mjs` | Kleiner Webserver zum Testen von `_site/`. | `node werkzeuge/server.mjs` → http://localhost:5173/ (anderer Port: `PORT=5174`) |
| `formen_liste.mjs` | Erzeugt `formen_liste.md`: alle Verben aus `src/verben.js` in allen Personen und Zeitformen, mit Hinweisen zum Prüfen. | `node werkzeuge/formen_liste.mjs` |
| `farbvorschau.jsx`, `farbvorschau.sh` | Vergleichsseite: drei Varianten der Markierungsfarben in der dunklen App (nicht ausgeliefert). | `bash werkzeuge/farbvorschau.sh` (nach `lokal_bauen.sh`), dann `/farbvorschau.html` |
| `aufgaben_liste.mjs` | Erzeugt `aufgaben_liste.md` aus `src/aufgaben.js`: alle Sätze in allen Zeitformen, Texte, sein & haben, Detektiv-Fallen, Futur-Fehler – mit automatischer Prüfung. | `node werkzeuge/aufgaben_liste.mjs` |
| `testspieler.js` | Testhilfe für den Browser: Lehrer-Bereich freischalten, Spiel öffnen, Auswahl-Spiele automatisch durchspielen (probiert Antworten durch). Nicht ausgeliefert. | nach dem Bauen `cp werkzeuge/testspieler.js _site/`, dann in der Konsole `await import('/testspieler.js')`, `await __freischalten()`, `await __oeffne('Zeitmaschinen-Tore')`, `__spiele()`, `__bericht()` |
| `formen_liste.md` | Prüfliste für die Lehrkraft (erzeugt, nicht von Hand ändern). | – |

Nur Node 20, keine weiteren Pakete.
