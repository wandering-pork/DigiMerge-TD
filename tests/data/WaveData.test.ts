import { describe, it, expect } from 'vitest';
import { WAVE_DATA, getWaveConfig, generateEndlessWave } from '@/data/WaveData';
import { DIGIMON_DATABASE } from '@/data/DigimonDatabase';

describe('WaveData', () => {
  it('should have all 100 waves defined', () => {
    for (let i = 1; i <= 100; i++) {
      expect(WAVE_DATA[i], `Missing wave ${i}`).toBeDefined();
    }
  });

  it('every wave should have enemies array with at least one entry', () => {
    for (let i = 1; i <= 100; i++) {
      const wave = WAVE_DATA[i];
      expect(wave.enemies.length, `Wave ${i} has no enemies`).toBeGreaterThan(0);
    }
  });

  it('every wave should have a positive spawnInterval', () => {
    for (let i = 1; i <= 100; i++) {
      expect(WAVE_DATA[i].spawnInterval, `Wave ${i} spawnInterval`).toBeGreaterThan(0);
    }
  });

  it('boss waves should have a boss', () => {
    const bossWaves = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    for (const wave of bossWaves) {
      expect(WAVE_DATA[wave].boss, `Wave ${wave} should have a boss`).toBeDefined();
    }
  });

  it('all enemy IDs in waves should exist in the enemy database', () => {
    const enemies = DIGIMON_DATABASE.enemies;
    for (let i = 1; i <= 100; i++) {
      const wave = WAVE_DATA[i];
      for (const entry of wave.enemies) {
        expect(enemies[entry.id], `Wave ${i}: enemy "${entry.id}" not in database`).toBeDefined();
      }
    }
  });

  it('all boss IDs should exist in the enemy database', () => {
    const enemies = DIGIMON_DATABASE.enemies;
    for (let i = 1; i <= 100; i++) {
      const wave = WAVE_DATA[i];
      if (wave.boss) {
        expect(enemies[wave.boss], `Wave ${i}: boss "${wave.boss}" not in database`).toBeDefined();
      }
    }
  });

  it('early waves should have slower spawn intervals', () => {
    for (let i = 1; i <= 10; i++) {
      expect(WAVE_DATA[i].spawnInterval, `Wave ${i} should be slow`).toBeGreaterThanOrEqual(1800);
    }
  });

  it('enemy counts should increase over waves', () => {
    const totalEnemies = (wave: number) =>
      WAVE_DATA[wave].enemies.reduce((sum, e) => sum + e.count, 0);

    expect(totalEnemies(1)).toBeLessThan(totalEnemies(20));
    expect(totalEnemies(20)).toBeLessThan(totalEnemies(80));
  });

  it('each enemy entry should have positive count', () => {
    for (let i = 1; i <= 100; i++) {
      for (const entry of WAVE_DATA[i].enemies) {
        expect(entry.count, `Wave ${i}, ${entry.id} count`).toBeGreaterThan(0);
      }
    }
  });

  it('each wave should have at most 5 unique Digimon types', () => {
    for (let i = 1; i <= 100; i++) {
      expect(WAVE_DATA[i].enemies.length, `Wave ${i} has more than 5 unique Digimon`).toBeLessThanOrEqual(5);
    }
  });

  it('each enemy entry should have at least 5 units', () => {
    for (let i = 1; i <= 100; i++) {
      for (const entry of WAVE_DATA[i].enemies) {
        expect(entry.count, `Wave ${i}, ${entry.id} has fewer than 5 units`).toBeGreaterThanOrEqual(5);
      }
    }
  });

  it('spawn intervals should decrease across phases', () => {
    // Phase 1: 2000-1800, Phase 2: 1500, Phase 3: 1200, Phase 4: 1000, Phase 5: 800
    expect(WAVE_DATA[1].spawnInterval).toBeGreaterThan(WAVE_DATA[25].spawnInterval);
    expect(WAVE_DATA[25].spawnInterval).toBeGreaterThan(WAVE_DATA[45].spawnInterval);
    expect(WAVE_DATA[45].spawnInterval).toBeGreaterThan(WAVE_DATA[65].spawnInterval);
    expect(WAVE_DATA[65].spawnInterval).toBeGreaterThan(WAVE_DATA[85].spawnInterval);
  });
});

describe('getWaveConfig', () => {
  it('should return WAVE_DATA for waves 1-100', () => {
    for (let i = 1; i <= 100; i++) {
      expect(getWaveConfig(i)).toEqual(WAVE_DATA[i]);
    }
  });

  it('should return endless wave config for waves 101+', () => {
    const config = getWaveConfig(101);
    expect(config).toBeDefined();
    expect(config!.enemies.length).toBeGreaterThan(0);
    expect(config!.spawnInterval).toBeGreaterThan(0);
  });

  it('should return undefined for wave 0', () => {
    expect(getWaveConfig(0)).toBeUndefined();
  });
});

describe('generateEndlessWave', () => {
  it('should generate valid wave config for wave 101', () => {
    const config = generateEndlessWave(101);
    expect(config.enemies.length).toBeGreaterThan(0);
    expect(config.spawnInterval).toBeGreaterThan(0);
  });

  it('should increase enemy count with higher waves', () => {
    const wave110 = generateEndlessWave(110);
    const wave150 = generateEndlessWave(150);
    const count110 = wave110.enemies.reduce((sum, e) => sum + e.count, 0);
    const count150 = wave150.enemies.reduce((sum, e) => sum + e.count, 0);
    expect(count150).toBeGreaterThan(count110);
  });

  it('should cap enemy count at 100', () => {
    const wave200 = generateEndlessWave(200);
    const count = wave200.enemies.reduce((sum, e) => sum + e.count, 0);
    expect(count).toBeLessThanOrEqual(100);
  });

  it('should decrease spawn interval with higher waves', () => {
    const wave101 = generateEndlessWave(101);
    const wave120 = generateEndlessWave(120);
    expect(wave120.spawnInterval).toBeLessThan(wave101.spawnInterval);
  });

  it('should have a minimum spawn interval of 300ms', () => {
    const wave200 = generateEndlessWave(200);
    expect(wave200.spawnInterval).toBeGreaterThanOrEqual(300);
  });

  it('should have boss every 10 waves', () => {
    expect(generateEndlessWave(110).boss).toBeDefined();
    expect(generateEndlessWave(120).boss).toBeDefined();
    expect(generateEndlessWave(130).boss).toBeDefined();
  });

  it('should not have boss on non-10 waves', () => {
    expect(generateEndlessWave(101).boss).toBeUndefined();
    expect(generateEndlessWave(105).boss).toBeUndefined();
    expect(generateEndlessWave(115).boss).toBeUndefined();
  });

  it('all endless enemy IDs should exist in the database', () => {
    const config = generateEndlessWave(101);
    const enemies = DIGIMON_DATABASE.enemies;
    for (const entry of config.enemies) {
      expect(enemies[entry.id], `Endless enemy "${entry.id}" not in database`).toBeDefined();
    }
  });

  it('all endless boss IDs should exist in the database', () => {
    const enemies = DIGIMON_DATABASE.enemies;
    for (let w = 110; w <= 150; w += 10) {
      const config = generateEndlessWave(w);
      if (config.boss) {
        expect(enemies[config.boss], `Endless boss "${config.boss}" not in database`).toBeDefined();
      }
    }
  });

  it('endless waves should have at most 5 unique Digimon types', () => {
    for (let w = 101; w <= 130; w++) {
      const config = generateEndlessWave(w);
      expect(config.enemies.length, `Endless wave ${w} has more than 5 types`).toBeLessThanOrEqual(5);
    }
  });

  it('endless waves should have at least 5 units per Digimon type', () => {
    for (let w = 101; w <= 130; w++) {
      const config = generateEndlessWave(w);
      for (const entry of config.enemies) {
        expect(entry.count, `Endless wave ${w}, ${entry.id} has fewer than 5 units`).toBeGreaterThanOrEqual(5);
      }
    }
  });
});
