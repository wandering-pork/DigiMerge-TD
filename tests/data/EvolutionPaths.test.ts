import { describe, it, expect } from 'vitest';
import { EVOLUTION_PATHS, getEvolutions } from '@/data/EvolutionPaths';
import { DIGIMON_DATABASE } from '@/data/DigimonDatabase';

describe('EvolutionPaths', () => {
  const starters = [
    'koromon', 'tsunomon', 'tokomon', 'gigimon', 'tanemon', 'demiveemon', 'pagumon', 'viximon',
    'nyaromon', 'gummymon', 'chocomon', 'pyocomon', 'mochimon', 'pukamon', 'dorimon',
    'sunmon', 'moonmon', 'kyokyomon', 'puroromon', 'budmon', 'caprimon',
  ];

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

    it('Nyaromon line reaches Mega (Ophanimon)', () => {
      expect(EVOLUTION_PATHS['nyaromon'].some(p => p.resultId === 'plotmon')).toBe(true);
      expect(EVOLUTION_PATHS['plotmon'].some(p => p.resultId === 'tailmon')).toBe(true);
      expect(EVOLUTION_PATHS['tailmon'].some(p => p.resultId === 'angewomon')).toBe(true);
      expect(EVOLUTION_PATHS['angewomon'].some(p => p.resultId === 'ophanimon')).toBe(true);
    });

    it('Gummymon line reaches Mega (SaintGalgomon)', () => {
      expect(EVOLUTION_PATHS['gummymon'].some(p => p.resultId === 'terriermon')).toBe(true);
      expect(EVOLUTION_PATHS['terriermon'].some(p => p.resultId === 'galgomon')).toBe(true);
      expect(EVOLUTION_PATHS['galgomon'].some(p => p.resultId === 'rapidmon')).toBe(true);
      expect(EVOLUTION_PATHS['rapidmon'].some(p => p.resultId === 'saintgalgomon')).toBe(true);
    });

    it('Dorimon line reaches Mega (Alphamon)', () => {
      expect(EVOLUTION_PATHS['dorimon'].some(p => p.resultId === 'dorumon')).toBe(true);
      expect(EVOLUTION_PATHS['dorumon'].some(p => p.resultId === 'dorugamon')).toBe(true);
      expect(EVOLUTION_PATHS['dorugamon'].some(p => p.resultId === 'doruguremon')).toBe(true);
      expect(EVOLUTION_PATHS['doruguremon'].some(p => p.resultId === 'alphamon')).toBe(true);
    });

    it('Pukamon line reaches Mega (Plesiomon)', () => {
      expect(EVOLUTION_PATHS['pukamon'].some(p => p.resultId === 'gomamon')).toBe(true);
      expect(EVOLUTION_PATHS['gomamon'].some(p => p.resultId === 'ikkakumon')).toBe(true);
      expect(EVOLUTION_PATHS['ikkakumon'].some(p => p.resultId === 'zudomon_tower')).toBe(true);
      expect(EVOLUTION_PATHS['zudomon_tower'].some(p => p.resultId === 'plesiomon')).toBe(true);
    });

    it('Sunmon line reaches Mega (Apollomon)', () => {
      expect(EVOLUTION_PATHS['sunmon'].some(p => p.resultId === 'coronamon')).toBe(true);
      expect(EVOLUTION_PATHS['coronamon'].some(p => p.resultId === 'firamon')).toBe(true);
      expect(EVOLUTION_PATHS['firamon'].some(p => p.resultId === 'flaremon')).toBe(true);
      expect(EVOLUTION_PATHS['flaremon'].some(p => p.resultId === 'apollomon')).toBe(true);
    });

    it('Moonmon line reaches Mega (Dianamon)', () => {
      expect(EVOLUTION_PATHS['moonmon'].some(p => p.resultId === 'lunamon')).toBe(true);
      expect(EVOLUTION_PATHS['lunamon'].some(p => p.resultId === 'lekismon')).toBe(true);
      expect(EVOLUTION_PATHS['lekismon'].some(p => p.resultId === 'crescemon')).toBe(true);
      expect(EVOLUTION_PATHS['crescemon'].some(p => p.resultId === 'dianamon')).toBe(true);
    });

    it('Kyokyomon line reaches Mega (Ouryumon)', () => {
      expect(EVOLUTION_PATHS['kyokyomon'].some(p => p.resultId === 'ryudamon')).toBe(true);
      expect(EVOLUTION_PATHS['ryudamon'].some(p => p.resultId === 'ginryumon')).toBe(true);
      expect(EVOLUTION_PATHS['ginryumon'].some(p => p.resultId === 'hisyaryumon')).toBe(true);
      expect(EVOLUTION_PATHS['hisyaryumon'].some(p => p.resultId === 'ouryumon')).toBe(true);
    });

    it('Puroromon line reaches Mega (TigerVespamon)', () => {
      expect(EVOLUTION_PATHS['puroromon'].some(p => p.resultId === 'funbeemon')).toBe(true);
      expect(EVOLUTION_PATHS['funbeemon'].some(p => p.resultId === 'waspmon')).toBe(true);
      expect(EVOLUTION_PATHS['waspmon'].some(p => p.resultId === 'cannonbeemon')).toBe(true);
      expect(EVOLUTION_PATHS['cannonbeemon'].some(p => p.resultId === 'tigervespamon')).toBe(true);
    });

    it('Budmon line reaches Mega (Lotusmon)', () => {
      expect(EVOLUTION_PATHS['budmon'].some(p => p.resultId === 'lalamon')).toBe(true);
      expect(EVOLUTION_PATHS['lalamon'].some(p => p.resultId === 'sunflowmon')).toBe(true);
      expect(EVOLUTION_PATHS['sunflowmon'].some(p => p.resultId === 'lilamon')).toBe(true);
      expect(EVOLUTION_PATHS['lilamon'].some(p => p.resultId === 'lotusmon')).toBe(true);
    });

    it('Caprimon line reaches Mega (Jesmon)', () => {
      expect(EVOLUTION_PATHS['caprimon'].some(p => p.resultId === 'hackmon')).toBe(true);
      expect(EVOLUTION_PATHS['hackmon'].some(p => p.resultId === 'reppamon')).toBe(true);
      expect(EVOLUTION_PATHS['reppamon'].some(p => p.resultId === 'saviorhackmon')).toBe(true);
      expect(EVOLUTION_PATHS['saviorhackmon'].some(p => p.resultId === 'jesmon')).toBe(true);
    });
  });

  describe('Sprint 12D alternate evolution paths', () => {
    it('starters have alternate Rookie paths', () => {
      expect(EVOLUTION_PATHS['gigimon'].some(p => p.resultId === 'goblimon_tower')).toBe(true);
      expect(EVOLUTION_PATHS['gigimon'].some(p => p.resultId === 'impmon_tower')).toBe(true);
      expect(EVOLUTION_PATHS['tsunomon'].some(p => p.resultId === 'elecmon_tower')).toBe(true);
      expect(EVOLUTION_PATHS['tsunomon'].some(p => p.resultId === 'gotsumon_tower')).toBe(true);
      expect(EVOLUTION_PATHS['pagumon'].some(p => p.resultId === 'gazimon_tower')).toBe(true);
      expect(EVOLUTION_PATHS['pagumon'].some(p => p.resultId === 'betamon_tower')).toBe(true);
      expect(EVOLUTION_PATHS['pagumon'].some(p => p.resultId === 'kunemon_tower')).toBe(true);
      expect(EVOLUTION_PATHS['tanemon'].some(p => p.resultId === 'floramon_tower')).toBe(true);
    });

    it('alternate Rookies are not default paths', () => {
      const altRookies = [
        { from: 'gigimon', to: 'goblimon_tower' },
        { from: 'gigimon', to: 'impmon_tower' },
        { from: 'tsunomon', to: 'elecmon_tower' },
        { from: 'tsunomon', to: 'gotsumon_tower' },
        { from: 'pagumon', to: 'gazimon_tower' },
        { from: 'pagumon', to: 'betamon_tower' },
        { from: 'pagumon', to: 'kunemon_tower' },
        { from: 'tanemon', to: 'floramon_tower' },
      ];
      for (const { from, to } of altRookies) {
        const path = EVOLUTION_PATHS[from].find(p => p.resultId === to);
        expect(path?.isDefault, `${from} → ${to} should not be default`).toBe(false);
      }
    });

    it('all new tower entries have evolution paths', () => {
      const newTowerPaths = [
        'impmon_tower', 'elecmon_tower', 'gotsumon_tower', 'betamon_tower',
        'kunemon_tower', 'gazimon_tower', 'goblimon_tower', 'floramon_tower',
        'leomon_tower', 'seadramon_tower', 'ogremon_tower', 'monochromon_tower',
        'darktyrannomon_tower', 'airdramon_tower', 'meramon_tower', 'kuwagamon_tower',
        'numemon_tower', 'guardromon_tower',
        'megaseadramon_tower', 'gigadramon_tower', 'warumonzaemon_tower', 'ladydevimon_tower',
        'bluemeramon_tower', 'megadramon_tower', 'mamemon_tower', 'andromon_tower',
      ];
      for (const id of newTowerPaths) {
        expect(EVOLUTION_PATHS[id], `${id} should have evolution paths`).toBeDefined();
        expect(EVOLUTION_PATHS[id].length, `${id} should have at least 1 path`).toBeGreaterThan(0);
      }
    });

    it('Elecmon alternate line reaches Mega', () => {
      // tsunomon → elecmon_tower → leomon_tower → mamemon_tower → saberleomon_tower
      expect(EVOLUTION_PATHS['elecmon_tower'].some(p => p.resultId === 'leomon_tower')).toBe(true);
      expect(EVOLUTION_PATHS['leomon_tower'].some(p => p.resultId === 'mamemon_tower')).toBe(true);
      expect(EVOLUTION_PATHS['mamemon_tower'].some(p => p.resultId === 'saberleomon_tower')).toBe(true);
    });

    it('Betamon alternate line reaches Mega', () => {
      // pagumon → betamon_tower → seadramon_tower → megaseadramon_tower → metalseadramon_tower
      expect(EVOLUTION_PATHS['betamon_tower'].some(p => p.resultId === 'seadramon_tower')).toBe(true);
      expect(EVOLUTION_PATHS['seadramon_tower'].some(p => p.resultId === 'megaseadramon_tower')).toBe(true);
      expect(EVOLUTION_PATHS['megaseadramon_tower'].some(p => p.resultId === 'metalseadramon_tower')).toBe(true);
    });

    it('Gazimon alternate line reaches Mega', () => {
      // pagumon → gazimon_tower → ogremon_tower → gigadramon_tower → blackwargreymon_tower
      expect(EVOLUTION_PATHS['gazimon_tower'].some(p => p.resultId === 'ogremon_tower')).toBe(true);
      expect(EVOLUTION_PATHS['ogremon_tower'].some(p => p.resultId === 'gigadramon_tower')).toBe(true);
      expect(EVOLUTION_PATHS['gigadramon_tower'].some(p => p.resultId === 'blackwargreymon_tower')).toBe(true);
    });
  });
});
