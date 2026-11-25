/**
 * Media file lists (replacement for the source project's `data/media.ts`).
 * These are spread into the extension map with a generic icon:
 *   make(audio, "audio"), make(video, "video"), make(image, "image")
 *
 * Extensions that have a dedicated icon in `fileExtensions.js`
 * (mp3, ogg, wav, mp4, mov, jpg, png, gif, ico, webp, svg, psd, …)
 * are intentionally NOT listed here — their explicit entries win anyway.
 */

export const audio = [
  "aac", "aif", "aifc", "aiff", "ape", "au", "flac", "m4a", "m4b", "mka",
  "mid", "midi", "mpega", "mps", "oga", "opus", "ra", "rm", "snd", "wave", "wma",
];

export const video = [
  "3gp", "avi", "flv", "m4v", "mkv", "mpeg", "mpg", "ogv", "webm", "wmv",
];

export const image = [
  "avif", "bmp", "dib", "exr", "heic", "heif", "icns", "jpe", "jxl",
  "pbm", "pgm", "pnm", "ppm", "raw", "tga", "tif", "tiff", "xcf",
];
