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
