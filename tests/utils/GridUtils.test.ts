import { describe, it, expect } from 'vitest';
import {
  gridToPixel,
  pixelToGrid,
  gridToPixelCenter,
  getPathPixelPositions,
  distanceBetweenGrid,
} from '@/utils/GridUtils';
import { GRID, PATH_WAYPOINTS } from '@/config/Constants';

describe('GridUtils', () => {
  describe('gridToPixel', () => {
    it('converts grid (1,1) to pixel top-left of cell', () => {
      const pos = gridToPixel(1, 1);
      // col 1 → (1-1) * 64 = 0, row 1 → (1-1) * 64 = 0
      expect(pos.x).toBe(0);
      expect(pos.y).toBe(0);
    });

    it('converts grid (2,3) correctly', () => {
      const pos = gridToPixel(2, 3);
      expect(pos.x).toBe(64);  // (2-1) * 64
      expect(pos.y).toBe(128); // (3-1) * 64
    });

    it('converts grid (8,18) to bottom-right area', () => {
      const pos = gridToPixel(8, 18);
      expect(pos.x).toBe(7 * GRID.CELL_SIZE);
      expect(pos.y).toBe(17 * GRID.CELL_SIZE);
    });
  });

  describe('gridToPixelCenter', () => {
    it('returns center of cell (1,1)', () => {
      const center = gridToPixelCenter(1, 1);
      expect(center.x).toBe(32); // 0 + 32
      expect(center.y).toBe(32); // 0 + 32
    });

    it('returns center of cell (3,5)', () => {
      const center = gridToPixelCenter(3, 5);
      expect(center.x).toBe(2 * 64 + 32); // 160
      expect(center.y).toBe(4 * 64 + 32); // 288
    });
  });

  describe('pixelToGrid', () => {
    it('converts pixel (0,0) to grid (1,1)', () => {
      const grid = pixelToGrid(0, 0);
      expect(grid.col).toBe(1);
      expect(grid.row).toBe(1);
    });

    it('converts pixel center of (2,3) back correctly', () => {
      const grid = pixelToGrid(96, 160); // center of (2,3)
      expect(grid.col).toBe(2);
      expect(grid.row).toBe(3);
    });

    it('converts pixel at edge of cell correctly', () => {
      const grid = pixelToGrid(63, 63); // still in cell (1,1)
      expect(grid.col).toBe(1);
      expect(grid.row).toBe(1);
    });

    it('converts pixel at start of next cell', () => {
      const grid = pixelToGrid(64, 64); // cell (2,2)
      expect(grid.col).toBe(2);
      expect(grid.row).toBe(2);
    });
  });

  describe('getPathPixelPositions', () => {
    it('returns pixel positions for all waypoints', () => {
      const positions = getPathPixelPositions();
      expect(positions.length).toBe(PATH_WAYPOINTS.length);
    });

    it('first position is center of spawn cell', () => {
      const positions = getPathPixelPositions();
      const spawn = gridToPixelCenter(GRID.SPAWN.col, GRID.SPAWN.row);
      expect(positions[0].x).toBe(spawn.x);
      expect(positions[0].y).toBe(spawn.y);
    });

    it('last position is center of base cell', () => {
      const positions = getPathPixelPositions();
      const base = gridToPixelCenter(GRID.BASE.col, GRID.BASE.row);
      const last = positions[positions.length - 1];
      expect(last.x).toBe(base.x);
      expect(last.y).toBe(base.y);
    });
  });

  describe('distanceBetweenGrid', () => {
    it('same cell has distance 0', () => {
      expect(distanceBetweenGrid(1, 1, 1, 1)).toBe(0);
    });

    it('adjacent cells have distance 1', () => {
      expect(distanceBetweenGrid(1, 1, 2, 1)).toBeCloseTo(1);
      expect(distanceBetweenGrid(1, 1, 1, 2)).toBeCloseTo(1);
    });

    it('diagonal cells have distance sqrt(2)', () => {
      expect(distanceBetweenGrid(1, 1, 2, 2)).toBeCloseTo(Math.SQRT2);
    });

    it('longer distance calculated correctly', () => {
      // distance from (1,1) to (4,5) = sqrt(9+16) = 5
      expect(distanceBetweenGrid(1, 1, 4, 5)).toBeCloseTo(5);
    });
  });
});
