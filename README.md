# Eduardo Evaristo — portfólio

Portfólio pessoal com foto colorida na home, projetos e árvore de tecnologias 3D interativa na seção de competências. Interface em preto, branco e verde `#9dff6a`; fotos e projetos mantêm suas cores originais.

## Desenvolvimento

Node.js 22+ e npm:

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

O conteúdo publicável fica em `dist/`. O build preserva o endpoint PHP de contato. Credenciais não devem ser incluídas no repositório. Na publicação, enviar os assets antes de `index.html`.

## Stack e árvore 3D

- Vite 8.2, Three.js r185, GSAP 3.15 e Lenis 1.3.
- Foto da home com variantes AVIF/WebP; o runtime 3D só é importado quando a seção está próxima da tela.
- `js/knowledge-tree/data.js`: nomes, posições e textos dos 25 nós. Substitua os placeholders `[CONTEÚDO SOBRE ...]` por relatos reais em primeira pessoa. Nenhuma experiência foi inventada.
- `js/knowledge-tree/geometry.js`: madeira volumétrica procedural, tronco entrelaçado, raízes com LOD, galhos ramificados, veias sobre a superfície e folhas instanciadas.
- `js/knowledge-tree/scene.js`: OrbitControls, seleção por raycast, rótulos HTML, zoom GSAP, energia, partículas e gerenciamento de recursos.
- `js/knowledge-tree/index.js`: carregamento progressivo, painel, lista acessível, teclado, movimento reduzido e fallback.
- `css/knowledge-tree.css`: foto, seção interativa, controles e painel responsivo.

O pós-processamento usa os módulos oficiais de Three.js: RenderPass, SSAOPass, UnrealBloomPass, ShaderPass (vinheta/grão) e OutputPass. O RenderPass deve permanecer habilitado: SSAOPass multiplica a imagem existente, não substitui a renderização de beleza.

## Interação e qualidade adaptativa

Arraste para orbitar, use a roda/pinça para aproximar e selecione um nó ou uma tecnologia na lista. O painel mostra o placeholder correspondente. “Voltar”, Escape ou clique no espaço livre da cena restauram a câmera; “Visão geral” restaura o enquadramento inicial. O movimento automático pode ser pausado.

Desktop usa SSAO, bloom e resolução limitada a DPR 1,5. Celulares/aparelhos modestos usam DPR 1, menos folhas/partículas e bloom sem SSAO. Quadros persistentemente lentos reduzem a qualidade. A renderização pausa fora da tela e em abas ocultas. `prefers-reduced-motion` desliga a rotação e os movimentos contínuos inicialmente, preservando a exploração manual.

Sem WebGL, a arte estática e a lista acessível permanecem disponíveis. Não há garantia de desempenho idêntico em todo aparelho. A árvore é uma criação procedural em tempo real inspirada na referência, não um asset fotogramétrico ou render offline idêntico à imagem.

## Validação

`npm test` cobre os nomes obrigatórios, placeholders, geometria volumétrica finita, normais externas, instancing e LOD. Além do build, conferir no navegador:

- home e seção 3D em desktop e celular, sem overflow horizontal;
- seleção de raízes/copa, zoom, retorno, órbita e pausa;
- Tab/Enter/Escape, movimento reduzido e perda de contexto WebGL;
- asset e interação no endereço publicado após deploy.

`npm run optimize:images` recria variantes de imagens. A arte anterior em `images/optimized/yggdrasil-isolated-*.webp` é somente fallback; os módulos antigos de árvore 2.5D não são importados pela página.
