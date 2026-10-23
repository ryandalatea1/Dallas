# Prompt · Chamada final com fumaça sedosa (Dalas Marketing)

Seção salva a pedido do Ryan em 23/10/2026. É a última seção do site, logo antes do rodapé: "Sua próxima venda começa agora."

**Como usar:** mande este arquivo (ou só diga "coloca de volta a chamada final com fumaça") e a seção volta para o site. O código completo está na pasta `script/` e também no fim deste arquivo, então ele funciona mesmo fora do repositório.

**Vídeos de referência:** `video/chamada-final-desktop.mp4` (1920x1080) e `video/chamada-final-celular.mp4` (1080x1920).

---

## O prompt

Copie o bloco abaixo inteiro.

```text
Crie a seção final (chamada para ação) do site da Dalas Marketing, logo antes do rodapé, com id="contato".

FORMATO
- Um cartão grande com cantos arredondados de 26px, afastado das bordas da tela (12px no celular, até 24px no desktop), borda de 1px branca a 7% e altura mínima de 92% da tela.
- Fundo do cartão: degradê radial de #1a1a1f no centro para #070708 nas bordas.
- Tudo centralizado na horizontal e na vertical.

CAMADAS (de trás para a frente)
1. Fumaça sedosa em WebGL ocupando o cartão inteiro: dobras de seda em tons de prata que se mexem devagar,
   como tecido ou fumaça densa. O centro, atrás do texto, é mais escuro; a seda aparece mais nas bordas.
   Vinheta escura nas pontas. Desenhada em resolução baixa (50% no desktop, 35% no celular) e esticada,
   a 30 quadros por segundo, e só anima quando a seção está na tela. Use exatamente o shader FRAG
   que está no JavaScript no fim deste arquivo.
   Aparece com fade de 1,4 s.
2. Dois mostradores de relógio girando, centralizados:
   - Anel A: 120 marcas num círculo (raio 480 num viewBox 1000x1000), uma marca longa (34) a cada 5 e as
     outras curtas (40% disso), traço branco a 35%, largura min(1300px, 125vmin), gira 360° em 120 s no
     sentido horário.
   - Anel B: 60 marcas (raio 400, longa 18 a cada 5) e um círculo fino de raio 372, branco a 18%,
     largura min(1000px, 96vmin), gira em 200 s no sentido anti-horário.
3. A asa da logo da Dalas só em contorno fino branco, opacidade 16%, largura min(560px, 60vmin), no centro.
4. O conteúdo.

CONTEÚDO
- Título em duas linhas, fonte Plus Jakarta Sans, tamanho clamp(3rem, 7.6vw, 7rem), entrelinha 0.98,
  espaçamento entre letras -0.05em, largura máxima 12ch:
  "Sua próxima venda" em peso 300 (fino), branco #ececf0;
  "começa agora." em peso 800, com degradê prata vertical (#ffffff 0%, #f1f1f4 38%, #a2a2ad 100%)
  aplicado palavra por palavra.
- Parágrafo (36px abaixo, largura máxima 46ch, cor #d6d6dc, tamanho clamp(1.05rem, 1.4vw, 1.25rem),
  entrelinha 1.62): "7 perguntas rápidas. A gente analisa e te responde no WhatsApp com três coisas:
  o que o cliente entende quando te vê hoje, onde ele desiste e o que fazer primeiro."
- Botões, empilhados e centralizados, 40px abaixo:
  1. "Diagnóstico grátis": pílula branca (#f5f5f7) com texto preto, 58px de altura, fonte 17px peso 600,
     círculo preto de 44px à direita com seta diagonal (↗) branca; brilho branco suave em volta
     (0 0 0 1px branco 40% + 0 12px 40px -12px branco 45%). No hover a seta gira 45°.
     Abre o questionário de diagnóstico.
  2. Texto pequeno "Prefere conversar direto?" (14px, cinza #8a8a94).
  3. "Chamar no WhatsApp": pílula de vidro (fundo branco 4%, borda branca 12%), 52px, com o ícone do
     WhatsApp verde (#25d366) num círculo verde a 12%. Abre o WhatsApp.

ANIMAÇÃO DE ENTRADA (quando a seção aparece)
- As palavras do título sobem uma a uma: começam 70% abaixo, invisíveis e com desfoque de 8px, e chegam
  nítidas em 1,1 s, com 45 ms entre uma palavra e outra, curva cubic-bezier(0.16, 1, 0.3, 1).
- Parágrafo e botões sobem 30px saindo de um desfoque de 6px, um depois do outro.

CELULAR
- Mesma composição; os botões ocupam a largura toda, com o texto à esquerda e o ícone à direita.

DESEMPENHO E ACESSIBILIDADE
- Fumaça só roda com a seção visível, em resolução baixa e a 30 fps.
- Com "reduzir movimento" ativado no aparelho: anéis parados, fumaça parada, texto sem animação.
- Fumaça, anéis e asa são decorativos (aria-hidden).
```

---

## Detalhes técnicos

| Item | Valor |
| --- | --- |
| Arquivos no site atual | `index.html` (bloco "CHAMADA FINAL"), `src/styles/main.css` (bloco "chamada final"), `src/modules/final.js` |
| Arquivos independentes | `script/index.html`, `script/chamada-final.css`, `script/chamada-final.js`, `script/wing-outline.png` |
| Contorno da asa | `public/images/brand/wing-outline.png` no site; cópia em `script/wing-outline.png` |
| Fonte | Plus Jakarta Sans 300, 400, 600 e 800 (Google Fonts) |
| Velocidade da fumaça | `uTime` avança 1 por segundo; o shader usa `uTime * 0.05`. Para mais rápida, troque 0.05 por 0.08 |
| Brilho da fumaça | `vec3(0.5, 0.51, 0.55)` no fim do shader. Mais forte: 0.62. Mais suave: 0.4 |
| Centro escuro | `center = 0.32 + 0.68 * ...`. Para clarear atrás do texto, suba 0.32 |
| Gravar vídeo de novo | Abra `script/index.html?gravar` e chame `window.__frame(segundos)` a cada quadro |

---

## Código completo

### HTML (página de demonstração, abre direto no navegador)

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Chamada final · Dalas Marketing</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="./chamada-final.css" />
    <style>
      html,
      body {
        margin: 0;
        background: #050506;
      }

      body {
        min-height: 100vh;
        padding-top: clamp(12px, 1.7vw, 24px);
      }

      /* ao gravar, a seção ocupa a tela inteira */
      .gravar body {
        padding: 0;
      }

      .gravar .final {
        margin: 0;
        min-height: 100vh;
        border-radius: 0;
        border: 0;
      }
    </style>
    <script>
      if (location.search.indexOf('gravar') > -1) document.documentElement.className = 'gravar';
    </script>
  </head>
  <body>
    <section class="final" id="contato">
      <canvas class="final__silk" aria-hidden="true"></canvas>
      <div class="final__dial" aria-hidden="true">
        <svg class="final__ring final__ring--a" viewBox="0 0 1000 1000"></svg>
        <svg class="final__ring final__ring--b" viewBox="0 0 1000 1000"></svg>
        <img class="final__mark" src="./wing-outline.png" alt="" width="588" height="730" />
      </div>
      <div class="final__in">
        <h2 class="final__title">Sua próxima venda <b>começa agora.</b></h2>
        <p class="final__p">7 perguntas rápidas. A gente analisa e te responde no WhatsApp com três coisas: o que o cliente entende quando te vê hoje, onde ele desiste e o que fazer primeiro.</p>
        <div class="final__actions">
          <a class="btn btn--paper btn--lg" href="#diagnostico">
            Diagnóstico grátis
            <span class="btn__dot"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
          </a>
          <p>Prefere conversar direto?</p>
          <a class="btn btn--glass" href="https://wa.me/" target="_blank" rel="noopener">
            Chamar no WhatsApp
            <span class="btn__wa"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.24 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.24-.64.8-.78.97-.14.17-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" /></svg></span>
          </a>
        </div>
      </div>
    </section>

    <script src="./chamada-final.js"></script>
    <script>
      ChamadaFinal.init(document.querySelector('.final'), { record: location.search.indexOf('gravar') > -1 });
    </script>
  </body>
</html>
```

### CSS

```css
/* ==========================================================================
   Chamada final com fumaça sedosa — Dalas Marketing
   Versão independente: funciona sozinha, sem build e sem bibliotecas.
   ========================================================================== */

.final {
  --fog-100: #ececf0;
  --fog-200: #d6d6dc;
  --fog-400: #8a8a94;
  --paper: #f5f5f7;
  --ink-950: #050506;
  --line: rgba(255, 255, 255, 0.07);
  --line-2: rgba(255, 255, 255, 0.12);
  --line-3: rgba(255, 255, 255, 0.2);
  --wa: #25d366;
  --gutter: clamp(20px, 7.5vw, 108px);
  --ease: cubic-bezier(0.16, 1, 0.3, 1);

  position: relative;
  isolation: isolate;
  margin: 0 clamp(12px, 1.7vw, 24px) clamp(12px, 1.7vw, 24px);
  min-height: 92svh;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 26px;
  border: 1px solid var(--line);
  background: radial-gradient(70% 60% at 50% 45%, #1a1a1f, #070708 75%);
  color: var(--fog-100);
  font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.final *,
.final *::before,
.final *::after {
  box-sizing: border-box;
}

/* fumaça em WebGL (desenhada em resolução baixa e esticada: fica macia) */
.final__silk {
  position: absolute;
  inset: 0;
  z-index: -2;
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 1.4s;
}

.final__silk.is-on {
  opacity: 1;
}

/* mostradores girando e a asa em contorno */
.final__dial {
  position: absolute;
  inset: 0;
  z-index: -1;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.final__ring {
  position: absolute;
  width: min(1300px, 125vmin);
  height: auto;
  aspect-ratio: 1;
}

.final__ring--a {
  color: rgba(255, 255, 255, 0.35);
  animation: final-spin 120s linear infinite;
}

.final__ring--b {
  color: rgba(255, 255, 255, 0.18);
  width: min(1000px, 96vmin);
  animation: final-spin 200s linear infinite reverse;
}

@keyframes final-spin {
  to {
    transform: rotate(360deg);
  }
}

.final__mark {
  position: absolute;
  width: min(560px, 60vmin);
  height: auto;
  opacity: 0.16;
}

/* conteúdo */
.final__in {
  position: relative;
  display: grid;
  justify-items: center;
  text-align: center;
  padding: 120px var(--gutter);
}

.final__title {
  margin: 0;
  font-size: clamp(3rem, 7.6vw, 7rem);
  line-height: 0.98;
  letter-spacing: -0.05em;
  font-weight: 300;
  max-width: 12ch;
  text-wrap: balance;
}

.final__title b {
  font-weight: 800;
  letter-spacing: -0.05em;
}

/* palavras em negrito com degradê prata (aplicado em cada palavra) */
.final__title b,
.final__title b .w {
  background: linear-gradient(180deg, #ffffff 0%, #f1f1f4 38%, #a2a2ad 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.final__title .w {
  display: inline-block;
  white-space: nowrap;
}

.final__p {
  margin: 36px 0 0;
  max-width: 46ch;
  font-size: clamp(1.05rem, 1.4vw, 1.25rem);
  line-height: 1.62;
  color: var(--fog-200);
}

.final__actions {
  margin-top: 40px;
  display: grid;
  justify-items: center;
  gap: 14px;
}

.final__actions p {
  margin: 18px 0 0;
  font-size: 14px;
  color: var(--fog-400);
}

/* botões */
.final .btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  height: 52px;
  padding: 0 7px 0 26px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: -0.01em;
  white-space: nowrap;
  text-decoration: none;
  transition:
    transform 0.35s var(--ease),
    background-color 0.35s var(--ease),
    box-shadow 0.35s var(--ease),
    border-color 0.35s;
}

.final .btn:active {
  transform: scale(0.97);
}

.final .btn svg {
  width: 16px;
  height: 16px;
}

.final .btn__dot,
.final .btn__wa {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--ink-950);
  color: #fff;
  transition: transform 0.45s var(--ease);
}

.final .btn:hover .btn__dot {
  transform: rotate(45deg);
}

.final .btn__wa {
  background: rgba(37, 211, 102, 0.12);
  color: var(--wa);
}

.final .btn--paper {
  background: var(--paper);
  color: var(--ink-950);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.4),
    0 12px 40px -12px rgba(255, 255, 255, 0.45);
}

.final .btn--paper:hover {
  background: #fff;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.6),
    0 16px 50px -12px rgba(255, 255, 255, 0.6);
}

.final .btn--glass {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--line-2);
  color: var(--fog-100);
  padding-left: 24px;
}

.final .btn--glass:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--line-3);
}

.final .btn--lg {
  height: 58px;
  font-size: 17px;
  padding-left: 30px;
}

.final .btn--lg .btn__dot {
  width: 44px;
  height: 44px;
}

@media (max-width: 640px) {
  .final__actions {
    width: 100%;
  }

  .final__actions .btn {
    width: 100%;
    justify-content: space-between;
  }
}

@media (prefers-reduced-motion: reduce) {
  .final__ring--a,
  .final__ring--b {
    animation: none;
  }
}
```

### JavaScript

```js
/* ==========================================================================
   Chamada final com fumaça sedosa — Dalas Marketing
   Versão independente (sem GSAP, sem build). Use:

     ChamadaFinal.init(document.querySelector('.final'));

   Opções: { record: true } deixa tudo parado para gravar quadro a quadro
   com window.__frame(segundos).
   ========================================================================== */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  var VERT = 'attribute vec2 aPos;\nvoid main() { gl_Position = vec4(aPos, 0.0, 1.0); }';

  // fumaça sedosa em tons de prata: ruído com dobras (domain warping)
  var FRAG = [
    'precision mediump float;',
    'uniform vec2 uRes;',
    'uniform float uTime;',
    'float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'float noise(vec2 p) {',
    '  vec2 i = floor(p);',
    '  vec2 f = fract(p);',
    '  f = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);',
    '}',
    'float fbm(vec2 p) {',
    '  float v = 0.0;',
    '  float a = 0.5;',
    '  for (int i = 0; i < 4; i++) {',
    '    v += a * noise(p);',
    '    p = p * 2.03 + vec2(1.7, 9.2);',
    '    a *= 0.5;',
    '  }',
    '  return v;',
    '}',
    'void main() {',
    '  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;',
    '  float t = uTime * 0.05;',
    '  vec2 q = vec2(fbm(p * 1.3 + vec2(0.0, t)), fbm(p * 1.3 + vec2(5.2, -t)));',
    '  vec2 r = vec2(fbm(p * 1.5 + 2.6 * q + vec2(1.7, 9.2) + t * 1.4), fbm(p * 1.5 + 2.6 * q + vec2(8.3, 2.8) - t));',
    '  float f = fbm(p * 1.1 + 2.2 * r);',
    '  float folds = 0.5 + 0.5 * sin((f * 5.0 + r.x * 2.4 - q.y) * 3.14159);',
    '  float silk = pow(smoothstep(0.35, 1.0, folds), 2.2) * smoothstep(0.25, 0.75, f);',
    '  float sheen = pow(smoothstep(0.85, 1.0, folds), 6.0) * 0.6;',
    '  float vig = smoothstep(1.25, 0.15, length(p * vec2(0.85, 1.05)));',
    '  float center = 0.32 + 0.68 * smoothstep(0.12, 0.85, length(p * vec2(0.62, 1.0)));',
    '  vec3 base = vec3(0.026, 0.026, 0.03);',
    '  vec3 col = base + vec3(0.5, 0.51, 0.55) * (silk + sheen) * vig * center;',
    '  gl_FragColor = vec4(col, 1.0);',
    '}',
  ].join('\n');

  function ring(svg, o) {
    for (var i = 0; i < o.count; i += 1) {
      var a = (i / o.count) * Math.PI * 2;
      var big = i % o.every === 0;
      var r2 = o.r - (big ? o.long : o.long * 0.4);
      var line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', 500 + Math.sin(a) * o.r);
      line.setAttribute('y1', 500 - Math.cos(a) * o.r);
      line.setAttribute('x2', 500 + Math.sin(a) * r2);
      line.setAttribute('y2', 500 - Math.cos(a) * r2);
      line.setAttribute('stroke', 'currentColor');
      line.setAttribute('stroke-width', big ? 2.2 : 1);
      line.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line);
    }
    if (o.inner) {
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', 500);
      c.setAttribute('cy', 500);
      c.setAttribute('r', o.inner);
      c.setAttribute('fill', 'none');
      c.setAttribute('stroke', 'currentColor');
      c.setAttribute('stroke-width', 0.8);
      svg.appendChild(c);
    }
  }

  // quebra o título em palavras (<span class="w">), mantendo o <b>
  function splitWords(el) {
    var words = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(' '));
              return;
            }
            var s = document.createElement('span');
            s.className = 'w';
            s.textContent = part;
            frag.appendChild(s);
            words.push(s);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    })(el);
    return words;
  }

  function compile(gl, type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error('[fumaça]', gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  }

  function initSilk(canvas, scale) {
    var gl = null;
    try {
      gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power', preserveDrawingBuffer: true });
    } catch (e) {
      gl = null;
    }
    if (!gl) return null;
    var vs = compile(gl, gl.VERTEX_SHADER, VERT);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, 'aPos');
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    var uRes = gl.getUniformLocation(prog, 'uRes');
    var uTime = gl.getUniformLocation(prog, 'uTime');
    var w = 1;
    var h = 1;
    function size() {
      w = Math.max(1, Math.round(canvas.clientWidth * scale));
      h = Math.max(1, Math.round(canvas.clientHeight * scale));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    size();
    window.addEventListener('resize', size);
    return function draw(time) {
      gl.uniform2f(uRes, w, h);
      gl.uniform1f(uTime, time);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
  }

  function init(root, opts) {
    opts = opts || {};
    if (!root) return null;
    var record = !!opts.record;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var lowPower = window.matchMedia('(max-width: 900px)').matches || (navigator.hardwareConcurrency || 8) <= 4;

    ring(root.querySelector('.final__ring--a'), { r: 480, count: 120, long: 34, every: 5 });
    ring(root.querySelector('.final__ring--b'), { r: 400, count: 60, long: 18, every: 5, inner: 372 });

    // entrada: palavras sobem saindo do desfoque; texto e botões vêm depois
    var anims = [];
    var title = root.querySelector('.final__title');
    var ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    if (title && !reduce) {
      splitWords(title).forEach(function (w, i) {
        anims.push(
          w.animate(
            [
              { transform: 'translateY(70%)', opacity: 0, filter: 'blur(8px)' },
              { transform: 'none', opacity: 1, filter: 'blur(0px)' },
            ],
            { duration: 1100, delay: 150 + i * 45, easing: ease, fill: 'both' }
          )
        );
      });
      Array.prototype.slice.call(root.querySelectorAll('.final__p, .final__actions')).forEach(function (el, i) {
        anims.push(
          el.animate(
            [
              { transform: 'translateY(30px)', opacity: 0, filter: 'blur(6px)' },
              { transform: 'none', opacity: 1, filter: 'blur(0px)' },
            ],
            { duration: 1100, delay: 450 + i * 150, easing: ease, fill: 'both' }
          )
        );
      });
      anims.forEach(function (a) {
        a.pause();
      });
    }

    var canvas = root.querySelector('.final__silk');
    var draw = canvas ? initSilk(canvas, record ? 0.6 : lowPower ? 0.35 : 0.5) : null;
    var time = 7;
    if (draw) {
      draw(time);
      canvas.classList.add('is-on');
    }

    // modo gravação: tudo parado, cada quadro é desenhado por window.__frame(t)
    if (record) {
      if (canvas) canvas.style.transition = 'none';
      window.__frame = function (t) {
        document.getAnimations().forEach(function (a) {
          a.pause();
          a.currentTime = t * 1000;
        });
        if (draw) draw(7 + t);
      };
      window.__frame(0);
      return { frame: window.__frame };
    }

    // a fumaça anda a 30 quadros por segundo e só quando a seção está na tela
    var visible = false;
    var started = false;
    var last = 0;
    var acc = 0;
    function loop(now) {
      if (!visible) return;
      var dt = last ? Math.min(now - last, 60) / 1000 : 0;
      last = now;
      acc += dt;
      if (acc >= 1 / 30 && draw && !reduce) {
        time += acc;
        acc = 0;
        draw(time);
      }
      requestAnimationFrame(loop);
    }
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) {
        if (!started) {
          started = true;
          anims.forEach(function (a) {
            a.play();
          });
        }
        last = 0;
        requestAnimationFrame(loop);
      }
    }, { threshold: 0.15 }).observe(root);
    return null;
  }

  window.ChamadaFinal = { init: init };
})();
```
