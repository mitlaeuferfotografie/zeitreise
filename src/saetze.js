// ============================================================================
// SÄTZE – alle Texte, die die App vorlesen kann, jeweils mit festem Schlüssel
// ============================================================================
// Die App liest über sprich('<schlüssel>') vor: zuerst die Gerätestimme.
// Später: Thorsten-Datei public/audio/thorsten/saetze/<schlüssel>.mp3 – dann ohne Code-Änderung (siehe CLAUDE.md).
// Schlüssel nie umbenennen, sonst passen erzeugte Tondateien nicht mehr.
// Verbformen, die das Kind selbst bilden soll, stehen hier nie ausgeschrieben (Lückensätze mit „…“).
// Anführungszeichen: „ (U+201E) und “ (U+201C).

export const SAETZE = {
  // Start und Karte
  karte_einladung: 'Steig in die Zeitmaschine und reise durch Gegenwart, Vergangenheit und Zukunft!',   // in beiden Stufen gleich (Wunsch der Lehrkraft)
  belohnung: 'Du hast alle Abzeichen gesammelt. Die Zeitreise ist geschafft!',

  // Kurzbeschreibung der Spiele (Schlüssel spiel_<id>)
  spiel_endungJetzt: 'Setze die richtige Endung an das Verb.',
  spiel_tore: 'Jetzt oder früher? Tippe schnell das richtige Tor!',
  spiel_zwillinge: 'Finde die Wörter, die sich verändert haben.',
  spiel_teWerkstatt: 'Baue das Präteritum mit -te.',
  spiel_seinHaben: 'Übe sein und haben im Präsens und im Präteritum.',
  spiel_woerterbuch: 'Regelmäßig oder unregelmäßig? Schau ins Wörterbuch.',
  spiel_familien: 'Sortiere die Verben in ihre Familien-Häuser.',
  spiel_treppe: 'Schreibe alle Formen in die Tabelle.',
  spiel_textmaschine: 'Verwandle einen ganzen Text in eine andere Zeitform.',
  spiel_perfektWerkstatt: 'Wähle haben oder sein und baue die ge-Form.',
  spiel_klammerPerfekt: 'Bringe die Satzbausteine in die richtige Reihenfolge.',
  spiel_futur: 'Baue Sätze im Futur mit werden.',
  spiel_detektiv: 'Bestimme die Zeitform. Vorsicht, Fallen!',
  spiel_zeitchaos: 'Finde die Verben, die aus der Zeit gefallen sind.',

  // Deutsche Erklärungen der Fachwörter (Schlüssel deutsch_<zeit>), werden vor dem Merksatz einer Zeitform vorgelesen
  deutsch_praesens: 'Präsens bedeutet Gegenwart.',
  deutsch_praeteritum: 'Präteritum bedeutet Vergangenheit, meistens beim Schreiben.',
  deutsch_perfekt: 'Perfekt bedeutet Vergangenheit, meistens beim Erzählen.',
  deutsch_futur: 'Futur bedeutet Zukunft.',

  // Merksätze (Schlüssel merksatz_<id>), Wortlaut nach dem Auftrag „Fachlicher Rahmen“
  merksatz_praesens: 'Das Präsens zeigt, was jetzt geschieht oder sich immer wiederholt. Der Wortstamm bleibt gleich, die Endung zeigt die Person.',
  merksatz_erkennen: 'Präsens: Es geschieht jetzt. Präteritum: Es ist früher geschehen. Achte auf die Form des Verbs.',
  merksatz_praeteritum: 'Das Präteritum erzählt von Vergangenem, meistens beim Schreiben, zum Beispiel in Geschichten und Berichten. Regelmäßige Verben bekommen -te.',
  merksatz_seinHaben: 'Die Verben sein und haben sind unregelmäßig. Ihre Formen musst du dir gut merken.',
  merksatz_unregelmaessig: 'Bekommt das Verb im Präteritum nur -te und bleibt der Wortstamm gleich? Dann ist es regelmäßig. Sonst ist es unregelmäßig. Unregelmäßige Verben findest du im Wörterbuch: Hinter der Grundform stehen weitere Formen.',
  merksatz_familien: 'Viele unregelmäßige Verben ändern im Präteritum ihren Vokal auf dieselbe Art. Sie gehören zu einer Familie.',
  merksatz_treppe: 'Unregelmäßige Verben musst du dir merken: Grundform, Präteritum und ge-Form.',
  merksatz_text: 'Wenn du einen Text in eine andere Zeitform setzt, verwandelst du jedes Verb.',
  merksatz_zeitchaos: 'Eine Geschichte bleibt in ihrer Zeitform. Ein Verb in einer anderen Zeitform ist aus der Zeit gefallen.',
  merksatz_perfekt: 'Das Perfekt erzählt von Vergangenem, meistens beim mündlichen Erzählen. Es hat zwei Teile: haben oder sein in der Personalform und die ge-Form am Satzende.',
  merksatz_hilfsverb: 'Du nimmst sein bei einer Bewegung von einem Ort zum anderen oder bei einer Veränderung, außerdem bei sein, bleiben und werden. Sonst nimmst du haben.',
  merksatz_futur: 'Das Futur sagt, was in der Zukunft passiert. Es hat zwei Teile: werden in der Personalform und die Grundform am Satzende.',
  merksatz_detektiv: 'Die Zeitform erkennst du an der Form des Verbs, nicht an der Bedeutung des Satzes.',
};
