import { GRID, PATH_WAYPOINTS } from '@/config/Constants';

export interface PixelPosition {
  x: number;
  y: number;
}

export interface GridPosition {
  col: number;
  row: number;
}

/**
 * Convert grid position to pixel position (top-left corner of cell).
 * Grid is 1-indexed: (1,1) is top-left cell.
 */
export function gridToPixel(col: number, row: number): PixelPosition {
  return {
    x: (col - 1) * GRID.CELL_SIZE,
    y: (row - 1) * GRID.CELL_SIZE,
  };
}

/**
 * Convert grid position to pixel center of cell.
 */
export function gridToPixelCenter(col: number, row: number): PixelPosition {
  const half = GRID.CELL_SIZE / 2;
  return {
    x: (col - 1) * GRID.CELL_SIZE + half,
    y: (row - 1) * GRID.CELL_SIZE + half,
  };
}

/**
 * Convert pixel position to grid position (1-indexed).
 */
export function pixelToGrid(x: number, y: number): GridPosition {
  return {
    col: Math.floor(x / GRID.CELL_SIZE) + 1,
    row: Math.floor(y / GRID.CELL_SIZE) + 1,
  };
}

/**
 * Get pixel center positions for all path waypoints.
 */
export function getPathPixelPositions(): PixelPosition[] {
  return PATH_WAYPOINTS.map(wp => gridToPixelCenter(wp.col, wp.row));
}

/**
 * Calculate Euclidean distance between two grid cells.
 */
export function distanceBetweenGrid(
  col1: number, row1: number,
  col2: number, row2: number
): number {
  const dx = col2 - col1;
  const dy = row2 - row1;
  return Math.sqrt(dx * dx + dy * dy);
}
