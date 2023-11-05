import React, { useEffect, useState } from "react";
import { GLSL3, ShaderMaterial, Vector2 } from "three";
import vert from "./main.vert?raw";
import frag from "./main.frag?raw";
import { useFrame, useThree } from "@react-three/fiber";
import { ScreenQuad } from "@react-three/drei";

export const AO: React.FC = () => {
  const [material, setMaterial] = useState<ShaderMaterial>();
  useEffect(() => {
    const mat = new ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      glslVersion: GLSL3,
      uniforms: {
        uResolution: { value: new Vector2(0, 0) },
        uTime: { value: 0 },
        uMouse: { value: new Vector2(0, 0) },
      },
    });
    setMaterial(mat);
  }, []);

  const viewport = useThree((state) => state.viewport);

  useFrame((state, delta) => {
    if (!material) return;

    // update unimforms

    material.uniforms.uResolution.value.x = state.size.width;
    material.uniforms.uResolution.value.y = state.size.height;
    material.uniforms.uTime.value = state.clock.getElapsedTime();
    material.uniforms.uMouse.value = state.mouse;
  });

  return (
    <>
      <ScreenQuad
        scale={[viewport.width, viewport.height, 1]}
        material={material}
      />
    </>
  );
};
