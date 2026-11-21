#!/usr/bin/env bash
# lokal_bauen.sh – baut die App nach _site/ (dieselben Schritte wie .github/workflows/pages.yml, das dieses Skript aufruft).
# Aufruf im Repo-Ordner (Git Bash):  bash werkzeuge/lokal_bauen.sh   danach  node werkzeuge/server.mjs  → http://localhost:5173/
# Abhängigkeiten: Node 20 + npm (lädt react, lucide-react, qrcode-generator, esbuild, tailwindcss fest versioniert nach build/).
#
# Schalter BASIS: Der Quelltext fragt __BASIS__ ab. Heute wird nur die normale Version gebaut (__BASIS__=false).
# Etappe 3: zweiter Bau mit --define:__BASIS__=true nach _site/basis/ (Muster: Redezeichen-Helden, werkzeuge/bauen.sh).
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf _site build/src
mkdir -p build _site
cp -r src build/src
cd build
if [ ! -d node_modules/qrcode-generator ]; then
  { [ -f package.json ] || npm init -y > /dev/null; }
  npm install --silent react@18.1.0 react-dom@18.1.0 lucide-react@^0.577.0 qrcode-generator@1.4.4 esbuild tailwindcss@3
fi
npx esbuild src/index.js --bundle --minify --loader:.js=jsx --jsx=automatic \
  --define:process.env.NODE_ENV='"production"' --define:__BASIS__=false --outfile=../_site/bundle.js
# Tailwind wird beim Bauen erzeugt (kein CDN, keine Verbindung zu Drittanbietern)
npx tailwindcss@3 -i src/tailwind-input.css -o ../_site/tailwind.css \
  --content "src/**/*.{js,jsx},../public/index.html" --minify
cd ..
node -e "
  const fs = require('fs');
  let h = fs.readFileSync('public/index.html', 'utf8');
  h = h.replace(/<script type=\"module\"[^>]*><\/script>/, '');
  // Versionsnummer an die Dateien hängen: So holt jedes iPad nach einem Update die neue Fassung
  const v = (process.env.GITHUB_SHA || String(Date.now())).slice(0, 8);
  h = h.replace('href=\"tailwind.css\"', 'href=\"tailwind.css?v=' + v + '\"');
  h = h.replace('</body>', '  <script src=\"bundle.js?v=' + v + '\"></script>\n  </body>');
  fs.writeFileSync('_site/index.html', h);
"
# mitliefern, falls vorhanden
for d in fonts audio bilder modelle vosk; do if [ -d public/$d ]; then cp -r public/$d _site/$d; fi; done
if [ -f public/apple-touch-icon.png ]; then cp public/apple-touch-icon.png _site/; fi
touch _site/.nojekyll
echo "Fertig: _site/"
