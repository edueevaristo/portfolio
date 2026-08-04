# Redesign AAA: direção, arquitetura e motion

## 1. Diagnóstico do portfólio anterior

### Percepção de valor

- O hero se posicionava como “site a partir de R$500”. Essa âncora fazia o visitante comparar preço, não competência, e entrava em conflito direto com uma proposta premium.
- Partículas azuis, cards homogêneos e uma estética “tech neon” genérica não criavam uma assinatura autoral.
- Os projetos apareciam como galeria. Faltavam escala visual, contexto, decisões e provas que se comportassem como mini case studies.
- Sobre, serviços, currículo e skills repetiam informação. A página acumulava conteúdo, mas não construía uma narrativa.

### Motion e interação

- O canvas atualizava 600 partículas continuamente, inclusive quando não contribuía para a leitura.
- Lenis era alimentado por `requestAnimationFrame` próprio e também pelo ticker do GSAP, duplicando trabalho por frame.
- Havia reveals e hovers isolados, mas não um sistema de timing, easings ou continuidade espacial.
- Não existiam reduced-motion, transição de rota preparada, gestos, morphing SVG ou split de texto semântico.

### Performance e qualidade

- Imagens JPG eram carregadas sem `loading=lazy`, `decoding=async`, `srcset` ou formatos modernos.
- Fonte, ícones e bibliotecas dependiam de três CDNs no caminho crítico.
- O formulário exibia “mensagem enviada” sem enviar nada.
- O menu não atualizava completamente seu estado ARIA e o site não oferecia skip link.
- Não havia build, tree-shaking, code splitting ou contrato de budget.

## 2. Conceito: Precision in Motion

O conceito troca “tecnologia decorativa” por engenharia visível. A identidade usa preto mineral, branco quente e verde-sinal. O verde não é ornamento: ele marca disponibilidade, direção, foco e estado ativo.

A hierarquia combina tipografia de escala editorial com interfaces compactas de produto. A frase “Do sistema à experiência” condensa o posicionamento: integrações e arquitetura sólidas por dentro, clareza e percepção de qualidade por fora.

Princípios:

1. Clareza vence ruído: cada bloco orienta, prova ou converte.
2. Motion é informação: movimento mostra ordem, causalidade e continuidade.
3. Performance é design: o custo de cada efeito é proporcional ao seu valor narrativo.

## 3. Arquitetura implementada

```text
index.html
├── hero tipográfico + fallback SVG
├── manifesto editorial
├── trabalho selecionado + filtros
├── expertise horizontal
├── trajetória
└── contato validado

js/main.js
├── motion e navegação
├── Lenis + ScrollTrigger
├── acessibilidade e formulários
└── import() da cena somente após intenção

js/scene.js
├── Three.js + PBR + RoomEnvironment
├── carregador GLB opcional
└── escultura procedural de fallback
```

O bundle separa motion, scroll e 3D. Three.js custa aproximadamente 152 KB gzip, mas não participa do carregamento inicial. Ele é solicitado no primeiro movimento de ponteiro, wheel ou touch; após sete segundos existe um fallback de inicialização para desktop ocioso. Mobile, data saver, baixa memória e reduced-motion nunca baixam esse chunk.

## 4. Mapa exato de motion

| Recurso | Uso atual | Intenção |
|---|---|---|
| GSAP timeline | loader, hero e menu | sequencing contínuo |
| ScrollTrigger | parallax, batch, scrub e pin | ligar movimento à leitura |
| Flip | filtro Todos/Destaques | preservar continuidade espacial |
| Observer | direção do marquee por wheel/touch | resposta gestual sem controlar a página |
| SplitText | hero e títulos editoriais | revelar linguagem em ritmo |
| MorphSVG | marca EE no header | identidade viva e estado de navegação |
| DrawSVG | loader e ícones de expertise | comunicar construção e progresso |
| CustomEase | easing `premium` | consistência de aceleração |
| Lenis | scroll principal | inércia suave integrada ao ticker do GSAP |
| Three.js | escultura PBR do hero | profundidade e interação progressiva |

O trilho de expertise usa pin, scrub e snap no desktop. No mobile ele se torna scroll-snap nativo, mantendo gestos e reduzindo complexidade.

## 5. Bibliotecas e versões

```json
{
  "gsap": "3.15.0",
  "lenis": "1.3.25",
  "three": "0.185.1",
  "vite": "8.2.0",
  "sharp": "0.35.3"
}
```

GSAP 3.13+ disponibiliza oficialmente os plugins usados via npm. Todos são registrados explicitamente para evitar remoção incorreta no tree-shaking.

## 6. Performance medida

Lighthouse 13.4.1 contra o build local de produção em 01/08/2026:

| Perfil | Performance | Acessibilidade | Boas práticas | SEO | FCP | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Mobile | 99 | 100 | 100 | 100 | 1,5 s | 2,0 s | 10 ms | 0 |
| Desktop | 100 | 100 | 100 | 100 | 0,4 s | 0,4 s | 0 ms | 0 |

Esses números são laboratório local, não dados de campo. O LCP mobile ainda não comprova a meta de 1,5 s e INP exige uso real. Depois do deploy, medir com RUM/PostHog ou `web-vitals` durante pelo menos 28 dias antes de declarar Core Web Vitals de produção.

Budgets recomendados:

- HTML + CSS + JS inicial: até 130 KB gzip
- imagem acima da dobra: até 80 KB
- chunk 3D: até 180 KB gzip, sempre progressivo
- GLB: até 350 KB transferido
- texturas: KTX2/Basis, máximo 1024 px
- pixel ratio WebGL: máximo 1.5

## 7. Blender e 3D: fase de arte final

O runtime 3D, materiais PBR, environment map, interação e fallback já estão prontos. A escultura atual é procedural e funciona como placeholder de direção. Não deve ser apresentada como um export do Blender.

Para fechar a exigência de arte 3D autoral:

1. Modelar a escultura `Signal` no Blender, alinhada à forma da marca EE.
2. Aplicar UVs apenas onde textura agrega valor; preferir materiais paramétricos.
3. Exportar `public/models/signal-sculpture.glb` conforme `public/models/README.md`.
4. Adicionar `data-model-url="/models/signal-sculpture.glb"` ao canvas `#hero-webgl`.
5. Comprimir geometria com Draco ou Meshopt e texturas com KTX2.
6. Validar em GPU integrada e Android intermediário antes de ativar fora do desktop.

Essa etapa depende de produção de asset 3D; o código não falsifica sua origem.

## 8. Evolução para posicionamento acima de US$ 90k

O redesign melhora drasticamente percepção e craft, mas ticket alto também precisa de prova comercial. Próximas fases:

### Fase 2: conteúdo e case studies

- Criar páginas próprias para Glittr, Milena Calmona e Giovanni Leme.
- Documentar problema, restrições, papel de Eduardo, processo e resultado.
- Substituir afirmações genéricas por métricas verificáveis: conversão, receita, performance, tempo operacional ou escala.
- Produzir vídeos de interface de 6 a 10 segundos e mockups consistentes.

### Fase 3: arte 3D e transições de rota

- Finalizar o GLB no Blender.
- Usar o hook de page wipe já implementado nas novas rotas.
- Manter estado de scroll e transições com View Transitions API ou router leve; Barba só se houver múltiplos documentos reais.

### Fase 4: produção e observabilidade

- Definir backend do formulário (serverless com honeypot, rate limit e consentimento). O formulário estático atual valida os dados e prepara um e-mail; não simula envio.
- Configurar cache imutável para assets com hash, Brotli e HTTP/2 ou HTTP/3.
- Adicionar CSP, headers de segurança, analytics com consentimento e RUM.
- Executar QA em Safari iOS, Chrome Android, teclado, screen reader e dispositivos com baixa potência.

## 9. Checklist de deploy

- Executar `npm ci && npm run build`.
- Publicar somente `dist/`.
- Confirmar `robots.txt` e `sitemap.xml` na raiz pública.
- Configurar cache longo para `/assets/*` e cache curto para HTML.
- Validar formulário e links externos no domínio final.
- Rodar Lighthouse no domínio com cache frio e repetir três vezes.
- Habilitar o GLB somente depois do budget e QA descritos acima.
