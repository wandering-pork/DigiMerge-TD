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

const MUSIC = {
  MENU: 'music_menu',
  BATTLE: 'music_battle',
} as const;

/**
 * AudioManager listens to EventBus events and plays appropriate SFX.
 * Centralized audio so individual systems don't need Phaser sound access.
 */
export class AudioManager {
  private static readonly STORAGE_KEY = 'digimerge_audio_settings';

  private scene: Phaser.Scene;
  private sfxVolume: number;
  private sfxMuted: boolean;
  private musicVolume: number;
  private musicMuted: boolean;
  private currentMusic: Phaser.Sound.BaseSound | null = null;
  private currentMusicKey: string = '';

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const settings = AudioManager.loadSettings();
    this.sfxVolume = settings.sfxVolume;
    this.musicVolume = settings.musicVolume;
    this.sfxMuted = settings.sfxMuted;
    this.musicMuted = settings.musicMuted;
    this.bindEvents();
  }

  // ---------------------------------------------------------------------------
  // Persistence
  // ---------------------------------------------------------------------------

  public static loadSettings(): { sfxVolume: number; musicVolume: number; sfxMuted: boolean; musicMuted: boolean } {
    try {
      const saved = localStorage.getItem(AudioManager.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Backward compat: old format had single `enabled` boolean
        if ('enabled' in parsed && !('sfxMuted' in parsed)) {
          return {
            sfxVolume: parsed.sfxVolume ?? 0.5,
            musicVolume: parsed.musicVolume ?? 0.3,
            sfxMuted: !parsed.enabled,
            musicMuted: !parsed.enabled,
          };
        }
        return parsed;
      }
    } catch { /* ignore */ }
    return { sfxVolume: 0.5, musicVolume: 0.3, sfxMuted: false, musicMuted: false };
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(AudioManager.STORAGE_KEY, JSON.stringify({
        sfxVolume: this.sfxVolume,
        musicVolume: this.musicVolume,
        sfxMuted: this.sfxMuted,
        musicMuted: this.musicMuted,
      }));
    } catch { /* ignore */ }
  }

  // ---------------------------------------------------------------------------
  // Event Bindings
  // ---------------------------------------------------------------------------

  // Bound handler references for proper cleanup
  private handlers: Array<{ event: string; fn: () => void }> = [];

  private bindEvents(): void {
    const bind = (event: string, sfx: string) => {
      const fn = () => this.play(sfx);
      this.handlers.push({ event, fn });
      EventBus.on(event, fn, this);
    };

    bind(GameEvents.TOWER_PLACED, SFX.TOWER_SPAWN);
    bind(GameEvents.TOWER_LEVELED, SFX.TOWER_LEVEL_UP);
    bind(GameEvents.TOWER_SOLD, SFX.TOWER_SELL);
    bind(GameEvents.TOWER_EVOLVED, SFX.TOWER_EVOLVE);
    bind(GameEvents.TOWER_MERGED, SFX.MERGE_SUCCESS);
    bind(GameEvents.ENEMY_DIED, SFX.ENEMY_DEATH);
    bind(GameEvents.ENEMY_REACHED_BASE, SFX.ENEMY_ESCAPE);
    bind(GameEvents.BOSS_SPAWNED, SFX.BOSS_SPAWN);
    bind(GameEvents.WAVE_STARTED, SFX.WAVE_START);
    bind(GameEvents.WAVE_COMPLETED, SFX.WAVE_COMPLETE);
    bind(GameEvents.GAME_OVER, SFX.GAME_OVER);
    bind(GameEvents.GAME_WON, SFX.VICTORY);
  }

  // ---------------------------------------------------------------------------
  // Playback
  // ---------------------------------------------------------------------------

  /**
   * Play a sound effect by key. Silently no-ops if the key doesn't exist
   * or audio is disabled.
   */
  public play(key: string): void {
    if (this.sfxMuted) return;

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
    this.saveSettings();
  }

  public getVolume(): number {
    return this.sfxVolume;
  }

  public setSfxMuted(muted: boolean): void {
    this.sfxMuted = muted;
    this.saveSettings();
  }

  public isSfxMuted(): boolean {
    return this.sfxMuted;
  }

  public setMusicMuted(muted: boolean): void {
    this.musicMuted = muted;
    this.saveSettings();
    if (muted) {
      this.stopMusic();
    }
  }

  public isMusicMuted(): boolean {
    return this.musicMuted;
  }

  // ---------------------------------------------------------------------------
  // Music
  // ---------------------------------------------------------------------------

  public playMusic(key: string): void {
    if (this.musicMuted) return;
    if (this.currentMusicKey === key && this.currentMusic?.isPlaying) return;

    this.stopMusic();

    try {
      this.currentMusic = this.scene.sound.add(key, {
        volume: this.musicVolume,
        loop: true,
      });
      this.currentMusic.play();
      this.currentMusicKey = key;
    } catch {
      // Audio might not be available
    }
  }

  public stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic.destroy();
      this.currentMusic = null;
      this.currentMusicKey = '';
    }
  }

  public playMenuMusic(): void {
    this.playMusic(MUSIC.MENU);
  }

  public playBattleMusic(): void {
    this.playMusic(MUSIC.BATTLE);
  }

  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
    if (this.currentMusic && 'volume' in this.currentMusic) {
      (this.currentMusic as any).volume = this.musicVolume;
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  public cleanup(): void {
    this.stopMusic();
    for (const { event, fn } of this.handlers) {
      EventBus.off(event, fn, this);
    }
    this.handlers = [];
  }
}
