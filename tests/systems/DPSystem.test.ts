import { describe, it, expect } from 'vitest';
import {
  getDPFromMerge,
  getMaxLevelBonus,
  canMerge,
} from '@/systems/DPSystem';
import { Stage, Attribute } from '@/types';

describe('DPSystem', () => {
  describe('getDPFromMerge', () => {
    it('two Digimon with 0 DP produce 1 DP', () => {
      expect(getDPFromMerge(0, 0)).toBe(1);
    });

    it('returns max(3, 1) + 1 = 4', () => {
      expect(getDPFromMerge(3, 1)).toBe(4);
    });

    it('returns max(2, 5) + 1 = 6', () => {
      expect(getDPFromMerge(2, 5)).toBe(6);
    });

    it('is symmetric: order does not matter', () => {
      expect(getDPFromMerge(4, 7)).toBe(getDPFromMerge(7, 4));
    });

    it('handles equal non-zero DP values', () => {
      expect(getDPFromMerge(3, 3)).toBe(4);
    });
  });

  describe('getMaxLevelBonus', () => {
    it('dp=0 for any stage returns 0', () => {
      expect(getMaxLevelBonus(0, Stage.IN_TRAINING)).toBe(0);
      expect(getMaxLevelBonus(0, Stage.ROOKIE)).toBe(0);
      expect(getMaxLevelBonus(0, Stage.CHAMPION)).toBe(0);
      expect(getMaxLevelBonus(0, Stage.ULTIMATE)).toBe(0);
      expect(getMaxLevelBonus(0, Stage.MEGA)).toBe(0);
      expect(getMaxLevelBonus(0, Stage.ULTRA)).toBe(0);
    });

    it('dp=3 for CHAMPION (dpBonus=3) returns 9', () => {
      expect(getMaxLevelBonus(3, Stage.CHAMPION)).toBe(9);
    });

    it('dp=5 for MEGA (dpBonus=5) returns 25', () => {
      expect(getMaxLevelBonus(5, Stage.MEGA)).toBe(25);
    });

    it('dp=1 for IN_TRAINING (dpBonus=1) returns 1', () => {
      expect(getMaxLevelBonus(1, Stage.IN_TRAINING)).toBe(1);
    });

    it('dp=2 for ROOKIE (dpBonus=2) returns 4', () => {
      expect(getMaxLevelBonus(2, Stage.ROOKIE)).toBe(4);
    });

    it('dp=4 for ULTIMATE (dpBonus=4) returns 16', () => {
      expect(getMaxLevelBonus(4, Stage.ULTIMATE)).toBe(16);
    });

    it('dp=10 for ULTRA (dpBonus=5) returns 50', () => {
      expect(getMaxLevelBonus(10, Stage.ULTRA)).toBe(50);
    });
  });

  describe('canMerge', () => {
    it('same attribute + same stage = true', () => {
      expect(canMerge(Attribute.VACCINE, Attribute.VACCINE, Stage.ROOKIE, Stage.ROOKIE)).toBe(true);
      expect(canMerge(Attribute.DATA, Attribute.DATA, Stage.CHAMPION, Stage.CHAMPION)).toBe(true);
      expect(canMerge(Attribute.VIRUS, Attribute.VIRUS, Stage.IN_TRAINING, Stage.IN_TRAINING)).toBe(true);
    });

    it('different attribute + same stage = false', () => {
      expect(canMerge(Attribute.VACCINE, Attribute.DATA, Stage.ROOKIE, Stage.ROOKIE)).toBe(false);
      expect(canMerge(Attribute.VIRUS, Attribute.VACCINE, Stage.CHAMPION, Stage.CHAMPION)).toBe(false);
    });

    it('same attribute + different stage = false', () => {
      expect(canMerge(Attribute.VACCINE, Attribute.VACCINE, Stage.ROOKIE, Stage.CHAMPION)).toBe(false);
      expect(canMerge(Attribute.DATA, Attribute.DATA, Stage.IN_TRAINING, Stage.MEGA)).toBe(false);
    });

    it('different attribute + different stage = false', () => {
      expect(canMerge(Attribute.VACCINE, Attribute.DATA, Stage.ROOKIE, Stage.CHAMPION)).toBe(false);
    });

    it('FREE can merge with any attribute at same stage', () => {
      expect(canMerge(Attribute.FREE, Attribute.VACCINE, Stage.ROOKIE, Stage.ROOKIE)).toBe(true);
      expect(canMerge(Attribute.FREE, Attribute.DATA, Stage.CHAMPION, Stage.CHAMPION)).toBe(true);
      expect(canMerge(Attribute.FREE, Attribute.VIRUS, Stage.MEGA, Stage.MEGA)).toBe(true);
      expect(canMerge(Attribute.FREE, Attribute.FREE, Stage.ULTIMATE, Stage.ULTIMATE)).toBe(true);
    });

    it('any attribute can merge with FREE at same stage', () => {
      expect(canMerge(Attribute.VACCINE, Attribute.FREE, Stage.ROOKIE, Stage.ROOKIE)).toBe(true);
      expect(canMerge(Attribute.DATA, Attribute.FREE, Stage.CHAMPION, Stage.CHAMPION)).toBe(true);
      expect(canMerge(Attribute.VIRUS, Attribute.FREE, Stage.IN_TRAINING, Stage.IN_TRAINING)).toBe(true);
    });

    it('FREE cannot merge with different stage', () => {
      expect(canMerge(Attribute.FREE, Attribute.VACCINE, Stage.ROOKIE, Stage.CHAMPION)).toBe(false);
      expect(canMerge(Attribute.VACCINE, Attribute.FREE, Stage.IN_TRAINING, Stage.MEGA)).toBe(false);
    });
  });
});
