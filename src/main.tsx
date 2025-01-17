import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Fn, mix, mul, oneMinus, time, uv, vec2, vec3, vec4 } from "three/webgpu";
import { smoothstep } from "three/src/math/MathUtils.js";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Fn(([scale]) => {
//   return uv()
//     .mul(scale)
//     .add(vec2(0, time.mul(0.03).negate()));
// })

// Fn(([noiseTexture]) => {
 
//   const alpha = mul(
//     noiseTexture.r.smoothstep(0.4, 1),

//     smoothstep(0, 0.1, uv().x),
//     smoothstep(0, 0.1, oneMinus(uv().x)),
//     smoothstep(0, 0.1, uv().y),
//     smoothstep(0, 0.1, oneMinus(uv().y))
//   );

//   // color

//   const finalColor = mix(vec3(0.6, 0.3, 0.2), vec3(1, 1, 1), alpha.pow(3));

//   return vec4(finalColor, alpha);
// })
