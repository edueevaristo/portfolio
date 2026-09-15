# Eduardo Evaristo: Portfolio AAA

Portfólio de Eduardo Evaristo, Full Stack Engineer e Creative Developer. A experiência foi reconstruída com direção editorial, motion design orientado à narrativa e performance progressiva.

## Rodando localmente

Requisitos: Node.js 22+ e npm.

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
npm run preview
```

O resultado publicável fica em `dist/`.

## Stack

- Vite 8.2
- GSAP 3.15: ScrollTrigger, Flip, Observer, SplitText, MorphSVG, DrawSVG e CustomEase
- Lenis 1.3.25
- Arte Yggdrasil responsiva em AVIF/WebP, sem runtime 3D no hero
- HTML semântico e CSS responsivo sem framework visual
- Sharp para geração reproduzível de AVIF/WebP responsivos

## Scripts

- `npm run dev`: desenvolvimento com HMR
- `npm run build`: bundle de produção
- `npm run preview`: serve o build localmente
- `npm run optimize:images`: recria variantes AVIF/WebP em `images/optimized/`

## Qualidade

O site respeita `prefers-reduced-motion` e navegação por teclado. A árvore é visível mesmo sem JavaScript ou WebGL; a imagem tem prioridade de carregamento e variantes responsivas.

Leia [docs/AAA-REDESIGN.md](docs/AAA-REDESIGN.md) para a auditoria, direção de design, mapa de motion e contrato do asset Blender.

## Árvore de conexões

O hero usa as artes definitivas fornecidas por Eduardo. No desktop, `images/yggdrasil-desktop.png` preserva a terceira referência: o enquadramento em `css/yggdrasil.css` mostra apenas a árvore à direita, enquanto o texto e os links à esquerda continuam em HTML. No celular, `images/yggdrasil-mobile.png` mostra a arte vertical completa, abaixo da apresentação. Os rótulos fazem parte da imagem original e também possuem uma descrição acessível.

A interface usa preto, branco e verde `#9dff6a`, com variações de transparência e luminosidade. Fotografias e capturas dos projetos mantêm suas cores originais. A cena procedural anterior permanece no histórico de implementação, mas não é importada pelo site.

Para recriar as variantes otimizadas, preservando as imagens originais:

```bash
node scripts/optimize-yggdrasil.mjs
```

Ao alterar o hero, validar o build, a composição em 1932 × 814, os breakpoints de desktop e celular, os links e os estados do formulário.
