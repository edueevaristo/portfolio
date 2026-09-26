import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../images/yggdrasil-isolated.png', import.meta.url));
for (const width of [480, 800, 1254]) {
  const destination = fileURLToPath(new URL(`../images/optimized/yggdrasil-isolated-${width}.webp`, import.meta.url));
  const result = await sharp(source).resize({ width }).webp({ quality: 83, effort: 6 }).toFile(destination);
  console.log(`${width}px: ${Math.round(result.size / 1024)} KB`);
}
