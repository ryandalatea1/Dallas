# Dalas Marketing — site oficial

Site da **Dalas Marketing** (Grupo Kairos): sites, anúncios no Instagram e no Google, CRM e automações, do clique à venda. Escuro, prata e névoa, com o ouro e o verde da marca nos detalhes.

Stack: [Vite](https://vite.dev) + JavaScript em módulos e [GSAP](https://gsap.com) (ScrollTrigger). Sem framework: estático, rápido e publica em qualquer hospedagem.

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/
npm run preview  # testa a build
```

## Seções

1. **Abertura**: a asa da marca, DALAS letra por letra e um risco de luz (uma vez por visita).
2. **Hero** "Do clique à venda.": constelação de pontos e uma órbita de luz que percorre a jornada do cliente (anúncio, site, WhatsApp, CRM, venda), acendendo cada etapa.
3. **Faixa** com os canais e serviços.
4. **Site comum x Site Dalas**: os três pontos acendem com o scroll e o celular troca de um site genérico para um site de verdade que rola sozinho.
5. **01 Site + anúncios**: o celular mostra o anúncio no Instagram, o site e a conversa no WhatsApp, em loop, com duas marcas de exemplo.
6. **Onde a venda se perde**: parágrafo que acende palavra por palavra e a história do cliente que esfriou, contada pelo scroll (22:07 até 09:14).
7. **O relógio de bolso**: preso na tela em quatro momentos (tempo, segundos, minutos, Dalas); os ponteiros disparam e no fim se alinham no 12.
8. **02 CRM + automações**: um cliente atravessa o funil do Dalas CRM (novo, em conversa, venda).
9. **A tempestade**: o lobo correndo na chuva, com raios ao fundo.
10. **Como a Dalas trabalha**: linha do tempo central que se preenche com o scroll.
11. **Quem cuida da sua conta**: Ryan Dalatea (CEO da Dalas Marketing) e Gustavo Licks (Kairos Growth).
12. **Dúvidas** e **chamada final** com fumaça sedosa em WebGL e mostradores girando.
13. **Rodapé** com DALAS gigante, demonstrações e contato.

Extras: questionário "Diagnóstico grátis" (7 passos, termina com a mensagem pronta no WhatsApp), botão do WhatsApp que pode ser arrastado, cronômetro de voltar ao topo cujo ponteiro marca o quanto da página foi lido, grão de filme.

## Onde editar

| O quê | Onde |
| --- | --- |
| WhatsApp, e-mail, Instagram, vídeo do lobo | `src/config.js` |
| Textos de todas as seções | `index.html` |
| Perguntas do diagnóstico | `src/modules/diag.js` (`STEPS`) |
| Marcas e mensagens do celular do card 01 | `src/modules/ad-phone.js` (`BRANDS`) |
| Clientes do kanban do card 02 | `src/modules/kanban.js` (`LEADS`) |
| Cores, tipografia, espaçamentos | `src/styles/main.css` (bloco `:root`) |
| Logo (asa) | `public/images/brand/` |
| Fotos da equipe | `public/images/team/ryan.jpg` e `gustavo.jpg` (quadradas; sem a foto, aparecem as iniciais) |
| Telas dos celulares | `public/images/phone/` |
| Sites de demonstração e CRM | `public/demos/<nome>/index.html` |
| Favicon e imagem de compartilhamento | `public/favicon.png`, `public/og.jpg` |

## Performance

Scroll nativo, canvases em resolução baixa e a 30 quadros por segundo no celular, tudo pausado fora da tela, vídeo carregado só quando a seção se aproxima, `prefers-reduced-motion` respeitado.

## Versões guardadas

- `versao-lobo`: o site anterior, com o lobo na abertura, CRM e sites de exemplo.
- `versao-anterior`: a versão antes dessa.

Para voltar a uma delas: `git checkout versao-lobo`, ou peça que ela seja restaurada na `main`.

## Publicação

- **GitHub Pages**: o workflow em `.github/workflows/deploy.yml` publica a cada push na `main`.
- **Vercel / Netlify**: build `npm run build`, saída `dist/`.

Caminhos relativos (`base: './'`): a mesma build funciona em subpasta ou domínio próprio. Com domínio, atualize `og:image` e `canonical` no `index.html`.
