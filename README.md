# Eduardo Evaristo | Portfólio

Portfólio pessoal com apresentação, projetos, habilidades, tecnologias e contato. A interface mantém a paleta preta, branca e verde `#9dff6a`; as fotos e os projetos preservam suas cores originais.

## Desenvolvimento

Requer Node.js 22+ e npm:

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

O conteúdo publicável fica em `dist/`. O build preserva o endpoint PHP de contato. Credenciais não devem ser incluídas no repositório. Na publicação, envie os assets antes de `index.html`.

## Conteúdo

- `index.html`: conteúdo do portfólio e grade de tecnologias.
- `images/stack-icons/`: ícones locais das tecnologias exibidas na seção Sobre.
- `css/styles.css`, `css/portfolio-theme.css` e `css/presentation.css`: layout, paleta e apresentação responsiva.
- `js/main.js`: navegação, movimento, filtros de projetos e formulário de contato.

## Validação

Além de `npm test` e `npm run build`, confira no navegador a home, a grade de tecnologias, os projetos e o contato em desktop e celular. Verifique se os ícones carregam e se não há rolagem horizontal. Após publicar, valide os mesmos pontos no endereço público.

`npm run optimize:images` recria variantes das fotos e imagens de projetos.
