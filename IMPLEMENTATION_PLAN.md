# DigiMerge TD - Implementation Plan

## Overall Status: Full Game + Roster Expansion

**453 tests passing | 18 test files | TypeScript compiles clean | Vite build succeeds**

All 8 sprints + gameplay enhancements + QoL + full 100-wave content + endless mode + roster expansion (Tier 1+2) + boss abilities + tutorial/encyclopedia complete.
~105 tower Digimon (21 lines), ~65 enemy Digimon, 12 bosses (with unique abilities) across 5 phases. Regen, shielded, splitter mechanics. Endless mode with exponential scaling.

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
| 9 | QoL + Waves 21-100 + Endless | **Done** | Enemy mechanics, 5 phases, endless mode |
| 10 | Boss Abilities | **Done** | 10 unique boss abilities, stun/aura/shield/spawn, 26 tests |
| 11 | Tutorial + Encyclopedia + Wave Preview | **Done** | 8-step tutorial, encyclopedia browser, sprite wave preview, 10 tests |
| 12 | Polish, Bug Fixes & Gameplay Improvements | Planned | 18 items across 4 sub-sprints (A-D): critical bugs, UI/UX polish, gameplay, content |
| 13 | Audio + Sprites + Save Export | Planned | Background music, sprite sheets, save export/import |
| 14 | Polish & Cleanup | Planned | Drag-drop merge, HUD refactor, UI components, object pooling, new enemies, DNA digivolution |
| 15 | Map Expansion | Planned | Larger/alternative maps, new path layouts |
| 16 | Public Release Prep | Planned | Credits, disclaimer, branding, final polish |

### Test Inventory (453 tests, 18 files)

| Test File | Tests |
|-----------|-------|
| AttributeSystem | 20 |
| TargetingSystem | 13 |
| DPSystem | 19 |
| LevelSystem | 49 |
| MergeSystem | 17 |
| OriginSystem | 34 |
| StatusEffects | 73 |
| BossAbilitySystem | 26 |
| GridUtils | 16 |
| Constants | 31 |
| DigimonDatabase | 15 |
| EvolutionPaths | 22 |
| WaveData | 22 |
| GameStateManager | 52 |
| SaveManager | 16 |
| SpawnMenu | 18 |
| TutorialOverlay | 4 |
| EncyclopediaScene | 6 |

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
- [x] 18 test files, 453 tests total

### Actual Test File Structure
```
tests/
├── setup.ts                       # Phaser mocks
├── systems/
│   ├── AttributeSystem.test.ts    # 20 tests
│   ├── BossAbilitySystem.test.ts  # 26 tests
│   ├── DPSystem.test.ts           # 19 tests
│   ├── LevelSystem.test.ts        # 49 tests
│   ├── MergeSystem.test.ts        # 17 tests
│   ├── OriginSystem.test.ts       # 34 tests
│   ├── StatusEffects.test.ts      # 73 tests
│   └── TargetingSystem.test.ts    # 13 tests
├── data/
│   ├── DigimonDatabase.test.ts    # 15 tests
│   ├── WaveData.test.ts           # 22 tests
│   └── EvolutionPaths.test.ts     # 22 tests
├── managers/
│   ├── GameStateManager.test.ts   # 52 tests
│   └── SaveManager.test.ts        # 16 tests
├── scenes/
│   └── EncyclopediaScene.test.ts  # 6 tests
├── ui/
│   ├── SpawnMenu.test.ts          # 18 tests
│   └── TutorialOverlay.test.ts    # 4 tests
└── utils/
    ├── Constants.test.ts          # 31 tests
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
- [x] Special boss abilities — implemented in Sprint 10 (BossAbilitySystem.ts)

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

## Gameplay Enhancements - **DONE**

**Goal:** Implement gameplay balance features and UX improvements from the Remaining Work list.

### Completed Enhancements

| Enhancement | Files Modified | Tests Added |
|-------------|---------------|-------------|
| **Stage-based level-up costs** | Constants.ts, LevelSystem.ts, TowerInfoPanel.ts | +8 LevelSystem, +3 Constants |
| **Status effects system** | StatusEffects.ts, Enemy.ts, CombatManager.ts, Projectile.ts | +56 (new StatusEffects.test.ts) |
| **Tower skills display** | TowerInfoPanel.ts | — (visual) |
| **Floating damage numbers** | EventBus.ts, Projectile.ts, GameScene.ts | — (visual) |
| **Health bar toggle** | Enemy.ts, SettingsScene.ts, GameTypes.ts | — (visual) |
| **Wave preview** | GameScene.ts | — (visual) |
| **Damage number toggle** | SettingsScene.ts, GameTypes.ts, SaveManager.ts | — (visual) |

### Key Implementation Details

- **Level-up cost formula**: `Math.ceil(3 * level * stageMultiplier)` where multiplier ranges from ×1 (In-Training) to ×5 (Ultra)
- **Status effects**: 6 effects with runtime configs (burn/poison DoT, slow/freeze/stun CC, armorBreak debuff)
- **Effect proc**: CombatManager rolls `tower.stats.effectChance`, Projectile carries effect and applies on hit via `Enemy.applyEffect()`
- **Damage numbers**: Emitted via `DAMAGE_DEALT` event from Projectile.hit(), displayed by GameScene with color-coding (green=super effective, red=resisted)
- **Settings toggles**: Stored in Phaser Registry (`showDamageNumbers`, `healthBarMode`), persisted via SaveManager

---

## Remaining Work Summary

### High Priority — COMPLETED

| Item | Section | Status |
|------|---------|--------|
| Settings should NOT pause game | 9.1 | **Done** |
| Lower default SFX volume | 9.2 | **Done** |
| Lv MAX should level up to affordable level | 9.3 | **Done** |
| Regen enemy mechanic | 9.4 | **Done** |
| Shielded enemy mechanic | 9.5 | **Done** |
| Splitter enemy mechanic | 9.6 | **Done** |

### Content Expansion — COMPLETED

| Item | Section | Status |
|------|---------|--------|
| Phase 2: Waves 21-40 (Champion) | 9.7 | **Done** |
| Phase 3: Waves 41-60 (Ultimate) | 9.8 | **Done** |
| Phase 4: Waves 61-80 (Mega) | 9.9 | **Done** |
| Phase 5: Waves 81-100 + Endless | 9.10 | **Done** |

### Nice-to-Have Improvements

| Item | Priority | Notes |
|------|----------|-------|
| Drag-and-drop merge | Medium | Alternative to modal-based merge |
| Object pooling | Medium | Performance optimization for later phases |
| Tutorial system | Medium | New player onboarding |
| Separate HUD.ts | Low | Refactor from GameScene inline code |
| UIManager.ts | Low | Centralized UI state management |
| Reusable UI components | Low | Reduce code duplication across panels |
| Visual merge effect | Low | Particle/tween on merge |
| Panel show/hide animations | Low | Smooth transitions |
| Placement confirmation/cancel | Low | Currently places immediately |

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
2. All unit tests pass (`npm run test`) - **368 passing**
3. Code compiles without errors (`npm run build`) - **Clean**
4. No console errors during gameplay - **Not yet verified (needs playtest)**
5. Feature works in Chrome and Firefox - **Not yet verified (needs playtest)**
6. Code is committed with descriptive messages - **Git not yet initialized**

---

## Next Phase: Bug Fixes, Enemy Mechanics & Content Expansion

### Priority 1: Bug Fixes & UX Improvements

#### 9.1 Settings should NOT pause the game
- [ ] SettingsScene currently pauses GameScene on open (`scene.pause('GameScene')`)
- [ ] Change to overlay-only: launch SettingsScene alongside GameScene without pausing
- [ ] Game continues running in the background while settings are open
- [ ] Resume button becomes just "Close" since game isn't paused
- **Files:** `GameScene.ts` (settings launch), `SettingsScene.ts` (remove pause/resume calls)

#### 9.2 Lower default SFX volume
- [ ] Current default volume is `0.15` (15%) — still too loud
- [ ] Reduce default to `0.05` (5%) or lower
- [ ] Consider per-SFX volume multipliers for particularly loud effects (e.g., attack sounds that play rapidly)
- **Files:** `AudioManager.ts` (default volume)

#### 9.3 Lv MAX should level up as far as current DigiBytes allow
- [ ] Current behavior: Lv MAX tries to reach absolute max level, fails silently if can't afford
- [ ] New behavior: Calculate the highest affordable level given current DigiBytes and level up to that
- [ ] Binary search or iterative approach: find highest level where `getTotalLevelUpCost(current, target, stage) <= currentDigiBytes`
- [ ] If already at max affordable level, show disabled state or "insufficient funds" feedback
- [ ] Also apply same logic to Lv +5 button (level up as many as affordable up to +5)
- **Files:** `TowerInfoPanel.ts` (`onLevelUpMulti`), possibly `LevelSystem.ts` (add `getMaxAffordableLevel` helper)
- **Tests:** Add tests for `getMaxAffordableLevel` in `LevelSystem.test.ts`

### Priority 2: Missing Enemy Type Mechanics

#### 9.4 Regen enemy mechanic
- [ ] Add passive HP regeneration to `regen` type enemies
- [ ] Heal rate: 2% max HP per second (as per ENEMY_SPAWN_DESIGN.md)
- [ ] Apply regeneration in `Enemy.update()` tick
- [ ] Cap healing at maxHP
- [ ] Poison status effect should suppress or reduce regeneration
- [ ] Visual indicator: green heal tick numbers or subtle green pulse
- [ ] Add Floramon to wave rotation (already in DB but not spawned)
- **Files:** `Enemy.ts` (update loop), `StatusEffects.ts` (poison vs regen interaction)
- **Tests:** Add regen tests in new or existing test file

#### 9.5 Shielded enemy mechanic
- [ ] Shielded enemies have 60% armor (as per ENEMY_SPAWN_DESIGN.md)
- [ ] Armor Break status effect is the primary counter (already implemented, reduces armor 50%)
- [ ] Add shielded enemies to DigimonDatabase: Centarumon (Champion), Andromon (Ultimate)
- [ ] Visual indicator: shield icon or blue tint overlay on shielded enemies
- [ ] Shielded enemies appear starting Wave 33 (Phase 2)
- **Files:** `DigimonDatabase.ts` (new entries), `Enemy.ts` (visual indicator), `WaveData.ts` (wave compositions)
- **Tests:** Verify armor + ArmorBreak interaction works for high-armor enemies

#### 9.6 Splitter enemy mechanic
- [ ] On death, splitter enemies spawn 2 smaller copies (or 4 for Diaboromon)
- [ ] Split copies have reduced HP (50% of original), same speed, no further splitting
- [ ] Splits spawn at the parent's current path position and continue from there
- [ ] WaveManager/GameScene needs to handle dynamically spawned enemies mid-wave
- [ ] Wave completion must account for split children (wave not done until all splits dead)
- [ ] Add splitter enemies to DigimonDatabase: Mamemon (Ultimate), MetalMamemon (Ultimate), Diaboromon (Mega)
- [ ] Splitters first appear in Wave 46 (Phase 3)
- **Files:** `Enemy.ts` (onDeath split logic), `WaveManager.ts` (track split children), `DigimonDatabase.ts` (new entries), `GameScene.ts` (spawn split enemies)
- **Tests:** Split spawning, wave completion with splits, HP reduction on splits

### Priority 3: Content Expansion (Phases 2-5)

#### 9.7 Phase 2 — Waves 21-40 (Champion tier) ✅
- [x] Added 18 Champion-tier enemies to DigimonDatabase (Guardromon for shielded, skip Centarumon/Wizardmon — no sprites)
- [x] Defined wave compositions for waves 21-40 in WaveData.ts
- [x] Boss waves: Devimon (wave 30), Myotismon (wave 40)
- [x] Regen enemies in wave 32 (Togemon), Shielded enemies in wave 33 (Guardromon, Monochromon)
- [x] HP scaling via waveScaling multiplier

#### 9.8 Phase 3 — Waves 41-60 (Ultimate tier) ✅
- [x] Added 13 Ultimate-tier enemies (standard, tank, speedster, flying, regen)
- [x] Defined wave compositions for waves 41-60
- [x] Boss waves: SkullGreymon (wave 50), VenomMyotismon (wave 60)
- [x] Splitter wave at wave 46 (Mamemon x13), MetalMamemon in later waves
- [x] MegaKabuterimon uses Japanese sprite name AtlurKabuterimon_Blue.png

#### 9.9 Phase 4 — Waves 61-80 (Mega tier) ✅
- [x] Added 16 Mega-tier enemies (3 standard, 6 tank, 3 speedster, 3 flying) + 5 Ultra preview enemies
- [x] Defined wave compositions for waves 61-80
- [x] Boss waves: Machinedramon (wave 70), Omegamon (wave 80)
- [x] Diaboromon splitter wave at wave 66 (splits into 4)
- [x] Japanese sprite names: Piemon, Pinochimon, Mugendramon, Hououmon, HerakleKabuterimon, Armagemon, Millenniumon

#### 9.10 Phase 5 — Waves 81-100 (Mega/Ultra tier) + Endless ✅
- [x] Defined wave compositions for waves 81-100 using Ultra enemies
- [x] Boss waves: Omegamon Zwart (wave 90), Apocalymon (wave 100, final boss with 200k HP)
- [x] Endless mode: generateEndlessWave() + getWaveConfig() for dynamic wave generation
- [x] Endless scaling: 1.05^(wave-100) HP multiplier, spawn interval min 300ms, enemy count caps at 100
- [x] Boss every 10 waves in endless (rotating pool of 5 bosses)
- [x] WaveManager updated to use getWaveConfig(), separate scaling logic for endless

### Implementation Order

| Step | Task | Priority | Depends On |
|------|------|----------|------------|
| 1 | Settings non-pausing (9.1) | High | — |
| 2 | Lower SFX volume (9.2) | High | — |
| 3 | Lv MAX affordable fix (9.3) | High | — |
| 4 | Regen mechanic (9.4) | Medium | — |
| 5 | Shielded mechanic (9.5) | Medium | — |
| 6 | Splitter mechanic (9.6) | Medium | — |
| 7 | Phase 2 waves (9.7) | Medium | 9.4, 9.5 |
| 8 | Phase 3 waves (9.8) | Medium | 9.6, 9.7 |
| 9 | Phase 4 waves (9.9) | Low | 9.8 |
| 10 | Phase 5 + Endless (9.10) | Low | 9.9 |

---

---

## Sprint 10: Boss Abilities

**Goal:** Give each boss unique abilities that make them distinct threats beyond being stat-sticks.

### Tasks

#### 10.1 Boss Ability System
- [x] Add `bossAbility?: BossAbility` field to `EnemyStats` interface
- [x] Define `BossAbility` type with ability ID, cooldown, parameters
- [x] Create `src/systems/BossAbilitySystem.ts` for ability execution logic
- [x] Integrate ability tick into `Enemy.update()` for boss entities
- [x] Visual indicators when boss activates ability (flash, text popup)
- **Files:** `DigimonTypes.ts`, `Enemy.ts`, `BossAbilitySystem.ts`, `DigimonDatabase.ts`

#### 10.2 Boss Ability Definitions
- [x] **Greymon (Wave 10)**: *Nova Blast* — AoE fire burst that temporarily disables (stuns) the nearest tower for 2s. Cooldown: 8s
- [x] **Greymon Evolved (Wave 20)**: *Mega Flame* — Speeds up all nearby enemies by 30% for 3s. Cooldown: 10s
- [x] **Devimon (Wave 30)**: *Death Claw* — Drains 5 DigiBytes per second while alive (aura). Passive
- [x] **Myotismon (Wave 40)**: *Crimson Lightning* — Heals self for 10% max HP every 12s. Cooldown: 12s
- [x] **SkullGreymon (Wave 50)**: *Ground Zero* — At 50% HP, destroys all active projectiles on screen. One-time trigger
- [x] **VenomMyotismon (Wave 60)**: *Venom Infuse* — Spawns 3 swarm minions every 15s. Cooldown: 15s
- [x] **Machinedramon (Wave 70)**: *Infinity Cannon* — Reduces all tower ranges by 20% while alive. Passive aura
- [x] **Omegamon (Wave 80)**: *Transcendent Sword* — Grants self 50% damage reduction shield for 4s every 20s. Cooldown: 20s
- [x] **Omegamon Zwart (Wave 90)**: *Garuru Cannon* — Freezes the 3 highest-DPS towers for 3s every 15s. Cooldown: 15s
- [x] **Apocalymon (Wave 100)**: *Total Annihilation* — At 25% HP, resets all tower attack cooldowns and stuns all towers for 2s. One-time trigger
- **Files:** `DigimonDatabase.ts` (boss entries), `BossAbilitySystem.ts`

#### 10.3 Boss Ability UI
- [x] Show boss ability name + description in boss health bar area
- [x] Ability cooldown indicator (circular progress or timer text)
- [x] Screen flash/shake on powerful abilities (Apocalymon, SkullGreymon)
- [x] Affected towers show visual feedback when stunned/debuffed (red tint, "!" icon)
- **Files:** `GameScene.ts` (boss HUD), `Tower.ts` (debuff visuals)

#### 10.4 Boss Ability Tests
- [x] Unit tests for ability cooldowns and triggers
- [x] Tests for passive aura effects (range reduction, DB drain)
- [x] Tests for one-time triggers (HP threshold checks)
- [x] Tests for minion spawning (VenomMyotismon)
- **Files:** `tests/systems/BossAbilitySystem.test.ts` (26 tests)

### Sprint 10 Acceptance Criteria
- [x] Each of the 10 bosses has a unique ability
- [x] Abilities activate on correct timers/triggers
- [x] Visual feedback clearly communicates what the boss is doing
- [x] Tower debuffs (stun, range reduction) work correctly and expire
- [x] All unit tests pass
- [x] Bosses feel like meaningful threats, not just HP sponges

---

## Sprint 11: Tutorial, Encyclopedia & Wave Preview Enhancement

**Goal:** Improve new player onboarding, add a Digimon reference browser, and enhance the wave preview with visual enemy information.

### Tasks

#### 11.1 Tutorial System
- [x] Create `src/ui/TutorialOverlay.ts` — step-based tutorial overlay
- [x] Tutorial triggers on first game start (check LocalStorage flag `digimerge_td_tutorial_complete`)
- [x] Step-based progression with highlight zones and instruction text
- [x] Tutorial steps:
  1. "Welcome to DigiMerge TD! Enemies follow the path — defend your base!"
  2. "Tap a green slot to place your starter Digimon" (highlight empty slots)
  3. "Enemies are coming! Your Digimon attacks automatically" (start wave 1)
  4. "Earn DigiBytes by defeating enemies. Use them to level up!" (highlight tower info panel)
  5. "Open the Spawn Menu to deploy more Digimon" (highlight spawn button)
  6. "Merge same-attribute Digimon to gain DP for Digivolution!" (show merge button)
  7. "At max level, Digivolve to evolve into a stronger form!" (show digivolve concept)
  8. "Good luck, Tamer! The Digital World is counting on you!"
- [x] Skip button available at all times
- [x] Dim/darken areas outside the highlight zone
- [x] Arrow/pointer indicators toward highlighted elements
- **Files:** `TutorialOverlay.ts`, `GameScene.ts` (tutorial launch)

#### 11.2 Encyclopedia / Digimon Browser
- [x] Create `src/scenes/EncyclopediaScene.ts` — browsable Digimon catalog
- [x] Accessible from MainMenuScene (new "Encyclopedia" button)
- [x] Grid display of all Digimon sprites (towers + enemies)
- [x] Filter tabs: By Type (All/Towers/Enemies) and By Stage (All/In-Training → Ultra)
- [x] Detail panel on selection:
  - Sprite (large, 4x scaled)
  - Name, Stage, Attribute
  - Stats (tower: damage/speed/range, enemy: HP/speed/armor)
  - Boss ability info (if applicable)
- [x] Back button to return to MainMenuScene
- [x] Pagination (6x4 grid, 24 items per page)
- **Files:** `EncyclopediaScene.ts`, `MainMenuScene.ts` (button), `GameConfig.ts` (scene registration)

#### 11.3 Wave Preview Enhancement
- [x] Replace text-only wave preview with visual enemy list
- [x] Each enemy entry shows: small sprite (1.5x scale) + name + count + type icon
- [x] Enemy type indicators: colored tags for swarm/tank/speedster/flying/regen/shielded/splitter
- [x] Boss entries highlighted with boss ability name shown
- **Files:** `GameScene.ts` (wave preview section)

#### 11.4 Tests
- [x] Tutorial step progression tests (completion flag, reset, step count)
- [x] Encyclopedia data validation tests (tower/enemy counts, required fields, boss abilities, filtering)
- **Files:** `tests/ui/TutorialOverlay.test.ts` (4 tests), `tests/scenes/EncyclopediaScene.test.ts` (6 tests)

### Sprint 11 Acceptance Criteria
- [x] First-time players see tutorial overlay guiding them through basics
- [x] Tutorial can be skipped and doesn't replay after completion
- [x] Encyclopedia shows all Digimon with filtering and detail view
- [x] Wave preview shows enemy sprites alongside names and special abilities
- [x] All unit tests pass

---

## Sprint 12: Polish, Bug Fixes & Gameplay Improvements

**Goal:** Address 18 issues discovered during playtesting — critical bugs, UI/UX polish, gameplay improvements, and content expansion.

### Sprint 12A — Critical Bug Fixes

#### A1: Game Over Freeze (Registry Mismatch)
- [ ] Game freezes on Game Over — likely registry key mismatch between GameScene and GameOverScene
- [ ] Investigate which registry keys GameOverScene reads vs what GameScene writes
- [ ] Ensure `gameResult`, `finalWave`, `finalDigibytes` (or equivalent) are set before scene transition
- [ ] Test: Game Over from losing all lives, Game Over from victory (wave 100)
- **Files:** `GameScene.ts`, `GameOverScene.ts`

#### A2: Continue Button Wave/Lives Issue
- [ ] Continue button starts game at wrong wave or with wrong lives count
- [ ] Investigate SaveManager.load() → GameScene.loadSavedGame() data flow
- [ ] Verify wave number, lives, and DigiBytes are all restored correctly
- [ ] Test: Save mid-game, return to main menu, hit Continue — should restore exact state
- **Files:** `SaveManager.ts`, `GameScene.ts`, `MainMenuScene.ts`

#### A3: TowerInfoPanel Buttons Not Updating When DB Changes
- [ ] Level Up / Digivolve / Merge buttons don't reflect current DigiBytes in real-time
- [ ] Buttons should update enabled/disabled state when DigiBytes change (enemy kills, spending)
- [ ] Listen to `DIGIBYTES_CHANGED` event to refresh button states
- [ ] Test: Select tower, earn DigiBytes from kills, verify buttons update without re-selecting
- **Files:** `TowerInfoPanel.ts`, `EventBus.ts`

### Sprint 12B — UI/UX Polish

#### B1: Starter Selection — Pick Exactly 1
- [ ] StarterSelectScene currently allows selecting up to 4 starters
- [ ] Change to pick exactly 1 starter (simpler for new players, cleaner UX)
- [ ] Update grid layout and selection logic for single selection
- [ ] Confirm button enabled only when exactly 1 is selected
- **Files:** `StarterSelectScene.ts`

#### B2: Digimon Font Integration (Pixel Digivolve)
- [ ] Integrate "Pixel Digivolve" font (or similar thematic pixel font)
- [ ] Add font file to `public/assets/fonts/`
- [ ] Load via CSS @font-face or Phaser WebFont loader
- [ ] Apply to game title, stage names, boss announcements, and major UI headings
- [ ] Keep readable system font for small text (stats, tooltips)
- **Files:** `PreloadScene.ts` or `index.html`, `UITheme.ts`, `MainMenuScene.ts`, various UI files

#### B3: Starter Scene Text Blocking
- [ ] Text in StarterSelectScene overlaps or blocks interactive elements
- [ ] Review layout: ensure starter name, attribute, and description text doesn't cover sprites or buttons
- [ ] Adjust positioning, font sizes, or add text truncation as needed
- **Files:** `StarterSelectScene.ts`

#### B4: Hide "Standard" Label (Verify Only)
- [ ] In spawn menu, enemy type labels may show "Standard" unnecessarily
- [ ] Verify if "Standard" label appears where it shouldn't
- [ ] If visible and redundant, hide it; if already hidden, mark as done
- **Files:** `SpawnMenu.ts` or `GameScene.ts` (wave preview)

#### B5: Boss Ability Details Visibility
- [ ] Boss ability text (name + description) in boss health bar area may be too small or obscured
- [ ] Increase font size, add background panel behind text, or reposition for clarity
- [ ] Ensure ability cooldown/trigger info is readable during gameplay
- **Files:** `GameScene.ts` (boss HUD section)

#### B6: Encyclopedia Raw Skill Names
- [ ] Encyclopedia shows raw effect IDs (e.g., "burn_aoe", "slow") instead of friendly display names
- [ ] Create a mapping from effect IDs to display names (e.g., "burn_aoe" → "Fire Burst", "slow" → "Slow")
- [ ] Apply formatting in Encyclopedia detail panel
- **Files:** `EncyclopediaScene.ts`, possibly `StatusEffects.ts` or new mapping constant

#### B7: Encyclopedia Evolution Chains
- [ ] Encyclopedia detail view doesn't show the Digimon's evolution chain
- [ ] Add evolution chain display: show previous and next evolutions with sprites
- [ ] Clickable evolution chain entries to navigate between related Digimon
- **Files:** `EncyclopediaScene.ts`, `EvolutionPaths.ts` (lookup helpers)

#### B8: Encyclopedia — Hide Enemies, Show Towers Only
- [ ] Encyclopedia currently shows both towers and enemies
- [ ] Default to showing only tower Digimon (player-relevant information)
- [ ] Optionally keep enemies accessible via a filter toggle, but towers should be the primary view
- **Files:** `EncyclopediaScene.ts`

#### B9: Boss Sprites Aura
- [ ] Boss enemies on the map lack visual distinction from regular enemies
- [ ] Add a colored aura/glow effect around boss sprites (pulsing or static)
- [ ] Use red or gold aura to clearly mark bosses during gameplay
- **Files:** `Enemy.ts` or `GameScene.ts` (boss visual setup)

### Sprint 12C — Gameplay Improvements

#### C1: Wave Enemy Type Limits
- [ ] Some waves have too many different enemy types, making them visually chaotic
- [ ] Limit each wave to max 5 different enemy types
- [ ] Ensure each enemy type in a wave has at least 5 units (avoid 1-2 unit filler types)
- [ ] Audit WaveData.ts for waves violating these constraints and adjust compositions
- **Files:** `WaveData.ts`

#### C2: Game Continues When Window Unfocused
- [ ] Game should pause or maintain consistent timing when browser tab loses focus
- [ ] Investigate Phaser's `visibilityChange` event or `game.events.on('blur')`
- [ ] Either auto-pause on blur, or cap delta time to prevent enemy teleportation on refocus
- **Files:** `GameScene.ts` or `main.ts` (Phaser config)

#### C3: Improved Projectile Particles
- [ ] Current projectiles are simple colored circles with basic trails
- [ ] Add particle emitter effects: small trailing particles that match attribute color
- [ ] Consider different particle shapes per attribute (sparks for Vaccine, orbs for Data, etc.)
- **Files:** `Projectile.ts`, `CombatManager.ts`

#### C4: Hit Particles Per Attack Effect
- [ ] On-hit effects (burn, poison, slow, etc.) lack distinctive visual feedback
- [ ] Add per-effect hit particles: orange burst for burn, green cloud for poison, blue crystals for freeze, etc.
- [ ] Trigger particle effect at enemy position when status effect is applied
- **Files:** `Enemy.ts` or `CombatManager.ts`, `Projectile.ts`

#### C5: Multi-Hit Visual
- [ ] Multi-hit towers fire multiple projectiles but they all look identical
- [ ] Add slight spread or stagger to multi-hit projectiles for visual clarity
- [ ] Consider rapid-fire animation or burst pattern
- **Files:** `CombatManager.ts`, `Projectile.ts`

### Sprint 12D — Content Expansion

#### D1: Enemy Digimon as Towers (~40 New Tower Entries)
- [ ] Many enemy-only Digimon could be used as towers to expand player options
- [ ] Identify ~40 enemy Digimon with existing sprites that can be repurposed as tower Digimon
- [ ] Add tower stats (damage, speed, range, effect) based on their enemy stats and stage
- [ ] Create evolution paths connecting them to existing lines or as standalone lines
- [ ] Add to SpawnMenu if they're new starter-tier Digimon
- [ ] Update tests for new database entries
- **Files:** `DigimonDatabase.ts`, `EvolutionPaths.ts`, `PreloadScene.ts`, `SpawnMenu.ts`

### Sprint 12 Acceptance Criteria
- [ ] Game Over screen works correctly (no freeze)
- [ ] Continue button restores exact game state
- [ ] TowerInfoPanel buttons update in real-time with DigiBytes changes
- [ ] Starter selection picks exactly 1 Digimon
- [ ] Boss sprites have visible aura effects
- [ ] Encyclopedia shows friendly skill names and evolution chains
- [ ] Wave compositions limited to max 5 types with min 5 each
- [ ] Projectile and hit particles add visual fidelity
- [ ] All unit tests pass

---

## Sprint 13: Audio, Sprite Sheets & Save Export

**Goal:** Add background music, optimize sprite rendering with sprite sheets, and allow save file export/import.

### Tasks

#### 13.1 Background Music
- [ ] Source or create looping background tracks:
  - Main Menu theme (calm, digital ambient)
  - Gameplay theme (upbeat, action)
  - Boss theme (intense, dramatic — plays during boss waves)
  - Game Over theme (somber, short)
  - Victory theme (triumphant, short)
- [ ] Add music files to `public/assets/music/`
- [ ] Extend `AudioManager.ts` with music playback (separate volume from SFX)
- [ ] Music volume slider in SettingsScene (independent from SFX volume)
- [ ] Music mute toggle
- [ ] Smooth crossfade between tracks (e.g., gameplay → boss theme)
- [ ] Music persists across scene transitions (don't restart on scene change)
- [ ] Save music volume/mute preference in SaveManager
- **Files:** `AudioManager.ts`, `SettingsScene.ts`, `GameScene.ts`, `MainMenuScene.ts`, `GameOverScene.ts`, `SaveManager.ts`

#### 13.2 Sprite Sheet Implementation
- [ ] Create texture atlases from individual sprite PNGs for performance
  - Group by category: tower sprites, enemy sprites, UI elements
  - Use Phaser's multi-atlas or spritesheet format
- [ ] Build script or Phaser atlas packer to generate atlas JSON + PNG
- [ ] Update `PreloadScene.ts` to load atlases instead of individual images
- [ ] Update all sprite references (Tower.ts, Enemy.ts, TowerInfoPanel.ts, etc.) to use atlas frames
- [ ] Verify all ~149 sprites render correctly from atlases
- [ ] Measure performance improvement (draw call reduction)
- **Files:** `PreloadScene.ts`, `Tower.ts`, `Enemy.ts`, build scripts, atlas configs

#### 13.3 Save File Export/Import
- [ ] Add "Export Save" button in SettingsScene
  - Serializes current save data to JSON
  - Triggers browser file download (`DigiMerge_TD_save.json`)
- [ ] Add "Import Save" button in SettingsScene
  - Opens file picker for JSON files
  - Validates save data structure and version
  - Confirmation dialog before overwriting current save
  - Reloads game state from imported data
- [ ] Export/import uses same format as LocalStorage save
- [ ] Error handling for invalid/corrupted import files
- [ ] Add save file version migration support (for future compatibility)
- **Files:** `SaveManager.ts` (export/import methods), `SettingsScene.ts` (buttons), `MainMenuScene.ts` (import option)

#### 13.4 Tests
- [ ] Music playback state tests (play, pause, crossfade, volume)
- [ ] Atlas frame lookup tests (verify sprite names resolve correctly)
- [ ] Save export serialization tests
- [ ] Save import validation tests (valid, corrupted, wrong version)
- **Files:** `tests/managers/AudioManager.test.ts`, `tests/managers/SaveManager.test.ts` (extended)

### Sprint 13 Acceptance Criteria
- [ ] Background music plays during menu, gameplay, boss, and game over
- [ ] Music and SFX volumes are independently controllable
- [ ] Sprite sheets load correctly and all sprites render from atlases
- [ ] Save files can be exported as JSON and re-imported successfully
- [ ] Invalid imports are rejected with user-friendly error messages
- [ ] All unit tests pass

---

## Sprint 14: Remaining Polish & Cleanup

**Goal:** Address all remaining deferred items, refactoring, and polish.

### Tasks

#### 14.1 Drag-and-Drop Merge (Alternative UX)
- [ ] Enable dragging a tower onto another tower to initiate merge
- [ ] Visual drag indicator (tower follows pointer with transparency)
- [ ] Valid drop targets highlight (same attribute + stage)
- [ ] Invalid drop shows red X feedback
- [ ] Drop on valid target opens MergeModal (same as button-based flow)
- [ ] Cancel drag on right-click or ESC
- **Files:** `Tower.ts` (drag events), `TowerManager.ts`, `GameScene.ts`

#### 14.2 Visual Merge Effect
- [ ] Particle burst on successful merge (attribute-colored particles)
- [ ] Surviving tower glow/pulse animation after merge
- [ ] Sacrificed tower fade + shrink tween toward survivor
- **Files:** `GameScene.ts`, `TowerManager.ts`

#### 14.3 Placement Confirmation & Cancel
- [ ] After selecting a Digimon to spawn, enter placement mode
- [ ] Ghost preview follows pointer (already exists)
- [ ] Left-click confirms placement
- [ ] Right-click or ESC cancels placement (refunds cost)
- [ ] Visual feedback for cancel (red flash on ghost)
- **Files:** `GameScene.ts`, `SpawnMenu.ts`

#### 14.4 HUD Refactor
- [ ] Extract HUD creation from `GameScene.createHUD()` into `src/ui/HUD.ts`
- [ ] HUD class manages: lives, DigiBytes, wave counter, speed buttons, pause/settings buttons
- [ ] HUD exposes update methods called from GameScene
- [ ] Reduce GameScene line count
- **Files:** `HUD.ts` (new), `GameScene.ts` (delegate to HUD)

#### 14.5 Reusable UI Components
- [ ] `src/ui/components/Button.ts` — configurable button (label, colors, callbacks, hover/press states)
- [ ] `src/ui/components/Panel.ts` — background panel with border, title, close button
- [ ] `src/ui/components/ProgressBar.ts` — configurable bar (health, loading, XP)
- [ ] `src/ui/components/Tooltip.ts` — hover tooltip with arrow positioning
- [ ] Refactor existing panels to use shared components where practical
- **Files:** `src/ui/components/*.ts`, existing UI files

#### 14.6 UIManager
- [ ] Create `src/managers/UIManager.ts`
- [ ] Centralized panel visibility coordination (only one modal open at a time)
- [ ] UI state machine: idle, tower_selected, merge_mode, modal_open, placement_mode
- [ ] Route UI events through UIManager instead of direct EventBus
- **Files:** `UIManager.ts`, `GameScene.ts`, existing UI files

#### 14.7 Panel Animations
- [ ] Smooth slide-in/fade-in for TowerInfoPanel, SpawnMenu
- [ ] Modal scale-up entrance for EvolutionModal, MergeModal
- [ ] Panel slide-out on close
- **Files:** `TowerInfoPanel.ts`, `SpawnMenu.ts`, `EvolutionModal.ts`, `MergeModal.ts`

#### 14.8 Object Pooling
- [ ] Implement object pool for Projectiles (reuse instead of create/destroy)
- [ ] Implement object pool for Enemies (reuse instead of create/destroy)
- [ ] Pool manager with `get()`, `release()`, `preload()` methods
- [ ] Measure performance improvement on high-enemy waves (50+)
- **Files:** `src/utils/ObjectPool.ts` (new), `CombatManager.ts`, `WaveManager.ts`, `GameScene.ts`

#### 14.9 New Enemies (Phase 10 Remaining)
- [ ] Add ~60 new enemy Digimon to `DigimonDatabase.ts` (see Phase 10 enemy lists)
  - 12 Rookie enemies
  - 12 Champion enemies
  - 15 Ultimate enemies
  - 14 Mega enemies
  - 7 Ultra enemies
- [ ] Load new enemy sprites in `PreloadScene.ts`
- [ ] Integrate into wave rotations (`WaveData.ts` updates)
- [ ] Update wave generation for endless mode variety
- **Files:** `DigimonDatabase.ts`, `PreloadScene.ts`, `WaveData.ts`

#### 14.10 DNA Digivolution System
- [ ] Add DNA Digivolution as Ultra-tier evolution option
- [ ] Requires two specific Mega towers on the field simultaneously
- [ ] New UI for selecting DNA partners
- [ ] 8 DNA fusion targets (Omegamon, Imperialdramon PM, Gallantmon CM, etc.)
- [ ] Add DNA result entries to `DigimonDatabase.ts`
- [ ] Add DNA paths to `EvolutionPaths.ts`
- **Files:** `DigimonDatabase.ts`, `EvolutionPaths.ts`, `OriginSystem.ts`, `EvolutionModal.ts`, `PreloadScene.ts`

#### 14.11 Miscellaneous
- [ ] Debug grid lines toggle (dev mode)
- [ ] Mute/unmute toggle button in HUD (quick access)
- [ ] Comprehensive bug fix pass / playtesting
- **Files:** Various

### Sprint 14 Acceptance Criteria
- [ ] Drag-and-drop merge works alongside button-based merge
- [ ] Visual effects for merge and panel transitions
- [ ] HUD extracted into reusable class
- [ ] UI components reduce code duplication
- [ ] Object pooling improves performance on heavy waves
- [ ] New enemies add variety to all wave phases
- [ ] DNA Digivolution provides endgame evolution targets
- [ ] All unit tests pass
- [ ] Full playtesting pass completed

---

## Sprint 15: Map Expansion

**Goal:** Expand beyond the single 8x18 map with larger grids, new path layouts, and map selection.

### Tasks

#### 15.1 Map Data Architecture
- [ ] Create `src/data/MapData.ts` — defines multiple map configurations
- [ ] Map interface: `{ id, name, description, columns, rows, cellSize, pathWaypoints, spawn, base, towerSlots, difficulty }`
- [ ] Extract current map (8x18 serpentine) as "Classic" map
- [ ] Decouple grid constants from `Constants.ts` — make dynamic per map
- [ ] Update `GRID`, `PATH_WAYPOINTS`, `PATH_CELLS`, `isPathCell`, `isValidTowerSlot` to load from selected map
- **Files:** `MapData.ts` (new), `Constants.ts` (refactor to dynamic), `GridUtils.ts`

#### 15.2 New Maps
- [ ] **Map 2: "Wide Valley"** — 12x14 grid, wider with multiple branching paths, more tower slots (~120), shorter path but more enemies per wave
- [ ] **Map 3: "Gauntlet"** — 6x24 grid, narrow and tall, single long winding path (~80 waypoints), fewer tower slots (~60) but long kill corridor
- [ ] **Map 4: "Crossroads"** — 10x16 grid, two enemy spawn points converging to one base, requires split defense strategy
- [ ] Each map has its own difficulty rating (affects wave scaling)
- [ ] Each map has custom decoration placement
- **Files:** `MapData.ts`

#### 15.3 Map Select Scene
- [ ] Create `src/scenes/MapSelectScene.ts` — shown after StarterSelectScene
- [ ] Display map thumbnails with name, difficulty rating, grid size, tower slot count
- [ ] Preview shows miniature path layout
- [ ] Selected map stored in registry for GameScene to read
- [ ] Back button to StarterSelectScene
- **Files:** `MapSelectScene.ts` (new), `StarterSelectScene.ts` (transition), `GameConfig.ts` (register scene)

#### 15.4 GameScene Map Integration
- [ ] GameScene reads selected map from registry on create
- [ ] Dynamic grid rendering based on map dimensions
- [ ] Dynamic camera/viewport scaling for larger grids (zoom to fit or scrollable)
- [ ] Path rendering adapts to map waypoints
- [ ] Tower placement uses map-specific valid slots
- [ ] Enemy spawning uses map-specific spawn point(s)
- [ ] HUD repositions based on available screen space
- **Files:** `GameScene.ts`, `WaveManager.ts`, `CombatManager.ts`

#### 15.5 Multi-Spawn Support (Map 4)
- [ ] WaveManager supports multiple spawn points
- [ ] Enemies split between spawn points (alternating or configurable split ratio)
- [ ] Each spawn point has its own path to the base
- [ ] Base can receive enemies from multiple paths
- **Files:** `WaveManager.ts`, `Enemy.ts`, `MapData.ts`

#### 15.6 Save/Load Map Support
- [ ] Save data includes selected map ID
- [ ] Loading a save restores the correct map
- [ ] Map-specific high scores / statistics
- **Files:** `SaveManager.ts`, `GameTypes.ts`

#### 15.7 Tests
- [ ] Map data validation tests (all maps have valid paths, spawn, base)
- [ ] Dynamic grid utility tests for different map sizes
- [ ] Multi-spawn path tests
- [ ] Save/load with map ID tests
- **Files:** `tests/data/MapData.test.ts`, `tests/utils/GridUtils.test.ts` (extended)

### Sprint 15 Acceptance Criteria
- [ ] At least 3 playable maps with distinct layouts
- [ ] Map selection screen shows all maps with previews
- [ ] Game renders correctly on all map sizes
- [ ] Multi-spawn map works with enemies from multiple entry points
- [ ] Save/load preserves map selection
- [ ] All unit tests pass

---

## Sprint 16: Public Release Preparation

**Goal:** Prepare the game for public sharing with proper credits, legal disclaimers, and final presentation polish.

### Tasks

#### 16.1 Credits Scene
- [ ] Create `src/scenes/CreditsScene.ts` — scrollable credits display
- [ ] Accessible from MainMenuScene ("Credits" button)
- [ ] Credits content:
  - **Game**: "DigiMerge TD" title and version number
  - **Developer**: Your name/handle
  - **Framework**: "Built with Phaser 3" + link
  - **Sprites**: "Digimon sprite art from [source/artist credit]"
  - **Tiles**: "Sprout Lands asset pack by Cup Nooble" (or appropriate credit)
  - **Sound Effects**: Credit SFX source(s)
  - **Music**: Credit music source(s) (added in Sprint 12)
  - **Special Thanks**: Any contributors, testers, community
  - **Tools**: TypeScript, Vite, Vitest, Claude Code
- [ ] Auto-scrolling text with manual scroll support
- [ ] Back button to MainMenuScene
- **Files:** `CreditsScene.ts` (new), `MainMenuScene.ts` (button), `GameConfig.ts` (register scene)

#### 16.2 Disclaimer / Legal Notice
- [ ] Add disclaimer overlay or section (accessible from MainMenuScene or Credits)
- [ ] Disclaimer text:
  - "DigiMerge TD is a fan-made, non-commercial project"
  - "Digimon is a registered trademark of Bandai Namco Entertainment / Toei Animation"
  - "This game is not affiliated with, endorsed by, or connected to Bandai, Toei, or any official Digimon entity"
  - "All Digimon names, characters, and related elements are the property of their respective owners"
  - "This project is created for educational and entertainment purposes only"
  - "No copyright infringement is intended"
- [ ] Disclaimer shown on first launch (with "I Understand" button)
- [ ] Accessible later from Credits or MainMenu
- **Files:** `CreditsScene.ts` or `DisclaimerScene.ts`, `MainMenuScene.ts`

#### 16.3 Version & Branding
- [ ] Add version number display on MainMenuScene (e.g., "v1.0.0")
- [ ] Version sourced from `package.json` or a `VERSION` constant
- [ ] Finalize game title styling on MainMenuScene
- [ ] Add favicon if not already present
- [ ] Update `index.html` title and meta tags
- [ ] Update `README.md` with:
  - Game description and screenshots
  - How to play (controls, mechanics overview)
  - How to run locally (`npm install && npm run dev`)
  - Credits and acknowledgments
  - License information
- **Files:** `MainMenuScene.ts`, `index.html`, `README.md`, `package.json`

#### 16.4 Final Polish Pass
- [ ] Comprehensive playtesting across all 100 waves + endless
- [ ] Fix any visual glitches, overlapping UI, or broken interactions
- [ ] Verify all 21 starter lines evolve correctly through all stages
- [ ] Verify save/load works across all scenarios
- [ ] Test on Chrome, Firefox, Edge
- [ ] Test at different window sizes / responsive behavior
- [ ] Performance check on wave 80+ (high enemy counts)
- [ ] Ensure no console errors during normal gameplay

#### 16.5 Deployment Finalization
- [ ] Verify GitHub Pages deployment works correctly
- [ ] Confirm live URL loads and plays without issues
- [ ] Add Open Graph meta tags for link previews (title, description, image)
- [ ] Consider adding a simple analytics ping (optional, privacy-respecting)
- [ ] Create a release tag in git (v1.0.0)
- **Files:** `index.html`, `.github/workflows/deploy.yml`, git tags

### Sprint 16 Acceptance Criteria
- [ ] Credits scene lists all contributors and asset sources
- [ ] Disclaimer clearly states fan-made, non-commercial nature
- [ ] Version number visible on main menu
- [ ] README provides clear instructions for players and developers
- [ ] Game passes full playtesting with no critical bugs
- [ ] Live deployment works and is shareable
- [ ] The game is ready to share publicly with confidence

---

## Future Roadmap

### Post-Sprint 16 (if desired)
- Achievements / Leaderboards
- Advanced visual effects / particles
- Mobile touch optimization
- Difficulty modes (Easy / Normal / Hard)
- Challenge modes (limited towers, no merge, speed run)
- Community features (shared save codes)
- Localization (multi-language support)

---

## Phase 10: Roster Expansion

**Goal:** Expand the Digimon roster from ~105 to ~228 with new tower lines, enemies, and DNA Digivolution.

**Reference:** See `ROSTER_EXPANSION_PLAN.md` for full sprite availability analysis and name mappings.

### Tier 1 — High Priority Tower Lines (7 complete chains)

| # | Line | Attribute | Specialty | Stages |
|---|------|-----------|-----------|--------|
| 9 | Nyaromon → Plotmon → Tailmon → Angewomon → Ophanimon | Vaccine | Holy / Heal | Nyaromon.png → Plotmon.png → Tailmon.png → Angewomon.png → Ophanimon.png |
| 10 | Gummymon → Terriermon → Galgomon → Rapidmon → SaintGalgomon | Vaccine | Multi-hit / Pierce | Gummymon.png → Terriermon.png → Galgomon.png → Rapidmon.png → SaintGalgomon.png |
| 11 | Chocomon → Lopmon → Turuiemon → Andiramon → Cherubimon Virtue | Free | CC / Support | Chocomon.png → Lopmon.png → Turuiemon.png → Andiramon_Data.png → Cherubimon_Virtue.png |
| 12 | Pyocomon → Piyomon → Birdramon → Garudamon → Hououmon | Data | Fire / Flying | Pyocomon.png → Piyomon.png → Birdramon.png → Garudamon.png → Hououmon.png |
| 13 | Mochimon → Tentomon → Kabuterimon → AtlurKabuterimon → HerakleKabuterimon | Data | Electric / Pierce | Mochimon.png → Tentomon.png → Kabuterimon.png → AtlurKabuterimon_Blue.png → HerakleKabuterimon.png |
| 14 | Pukamon → Gomamon → Ikkakumon → Zudomon → Plesiomon | Vaccine | Ice / Tank | Pukamon.png → Gomamon.png → Ikkakumon.png → Zudomon.png → Plesiomon.png |
| 15 | Dorimon → DORUmon → DORUgamon → DORUguremon → Alphamon | Data | Pierce / Royal Knight | Dorimon.png → DORUmon.png → DORUgamon.png → DORUguremon.png → Alphamon.png |

### Tier 2 — Medium Priority Tower Lines (6 complete chains)

| # | Line | Attribute | Specialty | Stages |
|---|------|-----------|-----------|--------|
| 16 | Sunmon → Coronamon → Firamon → Flaremon → Apollomon | Vaccine | Fire / Burst | Sunmon.png → Coronamon.png → Firamon.png → Flaremon.png → Apollomon.png |
| 17 | Moonmon → Lunamon → Lekismon → Crescemon → Dianamon | Data | Ice / CC | Moonmon.png → Lunamon.png → Lekismon.png → Crescemon.png → Dianamon.png |
| 18 | Kyokyomon → Ryudamon → Ginryumon → Hisyaryumon → Ouryumon | Vaccine | Pierce / Armor Break | Kyokyomon.png → Ryudamon.png → Ginryumon.png → Hisyaryumon.png → Ouryumon.png |
| 19 | Puroromon → Funbeemon → Waspmon → Cannonbeemon → TigerVespamon | Free | Multi-hit / Speed | Puroromon.png → Funbeemon.png → Waspmon.png → Cannonbeemon.png → TigerVespamon.png |
| 20 | Budmon → Lalamon → Sunflowmon → Lilamon → Lotusmon | Data | Poison / Support | Budmon.png → Lalamon.png → Sunflowmon.png → Lilamon.png → Lotusmon.png |
| 21 | Caprimon → Hackmon → (sub TBD) → SaviorHackmon → Jesmon | Vaccine | Royal Knight | Caprimon.png → Hackmon.png → ? → SaviorHackmon.png → Jesmon.png |

### New Enemy Additions by Tier

**Rookie enemies** (12): Gomamon, Lopmon, Coronamon, Lunamon, Terriermon, Wormmon, Bearmon, Hagurumon, Armadimon, Keramon, Commandramon, Lucemon

**Champion enemies** (12): Tailmon, Wizarmon, Dobermon, Ikkakumon, Gekomon, Starmon, Tankmon, Soulmon, Shellmon, Dokugumon, V-dramon, GeoGreymon

**Ultimate enemies** (15): Etemon, Digitamamon, Knightmon, Phantomon, Pumpmon, Chimairamon, Cyberdramon, Triceramon, Monzaemon, MetalTyranomon, Dagomon, Mermaimon, Lucemon Falldown, Whamon, Orochimon

**Mega enemies** (14): Darkdramon, Craniummon, Titamon, Lilithmon, Barbamon, Duftmon, GrandisKuwagamon, KingEtemon, MetalEtemon, Ebemon, HiAndromon, Gankoomon, RustTyrannomon, Dinorexmon

**Ultra enemies** (7): Susanoomon, Lucemon Satan, Ogudomon, Chaosmon, Ordinemon, DarknessBagramon, Examon

### DNA Digivolution Targets

| Partner A | Partner B | Result | Sprite |
|-----------|-----------|--------|--------|
| WarGreymon | MetalGarurumon | Omegamon | Omegamon.png |
| Imperialdramon FM | — (high DP) | Imperialdramon PM | Imperialdramon_Paladin.png |
| Gallantmon | ChaosGallantmon | Gallantmon CM | Dukemon_X.png |
| Ophanimon | LadyDevimon | Mastemon | Mastemon.png |
| Alphamon | Ouryumon | Alphamon Ouryuken | Alphamon_Ouryuken.png |
| Seraphimon | Ophanimon | Susanoomon | Susanoomon.png |
| Rosemon | Lotusmon | Rafflesimon | Rafflesimon.png |
| Beelzemon | — (high DP) | Beelzemon BM | Beelzebumon_Blast.png |

### Implementation Order

1. **Tier 1 tower lines** (7 lines, ~35 new tower Digimon)
2. **Tier 2 tower lines** (6 lines, ~30 new tower Digimon)
3. **New enemies** (~60 new enemy Digimon across all tiers)
4. **DNA Digivolution system** (8 fusion targets)

### Per-Line Task Checklist

For each new tower line:
- [ ] Add all Digimon entries to `DigimonDatabase.ts` (towers section)
- [ ] Add evolution paths to `EvolutionPaths.ts`
- [ ] Add sprite loading to `PreloadScene.ts`
- [ ] Add to `SpawnMenu.ts` starter selection (if In-Training starter)
- [ ] Update `WaveData.ts` if enemies from the line exist
- [ ] Add tests for new database entries and evolution paths

### Missing Sprite Sheets

The following in-game Digimon have no sprite sheets available and may need substitutes:

| Digimon | Stage | Role | Notes |
|---------|-------|------|-------|
| Betamon | Rookie | Enemy | No sprite sheet |
| DarkTyrannomon | Champion | Enemy | Only _X variant |
| Goblimon | Rookie | Enemy | No sprite sheet |
| Unimon | Champion | Tower alt | No sprite sheet |
| Shakkoumon | Ultimate | Tower alt | No sprite sheet |

---

## Phase 11: Sprite Flipping

**Goal:** Flip enemy sprites horizontally based on movement direction for visual polish.

### Task

- [x] Enemy sprites flip based on horizontal movement direction
- Default sprite orientation faces **left**
- Moving right (dx > 0): `flipX = true`
- Moving left (dx < 0): `flipX = false`
- Vertical only (dx = 0): keep previous facing
- **File:** `src/entities/Enemy.ts` (update method, after position interpolation)

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
| viximon | Pokomon.png |
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
