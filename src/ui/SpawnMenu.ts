import Phaser from 'phaser';
import { Stage, Attribute, SpawnType, STAGE_NAMES } from '@/types';
import { SPAWN_COSTS, GRID, GRID_OFFSET_X, GRID_OFFSET_Y, ALL_STARTER_IDS } from '@/config/Constants';
import { DIGIMON_DATABASE } from '@/data/DigimonDatabase';
import { EVOLUTION_PATHS } from '@/data/EvolutionPaths';
import { EventBus, GameEvents } from '@/utils/EventBus';
import { Tower } from '@/entities/Tower';
import { COLORS, ATTRIBUTE_COLORS_STR, TEXT_STYLES, FONTS } from './UITheme';
import { drawPanel, drawButton, drawSeparator, animateSlideIn, animateSlideOut, animateButtonHover, animateButtonPress } from './UIHelpers';

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
 * All Digimon at a stage from ALL 8 starter lines.
 */
export function getAllDigimonAtStage(targetStage: Stage): string[] {
  return getAvailableDigimonAtStage([...ALL_STARTER_IDS], targetStage);
}

/**
 * Digimon of a specific attribute at a stage from ALL 8 starter lines.
 */
export function getDigimonAtStageByAttribute(targetStage: Stage, attribute: Attribute): string[] {
  return getAllDigimonAtStage(targetStage).filter(id => {
    const stats = DIGIMON_DATABASE.towers[id];
    return stats && stats.attribute === attribute;
  });
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
  private stageButtonContainers: Phaser.GameObjects.Container[] = [];
  private stageButtonBgs: Phaser.GameObjects.Graphics[] = [];
  private selectedStage: Stage = Stage.IN_TRAINING;

  // Digimon selection area
  private digimonListContainer!: Phaser.GameObjects.Container;
  private selectedDigimon: string | null = null;

  // Cost display
  private costText!: Phaser.GameObjects.Text;
  private spawnBtn!: Phaser.GameObjects.Container;
  private spawnBtnBg!: Phaser.GameObjects.Graphics;
  private spawnBtnText!: Phaser.GameObjects.Text;

  // State
  private targetCol: number = 0;
  private targetRow: number = 0;
  private selectedStarters: string[] = [];
  private getDigibytes: () => number;
  private spendDigibytes: (amount: number) => boolean;

  // Panel dimensions
  private static readonly PANEL_WIDTH = 260;
  private static readonly PANEL_HEIGHT = 600;

  // Panel position X (saved for animations)
  private panelBaseX: number;

  constructor(
    scene: Phaser.Scene,
    getDigibytes: () => number,
    spendDigibytes: (amount: number) => boolean,
  ) {
    const panelX = GRID_OFFSET_X + GRID.COLUMNS * GRID.CELL_SIZE + 20;
    const panelY = 320;
    super(scene, panelX, panelY);

    this.panelBaseX = panelX;
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

    // Background — themed panel
    this.panelBg = this.scene.add.graphics();
    drawPanel(this.panelBg, 0, 0, w, h);
    this.add(this.panelBg);

    // Title
    this.titleText = this.scene.add.text(w / 2, 15, 'Spawn Digimon', TEXT_STYLES.PANEL_TITLE).setOrigin(0.5, 0);
    this.add(this.titleText);

    // Close button
    this.closeBtn = this.scene.add.text(w - 15, 8, 'X', {
      ...TEXT_STYLES.PANEL_TITLE,
      color: COLORS.TEXT_LIVES,
    }).setOrigin(0.5, 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.hide());
    this.add(this.closeBtn);

    // Stage selection label
    const stageLabel = this.scene.add.text(15, 48, 'Stage:', TEXT_STYLES.PANEL_LABEL);
    this.add(stageLabel);

    // Stage buttons (Container + Graphics)
    const spawnStages = [Stage.IN_TRAINING, Stage.ROOKIE, Stage.CHAMPION] as const;
    spawnStages.forEach((stage, i) => {
      const btnW = 72;
      const btnH = 26;
      const container = this.scene.add.container(15 + i * 82 + btnW / 2, 70 + btnH / 2);
      const bg = this.scene.add.graphics();
      drawButton(bg, btnW, btnH, COLORS.BG_PANEL_LIGHT);
      container.add(bg);

      const text = this.scene.add.text(0, 0, STAGE_NAMES[stage], TEXT_STYLES.BUTTON_SM).setOrigin(0.5);
      container.add(text);

      const hitArea = new Phaser.Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH);
      container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
      container.input!.cursor = 'pointer';
      container.on('pointerdown', () => this.selectStage(stage));

      this.add(container);
      this.stageButtonContainers.push(container);
      this.stageButtonBgs.push(bg);
    });

    // Digimon list container
    this.digimonListContainer = this.scene.add.container(0, 0);
    this.add(this.digimonListContainer);

    // Cost text
    this.costText = this.scene.add.text(w / 2, h - 85, '', {
      fontFamily: FONTS.MONO,
      fontSize: '16px',
      color: COLORS.TEXT_GOLD,
    }).setOrigin(0.5, 0);
    this.add(this.costText);

    // Spawn button (Container + Graphics)
    const spawnBtnW = 160;
    const spawnBtnH = 38;
    this.spawnBtn = this.scene.add.container(w / 2, h - 50 + spawnBtnH / 2);
    this.spawnBtnBg = this.scene.add.graphics();
    drawButton(this.spawnBtnBg, spawnBtnW, spawnBtnH, COLORS.SUCCESS);
    this.spawnBtn.add(this.spawnBtnBg);

    this.spawnBtnText = this.scene.add.text(0, 0, 'Spawn', TEXT_STYLES.BUTTON).setOrigin(0.5);
    this.spawnBtn.add(this.spawnBtnText);

    const spawnHitArea = new Phaser.Geom.Rectangle(-spawnBtnW / 2, -spawnBtnH / 2, spawnBtnW, spawnBtnH);
    this.spawnBtn.setInteractive(spawnHitArea, Phaser.Geom.Rectangle.Contains);
    this.spawnBtn.input!.cursor = 'pointer';
    this.spawnBtn.on('pointerover', () => {
      if (this.selectedDigimon) {
        drawButton(this.spawnBtnBg, spawnBtnW, spawnBtnH, COLORS.SUCCESS_HOVER, { glowRing: true });
        animateButtonHover(this.scene, this.spawnBtn, true);
      }
    });
    this.spawnBtn.on('pointerout', () => {
      if (this.selectedDigimon) {
        drawButton(this.spawnBtnBg, spawnBtnW, spawnBtnH, COLORS.SUCCESS);
        animateButtonHover(this.scene, this.spawnBtn, false);
      }
    });
    this.spawnBtn.on('pointerdown', () => {
      if (this.selectedDigimon) {
        animateButtonPress(this.scene, this.spawnBtn);
      }
      this.doSpawn();
    });
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
    animateSlideIn(this.scene, this, this.panelBaseX);
  }

  /**
   * Hide the spawn menu.
   */
  public hide(): void {
    animateSlideOut(this.scene, this, this.panelBaseX);
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
    this.stageButtonBgs.forEach((bg, i) => {
      if (spawnStages[i] === stage) {
        drawButton(bg, 72, 26, COLORS.CYAN);
      } else {
        drawButton(bg, 72, 26, COLORS.BG_PANEL_LIGHT);
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

    const startY = 105;
    const itemHeight = 56;

    // Check if any Digimon exist at this stage
    const allAvailable = getAllDigimonAtStage(this.selectedStage);
    if (allAvailable.length === 0) {
      const noDigimon = this.scene.add.text(SpawnMenu.PANEL_WIDTH / 2, startY + 20, 'No Digimon available', {
        fontFamily: FONTS.BODY,
        fontSize: '13px',
        color: COLORS.TEXT_DIM,
      }).setOrigin(0.5, 0);
      this.digimonListContainer.add(noDigimon);
      return;
    }

    let nextIndex = 0;

    // Show individual starter options when free spawn is available at In-Training stage
    if (this.isFreeSpawnAvailable() && this.selectedStage === Stage.IN_TRAINING) {
      for (const starterId of this.selectedStarters) {
        const stats = DIGIMON_DATABASE.towers[starterId];
        if (!stats) continue;
        this.addDigimonOption(
          starterId,
          stats.name,
          starterId,
          startY + nextIndex * itemHeight,
          nextIndex,
          undefined,
          'FREE Starter',
        );
        nextIndex++;
      }
      // Auto-select first starter if only one
      if (this.selectedStarters.length === 1 && this.selectedStarters[0]) {
        this.selectedDigimon = this.selectedStarters[0];
        this.highlightSelected();
        this.updateCostDisplay();
      }
      return;
    }

    // "Random" option - picks from ALL Digimon at this stage
    this.addDigimonOption('__random__', 'Random', null, startY + nextIndex * itemHeight, nextIndex);
    nextIndex++;

    // Attribute-based options
    const attributes: { id: string; label: string; attr: Attribute; color: string }[] = [
      { id: '__attr_vaccine__', label: 'Vaccine', attr: Attribute.VACCINE, color: ATTRIBUTE_COLORS_STR[Attribute.VACCINE] || COLORS.TEXT_WHITE },
      { id: '__attr_data__', label: 'Data', attr: Attribute.DATA, color: ATTRIBUTE_COLORS_STR[Attribute.DATA] || COLORS.TEXT_WHITE },
      { id: '__attr_virus__', label: 'Virus', attr: Attribute.VIRUS, color: ATTRIBUTE_COLORS_STR[Attribute.VIRUS] || COLORS.TEXT_WHITE },
    ];

    attributes.forEach((attrOption) => {
      const availableForAttr = getDigimonAtStageByAttribute(this.selectedStage, attrOption.attr);
      if (availableForAttr.length > 0) {
        this.addDigimonOption(
          attrOption.id,
          attrOption.label,
          null,
          startY + nextIndex * itemHeight,
          nextIndex,
          attrOption.color,
        );
        nextIndex++;
      }
    });
  }

  private addDigimonOption(
    id: string,
    label: string,
    spriteKey: string | null,
    y: number,
    _index: number,
    labelColor?: string,
    subLabel?: string,
  ): void {
    const itemContainer = this.scene.add.container(15, y);

    // Background
    const bg = this.scene.add.graphics();
    bg.fillStyle(COLORS.BG_PANEL_LIGHT, 0.8);
    bg.fillRoundedRect(0, 0, SpawnMenu.PANEL_WIDTH - 30, 48, 4);
    itemContainer.add(bg);

    // Icon based on option type
    if (id === '__random__') {
      const questionMark = this.scene.add.text(24, 24, '?', {
        fontFamily: FONTS.DISPLAY,
        fontSize: '24px',
        color: COLORS.TEXT_GOLD,
        fontStyle: 'bold',
      }).setOrigin(0.5);
      itemContainer.add(questionMark);
    } else if (id.startsWith('__attr_')) {
      // Attribute symbol
      const symbol = id === '__attr_vaccine__' ? 'V' : id === '__attr_data__' ? 'D' : 'X';
      const symbolText = this.scene.add.text(24, 24, symbol, {
        fontFamily: FONTS.DISPLAY,
        fontSize: '22px',
        color: labelColor || COLORS.TEXT_WHITE,
        fontStyle: 'bold',
      }).setOrigin(0.5);
      itemContainer.add(symbolText);
    } else if (spriteKey && this.scene.textures.exists(spriteKey)) {
      const sprite = this.scene.add.image(24, 24, spriteKey);
      sprite.setScale(2.5);
      itemContainer.add(sprite);
    }

    // Name
    const nameText = this.scene.add.text(50, 8, label, {
      fontFamily: FONTS.BODY,
      fontSize: '14px',
      color: labelColor || COLORS.TEXT_WHITE,
    });
    itemContainer.add(nameText);

    // Sub-label
    if (subLabel) {
      const subText = this.scene.add.text(50, 26, subLabel, {
        fontFamily: FONTS.MONO,
        fontSize: '11px',
        color: '#44ff44',
      });
      itemContainer.add(subText);
    } else if (id === '__random__') {
      const costInfo = this.scene.add.text(50, 26, 'Any Digimon (cheapest)', {
        fontFamily: FONTS.BODY,
        fontSize: '11px',
        color: COLORS.TEXT_DIM,
      });
      itemContainer.add(costInfo);
    } else if (id.startsWith('__attr_')) {
      const attrPool = id === '__attr_vaccine__'
        ? getDigimonAtStageByAttribute(this.selectedStage, Attribute.VACCINE)
        : id === '__attr_data__'
        ? getDigimonAtStageByAttribute(this.selectedStage, Attribute.DATA)
        : getDigimonAtStageByAttribute(this.selectedStage, Attribute.VIRUS);
      const allNames = attrPool.map(pid => DIGIMON_DATABASE.towers[pid]?.name || pid);
      const maxShow = 3;
      const displayText = allNames.length <= maxShow
        ? allNames.join(', ')
        : allNames.slice(0, maxShow).join(', ') + ` & ${allNames.length - maxShow} more`;
      const subText = this.scene.add.text(50, 26, displayText, {
        fontFamily: FONTS.BODY,
        fontSize: '10px',
        color: COLORS.TEXT_DIM,
      });
      itemContainer.add(subText);
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
        bg.fillStyle(COLORS.BG_HOVER, 0.8);
        bg.fillRoundedRect(0, 0, SpawnMenu.PANEL_WIDTH - 30, 48, 4);
      }
    });

    itemContainer.on('pointerout', () => {
      if (this.selectedDigimon !== id) {
        bg.clear();
        bg.fillStyle(COLORS.BG_PANEL_LIGHT, 0.8);
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
        bg.fillStyle(COLORS.CYAN_DIM, 0.9);
      } else {
        bg.fillStyle(COLORS.BG_PANEL_LIGHT, 0.8);
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
    } else if (this.selectedDigimon?.startsWith('__attr_')) {
      return stageCosts.specific;
    } else if (this.selectedDigimon) {
      return stageCosts.specific;
    }
    return stageCosts.random;
  }

  private updateCostDisplay(): void {
    if (!this.selectedDigimon) {
      this.costText.setText('Select a Digimon');
      this.costText.setColor(COLORS.TEXT_DIM);
      drawButton(this.spawnBtnBg, 160, 38, COLORS.DISABLED);
      this.spawnBtnText.setColor(COLORS.DISABLED_TEXT);
      return;
    }

    const effectiveCost = this.getEffectiveSpawnCost();

    if (effectiveCost === 0) {
      this.costText.setText('FREE (first spawn!)');
      this.costText.setColor('#44ff44');
      drawButton(this.spawnBtnBg, 160, 38, COLORS.SUCCESS);
      this.spawnBtnText.setColor('#ffffff');
      return;
    }

    const canAfford = this.getDigibytes() >= effectiveCost;

    this.costText.setText(`Cost: ${effectiveCost} DB`);
    this.costText.setColor(canAfford ? COLORS.TEXT_GOLD : COLORS.TEXT_LIVES);

    if (canAfford) {
      drawButton(this.spawnBtnBg, 160, 38, COLORS.SUCCESS);
      this.spawnBtnText.setColor('#ffffff');
    } else {
      drawButton(this.spawnBtnBg, 160, 38, COLORS.DISABLED);
      this.spawnBtnText.setColor(COLORS.DISABLED_TEXT);
    }
  }

  // ---------------------------------------------------------------------------
  // Spawning
  // ---------------------------------------------------------------------------

  private getEffectiveSpawnCost(): number {
    if (this.isFreeSpawnAvailable()) {
      return 0;
    }
    return this.getSpawnCost();
  }

  private isFreeSpawnAvailable(): boolean {
    return this.scene.registry.get('hasUsedFreeSpawn') === false;
  }

  private doSpawn(): void {
    if (!this.selectedDigimon) return;

    const cost = this.getEffectiveSpawnCost();
    if (cost > 0 && !this.spendDigibytes(cost)) return;
    if (cost === 0 && this.isFreeSpawnAvailable()) {
      // Free spawn: don't charge but still proceed
    }

    let digimonId: string;

    if (this.selectedDigimon === '__random__') {
      // Random picks from ALL 8 starter lines at this stage
      const available = getAllDigimonAtStage(this.selectedStage);
      if (available.length === 0) return;
      digimonId = available[Math.floor(Math.random() * available.length)];
    } else if (this.selectedDigimon === '__attr_vaccine__') {
      const pool = getDigimonAtStageByAttribute(this.selectedStage, Attribute.VACCINE);
      if (pool.length === 0) return;
      digimonId = pool[Math.floor(Math.random() * pool.length)];
    } else if (this.selectedDigimon === '__attr_data__') {
      const pool = getDigimonAtStageByAttribute(this.selectedStage, Attribute.DATA);
      if (pool.length === 0) return;
      digimonId = pool[Math.floor(Math.random() * pool.length)];
    } else if (this.selectedDigimon === '__attr_virus__') {
      const pool = getDigimonAtStageByAttribute(this.selectedStage, Attribute.VIRUS);
      if (pool.length === 0) return;
      digimonId = pool[Math.floor(Math.random() * pool.length)];
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
