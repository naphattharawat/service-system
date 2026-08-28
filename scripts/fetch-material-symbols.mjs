// One-time setup: downloads the Material Symbols Rounded icon font so it can
// be self-hosted via next/font/local instead of loaded from fonts.gstatic.com
// at runtime. Hospital/government networks commonly allowlist
// fonts.googleapis.com but block fonts.gstatic.com (where the actual font
// file lives), which breaks every icon in the app. Run this once from a
// machine with normal internet access:
//   node scripts/fetch-material-symbols.mjs
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CSS_URL =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,300,0,0&display=swap";
const APP_FONTS_DIR = path.join(path.dirname(path.dirname(fileURLToPath(import.meta.url))), "app/fonts");

const cssRes = await fetch(CSS_URL, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Accept: "text/css,*/*;q=0.1",
  },
});
if (!cssRes.ok) throw new Error(`Failed to fetch font CSS: ${cssRes.status}`);
const css = await cssRes.text();

const match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.(woff2|ttf|woff))\)/);
if (!match) throw new Error(`Could not find a font URL in the fetched CSS:\n${css}`);

const [, fontUrl, ext] = match;
const fontRes = await fetch(fontUrl);
if (!fontRes.ok) throw new Error(`Failed to fetch font file: ${fontRes.status}`);
const buffer = Buffer.from(await fontRes.arrayBuffer());

const outPath = path.join(APP_FONTS_DIR, `material-symbols-rounded.${ext}`);
await writeFile(outPath, buffer);
console.log(`Saved ${buffer.length} bytes to ${outPath}`);
if (ext !== "woff2") {
  console.warn(
    `Got a .${ext} file instead of .woff2 (the request wasn't recognized as a browser that supports woff2). ` +
      "Update the src path in app/layout.tsx to match, or re-run with a tool that sends full browser headers (e.g. curl with a browser User-Agent)."
  );
}
