import { describe, it, expect } from 'vitest';
import {
  getLevelUpCost,
  canLevelUp,
  calculateMaxLevel,
  getScaledDamage,
  getScaledSpeed,
  getTotalLevelUpCost,
} from '@/systems/LevelSystem';
import { Stage } from '@/types';

describe('LevelSystem', () => {
  describe('getLevelUpCost', () => {
    it('Lv1 -> Lv2 costs 5 DigiBytes', () => {
      expect(getLevelUpCost(1)).toBe(5);
    });

    it('Lv10 -> Lv11 costs 50 DigiBytes', () => {
      expect(getLevelUpCost(10)).toBe(50);
    });

    it('Lv20 -> Lv21 costs 100 DigiBytes', () => {
      expect(getLevelUpCost(20)).toBe(100);
    });

    it('cost scales linearly with level', () => {
      expect(getLevelUpCost(5)).toBe(25);
      expect(getLevelUpCost(50)).toBe(250);
      expect(getLevelUpCost(100)).toBe(500);
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
    it('Lv1 -> Lv5: 5 + 10 + 15 + 20 = 50', () => {
      expect(getTotalLevelUpCost(1, 5)).toBe(50);
    });

    it('Lv1 -> Lv2: single level costs 5', () => {
      expect(getTotalLevelUpCost(1, 2)).toBe(5);
    });

    it('Lv10 -> Lv15: 50 + 55 + 60 + 65 + 70 = 300', () => {
      expect(getTotalLevelUpCost(10, 15)).toBe(300);
    });

    it('same level to same level costs 0', () => {
      expect(getTotalLevelUpCost(5, 5)).toBe(0);
    });

    it('invalid range (toLevel < fromLevel) costs 0', () => {
      expect(getTotalLevelUpCost(10, 5)).toBe(0);
    });

    it('Lv1 -> Lv10: sum of 5+10+15+20+25+30+35+40+45 = 225', () => {
      // Sum = 5 * (1+2+3+4+5+6+7+8+9) = 5 * 45 = 225
      expect(getTotalLevelUpCost(1, 10)).toBe(225);
    });

    it('Lv1 -> Lv20: sum of 5*i for i=1..19 = 5 * 190 = 950', () => {
      // Sum = 5 * (1+2+...+19) = 5 * (19*20/2) = 5 * 190 = 950
      expect(getTotalLevelUpCost(1, 20)).toBe(950);
    });
  });
});
