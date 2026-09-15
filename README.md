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

O hero usa `images/yggdrasil-isolated.png`: árvore de aparência 3D, sem montanhas, paisagem ou névoa. A arte foi refinada com a ferramenta integrada de geração de imagens e composta sobre preto uniforme (o arquivo não possui canal alpha). A mistura `screen` integra o preto ao site, sem moldura visível. Os rótulos permanecem na imagem e possuem uma descrição acessível. Texto e links continuam em HTML.

`js/tree-energy.js` acrescenta efeitos 2.5D: inclinação com perspectiva, pulsos luminosos em trajetórias ramificadas e partículas projetadas em diferentes profundidades. A geometria da árvore é uma imagem renderizada, não um modelo 3D navegável. O canvas é uma melhoria progressiva, pausa fora da tela e em abas ocultas, reduz custo em dispositivos modestos e desativa movimento quando solicitado pelo sistema.

A interface usa preto, branco e verde `#9dff6a`, com variações de transparência e luminosidade. Fotografias e capturas dos projetos mantêm suas cores originais. A cena procedural anterior permanece no histórico de implementação, mas não é importada pelo site.

Para recriar as variantes otimizadas, preservando as imagens originais:

```bash
node scripts/optimize-isolated-tree.mjs
```

Ao alterar o hero, validar o build, a composição em 1932 × 814, os breakpoints de desktop e celular, os links e os estados do formulário.

Prompt final da arte (ferramenta integrada, edição): “Preservar exatamente a árvore Yggdrasil realista em 3D, rótulos tecnológicos, folhas, tronco, raízes e filamentos verdes. Substituir todo o fundo por preto uniforme #000000, incluindo espaços entre galhos e raízes; sem paisagem, montanhas, névoa, piso, cursor ou quadriculado. Manter a árvore inteira, enquadramento quadrado e brilho localizado.”
