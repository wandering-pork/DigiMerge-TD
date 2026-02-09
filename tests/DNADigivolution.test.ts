import { describe, it, expect } from 'vitest';
import { findDNAPair, getDNAPairsFor, DNA_PAIRS } from '@/data/EvolutionPaths';
import { canDNADigivolve, getDNAResult } from '@/systems/MergeSystem';
import { Stage } from '@/types';
import { DIGIMON_DATABASE } from '@/data/DigimonDatabase';

describe('DNA Digivolution', () => {
  describe('DNA_PAIRS data', () => {
    it('should have at least 6 DNA pairs', () => {
      expect(DNA_PAIRS.length).toBeGreaterThanOrEqual(6);
    });

    it('all DNA results should exist in the database', () => {
      for (const pair of DNA_PAIRS) {
        expect(DIGIMON_DATABASE.towers[pair.resultId], `Missing DB entry for ${pair.resultId}`).toBeDefined();
      }
    });

    it('all DNA partners should exist in the database', () => {
      for (const pair of DNA_PAIRS) {
        expect(DIGIMON_DATABASE.towers[pair.partnerAId], `Missing DB entry for ${pair.partnerAId}`).toBeDefined();
        expect(DIGIMON_DATABASE.towers[pair.partnerBId], `Missing DB entry for ${pair.partnerBId}`).toBeDefined();
      }
    });

    it('all DNA partners should be Mega stage', () => {
      for (const pair of DNA_PAIRS) {
        expect(DIGIMON_DATABASE.towers[pair.partnerAId].stageTier).toBe(Stage.MEGA);
        expect(DIGIMON_DATABASE.towers[pair.partnerBId].stageTier).toBe(Stage.MEGA);
      }
    });

    it('all DNA results should be Ultra stage', () => {
      for (const pair of DNA_PAIRS) {
        expect(DIGIMON_DATABASE.towers[pair.resultId].stageTier).toBe(Stage.ULTRA);
      }
    });

    it('minDPRequired should be positive', () => {
      for (const pair of DNA_PAIRS) {
        expect(pair.minDPRequired).toBeGreaterThan(0);
      }
    });
  });

  describe('findDNAPair', () => {
    it('should find WarGreymon + MetalGarurumon = Omegamon', () => {
      const pair = findDNAPair('wargreymon', 'metalgarurumon');
      expect(pair).toBeDefined();
      expect(pair!.resultId).toBe('omegamon');
    });

    it('should find pair regardless of order', () => {
      const pair1 = findDNAPair('wargreymon', 'metalgarurumon');
      const pair2 = findDNAPair('metalgarurumon', 'wargreymon');
      expect(pair1).toEqual(pair2);
    });

    it('should return undefined for invalid pair', () => {
      expect(findDNAPair('agumon', 'gabumon')).toBeUndefined();
    });

    it('should return undefined for same Digimon', () => {
      expect(findDNAPair('wargreymon', 'wargreymon')).toBeUndefined();
    });
  });

  describe('getDNAPairsFor', () => {
    it('should find all pairs for WarGreymon', () => {
      const pairs = getDNAPairsFor('wargreymon');
      expect(pairs.length).toBeGreaterThanOrEqual(1);
      expect(pairs.some(p => p.resultId === 'omegamon')).toBe(true);
    });

    it('should return empty for non-DNA Digimon', () => {
      expect(getDNAPairsFor('agumon')).toHaveLength(0);
    });
  });

  describe('canDNADigivolve', () => {
    it('should allow valid DNA pair at max level with enough DP', () => {
      expect(canDNADigivolve(
        { digimonId: 'wargreymon', stage: Stage.MEGA, dp: 5, isMaxLevel: true },
        { digimonId: 'metalgarurumon', stage: Stage.MEGA, dp: 3, isMaxLevel: true },
      )).toBe(true);
    });

    it('should reject if not both MEGA', () => {
      expect(canDNADigivolve(
        { digimonId: 'wargreymon', stage: Stage.MEGA, dp: 5, isMaxLevel: true },
        { digimonId: 'metalgarurumon', stage: Stage.ULTIMATE, dp: 3, isMaxLevel: true },
      )).toBe(false);
    });

    it('should reject if not at max level', () => {
      expect(canDNADigivolve(
        { digimonId: 'wargreymon', stage: Stage.MEGA, dp: 5, isMaxLevel: false },
        { digimonId: 'metalgarurumon', stage: Stage.MEGA, dp: 3, isMaxLevel: true },
      )).toBe(false);
    });

    it('should reject if DP too low', () => {
      expect(canDNADigivolve(
        { digimonId: 'wargreymon', stage: Stage.MEGA, dp: 1, isMaxLevel: true },
        { digimonId: 'metalgarurumon', stage: Stage.MEGA, dp: 2, isMaxLevel: true },
      )).toBe(false);
    });

    it('should reject invalid pair', () => {
      expect(canDNADigivolve(
        { digimonId: 'wargreymon', stage: Stage.MEGA, dp: 5, isMaxLevel: true },
        { digimonId: 'rosemon', stage: Stage.MEGA, dp: 5, isMaxLevel: true },
      )).toBe(false);
    });
  });

  describe('getDNAResult', () => {
    it('should return Omegamon for WarGreymon + MetalGarurumon', () => {
      expect(getDNAResult('wargreymon', 'metalgarurumon')).toBe('omegamon');
    });

    it('should work in either order', () => {
      expect(getDNAResult('metalgarurumon', 'wargreymon')).toBe('omegamon');
    });

    it('should return undefined for invalid pair', () => {
      expect(getDNAResult('agumon', 'greymon')).toBeUndefined();
    });
  });
});
