import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
// import { Fn } from "three/webgpu";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Fn(() => {

//   const noiseVec = vec2(12.9898, 78.233);
//   const noise = fract(sin(dot(uv(), noiseVec)).mul(43758.5453));

//   return noise
// });

// Fn(([uvCoords, colorStart, colorEnd]) => {
//   const center = vec2(0.5, 0.5); // Center of the gradient
//   const radius = length(sub(uvCoords, center)); // Distance from center
//   const gradient = mix(colorStart, colorEnd, smoothstep(0.0, 0.7, radius));
  
//   // Add a wave-like pattern for a more dynamic effect
//   const waveIntensity = 0.1; // Intensity of the wave effect
//   const waveFrequency = 10.0; // Frequency of the wave effect
//   const wave = sin(mul(uvCoords.x, waveFrequency)).mul(waveIntensity);
  
//   // Apply the wave effect to the gradient
//   const finalColor = mix(gradient, color(0xffffff), wave);
  
//   return finalColor;
// });
