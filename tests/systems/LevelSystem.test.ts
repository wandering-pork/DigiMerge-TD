import { describe, it, expect } from 'vitest';
import {
  getLevelUpCost,
  canLevelUp,
  calculateMaxLevel,
  getScaledDamage,
  getScaledSpeed,
  getTotalLevelUpCost,
  getMaxAffordableLevel,
} from '@/systems/LevelSystem';
import { Stage } from '@/types';

describe('LevelSystem', () => {
  describe('getLevelUpCost', () => {
    it('Lv1 -> Lv2 costs 3 DigiBytes', () => {
      expect(getLevelUpCost(1)).toBe(3);
    });

    it('Lv10 -> Lv11 costs 30 DigiBytes', () => {
      expect(getLevelUpCost(10)).toBe(30);
    });

    it('Lv20 -> Lv21 costs 60 DigiBytes', () => {
      expect(getLevelUpCost(20)).toBe(60);
    });

    it('cost scales linearly with level', () => {
      expect(getLevelUpCost(5)).toBe(15);
      expect(getLevelUpCost(50)).toBe(150);
      expect(getLevelUpCost(100)).toBe(300);
    });

    it('In-Training uses 1x multiplier', () => {
      expect(getLevelUpCost(10, Stage.IN_TRAINING)).toBe(30);
    });

    it('Rookie uses 1.5x multiplier', () => {
      // 3 * 10 * 1.5 = 45
      expect(getLevelUpCost(10, Stage.ROOKIE)).toBe(45);
    });

    it('Champion uses 2x multiplier', () => {
      // 3 * 10 * 2 = 60
      expect(getLevelUpCost(10, Stage.CHAMPION)).toBe(60);
    });

    it('Ultimate uses 3x multiplier', () => {
      // 3 * 10 * 3 = 90
      expect(getLevelUpCost(10, Stage.ULTIMATE)).toBe(90);
    });

    it('Mega uses 4x multiplier', () => {
      // 3 * 10 * 4 = 120
      expect(getLevelUpCost(10, Stage.MEGA)).toBe(120);
    });

    it('Ultra uses 5x multiplier', () => {
      // 3 * 10 * 5 = 150
      expect(getLevelUpCost(10, Stage.ULTRA)).toBe(150);
    });

    it('stage multiplier rounds up fractional costs', () => {
      // Rookie Lv1: 3 * 1 * 1.5 = 4.5 -> ceil = 5
      expect(getLevelUpCost(1, Stage.ROOKIE)).toBe(5);
    });
  });

  describe('canLevelUp', () => {
    it('returns true when current level is below max level', () => {
      expect(canLevelUp(1, 10)).toBe(true);
      expect(canLevelUp(9, 10)).toBe(true);
      expect(canLevelUp(5, 20)).toBe(true);
    });

    it('returns false when current level equals max level', () => {
      expect(canLevelUp(10, 10)).toBe(false);
      expect(canLevelUp(20, 20)).toBe(false);
    });

    it('returns false when current level exceeds max level', () => {
      expect(canLevelUp(15, 10)).toBe(false);
      expect(canLevelUp(25, 20)).toBe(false);
    });

    it('handles edge case of level 1 and max 1', () => {
      expect(canLevelUp(1, 1)).toBe(false);
    });
  });

  describe('calculateMaxLevel', () => {
    it('IN_TRAINING, dp=0, origin=IN_TRAINING, current=IN_TRAINING: base 10', () => {
      expect(calculateMaxLevel(Stage.IN_TRAINING, 0, Stage.IN_TRAINING, Stage.IN_TRAINING)).toBe(10);
    });

    it('ROOKIE, dp=2, origin=ROOKIE, current=ROOKIE: 20 + 2*2 + 0 = 24', () => {
      expect(calculateMaxLevel(Stage.ROOKIE, 2, Stage.ROOKIE, Stage.ROOKIE)).toBe(24);
    });

    it('CHAMPION, dp=3, origin=IN_TRAINING, current=CHAMPION: 35 + 3*3 + (2-0)*5 = 54', () => {
      expect(calculateMaxLevel(Stage.CHAMPION, 3, Stage.IN_TRAINING, Stage.CHAMPION)).toBe(54);
    });

    it('MEGA, dp=5, origin=CHAMPION, current=MEGA: 70 + 5*5 + (4-2)*5 = 105', () => {
      expect(calculateMaxLevel(Stage.MEGA, 5, Stage.CHAMPION, Stage.MEGA)).toBe(105);
    });

    it('ULTRA, dp=0, origin=ULTRA, current=ULTRA: base 100', () => {
      expect(calculateMaxLevel(Stage.ULTRA, 0, Stage.ULTRA, Stage.ULTRA)).toBe(100);
    });

    it('ULTIMATE, dp=10, origin=ROOKIE, current=ULTIMATE: 50 + 10*4 + (3-1)*5 = 100', () => {
      expect(calculateMaxLevel(Stage.ULTIMATE, 10, Stage.ROOKIE, Stage.ULTIMATE)).toBe(100);
    });

    it('origin bonus grows with stage difference', () => {
      // Same stage: no origin bonus
      const sameStage = calculateMaxLevel(Stage.CHAMPION, 0, Stage.CHAMPION, Stage.CHAMPION);
      // 1 stage difference: +5
      const oneStage = calculateMaxLevel(Stage.CHAMPION, 0, Stage.ROOKIE, Stage.CHAMPION);
      // 2 stage difference: +10
      const twoStage = calculateMaxLevel(Stage.CHAMPION, 0, Stage.IN_TRAINING, Stage.CHAMPION);

      expect(sameStage).toBe(35);
      expect(oneStage).toBe(40);
      expect(twoStage).toBe(45);
      expect(oneStage - sameStage).toBe(5);
      expect(twoStage - sameStage).toBe(10);
    });
  });

  describe('getScaledDamage', () => {
    it('level 1 gives base * 1.02', () => {
      expect(getScaledDamage(100, 1)).toBeCloseTo(102);
    });

    it('level 50 gives base * 2.0', () => {
      expect(getScaledDamage(100, 50)).toBeCloseTo(200);
    });

    it('level 0 returns base damage unchanged', () => {
      expect(getScaledDamage(100, 0)).toBeCloseTo(100);
    });

    it('scales correctly for non-round base damage', () => {
      // 18 * (1 + 30 * 0.02) = 18 * 1.6 = 28.8
      expect(getScaledDamage(18, 30)).toBeCloseTo(28.8);
    });

    it('level 100 gives base * 3.0', () => {
      expect(getScaledDamage(50, 100)).toBeCloseTo(150);
    });
  });

  describe('getScaledSpeed', () => {
    it('level 1 gives base * 1.01', () => {
      expect(getScaledSpeed(1.0, 1)).toBeCloseTo(1.01);
    });

    it('level 50 gives base * 1.5', () => {
      expect(getScaledSpeed(1.0, 50)).toBeCloseTo(1.5);
    });

    it('level 0 returns base speed unchanged', () => {
      expect(getScaledSpeed(2.0, 0)).toBeCloseTo(2.0);
    });

    it('scales correctly for different base speeds', () => {
      // 1.5 * (1 + 20 * 0.01) = 1.5 * 1.2 = 1.8
      expect(getScaledSpeed(1.5, 20)).toBeCloseTo(1.8);
    });

    it('level 100 gives base * 2.0', () => {
      expect(getScaledSpeed(1.0, 100)).toBeCloseTo(2.0);
    });
  });

  describe('getTotalLevelUpCost', () => {
    it('Lv1 -> Lv5: 3 + 6 + 9 + 12 = 30', () => {
      expect(getTotalLevelUpCost(1, 5)).toBe(30);
    });

    it('Lv1 -> Lv2: single level costs 3', () => {
      expect(getTotalLevelUpCost(1, 2)).toBe(3);
    });

    it('Lv10 -> Lv15: 30 + 33 + 36 + 39 + 42 = 180', () => {
      expect(getTotalLevelUpCost(10, 15)).toBe(180);
    });

    it('same level to same level costs 0', () => {
      expect(getTotalLevelUpCost(5, 5)).toBe(0);
    });

    it('invalid range (toLevel < fromLevel) costs 0', () => {
      expect(getTotalLevelUpCost(10, 5)).toBe(0);
    });

    it('Lv1 -> Lv10: sum of 3+6+9+12+15+18+21+24+27 = 135', () => {
      // Sum = 3 * (1+2+3+4+5+6+7+8+9) = 3 * 45 = 135
      expect(getTotalLevelUpCost(1, 10)).toBe(135);
    });

    it('Lv1 -> Lv20: sum of 3*i for i=1..19 = 3 * 190 = 570', () => {
      // Sum = 3 * (1+2+...+19) = 3 * (19*20/2) = 3 * 190 = 570
      expect(getTotalLevelUpCost(1, 20)).toBe(570);
    });

    it('stage multiplier applies to total cost', () => {
      // Champion Lv1 -> Lv5: ceil(3*1*2) + ceil(3*2*2) + ceil(3*3*2) + ceil(3*4*2) = 6+12+18+24 = 60
      expect(getTotalLevelUpCost(1, 5, Stage.CHAMPION)).toBe(60);
    });
  });

  describe('getMaxAffordableLevel', () => {
    it('returns currentLevel when budget is 0', () => {
      expect(getMaxAffordableLevel(1, 10, 0)).toBe(1);
    });

    it('returns currentLevel when budget is less than cost for one level', () => {
      // Lv1 -> Lv2 costs 3
      expect(getMaxAffordableLevel(1, 10, 2)).toBe(1);
    });

    it('returns currentLevel + 1 when budget is exactly the cost for one level', () => {
      // Lv1 -> Lv2 costs 3
      expect(getMaxAffordableLevel(1, 10, 3)).toBe(2);
    });

    it('returns the highest affordable level within budget', () => {
      // Lv1 -> Lv5 costs 30 (3+6+9+12)
      // Lv1 -> Lv4 costs 18 (3+6+9)
      expect(getMaxAffordableLevel(1, 10, 25)).toBe(4);
    });

    it('returns maxLevel when budget can afford all levels', () => {
      // Lv1 -> Lv10 costs 135
      expect(getMaxAffordableLevel(1, 10, 999)).toBe(10);
    });

    it('respects maxLevel cap even with excess budget', () => {
      expect(getMaxAffordableLevel(5, 8, 99999)).toBe(8);
    });

    it('returns currentLevel when already at maxLevel', () => {
      expect(getMaxAffordableLevel(10, 10, 999)).toBe(10);
    });

    it('works with stage multiplier', () => {
      // Champion Lv1 -> Lv2: ceil(3*1*2) = 6
      // Champion Lv1 -> Lv3: 6 + ceil(3*2*2) = 6 + 12 = 18
      // Budget of 15 can afford Lv2 (cost 6) but not Lv3 (cost 18)
      expect(getMaxAffordableLevel(1, 10, 15, Stage.CHAMPION)).toBe(2);
    });

    it('handles mid-range levels correctly', () => {
      // Lv10 -> Lv11: 30, Lv11 -> Lv12: 33, Lv12 -> Lv13: 36
      // Budget 65 can afford Lv10 -> Lv12 (30+33=63) but not Lv13 (63+36=99)
      expect(getMaxAffordableLevel(10, 20, 65)).toBe(12);
    });
  });
});
