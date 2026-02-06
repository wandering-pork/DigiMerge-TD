import { Stage } from '@/types';
import {
  getLevelUpCost as constantsGetLevelUpCost,
  calculateMaxLevel as constantsCalculateMaxLevel,
} from '@/config/Constants';

/**
 * Get the DigiBytes cost to level up from currentLevel to currentLevel + 1.
 * Formula: 3 * currentLevel * stageMultiplier
 * Stage multipliers: In-Training ×1, Rookie ×1.5, Champion ×2, Ultimate ×3, Mega ×4, Ultra ×5
 */
export function getLevelUpCost(currentLevel: number, stage?: Stage): number {
  return constantsGetLevelUpCost(currentLevel, stage);
}

/**
 * Check whether a tower can level up (current level is strictly below max).
 */
export function canLevelUp(currentLevel: number, maxLevel: number): boolean {
  return currentLevel < maxLevel;
}

/**
 * Calculate the maximum level a Digimon can reach based on its current stage,
 * accumulated DP, origin stage, and current stage.
 *
 * Formula: baseMaxLevel + (dp * dpBonus) + ((currentStage - originStage) * 5)
 */
export function calculateMaxLevel(
  stage: Stage,
  dp: number,
  originStage: Stage,
  currentStage: Stage,
): number {
  return constantsCalculateMaxLevel(stage, dp, originStage, currentStage);
}

/**
 * Get damage scaled by level (without attribute multiplier).
 * Formula: baseDamage * (1 + level * 0.02)
 */
export function getScaledDamage(baseDamage: number, level: number): number {
  return baseDamage * (1 + level * 0.02);
}

/**
 * Get attack speed scaled by level.
 * Formula: baseSpeed * (1 + level * 0.01)
 */
export function getScaledSpeed(baseSpeed: number, level: number): number {
  return baseSpeed * (1 + level * 0.01);
}

/**
 * Calculate the total DigiBytes cost to level from fromLevel to toLevel.
 * Sums getLevelUpCost(i, stage) for i = fromLevel .. toLevel - 1.
 * Returns 0 if toLevel <= fromLevel.
 */
export function getTotalLevelUpCost(fromLevel: number, toLevel: number, stage?: Stage): number {
  if (toLevel <= fromLevel) {
    return 0;
  }

  let total = 0;
  for (let i = fromLevel; i < toLevel; i++) {
    total += getLevelUpCost(i, stage);
  }
  return total;
}

/**
 * Find the highest level reachable from currentLevel given a budget of DigiBytes.
 * Returns currentLevel if budget can't afford even one level up.
 * Returns at most maxLevel.
 */
export function getMaxAffordableLevel(
  currentLevel: number,
  maxLevel: number,
  budget: number,
  stage?: Stage,
): number {
  if (currentLevel >= maxLevel || budget <= 0) return currentLevel;

  let spent = 0;
  let level = currentLevel;

  while (level < maxLevel) {
    const cost = getLevelUpCost(level, stage);
    if (spent + cost > budget) break;
    spent += cost;
    level++;
  }

  return level;
}
