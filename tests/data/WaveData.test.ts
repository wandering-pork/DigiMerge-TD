import { describe, it, expect } from 'vitest';
import { WAVE_DATA } from '@/data/WaveData';
import { DIGIMON_DATABASE } from '@/data/DigimonDatabase';

describe('WaveData', () => {
  it('should have all 20 waves defined', () => {
    for (let i = 1; i <= 20; i++) {
      expect(WAVE_DATA[i], `Missing wave ${i}`).toBeDefined();
    }
  });

  it('every wave should have enemies array with at least one entry', () => {
    for (let i = 1; i <= 20; i++) {
      const wave = WAVE_DATA[i];
      expect(wave.enemies.length, `Wave ${i} has no enemies`).toBeGreaterThan(0);
    }
  });

  it('every wave should have a positive spawnInterval', () => {
    for (let i = 1; i <= 20; i++) {
      expect(WAVE_DATA[i].spawnInterval, `Wave ${i} spawnInterval`).toBeGreaterThan(0);
    }
  });

  it('wave 10 should have a boss', () => {
    expect(WAVE_DATA[10].boss).toBeDefined();
  });

  it('wave 20 should have a boss', () => {
    expect(WAVE_DATA[20].boss).toBeDefined();
  });

  it('all enemy IDs in waves should exist in the enemy database', () => {
    const enemies = DIGIMON_DATABASE.enemies;
    for (let i = 1; i <= 20; i++) {
      const wave = WAVE_DATA[i];
      for (const entry of wave.enemies) {
        expect(enemies[entry.id], `Wave ${i}: enemy "${entry.id}" not in database`).toBeDefined();
      }
    }
  });

  it('all boss IDs should exist in the enemy database', () => {
    const enemies = DIGIMON_DATABASE.enemies;
    for (let i = 1; i <= 20; i++) {
      const wave = WAVE_DATA[i];
      if (wave.boss) {
        expect(enemies[wave.boss], `Wave ${i}: boss "${wave.boss}" not in database`).toBeDefined();
      }
    }
  });

  it('early waves should have slower spawn intervals', () => {
    // Waves 1-10 should be >= 1800ms
    for (let i = 1; i <= 10; i++) {
      expect(WAVE_DATA[i].spawnInterval, `Wave ${i} should be slow`).toBeGreaterThanOrEqual(1800);
    }
  });

  it('enemy counts should increase over waves', () => {
    const totalEnemies = (wave: number) =>
      WAVE_DATA[wave].enemies.reduce((sum, e) => sum + e.count, 0);

    // Wave 1 should have fewer enemies than wave 20
    expect(totalEnemies(1)).toBeLessThan(totalEnemies(20));
  });

  it('each enemy entry should have positive count', () => {
    for (let i = 1; i <= 20; i++) {
      for (const entry of WAVE_DATA[i].enemies) {
        expect(entry.count, `Wave ${i}, ${entry.id} count`).toBeGreaterThan(0);
      }
    }
  });
});
