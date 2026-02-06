import Phaser from 'phaser';
import { Tower } from '@/entities/Tower';
import { EventBus, GameEvents } from '@/utils/EventBus';
import { STAGE_NAMES, ATTRIBUTE_NAMES, TargetPriority } from '@/types';
import { getLevelUpCost, canLevelUp, calculateMaxLevel } from '@/systems/LevelSystem';
import { getEvolutions } from '@/data/EvolutionPaths';
import { canMerge, MergeCandidate } from '@/systems/MergeSystem';
import { GRID, GRID_OFFSET_X } from '@/config/Constants';
import { COLORS, ATTRIBUTE_COLORS_STR, TEXT_STYLES, ANIM } from './UITheme';
import { drawPanel, drawButton, drawSeparator, animateSlideIn, animateSlideOut, animateButtonHover, animateButtonPress } from './UIHelpers';

/**
 * Ordered list of target priorities for cycling through with the selector.
 */
const TARGET_PRIORITY_ORDER: TargetPriority[] = [
  TargetPriority.FIRST,
  TargetPriority.LAST,
  TargetPriority.STRONGEST,
  TargetPriority.WEAKEST,
  TargetPriority.FASTEST,
  TargetPriority.CLOSEST,
  TargetPriority.FLYING,
];

/**
 * Human-readable labels for each target priority.
 */
const TARGET_PRIORITY_LABELS: Record<TargetPriority, string> = {
  [TargetPriority.FIRST]: 'First',
  [TargetPriority.LAST]: 'Last',
  [TargetPriority.STRONGEST]: 'Strongest',
  [TargetPriority.WEAKEST]: 'Weakest',
  [TargetPriority.FASTEST]: 'Fastest',
  [TargetPriority.CLOSEST]: 'Closest',
  [TargetPriority.FLYING]: 'Flying',
};

/**
 * TowerInfoPanel - A right-side panel that displays selected tower information
 * and provides controls for level up, target priority, and selling.
 *
 * Shows when a tower is selected (TOWER_SELECTED event) and hides when
 * the tower is deselected (TOWER_DESELECTED event) or ESC is pressed.
 */
export class TowerInfoPanel extends Phaser.GameObjects.Container {
  // Current tower being displayed
  private currentTower: Tower | null = null;

  // Economy callbacks
  private getDigibytes: () => number;
  private spendDigibytes: (amount: number) => boolean;
  private addDigibytes: (amount: number) => void;

  // Panel dimensions
  private static readonly PANEL_WIDTH = 260;
  private static readonly PANEL_HEIGHT = 580;

  // Panel position X (saved for animations)
  private panelBaseX: number;

  // Panel background
  private panelBg!: Phaser.GameObjects.Graphics;

  // Header section
  private nameText!: Phaser.GameObjects.Text;
  private digimonSprite!: Phaser.GameObjects.Image;
  private closeBtn!: Phaser.GameObjects.Text;

  // Stats section
  private levelText!: Phaser.GameObjects.Text;
  private stageText!: Phaser.GameObjects.Text;
  private attributeText!: Phaser.GameObjects.Text;
  private dpText!: Phaser.GameObjects.Text;
  private damageText!: Phaser.GameObjects.Text;
  private speedText!: Phaser.GameObjects.Text;
  private rangeText!: Phaser.GameObjects.Text;

  // Level up section
  private levelUpBtn!: Phaser.GameObjects.Container;
  private levelUpBtnBg!: Phaser.GameObjects.Graphics;
  private levelUpBtnText!: Phaser.GameObjects.Text;

  // Target priority section
  private priorityLabel!: Phaser.GameObjects.Text;
  private priorityBtn!: Phaser.GameObjects.Container;
  private priorityBtnBg!: Phaser.GameObjects.Graphics;
  private priorityBtnText!: Phaser.GameObjects.Text;

  // Sell section
  private sellBtn!: Phaser.GameObjects.Container;
  private sellBtnBg!: Phaser.GameObjects.Graphics;
  private sellBtnText!: Phaser.GameObjects.Text;

  // Digivolve section
  private digivolveBtn!: Phaser.GameObjects.Container;
  private digivolveBtnBg!: Phaser.GameObjects.Graphics;
  private digivolveBtnText!: Phaser.GameObjects.Text;

  // Merge section
  private mergeBtn!: Phaser.GameObjects.Container;
  private mergeBtnBg!: Phaser.GameObjects.Graphics;
  private mergeBtnText!: Phaser.GameObjects.Text;

  // Keyboard listener
  private escKey: Phaser.Input.Keyboard.Key | null = null;

  constructor(
    scene: Phaser.Scene,
    getDigibytes: () => number,
    spendDigibytes: (amount: number) => boolean,
    addDigibytes: (amount: number) => void,
  ) {
    const panelX = GRID_OFFSET_X + GRID.COLUMNS * GRID.CELL_SIZE + 20;
    super(scene, panelX, 100);

    this.panelBaseX = panelX;
    this.getDigibytes = getDigibytes;
    this.spendDigibytes = spendDigibytes;
    this.addDigibytes = addDigibytes;

    this.buildPanel();

    this.setVisible(false);
    this.setDepth(20);
    scene.add.existing(this);

    // Listen for tower events
    EventBus.on(GameEvents.TOWER_SELECTED, this.onTowerSelected, this);
    EventBus.on(GameEvents.TOWER_DESELECTED, this.onTowerDeselected, this);

    // ESC key to close
    if (scene.input.keyboard) {
      this.escKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
      this.escKey.on('down', this.onEscPressed, this);
    }
  }

  // ---------------------------------------------------------------------------
  // Panel Construction
  // ---------------------------------------------------------------------------

  private buildPanel(): void {
    const w = TowerInfoPanel.PANEL_WIDTH;
    const h = TowerInfoPanel.PANEL_HEIGHT;

    // Background — themed 4-layer panel
    this.panelBg = this.scene.add.graphics();
    drawPanel(this.panelBg, 0, 0, w, h);
    this.add(this.panelBg);

    // Close button (top right)
    this.closeBtn = this.scene.add.text(w - 15, 8, 'X', {
      ...TEXT_STYLES.PANEL_TITLE,
      color: COLORS.TEXT_LIVES,
    }).setOrigin(0.5, 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.hide());
    this.add(this.closeBtn);

    // --- Header: Sprite + Name ---
    this.digimonSprite = this.scene.add.image(40, 40, '__DEFAULT');
    this.digimonSprite.setScale(2.5);
    this.digimonSprite.setVisible(false);
    this.add(this.digimonSprite);

    this.nameText = this.scene.add.text(75, 22, '', {
      ...TEXT_STYLES.PANEL_TITLE,
      wordWrap: { width: w - 100 },
    });
    this.add(this.nameText);

    // Separator
    const separator1 = this.scene.add.graphics();
    drawSeparator(separator1, 10, 70, w - 10);
    this.add(separator1);

    // --- Stats Section ---
    const statsX = 15;
    const statsValueX = w - 15;
    let statsY = 82;
    const lineH = 24;

    this.levelText = this.createStatRow('Level', statsX, statsValueX, statsY);
    statsY += lineH;

    this.stageText = this.createStatRow('Stage', statsX, statsValueX, statsY);
    statsY += lineH;

    this.attributeText = this.createStatRow('Attribute', statsX, statsValueX, statsY);
    statsY += lineH;

    this.dpText = this.createStatRow('DP', statsX, statsValueX, statsY);
    statsY += lineH;

    // Second separator
    const separator2 = this.scene.add.graphics();
    drawSeparator(separator2, 10, statsY + 2, w - 10);
    this.add(separator2);
    statsY += 12;

    this.damageText = this.createStatRow('Damage', statsX, statsValueX, statsY);
    statsY += lineH;

    this.speedText = this.createStatRow('Atk Speed', statsX, statsValueX, statsY);
    statsY += lineH;

    this.rangeText = this.createStatRow('Range', statsX, statsValueX, statsY);
    statsY += lineH;

    // Third separator
    const separator3 = this.scene.add.graphics();
    drawSeparator(separator3, 10, statsY + 2, w - 10);
    this.add(separator3);
    statsY += 14;

    // --- Level Up Button ---
    this.levelUpBtn = this.scene.add.container(w / 2, statsY);
    this.levelUpBtnBg = this.scene.add.graphics();
    drawButton(this.levelUpBtnBg, 200, 36, COLORS.SUCCESS);
    this.levelUpBtn.add(this.levelUpBtnBg);

    this.levelUpBtnText = this.scene.add.text(0, 0, 'Level Up (-- DB)', TEXT_STYLES.BUTTON_SM).setOrigin(0.5);
    this.levelUpBtn.add(this.levelUpBtnText);

    const levelUpHitArea = new Phaser.Geom.Rectangle(-100, -18, 200, 36);
    this.levelUpBtn.setInteractive(levelUpHitArea, Phaser.Geom.Rectangle.Contains);
    this.levelUpBtn.input!.cursor = 'pointer';
    this.levelUpBtn.on('pointerdown', () => this.onLevelUp());
    this.levelUpBtn.on('pointerover', () => this.onLevelUpHover(true));
    this.levelUpBtn.on('pointerout', () => this.onLevelUpHover(false));
    this.add(this.levelUpBtn);

    statsY += 50;

    // --- Target Priority Selector ---
    this.priorityLabel = this.scene.add.text(15, statsY, 'Target:', TEXT_STYLES.PANEL_LABEL);
    this.add(this.priorityLabel);

    this.priorityBtn = this.scene.add.container(w / 2 + 30, statsY + 10);
    this.priorityBtnBg = this.scene.add.graphics();
    drawButton(this.priorityBtnBg, 140, 28, COLORS.PRIMARY);
    this.priorityBtn.add(this.priorityBtnBg);

    this.priorityBtnText = this.scene.add.text(0, 0, 'First', TEXT_STYLES.BUTTON_SM).setOrigin(0.5);
    this.priorityBtn.add(this.priorityBtnText);

    // Arrow indicators
    const leftArrow = this.scene.add.text(-60, 0, '<', {
      fontSize: '16px',
      color: COLORS.TEXT_LABEL,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.priorityBtn.add(leftArrow);

    const rightArrow = this.scene.add.text(60, 0, '>', {
      fontSize: '16px',
      color: COLORS.TEXT_LABEL,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.priorityBtn.add(rightArrow);

    const priorityHitArea = new Phaser.Geom.Rectangle(-70, -14, 140, 28);
    this.priorityBtn.setInteractive(priorityHitArea, Phaser.Geom.Rectangle.Contains);
    this.priorityBtn.input!.cursor = 'pointer';
    this.priorityBtn.on('pointerdown', () => this.cyclePriority());
    this.priorityBtn.on('pointerover', () => {
      drawButton(this.priorityBtnBg, 140, 28, COLORS.PRIMARY_HOVER, { glowRing: true });
      animateButtonHover(this.scene, this.priorityBtn, true);
    });
    this.priorityBtn.on('pointerout', () => {
      drawButton(this.priorityBtnBg, 140, 28, COLORS.PRIMARY);
      animateButtonHover(this.scene, this.priorityBtn, false);
    });
    this.add(this.priorityBtn);

    statsY += 50;

    // --- Sell Button ---
    this.sellBtn = this.scene.add.container(w / 2, statsY);
    this.sellBtnBg = this.scene.add.graphics();
    drawButton(this.sellBtnBg, 200, 36, COLORS.DANGER);
    this.sellBtn.add(this.sellBtnBg);

    this.sellBtnText = this.scene.add.text(0, 0, 'Sell (-- DB)', TEXT_STYLES.BUTTON_SM).setOrigin(0.5);
    this.sellBtn.add(this.sellBtnText);

    const sellHitArea = new Phaser.Geom.Rectangle(-100, -18, 200, 36);
    this.sellBtn.setInteractive(sellHitArea, Phaser.Geom.Rectangle.Contains);
    this.sellBtn.input!.cursor = 'pointer';
    this.sellBtn.on('pointerdown', () => this.onSell());
    this.sellBtn.on('pointerover', () => {
      drawButton(this.sellBtnBg, 200, 36, COLORS.DANGER_HOVER, { glowRing: true });
      animateButtonHover(this.scene, this.sellBtn, true);
    });
    this.sellBtn.on('pointerout', () => {
      drawButton(this.sellBtnBg, 200, 36, COLORS.DANGER);
      animateButtonHover(this.scene, this.sellBtn, false);
    });
    this.add(this.sellBtn);

    statsY += 50;

    // --- Digivolve Button (hidden by default, shown at max level) ---
    this.digivolveBtn = this.scene.add.container(w / 2, statsY);
    this.digivolveBtnBg = this.scene.add.graphics();
    drawButton(this.digivolveBtnBg, 200, 36, COLORS.SPECIAL);
    this.digivolveBtn.add(this.digivolveBtnBg);

    this.digivolveBtnText = this.scene.add.text(0, 0, 'Digivolve', TEXT_STYLES.BUTTON_SM).setOrigin(0.5);
    this.digivolveBtn.add(this.digivolveBtnText);

    const digivolveHitArea = new Phaser.Geom.Rectangle(-100, -18, 200, 36);
    this.digivolveBtn.setInteractive(digivolveHitArea, Phaser.Geom.Rectangle.Contains);
    this.digivolveBtn.input!.cursor = 'pointer';
    this.digivolveBtn.on('pointerdown', () => this.onDigivolve());
    this.digivolveBtn.on('pointerover', () => {
      drawButton(this.digivolveBtnBg, 200, 36, COLORS.SPECIAL_HOVER, { glowRing: true });
      animateButtonHover(this.scene, this.digivolveBtn, true);
    });
    this.digivolveBtn.on('pointerout', () => {
      drawButton(this.digivolveBtnBg, 200, 36, COLORS.SPECIAL);
      animateButtonHover(this.scene, this.digivolveBtn, false);
    });
    this.digivolveBtn.setVisible(false);
    this.add(this.digivolveBtn);

    statsY += 44;

    // --- Merge Button ---
    this.mergeBtn = this.scene.add.container(w / 2, statsY);
    this.mergeBtnBg = this.scene.add.graphics();
    drawButton(this.mergeBtnBg, 200, 36, COLORS.MERGE);
    this.mergeBtn.add(this.mergeBtnBg);

    this.mergeBtnText = this.scene.add.text(0, 0, 'Merge', TEXT_STYLES.BUTTON_SM).setOrigin(0.5);
    this.mergeBtn.add(this.mergeBtnText);

    const mergeHitArea = new Phaser.Geom.Rectangle(-100, -18, 200, 36);
    this.mergeBtn.setInteractive(mergeHitArea, Phaser.Geom.Rectangle.Contains);
    this.mergeBtn.input!.cursor = 'pointer';
    this.mergeBtn.on('pointerdown', () => this.onMerge());
    this.mergeBtn.on('pointerover', () => {
      drawButton(this.mergeBtnBg, 200, 36, COLORS.MERGE_HOVER, { glowRing: true });
      animateButtonHover(this.scene, this.mergeBtn, true);
    });
    this.mergeBtn.on('pointerout', () => {
      drawButton(this.mergeBtnBg, 200, 36, COLORS.MERGE);
      animateButtonHover(this.scene, this.mergeBtn, false);
    });
    this.mergeBtn.setVisible(false);
    this.add(this.mergeBtn);
  }

  // ---------------------------------------------------------------------------
  // Helper: Create a stat label + value row
  // ---------------------------------------------------------------------------

  private createStatRow(label: string, labelX: number, valueX: number, y: number): Phaser.GameObjects.Text {
    const labelObj = this.scene.add.text(labelX, y, label, TEXT_STYLES.PANEL_LABEL);
    this.add(labelObj);

    const valueObj = this.scene.add.text(valueX, y, '--', TEXT_STYLES.PANEL_VALUE).setOrigin(1, 0);
    this.add(valueObj);

    return valueObj;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Show the panel for the given tower.
   */
  public show(tower: Tower): void {
    this.currentTower = tower;
    this.refresh();
    animateSlideIn(this.scene, this, this.panelBaseX);
    tower.showRange(true);
  }

  /**
   * Hide the panel and clear the current tower reference.
   */
  public hide(): void {
    if (this.currentTower) {
      this.currentTower.showRange(false);
      this.currentTower.deselect();
      this.currentTower = null;
      EventBus.emit(GameEvents.TOWER_DESELECTED);
    }
    animateSlideOut(this.scene, this, this.panelBaseX);
  }

  /**
   * Update all display values based on the current tower state.
   * Call this after any tower modification (level up, priority change, etc.).
   */
  public refresh(): void {
    const tower = this.currentTower;
    if (!tower) return;

    // Header
    this.nameText.setText(tower.stats.name);

    // Update sprite
    if (this.scene.textures.exists(tower.digimonId)) {
      this.digimonSprite.setTexture(tower.digimonId);
      this.digimonSprite.setVisible(true);
    } else {
      this.digimonSprite.setVisible(false);
    }

    // Stats
    const maxLevel = calculateMaxLevel(tower.stage, tower.dp, tower.originStage, tower.stage);
    this.levelText.setText(`Lv.${tower.level} / ${maxLevel}`);

    this.stageText.setText(STAGE_NAMES[tower.stage]);

    const attrColor = ATTRIBUTE_COLORS_STR[tower.attribute] || '#ffffff';
    this.attributeText.setText(ATTRIBUTE_NAMES[tower.attribute]);
    this.attributeText.setColor(attrColor);

    this.dpText.setText(`${tower.dp}`);

    const damage = tower.getAttackDamage();
    this.damageText.setText(damage.toFixed(1));

    const speed = tower.getAttackSpeed();
    this.speedText.setText(speed.toFixed(2));

    const rangeInCells = tower.getRangeCells();
    this.rangeText.setText(`${rangeInCells.toFixed(1)} cells`);

    // Level Up button
    this.refreshLevelUpButton(maxLevel);

    // Target priority
    this.priorityBtnText.setText(TARGET_PRIORITY_LABELS[tower.targetPriority]);

    // Sell button
    const sellPrice = this.getSellPrice();
    this.sellBtnText.setText(`Sell (+${sellPrice} DB)`);

    // Digivolve button - show only at max level with evolution paths
    const isMaxed = !canLevelUp(tower.level, maxLevel);
    const evolutions = getEvolutions(tower.digimonId, tower.dp);
    if (isMaxed && evolutions.length > 0) {
      this.digivolveBtn.setVisible(true);
    } else {
      this.digivolveBtn.setVisible(false);
    }

    // Merge button - show if there are valid merge candidates nearby
    this.mergeBtn.setVisible(true);
    this.mergeBtnText.setText('Merge...');
  }

  // ---------------------------------------------------------------------------
  // Level Up
  // ---------------------------------------------------------------------------

  private refreshLevelUpButton(maxLevel: number): void {
    const tower = this.currentTower;
    if (!tower) return;

    const isMaxed = !canLevelUp(tower.level, maxLevel);

    if (isMaxed) {
      this.levelUpBtnText.setText('MAX LEVEL');
      drawButton(this.levelUpBtnBg, 200, 36, COLORS.DISABLED);
      this.levelUpBtnText.setColor(COLORS.DISABLED_TEXT);
      return;
    }

    const cost = getLevelUpCost(tower.level);
    const canAfford = this.getDigibytes() >= cost;

    this.levelUpBtnText.setText(`Level Up (${cost} DB)`);

    if (canAfford) {
      drawButton(this.levelUpBtnBg, 200, 36, COLORS.SUCCESS);
      this.levelUpBtnText.setColor('#ffffff');
    } else {
      drawButton(this.levelUpBtnBg, 200, 36, COLORS.DISABLED);
      this.levelUpBtnText.setColor(COLORS.TEXT_LIVES);
    }
  }

  private onLevelUp(): void {
    const tower = this.currentTower;
    if (!tower) return;

    const maxLevel = calculateMaxLevel(tower.stage, tower.dp, tower.originStage, tower.stage);
    if (!canLevelUp(tower.level, maxLevel)) return;

    const cost = getLevelUpCost(tower.level);
    if (!this.spendDigibytes(cost)) return;

    tower.setLevel(tower.level + 1);

    EventBus.emit(GameEvents.TOWER_LEVELED, {
      towerID: tower.towerID,
      level: tower.level,
    });

    this.refresh();
  }

  private onLevelUpHover(isOver: boolean): void {
    const tower = this.currentTower;
    if (!tower) return;

    const maxLevel = calculateMaxLevel(tower.stage, tower.dp, tower.originStage, tower.stage);
    const isMaxed = !canLevelUp(tower.level, maxLevel);
    if (isMaxed) return;

    const cost = getLevelUpCost(tower.level);
    const canAfford = this.getDigibytes() >= cost;
    if (!canAfford) return;

    if (isOver) {
      drawButton(this.levelUpBtnBg, 200, 36, COLORS.SUCCESS_HOVER, { glowRing: true });
      animateButtonHover(this.scene, this.levelUpBtn, true);
    } else {
      drawButton(this.levelUpBtnBg, 200, 36, COLORS.SUCCESS);
      animateButtonHover(this.scene, this.levelUpBtn, false);
    }
  }

  // ---------------------------------------------------------------------------
  // Target Priority
  // ---------------------------------------------------------------------------

  private cyclePriority(): void {
    const tower = this.currentTower;
    if (!tower) return;

    const currentIndex = TARGET_PRIORITY_ORDER.indexOf(tower.targetPriority);
    const nextIndex = (currentIndex + 1) % TARGET_PRIORITY_ORDER.length;
    tower.targetPriority = TARGET_PRIORITY_ORDER[nextIndex];

    this.priorityBtnText.setText(TARGET_PRIORITY_LABELS[tower.targetPriority]);
  }

  // ---------------------------------------------------------------------------
  // Sell
  // ---------------------------------------------------------------------------

  private getSellPrice(): number {
    const tower = this.currentTower;
    if (!tower) return 0;
    return tower.level * 25;
  }

  private onSell(): void {
    const tower = this.currentTower;
    if (!tower) return;

    const sellPrice = this.getSellPrice();

    // Add currency back
    this.addDigibytes(sellPrice);

    // Emit sold event before destroying the tower
    EventBus.emit(GameEvents.TOWER_SOLD, {
      towerID: tower.towerID,
      digimonId: tower.digimonId,
      sellPrice,
      col: tower.gridCol,
      row: tower.gridRow,
    });

    // Hide range and destroy the tower
    tower.showRange(false);
    tower.destroy();

    // Clear reference and hide panel
    this.currentTower = null;
    this.setVisible(false);
  }

  // ---------------------------------------------------------------------------
  // Digivolve
  // ---------------------------------------------------------------------------

  private onDigivolve(): void {
    const tower = this.currentTower;
    if (!tower) return;

    EventBus.emit(GameEvents.DIGIVOLVE_INITIATED, tower);
  }

  // ---------------------------------------------------------------------------
  // Merge
  // ---------------------------------------------------------------------------

  private onMerge(): void {
    const tower = this.currentTower;
    if (!tower) return;

    EventBus.emit(GameEvents.MERGE_INITIATED, tower);
  }

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  private onTowerSelected(tower: Tower): void {
    // Deselect previous tower if any
    if (this.currentTower && this.currentTower !== tower) {
      this.currentTower.showRange(false);
      this.currentTower.deselect();
    }
    this.show(tower);
  }

  private onTowerDeselected(): void {
    // Only respond if the event wasn't emitted by us (avoid loop)
    if (this.visible && this.currentTower) {
      this.currentTower.showRange(false);
      this.currentTower = null;
      this.setVisible(false);
    }
  }

  private onEscPressed(): void {
    if (this.visible) {
      this.hide();
    }
  }

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  public destroy(fromScene?: boolean): void {
    EventBus.off(GameEvents.TOWER_SELECTED, this.onTowerSelected, this);
    EventBus.off(GameEvents.TOWER_DESELECTED, this.onTowerDeselected, this);

    if (this.escKey) {
      this.escKey.off('down', this.onEscPressed, this);
    }

    super.destroy(fromScene);
  }
}
