// Kleiner Webserver zum lokalen Testen (ohne Zusatzpakete):
//   node werkzeuge/server.mjs        → http://localhost:5173/  (ab Etappe 3 auch /basis/)
// Zeigt den Inhalt von _site/ (vorher bauen: bash werkzeuge/lokal_bauen.sh).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '_site');
const port = Number(process.env.PORT) || 5173;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8' };

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p);
  if (!file.startsWith(root)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) {
      // Ordner ohne Schrägstrich (…/basis) → wie GitHub Pages weiterleiten
      if (fs.existsSync(path.join(file, 'index.html'))) { res.writeHead(301, { Location: p + '/' }); res.end(); return; }
      res.writeHead(404); res.end('nicht gefunden'); return;
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(port, () => console.log(`Zeitreise: http://localhost:${port}/`));
