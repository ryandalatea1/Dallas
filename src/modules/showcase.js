import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { gsap } from 'gsap';

/**
 * Um objeto 3D por solução, todos desenhados por um único renderizador:
 * o canvas cobre a tela e cada objeto é renderizado só dentro do retângulo
 * do seu card (viewport + scissor). Cromo com luz esmeralda, rotação lenta,
 * flutuação e reação ao mouse. Fora da tela, nada é desenhado.
 */
export function initShowcase(canvas, { reduceMotion = false, finePointer = true, quality = 'high' } = {}) {
  const targets = Array.from(document.querySelectorAll('[data-object]'));
  if (!canvas || !targets.length) return null;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (error) {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === 'high' ? 1.5 : 1));
  renderer.setClearColor(0x000000, 0);
  renderer.setScissorTest(true);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.1 });
  const steel = new THREE.MeshPhysicalMaterial({ color: 0xbfc7c3, metalness: 1, roughness: 0.4 });
  const emerald = new THREE.MeshPhysicalMaterial({ color: 0x00a86b, metalness: 0.55, roughness: 0.22, emissive: 0x06452c, emissiveIntensity: 0.9, clearcoat: 0.6 });
  const glow = new THREE.MeshBasicMaterial({ color: 0x20e89a });
  const wire = new THREE.LineBasicMaterial({ color: 0x20e89a, transparent: true, opacity: 0.55 });

  function box(w, h, d, mat, r = 0.08) {
    return new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
  }

  const builders = {
    site(group) {
      const layers = [
        [box(1.7, 1.05, 0.06, steel), [-0.32, 0.26, -0.5]],
        [box(1.7, 1.05, 0.06, emerald), [0, 0, 0]],
        [box(1.7, 1.05, 0.06, chrome), [0.32, -0.26, 0.5]],
      ];
      layers.forEach(([m, p]) => {
        m.position.set(...p);
        group.add(m);
      });
      group.rotation.set(0.35, -0.5, 0);
      return (t) => {
        group.rotation.y = -0.5 + Math.sin(t * 0.4) * 0.25;
        group.children.forEach((c, i) => {
          c.position.y = [0.26, 0, -0.26][i] + Math.sin(t * 0.9 + i) * 0.05;
        });
      };
    },
    sistema(group) {
      const core = box(0.7, 0.7, 0.7, emerald, 0.12);
      group.add(core);
      const dirs = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
      dirs.forEach((d) => {
        const cube = box(0.4, 0.4, 0.4, chrome, 0.08);
        cube.position.set(d[0] * 1.05, d[1] * 1.05, d[2] * 1.05);
        group.add(cube);
        const link = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 12), steel);
        link.position.set(d[0] * 0.6, d[1] * 0.6, d[2] * 0.6);
        link.lookAt(0, 0, 0);
        link.rotateX(Math.PI / 2);
        group.add(link);
      });
      group.rotation.set(0.5, 0.6, 0);
      return (t) => {
        group.rotation.y = 0.6 + t * 0.25;
        group.rotation.x = 0.5 + Math.sin(t * 0.5) * 0.15;
      };
    },
    painel(group) {
      const heights = [0.55, 0.9, 0.7, 1.25, 1.6];
      const bars = heights.map((h, i) => {
        const b = box(0.32, h, 0.32, i === 4 ? emerald : chrome, 0.05);
        b.position.set((i - 2) * 0.46, h / 2 - 0.8, 0);
        b.userData.h = h;
        group.add(b);
        return b;
      });
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.05, 48), steel);
      base.position.y = -0.85;
      group.add(base);
      group.rotation.set(0.35, -0.55, 0);
      return (t) => {
        group.rotation.y = -0.55 + Math.sin(t * 0.35) * 0.3;
        bars.forEach((b, i) => {
          const s = 1 + Math.sin(t * 1.1 + i * 0.8) * 0.08;
          b.scale.y = s;
          b.position.y = (b.userData.h * s) / 2 - 0.8;
        });
      };
    },
    trafego(group) {
      const rings = [1.15, 0.85, 0.55].map((r, i) => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.045, 24, 96), i === 1 ? emerald : chrome);
        group.add(ring);
        return ring;
      });
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), glow);
      group.add(core);
      return (t) => {
        rings[0].rotation.set(t * 0.4, t * 0.3, 0);
        rings[1].rotation.set(-t * 0.5, 0, t * 0.35);
        rings[2].rotation.set(0, t * 0.6, -t * 0.4);
        core.scale.setScalar(1 + Math.sin(t * 2) * 0.12);
      };
    },
    automacao(group) {
      const shell = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.15, 1)), wire);
      group.add(shell);
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.42, 48, 48), chrome);
      group.add(core);
      const nodes = [0, 1, 2].map((i) => {
        const n = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 24), i === 1 ? glow : emerald);
        group.add(n);
        return n;
      });
      return (t) => {
        shell.rotation.set(t * 0.2, t * 0.3, 0);
        nodes.forEach((n, i) => {
          const a = t * (0.6 + i * 0.2) + i * 2.1;
          n.position.set(Math.cos(a) * 0.85, Math.sin(a * 1.3) * 0.5, Math.sin(a) * 0.85);
        });
      };
    },
    estrategia(group) {
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.95, 0), chrome);
      group.add(crystal);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.03, 16, 96), emerald);
      ring.rotation.x = Math.PI / 2.4;
      group.add(ring);
      const star = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), glow);
      star.position.y = 1.15;
      group.add(star);
      return (t) => {
        crystal.rotation.y = t * 0.45;
        crystal.position.y = Math.sin(t * 0.8) * 0.08;
        ring.rotation.z = t * 0.25;
        star.position.y = 1.15 + Math.sin(t * 0.8) * 0.08;
      };
    },
  };

  const items = targets.map((el) => {
    const scene = new THREE.Scene();
    scene.environment = env;
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    camera.position.set(0, 0.1, 4.6);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.AmbientLight(0x1a3a2c, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(3, 5, 4);
    scene.add(key);
    const rim = new THREE.PointLight(0x20e89a, 14, 12);
    rim.position.set(-3, 1, 2.5);
    scene.add(rim);
    const group = new THREE.Group();
    scene.add(group);
    const update = (builders[el.dataset.object] || builders.estrategia)(group);
    const card = el.closest('[data-tilt]') || el;
    const item = { el, card, scene, camera, group, update, tx: 0, ty: 0, rx: 0, ry: 0 };
    if (finePointer) {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        item.tx = ((e.clientX - r.left) / r.width - 0.5) * 0.6;
        item.ty = ((e.clientY - r.top) / r.height - 0.5) * -0.4;
      });
      card.addEventListener('pointerleave', () => {
        item.tx = 0;
        item.ty = 0;
      });
    }
    return item;
  });

  let width = 0;
  let height = 0;
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setSize(width, height, false);
  }
  resize();
  window.addEventListener('resize', resize);

  const state = { time: 0, running: true };
  const dpr = renderer.getPixelRatio();

  let idle = false;
  function render(_t, deltaTime) {
    if (!state.running || !width) return;
    const dt = Math.min(deltaTime || 16, 50) / 1000;
    if (!reduceMotion) state.time += dt;
    const rects = items.map((item) => item.el.getBoundingClientRect());
    const visible = rects.some((r) => r.width && r.bottom > 0 && r.top < height && r.right > 0 && r.left < width);
    if (!visible) {
      // nada na tela: limpa uma vez e descansa
      if (!idle) {
        renderer.setScissor(0, 0, width * dpr, height * dpr);
        renderer.clear();
        idle = true;
      }
      return;
    }
    idle = false;
    renderer.setScissor(0, 0, width * dpr, height * dpr);
    renderer.clear();
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const r = rects[i];
      if (r.bottom < 0 || r.top > height || r.right < 0 || r.left > width || !r.width) continue;
      const alpha = parseFloat(getComputedStyle(item.card).opacity);
      if (alpha < 0.05) continue;
      const k = 1 - Math.pow(0.02, dt);
      item.rx += (item.ty - item.rx) * k;
      item.ry += (item.tx - item.ry) * k;
      item.update(state.time);
      item.group.rotation.x += item.rx * 0.05;
      item.group.rotation.y += item.ry * 0.05;
      item.group.scale.setScalar(0.85 + alpha * 0.15);
      item.camera.aspect = r.width / r.height;
      item.camera.updateProjectionMatrix();
      const x = Math.round(r.left * dpr);
      const y = Math.round((height - r.bottom) * dpr);
      const w = Math.round(r.width * dpr);
      const h = Math.round(r.height * dpr);
      renderer.setViewport(x, y, w, h);
      renderer.setScissor(x, y, w, h);
      renderer.render(item.scene, item.camera);
    }
  }
  gsap.ticker.add(render);

  return {
    state,
    setRunning(v) {
      state.running = v;
    },
  };
}
