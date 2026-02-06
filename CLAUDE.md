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
│   │   ├── sprites/Idle Frame Only/  # 842 Digimon sprite PNGs (~16x16)
│   │   ├── sfx/                      # 17 WAV sound effects
│   │   └── tiles/                    # Sprout Lands tileset PNGs
│   └── favicon.ico
├── .github/workflows/
│   └── deploy.yml            # GitHub Pages deployment
├── src/
│   ├── main.ts               # Entry point, Phaser game config
│   ├── config/
│   │   ├── GameConfig.ts     # Phaser configuration
│   │   └── Constants.ts      # Game constants (costs, damage, speeds, etc.)
│   ├── scenes/
│   │   ├── BootScene.ts      # Asset loading
│   │   ├── PreloadScene.ts   # Loading screen + tileset loading
│   │   ├── MainMenuScene.ts  # Title screen
│   │   ├── StarterSelectScene.ts
│   │   ├── GameScene.ts      # Main gameplay + HUD + grid
│   │   ├── PauseScene.ts     # Simple pause overlay (click/ESC to resume)
│   │   ├── SettingsScene.ts  # Volume, restart, main menu
│   │   ├── GameOverScene.ts
│   │   └── EncyclopediaScene.ts  # Digimon browser/catalog
│   ├── entities/
│   │   ├── Tower.ts          # Digimon tower class
│   │   ├── Enemy.ts          # Enemy class
│   │   └── Projectile.ts     # Attack projectiles
│   ├── managers/
│   │   ├── GameStateManager.ts    # DigiBytes, lives, wave
│   │   ├── WaveManager.ts         # Enemy spawning
│   │   ├── CombatManager.ts       # Damage, effects
│   │   ├── TowerManager.ts        # Tower placement, selection
│   │   ├── AudioManager.ts        # Sound effects (volume/mute via registry)
│   │   └── SaveManager.ts         # LocalStorage save/load
│   ├── data/
│   │   ├── DigimonDatabase.ts     # All Digimon stats
│   │   ├── WaveData.ts            # Wave compositions
│   │   ├── EvolutionPaths.ts      # Evolution trees
│   │   └── StatusEffects.ts       # Effect definitions
│   ├── ui/
│   │   ├── UITheme.ts             # Design tokens (colors, fonts, styles)
│   │   ├── UIHelpers.ts           # drawPanel, drawButton, animations
│   │   ├── TowerInfoPanel.ts      # Selected tower details
│   │   ├── SpawnMenu.ts           # Spawn configuration + starter placement
│   │   ├── EvolutionModal.ts      # Evolution selection
│   │   ├── MergeModal.ts          # Merge confirmation
│   │   └── TutorialOverlay.ts     # 8-step new player tutorial
│   ├── systems/
│   │   ├── AttributeSystem.ts     # Damage multipliers
│   │   ├── BossAbilitySystem.ts   # Boss ability logic (pure functions)
│   │   ├── DPSystem.ts            # DP calculations
│   │   ├── OriginSystem.ts        # Origin caps
│   │   ├── LevelSystem.ts         # Level up costs/effects
│   │   └── TargetingSystem.ts     # Tower targeting priorities
│   ├── utils/
│   │   ├── EventBus.ts            # Global event system
│   │   └── GridUtils.ts           # Grid/pixel conversion, path positions
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

### Deployment
- **GitHub Pages**: Auto-deploys on push to `main` via `.github/workflows/deploy.yml`
- **Live URL**: https://wandering-pork.github.io/DigiMerge-TD/
- **Vite base**: `base: '/DigiMerge-TD/'` in `vite.config.ts`

### Claude Code Skill
A `/phaser` skill is available for Phaser 3 API questions, game development patterns, sprites, tweens, scenes, game objects, physics, input handling, audio, and asset loading specific to this project.

---

## Key Design Documents

| Document | Description |
|----------|-------------|
| `GAME_DESIGN_DOCUMENT.md` | Complete game mechanics, systems, UI/UX |
| `ENEMY_SPAWN_DESIGN.md` | Wave compositions, enemy types, bosses |
| `DIGIMON_STATS_DATABASE.md` | All Digimon stats, evolution paths |
| `IMPLEMENTATION_PLAN.md` | Sprint planning, task breakdown (Sprints 0-15) |
| `PROGRESS.md` | Current implementation status, completed sprints, test summary |

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

const LEVEL_UP_COST = (level: number, stageMultiplier: number) => Math.ceil(3 * level * stageMultiplier);
// Stage multipliers: In-Training ×1, Rookie ×1.5, Champion ×2, Ultimate ×3, Mega ×4, Ultra ×5
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
                              ↓                                   ↓    ↓
                        EncyclopediaScene                 PauseScene  SettingsScene
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
  BOSS_ABILITY_ACTIVATED: 'boss:abilityActivated',
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
**Location**: `public/assets/sprites/Idle Frame Only/`
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
**Location**: `public/assets/sfx/`

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

### Tiles (Sprout Lands pack)
**Location**: `public/assets/tiles/`

| File | Size | Frames | Usage |
|------|------|--------|-------|
| `grass.png` | 176x112 | 11x7 (16x16) | Tower slot backgrounds |
| `dirt.png` | 128x128 | 8x8 (16x16) | Enemy path tiles |
| `water.png` | 64x16 | 4x1 (16x16) | Border/outside area |
| `decorations.png` | 144x80 | 9x5 (16x16) | Trees, bushes, rocks, flowers |

### Other Assets
- **UI Elements**: Built with Phaser Graphics + UITheme.ts design tokens
- **Effects**: Simple shapes (particles, tweens)
- **Music**: Not included (skip for MVP)

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
cost = Math.ceil(3 * currentLevel * stageMultiplier);
// Stage multipliers: In-Training ×1, Rookie ×1.5, Champion ×2, Ultimate ×3, Mega ×4, Ultra ×5
```

### Boss Abilities
```typescript
// Trigger types: 'cooldown' (periodic), 'passive' (every frame), 'hp_threshold' (one-time)
// Pure function system: tickBossAbility() returns BossAbilityAction[] descriptors
// GameScene.executeBossAction() handles side effects (stun towers, shake camera, etc.)

// 10 boss abilities:
// W10 Greymon:       Nova Blast       — Stun nearest tower 2s (cooldown 8s)
// W20 Greymon Evo:   Mega Flame       — Speed boost nearby enemies 30% for 3s (cooldown 10s)
// W30 Devimon:       Death Claw       — Drain 5 DB/sec while alive (passive)
// W40 Myotismon:     Crimson Lightning — Heal self 10% HP (cooldown 12s)
// W50 SkullGreymon:  Ground Zero      — Destroy all projectiles at 50% HP (hp_threshold)
// W60 VenomMyotismon:Venom Infuse     — Spawn 3 swarm minions (cooldown 15s)
// W70 Machinedramon: Infinity Cannon  — Reduce all tower ranges 20% (passive aura)
// W80 Omegamon:      Transcendent Sword — 50% damage shield 4s (cooldown 20s)
// W90 Omegamon Zwart:Garuru Cannon    — Stun top 3 DPS towers 3s (cooldown 15s)
// W100 Apocalymon:   Total Annihilation — Stun all towers 2s at 25% HP (hp_threshold)
```

---

## MVP Scope

### MVP + Post-MVP Features
| Feature | Status | Notes |
|---------|--------|-------|
| Core TD loop | ✅ | Spawn, place, attack, waves |
| 8 starters + evolutions | ✅ | ~40 tower Digimon, ~65 enemy Digimon |
| 100 Waves + Endless | ✅ | 5 phases, 12 bosses, endless mode 101+ |
| Level up system | ✅ | Pay DB to increase level |
| Digivolve system | ✅ | At max level, choose path |
| Merge system | ✅ | Same attribute + stage |
| DP & Origin systems | ✅ | Core mechanics |
| Attribute triangle | ✅ | Vaccine/Data/Virus/Free |
| HUD | ✅ | Lives, DB, wave counter, speed, pause, settings |
| Tower info panel | ✅ | Stats, buttons |
| Spawn menu | ✅ | Stage + type selection, starter placement |
| Sound effects | ✅ | All 17 SFX + volume control |
| Save/Load | ✅ | LocalStorage + auto-save |
| UI Theme System | ✅ | UITheme.ts tokens + UIHelpers.ts components |
| Volume Control | ✅ | Slider + mute in SettingsScene |
| Game Speed | ✅ | 1x/2x/3x toggle + keyboard shortcuts |
| Sprout Lands Tileset | ✅ | Grass, dirt, water tiles + decorations |
| GitHub Pages Deploy | ✅ | Auto-deploy via GitHub Actions |
| Stage-based level-up costs | ✅ | Higher stages cost proportionally more (×1 to ×5) |
| Status effects system | ✅ | Burn, Poison, Slow, Freeze, Stun, Armor Break |
| Tower skills display | ✅ | Effect name + proc chance in TowerInfoPanel |
| Floating damage numbers | ✅ | Color-coded by effectiveness, toggleable |
| Health bar toggle | ✅ | All / Bosses Only / Off in Settings |
| Wave preview | ✅ | Next wave composition in HUD |
| 21 starter lines | ✅ | Tier 1+2 roster expansion (~105 tower Digimon) |
| Boss abilities | ✅ | 10 unique abilities (stun, drain, heal, shield, spawn, etc.) |
| Tutorial | ✅ | 8-step overlay with highlights, skip, localStorage persistence |
| Encyclopedia | ✅ | Browsable Digimon catalog with filters, pagination, detail view |
| Enhanced wave preview | ✅ | Enemy sprites, type tags, boss ability names |

### Remaining Work

**Content:**
- More Digimon roster expansion (~150+ target, currently ~105 tower Digimon)
- DNA Digivolution system (Ultra tier)

**UX & Polish:**
- Drag-and-drop merge, visual merge effects, object pooling, background music

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
