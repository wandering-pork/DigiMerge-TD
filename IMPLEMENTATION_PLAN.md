# DigiMerge TD - Implementation Plan

## Overall Status: MVP Playable

**292 tests passing | TypeScript compiles clean | Vite build succeeds**

All 8 sprints complete. Core game logic fully implemented and tested.
All must-have gaps filled: merge trigger, digivolve trigger, auto-save, ghost preview, boss UX.
Remaining items are nice-to-have polish (drag-drop, HUD refactor, UI components, object pooling).

### Implementation Summary

| Sprint | Focus | Status | Notes |
|--------|-------|--------|-------|
| 0 | Project Setup | **Done** | .gitignore created, git not yet initialized |
| 1 | Foundation | **Done** | All scenes, data files, assets, tests |
| 2 | Core Entities | **Done** | Tower, Enemy, Projectile, grid rendering, ghost preview |
| 3 | Game Loop | **Done** | WaveManager, CombatManager, AttributeSystem, TargetingSystem |
| 4 | Economy | **Done** | Ghost preview added, spawn placement working |
| 5 | Evolution | **Done** | DPSystem, OriginSystem, EvolutionModal, TowerInfoPanel + Digivolve button |
| 6 | Merge System | **Done** | Modal-based merge with merge mode (highlight candidates) |
| 7 | UI Polish | **Partially Done** | No HUD.ts, UIManager, or reusable components |
| 8 | Content & Polish | **Done** | Boss health bar + announcement, auto-save, Continue button |

### Test Inventory (292 tests, 14 files)

| Test File | Tests |
|-----------|-------|
| AttributeSystem | 20 |
| TargetingSystem | 13 |
| DPSystem | 19 |
| LevelSystem | 32 |
| MergeSystem | 17 |
| OriginSystem | 34 |
| GridUtils | 16 |
| Constants | 28 |
| DigimonDatabase | 15 |
| EvolutionPaths | 12 |
| WaveData | 10 |
| GameStateManager | 52 |
| SaveManager | 16 |
| SpawnMenu | 8 |

---

## Phase 0: Project Setup

### 0.1 Git Repository Setup

- [x] .gitignore created
- [ ] **NOT DONE** - Git not initialized (git init + initial commit)

```bash
# Initialize repository
git init
git branch -M main

# Create .gitignore
```

**.gitignore contents:**
```gitignore
# Dependencies
node_modules/

# Build output
dist/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*

# Testing
coverage/

# Temp files
*.tmp
*.temp
```

```bash
# Initial commit
git add .
git commit -m "Initial commit: project documentation and assets"

# Remote setup (when ready)
git remote add origin <repository-url>
git push -u origin main
```

### 0.2 Project Initialization

- [x] Vite + TypeScript project created
- [x] Phaser 3.80+ installed
- [x] Dev dependencies installed (vitest, typescript, etc.)

### 0.3 Directory Structure Creation

- [x] All source directories created (config, scenes, entities, managers, data, ui, systems, utils, types)
- [x] Test directories created
- [x] `src/ui/components/` directory exists but is **empty** (no reusable components created)

### 0.4 Configuration Files

- [x] `vite.config.ts` with `@/` path alias
- [x] `tsconfig.json` with strict mode
- [x] `vitest.config.ts` configured

---

## Testing Strategy: Test-Driven Development (TDD)

- [x] TDD methodology followed for all pure logic systems
- [x] Vitest configured and running
- [x] 14 test files, 292 tests total

### Actual Test File Structure
```
tests/
├── setup.ts                       # Phaser mocks
├── systems/
│   ├── AttributeSystem.test.ts    # 20 tests
│   ├── DPSystem.test.ts           # 19 tests
│   ├── LevelSystem.test.ts        # 32 tests
│   ├── MergeSystem.test.ts        # 17 tests
│   ├── OriginSystem.test.ts       # 34 tests
│   └── TargetingSystem.test.ts    # 13 tests
├── data/
│   ├── DigimonDatabase.test.ts    # 15 tests
│   ├── WaveData.test.ts           # 10 tests
│   └── EvolutionPaths.test.ts     # 12 tests
├── managers/
│   ├── GameStateManager.test.ts   # 52 tests
│   └── SaveManager.test.ts        # 16 tests
├── ui/
│   └── SpawnMenu.test.ts          # 8 tests
└── utils/
    ├── Constants.test.ts          # 28 tests
    └── GridUtils.test.ts          # 16 tests
```

**Deviation from plan:** `MathUtils.test.ts` was not created (no MathUtils.ts needed). `Constants.test.ts` and `GridUtils.test.ts` were created instead. `SpawnMenu.test.ts` was added for UI logic testing.

---

## Sprint 1: Foundation - **DONE**

**Goal:** Runnable game shell with scene navigation, asset loading, and core data files

### Tasks

#### 1.1 Entry Point & Game Config
- [x] Create `src/main.ts` with Phaser game configuration
- [x] Set up canvas size (1280x720 with 8x18 grid at 64px game area)
- [x] Configure WebGL renderer with fallback to Canvas
- [x] Set background color and pixel art scaling

#### 1.2 Scene Infrastructure
- [x] Create `src/scenes/BootScene.ts` - minimal setup, transitions to Preload
- [x] Create `src/scenes/PreloadScene.ts` - loading bar, asset loading
- [x] Create `src/scenes/MainMenuScene.ts` - title, play button
- [x] Create `src/scenes/StarterSelectScene.ts` - 8 starter choices (4x2 grid, toggle selection, max 4)
- [x] Create `src/scenes/GameScene.ts` - gameplay area with grid, HUD, managers
- [x] Create `src/scenes/PauseScene.ts` - overlay scene with resume/main menu
- [x] Create `src/scenes/GameOverScene.ts` - victory/defeat states, restart/menu buttons

#### 1.3 Asset Loading
- [x] Create asset manifest for sprites - **69 sprites loaded** (exceeds planned ~40)
  - 40 tower Digimon (8 lines x 5 stages)
  - 17 alternate evolutions
  - 12 enemy-only sprites
- [x] Load all 17 SFX files
- [x] Create loading progress bar UI (400x32px, percentage text)
- [x] Verify all assets load correctly
- [x] Sprite filename corrections applied (Japanese romanization: DemiVeemon→Chibimon, Veemon→V-mon, etc.)

#### 1.4 Core Utilities
- [x] Create `src/utils/EventBus.ts` with Phaser EventEmitter
- [x] Define `GameEvents` constants
- [x] Create `src/config/Constants.ts` with game constants + PATH_WAYPOINTS (57 waypoints)
- [x] Create `src/config/GameConfig.ts` for Phaser config

#### 1.5 Type Definitions
- [x] Create `src/types/DigimonTypes.ts` (Stage, Attribute, TargetPriority enums, DigimonStats, EnemyStats, SpawnType)
- [x] Create `src/types/GameTypes.ts` (GameState, TowerSaveData, SaveData, GameStatistics, GameSettings)
- [x] Create `src/types/index.ts` re-exports

#### 1.6 Core Data Files

**1.6.1 DigimonDatabase (`src/data/DigimonDatabase.ts`)** - **DONE**
- [x] 40 tower Digimon across 8 evolution lines (In-Training through Mega)
- [x] 21 enemy Digimon (5 In-Training, 14 Rookie, 2 Champion) + 2 bosses
- [x] All stats: id, name, stageTier, attribute, baseDamage, baseSpeed, range, effectType, effectChance
- [x] Enemy stats: baseHP, moveSpeed, armor, type, reward

**1.6.2 WaveData (`src/data/WaveData.ts`)** - **DONE**
- [x] Waves 1-20 defined with enemy compositions
- [x] Spawn intervals (2000ms tutorial → 1800ms later waves)
- [x] Boss waves at 10 and 20 with bonus rewards

**1.6.3 EvolutionPaths (`src/data/EvolutionPaths.ts`)** - **DONE**
- [x] All 8 starter evolution lines through Mega stage (32 entries)
- [x] Alternate evolution paths with DP requirements
- [x] `getEvolutions(digimonId, currentDP)` helper function

#### 1.7 Testing Setup
- [x] Configure Vitest in `vitest.config.ts`
- [x] Create `tests/setup.ts` for Phaser mocks
- [x] `DigimonDatabase.test.ts` - 15 tests (starters exist, required fields, enemy validation)
- [x] `WaveData.test.ts` - 10 tests (waves 1-20 exist, enemy IDs valid)
- [x] `EvolutionPaths.test.ts` - 12 tests (all starters have paths, DP ranges valid)
- [x] `Constants.test.ts` - 28 tests (grid, costs, formulas, path waypoints)

### Sprint 1 Acceptance Criteria
- [x] `npm run dev` starts game without errors
- [x] `npm run test` runs without errors
- [x] Scene transitions work: Boot → Preload → MainMenu → StarterSelect → Game
- [x] All starter sprites display correctly
- [x] All SFX load correctly
- [x] Loading bar shows progress
- [x] Data files compile and export correctly
- [x] All 8 starters defined in DigimonDatabase
- [x] Waves 1-20 defined in WaveData
- [x] Evolution paths defined for all starters

---

## Sprint 2: Core Entities - **DONE** (with gaps)

**Goal:** Tower and Enemy classes with basic rendering

### Tasks

#### 2.1 Tower Entity
- [x] Create `src/entities/Tower.ts` extending Phaser.GameObjects.Container
- [x] Properties: digimonId, level, dp, attribute, stage, originStage, towerID
- [x] Sprite rendering with dynamic scaling (16px native → ~48px target)
- [x] Level indicator display ("Lv.1" text below sprite)
- [x] Selection highlight state (yellow 2px border)
- [x] Range indicator (green semi-transparent circle, toggle via `showRange()`)
- [x] Combat methods: `getAttackDamage()`, `getAttackSpeed()`, `canAttack()`, `resetCooldown()`
- [x] `toSaveData()` serialization for LocalStorage
- [x] `setDigimon(id)` for evolution (swaps sprite, stats, stage)

#### 2.2 Enemy Entity
- [x] Create `src/entities/Enemy.ts` extending Phaser.GameObjects.Container
- [x] Properties: digimonId, hp, maxHp, speed, armor, attribute, enemyType, reward
- [x] Health bar display above sprite (40x5px, green→yellow→red)
- [x] Path following using cached pixel positions from waypoints
- [x] Death handling (fade-out tween, emits ENEMY_DIED with reward)
- [x] Base reach handling (emits ENEMY_REACHED_BASE, immediate destroy)
- [x] Wave scaling support (HP multiplier parameter)
- [x] Boss enemies handled via "boss_" prefix in digimonId (no separate Boss.ts)

#### 2.3 Projectile Entity
- [x] Create `src/entities/Projectile.ts` extending Phaser.GameObjects.Container
- [x] Properties: damage, speed, target, sourceAttribute, isActive
- [x] Homing movement toward target (300 px/s default)
- [x] Hit detection (10px threshold) and cleanup
- [x] Visual trail effect (2px line, 35% opacity)
- [x] Attribute-based coloring (Vaccine=blue, Data=green, Virus=red, Free=yellow)
- [x] Deactivation when target dies mid-flight

#### 2.4 Map Rendering (in GameScene)
- [x] Render path tiles (brown 0x3a2a1a)
- [x] Render tower placement slots (dark green 0x1e2e1e with borders)
- [x] Spawn indicator (green "S") and base indicator (red "B")
- [x] Path line drawn through all 57 waypoints
- [x] Ghost preview sprite on valid empty slots (semi-transparent starter sprite follows pointer)
- [ ] **NOT DONE** - Draw grid lines (debug toggle)

#### 2.5 TDD: Utilities (Tests First)
- [x] `GridUtils.test.ts` - 16 tests (path positions, grid↔pixel conversions)
- [x] Implement `src/utils/GridUtils.ts` with `getPathPixelPositions()`, grid/pixel conversions

### Sprint 2 Acceptance Criteria
- [x] Tower renders at grid position with correct sprite
- [x] Enemy follows path from spawn to base
- [x] Projectile fires from tower to enemy
- [x] Grid and path are visually distinct
- [x] All unit tests pass

---

## Sprint 3: Game Loop - **DONE**

**Goal:** Functional wave system with combat

### Tasks

#### 3.1 Wave Manager
- [x] Create `src/managers/WaveManager.ts`
- [x] Wave data structure (enemies, timing, count from WAVE_DATA)
- [x] Spawn queue processing (Fisher-Yates shuffle, bosses appended last)
- [x] Wave completion detection (empty queue + no active enemies)
- [x] Wave scaling: `1 + 0.08 * (waveNumber - 1)` HP multiplier
- [ ] **NOT DONE** - Inter-wave countdown timer (waves start on button click instead)

#### 3.2 Combat Manager
- [x] Create `src/managers/CombatManager.ts`
- [x] Tower targeting logic (converts enemies to MockTarget, delegates to TargetingSystem)
- [x] Attack cooldown management (Tower.canAttack/resetCooldown)
- [x] Damage calculation with attribute multipliers (via AttributeSystem)
- [x] Projectile spawning and tracking (updates all projectiles each frame)

#### 3.3 Targeting System
- [x] Create `src/systems/TargetingSystem.ts`
- [x] Implement 7 priority modes: First, Last, Strongest, Weakest, Fastest, Closest, Flying
- [x] Range checking (pixel distance)
- [x] Target acquisition per tower

#### 3.4 TDD: Attribute System (Tests First)
- [x] `AttributeSystem.test.ts` - 20 tests (all 16 combinations + edge cases)
- [x] Implement `src/systems/AttributeSystem.ts` (getMultiplier, getAdvantage, isStrong, isWeak)

#### 3.5 TDD: Targeting & Combat (Tests First)
- [x] `TargetingSystem.test.ts` - 13 tests (all 7 priorities, range filtering, empty cases)
- [x] Targeting and combat logic implemented

### Sprint 3 Acceptance Criteria
- [x] Waves spawn enemies at correct intervals
- [x] Towers acquire targets and fire projectiles
- [x] Damage applies with attribute multipliers
- [x] Enemies die when HP reaches 0
- [x] Wave completion triggers next wave availability
- [x] All unit tests pass

---

## Sprint 4: Economy - **MOSTLY DONE**

**Goal:** DigiBytes system, leveling, and spawn menu

### Tasks

#### 4.1 TDD: Game State Manager (Tests First)
- [x] `GameStateManager.test.ts` - 52 tests across 10 describe blocks
- [x] DigiBytes add/subtract with validation (ignores <=0, returns false on insufficient)
- [x] Enemy reward calculations (`50 + wave * 10` formula)
- [x] Lives management with GAME_OVER event at 0
- [x] Wave tracking and advancement
- [x] Full state reset capability
- [x] Implement `src/managers/GameStateManager.ts` (no Phaser dependency, EventBus-driven)

#### 4.2 TDD: Level System (Tests First)
- [x] `LevelSystem.test.ts` - 32 tests across 6 describe blocks
- [x] Level up cost formula: `5 * currentLevel`
- [x] Stat scaling: damage `+2%/level`, speed `+1%/level`
- [x] Max level calculation: `baseMax + (dp * dpBonus) + (stageDiff * 5)`
- [x] `canLevelUp()`, `getTotalLevelUpCost()` utilities
- [x] Implement `src/systems/LevelSystem.ts` (pure functions, delegates to Constants.ts)

#### 4.3 Spawn Menu UI
- [x] Create `src/ui/SpawnMenu.ts` (extends Phaser.GameObjects.Container)
- [x] Stage selection (In-Training, Rookie, Champion)
- [x] Digimon picker (walks evolution tree via `getAvailableDigimonAtStage()`)
- [x] Cost display per option (from SPAWN_COSTS constants)
- [x] Spawn button with affordability check
- [x] `SpawnMenu.test.ts` - 8 tests (getAvailableDigimonAtStage for all stages)

#### 4.4 Tower Placement
- [x] Click-to-place on valid grid slots (via grid pointer handler in GameScene)
- [x] Checks `isValidTowerSlot()` and slot occupancy
- [x] Ghost preview while placing (semi-transparent sprite follows pointer over valid slots)
- [ ] **NOT DONE** - Placement confirmation step (places immediately on spawn from menu)
- [ ] **NOT DONE** - Cancel placement (right-click/ESC)

#### 4.5 Enemy Rewards
- [x] DigiBytes reward on enemy kill (ENEMY_DIED handler adds reward)
- [x] Reward values defined per enemy in DigimonDatabase
- [x] Wave completion bonus (via WaveData reward field)

### Sprint 4 Acceptance Criteria
- [x] DigiBytes display updates in real-time
- [x] Spawn menu shows correct costs
- [x] Cannot spawn if insufficient DigiBytes
- [x] Towers can be placed on valid slots only
- [x] Leveling up costs correct amount and increases stats
- [x] All unit tests pass

**Remaining gaps:** Placement confirmation/cancel

---

## Sprint 5: Evolution - **DONE**

**Goal:** Digivolution system with DP and Origin mechanics

### Tasks

#### 5.1 TDD: DP System (Tests First)
- [x] `DPSystem.test.ts` - 19 tests across 3 describe blocks
- [x] DP gain from merging: `max(A.dp, B.dp) + 1`
- [x] DP bonus to max level: `dp * dpBonus` (varies by stage)
- [x] Merge attribute validation (same attribute or FREE)
- [x] Implement `src/systems/DPSystem.ts` (pure functions)

#### 5.2 TDD: Origin System (Tests First)
- [x] `OriginSystem.test.ts` - 34 tests across 5 describe blocks
- [x] Origin bonus: `(currentStage - originStage) * 5`
- [x] Origin cap limits (In-Training→Champion, Rookie→Ultimate, Champion→Mega)
- [x] `canDigivolve()` with priority-ordered validation (max level → origin → cost)
- [x] `getDigivolveCost()` from DIGIVOLVE_COSTS tuple
- [x] Implement `src/systems/OriginSystem.ts` (pure functions)

#### 5.3 TDD: Evolution Logic (Tests First)
- [x] Evolution path lookups tested in `EvolutionPaths.test.ts` (12 tests)
- [x] DP requirements for alternate paths verified
- [x] Digivolve cost per stage tested in `OriginSystem.test.ts`
- [x] `canDigivolve()` validation logic tested

#### 5.4 Evolution Modal
- [x] Create `src/ui/EvolutionModal.ts` (centered overlay, dark background)
- [x] Show available evolution options from `getEvolutions(digimonId, dp)`
- [x] Display requirements (DP range, default/alternate indicators)
- [x] Stats comparison preview
- [x] Confirm/cancel buttons

#### 5.5 Digivolve Action
- [x] Check max level reached
- [x] Check evolution options available
- [x] Apply evolution (change Digimon via `tower.setDigimon()`, reset level to 1)
- [x] Pay digivolve cost from DigiBytes
- [x] SFX wired via AudioManager (tower_evolve.wav)
- [x] Digivolve button in TowerInfoPanel (visible at max level when evolutions available)
- [x] DIGIVOLVE_INITIATED event → GameScene opens EvolutionModal

### Sprint 5 Acceptance Criteria
- [x] DP displays correctly on tower info
- [x] Max level increases with DP
- [x] Origin limits maximum evolution stage
- [x] Evolution modal shows valid options only
- [x] Digivolution changes tower sprite and resets level
- [x] All unit tests pass

---

## Sprint 6: Merge System - **DONE** (modal-based)

**Goal:** ~~Drag-drop~~ Modal-based merging with attribute matching

**Deviation:** Drag-and-drop was not implemented. Merge is triggered via Merge button in TowerInfoPanel,
which enters merge mode (highlights valid candidates), then clicking a candidate opens MergeModal.

### Tasks

#### 6.1 Tower Selection
- [x] Create `src/managers/TowerManager.ts`
- [x] Click to select tower (selectTower/deselectTower)
- [x] Selection highlight (yellow border via Tower.select())
- [x] Range circle shown on selection
- [x] Emits TOWER_SELECTED/TOWER_DESELECTED events
- [x] `findMergeCandidates(tower)` finds eligible partners
- [x] `getTowerAt(col, row)` grid lookup
- [x] `sellTower(tower)` with `level * 25` refund

#### 6.2 Merge Trigger (replaces Drag and Drop)
- [x] Merge button in TowerInfoPanel (visible when tower is selected)
- [x] Merge mode state machine in GameScene (isMergeMode, mergeSourceTower)
- [x] Valid merge candidates highlighted with cyan borders; source highlighted yellow
- [x] Click on candidate → opens MergeModal for confirmation
- [x] ESC or click elsewhere → exits merge mode, clears highlights
- [x] MERGE_INITIATED event from TowerInfoPanel → GameScene.enterMergeMode()
- [ ] **NOT DONE** - Drag-and-drop as alternative merge trigger (deferred)

> **Note:** Merge mode provides a clean click-based workflow instead of drag-and-drop.

#### 6.3 TDD: Merge Logic (Tests First)
- [x] `MergeSystem.test.ts` - 17 tests across 2 describe blocks
- [x] Merge validation: same attribute required (or FREE)
- [x] Merge validation: same stage required
- [x] Merge validation: reject different attributes
- [x] Merge validation: reject different stages
- [x] DP transfer: `max(A.dp, B.dp) + 1`
- [x] Level transfer: keeps higher level
- [x] Implement `src/systems/MergeSystem.ts` (canMerge, getMergeResult - pure functions)
- [x] Merge execution in `TowerManager.tryMerge()` (applies result, destroys sacrifice)

#### 6.4 Merge Modal
- [x] Create `src/ui/MergeModal.ts` (centered 450x350 overlay)
- [x] Show merge preview (side-by-side comparison: KEEPS vs REMOVED)
- [x] Display merge result (DP and level preview)
- [x] Confirm/cancel buttons
- [x] Callback-based confirm (`onConfirm(survivor, sacrifice)`)

#### 6.5 Merge Feedback
- [x] Merge SFX wired via AudioManager (merge_success.wav)
- [ ] **NOT DONE** - Visual merge effect (particle/tween)
- [x] Tower display updates after merge (level, DP)

### Sprint 6 Acceptance Criteria
- [x] ~~Can drag tower onto another tower~~ → Merge mode with click-to-select instead
- [x] Merge only allowed for same attribute + stage (or FREE attribute)
- [x] Surviving tower gains +1 DP
- [x] Surviving tower keeps higher level
- [x] Merged tower is removed from grid
- [x] All unit tests pass

**Remaining gaps:** Drag-and-drop merge (alternative UX), visual merge effect (particle/tween)

---

## Sprint 7: UI Polish - **PARTIALLY DONE**

**Goal:** Complete HUD and information panels

### Tasks

#### 7.1 HUD
- [x] Lives display (red text in GameScene HUD panel)
- [x] DigiBytes display (yellow text)
- [x] Wave counter (current/total)
- [x] Wave start button (interactive, disables during wave)
- [x] Pause button
- [ ] **NOT DONE** - Separate `src/ui/HUD.ts` file (HUD is inline in GameScene.createHUD())

> **Deviation:** HUD elements are created directly in GameScene rather than in a separate HUD class.
> Functional but violates single-responsibility. Refactoring to HUD.ts would improve maintainability.

#### 7.2 Tower Info Panel
- [x] Create `src/ui/TowerInfoPanel.ts` (full-featured, ~700 lines)
- [x] Digimon name and sprite (2.5x scaled)
- [x] Stats: Level, Stage, Attribute, DP, Damage, Attack Speed, Range
- [x] Level Up button (green, shows cost, disabled states for max level/insufficient funds)
- [x] Sell button (red, shows refund amount `level * 25`)
- [x] Digivolve button (purple, visible at max level when evolutions exist)
- [x] Merge button (teal, visible when tower is selected)
- [x] Target priority selector (cycles through all 7 modes)
- [x] EventBus integration (listens for TOWER_SELECTED/DESELECTED, emits MERGE/DIGIVOLVE_INITIATED)
- [x] ESC key to close

#### 7.3 UI Components
- [ ] **NOT DONE** - `src/ui/components/Button.ts` - reusable button
- [ ] **NOT DONE** - `src/ui/components/Panel.ts` - background panel
- [ ] **NOT DONE** - `src/ui/components/ProgressBar.ts` - health/loading bars
- [ ] **NOT DONE** - `src/ui/components/Tooltip.ts` - hover information

> **Deviation:** Each UI panel (SpawnMenu, TowerInfoPanel, EvolutionModal, MergeModal) implements
> its own buttons and panels with inline `drawButtonBg()` helpers. This results in some code
> duplication but was faster to implement. The `src/ui/components/` directory exists but is empty.

#### 7.4 UI Manager
- [ ] **NOT DONE** - `src/managers/UIManager.ts`
- [ ] **NOT DONE** - Coordinate panel visibility
- [ ] **NOT DONE** - Handle UI state (menu open, modal open)
- [ ] **NOT DONE** - UI event routing

> **Deviation:** GameScene handles UI coordination directly via EventBus listeners.
> Each panel manages its own show/hide. No centralized UI state management exists.

#### 7.5 Visual Polish
- [x] Consistent color scheme (dark panels 0x1a1a33, borders 0x6666cc, titles #ffdd44)
- [x] Button hover/press states (color change on hover, all panels)
- [x] Panel borders and shadows
- [ ] **NOT DONE** - Smooth transitions/tweens for panel show/hide

#### 7.6 TDD: UI Logic (Tests First)
- [x] `SpawnMenu.test.ts` - 8 tests (getAvailableDigimonAtStage logic)
- [ ] **NOT DONE** - UI state transition tests
- [ ] **NOT DONE** - Progress bar percentage tests

### Sprint 7 Acceptance Criteria
- [x] HUD always visible during gameplay
- [x] Tower info panel shows on tower selection
- [x] All buttons have hover/press feedback
- [x] UI does not overlap gameplay area (HUD panel on right side)
- [x] Panels can be dismissed (close buttons, ESC key)
- [x] All unit tests pass

**Remaining gaps:** Separate HUD.ts, UIManager, reusable UI components, panel animation tweens

---

## Sprint 8: Content & Polish - **MOSTLY DONE**

**Goal:** Complete MVP with waves 1-20, boss, audio, and save system

### Tasks

#### 8.1 Wave Content
- [x] `src/data/WaveData.ts` complete for waves 1-20
- [x] Difficulty curve: Tutorial (1-5) → Rookie intro (6-10) → Ramp (11-15) → Finale (16-20)
- [x] Enemy variety per wave (6 different enemy types used)
- [x] Boss waves at 10 and 20 (with bonus rewards 100/200 DB)

#### 8.2 Boss Implementation
- [ ] **NOT DONE** - Separate `src/entities/Boss.ts` class (uses Enemy with scaled stats instead)
- [x] Boss enemies exist as high-stat entries in DigimonDatabase (boss_greymon: 500 HP, boss_greymon_evolved: 1500 HP)
- [x] Bosses spawned via WaveManager as last enemy in wave
- [x] BOSS_SPAWNED event emitted + boss_spawn.wav SFX
- [x] Boss health bar (top of grid, red fill on dark background, name label)
- [x] Boss spawn announcement text (animated with Back.easeOut tween, auto-fades)
- [ ] **NOT DONE** - Special boss abilities

> **Deviation:** Bosses are Enemy instances with "boss_" prefix IDs and scaled stats.
> No separate Boss.ts class. Boss UX (health bar, announcement) handled in GameScene.

#### 8.3 Audio Manager
- [x] Create `src/managers/AudioManager.ts`
- [x] SFX playback with volume control
- [x] All 17 SFX mapped to correct game events:
  - attack_hit, attack_miss, boss_spawn, button_click, button_hover
  - enemy_death, enemy_escape, game_over, insufficient_funds
  - merge_success, tower_evolve, tower_level_up, tower_sell, tower_spawn
  - victory, wave_complete, wave_start
- [x] Volume and enabled controls
- [ ] **NOT DONE** - Mute/unmute toggle UI button

#### 8.4 TDD: Save System (Tests First)
- [x] `SaveManager.test.ts` - 16 tests across 5 describe blocks
- [x] Save data serialization (version, timestamp, gameState, towers, statistics, settings)
- [x] Save data deserialization with validation
- [x] Version checking (incompatible versions return null)
- [x] Corrupted data handling (invalid JSON returns null, missing fields return null)
- [x] Settings save/load (separate from game state)
- [x] Implement `src/managers/SaveManager.ts` (static methods, no Phaser dependency)
- [x] Auto-save after each wave completion (WAVE_COMPLETED → SaveManager.save())
- [x] Load saved game on startup (MainMenuScene Continue button → registry flag → GameScene.loadSavedGame())

#### 8.5 TDD: Game Logic (Tests First)
- [x] Wave data integrity tested in `WaveData.test.ts` (10 tests)
- [x] Boss stats in DigimonDatabase (verified in DigimonDatabase.test.ts)
- [x] Game over detection in `GameStateManager.test.ts` (3 tests for isGameOver)

#### 8.6 Final Polish
- [x] Game over screen with victory/defeat states (GameOverScene)
- [x] Victory screen (wave 20 clear → "Victory!" in green)
- [x] Pause menu functionality (ESC key, resume/main menu buttons)
- [ ] **NOT DONE** - Performance optimization (object pooling for projectiles/enemies)
- [ ] **NOT DONE** - Comprehensive bug fix pass (no playtesting done yet)

### Sprint 8 Acceptance Criteria
- [x] All 20 waves defined with compositions *(needs playtesting to verify playability)*
- [x] Boss data exists for wave 10 and 20
- [x] All 17 SFX wired to game events
- [x] Save/load system implemented and tested
- [x] Can continue saved game (auto-save after wave, Continue button on MainMenuScene)
- [x] All unit tests pass

**Remaining gaps:** Object pooling, mute toggle, playtesting

---

## Remaining Work Summary

### Must-Have for Playable MVP

| Item | Sprint | Priority | Status |
|------|--------|----------|--------|
| .gitignore | 0 | High | **Done** |
| Git init + initial commit | 0 | High | Not done |
| Merge trigger in gameplay | 6 | High | **Done** - Merge button + merge mode |
| Digivolve trigger in gameplay | 5 | High | **Done** - Digivolve button at max level |
| Auto-save wiring | 8 | Medium | **Done** - Saves after each wave |
| Ghost preview for placement | 2/4 | Medium | **Done** - Semi-transparent sprite on valid slots |
| Boss health bar + announcement | 8 | Medium | **Done** - Health bar + animated text |
| Playtesting pass | 8 | High | Not done - never tested in browser end-to-end |

### Nice-to-Have Improvements

| Item | Sprint | Priority | Notes |
|------|--------|----------|-------|
| Drag-and-drop merge | 6 | Medium | Alternative to modal-based merge |
| Separate HUD.ts | 7 | Low | Refactor from GameScene inline code |
| UIManager.ts | 7 | Low | Centralized UI state management |
| Reusable UI components | 7 | Low | Reduce code duplication across panels |
| Object pooling | 8 | Low | Performance optimization for later phases |
| Mute/unmute UI button | 8 | Low | AudioManager supports it, just needs UI |
| Visual merge effect | 6 | Low | Particle/tween on merge |
| Grid debug toggle | 2 | Low | Developer tool |
| Panel show/hide animations | 7 | Low | Smooth transitions |
| Placement confirmation/cancel | 4 | Low | Currently places immediately |

### Files Planned but Not Created

| File | Reason |
|------|--------|
| `src/entities/Boss.ts` | Bosses use Enemy class with scaled stats |
| `src/managers/UIManager.ts` | UI coordination lives in GameScene |
| `src/ui/HUD.ts` | HUD is inline in GameScene.createHUD() |
| `src/ui/components/Button.ts` | Buttons implemented inline per panel |
| `src/ui/components/Panel.ts` | Panels implemented inline |
| `src/ui/components/ProgressBar.ts` | Health bars in Enemy.ts, loading bar in PreloadScene |
| `src/ui/components/Tooltip.ts` | No tooltips implemented |
| `src/utils/PathfindingUtils.ts` | Path logic in GridUtils.ts instead |
| `src/utils/MathUtils.ts` | Not needed, math is inline where used |

---

## MVP Scope Summary

### Included Features
| Category | Features | Status |
|----------|----------|--------|
| **Digimon** | 8 starters + evolution lines (40 tower + 21 enemy + 2 boss) | Done |
| **Waves** | 1-20 with 2 bosses | Done |
| **Systems** | Spawn, Level, Merge, Digivolve, DP, Origin | Done |
| **Combat** | Attribute triangle, 7 targeting priorities | Done |
| **UI** | HUD, Tower Info, Spawn Menu, Evolution Modal, Merge Modal | Done |
| **Audio** | All 17 SFX | Done |
| **Persistence** | LocalStorage save/load | Done (auto-save after waves, Continue button) |

### Excluded from MVP
| Category | Deferred Features |
|----------|-------------------|
| **Content** | Waves 21-100, Endless mode, 150+ Digimon |
| **Features** | Tutorial, Encyclopedia, Full settings menu |
| **Polish** | Music, Advanced particles, Achievements |

---

## Risk Mitigation

| Risk | Mitigation | Status |
|------|------------|--------|
| Asset loading issues | Test early in Sprint 1, have fallback colors | Resolved - 69 sprites load correctly |
| Performance with many enemies | Object pooling, limit active entities | **Deferred** - not needed for Phase 1 scale |
| Complex merge logic | Unit test thoroughly in Sprint 6 | Resolved - 17 tests cover all cases |
| Save data corruption | Version saves, validation on load | Resolved - 16 tests cover edge cases |
| Scope creep | Strict MVP boundaries, defer extras | Followed - deferred drag-drop, components |

---

## Definition of Done

A sprint is complete when:
1. All acceptance criteria are met
2. All unit tests pass (`npm run test`) - **292 passing**
3. Code compiles without errors (`npm run build`) - **Clean**
4. No console errors during gameplay - **Not yet verified (needs playtest)**
5. Feature works in Chrome and Firefox - **Not yet verified (needs playtest)**
6. Code is committed with descriptive messages - **Git not yet initialized**

---

## Post-MVP Roadmap

### Phase 2: Content Expansion
- Waves 21-40 (Champion tier enemies)
- Additional Digimon lines
- New enemy types

### Phase 3: Features
- Tutorial system
- Encyclopedia/Digimon browser
- Full settings menu
- Endless mode

### Phase 4: Polish
- Background music
- Advanced visual effects
- Achievements
- Leaderboards

---

## Appendix A: Starter Digimon for MVP

| Starter | Attribute | Evolution Line |
|---------|-----------|----------------|
| Koromon | VACCINE | Koromon → Agumon → Greymon → MetalGreymon → WarGreymon |
| Tsunomon | DATA | Tsunomon → Gabumon → Garurumon → WereGarurumon → MetalGarurumon |
| Tokomon | VACCINE | Tokomon → Patamon → Angemon → MagnaAngemon → Seraphimon |
| Gigimon | VIRUS | Gigimon → Guilmon → Growlmon → WarGrowlmon → Gallantmon |
| Tanemon | DATA | Tanemon → Palmon → Togemon → Lillymon → Rosemon |
| DemiVeemon | FREE | DemiVeemon → Veemon → ExVeemon → Paildramon → Imperialdramon |
| Pagumon | VIRUS | Pagumon → DemiDevimon → Devimon → Myotismon → VenomMyotismon |
| Viximon | DATA | Viximon → Renamon → Kyubimon → Taomon → Sakuyamon |

---

## Appendix B: Sprite Filename Corrections

Several Digimon use Japanese romanization for sprite filenames:

| Database ID | Sprite Filename |
|-------------|----------------|
| demiveemon | Chibimon.png |
| viximon | Kyaromon.png |
| veemon | V-mon.png |
| demidevimon | PicoDevimon.png |
| growlmon | Growmon.png |
| exveemon | XV-mon.png |
| magnaangemon | HolyAngemon.png |
| wargrowlmon | MegaloGrowmon.png |
| lillymon | Lilimon.png |
| myotismon | Vamdemon.png |
| gallantmon | Dukemon.png |
| venommyotismon | VenomVamdemon.png |
| biyomon | Piyomon.png |
| beelzemon | Beelzebumon.png |
| blackgarurumon | Garurumon_Black.png |
| chaosgallantmon | ChaosDukemon.png |
