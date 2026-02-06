import { describe, it, expect } from 'vitest';
import {
  getMaxEvolutionStage,
  canEvolve,
  getOriginBonus,
  getDigivolveCost,
  canDigivolve,
} from '@/systems/OriginSystem';
import { Stage } from '@/types';

describe('OriginSystem', () => {
  describe('getMaxEvolutionStage', () => {
    it('IN_TRAINING origin → max CHAMPION', () => {
      expect(getMaxEvolutionStage(Stage.IN_TRAINING)).toBe(Stage.CHAMPION);
    });

    it('ROOKIE origin → max ULTIMATE', () => {
      expect(getMaxEvolutionStage(Stage.ROOKIE)).toBe(Stage.ULTIMATE);
    });

    it('CHAMPION origin → max MEGA', () => {
      expect(getMaxEvolutionStage(Stage.CHAMPION)).toBe(Stage.MEGA);
    });

    it('ULTIMATE origin → max ULTRA', () => {
      expect(getMaxEvolutionStage(Stage.ULTIMATE)).toBe(Stage.ULTRA);
    });

    it('MEGA origin → max ULTRA', () => {
      expect(getMaxEvolutionStage(Stage.MEGA)).toBe(Stage.ULTRA);
    });

    it('ULTRA origin → max ULTRA', () => {
      expect(getMaxEvolutionStage(Stage.ULTRA)).toBe(Stage.ULTRA);
    });
  });

  describe('canEvolve', () => {
    it('ROOKIE current, IN_TRAINING origin → true (next=CHAMPION <= max CHAMPION)', () => {
      expect(canEvolve(Stage.ROOKIE, Stage.IN_TRAINING)).toBe(true);
    });

    it('CHAMPION current, IN_TRAINING origin → false (next=ULTIMATE > max CHAMPION)', () => {
      expect(canEvolve(Stage.CHAMPION, Stage.IN_TRAINING)).toBe(false);
    });

    it('ULTIMATE current, ROOKIE origin → false (next=MEGA > max ULTIMATE)', () => {
      expect(canEvolve(Stage.ULTIMATE, Stage.ROOKIE)).toBe(false);
    });

    it('CHAMPION current, CHAMPION origin → true (next=ULTIMATE <= max MEGA)', () => {
      expect(canEvolve(Stage.CHAMPION, Stage.CHAMPION)).toBe(true);
    });

    it('IN_TRAINING current, IN_TRAINING origin → true (next=ROOKIE <= max CHAMPION)', () => {
      expect(canEvolve(Stage.IN_TRAINING, Stage.IN_TRAINING)).toBe(true);
    });

    it('MEGA current, CHAMPION origin → false (next=ULTRA > max MEGA)', () => {
      expect(canEvolve(Stage.MEGA, Stage.CHAMPION)).toBe(false);
    });

    it('MEGA current, ULTIMATE origin → true (next=ULTRA <= max ULTRA)', () => {
      expect(canEvolve(Stage.MEGA, Stage.ULTIMATE)).toBe(true);
    });

    it('ULTRA current cannot evolve further regardless of origin', () => {
      expect(canEvolve(Stage.ULTRA, Stage.IN_TRAINING)).toBe(false);
      expect(canEvolve(Stage.ULTRA, Stage.ULTRA)).toBe(false);
    });

    it('ROOKIE current, ROOKIE origin → true (next=CHAMPION <= max ULTIMATE)', () => {
      expect(canEvolve(Stage.ROOKIE, Stage.ROOKIE)).toBe(true);
    });
  });

  describe('getOriginBonus', () => {
    it('same stage gives 0 bonus', () => {
      expect(getOriginBonus(Stage.IN_TRAINING, Stage.IN_TRAINING)).toBe(0);
      expect(getOriginBonus(Stage.ROOKIE, Stage.ROOKIE)).toBe(0);
      expect(getOriginBonus(Stage.MEGA, Stage.MEGA)).toBe(0);
    });

    it('IN_TRAINING origin, CHAMPION current = (2-0)*5 = 10', () => {
      expect(getOriginBonus(Stage.IN_TRAINING, Stage.CHAMPION)).toBe(10);
    });

    it('ROOKIE origin, MEGA current = (4-1)*5 = 15', () => {
      expect(getOriginBonus(Stage.ROOKIE, Stage.MEGA)).toBe(15);
    });

    it('IN_TRAINING origin, MEGA current = (4-0)*5 = 20', () => {
      expect(getOriginBonus(Stage.IN_TRAINING, Stage.MEGA)).toBe(20);
    });

    it('CHAMPION origin, ULTRA current = (5-2)*5 = 15', () => {
      expect(getOriginBonus(Stage.CHAMPION, Stage.ULTRA)).toBe(15);
    });

    it('ROOKIE origin, CHAMPION current = (2-1)*5 = 5', () => {
      expect(getOriginBonus(Stage.ROOKIE, Stage.CHAMPION)).toBe(5);
    });
  });

  describe('getDigivolveCost', () => {
    it('IN_TRAINING → ROOKIE costs 100 (DIGIVOLVE_COSTS[0])', () => {
      expect(getDigivolveCost(Stage.IN_TRAINING)).toBe(100);
    });

    it('ROOKIE → CHAMPION costs 150 (DIGIVOLVE_COSTS[1])', () => {
      expect(getDigivolveCost(Stage.ROOKIE)).toBe(150);
    });

    it('CHAMPION → ULTIMATE costs 200 (DIGIVOLVE_COSTS[2])', () => {
      expect(getDigivolveCost(Stage.CHAMPION)).toBe(200);
    });

    it('ULTIMATE → MEGA costs 250 (DIGIVOLVE_COSTS[3])', () => {
      expect(getDigivolveCost(Stage.ULTIMATE)).toBe(250);
    });

    it('MEGA → ULTRA costs undefined (index out of range)', () => {
      // MEGA is stage 4, so DIGIVOLVE_COSTS[4] is undefined
      // The function should handle this gracefully
      expect(getDigivolveCost(Stage.MEGA)).toBeUndefined();
    });
  });

  describe('canDigivolve', () => {
    it('at max level, can evolve, can afford → canEvolve: true', () => {
      // ROOKIE current, IN_TRAINING origin, at max level, 200 DB (cost is 150)
      const result = canDigivolve(Stage.ROOKIE, Stage.IN_TRAINING, 20, 20, 200);
      expect(result.canEvolve).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('not at max level → canEvolve: false with reason', () => {
      const result = canDigivolve(Stage.ROOKIE, Stage.IN_TRAINING, 15, 20, 500);
      expect(result.canEvolve).toBe(false);
      expect(result.reason).toBeDefined();
      expect(result.reason).toContain('max level');
    });

    it('at max level but origin prevents evolution → canEvolve: false with reason', () => {
      // CHAMPION current, IN_TRAINING origin → max is CHAMPION, can't go to ULTIMATE
      const result = canDigivolve(Stage.CHAMPION, Stage.IN_TRAINING, 35, 35, 500);
      expect(result.canEvolve).toBe(false);
      expect(result.reason).toBeDefined();
      expect(result.reason).toContain('origin');
    });

    it('at max level, can evolve, but cannot afford → canEvolve: false with reason', () => {
      // ROOKIE current, IN_TRAINING origin, at max level, only 50 DB (cost is 150)
      const result = canDigivolve(Stage.ROOKIE, Stage.IN_TRAINING, 20, 20, 50);
      expect(result.canEvolve).toBe(false);
      expect(result.reason).toBeDefined();
      expect(result.reason).toContain('DigiBytes');
    });

    it('ULTRA stage cannot evolve further', () => {
      const result = canDigivolve(Stage.ULTRA, Stage.IN_TRAINING, 100, 100, 9999);
      expect(result.canEvolve).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('exact cost amount is sufficient', () => {
      // IN_TRAINING → ROOKIE costs 100
      const result = canDigivolve(Stage.IN_TRAINING, Stage.IN_TRAINING, 10, 10, 100);
      expect(result.canEvolve).toBe(true);
    });

    it('one DigiBytes short fails', () => {
      // IN_TRAINING → ROOKIE costs 100
      const result = canDigivolve(Stage.IN_TRAINING, Stage.IN_TRAINING, 10, 10, 99);
      expect(result.canEvolve).toBe(false);
      expect(result.reason).toContain('DigiBytes');
    });

    it('checks in order: max level first, then origin, then cost', () => {
      // Not at max level, origin also blocks, and can't afford — should mention max level
      const result = canDigivolve(Stage.CHAMPION, Stage.IN_TRAINING, 10, 35, 0);
      expect(result.canEvolve).toBe(false);
      expect(result.reason).toContain('max level');
    });
  });
});
