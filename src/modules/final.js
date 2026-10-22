import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const NS = 'http://www.w3.org/2000/svg';

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

// fumaça sedosa em tons de prata: ruído com dobras (domain warping)
const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime * 0.05;
  vec2 q = vec2(fbm(p * 1.3 + vec2(0.0, t)), fbm(p * 1.3 + vec2(5.2, -t)));
  vec2 r = vec2(fbm(p * 1.5 + 2.6 * q + vec2(1.7, 9.2) + t * 1.4), fbm(p * 1.5 + 2.6 * q + vec2(8.3, 2.8) - t));
  float f = fbm(p * 1.1 + 2.2 * r);
  float folds = 0.5 + 0.5 * sin((f * 5.0 + r.x * 2.4 - q.y) * 3.14159);
  float silk = pow(smoothstep(0.35, 1.0, folds), 2.2) * smoothstep(0.25, 0.75, f);
  float sheen = pow(smoothstep(0.85, 1.0, folds), 6.0) * 0.6;
  float vig = smoothstep(1.25, 0.15, length(p * vec2(0.85, 1.05)));
  // o centro, atrás do texto, fica mais escuro; a seda aparece nas bordas
  float center = 0.32 + 0.68 * smoothstep(0.12, 0.85, length(p * vec2(0.62, 1.0)));
  vec3 base = vec3(0.026, 0.026, 0.03);
  vec3 col = base + vec3(0.5, 0.51, 0.55) * (silk + sheen) * vig * center;
  gl_FragColor = vec4(col, 1.0);
}`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('[silk]', gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

function ring(svg, { r, count, long, every, inner }) {
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * Math.PI * 2;
    const big = i % every === 0;
    const r2 = r - (big ? long : long * 0.4);
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', 500 + Math.sin(a) * r);
    line.setAttribute('y1', 500 - Math.cos(a) * r);
    line.setAttribute('x2', 500 + Math.sin(a) * r2);
    line.setAttribute('y2', 500 - Math.cos(a) * r2);
    line.setAttribute('stroke', 'currentColor');
    line.setAttribute('stroke-width', big ? 2.2 : 1);
    line.setAttribute('stroke-linecap', 'round');
    svg.appendChild(line);
  }
  if (inner) {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', 500);
    c.setAttribute('cy', 500);
    c.setAttribute('r', inner);
    c.setAttribute('fill', 'none');
    c.setAttribute('stroke', 'currentColor');
    c.setAttribute('stroke-width', 0.8);
    svg.appendChild(c);
  }
}

/** Chamada final: fumaça sedosa em WebGL, mostradores girando devagar e a asa em contorno. */
export function initFinal({ reduceMotion = false, lowPower = false } = {}) {
  const section = document.getElementById('contato');
  if (!section) return;
  ring(document.getElementById('dial-a'), { r: 480, count: 120, long: 34, every: 5 });
  ring(document.getElementById('dial-b'), { r: 400, count: 60, long: 18, every: 5, inner: 372 });

  const canvas = document.getElementById('final-silk');
  let gl = null;
  try {
    gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
  } catch (error) {
    gl = null;
  }
  if (!gl) return;
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.bindAttribLocation(prog, 0, 'aPos');
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uTime = gl.getUniformLocation(prog, 'uTime');

  // resolução baixa: a fumaça é suave, ninguém percebe e custa pouco
  const scale = lowPower ? 0.35 : 0.5;
  let w = 0;
  let h = 0;
  function size() {
    w = Math.max(1, Math.round(canvas.clientWidth * scale));
    h = Math.max(1, Math.round(canvas.clientHeight * scale));
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  }
  size();
  window.addEventListener('resize', size);

  let time = 7;
  let acc = 0;
  let on = false;
  const draw = () => {
    gl.uniform2f(uRes, w, h);
    gl.uniform1f(uTime, time);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  draw();
  canvas.classList.add('is-on');
  gsap.ticker.add((_t, dt) => {
    if (!on || reduceMotion) return;
    acc += Math.min(dt || 16, 60) / 1000;
    if (acc < 1 / 30) return;
    time += acc;
    acc = 0;
    draw();
  });
  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      on = self.isActive;
    },
  });
}
