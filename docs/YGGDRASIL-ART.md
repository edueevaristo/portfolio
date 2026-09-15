# Arte Yggdrasil isolada

Ferramenta: geração/edição de imagens integrada (sem CLI/API externa).

Arquivo final: `images/yggdrasil-isolated.png`; variantes WebP em `images/optimized/yggdrasil-isolated-{480,800,1254}.webp`.

A primeira edição refinou o volume do tronco, folhas e raízes. A ferramenta retornou um quadriculado pintado, sem canal alpha; por isso a edição final abaixo substituiu esse fundo por preto uniforme. No site preto, a composição `screen` elimina visualmente o fundo, sem paisagem. O PNG não é um recorte com transparência alpha. Os efeitos de profundidade, pulsos e partículas são animados separadamente em `js/tree-energy.js`.

## Prompt final utilizado

> Precise background edit of the supplied image. Keep the realistic 3D luminous Yggdrasil tree EXACTLY as it is, with every white technology label, leaf, bark detail, bright green light filament and roots unchanged. The image has an unwanted baked gray checkerboard. Replace ONLY ALL gray checkerboard pixels and all spaces surrounding and between branches and roots with perfectly uniform PURE BLACK (#000000). No checkerboard, no gray, no environment, no mist, no mountains, no ground, no rectangular halo. A beautifully isolated tree against absolutely pure black, ready to blend invisibly into a #000000 web page. Do not add shadows onto a floor. Preserve the same square composition and the original fine leaf silhouettes and energy brightness, leave a small clean black margin around the tips, no crops. Every technology label must remain spelled as in input. Do not render a checkerboard to indicate transparency.
