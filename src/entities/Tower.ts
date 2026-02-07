import Phaser from 'phaser';
import { DigimonStats, Stage, Attribute, TargetPriority, TowerSaveData, BonusEffect } from '@/types';
import { DIGIMON_DATABASE } from '@/data/DigimonDatabase';
import { STAGE_CONFIG, GRID } from '@/config/Constants';
import { gridToPixelCenter } from '@/utils/GridUtils';

export class Tower extends Phaser.GameObjects.Container {
  // Identity
  public readonly towerID: string;
  public digimonId: string;
  public stats: DigimonStats;

  // Progression
  public level: number;
  public dp: number;
  public attribute: Attribute;
  public stage: Stage;
  public readonly originStage: Stage;

  // Grid position
  public gridCol: number;
  public gridRow: number;

  // Combat
  public targetPriority: TargetPriority;
  public attackCooldown: number;

  // Combat tracking
  public killCount: number = 0;
  public totalDamageDealt: number = 0;

  // Boss debuffs
  public stunTimer: number = 0;
  public bonusEffects: BonusEffect[] = [];
  public rangeReductionPercent: number = 0;

  // Selection state
  public isSelected: boolean;

  // Visual children
  private sprite: Phaser.GameObjects.Sprite;
  private levelText: Phaser.GameObjects.Text;
  private selectionHighlight: Phaser.GameObjects.Graphics;
  private rangeCircle: Phaser.GameObjects.Graphics;
  private stunIndicator: Phaser.GameObjects.Text | null = null;

  constructor(
    scene: Phaser.Scene,
    col: number,
    row: number,
    digimonId: string,
    originStage: Stage
  ) {
    const pos = gridToPixelCenter(col, row);
    super(scene, pos.x, pos.y);

    // Look up stats from database
    const dbStats = DIGIMON_DATABASE.towers[digimonId];
    if (!dbStats) {
      throw new Error(`Tower: Digimon ID "${digimonId}" not found in database`);
    }

    // Identity
    this.towerID = Phaser.Math.RND.uuid();
    this.digimonId = digimonId;
    this.stats = { ...dbStats };

    // Progression
    this.level = 1;
    this.dp = 0;
    this.attribute = dbStats.attribute;
    this.stage = dbStats.stageTier;
    this.originStage = originStage;

    // Grid
    this.gridCol = col;
    this.gridRow = row;

    // Combat
    this.targetPriority = dbStats.priority ?? TargetPriority.FIRST;
    this.attackCooldown = 0;

    // State
    this.isSelected = false;

    // --- Create visual children ---

    // Selection highlight (yellow border rectangle, hidden by default)
    this.selectionHighlight = scene.add.graphics();
    this.selectionHighlight.lineStyle(2, 0xffff00, 1);
    this.selectionHighlight.strokeRect(
      -GRID.CELL_SIZE / 2,
      -GRID.CELL_SIZE / 2,
      GRID.CELL_SIZE,
      GRID.CELL_SIZE
    );
    this.selectionHighlight.setVisible(false);
    this.add(this.selectionHighlight);

    // Range circle (hidden by default)
    this.rangeCircle = scene.add.graphics();
    this.rangeCircle.setVisible(false);
    this.add(this.rangeCircle);

    // Digimon sprite (offset upward slightly to make room for level text)
    this.sprite = scene.add.sprite(0, -4, dbStats.spriteKey ?? digimonId);
    this.sprite.setScale(this.getSpriteScale());
    this.add(this.sprite);

    // Level text below sprite
    this.levelText = scene.add.text(0, 12, `Lv.${this.level}`, {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center',
    });
    this.levelText.setOrigin(0.5, 0.5);
    this.add(this.levelText);

    // Set container size for hit detection and make interactive
    this.setSize(GRID.CELL_SIZE, GRID.CELL_SIZE);
    this.setInteractive();
  }

  // ---------------------------------------------------------------------------
  // Selection
  // ---------------------------------------------------------------------------

  /**
   * Select this tower, showing the selection highlight.
   */
  public select(): void {
    this.isSelected = true;
    this.selectionHighlight.setVisible(true);
  }

  /**
   * Deselect this tower, hiding the selection highlight.
   */
  public deselect(): void {
    this.isSelected = false;
    this.selectionHighlight.setVisible(false);
  }

  // ---------------------------------------------------------------------------
  // Level & Progression
  // ---------------------------------------------------------------------------

  /**
   * Set the tower's level and update the level text display.
   */
  public setLevel(level: number): void {
    this.level = level;
    this.levelText.setText(`Lv.${this.level}`);
  }

  /**
   * Change this tower's Digimon (used for evolution).
   * Updates sprite, stats, stage, and attribute.
   */
  public setDigimon(digimonId: string): void {
    const dbStats = DIGIMON_DATABASE.towers[digimonId];
    if (!dbStats) {
      throw new Error(`Tower.setDigimon: Digimon ID "${digimonId}" not found in database`);
    }

    this.digimonId = digimonId;
    this.stats = { ...dbStats };
    this.stage = dbStats.stageTier;
    this.attribute = dbStats.attribute;
    this.targetPriority = dbStats.priority ?? this.targetPriority;

    // Update sprite texture and scale
    this.sprite.setTexture(dbStats.spriteKey ?? digimonId);
    this.sprite.setScale(this.getSpriteScale());
  }

  // ---------------------------------------------------------------------------
  // Combat Calculations
  // ---------------------------------------------------------------------------

  /**
   * Return the attack range in pixels.
   * Adds +1.0 cell base bonus so even In-Training towers can reach adjacent path cells comfortably.
   * Applies any boss-inflicted range reduction.
   */
  public getRange(): number {
    const base = (this.stats.range + 1.0) * GRID.CELL_SIZE;
    return base * (1 - this.rangeReductionPercent);
  }

  /**
   * Return the effective range in cells (for UI display).
   */
  public getRangeCells(): number {
    return this.stats.range + 1.0;
  }

  /**
   * Return effective attack damage, scaled by level.
   * Formula: baseDamage * (1 + level * 0.02)
   */
  public getAttackDamage(): number {
    return this.stats.baseDamage * (1 + this.level * 0.02);
  }

  /**
   * Return effective attack speed (attacks per second), scaled by level.
   * Formula: baseSpeed * (1 + level * 0.01)
   */
  public getAttackSpeed(): number {
    return this.stats.baseSpeed * (1 + this.level * 0.01);
  }

  /**
   * Return true if the tower can fire (cooldown has expired and not stunned).
   */
  public canAttack(): boolean {
    return this.attackCooldown <= 0 && this.stunTimer <= 0;
  }

  /**
   * Reset the attack cooldown based on current attack speed.
   * Cooldown in ms = 1000 / attacksPerSecond.
   */
  public resetCooldown(): void {
    this.attackCooldown = 1000 / this.getAttackSpeed();
  }

  // ---------------------------------------------------------------------------
  // Update Loop
  // ---------------------------------------------------------------------------

  /**
   * Called each frame. Reduces attack cooldown and stun timer by elapsed delta (ms).
   */
  public update(_time: number, delta: number): void {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }
    if (this.stunTimer > 0) {
      this.stunTimer -= delta / 1000; // stunTimer is in seconds
      if (this.stunTimer <= 0) {
        this.stunTimer = 0;
        this.clearStunVisual();
      }
    }
  }

  /**
   * Apply a stun debuff to this tower for the given duration in seconds.
   */
  public applyStun(durationSec: number): void {
    this.stunTimer = Math.max(this.stunTimer, durationSec);
    this.showStunVisual();
  }

  private showStunVisual(): void {
    if (!this.stunIndicator) {
      this.stunIndicator = this.scene.add.text(0, -18, '!', {
        fontSize: '14px',
        color: '#ff4444',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5);
      this.add(this.stunIndicator);
    }
    this.stunIndicator.setVisible(true);
    this.sprite.setTint(0xff6666);
  }

  private clearStunVisual(): void {
    if (this.stunIndicator) {
      this.stunIndicator.setVisible(false);
    }
    this.sprite.clearTint();
  }

  // ---------------------------------------------------------------------------
  // Range Display
  // ---------------------------------------------------------------------------

  /**
   * Toggle the range circle visibility. Redraws if showing.
   */
  public showRange(show: boolean): void {
    if (show) {
      const range = this.getRange();
      this.rangeCircle.clear();
      this.rangeCircle.lineStyle(1, 0x00ff00, 0.5);
      this.rangeCircle.fillStyle(0x00ff00, 0.1);
      this.rangeCircle.fillCircle(0, 0, range);
      this.rangeCircle.strokeCircle(0, 0, range);
    }
    this.rangeCircle.setVisible(show);
  }

  // ---------------------------------------------------------------------------
  // Serialization
  // ---------------------------------------------------------------------------

  /**
   * Return a plain object suitable for JSON serialization (save game).
   */
  public toSaveData(): TowerSaveData {
    return {
      digimonId: this.digimonId,
      level: this.level,
      dp: this.dp,
      originStage: this.originStage,
      gridPosition: { col: this.gridCol, row: this.gridRow },
      targetPriority: this.targetPriority,
      bonusEffects: this.bonusEffects.length > 0 ? [...this.bonusEffects] : undefined,
      killCount: this.killCount > 0 ? this.killCount : undefined,
      totalDamageDealt: this.totalDamageDealt > 0 ? Math.round(this.totalDamageDealt) : undefined,
    };
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  /**
   * Determine sprite scale so small pixel art (~16px) fits nicely in the cell.
   * Target visual size is ~28px (fits 36px cells), so scale = 28 / nativeSize.
   * Falls back to 1.75x if the texture dimensions are unknown.
   */
  private getSpriteScale(): number {
    const targetSize = GRID.CELL_SIZE * 0.78; // ~28px for 36px cells
    const texture = this.scene.textures.get(this.digimonId);
    if (texture && texture.source.length > 0) {
      const frame = texture.get();
      const maxDim = Math.max(frame.width, frame.height);
      if (maxDim > 0) {
        return targetSize / maxDim;
      }
    }
    // Default: assume 16px native art
    return targetSize / 16;
  }
}
