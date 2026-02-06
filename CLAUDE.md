# DigiMerge Tower Defense - Project Guide

## Project Overview

**DigiMerge TD** is a Digimon-themed tower defense merge game combining strategic mechanics inspired by Digimon World 2. Players spawn Digimon, level them up, merge same-attribute Digimon to gain DP (Digivolution Points), and digivolve at max level to create powerful defenders.

### Core Game Loop
```
SPAWN → LEVEL UP → MERGE → DIGIVOLVE → DEFEND → REPEAT
```

### Key Systems
- **DP System**: Digivolution Points gained through merging, unlock evolution paths
- **Origin System**: Spawn stage limits maximum evolution (In-Training→Champion, Rookie→Ultimate, Champion→Mega)
- **Attribute Triangle**: Vaccine > Virus > Data > Vaccine (1.5x damage)
- **6 Evolution Stages**: In-Training → Rookie → Champion → Ultimate → Mega → Ultra

---

## Tech Stack

### Core Framework
- **Phaser 3.80+** - 2D game framework with WebGL/Canvas rendering
- **TypeScript 5.x** - Type-safe development
- **Vite 5.x** - Fast build tool and HMR dev server

### Project Structure
```
digimerge-td/
├── public/
│   ├── assets/
│   │   ├── sprites/          # Digimon sprites (64x64, 128x128)
│   │   ├── ui/               # UI elements, buttons, panels
│   │   ├── effects/          # Particle effects, status icons
│   │   ├── audio/
│   │   │   ├── sfx/          # Sound effects
│   │   │   └── music/        # Background music
│   │   └── fonts/            # Pixel fonts
│   └── favicon.ico
├── src/
│   ├── main.ts               # Entry point, Phaser game config
│   ├── config/
│   │   ├── GameConfig.ts     # Phaser configuration
│   │   └── Constants.ts      # Game constants (costs, damage, etc.)
│   ├── scenes/
│   │   ├── BootScene.ts      # Asset loading
│   │   ├── PreloadScene.ts   # Loading screen
│   │   ├── MainMenuScene.ts  # Title screen
│   │   ├── StarterSelectScene.ts
│   │   ├── GameScene.ts      # Main gameplay
│   │   ├── PauseScene.ts     # Overlay scene
│   │   ├── GameOverScene.ts
│   │   └── EncyclopediaScene.ts
│   ├── entities/
│   │   ├── Tower.ts          # Digimon tower class
│   │   ├── Enemy.ts          # Enemy class
│   │   ├── Projectile.ts     # Attack projectiles
│   │   └── Boss.ts           # Boss enemy class
│   ├── managers/
│   │   ├── GameStateManager.ts    # DigiBytes, lives, wave
│   │   ├── WaveManager.ts         # Enemy spawning
│   │   ├── CombatManager.ts       # Damage, effects
│   │   ├── TowerManager.ts        # Tower placement, selection
│   │   ├── UIManager.ts           # HUD, panels, modals
│   │   ├── AudioManager.ts        # Sound effects, music
│   │   └── SaveManager.ts         # LocalStorage save/load
│   ├── data/
│   │   ├── DigimonDatabase.ts     # All Digimon stats
│   │   ├── WaveData.ts            # Wave compositions
│   │   ├── EvolutionPaths.ts      # Evolution trees
│   │   └── StatusEffects.ts       # Effect definitions
│   ├── ui/
│   │   ├── HUD.ts                 # Top bar (lives, DB, wave)
│   │   ├── TowerInfoPanel.ts      # Selected tower details
│   │   ├── SpawnMenu.ts           # Spawn configuration
│   │   ├── EvolutionModal.ts      # Evolution selection
│   │   ├── MergeModal.ts          # Merge confirmation
│   │   └── components/            # Reusable UI components
│   ├── systems/
│   │   ├── AttributeSystem.ts     # Damage multipliers
│   │   ├── DPSystem.ts            # DP calculations
│   │   ├── OriginSystem.ts        # Origin caps
│   │   ├── LevelSystem.ts         # Level up costs/effects
│   │   └── TargetingSystem.ts     # Tower targeting priorities
│   ├── utils/
│   │   ├── EventBus.ts            # Global event system
│   │   ├── PathfindingUtils.ts    # Waypoint path helpers
│   │   └── MathUtils.ts           # Common calculations
│   └── types/
│       ├── DigimonTypes.ts        # Type definitions
│       ├── GameTypes.ts           # Game state types
│       └── index.ts               # Re-exports
├── tests/
│   └── ...                        # Vitest unit tests
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
└── README.md
```

### Dependencies

```json
{
  "dependencies": {
    "phaser": "^3.80.1"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "@types/node": "^20.0.0",
    "eslint": "^9.0.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "prettier": "^3.2.0",
    "vitest": "^1.4.0"
  }
}
```

### Build Commands
```bash
npm run dev      # Start dev server with HMR
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # ESLint check
npm run test     # Run Vitest tests
```

### Claude Code Skill
A `/phaser` skill is available for Phaser 3 API questions, game development patterns, sprites, tweens, scenes, game objects, physics, input handling, audio, and asset loading specific to this project.

---

## Key Design Documents

| Document | Description |
|----------|-------------|
| `GAME_DESIGN_DOCUMENT.md` | Complete game mechanics, systems, UI/UX |
| `ENEMY_SPAWN_DESIGN.md` | Wave compositions, enemy types, bosses |
| `DIGIMON_STATS_DATABASE.md` | All Digimon stats, evolution paths |
| `IMPLEMENTATION_PLAN.md` | Git setup, sprint planning, task breakdown |

---

## Game Constants

### Costs
```typescript
const SPAWN_COSTS = {
  IN_TRAINING: { random: 100, specific: 150, free: 200 },
  ROOKIE: { random: 300, specific: 450, free: 600 },
  CHAMPION: { random: 800, specific: 1200, free: 1600 },
};

const DIGIVOLVE_COSTS = [100, 150, 200, 250]; // Per stage

const LEVEL_UP_COST = (level: number) => 5 * level;
```

### Stage Configuration
```typescript
const STAGES = {
  IN_TRAINING: { tier: 0, baseMaxLevel: 10, dpBonus: 1 },
  ROOKIE: { tier: 1, baseMaxLevel: 20, dpBonus: 2 },
  CHAMPION: { tier: 2, baseMaxLevel: 35, dpBonus: 3 },
  ULTIMATE: { tier: 3, baseMaxLevel: 50, dpBonus: 4 },
  MEGA: { tier: 4, baseMaxLevel: 70, dpBonus: 5 },
  ULTRA: { tier: 5, baseMaxLevel: 100, dpBonus: 5 },
};
```

### Attribute System
```typescript
enum Attribute {
  VACCINE = 0,
  DATA = 1,
  VIRUS = 2,
  FREE = 3,
}

const ATTRIBUTE_MULTIPLIERS: Record<Attribute, Record<Attribute, number>> = {
  [Attribute.VACCINE]: { [Attribute.VACCINE]: 1.0, [Attribute.DATA]: 0.75, [Attribute.VIRUS]: 1.5, [Attribute.FREE]: 1.0 },
  [Attribute.DATA]: { [Attribute.VACCINE]: 1.5, [Attribute.DATA]: 1.0, [Attribute.VIRUS]: 0.75, [Attribute.FREE]: 1.0 },
  [Attribute.VIRUS]: { [Attribute.VACCINE]: 0.75, [Attribute.DATA]: 1.5, [Attribute.VIRUS]: 1.0, [Attribute.FREE]: 1.0 },
  [Attribute.FREE]: { [Attribute.VACCINE]: 1.0, [Attribute.DATA]: 1.0, [Attribute.VIRUS]: 1.0, [Attribute.FREE]: 1.0 },
};
```

---

## Map Layout

8 columns x 18 rows grid with 87 tower placement slots and a serpentine enemy path.

### Path Waypoints (57 total)
- Start: (1, 2) - Spawn point
- End: (8, 15) - Base (lives lost here)
- 15 direction changes creating multiple kill zones

### Kill Zones
| Zone | Location | Best Towers |
|------|----------|-------------|
| A - Upper Loop | Row 2-7, Col 1-5 | AoE, Multi-hit |
| B - Central Corridor | Row 3-13, Col 6-8 | Sustained DPS |
| C - Middle Crossroads | Row 9-13, Col 2-6 | Long-range, Splash |
| D - Lower Loop | Row 14-18, Col 1-4 | Burst, Execute |
| E - Exit Corridor | Row 15, Col 5-8 | High burst, Slow |

---

## Wave Progression

### Phases
| Phase | Waves | Enemy Tier | Boss Waves |
|-------|-------|------------|------------|
| 1 | 1-20 | In-Training/Rookie | 10, 20 |
| 2 | 21-40 | Champion | 30, 40 |
| 3 | 41-60 | Ultimate | 50, 60 |
| 4 | 61-80 | Mega | 70, 80 |
| 5 | 81-100 | Mega/Ultra | 90, 100 |
| Endless | 101+ | Scaling | Every 10 |

### Enemy Types
| Type | Speed | HP | Armor | Counter |
|------|-------|-----|-------|---------|
| Swarm | 1.3x | 0.5x | 0% | AoE |
| Standard | 1.0x | 1.0x | 10% | Any |
| Tank | 0.6x | 2.5x | 40% | Armor Break |
| Speedster | 2.0x | 0.4x | 0% | Slow, Freeze |
| Flying | 1.2x | 0.8x | 0% | Anti-air |
| Regen | 0.8x | 1.5x | 10% | Burst, Poison |
| Shielded | 0.9x | 1.0x | 60% | Armor Break |
| Splitter | 1.0x | 0.8x | 0% | Sustained DPS |

---

## Phaser Implementation Notes

### Scene Flow
```
BootScene → PreloadScene → MainMenuScene → StarterSelectScene → GameScene
                                ↓                                    ↓
                         EncyclopediaScene                      PauseScene
                                                                     ↓
                                                              GameOverScene
```

### GameScene Structure
```typescript
class GameScene extends Phaser.Scene {
  // Managers
  private gameState: GameStateManager;
  private waveManager: WaveManager;
  private combatManager: CombatManager;
  private towerManager: TowerManager;

  // Containers
  private mapContainer: Phaser.GameObjects.Container;
  private towerContainer: Phaser.GameObjects.Container;
  private enemyContainer: Phaser.GameObjects.Container;
  private projectileContainer: Phaser.GameObjects.Container;
  private uiContainer: Phaser.GameObjects.Container;

  // Path
  private pathGraphics: Phaser.GameObjects.Graphics;
  private waypoints: Phaser.Math.Vector2[];
}
```

### Event Bus Pattern
```typescript
// EventBus.ts
import Phaser from 'phaser';

export const EventBus = new Phaser.Events.EventEmitter();

// Events
export const GameEvents = {
  TOWER_PLACED: 'tower:placed',
  TOWER_SELECTED: 'tower:selected',
  TOWER_SOLD: 'tower:sold',
  TOWER_MERGED: 'tower:merged',
  TOWER_EVOLVED: 'tower:evolved',
  ENEMY_SPAWNED: 'enemy:spawned',
  ENEMY_DIED: 'enemy:died',
  ENEMY_REACHED_BASE: 'enemy:reachedBase',
  WAVE_STARTED: 'wave:started',
  WAVE_COMPLETED: 'wave:completed',
  BOSS_SPAWNED: 'boss:spawned',
  GAME_OVER: 'game:over',
  DIGIBYTES_CHANGED: 'currency:changed',
  LIVES_CHANGED: 'lives:changed',
} as const;
```

### Tower Targeting
```typescript
enum TargetPriority {
  FIRST = 'first',      // Closest to base
  LAST = 'last',        // Furthest from base
  STRONGEST = 'strongest',
  WEAKEST = 'weakest',
  FASTEST = 'fastest',
  CLOSEST = 'closest',
  FLYING = 'flying',
}
```

### Save System (LocalStorage)
```typescript
interface SaveData {
  version: string;
  timestamp: string;
  gameState: {
    digibytes: number;
    lives: number;
    currentWave: number;
    gameMode: 'normal' | 'endless';
  };
  towers: TowerSaveData[];
  statistics: GameStatistics;
  settings: GameSettings;
}
```

---

## Available Assets

### Sprites (842 PNG files)
**Location**: `assets/sprites/Idle Frame Only/`
- **Format**: PNG, pixel art (~16x16 native, scale up as needed)
- **Naming**: `{DigimonName}.png` (e.g., `Agumon.png`, `Greymon.png`)
- **Variants**: Some have suffixes like `_X`, `_2006`, `_Black`

**Sample sprite names for MVP starters:**
| Starter | Sprite File | Evolution Sprites |
|---------|-------------|-------------------|
| Koromon | `Koromon.png` | `Agumon.png`, `Greymon.png`, `MetalGreymon.png` |
| Tsunomon | `Tsunomon.png` | `Gabumon.png`, `Garurumon.png`, `WereGarurumon.png` |
| Tokomon | `Tokomon.png` | `Patamon.png`, `Angemon.png`, `MagnaAngemon.png` |
| Gigimon | `Gigimon.png` | `Guilmon.png`, `Growlmon.png`, `WarGrowlmon.png` |
| Tanemon | `Tanemon.png` | `Palmon.png`, `Togemon.png`, `Lillymon.png` |
| DemiVeemon | `DemiVeemon.png` | `Veemon.png`, `ExVeemon.png`, `Paildramon.png` |
| Pagumon | `Pagumon.png` | `DemiDevimon.png`, `Devimon.png`, `Myotismon.png` |
| Viximon | `Viximon.png` | `Renamon.png`, `Kyubimon.png`, `Taomon.png` |

### Sound Effects (17 WAV files)
**Location**: `assets/sfx/`

| File | Usage |
|------|-------|
| `attack_hit.wav` | Projectile hits enemy |
| `attack_miss.wav` | Projectile misses |
| `boss_spawn.wav` | Boss enemy appears |
| `button_click.wav` | UI button pressed |
| `button_hover.wav` | UI button hover |
| `enemy_death.wav` | Enemy killed |
| `enemy_escape.wav` | Enemy reaches base |
| `game_over.wav` | Player loses |
| `insufficient_funds.wav` | Can't afford action |
| `merge_success.wav` | Merge completed |
| `tower_evolve.wav` | Digivolution |
| `tower_level_up.wav` | Level up |
| `tower_sell.wav` | Tower sold |
| `tower_spawn.wav` | New tower placed |
| `victory.wav` | Wave 100 cleared |
| `wave_complete.wav` | Wave finished |
| `wave_start.wav` | Wave begins |

### Missing Assets (Create or Skip for MVP)
- **UI Elements**: Buttons, panels, health bars (use Phaser graphics)
- **Map Tiles**: Path/slot visuals (use colored rectangles)
- **Effects**: Status effect particles (use simple shapes)
- **Music**: Background tracks (skip for MVP)

---

## Development Guidelines

### Test-Driven Development (TDD)
This project follows TDD methodology: **RED → GREEN → REFACTOR**

1. **Write a failing test first** - Define expected behavior before implementation
2. **Write minimal code to pass** - Only enough to make the test green
3. **Refactor** - Clean up while keeping tests passing

**TDD Rules:**
- No production code without a failing test first
- Tests are first-class code - maintain them like production code
- Keep rendering code thin, logic code testable
- Use dependency injection to isolate business logic from Phaser

**What to TDD:**
- All formulas and calculations
- Data validation and business logic
- State management and merge/evolution rules

**Manual testing only:**
- Scene transitions, visual rendering
- Drag-and-drop, audio playback

### Code Style
- Use TypeScript strict mode
- Prefer composition over inheritance for game objects
- Use EventBus for loose coupling between systems
- Keep managers stateless where possible (state in GameStateManager)

### Performance
- Object pooling for projectiles and enemies
- Texture atlases for sprites
- Limit particle effects on screen
- Use `setActive(false)` / `setVisible(false)` instead of destroy

### Testing (TDD)
- **Write tests BEFORE implementation** (Red-Green-Refactor)
- Unit tests for: damage calculations, DP formulas, cost calculations, merge validation
- Mock Phaser in `tests/setup.ts` for isolated logic testing
- Manual testing only for: UI interactions, drag-drop, visual rendering

---

## Quick Reference

### Damage Formula
```typescript
finalDamage = baseDamage * (1 + level * 0.02) * attributeMultiplier;
```

### Max Level Formula
```typescript
maxLevel = baseMaxLevel + (dp * dpBonus) + originBonus;
originBonus = (currentStage - originStage) * 5;
```

### DP on Merge
```typescript
survivorDP = Math.max(digimonA.dp, digimonB.dp) + 1;
```

### Level Up Cost
```typescript
cost = 5 * currentLevel;  // Lv 1→2 costs 5 DB, Lv 20→21 costs 100 DB
```

---

## MVP Scope

### Included in MVP
| Feature | Status | Notes |
|---------|--------|-------|
| Core TD loop | ✅ | Spawn, place, attack, waves |
| 8 starters + evolutions | ✅ | ~25-30 Digimon total |
| Waves 1-20 | ✅ | Phase 1 with first boss |
| Level up system | ✅ | Pay DB to increase level |
| Digivolve system | ✅ | At max level, choose path |
| Merge system | ✅ | Same attribute + stage |
| DP & Origin systems | ✅ | Core mechanics |
| Attribute triangle | ✅ | Vaccine/Data/Virus/Free |
| Basic HUD | ✅ | Lives, DB, wave counter |
| Tower info panel | ✅ | Stats, buttons |
| Spawn menu | ✅ | Stage + type selection |
| Sound effects | ✅ | All 17 SFX available |
| Save/Load | ✅ | LocalStorage |

### Excluded from MVP (Later)
- Tutorial popups
- Endless mode (waves 101+)
- Encyclopedia/Digimon browser
- Settings menu (full)
- Phases 2-5 (waves 21-100)
- All 150+ Digimon

### Implementation Phases
1. **Foundation**: Project setup, scenes, asset loading
2. **Core Gameplay**: Tower, Enemy, Projectile, waves 1-5
3. **Economy**: DigiBytes, level up, spawn menu
4. **Evolution**: Digivolve, DP system, origin system
5. **Merge**: Drag-drop merge, attribute matching
6. **Polish**: Full Phase 1 (waves 1-20), boss, save/load, SFX

---

## Path Waypoints Data

```typescript
// Grid: 8 columns (1-8) x 18 rows (1-18), cell size 64px
// Coordinates are grid positions, multiply by CELL_SIZE for pixels

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

export const GRID = {
  COLUMNS: 8,
  ROWS: 18,
  CELL_SIZE: 64,
  SPAWN: { col: 1, row: 2 },
  BASE: { col: 8, row: 15 },
};
```
