import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const images = fileURLToPath(new URL('../images/', import.meta.url));
const output = `${images}optimized/`;
await mkdir(output, { recursive: true });

// Keep the supplied artwork intact; the desktop frame is composed in CSS.
for (const [version, widths] of [['desktop', [1440, 1932]], ['mobile', [480, 941]]]) {
  for (const width of widths) {
    const asset = sharp(`${images}yggdrasil-${version}.png`).resize({ width });
    for (const format of ['avif', 'webp']) {
      const file = `${output}yggdrasil-${version}-${width}.${format}`;
      const result = await asset.clone()[format]({ quality: 82, effort: 6 }).toFile(file);
      console.log(`${version} ${width} ${format}: ${Math.round(result.size / 1024)} KB`);
    }
  }
}
