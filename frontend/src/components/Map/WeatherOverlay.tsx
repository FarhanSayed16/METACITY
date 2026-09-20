import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUIStore } from '../../store/uiStore';

export const WeatherOverlay: React.FC = () => {
  const weather = useUIStore((state) => state.weather);
  const particlesRef = useRef<THREE.Points>(null);

  const particleCount = 10000;
  
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2000; // x
      pos[i * 3 + 1] = Math.random() * 1000;      // y (height)
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2000; // z
      
      vel[i] = Math.random() * 2 + 1; // fall speed
    }
    return [pos, vel];
  }, []);

  useFrame((_, delta) => {
    if (!particlesRef.current || weather === 'clear') return;
    
    const geom = particlesRef.current.geometry;
    const posAttribute = geom.attributes.position;
    
    const speedMult = weather === 'rain' ? 500 : 100;
    
    for (let i = 0; i < particleCount; i++) {
      let y = posAttribute.getY(i);
      y -= velocities[i] * delta * speedMult;
      
      if (y < 0) {
        y = 1000; // Reset to top
      }
      
      posAttribute.setY(i, y);
    }
    posAttribute.needsUpdate = true;
  });

  if (weather === 'clear') return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        {/* @ts-ignore - React Three Fiber type definitions mismatch for bufferAttribute */}
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={weather === 'rain' ? 2 : 5}
        color={weather === 'rain' ? '#88ccff' : '#ffffff'}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};
