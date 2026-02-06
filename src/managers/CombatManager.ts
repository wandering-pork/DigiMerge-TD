import Phaser from 'phaser';
import { Tower } from '@/entities/Tower';
import { Enemy } from '@/entities/Enemy';
import { Projectile } from '@/entities/Projectile';
import { findTarget, MockTarget } from '@/systems/TargetingSystem';
import { getAttributeMultiplier } from '@/systems/AttributeSystem';

/**
 * CombatManager handles tower targeting and attack execution each frame.
 * It iterates over all towers, finds valid targets using the TargetingSystem,
 * calculates attribute-modified damage, and spawns homing projectiles.
 */
export class CombatManager {
  private scene: Phaser.Scene;
  private towerContainer: Phaser.GameObjects.Container;
  private enemyContainer: Phaser.GameObjects.Container;
  private projectileContainer: Phaser.GameObjects.Container;

  constructor(
    scene: Phaser.Scene,
    towerContainer: Phaser.GameObjects.Container,
    enemyContainer: Phaser.GameObjects.Container,
    projectileContainer: Phaser.GameObjects.Container,
  ) {
    this.scene = scene;
    this.towerContainer = towerContainer;
    this.enemyContainer = enemyContainer;
    this.projectileContainer = projectileContainer;
  }

  // ---------------------------------------------------------------------------
  // Main update loop
  // ---------------------------------------------------------------------------

  /**
   * Called each frame by the GameScene. Checks every tower for attack readiness,
   * finds a target within range, and fires a projectile if one is found.
   */
  public update(_time: number, _delta: number): void {
    const towers = this.towerContainer.list as Tower[];
    const enemies = this.enemyContainer.list as Enemy[];

    // Filter to only alive enemies once per frame
    const aliveEnemies = enemies.filter(e => e.isAlive);
    if (aliveEnemies.length === 0) return;

    // Convert alive enemies to MockTarget format once for all towers
    const mockTargets = aliveEnemies.map(e => this.enemyToTarget(e));

    for (const tower of towers) {
      if (!tower.canAttack()) continue;

      const target = findTarget(
        mockTargets,
        tower.x,
        tower.y,
        tower.getRange(),
        tower.targetPriority,
      );

      if (target === null) continue;

      // Find the actual Enemy instance that matches the chosen MockTarget.
      // We match by position since MockTarget positions come directly from the enemy.
      const targetEnemy = aliveEnemies.find(
        e => e.x === target.x && e.y === target.y,
      );

      if (targetEnemy) {
        this.fireProjectile(tower, targetEnemy);
        tower.resetCooldown();
      }
    }

    // Update all active projectiles
    const projectiles = this.projectileContainer.list as Projectile[];
    for (const projectile of projectiles) {
      projectile.update(_time, _delta);
    }
  }

  // ---------------------------------------------------------------------------
  // Projectile creation
  // ---------------------------------------------------------------------------

  /**
   * Create a new projectile from a tower aimed at an enemy.
   * Damage is the tower's level-scaled damage multiplied by the attribute
   * effectiveness against the target's attribute.
   */
  public fireProjectile(tower: Tower, target: Enemy): void {
    const baseDamage = tower.getAttackDamage();
    const attributeMult = getAttributeMultiplier(tower.attribute, target.attribute);
    const damage = baseDamage * attributeMult;

    const projectile = new Projectile(
      this.scene,
      tower.x,
      tower.y,
      damage,
      target,
      tower.attribute,
    );

    this.projectileContainer.add(projectile);
  }

  // ---------------------------------------------------------------------------
  // Target conversion
  // ---------------------------------------------------------------------------

  /**
   * Convert an Enemy entity into the lightweight MockTarget interface
   * expected by the TargetingSystem.
   */
  public enemyToTarget(enemy: Enemy): MockTarget {
    return {
      x: enemy.x,
      y: enemy.y,
      hp: enemy.hp,
      maxHp: enemy.maxHp,
      speed: enemy.speed,
      pathIndex: enemy.pathIndex,
      isFlying: enemy.enemyType === 'flying',
      isAlive: enemy.isAlive,
    };
  }

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  /**
   * Destroy all active projectiles. Called when resetting or ending the game.
   */
  public cleanup(): void {
    const projectiles = [...this.projectileContainer.list] as Projectile[];
    for (const projectile of projectiles) {
      projectile.destroy();
    }
  }
}
