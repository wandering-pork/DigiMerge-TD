import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameStateManager } from '@/managers/GameStateManager';
import { EventBus, GameEvents } from '@/utils/EventBus';
import { STARTING_LIVES, STARTING_DIGIBYTES, TOTAL_WAVES_MVP } from '@/config/Constants';

describe('GameStateManager', () => {
  let manager: GameStateManager;

  beforeEach(() => {
    EventBus.removeAllListeners();
    manager = new GameStateManager();
  });

  // ─── Initial State ────────────────────────────────────────────────

  describe('initial state', () => {
    it('should start with STARTING_LIVES lives', () => {
      const state = manager.getState();
      expect(state.lives).toBe(STARTING_LIVES);
    });

    it('should start with STARTING_DIGIBYTES digibytes', () => {
      const state = manager.getState();
      expect(state.digibytes).toBe(STARTING_DIGIBYTES);
    });

    it('should start at wave 1', () => {
      const state = manager.getState();
      expect(state.currentWave).toBe(1);
    });

    it('should start in normal game mode', () => {
      const state = manager.getState();
      expect(state.gameMode).toBe('normal');
    });

    it('should start not paused', () => {
      const state = manager.getState();
      expect(state.isPaused).toBe(false);
    });

    it('should start with wave not active', () => {
      const state = manager.getState();
      expect(state.isWaveActive).toBe(false);
    });

    it('should start with maxLives equal to STARTING_LIVES', () => {
      const state = manager.getState();
      expect(state.maxLives).toBe(STARTING_LIVES);
    });

    it('should start with totalWaves equal to TOTAL_WAVES_MVP', () => {
      const state = manager.getState();
      expect(state.totalWaves).toBe(TOTAL_WAVES_MVP);
    });
  });

  // ─── addDigibytes ─────────────────────────────────────────────────

  describe('addDigibytes', () => {
    it('should increase digibytes by the given amount', () => {
      manager.addDigibytes(100);
      expect(manager.getState().digibytes).toBe(STARTING_DIGIBYTES + 100);
    });

    it('should accumulate multiple additions', () => {
      manager.addDigibytes(50);
      manager.addDigibytes(75);
      expect(manager.getState().digibytes).toBe(STARTING_DIGIBYTES + 125);
    });

    it('should emit DIGIBYTES_CHANGED event with new total', () => {
      const listener = vi.fn();
      EventBus.on(GameEvents.DIGIBYTES_CHANGED, listener);

      manager.addDigibytes(100);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(STARTING_DIGIBYTES + 100);
    });

    it('should ignore zero amount', () => {
      const listener = vi.fn();
      EventBus.on(GameEvents.DIGIBYTES_CHANGED, listener);

      manager.addDigibytes(0);

      expect(manager.getState().digibytes).toBe(STARTING_DIGIBYTES);
      expect(listener).not.toHaveBeenCalled();
    });

    it('should ignore negative amount', () => {
      const listener = vi.fn();
      EventBus.on(GameEvents.DIGIBYTES_CHANGED, listener);

      manager.addDigibytes(-50);

      expect(manager.getState().digibytes).toBe(STARTING_DIGIBYTES);
      expect(listener).not.toHaveBeenCalled();
    });
  });

  // ─── spendDigibytes ───────────────────────────────────────────────

  describe('spendDigibytes', () => {
    it('should decrease digibytes when affordable and return true', () => {
      const result = manager.spendDigibytes(100);
      expect(result).toBe(true);
      expect(manager.getState().digibytes).toBe(STARTING_DIGIBYTES - 100);
    });

    it('should return false and not modify state when insufficient funds', () => {
      const result = manager.spendDigibytes(STARTING_DIGIBYTES + 1);
      expect(result).toBe(false);
      expect(manager.getState().digibytes).toBe(STARTING_DIGIBYTES);
    });

    it('should allow spending exact balance', () => {
      const result = manager.spendDigibytes(STARTING_DIGIBYTES);
      expect(result).toBe(true);
      expect(manager.getState().digibytes).toBe(0);
    });

    it('should emit DIGIBYTES_CHANGED event on successful spend', () => {
      const listener = vi.fn();
      EventBus.on(GameEvents.DIGIBYTES_CHANGED, listener);

      manager.spendDigibytes(50);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(STARTING_DIGIBYTES - 50);
    });

    it('should NOT emit event when spend fails', () => {
      const listener = vi.fn();
      EventBus.on(GameEvents.DIGIBYTES_CHANGED, listener);

      manager.spendDigibytes(STARTING_DIGIBYTES + 1);

      expect(listener).not.toHaveBeenCalled();
    });

    it('should reject zero amount', () => {
      const result = manager.spendDigibytes(0);
      expect(result).toBe(false);
      expect(manager.getState().digibytes).toBe(STARTING_DIGIBYTES);
    });

    it('should reject negative amount', () => {
      const result = manager.spendDigibytes(-10);
      expect(result).toBe(false);
      expect(manager.getState().digibytes).toBe(STARTING_DIGIBYTES);
    });
  });

  // ─── canAfford ────────────────────────────────────────────────────

  describe('canAfford', () => {
    it('should return true when digibytes are sufficient', () => {
      expect(manager.canAfford(100)).toBe(true);
    });

    it('should return true when amount equals current digibytes', () => {
      expect(manager.canAfford(STARTING_DIGIBYTES)).toBe(true);
    });

    it('should return false when amount exceeds current digibytes', () => {
      expect(manager.canAfford(STARTING_DIGIBYTES + 1)).toBe(false);
    });

    it('should NOT modify state', () => {
      manager.canAfford(100);
      expect(manager.getState().digibytes).toBe(STARTING_DIGIBYTES);
    });

    it('should NOT emit any events', () => {
      const listener = vi.fn();
      EventBus.on(GameEvents.DIGIBYTES_CHANGED, listener);

      manager.canAfford(100);

      expect(listener).not.toHaveBeenCalled();
    });
  });

  // ─── loseLive ─────────────────────────────────────────────────────

  describe('loseLive', () => {
    it('should decrease lives by 1', () => {
      manager.loseLive();
      expect(manager.getState().lives).toBe(STARTING_LIVES - 1);
    });

    it('should return remaining lives', () => {
      const remaining = manager.loseLive();
      expect(remaining).toBe(STARTING_LIVES - 1);
    });

    it('should emit LIVES_CHANGED event with remaining lives', () => {
      const listener = vi.fn();
      EventBus.on(GameEvents.LIVES_CHANGED, listener);

      manager.loseLive();

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(STARTING_LIVES - 1);
    });

    it('should emit GAME_OVER when lives reach 0', () => {
      const gameOverListener = vi.fn();
      EventBus.on(GameEvents.GAME_OVER, gameOverListener);

      // Lose all lives
      for (let i = 0; i < STARTING_LIVES; i++) {
        manager.loseLive();
      }

      expect(gameOverListener).toHaveBeenCalledTimes(1);
    });

    it('should not go below 0 lives', () => {
      // Lose all lives + 1 extra
      for (let i = 0; i < STARTING_LIVES + 1; i++) {
        manager.loseLive();
      }

      expect(manager.getState().lives).toBe(0);
    });

    it('should not emit LIVES_CHANGED when already at 0', () => {
      // First drain all lives
      for (let i = 0; i < STARTING_LIVES; i++) {
        manager.loseLive();
      }

      const listener = vi.fn();
      EventBus.on(GameEvents.LIVES_CHANGED, listener);

      // Try losing one more
      manager.loseLive();
      expect(listener).not.toHaveBeenCalled();
    });
  });

  // ─── isGameOver ───────────────────────────────────────────────────

  describe('isGameOver', () => {
    it('should return false at start', () => {
      expect(manager.isGameOver()).toBe(false);
    });

    it('should return false when lives > 0', () => {
      manager.loseLive();
      expect(manager.isGameOver()).toBe(false);
    });

    it('should return true when lives reach 0', () => {
      for (let i = 0; i < STARTING_LIVES; i++) {
        manager.loseLive();
      }
      expect(manager.isGameOver()).toBe(true);
    });
  });

  // ─── getWaveReward ────────────────────────────────────────────────

  describe('getWaveReward', () => {
    it('should return base 50 + wave * 10 for wave 1', () => {
      expect(manager.getWaveReward(1)).toBe(60); // 50 + 1*10
    });

    it('should return base 50 + wave * 10 for wave 5', () => {
      expect(manager.getWaveReward(5)).toBe(100); // 50 + 5*10
    });

    it('should return base 50 + wave * 10 for wave 10', () => {
      expect(manager.getWaveReward(10)).toBe(150); // 50 + 10*10
    });

    it('should return base 50 + wave * 10 for wave 20', () => {
      expect(manager.getWaveReward(20)).toBe(250); // 50 + 20*10
    });

    it('should scale linearly with wave number', () => {
      const reward5 = manager.getWaveReward(5);
      const reward10 = manager.getWaveReward(10);
      // Difference between wave 10 and wave 5 rewards: (50+100)-(50+50) = 50
      expect(reward10 - reward5).toBe(50);
    });
  });

  // ─── advanceWave ──────────────────────────────────────────────────

  describe('advanceWave', () => {
    it('should increment currentWave by 1', () => {
      manager.advanceWave();
      expect(manager.getState().currentWave).toBe(2);
    });

    it('should increment multiple times', () => {
      manager.advanceWave();
      manager.advanceWave();
      manager.advanceWave();
      expect(manager.getState().currentWave).toBe(4);
    });

    it('should emit WAVE_COMPLETED event with completed wave number', () => {
      const listener = vi.fn();
      EventBus.on(GameEvents.WAVE_COMPLETED, listener);

      manager.advanceWave();

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(1); // Wave 1 was completed
    });
  });

  // ─── getState ─────────────────────────────────────────────────────

  describe('getState', () => {
    it('should return a snapshot of the full game state', () => {
      const state = manager.getState();

      expect(state).toHaveProperty('digibytes');
      expect(state).toHaveProperty('lives');
      expect(state).toHaveProperty('maxLives');
      expect(state).toHaveProperty('currentWave');
      expect(state).toHaveProperty('totalWaves');
      expect(state).toHaveProperty('gameMode');
      expect(state).toHaveProperty('isPaused');
      expect(state).toHaveProperty('isWaveActive');
      expect(state).toHaveProperty('selectedStarters');
    });

    it('should return a copy, not a reference to internal state', () => {
      const state1 = manager.getState();
      state1.digibytes = 999999;

      const state2 = manager.getState();
      expect(state2.digibytes).toBe(STARTING_DIGIBYTES);
    });

    it('should reflect changes after mutations', () => {
      manager.addDigibytes(100);
      manager.loseLive();
      manager.advanceWave();

      const state = manager.getState();
      expect(state.digibytes).toBe(STARTING_DIGIBYTES + 100);
      expect(state.lives).toBe(STARTING_LIVES - 1);
      expect(state.currentWave).toBe(2);
    });
  });

  // ─── reset ────────────────────────────────────────────────────────

  describe('reset', () => {
    it('should restore digibytes to STARTING_DIGIBYTES', () => {
      manager.spendDigibytes(100);
      manager.reset();
      expect(manager.getState().digibytes).toBe(STARTING_DIGIBYTES);
    });

    it('should restore lives to STARTING_LIVES', () => {
      manager.loseLive();
      manager.loseLive();
      manager.reset();
      expect(manager.getState().lives).toBe(STARTING_LIVES);
    });

    it('should restore currentWave to 1', () => {
      manager.advanceWave();
      manager.advanceWave();
      manager.reset();
      expect(manager.getState().currentWave).toBe(1);
    });

    it('should reset isPaused to false', () => {
      manager.reset();
      expect(manager.getState().isPaused).toBe(false);
    });

    it('should reset isWaveActive to false', () => {
      manager.reset();
      expect(manager.getState().isWaveActive).toBe(false);
    });

    it('should emit DIGIBYTES_CHANGED with starting value', () => {
      manager.spendDigibytes(100);

      const listener = vi.fn();
      EventBus.on(GameEvents.DIGIBYTES_CHANGED, listener);

      manager.reset();

      expect(listener).toHaveBeenCalledWith(STARTING_DIGIBYTES);
    });

    it('should emit LIVES_CHANGED with starting value', () => {
      manager.loseLive();

      const listener = vi.fn();
      EventBus.on(GameEvents.LIVES_CHANGED, listener);

      manager.reset();

      expect(listener).toHaveBeenCalledWith(STARTING_LIVES);
    });
  });
});
