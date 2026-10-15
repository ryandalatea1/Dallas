import { gsap } from 'gsap';
import vert from '../shaders/hero.vert?raw';
import frag from '../shaders/hero.frag?raw';
import smokeFrag from '../shaders/smoke.frag?raw';

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('[hero-gl]', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vsSource, fsSource) {
  const vs = compile(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, 'aPos');
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('[hero-gl]', gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

function locations(gl, program, names) {
  return Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(program, n)]));
}

function setupTexture(gl) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return texture;
}

/**
 * Retrato do hero em WebGL puro, em dois passes:
 *  1. fumaça fluida em 1/4 da resolução (barata, e o resultado é suave mesmo);
 *  2. foto em duotone na luz verde da marca, silhueta sólida sobre a fumaça,
 *     lente líquida no cursor, grão de filme e parallax de scroll.
 */
export function initHeroGL(canvas, { src, reduceMotion = false, finePointer = true }) {
  if (!canvas) return null;

  let gl = null;
  try {
    gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    });
  } catch (error) {
    gl = null;
  }
  if (!gl) return null;

  const mainProgram = createProgram(gl, vert, frag);
  const smokeProgram = createProgram(gl, vert, smokeFrag);
  if (!mainProgram || !smokeProgram) return null;

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const uMain = locations(gl, mainProgram, [
    'uTex', 'uSmoke', 'uRes', 'uImgRes', 'uTime', 'uMouse', 'uReveal', 'uScroll', 'uStrength',
  ]);
  const uSmoke = locations(gl, smokeProgram, ['uTime', 'uMouse', 'uAspect']);

  // Foto (unidade 0)
  gl.activeTexture(gl.TEXTURE0);
  const photo = setupTexture(gl);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([3, 21, 12]));

  // Fumaça (unidade 1) desenhada num framebuffer pequeno
  gl.activeTexture(gl.TEXTURE1);
  const smokeTexture = setupTexture(gl);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, smokeTexture, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  const state = {
    reveal: 0,
    scroll: 0,
    strength: 0,
    time: 0,
    imgRes: [1, 1],
    mouse: [0.5, 0.55],
    target: [0.5, 0.55],
    running: true,
    hasPointer: false,
  };

  const ready = new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, photo);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      state.imgRes = [img.naturalWidth, img.naturalHeight];
      resolve(true);
    };
    img.onerror = () => resolve(false);
    img.src = src;
  });

  let width = 0;
  let height = 0;
  let smokeW = 1;
  let smokeH = 1;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    width = Math.round(w * dpr);
    height = Math.round(h * dpr);
    canvas.width = width;
    canvas.height = height;
    smokeW = Math.max(1, Math.round(width / 4));
    smokeH = Math.max(1, Math.round(height / 4));
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, smokeTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, smokeW, smokeH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  }
  resize();
  window.addEventListener('resize', resize);

  if (finePointer) {
    window.addEventListener(
      'pointermove',
      (event) => {
        const rect = canvas.getBoundingClientRect();
        state.target[0] = (event.clientX - rect.left) / rect.width;
        state.target[1] = 1 - (event.clientY - rect.top) / rect.height;
        state.hasPointer = true;
        const velocity = Math.hypot(event.movementX || 0, event.movementY || 0);
        state.strength = Math.min(1, state.strength + 0.05 + velocity / 260);
      },
      { passive: true }
    );
  }

  function render(_time, deltaTime) {
    if (!state.running || !width) return;
    const dt = Math.min(deltaTime || 16, 50) / 1000;
    state.time += dt;

    // Sem cursor (toque), a luz passeia sozinha para o retrato nunca ficar parado.
    if (!state.hasPointer) {
      state.target[0] = 0.5 + Math.sin(state.time * 0.25) * 0.18;
      state.target[1] = 0.55 + Math.cos(state.time * 0.19) * 0.12;
    }

    const k = 1 - Math.pow(0.004, dt);
    state.mouse[0] += (state.target[0] - state.mouse[0]) * k;
    state.mouse[1] += (state.target[1] - state.mouse[1]) * k;
    state.strength *= Math.pow(0.08, dt);

    // Passe 1: fumaça em baixa resolução.
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.viewport(0, 0, smokeW, smokeH);
    gl.useProgram(smokeProgram);
    gl.uniform1f(uSmoke.uTime, reduceMotion ? 0 : state.time);
    gl.uniform2f(uSmoke.uMouse, state.mouse[0], state.mouse[1]);
    gl.uniform1f(uSmoke.uAspect, width / height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Passe 2: composição final.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, width, height);
    gl.useProgram(mainProgram);
    gl.uniform1i(uMain.uTex, 0);
    gl.uniform1i(uMain.uSmoke, 1);
    gl.uniform2f(uMain.uRes, width, height);
    gl.uniform2f(uMain.uImgRes, state.imgRes[0], state.imgRes[1]);
    gl.uniform1f(uMain.uTime, state.time);
    gl.uniform2f(uMain.uMouse, state.mouse[0], state.mouse[1]);
    gl.uniform1f(uMain.uReveal, state.reveal);
    gl.uniform1f(uMain.uScroll, state.scroll);
    gl.uniform1f(uMain.uStrength, reduceMotion ? 0 : state.strength);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  gsap.ticker.add(render);

  return {
    state,
    ready,
    resize,
    setRunning(value) {
      state.running = value;
    },
    destroy() {
      gsap.ticker.remove(render);
      window.removeEventListener('resize', resize);
    },
  };
}
