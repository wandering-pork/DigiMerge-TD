import { EventBus, GameEvents } from '@/utils/EventBus';
import {
  STARTING_LIVES,
  STARTING_DIGIBYTES,
  TOTAL_WAVES_MVP,
} from '@/config/Constants';
import type { GameState } from '@/types';

/**
 * GameStateManager
 *
 * Owns the authoritative game state: currency, lives, wave progression.
 * Pure logic class with no Phaser dependency (except EventBus for notifications).
 */
export class GameStateManager {
  private digibytes: number;
  private lives: number;
  private maxLives: number;
  private currentWave: number;
  private totalWaves: number;
  private gameMode: 'normal' | 'endless';
  private isPaused: boolean;
  private isWaveActive: boolean;
  private selectedStarters: string[];

  constructor() {
    this.digibytes = STARTING_DIGIBYTES;
    this.lives = STARTING_LIVES;
    this.maxLives = STARTING_LIVES;
    this.currentWave = 1;
    this.totalWaves = TOTAL_WAVES_MVP;
    this.gameMode = 'normal';
    this.isPaused = false;
    this.isWaveActive = false;
    this.selectedStarters = [];
  }

  // ─── Currency ───────────────────────────────────────────────────

  /** Add digibytes (positive amounts only). Emits DIGIBYTES_CHANGED. */
  addDigibytes(amount: number): void {
    if (amount <= 0) return;

    this.digibytes += amount;
    EventBus.emit(GameEvents.DIGIBYTES_CHANGED, this.digibytes);
  }

  /** Spend digibytes if affordable. Returns true on success, false otherwise. */
  spendDigibytes(amount: number): boolean {
    if (amount <= 0) return false;
    if (this.digibytes < amount) return false;

    this.digibytes -= amount;
    EventBus.emit(GameEvents.DIGIBYTES_CHANGED, this.digibytes);
    return true;
  }

  /** Check affordability without modifying state. */
  canAfford(amount: number): boolean {
    return this.digibytes >= amount;
  }

  // ─── Lives ──────────────────────────────────────────────────────

  /** Lose one life. Emits LIVES_CHANGED and GAME_OVER when appropriate. */
  loseLive(): number {
    if (this.lives <= 0) return 0;

    this.lives -= 1;
    EventBus.emit(GameEvents.LIVES_CHANGED, this.lives);

    if (this.lives <= 0) {
      EventBus.emit(GameEvents.GAME_OVER);
    }

    return this.lives;
  }

  /** Returns true when lives have been depleted. */
  isGameOver(): boolean {
    return this.lives <= 0;
  }

  // ─── Waves ──────────────────────────────────────────────────────

  /** Calculate digibytes reward for completing a wave: base 50 + wave * 10. */
  getWaveReward(wave: number): number {
    return 50 + wave * 10;
  }

  /** Advance to the next wave. Emits WAVE_COMPLETED with the completed wave number. */
  advanceWave(): void {
    const completedWave = this.currentWave;
    this.currentWave += 1;
    EventBus.emit(GameEvents.WAVE_COMPLETED, completedWave);
  }

  // ─── State Access ───────────────────────────────────────────────

  /** Returns a snapshot (copy) of the full game state. */
  getState(): GameState {
    return {
      digibytes: this.digibytes,
      lives: this.lives,
      maxLives: this.maxLives,
      currentWave: this.currentWave,
      totalWaves: this.totalWaves,
      gameMode: this.gameMode,
      isPaused: this.isPaused,
      isWaveActive: this.isWaveActive,
      selectedStarters: [...this.selectedStarters],
    };
  }

  // ─── Reset ──────────────────────────────────────────────────────

  /** Reset all state to initial values. Emits change events. */
  reset(): void {
    this.digibytes = STARTING_DIGIBYTES;
    this.lives = STARTING_LIVES;
    this.maxLives = STARTING_LIVES;
    this.currentWave = 1;
    this.totalWaves = TOTAL_WAVES_MVP;
    this.gameMode = 'normal';
    this.isPaused = false;
    this.isWaveActive = false;
    this.selectedStarters = [];

    EventBus.emit(GameEvents.DIGIBYTES_CHANGED, this.digibytes);
    EventBus.emit(GameEvents.LIVES_CHANGED, this.lives);
  }
}
