import { describe, it, expect } from 'vitest';
import { EVOLUTION_PATHS, getEvolutions } from '@/data/EvolutionPaths';
import { DIGIMON_DATABASE } from '@/data/DigimonDatabase';

describe('EvolutionPaths', () => {
  const starters = ['koromon', 'tsunomon', 'tokomon', 'gigimon', 'tanemon', 'demiveemon', 'pagumon', 'viximon'];

  it('all starters should have evolution paths', () => {
    for (const starter of starters) {
      expect(EVOLUTION_PATHS[starter], `Missing evolution for ${starter}`).toBeDefined();
      expect(EVOLUTION_PATHS[starter].length, `${starter} should have at least 1 path`).toBeGreaterThan(0);
    }
  });

  it('all starters should have a default evolution path', () => {
    for (const starter of starters) {
      const defaults = EVOLUTION_PATHS[starter].filter(p => p.isDefault);
      expect(defaults.length, `${starter} should have exactly 1 default`).toBe(1);
    }
  });

  it('evolution targets should exist in tower database', () => {
    const towers = DIGIMON_DATABASE.towers;
    for (const [fromId, paths] of Object.entries(EVOLUTION_PATHS)) {
      for (const path of paths) {
        expect(towers[path.resultId], `${fromId} → ${path.resultId} not found in towers`).toBeDefined();
      }
    }
  });

  it('minDP should be <= maxDP for all paths', () => {
    for (const [fromId, paths] of Object.entries(EVOLUTION_PATHS)) {
      for (const path of paths) {
        expect(path.minDP, `${fromId} → ${path.resultId}: minDP > maxDP`).toBeLessThanOrEqual(path.maxDP);
      }
    }
  });

  it('each evolvable Digimon should have at least one default path', () => {
    for (const [fromId, paths] of Object.entries(EVOLUTION_PATHS)) {
      const defaults = paths.filter(p => p.isDefault);
      expect(defaults.length, `${fromId} should have a default path`).toBeGreaterThanOrEqual(1);
    }
  });

  describe('getEvolutions', () => {
    it('returns default path at 0 DP for starters', () => {
      for (const starter of starters) {
        const evolutions = getEvolutions(starter, 0);
        expect(evolutions.length, `${starter} at 0 DP`).toBeGreaterThan(0);
      }
    });

    it('returns empty array for unknown Digimon', () => {
      expect(getEvolutions('nonexistent', 0)).toEqual([]);
    });

    it('filters by DP range correctly', () => {
      // Agumon should have greymon at DP 0-2 (default), and tyrannomon at DP 5-6
      const agumonAt0 = getEvolutions('agumon', 0);
      const agumonAt5 = getEvolutions('agumon', 5);

      // At DP 0, should get greymon (default)
      expect(agumonAt0.some(p => p.resultId === 'greymon')).toBe(true);

      // At DP 5, should get tyrannomon as an option
      expect(agumonAt5.some(p => p.resultId === 'tyrannomon')).toBe(true);
    });

    it('high DP should not match low-max paths', () => {
      // Agumon's greymon path has maxDP=2, so at DP 10 it shouldn't be available
      const agumonAt10 = getEvolutions('agumon', 10);
      expect(agumonAt10.some(p => p.resultId === 'greymon')).toBe(false);
    });
  });

  describe('evolution chains', () => {
    it('Koromon line reaches Mega', () => {
      // koromon → agumon → greymon → metalgreymon → wargreymon
      expect(EVOLUTION_PATHS['koromon']).toBeDefined();
      expect(EVOLUTION_PATHS['agumon']).toBeDefined();
      expect(EVOLUTION_PATHS['greymon']).toBeDefined();
      expect(EVOLUTION_PATHS['metalgreymon']).toBeDefined();

      expect(EVOLUTION_PATHS['koromon'].some(p => p.resultId === 'agumon')).toBe(true);
      expect(EVOLUTION_PATHS['agumon'].some(p => p.resultId === 'greymon')).toBe(true);
      expect(EVOLUTION_PATHS['greymon'].some(p => p.resultId === 'metalgreymon')).toBe(true);
      expect(EVOLUTION_PATHS['metalgreymon'].some(p => p.resultId === 'wargreymon')).toBe(true);
    });

    it('Tsunomon line reaches Mega', () => {
      expect(EVOLUTION_PATHS['tsunomon'].some(p => p.resultId === 'gabumon')).toBe(true);
      expect(EVOLUTION_PATHS['gabumon'].some(p => p.resultId === 'garurumon')).toBe(true);
      expect(EVOLUTION_PATHS['garurumon'].some(p => p.resultId === 'weregarurumon')).toBe(true);
      expect(EVOLUTION_PATHS['weregarurumon'].some(p => p.resultId === 'metalgarurumon')).toBe(true);
    });

    it('DemiVeemon line reaches Mega', () => {
      expect(EVOLUTION_PATHS['demiveemon'].some(p => p.resultId === 'veemon')).toBe(true);
      expect(EVOLUTION_PATHS['veemon'].some(p => p.resultId === 'exveemon')).toBe(true);
      expect(EVOLUTION_PATHS['exveemon'].some(p => p.resultId === 'paildramon')).toBe(true);
      expect(EVOLUTION_PATHS['paildramon'].some(p => p.resultId === 'imperialdramon_fm')).toBe(true);
    });
  });
});
