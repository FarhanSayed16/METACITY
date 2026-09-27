import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';

function ProceduralCityGrid() {
  const groupRef = useRef<THREE.Group>(null);
  const coreMeshRef = useRef<THREE.InstancedMesh>(null);
  const wireMeshRef = useRef<THREE.InstancedMesh>(null);
  const pulseMeshRef = useRef<THREE.InstancedMesh>(null);
  const mountTimeRef = useRef(0);

  const { count, instances } = useMemo(() => {
    const GRID_SIZE = 21;
    const SPACING = 2.6;
    const list: Array<{
      px: number;
      pz: number;
      targetH: number;
      delay: number;
      color: THREE.Color;
      w: number;
      d: number;
    }> = [];

    for (let x = -Math.floor(GRID_SIZE / 2); x <= Math.floor(GRID_SIZE / 2); x++) {
      for (let z = -Math.floor(GRID_SIZE / 2); z <= Math.floor(GRID_SIZE / 2); z++) {
        const dist = Math.sqrt(x * x + z * z);
        const baseH = Math.exp(-(dist * dist) / 64) * 22;
        const h = Math.max(0.4, baseH + Math.random() * 2.5);
        const isCritical = Math.random() > 0.95;
        list.push({
          px: x * SPACING,
          pz: z * SPACING,
          targetH: h,
          delay: dist * 0.12,
          color: new THREE.Color(isCritical ? '#F59E0B' : '#2A9D8F'),
          w: SPACING * 0.72,
          d: SPACING * 0.72,
        });
      }
    }
    return { count: list.length, instances: list };
  }, []);

  const { pulseCount, pulses } = useMemo(() => {
    const GRID_SIZE = 21;
    const SPACING = 2.6;
    const half = (GRID_SIZE * SPACING) / 2;
    const list: Array<{
      x: number;
      z: number;
      isXAxis: boolean;
      speed: number;
      color: THREE.Color;
    }> = [];
    for (let i = 0; i < 100; i++) {
      const isXAxis = Math.random() > 0.5;
      const linePos = (Math.floor(Math.random() * GRID_SIZE) - Math.floor(GRID_SIZE / 2)) * SPACING;
      const startPos = Math.random() * GRID_SIZE * SPACING - half;
      list.push({
        x: isXAxis ? startPos : linePos,
        z: isXAxis ? linePos : startPos,
        isXAxis,
        speed: (Math.random() * 6 + 3) * (Math.random() > 0.5 ? 1 : -1),
        color: new THREE.Color(Math.random() > 0.35 ? '#2A9D8F' : '#F59E0B'),
      });
    }
    return { pulseCount: list.length, pulses: list };
  }, []);

  useEffect(() => {
    mountTimeRef.current = Date.now();
    if (wireMeshRef.current) {
      instances.forEach((inst, i) => wireMeshRef.current!.setColorAt(i, inst.color));
      if (wireMeshRef.current.instanceColor) wireMeshRef.current.instanceColor.needsUpdate = true;
    }
    if (pulseMeshRef.current) {
      pulses.forEach((p, i) => pulseMeshRef.current!.setColorAt(i, p.color));
      if (pulseMeshRef.current.instanceColor) pulseMeshRef.current.instanceColor.needsUpdate = true;
    }
  }, [instances, pulses]);

  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempPos = useMemo(() => new THREE.Vector3(), []);
  const tempScale = useMemo(() => new THREE.Vector3(), []);
  const tempQuat = useMemo(() => new THREE.Quaternion(), []);

  useFrame(() => {
    const t = (Date.now() - mountTimeRef.current) / 1000;
    if (groupRef.current) groupRef.current.rotation.y = t * 0.04;

    if (coreMeshRef.current && wireMeshRef.current) {
      for (let i = 0; i < count; i++) {
        const inst = instances[i];
        let currentH = 0.01;
        if (t > inst.delay) {
          const progress = Math.min((t - inst.delay) / 1.4, 1);
          currentH = Math.max(0.01, inst.targetH * (1 - Math.pow(1 - progress, 3)));
        }
        tempPos.set(inst.px, currentH / 2, inst.pz);
        tempScale.set(inst.w, currentH, inst.d);
        tempMatrix.compose(tempPos, tempQuat, tempScale);
        coreMeshRef.current.setMatrixAt(i, tempMatrix);
        wireMeshRef.current.setMatrixAt(i, tempMatrix);
      }
      coreMeshRef.current.instanceMatrix.needsUpdate = true;
      wireMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    if (pulseMeshRef.current) {
      const half = (21 * 2.6) / 2;
      for (let i = 0; i < pulseCount; i++) {
        const p = pulses[i];
        if (p.isXAxis) {
          p.x += p.speed * 0.016;
          if (p.x > half) p.x = -half;
          if (p.x < -half) p.x = half;
        } else {
          p.z += p.speed * 0.016;
          if (p.z > half) p.z = -half;
          if (p.z < -half) p.z = half;
        }
        const pulseScale = t > 0.4 ? 0.28 : 0.01;
        tempPos.set(p.x, 0.18, p.z);
        tempScale.set(pulseScale, pulseScale, pulseScale);
        tempMatrix.compose(tempPos, tempQuat, tempScale);
        pulseMeshRef.current.setMatrixAt(i, tempMatrix);
      }
      pulseMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <gridHelper args={[80, 32, '#2A3441', '#243040']} position={[0, -0.01, 0]} />
      <instancedMesh ref={coreMeshRef} args={[undefined, undefined, count]}>
        <boxGeometry />
        <meshStandardMaterial color="#121821" metalness={0.55} roughness={0.35} />
      </instancedMesh>
      <instancedMesh ref={wireMeshRef} args={[undefined, undefined, count]}>
        <boxGeometry />
        <meshBasicMaterial wireframe transparent opacity={0.45} blending={THREE.AdditiveBlending} />
      </instancedMesh>
      <instancedMesh ref={pulseMeshRef} args={[undefined, undefined, pulseCount]}>
        <boxGeometry />
        <meshBasicMaterial transparent opacity={0.85} blending={THREE.AdditiveBlending} />
      </instancedMesh>
    </group>
  );
}

export function LandingHeroCity() {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#0F1419] overflow-hidden">
      <Canvas
        className="absolute inset-0 pointer-events-none"
        gl={{ powerPreference: 'high-performance', antialias: false }}
        dpr={[1, 1.75]}
      >
        <OrthographicCamera makeDefault position={[42, 38, 42]} zoom={14} near={0.1} far={500} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[20, 40, 10]} intensity={0.9} color="#E8F4F1" />
        <ProceduralCityGrid />
      </Canvas>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(27,36,48,0.55) 0%, transparent 35%, transparent 55%, rgba(27,36,48,0.85) 100%)',
        }}
      />
    </div>
  );
}
