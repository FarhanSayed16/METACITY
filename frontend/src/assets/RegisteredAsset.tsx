/**
 * Renders a registered GLB, or a coloured box if load fails / missing.
 */
import React, { Suspense, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import type { AssetEntry } from './AssetRegistry';
import { didAssetFail, markAssetFailed } from './GLTFAssetCache';
import { useLodStore } from '../store/lodStore';
import * as THREE from 'three';

type Props = {
  entry: AssetEntry;
  position?: [number, number, number];
  scale?: number | [number, number, number];
  fallbackColor?: string;
  /** When true, always use GLB regardless of LOD (landmarks). */
  forceHighDetail?: boolean;
};

function GlbMesh({ entry, position = [0, 0, 0], scale }: Props) {
  const gltf = useGLTF(entry.path);
  const s = scale ?? entry.scale ?? [1, 1, 1];
  const scaleVec: [number, number, number] = Array.isArray(s) ? s : [s, s, s];

  useEffect(() => {
    gltf.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const m = obj as THREE.Mesh;
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
  }, [gltf.scene]);

  return (
    <primitive
      object={gltf.scene.clone()}
      position={position}
      scale={scaleVec}
    />
  );
}

function FallbackBox({
  position = [0, 0, 0],
  color = '#94a3b8',
  label,
  scale = 1,
}: {
  position?: [number, number, number];
  color?: string;
  label?: string;
  scale?: number;
}) {
  const h = Math.max(1, scale);
  return (
    <group position={position}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[h * 0.9, h, h * 0.9]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {label && (
        <mesh position={[0, h + 0.3, 0]}>
          <boxGeometry args={[0.25, 0.25, 0.25]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      )}
    </group>
  );
}

class AssetErrorBoundary extends React.Component<
  { fallback: React.ReactNode; onError: () => void; children: React.ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    if (this.state.error) return this.props.fallback;
    return this.props.children;
  }
}

export const RegisteredAsset: React.FC<Props> = ({
  entry,
  position = [0, 0, 0],
  scale,
  fallbackColor = '#64748b',
  forceHighDetail = false,
}) => {
  const [failed, setFailed] = useState(() => didAssetFail(entry.path));
  const lodTier = useLodStore((s) => s.tier);
  const boxScale = typeof scale === 'number' ? scale : scale?.[0] ?? 4;

  // Tier 2: distance cull → procedural box (keeps silhouette, drops GLB cost)
  if (failed || (!forceHighDetail && lodTier >= 2)) {
    return (
      <FallbackBox position={position} color={fallbackColor} label={entry.id} scale={boxScale} />
    );
  }

  return (
    <AssetErrorBoundary
      onError={() => {
        markAssetFailed(entry.path);
        setFailed(true);
      }}
      fallback={<FallbackBox position={position} color={fallbackColor} label={entry.id} scale={boxScale} />}
    >
      <Suspense fallback={<FallbackBox position={position} color="#cbd5e1" scale={boxScale} />}>
        <GlbMesh entry={entry} position={position} scale={scale} />
      </Suspense>
    </AssetErrorBoundary>
  );
};
