import Phaser from 'phaser';
import { EventBus, GameEvents } from '@/utils/EventBus';

/**
 * SFX keys that match the audio assets loaded in PreloadScene.
 */
const SFX = {
  ATTACK_HIT: 'attack_hit',
  ATTACK_MISS: 'attack_miss',
  BOSS_SPAWN: 'boss_spawn',
  BUTTON_CLICK: 'button_click',
  BUTTON_HOVER: 'button_hover',
  ENEMY_DEATH: 'enemy_death',
  ENEMY_ESCAPE: 'enemy_escape',
  GAME_OVER: 'game_over',
  INSUFFICIENT_FUNDS: 'insufficient_funds',
  MERGE_SUCCESS: 'merge_success',
  TOWER_EVOLVE: 'tower_evolve',
  TOWER_LEVEL_UP: 'tower_level_up',
  TOWER_SELL: 'tower_sell',
  TOWER_SPAWN: 'tower_spawn',
  VICTORY: 'victory',
  WAVE_COMPLETE: 'wave_complete',
  WAVE_START: 'wave_start',
} as const;

/**
 * AudioManager listens to EventBus events and plays appropriate SFX.
 * Centralized audio so individual systems don't need Phaser sound access.
 */
export class AudioManager {
  private scene: Phaser.Scene;
  private sfxVolume: number = 0.15;
  private enabled: boolean = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.bindEvents();
  }

  // ---------------------------------------------------------------------------
  // Event Bindings
  // ---------------------------------------------------------------------------

  private bindEvents(): void {
    EventBus.on(GameEvents.TOWER_PLACED, () => this.play(SFX.TOWER_SPAWN));
    EventBus.on(GameEvents.TOWER_LEVELED, () => this.play(SFX.TOWER_LEVEL_UP));
    EventBus.on(GameEvents.TOWER_SOLD, () => this.play(SFX.TOWER_SELL));
    EventBus.on(GameEvents.TOWER_EVOLVED, () => this.play(SFX.TOWER_EVOLVE));
    EventBus.on(GameEvents.TOWER_MERGED, () => this.play(SFX.MERGE_SUCCESS));
    EventBus.on(GameEvents.ENEMY_DIED, () => this.play(SFX.ENEMY_DEATH));
    EventBus.on(GameEvents.ENEMY_REACHED_BASE, () => this.play(SFX.ENEMY_ESCAPE));
    EventBus.on(GameEvents.BOSS_SPAWNED, () => this.play(SFX.BOSS_SPAWN));
    EventBus.on(GameEvents.WAVE_STARTED, () => this.play(SFX.WAVE_START));
    EventBus.on(GameEvents.WAVE_COMPLETED, () => this.play(SFX.WAVE_COMPLETE));
    EventBus.on(GameEvents.GAME_OVER, () => this.play(SFX.GAME_OVER));
    EventBus.on(GameEvents.GAME_WON, () => this.play(SFX.VICTORY));
  }

  // ---------------------------------------------------------------------------
  // Playback
  // ---------------------------------------------------------------------------

  /**
   * Play a sound effect by key. Silently no-ops if the key doesn't exist
   * or audio is disabled.
   */
  public play(key: string): void {
    if (!this.enabled) return;

    try {
      this.scene.sound.play(key, { volume: this.sfxVolume });
    } catch {
      // Audio might not be available (e.g., user hasn't interacted yet)
    }
  }

  /**
   * Play button click SFX. Call from UI elements.
   */
  public playClick(): void {
    this.play(SFX.BUTTON_CLICK);
  }

  /**
   * Play insufficient funds SFX.
   */
  public playInsufficientFunds(): void {
    this.play(SFX.INSUFFICIENT_FUNDS);
  }

  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------

  public setVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  public getVolume(): number {
    return this.sfxVolume;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  public cleanup(): void {
    EventBus.off(GameEvents.TOWER_PLACED);
    EventBus.off(GameEvents.TOWER_LEVELED);
    EventBus.off(GameEvents.TOWER_SOLD);
    EventBus.off(GameEvents.TOWER_EVOLVED);
    EventBus.off(GameEvents.TOWER_MERGED);
    EventBus.off(GameEvents.ENEMY_DIED);
    EventBus.off(GameEvents.ENEMY_REACHED_BASE);
    EventBus.off(GameEvents.BOSS_SPAWNED);
    EventBus.off(GameEvents.WAVE_STARTED);
    EventBus.off(GameEvents.WAVE_COMPLETED);
    EventBus.off(GameEvents.GAME_OVER);
    EventBus.off(GameEvents.GAME_WON);
  }
}
