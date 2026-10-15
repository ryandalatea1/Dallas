# Dalas Marketing — site oficial

Site institucional e portfólio da **Dalas Marketing**: criação de sites, painéis, sistemas sob medida e gestão de tráfego.

Feito com [Vite](https://vite.dev), [GSAP](https://gsap.com) (ScrollTrigger + SplitText), [Lenis](https://lenis.darkroom.engineering) e [Three.js](https://threejs.org) para os objetos 3D.

## Rodando localmente

```bash
npm install
npm run dev      # abre em http://localhost:5173
npm run build    # gera a pasta dist/
npm run preview  # testa a build
```

## Onde editar

| O quê | Onde |
| --- | --- |
| Textos, títulos e seções | `index.html` |
| WhatsApp, e-mail e Instagram dos botões | `src/config.js` |
| Cores, fontes e espaçamentos | `src/styles/main.css` (bloco `:root`) |
| Logo, favicon, imagem de compartilhamento | `public/images/`, `public/favicon.png`, `public/og.jpg` |
| Objetos 3D (formas, posições, materiais) | `src/modules/floaters.js` (lista `presets`) |
| Etiquetas do caminho do cliente no hero | `index.html` (lista `.hero__chips`, posição em `--x`/`--y`) |
| Miniaturas de interface (serviços e projetos) | `src/modules/mocks.js` |

Preencha `src/config.js` para os botões **Iniciar projeto** e os links do rodapé funcionarem:

```js
export const siteConfig = {
  whatsapp: '5511999999999',
  whatsappMessage: 'Olá! Quero iniciar um projeto com a Dalas Marketing.',
  email: 'contato@dalasmarketing.com.br',
  instagram: '@dalasmarketing',
};
```

## Efeitos

- Abertura com logo, contador e cortina (mais curta a partir da segunda visita).
- Objetos 3D cromados flutuando no hero e na seção de contato (Three.js), com parallax de mouse e rotação com o scroll.
- Rede de pontos e linhas no hero, com as etiquetas do caminho do cliente ligadas em sequência e um pulso percorrendo o trajeto.
- Título revelado letra a letra, com a segunda linha em degradê prata.
- Barra de navegação em pílula de vidro que some ao descer e volta ao subir.
- Scroll suave (Lenis) e faixa contínua de serviços.
- Linha do processo que se preenche com o scroll e acende cada etapa.
- Grade de serviços com miniaturas de interface em CSS e borda que acompanha o cursor.
- Manifesto que acende palavra por palavra.
- Projetos em rolagem horizontal fixada na tela.
- Botões magnéticos e menu em tela cheia no celular.
- Tudo respeita `prefers-reduced-motion` e tem foco visível por teclado.

## Publicação

- **GitHub Pages**: o workflow em `.github/workflows/deploy.yml` publica a cada push na `main`. Em *Settings → Pages*, escolha **GitHub Actions** como fonte.
- **Vercel / Netlify**: importe o repositório; o build é `npm run build` e a saída é `dist/`.

Os caminhos da build são relativos (`base: './'`), então a mesma build funciona em subpasta (`/Dallas/`) ou em domínio próprio.
Ao ter um domínio, atualize a tag `og:image` no `index.html`.

## Próximos passos

- Substituir os projetos de exemplo por cases reais (imagens em `public/images/`, cards em `index.html`).
- Adicionar os efeitos das próximas referências.
