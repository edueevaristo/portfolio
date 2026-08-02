import { mkdir, readdir } from 'node:fs/promises';
import { join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const sourceDir = fileURLToPath(new URL('../images/', import.meta.url));
const outputDir = fileURLToPath(new URL('../images/optimized/', import.meta.url));
await mkdir(outputDir, { recursive: true });

const files = (await readdir(sourceDir)).filter((file) => /\.(jpe?g|png)$/i.test(file));

for (const file of files) {
  const source = join(sourceDir, file);
  const base = parse(file).name;
  const image = sharp(source).rotate().resize({ width: 1600, withoutEnlargement: true });
  const smallWidth = base === 'perfil' ? 480 : 720;
  const small = sharp(source).rotate().resize({ width: smallWidth, withoutEnlargement: true });

  await Promise.all([
    image.clone().avif({ quality: 56, effort: 6 }).toFile(join(outputDir, `${base}.avif`)),
    image.clone().webp({ quality: 76, effort: 6 }).toFile(join(outputDir, `${base}.webp`)),
    small.clone().avif({ quality: 54, effort: 6 }).toFile(join(outputDir, `${base}-sm.avif`)),
    small.clone().webp({ quality: 74, effort: 6 }).toFile(join(outputDir, `${base}-sm.webp`)),
  ]);

  console.log(`optimized: ${file}`);
}
