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
- Three.js 0.185.1, carregado sob demanda
- HTML semântico e CSS responsivo sem framework visual
- Sharp para geração reproduzível de AVIF/WebP responsivos

## Scripts

- `npm run dev`: desenvolvimento com HMR
- `npm run build`: bundle de produção
- `npm run preview`: serve o build localmente
- `npm run optimize:images`: recria variantes AVIF/WebP em `images/optimized/`

## Qualidade

O site respeita `prefers-reduced-motion`, navegação por teclado e contraste WCAG AA. WebGL não é baixado em dispositivos estreitos, data saver, baixa memória ou reduced-motion.

Leia [docs/AAA-REDESIGN.md](docs/AAA-REDESIGN.md) para a auditoria, direção de design, mapa de motion e contrato do asset Blender.

## Árvore de conexões

O hero usa filamentos procedurais em Three.js, pulsos de energia e nós tecnológicos inspirados em uma árvore de universos. Os caminhos determinísticos estão em `js/tree-paths.js`; `js/scene.js` anima a cena, pausa fora da tela e libera os recursos ao perder o contexto WebGL.

Para recriar a ilustração usada em celulares, dispositivos econômicos e movimento reduzido:

```bash
node scripts/generate-tree-fallback.mjs
```

Validação desta alteração: build de produção, inspeção visual em desktop e 390 × 844, console sem erros e ausência de overflow horizontal no celular.
