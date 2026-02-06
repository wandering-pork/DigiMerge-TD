import { SaveData, TowerSaveData, GameStatistics, GameSettings } from '@/types';

const SAVE_KEY = 'digimerge_td_save';
const SAVE_VERSION = '1.0.0';

/**
 * Default game statistics.
 */
function defaultStatistics(): GameStatistics {
  return {
    enemiesKilled: 0,
    towersPlaced: 0,
    mergesPerformed: 0,
    digivolutionsPerformed: 0,
    highestWave: 0,
    totalDigibytesEarned: 0,
  };
}

/**
 * Default game settings.
 */
function defaultSettings(): GameSettings {
  return {
    sfxVolume: 0.5,
    musicVolume: 0.3,
    showGrid: true,
    showRanges: false,
  };
}

/**
 * SaveManager handles persisting and loading game state via LocalStorage.
 * No Phaser dependency — pure data management.
 */
export class SaveManager {
  // ---------------------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------------------

  /**
   * Save the current game state to LocalStorage.
   */
  public static save(
    gameState: { digibytes: number; lives: number; currentWave: number; gameMode: 'normal' | 'endless' },
    towers: TowerSaveData[],
    statistics?: Partial<GameStatistics>,
    settings?: Partial<GameSettings>,
  ): boolean {
    try {
      const saveData: SaveData = {
        version: SAVE_VERSION,
        timestamp: new Date().toISOString(),
        gameState,
        towers,
        statistics: { ...defaultStatistics(), ...statistics },
        settings: { ...defaultSettings(), ...settings },
      };

      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      return true;
    } catch {
      console.warn('[SaveManager] Failed to save game');
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Load
  // ---------------------------------------------------------------------------

  /**
   * Load saved game data from LocalStorage.
   * Returns null if no save exists or the save is corrupted/incompatible.
   */
  public static load(): SaveData | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;

      const data = JSON.parse(raw) as SaveData;

      // Version check
      if (!data.version || data.version !== SAVE_VERSION) {
        console.warn(`[SaveManager] Incompatible save version: ${data.version}`);
        return null;
      }

      // Basic validation
      if (!data.gameState || !Array.isArray(data.towers)) {
        console.warn('[SaveManager] Corrupted save data');
        return null;
      }

      return data;
    } catch {
      console.warn('[SaveManager] Failed to load save');
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Utility
  // ---------------------------------------------------------------------------

  /**
   * Check if a saved game exists.
   */
  public static hasSave(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  /**
   * Delete the saved game.
   */
  public static deleteSave(): void {
    localStorage.removeItem(SAVE_KEY);
  }

  /**
   * Load only the settings from the save (or return defaults).
   */
  public static loadSettings(): GameSettings {
    const data = SaveManager.load();
    if (data?.settings) {
      return { ...defaultSettings(), ...data.settings };
    }
    return defaultSettings();
  }

  /**
   * Save only settings (without overwriting game state).
   */
  public static saveSettings(settings: GameSettings): boolean {
    try {
      const existingRaw = localStorage.getItem(SAVE_KEY);
      if (existingRaw) {
        const existing = JSON.parse(existingRaw) as SaveData;
        existing.settings = settings;
        localStorage.setItem(SAVE_KEY, JSON.stringify(existing));
      } else {
        // No existing save, create a minimal one with just settings
        const saveData: SaveData = {
          version: SAVE_VERSION,
          timestamp: new Date().toISOString(),
          gameState: { digibytes: 0, lives: 0, currentWave: 0, gameMode: 'normal' },
          towers: [],
          statistics: defaultStatistics(),
          settings,
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      }
      return true;
    } catch {
      return false;
    }
  }
}
