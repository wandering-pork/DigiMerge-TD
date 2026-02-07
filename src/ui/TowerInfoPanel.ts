import Phaser from 'phaser';
import { Tower } from '@/entities/Tower';
import { EventBus, GameEvents } from '@/utils/EventBus';
import { STAGE_NAMES, ATTRIBUTE_NAMES, TargetPriority } from '@/types';
import { getLevelUpCost, getTotalLevelUpCost, canLevelUp, calculateMaxLevel, getMaxAffordableLevel } from '@/systems/LevelSystem';
import { getEvolutions } from '@/data/EvolutionPaths';
import { canMerge, MergeCandidate } from '@/systems/MergeSystem';
import { GRID, GRID_OFFSET_X, getSellPrice as calculateSellPrice } from '@/config/Constants';
import { STATUS_EFFECTS, STATUS_EFFECT_CONFIGS } from '@/data/StatusEffects';
import { COLORS, ATTRIBUTE_COLORS_STR, TEXT_STYLES, FONTS, ANIM } from './UITheme';
import { drawPanel, drawButton, drawSeparator, animateSlideIn, animateSlideOut, animateButtonHover, animateButtonPress } from './UIHelpers';

/**
 * Parse a compound effect type (e.g., 'burn_aoe', 'slow_pierce') into
 * a human-readable skill description.
 */
function getSkillDisplay(effectType?: string, effectChance?: number): { name: string; description: string; chance: string } | null {
  if (!effectType || !effectChance) return null;

  // Parse compound effects: take the base effect name
  const parts = effectType.split('_');
  const baseEffect = parts[0];
  const modifiers = parts.slice(1);

  // Look up the base effect in STATUS_EFFECTS
  const effectDef = STATUS_EFFECTS[baseEffect];
  let name = effectDef?.name || baseEffect.charAt(0).toUpperCase() + baseEffect.slice(1);
  let description = effectDef?.description || effectType;

  // Add modifier info
  const modLabels: string[] = [];
  for (const mod of modifiers) {
    switch (mod) {
      case 'aoe': modLabels.push('AoE'); break;
      case 'pierce': modLabels.push('Pierce'); break;
      case 'multihit': case 'multishot': modLabels.push('Multi-hit'); break;
      case 'kb': case 'knockback': modLabels.push('Knockback'); break;
      case 'burn': modLabels.push('+ Burn'); break;
      case 'poison': modLabels.push('+ Poison'); break;
      case 'stun': modLabels.push('+ Stun'); break;
      case 'holy': modLabels.push('+ Holy'); break;
      case 'reflect': modLabels.push('Reflect'); break;
      case 'lifesteal': modLabels.push('+ Lifesteal'); break;
      case 'all': modLabels.push('All'); break;
      case 'air': modLabels.push('Anti-Air'); break;
      case 'fear': modLabels.push('+ Fear'); break;
      case 'damage': modLabels.push('Damage'); break;
      case 'break': modLabels.push('Break'); break;
    }
  }

  if (modLabels.length > 0) {
    name += ` (${modLabels.join(', ')})`;
  }

  // Handle special compound names
  if (effectType === 'armor_break') {
    name = 'Armor Break';
    description = 'Reduces target armor';
  } else if (effectType === 'armor_pierce') {
    name = 'Armor Pierce';
    description = 'Ignores target armor';
  } else if (effectType === 'anti_air') {
    name = 'Anti-Air';
    description = 'Bonus damage vs Flying';
  } else if (effectType === 'aura_damage') {
    name = 'Damage Aura';
    description = 'Buffs nearby tower damage';
  } else if (effectType === 'aura_all_holy') {
    name = 'Holy Aura';
    description = 'Buffs all nearby + holy dmg';
  }

  const chance = `${Math.round(effectChance * 100)}% chance`;

  // Build a detailed description from runtime config
  const parts0 = effectType.split('_');
  const baseKey = parts0[0];
  const config = STATUS_EFFECT_CONFIGS[baseKey];
  if (config) {
    const details: string[] = [];
    if (baseKey === 'burn') {
      details.push(`${Math.round(config.strength * 100)}% of atk as fire/tick`);
    } else if (baseKey === 'poison') {
      details.push(`${Math.round(config.strength * 100)}% enemy max HP/tick`);
      if (config.maxStacks) details.push(`stacks ${config.maxStacks}x`);
    } else if (baseKey === 'slow') {
      details.push(`-${Math.round(config.strength * 100)}% move speed`);
    } else if (baseKey === 'freeze') {
      details.push('Stun then -40% speed');
    } else if (baseKey === 'stun') {
      details.push('Cannot move');
    } else if (baseKey === 'armorBreak') {
      details.push(`-${Math.round(config.strength * 100)}% armor`);
    }
    if (config.duration) details.push(`${config.duration}s`);
    // Add AoE note if applicable
    if (modifiers.includes('aoe')) details.push('splash nearby');
    if (details.length > 0) description = details.join(', ');
  }

  return { name, description, chance };
}

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

  // Panel dimensions (right of grid)
  private static readonly PANEL_WIDTH = 300;
  private static readonly PANEL_HEIGHT = 680;

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
  private killsText!: Phaser.GameObjects.Text;
  private totalDmgText!: Phaser.GameObjects.Text;
  private skillNameText!: Phaser.GameObjects.Text;
  private skillChanceText!: Phaser.GameObjects.Text;
  private skillDescText!: Phaser.GameObjects.Text;

  // Level up section
  private levelUpBtn!: Phaser.GameObjects.Container;
  private levelUpBtnBg!: Phaser.GameObjects.Graphics;
  private levelUpBtnText!: Phaser.GameObjects.Text;

  // Level up +5 / max buttons
  private levelUp5Btn!: Phaser.GameObjects.Container;
  private levelUp5BtnBg!: Phaser.GameObjects.Graphics;
  private levelUp5BtnText!: Phaser.GameObjects.Text;
  private levelUpMaxBtn!: Phaser.GameObjects.Container;
  private levelUpMaxBtnBg!: Phaser.GameObjects.Graphics;
  private levelUpMaxBtnText!: Phaser.GameObjects.Text;

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

  // Bonus effects from merge inheritance
  private bonusEffectTexts: Phaser.GameObjects.Text[] = [];

  // Keyboard listener
  private escKey: Phaser.Input.Keyboard.Key | null = null;

  constructor(
    scene: Phaser.Scene,
    getDigibytes: () => number,
    spendDigibytes: (amount: number) => boolean,
    addDigibytes: (amount: number) => void,
  ) {
    // Position to the right of the grid
    const panelX = GRID_OFFSET_X + GRID.COLUMNS * GRID.CELL_SIZE + 15;
    super(scene, panelX, 20);

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
    EventBus.on(GameEvents.DIGIBYTES_CHANGED, this.onDigibytesChanged, this);

    // Listen for keyboard shortcut events
    EventBus.on(GameEvents.TOWER_SOLD_SHORTCUT, this.onSell, this);
    EventBus.on(GameEvents.TOWER_LEVELUP_SHORTCUT, this.onLevelUp, this);

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
    const lineH = 26;

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

    this.killsText = this.createStatRow('Kills', statsX, statsValueX, statsY);
    statsY += lineH;

    this.totalDmgText = this.createStatRow('Total Dmg', statsX, statsValueX, statsY);
    statsY += lineH;

    // Skill display row
    this.skillNameText = this.scene.add.text(statsX, statsY, '', {
      ...TEXT_STYLES.PANEL_LABEL,
      color: '#ffaa44',
      fontSize: '13px',
      resolution: 2,
    });
    this.add(this.skillNameText);

    this.skillChanceText = this.scene.add.text(statsValueX, statsY, '', {
      ...TEXT_STYLES.PANEL_VALUE,
      color: '#ffaa44',
      fontSize: '13px',
      resolution: 2,
    }).setOrigin(1, 0);
    this.add(this.skillChanceText);
    statsY += 18;

    // Skill description (below skill name row)
    this.skillDescText = this.scene.add.text(statsX, statsY, '', {
      ...TEXT_STYLES.PANEL_LABEL,
      color: '#bbaa77',
      fontSize: '11px',
      wordWrap: { width: w - 30 },
      resolution: 2,
    });
    this.add(this.skillDescText);
    statsY += 18;

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

    this.levelUpBtnText = this.scene.add.text(0, 0, 'Level Up [U] (-- DB)', TEXT_STYLES.BUTTON_SM).setOrigin(0.5);
    this.levelUpBtn.add(this.levelUpBtnText);

    const levelUpHitArea = new Phaser.Geom.Rectangle(-100, -18, 200, 36);
    this.levelUpBtn.setInteractive(levelUpHitArea, Phaser.Geom.Rectangle.Contains);
    this.levelUpBtn.input!.cursor = 'pointer';
    this.levelUpBtn.on('pointerdown', () => this.onLevelUp());
    this.levelUpBtn.on('pointerover', () => this.onLevelUpHover(true));
    this.levelUpBtn.on('pointerout', () => this.onLevelUpHover(false));
    this.add(this.levelUpBtn);

    statsY += 42;

    // --- Level Up +5 and Max buttons (side by side) ---
    const smallBtnW = 95;
    const smallBtnH = 30;

    // +5 button (left)
    this.levelUp5Btn = this.scene.add.container(w / 2 - smallBtnW / 2 - 3, statsY);
    this.levelUp5BtnBg = this.scene.add.graphics();
    drawButton(this.levelUp5BtnBg, smallBtnW, smallBtnH, COLORS.SUCCESS);
    this.levelUp5Btn.add(this.levelUp5BtnBg);

    this.levelUp5BtnText = this.scene.add.text(0, 0, 'Lv +5', { ...TEXT_STYLES.BUTTON_SM, fontSize: '11px' }).setOrigin(0.5);
    this.levelUp5Btn.add(this.levelUp5BtnText);

    const lv5HitArea = new Phaser.Geom.Rectangle(-smallBtnW / 2, -smallBtnH / 2, smallBtnW, smallBtnH);
    this.levelUp5Btn.setInteractive(lv5HitArea, Phaser.Geom.Rectangle.Contains);
    this.levelUp5Btn.input!.cursor = 'pointer';
    this.levelUp5Btn.on('pointerdown', () => this.onLevelUpMulti(5));
    this.levelUp5Btn.on('pointerover', () => this.onMultiBtnHover(this.levelUp5BtnBg, smallBtnW, smallBtnH, this.levelUp5Btn, 5, true));
    this.levelUp5Btn.on('pointerout', () => this.onMultiBtnHover(this.levelUp5BtnBg, smallBtnW, smallBtnH, this.levelUp5Btn, 5, false));
    this.add(this.levelUp5Btn);

    // Max button (right)
    this.levelUpMaxBtn = this.scene.add.container(w / 2 + smallBtnW / 2 + 3, statsY);
    this.levelUpMaxBtnBg = this.scene.add.graphics();
    drawButton(this.levelUpMaxBtnBg, smallBtnW, smallBtnH, COLORS.SPECIAL);
    this.levelUpMaxBtn.add(this.levelUpMaxBtnBg);

    this.levelUpMaxBtnText = this.scene.add.text(0, 0, 'Lv MAX', { ...TEXT_STYLES.BUTTON_SM, fontSize: '11px' }).setOrigin(0.5);
    this.levelUpMaxBtn.add(this.levelUpMaxBtnText);

    const lvMaxHitArea = new Phaser.Geom.Rectangle(-smallBtnW / 2, -smallBtnH / 2, smallBtnW, smallBtnH);
    this.levelUpMaxBtn.setInteractive(lvMaxHitArea, Phaser.Geom.Rectangle.Contains);
    this.levelUpMaxBtn.input!.cursor = 'pointer';
    this.levelUpMaxBtn.on('pointerdown', () => this.onLevelUpMulti(-1));
    this.levelUpMaxBtn.on('pointerover', () => this.onMultiBtnHover(this.levelUpMaxBtnBg, smallBtnW, smallBtnH, this.levelUpMaxBtn, -1, true));
    this.levelUpMaxBtn.on('pointerout', () => this.onMultiBtnHover(this.levelUpMaxBtnBg, smallBtnW, smallBtnH, this.levelUpMaxBtn, -1, false));
    this.add(this.levelUpMaxBtn);

    statsY += 42;

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
      fontFamily: FONTS.BODY,
      fontSize: '16px',
      color: COLORS.TEXT_LABEL,
      fontStyle: 'bold',
      resolution: 2,
    }).setOrigin(0.5);
    this.priorityBtn.add(leftArrow);

    const rightArrow = this.scene.add.text(60, 0, '>', {
      fontFamily: FONTS.BODY,
      fontSize: '16px',
      color: COLORS.TEXT_LABEL,
      fontStyle: 'bold',
      resolution: 2,
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

    this.sellBtnText = this.scene.add.text(0, 0, 'Sell [S] (-- DB)', TEXT_STYLES.BUTTON_SM).setOrigin(0.5);
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
   * Get the currently displayed tower, or null if none is selected.
   */
  public getCurrentTower(): Tower | null {
    return this.currentTower;
  }

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
    const spriteKey = tower.stats.spriteKey ?? tower.digimonId;
    if (this.scene.textures.exists(spriteKey)) {
      this.digimonSprite.setTexture(spriteKey);
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

    this.killsText.setText(`${tower.killCount}`);
    this.totalDmgText.setText(tower.totalDamageDealt >= 1000
      ? `${(tower.totalDamageDealt / 1000).toFixed(1)}K`
      : `${Math.round(tower.totalDamageDealt)}`);

    // Skill display
    const skillInfo = getSkillDisplay(tower.stats.effectType, tower.stats.effectChance);
    if (skillInfo) {
      this.skillNameText.setText(skillInfo.name);
      this.skillChanceText.setText(skillInfo.chance);
      this.skillDescText.setText(skillInfo.description);
      this.skillNameText.setVisible(true);
      this.skillChanceText.setVisible(true);
      this.skillDescText.setVisible(true);
    } else {
      this.skillNameText.setVisible(false);
      this.skillChanceText.setVisible(false);
      this.skillDescText.setVisible(false);
    }

    // Bonus effects display (from merge inheritance)
    if (this.bonusEffectTexts) {
      for (const t of this.bonusEffectTexts) t.destroy();
    }
    this.bonusEffectTexts = [];
    if (tower.bonusEffects && tower.bonusEffects.length > 0) {
      let bonusY = (skillInfo ? this.skillDescText.y + 18 : this.skillNameText.y);
      for (const bonus of tower.bonusEffects) {
        const bonusInfo = getSkillDisplay(bonus.effectType, bonus.effectChance);
        if (bonusInfo) {
          const bonusText = this.scene.add.text(
            10, bonusY,
            `+ ${bonusInfo.name} (${bonusInfo.chance})`,
            { fontFamily: 'monospace', fontSize: '13px', color: '#88ddaa', resolution: 2 }
          );
          this.add(bonusText);
          this.bonusEffectTexts.push(bonusText);
          bonusY += 16;
        }
      }
    }

    // Level Up buttons
    this.refreshLevelUpButton(maxLevel);
    this.refreshMultiLevelButtons(maxLevel);

    // Target priority
    this.priorityBtnText.setText(TARGET_PRIORITY_LABELS[tower.targetPriority]);

    // Sell button
    const sellPrice = this.getSellPrice();
    this.sellBtnText.setText(`Sell [S] (+${sellPrice} DB)`);

    // Digivolve button - show only at max level with evolution paths
    const isMaxed = !canLevelUp(tower.level, maxLevel);
    const evolutions = getEvolutions(tower.digimonId, tower.dp);
    if (isMaxed && evolutions.length > 0) {
      this.digivolveBtn.setVisible(true);
    } else {
      this.digivolveBtn.setVisible(false);
    }

    // Merge button - show if there are valid merge candidates nearby
    // Reposition merge button based on whether digivolve button is visible
    const mergeY = this.digivolveBtn.visible
      ? this.digivolveBtn.y + 44
      : this.sellBtn.y + 44;
    this.mergeBtn.y = mergeY;
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

    const cost = getLevelUpCost(tower.level, tower.stage);
    const canAfford = this.getDigibytes() >= cost;

    this.levelUpBtnText.setText(`Level Up [U] (${cost} DB)`);

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

    const cost = getLevelUpCost(tower.level, tower.stage);
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

    const cost = getLevelUpCost(tower.level, tower.stage);
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
  // Multi-Level Up (+5 / Max)
  // ---------------------------------------------------------------------------

  private refreshMultiLevelButtons(maxLevel: number): void {
    const tower = this.currentTower;
    if (!tower) return;

    const isMaxed = !canLevelUp(tower.level, maxLevel);

    if (isMaxed) {
      this.levelUp5Btn.setVisible(false);
      this.levelUpMaxBtn.setVisible(false);
      return;
    }

    this.levelUp5Btn.setVisible(true);
    this.levelUpMaxBtn.setVisible(true);

    // +5 button - show affordable levels within +5 range
    const targetLv5 = Math.min(tower.level + 5, maxLevel);
    const cost5 = getTotalLevelUpCost(tower.level, targetLv5, tower.stage);
    const affordable5 = getMaxAffordableLevel(tower.level, targetLv5, this.getDigibytes(), tower.stage);
    const canAffordAll5 = this.getDigibytes() >= cost5;
    const canAffordSome5 = affordable5 > tower.level;

    if (canAffordAll5) {
      const levels5 = targetLv5 - tower.level;
      this.levelUp5BtnText.setText(`+${levels5} (${cost5})`);
      drawButton(this.levelUp5BtnBg, 95, 30, COLORS.SUCCESS);
      this.levelUp5BtnText.setColor('#ffffff');
    } else if (canAffordSome5) {
      const affordableLevels = affordable5 - tower.level;
      const partialCost5 = getTotalLevelUpCost(tower.level, affordable5, tower.stage);
      this.levelUp5BtnText.setText(`+${affordableLevels} (${partialCost5})`);
      drawButton(this.levelUp5BtnBg, 95, 30, COLORS.SUCCESS);
      this.levelUp5BtnText.setColor('#ffffff');
    } else {
      const levels5 = targetLv5 - tower.level;
      this.levelUp5BtnText.setText(`+${levels5} (${cost5})`);
      drawButton(this.levelUp5BtnBg, 95, 30, COLORS.DISABLED);
      this.levelUp5BtnText.setColor(COLORS.TEXT_LIVES);
    }

    // Max button - show affordable level and cost
    const affordableMax = getMaxAffordableLevel(tower.level, maxLevel, this.getDigibytes(), tower.stage);
    const costMax = getTotalLevelUpCost(tower.level, maxLevel, tower.stage);
    const canAffordAll = this.getDigibytes() >= costMax;
    const canAffordSome = affordableMax > tower.level;

    if (canAffordAll) {
      this.levelUpMaxBtnText.setText(`MAX (${costMax})`);
      drawButton(this.levelUpMaxBtnBg, 95, 30, COLORS.SPECIAL);
      this.levelUpMaxBtnText.setColor('#ffffff');
    } else if (canAffordSome) {
      const partialCost = getTotalLevelUpCost(tower.level, affordableMax, tower.stage);
      this.levelUpMaxBtnText.setText(`→${affordableMax} (${partialCost})`);
      drawButton(this.levelUpMaxBtnBg, 95, 30, COLORS.SPECIAL);
      this.levelUpMaxBtnText.setColor('#ffffff');
    } else {
      this.levelUpMaxBtnText.setText(`MAX (${costMax})`);
      drawButton(this.levelUpMaxBtnBg, 95, 30, COLORS.DISABLED);
      this.levelUpMaxBtnText.setColor(COLORS.TEXT_LIVES);
    }
  }

  /**
   * Level up multiple times. levels = -1 means level to max affordable.
   * For +5, levels up as many as affordable (up to 5).
   */
  private onLevelUpMulti(levels: number): void {
    const tower = this.currentTower;
    if (!tower) return;

    const maxLevel = calculateMaxLevel(tower.stage, tower.dp, tower.originStage, tower.stage);
    if (!canLevelUp(tower.level, maxLevel)) return;

    // Determine the desired target, then cap to what we can actually afford
    const desiredTarget = levels === -1
      ? maxLevel
      : Math.min(tower.level + levels, maxLevel);

    const affordableLevel = getMaxAffordableLevel(
      tower.level, desiredTarget, this.getDigibytes(), tower.stage,
    );

    // Nothing affordable
    if (affordableLevel <= tower.level) return;

    const totalCost = getTotalLevelUpCost(tower.level, affordableLevel, tower.stage);
    if (!this.spendDigibytes(totalCost)) return;

    tower.setLevel(affordableLevel);

    EventBus.emit(GameEvents.TOWER_LEVELED, {
      towerID: tower.towerID,
      level: tower.level,
    });

    this.refresh();
  }

  private onMultiBtnHover(
    bg: Phaser.GameObjects.Graphics, w: number, h: number,
    container: Phaser.GameObjects.Container, levels: number, isOver: boolean,
  ): void {
    const tower = this.currentTower;
    if (!tower) return;

    const maxLevel = calculateMaxLevel(tower.stage, tower.dp, tower.originStage, tower.stage);
    if (!canLevelUp(tower.level, maxLevel)) return;

    const targetLevel = levels === -1 ? maxLevel : Math.min(tower.level + levels, maxLevel);
    const cost = getTotalLevelUpCost(tower.level, targetLevel, tower.stage);
    if (this.getDigibytes() < cost) return;

    const baseColor = levels === -1 ? COLORS.SPECIAL : COLORS.SUCCESS;
    const hoverColor = levels === -1 ? COLORS.SPECIAL_HOVER : COLORS.SUCCESS_HOVER;

    if (isOver) {
      drawButton(bg, w, h, hoverColor, { glowRing: true });
      animateButtonHover(this.scene, container, true);
    } else {
      drawButton(bg, w, h, baseColor);
      animateButtonHover(this.scene, container, false);
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
    return calculateSellPrice(tower.level, tower.stage);
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

  private onDigibytesChanged(): void {
    if (this.visible && this.currentTower) {
      this.refresh();
    }
  }

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  public destroy(fromScene?: boolean): void {
    EventBus.off(GameEvents.TOWER_SELECTED, this.onTowerSelected, this);
    EventBus.off(GameEvents.TOWER_DESELECTED, this.onTowerDeselected, this);
    EventBus.off(GameEvents.DIGIBYTES_CHANGED, this.onDigibytesChanged, this);
    EventBus.off(GameEvents.TOWER_SOLD_SHORTCUT, this.onSell, this);
    EventBus.off(GameEvents.TOWER_LEVELUP_SHORTCUT, this.onLevelUp, this);

    if (this.escKey) {
      this.escKey.off('down', this.onEscPressed, this);
    }

    super.destroy(fromScene);
  }
}
