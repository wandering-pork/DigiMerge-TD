import { Attribute, Stage } from '@/types';
import { canMerge as dpCanMerge, getDPFromMerge } from '@/systems/DPSystem';

/**
 * Represents the minimum data needed to evaluate a merge between two Digimon.
 */
export interface MergeCandidate {
  level: number;
  dp: number;
  attribute: Attribute;
  stage: Stage;
}

/**
 * The result of a successful merge operation.
 */
export interface MergeResult {
  survivorLevel: number;
  survivorDP: number;
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
  };
}
