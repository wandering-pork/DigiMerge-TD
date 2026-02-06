import Phaser from 'phaser';
import { Attribute } from '@/types';

// ---------------------------------------------------------------------------
// Local interfaces to avoid circular dependencies with Tower / Enemy
// ---------------------------------------------------------------------------

export interface ProjectileTarget {
  x: number;
  y: number;
  isAlive: boolean;
  takeDamage(amount: number): void;
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
const TRAIL_ALPHA = 0.35;

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

  /** Graphics object used to render a simple trailing line. */
  public trailGraphics: Phaser.GameObjects.Graphics;

  /** Previous frame position – used for the trail effect. */
  private prevX: number;
  private prevY: number;

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

    // --- Body: small filled circle ---
    this.bodyGraphics = scene.add.graphics();
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

    // Draw trail.
    this.drawTrail();
  }

  // -------------------------------------------------------------------------
  // Hit
  // -------------------------------------------------------------------------

  private hit(): void {
    if (this.target && this.target.isAlive) {
      this.target.takeDamage(this.damage);
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
    this.trailGraphics.lineStyle(2, color, TRAIL_ALPHA);
    this.trailGraphics.lineBetween(this.prevX, this.prevY, this.x, this.y);
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
