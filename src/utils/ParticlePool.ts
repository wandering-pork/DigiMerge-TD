import Phaser from 'phaser';

/**
 * ParticlePool -- Lightweight object pool for Phaser Graphics used as particles.
 *
 * Instead of creating and destroying Graphics each frame, acquire from pool
 * and release back when done. The pool grows lazily as needed.
 */
export class ParticlePool {
  private scene: Phaser.Scene;
  private pool: Phaser.GameObjects.Graphics[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Acquire a Graphics object from the pool (or create one if empty). */
  acquire(): Phaser.GameObjects.Graphics {
    // Find an inactive one first
    for (const g of this.pool) {
      if (!g.active) {
        g.clear();
        g.setAlpha(1);
        g.setScale(1, 1);
        g.setVisible(true);
        g.setActive(true);
        g.setDepth(0);
        return g;
      }
    }
    // None available -- create new
    const g = this.scene.add.graphics();
    this.pool.push(g);
    return g;
  }

  /** Release a Graphics object back to the pool. */
  release(g: Phaser.GameObjects.Graphics): void {
    g.clear();
    g.setVisible(false);
    g.setActive(false);
  }

  /** Destroy all pooled objects (call on scene shutdown). */
  destroy(): void {
    for (const g of this.pool) {
      g.destroy();
    }
    this.pool = [];
  }

  /** Get pool stats for debugging. */
  get stats(): { total: number; active: number; available: number } {
    let active = 0;
    for (const g of this.pool) {
      if (g.active) active++;
    }
    return { total: this.pool.length, active, available: this.pool.length - active };
  }
}
