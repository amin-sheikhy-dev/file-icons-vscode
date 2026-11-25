# Changelog

## 0.1.0 — 2026-11-25

- Initial scaffold of the file icon theme extension.
- Mapping tables converted 1:1 from the TypeScript source to ESM JavaScript (`src/fileExtensions.js`, `src/fileNames.js`).
- `scripts/build.js` generates `fileicons.json`, auto-creates placeholder SVGs for missing icons and writes an `icons-preview.html`.
- Default file / folder icons with automatic detection of `file.svg`, `folder.svg`, `folder_open.svg` from your pack.
