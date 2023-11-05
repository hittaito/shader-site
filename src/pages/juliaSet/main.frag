#define PI acos(-1.)

uniform vec2 uResolution;
uniform float uTime;
uniform vec4 uC;

in vec2 iUv;
out vec4 oColor;


// https://qiita.com/aa_debdeb/items/bffe5b7a33f5bf65d25b#quaternion-julia-set

// vec4 mulQ(vec4 q1, vec4 q2) {
//   return vec4(q2.w * q1.x - q2.z * q1.y + q2.y * q1.z + q2.x * q1.w,
//               q2.z * q1.x + q2.w * q1.y - q2.x * q1.z + q2.y * q1.w,
//               -q2.y * q1.x + q2.x * q1.y + q2.w * q1.z + q2.z * q1.w,
//               -q2.x * q1.x - q2.y * q1.y - q2.z * q1.z + q2.w * q1.w);
// }

vec4 mulQ(vec4 a, vec4 b) {
    return vec4(
        a.x * b.x - a.y * b.y - a.z * b.z - a.w * b.w,
        a.x * b.y + a.y * b.x - a.z * b.w + a.w * b.z,
        a.x * b.z + a.y * b.w + a.z * b.x - a.w * b.y,
        a.x * b.w - a.y * b.z + a.z * b.y + a.w * b.x
    );
}

float sdQuaternionJuliaSet(vec3 p, vec4 c) {
  vec4 z = vec4(p, 0.);
  vec4 dz = vec4(1.,0.,0.,0.);
  vec4 pz, pdz;
  float r=0., dr=1.;

  for(int i=0;i<10;i++) {
    pz = z;
    z = mulQ(pz,pz)+c; // z = z^2+c
    pdz=dz;
    dz = 2. * mulQ(pz,pdz);
    r=length(z);
    dr=length(dz);
    if(r>4.)break;
  }
  return .5* log(r) *r / dr;
}

vec3 map(vec3 p) {
  vec2 res;
  // floor
  float d = p.y - (-.7);
  res = vec2(d, 0.);

  // julia set
  d = sdQuaternionJuliaSet(p, uC);
  if (d<res.x) res = vec2(d, 1.);

  return vec3(res,0.);
}

vec4 march(vec3 ro, vec3 rd) {
  float d = 0.001;
  vec3 res;
  int step;

  for(int i=0;i<99;i++) {
    vec3 p = ro+rd*d;
    res = map(p);
    d+=res.x;
    step = i;
    if(abs(res.x)<0.0001||d>100.)break;

  }
  if (d>100.) res.y=-1.;

  return vec4(d, res.yz, float(step));
}
float shadow(vec3 ro, vec3 rd) {
  float res = 1.;
  float d = 0.001;

  for(int i=0;i<64;i++) {
    vec3 p = ro+rd*d;
    float diff = map(p).x;
    res = min(res, 24.*max(diff/d, 0.));
    if (res<0.0001) break;
    d+=diff;
  }

  return res;
}
float occlusion(vec3 p, vec3 n) {
  float occ = 0.;
  float sca = 1.;
  for(int i =0; i<5;i++) {
    float h = 0.01+.11*float(i)/4.;
    vec3 opos = p+h*n;
    float d = map(opos).x;
    occ += (h-d)*sca;
    sca *= .95;
  }
  return clamp(1.-2.*occ, .0, 1.);
}
vec3 normal(vec3 p) {
  vec2 k = vec2(-1,1);
  float e = 0.0001;
  return normalize(
    k.xxx*map(p+e*k.xxx).x+
    k.xyy*map(p+e*k.xyy).x+
    k.yxy*map(p+e*k.yxy).x+
    k.yyx*map(p+e*k.yyx).x
  );
}
vec3 render(vec2 offset) {
  vec2 uv = (2.*(gl_FragCoord.xy+offset) - uResolution.xy)/min(uResolution.x,uResolution.y);
  vec3 col = vec3(0.2);
  float time = uTime*.8;

  vec3 ro = vec3(2.*sin(time),1.5,2.*cos(time));
  vec3 ta = vec3(0.,-.4, 0.);
  vec3 ww = normalize(ta-ro);
  vec3 up = vec3(0,1,0);
  vec3 uu = cross(ww,up);
  vec3 vv = cross(uu,ww);
  vec3 rd = normalize(uv.x*uu+uv.y*vv+1.1*ww);

  vec4 res = march(ro,rd);

  if (res.y>-.5) {
    vec3 p = ro+rd*res.x;
    vec3 n = normal(p);
    vec3 ref = reflect(rd,n);

    if(res.y < 0.5 ) {
      // ground
      col = vec3(0.1, .1, .2);

    } else if( res.y<1.5) {
      // julia set
      col = vec3(.1, .2,.1);

    }
    vec3 sun_dir = normalize(vec3(.5, .35, .5));
    float sun_dif = clamp(dot(n, sun_dir), .0, 1.);
    float sun_sha = shadow(p+0.0001*n, sun_dir);
    vec3 sun_hal = normalize(sun_dir-rd);
    float sun_spec = pow(clamp(dot(n, sun_hal), 0., 1.), 8.)
                    * sun_dif
                    * pow(clamp(1.+dot(sun_hal, rd), 0., 1.), 8.);

    float occ = occlusion(p, n);
    float fre = clamp(1.+dot(rd, n), 0., 1.);

    float sky_dif = sqrt(clamp(.5+n.y*.5, 0., 1.));
    float bou_dif = sqrt(clamp( 0.1-0.9*n.y, 0.0, 1.0 ))*clamp(1.0-0.1*p.y,0.0,1.0);

    vec3 lin = vec3(0);
    vec3 sun_col = vec3(6.1, 5.2, 5.1);
    lin += sun_dif * sun_col * sun_sha;
    lin += sky_dif * vec3(.5, .7, .1) *occ;
    lin += bou_dif * vec3(.3, 1., .4) *occ;
    lin += fre*vec3(1.,.5,.5)* 5.*(.5+.5*sun_dif*occ)*(.1+sun_sha);

    col = col*lin;
    col += sun_spec * sun_col * sun_sha *occ;
    // col = vec3(occ*occ);
  }
  return col;
}

#define AA 1
void main() {
  vec3 total = vec3(0.);
  for(int m=0;m<AA;m++)
  for(int n=0;n<AA;n++) {
    vec2 offset = vec2(float(m), float(n))/float(AA)-.5;
    total += render(offset);
  }
  total /= float(AA*AA);

  oColor = vec4(total, 1.);
}