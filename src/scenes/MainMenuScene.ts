import Phaser from 'phaser';
import { SaveManager } from '@/managers/SaveManager';
import { COLORS, TEXT_STYLES, ANIM, FONTS } from '@/ui/UITheme';
import { drawDigitalGrid, drawButton, animateButtonHover, animateButtonPress } from '@/ui/UIHelpers';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.cameras.main.setBackgroundColor('#0a0a18');

    // Digital grid texture
    const gridGfx = this.add.graphics();
    drawDigitalGrid(gridGfx, width, height);

    // Title text with floating tween
    const title = this.add.text(width / 2, height / 3, 'DigiMerge TD', TEXT_STYLES.SCENE_TITLE)
      .setOrigin(0.5);

    this.tweens.add({
      targets: title,
      y: title.y - 6,
      duration: 3000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Subtitle
    this.add.text(width / 2, height / 3 + 60, 'A Digimon Tower Defense Merge Game', TEXT_STYLES.SCENE_SUBTITLE)
      .setOrigin(0.5);

    let btnY = height / 2 + 20;

    // Continue button (only shown if save exists)
    if (SaveManager.hasSave()) {
      const save = SaveManager.load();
      if (save) {
        this.createMenuButton(
          width / 2, btnY, 240, 48,
          `Continue (Wave ${save.gameState.currentWave})`,
          COLORS.SUCCESS, COLORS.SUCCESS_HOVER,
          () => {
            this.registry.set('loadSave', true);
            this.scene.start('GameScene');
          },
        );
        btnY += 65;
      }
    }

    // New Game button
    this.createMenuButton(
      width / 2, btnY, 240, 48,
      'New Game',
      COLORS.PRIMARY, COLORS.PRIMARY_HOVER,
      () => {
        this.registry.remove('loadSave');
        this.scene.start('StarterSelectScene');
      },
    );

    // Version text
    this.add.text(width / 2, height - 30, 'v0.1.0 - MVP', TEXT_STYLES.VERSION)
      .setOrigin(0.5);

    // Scene entrance fade
    this.cameras.main.fadeIn(ANIM.FADE_IN_MS, 10, 10, 24);
  }

  private createMenuButton(
    x: number, y: number, w: number, h: number,
    label: string,
    normalColor: number, hoverColor: number,
    onClick: () => void,
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    drawButton(bg, w, h, normalColor);
    container.add(bg);

    const text = this.add.text(0, 0, label, {
      fontFamily: FONTS.DISPLAY,
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    container.add(text);

    const hitArea = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    container.input!.cursor = 'pointer';

    container.on('pointerover', () => {
      drawButton(bg, w, h, hoverColor, { glowRing: true });
      animateButtonHover(this, container, true);
    });
    container.on('pointerout', () => {
      drawButton(bg, w, h, normalColor);
      animateButtonHover(this, container, false);
    });
    container.on('pointerdown', () => {
      animateButtonPress(this, container);
      onClick();
    });

    return container;
  }
}
