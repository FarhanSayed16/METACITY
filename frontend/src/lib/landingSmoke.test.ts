import { describe, expect, it } from 'vitest';
import { answerGroundedQuestion, PRESET_QUESTIONS } from '../lib/askGrounded';
import { featureFlags } from '../lib/featureFlags';
import { tierFromDistance } from '../store/lodStore';

describe('landing / AI / LOD smoke', () => {
  it('exposes guided Ask presets (not LLM claims)', () => {
    expect(PRESET_QUESTIONS.length).toBeGreaterThanOrEqual(3);
    const ans = answerGroundedQuestion('Summarize the network size for this project.', {
      projectId: 'p1',
      scene: { nodes: [{ id: 'a' }], links: [{ id: 'l' }], facilities: [] },
    });
    expect(ans.label).toContain('not an LLM');
    expect(ans.metrics.nodes).toBe(1);
    expect(ans.metrics.links).toBe(1);
  });

  it('feature flags default on for merge surfaces', () => {
    expect(featureFlags.cityTwin).toBe(true);
    expect(featureFlags.disasterLab).toBe(true);
    expect(featureFlags.aiCommand).toBe(true);
  });

  it('Decision Mode is primary — Advanced lab defaults off', () => {
    expect(featureFlags.advancedLab).toBe(false);
  });

  it('enhancement flags default off (Phase 10 anti-creep)', () => {
    expect(featureFlags.enhFsmViz).toBe(false);
    expect(featureFlags.enhTransitLayers).toBe(false);
    expect(featureFlags.enhLlmAsk).toBe(false);
    expect(featureFlags.enhInteriors).toBe(false);
    expect(featureFlags.enhMultiuser).toBe(false);
    expect(featureFlags.enhHeroVideo).toBe(false);
  });

  it('LOD distance tiers are ordered', () => {
    expect(tierFromDistance(10)).toBe(0);
    expect(tierFromDistance(60)).toBe(1);
    expect(tierFromDistance(200)).toBe(2);
  });
});
