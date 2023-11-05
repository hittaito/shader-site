#define PI acos(-1.)

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uMouse; // -1 ~ 1
uniform float uPolor;
uniform vec3 uOffset;
uniform float uScale;

in vec2 iUv;
out vec4 oColor;



vec2 pmod(vec2 p, float n) {
  float a = mod(atan(p.y,p.x), 2.*PI/n) - .5*2.*PI/n;
  return length(p)*vec2(cos(a),sin(a));
}

float sdBox(vec3 p, vec3 box) {
  vec3 q = abs(p) - box;
  return length(max(q, 0.)) + min(0., max(q.x, max(q.y, q.z)));
}

float sdMenger(vec3 p, vec3 offset, float scale) {
  float s = 1.;
  for(int i = 0; i<5;i++) {
    p = abs(p);
    if (p.x<p.y) p.xy = p.yx;
    if (p.x<p.z) p.xz = p.zx;
    if (p.y<p.z) p.yz = p.zy;

    p*=scale;
    s*=scale;

    p -= offset*(scale-1.);
    if(p.z<-.5 * offset.z * (scale-1.)) p.z += offset.z*(scale-1.);
  }

  return sdBox(p, vec3(1.))/s;
}


vec3 map(vec3 p) {
  vec3 mp = p;
  mp.z -= uTime * .6;
  mp.z = mod(mp.z, 2.) - 1.;
  mp.xy = pmod(mp.xy, uPolor);
  float d = sdMenger(mp, uOffset, uScale);

  return vec3(d, 0., 0.);
}

vec4 march(vec3 ro, vec3 rd) {
  float d = 0.001;
  vec3 res;
  int step = 0;

  for (int i=0;i<99;i++) {
    vec3 p = ro+rd*d;
    res = map(p);
    d+=res.x;
    step = i;

    if (res.x<0.001||d>100.)break;
  }
  if (d>100.) res.y = -1.;
  return vec4(d, res.yz, float(step));
}
vec3 normal(vec3 p) {
  vec2 k = vec2(-1,1);
  float e = 0.001;
  return normalize(
    k.xxx*map(p+e*k.xxx).x+
    k.xyy*map(p+e*k.xyy).x+
    k.yxy*map(p+e*k.yxy).x+
    k.yyx*map(p+e*k.yyx).x
  );
}

void main() {
  vec2 uv = (2.*gl_FragCoord.xy - uResolution.xy)/min(uResolution.x,uResolution.y);
  vec3 col = vec3(0);
  vec3 ro = vec3(0, 0, 3);
  vec3 rd = normalize(vec3(uv, -1.3));

  vec4 res = march(ro, rd);
  if (res.y >=0.) {
    vec3 p = ro+rd*res.x;
    vec3 n = normal(p);
    col = n;
  }
  float fog = res.x/ 30.;
  col = mix(col, vec3(1.), fog);

  oColor = vec4(col, 1.);
}