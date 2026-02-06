import { TargetPriority } from '@/types';

/**
 * Minimal target interface for targeting calculations.
 * This avoids coupling to the full Enemy class.
 */
export interface MockTarget {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  pathIndex: number;
  isFlying: boolean;
  isAlive: boolean;
}

interface Position {
  x: number;
  y: number;
}

/**
 * Sort targets by the given priority. Returns a new sorted array.
 * Dead targets are automatically filtered out.
 */
export function sortByPriority(
  targets: MockTarget[],
  priority: TargetPriority,
  towerPosition?: Position,
): MockTarget[] {
  const alive = targets.filter(t => t.isAlive);

  switch (priority) {
    case TargetPriority.FIRST:
      // Highest pathIndex = closest to base
      return [...alive].sort((a, b) => b.pathIndex - a.pathIndex);

    case TargetPriority.LAST:
      // Lowest pathIndex = just spawned
      return [...alive].sort((a, b) => a.pathIndex - b.pathIndex);

    case TargetPriority.STRONGEST:
      // Highest current HP
      return [...alive].sort((a, b) => b.hp - a.hp);

    case TargetPriority.WEAKEST:
      // Lowest current HP
      return [...alive].sort((a, b) => a.hp - b.hp);

    case TargetPriority.FASTEST:
      // Highest speed
      return [...alive].sort((a, b) => b.speed - a.speed);

    case TargetPriority.FLYING:
      // Flying first, then by pathIndex (first priority)
      return [...alive].sort((a, b) => {
        if (a.isFlying !== b.isFlying) return a.isFlying ? -1 : 1;
        return b.pathIndex - a.pathIndex;
      });

    case TargetPriority.CLOSEST:
      if (!towerPosition) return [...alive].sort((a, b) => b.pathIndex - a.pathIndex);
      return [...alive].sort((a, b) => {
        const distA = Math.hypot(a.x - towerPosition.x, a.y - towerPosition.y);
        const distB = Math.hypot(b.x - towerPosition.x, b.y - towerPosition.y);
        return distA - distB;
      });

    default:
      return [...alive].sort((a, b) => b.pathIndex - a.pathIndex);
  }
}

/**
 * Filter targets that are within the given range of a position.
 * Dead targets are excluded.
 */
export function filterInRange(
  targets: MockTarget[],
  towerX: number,
  towerY: number,
  range: number,
): MockTarget[] {
  return targets.filter(t => {
    if (!t.isAlive) return false;
    const dist = Math.hypot(t.x - towerX, t.y - towerY);
    return dist <= range;
  });
}

/**
 * Find the best target for a tower based on priority and range.
 * Returns null if no valid target found.
 */
export function findTarget(
  targets: MockTarget[],
  towerX: number,
  towerY: number,
  range: number,
  priority: TargetPriority,
): MockTarget | null {
  const inRange = filterInRange(targets, towerX, towerY, range);
  if (inRange.length === 0) return null;
  const sorted = sortByPriority(inRange, priority, { x: towerX, y: towerY });
  return sorted[0] ?? null;
}
