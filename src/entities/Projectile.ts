import Phaser from 'phaser';
import { Attribute } from '@/types';
import { EventBus, GameEvents } from '@/utils/EventBus';

// ---------------------------------------------------------------------------
// Local interfaces to avoid circular dependencies with Tower / Enemy
// ---------------------------------------------------------------------------

export interface ProjectileTarget {
  x: number;
  y: number;
  isAlive: boolean;
  takeDamage(amount: number): void;
  applyEffect?(effectType: string, sourceDamage: number): void;
}

export interface ProjectileSource {
  x: number;
  y: number;
  attribute: Attribute;
}

// ---------------------------------------------------------------------------
// Attribute -> projectile colour mapping
// ---------------------------------------------------------------------------

const ATTRIBUTE_COLORS: Record<Attribute, number> = {
  [Attribute.VACCINE]: 0x44aaff, // blue
  [Attribute.DATA]: 0x44ff44, // green
  [Attribute.VIRUS]: 0xff4444, // red
  [Attribute.FREE]: 0xffff44, // yellow
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_SPEED = 300; // pixels per second
const BODY_RADIUS = 6;
const HIT_DISTANCE = 10; // px – close enough to count as a hit
const MAX_TRAIL_POINTS = 6;

// ---------------------------------------------------------------------------
// Projectile
// ---------------------------------------------------------------------------

export class Projectile extends Phaser.GameObjects.Container {
  /** Damage dealt on hit. */
  public damage: number;

  /** Movement speed in pixels per second. */
  public speed: number;

  /** The enemy this projectile is homing toward. */
  public target: ProjectileTarget | null;

  /** Attribute of the tower that fired this projectile. */
  public sourceAttribute: Attribute;

  /** Whether this projectile is still in flight. */
  public isActive: boolean;

  /** Status effect to apply on hit (null if none). */
  public effectType: string | null = null;

  /** Tower's base damage, used for DoT calculations on the applied effect. */
  public sourceDamage: number = 0;

  /** Attribute multiplier applied to this projectile's damage (for damage number coloring). */
  public attributeMultiplier: number = 1;

  /** Graphics object used to render a simple trailing line. */
  public trailGraphics: Phaser.GameObjects.Graphics;

  /** Previous frame position – used for the trail effect. */
  private prevX: number;
  private prevY: number;

  /** Trail position history for particle-style trail. */
  private trailPositions: { x: number; y: number }[] = [];

  /** The small filled-circle body graphic. */
  private bodyGraphics: Phaser.GameObjects.Graphics;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    damage: number,
    target: ProjectileTarget,
    sourceAttribute: Attribute
  ) {
    super(scene, x, y);

    this.damage = damage;
    this.speed = DEFAULT_SPEED;
    this.target = target;
    this.sourceAttribute = sourceAttribute;
    this.isActive = true;

    this.prevX = x;
    this.prevY = y;

    const color = ATTRIBUTE_COLORS[sourceAttribute] ?? 0xffffff;

    // --- Body: glow + solid circle ---
    this.bodyGraphics = scene.add.graphics();
    // Outer glow layer
    this.bodyGraphics.fillStyle(color, 0.15);
    this.bodyGraphics.fillCircle(0, 0, BODY_RADIUS * 2.5);
    // Inner glow layer
    this.bodyGraphics.fillStyle(color, 0.3);
    this.bodyGraphics.fillCircle(0, 0, BODY_RADIUS * 1.5);
    // Solid core
    this.bodyGraphics.fillStyle(color, 1);
    this.bodyGraphics.fillCircle(0, 0, BODY_RADIUS);
    this.add(this.bodyGraphics);

    // --- Trail graphics (drawn each frame, cleared first) ---
    this.trailGraphics = scene.add.graphics();
    this.trailGraphics.setDepth(this.depth - 1);
    // Trail is added to the scene directly (world-space), not to the container,
    // so that the line stays in place as the container moves.
  }

  // -------------------------------------------------------------------------
  // Update
  // -------------------------------------------------------------------------

  public update(_time: number, delta: number): void {
    if (!this.isActive || this.target === null) {
      return;
    }

    // If the target died before we arrived, deactivate without dealing damage.
    if (!this.target.isAlive) {
      this.deactivate();
      return;
    }

    // Store previous position for the trail.
    this.prevX = this.x;
    this.prevY = this.y;

    // Direction and distance to target.
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Close enough – register a hit.
    if (distance < HIT_DISTANCE) {
      this.hit();
      return;
    }

    // Move toward the target.
    const step = this.speed * (delta / 1000);
    const ratio = step / distance;
    this.x += dx * ratio;
    this.y += dy * ratio;

    // Record trail position.
    this.trailPositions.push({ x: this.x, y: this.y });
    if (this.trailPositions.length > MAX_TRAIL_POINTS) {
      this.trailPositions.shift();
    }

    // Draw trail.
    this.drawTrail();
  }

  // -------------------------------------------------------------------------
  // Hit
  // -------------------------------------------------------------------------

  private hit(): void {
    if (this.target && this.target.isAlive) {
      // Spawn hit particles before any state changes
      this.spawnHitParticles();

      this.target.takeDamage(this.damage);

      // Emit damage dealt event for floating damage numbers
      EventBus.emit(GameEvents.DAMAGE_DEALT, {
        x: this.target.x,
        y: this.target.y,
        damage: this.damage,
        multiplier: this.attributeMultiplier,
      });

      // Apply status effect if the projectile carries one
      if (this.effectType && this.target.applyEffect) {
        this.target.applyEffect(this.effectType, this.sourceDamage);
      }
    }

    this.isActive = false;
    this.target = null;

    // Brief hit effect: scale up + fade out, then destroy.
    this.scene.tweens.add({
      targets: this,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 120,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.cleanup();
      },
    });
  }

  // -------------------------------------------------------------------------
  // Hit particles
  // -------------------------------------------------------------------------

  /**
   * Spawn small Graphics-circle particles at the target position on hit.
   * Color is based on the projectile's status effect type, falling back to
   * the source attribute color when there is no effect.
   */
  private spawnHitParticles(): void {
    if (!this.target) return;

    const tx = this.target.x;
    const ty = this.target.y;

    // Determine particle color from effect type
    let color = ATTRIBUTE_COLORS[this.sourceAttribute] ?? 0xffffff;
    if (this.effectType) {
      if (this.effectType.includes('burn')) color = 0xff6600;
      else if (this.effectType.includes('freeze')) color = 0x66ccff;
      else if (this.effectType.includes('poison')) color = 0xaa44ff;
      else if (this.effectType.includes('slow')) color = 0x44ffcc;
      else if (this.effectType.includes('stun')) color = 0xffff00;
      else if (this.effectType.includes('armor')) color = 0xcccccc;
    }

    const count = 5;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 8 + Math.random() * 14;
      const endX = tx + Math.cos(angle) * dist;
      const endY = ty + Math.sin(angle) * dist;
      const radius = 2 + Math.random() * 2;

      const g = this.scene.add.graphics();
      g.fillStyle(color, 0.8);
      g.fillCircle(0, 0, radius);
      g.setPosition(tx, ty);

      this.scene.tweens.add({
        targets: g,
        x: endX,
        y: endY,
        alpha: 0,
        duration: 200 + Math.random() * 100,
        ease: 'Quad.easeOut',
        onComplete: () => g.destroy(),
      });
    }
  }

  // -------------------------------------------------------------------------
  // Deactivate (target lost / out-of-bounds)
  // -------------------------------------------------------------------------

  public deactivate(): void {
    this.isActive = false;
    this.target = null;

    // Fade out quickly, then destroy.
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 80,
      ease: 'Linear',
      onComplete: () => {
        this.cleanup();
      },
    });
  }

  // -------------------------------------------------------------------------
  // Trail drawing
  // -------------------------------------------------------------------------

  private drawTrail(): void {
    const color = ATTRIBUTE_COLORS[this.sourceAttribute] ?? 0xffffff;
    this.trailGraphics.clear();

    const len = this.trailPositions.length;
    if (len === 0) return;

    // Draw fading circles at each trail position (oldest -> newest).
    for (let i = 0; i < len; i++) {
      const t = (i + 1) / len; // 0..1, where 1 = newest
      const alpha = t * 0.45;
      const radius = 1 + t * 3; // 1px oldest, 4px newest
      this.trailGraphics.fillStyle(color, alpha);
      this.trailGraphics.fillCircle(
        this.trailPositions[i].x,
        this.trailPositions[i].y,
        radius
      );
    }

    // Draw thin connecting lines between trail points for visual smoothness.
    if (len >= 2) {
      for (let i = 1; i < len; i++) {
        const t = (i + 1) / len;
        this.trailGraphics.lineStyle(1.5, color, t * 0.2);
        this.trailGraphics.lineBetween(
          this.trailPositions[i - 1].x,
          this.trailPositions[i - 1].y,
          this.trailPositions[i].x,
          this.trailPositions[i].y
        );
      }
    }
  }

  // -------------------------------------------------------------------------
  // Cleanup
  // -------------------------------------------------------------------------

  /**
   * Remove this projectile and its associated graphics from the scene.
   */
  private cleanup(): void {
    if (this.trailGraphics) {
      this.trailGraphics.clear();
      this.trailGraphics.destroy();
    }
    this.destroy();
  }
}
