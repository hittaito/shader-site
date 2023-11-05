import { Canvas } from "@react-three/fiber";
import "./App.css";
import { Perf } from "r3f-perf";
import { Experience } from "./Experience";
import { EffectComposer, SMAA } from "@react-three/postprocessing";
// import { forwardRef, useMemo } from "react";
// import { FXAAEffect, BlendFunction } from "postprocessing";

// const FXAA = forwardRef(({}, ref) => {
//   const effect = useMemo(
//     () => new FXAAEffect({ blendFunction: BlendFunction.MULTIPLY }),
//     []
//   );
//   return <primitive ref={ref} object={effect} dispose={null}></primitive>;
// });

function App() {
  return (
    <>
      <Canvas color="red">
        <Experience />
        <EffectComposer>
          <SMAA />
        </EffectComposer>
        <Perf position="top-left" />
      </Canvas>
    </>
  );
}

export default App;
