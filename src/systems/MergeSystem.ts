import { Attribute, Stage, BonusEffect } from '@/types';
import { canMerge as dpCanMerge, getDPFromMerge } from '@/systems/DPSystem';

/**
 * Represents the minimum data needed to evaluate a merge between two Digimon.
 */
export interface MergeCandidate {
  level: number;
  dp: number;
  attribute: Attribute;
  stage: Stage;
  effectType?: string;
  effectChance?: number;
  bonusEffects?: BonusEffect[];
}

/**
 * The result of a successful merge operation.
 */
export interface MergeResult {
  survivorLevel: number;
  survivorDP: number;
  bonusEffects: BonusEffect[];
}

/**
 * Check whether two MergeCandidates are eligible to merge.
 * Delegates to DPSystem.canMerge for attribute/stage validation:
 * - Must be the same stage
 * - Must be the same attribute, OR at least one must be FREE
 */
export function canMerge(a: MergeCandidate, b: MergeCandidate): boolean {
  return dpCanMerge(a.attribute, b.attribute, a.stage, b.stage);
}

/**
 * Calculate the stats the survivor receives after a merge.
 * - survivorLevel = max(a.level, b.level)
 * - survivorDP    = max(a.dp, b.dp) + 1
 */
export function getMergeResult(a: MergeCandidate, b: MergeCandidate): MergeResult {
  return {
    survivorLevel: Math.max(a.level, b.level),
    survivorDP: getDPFromMerge(a.dp, b.dp),
    bonusEffects: calculateMergeEffects(
      a.bonusEffects ?? [],
      b.effectType,
      b.effectChance,
    ),
  };
}

/**
 * Maximum number of bonus effects a single tower can hold.
 */
export const MAX_BONUS_EFFECTS = 2;

/**
 * Proc chance increase when stacking the same effect type.
 */
export const STACK_CHANCE_BONUS = 0.05;

/**
 * Calculate the bonus effects the survivor receives after a merge.
 * - Sacrifice's primary effect is transferred at half proc chance
 * - If survivor already has the same effect as a bonus, stack +5% chance
 * - Maximum 2 bonus effects per tower
 * - Existing survivor bonus effects are preserved
 */
export function calculateMergeEffects(
  survivorBonusEffects: BonusEffect[],
  sacrificeEffectType?: string,
  sacrificeEffectChance?: number,
): BonusEffect[] {
  const result = [...survivorBonusEffects];

  if (!sacrificeEffectType || !sacrificeEffectChance || sacrificeEffectChance <= 0) {
    return result;
  }

  const halvedChance = sacrificeEffectChance / 2;

  // Check if survivor already has this effect as a bonus
  const existingIndex = result.findIndex(e => e.effectType === sacrificeEffectType);

  if (existingIndex >= 0) {
    // Stack: increase existing effect's chance by STACK_CHANCE_BONUS
    result[existingIndex] = {
      effectType: result[existingIndex].effectType,
      effectChance: Math.min(1.0, result[existingIndex].effectChance + STACK_CHANCE_BONUS),
    };
    return result;
  }

  // Add as new bonus effect if under the cap
  if (result.length < MAX_BONUS_EFFECTS) {
    result.push({
      effectType: sacrificeEffectType,
      effectChance: halvedChance,
    });
  }

  return result;
}
