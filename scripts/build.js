#!/usr/bin/env node
/**
 * Build script for the "file-icons-vscode" icon theme.
 *
 *  1. Loads the association maps from `src/` (extensions, file names,
 *     folder names, language ids).
 *  2. Collects every icon name they reference.
 *  3. Checks `icons/<name>.svg` for each one; if it is missing, a neutral
 *     placeholder SVG is generated so the theme always renders.
 *  4. Picks the default icons: `file.svg` / `folder.svg` / `folder_open.svg`
 *     when your pack provides them, hand-drawn `_file` / `_folder` /
 *     `_folder_open` fallbacks otherwise.
 *  5. Writes the VS Code icon-theme manifest to `fileicons.json`
 *     and an `icons-preview.html` to eyeball the whole set at once.
 *
 * Usage:  node scripts/build.js [--strict]
 *     --strict   exit with code 1 when placeholder icons were generated
 *                (useful in CI to enforce a complete icon pack)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import fileExtensions from '../src/fileExtensions.js';
import fileNames from '../src/fileNames.js';
import folderNames from '../src/folderNames.js';
import languageIds from '../src/languageIds.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = path.join(rootDir, 'icons');
const themeFile = path.join(rootDir, 'fileicons.json');
const previewFile = path.join(rootDir, 'icons-preview.html');
const missingFile = path.join(rootDir, 'missing-icons.txt');
const strict = process.argv.includes('--strict');

const PLACEHOLDER_MARKER = '<!-- auto-generated-placeholder -->';

/* ------------------------------------------------------------------ */
/* Placeholder SVGs                                                    */
/* ------------------------------------------------------------------ */

function hashName(str) {
  let h = 0;
  for (const ch of str) h = (h * 31 + ch.codePointAt(0)) | 0;
  return Math.abs(h);
}

/** HSL → hex, so the fill works in every SVG renderer (no `hsl()` syntax). */
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const to255 = (x) =>
    Math.round(255 * x)
      .toString(16)
      .padStart(2, '0');
  return `#${to255(f(0))}${to255(f(8))}${to255(f(4))}`;
}

function placeholderSvg(name) {
  const label =
    name
      .replace(/^_+/, '')
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 3)
      .toUpperCase() || '?';
  const hue = hashName(name) % 360;
  const fill = hslToHex(hue, 42, 52);
  const fontSize = label.length >= 3 ? 4.6 : 5.6;
  return [
    PLACEHOLDER_MARKER,
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">',
    `  <rect x="0.5" y="0.5" width="15" height="15" rx="3.5" fill="${fill}"/>`,
    `  <text x="8" y="10.7" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="bold" fill="#ffffff" text-anchor="middle">${label}</text>`,
    '</svg>',
    '',
  ].join('\n');
}

/** Hand-drawn fallbacks for the three associations every theme needs. */
const SPECIAL_SVGS = {
  _file: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
  <path fill="#9ca3af" d="M9.7 1H4.2C3.54 1 3 1.54 3 2.2v11.6c0 .66.54 1.2 1.2 1.2h7.6c.66 0 1.2-.54 1.2-1.2V4.3L9.7 1z"/>
  <path fill="#d1d5db" d="M9.7 1 13 4.3H9.7V1z"/>
</svg>
`,
  _folder: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
  <path fill="#dcb67a" d="M1.6 2.5h4.2l1.3 1.6h7.3c.61 0 1.1.49 1.1 1.1v7.9c0 .61-.49 1.1-1.1 1.1H1.6c-.61 0-1.1-.49-1.1-1.1V3.6c0-.61.49-1.1 1.1-1.1z"/>
</svg>
`,
  _folder_open: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
  <path fill="#dcb67a" d="M1.6 2.5h4.2l1.3 1.6h7.3c.61 0 1.1.49 1.1 1.1v1.3H1.6V3.6c0-.61.49-1.1 1.1-1.1z"/>
  <path fill="#e9c68d" d="M1.2 6.8h13.9l-1.5 6.2c-.14.56-.64.95-1.21.95H2.41c-.57 0-1.07-.39-1.21-.95V6.8z"/>
</svg>
`,
};

/* ------------------------------------------------------------------ */
/* Icon helpers                                                        */
/* ------------------------------------------------------------------ */

let realCount = 0;
let placeholderCount = 0;
const placeholderNames = [];

const svgPath = (name) => path.join(iconsDir, `${name}.svg`);
const hasSvg = (name) => fs.existsSync(svgPath(name));

function ensureSvg(name) {
  const p = svgPath(name);
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf8');
    if (content.includes(PLACEHOLDER_MARKER)) {
      placeholderCount++;
      placeholderNames.push(name);
    } else {
      realCount++;
    }
    return;
  }
  fs.writeFileSync(p, SPECIAL_SVGS[name] ?? placeholderSvg(name), 'utf8');
  if (SPECIAL_SVGS[name])
    realCount++; // fallbackهای دست‌ساز واقعی‌اند
  else {
    placeholderCount++;
    placeholderNames.push(name);
  }
}

/* ------------------------------------------------------------------ */
/* Maps                                                                */
/* ------------------------------------------------------------------ */

function normalize(map, label) {
  const out = {};
  for (const [key, value] of Object.entries(map)) {
    if (typeof value !== 'string') {
      console.warn(`⚠ ${label}: skipped "${key}" — value must be a string`);
      continue;
    }
    out[key.toLowerCase()] = value;
  }
  return out;
}

const fileExtensionsMap = normalize(fileExtensions, 'fileExtensions');
const fileNamesMap = normalize(fileNames, 'fileNames');
const folderNamesMap = normalize(folderNames, 'folderNames');
const languageIdsMap = normalize(languageIds, 'languageIds');
const folderNamesExpandedMap = { ...folderNamesMap }; // same icon when expanded

const referenced = new Set();
for (const value of [fileExtensionsMap, fileNamesMap, folderNamesMap, languageIdsMap].flatMap(Object.values)) {
  referenced.add(value);
}

const pick = (...candidates) => candidates.find(hasSvg);
const defaultFileIcon = pick('file') ?? '_file';
const defaultFolderIcon = pick('folder') ?? '_folder';
const defaultFolderOpenIcon = pick('folder_open', 'folder-open') ?? '_folder_open';
referenced.add(defaultFileIcon).add(defaultFolderIcon).add(defaultFolderOpenIcon);
/* ------------------------------------------------------------------ */
/* Generate                                                            */
/* ------------------------------------------------------------------ */

fs.mkdirSync(iconsDir, { recursive: true });
for (const name of [...referenced].sort()) ensureSvg(name);

const sortedObj = (obj) => Object.fromEntries(Object.entries(obj).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));

const iconDefinitions = {};
for (const name of [...referenced].sort()) {
  iconDefinitions[name] = { iconPath: `./icons/${name}.svg` };
}

const theme = {
  iconDefinitions,
  file: defaultFileIcon,
  folder: defaultFolderIcon,
  folderExpanded: defaultFolderOpenIcon,
  rootFolder: defaultFolderIcon,
  fileExtensions: sortedObj(fileExtensionsMap),
  fileNames: sortedObj(fileNamesMap),
  languageIds: sortedObj(languageIdsMap),
  hidesExplorerArrows: false,
};

fs.writeFileSync(themeFile, JSON.stringify(theme, null, 2) + '\n', 'utf8');
JSON.parse(fs.readFileSync(themeFile, 'utf8')); // sanity check: must be valid JSON

/* ------------------------------------------------------------------ */
/* Reports                                                             */
/* ------------------------------------------------------------------ */

if (placeholderCount > 0) {
  fs.writeFileSync(
    missingFile,
    placeholderNames
      .sort()
      .map((n) => `${n}.svg`)
      .join('\n') + '\n',
    'utf8'
  );
} else if (fs.existsSync(missingFile)) {
  fs.unlinkSync(missingFile);
}

const usedFiles = new Set([...referenced].map((n) => `${n}.svg`));
const unused = fs.readdirSync(iconsDir).filter((f) => f.endsWith('.svg') && !usedFiles.has(f));

const cards = [...referenced]
  .sort()
  .map((name) => `      <span class="card"><img src="./icons/${name}.svg" alt="${name}" loading="lazy">${name}</span>`)
  .join('\n');
const preview = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>file-icons-vscode — icon preview</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; margin: 24px auto; max-width: 1200px; padding: 0 16px; background: #14161a; color: #e6e6e6; }
  h1 { font-size: clamp(1.1rem, 3vw, 1.5rem); }
  p { color: #9aa0a6; font-size: 13px; }
  .grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .card { display: inline-flex; align-items: center; gap: 8px; background: #1d2025; border: 1px solid #2e3238; border-radius: 8px; padding: 6px 10px; font-size: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  img { width: 16px; height: 16px; }
</style>
</head>
<body>
<h1>file-icons-vscode — icon preview (${referenced.size} icons)</h1>
<p>Generated by <code>scripts/build.js</code>. Gray squares are auto-generated placeholders for SVGs that are not in <code>icons/</code> yet — drop your real SVGs in and run the build again.</p>
<div class="grid">
${cards}
</div>
</body>
</html>
`;
fs.writeFileSync(previewFile, preview, 'utf8');

/* ------------------------------------------------------------------ */
/* Summary                                                             */
/* ------------------------------------------------------------------ */

console.log('──────────────────────────────────────────────────────────');
console.log(`✔ fileicons.json written (${Object.keys(iconDefinitions).length} icon definitions)`);
console.log(
  `  associations  : ${Object.keys(fileExtensionsMap).length} extensions · ${Object.keys(fileNamesMap).length} file names · ${Object.keys(folderNamesMap).length} folders · ${Object.keys(languageIdsMap).length} language ids`
);
console.log(`  icons         : ${referenced.size} referenced → ${realCount} real SVG · ${placeholderCount} placeholder`);
console.log(`  defaults      : file=${defaultFileIcon}`);
console.log(`  preview       : icons-preview.html`);
if (placeholderCount > 0) {
  console.log(`  ⚠ missing SVGs: full list in missing-icons.txt`);
  console.log(
    `    e.g. ${placeholderNames.slice(0, 30).join(', ')}${placeholderNames.length > 30 ? ` … (+${placeholderNames.length - 30} more)` : ''}`
  );
}
if (unused.length > 0) {
  console.log(`  ℹ ${unused.length} SVGs in icons/ are not referenced by any map (first 10: ${unused.slice(0, 10).join(', ')})`);
}
if (strict && placeholderCount > 0) process.exitCode = 1;
