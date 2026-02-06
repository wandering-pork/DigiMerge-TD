import { Stage, Attribute } from '@/types';
import { STAGE_CONFIG } from '@/config/Constants';

/**
 * Calculate the DP (Digivolution Points) gained from merging two Digimon.
 * The survivor gets the max DP of the two + 1.
 *
 * Formula: max(dpA, dpB) + 1
 */
export function getDPFromMerge(dpA: number, dpB: number): number {
  return Math.max(dpA, dpB) + 1;
}

/**
 * Calculate the max level bonus from DP for a given stage.
 * Each stage has a dpBonus multiplier from STAGE_CONFIG.
 *
 * Formula: dp * dpBonus
 */
export function getMaxLevelBonus(dp: number, stage: Stage): number {
  return dp * STAGE_CONFIG[stage].dpBonus;
}

/**
 * Validate whether two Digimon can merge.
 * Rules:
 * - Must be the same stage
 * - Must be the same attribute, OR at least one must be FREE
 */
export function canMerge(
  attributeA: Attribute,
  attributeB: Attribute,
  stageA: Stage,
  stageB: Stage,
): boolean {
  // Stages must match
  if (stageA !== stageB) {
    return false;
  }

  // Same attribute always works
  if (attributeA === attributeB) {
    return true;
  }

  // FREE can merge with any attribute
  if (attributeA === Attribute.FREE || attributeB === Attribute.FREE) {
    return true;
  }

  return false;
}
