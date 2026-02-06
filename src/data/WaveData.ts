import { WaveConfig } from '@/types';

/**
 * Wave data for Phase 1 (Waves 1-20).
 *
 * Waves 1-5:   Tutorial - In-Training enemies with a few Rookies
 * Waves 6-10:  Rookie Introduction - mixed Rookie enemies, first boss at wave 10
 * Waves 11-15: Difficulty Ramp - larger groups, more variety
 * Waves 16-20: Phase 1 Finale - Champion previews, final boss at wave 20
 */
export const WAVE_DATA: Record<number, WaveConfig> = {
  // ========================================
  // Waves 1-5: Tutorial Waves
  // ========================================

  1: {
    enemies: [
      { id: 'enemy_koromon', count: 6 },
    ],
    spawnInterval: 2000,
  },

  2: {
    enemies: [
      { id: 'enemy_tsunomon', count: 4 },
      { id: 'enemy_tokomon', count: 3 },
    ],
    spawnInterval: 2000,
  },

  3: {
    enemies: [
      { id: 'enemy_pagumon', count: 6 },
      { id: 'enemy_agumon', count: 2 },
    ],
    spawnInterval: 2000,
  },

  4: {
    enemies: [
      { id: 'enemy_gigimon', count: 6 },
      { id: 'enemy_gabumon', count: 3 },
    ],
    spawnInterval: 2000,
  },

  5: {
    enemies: [
      { id: 'enemy_koromon', count: 2 },
      { id: 'enemy_tsunomon', count: 1 },
      { id: 'enemy_pagumon', count: 2 },
      { id: 'enemy_agumon', count: 2 },
      { id: 'enemy_gabumon', count: 2 },
      { id: 'enemy_goblimon', count: 1 },
    ],
    spawnInterval: 2000,
  },

  // ========================================
  // Waves 6-10: Rookie Introduction
  // ========================================

  6: {
    enemies: [
      { id: 'enemy_agumon', count: 4 },
      { id: 'enemy_gabumon', count: 3 },
      { id: 'enemy_goblimon', count: 3 },
    ],
    spawnInterval: 2000,
  },

  7: {
    enemies: [
      { id: 'enemy_elecmon', count: 6 },
      { id: 'enemy_impmon', count: 2 },
      { id: 'enemy_gazimon', count: 3 },
    ],
    spawnInterval: 2000,
  },

  8: {
    enemies: [
      { id: 'enemy_agumon', count: 4 },
      { id: 'enemy_goblimon', count: 4 },
      { id: 'enemy_patamon', count: 2 },
      { id: 'enemy_gotsumon', count: 2 },
    ],
    spawnInterval: 2000,
  },

  9: {
    enemies: [
      { id: 'enemy_agumon', count: 3 },
      { id: 'enemy_gabumon', count: 3 },
      { id: 'enemy_goblimon', count: 2 },
      { id: 'enemy_gazimon', count: 3 },
      { id: 'enemy_patamon', count: 1 },
      { id: 'enemy_gotsumon', count: 1 },
      { id: 'enemy_impmon', count: 1 },
    ],
    spawnInterval: 1800,
  },

  10: {
    enemies: [
      { id: 'enemy_agumon', count: 3 },
      { id: 'enemy_gabumon', count: 3 },
      { id: 'enemy_goblimon', count: 3 },
      { id: 'enemy_gazimon', count: 3 },
    ],
    spawnInterval: 1800,
    boss: 'boss_greymon',
    reward: 100,
  },

  // ========================================
  // Waves 11-15: Difficulty Ramp
  // ========================================

  11: {
    enemies: [
      { id: 'enemy_agumon', count: 3 },
      { id: 'enemy_gabumon', count: 3 },
      { id: 'enemy_gotsumon', count: 3 },
      { id: 'enemy_guilmon', count: 3 },
      { id: 'enemy_gazimon', count: 2 },
    ],
    spawnInterval: 1800,
  },

  12: {
    enemies: [
      { id: 'enemy_impmon', count: 4 },
      { id: 'enemy_gazimon', count: 4 },
      { id: 'enemy_goblimon', count: 3 },
      { id: 'enemy_agumon', count: 4 },
    ],
    spawnInterval: 1800,
  },

  13: {
    enemies: [
      { id: 'enemy_patamon', count: 4 },
      { id: 'enemy_biyomon', count: 3 },
      { id: 'enemy_agumon', count: 3 },
      { id: 'enemy_gotsumon', count: 3 },
      { id: 'enemy_guilmon', count: 3 },
    ],
    spawnInterval: 1800,
  },

  14: {
    enemies: [
      { id: 'enemy_agumon', count: 3 },
      { id: 'enemy_gabumon', count: 2 },
      { id: 'enemy_patamon', count: 2 },
      { id: 'enemy_gotsumon', count: 3 },
      { id: 'enemy_impmon', count: 3 },
      { id: 'enemy_gazimon', count: 4 },
    ],
    spawnInterval: 1800,
  },

  15: {
    enemies: [
      { id: 'enemy_gotsumon', count: 4 },
      { id: 'enemy_guilmon', count: 3 },
      { id: 'enemy_impmon', count: 4 },
      { id: 'enemy_gazimon', count: 3 },
      { id: 'enemy_agumon', count: 4 },
    ],
    spawnInterval: 1800,
  },

  // ========================================
  // Waves 16-20: Phase 1 Finale (Champion Preview)
  // ========================================

  16: {
    enemies: [
      { id: 'enemy_agumon', count: 4 },
      { id: 'enemy_gabumon', count: 3 },
      { id: 'enemy_goblimon', count: 3 },
      { id: 'enemy_patamon', count: 2 },
      { id: 'enemy_gotsumon', count: 2 },
      { id: 'enemy_greymon', count: 2 },
      { id: 'enemy_impmon', count: 2 },
    ],
    spawnInterval: 1800,
  },

  17: {
    enemies: [
      { id: 'enemy_agumon', count: 3 },
      { id: 'enemy_gabumon', count: 3 },
      { id: 'enemy_goblimon', count: 3 },
      { id: 'enemy_greymon', count: 3 },
      { id: 'enemy_ogremon', count: 1 },
      { id: 'enemy_impmon', count: 3 },
      { id: 'enemy_gazimon', count: 3 },
    ],
    spawnInterval: 1800,
  },

  18: {
    enemies: [
      { id: 'enemy_greymon', count: 4 },
      { id: 'enemy_ogremon', count: 2 },
      { id: 'enemy_agumon', count: 4 },
      { id: 'enemy_gabumon', count: 4 },
      { id: 'enemy_gotsumon', count: 3 },
      { id: 'enemy_impmon', count: 3 },
    ],
    spawnInterval: 1800,
  },

  19: {
    enemies: [
      { id: 'enemy_greymon', count: 5 },
      { id: 'enemy_ogremon', count: 3 },
      { id: 'enemy_agumon', count: 3 },
      { id: 'enemy_gabumon', count: 3 },
      { id: 'enemy_goblimon', count: 4 },
      { id: 'enemy_impmon', count: 4 },
    ],
    spawnInterval: 1800,
  },

  20: {
    enemies: [
      { id: 'enemy_greymon', count: 5 },
      { id: 'enemy_ogremon', count: 3 },
      { id: 'enemy_gabumon', count: 4 },
      { id: 'enemy_goblimon', count: 3 },
      { id: 'enemy_impmon', count: 3 },
    ],
    spawnInterval: 1800,
    boss: 'boss_greymon_evolved',
    reward: 200,
  },
};
