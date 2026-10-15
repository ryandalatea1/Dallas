precision highp float;

varying vec2 vUv;

uniform sampler2D uTex;    // foto
uniform sampler2D uSmoke;  // fumaça (passe de baixa resolução)
uniform vec2 uRes;
uniform vec2 uImgRes;
uniform vec2 uMouse;       // 0..1, y para cima
uniform float uTime;
uniform float uReveal;     // 0 -> 1 durante a abertura
uniform float uScroll;     // 0 -> 1 enquanto o hero sai da tela
uniform float uStrength;   // energia do cursor, decai quando ele para

// Luz da marca: tudo no hero é iluminado pelo verde da logo.
const vec3 DEEP    = vec3(0.012, 0.082, 0.047);
const vec3 FOREST  = vec3(0.039, 0.180, 0.102);
const vec3 EMERALD = vec3(0.070, 0.502, 0.247);
const vec3 LIME    = vec3(0.420, 1.000, 0.180);
const vec3 ICE     = vec3(0.925, 1.000, 0.902);
const vec3 ASH     = vec3(0.160, 0.205, 0.175);

vec2 coverUv(vec2 uv, vec2 res, vec2 img) {
  float ra = res.x / res.y;
  float ia = img.x / img.y;
  vec2 s = ra > ia ? vec2(1.0, ia / ra) : vec2(ra / ia, 1.0);
  return (uv - 0.5) * s + 0.5;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float luma(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

// Silhueta aproximada da pessoa na foto (coordenadas da imagem, y para cima).
// Dentro dela o fundo é escuro e sólido; fora, a fumaça toma conta.
// Se trocar a foto, ajuste aqui: centro, largura por altura e topo da cabeça.
float subjectMask(vec2 p) {
  float head = smoothstep(0.70, 0.88, p.y);
  float cx = mix(0.505, 0.478, head);
  float halfWidth = mix(0.125, 0.075, head);
  float dx = abs(p.x - cx);
  float mx = 1.0 - smoothstep(halfWidth, halfWidth + 0.07, dx);
  float my = 1.0 - smoothstep(0.94, 1.0, p.y);
  return mx * my;
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  vec2 m = uMouse - 0.5;

  // Amostragem da foto: cover, zoom da abertura, parallax do cursor e do scroll.
  float zoom = mix(1.18, 1.0, uReveal);
  vec2 iuv = coverUv(uv, uRes, uImgRes);
  iuv = (iuv - 0.5) / zoom + 0.5;
  iuv += m * vec2(0.022, 0.016) * uReveal;
  iuv.y += uScroll * 0.18;

  // Lente líquida que segue o cursor e acalma quando ele para.
  vec2 d = uv - uMouse;
  d.x *= aspect;
  float r = length(d);
  float lens = exp(-r * r * 14.0) * uStrength;
  vec2 disp = d * lens * 0.22;
  float ripple = sin(r * 28.0 - uTime * 4.0) * lens * 0.006;
  disp += normalize(d + 1e-5) * ripple;

  vec3 tex;
  tex.r = texture2D(uTex, iuv - disp * 1.18).r;
  tex.g = texture2D(uTex, iuv - disp).g;
  tex.b = texture2D(uTex, iuv - disp * 0.82).b;
  float l = pow(smoothstep(0.03, 0.92, luma(tex)), 1.05);
  float mask = subjectMask(iuv - disp);

  // Foco de luz atrás da cabeça (o brilho da logo).
  vec2 gc = vec2(0.5 + m.x * 0.06, 0.82 + m.y * 0.04);
  vec2 gd = (uv - gc) * vec2(1.0, 1.45);
  gd.x *= max(aspect, 1.0) * 0.62;
  float g = 1.0 - smoothstep(0.0, 1.0, length(gd));
  g *= 0.94 + 0.06 * sin(uTime * 0.7);

  // Fumaça verde em volta da pessoa.
  vec3 sm = texture2D(uSmoke, uv).rgb;
  float s = smoothstep(0.26, 0.76, sm.r);
  vec3 smoke = mix(DEEP, FOREST, smoothstep(0.0, 0.5, s));
  smoke = mix(smoke, EMERALD * 0.85, smoothstep(0.38, 0.85, s));
  smoke = mix(smoke, LIME * 0.42, smoothstep(0.78, 1.0, s) * 0.75);
  smoke = mix(smoke, ASH, smoothstep(0.5, 0.85, sm.g) * (1.0 - s) * 0.45);
  smoke += (EMERALD * 0.4 + LIME * 0.14) * pow(g, 2.5) * (0.35 + 0.65 * s);

  // Base: fumaça fora da silhueta, escuro sólido dentro dela.
  vec3 base = mix(smoke, DEEP, mask);

  // A pessoa é pintada com a mesma luz: sombras caem no fundo,
  // meios-tons vão para o esmeralda, altas luzes para o lima e depois gelo.
  vec3 lit = mix(EMERALD, LIME, smoothstep(0.12, 0.68, l));
  lit = mix(lit, ICE, smoothstep(0.66, 1.0, l));
  // Fora da silhueta (o corredor da foto) fica só um fantasma esmeralda, para a fumaça mandar.
  vec3 ghost = mix(FOREST, EMERALD, smoothstep(0.1, 0.9, l));
  lit = mix(ghost, lit, mask);
  float imgMix = smoothstep(0.05, 0.6, l) * mix(0.22, 1.0, mask);
  vec3 col = mix(base, lit, imgMix);

  // Bordas um pouco mais calmas para o título e as legendas.
  float side = smoothstep(0.0, 0.28, uv.x) * smoothstep(1.0, 0.72, uv.x);
  col = mix(col * 0.72, col, side);

  // Topo mais escuro para a navegação ler bem.
  col = mix(col, DEEP, smoothstep(0.78, 1.0, uv.y) * 0.72);

  // Funde com a página embaixo.
  col = mix(DEEP, col, smoothstep(0.0, 0.3, uv.y));

  // Grão de filme, mais forte na fumaça.
  float n = hash(floor(uv * uRes * 0.5) + fract(uTime * 0.37) * 13.0) - 0.5;
  col += n * (0.045 + 0.045 * (1.0 - mask));

  // Abertura.
  col = mix(DEEP, col, smoothstep(0.0, 1.0, uReveal));

  gl_FragColor = vec4(col, 1.0);
}
