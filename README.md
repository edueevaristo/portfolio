# Eduardo Evaristo — portfólio

Portfólio com foto colorida na home, apresentação profissional, projetos e laboratório interativo de tecnologias. Interface em preto, branco e verde `#9dff6a`.

## Desenvolvimento

Node.js 22+ e npm:

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

O conteúdo publicável fica em `dist/`. O endpoint PHP de contato é preservado. Credenciais não devem entrar no repositório. Enviar os assets antes de `index.html` ao publicar.

## Laboratório de tecnologias

A seção `#technologies` substitui a antiga árvore por uma instalação de hardware em miniatura: um processador central conectado a seis módulos. A foto e os ajustes de navegação/Sobre permanecem.

- `js/technology-lab/data.js`: seis áreas e 25 tecnologias.
- `js/technology-lab/model.js`: peças arredondadas, materiais PBR, vidro, metal, circuitos e contatos instanciados.
- `js/technology-lab/scene.js`: Three.js r185, iluminação de ambiente, bloom moderado, circuitos animados, seleção por raycast e enquadramento limitado.
- `js/technology-lab/index.js`: abas acessíveis, teclado, seleção de tecnologias, GSAP e carregamento progressivo.
- `css/technology-lab.css`: apresentação, painel responsivo, mapa alternativo e foto da home.
- `css/portfolio-theme.css`: paleta e ajustes globais preservados da identidade visual.
- `css/presentation.css`: hierarquia de Sobre e navegação consistente.

As abas destacam as stacks principais e os módulos 3D exibem seus nomes na própria instalação. Um clique no módulo seleciona a área correspondente e revela todas as ferramentas relacionadas. Setas, Home e End navegam pelas abas. O mapa HTML/SVG preserva toda a navegação se o WebGL falhar.

## Performance e acessibilidade

O runtime Three.js é carregado somente perto da seção. Desktop usa DPR máximo 1,5 e multisampling; mobile usa DPR 1 sem multisampling, com navegação de página preservada por toque. A qualidade diminui se a renderização permanecer lenta. A cena interrompe a renderização fora da tela, em abas ocultas e quando está pausada/estável.

`prefers-reduced-motion` é respeitado. A cena mantém a informação em HTML, sem depender do canvas. Não há métricas fictícias de desempenho ou operações reais de infraestrutura: o modelo é uma representação visual.

## Validação

`npm test` verifica ordem dos menus/rodapé, âncoras, tecnologias, módulos 3D, reutilização de geometria e retirada da antiga experiência da página.

Verificar também no navegador:

- abas, raycast, pausa, restauração e teclado;
- mobile em 390 px, sem overflow e sem prender o scroll;
- fallback após perda de WebGL e movimento reduzido;
- home, Sobre, menus e projetos;
- HTML e assets publicados contra o build local.

Os arquivos da antiga árvore foram retirados do runtime e sua implementação anterior pode ser recuperada no Git. Imagens-fonte antigas foram preservadas no repositório, mas não são usadas pela página nem pelo fallback.
