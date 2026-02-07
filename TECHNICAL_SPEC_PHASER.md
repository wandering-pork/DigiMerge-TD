# DigiMerge TD - Technical Specification (Phaser 3 + TypeScript)

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Project Setup](#2-project-setup)
3. [Scene Structure](#3-scene-structure)
4. [Core Systems](#4-core-systems)
5. [Entity Classes](#5-entity-classes)
6. [Manager Classes](#6-manager-classes)
7. [Data Structures](#7-data-structures)
8. [UI Components](#8-ui-components)
9. [Event System](#9-event-system)
10. [Save System](#10-save-system)
11. [Performance Optimization](#11-performance-optimization)
12. [Deployment](#12-deployment)

---

## 1. Architecture Overview

### Tech Stack
| Component | Technology | Version |
|-----------|------------|---------|
| Game Framework | Phaser 3 | 3.80+ |
| Language | TypeScript | 5.4+ |
| Build Tool | Vite | 5.x |
| Package Manager | npm/pnpm | Latest |
| Testing | Vitest | 1.x |
| Linting | ESLint + Prettier | Latest |

### Architecture Pattern
```
┌─────────────────────────────────────────────────────────────────┐
│                         PHASER GAME                              │
├─────────────────────────────────────────────────────────────────┤
│  SCENES                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐     │
│  │   Boot   │→│ Preload  │→│ MainMenu │→│ StarterSelect  │→Game│
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘     │
│  Overlays: PauseScene, SettingsScene, EncyclopediaScene,        │
│            CreditsScene, GameOverScene                           │
├─────────────────────────────────────────────────────────────────┤
│  MANAGERS (Singletons via Registry)                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ GameState    │ │ WaveManager  │ │ CombatMgr    │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ TowerManager │ │ AudioManager │ │ SaveManager  │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
├─────────────────────────────────────────────────────────────────┤
│  EVENT BUS (Phaser.Events.EventEmitter)                          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  tower:placed | enemy:died | wave:completed | game:over     │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  ENTITIES (GameObjects)                                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                   │
│  │ Tower  │ │ Enemy  │ │Projectile│ │  Boss  │                   │
│  └────────┘ └────────┘ └────────┘ └────────┘                   │
├─────────────────────────────────────────────────────────────────┤
│  DATA LAYER (Static JSON/TS)                                     │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐       │
│  │DigimonDatabase │ │   WaveData     │ │ EvolutionPaths │       │
│  └────────────────┘ └────────────────┘ └────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Project Setup

### Initialization
```bash
npm create vite@latest digimerge-td -- --template vanilla-ts
cd digimerge-td
npm install phaser
npm install -D @types/node vitest eslint prettier
```

### Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@assets': resolve(__dirname, 'public/assets'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"],
      "@assets/*": ["./public/assets/*"]
    }
  },
  "include": ["src"]
}
```

### Phaser Game Configuration
```typescript
// src/config/GameConfig.ts
import Phaser from 'phaser';
import { BootScene } from '@/scenes/BootScene';
import { PreloadScene } from '@/scenes/PreloadScene';
import { MainMenuScene } from '@/scenes/MainMenuScene';
import { StarterSelectScene } from '@/scenes/StarterSelectScene';
import { GameScene } from '@/scenes/GameScene';
import { PauseScene } from '@/scenes/PauseScene';
import { SettingsScene } from '@/scenes/SettingsScene';
import { GameOverScene } from '@/scenes/GameOverScene';
import { EncyclopediaScene } from '@/scenes/EncyclopediaScene';
import { CreditsScene } from '@/scenes/CreditsScene';

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#1A1A2E',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  // No physics needed - we use custom path following
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    StarterSelectScene,
    GameScene,
    PauseScene,
    SettingsScene,
    GameOverScene,
    EncyclopediaScene,
    CreditsScene,
  ],
  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true,
  },
  audio: {
    disableWebAudio: false,
  },
};
```

### Entry Point
```typescript
// src/main.ts
import Phaser from 'phaser';
import { GameConfig } from '@/config/GameConfig';

const game = new Phaser.Game(GameConfig);

// Handle window resize
window.addEventListener('resize', () => {
  game.scale.refresh();
});
```

---

## 3. Scene Structure

### Boot Scene (Asset Keys Registration)
```typescript
// src/scenes/BootScene.ts
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Load minimal assets for loading screen
    this.load.image('logo', 'assets/ui/logo.png');
    this.load.image('loading-bar', 'assets/ui/loading-bar.png');
  }

  create(): void {
    this.scene.start('PreloadScene');
  }
}
```

### Preload Scene (Asset Loading)
```typescript
// src/scenes/PreloadScene.ts
import Phaser from 'phaser';
import { DIGIMON_DATABASE } from '@/data/DigimonDatabase';
import { WAVE_DATA } from '@/data/WaveData';
import { EVOLUTION_PATHS } from '@/data/EvolutionPaths';

export class PreloadScene extends Phaser.Scene {
  private loadingBarFill!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    this.createLoadingUI();
    this.loadAssets();
  }

  private createLoadingUI(): void {
    const { width, height } = this.scale;

    // Loading bar background
    const barBg = this.add.graphics();
    barBg.fillStyle(0x222222);
    barBg.fillRect(width / 2 - 202, height / 2 - 2, 404, 34);

    // Loading bar fill
    this.loadingBarFill = this.add.graphics();

    // Loading text
    this.loadingText = this.add.text(width / 2, height / 2 + 50, 'Loading...', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      this.loadingBarFill.clear();
      this.loadingBarFill.fillStyle(0x4A90D9);
      this.loadingBarFill.fillRect(width / 2 - 200, height / 2, 400 * value, 30);
      this.loadingText.setText(`Loading... ${Math.floor(value * 100)}%`);
    });
  }

  private loadAssets(): void {
    // Digimon sprites (individual PNGs - load the ones needed for MVP)
    const mvpDigimon = [
      // Starters (In-Training)
      'Koromon', 'Tsunomon', 'Tokomon', 'Gigimon', 'Tanemon', 'DemiVeemon', 'Pagumon', 'Viximon',
      // Rookies
      'Agumon', 'Gabumon', 'Patamon', 'Guilmon', 'Palmon', 'Veemon', 'DemiDevimon', 'Renamon',
      'Goblimon', 'Gazimon', 'Elecmon', 'Gotsumon', 'Impmon', 'Biyomon',
      // Champions
      'Greymon', 'Garurumon', 'Angemon', 'Growlmon', 'Togemon', 'ExVeemon', 'Devimon', 'Kyubimon',
      'Birdramon', 'Kabuterimon', 'Leomon', 'Ogremon', 'Meramon',
      // Enemies for Phase 1
      'Numemon', 'Bakemon', 'Tyrannomon', 'Monochromon',
    ];

    mvpDigimon.forEach(name => {
      this.load.image(name.toLowerCase(), `assets/sprites/Idle Frame Only/${name}.png`);
    });

    // Sound effects (WAV files)
    this.load.audio('sfx-attack-hit', 'assets/sfx/attack_hit.wav');
    this.load.audio('sfx-attack-miss', 'assets/sfx/attack_miss.wav');
    this.load.audio('sfx-boss-spawn', 'assets/sfx/boss_spawn.wav');
    this.load.audio('sfx-button-click', 'assets/sfx/button_click.wav');
    this.load.audio('sfx-button-hover', 'assets/sfx/button_hover.wav');
    this.load.audio('sfx-enemy-death', 'assets/sfx/enemy_death.wav');
    this.load.audio('sfx-enemy-escape', 'assets/sfx/enemy_escape.wav');
    this.load.audio('sfx-game-over', 'assets/sfx/game_over.wav');
    this.load.audio('sfx-insufficient-funds', 'assets/sfx/insufficient_funds.wav');
    this.load.audio('sfx-merge', 'assets/sfx/merge_success.wav');
    this.load.audio('sfx-evolve', 'assets/sfx/tower_evolve.wav');
    this.load.audio('sfx-level-up', 'assets/sfx/tower_level_up.wav');
    this.load.audio('sfx-sell', 'assets/sfx/tower_sell.wav');
    this.load.audio('sfx-spawn', 'assets/sfx/tower_spawn.wav');
    this.load.audio('sfx-victory', 'assets/sfx/victory.wav');
    this.load.audio('sfx-wave-complete', 'assets/sfx/wave_complete.wav');
    this.load.audio('sfx-wave-start', 'assets/sfx/wave_start.wav');
  }

  create(): void {
    // Initialize data from TypeScript modules (not JSON files)
    this.registry.set('digimonData', DIGIMON_DATABASE);
    this.registry.set('waveData', WAVE_DATA);
    this.registry.set('evolutionData', EVOLUTION_PATHS);

    this.scene.start('MainMenuScene');
  }
}
```

### Game Scene (Main Gameplay)
```typescript
// src/scenes/GameScene.ts
import Phaser from 'phaser';
import { GameStateManager } from '@/managers/GameStateManager';
import { WaveManager } from '@/managers/WaveManager';
import { TowerManager } from '@/managers/TowerManager';
import { CombatManager } from '@/managers/CombatManager';
import { UIManager } from '@/managers/UIManager';
import { AudioManager } from '@/managers/AudioManager';
import { EventBus, GameEvents } from '@/utils/EventBus';
import { GRID, PATH_WAYPOINTS } from '@/config/Constants';
import { Projectile } from '@/entities/Projectile';
import { Tower } from '@/entities/Tower';
import { Enemy } from '@/entities/Enemy';
import type { GridPosition } from '@/types/GameTypes';

export class GameScene extends Phaser.Scene {
  // Managers
  private gameState!: GameStateManager;
  private waveManager!: WaveManager;
  private towerManager!: TowerManager;
  private combatManager!: CombatManager;
  private uiManager!: UIManager;
  private audioManager!: AudioManager;

  // Game Object Groups
  public towers!: Phaser.GameObjects.Group;
  public enemies!: Phaser.GameObjects.Group;
  public projectiles!: Phaser.GameObjects.Group;

  // Map (code-defined, no tilemap)
  private pathGraphics!: Phaser.GameObjects.Graphics;
  private slotGraphics!: Phaser.GameObjects.Graphics;
  private waypoints: Phaser.Math.Vector2[] = [];
  private towerSlots: GridPosition[] = [];

  // State
  private isPaused = false;
  private gameSpeed = 1.0;
  private selectedTower: Tower | null = null;
  private starterDigimonId: string = 'koromon';

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { starterDigimon?: string }): void {
    if (data.starterDigimon) {
      this.starterDigimonId = data.starterDigimon;
    }

    this.gameState = new GameStateManager(this);
    this.waveManager = new WaveManager(this);
    this.towerManager = new TowerManager(this);
    this.combatManager = new CombatManager(this);
    this.uiManager = new UIManager(this);
    this.audioManager = new AudioManager(this);

    // Store in registry for cross-scene access
    this.registry.set('gameState', this.gameState);
    this.registry.set('audioManager', this.audioManager);
  }

  create(): void {
    this.createMap();
    this.createGroups();
    this.setupEventListeners();
    this.uiManager.createHUD();
    this.spawnStarterDigimon();

    // Start first wave after brief delay
    this.time.delayedCall(2000, () => {
      this.waveManager.startWave(1);
    });
  }

  update(time: number, delta: number): void {
    if (this.isPaused) return;

    const adjustedDelta = delta * this.gameSpeed;

    // Update all active enemies
    this.enemies.getChildren().forEach((enemy) => {
      if ((enemy as Enemy).active) {
        (enemy as Enemy).update(adjustedDelta);
      }
    });

    // Update all towers
    this.towers.getChildren().forEach((tower) => {
      if ((tower as Tower).active) {
        const enemyList = this.enemies.getChildren() as Enemy[];
        (tower as Tower).update(adjustedDelta, enemyList);
      }
    });

    this.waveManager.update(adjustedDelta);
    this.combatManager.update(adjustedDelta);
    this.updateProjectiles(adjustedDelta);
  }

  private createMap(): void {
    // Convert grid waypoints to pixel coordinates
    this.waypoints = PATH_WAYPOINTS.map(wp =>
      new Phaser.Math.Vector2(
        wp.col * GRID.CELL_SIZE + GRID.CELL_SIZE / 2,
        wp.row * GRID.CELL_SIZE + GRID.CELL_SIZE / 2
      )
    );

    // Draw path
    this.pathGraphics = this.add.graphics();
    this.drawPath();

    // Calculate and draw tower slots
    this.calculateTowerSlots();
    this.slotGraphics = this.add.graphics();
    this.drawTowerSlots();
  }

  private drawPath(): void {
    this.pathGraphics.lineStyle(4, 0x8B4513, 0.8); // Brown path

    this.pathGraphics.beginPath();
    this.pathGraphics.moveTo(this.waypoints[0].x, this.waypoints[0].y);

    for (let i = 1; i < this.waypoints.length; i++) {
      this.pathGraphics.lineTo(this.waypoints[i].x, this.waypoints[i].y);
    }

    this.pathGraphics.strokePath();

    // Draw path fill (wider)
    this.pathGraphics.lineStyle(GRID.CELL_SIZE - 8, 0xD2B48C, 0.6);
    this.pathGraphics.beginPath();
    this.pathGraphics.moveTo(this.waypoints[0].x, this.waypoints[0].y);

    for (let i = 1; i < this.waypoints.length; i++) {
      this.pathGraphics.lineTo(this.waypoints[i].x, this.waypoints[i].y);
    }

    this.pathGraphics.strokePath();
  }

  private calculateTowerSlots(): void {
    // Create a set of path cells for quick lookup
    const pathCells = new Set<string>();
    PATH_WAYPOINTS.forEach(wp => {
      pathCells.add(`${wp.col},${wp.row}`);
    });

    // All cells that are NOT on the path are tower slots
    for (let row = 1; row <= GRID.ROWS; row++) {
      for (let col = 1; col <= GRID.COLUMNS; col++) {
        if (!pathCells.has(`${col},${row}`)) {
          this.towerSlots.push({ col, row });
        }
      }
    }
  }

  private drawTowerSlots(): void {
    this.slotGraphics.lineStyle(1, 0x4A90D9, 0.3);
    this.slotGraphics.fillStyle(0x2C3E50, 0.2);

    this.towerSlots.forEach(slot => {
      const x = slot.col * GRID.CELL_SIZE;
      const y = slot.row * GRID.CELL_SIZE;
      this.slotGraphics.fillRect(x + 2, y + 2, GRID.CELL_SIZE - 4, GRID.CELL_SIZE - 4);
      this.slotGraphics.strokeRect(x + 2, y + 2, GRID.CELL_SIZE - 4, GRID.CELL_SIZE - 4);
    });
  }

  private createGroups(): void {
    this.towers = this.add.group({
      classType: Tower,
      runChildUpdate: false, // We handle updates manually
    });

    this.enemies = this.add.group({
      classType: Enemy,
      runChildUpdate: false,
    });

    this.projectiles = this.add.group({
      classType: Projectile,
      maxSize: 100,
      runChildUpdate: false,
    });
  }

  private setupEventListeners(): void {
    // Game events
    EventBus.on(GameEvents.ENEMY_REACHED_BASE, this.onEnemyReachedBase, this);
    EventBus.on(GameEvents.ENEMY_DIED, this.onEnemyDied, this);
    EventBus.on(GameEvents.WAVE_STARTED, this.onWaveStarted, this);
    EventBus.on(GameEvents.WAVE_COMPLETED, this.onWaveCompleted, this);
    EventBus.on(GameEvents.GAME_OVER, this.onGameOver, this);
    EventBus.on(GameEvents.TOWER_SELECTED, this.onTowerSelected, this);
    EventBus.on(GameEvents.TOWER_DESELECTED, this.onTowerDeselected, this);

    // Input - clicking on empty space
    this.input.on('pointerdown', this.onPointerDown, this);

    // Keyboard shortcuts
    this.input.keyboard?.on('keydown-SPACE', this.toggleGameSpeed, this);
    this.input.keyboard?.on('keydown-ESC', this.togglePause, this);
    this.input.keyboard?.on('keydown-L', this.levelUpSelectedTower, this);
    this.input.keyboard?.on('keydown-E', this.evolveSelectedTower, this);
    this.input.keyboard?.on('keydown-DELETE', this.sellSelectedTower, this);
    this.input.keyboard?.on('keydown-TAB', this.cycleTowerPriority, this);
  }

  private spawnStarterDigimon(): void {
    const starterPosition = { col: 4, row: 6 };
    this.towerManager.spawnTower(this.starterDigimonId, starterPosition, true);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    // Convert pointer position to grid position
    const col = Math.floor(pointer.x / GRID.CELL_SIZE);
    const row = Math.floor(pointer.y / GRID.CELL_SIZE);

    // Check if clicking on a valid tower slot
    const isValidSlot = this.towerSlots.some(
      slot => slot.col === col && slot.row === row
    );

    if (isValidSlot) {
      // Check if there's already a tower here
      const existingTower = this.towerManager.getTowerAt({ col, row });

      if (!existingTower) {
        // Deselect current tower and potentially show spawn menu
        if (this.selectedTower) {
          EventBus.emit(GameEvents.TOWER_DESELECTED, this.selectedTower);
        }
        this.uiManager.showSpawnMenu({ col, row });
      }
    } else {
      // Clicked outside tower slots - deselect
      if (this.selectedTower) {
        EventBus.emit(GameEvents.TOWER_DESELECTED, this.selectedTower);
      }
    }
  }

  private onTowerSelected(tower: Tower): void {
    if (this.selectedTower && this.selectedTower !== tower) {
      this.selectedTower.hideRange();
    }
    this.selectedTower = tower;
    this.uiManager.showTowerInfo(tower);
  }

  private onTowerDeselected(tower: Tower): void {
    tower.hideRange();
    if (this.selectedTower === tower) {
      this.selectedTower = null;
    }
    this.uiManager.hideTowerInfo();
  }

  private onEnemyReachedBase(enemy: Enemy): void {
    const livesLost = enemy.isBoss ? 3 : 1;
    this.gameState.loseLives(livesLost);
    this.audioManager.play('sfx-enemy-escape');
    this.waveManager.onEnemyDied(); // Still counts as removed from wave
    enemy.destroy();
  }

  private onEnemyDied(enemy: Enemy, source?: Tower): void {
    this.gameState.addDigibytes(enemy.reward);
    this.gameState.recordKill();
    this.waveManager.onEnemyDied();
    this.audioManager.play('sfx-enemy-death');
    enemy.destroy();
  }

  private onWaveStarted(waveNumber: number): void {
    this.gameState.setWave(waveNumber);
    this.audioManager.play('sfx-wave-start');
  }

  private onWaveCompleted(waveNumber: number): void {
    this.gameState.addDigibytes(this.waveManager.getWaveReward(waveNumber));
    this.uiManager.showWaveComplete(waveNumber);
    this.audioManager.play('sfx-wave-complete');

    // Auto-start next wave after delay (unless game won)
    if (waveNumber < 100) {
      this.time.delayedCall(3000, () => {
        this.waveManager.startWave(waveNumber + 1);
      });
    } else if (waveNumber === 100) {
      EventBus.emit(GameEvents.GAME_WON);
      this.audioManager.play('sfx-victory');
    }
  }

  private onGameOver(): void {
    this.audioManager.play('sfx-game-over');
    this.scene.pause();
    this.scene.launch('GameOverScene', {
      wave: this.gameState.currentWave,
      stats: this.gameState.stats,
    });
  }

  private updateProjectiles(delta: number): void {
    this.projectiles.getChildren().forEach((proj) => {
      const projectile = proj as Projectile;
      if (projectile.active) {
        projectile.update(delta);
      }
    });
  }

  private toggleGameSpeed(): void {
    const speeds = [1.0, 1.5, 2.0];
    const currentIndex = speeds.indexOf(this.gameSpeed);
    this.gameSpeed = speeds[(currentIndex + 1) % speeds.length];
    this.uiManager.updateSpeedDisplay(this.gameSpeed);
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.scene.launch('PauseScene');
      this.scene.pause();
    }
  }

  private levelUpSelectedTower(): void {
    if (this.selectedTower) {
      this.towerManager.levelUpTower(this.selectedTower);
    }
  }

  private evolveSelectedTower(): void {
    if (this.selectedTower && this.selectedTower.canDigivolve()) {
      this.uiManager.showEvolutionModal(this.selectedTower);
    }
  }

  private sellSelectedTower(): void {
    if (this.selectedTower) {
      this.towerManager.sellTower(this.selectedTower);
      this.selectedTower = null;
    }
  }

  private cycleTowerPriority(): void {
    if (this.selectedTower) {
      this.selectedTower.cycleTargetPriority();
      this.uiManager.updateTowerInfo(this.selectedTower);
    }
  }

  // Public accessors
  public getWaypoints(): Phaser.Math.Vector2[] {
    return this.waypoints;
  }

  public getTowerSlots(): GridPosition[] {
    return this.towerSlots;
  }

  public getGameState(): GameStateManager {
    return this.gameState;
  }

  public getAudioManager(): AudioManager {
    return this.audioManager;
  }

  shutdown(): void {
    EventBus.off(GameEvents.ENEMY_REACHED_BASE, this.onEnemyReachedBase, this);
    EventBus.off(GameEvents.ENEMY_DIED, this.onEnemyDied, this);
    EventBus.off(GameEvents.WAVE_STARTED, this.onWaveStarted, this);
    EventBus.off(GameEvents.WAVE_COMPLETED, this.onWaveCompleted, this);
    EventBus.off(GameEvents.GAME_OVER, this.onGameOver, this);
    EventBus.off(GameEvents.TOWER_SELECTED, this.onTowerSelected, this);
    EventBus.off(GameEvents.TOWER_DESELECTED, this.onTowerDeselected, this);
  }
}
```

### StarterSelectScene
```typescript
// src/scenes/StarterSelectScene.ts
import Phaser from 'phaser';
import { Attribute, getAttributeColor } from '@/systems/AttributeSystem';

interface StarterOption {
  id: string;
  name: string;
  attribute: Attribute;
  description: string;
}

const STARTERS: StarterOption[] = [
  { id: 'koromon', name: 'Koromon', attribute: Attribute.VACCINE, description: 'Evolves to Agumon line. Balanced fighter with fire attacks.' },
  { id: 'tsunomon', name: 'Tsunomon', attribute: Attribute.DATA, description: 'Evolves to Gabumon line. Ice-based attacks with good range.' },
  { id: 'tokomon', name: 'Tokomon', attribute: Attribute.VACCINE, description: 'Evolves to Patamon line. Holy attacks, good vs Virus.' },
  { id: 'gigimon', name: 'Gigimon', attribute: Attribute.VIRUS, description: 'Evolves to Guilmon line. High damage dealer.' },
  { id: 'tanemon', name: 'Tanemon', attribute: Attribute.DATA, description: 'Evolves to Palmon line. Poison and support abilities.' },
  { id: 'demiveemon', name: 'DemiVeemon', attribute: Attribute.FREE, description: 'Evolves to Veemon line. Versatile with DNA options.' },
  { id: 'pagumon', name: 'Pagumon', attribute: Attribute.VIRUS, description: 'Evolves to DemiDevimon line. Debuffs and dark attacks.' },
  { id: 'viximon', name: 'Viximon', attribute: Attribute.DATA, description: 'Evolves to Renamon line. Fast with magic damage.' },
];

export class StarterSelectScene extends Phaser.Scene {
  private selectedIndex: number = 0;
  private starterCards: Phaser.GameObjects.Container[] = [];
  private descriptionText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'StarterSelectScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1A1A2E);

    // Title
    this.add.text(width / 2, 50, 'Choose Your Starter Digimon', {
      fontSize: '32px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Instructions
    this.add.text(width / 2, 90, 'This Digimon will be free and determines your starting strategy', {
      fontSize: '16px',
      color: '#BDC3C7',
    }).setOrigin(0.5);

    // Create starter cards
    this.createStarterCards();

    // Description area
    this.descriptionText = this.add.text(width / 2, height - 120, '', {
      fontSize: '16px',
      color: '#FFFFFF',
      align: 'center',
      wordWrap: { width: 600 },
    }).setOrigin(0.5);

    // Start button
    this.createStartButton();

    // Keyboard navigation
    this.input.keyboard?.on('keydown-LEFT', () => this.selectStarter(this.selectedIndex - 1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.selectStarter(this.selectedIndex + 1));
    this.input.keyboard?.on('keydown-ENTER', () => this.startGame());

    // Initial selection
    this.selectStarter(0);
  }

  private createStarterCards(): void {
    const { width, height } = this.scale;
    const cardWidth = 120;
    const cardHeight = 150;
    const spacing = 20;
    const totalWidth = STARTERS.length * cardWidth + (STARTERS.length - 1) * spacing;
    const startX = (width - totalWidth) / 2 + cardWidth / 2;
    const y = height / 2 - 30;

    STARTERS.forEach((starter, i) => {
      const x = startX + i * (cardWidth + spacing);
      const card = this.createStarterCard(x, y, starter, i);
      this.starterCards.push(card);
    });
  }

  private createStarterCard(
    x: number,
    y: number,
    starter: StarterOption,
    index: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Card background
    const bg = this.add.rectangle(0, 0, 110, 140, 0x2C3E50)
      .setStrokeStyle(3, getAttributeColor(starter.attribute));
    container.add(bg);

    // Digimon sprite (if loaded)
    if (this.textures.exists(starter.id)) {
      const sprite = this.add.image(0, -20, starter.id).setScale(3);
      container.add(sprite);
    } else {
      // Placeholder
      const placeholder = this.add.circle(0, -20, 30, getAttributeColor(starter.attribute));
      container.add(placeholder);
    }

    // Name
    const nameText = this.add.text(0, 40, starter.name, {
      fontSize: '14px',
      color: '#FFFFFF',
    }).setOrigin(0.5);
    container.add(nameText);

    // Attribute label
    const attrLabels = ['Vaccine', 'Data', 'Virus', 'Free'];
    const attrText = this.add.text(0, 58, attrLabels[starter.attribute], {
      fontSize: '11px',
      color: '#BDC3C7',
    }).setOrigin(0.5);
    container.add(attrText);

    // Make interactive
    bg.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.selectStarter(index))
      .on('pointerdown', () => {
        if (this.selectedIndex === index) {
          this.startGame();
        }
      });

    return container;
  }

  private selectStarter(index: number): void {
    // Wrap around
    if (index < 0) index = STARTERS.length - 1;
    if (index >= STARTERS.length) index = 0;

    // Deselect previous
    if (this.starterCards[this.selectedIndex]) {
      const prevCard = this.starterCards[this.selectedIndex];
      prevCard.setScale(1);
      const prevBg = prevCard.getAt(0) as Phaser.GameObjects.Rectangle;
      prevBg.setFillStyle(0x2C3E50);
    }

    // Select new
    this.selectedIndex = index;
    const card = this.starterCards[index];
    card.setScale(1.1);
    const bg = card.getAt(0) as Phaser.GameObjects.Rectangle;
    bg.setFillStyle(0x3D566E);

    // Update description
    const starter = STARTERS[index];
    this.descriptionText.setText(starter.description);

    // Play sound
    if (this.cache.audio.exists('sfx-button-hover')) {
      this.sound.play('sfx-button-hover', { volume: 0.3 });
    }
  }

  private createStartButton(): void {
    const { width, height } = this.scale;

    const button = this.add.container(width / 2, height - 50);

    const bg = this.add.rectangle(0, 0, 200, 50, 0x27AE60)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.startGame())
      .on('pointerover', () => bg.setFillStyle(0x2ECC71))
      .on('pointerout', () => bg.setFillStyle(0x27AE60));

    const text = this.add.text(0, 0, 'Start Game', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    button.add([bg, text]);
  }

  private startGame(): void {
    const selectedStarter = STARTERS[this.selectedIndex];

    if (this.cache.audio.exists('sfx-button-click')) {
      this.sound.play('sfx-button-click');
    }

    this.scene.start('GameScene', {
      starterDigimon: selectedStarter.id,
    });
  }
}
```

### MainMenuScene
```typescript
// src/scenes/MainMenuScene.ts
import Phaser from 'phaser';
import { SaveManager } from '@/managers/SaveManager';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1A1A2E);

    // Title
    this.add.text(width / 2, 150, 'DigiMerge TD', {
      fontSize: '64px',
      color: '#4A90D9',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, 220, 'Tower Defense with Digivolution', {
      fontSize: '24px',
      color: '#BDC3C7',
    }).setOrigin(0.5);

    // Menu buttons
    const buttonY = 350;
    const buttonSpacing = 60;

    // New Game
    this.createMenuButton(width / 2, buttonY, 'New Game', () => {
      this.scene.start('StarterSelectScene');
    });

    // Continue (if save exists)
    if (SaveManager.hasSave()) {
      this.createMenuButton(width / 2, buttonY + buttonSpacing, 'Continue', () => {
        this.loadGame();
      });
    }

    // Settings
    this.createMenuButton(
      width / 2,
      buttonY + buttonSpacing * (SaveManager.hasSave() ? 2 : 1),
      'Settings',
      () => {
        // TODO: Settings scene
        console.log('Settings not implemented yet');
      }
    );

    // Version
    this.add.text(width - 10, height - 10, 'v0.1.0 MVP', {
      fontSize: '14px',
      color: '#7F8C8D',
    }).setOrigin(1, 1);
  }

  private createMenuButton(x: number, y: number, label: string, onClick: () => void): void {
    const button = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 250, 50, 0x2C3E50)
      .setStrokeStyle(2, 0x4A90D9)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        if (this.cache.audio.exists('sfx-button-click')) {
          this.sound.play('sfx-button-click');
        }
        onClick();
      })
      .on('pointerover', () => bg.setFillStyle(0x3D566E))
      .on('pointerout', () => bg.setFillStyle(0x2C3E50));

    const text = this.add.text(0, 0, label, {
      fontSize: '22px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    button.add([bg, text]);
  }

  private loadGame(): void {
    const saveData = SaveManager.load();
    if (saveData) {
      this.registry.set('loadedSave', saveData);
      this.scene.start('GameScene', { loadFromSave: true });
    }
  }
}
```

### PauseScene
```typescript
// src/scenes/PauseScene.ts
import Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Dim overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

    // Pause text
    this.add.text(width / 2, height / 2 - 100, 'PAUSED', {
      fontSize: '48px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Resume button
    this.createButton(width / 2, height / 2, 'Resume', () => {
      this.resumeGame();
    });

    // Settings button
    this.createButton(width / 2, height / 2 + 60, 'Settings', () => {
      // TODO: Settings
    });

    // Quit button
    this.createButton(width / 2, height / 2 + 120, 'Quit to Menu', () => {
      this.scene.stop('GameScene');
      this.scene.start('MainMenuScene');
    }, 0xE74C3C);

    // ESC to resume
    this.input.keyboard?.on('keydown-ESC', () => this.resumeGame());
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
    color: number = 0x4A90D9
  ): void {
    const button = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 200, 45, color)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', onClick)
      .on('pointerover', () => bg.setAlpha(0.8))
      .on('pointerout', () => bg.setAlpha(1));

    const text = this.add.text(0, 0, label, {
      fontSize: '20px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    button.add([bg, text]);
  }

  private resumeGame(): void {
    this.scene.resume('GameScene');
    this.scene.stop();
  }
}
```

### GameOverScene
```typescript
// src/scenes/GameOverScene.ts
import Phaser from 'phaser';

interface GameOverData {
  wave: number;
  stats: {
    enemiesKilled: number;
    totalDBEarned: number;
    mergesPerformed: number;
    digivolutionsPerformed: number;
  };
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: GameOverData): void {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1A1A2E, 0.95);

    // Game Over text
    this.add.text(width / 2, 100, 'GAME OVER', {
      fontSize: '56px',
      color: '#E74C3C',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Wave reached
    this.add.text(width / 2, 180, `Wave Reached: ${data.wave}`, {
      fontSize: '28px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    // Stats
    const statsY = 260;
    const stats = [
      `Enemies Defeated: ${data.stats?.enemiesKilled ?? 0}`,
      `DigiBytes Earned: ${data.stats?.totalDBEarned ?? 0}`,
      `Merges Performed: ${data.stats?.mergesPerformed ?? 0}`,
      `Digivolutions: ${data.stats?.digivolutionsPerformed ?? 0}`,
    ];

    stats.forEach((stat, i) => {
      this.add.text(width / 2, statsY + i * 35, stat, {
        fontSize: '20px',
        color: '#BDC3C7',
      }).setOrigin(0.5);
    });

    // Buttons
    this.createButton(width / 2, height - 150, 'Try Again', () => {
      this.scene.stop('GameScene');
      this.scene.start('StarterSelectScene');
    });

    this.createButton(width / 2, height - 90, 'Main Menu', () => {
      this.scene.stop('GameScene');
      this.scene.start('MainMenuScene');
    }, 0x7F8C8D);
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
    color: number = 0x27AE60
  ): void {
    const button = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 220, 45, color)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', onClick)
      .on('pointerover', () => bg.setAlpha(0.8))
      .on('pointerout', () => bg.setAlpha(1));

    const text = this.add.text(0, 0, label, {
      fontSize: '20px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    button.add([bg, text]);
  }
}
```

---

## 4. Core Systems

### Constants
```typescript
// src/config/Constants.ts
export const GRID = {
  COLUMNS: 8,
  ROWS: 18,
  CELL_SIZE: 64,
  TOWER_SLOTS: 87,
  SPAWN: { col: 1, row: 2 },
  BASE: { col: 8, row: 15 },
};

// Path waypoints (grid coordinates)
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

export const GAME = {
  STARTING_DIGIBYTES: 200,
  STARTING_LIVES: 20,
  MAX_LIVES: 20,
  TOTAL_WAVES: 100,
};

export const SPAWN_COSTS = {
  IN_TRAINING: { random: 100, specific: 150, free: 200 },
  ROOKIE: { random: 300, specific: 450, free: 600 },
  CHAMPION: { random: 800, specific: 1200, free: 1600 },
} as const;

export const DIGIVOLVE_COSTS = [100, 150, 200, 250] as const;

export const STAGES = {
  IN_TRAINING: { tier: 0, name: 'In-Training', baseMaxLevel: 10, dpBonus: 1 },
  ROOKIE: { tier: 1, name: 'Rookie', baseMaxLevel: 20, dpBonus: 2 },
  CHAMPION: { tier: 2, name: 'Champion', baseMaxLevel: 35, dpBonus: 3 },
  ULTIMATE: { tier: 3, name: 'Ultimate', baseMaxLevel: 50, dpBonus: 4 },
  MEGA: { tier: 4, name: 'Mega', baseMaxLevel: 70, dpBonus: 5 },
  ULTRA: { tier: 5, name: 'Ultra', baseMaxLevel: 100, dpBonus: 5 },
} as const;

export const ORIGIN_CAPS = {
  0: 2, // In-Training origin → Champion max (tier 2)
  1: 3, // Rookie origin → Ultimate max (tier 3)
  2: 4, // Champion origin → Mega max (tier 4)
} as const;

export const LEVEL_SCALING = {
  DAMAGE_PER_LEVEL: 0.02,    // +2% per level
  SPEED_PER_LEVEL: 0.01,     // +1% per level
  ORIGIN_BONUS_PER_STAGE: 5, // +5 levels per stage difference
};
```

### Attribute System
```typescript
// src/systems/AttributeSystem.ts
export enum Attribute {
  VACCINE = 0,
  DATA = 1,
  VIRUS = 2,
  FREE = 3,
}

const MULTIPLIERS: Record<Attribute, Record<Attribute, number>> = {
  [Attribute.VACCINE]: {
    [Attribute.VACCINE]: 1.0,
    [Attribute.DATA]: 0.75,
    [Attribute.VIRUS]: 1.5,
    [Attribute.FREE]: 1.0,
  },
  [Attribute.DATA]: {
    [Attribute.VACCINE]: 1.5,
    [Attribute.DATA]: 1.0,
    [Attribute.VIRUS]: 0.75,
    [Attribute.FREE]: 1.0,
  },
  [Attribute.VIRUS]: {
    [Attribute.VACCINE]: 0.75,
    [Attribute.DATA]: 1.5,
    [Attribute.VIRUS]: 1.0,
    [Attribute.FREE]: 1.0,
  },
  [Attribute.FREE]: {
    [Attribute.VACCINE]: 1.0,
    [Attribute.DATA]: 1.0,
    [Attribute.VIRUS]: 1.0,
    [Attribute.FREE]: 1.0,
  },
};

export function getAttributeMultiplier(attacker: Attribute, defender: Attribute): number {
  return MULTIPLIERS[attacker][defender];
}

export function canMerge(attr1: Attribute, attr2: Attribute): boolean {
  if (attr1 === Attribute.FREE || attr2 === Attribute.FREE) return true;
  return attr1 === attr2;
}

export function getAttributeColor(attr: Attribute): number {
  switch (attr) {
    case Attribute.VACCINE: return 0xFFD700; // Gold
    case Attribute.DATA: return 0x4A90D9;    // Blue
    case Attribute.VIRUS: return 0x9B59B6;   // Purple
    case Attribute.FREE: return 0xE0E0E0;    // Silver
  }
}
```

### DP System
```typescript
// src/systems/DPSystem.ts
import { STAGES, ORIGIN_CAPS, LEVEL_SCALING } from '@/config/Constants';

export interface DPCalculation {
  maxLevel: number;
  originBonus: number;
  dpBonus: number;
}

export function calculateMaxLevel(
  stageTier: number,
  dp: number,
  originTier: number
): DPCalculation {
  const stageConfig = Object.values(STAGES)[stageTier];
  const dpBonus = dp * stageConfig.dpBonus;
  const originBonus = (stageTier - originTier) * LEVEL_SCALING.ORIGIN_BONUS_PER_STAGE;
  const maxLevel = stageConfig.baseMaxLevel + dpBonus + originBonus;

  return { maxLevel, originBonus, dpBonus };
}

export function getMaxReachableStage(originTier: number): number {
  return ORIGIN_CAPS[originTier as keyof typeof ORIGIN_CAPS] ?? 5;
}

export function calculateMergeDP(dpA: number, dpB: number): number {
  return Math.max(dpA, dpB) + 1;
}

export function getAvailableEvolutions(
  digimonId: string,
  dp: number,
  evolutionData: Record<string, any>
): string[] {
  const evolutions = evolutionData[digimonId] ?? [];
  return evolutions
    .filter((evo: any) => dp >= evo.minDP && dp <= evo.maxDP)
    .map((evo: any) => evo.resultId);
}
```

### Merge System
```typescript
// src/systems/MergeSystem.ts
import { Tower } from '@/entities/Tower';
import { Attribute, canMerge as canMergeAttributes } from './AttributeSystem';
import { calculateMergeDP } from './DPSystem';

export interface MergeResult {
  success: boolean;
  survivor?: Tower;
  sacrifice?: Tower;
  newDP?: number;
  error?: string;
}

export interface MergeValidation {
  canMerge: boolean;
  reason?: string;
}

/**
 * Validates if two towers can be merged
 */
export function validateMerge(towerA: Tower, towerB: Tower): MergeValidation {
  // Cannot merge with self
  if (towerA === towerB) {
    return { canMerge: false, reason: 'Cannot merge a tower with itself' };
  }

  // Must be same stage
  if (towerA.towerData.stageTier !== towerB.towerData.stageTier) {
    return {
      canMerge: false,
      reason: `Stage mismatch: ${towerA.towerData.name} is ${getStageName(towerA.towerData.stageTier)}, ${towerB.towerData.name} is ${getStageName(towerB.towerData.stageTier)}`,
    };
  }

  // Must have compatible attributes
  const attrA = towerA.towerData.attribute;
  const attrB = towerB.towerData.attribute;

  if (!canMergeAttributes(attrA, attrB)) {
    return {
      canMerge: false,
      reason: `Incompatible attributes: ${getAttributeName(attrA)} and ${getAttributeName(attrB)}`,
    };
  }

  return { canMerge: true };
}

/**
 * Determines which tower survives a merge
 * Priority: Higher level > Higher DP > First tower (A)
 */
export function determineSurvivor(towerA: Tower, towerB: Tower): { survivor: Tower; sacrifice: Tower } {
  if (towerA.level > towerB.level) {
    return { survivor: towerA, sacrifice: towerB };
  }

  if (towerB.level > towerA.level) {
    return { survivor: towerB, sacrifice: towerA };
  }

  // Same level - compare DP
  if (towerA.dp >= towerB.dp) {
    return { survivor: towerA, sacrifice: towerB };
  }

  return { survivor: towerB, sacrifice: towerA };
}

/**
 * Calculates the result of merging two towers
 */
export function calculateMergeResult(towerA: Tower, towerB: Tower): MergeResult {
  const validation = validateMerge(towerA, towerB);

  if (!validation.canMerge) {
    return {
      success: false,
      error: validation.reason,
    };
  }

  const { survivor, sacrifice } = determineSurvivor(towerA, towerB);
  const newDP = calculateMergeDP(towerA.dp, towerB.dp);

  return {
    success: true,
    survivor,
    sacrifice,
    newDP,
  };
}

/**
 * Find valid merge targets for a tower
 */
export function findMergeTargets(tower: Tower, allTowers: Tower[]): Tower[] {
  return allTowers.filter(other => {
    if (other === tower) return false;
    return validateMerge(tower, other).canMerge;
  });
}

/**
 * Merge rules summary:
 *
 * SAME STAGE REQUIRED:
 * - In-Training + In-Training ✓
 * - Rookie + Rookie ✓
 * - Champion + Champion ✓
 * - Rookie + Champion ✗
 *
 * ATTRIBUTE COMPATIBILITY:
 * - Same attribute: Always ✓
 * - FREE + Any: Always ✓
 * - Vaccine + Data: ✗
 * - Vaccine + Virus: ✗
 * - Data + Virus: ✗
 *
 * RESULT:
 * - Survivor keeps higher level, gains DP
 * - New DP = MAX(dpA, dpB) + 1
 * - Sacrifice is destroyed
 * - Total investment transferred to survivor
 */

// Helper functions
function getStageName(tier: number): string {
  const stages = ['In-Training', 'Rookie', 'Champion', 'Ultimate', 'Mega', 'Ultra'];
  return stages[tier] ?? 'Unknown';
}

function getAttributeName(attr: Attribute): string {
  const names = ['Vaccine', 'Data', 'Virus', 'Free'];
  return names[attr] ?? 'Unknown';
}
```

### Targeting System
```typescript
// src/systems/TargetingSystem.ts
import Phaser from 'phaser';
import type { Enemy } from '@/entities/Enemy';

export enum TargetPriority {
  FIRST = 'first',
  LAST = 'last',
  STRONGEST = 'strongest',
  WEAKEST = 'weakest',
  FASTEST = 'fastest',
  CLOSEST = 'closest',
  FLYING = 'flying',
}

export function findTarget(
  tower: Phaser.GameObjects.Sprite,
  enemies: Enemy[],
  range: number,
  priority: TargetPriority
): Enemy | null {
  // Filter enemies in range
  const inRange = enemies.filter(enemy => {
    const distance = Phaser.Math.Distance.Between(
      tower.x, tower.y,
      enemy.x, enemy.y
    );
    return distance <= range * 64; // Convert tiles to pixels
  });

  if (inRange.length === 0) return null;

  switch (priority) {
    case TargetPriority.FIRST:
      return inRange.reduce((a, b) =>
        a.pathProgress > b.pathProgress ? a : b
      );

    case TargetPriority.LAST:
      return inRange.reduce((a, b) =>
        a.pathProgress < b.pathProgress ? a : b
      );

    case TargetPriority.STRONGEST:
      return inRange.reduce((a, b) =>
        a.currentHP > b.currentHP ? a : b
      );

    case TargetPriority.WEAKEST:
      return inRange.reduce((a, b) =>
        a.currentHP < b.currentHP ? a : b
      );

    case TargetPriority.FASTEST:
      return inRange.reduce((a, b) =>
        a.speed > b.speed ? a : b
      );

    case TargetPriority.CLOSEST:
      return inRange.reduce((a, b) => {
        const distA = Phaser.Math.Distance.Between(tower.x, tower.y, a.x, a.y);
        const distB = Phaser.Math.Distance.Between(tower.x, tower.y, b.x, b.y);
        return distA < distB ? a : b;
      });

    case TargetPriority.FLYING:
      const flying = inRange.filter(e => e.isFlying);
      if (flying.length > 0) {
        return flying.reduce((a, b) => a.pathProgress > b.pathProgress ? a : b);
      }
      return inRange.reduce((a, b) => a.pathProgress > b.pathProgress ? a : b);

    default:
      return inRange[0];
  }
}
```

---

## 5. Entity Classes

### Tower Entity
```typescript
// src/entities/Tower.ts
import Phaser from 'phaser';
import { EventBus, GameEvents } from '@/utils/EventBus';
import { Attribute, getAttributeMultiplier, getAttributeColor } from '@/systems/AttributeSystem';
import { calculateMaxLevel, getMaxReachableStage } from '@/systems/DPSystem';
import { findTarget, TargetPriority } from '@/systems/TargetingSystem';
import { LEVEL_SCALING, STAGES, GRID, ORIGIN_CAPS } from '@/config/Constants';
import type { GridPosition } from '@/types/GameTypes';
import type { Enemy } from './Enemy';

export interface TowerData {
  id: string;
  name: string;
  stageTier: number;
  attribute: Attribute;
  baseDamage: number;
  baseSpeed: number; // Attacks per second
  range: number;     // In grid cells
  effectType?: string;
  effectChance?: number;
  spriteKey?: string; // Optional custom sprite key
}

export class Tower extends Phaser.GameObjects.Sprite {
  public digimonId: string;
  public towerData: TowerData;
  public level: number = 1;
  public dp: number = 0;
  public originTier: number;
  public targetPriority: TargetPriority = TargetPriority.FIRST;
  public gridPosition: GridPosition;
  public totalInvested: number = 0; // Track total DB spent (for sell value)
  public isBoss: boolean = false;

  private attackCooldown: number = 0;
  private rangeCircle?: Phaser.GameObjects.Graphics;
  private attributeIndicator?: Phaser.GameObjects.Graphics;

  // Target priority cycle order
  private static readonly PRIORITY_ORDER: TargetPriority[] = [
    TargetPriority.FIRST,
    TargetPriority.LAST,
    TargetPriority.STRONGEST,
    TargetPriority.WEAKEST,
    TargetPriority.CLOSEST,
    TargetPriority.FASTEST,
  ];

  constructor(
    scene: Phaser.Scene,
    gridPos: GridPosition,
    data: TowerData,
    originTier: number
  ) {
    // Convert grid position to pixel position (center of cell)
    const x = gridPos.col * GRID.CELL_SIZE + GRID.CELL_SIZE / 2;
    const y = gridPos.row * GRID.CELL_SIZE + GRID.CELL_SIZE / 2;

    // Use sprite key (lowercase digimon name) - individual texture, not atlas
    const textureKey = data.spriteKey ?? data.id.toLowerCase();
    super(scene, x, y, textureKey);

    this.digimonId = data.id;
    this.towerData = data;
    this.originTier = originTier;
    this.gridPosition = gridPos;

    // Scale sprite to fit cell (sprites are ~16x16, cell is 64x64)
    this.setScale(3);

    scene.add.existing(this);
    this.setInteractive({ useHandCursor: true });

    // Create attribute indicator (colored border)
    this.createAttributeIndicator();

    // Events
    this.on('pointerdown', this.onSelect, this);
    this.on('pointerover', this.onHover, this);
    this.on('pointerout', this.onHoverEnd, this);
  }

  update(delta: number, enemies: Enemy[]): void {
    this.attackCooldown -= delta;

    if (this.attackCooldown <= 0) {
      const target = findTarget(this, enemies, this.getRange(), this.targetPriority);
      if (target) {
        this.attack(target);
        this.attackCooldown = 1000 / this.getAttackSpeed();
      }
    }
  }

  attack(target: Enemy): void {
    const damage = this.calculateDamage(target.attribute);
    EventBus.emit('tower:attack', {
      tower: this,
      target,
      damage,
      effect: this.towerData.effectType,
      effectChance: this.towerData.effectChance ?? 0,
    });
  }

  calculateDamage(targetAttribute: Attribute): number {
    const baseDamage = this.towerData.baseDamage;
    const levelMultiplier = 1 + this.level * LEVEL_SCALING.DAMAGE_PER_LEVEL;
    const attributeMultiplier = getAttributeMultiplier(this.towerData.attribute, targetAttribute);
    return Math.floor(baseDamage * levelMultiplier * attributeMultiplier);
  }

  getAttackSpeed(): number {
    return this.towerData.baseSpeed * (1 + this.level * LEVEL_SCALING.SPEED_PER_LEVEL);
  }

  getRange(): number {
    return this.towerData.range;
  }

  getRangeInPixels(): number {
    return this.towerData.range * GRID.CELL_SIZE;
  }

  getMaxLevel(): number {
    return calculateMaxLevel(this.towerData.stageTier, this.dp, this.originTier).maxLevel;
  }

  getLevelUpCost(): number {
    return 5 * this.level;
  }

  canLevelUp(): boolean {
    return this.level < this.getMaxLevel();
  }

  canDigivolve(): boolean {
    const stageConfigs = Object.values(STAGES);
    const currentStage = stageConfigs[this.towerData.stageTier];
    const maxReachableStage = getMaxReachableStage(this.originTier);

    // Must be at base max level AND not at max reachable stage
    return this.level >= currentStage.baseMaxLevel &&
           this.towerData.stageTier < maxReachableStage;
  }

  getDigivolveCost(): number {
    // Cost increases per stage: 100, 150, 200, 250
    const costs = [100, 150, 200, 250];
    return costs[this.towerData.stageTier] ?? 250;
  }

  getSellValue(): number {
    // Return 50% of total investment
    return Math.floor(this.totalInvested * 0.5);
  }

  levelUp(): boolean {
    if (this.canLevelUp()) {
      this.level++;
      EventBus.emit(GameEvents.TOWER_LEVELED, this);
      return true;
    }
    return false;
  }

  cycleTargetPriority(): void {
    const currentIndex = Tower.PRIORITY_ORDER.indexOf(this.targetPriority);
    const nextIndex = (currentIndex + 1) % Tower.PRIORITY_ORDER.length;
    this.targetPriority = Tower.PRIORITY_ORDER[nextIndex];
  }

  setTargetPriority(priority: TargetPriority): void {
    this.targetPriority = priority;
  }

  private createAttributeIndicator(): void {
    this.attributeIndicator = this.scene.add.graphics();
    const color = getAttributeColor(this.towerData.attribute);
    this.attributeIndicator.lineStyle(3, color, 0.8);
    this.attributeIndicator.strokeCircle(this.x, this.y, GRID.CELL_SIZE / 2 - 4);
  }

  showRange(): void {
    if (this.rangeCircle) return;

    const rangePixels = this.getRangeInPixels();
    this.rangeCircle = this.scene.add.graphics();
    this.rangeCircle.lineStyle(2, 0x4A90D9, 0.5);
    this.rangeCircle.strokeCircle(this.x, this.y, rangePixels);
    this.rangeCircle.fillStyle(0x4A90D9, 0.1);
    this.rangeCircle.fillCircle(this.x, this.y, rangePixels);
  }

  hideRange(): void {
    this.rangeCircle?.destroy();
    this.rangeCircle = undefined;
  }

  private onSelect(pointer: Phaser.Input.Pointer): void {
    // Prevent event from bubbling to scene
    pointer.event.stopPropagation();
    EventBus.emit(GameEvents.TOWER_SELECTED, this);
    this.showRange();
  }

  private onHover(): void {
    this.setTint(0xcccccc);
  }

  private onHoverEnd(): void {
    this.clearTint();
  }

  // Update sprite when digivolving
  updateSprite(newData: TowerData): void {
    this.towerData = newData;
    this.digimonId = newData.id;
    const textureKey = newData.spriteKey ?? newData.id.toLowerCase();
    this.setTexture(textureKey);

    // Update attribute indicator
    this.attributeIndicator?.destroy();
    this.createAttributeIndicator();
  }

  // Serialize for save
  toSaveData(): object {
    return {
      digimonId: this.digimonId,
      position: this.gridPosition,
      level: this.level,
      dp: this.dp,
      originTier: this.originTier,
      targetPriority: this.targetPriority,
      totalInvested: this.totalInvested,
    };
  }

  destroy(fromScene?: boolean): void {
    this.hideRange();
    this.attributeIndicator?.destroy();
    super.destroy(fromScene);
  }
}
```

### Enemy Entity
```typescript
// src/entities/Enemy.ts
import Phaser from 'phaser';
import { EventBus, GameEvents } from '@/utils/EventBus';
import { Attribute, getAttributeColor } from '@/systems/AttributeSystem';
import { GRID } from '@/config/Constants';

export type EnemyType = 'swarm' | 'standard' | 'tank' | 'speedster' | 'flying' | 'regen' | 'shielded' | 'splitter';
export type EnemyModifier = 'enraged' | 'armored' | 'hasty' | 'vampiric' | 'giant';

export interface EnemyData {
  id: string;
  name: string;
  stageTier: number;
  attribute: Attribute;
  baseHP: number;
  baseSpeed: number; // Pixels per second
  armor: number;     // Percentage damage reduction (0-100)
  type: EnemyType;
  reward: number;
  spriteKey?: string;
}

export class Enemy extends Phaser.GameObjects.Sprite {
  public enemyData: EnemyData;
  public currentHP: number;
  public maxHP: number;
  public speed: number;
  public armor: number;
  public attribute: Attribute;
  public pathProgress: number = 0;
  public isFlying: boolean;
  public isBoss: boolean = false;
  public reward: number;
  public modifiers: Set<EnemyModifier> = new Set();

  private waypoints: Phaser.Math.Vector2[];
  private currentWaypointIndex: number = 0;
  private healthBar?: Phaser.GameObjects.Graphics;
  private statusEffects: Map<string, { duration: number; value: number }> = new Map();
  private distanceTraveled: number = 0;

  constructor(
    scene: Phaser.Scene,
    waypoints: Phaser.Math.Vector2[],
    data: EnemyData,
    hpMultiplier: number = 1,
    modifiers: EnemyModifier[] = []
  ) {
    const startPos = waypoints[0];
    // Use sprite key (lowercase) - individual texture, not atlas
    const textureKey = data.spriteKey ?? data.id.toLowerCase();
    super(scene, startPos.x, startPos.y, textureKey);

    this.enemyData = data;
    this.waypoints = waypoints;
    this.attribute = data.attribute;
    this.isFlying = data.type === 'flying';
    this.reward = data.reward;

    // Apply modifiers
    modifiers.forEach(mod => this.modifiers.add(mod));

    // Calculate final stats with modifiers
    let hpMod = hpMultiplier;
    let speedMod = 1;
    let armorMod = 0;

    if (this.modifiers.has('giant')) {
      hpMod *= 2;
      this.setScale(4); // Larger sprite
    } else {
      this.setScale(2.5);
    }

    if (this.modifiers.has('armored')) {
      armorMod = 20;
    }

    if (this.modifiers.has('hasty')) {
      speedMod = 1.5;
    }

    if (this.modifiers.has('enraged')) {
      speedMod *= 1.3;
      hpMod *= 0.8;
    }

    this.maxHP = Math.floor(data.baseHP * hpMod);
    this.currentHP = this.maxHP;
    this.speed = data.baseSpeed * speedMod;
    this.armor = Math.min(80, data.armor + armorMod); // Cap at 80%

    scene.add.existing(this);
    this.createHealthBar();

    // Tint based on attribute
    this.setTint(getAttributeColor(this.attribute));
  }

  update(delta: number): void {
    this.updateStatusEffects(delta);
    this.move(delta);
    this.updateHealthBar();

    // Handle damage-over-time effects
    this.processDOTEffects(delta);

    if (this.reachedEnd()) {
      EventBus.emit(GameEvents.ENEMY_REACHED_BASE, this);
    }
  }

  private move(delta: number): void {
    // Check movement-preventing effects
    if (this.statusEffects.has('stun') || this.statusEffects.has('freeze')) {
      return;
    }

    // Calculate effective speed
    let effectiveSpeed = this.speed;

    if (this.statusEffects.has('slow')) {
      const slowValue = this.statusEffects.get('slow')!.value;
      effectiveSpeed *= (1 - slowValue / 100);
    }

    const targetWaypoint = this.waypoints[this.currentWaypointIndex];
    if (!targetWaypoint) return;

    const distance = Phaser.Math.Distance.Between(this.x, this.y, targetWaypoint.x, targetWaypoint.y);
    const moveDistance = effectiveSpeed * (delta / 1000);

    if (distance <= moveDistance) {
      // Reached waypoint
      this.x = targetWaypoint.x;
      this.y = targetWaypoint.y;
      this.distanceTraveled += distance;
      this.currentWaypointIndex++;

      // Calculate path progress (0 to 1)
      this.pathProgress = this.currentWaypointIndex / this.waypoints.length;
    } else {
      // Move towards waypoint
      const angle = Phaser.Math.Angle.Between(this.x, this.y, targetWaypoint.x, targetWaypoint.y);
      this.x += Math.cos(angle) * moveDistance;
      this.y += Math.sin(angle) * moveDistance;
      this.distanceTraveled += moveDistance;

      // Update path progress based on distance traveled (approximation)
      const totalPathLength = this.estimateTotalPathLength();
      this.pathProgress = Math.min(1, this.distanceTraveled / totalPathLength);
    }
  }

  private estimateTotalPathLength(): number {
    let total = 0;
    for (let i = 1; i < this.waypoints.length; i++) {
      total += Phaser.Math.Distance.Between(
        this.waypoints[i - 1].x, this.waypoints[i - 1].y,
        this.waypoints[i].x, this.waypoints[i].y
      );
    }
    return total;
  }

  takeDamage(damage: number, source?: any): void {
    // Calculate armor reduction
    let effectiveArmor = this.armor;

    if (this.statusEffects.has('armorBreak')) {
      const reduction = this.statusEffects.get('armorBreak')!.value;
      effectiveArmor = Math.max(0, this.armor - reduction);
    }

    const actualDamage = damage * (1 - effectiveArmor / 100);
    this.currentHP -= actualDamage;

    // Flash white on hit
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(50, () => {
      this.clearTint();
      this.setTint(getAttributeColor(this.attribute));
    });

    // Vampiric modifier heals attacker
    if (this.modifiers.has('vampiric') && source) {
      // Emit heal event for tower (handled by CombatManager)
      EventBus.emit('enemy:vampiricHit', { enemy: this, tower: source, damage: actualDamage });
    }

    if (this.currentHP <= 0) {
      this.currentHP = 0;

      // Splitter spawns smaller enemies
      if (this.enemyData.type === 'splitter' && !this.modifiers.has('split')) {
        EventBus.emit('enemy:split', {
          enemy: this,
          position: { x: this.x, y: this.y },
          waypointIndex: this.currentWaypointIndex,
        });
      }

      EventBus.emit(GameEvents.ENEMY_DIED, this, source);
    }
  }

  applyEffect(effectType: string, duration: number, value: number): void {
    // Some effects don't stack - take the stronger one
    const existing = this.statusEffects.get(effectType);
    if (existing && existing.value >= value && existing.duration > 0) {
      return; // Existing effect is stronger
    }

    this.statusEffects.set(effectType, { duration, value });

    // Visual feedback for effects
    if (effectType === 'freeze') {
      this.setTint(0x00FFFF);
    } else if (effectType === 'burn' || effectType === 'poison') {
      // DOT effects handled in processDOTEffects
    }
  }

  hasEffect(effectType: string): boolean {
    return this.statusEffects.has(effectType);
  }

  private processDOTEffects(delta: number): void {
    // Burn: percentage damage
    if (this.statusEffects.has('burn')) {
      const burnData = this.statusEffects.get('burn')!;
      const burnDamage = this.maxHP * (burnData.value / 100) * (delta / 1000);
      this.currentHP -= burnDamage;
    }

    // Poison: flat damage, prevents regen
    if (this.statusEffects.has('poison')) {
      const poisonData = this.statusEffects.get('poison')!;
      const poisonDamage = poisonData.value * (delta / 1000);
      this.currentHP -= poisonDamage;
    }

    // Regen type heals (unless poisoned)
    if (this.enemyData.type === 'regen' && !this.statusEffects.has('poison')) {
      this.currentHP = Math.min(this.maxHP, this.currentHP + this.maxHP * 0.02 * (delta / 1000));
    }

    // Check death from DOT
    if (this.currentHP <= 0) {
      this.currentHP = 0;
      EventBus.emit(GameEvents.ENEMY_DIED, this, null);
    }
  }

  private updateStatusEffects(delta: number): void {
    for (const [effect, data] of this.statusEffects) {
      data.duration -= delta;
      if (data.duration <= 0) {
        this.statusEffects.delete(effect);

        // Clear visual effects
        if (effect === 'freeze') {
          this.setTint(getAttributeColor(this.attribute));
        }
      }
    }
  }

  private reachedEnd(): boolean {
    return this.currentWaypointIndex >= this.waypoints.length;
  }

  private createHealthBar(): void {
    this.healthBar = this.scene.add.graphics();
    this.updateHealthBar();
  }

  private updateHealthBar(): void {
    if (!this.healthBar) return;

    this.healthBar.clear();
    const width = this.modifiers.has('giant') ? 60 : 40;
    const height = 4;
    const x = this.x - width / 2;
    const y = this.y - (this.modifiers.has('giant') ? 40 : 28);

    // Background
    this.healthBar.fillStyle(0x333333);
    this.healthBar.fillRect(x, y, width, height);

    // Health
    const healthPercent = Math.max(0, this.currentHP / this.maxHP);
    const color = healthPercent > 0.5 ? 0x27AE60 : healthPercent > 0.25 ? 0xF39C12 : 0xE74C3C;
    this.healthBar.fillStyle(color);
    this.healthBar.fillRect(x, y, width * healthPercent, height);

    // Armor indicator (if any)
    if (this.armor > 0) {
      this.healthBar.fillStyle(0x888888);
      this.healthBar.fillRect(x, y + height, width * (this.armor / 100), 2);
    }
  }

  destroy(fromScene?: boolean): void {
    this.healthBar?.destroy();
    super.destroy(fromScene);
  }
}
```

### Projectile Entity
```typescript
// src/entities/Projectile.ts
import Phaser from 'phaser';
import { EventBus } from '@/utils/EventBus';
import type { Tower } from './Tower';
import type { Enemy } from './Enemy';

export interface ProjectileConfig {
  speed: number;        // Pixels per second
  damage: number;
  effectType?: string;
  effectChance?: number;
  effectDuration?: number;
  effectValue?: number;
  isHoming?: boolean;   // Tracks target
  piercing?: number;    // Number of enemies to hit (0 = single target)
  splash?: number;      // Splash radius in pixels (0 = no splash)
}

export class Projectile extends Phaser.GameObjects.Arc {
  public config: ProjectileConfig;
  public source: Tower;
  public target: Enemy | null;
  public targetPosition: Phaser.Math.Vector2;

  private pierceCount: number = 0;
  private hitEnemies: Set<Enemy> = new Set();

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    source: Tower,
    target: Enemy,
    config: ProjectileConfig
  ) {
    super(scene, x, y, 4, 0, Math.PI * 2, false, 0xFFFFFF);

    this.source = source;
    this.target = target;
    this.config = config;
    this.targetPosition = new Phaser.Math.Vector2(target.x, target.y);

    // Color based on effect type
    this.setFillStyle(this.getProjectileColor());

    scene.add.existing(this);
  }

  private getProjectileColor(): number {
    switch (this.config.effectType) {
      case 'burn': return 0xFF4500;
      case 'poison': return 0x32CD32;
      case 'freeze': return 0x00FFFF;
      case 'slow': return 0x4169E1;
      case 'stun': return 0xFFD700;
      case 'armorBreak': return 0x8B4513;
      default: return 0xFFFFFF;
    }
  }

  update(delta: number): void {
    if (!this.active) return;

    // Update target position if homing and target still alive
    if (this.config.isHoming && this.target?.active) {
      this.targetPosition.set(this.target.x, this.target.y);
    }

    // Move towards target
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      this.targetPosition.x, this.targetPosition.y
    );

    const moveDistance = this.config.speed * (delta / 1000);

    if (distance <= moveDistance) {
      // Hit target position
      this.onHit();
    } else {
      // Move towards target
      const angle = Phaser.Math.Angle.Between(
        this.x, this.y,
        this.targetPosition.x, this.targetPosition.y
      );
      this.x += Math.cos(angle) * moveDistance;
      this.y += Math.sin(angle) * moveDistance;
    }
  }

  private onHit(): void {
    if (this.config.splash && this.config.splash > 0) {
      // Splash damage
      EventBus.emit('projectile:splash', {
        projectile: this,
        x: this.targetPosition.x,
        y: this.targetPosition.y,
        radius: this.config.splash,
        damage: this.config.damage,
        effect: this.config.effectType,
        effectChance: this.config.effectChance,
        effectDuration: this.config.effectDuration,
        effectValue: this.config.effectValue,
      });
    } else if (this.target?.active) {
      // Single target damage
      EventBus.emit('projectile:hit', {
        projectile: this,
        target: this.target,
        damage: this.config.damage,
        effect: this.config.effectType,
        effectChance: this.config.effectChance,
        effectDuration: this.config.effectDuration,
        effectValue: this.config.effectValue,
      });

      this.hitEnemies.add(this.target);
    }

    // Check piercing
    if (this.config.piercing && this.pierceCount < this.config.piercing) {
      this.pierceCount++;
      this.findNextTarget();
    } else {
      this.deactivate();
    }
  }

  private findNextTarget(): void {
    // Find next closest enemy not already hit
    EventBus.emit('projectile:findNextTarget', {
      projectile: this,
      hitEnemies: this.hitEnemies,
      callback: (newTarget: Enemy | null) => {
        if (newTarget) {
          this.target = newTarget;
          this.targetPosition.set(newTarget.x, newTarget.y);
        } else {
          this.deactivate();
        }
      },
    });
  }

  private deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
    this.hitEnemies.clear();
    this.pierceCount = 0;
  }

  // Reset for object pooling
  reset(x: number, y: number, source: Tower, target: Enemy, config: ProjectileConfig): void {
    this.x = x;
    this.y = y;
    this.source = source;
    this.target = target;
    this.config = config;
    this.targetPosition.set(target.x, target.y);
    this.hitEnemies.clear();
    this.pierceCount = 0;
    this.setFillStyle(this.getProjectileColor());
    this.setActive(true);
    this.setVisible(true);
  }
}
```

### Boss Entity
```typescript
// src/entities/Boss.ts
import Phaser from 'phaser';
import { Enemy, EnemyData, EnemyModifier } from './Enemy';
import { EventBus, GameEvents } from '@/utils/EventBus';

export type BossAbility =
  | 'charge'      // Speed boost
  | 'shield'      // Temporary invulnerability
  | 'summon'      // Spawn minions
  | 'heal'        // Heal self
  | 'slow_aura'   // Slow nearby towers
  | 'disable'     // Temporarily disable a tower
  | 'teleport';   // Jump forward on path

export interface BossData extends EnemyData {
  abilities: BossAbility[];
  abilityCooldown: number; // ms between abilities
  livesOnEscape: number;   // Lives lost if reaches base (default 3)
}

export class Boss extends Enemy {
  public bossData: BossData;
  public abilities: BossAbility[];

  private abilityCooldown: number = 0;
  private currentAbilityIndex: number = 0;
  private isInvulnerable: boolean = false;
  private shieldGraphics?: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    waypoints: Phaser.Math.Vector2[],
    data: BossData,
    hpMultiplier: number = 1
  ) {
    super(scene, waypoints, data, hpMultiplier, []);

    this.bossData = data;
    this.abilities = data.abilities;
    this.isBoss = true;
    this.reward = data.reward * 3; // Bosses give 3x reward

    // Bosses are larger
    this.setScale(4);

    // Add boss indicator
    this.createBossIndicator();

    EventBus.emit(GameEvents.BOSS_SPAWNED, this);
  }

  update(delta: number): void {
    super.update(delta);

    // Update ability cooldown
    this.abilityCooldown -= delta;

    if (this.abilityCooldown <= 0 && this.abilities.length > 0) {
      this.useAbility();
      this.abilityCooldown = this.bossData.abilityCooldown;
    }

    // Update shield visual if active
    if (this.shieldGraphics) {
      this.shieldGraphics.x = this.x;
      this.shieldGraphics.y = this.y;
    }
  }

  takeDamage(damage: number, source?: any): void {
    if (this.isInvulnerable) {
      return; // Shield active
    }
    super.takeDamage(damage, source);
  }

  private useAbility(): void {
    const ability = this.abilities[this.currentAbilityIndex];
    this.currentAbilityIndex = (this.currentAbilityIndex + 1) % this.abilities.length;

    switch (ability) {
      case 'charge':
        this.abilityCharge();
        break;
      case 'shield':
        this.abilityShield();
        break;
      case 'summon':
        this.abilitySummon();
        break;
      case 'heal':
        this.abilityHeal();
        break;
      case 'slow_aura':
        this.abilitySlowAura();
        break;
      case 'disable':
        this.abilityDisable();
        break;
      case 'teleport':
        this.abilityTeleport();
        break;
    }

    EventBus.emit(GameEvents.BOSS_ABILITY, { boss: this, ability });
  }

  private abilityCharge(): void {
    // Double speed for 3 seconds
    const originalSpeed = this.speed;
    this.speed *= 2;
    this.setTint(0xFF0000);

    this.scene.time.delayedCall(3000, () => {
      this.speed = originalSpeed;
      this.clearTint();
    });
  }

  private abilityShield(): void {
    // Invulnerable for 2 seconds
    this.isInvulnerable = true;
    this.shieldGraphics = this.scene.add.graphics();
    this.shieldGraphics.lineStyle(3, 0x00FFFF, 0.8);
    this.shieldGraphics.strokeCircle(0, 0, 40);

    this.scene.time.delayedCall(2000, () => {
      this.isInvulnerable = false;
      this.shieldGraphics?.destroy();
      this.shieldGraphics = undefined;
    });
  }

  private abilitySummon(): void {
    // Spawn 3 minions
    EventBus.emit('boss:summon', {
      boss: this,
      count: 3,
      position: { x: this.x, y: this.y },
    });
  }

  private abilityHeal(): void {
    // Heal 20% of max HP
    const healAmount = this.maxHP * 0.2;
    this.currentHP = Math.min(this.maxHP, this.currentHP + healAmount);

    // Visual effect
    this.setTint(0x00FF00);
    this.scene.time.delayedCall(500, () => this.clearTint());
  }

  private abilitySlowAura(): void {
    // Emit event for towers in range to be slowed
    EventBus.emit('boss:slowAura', {
      boss: this,
      radius: 200,
      slowAmount: 50, // 50% attack speed reduction
      duration: 5000,
    });
  }

  private abilityDisable(): void {
    // Disable nearest tower for 3 seconds
    EventBus.emit('boss:disable', {
      boss: this,
      duration: 3000,
    });
  }

  private abilityTeleport(): void {
    // Skip forward 5 waypoints
    const jumpAmount = 5;
    // Handled by increasing pathProgress
    EventBus.emit('boss:teleport', {
      boss: this,
      waypointsToSkip: jumpAmount,
    });
  }

  private createBossIndicator(): void {
    // Crown or skull icon above boss
    const indicator = this.scene.add.text(this.x, this.y - 50, '👑', {
      fontSize: '20px',
    }).setOrigin(0.5);

    // Follow boss
    this.scene.events.on('update', () => {
      if (this.active) {
        indicator.setPosition(this.x, this.y - 50);
      } else {
        indicator.destroy();
      }
    });
  }

  destroy(fromScene?: boolean): void {
    this.shieldGraphics?.destroy();
    super.destroy(fromScene);
  }
}
```

---

## 6. Manager Classes

### GameStateManager
```typescript
// src/managers/GameStateManager.ts
import Phaser from 'phaser';
import { EventBus, GameEvents } from '@/utils/EventBus';
import { GAME } from '@/config/Constants';

export class GameStateManager {
  private scene: Phaser.Scene;

  public digibytes: number = GAME.STARTING_DIGIBYTES;
  public lives: number = GAME.STARTING_LIVES;
  public currentWave: number = 0;
  public highestWave: number = 0;
  public gameMode: 'normal' | 'endless' = 'normal';
  public isPaused: boolean = false;
  public gameSpeed: number = 1.0;

  // Statistics
  public stats = {
    enemiesKilled: 0,
    totalDBEarned: 0,
    totalDBSpent: 0,
    digimonSpawned: 0,
    mergesPerformed: 0,
    digivolutionsPerformed: 0,
    playTime: 0,
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  addDigibytes(amount: number): void {
    this.digibytes += amount;
    this.stats.totalDBEarned += amount;
    EventBus.emit(GameEvents.DIGIBYTES_CHANGED, this.digibytes);
  }

  spendDigibytes(amount: number): boolean {
    if (this.digibytes >= amount) {
      this.digibytes -= amount;
      this.stats.totalDBSpent += amount;
      EventBus.emit(GameEvents.DIGIBYTES_CHANGED, this.digibytes);
      return true;
    }
    return false;
  }

  canAfford(amount: number): boolean {
    return this.digibytes >= amount;
  }

  loseLives(amount: number): void {
    this.lives = Math.max(0, this.lives - amount);
    EventBus.emit(GameEvents.LIVES_CHANGED, this.lives);

    if (this.lives <= 0) {
      EventBus.emit(GameEvents.GAME_OVER);
    }
  }

  gainLives(amount: number): void {
    this.lives = Math.min(GAME.MAX_LIVES, this.lives + amount);
    EventBus.emit(GameEvents.LIVES_CHANGED, this.lives);
  }

  setWave(wave: number): void {
    this.currentWave = wave;
    this.highestWave = Math.max(this.highestWave, wave);
    EventBus.emit(GameEvents.WAVE_CHANGED, wave);
  }

  recordKill(): void {
    this.stats.enemiesKilled++;
  }

  recordSpawn(): void {
    this.stats.digimonSpawned++;
  }

  recordMerge(): void {
    this.stats.mergesPerformed++;
  }

  recordDigivolve(): void {
    this.stats.digivolutionsPerformed++;
  }

  toSaveData(): object {
    return {
      digibytes: this.digibytes,
      lives: this.lives,
      currentWave: this.currentWave,
      highestWave: this.highestWave,
      gameMode: this.gameMode,
      stats: { ...this.stats },
    };
  }

  fromSaveData(data: any): void {
    this.digibytes = data.digibytes ?? GAME.STARTING_DIGIBYTES;
    this.lives = data.lives ?? GAME.STARTING_LIVES;
    this.currentWave = data.currentWave ?? 0;
    this.highestWave = data.highestWave ?? 0;
    this.gameMode = data.gameMode ?? 'normal';
    this.stats = { ...this.stats, ...data.stats };
  }
}
```

### WaveManager
```typescript
// src/managers/WaveManager.ts
import Phaser from 'phaser';
import { EventBus, GameEvents } from '@/utils/EventBus';
import { Enemy, EnemyData } from '@/entities/Enemy';

interface WaveConfig {
  enemies: { id: string; count: number; type?: string }[];
  spawnInterval: number;
  boss?: string;
}

export class WaveManager {
  private scene: Phaser.Scene;
  private waveData: Record<number, WaveConfig>;
  private enemyData: Record<string, EnemyData>;

  private currentWave: number = 0;
  private enemiesRemaining: number = 0;
  private spawnQueue: string[] = [];
  private spawnTimer: number = 0;
  private waveActive: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.waveData = scene.registry.get('waveData');
    this.enemyData = scene.registry.get('digimonData').enemies;
  }

  startWave(waveNumber: number): void {
    this.currentWave = waveNumber;
    const config = this.getWaveConfig(waveNumber);

    this.buildSpawnQueue(config);
    this.enemiesRemaining = this.spawnQueue.length;
    this.waveActive = true;
    this.spawnTimer = 0;

    EventBus.emit(GameEvents.WAVE_STARTED, waveNumber);
  }

  update(delta: number): void {
    if (!this.waveActive) return;

    this.spawnTimer += delta;
    const config = this.getWaveConfig(this.currentWave);

    if (this.spawnTimer >= config.spawnInterval && this.spawnQueue.length > 0) {
      this.spawnEnemy(this.spawnQueue.shift()!);
      this.spawnTimer = 0;
    }
  }

  onEnemyDied(): void {
    this.enemiesRemaining--;

    if (this.enemiesRemaining <= 0 && this.spawnQueue.length === 0) {
      this.waveActive = false;
      EventBus.emit(GameEvents.WAVE_COMPLETED, this.currentWave);
    }
  }

  private getWaveConfig(wave: number): WaveConfig {
    return this.waveData[wave] ?? this.generateEndlessWave(wave);
  }

  private buildSpawnQueue(config: WaveConfig): void {
    this.spawnQueue = [];

    for (const entry of config.enemies) {
      for (let i = 0; i < entry.count; i++) {
        this.spawnQueue.push(entry.id);
      }
    }

    // Shuffle
    Phaser.Utils.Array.Shuffle(this.spawnQueue);

    // Add boss at end if present
    if (config.boss) {
      this.spawnQueue.push(config.boss);
    }
  }

  private spawnEnemy(enemyId: string): void {
    const data = this.enemyData[enemyId];
    if (!data) return;

    const gameScene = this.scene as any;
    const waypoints = gameScene.getWaypoints();
    const hpMultiplier = this.getHPMultiplier();

    const enemy = new Enemy(this.scene, waypoints, data, hpMultiplier);
    gameScene.getEnemies().add(enemy);

    if (data.type === 'boss') {
      EventBus.emit(GameEvents.BOSS_SPAWNED, enemy);
    } else {
      EventBus.emit(GameEvents.ENEMY_SPAWNED, enemy);
    }
  }

  private getHPMultiplier(): number {
    if (this.currentWave <= 100) {
      // Within-phase scaling: +8% per wave into phase
      const phases = [0, 20, 40, 60, 80];
      const phaseStart = phases.filter(p => this.currentWave > p).pop() ?? 0;
      const wavesIntoPhase = this.currentWave - phaseStart;
      return 1 + 0.08 * wavesIntoPhase;
    } else {
      // Endless scaling: 5% compounding
      return Math.pow(1.05, this.currentWave - 100);
    }
  }

  private generateEndlessWave(wave: number): WaveConfig {
    // Generate random endless wave
    const count = Math.min(100, 50 + (wave - 100) * 2);
    const interval = Math.max(300, 600 - (wave - 100) * 10);

    return {
      enemies: [
        { id: 'omegamon', count: Math.floor(count * 0.3) },
        { id: 'wargreymon', count: Math.floor(count * 0.4) },
        { id: 'metalgarurumon', count: Math.floor(count * 0.3) },
      ],
      spawnInterval: interval,
      boss: wave % 10 === 0 ? 'apocalymon' : undefined,
    };
  }

  getWaveReward(wave: number): number {
    if (wave <= 10) return 50 + wave * 5;
    if (wave <= 20) return 75 + (wave - 10) * 8;
    if (wave <= 30) return 100 + (wave - 20) * 12;
    if (wave <= 40) return 150 + (wave - 30) * 18;
    if (wave <= 50) return 200 + (wave - 40) * 25;
    return Math.floor(200 * Math.pow(1.1, wave - 50));
  }
}
```

### TowerManager
```typescript
// src/managers/TowerManager.ts
import Phaser from 'phaser';
import { Tower, TowerData } from '@/entities/Tower';
import { EventBus, GameEvents } from '@/utils/EventBus';
import { canMerge } from '@/systems/AttributeSystem';
import { calculateMergeDP, getAvailableEvolutions } from '@/systems/DPSystem';
import { GRID, SPAWN_COSTS, DIGIVOLVE_COSTS, STAGES } from '@/config/Constants';
import type { GridPosition } from '@/types/GameTypes';
import type { GameScene } from '@/scenes/GameScene';

export class TowerManager {
  private scene: GameScene;
  private digimonData: Record<string, TowerData>;
  private evolutionData: Record<string, any>;
  private towerMap: Map<string, Tower> = new Map(); // "col,row" -> Tower

  constructor(scene: Phaser.Scene) {
    this.scene = scene as GameScene;
    this.digimonData = scene.registry.get('digimonData')?.towers ?? {};
    this.evolutionData = scene.registry.get('evolutionData') ?? {};

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    EventBus.on('tower:attack', this.onTowerAttack, this);
    EventBus.on(GameEvents.TOWER_SOLD, this.onTowerSold, this);
  }

  spawnTower(
    digimonId: string,
    position: GridPosition,
    isFree: boolean = false
  ): Tower | null {
    const data = this.digimonData[digimonId];
    if (!data) {
      console.error(`Unknown Digimon: ${digimonId}`);
      return null;
    }

    // Check if position is valid and empty
    const posKey = `${position.col},${position.row}`;
    if (this.towerMap.has(posKey)) {
      console.warn(`Position ${posKey} already occupied`);
      return null;
    }

    // Create tower
    const originTier = data.stageTier; // Origin is spawn stage
    const tower = new Tower(this.scene, position, data, originTier);

    // Track investment
    if (!isFree) {
      const stageName = Object.keys(STAGES)[data.stageTier] as keyof typeof SPAWN_COSTS;
      const cost = SPAWN_COSTS[stageName]?.specific ?? 0;
      tower.totalInvested = cost;
    }

    // Add to tracking
    this.towerMap.set(posKey, tower);
    this.scene.towers.add(tower);

    // Play sound and emit event
    this.scene.getAudioManager().play('sfx-spawn');
    EventBus.emit(GameEvents.TOWER_PLACED, tower);
    this.scene.getGameState().recordSpawn();

    return tower;
  }

  getTowerAt(position: GridPosition): Tower | null {
    return this.towerMap.get(`${position.col},${position.row}`) ?? null;
  }

  getAllTowers(): Tower[] {
    return Array.from(this.towerMap.values());
  }

  levelUpTower(tower: Tower): boolean {
    const cost = tower.getLevelUpCost();
    const gameState = this.scene.getGameState();

    if (!tower.canLevelUp()) {
      return false;
    }

    if (!gameState.canAfford(cost)) {
      this.scene.getAudioManager().play('sfx-insufficient-funds');
      return false;
    }

    gameState.spendDigibytes(cost);
    tower.totalInvested += cost;
    tower.levelUp();
    this.scene.getAudioManager().play('sfx-level-up');

    return true;
  }

  evolveTower(tower: Tower, targetDigimonId: string): boolean {
    const cost = tower.getDigivolveCost();
    const gameState = this.scene.getGameState();

    if (!tower.canDigivolve()) {
      return false;
    }

    // Verify evolution is valid
    const availableEvos = getAvailableEvolutions(
      tower.digimonId,
      tower.dp,
      this.evolutionData
    );

    if (!availableEvos.includes(targetDigimonId)) {
      console.warn(`Invalid evolution: ${tower.digimonId} -> ${targetDigimonId}`);
      return false;
    }

    if (!gameState.canAfford(cost)) {
      this.scene.getAudioManager().play('sfx-insufficient-funds');
      return false;
    }

    // Get new Digimon data
    const newData = this.digimonData[targetDigimonId];
    if (!newData) {
      console.error(`Unknown evolution target: ${targetDigimonId}`);
      return false;
    }

    // Perform evolution
    gameState.spendDigibytes(cost);
    tower.totalInvested += cost;
    tower.level = 1; // Reset level
    tower.updateSprite(newData);

    this.scene.getAudioManager().play('sfx-evolve');
    EventBus.emit(GameEvents.TOWER_EVOLVED, tower);
    gameState.recordDigivolve();

    return true;
  }

  mergeTowers(towerA: Tower, towerB: Tower): Tower | null {
    // Validate merge
    if (!this.canMerge(towerA, towerB)) {
      return null;
    }

    const gameState = this.scene.getGameState();

    // Determine survivor (higher level wins, else higher DP, else A)
    let survivor: Tower;
    let sacrifice: Tower;

    if (towerA.level > towerB.level) {
      survivor = towerA;
      sacrifice = towerB;
    } else if (towerB.level > towerA.level) {
      survivor = towerB;
      sacrifice = towerA;
    } else if (towerA.dp >= towerB.dp) {
      survivor = towerA;
      sacrifice = towerB;
    } else {
      survivor = towerB;
      sacrifice = towerA;
    }

    // Calculate new DP
    const newDP = calculateMergeDP(towerA.dp, towerB.dp);
    survivor.dp = newDP;
    survivor.totalInvested += sacrifice.totalInvested;

    // Remove sacrifice
    const sacrificePos = `${sacrifice.gridPosition.col},${sacrifice.gridPosition.row}`;
    this.towerMap.delete(sacrificePos);
    sacrifice.destroy();

    this.scene.getAudioManager().play('sfx-merge');
    EventBus.emit(GameEvents.TOWER_MERGED, { survivor, sacrifice });
    gameState.recordMerge();

    return survivor;
  }

  canMerge(towerA: Tower, towerB: Tower): boolean {
    // Must be same stage
    if (towerA.towerData.stageTier !== towerB.towerData.stageTier) {
      return false;
    }

    // Must have compatible attributes
    if (!canMerge(towerA.towerData.attribute, towerB.towerData.attribute)) {
      return false;
    }

    return true;
  }

  sellTower(tower: Tower): number {
    const sellValue = tower.getSellValue();
    const position = `${tower.gridPosition.col},${tower.gridPosition.row}`;

    // Remove from tracking
    this.towerMap.delete(position);

    // Add sell value to player
    this.scene.getGameState().addDigibytes(sellValue);

    // Destroy tower
    tower.destroy();

    this.scene.getAudioManager().play('sfx-sell');
    EventBus.emit(GameEvents.TOWER_SOLD, { position, value: sellValue });

    return sellValue;
  }

  private onTowerAttack(data: {
    tower: Tower;
    target: any;
    damage: number;
    effect?: string;
    effectChance?: number;
  }): void {
    // Delegate to CombatManager
    EventBus.emit('combat:towerAttack', data);
  }

  private onTowerSold(data: { position: string; value: number }): void {
    // Already handled in sellTower
  }

  update(delta: number): void {
    // Towers update themselves via GameScene
  }

  // Serialize all towers for save
  toSaveData(): object[] {
    return this.getAllTowers().map(tower => tower.toSaveData());
  }

  // Load towers from save
  fromSaveData(towersData: any[]): void {
    towersData.forEach(data => {
      const tower = this.spawnTower(data.digimonId, data.position, true);
      if (tower) {
        tower.level = data.level;
        tower.dp = data.dp;
        tower.originTier = data.originTier;
        tower.targetPriority = data.targetPriority;
        tower.totalInvested = data.totalInvested;
      }
    });
  }

  destroy(): void {
    EventBus.off('tower:attack', this.onTowerAttack, this);
    EventBus.off(GameEvents.TOWER_SOLD, this.onTowerSold, this);
  }
}
```

### CombatManager
```typescript
// src/managers/CombatManager.ts
import Phaser from 'phaser';
import { Projectile, ProjectileConfig } from '@/entities/Projectile';
import { Tower } from '@/entities/Tower';
import { Enemy } from '@/entities/Enemy';
import { EventBus, GameEvents } from '@/utils/EventBus';
import { GRID } from '@/config/Constants';
import type { GameScene } from '@/scenes/GameScene';

export class CombatManager {
  private scene: GameScene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene as GameScene;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    EventBus.on('combat:towerAttack', this.onTowerAttack, this);
    EventBus.on('projectile:hit', this.onProjectileHit, this);
    EventBus.on('projectile:splash', this.onProjectileSplash, this);
    EventBus.on('projectile:findNextTarget', this.onFindNextTarget, this);
  }

  private onTowerAttack(data: {
    tower: Tower;
    target: Enemy;
    damage: number;
    effect?: string;
    effectChance?: number;
  }): void {
    const { tower, target, damage, effect, effectChance } = data;

    // Create projectile
    const config: ProjectileConfig = {
      speed: 400, // Pixels per second
      damage,
      effectType: effect,
      effectChance: effectChance ?? 0,
      effectDuration: this.getEffectDuration(effect),
      effectValue: this.getEffectValue(effect),
      isHoming: true,
    };

    // Get or create projectile from pool
    let projectile = this.scene.projectiles.getFirstDead(false) as Projectile | null;

    if (projectile) {
      projectile.reset(tower.x, tower.y, tower, target, config);
    } else {
      projectile = new Projectile(
        this.scene,
        tower.x,
        tower.y,
        tower,
        target,
        config
      );
      this.scene.projectiles.add(projectile);
    }

    // Play attack sound
    this.scene.getAudioManager().play('sfx-attack-hit');
  }

  private onProjectileHit(data: {
    projectile: Projectile;
    target: Enemy;
    damage: number;
    effect?: string;
    effectChance?: number;
    effectDuration?: number;
    effectValue?: number;
  }): void {
    const { target, damage, effect, effectChance, effectDuration, effectValue } = data;

    if (!target.active) return;

    // Apply damage
    target.takeDamage(damage, data.projectile.source);

    // Apply effect if triggered
    if (effect && effectChance && Math.random() * 100 < effectChance) {
      target.applyEffect(effect, effectDuration ?? 2000, effectValue ?? 0);
    }
  }

  private onProjectileSplash(data: {
    projectile: Projectile;
    x: number;
    y: number;
    radius: number;
    damage: number;
    effect?: string;
    effectChance?: number;
    effectDuration?: number;
    effectValue?: number;
  }): void {
    const { x, y, radius, damage, effect, effectChance, effectDuration, effectValue } = data;

    // Find all enemies in splash radius
    const enemies = this.scene.enemies.getChildren() as Enemy[];

    enemies.forEach(enemy => {
      if (!enemy.active) return;

      const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      if (distance <= radius) {
        // Damage falls off with distance
        const falloff = 1 - (distance / radius) * 0.5;
        const splashDamage = damage * falloff;

        enemy.takeDamage(splashDamage, data.projectile.source);

        // Apply effect
        if (effect && effectChance && Math.random() * 100 < effectChance) {
          enemy.applyEffect(effect, effectDuration ?? 2000, effectValue ?? 0);
        }
      }
    });

    // Visual effect
    this.createSplashEffect(x, y, radius);
  }

  private onFindNextTarget(data: {
    projectile: Projectile;
    hitEnemies: Set<Enemy>;
    callback: (target: Enemy | null) => void;
  }): void {
    const { projectile, hitEnemies, callback } = data;
    const enemies = this.scene.enemies.getChildren() as Enemy[];

    let closestEnemy: Enemy | null = null;
    let closestDistance = Infinity;

    enemies.forEach(enemy => {
      if (!enemy.active || hitEnemies.has(enemy)) return;

      const distance = Phaser.Math.Distance.Between(
        projectile.x, projectile.y,
        enemy.x, enemy.y
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    });

    callback(closestEnemy);
  }

  private getEffectDuration(effect?: string): number {
    switch (effect) {
      case 'burn': return 3000;
      case 'poison': return 5000;
      case 'freeze': return 1500;
      case 'slow': return 3000;
      case 'stun': return 1000;
      case 'armorBreak': return 4000;
      default: return 2000;
    }
  }

  private getEffectValue(effect?: string): number {
    switch (effect) {
      case 'burn': return 5;      // 5% max HP per second
      case 'poison': return 20;   // 20 damage per second
      case 'slow': return 40;     // 40% slow
      case 'armorBreak': return 30; // Reduce armor by 30
      default: return 0;
    }
  }

  private createSplashEffect(x: number, y: number, radius: number): void {
    const circle = this.scene.add.circle(x, y, radius, 0xFF4500, 0.3);

    this.scene.tweens.add({
      targets: circle,
      alpha: 0,
      scale: 1.5,
      duration: 300,
      onComplete: () => circle.destroy(),
    });
  }

  update(delta: number): void {
    // Projectiles update themselves via group
  }

  destroy(): void {
    EventBus.off('combat:towerAttack', this.onTowerAttack, this);
    EventBus.off('projectile:hit', this.onProjectileHit, this);
    EventBus.off('projectile:splash', this.onProjectileSplash, this);
    EventBus.off('projectile:findNextTarget', this.onFindNextTarget, this);
  }
}
```

### UIManager
```typescript
// src/managers/UIManager.ts
import Phaser from 'phaser';
import { Tower } from '@/entities/Tower';
import { EventBus, GameEvents } from '@/utils/EventBus';
import { GRID, STAGES, SPAWN_COSTS } from '@/config/Constants';
import { getAttributeColor, Attribute } from '@/systems/AttributeSystem';
import { getAvailableEvolutions } from '@/systems/DPSystem';
import type { GridPosition } from '@/types/GameTypes';
import type { GameScene } from '@/scenes/GameScene';

export class UIManager {
  private scene: GameScene;

  // UI Containers
  private hudContainer!: Phaser.GameObjects.Container;
  private towerInfoPanel?: Phaser.GameObjects.Container;
  private spawnMenuPanel?: Phaser.GameObjects.Container;
  private evolutionModal?: Phaser.GameObjects.Container;

  // HUD Elements
  private livesText!: Phaser.GameObjects.Text;
  private digibytesText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private speedText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene as GameScene;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    EventBus.on(GameEvents.DIGIBYTES_CHANGED, this.updateDigibytes, this);
    EventBus.on(GameEvents.LIVES_CHANGED, this.updateLives, this);
    EventBus.on(GameEvents.WAVE_CHANGED, this.updateWave, this);
  }

  createHUD(): void {
    const { width } = this.scene.scale;

    this.hudContainer = this.scene.add.container(0, 0);

    // Background bar
    const hudBg = this.scene.add.rectangle(width / 2, 25, width, 50, 0x1A1A2E, 0.9);
    this.hudContainer.add(hudBg);

    // Lives
    this.livesText = this.scene.add.text(20, 15, '❤️ 20', {
      fontSize: '20px',
      color: '#E74C3C',
    });
    this.hudContainer.add(this.livesText);

    // DigiBytes
    this.digibytesText = this.scene.add.text(150, 15, '💎 200', {
      fontSize: '20px',
      color: '#4A90D9',
    });
    this.hudContainer.add(this.digibytesText);

    // Wave
    this.waveText = this.scene.add.text(width / 2 - 50, 15, 'Wave 1/100', {
      fontSize: '20px',
      color: '#FFFFFF',
    });
    this.hudContainer.add(this.waveText);

    // Speed
    this.speedText = this.scene.add.text(width - 100, 15, '⏱️ 1.0x', {
      fontSize: '20px',
      color: '#F39C12',
    });
    this.hudContainer.add(this.speedText);

    // Keep HUD on top
    this.hudContainer.setDepth(100);
  }

  private updateDigibytes(amount: number): void {
    this.digibytesText.setText(`💎 ${amount}`);
  }

  private updateLives(amount: number): void {
    this.livesText.setText(`❤️ ${amount}`);
    if (amount <= 5) {
      this.livesText.setColor('#FF0000');
    }
  }

  private updateWave(wave: number): void {
    this.waveText.setText(`Wave ${wave}/100`);
  }

  updateSpeedDisplay(speed: number): void {
    this.speedText.setText(`⏱️ ${speed.toFixed(1)}x`);
  }

  showTowerInfo(tower: Tower): void {
    this.hideTowerInfo();

    const { width, height } = this.scene.scale;
    const panelWidth = 250;
    const panelHeight = 300;

    this.towerInfoPanel = this.scene.add.container(width - panelWidth - 10, 70);

    // Background
    const bg = this.scene.add.rectangle(
      panelWidth / 2, panelHeight / 2,
      panelWidth, panelHeight,
      0x2C3E50, 0.95
    );
    bg.setStrokeStyle(2, getAttributeColor(tower.towerData.attribute));
    this.towerInfoPanel.add(bg);

    // Name
    const nameText = this.scene.add.text(panelWidth / 2, 20, tower.towerData.name, {
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.towerInfoPanel.add(nameText);

    // Stats
    const statsY = 50;
    const stats = [
      `Level: ${tower.level}/${tower.getMaxLevel()}`,
      `DP: ${tower.dp}`,
      `Damage: ${tower.calculateDamage(Attribute.DATA).toFixed(1)}`,
      `Speed: ${tower.getAttackSpeed().toFixed(2)}/s`,
      `Range: ${tower.getRange()} cells`,
      `Priority: ${tower.targetPriority}`,
    ];

    stats.forEach((stat, i) => {
      const text = this.scene.add.text(15, statsY + i * 25, stat, {
        fontSize: '14px',
        color: '#BDC3C7',
      });
      this.towerInfoPanel!.add(text);
    });

    // Buttons
    const buttonY = panelHeight - 80;

    // Level Up button
    if (tower.canLevelUp()) {
      const lvlBtn = this.createButton(
        panelWidth / 2, buttonY,
        `Level Up (${tower.getLevelUpCost()} DB)`,
        () => {
          EventBus.emit('ui:levelUp', tower);
        }
      );
      this.towerInfoPanel.add(lvlBtn);
    }

    // Evolve button
    if (tower.canDigivolve()) {
      const evoBtn = this.createButton(
        panelWidth / 2, buttonY + 35,
        `Evolve (${tower.getDigivolveCost()} DB)`,
        () => this.showEvolutionModal(tower)
      );
      this.towerInfoPanel.add(evoBtn);
    }

    // Sell button
    const sellBtn = this.createButton(
      panelWidth / 2, buttonY + 70,
      `Sell (${tower.getSellValue()} DB)`,
      () => EventBus.emit('ui:sell', tower),
      0xE74C3C
    );
    this.towerInfoPanel.add(sellBtn);

    this.towerInfoPanel.setDepth(90);
  }

  hideTowerInfo(): void {
    this.towerInfoPanel?.destroy();
    this.towerInfoPanel = undefined;
  }

  updateTowerInfo(tower: Tower): void {
    // Just refresh the panel
    this.showTowerInfo(tower);
  }

  showSpawnMenu(position: GridPosition): void {
    this.hideSpawnMenu();

    const screenX = position.col * GRID.CELL_SIZE + GRID.CELL_SIZE / 2;
    const screenY = position.row * GRID.CELL_SIZE + GRID.CELL_SIZE / 2;

    this.spawnMenuPanel = this.scene.add.container(screenX, screenY);

    // Background
    const bg = this.scene.add.circle(0, 0, 80, 0x2C3E50, 0.9);
    this.spawnMenuPanel.add(bg);

    // Spawn options (simplified for MVP)
    const options = [
      { label: 'In-Training', cost: SPAWN_COSTS.IN_TRAINING.random, tier: 0 },
      { label: 'Rookie', cost: SPAWN_COSTS.ROOKIE.random, tier: 1 },
    ];

    options.forEach((opt, i) => {
      const angle = (i / options.length) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * 50;
      const y = Math.sin(angle) * 50;

      const btn = this.scene.add.circle(x, y, 25, 0x4A90D9)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          EventBus.emit('ui:spawn', { position, tier: opt.tier, cost: opt.cost });
          this.hideSpawnMenu();
        });

      const label = this.scene.add.text(x, y, opt.label.charAt(0), {
        fontSize: '16px',
        color: '#FFFFFF',
      }).setOrigin(0.5);

      this.spawnMenuPanel!.add([btn, label]);
    });

    // Close button
    const closeBtn = this.scene.add.text(0, 0, '✕', {
      fontSize: '20px',
      color: '#E74C3C',
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.hideSpawnMenu());

    this.spawnMenuPanel.add(closeBtn);
    this.spawnMenuPanel.setDepth(95);
  }

  hideSpawnMenu(): void {
    this.spawnMenuPanel?.destroy();
    this.spawnMenuPanel = undefined;
  }

  showEvolutionModal(tower: Tower): void {
    this.hideEvolutionModal();

    const { width, height } = this.scene.scale;
    const evolutionData = this.scene.registry.get('evolutionData');
    const evolutions = getAvailableEvolutions(tower.digimonId, tower.dp, evolutionData);

    if (evolutions.length === 0) {
      console.warn('No evolutions available');
      return;
    }

    this.evolutionModal = this.scene.add.container(width / 2, height / 2);

    // Dim background
    const dimBg = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7)
      .setInteractive()
      .on('pointerdown', () => this.hideEvolutionModal());
    this.evolutionModal.add(dimBg);

    // Modal background
    const modalWidth = Math.min(400, evolutions.length * 120 + 40);
    const modalBg = this.scene.add.rectangle(0, 0, modalWidth, 200, 0x2C3E50, 0.95)
      .setStrokeStyle(2, 0x4A90D9);
    this.evolutionModal.add(modalBg);

    // Title
    const title = this.scene.add.text(0, -70, 'Choose Evolution', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.evolutionModal.add(title);

    // Evolution options
    const digimonData = this.scene.registry.get('digimonData')?.towers ?? {};

    evolutions.forEach((evoId, i) => {
      const evoData = digimonData[evoId];
      if (!evoData) return;

      const x = (i - (evolutions.length - 1) / 2) * 100;

      // Evolution sprite/button
      const btn = this.scene.add.circle(x, 0, 40, getAttributeColor(evoData.attribute))
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          EventBus.emit('ui:evolve', { tower, targetId: evoId });
          this.hideEvolutionModal();
        });

      const label = this.scene.add.text(x, 50, evoData.name, {
        fontSize: '12px',
        color: '#FFFFFF',
      }).setOrigin(0.5);

      this.evolutionModal!.add([btn, label]);
    });

    this.evolutionModal.setDepth(200);
  }

  hideEvolutionModal(): void {
    this.evolutionModal?.destroy();
    this.evolutionModal = undefined;
  }

  showWaveComplete(waveNumber: number): void {
    const { width, height } = this.scene.scale;

    const text = this.scene.add.text(width / 2, height / 2, `Wave ${waveNumber} Complete!`, {
      fontSize: '36px',
      color: '#27AE60',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(150);

    this.scene.tweens.add({
      targets: text,
      y: height / 2 - 50,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
    color: number = 0x4A90D9
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.rectangle(0, 0, 200, 28, color, 0.8)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', onClick)
      .on('pointerover', () => bg.setFillStyle(color, 1))
      .on('pointerout', () => bg.setFillStyle(color, 0.8));

    const text = this.scene.add.text(0, 0, label, {
      fontSize: '14px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    container.add([bg, text]);
    return container;
  }

  destroy(): void {
    EventBus.off(GameEvents.DIGIBYTES_CHANGED, this.updateDigibytes, this);
    EventBus.off(GameEvents.LIVES_CHANGED, this.updateLives, this);
    EventBus.off(GameEvents.WAVE_CHANGED, this.updateWave, this);
  }
}
```

### AudioManager
```typescript
// src/managers/AudioManager.ts
import Phaser from 'phaser';

export interface AudioSettings {
  master: number;  // 0-1
  music: number;   // 0-1
  sfx: number;     // 0-1
  muted: boolean;
}

export class AudioManager {
  private scene: Phaser.Scene;
  private settings: AudioSettings = {
    master: 0.8,
    music: 0.7,
    sfx: 1.0,
    muted: false,
  };

  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.loadSettings();
  }

  play(key: string, config?: Phaser.Types.Sound.SoundConfig): void {
    if (this.settings.muted) return;

    const volume = this.settings.master * this.settings.sfx;

    // Check if sound exists in cache
    if (!this.scene.cache.audio.exists(key)) {
      console.warn(`Audio not found: ${key}`);
      return;
    }

    // Play sound
    this.scene.sound.play(key, {
      volume,
      ...config,
    });
  }

  playMusic(key: string): void {
    if (this.settings.muted) return;

    const volume = this.settings.master * this.settings.music;

    // Stop existing music
    this.stopMusic();

    if (!this.scene.cache.audio.exists(key)) {
      console.warn(`Music not found: ${key}`);
      return;
    }

    const music = this.scene.sound.add(key, {
      volume,
      loop: true,
    });

    music.play();
    this.sounds.set('music', music);
  }

  stopMusic(): void {
    const music = this.sounds.get('music');
    if (music) {
      music.stop();
      music.destroy();
      this.sounds.delete('music');
    }
  }

  setVolume(type: 'master' | 'music' | 'sfx', value: number): void {
    this.settings[type] = Phaser.Math.Clamp(value, 0, 1);
    this.saveSettings();

    // Update music volume if playing
    const music = this.sounds.get('music');
    if (music && 'setVolume' in music) {
      (music as Phaser.Sound.WebAudioSound).setVolume(
        this.settings.master * this.settings.music
      );
    }
  }

  getVolume(type: 'master' | 'music' | 'sfx'): number {
    return this.settings[type];
  }

  toggleMute(): boolean {
    this.settings.muted = !this.settings.muted;
    this.saveSettings();

    if (this.settings.muted) {
      this.scene.sound.mute = true;
    } else {
      this.scene.sound.mute = false;
    }

    return this.settings.muted;
  }

  isMuted(): boolean {
    return this.settings.muted;
  }

  private loadSettings(): void {
    const saved = localStorage.getItem('digimerge_audio_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.settings = { ...this.settings, ...parsed };
      } catch (e) {
        console.warn('Failed to load audio settings');
      }
    }
  }

  private saveSettings(): void {
    localStorage.setItem('digimerge_audio_settings', JSON.stringify(this.settings));
  }

  destroy(): void {
    this.sounds.forEach(sound => sound.destroy());
    this.sounds.clear();
  }
}
```

---

## 7. Data Structures

### Type Definitions
```typescript
// src/types/DigimonTypes.ts
import { Attribute } from '@/systems/AttributeSystem';

export interface DigimonStats {
  id: string;
  name: string;
  stageTier: number;
  attribute: Attribute;
  family: string;
  baseDamage: number;
  baseSpeed: number;
  range: number;
  effectType?: string;
  effectChance?: number;
  defaultPriority?: string;
}

export interface EvolutionPath {
  resultId: string;
  minDP: number;
  maxDP: number;
  isDefault: boolean;
}

export interface DNADigivolution {
  partnerA: string;
  partnerB: string;
  result: string;
}

// src/types/GameTypes.ts
export interface GridPosition {
  col: number;
  row: number;
}

export interface TowerSaveData {
  id: string;
  digimonId: string;
  position: GridPosition;
  level: number;
  dp: number;
  originTier: number;
  targetPriority: string;
}

export interface SaveData {
  version: string;
  timestamp: string;
  gameState: {
    digibytes: number;
    lives: number;
    currentWave: number;
    highestWave: number;
    gameMode: 'normal' | 'endless';
    playTime: number;
  };
  towers: TowerSaveData[];
  statistics: {
    enemiesKilled: number;
    totalDBEarned: number;
    totalDBSpent: number;
    digimonSpawned: number;
    mergesPerformed: number;
    digivolutionsPerformed: number;
  };
  settings: Record<string, any>;
}
```

---

## 8. UI Components

See the main GAME_DESIGN_DOCUMENT.md for detailed UI mockups. Implementation uses Phaser's built-in UI capabilities:

- `Phaser.GameObjects.Text` for labels
- `Phaser.GameObjects.Graphics` for panels and health bars
- `Phaser.GameObjects.Container` for grouping UI elements
- `Phaser.GameObjects.Zone` for interactive areas
- Custom button class extending `Container`

---

## 9. Event System

```typescript
// src/utils/EventBus.ts
import Phaser from 'phaser';

export const EventBus = new Phaser.Events.EventEmitter();

export const GameEvents = {
  // Tower events
  TOWER_PLACED: 'tower:placed',
  TOWER_SELECTED: 'tower:selected',
  TOWER_DESELECTED: 'tower:deselected',
  TOWER_SOLD: 'tower:sold',
  TOWER_LEVELED: 'tower:leveled',
  TOWER_MERGED: 'tower:merged',
  TOWER_EVOLVED: 'tower:evolved',

  // Enemy events
  ENEMY_SPAWNED: 'enemy:spawned',
  ENEMY_DIED: 'enemy:died',
  ENEMY_REACHED_BASE: 'enemy:reachedBase',

  // Boss events
  BOSS_SPAWNED: 'boss:spawned',
  BOSS_ABILITY: 'boss:ability',

  // Wave events
  WAVE_STARTED: 'wave:started',
  WAVE_COMPLETED: 'wave:completed',
  WAVE_CHANGED: 'wave:changed',

  // Game state events
  DIGIBYTES_CHANGED: 'currency:changed',
  LIVES_CHANGED: 'lives:changed',
  GAME_OVER: 'game:over',
  GAME_WON: 'game:won',

  // UI events
  MODAL_OPENED: 'ui:modalOpened',
  MODAL_CLOSED: 'ui:modalClosed',
} as const;
```

---

## 10. Save System

```typescript
// src/managers/SaveManager.ts
import type { SaveData, TowerSaveData } from '@/types/GameTypes';

const SAVE_KEY = 'digimerge_td_save';
const SETTINGS_KEY = 'digimerge_td_settings';
const VERSION = '1.0.0';

export class SaveManager {
  static save(gameState: any, towers: any[]): void {
    const saveData: SaveData = {
      version: VERSION,
      timestamp: new Date().toISOString(),
      gameState: gameState.toSaveData(),
      towers: towers.map(this.serializeTower),
      statistics: gameState.stats,
      settings: this.getSettings(),
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  }

  static load(): SaveData | null {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;

    try {
      const data = JSON.parse(raw) as SaveData;
      if (this.isValidSave(data)) {
        return data;
      }
    } catch (e) {
      console.error('Failed to parse save data:', e);
    }
    return null;
  }

  static hasSave(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  static deleteSave(): void {
    localStorage.removeItem(SAVE_KEY);
  }

  static exportSave(): string {
    const data = localStorage.getItem(SAVE_KEY);
    return data ? btoa(data) : '';
  }

  static importSave(encoded: string): boolean {
    try {
      const decoded = atob(encoded);
      const data = JSON.parse(decoded);
      if (this.isValidSave(data)) {
        localStorage.setItem(SAVE_KEY, decoded);
        return true;
      }
    } catch (e) {
      console.error('Failed to import save:', e);
    }
    return false;
  }

  static saveSettings(settings: Record<string, any>): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  static getSettings(): Record<string, any> {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : this.getDefaultSettings();
  }

  static getDefaultSettings(): Record<string, any> {
    return {
      audio: { master: 0.8, music: 0.7, sfx: 1.0 },
      gameplay: { gameSpeed: 1.0, autoPause: true, damageNumbers: true },
      accessibility: { colorblindMode: 'off', textSize: 'medium' },
    };
  }

  private static serializeTower(tower: any): TowerSaveData {
    return {
      id: tower.id,
      digimonId: tower.digimonId,
      position: tower.gridPosition,
      level: tower.level,
      dp: tower.dp,
      originTier: tower.originTier,
      targetPriority: tower.targetPriority,
    };
  }

  private static isValidSave(data: any): data is SaveData {
    return (
      data &&
      typeof data.version === 'string' &&
      typeof data.timestamp === 'string' &&
      typeof data.gameState === 'object' &&
      Array.isArray(data.towers)
    );
  }
}
```

---

## 11. Performance Optimization

### Object Pooling
```typescript
// Use Phaser's built-in group pooling
this.projectiles = this.add.group({
  classType: Projectile,
  maxSize: 100,
  runChildUpdate: true,
});

// Spawn from pool
const projectile = this.projectiles.get(x, y);
projectile?.fire(target);

// Return to pool
projectile.setActive(false).setVisible(false);
```

### Texture Atlases
- Combine all Digimon sprites into a single atlas
- Combine all UI elements into a single atlas
- Reduces draw calls significantly

### Efficient Updates
- Only update active entities
- Use spatial partitioning for collision/targeting
- Batch similar operations

---

## 12. Deployment

### Build
```bash
npm run build
```

### Output
Files in `dist/` folder ready for static hosting.

### Hosting Options
- **GitHub Pages**: Free, simple
- **Netlify**: Free tier, easy deploy
- **Itch.io**: Game-focused, community
- **Vercel**: Fast, free tier

### Desktop Builds (Optional)
Use **Electron** or **Tauri** to wrap the web build for desktop distribution.

---

## 13. Implementation Checklist

### Critical Path (Must Have for MVP)
- [x] Project setup (Vite + TypeScript + Phaser)
- [x] Scene structure (Boot → Preload → MainMenu → StarterSelect → Game)
- [x] Constants and path waypoints
- [x] Tower entity with targeting and attacks
- [x] Enemy entity with path following and status effects
- [x] Projectile entity with pooling
- [x] Boss entity with abilities
- [x] GameStateManager (DigiBytes, lives, waves)
- [x] WaveManager (spawning, wave progression)
- [x] TowerManager (spawn, level, evolve, merge, sell)
- [x] CombatManager (damage, effects, projectiles)
- [x] UIManager (HUD, tower info, spawn menu, modals)
- [x] AudioManager (SFX playback)
- [x] SaveManager (LocalStorage save/load)
- [x] Attribute system (damage multipliers)
- [x] DP system (max level calculation, merge DP)
- [x] Merge system (validation, survivor determination)
- [x] Targeting system (6 priority modes)
- [x] Event bus (decoupled communication)

### Data Files Needed
- [ ] `src/data/DigimonDatabase.ts` - All Digimon stats
- [ ] `src/data/WaveData.ts` - Wave compositions for waves 1-20
- [ ] `src/data/EvolutionPaths.ts` - Evolution trees and DP requirements

### Testing
- [ ] Unit tests for damage calculations
- [ ] Unit tests for DP/level formulas
- [ ] Unit tests for merge validation
- [ ] Unit tests for attribute multipliers
- [ ] Integration tests for wave progression

---

*Document Version: 2.0*
*Last Updated: 2025-02-06*
*Target: Phaser 3.80+ with TypeScript 5.x*
*Changes: Fixed tilemap→code path, added missing managers, fixed texture keys, added all scenes*
