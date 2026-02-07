import Phaser from 'phaser';
import { Tower } from '@/entities/Tower';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config/Constants';
import { STAGE_NAMES, ATTRIBUTE_NAMES } from '@/types';
import { getDPFromMerge } from '@/systems/DPSystem';
import { EventBus, GameEvents } from '@/utils/EventBus';
import { COLORS, ATTRIBUTE_COLORS_STR, TEXT_STYLES, FONTS } from './UITheme';
import { drawPanel, drawButton, drawSeparator, animateModalIn, animateModalOut, animateButtonHover, animateButtonPress } from './UIHelpers';

interface MergeResult {
  survivorLevel: number;
  survivorDP: number;
}

/**
 * MergeModal - A centered overlay modal that shows when a merge is initiated
 * between two towers. Displays a side-by-side comparison of the survivor and
 * sacrifice, along with a preview of the merge result.
 */
export class MergeModal extends Phaser.GameObjects.Container {
  // Full-screen dark overlay
  private overlay!: Phaser.GameObjects.Graphics;

  // Panel container for animation
  private panelContainer!: Phaser.GameObjects.Container;

  // Panel background
  private panelBg!: Phaser.GameObjects.Graphics;

  // Title
  private titleText!: Phaser.GameObjects.Text;

  // Tower A (survivor) visuals
  private towerASprite!: Phaser.GameObjects.Image;
  private towerAName!: Phaser.GameObjects.Text;
  private towerALevel!: Phaser.GameObjects.Text;
  private towerADP!: Phaser.GameObjects.Text;
  private towerAAttribute!: Phaser.GameObjects.Text;
  private towerAStage!: Phaser.GameObjects.Text;
  private towerALabel!: Phaser.GameObjects.Text;

  // Tower B (sacrifice) visuals
  private towerBSprite!: Phaser.GameObjects.Image;
  private towerBName!: Phaser.GameObjects.Text;
  private towerBLevel!: Phaser.GameObjects.Text;
  private towerBDP!: Phaser.GameObjects.Text;
  private towerBAttribute!: Phaser.GameObjects.Text;
  private towerBStage!: Phaser.GameObjects.Text;
  private towerBLabel!: Phaser.GameObjects.Text;

  // Center arrow
  private arrowText!: Phaser.GameObjects.Text;

  // Result preview section
  private resultHeader!: Phaser.GameObjects.Text;
  private resultDPText!: Phaser.GameObjects.Text;
  private resultLevelText!: Phaser.GameObjects.Text;
  private resultEffectText!: Phaser.GameObjects.Text;

  // Buttons
  private confirmBtn!: Phaser.GameObjects.Container;
  private confirmBtnBg!: Phaser.GameObjects.Graphics;
  private confirmBtnText!: Phaser.GameObjects.Text;
  private cancelBtn!: Phaser.GameObjects.Container;
  private cancelBtnBg!: Phaser.GameObjects.Graphics;
  private cancelBtnText!: Phaser.GameObjects.Text;

  // State
  private towerA: Tower | null = null;
  private towerB: Tower | null = null;
  private onConfirmCallback: ((towerA: Tower, towerB: Tower) => void) | null = null;

  // Panel dimensions
  private static readonly PANEL_WIDTH = 450;
  private static readonly PANEL_HEIGHT = 370;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.buildModal();
    this.setVisible(false);
    this.setDepth(50);

    scene.add.existing(this);
  }

  // ---------------------------------------------------------------------------
  // Construction
  // ---------------------------------------------------------------------------

  private buildModal(): void {
    const w = MergeModal.PANEL_WIDTH;
    const h = MergeModal.PANEL_HEIGHT;
    const px = (GAME_WIDTH - w) / 2;
    const py = (GAME_HEIGHT - h) / 2;
    const centerX = GAME_WIDTH / 2;

    // --- Dark semi-transparent overlay ---
    this.overlay = this.scene.add.graphics();
    this.overlay.fillStyle(COLORS.OVERLAY_BLACK, 0.6);
    this.overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.overlay.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT),
      Phaser.Geom.Rectangle.Contains,
    );
    this.overlay.on('pointerdown', () => { /* swallow */ });
    this.add(this.overlay);

    // --- Panel container for pop animation ---
    this.panelContainer = this.scene.add.container(0, 0);
    this.add(this.panelContainer);

    // --- Panel background — themed with teal tint ---
    this.panelBg = this.scene.add.graphics();
    drawPanel(this.panelBg, px, py, w, h, { borderColor: COLORS.MERGE });
    this.panelContainer.add(this.panelBg);

    // --- Title ---
    this.titleText = this.scene.add.text(centerX, py + 20, 'Merge Digimon', TEXT_STYLES.MODAL_TITLE).setOrigin(0.5, 0);
    this.panelContainer.add(this.titleText);

    // =====================================================================
    // Left side: Tower A (Survivor)
    // =====================================================================
    const leftCenterX = px + 110;
    const cardTopY = py + 60;

    this.towerALabel = this.scene.add.text(leftCenterX, cardTopY, 'KEEPS', {
      fontFamily: FONTS.BODY,
      fontSize: '12px',
      color: COLORS.VACCINE_STR,
      fontStyle: 'bold',
      letterSpacing: 2,
    }).setOrigin(0.5, 0);
    this.panelContainer.add(this.towerALabel);

    this.towerASprite = this.scene.add.image(leftCenterX, cardTopY + 40, '__DEFAULT');
    this.towerASprite.setScale(3);
    this.towerASprite.setVisible(false);
    this.panelContainer.add(this.towerASprite);

    this.towerAName = this.scene.add.text(leftCenterX, cardTopY + 68, '', {
      fontFamily: FONTS.DISPLAY,
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);
    this.panelContainer.add(this.towerAName);

    this.towerAStage = this.scene.add.text(leftCenterX, cardTopY + 88, '', {
      fontFamily: FONTS.BODY,
      fontSize: '11px',
      color: COLORS.TEXT_LABEL,
    }).setOrigin(0.5, 0);
    this.panelContainer.add(this.towerAStage);

    this.towerAAttribute = this.scene.add.text(leftCenterX, cardTopY + 104, '', {
      fontFamily: FONTS.BODY,
      fontSize: '11px',
      color: '#ffffff',
    }).setOrigin(0.5, 0);
    this.panelContainer.add(this.towerAAttribute);

    this.towerALevel = this.scene.add.text(leftCenterX, cardTopY + 122, '', {
      fontFamily: FONTS.MONO,
      fontSize: '13px',
      color: '#ffffff',
    }).setOrigin(0.5, 0);
    this.panelContainer.add(this.towerALevel);

    this.towerADP = this.scene.add.text(leftCenterX, cardTopY + 140, '', {
      fontFamily: FONTS.MONO,
      fontSize: '13px',
      color: COLORS.TEXT_GOLD,
    }).setOrigin(0.5, 0);
    this.panelContainer.add(this.towerADP);

    // =====================================================================
    // Center: Merge arrow with pulsing alpha
    // =====================================================================
    this.arrowText = this.scene.add.text(centerX, cardTopY + 60, '+', {
      fontFamily: FONTS.DISPLAY,
      fontSize: '36px',
      color: COLORS.TEXT_GOLD,
      fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 2, color: '#221100', blur: 6, fill: true },
    }).setOrigin(0.5, 0.5);
    this.panelContainer.add(this.arrowText);

    // Pulsing alpha tween
    this.scene.tweens.add({
      targets: this.arrowText,
      alpha: { from: 1.0, to: 0.4 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // =====================================================================
    // Right side: Tower B (Sacrifice)
    // =====================================================================
    const rightCenterX = px + w - 110;

    this.towerBLabel = this.scene.add.text(rightCenterX, cardTopY, 'REMOVED', {
      fontFamily: FONTS.BODY,
      fontSize: '12px',
      color: COLORS.TEXT_LIVES,
      fontStyle: 'bold',
      letterSpacing: 2,
    }).setOrigin(0.5, 0);
    this.panelContainer.add(this.towerBLabel);

    this.towerBSprite = this.scene.add.image(rightCenterX, cardTopY + 40, '__DEFAULT');
    this.towerBSprite.setScale(3);
    this.towerBSprite.setVisible(false);
    this.panelContainer.add(this.towerBSprite);

    this.towerBName = this.scene.add.text(rightCenterX, cardTopY + 68, '', {
      fontFamily: FONTS.DISPLAY,
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);
    this.panelContainer.add(this.towerBName);

    this.towerBStage = this.scene.add.text(rightCenterX, cardTopY + 88, '', {
      fontFamily: FONTS.BODY,
      fontSize: '11px',
      color: COLORS.TEXT_LABEL,
    }).setOrigin(0.5, 0);
    this.panelContainer.add(this.towerBStage);

    this.towerBAttribute = this.scene.add.text(rightCenterX, cardTopY + 104, '', {
      fontFamily: FONTS.BODY,
      fontSize: '11px',
      color: '#ffffff',
    }).setOrigin(0.5, 0);
    this.panelContainer.add(this.towerBAttribute);

    this.towerBLevel = this.scene.add.text(rightCenterX, cardTopY + 122, '', {
      fontFamily: FONTS.MONO,
      fontSize: '13px',
      color: '#ffffff',
    }).setOrigin(0.5, 0);
    this.panelContainer.add(this.towerBLevel);

    this.towerBDP = this.scene.add.text(rightCenterX, cardTopY + 140, '', {
      fontFamily: FONTS.MONO,
      fontSize: '13px',
      color: COLORS.TEXT_GOLD,
    }).setOrigin(0.5, 0);
    this.panelContainer.add(this.towerBDP);

    // =====================================================================
    // Result preview section
    // =====================================================================
    const resultY = py + h - 110;

    // Separator
    const separator = this.scene.add.graphics();
    drawSeparator(separator, px + 20, resultY - 8, px + w - 20);
    this.panelContainer.add(separator);

    this.resultHeader = this.scene.add.text(centerX, resultY, 'Merge Result', {
      fontFamily: FONTS.DISPLAY,
      fontSize: '14px',
      color: COLORS.TEXT_LABEL,
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);
    this.panelContainer.add(this.resultHeader);

    this.resultDPText = this.scene.add.text(centerX - 60, resultY + 22, '', {
      fontFamily: FONTS.MONO,
      fontSize: '13px',
      color: COLORS.TEXT_GOLD,
    }).setOrigin(0.5, 0);
    this.panelContainer.add(this.resultDPText);

    this.resultLevelText = this.scene.add.text(centerX + 60, resultY + 22, '', {
      fontFamily: FONTS.MONO,
      fontSize: '13px',
      color: '#ffffff',
    }).setOrigin(0.5, 0);
    this.panelContainer.add(this.resultLevelText);

    this.resultEffectText = this.scene.add.text(centerX, resultY + 42, '', {
      fontFamily: FONTS.MONO,
      fontSize: '12px',
      color: '#88ddaa',
    }).setOrigin(0.5, 0);
    this.resultEffectText.setVisible(false);
    this.panelContainer.add(this.resultEffectText);

    // =====================================================================
    // Buttons
    // =====================================================================
    const btnY = py + h - 45;
    const btnWidth = 120;
    const btnHeight = 34;

    // --- Confirm button (green) ---
    this.confirmBtn = this.scene.add.container(centerX - 75, btnY);
    this.confirmBtnBg = this.scene.add.graphics();
    drawButton(this.confirmBtnBg, btnWidth, btnHeight, COLORS.SUCCESS);
    this.confirmBtn.add(this.confirmBtnBg);

    this.confirmBtnText = this.scene.add.text(0, 0, 'Confirm', TEXT_STYLES.BUTTON_SM).setOrigin(0.5);
    this.confirmBtn.add(this.confirmBtnText);

    const confirmHitArea = new Phaser.Geom.Rectangle(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight);
    this.confirmBtn.setInteractive(confirmHitArea, Phaser.Geom.Rectangle.Contains);
    this.confirmBtn.input!.cursor = 'pointer';
    this.confirmBtn.on('pointerdown', () => {
      animateButtonPress(this.scene, this.confirmBtn);
      this.onConfirm();
    });
    this.confirmBtn.on('pointerover', () => {
      drawButton(this.confirmBtnBg, btnWidth, btnHeight, COLORS.SUCCESS_HOVER, { glowRing: true });
      animateButtonHover(this.scene, this.confirmBtn, true);
    });
    this.confirmBtn.on('pointerout', () => {
      drawButton(this.confirmBtnBg, btnWidth, btnHeight, COLORS.SUCCESS);
      animateButtonHover(this.scene, this.confirmBtn, false);
    });
    this.panelContainer.add(this.confirmBtn);

    // --- Cancel button (red) ---
    this.cancelBtn = this.scene.add.container(centerX + 75, btnY);
    this.cancelBtnBg = this.scene.add.graphics();
    drawButton(this.cancelBtnBg, btnWidth, btnHeight, COLORS.DANGER);
    this.cancelBtn.add(this.cancelBtnBg);

    this.cancelBtnText = this.scene.add.text(0, 0, 'Cancel', TEXT_STYLES.BUTTON_SM).setOrigin(0.5);
    this.cancelBtn.add(this.cancelBtnText);

    const cancelHitArea = new Phaser.Geom.Rectangle(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight);
    this.cancelBtn.setInteractive(cancelHitArea, Phaser.Geom.Rectangle.Contains);
    this.cancelBtn.input!.cursor = 'pointer';
    this.cancelBtn.on('pointerdown', () => {
      animateButtonPress(this.scene, this.cancelBtn);
      this.hide();
    });
    this.cancelBtn.on('pointerover', () => {
      drawButton(this.cancelBtnBg, btnWidth, btnHeight, COLORS.DANGER_HOVER, { glowRing: true });
      animateButtonHover(this.scene, this.cancelBtn, true);
    });
    this.cancelBtn.on('pointerout', () => {
      drawButton(this.cancelBtnBg, btnWidth, btnHeight, COLORS.DANGER);
      animateButtonHover(this.scene, this.cancelBtn, false);
    });
    this.panelContainer.add(this.cancelBtn);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  public show(
    towerA: Tower,
    towerB: Tower,
    onConfirm: (a: Tower, b: Tower) => void,
  ): void {
    this.towerA = towerA;
    this.towerB = towerB;
    this.onConfirmCallback = onConfirm;

    const result = this.computeMergeResult(towerA, towerB);

    this.populateTowerInfo(
      towerA,
      this.towerASprite, this.towerAName, this.towerAStage,
      this.towerAAttribute, this.towerALevel, this.towerADP,
    );
    this.populateTowerInfo(
      towerB,
      this.towerBSprite, this.towerBName, this.towerBStage,
      this.towerBAttribute, this.towerBLevel, this.towerBDP,
    );

    this.resultDPText.setText(`DP: ${result.survivorDP}`);
    this.resultLevelText.setText(`Level: ${result.survivorLevel}`);

    // Effect inheritance preview
    const sacrificeEffect = towerB.stats.effectType;
    const sacrificeChance = towerB.stats.effectChance;
    if (sacrificeEffect && sacrificeChance && sacrificeChance > 0) {
      const halvedChance = Math.round((sacrificeChance / 2) * 100);
      this.resultEffectText.setText(`Inherits: ${sacrificeEffect} (${halvedChance}%)`);
      this.resultEffectText.setVisible(true);
    } else {
      this.resultEffectText.setText('');
      this.resultEffectText.setVisible(false);
    }

    this.setVisible(true);

    // Fade in overlay
    this.overlay.setAlpha(0);
    this.scene.tweens.add({ targets: this.overlay, alpha: 1, duration: 200 });

    // Pop in panel
    animateModalIn(this.scene, this.panelContainer);
  }

  public hide(): void {
    animateModalOut(this.scene, this.panelContainer);
    this.scene.tweens.add({
      targets: this.overlay, alpha: 0, duration: 200,
      onComplete: () => {
        this.setVisible(false);
        this.towerA = null;
        this.towerB = null;
        this.onConfirmCallback = null;
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Merge Execution
  // ---------------------------------------------------------------------------

  private onConfirm(): void {
    if (!this.towerA || !this.towerB || !this.onConfirmCallback) return;

    const a = this.towerA;
    const b = this.towerB;
    const callback = this.onConfirmCallback;

    this.hide();
    callback(a, b);
  }

  // ---------------------------------------------------------------------------
  // Merge Result Computation
  // ---------------------------------------------------------------------------

  private computeMergeResult(towerA: Tower, towerB: Tower): MergeResult {
    return {
      survivorLevel: Math.max(towerA.level, towerB.level),
      survivorDP: getDPFromMerge(towerA.dp, towerB.dp),
    };
  }

  // ---------------------------------------------------------------------------
  // Tower Info Population
  // ---------------------------------------------------------------------------

  private populateTowerInfo(
    tower: Tower,
    sprite: Phaser.GameObjects.Image,
    nameText: Phaser.GameObjects.Text,
    stageText: Phaser.GameObjects.Text,
    attributeText: Phaser.GameObjects.Text,
    levelText: Phaser.GameObjects.Text,
    dpText: Phaser.GameObjects.Text,
  ): void {
    const spriteKey = tower.stats.spriteKey ?? tower.digimonId;
    if (this.scene.textures.exists(spriteKey)) {
      sprite.setTexture(spriteKey);
      sprite.setVisible(true);
    } else {
      sprite.setVisible(false);
    }

    nameText.setText(tower.stats.name);
    stageText.setText(STAGE_NAMES[tower.stage]);

    const attrColor = ATTRIBUTE_COLORS_STR[tower.attribute] || '#ffffff';
    attributeText.setText(ATTRIBUTE_NAMES[tower.attribute]);
    attributeText.setColor(attrColor);

    levelText.setText(`Lv. ${tower.level}`);
    dpText.setText(`DP: ${tower.dp}`);
  }

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  public destroy(fromScene?: boolean): void {
    this.towerA = null;
    this.towerB = null;
    this.onConfirmCallback = null;
    super.destroy(fromScene);
  }
}
