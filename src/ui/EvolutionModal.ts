import Phaser from 'phaser';
import { Tower } from '@/entities/Tower';
import { DIGIMON_DATABASE } from '@/data/DigimonDatabase';
import { getEvolutions } from '@/data/EvolutionPaths';
import { DIGIVOLVE_COSTS, GAME_WIDTH, GAME_HEIGHT } from '@/config/Constants';
import { STAGE_NAMES, ATTRIBUTE_NAMES, EvolutionPath } from '@/types';
import { EventBus, GameEvents } from '@/utils/EventBus';
import { COLORS, ATTRIBUTE_COLORS_STR, TEXT_STYLES, FONTS } from './UITheme';
import { drawPanel, drawButton, animateModalIn, animateModalOut, animateButtonHover, animateButtonPress } from './UIHelpers';

/**
 * EvolutionModal is a centered overlay that shows available evolution
 * options when a tower reaches max level and the player triggers digivolve.
 */
export class EvolutionModal extends Phaser.GameObjects.Container {
  private overlay!: Phaser.GameObjects.Graphics;
  private panelContainer!: Phaser.GameObjects.Container;
  private panelBg!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;
  private costText!: Phaser.GameObjects.Text;
  private cancelBtn!: Phaser.GameObjects.Container;
  private cancelBtnBg!: Phaser.GameObjects.Graphics;
  private optionContainer!: Phaser.GameObjects.Container;

  private currentTower: Tower | null = null;
  private getDigibytes: () => number;
  private spendDigibytes: (amount: number) => boolean;
  private addDigibytes: (amount: number) => void;

  private static readonly PANEL_WIDTH = 500;
  private static readonly PANEL_HEIGHT = 400;

  constructor(
    scene: Phaser.Scene,
    getDigibytes: () => number,
    spendDigibytes: (amount: number) => boolean,
    addDigibytes: (amount: number) => void,
  ) {
    super(scene, 0, 0);

    this.getDigibytes = getDigibytes;
    this.spendDigibytes = spendDigibytes;
    this.addDigibytes = addDigibytes;

    this.buildModal();
    this.setVisible(false);
    this.setDepth(50);

    scene.add.existing(this);
  }

  // ---------------------------------------------------------------------------
  // Construction
  // ---------------------------------------------------------------------------

  private buildModal(): void {
    // Dark semi-transparent overlay covering the whole screen
    this.overlay = this.scene.add.graphics();
    this.overlay.fillStyle(COLORS.OVERLAY_BLACK, 0.6);
    this.overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.overlay.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT),
      Phaser.Geom.Rectangle.Contains,
    );
    this.add(this.overlay);

    const w = EvolutionModal.PANEL_WIDTH;
    const h = EvolutionModal.PANEL_HEIGHT;
    const px = (GAME_WIDTH - w) / 2;
    const py = (GAME_HEIGHT - h) / 2;

    // Panel container for pop animation
    this.panelContainer = this.scene.add.container(0, 0);
    this.add(this.panelContainer);

    // Panel background — themed with purple tint
    this.panelBg = this.scene.add.graphics();
    drawPanel(this.panelBg, px, py, w, h, { borderColor: COLORS.SPECIAL });
    this.panelContainer.add(this.panelBg);

    // Title
    this.titleText = this.scene.add.text(GAME_WIDTH / 2, py + 20, 'Digivolution', TEXT_STYLES.MODAL_TITLE).setOrigin(0.5, 0);
    this.panelContainer.add(this.titleText);

    // Cost text
    this.costText = this.scene.add.text(GAME_WIDTH / 2, py + 55, '', {
      fontFamily: FONTS.DISPLAY,
      fontSize: '16px',
      color: COLORS.TEXT_LABEL,
    }).setOrigin(0.5, 0);
    this.panelContainer.add(this.costText);

    // Options container
    this.optionContainer = this.scene.add.container(0, 0);
    this.panelContainer.add(this.optionContainer);

    // Cancel button (Container + Graphics)
    const cancelBtnW = 140;
    const cancelBtnH = 38;
    this.cancelBtn = this.scene.add.container(GAME_WIDTH / 2, py + h - 40);
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

  public show(tower: Tower): void {
    this.currentTower = tower;

    const evolutions = getEvolutions(tower.digimonId, tower.dp);
    const cost = this.getDigivolveCost(tower.stage);

    this.titleText.setText(`Digivolve ${tower.stats.name}`);
    this.costText.setText(`Cost: ${cost} DB`);

    this.buildOptions(evolutions, cost);
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
        this.currentTower = null;
        this.optionContainer.removeAll(true);
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Options
  // ---------------------------------------------------------------------------

  private buildOptions(evolutions: EvolutionPath[], cost: number): void {
    this.optionContainer.removeAll(true);

    const w = EvolutionModal.PANEL_WIDTH;
    const h = EvolutionModal.PANEL_HEIGHT;
    const px = (GAME_WIDTH - w) / 2;
    const py = (GAME_HEIGHT - h) / 2;

    if (evolutions.length === 0) {
      const noEvolutions = this.scene.add.text(GAME_WIDTH / 2, py + 120, 'No evolution paths available\nat current DP level', {
        fontSize: '16px',
        color: COLORS.TEXT_DIM,
        align: 'center',
      }).setOrigin(0.5, 0);
      this.optionContainer.add(noEvolutions);
      return;
    }

    const canAfford = this.getDigibytes() >= cost;

    evolutions.forEach((evo, index) => {
      const stats = DIGIMON_DATABASE.towers[evo.resultId];
      if (!stats) return;

      const optionY = py + 90 + index * 80;
      const optionCont = this.scene.add.container(0, 0);

      // Card background — mini panel with attribute accent
      const bg = this.scene.add.graphics();
      drawPanel(bg, px + 20, optionY, w - 40, 68, {
        borderColor: canAfford ? COLORS.CYAN_DIM : COLORS.DANGER,
        borderAlpha: 0.5,
        radius: 6,
      });
      optionCont.add(bg);

      // Attribute-colored left accent stripe
      const attrColor = (COLORS as any)[['VACCINE', 'DATA', 'VIRUS', 'FREE'][stats.attribute]] || COLORS.CYAN;
      const stripe = this.scene.add.graphics();
      stripe.fillStyle(attrColor, 0.6);
      stripe.fillRoundedRect(px + 20, optionY, 4, 68, { tl: 6, bl: 6, tr: 0, br: 0 });
      optionCont.add(stripe);

      // Sprite
      if (this.scene.textures.exists(evo.resultId)) {
        const sprite = this.scene.add.image(px + 55, optionY + 34, evo.resultId);
        sprite.setScale(3);
        optionCont.add(sprite);
      }

      // Name and stage
      const nameText = this.scene.add.text(px + 90, optionY + 8, stats.name, {
        fontFamily: FONTS.DISPLAY,
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
      });
      optionCont.add(nameText);

      // Stats line
      const stageName = STAGE_NAMES[stats.stageTier];
      const attrName = ATTRIBUTE_NAMES[stats.attribute];
      const attrStrColor = ATTRIBUTE_COLORS_STR[stats.attribute] || COLORS.TEXT_DIM;
      const infoText = this.scene.add.text(px + 90, optionY + 30, `${stageName} | ${attrName} | DMG: ${stats.baseDamage} | SPD: ${stats.baseSpeed}`, {
        fontSize: '11px',
        color: COLORS.TEXT_DIM,
      });
      optionCont.add(infoText);

      // DP requirement
      const dpText = this.scene.add.text(px + 90, optionY + 48, `DP: ${evo.minDP}-${evo.maxDP}${evo.isDefault ? ' (Default)' : ' (Alternate)'}`, {
        fontSize: '11px',
        color: evo.isDefault ? COLORS.VACCINE_STR : COLORS.FREE_STR,
      });
      optionCont.add(dpText);

      // Evolve button (Container + Graphics)
      if (canAfford) {
        const evoBtnW = 80;
        const evoBtnH = 30;
        const evoBtn = this.scene.add.container(px + w - 60, optionY + 34);
        const evoBtnBg = this.scene.add.graphics();
        drawButton(evoBtnBg, evoBtnW, evoBtnH, COLORS.SUCCESS);
        evoBtn.add(evoBtnBg);

        const evoBtnText = this.scene.add.text(0, 0, 'Evolve', TEXT_STYLES.BUTTON_SM).setOrigin(0.5);
        evoBtn.add(evoBtnText);

        const evoHitArea = new Phaser.Geom.Rectangle(-evoBtnW / 2, -evoBtnH / 2, evoBtnW, evoBtnH);
        evoBtn.setInteractive(evoHitArea, Phaser.Geom.Rectangle.Contains);
        evoBtn.input!.cursor = 'pointer';
        evoBtn.on('pointerdown', () => {
          animateButtonPress(this.scene, evoBtn);
          this.doEvolve(evo.resultId, cost);
        });
        evoBtn.on('pointerover', () => {
          drawButton(evoBtnBg, evoBtnW, evoBtnH, COLORS.SUCCESS_HOVER, { glowRing: true });
          animateButtonHover(this.scene, evoBtn, true);
        });
        evoBtn.on('pointerout', () => {
          drawButton(evoBtnBg, evoBtnW, evoBtnH, COLORS.SUCCESS);
          animateButtonHover(this.scene, evoBtn, false);
        });
        optionCont.add(evoBtn);
      } else {
        const cantAffordText = this.scene.add.text(px + w - 60, optionY + 34, 'Need DB', {
          fontSize: '12px',
          color: COLORS.TEXT_LIVES,
        }).setOrigin(0.5);
        optionCont.add(cantAffordText);
      }

      this.optionContainer.add(optionCont);
    });
  }

  // ---------------------------------------------------------------------------
  // Evolution Execution
  // ---------------------------------------------------------------------------

  private doEvolve(resultId: string, cost: number): void {
    if (!this.currentTower) return;

    if (!this.spendDigibytes(cost)) return;

    const tower = this.currentTower;
    const previousDigimonId = tower.digimonId;

    // Apply evolution: change Digimon, reset level to 1
    tower.setDigimon(resultId);
    tower.setLevel(1);

    EventBus.emit(GameEvents.TOWER_EVOLVED, {
      towerID: tower.towerID,
      previousDigimonId,
      newDigimonId: resultId,
      newStage: tower.stage,
    });

    this.hide();
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private getDigivolveCost(currentStage: number): number {
    if (currentStage >= 0 && currentStage < DIGIVOLVE_COSTS.length) {
      return DIGIVOLVE_COSTS[currentStage];
    }
    return DIGIVOLVE_COSTS[DIGIVOLVE_COSTS.length - 1];
  }
}
