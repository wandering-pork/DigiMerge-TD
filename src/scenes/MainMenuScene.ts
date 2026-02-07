import Phaser from 'phaser';
import { SaveManager } from '@/managers/SaveManager';
import { AudioManager } from '@/managers/AudioManager';
import { COLORS, TEXT_STYLES, ANIM, FONTS } from '@/ui/UITheme';
import { drawDigitalGrid, drawButton, drawPanel, createDigitalParticles, animateButtonHover, animateButtonPress, animateStaggeredEntrance } from '@/ui/UIHelpers';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.cameras.main.setBackgroundColor('#0f0a14');

    // Play menu music (stop any existing music first)
    this.sound.stopAll();
    try {
      const audioSettings = AudioManager.loadSettings();
      if (this.cache.audio.exists('music_menu') && audioSettings.enabled) {
        this.sound.play('music_menu', { loop: true, volume: audioSettings.musicVolume });
      }
    } catch { /* Audio not available */ }

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
    btnY += 68;

    // Credits button
    buttons.push(this.createMenuButton(
      width / 2, btnY, 260, 50,
      'Credits',
      COLORS.BG_PANEL_LIGHT, COLORS.BG_HOVER,
      () => {
        this.scene.start('CreditsScene');
      },
    ));

    // Staggered button entrance animation
    animateStaggeredEntrance(this, buttons, 'up');

    // Version text
    this.add.text(width / 2, height - 30, 'v1.0.0', TEXT_STYLES.VERSION)
      .setOrigin(0.5);

    // Settings gear button (top-right)
    const gearBtn = this.add.container(width - 45, 35);
    const gearBg = this.add.graphics();
    drawButton(gearBg, 38, 38, COLORS.BG_PANEL_LIGHT);
    gearBtn.add(gearBg);
    gearBtn.add(this.add.text(0, 0, '\u2699', {
      fontFamily: FONTS.BODY,
      fontSize: '22px',
      color: '#8899bb',
    }).setOrigin(0.5));
    const gearHitArea = new Phaser.Geom.Rectangle(-19, -19, 38, 38);
    gearBtn.setInteractive(gearHitArea, Phaser.Geom.Rectangle.Contains);
    gearBtn.input!.cursor = 'pointer';
    gearBtn.on('pointerover', () => {
      drawButton(gearBg, 38, 38, COLORS.BG_HOVER, { glowRing: true });
      animateButtonHover(this, gearBtn, true);
    });
    gearBtn.on('pointerout', () => {
      drawButton(gearBg, 38, 38, COLORS.BG_PANEL_LIGHT);
      animateButtonHover(this, gearBtn, false);
    });
    gearBtn.on('pointerdown', () => {
      animateButtonPress(this, gearBtn);
      this.scene.launch('SettingsScene', { from: 'MainMenuScene' });
    });

    // Scene entrance fade
    this.cameras.main.fadeIn(ANIM.FADE_IN_MS, 6, 6, 20);

    // Disclaimer popup (first visit only)
    if (!localStorage.getItem('digimerge_disclaimer_accepted')) {
      this.showDisclaimer(width, height);
    }
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

  shutdown() {
    this.sound.stopAll();
  }

  private showDisclaimer(width: number, height: number): void {
    const container = this.add.container(0, 0).setDepth(100);

    // Dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, width, height);
    overlay.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, width, height),
      Phaser.Geom.Rectangle.Contains,
    );
    container.add(overlay);

    const panelW = 420;
    const panelH = 260;
    const panelX = (width - panelW) / 2;
    const panelY = (height - panelH) / 2;

    const panel = this.add.graphics();
    drawPanel(panel, panelX, panelY, panelW, panelH, { borderColor: COLORS.GOLD_DIM });
    container.add(panel);

    container.add(this.add.text(width / 2, panelY + 28, 'Disclaimer', {
      ...TEXT_STYLES.SCENE_TITLE,
      fontSize: '22px',
    }).setOrigin(0.5));

    const disclaimerText =
      'This is a fan-made project for educational purposes only. ' +
      'Not affiliated with, endorsed by, or associated with Bandai Namco, ' +
      'Toei Animation, or the Digimon franchise. All Digimon names and ' +
      'likenesses are trademarks of their respective owners.';

    container.add(this.add.text(width / 2, panelY + 60, disclaimerText, {
      fontFamily: FONTS.BODY,
      fontSize: '13px',
      color: '#aabbcc',
      wordWrap: { width: panelW - 50 },
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5, 0));

    // "I Understand" button
    const btnContainer = this.add.container(width / 2, panelY + panelH - 45);
    const btnBg = this.add.graphics();
    drawButton(btnBg, 180, 40, COLORS.SUCCESS);
    btnContainer.add(btnBg);
    btnContainer.add(this.add.text(0, 0, 'I Understand', {
      fontFamily: FONTS.BODY,
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5));
    const btnHit = new Phaser.Geom.Rectangle(-90, -20, 180, 40);
    btnContainer.setInteractive(btnHit, Phaser.Geom.Rectangle.Contains);
    btnContainer.input!.cursor = 'pointer';
    btnContainer.on('pointerover', () => {
      drawButton(btnBg, 180, 40, COLORS.SUCCESS_HOVER, { glowRing: true });
      animateButtonHover(this, btnContainer, true);
    });
    btnContainer.on('pointerout', () => {
      drawButton(btnBg, 180, 40, COLORS.SUCCESS);
      animateButtonHover(this, btnContainer, false);
    });
    btnContainer.on('pointerdown', () => {
      animateButtonPress(this, btnContainer);
      localStorage.setItem('digimerge_disclaimer_accepted', 'true');
      container.destroy();
    });
    container.add(btnContainer);
  }
}
