#define PI acos(-1.)

uniform vec2 uResolution;
uniform float uTime;

in vec2 iUv;
out vec4 oColor;

void main() {
  vec2 uv = (2.*gl_FragCoord.xy - uResolution.xy)/min(uResolution.x,uResolution.y);
  vec3 col = vec3(0);

  col.xy = uv;
  oColor = vec4(col, 1.);
}