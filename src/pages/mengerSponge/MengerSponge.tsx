import React, { useEffect, useState } from "react";
import { GLSL3, ShaderMaterial, Vector2, Vector3 } from "three";
import vert from "./main.vert?raw";
import frag from "./main.frag?raw";
import { useFrame, useThree } from "@react-three/fiber";
import { ScreenQuad } from "@react-three/drei";
import { useControls } from "leva";

export const MengerSponge: React.FC = () => {
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
        uPolor: { value: 4 },
        uOffset: { value: new Vector3(1, 1, 1) },
        uScale: { value: 3 },
      },
    });
    setMaterial(mat);
  }, []);

  const { uPolor, uOffsetX, uOffsetY, uOffsetZ, uScale } = useControls(
    "shader",
    {
      uPolor: { value: 4, min: 3, max: 10, step: 1 },
      uOffsetX: { value: 1, min: 0.001, max: 4 },
      uOffsetY: { value: 1, min: 0.001, max: 4 },
      uOffsetZ: { value: 1, min: 0.001, max: 4 },
      uScale: { value: 3, min: 1, max: 5 },
    }
  );

  const viewport = useThree((state) => state.viewport);

  useFrame((state) => {
    if (!material) return;

    // update unimforms

    material.uniforms.uResolution.value.x = state.size.width;
    material.uniforms.uResolution.value.y = state.size.height;
    material.uniforms.uTime.value = state.clock.getElapsedTime();
    material.uniforms.uMouse.value = state.mouse;
    material.uniforms.uPolor.value = uPolor;
    material.uniforms.uOffset.value.set(uOffsetX, uOffsetY, uOffsetZ);
    material.uniforms.uScale.value = uScale;
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
