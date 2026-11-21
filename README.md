# Zeitreise – Zeitformen der Verben

Interaktive Lern-App zu den **Zeitformen der Verben** für die Klassen 3 und 4 (Grundschule NRW).
Die Kinder steigen in eine Zeitmaschine und reisen durch Gegenwart, Vergangenheit und Zukunft: Präsens, Präteritum, Perfekt und Futur.

**Live-Version:** https://mitlaeuferfotografie.github.io/zeitreise/
**Klasse 3:** https://mitlaeuferfotografie.github.io/zeitreise/?stufe=3 (ohne Perfekt)

Gehostet über **GitHub Pages**: Jede Änderung auf `main` wird automatisch gebaut und nach ca. 2 Minuten veröffentlicht (`.github/workflows/pages.yml`).

**Keine externen Dienste:** Systemschrift, Tailwind CSS (v3, erzeugt aus `src/tailwind-input.css`) und alle Bibliotheken werden beim Bauen eingebunden und mit der App ausgeliefert. Kein CDN, kein localStorage, keine Cookies. Der QR-Code im Lehrer-Bereich wird auf dem Gerät erzeugt (`qrcode-generator`, MIT-Lizenz). Der Fortschritt bleibt nur bis zum Schließen der Seite erhalten und wird über den Zeitreise-Code mitgenommen.

**Impressum & Datenschutz:** Komponente `ImpressumModal` in `src/App.jsx`. Erreichbar ohne Passwort über die Anmeldung zum Lehrer-Bereich (Zahnrad) und im Lehrer-Bereich.

**Material:** Alle Sätze, Texte, und Wörterbuch-Ausschnitte der App sind selbst geschrieben.

## Lehrplanbezug

**Lehrplan Deutsch für die Primarstufe in Nordrhein-Westfalen** (RdErl. vom 01.07.2021), Bereich **„Sprache und Sprachgebrauch untersuchen“**, Schwerpunkt **„An Wörtern, Sätzen und Texten arbeiten“**, Kompetenzerwartungen am Ende der Klasse 4 (S. 28). Die Schülerinnen und Schüler …
- „untersuchen Schreibweisen und wenden orthografische und grammatische Regeln an,“
- „setzen Fachbegriffe zu Wörtern, Sätzen und Texten ein,“

Unterrichtsrelevante Begriffe (S. 30), die in der App vorkommen: „Wortstamm“, „Verb: Grundform, gebeugte Form“, „Zeitstufen: Gegenwart, Vergangenheitsformen, Zukunft“, „Zeitformen“, „Pronomen (Personalpronomen)“.

Die Bausteine von „Das kann ich schon“ folgen den Kompetenzrastern der Schule: **Klasse 3** Präsens, Präteritum und Futur, **Klasse 4** zusätzlich Perfekt.

Den zweiten Teil des Perfekts (gemalt, gelaufen – fachsprachlich Partizip II) nennt die App wie in der Grundschule üblich **ge-Form**.

Fachwörter stehen immer mit deutscher Erklärung: **Präsens** = Gegenwart · **Präteritum** = Vergangenheit (beim Schreiben) · **Perfekt** = Vergangenheit (beim Erzählen) · **Futur** = Zukunft.

## Farben

Die Zeitformen haben in App, Merksätzen und (später) Arbeitsblättern dieselbe Farbe: **Präsens rot · Präteritum gelb · Perfekt grün · Futur blau**. Wortstamm schwarz unterstrichen, Endung in der Zeitfarbe. Aufgaben mit Farbcodierung stehen auf einer hellen „Leuchttafel“, damit die Farben wie auf dem Papier aussehen.

## 14 Spiele in 8 Stationen (je 10 Sterne)

| Station | Spiele |
|---|---|
| Kontrollraum (Präsens) | **Endungs-Maschine** – passende Endung an den Wortstamm hängen |
| Jetzt oder früher? | **Zeit-Regen** – Schnellspiel: Verbformen fallen, schnell das Tor „jetzt“ (Präsens) oder „früher“ (Präteritum) antippen, Combo und steigendes Tempo · **Finde den Unterschied** – im zweiten Text die veränderten Wörter antippen |
| Präteritum bauen | **te-Werkstatt** – Präteritum regelmäßiger Verben, dann ganze Tabellen · **sein & haben** – Formen in die Tabelle, dann Lückensätze |
| Unregelmäßige Verben | **Wörterbuch-Forscher** – am Wörterbuch-Eintrag regelmäßig/unregelmäßig erkennen und das Präteritum ablesen · **Verb-Familien** – Verben nach ihrem Muster sortieren (singen – sang, trinken – trank) · **Formen-Tabelle** – Formen unregelmäßiger Verben für alle Personen (Einzahl/Mehrzahl) in eine Tabelle schreiben, Klasse 4 auch im Perfekt (ge-Form einmal, Hilfsverb je Person) |
| Texte verwandeln | **Text-Zeitmaschine** – Verben im Text finden und in die neue Zeitform setzen · **Zeit-Chaos reparieren** – Verben finden, die „aus der Zeit gefallen“ sind |
| Perfekt (nur Klasse 4) | **Perfekt-Werkstatt** – haben oder sein? und die ge-Form aus Bausteinen bauen · **Sätze bauen: Perfekt** – Hilfsverb an 2. Stelle, ge-Form am Ende; zum Schluss 3 Sätze selbst tippen |
| Futur | **Sätze bauen: Futur** – Sätze mit werden + Grundform bauen, Fehler finden und reparieren, zum Schluss 3 Sätze selbst tippen |
| Finale: Die Zeitmaschine | **Zeitform-Detektiv** – Zeitform bestimmen, in der zweiten Hälfte mit Fallen |

- **Klasse 3:** 12 Spiele (ohne Station Perfekt). Im Detektiv drei Tore (Präsens, Präteritum, Futur), Futur-Fehler ohne ge-Form.
- **Klasse 4:** alle 14 Spiele, zusätzlich Profi-Aufgaben (z. B. reden – redete, sammeln – ich sammle, ge-Formen ohne ge- oder mit ge- in der Mitte) und die Texte auch im Perfekt.
- Die Aufgaben werden aus einer zentralen Verbliste (`src/verben.js`) und selbst geschriebenen Satzrahmen und Texten (`src/aufgaben.js`) erzeugt. Aufgaben der letzten beiden Runden werden möglichst vermieden.

## Sterne und Freischalten

- Es zählt der **erste Versuch** jeder Aufgabe. Die Punkte werden auf 10 Sterne umgerechnet. Falsch gelöste Aufgaben kommen am Ende noch einmal (ohne Wertung).
- Nach 3 Fehlern in Folge erscheint ein **„Tipp aus der Zeitmaschine!“**. Bei Fast-Treffern gibt es gezielte Hinweise (z. B. „Verben schreibt man klein.“, „Nach einem langen a schreibt man ß.“, „gehen ist unregelmäßig – schau ins Wörterbuch!“).
- Jedes Spiel zählt mit seinem besten Ergebnis. **9 Sterne** schalten das nächste Spiel frei, **10 Sterne** bringen ein Abzeichen.
- Von Anfang an frei: Endungs-Maschine, Zeit-Regen, Finde den Unterschied, Wörterbuch-Forscher, Perfekt-Werkstatt und Sätze bauen: Futur. Das Finale öffnet nach der Text-Zeitmaschine und dem Futur (Klasse 4: auch Sätze bauen: Perfekt).
- „Hier weiter!“ zeigt auf der Karte das nächste empfohlene Spiel.

## Spielspaß

- **Zeitenergie:** In allen Spielen lädt jede Aufgabe ohne Fehler ein Feld der Leiste oben. Beim 3. und 4. Feld steigt klein ein Lobwort auf („Weiter so!“, „Fast voll!“). Bei 5 Feldern erscheint groß ein Lobwort über der Aufgabe („Volle Energie!“, „Blitzschnell!“, „Zeitmeister!“ …) und die nächste Energie-Stufe beginnt: Die Leiste wechselt die Farbe (gelb, orange, pink, türkis) und leuchtet stärker. Ein Fehler setzt sie zurück. Die Leiste ändert keine Sterne.
- **Rekord:** Auf der Ergebnis-Seite steht die längste Serie ohne Fehler der Runde und die erreichte Energie-Stufe (im Zeit-Regen: längste Combo). Wird im selben Spiel der eigene Rekord überboten (alter Rekord mindestens 3), erscheint schon während des Spiels „Neuer Rekord!“. Der Rekord gilt nur bis zum Neuladen der Seite und steht nicht im Zeitreise-Code.
- **Belohnung abgestuft:** Nach einer normalen Aufgabe knallt es klein (Lichtblitz, Ring und Funken) dort, wo die richtige Lösung jetzt steht: am fertigen Wort („ich lerne“), an der gefüllten Lücke, an der fertigen ge-Form oder am fertigen Satz. Wo der Knopf selbst die Antwort ist (Detektiv, Richtig oder Fehler?, Wörterbuch-Forscher), knallt es am Knopf, beim Ziehen am Ziel. Das große Feuerwerk (Lichtblitz, Ring, viele große Funken) gibt es nur für große Leistungen: eine ganze Tabelle, einen Text, das Sortieren aller Familien, die letzte Aufgabe einer Runde und volle Zeitenergie.
- **Zeit-Regen:** 30 Verbformen, Combo-Anzeige (ab 3 Treffern in Folge leuchtet sie, ab 6 brennt sie), das Tempo steigt mit jedem Wort, Klasse 3 etwas langsamer. Ein heruntergefallenes Wort zählt für die Sterne als Fehler, nicht für „Das kann ich schon“. Auch mit Tastatur spielbar: ← oder 1 = jetzt, → oder 2 = früher.
- **Ziehen:** Bei sein & haben, in der Tabelle der te-Werkstatt und bei den Verb-Familien werden Wörter und Karten mit dem Finger, Stift oder der Maus ins Ziel gezogen. Antippen und dann das Ziel antippen geht weiterhin.
- **Sätze selbst schreiben:** In „Sätze bauen: Perfekt“ und „Sätze bauen: Futur“ steht am Ende dreimal ein Satz im Präsens da, das Kind schreibt ihn komplett um. Richtig sind beide Wortstellungen mit dem Hilfsverb an 2. Stelle („Ich habe ein Eis gekauft.“ / „Ein Eis habe ich gekauft.“). Die App nennt den konkreten Fehler (falsches Hilfsverb, falsche ge-Form, Wortstellung, Groß-/Kleinschreibung). Großbuchstabe am Satzanfang und Punkt zählen nicht als Fehler, es kommt nur ein Hinweis. Nach 3 Fehlversuchen steht der Satz da.

## Hilfen für die Kinder (Kopfleiste)

- **Merksätze** in zwei Bereichen: *Zeitformen* (Präsens, Präteritum, Perfekt, Futur, alle Zeitformen) und *Weitere Regeln* (Jetzt oder früher?, regelmäßig oder unregelmäßig?, sein und haben, Verb-Familien, Formen-Tabelle, haben oder sein?, Texte verwandeln, aus der Zeit gefallen). Beim ersten Öffnen eines Spiels erscheint sein Merksatz.
- **Reise-Hilfe:** für jedes Spiel „So funktioniert’s“ und „Das lernst du“.
- **Das kann ich schon:** 7 Bausteine (Zeitform erkennen · Präsens · Präteritum regelmäßiger Verben · unregelmäßige Verben, auch sein und haben · Text in eine andere Zeitform setzen · Perfekt · Futur). Gewertet werden die letzten bis zu 10 ersten Versuche je Baustein: 💪 Kann ich! (ab 90 %) · 🙂 Fast! (ab 70 %) · 🎯 Übe ich noch · 🔍 noch zu wenig Aufgaben (unter 4). In Klasse 3 ohne Perfekt.

## Erkunde die Zeiten (Werkzeug ohne Sterne)

Für die digitale Tafel und das iPad: Ein Satz steht groß in der Mitte. Mit dem Regler oder großen Pfeil-Knöpfen reist er durch einen kurzen Zeittunnel mit Uhr zwischen Präteritum, Perfekt, Präsens und Futur (Klasse 3 ohne Perfekt); unter jedem Fachwort steht die deutsche Bedeutung. Was sich ändert, leuchtet in der Zeitfarbe; bei Perfekt und Futur zeigt ein Bogen die zwei Teile des Verbs. Knöpfe: anderer Satz, anderes Personalpronomen, regelmäßiges/unregelmäßiges Verb. Immer offen, auch über den Lehrer-Bereich.

## Zeitreise-Code

- **14 Zeichen** (`XXXX-XXXXX-XXXXX`): Sterne aller 14 Spiele + Stufen der 7 Bausteine + 1 Prüfzeichen gegen Tippfehler. Alphabet ohne I, L, O, U; O/I/L werden beim Eintippen als 0/1/1 gelesen.
- Derselbe Code gilt in Klasse 3 und 4 (und später in der Basis-Version).
- Die Reihenfolge der Spiele und Bausteine ist Teil des Formats – neue Spiele oder Bausteine brauchen ein neues Code-Format.

## Lehrer-Bereich (Zahnrad)

Mit Passwort (`ADMIN_PASSWORD` in `src/App.jsx`): Stufe wählen, Animationen ein/aus, Link und QR-Code für die Klasse, alles freischalten, Grundlagen abschließen, Fortschritt löschen, „Das kann ich schon“, Erkunde die Zeiten, Impressum & Datenschutz.

**Link-Parameter:**
- `?stufe=3` – Klasse 3 (ohne Perfekt). Ohne Parameter: Klasse 4.
- `?anim=0` – ohne Zeitsprung-Animationen (sie fallen auch weg, wenn am Gerät „Bewegung reduzieren“ eingestellt ist).

## Was als richtig gilt

- Getippte Verbformen müssen genau stimmen (ß, ie, Doppelkonsonanten, Umlaute); Leerzeichen am Rand sind egal. Großschreibung eines Verbs ist ein Fehler. Getippt wird nur das Verb, das Personalpronomen steht da.
- Jedes Verb hat genau eine richtige Form; Verben mit Doppelformen und Modalverben kommen nicht vor. Ausnahme: „ich sammele“ gilt neben „ich sammle“ auch als richtig.
- Jedes Verb hat genau ein Hilfsverb (z. B. ich bin geschwommen, ich bin geflogen, ich habe gezogen). Die Sätze passen zu dieser Bedeutung.
- Die Zeitform zählt nach der Form, nicht nach der Bedeutung. Es gibt keine Aufgabe „Präteritum oder Perfekt – was ist richtig?“.
- Beim Satzbauen ist jede Reihenfolge richtig, bei der das Hilfsverb an 2. Stelle und ge-Form bzw. Grundform am Ende stehen.
- Jede Auswahl-Aufgabe hat genau eine richtige Antwort; die Ablenker folgen typischen Kinderfehlern (gehte, gegeht, ihr seit, er hat gelauft).

## Arbeitsblätter

Arbeitsblatt-Generator zum Ausdrucken (A4 hoch, Druck über den Browser). Zugang ohne Passwort über das blasse Drucker-Symbol oben neben dem Zahnrad, außerdem über den Knopf „Arbeitsblätter“ im Lehrer-Bereich.

**Bedienung:** Blatttyp wählen, Klasse 3 oder 4, je nach Blatt die Zeitform, „Lösungsblatt dazu“. „Neue Aufgaben“ mischt neu, „Drucken“ oben rechts. Im Druckfenster „A4“ und „Ränder: keine“ wählen; für Farbe „Hintergrundgrafiken“ einschalten. Die Blätter funktionieren auch in Schwarz-Weiß (Zeitformen sind immer auch mit Namen beschriftet).

**Nummer:** Jedes Blatt hat eine 4-stellige Nummer in der Fußzeile, auch auf der Lösung. Gibt man sie im Generator ein (gleiche Klasse und Einstellung), entsteht genau dieses Blatt noch einmal.

| Blatt | Aufgabe |
|---|---|
| Formen-Tabelle | Formen mit „ich“ eintragen wie in der Prüfung: Präsens und Präteritum (Klasse 4 auch Perfekt und Futur) |
| Endungen einsetzen | Endung an den unterstrichenen Wortstamm setzen und einkreisen (Präsens, Präteritum oder gemischt) |
| Personalformen | Ein regelmäßiges und ein unregelmäßiges Verb in allen Personen, Präsens und Präteritum |
| Lückentext | Ein Text der App mit Lücken und Grundform in Klammern; Zeitform wählbar (Klasse 4 auch Perfekt und Futur) |
| Zeitform bestimmen | Verb unterstreichen und die Zeitform ankreuzen |
| Verb-Familien | Verbpaare aus dem Kasten in die Häuser ihrer Familie schreiben |

Jedes Blatt beginnt mit einem gelösten Beispiel (gestrichelter Rahmen, Stern). Lösungen stehen in Violett. Wo geschrieben wird: Klasse 3 Zebra-Lineatur ohne Häuschen, Klasse 4 einfache Linien. Alle Aufgaben kommen aus denselben Datenlisten wie die Spiele. Quartett, Würfelspiel und Mini-Übungsheft folgen.

## Lokal bauen und testen

Git Bash im Repo-Ordner:
```
bash werkzeuge/lokal_bauen.sh
node werkzeuge/server.mjs
```
Dann http://localhost:5173/ öffnen. Weitere Prüf-Werkzeuge (Formenliste, Aufgabenliste mit automatischer Prüfung, Testspieler) beschreibt `werkzeuge/README.md`.

## Geplant

- **Arbeitsblätter, Teil 2:** Quartett unregelmäßiger Verben, Würfelspiel „Zeitreise“, Mini-Übungsheft.
- **Basis-Version** unter `…/zeitreise/basis/` mit Vorlesen, weniger Aufgaben und ohne Profi-Aufgaben (Etappe 3). Vorlesen gibt es nur dort.
