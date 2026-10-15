# Dalas Marketing — site oficial

Site cinematográfico da **Dalas Marketing**: o lobo na abertura, com tempestade e respiração, e as seções deslizando por cima dele.

Stack: [Vite](https://vite.dev) + JavaScript em módulos, [GSAP](https://gsap.com) (ScrollTrigger e SplitText), [Lenis](https://lenis.darkroom.engineering) (scroll suave) e [Three.js](https://threejs.org) só como reserva (floresta em WebGL quando o vídeo não carrega). Sem framework pesado: estático, rápido e publica em qualquer hospedagem.

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/
npm run preview  # testa a build
```

## O lobo

Os vídeos estão em `public/media/`: `wolf-intro.mp4` (1440p, H.264), `wolf-intro.webm` (1080p, VP9), `wolf-intro-mobile.*` (vertical, 720x1280), pôsteres e `wolf-still.jpg` (o olhar final, usado na chamada final). Todos receberam um tratamento de cor cinematográfico (contraste, azul nas sombras, nitidez e vinheta). Para trocar o vídeo, substitua os arquivos mantendo os nomes ou aponte novos caminhos em `src/config.js`.

A direção da cena fica em `src/config.js` (`timeline`):

- `storm`: o primeiro raio cai junto com o raio do vídeo (`firstStrikeAt`); depois, raios aleatórios entre `every` segundos, com flash e tremor sutil.
- `hold`: quando o vídeo termina no olhar, a câmera avança devagar no rosto (`zoom`, `duration`) e o vapor sai do focinho (`muzzle`, `breathEvery`).
- `ambience.mp3` (opcional): vento e trovão, só no clique do visitante.

## Onde editar

| O quê | Onde |
| --- | --- |
| WhatsApp, e-mail, Instagram, mídias, tempos do vídeo | `src/config.js` |
| Textos de todas as seções | `index.html` |
| Cores, tipografia, espaçamentos | `src/styles/main.css` (bloco `:root`) |
| Abertura e transição de scroll | `src/main.js` |
| Raios, estrelas cadentes e vapor | `src/modules/storm.js`, `src/modules/vapor.js` |
| Quadro vivo (pelos, árvores, nuvens, estrelas) | `src/modules/living.js`; máscara do lobo em `src/config.js` (`wolfMask`) |
| Logo, favicon, imagem de compartilhamento | `public/images/`, `public/favicon.png`, `public/og.jpg` |

Política de privacidade e termos de uso: os links do rodapé apontam para `#` até você ter as páginas.

## Experiência

- Abertura: o site aparece na hora (marca, frase, botões) com o lobo correndo ao fundo. Raio junto com o olhar, zoom lento no rosto e vapor da respiração. O último frame vira um quadro vivo em WebGL: pelos ao vento, árvores balançando, nuvens respirando, estrelas piscando, estrelas cadentes e novos raios de tempos em tempos.
- Scroll: o lobo fica preso ao fundo e a página desliza por cima dele, enquanto ele aproxima e escurece.
- Faixa com os serviços, Sobre com os quatro diferenciais ao lado, soluções em grade bento com luz que segue o cursor, processo em linha do tempo, chamada final com o lobo encarando e tempestade ao longe, rodapé com DALAS em grande escala.
- Luz que acompanha o cursor, linha de progresso no topo, menu em tela cheia no celular. Tipografia: Sora nos títulos, Manrope no texto, Cinzel só na marca. Paleta azul-noite e prata.
- Performance: só canvases 2D durante o hero, tudo pausado fora da tela, sem WebGL por padrão, `prefers-reduced-motion` respeitado.

## Publicação

- **GitHub Pages**: o workflow em `.github/workflows/deploy.yml` publica a cada push na `main`.
- **Vercel / Netlify**: build `npm run build`, saída `dist/`.

Caminhos relativos (`base: './'`): a mesma build funciona em subpasta ou domínio próprio. Com domínio, atualize `og:image` e `canonical` no `index.html`.
