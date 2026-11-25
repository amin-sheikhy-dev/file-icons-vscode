# File Icons VSCode

A **file icon theme** extension for Visual Studio Code, built entirely with plain JavaScript (ESM) from your own SVG icon set. No TypeScript, no bundler, no runtime — just mapping tables, one Node build script and a generated theme manifest.

## How it works

```
src/*.js  ──(node scripts/build.js)──▶  fileicons.json  ◀── contributes ──  package.json
  maps                                       ▲
                                        icons/*.svg
```

1. **`src/`** holds the association maps (which extension / file name / language → which icon).
2. **`scripts/build.js`** turns those maps into `fileicons.json`, the manifest VS Code reads, and checks that every referenced icon exists in `icons/`.
3. **`package.json`** contributes the theme: `contributes.iconThemes`.

## Project structure

```
file-icons-vscode/
├── package.json            # extension manifest (iconThemes contribution)
├── fileicons.json          # GENERATED – the icon theme manifest
├── icons/                  # your SVGs: <icon-name>.svg (placeholders auto-generated)
├── src/
│   ├── fileExtensions.js   # extension → icon (654 associations)
│   ├── fileNames.js        # exact file name → icon (935 associations)
│   ├── folderNames.js      # folder name → icon (fill in as needed)
│   ├── languageIds.js      # VS Code language id → icon
│   ├── helper.js           # make(list, icon) helper
│   └── data/
│       ├── media.js        # audio / video / image extension lists
│       └── bundler.js      # webpack config file-name list
├── scripts/
│   └── build.js            # theme generator + validator
├── icons-preview.html      # GENERATED – visual preview of all icons
└── missing-icons.txt       # GENERATED – only present while icons are missing
```

## Quickstart

1. **Add your SVG icons** — copy your icon pack into `icons/`. The file name (without `.svg`) must equal the icon name used in the maps, e.g. `js.svg`, `nestjscontroller.svg`, `typescriptdef.svg`.
2. **Build** (requires only Node.js, no `npm install`):

   ```bash
   node scripts/build.js
   ```

3. **Test** — open the folder in VS Code and press **F5** (or use *Run → Start Debugging*). In the *Extension Development Host* window run **Preferences: File Icon Theme** and pick **File Icons VSCode**.
4. **Package** — see below.

## Build script behavior

- **Placeholders**: any icon referenced by a map but missing from `icons/` gets an auto-generated gray placeholder SVG, so the theme never renders empty. The full list is written to `missing-icons.txt`; copy your real SVGs over them and rebuild.
- **Default icons**: if your pack contains `file.svg`, `folder.svg` or `folder_open.svg`, they are picked automatically as the default file / folder / expanded-folder icons; otherwise hand-drawn fallbacks (`_file`, `_folder`, `_folder_open`) are used.
- **Unused icons**: SVGs present in `icons/` but not referenced by any map are reported at the end of the build.
- **Preview**: `icons-preview.html` shows every icon on a dark background — open it in a browser to see which placeholders still need real artwork.
- **CI**: run `node scripts/build.js --strict` to fail the build while icons are missing.

## Adding associations

Edit the tables in `src/`, then rebuild:

```js
// src/fileExtensions.js        → matches by extension (longest suffix wins)
"cmj": "c",

// src/fileNames.js             → matches the exact (case-insensitive) file name
"vite.config.mts": "vite",

// src/folderNames.js           → matches a folder name
"components": "folder_react",

// src/languageIds.js           → matches the active language id
"handlebars": "handlebars",
```

Icon names must match an SVG file in `icons/` (e.g. icon `vite` → `icons/vite.svg`).

> **Note — scaffold additions**: a handful of very common entries that were missing in the source tables were appended at the bottom of `src/fileExtensions.js` (`py`, `ts`, `json`, `md`, `yaml`, `yml`, `xml`, `php`, `vue`, `lua`, `coffee`, `htm`, `mk`, `r`, `mjs`, `cjs`, `mts`, `cts`, `jsonc`, `pyi`) and `src/fileNames.js` (`.env`, `requirements.txt`, `setup.py`). They are marked with a comment — adjust the icon names to whatever your pack uses, or delete the block.

## Packaging & publishing

```bash
npm install -g @vscode/vsce   # once
vsce package                  # → file-icons-vscode-<version>.vsix
```

Before publishing:

1. Set `publisher` in `package.json` to your Marketplace publisher id.
2. Update `repository`, `displayName`, `description` to your own.
3. `vsce publish -p <token>` — see the [official guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension).

## Credits

Mapping tables are converted 1:1 from the TypeScript source of the icon project you provided (`fileExtensions.ts`, `fileNames.ts`); entry order is preserved so duplicate keys resolve exactly like in the original.
