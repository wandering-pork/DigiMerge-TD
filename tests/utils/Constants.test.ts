import { describe, it, expect } from 'vitest';
import {
  PATH_WAYPOINTS,
  GRID,
  isPathCell,
  isValidTowerSlot,
  getLevelUpCost,
  calculateDamage,
  calculateMaxLevel,
  ATTRIBUTE_MULTIPLIERS,
  STAGE_CONFIG,
  SPAWN_COSTS,
} from '@/config/Constants';
import { Stage, Attribute } from '@/types';

describe('Constants', () => {
  describe('PATH_WAYPOINTS', () => {
    it('should have 57 waypoints', () => {
      expect(PATH_WAYPOINTS.length).toBe(57);
    });

    it('should start at spawn point (1, 2)', () => {
      expect(PATH_WAYPOINTS[0]).toEqual({ col: 1, row: 2 });
    });

    it('should end at base point (8, 15)', () => {
      expect(PATH_WAYPOINTS[PATH_WAYPOINTS.length - 1]).toEqual({ col: 8, row: 15 });
    });

    it('all waypoints should be within grid bounds', () => {
      for (const wp of PATH_WAYPOINTS) {
        expect(wp.col).toBeGreaterThanOrEqual(1);
        expect(wp.col).toBeLessThanOrEqual(GRID.COLUMNS);
        expect(wp.row).toBeGreaterThanOrEqual(1);
        expect(wp.row).toBeLessThanOrEqual(GRID.ROWS);
      }
    });
  });

  describe('isPathCell', () => {
    it('spawn point is a path cell', () => {
      expect(isPathCell(1, 2)).toBe(true);
    });

    it('base point is a path cell', () => {
      expect(isPathCell(8, 15)).toBe(true);
    });

    it('non-path cell returns false', () => {
      expect(isPathCell(1, 1)).toBe(false);
    });
  });

  describe('isValidTowerSlot', () => {
    it('returns false for path cells', () => {
      expect(isValidTowerSlot(1, 2)).toBe(false); // spawn
      expect(isValidTowerSlot(8, 15)).toBe(false); // base
    });

    it('returns true for non-path cells within grid', () => {
      expect(isValidTowerSlot(1, 1)).toBe(true); // top-left corner
    });

    it('returns false for out-of-bounds cells', () => {
      expect(isValidTowerSlot(0, 1)).toBe(false);
      expect(isValidTowerSlot(9, 1)).toBe(false);
      expect(isValidTowerSlot(1, 0)).toBe(false);
      expect(isValidTowerSlot(1, 19)).toBe(false);
    });
  });

  describe('getLevelUpCost', () => {
    it('level 1 costs 5 DigiBytes', () => {
      expect(getLevelUpCost(1)).toBe(5);
    });

    it('level 10 costs 50 DigiBytes', () => {
      expect(getLevelUpCost(10)).toBe(50);
    });

    it('level 20 costs 100 DigiBytes', () => {
      expect(getLevelUpCost(20)).toBe(100);
    });
  });

  describe('calculateDamage', () => {
    it('base damage at level 0 with neutral multiplier', () => {
      expect(calculateDamage(10, 0, 1.0)).toBe(10);
    });

    it('damage increases with level', () => {
      // 10 * (1 + 10 * 0.02) * 1.0 = 10 * 1.2 = 12
      expect(calculateDamage(10, 10, 1.0)).toBeCloseTo(12);
    });

    it('damage scales with attribute multiplier', () => {
      // 10 * (1 + 0 * 0.02) * 1.5 = 15
      expect(calculateDamage(10, 0, 1.5)).toBeCloseTo(15);
    });

    it('combined level and attribute scaling', () => {
      // 18 * (1 + 30 * 0.02) * 1.5 = 18 * 1.6 * 1.5 = 43.2
      expect(calculateDamage(18, 30, 1.5)).toBeCloseTo(43.2);
    });
  });

  describe('calculateMaxLevel', () => {
    it('In-Training base max level is 10', () => {
      expect(calculateMaxLevel(Stage.IN_TRAINING, 0, Stage.IN_TRAINING, Stage.IN_TRAINING)).toBe(10);
    });

    it('Rookie base max level is 20', () => {
      expect(calculateMaxLevel(Stage.ROOKIE, 0, Stage.ROOKIE, Stage.ROOKIE)).toBe(20);
    });

    it('DP bonus increases max level', () => {
      // Rookie: 20 + (5 * 2) + 0 = 30
      expect(calculateMaxLevel(Stage.ROOKIE, 5, Stage.ROOKIE, Stage.ROOKIE)).toBe(30);
    });

    it('origin bonus adds levels for higher stages', () => {
      // Champion originated as In-Training: 35 + 0 + (2-0)*5 = 45
      expect(calculateMaxLevel(Stage.CHAMPION, 0, Stage.IN_TRAINING, Stage.CHAMPION)).toBe(45);
    });

    it('combined DP and origin bonus', () => {
      // Champion from In-Training with 3 DP: 35 + (3*3) + (2-0)*5 = 35 + 9 + 10 = 54
      expect(calculateMaxLevel(Stage.CHAMPION, 3, Stage.IN_TRAINING, Stage.CHAMPION)).toBe(54);
    });
  });

  describe('ATTRIBUTE_MULTIPLIERS', () => {
    it('should have all 16 combinations', () => {
      for (let a = 0; a <= 3; a++) {
        for (let d = 0; d <= 3; d++) {
          expect(ATTRIBUTE_MULTIPLIERS[a][d]).toBeDefined();
        }
      }
    });
  });

  describe('STAGE_CONFIG', () => {
    it('should have config for all 6 stages', () => {
      for (let s = Stage.IN_TRAINING; s <= Stage.ULTRA; s++) {
        expect(STAGE_CONFIG[s as Stage]).toBeDefined();
      }
    });

    it('base max levels should increase per stage', () => {
      let prevMax = 0;
      for (let s = Stage.IN_TRAINING; s <= Stage.ULTRA; s++) {
        const config = STAGE_CONFIG[s as Stage];
        expect(config.baseMaxLevel).toBeGreaterThan(prevMax);
        prevMax = config.baseMaxLevel;
      }
    });
  });

  describe('SPAWN_COSTS', () => {
    it('should have costs for In-Training, Rookie, Champion', () => {
      expect(SPAWN_COSTS[Stage.IN_TRAINING]).toBeDefined();
      expect(SPAWN_COSTS[Stage.ROOKIE]).toBeDefined();
      expect(SPAWN_COSTS[Stage.CHAMPION]).toBeDefined();
    });

    it('random < specific < free for each stage', () => {
      for (const stage of [Stage.IN_TRAINING, Stage.ROOKIE, Stage.CHAMPION] as const) {
        const costs = SPAWN_COSTS[stage];
        expect(costs.random).toBeLessThan(costs.specific);
        expect(costs.specific).toBeLessThan(costs.free);
      }
    });

    it('higher stages cost more', () => {
      expect(SPAWN_COSTS[Stage.IN_TRAINING].random).toBeLessThan(SPAWN_COSTS[Stage.ROOKIE].random);
      expect(SPAWN_COSTS[Stage.ROOKIE].random).toBeLessThan(SPAWN_COSTS[Stage.CHAMPION].random);
    });
  });
});
