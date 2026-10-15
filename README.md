# Dallas Marketing — site oficial

Experiência cinematográfica para a **Dallas Marketing**: a floresta noturna desperta, o lobo aparece, a marca se revela, e o scroll atravessa a mata até a luz verde onde o site começa.

Stack: [Vite](https://vite.dev) + JavaScript moderno em módulos, [Three.js](https://threejs.org) (floresta em WebGL), [GSAP](https://gsap.com) (ScrollTrigger e SplitText) e [Lenis](https://lenis.darkroom.engineering) (scroll suave). Sem framework pesado: o site é estático, carrega rápido e publica em qualquer hospedagem.

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/
npm run preview  # testa a build
```

## O lobo

O vídeo do lobo já está incluído em `public/media/` (`wolf-intro.mp4` em 1080p, `wolf-intro-mobile.mp4` na vertical, pôsteres e `wolf-still.jpg` com o olhar final). Para trocar por outro vídeo, basta substituir os arquivos mantendo os nomes, ou apontar novos caminhos em `src/config.js`.

A direção da cena fica em `src/config.js` (`timeline`):

- `brandAt`: segundo do vídeo em que o lobo para e a marca aparece.
- `hold`: depois do fim do vídeo, a câmera avança devagar no rosto dele (`zoom`, `duration`) e o vapor da respiração sai do focinho (`muzzle`, `breathEvery`). As posições são frações do quadro do vídeo.
- `storm`: o primeiro raio cai no mesmo instante do raio do vídeo (`firstStrikeAt`); depois, raios aleatórios entre `every` segundos, com flash no céu e tremor sutil de câmera.
- `ambience.mp3` (opcional): vento e trovão ao longe, ativado só pelo visitante.

Se o vídeo não carregar, a abertura roda com a floresta em WebGL e os raios por cima dela.

## Onde editar

| O quê | Onde |
| --- | --- |
| WhatsApp, e-mail, Instagram, caminhos de mídia, tempos do vídeo | `src/config.js` |
| Textos de todas as seções | `index.html` |
| Cores, tipografia, espaçamentos | `src/styles/main.css` (bloco `:root`) |
| Cena da floresta (quantidade de árvores, névoa, luz verde, câmera) | `src/modules/forest.js` |
| Direção da abertura e da travessia no scroll | `src/main.js` |
| Objetos 3D de cada solução | `src/modules/showcase.js` (função `builders`) |
| Pôsteres e imagens reais dos projetos | `index.html` (atributo `data-image` em cada projeto) |
| Logo, favicon, imagem de compartilhamento | `public/images/`, `public/favicon.png`, `public/og.jpg` |

Política de privacidade e termos de uso: os links do rodapé (`#footer-privacy`, `#footer-terms`) apontam para `#` até você ter as páginas.

## Experiência

- Abertura: tela escura, a lua revela a floresta, a câmera avança devagar. Com o vídeo, o lobo corre, para e respira; o nome DALLAS MARKETING surge letra a letra com luz verde discreta. Barras de cinema saem quando a marca aparece.
- Scroll: o hero fica fixo enquanto a câmera atravessa as árvores, a névoa adensa, a luz esmeralda cresce e a travessia termina numa clareira onde a frase da Dallas surge dentro da luz.
- Sobre: texto acende palavra por palavra, com uma rede de conexões verde ao fundo.
- Soluções: seis cards grandes, cada um com um objeto 3D cromado próprio (um renderizador só para todos), entrada em sequência, inclinação com o mouse e borda luminosa que acompanha o cursor.
- Diferencial: os quatro números surgem e uma linha luminosa os conecta conforme o scroll.
- Projetos: pôsteres com luz aurora e tipografia (ou a foto real do projeto via `data-image`), detalhes em um diálogo. Exemplos marcados como demonstrativos.
- Processo: linha do tempo que se ilumina etapa por etapa.
- Chamada final: silhueta do lobo (ou o seu `wolf-still.jpg`) na névoa, luz verde discreta e o botão para o WhatsApp.
- Rodapé com o nome DALLAS em grande escala ao fundo.
- Performance: WebGL em qualidade reduzida em celulares e máquinas fracas, cena pausada fora da tela, fallback em CSS sem WebGL, `prefers-reduced-motion` respeitado, SEO técnico, Open Graph e dados estruturados.

## Publicação

- **GitHub Pages**: o workflow em `.github/workflows/deploy.yml` publica a cada push na `main` (fonte: GitHub Actions).
- **Vercel / Netlify**: importe o repositório; build `npm run build`, saída `dist/`.

Caminhos relativos (`base: './'`), então a mesma build funciona em subpasta ou em domínio próprio. Com domínio, atualize `og:image` e `canonical` no `index.html`.
