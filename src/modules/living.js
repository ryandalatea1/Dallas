import { gsap } from 'gsap';

/**
 * "Quadro vivo": quando o vídeo termina no olhar, o último frame vira uma
 * textura e um shader faz a cena continuar viva: pelos do lobo ondulando ao
 * vento, árvores balançando, nuvens respirando e estrelas piscando.
 * As máscaras são regiões do quadro (elipse do lobo + faixas por altura e
 * luminância), então o efeito acompanha a imagem sem recorte manual.
 */
const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uImgRes;
uniform float uTime;
uniform float uAmount;
uniform float uGust;
uniform vec4 uWolf;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) { return 0.6 * noise(p) + 0.3 * noise(p * 2.1 + 3.7) + 0.1 * noise(p * 4.3 + 9.1); }
vec2 coverUv(vec2 uv) {
  float ra = uRes.x / uRes.y;
  float ia = uImgRes.x / uImgRes.y;
  vec2 s = ra > ia ? vec2(1.0, ia / ra) : vec2(ra / ia, 1.0);
  return (uv - 0.5) * s + 0.5;
}
float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

void main() {
  vec2 uv = coverUv(vUv);
  vec3 base = texture2D(uTex, uv).rgb;
  float l = luma(base);
  float t = uTime;

  // regiões
  vec2 d = (uv - uWolf.xy) / uWolf.zw;
  float wolf = 1.0 - smoothstep(0.78, 1.12, length(d));
  float sky = smoothstep(0.5, 0.68, uv.y);
  float band = smoothstep(0.1, 0.3, uv.y) * (1.0 - smoothstep(0.62, 0.78, uv.y));
  float dark = 1.0 - smoothstep(0.16, 0.4, l);
  float trees = band * dark * (1.0 - wolf);
  float cloud = sky * smoothstep(0.32, 0.6, l) * (1.0 - smoothstep(0.86, 0.95, l));

  vec2 off = vec2(0.0);
  // pelos: ruído fino e rápido, só no lobo
  float furA = fbm(uv * vec2(42.0, 32.0) + vec2(t * 1.7, -t * 0.9)) - 0.5;
  float furB = fbm(uv * vec2(28.0, 46.0) - vec2(t * 1.2, t * 1.5)) - 0.5;
  off += vec2(furA, furB) * 0.0032 * wolf * uGust;
  // árvores: balanço lento, maior no alto da copa
  float sway = sin(t * 0.9 + uv.y * 7.0 + uv.x * 4.0) * 0.6 + 0.4 * sin(t * 0.37 + uv.x * 9.0);
  off.x += sway * 0.0026 * trees * uGust * smoothstep(0.1, 0.6, uv.y);
  // nuvens: respiração lenta
  off += (vec2(fbm(uv * 3.0 + t * 0.12), fbm(uv * 3.0 - t * 0.1)) - 0.5) * 0.007 * cloud;
  off *= uAmount;

  vec3 col = texture2D(uTex, uv + off).rgb;

  // estrelas: pontos brilhantes no céu piscam, cada um no seu ritmo
  vec2 cell = floor(uv * vec2(420.0, 240.0));
  float star = sky * smoothstep(0.74, 0.9, luma(col)) * (1.0 - cloud);
  float tw = 0.6 + 0.4 * sin(t * (1.2 + hash(cell) * 2.6) + hash(cell + 1.7) * 6.283);
  col *= mix(1.0, tw, star * uAmount);

  gl_FragColor = vec4(col, 1.0);
}`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('[living]', gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

export function initLiving(canvas, { video, image, wolf = [0.475, 0.47, 0.2, 0.36], quality = 'high', dprMax } = {}) {
  if (!canvas || !(video || image)) return null;
  let gl = null;
  try {
    gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' });
  } catch (error) {
    gl = null;
  }
  if (!gl) return null;
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, 'aPos');
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const u = Object.fromEntries(['uTex', 'uRes', 'uImgRes', 'uTime', 'uAmount', 'uGust', 'uWolf'].map((n) => [n, gl.getUniformLocation(program, n)]));

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const state = { running: false, captured: false, time: 0, amount: 0 };
  let width = 0;
  let height = 0;
  let imgW = 1;
  let imgH = 1;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, dprMax || (quality === 'high' ? 1.5 : 1));
    width = Math.round(canvas.clientWidth * dpr);
    height = Math.round(canvas.clientHeight * dpr);
    if (!width || !height) return;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  }
  resize();
  window.addEventListener('resize', resize);

  // copia o quadro atual do vídeo (ou uma imagem pronta) para a textura
  function capture(source) {
    const src = source || video || image;
    const sw = src.videoWidth || src.naturalWidth || src.width;
    const sh = src.videoHeight || src.naturalHeight || src.height;
    if (!sw || !sh) return false;
    try {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, src);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    } catch (error) {
      return false;
    }
    imgW = sw;
    imgH = sh;
    state.captured = true;
    return true;
  }

  // o vento vem em rajadas
  function gust(t) {
    return 0.72 + 0.28 * Math.sin(t * 0.45) + 0.18 * Math.sin(t * 1.3 + 1.0) + 0.1 * Math.sin(t * 2.7);
  }

  function render(_t, deltaTime) {
    if (!state.running || !state.captured || !width) return;
    state.time += Math.min(deltaTime || 16, 50) / 1000;
    gl.uniform1i(u.uTex, 0);
    gl.uniform2f(u.uRes, width, height);
    gl.uniform2f(u.uImgRes, imgW, imgH);
    gl.uniform1f(u.uTime, state.time);
    gl.uniform1f(u.uAmount, state.amount);
    gl.uniform1f(u.uGust, gust(state.time));
    gl.uniform4f(u.uWolf, wolf[0], 1 - wolf[1], wolf[2], wolf[3]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  gsap.ticker.add(render);

  return {
    state,
    capture,
    resize,
    start() {
      state.running = true;
      gsap.to(state, { amount: 1, duration: 2.5, ease: 'power2.out' });
    },
    setRunning(v) {
      state.running = v;
    },
    destroy() {
      gsap.ticker.remove(render);
      window.removeEventListener('resize', resize);
    },
  };
}
