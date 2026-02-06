import Phaser from 'phaser';
import {
  GRID,
  GRID_OFFSET_X,
  GRID_OFFSET_Y,
  PATH_WAYPOINTS,
  isPathCell,
  isValidTowerSlot,
  TOTAL_WAVES_MVP,
  STARTING_LIVES,
  STARTING_DIGIBYTES,
  GAME_WIDTH,
  GAME_HEIGHT,
  GAME_SPEEDS,
} from '@/config/Constants';
import { EventBus, GameEvents } from '@/utils/EventBus';
import { WaveManager } from '@/managers/WaveManager';
import { CombatManager } from '@/managers/CombatManager';
import { SaveManager } from '@/managers/SaveManager';
import { SpawnMenu } from '@/ui/SpawnMenu';
import { EvolutionModal } from '@/ui/EvolutionModal';
import { TowerInfoPanel } from '@/ui/TowerInfoPanel';
import { MergeModal } from '@/ui/MergeModal';
import { TowerManager } from '@/managers/TowerManager';
import { AudioManager } from '@/managers/AudioManager';
import { Tower } from '@/entities/Tower';
import { Enemy } from '@/entities/Enemy';
import { canMerge, MergeCandidate } from '@/systems/MergeSystem';
import { DIGIMON_DATABASE } from '@/data/DigimonDatabase';
import { getWaveConfig } from '@/data/WaveData';
import { Stage, TargetPriority } from '@/types';
import { COLORS, TEXT_STYLES, FONTS, ANIM } from '@/ui/UITheme';
import { drawPanel, drawButton, drawSeparator, drawDigitalGrid, animateButtonHover, animateButtonPress } from '@/ui/UIHelpers';
import { BossAbilityAction, getCooldownProgress } from '@/systems/BossAbilitySystem';
import { Projectile } from '@/entities/Projectile';
import { TutorialOverlay } from '@/ui/TutorialOverlay';

export class GameScene extends Phaser.Scene {
  // Graphics
  private gridGraphics!: Phaser.GameObjects.Graphics;
  private pathGraphics!: Phaser.GameObjects.Graphics;

  // Containers for game objects
  public towerContainer!: Phaser.GameObjects.Container;
  public enemyContainer!: Phaser.GameObjects.Container;
  public projectileContainer!: Phaser.GameObjects.Container;
  public uiContainer!: Phaser.GameObjects.Container;

  // Managers
  private waveManager!: WaveManager;
  private combatManager!: CombatManager;
  private towerManager!: TowerManager;
  private audioManager!: AudioManager;

  // UI
  private spawnMenu!: SpawnMenu;
  private evolutionModal!: EvolutionModal;
  private towerInfoPanel!: TowerInfoPanel;
  private mergeModal!: MergeModal;

  // HUD text
  private waveText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private digibytesText!: Phaser.GameObjects.Text;
  private startWaveBtn!: Phaser.GameObjects.Container;
  private startWaveBtnBg!: Phaser.GameObjects.Graphics;
  private startWaveBtnText!: Phaser.GameObjects.Text;

  // Game state
  private currentWave: number = 1;
  private lives: number = STARTING_LIVES;
  private digibytes: number = STARTING_DIGIBYTES;
  private isWaveActive: boolean = false;

  // Free first spawn
  private hasUsedFreeSpawn: boolean = false;

  // Merge mode state
  private isMergeMode: boolean = false;
  private mergeSourceTower: Tower | null = null;
  private mergeHighlights: Phaser.GameObjects.Graphics[] = [];
  private mergeStatusText: Phaser.GameObjects.Text | null = null;

  // Boss UX
  private bossEnemy: Enemy | null = null;
  private bossBarBg: Phaser.GameObjects.Graphics | null = null;
  private bossBarFill: Phaser.GameObjects.Graphics | null = null;
  private bossNameText: Phaser.GameObjects.Text | null = null;
  private bossAnnounceText: Phaser.GameObjects.Text | null = null;
  private bossAbilityText: Phaser.GameObjects.Text | null = null;
  private bossShieldIndicator: Phaser.GameObjects.Graphics | null = null;

  // Game speed
  private gameSpeed: number = 1;
  private speedBtnBgs: Phaser.GameObjects.Graphics[] = [];
  private speedBtnTexts: Phaser.GameObjects.Text[] = [];

  // Ghost preview
  private ghostSprite: Phaser.GameObjects.Image | null = null;

  // Wave preview
  private wavePreviewText: Phaser.GameObjects.Text | null = null;
  private wavePreviewSprites: Phaser.GameObjects.GameObject[] = [];

  // Auto-start wave
  private autoStartWave: boolean = false;
  private autoStartBtnBg!: Phaser.GameObjects.Graphics;
  private autoStartBtnText!: Phaser.GameObjects.Text;

  // Starter display (hideable after first placement)
  private starterDisplayObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#060614');

    this.currentWave = 1;
    this.lives = STARTING_LIVES;
    this.digibytes = STARTING_DIGIBYTES;
    this.isWaveActive = false;
    this.hasUsedFreeSpawn = false;
    this.isMergeMode = false;
    this.mergeSourceTower = null;
    this.gameSpeed = 1;
    this.speedBtnBgs = [];
    this.speedBtnTexts = [];
    this.autoStartWave = false;
    this.starterDisplayObjects = [];

    // Initialize free spawn flag in registry for SpawnMenu access
    this.registry.set('hasUsedFreeSpawn', false);

    // Create layered containers (render order: grid → towers → enemies → projectiles → UI)
    this.towerContainer = this.add.container(GRID_OFFSET_X, GRID_OFFSET_Y).setDepth(2);
    this.enemyContainer = this.add.container(GRID_OFFSET_X, GRID_OFFSET_Y).setDepth(3);
    this.projectileContainer = this.add.container(GRID_OFFSET_X, GRID_OFFSET_Y).setDepth(4);
    this.uiContainer = this.add.container(0, 0).setDepth(10);

    // Draw the game grid and path
    this.drawGrid();
    this.drawPath();

    // Create HUD (in UI container layer)
    this.createHUD();

    // Setup tower slot click handling
    this.setupGridInteraction();

    // Pause key (ESC) - also cancels merge mode
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ESC', () => {
        if (this.isMergeMode) {
          this.exitMergeMode();
          return;
        }
        this.scene.launch('PauseScene');
        this.scene.pause();
      });

      // Speed control keyboard shortcuts
      this.input.keyboard.on('keydown-ONE', () => this.setGameSpeed(1));
      this.input.keyboard.on('keydown-TWO', () => this.setGameSpeed(2));
      this.input.keyboard.on('keydown-THREE', () => this.setGameSpeed(3));
    }

    // Initialize managers
    this.waveManager = new WaveManager(this, this.enemyContainer);
    this.combatManager = new CombatManager(
      this,
      this.towerContainer,
      this.enemyContainer,
      this.projectileContainer,
    );
    this.towerManager = new TowerManager(this, this.towerContainer);
    this.audioManager = new AudioManager(this);
    this.registry.set('audioManager', this.audioManager);

    // Shared currency callbacks
    const getDigibytes = () => this.digibytes;
    const spendDigibytes = (amount: number) => {
      if (this.digibytes >= amount) {
        this.digibytes -= amount;
        this.digibytesText.setText(`${this.digibytes}`);
        EventBus.emit(GameEvents.DIGIBYTES_CHANGED, this.digibytes);
        return true;
      }
      return false;
    };
    const addDigibytes = (amount: number) => {
      this.digibytes += amount;
      this.digibytesText.setText(`${this.digibytes}`);
      EventBus.emit(GameEvents.DIGIBYTES_CHANGED, this.digibytes);
    };

    // Create spawn menu UI
    this.spawnMenu = new SpawnMenu(this, getDigibytes, spendDigibytes);

    // Create evolution modal
    this.evolutionModal = new EvolutionModal(this, getDigibytes, spendDigibytes, addDigibytes);

    // Create tower info panel
    this.towerInfoPanel = new TowerInfoPanel(this, getDigibytes, spendDigibytes, addDigibytes);

    // Create merge modal
    this.mergeModal = new MergeModal(this);

    // Listen for game events
    EventBus.on(GameEvents.ENEMY_DIED, this.onEnemyDied, this);
    EventBus.on(GameEvents.ENEMY_REACHED_BASE, this.onEnemyReachedBase, this);
    EventBus.on(GameEvents.LIVES_CHANGED, this.updateLivesDisplay, this);
    EventBus.on(GameEvents.DIGIBYTES_CHANGED, this.updateDigibytesDisplay, this);
    EventBus.on(GameEvents.WAVE_COMPLETED, this.onWaveCompleted, this);
    EventBus.on(GameEvents.SPAWN_REQUESTED, this.onSpawnRequested, this);
    EventBus.on(GameEvents.TOWER_SELECTED, this.onTowerSelected, this);
    EventBus.on(GameEvents.MERGE_INITIATED, this.onMergeInitiated, this);
    EventBus.on(GameEvents.DIGIVOLVE_INITIATED, this.onDigivolveInitiated, this);
    EventBus.on(GameEvents.BOSS_SPAWNED, this.onBossSpawned, this);
    EventBus.on(GameEvents.TOWER_PLACED, this.onTowerPlaced, this);
    EventBus.on(GameEvents.DAMAGE_DEALT, this.onDamageDealt, this);

    // Setup ghost preview sprite (hidden by default)
    this.setupGhostPreview();

    // Load saved game if applicable
    this.loadSavedGame();

    // Show tutorial on first play (only if not loading a save)
    const isLoadingSave = this.registry.get('loadSave');
    if (!isLoadingSave && !TutorialOverlay.isComplete()) {
      const tutorial = new TutorialOverlay(this, () => {
        // Tutorial complete — game continues
      });
      this.add.existing(tutorial);
    }
  }

  update(time: number, delta: number) {
    // Cap delta to prevent enemy teleportation when tab loses focus
    const cappedDelta = Math.min(delta, 100); // Max 100ms (10fps minimum)
    const scaledDelta = cappedDelta * this.gameSpeed;

    // Update wave spawning
    this.waveManager.update(time, scaledDelta);

    // Update all towers (cooldown timers)
    for (const tower of this.towerContainer.list) {
      if (tower && 'update' in tower && typeof (tower as any).update === 'function') {
        (tower as any).update(time, scaledDelta);
      }
    }

    // Update all enemies (path movement)
    for (const enemy of this.enemyContainer.list) {
      if (enemy && 'update' in enemy && typeof (enemy as any).update === 'function') {
        (enemy as any).update(time, scaledDelta);
      }
    }

    // Combat: tower targeting, firing, projectile movement
    this.combatManager.update(time, scaledDelta);

    // Process boss ability actions
    this.processBossAbilities();

    // Update boss health bar if active
    this.updateBossBar();

    // Reset tower range reduction each frame (passive auras re-apply every frame)
    for (const tower of this.towerContainer.list) {
      (tower as Tower).rangeReductionPercent = 0;
    }
  }

  shutdown() {
    EventBus.off(GameEvents.ENEMY_DIED, this.onEnemyDied, this);
    EventBus.off(GameEvents.ENEMY_REACHED_BASE, this.onEnemyReachedBase, this);
    EventBus.off(GameEvents.LIVES_CHANGED, this.updateLivesDisplay, this);
    EventBus.off(GameEvents.DIGIBYTES_CHANGED, this.updateDigibytesDisplay, this);
    EventBus.off(GameEvents.WAVE_COMPLETED, this.onWaveCompleted, this);
    EventBus.off(GameEvents.SPAWN_REQUESTED, this.onSpawnRequested, this);
    EventBus.off(GameEvents.TOWER_SELECTED, this.onTowerSelected, this);
    EventBus.off(GameEvents.MERGE_INITIATED, this.onMergeInitiated, this);
    EventBus.off(GameEvents.DIGIVOLVE_INITIATED, this.onDigivolveInitiated, this);
    EventBus.off(GameEvents.BOSS_SPAWNED, this.onBossSpawned, this);
    EventBus.off(GameEvents.TOWER_PLACED, this.onTowerPlaced, this);
    EventBus.off(GameEvents.DAMAGE_DEALT, this.onDamageDealt, this);

    this.waveManager.cleanup();
    this.combatManager.cleanup();
    this.towerManager.cleanup();
    this.audioManager.cleanup();
  }

  // ============================================================
  // Grid Drawing
  // ============================================================

  private drawGrid(): void {
    this.gridGraphics = this.add.graphics();
    this.gridGraphics.setDepth(0);

    const cellSize = GRID.CELL_SIZE;
    const tileScale = cellSize / 16; // 16px tiles scaled to fill 64px cells

    // 100% opaque tile frames (verified via pixel analysis)
    // Grass: 176x112, 11 cols. Rows 5-6 are fully opaque textured fills
    const GRASS_FRAMES = [55, 56, 57, 66, 67, 68];
    // Dirt: 128x128, 8 cols. Top-left 3x2 block is solid fill
    const DIRT_FRAME = 9;
    // Water: 64x16, 4 cols
    const WATER_FRAME = 0;
    // Small decorations (5-30% fill, flowers/mushrooms/plants)
    const DECOR_FRAMES = [7, 14, 18, 24, 29, 30, 40, 42];

    // Base colors matching the Sprout Lands palette (avg of opaque tiles)
    const GRASS_BASE = 0xc0d470;
    const DIRT_BASE = 0xe8cfa6;
    const WATER_BASE = 0x9cd5c2;

    const hasGrass = this.textures.exists('tiles_grass');
    const hasDirt = this.textures.exists('tiles_dirt');
    const hasWater = this.textures.exists('tiles_water');
    const hasDecor = this.textures.exists('tiles_decor');

    // Seeded random for consistent decoration/variety
    const seededRandom = (a: number, b: number) => {
      const seed = a * 1000 + b * 7 + 42;
      return ((Math.sin(seed) * 10000) % 1 + 1) % 1;
    };

    // --- Layer 1: Solid color base fills (eliminates all black gaps) ---

    // Water base covers the full screen left of HUD
    const gridRight = GRID_OFFSET_X + GRID.COLUMNS * cellSize;
    this.gridGraphics.fillStyle(WATER_BASE, 1);
    this.gridGraphics.fillRect(0, 0, gridRight + 20, GAME_HEIGHT);

    // Grass base covers the grid area
    this.gridGraphics.fillStyle(GRASS_BASE, 1);
    this.gridGraphics.fillRect(
      GRID_OFFSET_X, GRID_OFFSET_Y,
      GRID.COLUMNS * cellSize, GRID.ROWS * cellSize,
    );

    // Dirt base on path cells
    for (let row = 1; row <= GRID.ROWS; row++) {
      for (let col = 1; col <= GRID.COLUMNS; col++) {
        if (isPathCell(col, row)) {
          const x = GRID_OFFSET_X + (col - 1) * cellSize;
          const y = GRID_OFFSET_Y + (row - 1) * cellSize;
          this.gridGraphics.fillStyle(DIRT_BASE, 1);
          this.gridGraphics.fillRect(x, y, cellSize, cellSize);
        }
      }
    }

    // --- Layer 2: Water tiles on border areas for texture ---
    if (hasWater) {
      const gridBottom = GRID_OFFSET_Y + GRID.ROWS * cellSize;
      // Left strip
      for (let wy = 0; wy < gridBottom + cellSize; wy += cellSize) {
        for (let wx = 0; wx < GRID_OFFSET_X; wx += cellSize) {
          this.add.image(wx + cellSize / 2, wy + cellSize / 2, 'tiles_water', WATER_FRAME)
            .setScale(tileScale).setDepth(0);
        }
      }
      // Right strip
      for (let wy = 0; wy < gridBottom + cellSize; wy += cellSize) {
        this.add.image(gridRight + cellSize / 2, wy + cellSize / 2, 'tiles_water', WATER_FRAME)
          .setScale(tileScale).setDepth(0);
      }
      // Top strip
      for (let wx = GRID_OFFSET_X; wx < gridRight; wx += cellSize) {
        for (let wy = 0; wy < GRID_OFFSET_Y; wy += cellSize) {
          this.add.image(wx + cellSize / 2, wy + cellSize / 2, 'tiles_water', WATER_FRAME)
            .setScale(tileScale).setDepth(0);
        }
      }
      // Bottom strip
      for (let wx = GRID_OFFSET_X; wx < gridRight; wx += cellSize) {
        this.add.image(wx + cellSize / 2, GRID_OFFSET_Y + GRID.ROWS * cellSize + cellSize / 2, 'tiles_water', WATER_FRAME)
          .setScale(tileScale).setDepth(0);
      }
    }

    // --- Layer 3: Tile sprites on grid cells for texture/variety ---
    for (let row = 1; row <= GRID.ROWS; row++) {
      for (let col = 1; col <= GRID.COLUMNS; col++) {
        const x = GRID_OFFSET_X + (col - 1) * cellSize;
        const y = GRID_OFFSET_Y + (row - 1) * cellSize;
        const cx = x + cellSize / 2;
        const cy = y + cellSize / 2;

        if (isPathCell(col, row)) {
          // Dirt tile on path
          if (hasDirt) {
            this.add.image(cx, cy, 'tiles_dirt', DIRT_FRAME)
              .setScale(tileScale).setDepth(0);
          }
        } else if (isValidTowerSlot(col, row)) {
          // Grass tile with varied frames for natural look
          if (hasGrass) {
            const frameIdx = Math.floor(seededRandom(col, row) * GRASS_FRAMES.length);
            this.add.image(cx, cy, 'tiles_grass', GRASS_FRAMES[frameIdx])
              .setScale(tileScale).setDepth(0);
          }

          // Subtle border for tower slots (dark green, low alpha)
          this.gridGraphics.lineStyle(1, 0x88aa44, 0.25);
          this.gridGraphics.strokeRect(x, y, cellSize, cellSize);

          // Random small decorations on ~12% of grass cells
          if (hasDecor && seededRandom(col, row) < 0.12) {
            const dIdx = Math.floor(seededRandom(col + 50, row + 50) * DECOR_FRAMES.length);
            this.add.image(cx, cy, 'tiles_decor', DECOR_FRAMES[dIdx])
              .setScale(tileScale * 0.65).setDepth(0.5).setAlpha(0.7);
          }
        }
      }
    }

    // --- Layer 4: Spawn and Base indicators ---
    const spawnX = GRID_OFFSET_X + (GRID.SPAWN.col - 1) * cellSize;
    const spawnY = GRID_OFFSET_Y + (GRID.SPAWN.row - 1) * cellSize;
    this.gridGraphics.fillStyle(0x00cc44, 0.3);
    this.gridGraphics.fillRect(spawnX, spawnY, cellSize, cellSize);
    this.gridGraphics.lineStyle(2, 0x00ff44, 0.6);
    this.gridGraphics.strokeRect(spawnX, spawnY, cellSize, cellSize);
    this.add.text(spawnX + cellSize / 2, spawnY + cellSize / 2, 'S', {
      fontSize: '16px', color: '#00ff44', fontStyle: 'bold',
      stroke: '#003300', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(1);

    const baseX = GRID_OFFSET_X + (GRID.BASE.col - 1) * cellSize;
    const baseY = GRID_OFFSET_Y + (GRID.BASE.row - 1) * cellSize;
    this.gridGraphics.fillStyle(0xcc2222, 0.3);
    this.gridGraphics.fillRect(baseX, baseY, cellSize, cellSize);
    this.gridGraphics.lineStyle(2, 0xff4444, 0.6);
    this.gridGraphics.strokeRect(baseX, baseY, cellSize, cellSize);
    this.add.text(baseX + cellSize / 2, baseY + cellSize / 2, 'B', {
      fontSize: '16px', color: '#ff4444', fontStyle: 'bold',
      stroke: '#330000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(1);
  }

  private drawPath(): void {
    this.pathGraphics = this.add.graphics();
    this.pathGraphics.setDepth(1);

    // Subtle dotted direction line along the path (dirt tiles already show the path)
    this.pathGraphics.lineStyle(2, 0xaa8855, 0.3);

    const cellSize = GRID.CELL_SIZE;
    const halfCell = cellSize / 2;

    if (PATH_WAYPOINTS.length < 2) return;

    this.pathGraphics.beginPath();
    const startX = GRID_OFFSET_X + (PATH_WAYPOINTS[0].col - 1) * cellSize + halfCell;
    const startY = GRID_OFFSET_Y + (PATH_WAYPOINTS[0].row - 1) * cellSize + halfCell;
    this.pathGraphics.moveTo(startX, startY);

    for (let i = 1; i < PATH_WAYPOINTS.length; i++) {
      const wp = PATH_WAYPOINTS[i];
      const px = GRID_OFFSET_X + (wp.col - 1) * cellSize + halfCell;
      const py = GRID_OFFSET_Y + (wp.row - 1) * cellSize + halfCell;
      this.pathGraphics.lineTo(px, py);
    }

    this.pathGraphics.strokePath();
  }

  // ============================================================
  // Grid Interaction
  // ============================================================

  private setupGridInteraction(): void {
    // Click detection on the grid area
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const gridX = pointer.x - GRID_OFFSET_X;
      const gridY = pointer.y - GRID_OFFSET_Y;

      const col = Math.floor(gridX / GRID.CELL_SIZE) + 1;
      const row = Math.floor(gridY / GRID.CELL_SIZE) + 1;

      if (!isValidTowerSlot(col, row)) return;

      const existing = this.getTowerAt(col, row);

      // Merge mode: clicking a tower selects merge target
      if (this.isMergeMode && this.mergeSourceTower) {
        if (existing && existing !== this.mergeSourceTower) {
          this.attemptMerge(this.mergeSourceTower, existing as Tower);
        } else {
          // Clicked empty slot or self - cancel merge mode
          this.exitMergeMode();
        }
        return;
      }

      // Normal mode
      if (existing) {
        EventBus.emit(GameEvents.TOWER_SELECTED, existing);
      } else {
        EventBus.emit(GameEvents.SPAWN_REQUESTED, { col, row });
      }
    });

    // Hover detection for ghost preview
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.updateGhostPreview(pointer.x, pointer.y);
    });
  }

  /**
   * Find a tower at the given grid position.
   */
  getTowerAt(col: number, row: number): Phaser.GameObjects.GameObject | null {
    for (const child of this.towerContainer.list) {
      if ((child as any).gridCol === col && (child as any).gridRow === row) {
        return child;
      }
    }
    return null;
  }

  // ============================================================
  // Ghost Preview
  // ============================================================

  private setupGhostPreview(): void {
    // Ghost sprite is created on demand when hovering over empty slots
    this.ghostSprite = null;
  }

  private updateGhostPreview(pointerX: number, pointerY: number): void {
    const gridX = pointerX - GRID_OFFSET_X;
    const gridY = pointerY - GRID_OFFSET_Y;
    const col = Math.floor(gridX / GRID.CELL_SIZE) + 1;
    const row = Math.floor(gridY / GRID.CELL_SIZE) + 1;

    // Show ghost on valid empty tower slots (only when not in merge mode)
    if (isValidTowerSlot(col, row) && !this.getTowerAt(col, row) && !this.isMergeMode) {
      const cellX = GRID_OFFSET_X + (col - 1) * GRID.CELL_SIZE + GRID.CELL_SIZE / 2;
      const cellY = GRID_OFFSET_Y + (row - 1) * GRID.CELL_SIZE + GRID.CELL_SIZE / 2;

      if (!this.ghostSprite) {
        this.ghostSprite = this.add.image(cellX, cellY, '__DEFAULT');
        this.ghostSprite.setAlpha(0.35).setDepth(5);
      }

      // Use the first selected starter as the preview texture
      const starters: string[] = this.registry.get('selectedStarters') || [];
      if (starters.length > 0 && this.textures.exists(starters[0])) {
        this.ghostSprite.setTexture(starters[0]);
        this.ghostSprite.setScale(3);
        this.ghostSprite.setPosition(cellX, cellY - 8);
        this.ghostSprite.setVisible(true);
      } else {
        this.hideGhostPreview();
      }
    } else {
      this.hideGhostPreview();
    }
  }

  private hideGhostPreview(): void {
    if (this.ghostSprite) {
      this.ghostSprite.setVisible(false);
    }
  }

  // ============================================================
  // Merge Mode
  // ============================================================

  private onMergeInitiated(tower: Tower): void {
    this.towerInfoPanel.hide();
    this.enterMergeMode(tower);
  }

  private enterMergeMode(sourceTower: Tower): void {
    this.isMergeMode = true;
    this.mergeSourceTower = sourceTower;

    // Find and highlight all valid merge candidates
    const candidates = this.towerManager.findMergeCandidates(sourceTower);

    // Show status text
    this.mergeStatusText = this.add.text(
      GRID_OFFSET_X + (GRID.COLUMNS * GRID.CELL_SIZE) / 2,
      GRID_OFFSET_Y - 25,
      candidates.length > 0
        ? `Select a tower to merge with ${sourceTower.stats.name} (ESC to cancel)`
        : `No valid merge candidates for ${sourceTower.stats.name} (ESC to cancel)`,
      {
        fontSize: '14px',
        color: candidates.length > 0 ? '#44ccff' : '#ff6666',
        fontStyle: 'bold',
      },
    ).setOrigin(0.5).setDepth(15);

    // Highlight merge candidates with a cyan glow
    for (const candidate of candidates) {
      const gfx = this.add.graphics();
      const cx = GRID_OFFSET_X + (candidate.gridCol - 1) * GRID.CELL_SIZE;
      const cy = GRID_OFFSET_Y + (candidate.gridRow - 1) * GRID.CELL_SIZE;
      gfx.lineStyle(3, COLORS.CYAN, 0.8);
      gfx.strokeRect(cx, cy, GRID.CELL_SIZE, GRID.CELL_SIZE);
      gfx.setDepth(8);
      this.mergeHighlights.push(gfx);
    }

    // Highlight source tower in yellow
    const srcGfx = this.add.graphics();
    const sx = GRID_OFFSET_X + (sourceTower.gridCol - 1) * GRID.CELL_SIZE;
    const sy = GRID_OFFSET_Y + (sourceTower.gridRow - 1) * GRID.CELL_SIZE;
    srcGfx.lineStyle(3, 0xffdd44, 0.8); // Gold for source tower
    srcGfx.strokeRect(sx, sy, GRID.CELL_SIZE, GRID.CELL_SIZE);
    srcGfx.setDepth(8);
    this.mergeHighlights.push(srcGfx);
  }

  private exitMergeMode(): void {
    this.isMergeMode = false;
    this.mergeSourceTower = null;

    // Remove highlights
    for (const gfx of this.mergeHighlights) {
      gfx.destroy();
    }
    this.mergeHighlights = [];

    // Remove status text
    if (this.mergeStatusText) {
      this.mergeStatusText.destroy();
      this.mergeStatusText = null;
    }
  }

  private attemptMerge(sourceTower: Tower, targetTower: Tower): void {
    const sourceCandidate: MergeCandidate = {
      level: sourceTower.level,
      dp: sourceTower.dp,
      attribute: sourceTower.attribute,
      stage: sourceTower.stage,
    };
    const targetCandidate: MergeCandidate = {
      level: targetTower.level,
      dp: targetTower.dp,
      attribute: targetTower.attribute,
      stage: targetTower.stage,
    };

    if (!canMerge(sourceCandidate, targetCandidate)) {
      this.exitMergeMode();
      return;
    }

    // Exit merge mode visuals before showing modal
    this.exitMergeMode();

    // Show the merge modal
    this.mergeModal.show(sourceTower, targetTower, (survivor: Tower, sacrifice: Tower) => {
      this.towerManager.tryMerge(survivor, sacrifice);
    });
  }

  // ============================================================
  // Digivolve
  // ============================================================

  private onDigivolveInitiated(tower: Tower): void {
    this.towerInfoPanel.hide();
    this.evolutionModal.show(tower);
  }

  // ============================================================
  // Boss UX
  // ============================================================

  private onBossSpawned(data: { digimonId: string }) {
    // Find the boss enemy in the container
    for (const child of this.enemyContainer.list) {
      const enemy = child as Enemy;
      if (enemy.digimonId === data.digimonId && enemy.isAlive) {
        this.bossEnemy = enemy;
        break;
      }
    }

    if (!this.bossEnemy) return;

    const bossStats = DIGIMON_DATABASE.enemies[data.digimonId];
    const bossName = bossStats?.name || data.digimonId;

    // Show boss announcement
    this.bossAnnounceText = this.add.text(
      GRID_OFFSET_X + (GRID.COLUMNS * GRID.CELL_SIZE) / 2,
      GRID_OFFSET_Y + (GRID.ROWS * GRID.CELL_SIZE) / 2,
      `BOSS: ${bossName}!`,
      {
        fontSize: '36px',
        color: '#ff4444',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
      },
    ).setOrigin(0.5).setDepth(60).setAlpha(0);

    // Tween: fade in, hold, fade out
    this.tweens.add({
      targets: this.bossAnnounceText,
      alpha: { from: 0, to: 1 },
      scale: { from: 0.5, to: 1.2 },
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1500, () => {
          if (this.bossAnnounceText) {
            this.tweens.add({
              targets: this.bossAnnounceText,
              alpha: 0,
              y: (this.bossAnnounceText.y || 0) - 50,
              duration: 400,
              onComplete: () => {
                this.bossAnnounceText?.destroy();
                this.bossAnnounceText = null;
              },
            });
          }
        });
      },
    });

    // Create boss health bar at the top of the game area
    const barWidth = GRID.COLUMNS * GRID.CELL_SIZE - 20;
    const barHeight = 16;
    const barX = GRID_OFFSET_X + 10;
    const barY = GRID_OFFSET_Y - 45;

    this.bossBarBg = this.add.graphics();
    this.bossBarBg.fillStyle(0x222222, 0.9);
    this.bossBarBg.fillRoundedRect(barX, barY, barWidth, barHeight, 4);
    this.bossBarBg.lineStyle(1, 0xff4444, 0.6);
    this.bossBarBg.strokeRoundedRect(barX, barY, barWidth, barHeight, 4);
    this.bossBarBg.setDepth(15);

    this.bossBarFill = this.add.graphics();
    this.bossBarFill.setDepth(15);

    this.bossNameText = this.add.text(barX + barWidth / 2, barY - 2, bossName, {
      fontSize: '12px',
      color: '#ff6666',
      fontStyle: 'bold',
    }).setOrigin(0.5, 1).setDepth(15);

    // Show boss ability name below the health bar (larger, bold, with stroke for visibility)
    if (bossStats?.bossAbility) {
      this.bossAbilityText = this.add.text(barX + barWidth / 2, barY + barHeight + 4,
        `${bossStats.bossAbility.name}`, {
          fontSize: '13px',
          color: '#ffcc66',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 2,
        }).setOrigin(0.5, 0).setDepth(15);
    }

    // Track boss death to clean up bar
    const bossRef = this.bossEnemy;
    bossRef.once('destroy', () => {
      this.cleanupBossBar();
    });
  }

  private updateBossBar(): void {
    if (!this.bossEnemy || !this.bossBarFill || !this.bossEnemy.isAlive) {
      if (this.bossBarBg && this.bossEnemy && !this.bossEnemy.isAlive) {
        this.cleanupBossBar();
      }
      return;
    }

    const barWidth = GRID.COLUMNS * GRID.CELL_SIZE - 20;
    const barHeight = 16;
    const barX = GRID_OFFSET_X + 10;
    const barY = GRID_OFFSET_Y - 45;
    const hpPercent = Math.max(0, this.bossEnemy.hp / this.bossEnemy.maxHp);

    this.bossBarFill.clear();
    const fillColor = hpPercent > 0.6 ? 0xff4444 : hpPercent > 0.3 ? 0xff8844 : 0xff2222;
    this.bossBarFill.fillStyle(fillColor, 1);
    this.bossBarFill.fillRoundedRect(barX + 2, barY + 2, (barWidth - 4) * hpPercent, barHeight - 4, 3);
  }

  private cleanupBossBar(): void {
    this.bossEnemy = null;
    if (this.bossBarBg) { this.bossBarBg.destroy(); this.bossBarBg = null; }
    if (this.bossBarFill) { this.bossBarFill.destroy(); this.bossBarFill = null; }
    if (this.bossNameText) { this.bossNameText.destroy(); this.bossNameText = null; }
    if (this.bossAbilityText) { this.bossAbilityText.destroy(); this.bossAbilityText = null; }
    if (this.bossShieldIndicator) { this.bossShieldIndicator.destroy(); this.bossShieldIndicator = null; }
  }

  // ============================================================
  // Boss Ability Execution
  // ============================================================

  private processBossAbilities(): void {
    if (!this.bossEnemy || !this.bossEnemy.isAlive) return;

    const actions = this.bossEnemy.pendingBossActions;
    if (actions.length === 0) return;

    // Drain all pending actions
    this.bossEnemy.pendingBossActions = [];

    for (const action of actions) {
      this.executeBossAction(action);
    }
  }

  private executeBossAction(action: BossAbilityAction): void {
    switch (action.type) {
      case 'stun_tower': {
        // Stun the nearest tower to the boss
        const nearest = this.findNearestTower();
        if (nearest) {
          nearest.applyStun(action.params.stunDuration);
          this.showBossAbilityPopup('Nova Blast!');
        }
        break;
      }

      case 'speed_boost': {
        // Speed up nearby enemies temporarily
        const bossX = this.bossEnemy!.x;
        const bossY = this.bossEnemy!.y;
        const range = action.params.range;
        const duration = this.bossEnemy!.bossAbilityState?.ability.duration ?? 3;
        const affectedEnemies: Enemy[] = [];
        for (const child of this.enemyContainer.list) {
          const enemy = child as Enemy;
          if (!enemy.isAlive || enemy === this.bossEnemy) continue;
          const dx = enemy.x - bossX;
          const dy = enemy.y - bossY;
          if (Math.sqrt(dx * dx + dy * dy) <= range) {
            enemy.speed = enemy.stats.moveSpeed * (1 + action.params.speedBoost);
            affectedEnemies.push(enemy);
          }
        }
        // Revert speeds after duration expires
        this.time.delayedCall(duration * 1000, () => {
          for (const enemy of affectedEnemies) {
            if (enemy.active && enemy.isAlive) {
              enemy.speed = enemy.stats.moveSpeed;
            }
          }
        });
        this.showBossAbilityPopup('Mega Flame!');
        break;
      }

      case 'drain_db': {
        const drain = Math.min(this.digibytes, action.params.amount);
        if (drain > 0) {
          this.digibytes -= drain;
          this.digibytesText.setText(`${this.digibytes}`);
          EventBus.emit(GameEvents.DIGIBYTES_CHANGED, this.digibytes);
          // Floating drain indicator near DB display
          const drainText = this.add.text(
            this.digibytesText.x + 40, this.digibytesText.y,
            `-${drain}`, { fontFamily: FONTS.MONO, fontSize: '12px', color: '#ff4444', fontStyle: 'bold' },
          ).setDepth(15);
          this.tweens.add({
            targets: drainText, y: drainText.y - 20, alpha: 0,
            duration: 800, ease: 'Power2',
            onComplete: () => drainText.destroy(),
          });
        }
        break;
      }

      case 'heal_self': {
        if (this.bossEnemy && this.bossEnemy.isAlive) {
          this.bossEnemy.heal(action.params.healAmount);
          this.showBossAbilityPopup('Crimson Lightning!');
        }
        break;
      }

      case 'destroy_projectiles': {
        // Destroy all active projectiles
        const projectiles = [...this.projectileContainer.list] as Projectile[];
        for (const proj of projectiles) {
          proj.destroy();
        }
        this.showBossAbilityPopup('Ground Zero!');
        // Screen shake
        this.cameras.main.shake(300, 0.01);
        break;
      }

      case 'spawn_minions': {
        // Spawn swarm minions at boss position (use first available In-Training/Rookie enemy)
        const minionId = this.getSwarmMinionId();
        if (minionId && this.bossEnemy) {
          for (let i = 0; i < action.params.minionCount; i++) {
            try {
              const minion = new Enemy(this, minionId, this.waveManager.currentWave <= 100 ? 1 + 0.05 * (this.waveManager.currentWave - 1) : 1);
              minion.pathIndex = this.bossEnemy.pathIndex;
              minion.pathProgress = this.bossEnemy.pathProgress;
              minion.x = this.bossEnemy.x + (i - 1) * 15;
              minion.y = this.bossEnemy.y;
              this.enemyContainer.add(minion);
            } catch (err) { console.warn('[GameScene] Failed to spawn minion:', minionId, err); }
          }
        }
        this.showBossAbilityPopup('Venom Infuse!');
        break;
      }

      case 'range_reduction': {
        // Applied as passive aura — reduce all tower ranges
        for (const child of this.towerContainer.list) {
          (child as Tower).rangeReductionPercent = action.params.rangeReduction;
        }
        break;
      }

      case 'damage_shield': {
        this.showBossAbilityPopup('Transcendent Sword!');
        // Shield visual on boss bar
        this.showBossShieldIndicator();
        break;
      }

      case 'stun_top_towers': {
        // Sort towers by DPS (damage * speed), stun the top N
        const towers = (this.towerContainer.list as Tower[])
          .map(t => ({ tower: t, dps: t.getAttackDamage() * t.getAttackSpeed() }))
          .sort((a, b) => b.dps - a.dps);
        const count = Math.min(action.params.towerCount, towers.length);
        for (let i = 0; i < count; i++) {
          towers[i].tower.applyStun(action.params.stunDuration);
        }
        this.showBossAbilityPopup('Garuru Cannon!');
        this.cameras.main.flash(200, 100, 150, 255, false);
        break;
      }

      case 'stun_all_towers': {
        for (const child of this.towerContainer.list) {
          (child as Tower).applyStun(action.params.stunDuration);
        }
        this.showBossAbilityPopup('Total Annihilation!');
        this.cameras.main.shake(500, 0.02);
        this.cameras.main.flash(300, 255, 50, 50, false);
        break;
      }
    }
  }

  private findNearestTower(): Tower | null {
    if (!this.bossEnemy) return null;
    const bossX = this.bossEnemy.x;
    const bossY = this.bossEnemy.y;
    let nearest: Tower | null = null;
    let bestDist = Infinity;
    for (const child of this.towerContainer.list) {
      const tower = child as Tower;
      const dx = tower.x - bossX;
      const dy = tower.y - bossY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bestDist) {
        bestDist = dist;
        nearest = tower;
      }
    }
    return nearest;
  }

  private getSwarmMinionId(): string | null {
    // Find a low-tier enemy ID to use as minions
    const candidates = ['enemy_koromon', 'enemy_tsunomon', 'enemy_tokomon', 'enemy_pagumon'];
    for (const id of candidates) {
      if (DIGIMON_DATABASE.enemies[id]) return id;
    }
    return null;
  }

  private showBossAbilityPopup(text: string): void {
    const popupX = GRID_OFFSET_X + (GRID.COLUMNS * GRID.CELL_SIZE) / 2;
    const popupY = GRID_OFFSET_Y + 40;

    const popup = this.add.text(popupX, popupY, text, {
      fontSize: '20px',
      color: '#ffaa00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(55);

    this.tweens.add({
      targets: popup,
      y: popup.y - 30,
      alpha: { from: 1, to: 0 },
      duration: 1200,
      ease: 'Cubic.easeOut',
      onComplete: () => popup.destroy(),
    });

    EventBus.emit(GameEvents.BOSS_ABILITY_ACTIVATED, { abilityName: text });
  }

  private showBossShieldIndicator(): void {
    if (this.bossShieldIndicator) {
      this.bossShieldIndicator.destroy();
    }
    // Golden glow around the boss bar area
    const barWidth = GRID.COLUMNS * GRID.CELL_SIZE - 20;
    const barX = GRID_OFFSET_X + 10;
    const barY = GRID_OFFSET_Y - 45;
    this.bossShieldIndicator = this.add.graphics();
    this.bossShieldIndicator.lineStyle(2, 0xffdd44, 0.8);
    this.bossShieldIndicator.strokeRoundedRect(barX - 2, barY - 2, barWidth + 4, 20, 5);
    this.bossShieldIndicator.setDepth(16);

    // Auto-remove after shield duration (read from boss ability state)
    const shieldDuration = this.bossEnemy?.bossAbilityState?.ability.duration ?? 4;
    this.time.delayedCall(shieldDuration * 1000, () => {
      if (this.bossShieldIndicator) {
        this.bossShieldIndicator.destroy();
        this.bossShieldIndicator = null;
      }
    });
  }

  // ============================================================
  // Save / Load
  // ============================================================

  private saveGame(): void {
    const towers = this.towerManager.getAllTowers().map((tower: Tower) => tower.toSaveData());
    SaveManager.save(
      {
        digibytes: this.digibytes,
        lives: this.lives,
        currentWave: this.currentWave,
        gameMode: 'normal',
        hasUsedFreeSpawn: this.hasUsedFreeSpawn,
      },
      towers,
    );
  }

  private loadSavedGame(): void {
    const loadData = this.registry.get('loadSave');
    if (!loadData) return;

    // Clear the flag so we don't reload next time
    this.registry.remove('loadSave');

    const save = SaveManager.load();
    if (!save) return;

    this.digibytes = save.gameState.digibytes;
    this.lives = save.gameState.lives;
    this.currentWave = save.gameState.currentWave;

    // Loaded saves default to true (no free spawn on resume)
    this.hasUsedFreeSpawn = save.gameState.hasUsedFreeSpawn ?? true;
    this.registry.set('hasUsedFreeSpawn', this.hasUsedFreeSpawn);

    this.waveText.setText(`${this.currentWave} / ${TOTAL_WAVES_MVP}`);
    this.livesText.setText(`${this.lives}`);
    this.digibytesText.setText(`${this.digibytes}`);

    // Ensure selectedStarters is set for ghost preview / HUD display
    if (!this.registry.get('selectedStarters') && save.towers.length > 0) {
      const starterIds = [...new Set(save.towers.map(t => t.digimonId))];
      this.registry.set('selectedStarters', starterIds.slice(0, 3));
    }

    // Restore towers from save data
    for (const towerData of save.towers) {
      try {
        const tower = new Tower(
          this,
          towerData.gridPosition.col,
          towerData.gridPosition.row,
          towerData.digimonId,
          towerData.originStage as Stage,
        );
        tower.setLevel(towerData.level);
        tower.dp = towerData.dp;
        tower.targetPriority = towerData.targetPriority as TargetPriority;
        this.towerContainer.add(tower);
      } catch {
        // Skip invalid tower data
      }
    }
  }

  // ============================================================
  // HUD
  // ============================================================

  private createHUD(): void {
    const hudY = 10;
    const rightPanelX = GRID_OFFSET_X + GRID.COLUMNS * GRID.CELL_SIZE + 30;
    const panelW = 270;

    // HUD panel background
    const hudPanelBg = this.add.graphics();
    drawPanel(hudPanelBg, rightPanelX - 15, 0, panelW, GAME_HEIGHT, {
      borderColor: COLORS.CYAN_DIM, borderAlpha: 0.3,
    });
    hudPanelBg.setDepth(9);

    // Stat cards - small grouped backgrounds for visual hierarchy
    const statCardGfx = this.add.graphics().setDepth(9);

    // Wave stat card
    statCardGfx.fillStyle(COLORS.BG_CARD, 0.6);
    statCardGfx.fillRoundedRect(rightPanelX - 5, hudY, panelW - 20, 40, 4);

    // Lives + DB stat card
    statCardGfx.fillStyle(COLORS.BG_CARD, 0.6);
    statCardGfx.fillRoundedRect(rightPanelX - 5, hudY + 46, (panelW - 25) / 2, 40, 4);
    statCardGfx.fillRoundedRect(rightPanelX - 5 + (panelW - 25) / 2 + 5, hudY + 46, (panelW - 25) / 2, 40, 4);

    // Wave label + value
    this.add.text(rightPanelX + 4, hudY + 4, 'WAVE', TEXT_STYLES.HUD_LABEL).setDepth(10);
    this.waveText = this.add.text(rightPanelX + 4, hudY + 18, `${this.currentWave} / ${TOTAL_WAVES_MVP}`, TEXT_STYLES.HUD_VALUE)
      .setDepth(10);

    // Lives label + value (left half)
    this.add.text(rightPanelX + 4, hudY + 50, 'LIVES', TEXT_STYLES.HUD_LABEL).setDepth(10);
    this.livesText = this.add.text(rightPanelX + 4, hudY + 64, `${this.lives}`, {
      ...TEXT_STYLES.HUD_VALUE, color: COLORS.TEXT_LIVES,
    }).setDepth(10);

    // DigiBytes label + value (right half)
    const dbX = rightPanelX + (panelW - 25) / 2 + 4;
    this.add.text(dbX, hudY + 50, 'DB', TEXT_STYLES.HUD_LABEL).setDepth(10);
    this.digibytesText = this.add.text(dbX, hudY + 64, `${this.digibytes}`, {
      ...TEXT_STYLES.HUD_VALUE, color: COLORS.TEXT_CURRENCY,
    }).setDepth(10);

    // Separator
    const sepGfx = this.add.graphics().setDepth(10);
    drawSeparator(sepGfx, rightPanelX - 10, hudY + 95, rightPanelX + panelW - 30);

    // Selected starters display (hidden after first tower placement)
    const selectedStarters: string[] = this.registry.get('selectedStarters') || [];
    if (selectedStarters.length > 0) {
      const starterLabel = this.add.text(rightPanelX, hudY + 107, 'Starters:', TEXT_STYLES.HUD_LABEL).setDepth(10);
      this.starterDisplayObjects.push(starterLabel);

      selectedStarters.forEach((key, index) => {
        if (this.textures.exists(key)) {
          const starterSprite = this.add.image(
            rightPanelX + 20 + index * 50, hudY + 148, key,
          );
          starterSprite.setScale(2.5).setDepth(10);
          this.starterDisplayObjects.push(starterSprite);
        }
      });
    }

    // Start Wave button (Container + Graphics)
    const btnW = 220;
    const btnH = 44;
    this.startWaveBtn = this.add.container(rightPanelX + panelW / 2 - 15, hudY + 200);
    this.startWaveBtnBg = this.add.graphics();
    drawButton(this.startWaveBtnBg, btnW, btnH, COLORS.PRIMARY);
    this.startWaveBtn.add(this.startWaveBtnBg);

    this.startWaveBtnText = this.add.text(0, 0, 'Start Wave', TEXT_STYLES.BUTTON).setOrigin(0.5);
    this.startWaveBtn.add(this.startWaveBtnText);

    const startHitArea = new Phaser.Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH);
    this.startWaveBtn.setInteractive(startHitArea, Phaser.Geom.Rectangle.Contains);
    this.startWaveBtn.input!.cursor = 'pointer';
    this.startWaveBtn.setDepth(10);

    this.startWaveBtn.on('pointerover', () => {
      if (!this.isWaveActive) {
        drawButton(this.startWaveBtnBg, btnW, btnH, COLORS.PRIMARY_HOVER, { glowRing: true });
        animateButtonHover(this, this.startWaveBtn, true);
      }
    });
    this.startWaveBtn.on('pointerout', () => {
      if (!this.isWaveActive) {
        drawButton(this.startWaveBtnBg, btnW, btnH, COLORS.PRIMARY);
        animateButtonHover(this, this.startWaveBtn, false);
      }
    });
    this.startWaveBtn.on('pointerdown', () => {
      if (!this.isWaveActive) {
        animateButtonPress(this, this.startWaveBtn);
        this.startNextWave();
      }
    });

    // Auto-start toggle (below start wave button)
    const autoW = 220;
    const autoH = 28;
    const autoContainer = this.add.container(rightPanelX + panelW / 2 - 15, hudY + 250);
    this.autoStartBtnBg = this.add.graphics();
    drawButton(this.autoStartBtnBg, autoW, autoH, COLORS.BG_PANEL_LIGHT);
    autoContainer.add(this.autoStartBtnBg);

    this.autoStartBtnText = this.add.text(0, 0, 'Auto Start: OFF', {
      ...TEXT_STYLES.BUTTON_SM,
      fontSize: '12px',
    }).setOrigin(0.5);
    autoContainer.add(this.autoStartBtnText);

    const autoHitArea = new Phaser.Geom.Rectangle(-autoW / 2, -autoH / 2, autoW, autoH);
    autoContainer.setInteractive(autoHitArea, Phaser.Geom.Rectangle.Contains);
    autoContainer.input!.cursor = 'pointer';
    autoContainer.setDepth(10);

    autoContainer.on('pointerdown', () => {
      this.autoStartWave = !this.autoStartWave;
      this.updateAutoStartDisplay();
      animateButtonPress(this, autoContainer);
    });
    autoContainer.on('pointerover', () => {
      drawButton(this.autoStartBtnBg, autoW, autoH, COLORS.BG_HOVER);
    });
    autoContainer.on('pointerout', () => {
      this.updateAutoStartDisplay();
    });

    // Pause & Settings buttons side by side
    const smallBtnW = 105;
    const smallBtnH = 36;
    const btnRowY = hudY + 290;
    const btnRowCenterX = rightPanelX + panelW / 2 - 15;

    // Pause button (left)
    const pauseContainer = this.add.container(btnRowCenterX - smallBtnW / 2 - 8, btnRowY);
    const pauseBtnBg = this.add.graphics();
    drawButton(pauseBtnBg, smallBtnW, smallBtnH, COLORS.PRIMARY);
    pauseContainer.add(pauseBtnBg);

    const pauseBtnText = this.add.text(0, 0, '|| Pause', TEXT_STYLES.BUTTON_SM).setOrigin(0.5);
    pauseContainer.add(pauseBtnText);

    const pauseHitArea = new Phaser.Geom.Rectangle(-smallBtnW / 2, -smallBtnH / 2, smallBtnW, smallBtnH);
    pauseContainer.setInteractive(pauseHitArea, Phaser.Geom.Rectangle.Contains);
    pauseContainer.input!.cursor = 'pointer';
    pauseContainer.setDepth(10);

    pauseContainer.on('pointerover', () => {
      drawButton(pauseBtnBg, smallBtnW, smallBtnH, COLORS.PRIMARY_HOVER, { glowRing: true });
      animateButtonHover(this, pauseContainer, true);
    });
    pauseContainer.on('pointerout', () => {
      drawButton(pauseBtnBg, smallBtnW, smallBtnH, COLORS.PRIMARY);
      animateButtonHover(this, pauseContainer, false);
    });
    pauseContainer.on('pointerdown', () => {
      animateButtonPress(this, pauseContainer);
      this.scene.launch('PauseScene');
      this.scene.pause();
    });

    // Settings button (right, gear icon)
    const settingsContainer = this.add.container(btnRowCenterX + smallBtnW / 2 + 8, btnRowY);
    const settingsBtnBg = this.add.graphics();
    drawButton(settingsBtnBg, smallBtnW, smallBtnH, COLORS.BG_PANEL_LIGHT);
    settingsContainer.add(settingsBtnBg);

    const settingsBtnText = this.add.text(0, 0, '\u2699 Settings', TEXT_STYLES.BUTTON_SM).setOrigin(0.5);
    settingsContainer.add(settingsBtnText);

    const settingsHitArea = new Phaser.Geom.Rectangle(-smallBtnW / 2, -smallBtnH / 2, smallBtnW, smallBtnH);
    settingsContainer.setInteractive(settingsHitArea, Phaser.Geom.Rectangle.Contains);
    settingsContainer.input!.cursor = 'pointer';
    settingsContainer.setDepth(10);

    settingsContainer.on('pointerover', () => {
      drawButton(settingsBtnBg, smallBtnW, smallBtnH, COLORS.BG_HOVER, { glowRing: true });
      animateButtonHover(this, settingsContainer, true);
    });
    settingsContainer.on('pointerout', () => {
      drawButton(settingsBtnBg, smallBtnW, smallBtnH, COLORS.BG_PANEL_LIGHT);
      animateButtonHover(this, settingsContainer, false);
    });
    settingsContainer.on('pointerdown', () => {
      animateButtonPress(this, settingsContainer);
      this.scene.launch('SettingsScene');
    });

    // Speed control buttons (1x / 2x / 3x)
    this.add.text(rightPanelX, hudY + 326, 'SPEED', TEXT_STYLES.HUD_LABEL).setDepth(10);

    GAME_SPEEDS.forEach((speed, i) => {
      const sBtnW = 60;
      const sBtnH = 30;
      const sBtnX = rightPanelX + 15 + i * 75 + sBtnW / 2;
      const sBtnY = hudY + 352;

      const sContainer = this.add.container(sBtnX, sBtnY);
      const sBg = this.add.graphics();
      drawButton(sBg, sBtnW, sBtnH, speed === 1 ? COLORS.CYAN : COLORS.BG_PANEL_LIGHT);
      sContainer.add(sBg);

      const sText = this.add.text(0, 0, `${speed}x`, TEXT_STYLES.BUTTON_SM).setOrigin(0.5);
      sContainer.add(sText);

      const sHitArea = new Phaser.Geom.Rectangle(-sBtnW / 2, -sBtnH / 2, sBtnW, sBtnH);
      sContainer.setInteractive(sHitArea, Phaser.Geom.Rectangle.Contains);
      sContainer.input!.cursor = 'pointer';
      sContainer.setDepth(10);

      sContainer.on('pointerover', () => {
        if (this.gameSpeed !== speed) {
          drawButton(sBg, sBtnW, sBtnH, COLORS.BG_HOVER);
        }
      });
      sContainer.on('pointerout', () => {
        if (this.gameSpeed !== speed) {
          drawButton(sBg, sBtnW, sBtnH, COLORS.BG_PANEL_LIGHT);
        }
      });
      sContainer.on('pointerdown', () => {
        animateButtonPress(this, sContainer);
        this.setGameSpeed(speed);
      });

      this.speedBtnBgs.push(sBg);
      this.speedBtnTexts.push(sText);
    });

    // Wave preview section
    const previewY = hudY + 392;
    const waveSepGfx = this.add.graphics().setDepth(10);
    drawSeparator(waveSepGfx, rightPanelX - 10, previewY, rightPanelX + panelW - 30);

    this.add.text(rightPanelX, previewY + 8, 'Next Wave:', TEXT_STYLES.HUD_LABEL).setDepth(10);
    this.wavePreviewText = this.add.text(rightPanelX, previewY + 26, '', {
      fontFamily: FONTS.MONO,
      fontSize: '11px',
      color: COLORS.TEXT_DIM,
      wordWrap: { width: panelW - 40 },
      lineSpacing: 2,
    }).setDepth(10);

    this.updateWavePreview();
  }

  // ============================================================
  // Wave Preview
  // ============================================================

  private updateWavePreview(): void {
    if (!this.wavePreviewText) return;

    // Clear old preview sprites
    for (const obj of this.wavePreviewSprites) {
      obj.destroy();
    }
    this.wavePreviewSprites = [];

    const waveConfig = getWaveConfig(this.currentWave);
    if (!waveConfig) {
      this.wavePreviewText.setText('No data');
      return;
    }

    let totalEnemies = 0;
    for (const entry of waveConfig.enemies) totalEnemies += entry.count;
    if (waveConfig.boss) totalEnemies++;

    const header = `Wave ${this.currentWave} (${totalEnemies} enemies)`;
    this.wavePreviewText.setText(header);
    this.wavePreviewText.setColor(waveConfig.boss ? '#ff8844' : COLORS.TEXT_DIM);

    // Render visual enemy entries with sprites
    const rightPanelX = GRID_OFFSET_X + GRID.COLUMNS * GRID.CELL_SIZE + 30;
    const previewBaseY = this.wavePreviewText.y + 18;
    let yOffset = 0;

    const TYPE_COLORS: Record<string, string> = {
      swarm: '#88cc44',
      standard: '#aaaaaa',
      tank: '#6688cc',
      speedster: '#ffaa00',
      flying: '#cc88ff',
      regen: '#44cc88',
      shielded: '#4488ff',
      splitter: '#ff88cc',
    };

    for (const entry of waveConfig.enemies) {
      const enemyStats = DIGIMON_DATABASE.enemies[entry.id];
      if (!enemyStats) continue;

      const spriteKey = entry.id.replace(/^(enemy_|boss_)/, '');
      const rowY = previewBaseY + yOffset;

      // Small sprite
      if (this.textures.exists(spriteKey)) {
        const sprite = this.add.image(rightPanelX + 12, rowY + 8, spriteKey);
        sprite.setScale(1.5).setDepth(10);
        this.wavePreviewSprites.push(sprite);
      }

      // Name + count
      const nameText = this.add.text(rightPanelX + 28, rowY, `${enemyStats.name} x${entry.count}`, {
        fontFamily: FONTS.MONO,
        fontSize: '11px',
        color: '#cccccc',
      }).setDepth(10);
      this.wavePreviewSprites.push(nameText);

      // Type tag (skip "standard" as it's redundant)
      if (enemyStats.type !== 'standard') {
        const typeColor = TYPE_COLORS[enemyStats.type] ?? '#888888';
        const typeText = this.add.text(rightPanelX + 28, rowY + 13, enemyStats.type, {
          fontFamily: FONTS.MONO,
          fontSize: '9px',
          color: typeColor,
        }).setDepth(10);
        this.wavePreviewSprites.push(typeText);
      }

      yOffset += 28;

      // Limit preview rows to prevent overflow
      if (yOffset > 180) {
        const moreText = this.add.text(rightPanelX + 28, previewBaseY + yOffset, '...', {
          fontFamily: FONTS.MONO,
          fontSize: '11px',
          color: COLORS.TEXT_DIM,
        }).setDepth(10);
        this.wavePreviewSprites.push(moreText);
        break;
      }
    }

    // Boss entry with gold highlight
    if (waveConfig.boss) {
      const bossStats = DIGIMON_DATABASE.enemies[waveConfig.boss];
      if (bossStats) {
        const rowY = previewBaseY + yOffset;
        const bossSpriteKey = waveConfig.boss.replace(/^boss_/, '');

        if (this.textures.exists(bossSpriteKey)) {
          const sprite = this.add.image(rightPanelX + 12, rowY + 8, bossSpriteKey);
          sprite.setScale(1.5).setDepth(10);
          this.wavePreviewSprites.push(sprite);
        }

        const bossText = this.add.text(rightPanelX + 28, rowY, `BOSS: ${bossStats.name}`, {
          fontFamily: FONTS.MONO,
          fontSize: '11px',
          color: '#ffaa44',
          fontStyle: 'bold',
        }).setDepth(10);
        this.wavePreviewSprites.push(bossText);

        if (bossStats.bossAbility) {
          const abilityText = this.add.text(rightPanelX + 28, rowY + 13, bossStats.bossAbility.name, {
            fontFamily: FONTS.MONO,
            fontSize: '9px',
            color: '#ff8844',
            fontStyle: 'italic',
          }).setDepth(10);
          this.wavePreviewSprites.push(abilityText);
        }
      }
    }
  }

  // ============================================================
  // Game Speed
  // ============================================================

  private setGameSpeed(speed: number): void {
    this.gameSpeed = speed;
    this.time.timeScale = speed;

    // Update button highlights
    GAME_SPEEDS.forEach((s, i) => {
      if (this.speedBtnBgs[i]) {
        drawButton(this.speedBtnBgs[i], 60, 30, s === speed ? COLORS.CYAN : COLORS.BG_PANEL_LIGHT);
      }
    });
  }

  // ============================================================
  // Auto Start
  // ============================================================

  private updateAutoStartDisplay(): void {
    if (this.autoStartWave) {
      this.autoStartBtnText.setText('Auto Start: ON');
      drawButton(this.autoStartBtnBg, 220, 28, COLORS.CYAN);
    } else {
      this.autoStartBtnText.setText('Auto Start: OFF');
      drawButton(this.autoStartBtnBg, 220, 28, COLORS.BG_PANEL_LIGHT);
    }
  }

  private startNextWave(): void {
    if (this.isWaveActive) return;
    this.isWaveActive = true;
    drawButton(this.startWaveBtnBg, 220, 44, COLORS.DISABLED);
    this.startWaveBtnText.setText('Wave in progress...');
    this.startWaveBtnText.setColor(COLORS.DISABLED_TEXT);
    this.waveManager.startWave(this.currentWave);
  }

  // ============================================================
  // Starter Display
  // ============================================================

  private hideStarterDisplay(): void {
    for (const obj of this.starterDisplayObjects) {
      if (obj && 'setVisible' in obj) {
        (obj as unknown as { setVisible(v: boolean): void }).setVisible(false);
      }
    }
  }

  // ============================================================
  // Event Handlers
  // ============================================================

  private onEnemyDied(data: { reward: number }) {
    this.digibytes += data.reward;
    this.digibytesText.setText(`${this.digibytes}`);
    EventBus.emit(GameEvents.DIGIBYTES_CHANGED, this.digibytes);
  }

  private onEnemyReachedBase() {
    this.lives -= 1;
    this.livesText.setText(`${this.lives}`);
    if (this.lives <= 0) {
      EventBus.emit(GameEvents.GAME_OVER);
      this.scene.start('GameOverScene', { wave: this.currentWave, won: false });
    }
  }

  private updateLivesDisplay(lives: number) {
    this.lives = lives;
    this.livesText.setText(`${this.lives}`);
  }

  private updateDigibytesDisplay(amount: number) {
    this.digibytes = amount;
    this.digibytesText.setText(`${this.digibytes}`);
  }

  private onSpawnRequested(data: { col: number; row: number }) {
    this.towerInfoPanel.hide();
    this.spawnMenu.show(data.col, data.row);
  }

  private onTowerSelected(tower: Tower) {
    this.spawnMenu.hide();
    this.towerInfoPanel.show(tower);
  }

  private onTowerPlaced() {
    if (!this.hasUsedFreeSpawn) {
      this.hasUsedFreeSpawn = true;
      this.registry.set('hasUsedFreeSpawn', true);
    }
    // Hide starters display after first tower is placed
    this.hideStarterDisplay();
  }

  // ============================================================
  // Damage Numbers
  // ============================================================

  private onDamageDealt(data: { x: number; y: number; damage: number; multiplier: number }): void {
    if (this.registry.get('showDamageNumbers') === false) return;

    const worldX = GRID_OFFSET_X + data.x;
    const worldY = GRID_OFFSET_Y + data.y;
    this.showDamageNumber(worldX, worldY, data.damage, data.multiplier);
  }

  private showDamageNumber(x: number, y: number, damage: number, multiplier: number): void {
    // Random jitter for visual variety when multiple hits land at once
    const jitterX = (Math.random() - 0.5) * 20; // +/-10px
    const jitterY = (Math.random() - 0.5) * 20;

    const displayDamage = Math.round(damage);
    if (displayDamage <= 0) return;

    // Color based on attribute effectiveness
    let color = '#ffffff'; // neutral
    if (multiplier > 1.0) {
      color = '#44ff44'; // super effective (green)
    } else if (multiplier < 1.0) {
      color = '#ff6666'; // not effective (red)
    }

    // Slightly larger font for big hits (damage >= 50 or super effective)
    const fontSize = (damage >= 50 || multiplier > 1.0) ? '16px' : '14px';

    const dmgText = this.add.text(x + jitterX, y + jitterY, `${displayDamage}`, {
      fontFamily: FONTS.MONO,
      fontSize: fontSize,
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(50);

    // Float up 40px over 600ms, fade out, then destroy
    this.tweens.add({
      targets: dmgText,
      y: dmgText.y - 40,
      alpha: { from: 1, to: 0 },
      duration: 600,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        dmgText.destroy();
      },
    });
  }

  private onWaveCompleted(data: { wave: number }) {
    this.isWaveActive = false;

    // Wave completion reward
    const waveReward = 65 + (data.wave * 13);
    this.digibytes += waveReward;
    this.digibytesText.setText(`${this.digibytes}`);
    EventBus.emit(GameEvents.DIGIBYTES_CHANGED, this.digibytes);

    // Auto-save after each wave
    this.saveGame();

    // Check for victory (all MVP waves cleared)
    if (this.currentWave >= TOTAL_WAVES_MVP) {
      EventBus.emit(GameEvents.GAME_WON);
      this.scene.start('GameOverScene', { wave: this.currentWave, won: true });
      return;
    }

    // Advance to next wave
    this.currentWave++;
    this.waveText.setText(`${this.currentWave} / ${TOTAL_WAVES_MVP}`);

    // Update wave preview for next wave
    this.updateWavePreview();

    // Re-enable start wave button
    this.startWaveBtnText.setText('Start Wave');
    this.startWaveBtnText.setColor(COLORS.TEXT_WHITE);
    drawButton(this.startWaveBtnBg, 220, 44, COLORS.PRIMARY);

    // Auto-start next wave after a brief delay
    if (this.autoStartWave) {
      this.time.delayedCall(2000, () => {
        if (this.autoStartWave && !this.isWaveActive) {
          this.startNextWave();
        }
      });
    }
  }
}
