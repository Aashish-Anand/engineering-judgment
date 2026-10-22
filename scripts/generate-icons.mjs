// Run from any directory with: node scripts/generate-icons.mjs
// Render the editable vector into Apple and legacy browser formats.
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const app = new URL("../app/", import.meta.url);
const svg = await readFile(new URL("icon.svg", app));
const sizes = [16, 32, 48, 64];
const images = await Promise.all(sizes.map(size => sharp(svg).resize(size, size).png().toBuffer()));

// ICO directory followed by PNG payloads, one entry for each tab/display size.
const header = Buffer.alloc(6 + images.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = header.length;
images.forEach((png, index) => {
  const entry = 6 + index * 16;
  header[entry] = sizes[index];
  header[entry + 1] = sizes[index];
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(png.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += png.length;
});
await writeFile(new URL("favicon.ico", app), Buffer.concat([header, ...images]));

// iOS applies its own rounded mask; keep the touch icon background full-bleed.
const appleSvg = svg.toString().replace('rx="14"', 'rx="0"').replace('x="1" y="1" width="62" height="62"', 'x="0" y="0" width="64" height="64"');
await sharp(Buffer.from(appleSvg)).resize(180, 180).png().toFile(fileURLToPath(new URL("apple-icon.png", app)));
console.log("Generated favicon.ico (16/32/48/64 px) and apple-icon.png (180 px).");
