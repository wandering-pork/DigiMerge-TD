import { Attribute, Stage, TargetPriority } from './DigimonTypes';

export interface GridPosition {
  col: number;
  row: number;
}

export interface TowerData {
  id: string;
  digimonId: string;
  level: number;
  dp: number;
  attribute: Attribute;
  stage: Stage;
  originStage: Stage;
  gridPosition: GridPosition;
  targetPriority: TargetPriority;
}

export interface EnemyInstance {
  id: string;
  digimonId: string;
  hp: number;
  maxHp: number;
  speed: number;
  armor: number;
  attribute: Attribute;
  pathIndex: number;
  type: string;
}

export interface GameState {
  digibytes: number;
  lives: number;
  maxLives: number;
  currentWave: number;
  totalWaves: number;
  gameMode: 'normal' | 'endless';
  isPaused: boolean;
  isWaveActive: boolean;
  selectedStarters: string[];
}

export interface WaveEnemy {
  id: string;
  count: number;
  type?: string;
}

export interface WaveConfig {
  enemies: WaveEnemy[];
  spawnInterval: number;
  boss?: string;
  reward?: number;
}

export interface EvolutionPath {
  resultId: string;
  minDP: number;
  maxDP: number;
  isDefault: boolean;
}

export interface SaveData {
  version: string;
  timestamp: string;
  gameState: {
    digibytes: number;
    lives: number;
    currentWave: number;
    gameMode: 'normal' | 'endless';
    hasUsedFreeSpawn?: boolean;
  };
  towers: TowerSaveData[];
  statistics: GameStatistics;
  settings: GameSettings;
}

export interface TowerSaveData {
  digimonId: string;
  level: number;
  dp: number;
  originStage: Stage;
  gridPosition: GridPosition;
  targetPriority: TargetPriority;
}

export interface GameStatistics {
  enemiesKilled: number;
  towersPlaced: number;
  mergesPerformed: number;
  digivolutionsPerformed: number;
  highestWave: number;
  totalDigibytesEarned: number;
}

export interface GameSettings {
  sfxVolume: number;
  musicVolume: number;
  showGrid: boolean;
  showRanges: boolean;
}
