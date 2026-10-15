precision highp float;

// Fumaça fluida (ruído com dobra de domínio), renderizada em baixa resolução.
// Saída: r = densidade principal, g = véu secundário, b = canal auxiliar.

varying vec2 vUv;
uniform float uTime;
uniform vec2 uMouse;
uniform float uAspect;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p = rot * p * 2.0 + 10.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  float t = uTime * 0.05;
  vec2 m = uMouse - 0.5;
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0) * 1.9 + m * 0.12;

  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t * 0.7));
  vec2 r = vec2(
    fbm(p + 2.6 * q + vec2(1.7, 9.2) + t * 0.45),
    fbm(p + 2.6 * q + vec2(8.3, 2.8) - t * 0.35)
  );
  float f = fbm(p + 2.4 * r);

  gl_FragColor = vec4(f, q.y, r.x, 1.0);
}
