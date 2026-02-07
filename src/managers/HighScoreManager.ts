const HIGH_SCORE_KEY = 'digimerge_td_highscores';
const MAX_ENTRIES = 10;

export interface HighScoreEntry {
  wave: number;
  score: number;
  enemiesKilled: number;
  livesRemaining: number;
  playtimeSeconds: number;
  date: string; // ISO date string
  won: boolean;
}

/**
 * Score formula: wave * 100 + enemiesKilled * 10 + livesRemaining * 50
 */
export function calculateScore(wave: number, enemiesKilled: number, livesRemaining: number): number {
  return wave * 100 + enemiesKilled * 10 + livesRemaining * 50;
}

export class HighScoreManager {
  /**
   * Get all high scores sorted by score descending.
   */
  public static getHighScores(): HighScoreEntry[] {
    try {
      const raw = localStorage.getItem(HIGH_SCORE_KEY);
      if (!raw) return [];
      const entries = JSON.parse(raw) as HighScoreEntry[];
      return entries.sort((a, b) => b.score - a.score);
    } catch {
      return [];
    }
  }

  /**
   * Add a new score entry. Returns the rank (1-based) if it made the top 10, or 0 if not.
   */
  public static addScore(entry: HighScoreEntry): number {
    const scores = this.getHighScores();
    scores.push(entry);
    scores.sort((a, b) => b.score - a.score);

    const rank = scores.findIndex(s => s === entry) + 1;

    // Keep only top MAX_ENTRIES
    const trimmed = scores.slice(0, MAX_ENTRIES);

    try {
      localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(trimmed));
    } catch {
      console.warn('[HighScoreManager] Failed to save high scores');
    }

    return rank <= MAX_ENTRIES ? rank : 0;
  }

  /**
   * Check if a score would make the top 10.
   */
  public static isHighScore(score: number): boolean {
    const scores = this.getHighScores();
    if (scores.length < MAX_ENTRIES) return true;
    return score > scores[scores.length - 1].score;
  }

  /**
   * Clear all high scores.
   */
  public static clearHighScores(): void {
    localStorage.removeItem(HIGH_SCORE_KEY);
  }

  /**
   * Check if any high scores exist.
   */
  public static hasHighScores(): boolean {
    const scores = this.getHighScores();
    return scores.length > 0;
  }
}
