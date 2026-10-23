# Chamada final com fumaça · script

Esta pasta é a seção completa e independente. Não precisa de build nem de biblioteca.

## Ver funcionando

Abra `index.html` no navegador (dois cliques no arquivo). A fonte vem do Google Fonts, então com internet fica igual ao site.

## Colocar em outro site

1. Copie `chamada-final.css`, `chamada-final.js` e `wing-outline.png` para o projeto.
2. Cole o bloco `<section class="final">…</section>` do `index.html` onde a seção deve aparecer.
3. Inclua o CSS no `<head>` e, no fim do `<body>`:

```html
<script src="./chamada-final.js"></script>
<script>
  ChamadaFinal.init(document.querySelector('.final'));
</script>
```

4. Troque os links dos botões: o primeiro abre o diagnóstico, o segundo o WhatsApp (`https://wa.me/55DDDNUMERO`).

## Gravar o vídeo de novo

Abra `index.html?gravar`: tudo fica parado e cada quadro é desenhado com `window.__frame(segundos)`. Foi assim que os vídeos da pasta `video/` foram gerados (30 quadros por segundo, 12 segundos).
