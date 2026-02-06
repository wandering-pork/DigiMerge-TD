import { Stage } from '@/types';
import { ORIGIN_MAX_STAGE, DIGIVOLVE_COSTS } from '@/config/Constants';

/**
 * Get the maximum evolution stage allowed for a given origin (spawn) stage.
 */
export function getMaxEvolutionStage(originStage: Stage): Stage {
  return ORIGIN_MAX_STAGE[originStage];
}

/**
 * Check whether a Digimon at the current stage can evolve to the next stage,
 * given its origin stage constraint.
 *
 * Returns false if already at ULTRA (no further evolution) or if the next
 * stage would exceed the origin-based maximum.
 */
export function canEvolve(currentStage: Stage, originStage: Stage): boolean {
  // ULTRA is the highest stage — cannot evolve further
  if (currentStage >= Stage.ULTRA) {
    return false;
  }

  const nextStage = currentStage + 1;
  const maxStage = getMaxEvolutionStage(originStage);

  return nextStage <= maxStage;
}

/**
 * Calculate the origin bonus to max level.
 * The further a Digimon has evolved beyond its origin stage, the higher the bonus.
 *
 * Formula: (currentStage - originStage) * 5
 */
export function getOriginBonus(originStage: Stage, currentStage: Stage): number {
  return (currentStage - originStage) * 5;
}

/**
 * Get the DigiBytes cost to digivolve from the current stage to the next.
 * Uses DIGIVOLVE_COSTS indexed by stage tier.
 *
 * Returns undefined if the stage index is out of range (e.g., MEGA→ULTRA
 * when DIGIVOLVE_COSTS only has 4 entries).
 */
export function getDigivolveCost(currentStage: Stage): number | undefined {
  if (currentStage < 0 || currentStage >= DIGIVOLVE_COSTS.length) {
    return undefined;
  }
  return DIGIVOLVE_COSTS[currentStage as 0 | 1 | 2 | 3];
}

/**
 * Full validation for whether a Digimon can digivolve.
 * Checks in order:
 * 1. Must be at max level
 * 2. Origin must allow further evolution
 * 3. Must have enough DigiBytes
 *
 * Returns an object with canEvolve boolean and optional reason string.
 */
export function canDigivolve(
  currentStage: Stage,
  originStage: Stage,
  currentLevel: number,
  maxLevel: number,
  digibytes: number,
): { canEvolve: boolean; reason?: string } {
  // Check 1: Must be at max level
  if (currentLevel < maxLevel) {
    return { canEvolve: false, reason: 'Must reach max level before digivolving' };
  }

  // Check 2: Origin must allow evolution to next stage
  if (!canEvolve(currentStage, originStage)) {
    return {
      canEvolve: false,
      reason: `Cannot evolve further due to origin stage limitation`,
    };
  }

  // Check 3: Must afford the digivolution cost
  const cost = getDigivolveCost(currentStage);
  if (cost === undefined || digibytes < cost) {
    return {
      canEvolve: false,
      reason: `Not enough DigiBytes (need ${cost ?? '?'}, have ${digibytes})`,
    };
  }

  return { canEvolve: true };
}
