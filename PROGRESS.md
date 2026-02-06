# DigiMerge TD - Implementation Progress

## Status: Full Game + Boss Abilities + Tutorial & Encyclopedia

All 11 sprints complete: core game (Sprints 1-8), gameplay enhancements + QoL + 100 waves + endless mode (Sprint 9), roster expansion Tier 1+2 (Phase 10), boss abilities (Sprint 10), tutorial + encyclopedia + wave preview enhancement (Sprint 11). 453 tests passing across 18 test files. TypeScript compiles clean. Vite build succeeds.
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
- [x] **Stage-Based Level-Up Cost Scaling** — Higher stages cost proportionally more (In-Training x1 to Ultra x5)
- [x] **Status Effects System** — Burn, Poison, Slow, Freeze, Stun, Armor Break with runtime configs, DoT ticks, CC, visual indicators on enemies
- [x] **Tower Skills Display** — TowerInfoPanel shows effect name + proc chance (parses compound types like burn_aoe)
- [x] **Floating Damage Numbers** — Color-coded by effectiveness (green=super, white=neutral, red=resisted), toggleable in Settings
- [x] **Health Bar Toggle** — Settings cycle through All / Bosses Only / Off modes
- [x] **Wave Preview** — Next wave composition shown in HUD (enemy names, counts, boss indicator)
- [x] **Status Effect Proc on Hit** — CombatManager rolls effect chance, Projectile carries and applies effects on hit

### QoL Enhancements
- [x] **Lv +5 / Lv MAX Buttons** — Bulk level-up with affordable level calculation (pays what you can afford)
- [x] **Reduced Default Volume** — Lowered default SFX volume from 0.5 to 0.05
- [x] **Auto-Start Wave Toggle** — HUD toggle button that auto-starts next wave after 2-second delay
- [x] **Hide Starters After Placement** — Starter display in HUD hides after first tower is placed
- [x] **Settings Non-Pausing** — Settings overlay no longer pauses the game

### Enemy Mechanics (9.4-9.6)
- [x] **Regen Enemies** — Heal 2% max HP/sec, blocked by Poison status effect
- [x] **Shielded Enemies** — 60% armor, blue tint visual indicator (Guardromon, Andromon)
- [x] **Splitter Enemies** — Split into child copies on death (Mamemon x2, Diaboromon x4), children have 50% HP

### Content Expansion (9.7-9.10)
- [x] **Phase 2 (Waves 21-40)** — 18 Champion enemies, boss Devimon (wave 30), phase boss Myotismon (wave 40)
- [x] **Phase 3 (Waves 41-60)** — 13 Ultimate enemies, boss SkullGreymon (wave 50), phase boss VenomMyotismon (wave 60)
- [x] **Phase 4 (Waves 61-80)** — 16 Mega enemies, boss Machinedramon (wave 70), phase boss Omegamon (wave 80)
- [x] **Phase 5 (Waves 81-100)** — 5 Ultra enemies, boss Omegamon Zwart (wave 90), final boss Apocalymon (wave 100)
- [x] **Endless Mode (101+)** — Dynamic wave generation, exponential HP scaling (1.05^n), boss every 10 waves, enemy count caps at 100

### Roster Expansion (Phase 10)
- [x] **Tier 1 (Lines 9-15)** — Nyaromon, Gummymon, Chocomon, Pyocomon, Mochimon, Pukamon, Dorimon lines (35 tower Digimon)
- [x] **Tier 2 (Lines 16-21)** — Sunmon, Moonmon, Kyokyomon, Puroromon, Budmon, Caprimon lines (28 tower Digimon)
- [x] **spriteKey system** — Added optional spriteKey field to DigimonStats for ID/sprite mismatches
- [x] **21 starters** — ALL_STARTER_IDS expanded, StarterSelectScene 7x3 grid, all tests updated
- [x] **~54 new sprites loaded** — All new evolution lines in PreloadScene

### Boss Abilities (Sprint 10)
- [x] **BossAbility type system** — BossAbility interface with cooldown/passive/hp_threshold triggers
- [x] **BossAbilitySystem** — Pure function ability logic, 10 unique abilities, runtime state management
- [x] **All 10 bosses have abilities** — Nova Blast, Mega Flame, Death Claw, Crimson Lightning, Ground Zero, Venom Infuse, Infinity Cannon, Transcendent Sword, Garuru Cannon, Total Annihilation
- [x] **Tower stun system** — Tower.applyStun() with visual indicator (red "!" and tint)
- [x] **Tower range reduction** — Boss aura reduces tower ranges while alive (Machinedramon)
- [x] **Damage shield** — Omegamon's Transcendent Sword grants 50% damage reduction
- [x] **Ability visual feedback** — Popup text, camera shake/flash, boss bar ability description
- [x] **Speed boost duration fix** — Mega Flame reverts enemy speed after 3s via delayedCall
- [x] **Death Claw drain indicator** — Floating red "-N" text near DB display when drained
- [x] **Minion spawn error logging** — Console warning instead of silent catch on spawn failure
- [x] **26 unit tests** — Cooldowns, passives, HP thresholds, damage reduction, cooldown progress

### Tutorial & Encyclopedia (Sprint 11)
- [x] **TutorialOverlay** — 8-step tutorial with highlight zones, skip button, localStorage persistence
- [x] **EncyclopediaScene** — Browsable Digimon catalog with filter by type/stage, pagination, detail view
- [x] **Encyclopedia detail panel** — Large sprite, stats, boss ability info, attribute-colored display
- [x] **MainMenu Encyclopedia button** — Accessible from main menu
- [x] **Enhanced wave preview** — Enemy sprites (1.5x scale) + type tags + boss ability names in HUD
- [x] **10 unit tests** — Tutorial step count, completion persistence, encyclopedia data validation

## Remaining Work

### Sprint 12: Polish, Bug Fixes & Gameplay Improvements (Planned)

**Sprint 12A — Critical Bug Fixes:**
- [ ] A1: Game Over freeze (registry mismatch between GameScene and GameOverScene)
- [ ] A2: Continue button wave/lives issue (SaveManager → GameScene data flow)
- [ ] A3: TowerInfoPanel buttons not updating when DigiBytes changes (listen to DIGIBYTES_CHANGED)

**Sprint 12B — UI/UX Polish:**
- [ ] B1: Starter selection — pick exactly 1 (currently allows up to 4)
- [ ] B2: Digimon font integration (Pixel Digivolve font for titles/headings)
- [ ] B3: Starter scene text blocking (text overlaps interactive elements)
- [ ] B4: Hide "Standard" label (verify if redundant label appears in spawn/wave preview)
- [ ] B5: Boss ability details visibility (increase font size, add background panel)
- [ ] B6: Encyclopedia raw skill names (map effect IDs to friendly display names)
- [ ] B7: Encyclopedia evolution chains (show prev/next evolutions with sprites)
- [ ] B8: Encyclopedia — hide enemies, show towers only (default to tower-only view)
- [ ] B9: Boss sprites aura (add colored glow/pulse around boss enemies)

**Sprint 12C — Gameplay Improvements:**
- [ ] C1: Wave enemy type limits (max 5 types per wave, min 5 units each)
- [ ] C2: Game continues when window unfocused (auto-pause or cap delta time)
- [ ] C3: Improved projectile particles (trailing particles matching attribute color)
- [ ] C4: Hit particles per attack effect (per-effect visual: orange for burn, blue for freeze, etc.)
- [ ] C5: Multi-hit visual (spread/stagger multi-hit projectiles for clarity)

**Sprint 12D — Content Expansion:**
- [ ] D1: Enemy Digimon as towers (~40 new tower entries from existing enemy sprites)

### Future Work
- [ ] Drag-and-drop merge (alternative UX)
- [ ] Visual merge effect (particle/tween)
- [ ] Object pooling (projectiles, enemies)
- [ ] Background music
- [ ] More Digimon roster expansion (~150+ target, currently ~105 tower Digimon)
- [ ] DNA Digivolution system (Ultra tier)

## Test Summary (453 tests, 18 test files)

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

## File Inventory

### Source (45 files)
- **config/**: Constants.ts, GameConfig.ts
- **data/**: DigimonDatabase.ts, EvolutionPaths.ts, StatusEffects.ts, WaveData.ts
- **entities/**: Tower.ts, Enemy.ts, Projectile.ts
- **managers/**: AudioManager.ts, CombatManager.ts, GameStateManager.ts, SaveManager.ts, TowerManager.ts, WaveManager.ts
- **scenes/**: BootScene.ts, PreloadScene.ts, MainMenuScene.ts, StarterSelectScene.ts, GameScene.ts, PauseScene.ts, SettingsScene.ts, GameOverScene.ts, EncyclopediaScene.ts
- **systems/**: AttributeSystem.ts, BossAbilitySystem.ts, DPSystem.ts, LevelSystem.ts, MergeSystem.ts, OriginSystem.ts, TargetingSystem.ts
- **ui/**: SpawnMenu.ts, TowerInfoPanel.ts, EvolutionModal.ts, MergeModal.ts, TutorialOverlay.ts, UITheme.ts, UIHelpers.ts
- **utils/**: EventBus.ts, GridUtils.ts
- **types/**: DigimonTypes.ts, GameTypes.ts, index.ts
- main.ts

### Assets
- **Sprites**: 842 PNG files in `public/assets/sprites/Idle Frame Only/`
- **SFX**: 17 WAV files in `public/assets/sfx/`
- **Tiles**: 4 PNG spritesheets in `public/assets/tiles/` (Sprout Lands pack)
- **Loaded Sprites**: ~149 unique sprites (tower evolutions, all enemy tiers, bosses)

### Tests (18 test files + setup, 453 tests)
