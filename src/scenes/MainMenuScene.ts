import Phaser from 'phaser';
import { SaveManager } from '@/managers/SaveManager';
import { COLORS, TEXT_STYLES, ANIM, FONTS } from '@/ui/UITheme';
import { drawDigitalGrid, drawButton, createDigitalParticles, animateButtonHover, animateButtonPress, animateStaggeredEntrance } from '@/ui/UIHelpers';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.cameras.main.setBackgroundColor('#060614');

    // Digital grid texture (very subtle)
    const gridGfx = this.add.graphics();
    drawDigitalGrid(gridGfx, width, height, 50, COLORS.CYAN, 0.025);

    // Floating digital particles
    createDigitalParticles(this, width, height, 25, COLORS.CYAN);

    // Decorative corner accents
    this.drawCornerAccents(width, height);

    // Title text with glow layer underneath
    const titleGlow = this.add.text(width / 2, height / 3, 'DigiMerge TD', {
      ...TEXT_STYLES.SCENE_TITLE,
      fontSize: '52px',
    }).setOrigin(0.5).setAlpha(0.15);

    const title = this.add.text(width / 2, height / 3, 'DigiMerge TD', {
      ...TEXT_STYLES.SCENE_TITLE,
      fontSize: '52px',
    }).setOrigin(0.5);

    // Title floating animation
    this.tweens.add({
      targets: [title, titleGlow],
      y: '-=6',
      duration: 3000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Glow pulse on the shadow layer
    this.tweens.add({
      targets: titleGlow,
      alpha: { from: 0.15, to: 0.3 },
      scaleX: { from: 1, to: 1.03 },
      scaleY: { from: 1, to: 1.03 },
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Subtitle with decorative lines
    const subtitleY = height / 3 + 55;
    this.add.text(width / 2, subtitleY, 'A Digimon Tower Defense Merge Game', {
      ...TEXT_STYLES.SCENE_SUBTITLE,
      fontSize: '16px',
    }).setOrigin(0.5);

    // Decorative separator under subtitle
    const sepGfx = this.add.graphics();
    const sepW = 260;
    sepGfx.lineStyle(1, COLORS.CYAN, 0.2);
    sepGfx.lineBetween(width / 2 - sepW / 2, subtitleY + 22, width / 2 + sepW / 2, subtitleY + 22);
    sepGfx.fillStyle(COLORS.CYAN, 0.5);
    sepGfx.fillCircle(width / 2 - sepW / 2, subtitleY + 22, 2);
    sepGfx.fillCircle(width / 2 + sepW / 2, subtitleY + 22, 2);
    sepGfx.fillCircle(width / 2, subtitleY + 22, 3);

    // Build buttons with staggered entrance
    let btnY = height / 2 + 30;
    const buttons: Phaser.GameObjects.Container[] = [];

    // Continue button (only shown if save exists)
    if (SaveManager.hasSave()) {
      const save = SaveManager.load();
      if (save) {
        buttons.push(this.createMenuButton(
          width / 2, btnY, 260, 50,
          `Continue (Wave ${save.gameState.currentWave})`,
          COLORS.SUCCESS, COLORS.SUCCESS_HOVER,
          () => {
            this.registry.set('loadSave', true);
            this.scene.start('GameScene');
          },
        ));
        btnY += 68;
      }
    }

    // New Game button
    buttons.push(this.createMenuButton(
      width / 2, btnY, 260, 50,
      'New Game',
      COLORS.PRIMARY, COLORS.PRIMARY_HOVER,
      () => {
        this.registry.remove('loadSave');
        this.scene.start('StarterSelectScene');
      },
    ));
    btnY += 68;

    // Encyclopedia button
    buttons.push(this.createMenuButton(
      width / 2, btnY, 260, 50,
      'Encyclopedia',
      COLORS.BG_PANEL_LIGHT, COLORS.BG_HOVER,
      () => {
        this.scene.start('EncyclopediaScene');
      },
    ));

    // Staggered button entrance animation
    animateStaggeredEntrance(this, buttons, 'up');

    // Version text
    this.add.text(width / 2, height - 30, 'v0.1.0', TEXT_STYLES.VERSION)
      .setOrigin(0.5);

    // Scene entrance fade
    this.cameras.main.fadeIn(ANIM.FADE_IN_MS, 6, 6, 20);
  }

  private drawCornerAccents(w: number, h: number): void {
    const g = this.add.graphics();
    const len = 40;
    const inset = 20;
    const c = COLORS.CYAN;
    const a = 0.15;

    g.lineStyle(1.5, c, a);
    // Top-left
    g.lineBetween(inset, inset, inset + len, inset);
    g.lineBetween(inset, inset, inset, inset + len);
    // Top-right
    g.lineBetween(w - inset, inset, w - inset - len, inset);
    g.lineBetween(w - inset, inset, w - inset, inset + len);
    // Bottom-left
    g.lineBetween(inset, h - inset, inset + len, h - inset);
    g.lineBetween(inset, h - inset, inset, h - inset - len);
    // Bottom-right
    g.lineBetween(w - inset, h - inset, w - inset - len, h - inset);
    g.lineBetween(w - inset, h - inset, w - inset, h - inset - len);

    // Corner dots
    g.fillStyle(c, a * 2);
    g.fillCircle(inset, inset, 2);
    g.fillCircle(w - inset, inset, 2);
    g.fillCircle(inset, h - inset, 2);
    g.fillCircle(w - inset, h - inset, 2);
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
      fontSize: '20px',
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
