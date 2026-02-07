import { describe, it, expect } from 'vitest';
import {
  PATH_WAYPOINTS,
  GRID,
  isPathCell,
  isValidTowerSlot,
  getLevelUpCost,
  calculateDamage,
  calculateMaxLevel,
  getSellPrice,
  ATTRIBUTE_MULTIPLIERS,
  STAGE_CONFIG,
  SPAWN_COSTS,
  STAGE_LEVEL_COST_MULTIPLIER,
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
    it('level 1 costs 3 DigiBytes', () => {
      expect(getLevelUpCost(1)).toBe(3);
    });

    it('level 10 costs 30 DigiBytes', () => {
      expect(getLevelUpCost(10)).toBe(30);
    });

    it('level 20 costs 60 DigiBytes', () => {
      expect(getLevelUpCost(20)).toBe(60);
    });

    it('stage multiplier increases cost for higher stages', () => {
      // Rookie: 3 * 10 * 1.5 = 45
      expect(getLevelUpCost(10, Stage.ROOKIE)).toBe(45);
      // Champion: 3 * 10 * 2 = 60
      expect(getLevelUpCost(10, Stage.CHAMPION)).toBe(60);
    });
  });

  describe('STAGE_LEVEL_COST_MULTIPLIER', () => {
    it('should have multipliers for all 6 stages', () => {
      for (let s = Stage.IN_TRAINING; s <= Stage.ULTRA; s++) {
        expect(STAGE_LEVEL_COST_MULTIPLIER[s as Stage]).toBeDefined();
        expect(STAGE_LEVEL_COST_MULTIPLIER[s as Stage]).toBeGreaterThan(0);
      }
    });

    it('multipliers should increase with stage', () => {
      expect(STAGE_LEVEL_COST_MULTIPLIER[Stage.IN_TRAINING]).toBeLessThan(STAGE_LEVEL_COST_MULTIPLIER[Stage.ROOKIE]);
      expect(STAGE_LEVEL_COST_MULTIPLIER[Stage.ROOKIE]).toBeLessThan(STAGE_LEVEL_COST_MULTIPLIER[Stage.CHAMPION]);
      expect(STAGE_LEVEL_COST_MULTIPLIER[Stage.CHAMPION]).toBeLessThan(STAGE_LEVEL_COST_MULTIPLIER[Stage.ULTIMATE]);
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

    it('random < specific for each stage', () => {
      for (const stage of [Stage.IN_TRAINING, Stage.ROOKIE, Stage.CHAMPION] as const) {
        const costs = SPAWN_COSTS[stage];
        expect(costs.random).toBeLessThan(costs.specific);
      }
    });

    it('higher stages cost more', () => {
      expect(SPAWN_COSTS[Stage.IN_TRAINING].random).toBeLessThan(SPAWN_COSTS[Stage.ROOKIE].random);
      expect(SPAWN_COSTS[Stage.ROOKIE].random).toBeLessThan(SPAWN_COSTS[Stage.CHAMPION].random);
    });
  });

  describe('getSellPrice', () => {
    it('level 1 returns minimum sell price of 25', () => {
      // baseCost=50, levelUpInvestment=0, total=50, 50*0.5=25
      expect(getSellPrice(1, Stage.IN_TRAINING)).toBe(25);
    });

    it('sell price increases with level', () => {
      const priceLv1 = getSellPrice(1, Stage.ROOKIE);
      const priceLv5 = getSellPrice(5, Stage.ROOKIE);
      const priceLv10 = getSellPrice(10, Stage.ROOKIE);
      expect(priceLv5).toBeGreaterThan(priceLv1);
      expect(priceLv10).toBeGreaterThan(priceLv5);
    });

    it('higher stages return higher sell prices at the same level', () => {
      const level = 10;
      const priceInTraining = getSellPrice(level, Stage.IN_TRAINING);
      const priceRookie = getSellPrice(level, Stage.ROOKIE);
      const priceChampion = getSellPrice(level, Stage.CHAMPION);
      expect(priceRookie).toBeGreaterThan(priceInTraining);
      expect(priceChampion).toBeGreaterThan(priceRookie);
    });

    it('sell price is always at least 25', () => {
      // Even at level 1 for the cheapest stage
      for (let s = Stage.IN_TRAINING; s <= Stage.ULTRA; s++) {
        expect(getSellPrice(1, s as Stage)).toBeGreaterThanOrEqual(25);
      }
    });

    it('sell price at level 1 is floor of 50% of base cost', () => {
      // baseCost=50, no level ups, floor(50*0.5)=25
      expect(getSellPrice(1, Stage.CHAMPION)).toBe(25);
    });

    it('sell price accounts for stage multiplier in level-up costs', () => {
      // Level 5, In-Training (mult 1): levelUp = ceil(3*1*1)+ceil(3*2*1)+ceil(3*3*1)+ceil(3*4*1) = 3+6+9+12=30
      // total = 50+30=80, floor(80*0.5)=40
      expect(getSellPrice(5, Stage.IN_TRAINING)).toBe(40);

      // Level 5, Rookie (mult 1.5): levelUp = ceil(3*1*1.5)+ceil(3*2*1.5)+ceil(3*3*1.5)+ceil(3*4*1.5)
      // = ceil(4.5)+ceil(9)+ceil(13.5)+ceil(18) = 5+9+14+18=46
      // total = 50+46=96, floor(96*0.5)=48
      expect(getSellPrice(5, Stage.ROOKIE)).toBe(48);
    });
  });
});
