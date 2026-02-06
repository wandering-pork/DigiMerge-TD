import Phaser from 'phaser';
import { EnemyStats, Attribute, EnemyType } from '@/types';
import { DIGIMON_DATABASE } from '@/data/DigimonDatabase';
import { getPathPixelPositions, PixelPosition } from '@/utils/GridUtils';
import { EventBus, GameEvents } from '@/utils/EventBus';

let enemyCounter = 0;

export class Enemy extends Phaser.GameObjects.Container {
  // Identity
  public readonly enemyID: string;
  public readonly digimonId: string;
  public readonly stats: EnemyStats;

  // Combat stats
  public hp: number;
  public maxHp: number;
  public speed: number;
  public armor: number;
  public attribute: Attribute;
  public enemyType: EnemyType;
  public reward: number;

  // Path following
  public pathIndex: number = 0;
  public pathProgress: number = 0;
  public pathPositions: PixelPosition[];

  // State
  public isAlive: boolean = true;

  // Visual elements
  private sprite: Phaser.GameObjects.Sprite;
  private healthBarBg: Phaser.GameObjects.Graphics;
  private healthBarFill: Phaser.GameObjects.Graphics;

  // Health bar dimensions
  private static readonly HEALTH_BAR_WIDTH = 40;
  private static readonly HEALTH_BAR_HEIGHT = 5;
  private static readonly HEALTH_BAR_Y = -28;

  constructor(scene: Phaser.Scene, digimonId: string, waveScaling?: number) {
    super(scene, 0, 0);

    // Generate unique ID
    enemyCounter++;
    this.enemyID = `enemy_${enemyCounter}_${Date.now()}`;
    this.digimonId = digimonId;

    // Look up stats from database
    const dbStats = DIGIMON_DATABASE.enemies[digimonId];
    if (!dbStats) {
      throw new Error(`Enemy not found in database: ${digimonId}`);
    }
    this.stats = { ...dbStats };

    // Set combat properties with optional wave scaling
    const scaling = waveScaling ?? 1;
    this.maxHp = dbStats.baseHP * scaling;
    this.hp = this.maxHp;
    this.speed = dbStats.moveSpeed;
    this.armor = dbStats.armor;
    this.attribute = dbStats.attribute;
    this.enemyType = dbStats.type;
    this.reward = dbStats.reward;

    // Cache path positions
    this.pathPositions = getPathPixelPositions();

    // Position at first waypoint
    if (this.pathPositions.length > 0) {
      this.x = this.pathPositions[0].x;
      this.y = this.pathPositions[0].y;
    }

    // Create sprite child
    // Sprite key uses the base name without "enemy_" or "boss_" prefix
    const spriteKey = digimonId.replace(/^(enemy_|boss_)/, '');
    this.sprite = scene.add.sprite(0, 0, spriteKey);
    this.sprite.setOrigin(0.5, 0.5);

    // Scale 16px sprites to ~36px for enemies (slightly smaller than tower 40px)
    const targetSize = 36;
    const currentWidth = this.sprite.width || 16;
    const scaleFactor = targetSize / currentWidth;
    this.sprite.setScale(scaleFactor);

    this.add(this.sprite);

    // Create health bar background
    this.healthBarBg = scene.add.graphics();
    this.add(this.healthBarBg);

    // Create health bar fill
    this.healthBarFill = scene.add.graphics();
    this.add(this.healthBarFill);

    // Draw the initial health bar
    this.drawHealthBarBackground();
    this.updateHealthBar();

    // Set container size for hit detection
    this.setSize(targetSize, targetSize);
  }

  /**
   * Draw the static dark background of the health bar.
   */
  private drawHealthBarBackground(): void {
    this.healthBarBg.clear();
    this.healthBarBg.fillStyle(0x222222, 0.8);
    this.healthBarBg.fillRect(
      -Enemy.HEALTH_BAR_WIDTH / 2,
      Enemy.HEALTH_BAR_Y,
      Enemy.HEALTH_BAR_WIDTH,
      Enemy.HEALTH_BAR_HEIGHT
    );
  }

  /**
   * Redraw the health bar fill based on current HP ratio.
   * Green when > 60%, yellow when > 30%, red otherwise.
   */
  public updateHealthBar(): void {
    this.healthBarFill.clear();

    const hpPercent = this.getHpPercent();
    const fillWidth = Enemy.HEALTH_BAR_WIDTH * hpPercent;

    // Determine color based on HP percentage
    let color: number;
    if (hpPercent > 0.6) {
      color = 0x00cc00; // Green
    } else if (hpPercent > 0.3) {
      color = 0xcccc00; // Yellow
    } else {
      color = 0xcc0000; // Red
    }

    this.healthBarFill.fillStyle(color, 1);
    this.healthBarFill.fillRect(
      -Enemy.HEALTH_BAR_WIDTH / 2,
      Enemy.HEALTH_BAR_Y,
      fillWidth,
      Enemy.HEALTH_BAR_HEIGHT
    );
  }

  /**
   * Get the current HP as a fraction of max HP (0 to 1).
   */
  public getHpPercent(): number {
    if (this.maxHp <= 0) return 0;
    return Math.max(0, Math.min(1, this.hp / this.maxHp));
  }

  /**
   * Apply damage to this enemy, reduced by armor.
   * actualDamage = amount * (1 - armor)
   */
  public takeDamage(amount: number): void {
    if (!this.isAlive) return;

    const actualDamage = amount * (1 - this.armor);
    this.hp -= actualDamage;

    this.updateHealthBar();

    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
  }

  /**
   * Restore HP, clamped to maxHp.
   */
  public heal(amount: number): void {
    if (!this.isAlive) return;

    this.hp = Math.min(this.maxHp, this.hp + amount);
    this.updateHealthBar();
  }

  /**
   * Handle enemy death: emit event with reward, play death animation, then destroy.
   */
  public die(): void {
    if (!this.isAlive) return;

    this.isAlive = false;

    EventBus.emit(GameEvents.ENEMY_DIED, {
      enemyID: this.enemyID,
      digimonId: this.digimonId,
      reward: this.reward,
      x: this.x,
      y: this.y,
    });

    // Death animation: fade out and shrink
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.destroy();
      },
    });
  }

  /**
   * Handle enemy reaching the base: emit event and destroy immediately.
   */
  public reachBase(): void {
    if (!this.isAlive) return;

    this.isAlive = false;

    EventBus.emit(GameEvents.ENEMY_REACHED_BASE, {
      enemyID: this.enemyID,
      digimonId: this.digimonId,
    });

    this.destroy();
  }

  /**
   * Move along the path each frame.
   * Interpolates between waypoints based on speed and delta time.
   */
  public update(time: number, delta: number): void {
    if (!this.isAlive) return;

    // If we've reached or passed the last waypoint, enemy reaches the base
    if (this.pathIndex >= this.pathPositions.length - 1) {
      this.reachBase();
      return;
    }

    // Get current and next waypoint positions
    const current = this.pathPositions[this.pathIndex];
    const next = this.pathPositions[this.pathIndex + 1];

    // Calculate distance between current and next waypoint
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    const segmentDistance = Math.sqrt(dx * dx + dy * dy);

    // If waypoints overlap (zero distance), skip to next
    if (segmentDistance === 0) {
      this.pathIndex++;
      this.pathProgress = 0;
      return;
    }

    // Calculate movement this frame in pixels
    const movement = this.speed * (delta / 1000);

    // Convert pixel movement to progress fraction of current segment
    this.pathProgress += movement / segmentDistance;

    // Advance through waypoints if progress exceeds 1
    while (this.pathProgress >= 1 && this.pathIndex < this.pathPositions.length - 1) {
      this.pathProgress -= 1;
      this.pathIndex++;

      // Check if we've reached the final waypoint
      if (this.pathIndex >= this.pathPositions.length - 1) {
        this.reachBase();
        return;
      }

      // Recalculate segment distance for the new segment
      const newCurrent = this.pathPositions[this.pathIndex];
      const newNext = this.pathPositions[this.pathIndex + 1];
      const newDx = newNext.x - newCurrent.x;
      const newDy = newNext.y - newCurrent.y;
      const newSegmentDistance = Math.sqrt(newDx * newDx + newDy * newDy);

      if (newSegmentDistance === 0) {
        // Skip zero-length segments
        this.pathProgress = 1;
        continue;
      }

      // Scale remaining progress to the new segment length
      this.pathProgress = (this.pathProgress * segmentDistance) / newSegmentDistance;
    }

    // Interpolate position between current and next waypoint
    const interpCurrent = this.pathPositions[this.pathIndex];
    const interpNext = this.pathPositions[Math.min(this.pathIndex + 1, this.pathPositions.length - 1)];

    this.x = interpCurrent.x + (interpNext.x - interpCurrent.x) * this.pathProgress;
    this.y = interpCurrent.y + (interpNext.y - interpCurrent.y) * this.pathProgress;
  }
}
