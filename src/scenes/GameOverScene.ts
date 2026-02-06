import Phaser from 'phaser';
import { COLORS, TEXT_STYLES, FONTS, ANIM } from '@/ui/UITheme';
import { drawDigitalGrid, drawButton, animateButtonHover, animateButtonPress } from '@/ui/UIHelpers';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.cameras.main.setBackgroundColor('#0a0a18');

    // Determine if victory or defeat
    const isVictory: boolean = this.registry.get('gameResult') === 'victory';
    const waveReached: number = this.registry.get('waveReached') || 1;

    // Digital grid with tinted color
    const gridGfx = this.add.graphics();
    const gridColor = isVictory ? COLORS.VACCINE : COLORS.DANGER;
    const gridAlpha = 0.02;
    drawDigitalGrid(gridGfx, width, height, 40, gridColor, gridAlpha);

    // Title
    const titleText = isVictory ? 'Victory!' : 'Game Over';
    const titleColor = isVictory ? COLORS.VACCINE_STR : COLORS.TEXT_LIVES;

    const title = this.add.text(width / 2, height / 3 - 30, titleText, {
      ...TEXT_STYLES.SCENE_TITLE,
      fontSize: '56px',
      color: titleColor,
    }).setOrigin(0.5);

    // Victory: floating tween, Defeat: shake tween
    if (isVictory) {
      this.tweens.add({
        targets: title,
        y: title.y - 6,
        duration: 2000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });
    } else {
      this.tweens.add({
        targets: title,
        x: title.x - 3,
        duration: 80,
        yoyo: true,
        repeat: 5,
      });
    }

    // Wave reached
    this.add.text(width / 2, height / 3 + 40, `Wave Reached: ${waveReached}`, {
      fontFamily: FONTS.MONO,
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Subtitle message
    const subtitle = isVictory
      ? 'You defended the Digital World!'
      : 'The Digital World has fallen...';

    this.add.text(width / 2, height / 3 + 80, subtitle, TEXT_STYLES.SCENE_SUBTITLE).setOrigin(0.5);

    // Play Again button
    this.createMenuButton(
      width / 2, height / 2 + 60, 200, 44,
      'Play Again',
      COLORS.PRIMARY, COLORS.PRIMARY_HOVER,
      () => this.scene.start('StarterSelectScene'),
    );

    // Main Menu button
    this.createMenuButton(
      width / 2, height / 2 + 130, 200, 44,
      'Main Menu',
      COLORS.PRIMARY, COLORS.PRIMARY_HOVER,
      () => this.scene.start('MainMenuScene'),
    );

    // Camera fade-in
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
      fontSize: '20px',
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
