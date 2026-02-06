import Phaser from 'phaser';
import { Tower } from '@/entities/Tower';
import { DIGIMON_DATABASE } from '@/data/DigimonDatabase';
import { getEvolutions } from '@/data/EvolutionPaths';
import { DIGIVOLVE_COSTS, GAME_WIDTH, GAME_HEIGHT } from '@/config/Constants';
import { STAGE_NAMES, ATTRIBUTE_NAMES, EvolutionPath } from '@/types';
import { EventBus, GameEvents } from '@/utils/EventBus';

/**
 * EvolutionModal is a centered overlay that shows available evolution
 * options when a tower reaches max level and the player triggers digivolve.
 */
export class EvolutionModal extends Phaser.GameObjects.Container {
  private overlay!: Phaser.GameObjects.Graphics;
  private panelBg!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;
  private costText!: Phaser.GameObjects.Text;
  private cancelBtn!: Phaser.GameObjects.Text;
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
    this.overlay.fillStyle(0x000000, 0.6);
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

    // Panel background
    this.panelBg = this.scene.add.graphics();
    this.panelBg.fillStyle(0x1a1a33, 0.98);
    this.panelBg.fillRoundedRect(px, py, w, h, 10);
    this.panelBg.lineStyle(2, 0x6666cc, 1);
    this.panelBg.strokeRoundedRect(px, py, w, h, 10);
    this.add(this.panelBg);

    // Title
    this.titleText = this.scene.add.text(GAME_WIDTH / 2, py + 20, 'Digivolution', {
      fontSize: '24px',
      color: '#ffdd44',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);
    this.add(this.titleText);

    // Cost text
    this.costText = this.scene.add.text(GAME_WIDTH / 2, py + 55, '', {
      fontSize: '16px',
      color: '#aaaacc',
    }).setOrigin(0.5, 0);
    this.add(this.costText);

    // Options container
    this.optionContainer = this.scene.add.container(0, 0);
    this.add(this.optionContainer);

    // Cancel button
    this.cancelBtn = this.scene.add.text(GAME_WIDTH / 2, py + h - 45, 'Cancel', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#663333',
      padding: { x: 30, y: 8 },
    }).setOrigin(0.5, 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.cancelBtn.setStyle({ backgroundColor: '#aa4444' }))
      .on('pointerout', () => this.cancelBtn.setStyle({ backgroundColor: '#663333' }))
      .on('pointerdown', () => this.hide());
    this.add(this.cancelBtn);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Show the evolution modal for a specific tower.
   * Looks up available evolution paths based on the tower's current
   * Digimon and DP.
   */
  public show(tower: Tower): void {
    this.currentTower = tower;

    const evolutions = getEvolutions(tower.digimonId, tower.dp);
    const cost = this.getDigivolveCost(tower.stage);

    this.titleText.setText(`Digivolve ${tower.stats.name}`);
    this.costText.setText(`Cost: ${cost} DB`);

    this.buildOptions(evolutions, cost);
    this.setVisible(true);
  }

  /**
   * Hide the modal and clear state.
   */
  public hide(): void {
    this.setVisible(false);
    this.currentTower = null;
    this.optionContainer.removeAll(true);
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
        color: '#666688',
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
      const optionContainer = this.scene.add.container(0, 0);

      // Background
      const bg = this.scene.add.graphics();
      bg.fillStyle(canAfford ? 0x222255 : 0x332222, 0.9);
      bg.fillRoundedRect(px + 20, optionY, w - 40, 68, 6);
      optionContainer.add(bg);

      // Sprite
      if (this.scene.textures.exists(evo.resultId)) {
        const sprite = this.scene.add.image(px + 55, optionY + 34, evo.resultId);
        sprite.setScale(3);
        optionContainer.add(sprite);
      }

      // Name and stage
      const nameText = this.scene.add.text(px + 90, optionY + 8, stats.name, {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
      });
      optionContainer.add(nameText);

      // Stats line
      const stageName = STAGE_NAMES[stats.stageTier];
      const attrName = ATTRIBUTE_NAMES[stats.attribute];
      const infoText = this.scene.add.text(px + 90, optionY + 30, `${stageName} | ${attrName} | DMG: ${stats.baseDamage} | SPD: ${stats.baseSpeed}`, {
        fontSize: '11px',
        color: '#888899',
      });
      optionContainer.add(infoText);

      // DP requirement
      const dpText = this.scene.add.text(px + 90, optionY + 48, `DP: ${evo.minDP}-${evo.maxDP}${evo.isDefault ? ' (Default)' : ' (Alternate)'}`, {
        fontSize: '11px',
        color: evo.isDefault ? '#44cc44' : '#cccc44',
      });
      optionContainer.add(dpText);

      // Select button
      if (canAfford) {
        const selectBtn = this.scene.add.text(px + w - 80, optionY + 20, 'Evolve', {
          fontSize: '14px',
          color: '#ffffff',
          backgroundColor: '#336633',
          padding: { x: 10, y: 6 },
        }).setOrigin(0.5, 0)
          .setInteractive({ useHandCursor: true })
          .on('pointerover', () => selectBtn.setStyle({ backgroundColor: '#44aa44' }))
          .on('pointerout', () => selectBtn.setStyle({ backgroundColor: '#336633' }))
          .on('pointerdown', () => this.doEvolve(evo.resultId, cost));
        optionContainer.add(selectBtn);
      } else {
        const cantAffordText = this.scene.add.text(px + w - 80, optionY + 24, 'Need DB', {
          fontSize: '12px',
          color: '#ff4444',
        }).setOrigin(0.5, 0);
        optionContainer.add(cantAffordText);
      }

      this.optionContainer.add(optionContainer);
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
