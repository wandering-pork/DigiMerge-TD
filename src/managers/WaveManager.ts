import Phaser from 'phaser';
import { getWaveConfig } from '@/data/WaveData';
import { DIGIMON_DATABASE } from '@/data/DigimonDatabase';
import { WaveConfig, WaveEnemy } from '@/types';
import { Enemy } from '@/entities/Enemy';
import { EventBus, GameEvents } from '@/utils/EventBus';

interface SpawnEntry {
  digimonId: string;
  waveScaling: number;
}

/**
 * WaveManager handles spawning enemies in waves.
 *
 * It reads wave configuration from WAVE_DATA and spawns Enemy entities
 * into the GameScene's enemyContainer. Each wave has a spawn queue that
 * is shuffled for variety, with bosses always placed at the end.
 */
export class WaveManager {
  private scene: Phaser.Scene;
  private enemyContainer: Phaser.GameObjects.Container;

  /** Current wave number (1-based). */
  public currentWave: number = 0;

  /** Enemies queued to spawn for the current wave. */
  private spawnQueue: SpawnEntry[] = [];

  /** Time in ms remaining until the next enemy spawns. */
  private spawnTimer: number = 0;

  /** Time in ms between enemy spawns for the current wave. */
  private spawnInterval: number = 2000;

  /** Whether a wave is currently active (spawning or enemies still alive). */
  private isActive: boolean = false;

  /** All living enemies that belong to the current wave. */
  private activeEnemies: Set<Enemy> = new Set();

  /** HP multiplier that scales within Phase 1. */
  private waveScaling: number = 1;

  constructor(scene: Phaser.Scene, enemyContainer: Phaser.GameObjects.Container) {
    this.scene = scene;
    this.enemyContainer = enemyContainer;

    // Listen for splitter deaths to spawn child enemies
    EventBus.on(GameEvents.SPLITTER_DIED, this.onSplitterDied, this);
  }

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  /**
   * Start a new wave by building and shuffling the spawn queue from
   * WAVE_DATA, then beginning the spawn cycle.
   */
  public startWave(waveNumber: number): void {
    const waveConfig: WaveConfig | undefined = getWaveConfig(waveNumber);

    if (!waveConfig) {
      console.warn(`[WaveManager] No wave data for wave ${waveNumber}`);
      return;
    }

    this.currentWave = waveNumber;

    // Scaling: +5% HP per wave for waves 1-100, exponential for endless (101+)
    if (waveNumber <= 100) {
      this.waveScaling = 1 + 0.05 * Math.max(0, waveNumber - 1);
    } else {
      // Endless: base scaling at wave 100 + exponential growth
      const baseScaling = 1 + 0.05 * 99; // ~5.95x at wave 100
      this.waveScaling = baseScaling * Math.pow(1.05, waveNumber - 100);
    }

    // Build spawn queue from wave enemies
    this.spawnQueue = [];
    for (const waveEnemy of waveConfig.enemies) {
      for (let i = 0; i < waveEnemy.count; i++) {
        this.spawnQueue.push({
          digimonId: waveEnemy.id,
          waveScaling: this.waveScaling,
        });
      }
    }

    // Shuffle for variety
    this.shuffleArray(this.spawnQueue);

    // If the wave has a boss, add it at the very end (after shuffle)
    if (waveConfig.boss) {
      this.spawnQueue.push({
        digimonId: waveConfig.boss,
        waveScaling: this.waveScaling,
      });
    }

    // Apply wave spawn interval
    this.spawnInterval = waveConfig.spawnInterval;
    this.spawnTimer = 0; // Spawn first enemy immediately

    this.isActive = true;

    EventBus.emit(GameEvents.WAVE_STARTED, { wave: waveNumber });
  }

  /**
   * Called every frame by the GameScene's update loop.
   * Handles spawn timing and checks for wave completion.
   */
  public update(_time: number, delta: number): void {
    if (!this.isActive) return;

    // Tick spawn timer and spawn next enemy when ready
    if (this.spawnQueue.length > 0) {
      this.spawnTimer -= delta;

      if (this.spawnTimer <= 0) {
        const entry = this.spawnQueue.shift()!;
        this.spawnEnemy(entry.digimonId, entry.waveScaling);
        this.spawnTimer = this.spawnInterval;
      }
    }

    // Check for wave completion
    this.checkWaveComplete();
  }

  /**
   * Returns an array of all currently alive enemies.
   */
  public getActiveEnemies(): Enemy[] {
    return Array.from(this.activeEnemies).filter((enemy) => enemy.isAlive);
  }

  /**
   * Whether a wave is currently in progress (spawning or enemies alive).
   */
  public isWaveActive(): boolean {
    return this.isActive;
  }

  /**
   * Clear all state. Call when resetting the game or leaving the scene.
   */
  public cleanup(): void {
    this.spawnQueue = [];
    this.activeEnemies.clear();
    this.isActive = false;
    this.currentWave = 0;
    this.spawnTimer = 0;
    this.waveScaling = 1;
    EventBus.off(GameEvents.SPLITTER_DIED, this.onSplitterDied, this);
  }

  // ------------------------------------------------------------------
  // Internal
  // ------------------------------------------------------------------

  /**
   * Instantiate an Enemy and add it to the scene.
   */
  private spawnEnemy(digimonId: string, waveScaling: number): void {
    const enemy = new Enemy(this.scene, digimonId, waveScaling);

    this.enemyContainer.add(enemy);
    this.activeEnemies.add(enemy);

    // When the enemy is destroyed (dies or reaches base), remove it from
    // the active set and check if the wave is now complete.
    enemy.once('destroy', () => {
      this.activeEnemies.delete(enemy);
      this.checkWaveComplete();
    });

    // Emit boss or regular spawn event
    const isBoss = digimonId.startsWith('boss_');
    if (isBoss) {
      EventBus.emit(GameEvents.BOSS_SPAWNED, {
        enemyID: enemy.enemyID,
        digimonId,
        wave: this.currentWave,
      });
    }

    EventBus.emit(GameEvents.ENEMY_SPAWNED, {
      enemyID: enemy.enemyID,
      digimonId,
      wave: this.currentWave,
    });
  }

  /**
   * Check whether the wave is complete (all enemies spawned and dead).
   * Returns true if the wave is finished.
   */
  private checkWaveComplete(): boolean {
    if (!this.isActive) return false;

    if (this.spawnQueue.length === 0 && this.activeEnemies.size === 0) {
      this.isActive = false;

      EventBus.emit(GameEvents.WAVE_COMPLETED, {
        wave: this.currentWave,
      });

      return true;
    }

    return false;
  }

  /**
   * Handle a splitter enemy dying: spawn split children at the parent's path position.
   * Children have 50% of parent's max HP, same speed, and cannot further split.
   */
  private onSplitterDied(data: {
    digimonId: string;
    splitCount: number;
    pathIndex: number;
    pathProgress: number;
    maxHp: number;
    x: number;
    y: number;
  }): void {
    if (!this.isActive) return;

    const baseStats = DIGIMON_DATABASE.enemies[data.digimonId];
    if (!baseStats) return;

    // Calculate scaling so child HP = parent maxHp * 50%
    const childHpTarget = data.maxHp * 0.5;
    const childScaling = childHpTarget / baseStats.baseHP;

    for (let i = 0; i < data.splitCount; i++) {
      try {
        const child = new Enemy(this.scene, data.digimonId, childScaling);
        child.isSplitChild = true;

        // Position child at parent's path progress with slight offset for visibility
        child.pathIndex = data.pathIndex;
        child.pathProgress = data.pathProgress;

        // Apply a small random offset so children don't overlap exactly
        const offsetX = (i - (data.splitCount - 1) / 2) * 12;
        child.x = data.x + offsetX;
        child.y = data.y;

        this.enemyContainer.add(child);
        this.activeEnemies.add(child);

        child.once('destroy', () => {
          this.activeEnemies.delete(child);
          this.checkWaveComplete();
        });

        EventBus.emit(GameEvents.ENEMY_SPAWNED, {
          enemyID: child.enemyID,
          digimonId: data.digimonId,
          wave: this.currentWave,
        });
      } catch {
        // Skip if enemy creation fails
      }
    }
  }

  /**
   * Fisher-Yates in-place shuffle.
   */
  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
