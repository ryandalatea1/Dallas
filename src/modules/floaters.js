import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';

/**
 * Objetos 3D cromados flutuando (Three.js). Reflexos vêm de um ambiente de
 * estúdio gerado em código, sem arquivos externos. Parallax com o mouse,
 * rotação com o scroll e pausa quando a seção sai da tela.
 */
export function initFloaters(canvas, { preset = 'hero', reduceMotion = false, finePointer = true } = {}) {
  if (!canvas) return null;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (error) {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 12);

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(5, 8, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.8);
  rim.position.set(-6, -3, -4);
  scene.add(rim);

  const chrome = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 1,
    roughness: 0.16,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
  });
  const graphite = new THREE.MeshPhysicalMaterial({
    color: 0x2a2a31,
    metalness: 0.85,
    roughness: 0.32,
    flatShading: true,
  });
  const frosted = new THREE.MeshPhysicalMaterial({
    color: 0xc9c9d2,
    metalness: 1,
    roughness: 0.42,
  });

  const group = new THREE.Group();
  scene.add(group);

  // [geometria, material, posição, escala, velocidade de rotação]
  const presets = {
    hero: [
      [new THREE.TorusKnotGeometry(1.05, 0.33, 240, 32), chrome, [3.1, 0.3, 0], 1, [0.18, 0.26, 0]],
      [new THREE.IcosahedronGeometry(0.72, 0), graphite, [1.1, 2.3, -1.2], 1, [0.22, 0.14, 0.1]],
      [new THREE.TorusGeometry(0.62, 0.2, 32, 96), chrome, [5.3, -1.9, -1.4], 1, [0.3, 0.12, 0.2]],
      [new THREE.CapsuleGeometry(0.3, 1.1, 12, 24), chrome, [1.3, -2.3, 0.4], 1, [0.1, 0.2, 0.28]],
      [new THREE.SphereGeometry(0.5, 48, 48), frosted, [5.4, 2.1, -0.6], 1, [0, 0.1, 0]],
      [new THREE.OctahedronGeometry(0.46, 0), chrome, [4.4, 3.0, -2.2], 1, [0.25, 0.3, 0.15]],
      [new THREE.TorusGeometry(0.34, 0.11, 24, 64), graphite, [2.2, -0.9, 1.6], 1, [0.4, 0.2, 0.1]],
    ],
    cta: [
      [new THREE.TorusKnotGeometry(1.2, 0.36, 240, 32), chrome, [3.6, 0.2, 0], 1, [0.12, 0.2, 0.04]],
      [new THREE.IcosahedronGeometry(0.5, 0), graphite, [1.6, 1.9, -1], 1, [0.2, 0.15, 0.1]],
      [new THREE.SphereGeometry(0.38, 48, 48), frosted, [5.6, -1.6, -0.8], 1, [0, 0.1, 0]],
    ],
  };

  const items = (presets[preset] || presets.hero).map(([geometry, material, position, scale, spin], i) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.scale.setScalar(0.0001);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    group.add(mesh);
    return { mesh, baseY: position[1], scale, spin, phase: i * 1.3, amp: 0.18 + (i % 3) * 0.08, freq: 0.5 + (i % 4) * 0.12 };
  });

  const state = { running: true, scroll: 0, time: 0, reveal: 0 };
  const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  let width = 0;
  let height = 0;

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    // tela estreita: o conjunto vai para o centro, menor e mais alto
    if (width < 900) {
      group.position.set(-2.9, 2.3, 0);
      group.scale.setScalar(0.5);
    } else {
      group.position.set(0, 0, 0);
      group.scale.setScalar(Math.min(1, camera.aspect / 1.6));
    }
  }
  resize();
  window.addEventListener('resize', resize);

  if (finePointer) {
    window.addEventListener(
      'pointermove',
      (event) => {
        pointer.tx = event.clientX / window.innerWidth;
        pointer.ty = event.clientY / window.innerHeight;
      },
      { passive: true }
    );
  }

  function reveal() {
    if (state.reveal) return;
    state.reveal = 1;
    items.forEach(({ mesh, scale }, i) => {
      gsap.to(mesh.scale, { x: scale, y: scale, z: scale, duration: 1.4, delay: i * 0.12, ease: 'back.out(1.4)' });
    });
  }

  function render(_t, deltaTime) {
    if (!state.running || !width) return;
    const dt = Math.min(deltaTime || 16, 50) / 1000;
    if (!reduceMotion) state.time += dt;
    const k = 1 - Math.pow(0.02, dt);
    pointer.x += (pointer.tx - pointer.x) * k;
    pointer.y += (pointer.ty - pointer.y) * k;

    for (const it of items) {
      it.mesh.rotation.x += it.spin[0] * dt;
      it.mesh.rotation.y += it.spin[1] * dt;
      it.mesh.rotation.z += it.spin[2] * dt;
      it.mesh.position.y = it.baseY + Math.sin(state.time * it.freq + it.phase) * it.amp;
    }

    group.rotation.y = (pointer.x - 0.5) * 0.45 + state.scroll * 0.6;
    group.rotation.x = (pointer.y - 0.5) * 0.25 - state.scroll * 0.3;
    group.rotation.z = state.scroll * 0.15;
    renderer.render(scene, camera);
  }
  gsap.ticker.add(render);

  return {
    state,
    reveal,
    resize,
    setRunning(value) {
      state.running = value;
    },
    destroy() {
      gsap.ticker.remove(render);
      window.removeEventListener('resize', resize);
      renderer.dispose();
    },
  };
}
