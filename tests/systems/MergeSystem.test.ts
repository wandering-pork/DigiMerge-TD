import { describe, it, expect } from 'vitest';
import { canMerge, getMergeResult, MergeCandidate } from '@/systems/MergeSystem';
import { Attribute, Stage } from '@/types';

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
});
