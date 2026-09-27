import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { tierFromDistance, useLodStore, type LodTier } from '../../store/lodStore';

type Props = {
  /** Override thresholds for Network map (larger world units). */
  highDist?: number;
  midDist?: number;
};

/**
 * Updates lodStore from camera distance so Twin GLBs / agents can cull.
 * No React re-render of the canvas tree except store subscribers.
 */
export function LODManager({ highDist, midDist }: Props) {
  const { camera } = useThree();
  const lastLOD = useRef<LodTier>(-1 as LodTier);
  const setTier = useLodStore((s) => s.setTier);

  useFrame(() => {
    const dist = camera.position.length();
    let current: LodTier = 0;
    if (highDist != null && midDist != null) {
      if (dist > highDist) current = 2;
      else if (dist > midDist) current = 1;
    } else {
      current = tierFromDistance(dist);
    }

    if (current !== lastLOD.current) {
      lastLOD.current = current;
      setTier(current);
    }
  });

  return null;
}
