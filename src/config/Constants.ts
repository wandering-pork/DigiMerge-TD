import { Stage } from '@/types';

// Grid Configuration
export const GRID = {
  COLUMNS: 8,
  ROWS: 18,
  CELL_SIZE: 64,
  SPAWN: { col: 1, row: 2 },
  BASE: { col: 8, row: 15 },
} as const;

// Game Area
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const GRID_OFFSET_X = 64;
export const GRID_OFFSET_Y = 0;

// Spawn Costs
export const SPAWN_COSTS = {
  [Stage.IN_TRAINING]: { random: 100, specific: 150, free: 200 },
  [Stage.ROOKIE]: { random: 300, specific: 450, free: 600 },
  [Stage.CHAMPION]: { random: 800, specific: 1200, free: 1600 },
} as const;

// Digivolve Costs per stage transition
export const DIGIVOLVE_COSTS = [100, 150, 200, 250] as const;

// Stage Configuration
export const STAGE_CONFIG = {
  [Stage.IN_TRAINING]: { tier: 0, baseMaxLevel: 10, dpBonus: 1 },
  [Stage.ROOKIE]: { tier: 1, baseMaxLevel: 20, dpBonus: 2 },
  [Stage.CHAMPION]: { tier: 2, baseMaxLevel: 35, dpBonus: 3 },
  [Stage.ULTIMATE]: { tier: 3, baseMaxLevel: 50, dpBonus: 4 },
  [Stage.MEGA]: { tier: 4, baseMaxLevel: 70, dpBonus: 5 },
  [Stage.ULTRA]: { tier: 5, baseMaxLevel: 100, dpBonus: 5 },
} as const;

// Origin System: Maximum evolution stage based on spawn stage
export const ORIGIN_MAX_STAGE: Record<Stage, Stage> = {
  [Stage.IN_TRAINING]: Stage.CHAMPION,
  [Stage.ROOKIE]: Stage.ULTIMATE,
  [Stage.CHAMPION]: Stage.MEGA,
  [Stage.ULTIMATE]: Stage.ULTRA,
  [Stage.MEGA]: Stage.ULTRA,
  [Stage.ULTRA]: Stage.ULTRA,
};

// Game Defaults
export const STARTING_LIVES = 20;
export const MAX_LIVES = 20;
export const STARTING_DIGIBYTES = 500;
export const TOTAL_WAVES_MVP = 20;

// Level up cost formula: 5 * currentLevel
export function getLevelUpCost(currentLevel: number): number {
  return 5 * currentLevel;
}

// Damage formula
export function calculateDamage(baseDamage: number, level: number, attributeMultiplier: number): number {
  return baseDamage * (1 + level * 0.02) * attributeMultiplier;
}

// Max level formula
export function calculateMaxLevel(stage: Stage, dp: number, originStage: Stage, currentStage: Stage): number {
  const config = STAGE_CONFIG[currentStage];
  const originBonus = (currentStage - originStage) * 5;
  return config.baseMaxLevel + (dp * config.dpBonus) + originBonus;
}

// Attribute Multipliers
export const ATTRIBUTE_MULTIPLIERS: Record<number, Record<number, number>> = {
  0: { 0: 1.0, 1: 0.75, 2: 1.5, 3: 1.0 }, // Vaccine
  1: { 0: 1.5, 1: 1.0, 2: 0.75, 3: 1.0 },  // Data
  2: { 0: 0.75, 1: 1.5, 2: 1.0, 3: 1.0 },   // Virus
  3: { 0: 1.0, 1: 1.0, 2: 1.0, 3: 1.0 },     // Free
};

// Path Waypoints
export const PATH_WAYPOINTS: { col: number; row: number }[] = [
  // Segment 1: Start, move right
  { col: 1, row: 2 },  // SPAWN
  { col: 2, row: 2 },
  { col: 3, row: 2 },  // Turn down
  // Segment 2: Down
  { col: 3, row: 3 },
  { col: 3, row: 4 },
  { col: 3, row: 5 },  // Turn left
  // Segment 3: Left
  { col: 2, row: 5 },  // Turn down
  // Segment 4: Down
  { col: 2, row: 6 },
  { col: 2, row: 7 },  // Turn right
  // Segment 5: Right
  { col: 3, row: 7 },
  { col: 4, row: 7 },
  { col: 5, row: 7 },  // Turn up
  // Segment 6: Up
  { col: 5, row: 6 },
  { col: 5, row: 5 },
  { col: 5, row: 4 },
  { col: 5, row: 3 },  // Turn right
  // Segment 7: Right
  { col: 6, row: 3 },
  { col: 7, row: 3 },  // Turn down
  // Segment 8: Long down
  { col: 7, row: 4 },
  { col: 7, row: 5 },
  { col: 7, row: 6 },
  { col: 7, row: 7 },
  { col: 7, row: 8 },
  { col: 7, row: 9 },
  { col: 7, row: 10 },
  { col: 7, row: 11 },
  { col: 7, row: 12 },
  { col: 7, row: 13 }, // Turn left
  // Segment 9: Left
  { col: 6, row: 13 },
  { col: 5, row: 13 },
  { col: 4, row: 13 },
  { col: 3, row: 13 }, // Turn up
  // Segment 10: Up
  { col: 3, row: 12 },
  { col: 3, row: 11 },
  { col: 3, row: 10 },
  { col: 3, row: 9 },  // Turn left
  // Segment 11: Left
  { col: 2, row: 9 },
  { col: 1, row: 9 },  // Turn down
  // Segment 12: Long down
  { col: 1, row: 10 },
  { col: 1, row: 11 },
  { col: 1, row: 12 },
  { col: 1, row: 13 },
  { col: 1, row: 14 },
  { col: 1, row: 15 },
  { col: 1, row: 16 },
  { col: 1, row: 17 },
  { col: 1, row: 18 }, // Turn right
  // Segment 13: Right
  { col: 2, row: 18 },
  { col: 3, row: 18 },
  { col: 4, row: 18 }, // Turn up
  // Segment 14: Up
  { col: 4, row: 17 },
  { col: 4, row: 16 },
  { col: 4, row: 15 }, // Turn right
  // Segment 15: Final approach
  { col: 5, row: 15 },
  { col: 6, row: 15 },
  { col: 7, row: 15 },
  { col: 8, row: 15 }, // END - Base
];

// Set of grid positions occupied by the path
export const PATH_CELLS: Set<string> = new Set(
  PATH_WAYPOINTS.map(wp => `${wp.col},${wp.row}`)
);

export function isPathCell(col: number, row: number): boolean {
  return PATH_CELLS.has(`${col},${row}`);
}

export function isValidTowerSlot(col: number, row: number): boolean {
  return col >= 1 && col <= GRID.COLUMNS && row >= 1 && row <= GRID.ROWS && !isPathCell(col, row);
}
