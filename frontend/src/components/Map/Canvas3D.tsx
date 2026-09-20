import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Grid } from '@react-three/drei';
import { useUIStore } from '../../store/uiStore';
import { WalkthroughControls } from './WalkthroughControls';
import { HeatmapLayer } from './HeatmapLayer';
import { WeatherOverlay } from './WeatherOverlay';
import { NetworkLayer } from './NetworkLayer';
import { LODManager } from './LODManager';

interface Canvas3DProps {
  /** When true, use perspective 3D; when false, orthographic top-down network view */
  perspective?: boolean;
}

export const Canvas3D: React.FC<Canvas3DProps> = ({ perspective = true }) => {
  const isNightMode = useUIStore((state) => state.isNightMode);
  const { editorMode, setSelectedNodeId } = useUIStore();

  const handlePointerMissed = () => {
    if (editorMode === 'select') {
      setSelectedNodeId(null);
    }
  };

  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        orthographic={!perspective}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        camera={
          perspective
            ? { position: [0, 500, 500], fov: 60 }
            : { position: [0, 800, 0], zoom: 0.8, near: 0.1, far: 5000, up: [0, 0, -1] }
        }
        onPointerMissed={handlePointerMissed}
      >
        <color attach="background" args={[isNightMode ? '#0a0a1a' : '#e8eef2']} />

        {isNightMode ? (
          <ambientLight intensity={0.35} />
        ) : (
          <>
            <ambientLight intensity={0.7} />
            <directionalLight position={[100, 200, 50]} intensity={1.2} castShadow />
            {perspective && <Sky sunPosition={[100, 20, 100]} />}
          </>
        )}

        <Grid
          infiniteGrid
          fadeDistance={2000}
          cellColor={isNightMode ? '#333333' : '#cbd5e1'}
          sectionColor={isNightMode ? '#555555' : '#94a3b8'}
        />

        <WalkthroughControls topDown={!perspective} />

        {perspective && <WeatherOverlay />}
        {perspective && <HeatmapLayer type="accessibility" />}
        <NetworkLayer />

        {perspective && <LODManager />}
      </Canvas>
    </div>
  );
};
