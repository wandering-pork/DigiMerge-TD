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
import { Stage, TargetPriority } from '@/types';

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
  private startWaveBtn!: Phaser.GameObjects.Text;

  // Game state
  private currentWave: number = 1;
  private lives: number = STARTING_LIVES;
  private digibytes: number = STARTING_DIGIBYTES;
  private isWaveActive: boolean = false;

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

  // Ghost preview
  private ghostSprite: Phaser.GameObjects.Image | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    this.currentWave = 1;
    this.lives = STARTING_LIVES;
    this.digibytes = STARTING_DIGIBYTES;
    this.isWaveActive = false;
    this.isMergeMode = false;
    this.mergeSourceTower = null;

    // Create layered containers (render order: grid → towers → enemies → projectiles → UI)
    this.towerContainer = this.add.container(GRID_OFFSET_X, GRID_OFFSET_Y);
    this.enemyContainer = this.add.container(GRID_OFFSET_X, GRID_OFFSET_Y);
    this.projectileContainer = this.add.container(GRID_OFFSET_X, GRID_OFFSET_Y);
    this.uiContainer = this.add.container(0, 0);

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

    // Shared currency callbacks
    const getDigibytes = () => this.digibytes;
    const spendDigibytes = (amount: number) => {
      if (this.digibytes >= amount) {
        this.digibytes -= amount;
        this.digibytesText.setText(`DB: ${this.digibytes}`);
        return true;
      }
      return false;
    };
    const addDigibytes = (amount: number) => {
      this.digibytes += amount;
      this.digibytesText.setText(`DB: ${this.digibytes}`);
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

    // Setup ghost preview sprite (hidden by default)
    this.setupGhostPreview();

    // Load saved game if applicable
    this.loadSavedGame();
  }

  update(time: number, delta: number) {
    // Update wave spawning
    this.waveManager.update(time, delta);

    // Update all towers (cooldown timers)
    for (const tower of this.towerContainer.list) {
      if (tower && 'update' in tower && typeof (tower as any).update === 'function') {
        (tower as any).update(time, delta);
      }
    }

    // Update all enemies (path movement)
    for (const enemy of this.enemyContainer.list) {
      if (enemy && 'update' in enemy && typeof (enemy as any).update === 'function') {
        (enemy as any).update(time, delta);
      }
    }

    // Combat: tower targeting, firing, projectile movement
    this.combatManager.update(time, delta);

    // Update boss health bar if active
    this.updateBossBar();
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

    for (let row = 1; row <= GRID.ROWS; row++) {
      for (let col = 1; col <= GRID.COLUMNS; col++) {
        const x = GRID_OFFSET_X + (col - 1) * cellSize;
        const y = GRID_OFFSET_Y + (row - 1) * cellSize;

        if (isPathCell(col, row)) {
          // Path cells - brown/earth tone
          this.gridGraphics.fillStyle(0x3a2a1a, 1);
          this.gridGraphics.fillRect(x, y, cellSize, cellSize);
        } else if (isValidTowerSlot(col, row)) {
          // Tower placement slots - dark green tint
          this.gridGraphics.fillStyle(0x1e2e1e, 1);
          this.gridGraphics.fillRect(x, y, cellSize, cellSize);

          // Subtle border for tower slots
          this.gridGraphics.lineStyle(1, 0x2a3a2a, 0.5);
          this.gridGraphics.strokeRect(x, y, cellSize, cellSize);
        }
      }
    }

    // Spawn indicator
    const spawnX = GRID_OFFSET_X + (GRID.SPAWN.col - 1) * cellSize;
    const spawnY = GRID_OFFSET_Y + (GRID.SPAWN.row - 1) * cellSize;
    this.gridGraphics.fillStyle(0x00aa00, 0.5);
    this.gridGraphics.fillRect(spawnX, spawnY, cellSize, cellSize);
    this.add.text(spawnX + cellSize / 2, spawnY + cellSize / 2, 'S', {
      fontSize: '16px', color: '#00ff00', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1);

    // Base indicator
    const baseX = GRID_OFFSET_X + (GRID.BASE.col - 1) * cellSize;
    const baseY = GRID_OFFSET_Y + (GRID.BASE.row - 1) * cellSize;
    this.gridGraphics.fillStyle(0xaa0000, 0.5);
    this.gridGraphics.fillRect(baseX, baseY, cellSize, cellSize);
    this.add.text(baseX + cellSize / 2, baseY + cellSize / 2, 'B', {
      fontSize: '16px', color: '#ff0000', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1);
  }

  private drawPath(): void {
    this.pathGraphics = this.add.graphics();
    this.pathGraphics.setDepth(1);
    this.pathGraphics.lineStyle(3, 0xaa8844, 0.8);

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
      gfx.lineStyle(3, 0x44ccff, 0.8);
      gfx.strokeRect(cx, cy, GRID.CELL_SIZE, GRID.CELL_SIZE);
      gfx.setDepth(8);
      this.mergeHighlights.push(gfx);
    }

    // Highlight source tower in yellow
    const srcGfx = this.add.graphics();
    const sx = GRID_OFFSET_X + (sourceTower.gridCol - 1) * GRID.CELL_SIZE;
    const sy = GRID_OFFSET_Y + (sourceTower.gridRow - 1) * GRID.CELL_SIZE;
    srcGfx.lineStyle(3, 0xffdd44, 0.8);
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

    this.waveText.setText(`Wave ${this.currentWave} / ${TOTAL_WAVES_MVP}`);
    this.livesText.setText(`Lives: ${this.lives}`);
    this.digibytesText.setText(`DB: ${this.digibytes}`);

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

    // Wave counter
    this.waveText = this.add.text(rightPanelX, hudY, `Wave ${this.currentWave} / ${TOTAL_WAVES_MVP}`, {
      fontSize: '22px', color: '#ffffff', fontStyle: 'bold',
    }).setDepth(10);

    // Lives
    this.livesText = this.add.text(rightPanelX, hudY + 35, `Lives: ${this.lives}`, {
      fontSize: '18px', color: '#ff6666',
    }).setDepth(10);

    // DigiBytes
    this.digibytesText = this.add.text(rightPanelX, hudY + 65, `DB: ${this.digibytes}`, {
      fontSize: '18px', color: '#ffdd44',
    }).setDepth(10);

    // Selected starters display
    const selectedStarters: string[] = this.registry.get('selectedStarters') || [];
    if (selectedStarters.length > 0) {
      this.add.text(rightPanelX, hudY + 110, 'Starters:', {
        fontSize: '16px', color: '#aaaacc',
      }).setDepth(10);

      selectedStarters.forEach((key, index) => {
        if (this.textures.exists(key)) {
          const starterSprite = this.add.image(
            rightPanelX + 20 + index * 50, hudY + 155, key,
          );
          starterSprite.setScale(2.5).setDepth(10);
        }
      });
    }

    // Separator line
    this.add.graphics()
      .lineStyle(1, 0x444466, 1)
      .lineBetween(rightPanelX - 10, hudY + 95, rightPanelX + 250, hudY + 95)
      .setDepth(10);

    // Start Wave button
    this.startWaveBtn = this.add.text(rightPanelX + 90, hudY + 220, 'Start Wave', {
      fontSize: '24px', color: '#ffffff', backgroundColor: '#333366',
      padding: { x: 20, y: 10 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(10)
      .on('pointerover', () => this.startWaveBtn.setStyle({ backgroundColor: '#4444aa' }))
      .on('pointerout', () => {
        if (!this.isWaveActive) {
          this.startWaveBtn.setStyle({ backgroundColor: '#333366' });
        }
      })
      .on('pointerdown', () => {
        if (!this.isWaveActive) {
          this.isWaveActive = true;
          this.startWaveBtn.setStyle({ backgroundColor: '#666666' });
          this.startWaveBtn.setText('Wave in progress...');
          this.waveManager.startWave(this.currentWave);
        }
      });

    // Pause button
    const pauseBtn = this.add.text(rightPanelX + 90, hudY + 280, 'Pause', {
      fontSize: '20px', color: '#ffffff', backgroundColor: '#333366',
      padding: { x: 20, y: 10 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(10)
      .on('pointerover', () => pauseBtn.setStyle({ backgroundColor: '#4444aa' }))
      .on('pointerout', () => pauseBtn.setStyle({ backgroundColor: '#333366' }))
      .on('pointerdown', () => {
        this.scene.launch('PauseScene');
        this.scene.pause();
      });
  }

  // ============================================================
  // Event Handlers
  // ============================================================

  private onEnemyDied(data: { reward: number }) {
    this.digibytes += data.reward;
    this.digibytesText.setText(`DB: ${this.digibytes}`);
  }

  private onEnemyReachedBase() {
    this.lives -= 1;
    this.livesText.setText(`Lives: ${this.lives}`);
    if (this.lives <= 0) {
      EventBus.emit(GameEvents.GAME_OVER);
      this.scene.start('GameOverScene', { wave: this.currentWave, won: false });
    }
  }

  private updateLivesDisplay(lives: number) {
    this.lives = lives;
    this.livesText.setText(`Lives: ${this.lives}`);
  }

  private updateDigibytesDisplay(amount: number) {
    this.digibytes = amount;
    this.digibytesText.setText(`DB: ${this.digibytes}`);
  }

  private onSpawnRequested(data: { col: number; row: number }) {
    this.towerInfoPanel.hide();
    this.spawnMenu.show(data.col, data.row);
  }

  private onTowerSelected(tower: Tower) {
    this.spawnMenu.hide();
    this.towerInfoPanel.show(tower);
  }

  private onWaveCompleted(data: { wave: number }) {
    this.isWaveActive = false;

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
    this.waveText.setText(`Wave ${this.currentWave} / ${TOTAL_WAVES_MVP}`);

    // Re-enable start wave button
    this.startWaveBtn.setText('Start Wave');
    this.startWaveBtn.setStyle({ backgroundColor: '#333366' });
  }
}
