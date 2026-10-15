import * as THREE from 'three';
import { gsap } from 'gsap';

/**
 * Floresta noturna cinematográfica em WebGL (Three.js), gerada em código:
 * céu estrelado, lua, árvores em camadas de profundidade, névoa volumétrica
 * (planos de ruído em movimento), raios de luar, poeira flutuante e folhas ao
 * vento. A câmera faz o travelling da abertura e, no scroll, atravessa a mata
 * até encontrar a luz verde da próxima seção.
 *
 * Quando existe o vídeo do lobo, a cena mostra só o primeiro plano (árvores
 * próximas, névoa, partículas) por cima dele. Sem vídeo, desenha tudo.
 */

const PALETTE = {
  ink: 0x050807,
  deep: 0x071b14,
  emerald: 0x00a86b,
  glow: 0x20e89a,
  moon: 0xe9f1ec,
  fog: 0x8fa79c,
};

function canvasTexture(width, height, draw) {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  draw(c.getContext('2d'), width, height);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Árvore seca: tronco e galhos recursivos. Cada chamada gera uma silhueta diferente.
function treeTexture(seed) {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return canvasTexture(256, 768, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#000';
    ctx.lineCap = 'round';
    const branch = (x, y, len, ang, width, depth) => {
      if (depth === 0 || len < 6) return;
      const x2 = x + Math.cos(ang) * len;
      const y2 = y - Math.sin(ang) * len;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      const n = depth > 5 ? 2 : 2 + Math.floor(rnd() * 2);
      for (let i = 0; i < n; i += 1) {
        const spread = (rnd() - 0.5) * 1.3;
        branch(x2, y2, len * (0.62 + rnd() * 0.2), ang + spread, width * 0.62, depth - 1);
      }
    };
    branch(w / 2, h, h * 0.3, Math.PI / 2 + (rnd() - 0.5) * 0.15, 18, 8);
  });
}

// Pinheiro: camadas triangulares irregulares.
function pineTexture(seed) {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return canvasTexture(256, 768, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#000';
    ctx.fillRect(w / 2 - 8, h * 0.6, 16, h * 0.4);
    const layers = 9;
    for (let i = 0; i < layers; i += 1) {
      const t = i / layers;
      const y = h * 0.08 + t * h * 0.78;
      const half = w * (0.08 + t * 0.4) * (0.85 + rnd() * 0.3);
      ctx.beginPath();
      ctx.moveTo(w / 2, y - h * 0.09);
      for (let k = 0; k <= 6; k += 1) {
        const f = k / 6;
        ctx.lineTo(w / 2 + half * f, y + Math.sin(f * 9 + i) * 6 + f * h * 0.05);
      }
      for (let k = 6; k >= 0; k -= 1) {
        const f = k / 6;
        ctx.lineTo(w / 2 - half * f, y + Math.cos(f * 7 + i) * 6 + f * h * 0.05);
      }
      ctx.closePath();
      ctx.fill();
    }
  });
}

function fogTexture() {
  return canvasTexture(512, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < 140; i += 1) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 40 + Math.random() * 120;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(255,255,255,${0.05 + Math.random() * 0.08})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // apaga as bordas: o plano nunca mostra um retângulo
    const edge = ctx.createRadialGradient(w / 2, h / 2, h * 0.15, w / 2, h / 2, w * 0.5);
    edge.addColorStop(0, 'rgba(0,0,0,1)');
    edge.addColorStop(0.55, 'rgba(0,0,0,0.75)');
    edge.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'destination-in';
    ctx.save();
    ctx.scale(1, h / w);
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, w, (h * w) / h);
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
  });
}

// Linha de pinheiros distante: fecha o horizonte.
function treelineTexture() {
  return canvasTexture(2048, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#000';
    for (let i = 0; i < 160; i += 1) {
      const x = (i / 160) * w + (Math.random() - 0.5) * 20;
      const th = 60 + Math.random() * 150;
      const half = 8 + Math.random() * 16;
      const layers = 6;
      for (let l = 0; l < layers; l += 1) {
        const t = l / layers;
        const y = h - th + t * th * 0.9;
        const hw = half * (0.25 + t);
        ctx.beginPath();
        ctx.moveTo(x, y - th * 0.14);
        ctx.lineTo(x + hw, y + th * 0.08);
        ctx.lineTo(x - hw, y + th * 0.08);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillRect(x - 2, h - th * 0.3, 4, th * 0.3);
    }
  });
}

function glowTexture(inner = 'rgba(255,255,255,1)') {
  return canvasTexture(256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, inner);
    g.addColorStop(0.35, 'rgba(255,255,255,0.35)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}

function rayTexture() {
  return canvasTexture(64, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(0.6, 'rgba(255,255,255,0.25)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const side = ctx.createLinearGradient(0, 0, w, 0);
    side.addColorStop(0, 'rgba(0,0,0,1)');
    side.addColorStop(0.5, 'rgba(0,0,0,0)');
    side.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = side;
    ctx.fillRect(0, 0, w, h);
  });
}

function leafTexture() {
  return canvasTexture(32, 32, (ctx, w, h) => {
    ctx.fillStyle = '#9fb3a6';
    ctx.beginPath();
    ctx.moveTo(16, 2);
    ctx.quadraticCurveTo(30, 12, 16, 30);
    ctx.quadraticCurveTo(2, 12, 16, 2);
    ctx.fill();
  });
}

export function initForest(canvas, { withBackground = true, quality = 'high', reduceMotion = false, finePointer = true } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
  } catch (error) {
    return null;
  }
  const high = quality === 'high';
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, high ? 1.5 : 1));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(PALETTE.ink, 0.026);
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 600);
  camera.position.set(0, 1.1, 7);

  const state = { time: 0, running: true, progress: 0, intro: 0, mouse: { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 } };
  const counts = high
    ? { trees: 72, fog: 11, rays: 7, dust: 520, leaves: 70, stars: 1800 }
    : { trees: 34, fog: 6, rays: 4, dust: 200, leaves: 28, stars: 700 };

  // ---------- fundo: só sem vídeo ----------
  const background = new THREE.Group();
  scene.add(background);

  // estrelas com cintilação
  {
    const n = counts.stars;
    const pos = new Float32Array(n * 3);
    const phase = new Float32Array(n);
    for (let i = 0; i < n; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const e = Math.random() * 0.5 + 0.05;
      const r = 380;
      pos[i * 3] = Math.cos(a) * Math.cos(e) * r;
      pos[i * 3 + 1] = Math.sin(e) * r + 10;
      pos[i * 3 + 2] = -Math.abs(Math.sin(a)) * Math.cos(e) * r - 60;
      phase[i] = Math.random() * Math.PI * 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('phase', new THREE.BufferAttribute(phase, 1));
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 }, uPixel: { value: renderer.getPixelRatio() } },
      vertexShader: `
        attribute float phase; varying float vA; uniform float uTime; uniform float uPixel;
        void main(){
          vA = 0.45 + 0.55 * sin(uTime * (0.6 + fract(phase) * 1.4) + phase * 7.0);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = (1.2 + fract(phase * 3.1) * 1.8) * uPixel;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying float vA;
        void main(){
          vec2 d = gl_PointCoord - 0.5; float r = length(d);
          float a = smoothstep(0.5, 0.1, r) * vA;
          gl_FragColor = vec4(0.92, 0.96, 0.94, a);
        }`,
    });
    const stars = new THREE.Points(geo, mat);
    stars.frustumCulled = false;
    background.add(stars);
    state.starMat = mat;
  }

  // lua e halo
  const glowTex = glowTexture();
  {
    const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: PALETTE.moon, transparent: true, depthWrite: false, fog: false }));
    moon.position.set(34, 42, -170);
    moon.scale.setScalar(16);
    background.add(moon);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xb9d3c6, transparent: true, opacity: 0.35, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
    halo.position.copy(moon.position);
    halo.scale.setScalar(90);
    background.add(halo);
    const sky = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x12352a, transparent: true, opacity: 0.55, depthWrite: false, fog: false }));
    sky.position.set(0, -10, -260);
    sky.scale.set(900, 260, 1);
    background.add(sky);
  }

  // chão com poça de luar
  {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({ color: 0x030605 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3;
    background.add(ground);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.MeshBasicMaterial({ map: glowTex, color: 0x5d7a6c, transparent: true, opacity: 0.25, depthWrite: false }));
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(4, -2.95, -30);
    background.add(pool);
  }

  // linha de pinheiros distante e névoa rasteira que escondem o horizonte
  {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(520, 60), new THREE.MeshBasicMaterial({ map: treelineTexture(), color: 0x0c241c, transparent: true, depthWrite: false }));
    line.position.set(0, 21, -170);
    background.add(line);
    const line2 = new THREE.Mesh(new THREE.PlaneGeometry(420, 46), new THREE.MeshBasicMaterial({ map: treelineTexture(), color: 0x08180f, transparent: true, depthWrite: false }));
    line2.position.set(30, 14, -120);
    background.add(line2);
    const haze = new THREE.Mesh(new THREE.PlaneGeometry(600, 40), new THREE.MeshBasicMaterial({ map: fogTexture(), color: 0x7f998d, transparent: true, opacity: 0.55, depthWrite: false }));
    haze.position.set(0, 4, -150);
    background.add(haze);
  }

  // ---------- árvores ----------
  const treeTextures = [treeTexture(11), treeTexture(29), treeTexture(53), pineTexture(7), pineTexture(19)];
  const trees = [];
  const near = new THREE.Color(0x02060a);
  const far = new THREE.Color(0x14302a);
  for (let i = 0; i < counts.trees; i += 1) {
    const z = -4 - Math.pow(Math.random(), 1.4) * 150;
    const depth = Math.min(1, -z / 150);
    const side = Math.random() < 0.5 ? -1 : 1;
    // corredor livre no centro, mais largo perto da câmera
    const minX = 5 + (1 - depth) * 4;
    const x = side * (minX + Math.random() * (14 + depth * 40));
    const h = 10 + Math.random() * 14;
    const tex = treeTextures[Math.floor(Math.random() * treeTextures.length)];
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, color: new THREE.Color().lerpColors(near, far, Math.pow(depth, 0.7)) });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(h / 3, h), mat);
    mesh.position.set(x, -3 + h / 2, z);
    mesh.scale.x = Math.random() < 0.5 ? -1 : 1;
    mesh.userData.depth = depth;
    mesh.userData.isNear = -z < 40;
    scene.add(mesh);
    trees.push(mesh);
  }
  const farTrees = trees.filter((t) => !t.userData.isNear);

  // ---------- névoa ----------
  const fogTex = fogTexture();
  const fogs = [];
  for (let i = 0; i < counts.fog; i += 1) {
    const mat = new THREE.MeshBasicMaterial({ map: fogTex, color: PALETTE.fog, transparent: true, opacity: 0.14 + Math.random() * 0.14, depthWrite: false });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(110, 34), mat);
    mesh.position.set((Math.random() - 0.5) * 30, -2 + Math.random() * 5, -2 - Math.random() * 90);
    mesh.userData.speed = 0.25 + Math.random() * 0.6;
    mesh.userData.base = mat.opacity;
    scene.add(mesh);
    fogs.push(mesh);
  }

  // ---------- raios de luar ----------
  const rayTex = rayTexture();
  const rays = [];
  for (let i = 0; i < counts.rays; i += 1) {
    const mat = new THREE.MeshBasicMaterial({ map: rayTex, color: 0xd6e6dd, transparent: true, opacity: 0.05 + Math.random() * 0.07, depthWrite: false, blending: THREE.AdditiveBlending });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4 + Math.random() * 3, 48), mat);
    mesh.position.set(6 + Math.random() * 26, 14, -20 - Math.random() * 70);
    mesh.rotation.z = -0.28 + Math.random() * 0.12;
    mesh.userData.base = mat.opacity;
    mesh.userData.phase = Math.random() * 6;
    scene.add(mesh);
    rays.push(mesh);
  }

  // ---------- poeira ----------
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(counts.dust * 3);
  for (let i = 0; i < counts.dust; i += 1) {
    dustPos[i * 3] = (Math.random() - 0.5) * 40;
    dustPos[i * 3 + 1] = -2 + Math.random() * 12;
    dustPos[i * 3 + 2] = 6 - Math.random() * 90;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ map: glowTex, color: 0xc9dbd2, size: 0.09, transparent: true, opacity: 0.6, depthWrite: false, sizeAttenuation: true }));
  scene.add(dust);

  // ---------- folhas ----------
  const leafTex = leafTexture();
  const leaves = [];
  for (let i = 0; i < counts.leaves; i += 1) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), new THREE.MeshBasicMaterial({ map: leafTex, transparent: true, opacity: 0.75, depthWrite: false, color: 0x6f8a7c, side: THREE.DoubleSide }));
    mesh.position.set((Math.random() - 0.5) * 30, Math.random() * 10, 4 - Math.random() * 50);
    mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    mesh.userData = { phase: Math.random() * 6, speed: 0.35 + Math.random() * 0.5 };
    scene.add(mesh);
    leaves.push(mesh);
  }

  // ---------- luz verde no fim do caminho ----------
  const greenGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: PALETTE.glow, transparent: true, opacity: 0, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
  greenGlow.position.set(0, 3, -95);
  greenGlow.scale.setScalar(40);
  scene.add(greenGlow);
  const greenFill = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: PALETTE.emerald, transparent: true, opacity: 0, depthWrite: false, fog: false }));
  greenFill.position.set(0, 2, -60);
  greenFill.scale.set(160, 90, 1);
  scene.add(greenFill);

  // ---------- modo ----------
  function setVideoMode(hasVideo) {
    background.visible = !hasVideo;
    farTrees.forEach((t) => {
      t.visible = !hasVideo;
    });
  }
  setVideoMode(!withBackground);

  // ---------- tamanho ----------
  let width = 0;
  let height = 0;
  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = width < 900 ? 64 : 52;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  if (finePointer) {
    window.addEventListener(
      'pointermove',
      (e) => {
        state.mouse.tx = e.clientX / window.innerWidth;
        state.mouse.ty = e.clientY / window.innerHeight;
      },
      { passive: true }
    );
  }

  const fogColorA = new THREE.Color(PALETTE.ink);
  const fogColorB = new THREE.Color(0x0b3b2a);
  const tmpColor = new THREE.Color();
  const smooth = (a, b, x) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };

  function render(_t, deltaTime) {
    if (!state.running || !width) return;
    const dt = Math.min(deltaTime || 16, 50) / 1000;
    if (!reduceMotion) state.time += dt;
    const t = state.time;
    const p = state.progress;
    const k = 1 - Math.pow(0.02, dt);
    state.mouse.x += (state.mouse.tx - state.mouse.x) * k;
    state.mouse.y += (state.mouse.ty - state.mouse.y) * k;

    // câmera: travelling de abertura, parallax do mouse e travessia no scroll
    const introZ = 7 - state.intro * 3;
    const travel = p * p * (3 - 2 * p);
    camera.position.z = introZ - travel * 78;
    camera.position.x = Math.sin(p * Math.PI) * 3.2 + (state.mouse.x - 0.5) * 0.9;
    camera.position.y = 1.1 + travel * 1.6 + (state.mouse.y - 0.5) * -0.5;
    camera.rotation.y = (state.mouse.x - 0.5) * -0.06 - Math.sin(p * Math.PI) * 0.08;
    camera.rotation.x = (state.mouse.y - 0.5) * 0.03;

    // névoa viva
    fogs.forEach((f, i) => {
      f.position.x += Math.sin(t * 0.15 + i) * f.userData.speed * dt * 0.8;
      f.material.map.offset.x = (t * 0.004 * f.userData.speed + i * 0.1) % 1;
      f.material.opacity = f.userData.base * (1 + smooth(0.3, 0.75, p) * 1.4);
      f.material.color.lerpColors(new THREE.Color(PALETTE.fog), new THREE.Color(0x4fcf9d), smooth(0.45, 0.95, p) * 0.7);
    });
    rays.forEach((r) => {
      r.material.opacity = r.userData.base * (0.7 + 0.3 * Math.sin(t * 0.4 + r.userData.phase)) * (1 - smooth(0.5, 0.9, p));
    });

    // poeira sobe devagar e balança com o vento
    const arr = dust.geometry.attributes.position.array;
    for (let i = 0; i < counts.dust; i += 1) {
      arr[i * 3 + 1] += dt * 0.12;
      arr[i * 3] += Math.sin(t * 0.3 + i) * dt * 0.05;
      if (arr[i * 3 + 1] > 11) arr[i * 3 + 1] = -2;
    }
    dust.geometry.attributes.position.needsUpdate = true;

    // folhas caem e giram
    leaves.forEach((l) => {
      l.position.y -= l.userData.speed * dt;
      l.position.x += Math.sin(t * 0.8 + l.userData.phase) * dt * 0.9;
      l.rotation.x += dt * 1.2;
      l.rotation.z += dt * 0.7;
      if (l.position.y < -3) l.position.y = 11;
    });

    // luz verde cresce no fim do caminho e tinge a névoa
    const g = smooth(0.3, 0.85, p);
    greenGlow.material.opacity = g * 0.95;
    greenGlow.scale.setScalar(40 + g * 60);
    greenFill.material.opacity = smooth(0.55, 1, p) * 0.75;
    scene.fog.density = 0.026 + g * 0.03;
    scene.fog.color.copy(tmpColor.lerpColors(fogColorA, fogColorB, smooth(0.45, 0.95, p)));
    if (state.starMat) state.starMat.uniforms.uTime.value = t;

    renderer.render(scene, camera);
  }
  gsap.ticker.add(render);

  return {
    state,
    setVideoMode,
    resize,
    intro(duration = 4.5) {
      return gsap.to(state, { intro: 1, duration, ease: 'power2.out' });
    },
    setProgress(v) {
      state.progress = v;
    },
    setRunning(v) {
      state.running = v;
    },
    destroy() {
      gsap.ticker.remove(render);
      window.removeEventListener('resize', resize);
      renderer.dispose();
    },
  };
}
