#!/usr/bin/env bash
# farbvorschau.sh – baut die Vergleichsseite werkzeuge/farbvorschau.jsx nach _site/farbvorschau.html (nicht für die Live-Seite).
# Vorher einmal: bash werkzeuge/lokal_bauen.sh (legt build/node_modules an). Ansehen: node werkzeuge/server.mjs
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p build/werkzeuge && cp werkzeuge/farbvorschau.jsx build/werkzeuge/
cd build
npx esbuild werkzeuge/farbvorschau.jsx --bundle --minify --jsx=automatic --define:process.env.NODE_ENV='"production"' --outfile=../_site/farbvorschau.js
npx tailwindcss@3 -i src/tailwind-input.css -o ../_site/farbvorschau.css --content "werkzeuge/farbvorschau.jsx" --minify
cd ..
cat > _site/farbvorschau.html <<'HTML'
<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Farbvorschau – Zeitreise</title><link rel="stylesheet" href="farbvorschau.css"></head>
<body class="bg-slate-950"><div id="root"></div><script src="farbvorschau.js"></script></body></html>
HTML
echo "Fertig: _site/farbvorschau.html"
