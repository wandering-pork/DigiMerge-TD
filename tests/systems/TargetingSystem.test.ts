import { describe, it, expect } from 'vitest';
import {
  sortByPriority,
  filterInRange,
  MockTarget,
} from '@/systems/TargetingSystem';
import { TargetPriority } from '@/types';

describe('TargetingSystem', () => {
  function makeTargets(): MockTarget[] {
    return [
      { x: 100, y: 100, hp: 50, maxHp: 100, speed: 60, pathIndex: 5, isFlying: false, isAlive: true },
      { x: 200, y: 100, hp: 10, maxHp: 80, speed: 120, pathIndex: 10, isFlying: false, isAlive: true },
      { x: 150, y: 200, hp: 200, maxHp: 200, speed: 36, pathIndex: 3, isFlying: true, isAlive: true },
      { x: 300, y: 100, hp: 80, maxHp: 100, speed: 78, pathIndex: 8, isFlying: false, isAlive: true },
    ];
  }

  describe('sortByPriority', () => {
    it('FIRST: sorts by highest pathIndex (closest to base)', () => {
      const targets = makeTargets();
      const sorted = sortByPriority(targets, TargetPriority.FIRST);
      expect(sorted[0].pathIndex).toBe(10); // furthest along path
    });

    it('LAST: sorts by lowest pathIndex (just spawned)', () => {
      const targets = makeTargets();
      const sorted = sortByPriority(targets, TargetPriority.LAST);
      expect(sorted[0].pathIndex).toBe(3); // earliest on path
    });

    it('STRONGEST: sorts by highest current HP', () => {
      const targets = makeTargets();
      const sorted = sortByPriority(targets, TargetPriority.STRONGEST);
      expect(sorted[0].hp).toBe(200);
    });

    it('WEAKEST: sorts by lowest current HP', () => {
      const targets = makeTargets();
      const sorted = sortByPriority(targets, TargetPriority.WEAKEST);
      expect(sorted[0].hp).toBe(10);
    });

    it('FASTEST: sorts by highest speed', () => {
      const targets = makeTargets();
      const sorted = sortByPriority(targets, TargetPriority.FASTEST);
      expect(sorted[0].speed).toBe(120);
    });

    it('FLYING: flying enemies first, then by pathIndex', () => {
      const targets = makeTargets();
      const sorted = sortByPriority(targets, TargetPriority.FLYING);
      expect(sorted[0].isFlying).toBe(true);
    });

    it('CLOSEST: sorts by distance to tower position', () => {
      const targets = makeTargets();
      // Tower at (100, 100), closest target is at (100, 100)
      const sorted = sortByPriority(targets, TargetPriority.CLOSEST, { x: 100, y: 100 });
      expect(sorted[0].x).toBe(100);
      expect(sorted[0].y).toBe(100);
    });

    it('returns empty array for empty input', () => {
      expect(sortByPriority([], TargetPriority.FIRST)).toEqual([]);
    });

    it('filters out dead targets', () => {
      const targets = makeTargets();
      targets[0].isAlive = false;
      const sorted = sortByPriority(targets, TargetPriority.FIRST);
      expect(sorted.length).toBe(3);
    });
  });

  describe('filterInRange', () => {
    it('returns targets within range', () => {
      const targets = makeTargets();
      // Tower at (100, 100), range 150px
      const inRange = filterInRange(targets, 100, 100, 150);
      // target at (100,100) = 0 distance, (200,100) = 100 distance, (150,200) ~112 distance
      expect(inRange.length).toBe(3); // all within 150 except (300,100) = 200 distance
    });

    it('returns empty for no targets in range', () => {
      const targets = makeTargets();
      const inRange = filterInRange(targets, 0, 0, 10);
      expect(inRange.length).toBe(0);
    });

    it('includes targets exactly at range boundary', () => {
      const targets: MockTarget[] = [
        { x: 200, y: 100, hp: 50, maxHp: 100, speed: 60, pathIndex: 5, isFlying: false, isAlive: true },
      ];
      const inRange = filterInRange(targets, 100, 100, 100);
      expect(inRange.length).toBe(1);
    });

    it('excludes dead targets', () => {
      const targets = makeTargets();
      targets[0].isAlive = false;
      const inRange = filterInRange(targets, 100, 100, 150);
      // (100,100) is dead, so excluded
      expect(inRange.some(t => t.x === 100 && t.y === 100 && !t.isAlive)).toBe(false);
    });
  });
});
