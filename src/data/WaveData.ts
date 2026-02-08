import { WaveConfig } from '@/types';

/**
 * Wave data for Phases 1-5 (Waves 1-100).
 *
 * Phase 1 (Waves 1-20): In-Training + Rookie enemies
 *   Waves 1-5:   Tutorial waves
 *   Waves 6-10:  Rookie introduction, boss at wave 10
 *   Waves 11-15: Difficulty ramp
 *   Waves 16-20: Phase 1 finale with Champion previews, phase boss at wave 20
 *
 * Phase 2 (Waves 21-40): Champion enemies
 *   Waves 21-25: Champion introduction
 *   Waves 26-30: Type variety, mini-boss Devimon at wave 30
 *   Waves 31-35: Mixed pressure with Ultimate previews
 *   Waves 36-40: Phase 2 finale with Ultimates, phase boss Myotismon at wave 40
 *
 * Phase 3 (Waves 41-60): Ultimate enemies
 *   Waves 41-45: Ultimate introduction
 *   Waves 46-50: Special types (splitters, flyers, speedsters), mini-boss SkullGreymon at wave 50
 *   Waves 51-55: Intensifying combat
 *   Waves 56-60: Phase 3 finale, phase boss VenomMyotismon at wave 60
 *
 * Phase 4 (Waves 61-80): Mega enemies
 *   Waves 61-65: Mega introduction
 *   Waves 66-70: Intense combat (splitters, all-tanks, speed rush), mini-boss Machinedramon at wave 70
 *   Waves 71-75: High pressure
 *   Waves 76-80: Phase 4 finale with Ultra previews, phase boss Omegamon at wave 80
 *
 * Phase 5 (Waves 81-100): Mega + Ultra enemies
 *   Waves 81-85: Ultra era
 *   Waves 86-90: Peak difficulty, mini-boss Omegamon Zwart at wave 90
 *   Waves 91-95: Survival mode
 *   Waves 96-100: Final stretch, final boss Apocalymon at wave 100
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
      { id: 'enemy_tsunomon', count: 5 },
      { id: 'enemy_tokomon', count: 5 },
    ],
    spawnInterval: 2000,
  },

  3: {
    enemies: [
      { id: 'enemy_pagumon', count: 6 },
      { id: 'enemy_agumon', count: 5 },
    ],
    spawnInterval: 2000,
  },

  4: {
    enemies: [
      { id: 'enemy_gigimon', count: 6 },
      { id: 'enemy_gabumon', count: 5 },
    ],
    spawnInterval: 2000,
  },

  5: {
    enemies: [
      { id: 'enemy_koromon', count: 5 },
      { id: 'enemy_pagumon', count: 5 },
      { id: 'enemy_agumon', count: 5 },
    ],
    spawnInterval: 2000,
  },

  // ========================================
  // Waves 6-10: Rookie Introduction
  // ========================================

  6: {
    enemies: [
      { id: 'enemy_agumon', count: 5 },
      { id: 'enemy_gabumon', count: 5 },
    ],
    spawnInterval: 2000,
  },

  7: {
    enemies: [
      { id: 'enemy_elecmon', count: 6 },
      { id: 'enemy_gazimon', count: 5 },
    ],
    spawnInterval: 2000,
  },

  8: {
    enemies: [
      { id: 'enemy_agumon', count: 6 },
      { id: 'enemy_goblimon', count: 6 },
    ],
    spawnInterval: 2000,
  },

  9: {
    enemies: [
      { id: 'enemy_agumon', count: 5 },
      { id: 'enemy_gabumon', count: 5 },
      { id: 'enemy_gazimon', count: 5 },
    ],
    spawnInterval: 1800,
  },

  10: {
    enemies: [
      { id: 'enemy_agumon', count: 6 },
      { id: 'enemy_gabumon', count: 6 },
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
      { id: 'enemy_agumon', count: 5 },
      { id: 'enemy_gabumon', count: 5 },
      { id: 'enemy_guilmon', count: 5 },
    ],
    spawnInterval: 1800,
  },

  12: {
    enemies: [
      { id: 'enemy_impmon', count: 5 },
      { id: 'enemy_gazimon', count: 5 },
      { id: 'enemy_agumon', count: 5 },
    ],
    spawnInterval: 1800,
  },

  13: {
    enemies: [
      { id: 'enemy_patamon', count: 5 },
      { id: 'enemy_biyomon', count: 5 },
      { id: 'enemy_guilmon', count: 6 },
    ],
    spawnInterval: 1800,
  },

  14: {
    enemies: [
      { id: 'enemy_agumon', count: 6 },
      { id: 'enemy_gotsumon', count: 6 },
      { id: 'enemy_gazimon', count: 6 },
    ],
    spawnInterval: 1800,
  },

  15: {
    enemies: [
      { id: 'enemy_gotsumon', count: 6 },
      { id: 'enemy_impmon', count: 6 },
      { id: 'enemy_agumon', count: 6 },
    ],
    spawnInterval: 1800,
  },

  // ========================================
  // Waves 16-20: Phase 1 Finale (Champion Preview)
  // ========================================

  16: {
    enemies: [
      { id: 'enemy_agumon', count: 5 },
      { id: 'enemy_goblimon', count: 5 },
      { id: 'enemy_greymon', count: 5 },
      { id: 'enemy_impmon', count: 5 },
    ],
    spawnInterval: 1800,
  },

  17: {
    enemies: [
      { id: 'enemy_agumon', count: 5 },
      { id: 'enemy_gabumon', count: 5 },
      { id: 'enemy_greymon', count: 5 },
      { id: 'enemy_gazimon', count: 5 },
    ],
    spawnInterval: 1800,
  },

  18: {
    enemies: [
      { id: 'enemy_greymon', count: 6 },
      { id: 'enemy_agumon', count: 5 },
      { id: 'enemy_gabumon', count: 5 },
      { id: 'enemy_impmon', count: 5 },
    ],
    spawnInterval: 1800,
  },

  19: {
    enemies: [
      { id: 'enemy_greymon', count: 6 },
      { id: 'enemy_ogremon', count: 5 },
      { id: 'enemy_goblimon', count: 5 },
      { id: 'enemy_impmon', count: 6 },
    ],
    spawnInterval: 1800,
  },

  20: {
    enemies: [
      { id: 'enemy_greymon', count: 6 },
      { id: 'enemy_ogremon', count: 5 },
      { id: 'enemy_gabumon', count: 5 },
    ],
    spawnInterval: 1800,
    boss: 'boss_greymon_evolved',
    reward: 200,
  },

  // ========================================
  // Phase 2: Waves 21-40 (Champion Enemies)
  // ========================================

  // Waves 21-25: Champion Introduction
  21: {
    enemies: [
      { id: 'enemy_greymon', count: 5 },
      { id: 'enemy_garurumon', count: 5 },
      { id: 'enemy_leomon', count: 5 },
    ],
    spawnInterval: 1500,
  },

  22: {
    enemies: [
      { id: 'enemy_greymon', count: 5 },
      { id: 'enemy_garurumon', count: 5 },
      { id: 'enemy_tyrannomon', count: 5 },
    ],
    spawnInterval: 1500,
  },

  23: {
    enemies: [
      { id: 'enemy_greymon', count: 5 },
      { id: 'enemy_garurumon', count: 5 },
      { id: 'enemy_birdramon', count: 5 },
    ],
    spawnInterval: 1500,
  },

  24: {
    enemies: [
      { id: 'enemy_greymon', count: 5 },
      { id: 'enemy_tyrannomon', count: 5 },
      { id: 'enemy_bakemon', count: 5 },
      { id: 'enemy_meramon', count: 5 },
    ],
    spawnInterval: 1500,
  },

  25: {
    enemies: [
      { id: 'enemy_ogremon', count: 7 },
      { id: 'enemy_kuwagamon', count: 5 },
      { id: 'enemy_greymon', count: 5 },
      { id: 'enemy_tyrannomon', count: 5 },
    ],
    spawnInterval: 1500,
  },

  // Waves 26-30: Type Variety
  26: {
    enemies: [
      { id: 'enemy_bakemon', count: 10 },
      { id: 'enemy_numemon', count: 10 },
    ],
    spawnInterval: 1500,
  },

  27: {
    enemies: [
      { id: 'enemy_monochromon', count: 6 },
      { id: 'enemy_darktyrannomon', count: 6 },
      { id: 'enemy_ogremon', count: 6 },
    ],
    spawnInterval: 1500,
  },

  28: {
    enemies: [
      { id: 'enemy_birdramon', count: 8 },
      { id: 'enemy_airdramon', count: 8 },
      { id: 'enemy_kabuterimon', count: 6 },
    ],
    spawnInterval: 1500,
  },

  29: {
    enemies: [
      { id: 'enemy_meramon', count: 8 },
      { id: 'enemy_kuwagamon', count: 8 },
      { id: 'enemy_bakemon', count: 5 },
    ],
    spawnInterval: 1500,
  },

  30: {
    enemies: [
      { id: 'enemy_greymon', count: 5 },
      { id: 'enemy_garurumon', count: 5 },
      { id: 'enemy_ogremon', count: 5 },
    ],
    spawnInterval: 1500,
    boss: 'boss_devimon',
    reward: 150,
  },

  // Waves 31-35: Mixed Pressure
  31: {
    enemies: [
      { id: 'enemy_greymon', count: 6 },
      { id: 'enemy_garurumon', count: 6 },
      { id: 'enemy_ogremon', count: 5 },
      { id: 'enemy_leomon', count: 5 },
    ],
    spawnInterval: 1500,
  },

  32: {
    enemies: [
      { id: 'enemy_togemon', count: 8 },
      { id: 'enemy_greymon', count: 5 },
      { id: 'enemy_garurumon', count: 5 },
      { id: 'enemy_leomon', count: 5 },
    ],
    spawnInterval: 1500,
  },

  33: {
    enemies: [
      { id: 'enemy_guardromon', count: 8 },
      { id: 'enemy_monochromon', count: 8 },
      { id: 'enemy_greymon', count: 5 },
    ],
    spawnInterval: 1500,
  },

  34: {
    enemies: [
      { id: 'enemy_meramon', count: 6 },
      { id: 'enemy_kuwagamon', count: 6 },
      { id: 'enemy_airdramon', count: 5 },
      { id: 'enemy_bakemon', count: 5 },
    ],
    spawnInterval: 1500,
  },

  35: {
    enemies: [
      { id: 'enemy_greymon', count: 6 },
      { id: 'enemy_ogremon', count: 5 },
      { id: 'enemy_meramon', count: 5 },
      { id: 'enemy_birdramon', count: 5 },
      { id: 'enemy_bakemon', count: 5 },
    ],
    spawnInterval: 1500,
  },

  // Waves 36-40: Phase 2 Finale (Ultimate Preview)
  36: {
    enemies: [
      { id: 'enemy_greymon', count: 5 },
      { id: 'enemy_ogremon', count: 5 },
      { id: 'enemy_metalgreymon', count: 5 },
      { id: 'enemy_weregarurumon', count: 5 },
      { id: 'enemy_leomon', count: 5 },
    ],
    spawnInterval: 1500,
  },

  37: {
    enemies: [
      { id: 'enemy_ogremon', count: 5 },
      { id: 'enemy_metalgreymon', count: 7 },
      { id: 'enemy_weregarurumon', count: 7 },
      { id: 'enemy_andromon', count: 6 },
    ],
    spawnInterval: 1500,
  },

  38: {
    enemies: [
      { id: 'enemy_metalgreymon', count: 7 },
      { id: 'enemy_weregarurumon', count: 7 },
      { id: 'enemy_andromon', count: 6 },
      { id: 'enemy_mamemon', count: 6 },
    ],
    spawnInterval: 1500,
  },

  39: {
    enemies: [
      { id: 'enemy_metalgreymon', count: 8 },
      { id: 'enemy_weregarurumon', count: 8 },
      { id: 'enemy_andromon', count: 6 },
      { id: 'enemy_mamemon', count: 6 },
    ],
    spawnInterval: 1500,
  },

  40: {
    enemies: [
      { id: 'enemy_metalgreymon', count: 6 },
      { id: 'enemy_weregarurumon', count: 6 },
      { id: 'enemy_andromon', count: 5 },
      { id: 'enemy_mamemon', count: 5 },
    ],
    spawnInterval: 1500,
    boss: 'boss_myotismon',
    reward: 300,
  },

  // ========================================
  // Phase 3: Waves 41-60 (Ultimate Enemies)
  // ========================================

  // Waves 41-45: Ultimate Introduction
  41: {
    enemies: [
      { id: 'enemy_metalgreymon', count: 4 },
      { id: 'enemy_zudomon', count: 4 },
      { id: 'enemy_megaseadramon', count: 5 },
      { id: 'enemy_myotismon', count: 5 },
    ],
    spawnInterval: 1400,
  },

  42: {
    enemies: [
      { id: 'enemy_metalgreymon', count: 4 },
      { id: 'enemy_megaseadramon', count: 4 },
      { id: 'enemy_myotismon', count: 4 },
      { id: 'enemy_zudomon', count: 4 },
      { id: 'enemy_skullgreymon', count: 4 },
    ],
    spawnInterval: 1400,
  },

  43: {
    enemies: [
      { id: 'enemy_metalgreymon', count: 5 },
      { id: 'enemy_megaseadramon', count: 5 },
      { id: 'enemy_megakabuterimon', count: 5 },
      { id: 'enemy_garudamon', count: 5 },
    ],
    spawnInterval: 1400,
  },

  44: {
    enemies: [
      { id: 'enemy_metalgreymon', count: 4 },
      { id: 'enemy_myotismon', count: 4 },
      { id: 'enemy_skullgreymon', count: 4 },
      { id: 'enemy_megakabuterimon', count: 4 },
      { id: 'enemy_ladydevimon', count: 4 },
    ],
    spawnInterval: 1400,
  },

  45: {
    enemies: [
      { id: 'enemy_andromon', count: 7 },
      { id: 'enemy_skullgreymon', count: 7 },
      { id: 'enemy_metalgreymon', count: 6 },
    ],
    spawnInterval: 1400,
  },

  // Waves 46-50: Special Types
  46: {
    enemies: [
      { id: 'enemy_mamemon', count: 10 },
    ],
    spawnInterval: 1400,
  },

  47: {
    enemies: [
      { id: 'enemy_garudamon', count: 6 },
      { id: 'enemy_megakabuterimon', count: 6 },
      { id: 'enemy_megadramon', count: 6 },
    ],
    spawnInterval: 1400,
  },

  48: {
    enemies: [
      { id: 'enemy_angewomon', count: 5 },
      { id: 'enemy_skullgreymon', count: 5 },
      { id: 'enemy_zudomon', count: 5 },
      { id: 'enemy_gigadramon', count: 4 },
      { id: 'enemy_warumonzaemon', count: 4 },
    ],
    spawnInterval: 1400,
  },

  49: {
    enemies: [
      { id: 'enemy_weregarurumon', count: 8 },
      { id: 'enemy_bluemeramon', count: 8 },
      { id: 'enemy_ladydevimon', count: 8 },
    ],
    spawnInterval: 1400,
  },

  50: {
    enemies: [
      { id: 'enemy_metalgreymon', count: 5 },
      { id: 'enemy_myotismon', count: 4 },
      { id: 'enemy_skullgreymon', count: 4 },
      { id: 'enemy_megakabuterimon', count: 4 },
      { id: 'enemy_andromon', count: 4 },
    ],
    spawnInterval: 1400,
    boss: 'boss_skullgreymon',
    reward: 350,
  },

  // Waves 51-55: Intensifying
  51: {
    enemies: [
      { id: 'enemy_metalgreymon', count: 5 },
      { id: 'enemy_myotismon', count: 5 },
      { id: 'enemy_weregarurumon', count: 5 },
      { id: 'enemy_megadramon', count: 4 },
      { id: 'enemy_skullgreymon', count: 4 },
    ],
    spawnInterval: 1400,
  },

  52: {
    enemies: [
      { id: 'enemy_skullgreymon', count: 6 },
      { id: 'enemy_andromon', count: 6 },
      { id: 'enemy_zudomon', count: 6 },
      { id: 'enemy_gigadramon', count: 5 },
    ],
    spawnInterval: 1400,
  },

  53: {
    enemies: [
      { id: 'enemy_weregarurumon', count: 8 },
      { id: 'enemy_bluemeramon', count: 8 },
      { id: 'enemy_ladydevimon', count: 8 },
    ],
    spawnInterval: 1400,
  },

  54: {
    enemies: [
      { id: 'enemy_metalgreymon', count: 5 },
      { id: 'enemy_myotismon', count: 5 },
      { id: 'enemy_angewomon', count: 5 },
      { id: 'enemy_mamemon', count: 5 },
      { id: 'enemy_warumonzaemon', count: 5 },
    ],
    spawnInterval: 1400,
  },

  55: {
    enemies: [
      { id: 'enemy_skullgreymon', count: 6 },
      { id: 'enemy_gigadramon', count: 6 },
      { id: 'enemy_andromon', count: 6 },
      { id: 'enemy_warumonzaemon', count: 6 },
    ],
    spawnInterval: 1400,
  },

  // Waves 56-60: Phase 3 Finale (Mega Preview)
  56: {
    enemies: [
      { id: 'enemy_metalgreymon', count: 5 },
      { id: 'enemy_myotismon', count: 5 },
      { id: 'enemy_skullgreymon', count: 5 },
      { id: 'enemy_weregarurumon', count: 5 },
      { id: 'enemy_megakabuterimon', count: 5 },
    ],
    spawnInterval: 1400,
  },

  57: {
    enemies: [
      { id: 'enemy_metalgreymon', count: 5 },
      { id: 'enemy_myotismon', count: 5 },
      { id: 'enemy_skullgreymon', count: 5 },
      { id: 'enemy_andromon', count: 5 },
      { id: 'enemy_mamemon', count: 5 },
    ],
    spawnInterval: 1400,
  },

  58: {
    enemies: [
      { id: 'enemy_metalgreymon', count: 6 },
      { id: 'enemy_skullgreymon', count: 6 },
      { id: 'enemy_andromon', count: 5 },
      { id: 'enemy_mamemon', count: 5 },
      { id: 'enemy_metalmamemon', count: 5 },
    ],
    spawnInterval: 1400,
  },

  59: {
    enemies: [
      { id: 'enemy_metalgreymon', count: 6 },
      { id: 'enemy_skullgreymon', count: 6 },
      { id: 'enemy_andromon', count: 5 },
      { id: 'enemy_ladydevimon', count: 5 },
      { id: 'enemy_megadramon', count: 5 },
    ],
    spawnInterval: 1400,
  },

  60: {
    enemies: [
      { id: 'enemy_skullgreymon', count: 5 },
      { id: 'enemy_andromon', count: 5 },
      { id: 'enemy_mamemon', count: 4 },
      { id: 'enemy_metalmamemon', count: 4 },
      { id: 'enemy_megadramon', count: 5 },
    ],
    spawnInterval: 1400,
    boss: 'boss_venommyotismon',
    reward: 600,
  },

  // ========================================
  // Phase 4: Waves 61-80 (Mega Enemies)
  // ========================================

  // Waves 61-65: Mega Introduction
  61: {
    enemies: [
      { id: 'enemy_wargreymon', count: 5 },
      { id: 'enemy_metalgarurumon', count: 5 },
      { id: 'enemy_piedmon', count: 5 },
      { id: 'enemy_metalseadramon', count: 5 },
      { id: 'enemy_phoenixmon', count: 5 },
    ],
    spawnInterval: 1200,
  },

  62: {
    enemies: [
      { id: 'enemy_wargreymon', count: 5 },
      { id: 'enemy_metalgarurumon', count: 5 },
      { id: 'enemy_piedmon', count: 5 },
      { id: 'enemy_machinedramon', count: 4 },
      { id: 'enemy_blackwargreymon', count: 4 },
    ],
    spawnInterval: 1200,
  },

  63: {
    enemies: [
      { id: 'enemy_wargreymon', count: 5 },
      { id: 'enemy_phoenixmon', count: 5 },
      { id: 'enemy_herculeskabuterimon', count: 5 },
      { id: 'enemy_piedmon', count: 5 },
      { id: 'enemy_boltmon', count: 5 },
    ],
    spawnInterval: 1200,
  },

  64: {
    enemies: [
      { id: 'enemy_wargreymon', count: 5 },
      { id: 'enemy_saberleomon', count: 5 },
      { id: 'enemy_beelzemon', count: 5 },
      { id: 'enemy_puppetmon', count: 5 },
      { id: 'enemy_piedmon', count: 5 },
    ],
    spawnInterval: 1200,
  },

  65: {
    enemies: [
      { id: 'enemy_wargreymon', count: 6 },
      { id: 'enemy_metalgarurumon', count: 6 },
      { id: 'enemy_machinedramon', count: 5 },
      { id: 'enemy_boltmon', count: 5 },
      { id: 'enemy_piedmon', count: 5 },
    ],
    spawnInterval: 1200,
  },

  // Waves 66-70: Intense Combat
  66: {
    enemies: [
      { id: 'enemy_diaboromon', count: 7 },
    ],
    spawnInterval: 1200,
  },

  67: {
    enemies: [
      { id: 'enemy_machinedramon', count: 7 },
      { id: 'enemy_piedmon', count: 7 },
      { id: 'enemy_leviamon', count: 5 },
      { id: 'enemy_cherubimon', count: 5 },
    ],
    spawnInterval: 1200,
  },

  68: {
    enemies: [
      { id: 'enemy_saberleomon', count: 7 },
      { id: 'enemy_beelzemon', count: 7 },
      { id: 'enemy_puppetmon', count: 7 },
      { id: 'enemy_metalgarurumon', count: 6 },
    ],
    spawnInterval: 1200,
  },

  69: {
    enemies: [
      { id: 'enemy_wargreymon', count: 6 },
      { id: 'enemy_metalgarurumon', count: 6 },
      { id: 'enemy_machinedramon', count: 6 },
      { id: 'enemy_saberleomon', count: 6 },
      { id: 'enemy_diaboromon', count: 6 },
    ],
    spawnInterval: 1200,
  },

  70: {
    enemies: [
      { id: 'enemy_wargreymon', count: 6 },
      { id: 'enemy_metalgarurumon', count: 6 },
      { id: 'enemy_machinedramon', count: 5 },
      { id: 'enemy_saberleomon', count: 5 },
      { id: 'enemy_phoenixmon', count: 5 },
    ],
    spawnInterval: 1200,
    boss: 'boss_machinedramon',
    reward: 500,
  },

  // Waves 71-75: High Pressure
  71: {
    enemies: [
      { id: 'enemy_wargreymon', count: 6 },
      { id: 'enemy_piedmon', count: 6 },
      { id: 'enemy_saberleomon', count: 6 },
      { id: 'enemy_beelzemon', count: 6 },
      { id: 'enemy_puppetmon', count: 5 },
    ],
    spawnInterval: 1200,
  },

  72: {
    enemies: [
      { id: 'enemy_machinedramon', count: 7 },
      { id: 'enemy_blackwargreymon', count: 6 },
      { id: 'enemy_leviamon', count: 6 },
      { id: 'enemy_boltmon', count: 5 },
      { id: 'enemy_cherubimon', count: 5 },
    ],
    spawnInterval: 1200,
  },

  73: {
    enemies: [
      { id: 'enemy_wargreymon', count: 6 },
      { id: 'enemy_metalgarurumon', count: 6 },
      { id: 'enemy_machinedramon', count: 6 },
      { id: 'enemy_beelzemon', count: 6 },
      { id: 'enemy_diaboromon', count: 6 },
    ],
    spawnInterval: 1200,
  },

  74: {
    enemies: [
      { id: 'enemy_machinedramon', count: 7 },
      { id: 'enemy_puppetmon', count: 7 },
      { id: 'enemy_leviamon', count: 7 },
      { id: 'enemy_blackwargreymon', count: 6 },
      { id: 'enemy_cherubimon', count: 5 },
    ],
    spawnInterval: 1200,
  },

  75: {
    enemies: [
      { id: 'enemy_wargreymon', count: 7 },
      { id: 'enemy_metalgarurumon', count: 7 },
      { id: 'enemy_machinedramon', count: 7 },
      { id: 'enemy_saberleomon', count: 6 },
      { id: 'enemy_diaboromon', count: 6 },
    ],
    spawnInterval: 1200,
  },

  // Waves 76-80: Phase 4 Finale (Ultra Preview)
  76: {
    enemies: [
      { id: 'enemy_wargreymon', count: 7 },
      { id: 'enemy_metalgarurumon', count: 7 },
      { id: 'enemy_piedmon', count: 7 },
      { id: 'enemy_machinedramon', count: 6 },
      { id: 'enemy_beelzemon', count: 6 },
    ],
    spawnInterval: 1200,
  },

  77: {
    enemies: [
      { id: 'enemy_wargreymon', count: 7 },
      { id: 'enemy_machinedramon', count: 7 },
      { id: 'enemy_saberleomon', count: 7 },
      { id: 'enemy_omegamon', count: 6 },
      { id: 'enemy_omegamon_zwart', count: 6 },
    ],
    spawnInterval: 1200,
  },

  78: {
    enemies: [
      { id: 'enemy_omegamon', count: 7 },
      { id: 'enemy_omegamon_zwart', count: 7 },
      { id: 'enemy_imperialdramon_dm', count: 7 },
      { id: 'enemy_saberleomon', count: 7 },
      { id: 'enemy_phoenixmon', count: 6 },
    ],
    spawnInterval: 1200,
  },

  79: {
    enemies: [
      { id: 'enemy_omegamon', count: 8 },
      { id: 'enemy_omegamon_zwart', count: 8 },
      { id: 'enemy_imperialdramon_dm', count: 7 },
      { id: 'enemy_armageddemon', count: 7 },
      { id: 'enemy_machinedramon', count: 7 },
    ],
    spawnInterval: 1200,
  },

  80: {
    enemies: [
      { id: 'enemy_omegamon', count: 6 },
      { id: 'enemy_omegamon_zwart', count: 6 },
      { id: 'enemy_imperialdramon_dm', count: 6 },
      { id: 'enemy_armageddemon', count: 6 },
      { id: 'enemy_machinedramon', count: 6 },
    ],
    spawnInterval: 1200,
    boss: 'boss_omegamon',
    reward: 750,
  },

  // ========================================
  // Phase 5: Waves 81-100 (Mega + Ultra)
  // ========================================

  // Waves 81-85: Ultra Era
  81: {
    enemies: [
      { id: 'enemy_wargreymon', count: 7 },
      { id: 'enemy_machinedramon', count: 7 },
      { id: 'enemy_omegamon', count: 6 },
      { id: 'enemy_omegamon_zwart', count: 6 },
      { id: 'enemy_boltmon', count: 6 },
    ],
    spawnInterval: 1000,
  },

  82: {
    enemies: [
      { id: 'enemy_omegamon', count: 7 },
      { id: 'enemy_omegamon_zwart', count: 7 },
      { id: 'enemy_imperialdramon_dm', count: 7 },
      { id: 'enemy_machinedramon', count: 6 },
      { id: 'enemy_blackwargreymon', count: 6 },
    ],
    spawnInterval: 1000,
  },

  83: {
    enemies: [
      { id: 'enemy_omegamon', count: 7 },
      { id: 'enemy_omegamon_zwart', count: 7 },
      { id: 'enemy_imperialdramon_dm', count: 7 },
      { id: 'enemy_machinedramon', count: 7 },
      { id: 'enemy_armageddemon', count: 7 },
    ],
    spawnInterval: 1000,
  },

  84: {
    enemies: [
      { id: 'enemy_omegamon', count: 7 },
      { id: 'enemy_omegamon_zwart', count: 7 },
      { id: 'enemy_imperialdramon_dm', count: 7 },
      { id: 'enemy_armageddemon', count: 7 },
      { id: 'enemy_millenniummon', count: 7 },
    ],
    spawnInterval: 1000,
  },

  85: {
    enemies: [
      { id: 'enemy_omegamon', count: 8 },
      { id: 'enemy_omegamon_zwart', count: 8 },
      { id: 'enemy_imperialdramon_dm', count: 7 },
      { id: 'enemy_armageddemon', count: 7 },
      { id: 'enemy_millenniummon', count: 7 },
    ],
    spawnInterval: 1000,
  },

  // Waves 86-90: Peak Difficulty
  86: {
    enemies: [
      { id: 'enemy_omegamon', count: 8 },
      { id: 'enemy_omegamon_zwart', count: 8 },
      { id: 'enemy_imperialdramon_dm', count: 7 },
      { id: 'enemy_armageddemon', count: 7 },
      { id: 'enemy_millenniummon', count: 7 },
    ],
    spawnInterval: 1000,
  },

  87: {
    enemies: [
      { id: 'enemy_omegamon', count: 8 },
      { id: 'enemy_omegamon_zwart', count: 8 },
      { id: 'enemy_imperialdramon_dm', count: 8 },
      { id: 'enemy_armageddemon', count: 7 },
      { id: 'enemy_millenniummon', count: 7 },
    ],
    spawnInterval: 1000,
  },

  88: {
    enemies: [
      { id: 'enemy_armageddemon', count: 9 },
      { id: 'enemy_millenniummon', count: 9 },
      { id: 'enemy_omegamon', count: 8 },
      { id: 'enemy_omegamon_zwart', count: 7 },
      { id: 'enemy_imperialdramon_dm', count: 7 },
    ],
    spawnInterval: 1000,
  },

  89: {
    enemies: [
      { id: 'enemy_omegamon', count: 8 },
      { id: 'enemy_omegamon_zwart', count: 8 },
      { id: 'enemy_imperialdramon_dm', count: 8 },
      { id: 'enemy_armageddemon', count: 8 },
      { id: 'enemy_millenniummon', count: 8 },
    ],
    spawnInterval: 1000,
  },

  90: {
    enemies: [
      { id: 'enemy_omegamon', count: 7 },
      { id: 'enemy_omegamon_zwart', count: 7 },
      { id: 'enemy_imperialdramon_dm', count: 7 },
      { id: 'enemy_armageddemon', count: 7 },
      { id: 'enemy_millenniummon', count: 7 },
    ],
    spawnInterval: 1000,
    boss: 'boss_omegamon_zwart',
    reward: 750,
  },

  // Waves 91-95: Survival Mode
  91: {
    enemies: [
      { id: 'enemy_omegamon', count: 8 },
      { id: 'enemy_omegamon_zwart', count: 8 },
      { id: 'enemy_imperialdramon_dm', count: 8 },
      { id: 'enemy_armageddemon', count: 8 },
      { id: 'enemy_millenniummon', count: 7 },
    ],
    spawnInterval: 1000,
  },

  92: {
    enemies: [
      { id: 'enemy_armageddemon', count: 10 },
      { id: 'enemy_millenniummon', count: 9 },
      { id: 'enemy_machinedramon', count: 7 },
      { id: 'enemy_omegamon', count: 7 },
      { id: 'enemy_omegamon_zwart', count: 6 },
    ],
    spawnInterval: 1000,
  },

  93: {
    enemies: [
      { id: 'enemy_omegamon', count: 8 },
      { id: 'enemy_omegamon_zwart', count: 8 },
      { id: 'enemy_imperialdramon_dm', count: 8 },
      { id: 'enemy_armageddemon', count: 8 },
      { id: 'enemy_millenniummon', count: 8 },
    ],
    spawnInterval: 1000,
  },

  94: {
    enemies: [
      { id: 'enemy_omegamon', count: 9 },
      { id: 'enemy_omegamon_zwart', count: 9 },
      { id: 'enemy_imperialdramon_dm', count: 8 },
      { id: 'enemy_armageddemon', count: 8 },
      { id: 'enemy_millenniummon', count: 8 },
    ],
    spawnInterval: 1000,
  },

  95: {
    enemies: [
      { id: 'enemy_omegamon', count: 9 },
      { id: 'enemy_omegamon_zwart', count: 9 },
      { id: 'enemy_imperialdramon_dm', count: 9 },
      { id: 'enemy_armageddemon', count: 9 },
      { id: 'enemy_millenniummon', count: 9 },
    ],
    spawnInterval: 1000,
  },

  // Waves 96-100: Final Stretch
  96: {
    enemies: [
      { id: 'enemy_omegamon', count: 9 },
      { id: 'enemy_omegamon_zwart', count: 9 },
      { id: 'enemy_imperialdramon_dm', count: 8 },
      { id: 'enemy_armageddemon', count: 8 },
      { id: 'enemy_millenniummon', count: 8 },
    ],
    spawnInterval: 1000,
  },

  97: {
    enemies: [
      { id: 'enemy_omegamon', count: 9 },
      { id: 'enemy_omegamon_zwart', count: 9 },
      { id: 'enemy_imperialdramon_dm', count: 9 },
      { id: 'enemy_armageddemon', count: 9 },
      { id: 'enemy_millenniummon', count: 8 },
    ],
    spawnInterval: 1000,
  },

  98: {
    enemies: [
      { id: 'enemy_armageddemon', count: 10 },
      { id: 'enemy_millenniummon', count: 10 },
      { id: 'enemy_omegamon', count: 8 },
      { id: 'enemy_omegamon_zwart', count: 8 },
      { id: 'enemy_imperialdramon_dm', count: 8 },
    ],
    spawnInterval: 1000,
  },

  99: {
    enemies: [
      { id: 'enemy_omegamon', count: 10 },
      { id: 'enemy_omegamon_zwart', count: 10 },
      { id: 'enemy_imperialdramon_dm', count: 9 },
      { id: 'enemy_armageddemon', count: 9 },
      { id: 'enemy_millenniummon', count: 9 },
    ],
    spawnInterval: 1000,
  },

  100: {
    enemies: [
      { id: 'enemy_omegamon', count: 8 },
      { id: 'enemy_omegamon_zwart', count: 8 },
      { id: 'enemy_imperialdramon_dm', count: 8 },
      { id: 'enemy_armageddemon', count: 8 },
      { id: 'enemy_millenniummon', count: 8 },
    ],
    spawnInterval: 1000,
    boss: 'boss_apocalymon',
    reward: 1500,
  },
};

// ========================================
// Endless Mode (Wave 101+)
// ========================================

const ENDLESS_ENEMY_POOL = [
  'enemy_omegamon',
  'enemy_omegamon_zwart',
  'enemy_imperialdramon_dm',
  'enemy_armageddemon',
  'enemy_millenniummon',
  'enemy_wargreymon',
  'enemy_metalgarurumon',
  'enemy_machinedramon',
  'enemy_boltmon',
  'enemy_diaboromon',
  'enemy_saberleomon',
  'enemy_beelzemon',
];

const ENDLESS_BOSS_POOL = [
  'boss_omegamon',
  'boss_omegamon_zwart',
  'boss_apocalymon',
  'boss_machinedramon',
  'boss_venommyotismon',
];

/**
 * Simple seeded random number generator for deterministic endless waves.
 * Uses a linear congruential generator seeded by wave number.
 */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

/**
 * Generate wave config for endless mode (waves 101+).
 * Enemies scale exponentially: HP multiplied by 1.05^(wave-100).
 * Count increases linearly capped at 100.
 * Randomly selects 4-5 enemy types from the pool per wave (max 5 types).
 * Bosses every 10 waves.
 */
export function generateEndlessWave(waveNumber: number): WaveConfig {
  const wavesIntoEndless = waveNumber - 100;
  const enemyCount = Math.min(50 + wavesIntoEndless * 2, 100);
  const spawnInterval = Math.max(300, 600 - wavesIntoEndless * 10);

  // Use seeded RNG for deterministic wave composition
  const rng = seededRandom(waveNumber * 7919);

  // Pick 4-5 types from the pool
  const typeCount = rng() < 0.5 ? 4 : 5;

  // Shuffle pool using Fisher-Yates with seeded RNG, then take first typeCount
  const shuffled = [...ENDLESS_ENEMY_POOL];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const selectedTypes = shuffled.slice(0, typeCount);

  // Distribute enemies evenly across selected types
  const enemies: { id: string; count: number }[] = [];
  const basePerEnemy = Math.floor(enemyCount / typeCount);
  let remainder = enemyCount - basePerEnemy * typeCount;

  for (const id of selectedTypes) {
    const count = basePerEnemy + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;
    enemies.push({ id, count });
  }

  const config: WaveConfig = {
    enemies,
    spawnInterval,
  };

  // Boss every 10 waves
  if (waveNumber % 10 === 0) {
    const bossIndex = Math.floor((waveNumber / 10) % ENDLESS_BOSS_POOL.length);
    config.boss = ENDLESS_BOSS_POOL[bossIndex];
    config.reward = 500 + wavesIntoEndless * 10;
  }

  return config;
}

/**
 * Get wave config for any wave number.
 * Waves 1-100: From WAVE_DATA lookup.
 * Waves 101+: Dynamically generated endless mode.
 */
export function getWaveConfig(waveNumber: number): WaveConfig | undefined {
  if (waveNumber <= 100) {
    return WAVE_DATA[waveNumber];
  }
  return generateEndlessWave(waveNumber);
}
