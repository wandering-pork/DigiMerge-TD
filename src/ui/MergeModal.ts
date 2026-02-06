import Phaser from 'phaser';
import { Tower } from '@/entities/Tower';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config/Constants';
import { STAGE_NAMES, ATTRIBUTE_NAMES } from '@/types';
import { getDPFromMerge } from '@/systems/DPSystem';
import { EventBus, GameEvents } from '@/utils/EventBus';

// If MergeSystem doesn't exist yet, define inline
interface MergeResult {
  survivorLevel: number;
  survivorDP: number;
}

/**
 * Attribute color map for visual distinction (matching TowerInfoPanel).
 */
const ATTRIBUTE_COLORS: Record<number, string> = {
  0: '#44dd44', // Vaccine - green
  1: '#4488ff', // Data - blue
  2: '#dd44dd', // Virus - purple
  3: '#cccccc', // Free - grey
};

/**
 * MergeModal - A centered overlay modal that shows when a merge is initiated
 * between two towers. Displays a side-by-side comparison of the survivor and
 * sacrifice, along with a preview of the merge result.
 *
 * Layout:
 *   Title: "Merge Digimon"
 *   Left side:  Tower A info (sprite, name, level, dp) with "KEEPS" label
 *   Center:     Arrow showing merge direction
 *   Right side: Tower B info (sprite, name, level, dp) with "REMOVED" label
 *   Bottom:     Result preview (new DP, new level) + Confirm / Cancel buttons
 */
export class MergeModal extends Phaser.GameObjects.Container {
  // Full-screen dark overlay
  private overlay!: Phaser.GameObjects.Graphics;

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

  // Buttons
  private confirmBtn!: Phaser.GameObjects.Container;
  private confirmBtnBg!: Phaser.GameObjects.Graphics;
  private confirmBtnText!: Phaser.GameObjects.Text;
  private cancelBtn!: Phaser.GameObjects.Container;
  private cancelBtnBg!: Phaser.GameObjects.Graphics;
  private cancelBtnText!: Phaser.GameObjects.Text;

  // State
  private towerA: Tower | null = null;  // Survivor
  private towerB: Tower | null = null;  // Sacrifice
  private onConfirmCallback: ((towerA: Tower, towerB: Tower) => void) | null = null;

  // Panel dimensions
  private static readonly PANEL_WIDTH = 450;
  private static readonly PANEL_HEIGHT = 350;

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

    // --- Dark semi-transparent overlay covering the whole screen ---
    this.overlay = this.scene.add.graphics();
    this.overlay.fillStyle(0x000000, 0.6);
    this.overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.overlay.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT),
      Phaser.Geom.Rectangle.Contains,
    );
    // Block clicks from reaching game objects behind the overlay
    this.overlay.on('pointerdown', () => { /* swallow */ });
    this.add(this.overlay);

    // --- Panel background ---
    this.panelBg = this.scene.add.graphics();
    this.panelBg.fillStyle(0x1a1a33, 0.98);
    this.panelBg.fillRoundedRect(px, py, w, h, 10);
    this.panelBg.lineStyle(2, 0x6666cc, 1);
    this.panelBg.strokeRoundedRect(px, py, w, h, 10);
    this.add(this.panelBg);

    // --- Title ---
    this.titleText = this.scene.add.text(centerX, py + 20, 'Merge Digimon', {
      fontSize: '22px',
      color: '#ffdd44',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);
    this.add(this.titleText);

    // =====================================================================
    // Left side: Tower A (Survivor)
    // =====================================================================
    const leftCenterX = px + 110;
    const cardTopY = py + 60;

    this.towerALabel = this.scene.add.text(leftCenterX, cardTopY, 'KEEPS', {
      fontSize: '12px',
      color: '#44cc44',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);
    this.add(this.towerALabel);

    this.towerASprite = this.scene.add.image(leftCenterX, cardTopY + 40, '__DEFAULT');
    this.towerASprite.setScale(3);
    this.towerASprite.setVisible(false);
    this.add(this.towerASprite);

    this.towerAName = this.scene.add.text(leftCenterX, cardTopY + 68, '', {
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);
    this.add(this.towerAName);

    this.towerAStage = this.scene.add.text(leftCenterX, cardTopY + 88, '', {
      fontSize: '11px',
      color: '#aaaacc',
    }).setOrigin(0.5, 0);
    this.add(this.towerAStage);

    this.towerAAttribute = this.scene.add.text(leftCenterX, cardTopY + 104, '', {
      fontSize: '11px',
      color: '#ffffff',
    }).setOrigin(0.5, 0);
    this.add(this.towerAAttribute);

    this.towerALevel = this.scene.add.text(leftCenterX, cardTopY + 122, '', {
      fontSize: '13px',
      color: '#ffffff',
    }).setOrigin(0.5, 0);
    this.add(this.towerALevel);

    this.towerADP = this.scene.add.text(leftCenterX, cardTopY + 140, '', {
      fontSize: '13px',
      color: '#ffcc44',
    }).setOrigin(0.5, 0);
    this.add(this.towerADP);

    // =====================================================================
    // Center: Merge arrow
    // =====================================================================
    this.arrowText = this.scene.add.text(centerX, cardTopY + 60, '+', {
      fontSize: '32px',
      color: '#ffdd44',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);
    this.add(this.arrowText);

    // =====================================================================
    // Right side: Tower B (Sacrifice)
    // =====================================================================
    const rightCenterX = px + w - 110;

    this.towerBLabel = this.scene.add.text(rightCenterX, cardTopY, 'REMOVED', {
      fontSize: '12px',
      color: '#ff4444',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);
    this.add(this.towerBLabel);

    this.towerBSprite = this.scene.add.image(rightCenterX, cardTopY + 40, '__DEFAULT');
    this.towerBSprite.setScale(3);
    this.towerBSprite.setVisible(false);
    this.add(this.towerBSprite);

    this.towerBName = this.scene.add.text(rightCenterX, cardTopY + 68, '', {
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);
    this.add(this.towerBName);

    this.towerBStage = this.scene.add.text(rightCenterX, cardTopY + 88, '', {
      fontSize: '11px',
      color: '#aaaacc',
    }).setOrigin(0.5, 0);
    this.add(this.towerBStage);

    this.towerBAttribute = this.scene.add.text(rightCenterX, cardTopY + 104, '', {
      fontSize: '11px',
      color: '#ffffff',
    }).setOrigin(0.5, 0);
    this.add(this.towerBAttribute);

    this.towerBLevel = this.scene.add.text(rightCenterX, cardTopY + 122, '', {
      fontSize: '13px',
      color: '#ffffff',
    }).setOrigin(0.5, 0);
    this.add(this.towerBLevel);

    this.towerBDP = this.scene.add.text(rightCenterX, cardTopY + 140, '', {
      fontSize: '13px',
      color: '#ffcc44',
    }).setOrigin(0.5, 0);
    this.add(this.towerBDP);

    // =====================================================================
    // Result preview section (centered, below the cards)
    // =====================================================================
    const resultY = py + h - 110;

    // Separator line above result
    const separator = this.scene.add.graphics();
    separator.lineStyle(1, 0x6666cc, 0.4);
    separator.lineBetween(px + 20, resultY - 8, px + w - 20, resultY - 8);
    this.add(separator);

    this.resultHeader = this.scene.add.text(centerX, resultY, 'Merge Result', {
      fontSize: '14px',
      color: '#aaaacc',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);
    this.add(this.resultHeader);

    this.resultDPText = this.scene.add.text(centerX - 60, resultY + 22, '', {
      fontSize: '13px',
      color: '#ffcc44',
    }).setOrigin(0.5, 0);
    this.add(this.resultDPText);

    this.resultLevelText = this.scene.add.text(centerX + 60, resultY + 22, '', {
      fontSize: '13px',
      color: '#ffffff',
    }).setOrigin(0.5, 0);
    this.add(this.resultLevelText);

    // =====================================================================
    // Buttons
    // =====================================================================
    const btnY = py + h - 45;
    const btnWidth = 120;
    const btnHeight = 34;

    // --- Confirm button (green) ---
    this.confirmBtn = this.scene.add.container(centerX - 75, btnY);

    this.confirmBtnBg = this.scene.add.graphics();
    this.drawButtonBg(this.confirmBtnBg, btnWidth, btnHeight, 0x336633);
    this.confirmBtn.add(this.confirmBtnBg);

    this.confirmBtnText = this.scene.add.text(0, 0, 'Confirm', {
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.confirmBtn.add(this.confirmBtnText);

    const confirmHitArea = new Phaser.Geom.Rectangle(
      -btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight,
    );
    this.confirmBtn.setInteractive(confirmHitArea, Phaser.Geom.Rectangle.Contains);
    this.confirmBtn.input!.cursor = 'pointer';
    this.confirmBtn.on('pointerdown', () => this.onConfirm());
    this.confirmBtn.on('pointerover', () => {
      this.drawButtonBg(this.confirmBtnBg, btnWidth, btnHeight, 0x44aa44);
    });
    this.confirmBtn.on('pointerout', () => {
      this.drawButtonBg(this.confirmBtnBg, btnWidth, btnHeight, 0x336633);
    });
    this.add(this.confirmBtn);

    // --- Cancel button (red) ---
    this.cancelBtn = this.scene.add.container(centerX + 75, btnY);

    this.cancelBtnBg = this.scene.add.graphics();
    this.drawButtonBg(this.cancelBtnBg, btnWidth, btnHeight, 0x663333);
    this.cancelBtn.add(this.cancelBtnBg);

    this.cancelBtnText = this.scene.add.text(0, 0, 'Cancel', {
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.cancelBtn.add(this.cancelBtnText);

    const cancelHitArea = new Phaser.Geom.Rectangle(
      -btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight,
    );
    this.cancelBtn.setInteractive(cancelHitArea, Phaser.Geom.Rectangle.Contains);
    this.cancelBtn.input!.cursor = 'pointer';
    this.cancelBtn.on('pointerdown', () => this.hide());
    this.cancelBtn.on('pointerover', () => {
      this.drawButtonBg(this.cancelBtnBg, btnWidth, btnHeight, 0xaa4444);
    });
    this.cancelBtn.on('pointerout', () => {
      this.drawButtonBg(this.cancelBtnBg, btnWidth, btnHeight, 0x663333);
    });
    this.add(this.cancelBtn);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Show the merge modal with two towers and a callback for confirmation.
   *
   * @param towerA - The survivor tower (keeps stats, gains DP).
   * @param towerB - The sacrifice tower (will be removed on merge).
   * @param onConfirm - Called with (towerA, towerB) when the player confirms.
   */
  public show(
    towerA: Tower,
    towerB: Tower,
    onConfirm: (a: Tower, b: Tower) => void,
  ): void {
    this.towerA = towerA;
    this.towerB = towerB;
    this.onConfirmCallback = onConfirm;

    // Compute the merge result preview
    const result = this.computeMergeResult(towerA, towerB);

    // Populate Tower A info
    this.populateTowerInfo(
      towerA,
      this.towerASprite,
      this.towerAName,
      this.towerAStage,
      this.towerAAttribute,
      this.towerALevel,
      this.towerADP,
    );

    // Populate Tower B info
    this.populateTowerInfo(
      towerB,
      this.towerBSprite,
      this.towerBName,
      this.towerBStage,
      this.towerBAttribute,
      this.towerBLevel,
      this.towerBDP,
    );

    // Populate result preview
    this.resultDPText.setText(`DP: ${result.survivorDP}`);
    this.resultLevelText.setText(`Level: ${result.survivorLevel}`);

    this.setVisible(true);
  }

  /**
   * Hide the modal and clear all state.
   */
  public hide(): void {
    this.setVisible(false);
    this.towerA = null;
    this.towerB = null;
    this.onConfirmCallback = null;
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

    // Execute the callback (the caller handles the actual merge logic)
    callback(a, b);
  }

  // ---------------------------------------------------------------------------
  // Merge Result Computation
  // ---------------------------------------------------------------------------

  /**
   * Compute a preview of the merge result.
   * Survivor keeps the higher level and gains DP via the merge formula.
   */
  private computeMergeResult(towerA: Tower, towerB: Tower): MergeResult {
    return {
      survivorLevel: Math.max(towerA.level, towerB.level),
      survivorDP: getDPFromMerge(towerA.dp, towerB.dp),
    };
  }

  // ---------------------------------------------------------------------------
  // Tower Info Population
  // ---------------------------------------------------------------------------

  /**
   * Fill in one side of the comparison panel with tower data.
   */
  private populateTowerInfo(
    tower: Tower,
    sprite: Phaser.GameObjects.Image,
    nameText: Phaser.GameObjects.Text,
    stageText: Phaser.GameObjects.Text,
    attributeText: Phaser.GameObjects.Text,
    levelText: Phaser.GameObjects.Text,
    dpText: Phaser.GameObjects.Text,
  ): void {
    // Sprite
    if (this.scene.textures.exists(tower.digimonId)) {
      sprite.setTexture(tower.digimonId);
      sprite.setVisible(true);
    } else {
      sprite.setVisible(false);
    }

    // Text fields
    nameText.setText(tower.stats.name);
    stageText.setText(STAGE_NAMES[tower.stage]);

    const attrColor = ATTRIBUTE_COLORS[tower.attribute] || '#ffffff';
    attributeText.setText(ATTRIBUTE_NAMES[tower.attribute]);
    attributeText.setColor(attrColor);

    levelText.setText(`Lv. ${tower.level}`);
    dpText.setText(`DP: ${tower.dp}`);
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Draw a centered rounded-rect button background.
   */
  private drawButtonBg(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    color: number,
  ): void {
    graphics.clear();
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
    graphics.lineStyle(1, 0x6666aa, 0.5);
    graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);
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
