import React from 'react';
import { PointerLockControls, OrbitControls } from '@react-three/drei';
import { useUIStore } from '../../store/uiStore';

interface WalkthroughControlsProps {
  /** Lock camera to orthographic top-down (2D network view) */
  topDown?: boolean;
}

export const WalkthroughControls: React.FC<WalkthroughControlsProps> = ({ topDown = false }) => {
  const walkthroughMode = useUIStore((state) => state.walkthroughMode);

  if (topDown) {
    return (
      <OrbitControls
        makeDefault
        enableRotate={false}
        enablePan
        enableZoom
        minZoom={0.2}
        maxZoom={4}
        target={[0, 0, 0]}
      />
    );
  }

  if (walkthroughMode) {
    return <PointerLockControls />;
  }

  return (
    <OrbitControls makeDefault minDistance={10} maxDistance={2000} maxPolarAngle={Math.PI / 2.1} />
  );
};
