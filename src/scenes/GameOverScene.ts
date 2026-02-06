import Phaser from 'phaser';
import { COLORS, TEXT_STYLES, FONTS, ANIM } from '@/ui/UITheme';
import { drawDigitalGrid, drawPanel, drawButton, drawSeparator, createDigitalParticles, animateButtonHover, animateButtonPress, animateStaggeredEntrance } from '@/ui/UIHelpers';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.cameras.main.setBackgroundColor('#060614');

    // Determine if victory or defeat
    const isVictory: boolean = this.registry.get('gameResult') === 'victory';
    const waveReached: number = this.registry.get('waveReached') || 1;

    // Digital grid with tinted color
    const gridGfx = this.add.graphics();
    const gridColor = isVictory ? COLORS.VACCINE : COLORS.DANGER;
    drawDigitalGrid(gridGfx, width, height, 50, gridColor, 0.02);

    // Themed particles
    createDigitalParticles(this, width, height, 20, isVictory ? COLORS.GOLD : COLORS.DANGER);

    // Central result panel with glass effect
    const panelW = 420;
    const panelH = 350;
    const panelX = (width - panelW) / 2;
    const panelY = (height - panelH) / 2 - 30;
    const panelBg = this.add.graphics();
    drawPanel(panelBg, panelX, panelY, panelW, panelH, {
      borderColor: isVictory ? COLORS.GOLD : COLORS.DANGER,
      borderAlpha: 0.6,
    });

    // Title with dramatic entrance
    const titleText = isVictory ? 'Victory!' : 'Game Over';
    const titleColor = isVictory ? '#ffdd44' : '#ff5566';

    const titleGlow = this.add.text(width / 2, panelY + 60, titleText, {
      ...TEXT_STYLES.SCENE_TITLE,
      fontSize: '52px',
      color: titleColor,
    }).setOrigin(0.5).setAlpha(0);

    const title = this.add.text(width / 2, panelY + 60, titleText, {
      ...TEXT_STYLES.SCENE_TITLE,
      fontSize: '52px',
      color: titleColor,
    }).setOrigin(0.5).setAlpha(0);

    // Title entrance animation
    title.setScale(0.5);
    this.tweens.add({
      targets: title,
      scaleX: 1, scaleY: 1, alpha: 1,
      duration: 500,
      ease: 'Back.easeOut',
      delay: 200,
    });
    this.tweens.add({
      targets: titleGlow,
      alpha: 0.2,
      duration: 500,
      delay: 200,
    });

    // Victory: gentle float, Defeat: shake
    if (isVictory) {
      this.tweens.add({
        targets: [title, titleGlow],
        y: '-=5',
        duration: 2000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: 700,
      });
    } else {
      this.time.delayedCall(400, () => {
        this.tweens.add({
          targets: title,
          x: title.x - 4,
          duration: 60,
          yoyo: true,
          repeat: 6,
        });
      });
    }

    // Separator
    const sepGfx = this.add.graphics();
    drawSeparator(sepGfx, panelX + 30, panelY + 110, panelX + panelW - 30, isVictory ? COLORS.GOLD : COLORS.DANGER);

    // Wave reached (with delayed entrance)
    const waveLabel = this.add.text(width / 2, panelY + 135, 'Wave Reached', {
      fontFamily: FONTS.BODY,
      fontSize: '14px',
      color: '#7788aa',
    }).setOrigin(0.5).setAlpha(0);

    const waveValue = this.add.text(width / 2, panelY + 160, `${waveReached}`, {
      fontFamily: FONTS.MONO,
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 4, fill: true },
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: [waveLabel, waveValue],
      alpha: 1,
      duration: 400,
      delay: 500,
    });

    // Subtitle message
    const subtitle = isVictory
      ? 'You defended the Digital World!'
      : 'The Digital World has fallen...';

    const subtitleText = this.add.text(width / 2, panelY + 210, subtitle, {
      fontFamily: FONTS.BODY,
      fontSize: '15px',
      color: '#8899bb',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: subtitleText,
      alpha: 1,
      duration: 400,
      delay: 650,
    });

    // Action buttons with staggered entrance
    const btnStartY = panelY + 260;
    const buttons: Phaser.GameObjects.Container[] = [];

    buttons.push(this.createMenuButton(
      width / 2, btnStartY, 200, 44,
      'Play Again',
      COLORS.PRIMARY, COLORS.PRIMARY_HOVER,
      () => this.scene.start('StarterSelectScene'),
    ));

    buttons.push(this.createMenuButton(
      width / 2, btnStartY + 58, 200, 44,
      'Main Menu',
      COLORS.BG_PANEL_LIGHT, COLORS.BG_HOVER,
      () => this.scene.start('MainMenuScene'),
    ));

    // Hide buttons initially, show with stagger
    buttons.forEach((btn, i) => {
      btn.setAlpha(0);
      btn.y += 20;
      this.tweens.add({
        targets: btn,
        alpha: 1,
        y: btn.y - 20,
        duration: 350,
        ease: 'Cubic.easeOut',
        delay: 800 + i * 100,
      });
    });

    // Camera fade-in
    this.cameras.main.fadeIn(ANIM.FADE_IN_MS, 6, 6, 20);
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
      fontFamily: FONTS.BODY,
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 2, fill: true },
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
