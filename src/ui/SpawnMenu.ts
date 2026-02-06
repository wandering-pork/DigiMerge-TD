import Phaser from 'phaser';
import { Stage, Attribute, SpawnType, STAGE_NAMES } from '@/types';
import { SPAWN_COSTS, GRID, GRID_OFFSET_X, GRID_OFFSET_Y } from '@/config/Constants';
import { DIGIMON_DATABASE } from '@/data/DigimonDatabase';
import { EVOLUTION_PATHS } from '@/data/EvolutionPaths';
import { EventBus, GameEvents } from '@/utils/EventBus';
import { Tower } from '@/entities/Tower';

/**
 * Given a list of selected starter IDs (In-Training stage), return all
 * Digimon IDs available at the requested stage by following default
 * evolution paths forward.
 */
export function getAvailableDigimonAtStage(
  selectedStarters: string[],
  targetStage: Stage,
): string[] {
  const results: string[] = [];

  for (const starterId of selectedStarters) {
    const starterStats = DIGIMON_DATABASE.towers[starterId];
    if (!starterStats) continue;

    if (starterStats.stageTier === targetStage) {
      results.push(starterId);
      continue;
    }

    // Walk the default evolution chain until we reach the target stage
    let currentId = starterId;
    let currentStage = starterStats.stageTier;

    while (currentStage < targetStage) {
      const paths = EVOLUTION_PATHS[currentId];
      if (!paths || paths.length === 0) break;

      // Follow default path
      const defaultPath = paths.find(p => p.isDefault);
      if (!defaultPath) break;

      currentId = defaultPath.resultId;
      const nextStats = DIGIMON_DATABASE.towers[currentId];
      if (!nextStats) break;

      currentStage = nextStats.stageTier;
    }

    if (currentStage === targetStage) {
      results.push(currentId);
    }
  }

  return results;
}

/**
 * SpawnMenu UI panel. Displayed on the right side of the screen when
 * the player clicks an empty tower slot. Allows choosing a spawn stage
 * and specific Digimon from the selected starters pool.
 */
export class SpawnMenu extends Phaser.GameObjects.Container {
  private panelBg!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;
  private closeBtn!: Phaser.GameObjects.Text;

  // Stage selection buttons
  private stageButtons: Phaser.GameObjects.Text[] = [];
  private selectedStage: Stage = Stage.IN_TRAINING;

  // Digimon selection area
  private digimonListContainer!: Phaser.GameObjects.Container;
  private selectedDigimon: string | null = null;

  // Cost display
  private costText!: Phaser.GameObjects.Text;
  private spawnBtn!: Phaser.GameObjects.Text;

  // State
  private targetCol: number = 0;
  private targetRow: number = 0;
  private selectedStarters: string[] = [];
  private getDigibytes: () => number;
  private spendDigibytes: (amount: number) => boolean;

  // Panel dimensions
  private static readonly PANEL_WIDTH = 260;
  private static readonly PANEL_HEIGHT = 600;

  constructor(
    scene: Phaser.Scene,
    getDigibytes: () => number,
    spendDigibytes: (amount: number) => boolean,
  ) {
    const panelX = GRID_OFFSET_X + GRID.COLUMNS * GRID.CELL_SIZE + 20;
    const panelY = 320;
    super(scene, panelX, panelY);

    this.getDigibytes = getDigibytes;
    this.spendDigibytes = spendDigibytes;
    this.selectedStarters = scene.registry.get('selectedStarters') || [];

    this.buildPanel();
    this.setVisible(false);
    this.setDepth(20);

    scene.add.existing(this);
  }

  // ---------------------------------------------------------------------------
  // Panel Construction
  // ---------------------------------------------------------------------------

  private buildPanel(): void {
    const w = SpawnMenu.PANEL_WIDTH;
    const h = SpawnMenu.PANEL_HEIGHT;

    // Background
    this.panelBg = this.scene.add.graphics();
    this.panelBg.fillStyle(0x1a1a33, 0.95);
    this.panelBg.fillRoundedRect(0, 0, w, h, 8);
    this.panelBg.lineStyle(2, 0x4444aa, 1);
    this.panelBg.strokeRoundedRect(0, 0, w, h, 8);
    this.add(this.panelBg);

    // Title
    this.titleText = this.scene.add.text(w / 2, 15, 'Spawn Digimon', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);
    this.add(this.titleText);

    // Close button
    this.closeBtn = this.scene.add.text(w - 15, 8, 'X', {
      fontSize: '18px',
      color: '#ff6666',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.hide());
    this.add(this.closeBtn);

    // Stage selection label
    const stageLabel = this.scene.add.text(15, 48, 'Stage:', {
      fontSize: '14px',
      color: '#aaaacc',
    });
    this.add(stageLabel);

    // Stage buttons
    const spawnStages = [Stage.IN_TRAINING, Stage.ROOKIE, Stage.CHAMPION] as const;
    spawnStages.forEach((stage, i) => {
      const btn = this.scene.add.text(15 + i * 82, 70, STAGE_NAMES[stage], {
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: '#333355',
        padding: { x: 6, y: 4 },
      })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.selectStage(stage));
      this.add(btn);
      this.stageButtons.push(btn);
    });

    // Digimon list container
    this.digimonListContainer = this.scene.add.container(0, 0);
    this.add(this.digimonListContainer);

    // Cost text
    this.costText = this.scene.add.text(w / 2, h - 85, '', {
      fontSize: '16px',
      color: '#ffdd44',
    }).setOrigin(0.5, 0);
    this.add(this.costText);

    // Spawn button
    this.spawnBtn = this.scene.add.text(w / 2, h - 50, 'Spawn', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#336633',
      padding: { x: 30, y: 8 },
    }).setOrigin(0.5, 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        if (this.selectedDigimon) {
          this.spawnBtn.setStyle({ backgroundColor: '#44aa44' });
        }
      })
      .on('pointerout', () => {
        if (this.selectedDigimon) {
          this.spawnBtn.setStyle({ backgroundColor: '#336633' });
        }
      })
      .on('pointerdown', () => this.doSpawn());
    this.add(this.spawnBtn);

    // Initial state
    this.selectStage(Stage.IN_TRAINING);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Show the spawn menu for the given grid position.
   */
  public show(col: number, row: number): void {
    this.targetCol = col;
    this.targetRow = row;
    this.selectedStarters = this.scene.registry.get('selectedStarters') || [];
    this.selectStage(Stage.IN_TRAINING);
    this.setVisible(true);
  }

  /**
   * Hide the spawn menu.
   */
  public hide(): void {
    this.setVisible(false);
    this.selectedDigimon = null;
  }

  // ---------------------------------------------------------------------------
  // Stage Selection
  // ---------------------------------------------------------------------------

  private selectStage(stage: Stage): void {
    this.selectedStage = stage;
    this.selectedDigimon = null;

    // Highlight active stage button
    const spawnStages = [Stage.IN_TRAINING, Stage.ROOKIE, Stage.CHAMPION];
    this.stageButtons.forEach((btn, i) => {
      if (spawnStages[i] === stage) {
        btn.setStyle({ backgroundColor: '#4444aa', color: '#ffffff' });
      } else {
        btn.setStyle({ backgroundColor: '#333355', color: '#aaaaaa' });
      }
    });

    this.buildDigimonList();
    this.updateCostDisplay();
  }

  // ---------------------------------------------------------------------------
  // Digimon List
  // ---------------------------------------------------------------------------

  private buildDigimonList(): void {
    // Clear existing list
    this.digimonListContainer.removeAll(true);

    const available = getAvailableDigimonAtStage(this.selectedStarters, this.selectedStage);
    const startY = 105;
    const itemHeight = 56;

    if (available.length === 0) {
      const noDigimon = this.scene.add.text(SpawnMenu.PANEL_WIDTH / 2, startY + 20, 'No Digimon available', {
        fontSize: '13px',
        color: '#666688',
      }).setOrigin(0.5, 0);
      this.digimonListContainer.add(noDigimon);
      return;
    }

    // "Random" option first
    this.addDigimonOption('__random__', 'Random', null, startY, 0);

    // Specific Digimon options
    available.forEach((digimonId, index) => {
      const stats = DIGIMON_DATABASE.towers[digimonId];
      if (!stats) return;
      this.addDigimonOption(digimonId, stats.name, digimonId, startY + (index + 1) * itemHeight, index + 1);
    });
  }

  private addDigimonOption(
    id: string,
    label: string,
    spriteKey: string | null,
    y: number,
    _index: number,
  ): void {
    const itemContainer = this.scene.add.container(15, y);

    // Background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x222244, 0.8);
    bg.fillRoundedRect(0, 0, SpawnMenu.PANEL_WIDTH - 30, 48, 4);
    itemContainer.add(bg);

    // Sprite (if available)
    if (spriteKey && this.scene.textures.exists(spriteKey)) {
      const sprite = this.scene.add.image(24, 24, spriteKey);
      sprite.setScale(2.5);
      itemContainer.add(sprite);
    } else if (id === '__random__') {
      const questionMark = this.scene.add.text(24, 24, '?', {
        fontSize: '24px',
        color: '#ffdd44',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      itemContainer.add(questionMark);
    }

    // Name
    const nameText = this.scene.add.text(50, 8, label, {
      fontSize: '14px',
      color: '#ffffff',
    });
    itemContainer.add(nameText);

    // Attribute + cost info
    if (spriteKey) {
      const stats = DIGIMON_DATABASE.towers[spriteKey];
      if (stats) {
        const attrText = this.scene.add.text(50, 26, `${stats.attribute === Attribute.VACCINE ? 'Vaccine' : stats.attribute === Attribute.DATA ? 'Data' : stats.attribute === Attribute.VIRUS ? 'Virus' : 'Free'}`, {
          fontSize: '11px',
          color: '#888899',
        });
        itemContainer.add(attrText);
      }
    } else if (id === '__random__') {
      const costInfo = this.scene.add.text(50, 26, 'Cheapest option', {
        fontSize: '11px',
        color: '#888899',
      });
      itemContainer.add(costInfo);
    }

    // Hit area for selection
    const hitArea = new Phaser.Geom.Rectangle(0, 0, SpawnMenu.PANEL_WIDTH - 30, 48);
    itemContainer.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    itemContainer.input!.cursor = 'pointer';

    itemContainer.on('pointerdown', () => {
      this.selectedDigimon = id;
      this.highlightSelected();
      this.updateCostDisplay();
    });

    itemContainer.on('pointerover', () => {
      if (this.selectedDigimon !== id) {
        bg.clear();
        bg.fillStyle(0x333366, 0.8);
        bg.fillRoundedRect(0, 0, SpawnMenu.PANEL_WIDTH - 30, 48, 4);
      }
    });

    itemContainer.on('pointerout', () => {
      if (this.selectedDigimon !== id) {
        bg.clear();
        bg.fillStyle(0x222244, 0.8);
        bg.fillRoundedRect(0, 0, SpawnMenu.PANEL_WIDTH - 30, 48, 4);
      }
    });

    // Store id on the container for highlighting
    (itemContainer as any)._spawnOptionId = id;
    (itemContainer as any)._bg = bg;

    this.digimonListContainer.add(itemContainer);
  }

  private highlightSelected(): void {
    for (const child of this.digimonListContainer.list) {
      const container = child as Phaser.GameObjects.Container;
      const optionId = (container as any)._spawnOptionId;
      const bg = (container as any)._bg as Phaser.GameObjects.Graphics;
      if (!bg) continue;

      bg.clear();
      if (optionId === this.selectedDigimon) {
        bg.fillStyle(0x4444aa, 0.9);
      } else {
        bg.fillStyle(0x222244, 0.8);
      }
      bg.fillRoundedRect(0, 0, SpawnMenu.PANEL_WIDTH - 30, 48, 4);
    }
  }

  // ---------------------------------------------------------------------------
  // Cost Display
  // ---------------------------------------------------------------------------

  private getSpawnCost(): number {
    const stageCosts = SPAWN_COSTS[this.selectedStage as keyof typeof SPAWN_COSTS];
    if (!stageCosts) return 0;

    if (this.selectedDigimon === '__random__') {
      return stageCosts.random;
    } else if (this.selectedDigimon) {
      return stageCosts.specific;
    }
    return stageCosts.random;
  }

  private updateCostDisplay(): void {
    if (!this.selectedDigimon) {
      this.costText.setText('Select a Digimon');
      this.spawnBtn.setStyle({ backgroundColor: '#333333', color: '#666666' });
      return;
    }

    const cost = this.getSpawnCost();
    const canAfford = this.getDigibytes() >= cost;

    this.costText.setText(`Cost: ${cost} DB`);
    this.costText.setColor(canAfford ? '#ffdd44' : '#ff4444');

    if (canAfford) {
      this.spawnBtn.setStyle({ backgroundColor: '#336633', color: '#ffffff' });
    } else {
      this.spawnBtn.setStyle({ backgroundColor: '#333333', color: '#666666' });
    }
  }

  // ---------------------------------------------------------------------------
  // Spawning
  // ---------------------------------------------------------------------------

  private doSpawn(): void {
    if (!this.selectedDigimon) return;

    const cost = this.getSpawnCost();
    if (!this.spendDigibytes(cost)) return;

    let digimonId: string;

    if (this.selectedDigimon === '__random__') {
      const available = getAvailableDigimonAtStage(this.selectedStarters, this.selectedStage);
      if (available.length === 0) return;
      digimonId = available[Math.floor(Math.random() * available.length)];
    } else {
      digimonId = this.selectedDigimon;
    }

    // Create tower
    const tower = new Tower(this.scene, this.targetCol, this.targetRow, digimonId, this.selectedStage);

    // Add to the scene's tower container
    const gameScene = this.scene as any;
    if (gameScene.towerContainer) {
      gameScene.towerContainer.add(tower);
    }

    EventBus.emit(GameEvents.TOWER_PLACED, {
      towerID: tower.towerID,
      digimonId,
      col: this.targetCol,
      row: this.targetRow,
    });

    this.hide();
  }
}
