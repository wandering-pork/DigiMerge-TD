import { describe, it, expect } from 'vitest';
import { DIGIMON_DATABASE } from '@/data/DigimonDatabase';
import { Stage, Attribute } from '@/types';

describe('DigimonDatabase', () => {
  describe('towers', () => {
    const towers = DIGIMON_DATABASE.towers;

    it('should have all 21 starter Digimon', () => {
      const starters = [
        'koromon', 'tsunomon', 'tokomon', 'gigimon', 'tanemon', 'demiveemon', 'pagumon', 'viximon',
        'nyaromon', 'gummymon', 'chocomon', 'pyocomon', 'mochimon', 'pukamon', 'dorimon',
        'sunmon', 'moonmon', 'kyokyomon', 'puroromon', 'budmon', 'caprimon',
      ];
      for (const starter of starters) {
        expect(towers[starter], `Missing starter: ${starter}`).toBeDefined();
      }
    });

    it('should have Rookie evolutions for all starters', () => {
      const rookies = [
        'agumon', 'gabumon', 'patamon', 'guilmon', 'palmon', 'veemon', 'demidevimon', 'renamon',
        'plotmon', 'terriermon', 'lopmon', 'piyomon', 'tentomon_tower', 'gomamon', 'dorumon',
        'coronamon', 'lunamon', 'ryudamon', 'funbeemon', 'lalamon', 'hackmon',
      ];
      for (const rookie of rookies) {
        expect(towers[rookie], `Missing rookie: ${rookie}`).toBeDefined();
      }
    });

    it('should have Champion evolutions', () => {
      const champions = [
        'greymon', 'garurumon', 'angemon', 'growlmon', 'togemon', 'exveemon', 'devimon', 'kyubimon',
        'tailmon', 'galgomon', 'turuiemon', 'birdramon_tower', 'kabuterimon_tower', 'ikkakumon', 'dorugamon',
        'firamon', 'lekismon', 'ginryumon', 'waspmon', 'sunflowmon', 'reppamon',
      ];
      for (const champ of champions) {
        expect(towers[champ], `Missing champion: ${champ}`).toBeDefined();
      }
    });

    it('should have Ultimate evolutions', () => {
      const ultimates = [
        'metalgreymon', 'weregarurumon', 'magnaangemon', 'wargrowlmon', 'lillymon', 'paildramon', 'myotismon', 'taomon',
        'angewomon', 'rapidmon', 'andiramon', 'garudamon_tower', 'atlurkabuterimon', 'zudomon_tower', 'doruguremon',
        'flaremon', 'crescemon', 'hisyaryumon', 'cannonbeemon', 'lilamon', 'saviorhackmon',
      ];
      for (const ult of ultimates) {
        expect(towers[ult], `Missing ultimate: ${ult}`).toBeDefined();
      }
    });

    it('should have Mega evolutions', () => {
      const megas = [
        'wargreymon', 'metalgarurumon', 'seraphimon', 'gallantmon', 'rosemon', 'imperialdramon_fm', 'venommyotismon', 'sakuyamon',
        'ophanimon', 'saintgalgomon', 'cherubimon_virtue', 'hououmon', 'heraklekabuterimon_tower', 'plesiomon', 'alphamon',
        'apollomon', 'dianamon', 'ouryumon', 'tigervespamon', 'lotusmon', 'jesmon',
      ];
      for (const mega of megas) {
        expect(towers[mega], `Missing mega: ${mega}`).toBeDefined();
      }
    });

    it('every tower should have required fields', () => {
      for (const [key, tower] of Object.entries(towers)) {
        expect(tower.id, `${key} missing id`).toBeDefined();
        expect(tower.name, `${key} missing name`).toBeDefined();
        expect(tower.stageTier, `${key} missing stageTier`).toBeDefined();
        expect(tower.attribute, `${key} missing attribute`).toBeDefined();
        expect(tower.baseDamage, `${key} missing baseDamage`).toBeGreaterThan(0);
        expect(tower.baseSpeed, `${key} missing baseSpeed`).toBeGreaterThan(0);
        expect(tower.range, `${key} missing range`).toBeGreaterThan(0);
      }
    });

    it('starter Digimon should be In-Training stage', () => {
      const starters = [
        'koromon', 'tsunomon', 'tokomon', 'gigimon', 'tanemon', 'demiveemon', 'pagumon', 'viximon',
        'nyaromon', 'gummymon', 'chocomon', 'pyocomon', 'mochimon', 'pukamon', 'dorimon',
        'sunmon', 'moonmon', 'kyokyomon', 'puroromon', 'budmon', 'caprimon',
      ];
      for (const starter of starters) {
        expect(towers[starter].stageTier, `${starter} should be In-Training`).toBe(Stage.IN_TRAINING);
      }
    });

    it('tower IDs should match their object keys', () => {
      for (const [key, tower] of Object.entries(towers)) {
        expect(tower.id).toBe(key);
      }
    });

    it('attributes should be valid enum values', () => {
      const validAttrs = [Attribute.VACCINE, Attribute.DATA, Attribute.VIRUS, Attribute.FREE];
      for (const [key, tower] of Object.entries(towers)) {
        expect(validAttrs, `${key} has invalid attribute`).toContain(tower.attribute);
      }
    });
  });

  describe('enemies', () => {
    const enemies = DIGIMON_DATABASE.enemies;

    it('should have In-Training enemies', () => {
      const inTraining = ['enemy_koromon', 'enemy_tsunomon', 'enemy_tokomon', 'enemy_pagumon', 'enemy_gigimon'];
      for (const enemy of inTraining) {
        expect(enemies[enemy], `Missing enemy: ${enemy}`).toBeDefined();
      }
    });

    it('should have Rookie enemies', () => {
      const rookies = ['enemy_agumon', 'enemy_gabumon', 'enemy_patamon', 'enemy_guilmon', 'enemy_impmon', 'enemy_goblimon', 'enemy_gazimon'];
      for (const enemy of rookies) {
        expect(enemies[enemy], `Missing enemy: ${enemy}`).toBeDefined();
      }
    });

    it('every enemy should have required fields', () => {
      for (const [key, enemy] of Object.entries(enemies)) {
        expect(enemy.id, `${key} missing id`).toBeDefined();
        expect(enemy.name, `${key} missing name`).toBeDefined();
        expect(enemy.baseHP, `${key} missing baseHP`).toBeGreaterThan(0);
        expect(enemy.moveSpeed, `${key} missing moveSpeed`).toBeGreaterThan(0);
        expect(typeof enemy.armor, `${key} armor should be number`).toBe('number');
        expect(enemy.type, `${key} missing type`).toBeDefined();
        expect(enemy.reward, `${key} missing reward`).toBeGreaterThan(0);
      }
    });

    it('enemy IDs should match their object keys', () => {
      for (const [key, enemy] of Object.entries(enemies)) {
        expect(enemy.id).toBe(key);
      }
    });

    it('swarm enemies should have lower HP', () => {
      for (const [key, enemy] of Object.entries(enemies)) {
        if (enemy.type === 'swarm') {
          // Swarm enemies at Rookie tier should have <= 25 HP
          if (enemy.stageTier === Stage.ROOKIE) {
            expect(enemy.baseHP, `${key} swarm HP too high`).toBeLessThanOrEqual(25);
          }
        }
      }
    });

    it('tank enemies should have higher HP and armor', () => {
      for (const [key, enemy] of Object.entries(enemies)) {
        if (enemy.type === 'tank') {
          expect(enemy.armor, `${key} tank should have armor`).toBeGreaterThan(0);
        }
      }
    });
  });
});
