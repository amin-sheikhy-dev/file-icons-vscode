/**
 * Build a partial map that assigns every name in `files` to a single icon name.
 *
 * Example:  make(["mp3", "wav"], "audio")  →  { mp3: "audio", wav: "audio" }
 *
 * @param {string[]} files  File names or extensions (lower-cased automatically).
 * @param {string} icon     Icon name, must match an SVG in the `icons/` folder.
 * @returns {Record<string, string>}
 */
export function make(files, icon) {
  if (!Array.isArray(files)) {
    throw new TypeError("make() expects an array of file names as its first argument");
  }
  return Object.fromEntries(files.map((file) => [String(file).toLowerCase(), icon]));
}
