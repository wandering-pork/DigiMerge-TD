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
    sfxVolume: 0,
    musicVolume: 0.3,
    showGrid: true,
    showRanges: false,
    showDamageNumbers: true,
    healthBarMode: 'all',
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
    gameState: { digibytes: number; lives: number; currentWave: number; gameMode: 'normal' | 'endless'; hasUsedFreeSpawn?: boolean },
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

  // ---------------------------------------------------------------------------
  // Export / Import
  // ---------------------------------------------------------------------------

  /**
   * Export the current save as a JSON file download.
   * Returns true if a save was exported, false if no save exists.
   */
  public static exportSave(): boolean {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;

    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digimerge-td-save-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  }

  /**
   * Validate an imported save JSON string.
   * Returns the parsed SaveData if valid, or an error message string.
   */
  public static validateImport(jsonString: string): SaveData | string {
    try {
      const data = JSON.parse(jsonString) as SaveData;

      if (!data.version) return 'Missing save version';
      if (data.version !== SAVE_VERSION) return `Incompatible version: ${data.version} (expected ${SAVE_VERSION})`;
      if (!data.gameState) return 'Missing game state';
      if (typeof data.gameState.digibytes !== 'number') return 'Invalid game state: missing digibytes';
      if (typeof data.gameState.lives !== 'number') return 'Invalid game state: missing lives';
      if (typeof data.gameState.currentWave !== 'number') return 'Invalid game state: missing wave';
      if (!Array.isArray(data.towers)) return 'Invalid towers data';

      return data;
    } catch {
      return 'Invalid JSON format';
    }
  }

  /**
   * Import a validated SaveData, replacing the current save.
   */
  public static importSave(data: SaveData): boolean {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
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
