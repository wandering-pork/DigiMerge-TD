import { describe, it, expect, beforeEach } from 'vitest';
import { calculateScore, HighScoreManager, HighScoreEntry } from '@/managers/HighScoreManager';

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { for (const key of Object.keys(store)) delete store[key]; },
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

describe('HighScoreManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('calculateScore', () => {
    it('calculates score with all components', () => {
      expect(calculateScore(50, 200, 10)).toBe(50 * 100 + 200 * 10 + 10 * 50);
    });

    it('returns 0 for all zeros', () => {
      expect(calculateScore(0, 0, 0)).toBe(0);
    });

    it('increases with more waves', () => {
      expect(calculateScore(20, 100, 5)).toBeLessThan(calculateScore(40, 100, 5));
    });
  });

  describe('getHighScores', () => {
    it('returns empty array when no scores', () => {
      expect(HighScoreManager.getHighScores()).toEqual([]);
    });
  });

  describe('addScore', () => {
    it('adds a score and returns rank', () => {
      const entry: HighScoreEntry = {
        wave: 50,
        score: 7500,
        enemiesKilled: 200,
        livesRemaining: 10,
        playtimeSeconds: 600,
        date: new Date().toISOString(),
        won: false,
      };
      const rank = HighScoreManager.addScore(entry);
      expect(rank).toBe(1);
      expect(HighScoreManager.getHighScores()).toHaveLength(1);
    });

    it('sorts scores descending', () => {
      HighScoreManager.addScore({ wave: 10, score: 1000, enemiesKilled: 50, livesRemaining: 0, playtimeSeconds: 100, date: '', won: false });
      HighScoreManager.addScore({ wave: 50, score: 5000, enemiesKilled: 200, livesRemaining: 5, playtimeSeconds: 500, date: '', won: false });
      const scores = HighScoreManager.getHighScores();
      expect(scores[0].score).toBe(5000);
      expect(scores[1].score).toBe(1000);
    });

    it('keeps only top 10', () => {
      for (let i = 0; i < 15; i++) {
        HighScoreManager.addScore({ wave: i + 1, score: (i + 1) * 100, enemiesKilled: i * 10, livesRemaining: 0, playtimeSeconds: 60, date: '', won: false });
      }
      expect(HighScoreManager.getHighScores()).toHaveLength(10);
    });
  });

  describe('isHighScore', () => {
    it('returns true when no scores exist', () => {
      expect(HighScoreManager.isHighScore(100)).toBe(true);
    });

    it('returns true when score beats lowest in top 10', () => {
      for (let i = 0; i < 10; i++) {
        HighScoreManager.addScore({ wave: 1, score: 100, enemiesKilled: 0, livesRemaining: 0, playtimeSeconds: 0, date: '', won: false });
      }
      expect(HighScoreManager.isHighScore(200)).toBe(true);
    });

    it('returns false when score is too low', () => {
      for (let i = 0; i < 10; i++) {
        HighScoreManager.addScore({ wave: 1, score: 1000, enemiesKilled: 0, livesRemaining: 0, playtimeSeconds: 0, date: '', won: false });
      }
      expect(HighScoreManager.isHighScore(50)).toBe(false);
    });
  });

  describe('clearHighScores', () => {
    it('removes all scores', () => {
      HighScoreManager.addScore({ wave: 1, score: 100, enemiesKilled: 0, livesRemaining: 0, playtimeSeconds: 0, date: '', won: false });
      HighScoreManager.clearHighScores();
      expect(HighScoreManager.getHighScores()).toEqual([]);
    });
  });

  describe('hasHighScores', () => {
    it('returns false when empty', () => {
      expect(HighScoreManager.hasHighScores()).toBe(false);
    });

    it('returns true when scores exist', () => {
      HighScoreManager.addScore({ wave: 1, score: 100, enemiesKilled: 0, livesRemaining: 0, playtimeSeconds: 0, date: '', won: false });
      expect(HighScoreManager.hasHighScores()).toBe(true);
    });
  });
});
