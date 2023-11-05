#define PI acos(-1.)

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uMouse; // -1 ~ 1
uniform float uPolor;
uniform vec3 uOffset;
uniform float uScale;

in vec2 iUv;
out vec4 oColor;

float time;

vec2 pmod(vec2 p, float n) {
  float a = mod(atan(p.y,p.x), 2.*PI/n) - .5*2.*PI/n;
  return length(p)*vec2(cos(a),sin(a));
}

float sdBox(vec3 p, vec3 box) {
  vec3 q = abs(p) - box;
  return length(max(q, 0.)) + min(0., max(q.x, max(q.y, q.z)));
}
float sdSphere(vec3 p, float r) {
  return length(p) - r;
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
  vec2 res;
  vec3 mp = p;
  mp.z -= time;
  mp.z = mod(mp.z, 2.) - 1.;
  mp.xy = pmod(mp.xy, uPolor);
  float d = sdMenger(mp, uOffset, uScale);
  res = vec2(d,0.);


  vec3 ce = vec3(sin(time*2.1)*.3, cos(time*1.1)*.3, 1. + cos(time*2.)* 1.6);
  d = sdSphere(p-ce, .1);
  if (d<res.x) res = vec2(d, 1.);

  return vec3(res, 0.);
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
  time = uTime * 1.;
  vec3 col = vec3(0);
  vec3 ro = vec3(0, 0, 3.+sin(sin(time* 2.)+1.2)* .4);
  vec3 rd = normalize(vec3(uv, -1.3));


  vec4 res = march(ro, rd);
  if (res.y >=0.) {
    vec3 p = ro+rd*res.x;
    vec3 n = normal(p);

    vec3 light_pos = vec3(sin(time*2.1)*.3, cos(time*1.1)*.3, 1. + cos(time*2.)* 1.6);
    vec3 light_dir = normalize(light_pos-p);
    float light_dif = clamp(dot(n, light_dir), 0.,1.);
    vec3 light_hal = normalize(light_dir-rd);
    float light_spec = pow(clamp(dot(n, light_hal), 0., 1.), 6.)
                      *light_dif
                      *pow(clamp(1.+dot(light_hal, rd), 0., 1.), 6.);
    vec3 light_col = vec3(.1, .35, 1.)*4.;
    vec3 lin = light_col * light_dif * .25;

    if (res.y < .5) {
      col = vec3(1., .3, .5);
    } else if (res.y < 1.5) {
      col = vec3(.2, .2, 1.)*5.;
      lin = vec3(.8)*.1;
    }
    col = col * lin;
    col += light_spec * light_col * 4.;
  }
  float fog = res.x/ 90.;
  float dist = res.w * .0085;
  col = mix(col, vec3(1.), fog) + dist;

  oColor = vec4(col, 1.);
}