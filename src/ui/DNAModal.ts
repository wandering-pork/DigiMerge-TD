import Phaser from 'phaser';
import { Tower } from '@/entities/Tower';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config/Constants';
import { STAGE_NAMES, ATTRIBUTE_NAMES, Stage } from '@/types';
import { DIGIMON_DATABASE } from '@/data/DigimonDatabase';
import { findDNAPair, getDNAPairsFor } from '@/data/EvolutionPaths';
import { COLORS, ATTRIBUTE_COLORS_STR, TEXT_STYLES, FONTS } from './UITheme';
import { drawPanel, drawButton, drawSeparator, animateModalIn, animateModalOut, animateButtonHover, animateButtonPress } from './UIHelpers';
import { canDisplaySprite, getStaticFrame } from '@/utils/SpriteAnimHelper';

/**
 * DNAModal — Displayed when a Mega-tier tower initiates DNA Digivolution.
 * Shows the source tower, compatible partners on the board, and the Ultra result.
 */
export class DNAModal extends Phaser.GameObjects.Container {
  private overlay!: Phaser.GameObjects.Graphics;
  private panelContainer!: Phaser.GameObjects.Container;
  private panelBg!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;
  private subtitleText!: Phaser.GameObjects.Text;
  private optionContainer!: Phaser.GameObjects.Container;
  private cancelBtn!: Phaser.GameObjects.Container;
  private cancelBtnBg!: Phaser.GameObjects.Graphics;

  private sourceTower: Tower | null = null;
  private onConfirmCallback: ((source: Tower, partner: Tower, resultId: string) => void) | null = null;

  private static readonly PANEL_WIDTH = 480;
  private static readonly PANEL_HEIGHT = 420;

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
    const w = DNAModal.PANEL_WIDTH;
    const h = DNAModal.PANEL_HEIGHT;
    const px = (GAME_WIDTH - w) / 2;
    const py = (GAME_HEIGHT - h) / 2;
    const centerX = GAME_WIDTH / 2;

    // Dark overlay
    this.overlay = this.scene.add.graphics();
    this.overlay.fillStyle(COLORS.OVERLAY_BLACK, 0.6);
    this.overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.overlay.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT),
      Phaser.Geom.Rectangle.Contains,
    );
    this.overlay.on('pointerdown', () => { /* swallow */ });
    this.add(this.overlay);

    // Panel container for animation
    this.panelContainer = this.scene.add.container(0, 0);
    this.add(this.panelContainer);

    // Panel background with gold tint for DNA
    this.panelBg = this.scene.add.graphics();
    drawPanel(this.panelBg, px, py, w, h, { borderColor: COLORS.GOLD });
    this.panelContainer.add(this.panelBg);

    // Title
    this.titleText = this.scene.add.text(centerX, py + 20, 'DNA Digivolution', {
      ...TEXT_STYLES.MODAL_TITLE,
      color: '#ffdd44',
    }).setOrigin(0.5, 0);
    this.panelContainer.add(this.titleText);

    // Subtitle (shows source tower info)
    this.subtitleText = this.scene.add.text(centerX, py + 52, '', {
      fontFamily: FONTS.BODY,
      fontSize: '13px',
      color: COLORS.TEXT_LABEL,
    }).setOrigin(0.5, 0);
    this.panelContainer.add(this.subtitleText);

    // Options container (populated dynamically)
    this.optionContainer = this.scene.add.container(0, 0);
    this.panelContainer.add(this.optionContainer);

    // Cancel button
    const cancelBtnW = 140;
    const cancelBtnH = 38;
    this.cancelBtn = this.scene.add.container(centerX, py + h - 40);
    this.cancelBtnBg = this.scene.add.graphics();
    drawButton(this.cancelBtnBg, cancelBtnW, cancelBtnH, COLORS.DANGER);
    this.cancelBtn.add(this.cancelBtnBg);

    const cancelText = this.scene.add.text(0, 0, 'Cancel', TEXT_STYLES.BUTTON).setOrigin(0.5);
    this.cancelBtn.add(cancelText);

    const cancelHitArea = new Phaser.Geom.Rectangle(-cancelBtnW / 2, -cancelBtnH / 2, cancelBtnW, cancelBtnH);
    this.cancelBtn.setInteractive(cancelHitArea, Phaser.Geom.Rectangle.Contains);
    this.cancelBtn.input!.cursor = 'pointer';
    this.cancelBtn.on('pointerdown', () => {
      animateButtonPress(this.scene, this.cancelBtn);
      this.hide();
    });
    this.cancelBtn.on('pointerover', () => {
      drawButton(this.cancelBtnBg, cancelBtnW, cancelBtnH, COLORS.DANGER_HOVER, { glowRing: true });
      animateButtonHover(this.scene, this.cancelBtn, true);
    });
    this.cancelBtn.on('pointerout', () => {
      drawButton(this.cancelBtnBg, cancelBtnW, cancelBtnH, COLORS.DANGER);
      animateButtonHover(this.scene, this.cancelBtn, false);
    });
    this.panelContainer.add(this.cancelBtn);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Show the DNA modal for a source tower with available partners from the board.
   * @param source The Mega tower initiating DNA Digivolution
   * @param allTowers All placed towers on the board (to find partners)
   * @param onConfirm Callback when the player confirms a DNA fusion
   */
  public show(
    source: Tower,
    allTowers: Tower[],
    onConfirm: (source: Tower, partner: Tower, resultId: string) => void,
  ): void {
    this.sourceTower = source;
    this.onConfirmCallback = onConfirm;

    this.subtitleText.setText(`Select a partner for ${source.stats.name}`);

    // Find all DNA pairs for this tower
    const dnaPairs = getDNAPairsFor(source.digimonId);

    // Find matching partners on the board
    const partners: Array<{ tower: Tower; resultId: string }> = [];
    for (const pair of dnaPairs) {
      const partnerId = pair.partnerAId === source.digimonId ? pair.partnerBId : pair.partnerAId;

      for (const tower of allTowers) {
        if (tower === source) continue;
        if (tower.digimonId !== partnerId) continue;
        if (tower.stage !== Stage.MEGA) continue;

        // Check DP requirement
        if (Math.max(source.dp, tower.dp) >= pair.minDPRequired) {
          partners.push({ tower, resultId: pair.resultId });
        }
      }
    }

    this.buildOptions(source, partners);

    this.setVisible(true);
    this.overlay.setAlpha(0);
    this.scene.tweens.add({ targets: this.overlay, alpha: 1, duration: 200 });
    animateModalIn(this.scene, this.panelContainer);
  }

  public hide(): void {
    animateModalOut(this.scene, this.panelContainer);
    this.scene.tweens.add({
      targets: this.overlay, alpha: 0, duration: 200,
      onComplete: () => {
        this.setVisible(false);
        this.sourceTower = null;
        this.onConfirmCallback = null;
        this.optionContainer.removeAll(true);
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Options
  // ---------------------------------------------------------------------------

  private buildOptions(
    source: Tower,
    partners: Array<{ tower: Tower; resultId: string }>,
  ): void {
    this.optionContainer.removeAll(true);

    const w = DNAModal.PANEL_WIDTH;
    const h = DNAModal.PANEL_HEIGHT;
    const px = (GAME_WIDTH - w) / 2;
    const py = (GAME_HEIGHT - h) / 2;
    const centerX = GAME_WIDTH / 2;

    if (partners.length === 0) {
      const noPairsText = this.scene.add.text(centerX, py + 120, 'No compatible DNA partners\non the board.', {
        fontFamily: FONTS.BODY,
        fontSize: '15px',
        color: COLORS.TEXT_DIM,
        align: 'center',
      }).setOrigin(0.5, 0);
      this.optionContainer.add(noPairsText);

      // Hint about what's needed
      const dnaPairs = getDNAPairsFor(source.digimonId);
      if (dnaPairs.length > 0) {
        const neededIds = dnaPairs.map(p =>
          p.partnerAId === source.digimonId ? p.partnerBId : p.partnerAId
        );
        const neededNames = neededIds
          .map(id => DIGIMON_DATABASE.towers[id]?.name ?? id)
          .join(', ');

        const hintText = this.scene.add.text(centerX, py + 170, `Needs: ${neededNames}\n(Mega, max level, on the board)`, {
          fontFamily: FONTS.BODY,
          fontSize: '12px',
          color: COLORS.TEXT_GOLD,
          align: 'center',
        }).setOrigin(0.5, 0);
        this.optionContainer.add(hintText);
      }
      return;
    }

    partners.forEach((entry, index) => {
      const resultStats = DIGIMON_DATABASE.towers[entry.resultId];
      if (!resultStats) return;

      const optionY = py + 80 + index * 90;
      const optionCont = this.scene.add.container(0, 0);

      // Card background
      const bg = this.scene.add.graphics();
      drawPanel(bg, px + 16, optionY, w - 32, 80, {
        borderColor: COLORS.GOLD_DIM,
        borderAlpha: 0.6,
        radius: 6,
      });
      optionCont.add(bg);

      // Gold accent stripe
      const stripe = this.scene.add.graphics();
      stripe.fillStyle(COLORS.GOLD, 0.6);
      stripe.fillRoundedRect(px + 16, optionY, 4, 80, { tl: 6, bl: 6, tr: 0, br: 0 });
      optionCont.add(stripe);

      // Partner sprite
      const partnerSpriteKey = entry.tower.stats.spriteKey ?? entry.tower.digimonId;
      if (canDisplaySprite(this.scene, partnerSpriteKey)) {
        const partnerFrame = getStaticFrame(partnerSpriteKey);
        const pSprite = partnerFrame
          ? this.scene.add.image(px + 48, optionY + 28, partnerFrame.atlas, partnerFrame.frame)
          : this.scene.add.image(px + 48, optionY + 28, partnerSpriteKey);
        pSprite.setScale(2.5);
        optionCont.add(pSprite);
      }

      // Arrow
      const arrow = this.scene.add.text(px + 82, optionY + 22, '+', {
        fontFamily: FONTS.DISPLAY,
        fontSize: '20px',
        color: COLORS.TEXT_GOLD,
        fontStyle: 'bold',
      }).setOrigin(0.5, 0);
      optionCont.add(arrow);

      // Result sprite
      const resultSpriteKey = resultStats.spriteKey ?? entry.resultId;
      if (canDisplaySprite(this.scene, resultSpriteKey)) {
        const resultFrame = getStaticFrame(resultSpriteKey);
        const rSprite = resultFrame
          ? this.scene.add.image(px + 116, optionY + 28, resultFrame.atlas, resultFrame.frame)
          : this.scene.add.image(px + 116, optionY + 28, resultSpriteKey);
        rSprite.setScale(2.5);
        optionCont.add(rSprite);
      }

      // Partner name + info
      const partnerName = entry.tower.stats.name;
      optionCont.add(this.scene.add.text(px + 150, optionY + 8, `${partnerName} → ${resultStats.name}`, {
        fontFamily: FONTS.DISPLAY,
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold',
      }));

      // Result stats
      const stageName = STAGE_NAMES[resultStats.stageTier];
      const attrName = ATTRIBUTE_NAMES[resultStats.attribute];
      optionCont.add(this.scene.add.text(px + 150, optionY + 28, `${stageName} | ${attrName} | DMG: ${resultStats.baseDamage} | SPD: ${resultStats.baseSpeed}`, {
        fontFamily: FONTS.BODY,
        fontSize: '10px',
        color: COLORS.TEXT_DIM,
      }));

      // Partner info line
      optionCont.add(this.scene.add.text(px + 150, optionY + 46, `Partner: Lv.${entry.tower.level} DP:${entry.tower.dp}`, {
        fontFamily: FONTS.MONO,
        fontSize: '10px',
        color: COLORS.TEXT_LABEL,
      }));

      // Fuse button
      const fuseBtnW = 72;
      const fuseBtnH = 30;
      const fuseBtn = this.scene.add.container(px + w - 56, optionY + 40);
      const fuseBtnBg = this.scene.add.graphics();
      drawButton(fuseBtnBg, fuseBtnW, fuseBtnH, COLORS.GOLD_DIM);
      fuseBtn.add(fuseBtnBg);

      const fuseBtnText = this.scene.add.text(0, 0, 'Fuse!', {
        ...TEXT_STYLES.BUTTON_SM,
        color: '#ffffff',
      }).setOrigin(0.5);
      fuseBtn.add(fuseBtnText);

      const fuseHitArea = new Phaser.Geom.Rectangle(-fuseBtnW / 2, -fuseBtnH / 2, fuseBtnW, fuseBtnH);
      fuseBtn.setInteractive(fuseHitArea, Phaser.Geom.Rectangle.Contains);
      fuseBtn.input!.cursor = 'pointer';
      fuseBtn.on('pointerdown', () => {
        animateButtonPress(this.scene, fuseBtn);
        this.doFuse(entry.tower, entry.resultId);
      });
      fuseBtn.on('pointerover', () => {
        drawButton(fuseBtnBg, fuseBtnW, fuseBtnH, COLORS.GOLD, { glowRing: true });
        animateButtonHover(this.scene, fuseBtn, true);
      });
      fuseBtn.on('pointerout', () => {
        drawButton(fuseBtnBg, fuseBtnW, fuseBtnH, COLORS.GOLD_DIM);
        animateButtonHover(this.scene, fuseBtn, false);
      });
      optionCont.add(fuseBtn);

      this.optionContainer.add(optionCont);
    });
  }

  // ---------------------------------------------------------------------------
  // Fusion Execution
  // ---------------------------------------------------------------------------

  private doFuse(partner: Tower, resultId: string): void {
    if (!this.sourceTower || !this.onConfirmCallback) return;
    const source = this.sourceTower;
    const callback = this.onConfirmCallback;
    this.hide();
    callback(source, partner, resultId);
  }

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  public destroy(fromScene?: boolean): void {
    this.sourceTower = null;
    this.onConfirmCallback = null;
    super.destroy(fromScene);
  }
}
