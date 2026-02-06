import Phaser from 'phaser';
import { Tower } from '@/entities/Tower';
import { canMerge, getMergeResult, MergeCandidate } from '@/systems/MergeSystem';
import { EventBus, GameEvents } from '@/utils/EventBus';

/**
 * TowerManager handles tower selection, merging, and selling.
 *
 * It owns the selected-tower state and mediates merge operations between
 * Tower entities, delegating validation and result calculation to MergeSystem.
 */
export class TowerManager {
  private scene: Phaser.Scene;
  private towerContainer: Phaser.GameObjects.Container;
  private selectedTower: Tower | null = null;

  constructor(scene: Phaser.Scene, towerContainer: Phaser.GameObjects.Container) {
    this.scene = scene;
    this.towerContainer = towerContainer;
  }

  // ---------------------------------------------------------------------------
  // Selection
  // ---------------------------------------------------------------------------

  /**
   * Select a tower. Deselects any previously selected tower first.
   * Emits TOWER_SELECTED with the tower instance.
   */
  public selectTower(tower: Tower): void {
    if (this.selectedTower && this.selectedTower !== tower) {
      this.deselectTower();
    }

    this.selectedTower = tower;
    tower.select();
    tower.showRange(true);
    EventBus.emit(GameEvents.TOWER_SELECTED, tower);
  }

  /**
   * Deselect the currently selected tower (if any).
   * Emits TOWER_DESELECTED.
   */
  public deselectTower(): void {
    if (this.selectedTower) {
      this.selectedTower.deselect();
      this.selectedTower.showRange(false);
      this.selectedTower = null;
      EventBus.emit(GameEvents.TOWER_DESELECTED);
    }
  }

  /**
   * Return the currently selected tower, or null if none.
   */
  public getSelectedTower(): Tower | null {
    return this.selectedTower;
  }

  // ---------------------------------------------------------------------------
  // Merge
  // ---------------------------------------------------------------------------

  /**
   * Attempt to merge towerA (survivor) with towerB (sacrifice).
   *
   * On success:
   * - towerA receives the survivor level and DP from MergeResult
   * - towerB is destroyed and removed from the towerContainer
   * - Emits TOWER_MERGED with merge details
   *
   * Returns true if the merge succeeded, false if invalid.
   */
  public tryMerge(towerA: Tower, towerB: Tower): boolean {
    // Build merge candidates from tower data
    const candidateA: MergeCandidate = {
      level: towerA.level,
      dp: towerA.dp,
      attribute: towerA.attribute,
      stage: towerA.stage,
    };

    const candidateB: MergeCandidate = {
      level: towerB.level,
      dp: towerB.dp,
      attribute: towerB.attribute,
      stage: towerB.stage,
    };

    // Validate merge eligibility
    if (!canMerge(candidateA, candidateB)) {
      return false;
    }

    // Calculate merge result
    const result = getMergeResult(candidateA, candidateB);

    // Apply result to survivor (towerA)
    towerA.setLevel(result.survivorLevel);
    towerA.dp = result.survivorDP;

    // Store sacrifice info before destruction
    const sacrificeID = towerB.towerID;
    const sacrificeDigimonId = towerB.digimonId;

    // Remove sacrifice from container and destroy
    this.towerContainer.remove(towerB);
    towerB.destroy();

    // If the sacrifice was selected, clear selection
    if (this.selectedTower === towerB) {
      this.selectedTower = null;
    }

    // Emit merge event
    EventBus.emit(GameEvents.TOWER_MERGED, {
      survivorID: towerA.towerID,
      sacrificeID,
      survivorDigimonId: towerA.digimonId,
      sacrificeDigimonId,
      survivorLevel: result.survivorLevel,
      survivorDP: result.survivorDP,
    });

    return true;
  }

  // ---------------------------------------------------------------------------
  // Sell
  // ---------------------------------------------------------------------------

  /**
   * Sell a tower, removing it from the game.
   * Returns the sell price (level * 25 DigiBytes).
   * Emits TOWER_SOLD with the tower ID and refund amount.
   */
  public sellTower(tower: Tower): number {
    const sellPrice = tower.level * 25;
    const towerID = tower.towerID;

    // Clear selection if selling the selected tower
    if (this.selectedTower === tower) {
      this.selectedTower = null;
    }

    // Remove from container and destroy
    this.towerContainer.remove(tower);
    tower.destroy();

    EventBus.emit(GameEvents.TOWER_SOLD, { towerID, refund: sellPrice });

    return sellPrice;
  }

  // ---------------------------------------------------------------------------
  // Utility
  // ---------------------------------------------------------------------------

  /**
   * Find a tower at the given grid position within the towerContainer.
   */
  public getTowerAt(col: number, row: number): Tower | null {
    for (const child of this.towerContainer.list) {
      const tower = child as Tower;
      if (tower.gridCol === col && tower.gridRow === row) {
        return tower;
      }
    }
    return null;
  }

  /**
   * Get all towers currently in the container.
   */
  public getAllTowers(): Tower[] {
    return this.towerContainer.list as Tower[];
  }

  /**
   * Find all towers that are eligible merge partners for a given tower.
   */
  public findMergeCandidates(tower: Tower): Tower[] {
    const candidate: MergeCandidate = {
      level: tower.level,
      dp: tower.dp,
      attribute: tower.attribute,
      stage: tower.stage,
    };

    const candidates: Tower[] = [];
    for (const child of this.towerContainer.list) {
      const other = child as Tower;
      if (other === tower) continue;

      const otherCandidate: MergeCandidate = {
        level: other.level,
        dp: other.dp,
        attribute: other.attribute,
        stage: other.stage,
      };

      if (canMerge(candidate, otherCandidate)) {
        candidates.push(other);
      }
    }

    return candidates;
  }

  /**
   * Clean up event listeners and references.
   */
  public cleanup(): void {
    this.selectedTower = null;
  }
}
