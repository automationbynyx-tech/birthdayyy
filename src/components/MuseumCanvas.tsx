import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import MuseumWorld, { type MuseumWorldProps } from "./MuseumWorld";

type MuseumCanvasProps = MuseumWorldProps & {
  onReady: () => void;
  onShowFallback: () => void;
};

function WebGLFallback({
  onReady,
  onShowFallback,
}: Pick<MuseumCanvasProps, "onReady" | "onShowFallback">) {
  useEffect(() => onReady(), [onReady]);

  return (
    <div className="museum-webgl-fallback">
      <p>This browser could not open the 3D exhibition.</p>
      <button type="button" onClick={onShowFallback}>
        Open the accessible 2D museum
      </button>
    </div>
  );
}

export default function MuseumCanvas({
  onReady,
  onShowFallback,
  ...worldProps
}: MuseumCanvasProps) {
  return (
    <Canvas
      className="museum3d-canvas"
      role="group"
      aria-label="3D museum. Scroll vertically to move through the five rooms."
      camera={{
        position: [0, 1.65, 6],
        fov: 66,
        near: 0.1,
        far: 170,
      }}
      dpr={[1, 1.35]}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
      }}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      fallback={
        <WebGLFallback onReady={onReady} onShowFallback={onShowFallback} />
      }
    >
      <Suspense fallback={null}>
        <MuseumWorld {...worldProps} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
