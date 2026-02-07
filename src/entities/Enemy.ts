import Phaser from 'phaser';
import { EnemyStats, Attribute, EnemyType } from '@/types';
import { DIGIMON_DATABASE } from '@/data/DigimonDatabase';
import { getPathPixelPositions, PixelPosition } from '@/utils/GridUtils';
import { EventBus, GameEvents } from '@/utils/EventBus';
import {
  ActiveEffect,
  STATUS_EFFECT_CONFIGS,
  EFFECT_INDICATOR_COLORS,
  getBaseEffectType,
  getEffectiveSpeedMultiplier,
  getEffectiveArmorMultiplier,
  calculateDotDamage,
  calculateRegenAmount,
} from '@/data/StatusEffects';
import {
  BossAbilityState,
  createBossAbilityState,
  tickBossAbility,
  getDamageReduction,
  BossAbilityAction,
} from '@/systems/BossAbilitySystem';

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
  public readonly isBoss: boolean;
  public isSplitChild: boolean = false;

  // Kill attribution: ID of the tower that last hit this enemy
  public lastHitByTowerID?: string;

  // Status effects
  public activeEffects: Map<string, ActiveEffect> = new Map();

  // Boss ability
  public bossAbilityState: BossAbilityState | null = null;
  public pendingBossActions: BossAbilityAction[] = [];

  // Visual elements
  private sprite: Phaser.GameObjects.Sprite;
  private healthBarBg: Phaser.GameObjects.Graphics;
  private healthBarFill: Phaser.GameObjects.Graphics;
  private effectIndicators: Phaser.GameObjects.Graphics;

  // Health bar dimensions (scaled for 36px cells)
  private static readonly HEALTH_BAR_WIDTH = 28;
  private static readonly HEALTH_BAR_HEIGHT = 4;
  private static readonly HEALTH_BAR_Y = -18;

  constructor(scene: Phaser.Scene, digimonId: string, waveScaling?: number) {
    super(scene, 0, 0);

    // Generate unique ID
    enemyCounter++;
    this.enemyID = `enemy_${enemyCounter}_${Date.now()}`;
    this.digimonId = digimonId;
    this.isBoss = digimonId.startsWith('boss_');

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
    // Use explicit spriteKey from database if set, otherwise strip "enemy_"/"boss_" prefix
    const spriteKey = dbStats.spriteKey ?? digimonId.replace(/^(enemy_|boss_)/, '');
    this.sprite = scene.add.sprite(0, 0, spriteKey);
    this.sprite.setOrigin(0.5, 0.5);

    // Scale 16px sprites to ~24px for enemies (fits in 36px cells)
    const targetSize = 24;
    const currentWidth = this.sprite.width || 16;
    const scaleFactor = targetSize / currentWidth;
    this.sprite.setScale(scaleFactor);

    this.add(this.sprite);

    // Visual indicator for shielded enemies: blue tint
    if (this.enemyType === 'shielded') {
      this.sprite.setTint(0x88aaff);
    }

    // Boss aura: pulsing colored glow
    if (this.isBoss) {
      const auraSpr = scene.add.sprite(0, 0, spriteKey);
      auraSpr.setOrigin(0.5, 0.5);
      auraSpr.setScale(scaleFactor * 1.4);
      auraSpr.setAlpha(0.3);
      auraSpr.setTint(0xff4444);
      auraSpr.setBlendMode(Phaser.BlendModes.ADD);
      this.addAt(auraSpr, 0); // Behind the main sprite

      // Pulsing animation
      scene.tweens.add({
        targets: auraSpr,
        alpha: { from: 0.2, to: 0.45 },
        scaleX: { from: scaleFactor * 1.3, to: scaleFactor * 1.6 },
        scaleY: { from: scaleFactor * 1.3, to: scaleFactor * 1.6 },
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Create health bar background
    this.healthBarBg = scene.add.graphics();
    this.add(this.healthBarBg);

    // Create health bar fill
    this.healthBarFill = scene.add.graphics();
    this.add(this.healthBarFill);

    // Create effect indicator graphics (drawn below health bar)
    this.effectIndicators = scene.add.graphics();
    this.add(this.effectIndicators);

    // Draw the initial health bar (respecting display settings)
    this.applyHealthBarVisibility();
    this.drawHealthBarBackground();
    this.updateHealthBar();

    // Initialize boss ability state if applicable
    if (this.isBoss && dbStats.bossAbility) {
      this.bossAbilityState = createBossAbilityState(dbStats.bossAbility);
    }

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
   * Show or hide the health bar based on the healthBarMode setting.
   */
  private applyHealthBarVisibility(): void {
    const mode = this.scene.registry.get('healthBarMode') ?? 'all';
    let visible = true;
    if (mode === 'off') {
      visible = false;
    } else if (mode === 'bosses') {
      visible = this.isBoss;
    }
    this.healthBarBg.setVisible(visible);
    this.healthBarFill.setVisible(visible);
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
   * Apply damage to this enemy, reduced by effective armor.
   * actualDamage = amount * (1 - effectiveArmor)
   */
  public takeDamage(amount: number): void {
    if (!this.isAlive) return;

    const effectiveArmor = this.getEffectiveArmor();
    let actualDamage = amount * (1 - effectiveArmor);

    // Boss damage shield (e.g. Transcendent Sword)
    if (this.bossAbilityState) {
      const reduction = getDamageReduction(this.bossAbilityState);
      if (reduction > 0) {
        actualDamage *= (1 - reduction);
      }
    }

    this.hp -= actualDamage;

    this.updateHealthBar();

    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
  }

  /**
   * Apply direct damage that bypasses armor (used for DoT effects).
   */
  public takeDamageRaw(amount: number): void {
    if (!this.isAlive) return;

    this.hp -= amount;

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
   * Splitter enemies also emit SPLITTER_DIED so WaveManager can spawn children.
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
      lastHitByTowerID: this.lastHitByTowerID,
    });

    // Splitter enemies spawn copies on death (split children don't further split)
    if (this.enemyType === 'splitter' && !this.isSplitChild) {
      const splitCount = this.digimonId === 'enemy_diaboromon' ? 4 : 2;
      EventBus.emit(GameEvents.SPLITTER_DIED, {
        digimonId: this.digimonId,
        splitCount,
        pathIndex: this.pathIndex,
        pathProgress: this.pathProgress,
        maxHp: this.maxHp,
        x: this.x,
        y: this.y,
      });
    }

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

  // ---------------------------------------------------------------------------
  // Status Effects
  // ---------------------------------------------------------------------------

  /**
   * Apply a status effect to this enemy.
   * If the effect already exists, refresh its duration and stack if applicable.
   * Compound effect types (e.g. 'burn_aoe') resolve to their base effect ('burn').
   */
  public applyEffect(effectType: string, sourceDamage: number): void {
    if (!this.isAlive) return;

    const baseType = getBaseEffectType(effectType);
    if (!baseType) return;

    const config = STATUS_EFFECT_CONFIGS[baseType];
    if (!config) return;

    const existing = this.activeEffects.get(baseType);
    if (existing) {
      // Refresh duration
      existing.remainingDuration = config.duration;
      // Update source damage if higher
      existing.sourceDamage = Math.max(existing.sourceDamage, sourceDamage);
      // Stack if applicable
      const maxStacks = config.maxStacks ?? 1;
      if (existing.stacks < maxStacks) {
        existing.stacks++;
      }
    } else {
      this.activeEffects.set(baseType, {
        id: baseType,
        remainingDuration: config.duration,
        tickTimer: 0,
        strength: config.strength,
        stacks: 1,
        sourceDamage,
      });
    }

    this.drawEffectIndicators();
  }

  /**
   * Process all active effects: tick durations, apply DoT damage, remove expired.
   * @param deltaSec - Time elapsed in seconds
   */
  public updateEffects(deltaSec: number): void {
    if (this.activeEffects.size === 0) return;

    const toRemove: string[] = [];
    const toAdd: [string, ActiveEffect][] = [];

    for (const [key, effect] of this.activeEffects) {
      effect.remainingDuration -= deltaSec;

      // Process DoT ticks
      const config = STATUS_EFFECT_CONFIGS[effect.id];
      if (config && config.tickInterval) {
        effect.tickTimer += deltaSec;
        while (effect.tickTimer >= config.tickInterval) {
          effect.tickTimer -= config.tickInterval;
          const dotDamage = calculateDotDamage(effect, config, this.maxHp);
          if (dotDamage > 0) {
            this.takeDamageRaw(dotDamage);
            // If enemy died from DoT, stop processing
            if (!this.isAlive) return;
          }
        }
      }

      // Mark expired effects for removal
      if (effect.remainingDuration <= 0) {
        // If freeze expired, queue thaw slow (1s slow at 40%)
        if (effect.id === 'freeze') {
          toAdd.push(['freeze_thaw', {
            id: 'freeze_thaw',
            remainingDuration: 1,
            tickTimer: 0,
            strength: 0.4,
            stacks: 1,
            sourceDamage: 0,
          }]);
        }
        toRemove.push(key);
      }
    }

    // Apply deferred removals and additions
    for (const key of toRemove) {
      this.activeEffects.delete(key);
    }
    for (const [key, effect] of toAdd) {
      this.activeEffects.set(key, effect);
    }

    // Redraw indicators if effects changed
    if (toRemove.length > 0 || toAdd.length > 0) {
      this.drawEffectIndicators();
    }
  }

  /**
   * Get the effective movement speed after applying CC effects.
   * Returns the base speed multiplied by the speed multiplier from active effects.
   */
  public getEffectiveSpeed(): number {
    return this.speed * getEffectiveSpeedMultiplier(this.activeEffects);
  }

  /**
   * Get the effective armor after applying debuff effects.
   * Returns the base armor multiplied by the armor multiplier from active effects.
   */
  public getEffectiveArmor(): number {
    return this.armor * getEffectiveArmorMultiplier(this.activeEffects);
  }

  /**
   * Draw small colored dots below the health bar to indicate active effects.
   */
  private drawEffectIndicators(): void {
    this.effectIndicators.clear();

    if (this.activeEffects.size === 0) return;

    const dotRadius = 2;
    const dotSpacing = 6;
    const startY = Enemy.HEALTH_BAR_Y + Enemy.HEALTH_BAR_HEIGHT + 3;

    // Collect active effect IDs that have indicator colors
    const activeIds: string[] = [];
    for (const [key] of this.activeEffects) {
      if (EFFECT_INDICATOR_COLORS[key] !== undefined) {
        activeIds.push(key);
      }
    }

    if (activeIds.length === 0) return;

    // Center the dots horizontally
    const totalWidth = (activeIds.length - 1) * dotSpacing;
    const startX = -totalWidth / 2;

    for (let i = 0; i < activeIds.length; i++) {
      const color = EFFECT_INDICATOR_COLORS[activeIds[i]];
      this.effectIndicators.fillStyle(color, 1);
      this.effectIndicators.fillCircle(startX + i * dotSpacing, startY, dotRadius);
    }
  }

  /**
   * Move along the path each frame.
   * Interpolates between waypoints based on speed and delta time.
   */
  public update(time: number, delta: number): void {
    if (!this.isAlive) return;

    // Convert delta from ms to seconds for effect processing
    const deltaSec = delta / 1000;

    // Update status effects (DoT ticks, duration countdown, expiry)
    this.updateEffects(deltaSec);

    // Enemy may have died from DoT damage
    if (!this.isAlive) return;

    // Tick boss ability (actions are collected in pendingBossActions for GameScene to execute)
    if (this.bossAbilityState) {
      const hpPercent = this.getHpPercent();
      const actions = tickBossAbility(this.bossAbilityState, deltaSec, hpPercent, this.maxHp);
      if (actions.length > 0) {
        this.pendingBossActions.push(...actions);
      }
    }

    // Regen enemies passively heal (2% max HP/sec), suppressed by poison
    if (this.enemyType === 'regen' && this.hp < this.maxHp) {
      const regenAmount = calculateRegenAmount(this.maxHp, deltaSec, this.activeEffects);
      if (regenAmount > 0) {
        this.heal(regenAmount);
      }
    }

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

    // Calculate movement this frame in pixels (using effective speed with CC effects)
    const effectiveSpeed = this.getEffectiveSpeed();
    const movement = effectiveSpeed * deltaSec;

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

    // Flip sprite based on horizontal movement direction
    // Default sprite faces left; flip when moving right
    const moveDx = interpNext.x - interpCurrent.x;
    if (moveDx > 0) {
      this.sprite.flipX = true;
    } else if (moveDx < 0) {
      this.sprite.flipX = false;
    }
    // When moveDx === 0 (vertical), keep current facing
  }
}
