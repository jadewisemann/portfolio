/**
 * 히어로 뒤에 놓이는 물체의 셰이더.
 *
 * 형태: 고해상도 정이십면체를 3D 심플렉스 노이즈로 밀어낸 덩어리입니다. 시간 · 스크롤 ·
 * 포인터가 밀어내는 양을 바꿉니다.
 *
 * 면 처리: 법선을 정점에서 계산하지 않고 **프래그먼트에서 화면 공간 미분**으로 구합니다
 * (`dFdx`/`dFdy` 의 외적). 변위 뒤의 법선을 정점에서 정확히 구하려면 이웃 표본을 두 번
 * 더 떠야 하는데, 미분을 쓰면 공짜이고 결과가 **면 단위로 딱 떨어집니다** — 부드러운
 * 덩어리가 아니라 각진 결정처럼 보이는 것이 의도입니다.
 *
 * 색: 셋 다 CSS 사용자 정의 속성에서 옵니다(`--ground-2` · `--ink-3` · `--signal-built`).
 * 그래서 테마를 바꾸면 물체의 색도 함께 바뀌고, 팔레트가 두 곳으로 갈라지지 않습니다.
 *
 * 노이즈 구현은 Ashima Arts / Stefan Gustavson 의 표준 simplex noise (MIT) 입니다.
 */

const SIMPLEX_3D = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

export const VERTEX_SHADER = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform float uAmplitude;
uniform vec2 uPointer;

varying vec3 vViewPosition;
varying float vRelief;

${SIMPLEX_3D}

void main() {
  vec3 pos = position;
  vec3 dir = normalize(pos);

  float t = uTime * 0.19;

  /*
    두 옥타브. 낮은 쪽이 덩어리의 큰 형태를, 높은 쪽이 면의 잔결을 만듭니다.
    스크롤이 깊어질수록 낮은 옥타브의 주파수를 올려 형태가 조금씩 조여집니다.
  */
  float low  = snoise(pos * (1.05 + uScroll * 0.35) + vec3(t, t * 0.63, -t * 0.44));
  float high = snoise(pos * 2.6 + vec3(-t * 0.9, t * 1.21, t * 0.7));

  float relief = low * 0.34 + high * 0.11;

  // 포인터가 향한 쪽이 부풀어 오릅니다. 마우스가 물체를 미는 것이 아니라 당깁니다.
  float pull = dot(dir, normalize(vec3(uPointer, 0.85)));
  relief += smoothstep(0.15, 1.0, pull) * 0.20;

  vRelief = relief;
  pos += normal * relief * uAmplitude;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vViewPosition = mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const FRAGMENT_SHADER = /* glsl */ `
precision highp float;

uniform vec3 uColorBody;
uniform vec3 uColorLit;
uniform vec3 uColorRim;
uniform float uRimStrength;

varying vec3 vViewPosition;
varying float vRelief;

/* 값 잡음. 면이 넓어서 밴딩이 보이므로 아주 얕게 깹니다. */
float grain(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  // 변위 뒤의 법선을 화면 공간 미분으로 구합니다 — 면 단위로 딱 떨어집니다.
  vec3 normal = normalize(cross(dFdx(vViewPosition), dFdy(vViewPosition)));
  vec3 view = normalize(-vViewPosition);

  // 빛은 하나, 왼쪽 위에서 옵니다. 사이트의 액자 경사와 같은 방향입니다.
  float lambert = max(dot(normal, normalize(vec3(-0.42, 0.78, 0.62))), 0.0);
  float fresnel = pow(1.0 - max(dot(normal, view), 0.0), 2.4);

  vec3 color = mix(uColorBody, uColorLit, lambert * 0.82 + vRelief * 0.22);
  color = mix(color, uColorRim, fresnel * uRimStrength);
  color += (grain(gl_FragCoord.xy) - 0.5) * 0.016;

  gl_FragColor = vec4(color, 1.0);
}
`;
