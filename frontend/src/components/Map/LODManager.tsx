import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

// We define 3 LOD tiers based on camera distance
// 0: High Detail (< 500)
// 1: Medium Detail (500 - 2000)
// 2: Low Detail (> 2000)

export const LODManager: React.FC = () => {
  const { camera } = useThree();
  const lastLOD = useRef(-1);

  // Instead of pushing to a global store which causes React renders,
  // a true LOD system uses instancing or three.js `LOD` objects.
  // For MVP, we'll just log or set a class on the body to let CSS know, 
  // or we can dispatch to the store only when it changes to trigger a re-render of NetworkLayer.
  // For maximum performance, we won't even use this to trigger React renders. We will just expose it.
  
  useFrame(() => {
    // Distance from origin (assuming city is centered)
    const dist = camera.position.length();
    
    let currentLOD = 0;
    if (dist > 2000) {
      currentLOD = 2;
    } else if (dist > 500) {
      currentLOD = 1;
    }

    if (currentLOD !== lastLOD.current) {
      lastLOD.current = currentLOD;
      // You could update a store here if you want to swap React components
      // console.log("LOD Tier Changed:", currentLOD);
    }
  });

  return null;
};
