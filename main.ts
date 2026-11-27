// main.ts — DealOrDud's hand-in program (Node 22, standard library only).
// The site itself is the static app/ folder beside this file: plain HTML,
// CSS and ES modules a browser opens with no build step and no network.
// This program copies app/ and screenshots/ into the output directory and
// writes dossier.json there with the vendored make.fun library, byte for
// byte as the scorer's own copy writes it (vendor/ stays untouched).
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(root, 'app'), join(outDir, 'app'), { recursive: true });

const shotsFrom = join(root, 'screenshots');
if (existsSync(shotsFrom)) {
  mkdirSync(join(outDir, 'screenshots'), { recursive: true });
  cpSync(shotsFrom, join(outDir, 'screenshots'), { recursive: true });
}

// The dossier caps are the scorer's own: at most 4 screenshots of at most
// 256 KiB each, at most 993 files and 16 MiB in app/, text capped at
// 163,840 bytes — an entry over any of them is one the scorer would refuse.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

// A one-line receipt on stdout helps a local run confirm what was handed in;
// the grader ignores it.
console.log(`DealOrDud handed in: app/ + screenshots/ copied, dossier.json ${dossier.length} bytes.`);
