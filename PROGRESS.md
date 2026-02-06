# DigiMerge TD - Implementation Progress

## Status: MVP + Gameplay Enhancements + QoL

All 8 sprints + post-MVP polish + gameplay enhancements + QoL enhancements done. 368 tests passing across 15 test files. TypeScript compiles clean. Vite build succeeds.
Live at: https://wandering-pork.github.io/DigiMerge-TD/

## Completed Sprints

### Sprint 1: Foundation
- [x] Project setup (Phaser 3 + TypeScript + Vite + Vitest)
- [x] Type definitions (Stage, Attribute, TargetPriority enums, all interfaces)
- [x] Constants (grid, costs, formulas, path waypoints)
- [x] EventBus + GameEvents
- [x] DigimonDatabase (40 tower Digimon + 16 enemy Digimon + 2 bosses)
- [x] WaveData (waves 1-20)
- [x] EvolutionPaths (8 starter lines with alternate paths)
- [x] All scenes (Boot, Preload, MainMenu, StarterSelect, Game, Pause, Settings, GameOver)
- [x] 65 sprite files loaded with corrected filenames
- [x] 17 SFX loaded

### Sprint 2: Entities
- [x] GridUtils (grid/pixel conversion, path positions)
- [x] Tower entity (sprite, level text, selection, range, combat calcs)
- [x] Enemy entity (path following, health bar, damage/death)
- [x] Projectile entity (homing, attribute colors, trail effect)
- [x] GameScene with entity containers and grid interaction

### Sprint 3: Game Loop
- [x] AttributeSystem (damage multipliers, advantage detection)
- [x] TargetingSystem (7 priority modes, range filtering)
- [x] WaveManager (spawn queue, wave scaling, completion detection)
- [x] CombatManager (tower targeting, projectile spawning)
- [x] Managers wired into GameScene update loop

### Sprint 4: Economy
- [x] GameStateManager (DigiBytes, lives, wave tracking, rewards)
- [x] LevelSystem (cost formulas, stat scaling, max level calc)
- [x] SpawnMenu UI (stage selection, Digimon picker, cost display)
- [x] Tower placement on grid slots

### Sprint 5: Evolution
- [x] DPSystem (merge DP calc, max level bonus)
- [x] OriginSystem (evolution caps, digivolve validation)
- [x] EvolutionModal UI (path selection, stats preview)
- [x] TowerInfoPanel (stats, level up, target priority, sell, digivolve button, merge button)

### Sprint 6: Merge System
- [x] MergeSystem (validation, result calculation)
- [x] TowerManager (selection, merge execution, selling)
- [x] MergeModal UI (comparison, confirmation)
- [x] Merge mode in GameScene (highlight candidates, click-to-merge flow)

### Sprint 7-8: Polish
- [x] AudioManager (all 17 SFX wired to game events)
- [x] SaveManager (LocalStorage save/load with version checking)
- [x] Auto-save after wave completion + Continue button on MainMenuScene
- [x] Ghost preview for tower placement (semi-transparent sprite on valid slots)
- [x] Boss health bar (top of grid) + spawn announcement (animated text)

### Post-MVP Polish
- [x] **UI Theme System** — UITheme.ts (design tokens) + UIHelpers.ts (drawPanel, drawButton, etc.)
- [x] **Starter Placement Fix** — SpawnMenu shows individual starter options with sprites for free first spawn
- [x] **Volume Control** — Slider + mute toggle in SettingsScene, AudioManager via registry
- [x] **Game Speed Control** — 1x/2x/3x toggle buttons in HUD + keyboard shortcuts (1/2/3)
- [x] **Sprout Lands Tileset** — Grass, dirt, water tiles + small decorations replace colored rectangles
- [x] **Settings Scene** — Dedicated overlay with volume, mute, restart, and main menu
- [x] **Pause Simplified** — Click/ESC to resume overlay
- [x] **GitHub Pages Deployment** — GitHub Actions workflow, auto-deploy on push
- [x] **Git + CI** — Repository initialized, all assets committed

### Gameplay Enhancements
- [x] **Stage-Based Level-Up Cost Scaling** — Higher stages cost proportionally more (In-Training ×1 → Ultra ×5)
- [x] **Status Effects System** — Burn, Poison, Slow, Freeze, Stun, Armor Break with runtime configs, DoT ticks, CC, visual indicators on enemies
- [x] **Tower Skills Display** — TowerInfoPanel shows effect name + proc chance (parses compound types like burn_aoe)
- [x] **Floating Damage Numbers** — Color-coded by effectiveness (green=super, white=neutral, red=resisted), toggleable in Settings
- [x] **Health Bar Toggle** — Settings cycle through All / Bosses Only / Off modes
- [x] **Wave Preview** — Next wave composition shown in HUD (enemy names, counts, boss indicator)
- [x] **Status Effect Proc on Hit** — CombatManager rolls effect chance, Projectile carries and applies effects on hit

### QoL Enhancements
- [x] **Level Up +5 Button** — Bulk level-up 5 levels at once with total cost display in TowerInfoPanel
- [x] **Level to Max Button** — Level a tower to its maximum level in one click with total cost display
- [x] **Reduced Default Volume** — Lowered default SFX volume from 0.5 to 0.15 (was too loud)
- [x] **Auto-Start Wave Toggle** — HUD toggle button that automatically starts the next wave after a 2-second delay
- [x] **Hide Starters After Placement** — Starter display in HUD hides after first tower is placed

## Remaining Work

### Content
- [ ] Phases 2-5 (waves 21-100)
- [ ] Endless mode (waves 101+)
- [ ] Full Digimon roster (~150, up from ~30)
- [ ] DNA Digivolution system (Ultra tier)
- [ ] Encyclopedia/Digimon browser

### UX & Polish
- [ ] Drag-and-drop merge (alternative UX)
- [ ] Visual merge effect (particle/tween)
- [ ] Object pooling (projectiles, enemies)
- [ ] Tutorial popups
- [ ] Background music

## Test Summary (368 tests, 15 test files)

| Test File | Tests |
|-----------|-------|
| AttributeSystem | 20 |
| TargetingSystem | 13 |
| DPSystem | 19 |
| LevelSystem | 40 |
| MergeSystem | 17 |
| OriginSystem | 34 |
| StatusEffects | 56 |
| GridUtils | 16 |
| Constants | 31 |
| DigimonDatabase | 15 |
| EvolutionPaths | 12 |
| WaveData | 10 |
| GameStateManager | 52 |
| SaveManager | 16 |
| SpawnMenu | 17 |

## File Inventory

### Source (41 files)
- **config/**: Constants.ts, GameConfig.ts
- **data/**: DigimonDatabase.ts, EvolutionPaths.ts, StatusEffects.ts, WaveData.ts
- **entities/**: Tower.ts, Enemy.ts, Projectile.ts
- **managers/**: AudioManager.ts, CombatManager.ts, GameStateManager.ts, SaveManager.ts, TowerManager.ts, WaveManager.ts
- **scenes/**: BootScene.ts, PreloadScene.ts, MainMenuScene.ts, StarterSelectScene.ts, GameScene.ts, PauseScene.ts, SettingsScene.ts, GameOverScene.ts
- **systems/**: AttributeSystem.ts, DPSystem.ts, LevelSystem.ts, MergeSystem.ts, OriginSystem.ts, TargetingSystem.ts
- **ui/**: SpawnMenu.ts, TowerInfoPanel.ts, EvolutionModal.ts, MergeModal.ts, UITheme.ts, UIHelpers.ts
- **utils/**: EventBus.ts, GridUtils.ts
- **types/**: DigimonTypes.ts, GameTypes.ts, index.ts
- main.ts

### Assets
- **Sprites**: 842 PNG files in `public/assets/sprites/Idle Frame Only/`
- **SFX**: 17 WAV files in `public/assets/sfx/`
- **Tiles**: 4 PNG spritesheets in `public/assets/tiles/` (Sprout Lands pack)

### Tests (15 test files + setup, 368 tests)
