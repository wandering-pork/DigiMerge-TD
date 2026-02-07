import { describe, it, expect } from 'vitest';
import { canMerge, getMergeResult, calculateMergeEffects, MergeCandidate } from '@/systems/MergeSystem';
import { Attribute, Stage, BonusEffect } from '@/types';

describe('MergeSystem', () => {
  // ----------------------------------------------------------------
  // canMerge (integration with DPSystem.canMerge)
  // ----------------------------------------------------------------
  describe('canMerge', () => {
    it('same attribute + same stage returns true', () => {
      const a: MergeCandidate = { level: 1, dp: 0, attribute: Attribute.VACCINE, stage: Stage.ROOKIE };
      const b: MergeCandidate = { level: 1, dp: 0, attribute: Attribute.VACCINE, stage: Stage.ROOKIE };
      expect(canMerge(a, b)).toBe(true);
    });

    it('different attributes + same stage returns false', () => {
      const a: MergeCandidate = { level: 1, dp: 0, attribute: Attribute.VACCINE, stage: Stage.ROOKIE };
      const b: MergeCandidate = { level: 1, dp: 0, attribute: Attribute.DATA, stage: Stage.ROOKIE };
      expect(canMerge(a, b)).toBe(false);
    });

    it('same attribute + different stages returns false', () => {
      const a: MergeCandidate = { level: 1, dp: 0, attribute: Attribute.VIRUS, stage: Stage.ROOKIE };
      const b: MergeCandidate = { level: 1, dp: 0, attribute: Attribute.VIRUS, stage: Stage.CHAMPION };
      expect(canMerge(a, b)).toBe(false);
    });

    it('different attribute + different stage returns false', () => {
      const a: MergeCandidate = { level: 3, dp: 1, attribute: Attribute.VACCINE, stage: Stage.ROOKIE };
      const b: MergeCandidate = { level: 2, dp: 0, attribute: Attribute.VIRUS, stage: Stage.CHAMPION };
      expect(canMerge(a, b)).toBe(false);
    });

    it('FREE attribute with DATA at same stage returns true', () => {
      const a: MergeCandidate = { level: 1, dp: 0, attribute: Attribute.FREE, stage: Stage.CHAMPION };
      const b: MergeCandidate = { level: 1, dp: 0, attribute: Attribute.DATA, stage: Stage.CHAMPION };
      expect(canMerge(a, b)).toBe(true);
    });

    it('DATA attribute with FREE at same stage returns true', () => {
      const a: MergeCandidate = { level: 1, dp: 0, attribute: Attribute.DATA, stage: Stage.CHAMPION };
      const b: MergeCandidate = { level: 1, dp: 0, attribute: Attribute.FREE, stage: Stage.CHAMPION };
      expect(canMerge(a, b)).toBe(true);
    });

    it('FREE with VACCINE at same stage returns true', () => {
      const a: MergeCandidate = { level: 5, dp: 2, attribute: Attribute.FREE, stage: Stage.MEGA };
      const b: MergeCandidate = { level: 3, dp: 1, attribute: Attribute.VACCINE, stage: Stage.MEGA };
      expect(canMerge(a, b)).toBe(true);
    });

    it('FREE with VIRUS at same stage returns true', () => {
      const a: MergeCandidate = { level: 1, dp: 0, attribute: Attribute.FREE, stage: Stage.IN_TRAINING };
      const b: MergeCandidate = { level: 1, dp: 0, attribute: Attribute.VIRUS, stage: Stage.IN_TRAINING };
      expect(canMerge(a, b)).toBe(true);
    });

    it('FREE with FREE at same stage returns true', () => {
      const a: MergeCandidate = { level: 1, dp: 0, attribute: Attribute.FREE, stage: Stage.ROOKIE };
      const b: MergeCandidate = { level: 1, dp: 0, attribute: Attribute.FREE, stage: Stage.ROOKIE };
      expect(canMerge(a, b)).toBe(true);
    });

    it('FREE cannot merge with different stage', () => {
      const a: MergeCandidate = { level: 1, dp: 0, attribute: Attribute.FREE, stage: Stage.ROOKIE };
      const b: MergeCandidate = { level: 1, dp: 0, attribute: Attribute.VACCINE, stage: Stage.CHAMPION };
      expect(canMerge(a, b)).toBe(false);
    });
  });

  // ----------------------------------------------------------------
  // getMergeResult
  // ----------------------------------------------------------------
  describe('getMergeResult', () => {
    it('two level 1, dp 0 towers produce survivor level 1, dp 1', () => {
      const a: MergeCandidate = { level: 1, dp: 0, attribute: Attribute.VACCINE, stage: Stage.ROOKIE };
      const b: MergeCandidate = { level: 1, dp: 0, attribute: Attribute.VACCINE, stage: Stage.ROOKIE };
      const result = getMergeResult(a, b);
      expect(result.survivorLevel).toBe(1);
      expect(result.survivorDP).toBe(1);
    });

    it('tower A level 5 dp 2, tower B level 3 dp 4 produces survivor level 5, dp 5', () => {
      const a: MergeCandidate = { level: 5, dp: 2, attribute: Attribute.DATA, stage: Stage.CHAMPION };
      const b: MergeCandidate = { level: 3, dp: 4, attribute: Attribute.DATA, stage: Stage.CHAMPION };
      const result = getMergeResult(a, b);
      expect(result.survivorLevel).toBe(5);
      expect(result.survivorDP).toBe(5);
    });

    it('tower A level 3 dp 4, tower B level 5 dp 2 produces survivor level 5, dp 5 (order does not matter)', () => {
      const a: MergeCandidate = { level: 3, dp: 4, attribute: Attribute.DATA, stage: Stage.CHAMPION };
      const b: MergeCandidate = { level: 5, dp: 2, attribute: Attribute.DATA, stage: Stage.CHAMPION };
      const result = getMergeResult(a, b);
      expect(result.survivorLevel).toBe(5);
      expect(result.survivorDP).toBe(5);
    });

    it('equal levels: survivor level equals the shared level', () => {
      const a: MergeCandidate = { level: 10, dp: 3, attribute: Attribute.VIRUS, stage: Stage.ULTIMATE };
      const b: MergeCandidate = { level: 10, dp: 1, attribute: Attribute.VIRUS, stage: Stage.ULTIMATE };
      const result = getMergeResult(a, b);
      expect(result.survivorLevel).toBe(10);
      expect(result.survivorDP).toBe(4);
    });

    it('equal DP values: survivor DP equals shared DP + 1', () => {
      const a: MergeCandidate = { level: 7, dp: 5, attribute: Attribute.VACCINE, stage: Stage.MEGA };
      const b: MergeCandidate = { level: 3, dp: 5, attribute: Attribute.VACCINE, stage: Stage.MEGA };
      const result = getMergeResult(a, b);
      expect(result.survivorLevel).toBe(7);
      expect(result.survivorDP).toBe(6);
    });

    it('both zero stats: survivor level 0, dp 1', () => {
      const a: MergeCandidate = { level: 0, dp: 0, attribute: Attribute.DATA, stage: Stage.IN_TRAINING };
      const b: MergeCandidate = { level: 0, dp: 0, attribute: Attribute.DATA, stage: Stage.IN_TRAINING };
      const result = getMergeResult(a, b);
      expect(result.survivorLevel).toBe(0);
      expect(result.survivorDP).toBe(1);
    });

    it('high level difference: survivor gets the higher level', () => {
      const a: MergeCandidate = { level: 50, dp: 0, attribute: Attribute.FREE, stage: Stage.MEGA };
      const b: MergeCandidate = { level: 1, dp: 10, attribute: Attribute.VACCINE, stage: Stage.MEGA };
      const result = getMergeResult(a, b);
      expect(result.survivorLevel).toBe(50);
      expect(result.survivorDP).toBe(11);
    });
  });

  // ----------------------------------------------------------------
  // calculateMergeEffects (effect inheritance)
  // ----------------------------------------------------------------
  describe('calculateMergeEffects', () => {
    it('transfers sacrifice effect at half proc chance', () => {
      const result = calculateMergeEffects([], 'burn', 0.3);
      expect(result).toHaveLength(1);
      expect(result[0].effectType).toBe('burn');
      expect(result[0].effectChance).toBe(0.15);
    });

    it('returns empty array when sacrifice has no effect', () => {
      const result = calculateMergeEffects([], undefined, undefined);
      expect(result).toHaveLength(0);
    });

    it('returns empty array when sacrifice effect chance is 0', () => {
      const result = calculateMergeEffects([], 'burn', 0);
      expect(result).toHaveLength(0);
    });

    it('preserves existing bonus effects', () => {
      const existing: BonusEffect[] = [{ effectType: 'slow', effectChance: 0.1 }];
      const result = calculateMergeEffects(existing, 'burn', 0.3);
      expect(result).toHaveLength(2);
      expect(result[0].effectType).toBe('slow');
      expect(result[0].effectChance).toBe(0.1);
      expect(result[1].effectType).toBe('burn');
      expect(result[1].effectChance).toBe(0.15);
    });

    it('stacks same effect type with +5% bonus instead of adding duplicate', () => {
      const existing: BonusEffect[] = [{ effectType: 'burn', effectChance: 0.15 }];
      const result = calculateMergeEffects(existing, 'burn', 0.4);
      expect(result).toHaveLength(1);
      expect(result[0].effectType).toBe('burn');
      expect(result[0].effectChance).toBe(0.2); // 0.15 + 0.05
    });

    it('caps stacked effect chance at 1.0', () => {
      const existing: BonusEffect[] = [{ effectType: 'burn', effectChance: 0.98 }];
      const result = calculateMergeEffects(existing, 'burn', 0.3);
      expect(result).toHaveLength(1);
      expect(result[0].effectChance).toBe(1.0);
    });

    it('enforces max 2 bonus effects', () => {
      const existing: BonusEffect[] = [
        { effectType: 'slow', effectChance: 0.1 },
        { effectType: 'burn', effectChance: 0.15 },
      ];
      const result = calculateMergeEffects(existing, 'poison', 0.3);
      expect(result).toHaveLength(2);
      // New effect should NOT be added (already at max)
      expect(result.find(e => e.effectType === 'poison')).toBeUndefined();
    });

    it('allows stacking even when at max effects', () => {
      const existing: BonusEffect[] = [
        { effectType: 'slow', effectChance: 0.1 },
        { effectType: 'burn', effectChance: 0.15 },
      ];
      const result = calculateMergeEffects(existing, 'burn', 0.3);
      expect(result).toHaveLength(2);
      expect(result[1].effectChance).toBe(0.2); // 0.15 + 0.05
    });

    it('does not mutate the input array', () => {
      const existing: BonusEffect[] = [{ effectType: 'slow', effectChance: 0.1 }];
      calculateMergeEffects(existing, 'burn', 0.3);
      expect(existing).toHaveLength(1); // Original unchanged
    });
  });

  // ----------------------------------------------------------------
  // getMergeResult with effects
  // ----------------------------------------------------------------
  describe('getMergeResult with effects', () => {
    it('includes bonusEffects in merge result', () => {
      const a: MergeCandidate = { level: 5, dp: 2, attribute: Attribute.VACCINE, stage: Stage.CHAMPION, bonusEffects: [] };
      const b: MergeCandidate = { level: 3, dp: 1, attribute: Attribute.VACCINE, stage: Stage.CHAMPION, effectType: 'burn', effectChance: 0.3 };
      const result = getMergeResult(a, b);
      expect(result.bonusEffects).toHaveLength(1);
      expect(result.bonusEffects[0].effectType).toBe('burn');
      expect(result.bonusEffects[0].effectChance).toBe(0.15);
    });

    it('returns empty bonusEffects when sacrifice has no effect', () => {
      const a: MergeCandidate = { level: 5, dp: 2, attribute: Attribute.VACCINE, stage: Stage.CHAMPION };
      const b: MergeCandidate = { level: 3, dp: 1, attribute: Attribute.VACCINE, stage: Stage.CHAMPION };
      const result = getMergeResult(a, b);
      expect(result.bonusEffects).toHaveLength(0);
    });
  });
});
