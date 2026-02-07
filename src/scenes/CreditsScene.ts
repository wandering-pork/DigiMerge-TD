// =============================================================================
// CreditsScene.ts — Credits screen listing attributions and disclaimer
// =============================================================================

import Phaser from 'phaser';
import { COLORS, TEXT_STYLES, FONTS, ANIM } from '@/ui/UITheme';
import { drawPanel, drawButton, drawDigitalGrid, createDigitalParticles, animateButtonHover, animateButtonPress } from '@/ui/UIHelpers';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config/Constants';

interface CreditEntry {
  label: string;
  value: string;
}

const CREDITS: CreditEntry[] = [
  { label: 'Game', value: 'DigiMerge TD - A Digimon Tower Defense Merge Game' },
  { label: 'Framework', value: 'Phaser 3 (phaser.io)' },
  { label: 'Language', value: 'TypeScript + Vite' },
  { label: 'Sprites', value: 'Digimon sprite resources (fan community)' },
  { label: 'Tileset', value: 'Sprout Lands Asset Pack by Cup Nooble' },
  { label: 'SFX', value: 'Various free sound effects' },
  { label: 'Music', value: '"Kawaii Dance" by Fassounds\n"J-Rock Anime Opening" by JustSushi' },
  { label: 'Font', value: 'Pixel Digivolve by Rikitik Studio' },
  { label: 'Built with', value: 'Claude Code by Anthropic' },
];

const DISCLAIMER =
  'This is a fan-made project for educational purposes only. ' +
  'Not affiliated with, endorsed by, or associated with Bandai Namco, ' +
  'Toei Animation, or the Digimon franchise. All Digimon names and ' +
  'likenesses are trademarks of their respective owners.';

export class CreditsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CreditsScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Dark background
    this.cameras.main.setBackgroundColor('#0f0a14');

    // Digital grid texture
    const gridGfx = this.add.graphics();
    drawDigitalGrid(gridGfx, width, height, 50, COLORS.CYAN, 0.025);

    // Floating digital particles
    createDigitalParticles(this, width, height, 15, COLORS.CYAN);

    // Corner accents
    this.drawCornerAccents(width, height);

    // Title
    this.add.text(width / 2, 50, 'Credits', {
      ...TEXT_STYLES.SCENE_TITLE,
    }).setOrigin(0.5);

    // Decorative separator under title
    const sepGfx = this.add.graphics();
    const sepW = 200;
    sepGfx.lineStyle(1, COLORS.CYAN, 0.2);
    sepGfx.lineBetween(width / 2 - sepW / 2, 82, width / 2 + sepW / 2, 82);
    sepGfx.fillStyle(COLORS.CYAN, 0.5);
    sepGfx.fillCircle(width / 2 - sepW / 2, 82, 2);
    sepGfx.fillCircle(width / 2 + sepW / 2, 82, 2);
    sepGfx.fillCircle(width / 2, 82, 3);

    // Credits panel
    const panelW = 620;
    const panelH = 520;
    const panelX = (width - panelW) / 2;
    const panelY = 100;

    const panelBg = this.add.graphics();
    drawPanel(panelBg, panelX, panelY, panelW, panelH, {
      borderColor: COLORS.CYAN,
      borderAlpha: 0.4,
    });

    // Credit entries
    let entryY = panelY + 30;
    const labelX = panelX + 35;
    const valueX = panelX + 155;
    const maxValueWidth = panelW - 190;

    for (const credit of CREDITS) {
      // Label
      this.add.text(labelX, entryY, credit.label, {
        fontFamily: FONTS.BODY,
        fontSize: '14px',
        color: '#00ddff',
        fontStyle: 'bold',
        resolution: 2,
      });

      // Value
      const valueText = this.add.text(valueX, entryY, credit.value, {
        fontFamily: FONTS.BODY,
        fontSize: '14px',
        color: '#ccccdd',
        wordWrap: { width: maxValueWidth },
        lineSpacing: 4,
        resolution: 2,
      });

      entryY += Math.max(30, valueText.height + 14);
    }

    // Separator before disclaimer
    entryY += 10;
    const disclaimerSepGfx = this.add.graphics();
    disclaimerSepGfx.lineStyle(1, COLORS.CYAN, 0.15);
    disclaimerSepGfx.lineBetween(panelX + 30, entryY, panelX + panelW - 30, entryY);
    disclaimerSepGfx.fillStyle(COLORS.CYAN, 0.3);
    disclaimerSepGfx.fillCircle(width / 2, entryY, 2);

    // Disclaimer heading
    entryY += 16;
    this.add.text(width / 2, entryY, 'Disclaimer', {
      fontFamily: FONTS.DISPLAY,
      fontSize: '16px',
      color: '#ffcc44',
      fontStyle: 'bold',
      resolution: 2,
    }).setOrigin(0.5, 0);

    entryY += 28;

    // Disclaimer text
    this.add.text(width / 2, entryY, DISCLAIMER, {
      fontFamily: FONTS.BODY,
      fontSize: '11px',
      color: '#7788aa',
      align: 'center',
      wordWrap: { width: panelW - 60 },
      lineSpacing: 4,
      resolution: 2,
    }).setOrigin(0.5, 0);

    // Back to Menu button
    const btnY = panelY + panelH + 50;
    this.createBackButton(width / 2, btnY);

    // ESC key to go back
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ESC', () => {
        this.scene.start('MainMenuScene');
      });
    }

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

  private createBackButton(x: number, y: number): void {
    const btnW = 220;
    const btnH = 48;
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    drawButton(bg, btnW, btnH, COLORS.PRIMARY);
    container.add(bg);

    const text = this.add.text(0, 0, 'Back to Menu', {
      fontFamily: FONTS.BODY,
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 2, fill: true },
    }).setOrigin(0.5);
    container.add(text);

    const hitArea = new Phaser.Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    container.input!.cursor = 'pointer';

    container.on('pointerover', () => {
      drawButton(bg, btnW, btnH, COLORS.PRIMARY_HOVER, { glowRing: true });
      animateButtonHover(this, container, true);
    });
    container.on('pointerout', () => {
      drawButton(bg, btnW, btnH, COLORS.PRIMARY);
      animateButtonHover(this, container, false);
    });
    container.on('pointerdown', () => {
      animateButtonPress(this, container);
      this.scene.start('MainMenuScene');
    });
  }
}
