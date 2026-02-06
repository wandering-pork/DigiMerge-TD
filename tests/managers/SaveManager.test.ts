import { describe, it, expect, beforeEach } from 'vitest';
import { SaveManager } from '@/managers/SaveManager';
import { Stage, TargetPriority } from '@/types';

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

describe('SaveManager', () => {
  const sampleGameState = {
    digibytes: 500,
    lives: 20,
    currentWave: 5,
    gameMode: 'normal' as const,
  };

  const sampleTowers = [
    {
      digimonId: 'agumon',
      level: 5,
      dp: 2,
      originStage: Stage.IN_TRAINING,
      gridPosition: { col: 2, row: 3 },
      targetPriority: TargetPriority.FIRST,
    },
  ];

  beforeEach(() => {
    // Clear localStorage mock
    Object.keys(store).forEach(key => delete store[key]);
  });

  describe('save', () => {
    it('saves game state to localStorage', () => {
      const result = SaveManager.save(sampleGameState, sampleTowers);
      expect(result).toBe(true);
      expect(store['digimerge_td_save']).toBeDefined();
    });

    it('saved data contains correct version', () => {
      SaveManager.save(sampleGameState, sampleTowers);
      const parsed = JSON.parse(store['digimerge_td_save']);
      expect(parsed.version).toBe('1.0.0');
    });

    it('saved data contains game state', () => {
      SaveManager.save(sampleGameState, sampleTowers);
      const parsed = JSON.parse(store['digimerge_td_save']);
      expect(parsed.gameState.digibytes).toBe(500);
      expect(parsed.gameState.lives).toBe(20);
      expect(parsed.gameState.currentWave).toBe(5);
    });

    it('saved data contains towers', () => {
      SaveManager.save(sampleGameState, sampleTowers);
      const parsed = JSON.parse(store['digimerge_td_save']);
      expect(parsed.towers).toHaveLength(1);
      expect(parsed.towers[0].digimonId).toBe('agumon');
    });

    it('saved data contains timestamp', () => {
      SaveManager.save(sampleGameState, sampleTowers);
      const parsed = JSON.parse(store['digimerge_td_save']);
      expect(parsed.timestamp).toBeDefined();
    });
  });

  describe('load', () => {
    it('returns null when no save exists', () => {
      expect(SaveManager.load()).toBeNull();
    });

    it('loads saved data correctly', () => {
      SaveManager.save(sampleGameState, sampleTowers);
      const loaded = SaveManager.load();
      expect(loaded).not.toBeNull();
      expect(loaded!.gameState.digibytes).toBe(500);
      expect(loaded!.towers).toHaveLength(1);
    });

    it('returns null for incompatible version', () => {
      store['digimerge_td_save'] = JSON.stringify({
        version: '0.0.1',
        gameState: sampleGameState,
        towers: [],
      });
      expect(SaveManager.load()).toBeNull();
    });

    it('returns null for corrupted data', () => {
      store['digimerge_td_save'] = 'not valid json{{{';
      expect(SaveManager.load()).toBeNull();
    });

    it('returns null for missing gameState', () => {
      store['digimerge_td_save'] = JSON.stringify({
        version: '1.0.0',
        towers: [],
      });
      expect(SaveManager.load()).toBeNull();
    });
  });

  describe('hasSave', () => {
    it('returns false when no save exists', () => {
      expect(SaveManager.hasSave()).toBe(false);
    });

    it('returns true when save exists', () => {
      SaveManager.save(sampleGameState, sampleTowers);
      expect(SaveManager.hasSave()).toBe(true);
    });
  });

  describe('deleteSave', () => {
    it('removes saved data', () => {
      SaveManager.save(sampleGameState, sampleTowers);
      expect(SaveManager.hasSave()).toBe(true);
      SaveManager.deleteSave();
      expect(SaveManager.hasSave()).toBe(false);
    });
  });

  describe('settings', () => {
    it('returns default settings when no save exists', () => {
      const settings = SaveManager.loadSettings();
      expect(settings.sfxVolume).toBe(0);
      expect(settings.showGrid).toBe(true);
    });

    it('saves and loads settings', () => {
      SaveManager.saveSettings({
        sfxVolume: 0.8,
        musicVolume: 0.3,
        showGrid: false,
        showRanges: true,
        showDamageNumbers: true,
        healthBarMode: 'all',
      });
      const settings = SaveManager.loadSettings();
      expect(settings.sfxVolume).toBe(0.8);
      expect(settings.showGrid).toBe(false);
    });

    it('preserves game state when saving settings over existing save', () => {
      SaveManager.save(sampleGameState, sampleTowers);
      SaveManager.saveSettings({
        sfxVolume: 1.0,
        musicVolume: 0.5,
        showGrid: true,
        showRanges: true,
        showDamageNumbers: true,
        healthBarMode: 'all',
      });
      const loaded = SaveManager.load();
      expect(loaded!.gameState.digibytes).toBe(500);
      expect(loaded!.settings.sfxVolume).toBe(1.0);
    });
  });
});
