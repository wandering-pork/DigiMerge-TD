import Phaser from 'phaser';
import { COLORS, TEXT_STYLES, FONTS, ANIM } from '@/ui/UITheme';
import { drawDigitalGrid, drawPanel, drawButton, createDigitalParticles, animateButtonHover, animateButtonPress } from '@/ui/UIHelpers';
import { DIGIMON_DATABASE } from '@/data/DigimonDatabase';
// DIGIMON_DATABASE import is used for attribute color indicators on cards

interface StarterInfo {
  key: string;
  name: string;
}

export class StarterSelectScene extends Phaser.Scene {
  private starters: StarterInfo[] = [
    { key: 'koromon', name: 'Koromon' },
    { key: 'tsunomon', name: 'Tsunomon' },
    { key: 'tokomon', name: 'Tokomon' },
    { key: 'gigimon', name: 'Gigimon' },
    { key: 'tanemon', name: 'Tanemon' },
    { key: 'demiveemon', name: 'DemiVeemon' },
    { key: 'pagumon', name: 'Pagumon' },
    { key: 'viximon', name: 'Viximon' },
    { key: 'nyaromon', name: 'Nyaromon' },
    { key: 'gummymon', name: 'Gummymon' },
    { key: 'chocomon', name: 'Chocomon' },
    { key: 'pyocomon', name: 'Pyocomon' },
    { key: 'mochimon', name: 'Mochimon' },
    { key: 'pukamon', name: 'Pukamon' },
    { key: 'dorimon', name: 'Dorimon' },
    { key: 'sunmon', name: 'Sunmon' },
    { key: 'moonmon', name: 'Moonmon' },
    { key: 'kyokyomon', name: 'Kyokyomon' },
    { key: 'puroromon', name: 'Puroromon' },
    { key: 'budmon', name: 'Budmon' },
    { key: 'caprimon', name: 'Caprimon' },
  ];

  private selected: Set<string> = new Set();
  private starterContainers: Map<string, Phaser.GameObjects.Container> = new Map();
  private cardHighlights: Map<string, Phaser.GameObjects.Graphics> = new Map();
  private cardBgs: Map<string, Phaser.GameObjects.Graphics> = new Map();
  private startBtn!: Phaser.GameObjects.Container;
  private startBtnBg!: Phaser.GameObjects.Graphics;
  private startBtnText!: Phaser.GameObjects.Text;
  private selectionCountText!: Phaser.GameObjects.Text;
  private selectionDots: Phaser.GameObjects.Graphics[] = [];

  constructor() {
    super({ key: 'StarterSelectScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    this.selected.clear();
    this.starterContainers.clear();
    this.cardHighlights.clear();
    this.cardBgs.clear();
    this.selectionDots = [];

    // Background
    this.cameras.main.setBackgroundColor('#060614');
    const gridGfx = this.add.graphics();
    drawDigitalGrid(gridGfx, width, height, 50, COLORS.CYAN, 0.02);

    // Floating particles
    createDigitalParticles(this, width, height, 15, COLORS.CYAN);

    // Title
    this.add.text(width / 2, 35, 'Choose Your Starter', {
      ...TEXT_STYLES.SCENE_TITLE,
      fontSize: '40px',
    }).setOrigin(0.5);

    // Selection count with visual indicator
    this.selectionCountText = this.add.text(width / 2, 80, 'Choose Your Starter Digimon', {
      ...TEXT_STYLES.SCENE_SUBTITLE,
      fontSize: '15px',
    }).setOrigin(0.5);

    // Selection indicator dot (single)
    for (let i = 0; i < 1; i++) {
      const dot = this.add.graphics();
      const dx = width / 2;
      dot.lineStyle(1.5, COLORS.CYAN_DIM, 0.5);
      dot.strokeCircle(dx, 100, 6);
      this.selectionDots.push(dot);
    }

    // Starter grid: 7 columns x 3 rows
    const cols = 7;
    const cellWidth = 115;
    const cellHeight = 145;
    const gridStartX = (width - cols * cellWidth) / 2 + cellWidth / 2;
    const gridStartY = 135;

    this.starters.forEach((starter, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = gridStartX + col * cellWidth;
      const y = gridStartY + row * cellHeight;

      const container = this.createStarterCard(x, y, starter);

      // Staggered entrance
      const finalY = container.y;
      container.y = finalY + 30;
      container.alpha = 0;
      this.tweens.add({
        targets: container,
        y: finalY,
        alpha: 1,
        duration: 350,
        ease: 'Cubic.easeOut',
        delay: index * 30,
      });
    });

    // Start Game button (disabled initially)
    const btnW = 220;
    const btnH = 50;
    this.startBtn = this.add.container(width / 2, height - 55);
    this.startBtnBg = this.add.graphics();
    drawButton(this.startBtnBg, btnW, btnH, COLORS.DISABLED);
    this.startBtn.add(this.startBtnBg);

    this.startBtnText = this.add.text(0, 0, 'Start Game', {
      fontFamily: FONTS.BODY,
      fontSize: '20px',
      color: COLORS.DISABLED_TEXT,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.startBtn.add(this.startBtnText);

    const startHitArea = new Phaser.Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH);
    this.startBtn.setInteractive(startHitArea, Phaser.Geom.Rectangle.Contains);
    this.startBtn.input!.cursor = 'pointer';
    this.startBtn.on('pointerover', () => {
      if (this.selected.size >= 1) {
        drawButton(this.startBtnBg, btnW, btnH, COLORS.SUCCESS_HOVER, { glowRing: true });
        animateButtonHover(this, this.startBtn, true);
      }
    });
    this.startBtn.on('pointerout', () => {
      if (this.selected.size >= 1) {
        drawButton(this.startBtnBg, btnW, btnH, COLORS.SUCCESS);
      } else {
        drawButton(this.startBtnBg, btnW, btnH, COLORS.DISABLED);
      }
      animateButtonHover(this, this.startBtn, false);
    });
    this.startBtn.on('pointerdown', () => {
      if (this.selected.size >= 1) {
        animateButtonPress(this, this.startBtn);
        this.registry.set('selectedStarters', Array.from(this.selected));
        this.scene.start('GameScene');
      }
    });

    // Back button
    const backBtnW = 110;
    const backBtnH = 38;
    const backBtn = this.add.container(75, height - 55);
    const backBtnBg = this.add.graphics();
    drawButton(backBtnBg, backBtnW, backBtnH, COLORS.PRIMARY);
    backBtn.add(backBtnBg);

    const backBtnText = this.add.text(0, 0, '< Back', TEXT_STYLES.BUTTON).setOrigin(0.5);
    backBtn.add(backBtnText);

    const backHitArea = new Phaser.Geom.Rectangle(-backBtnW / 2, -backBtnH / 2, backBtnW, backBtnH);
    backBtn.setInteractive(backHitArea, Phaser.Geom.Rectangle.Contains);
    backBtn.input!.cursor = 'pointer';
    backBtn.on('pointerover', () => {
      drawButton(backBtnBg, backBtnW, backBtnH, COLORS.PRIMARY_HOVER, { glowRing: true });
      animateButtonHover(this, backBtn, true);
    });
    backBtn.on('pointerout', () => {
      drawButton(backBtnBg, backBtnW, backBtnH, COLORS.PRIMARY);
      animateButtonHover(this, backBtn, false);
    });
    backBtn.on('pointerdown', () => {
      animateButtonPress(this, backBtn);
      this.scene.start('MainMenuScene');
    });

    // Camera fade-in
    this.cameras.main.fadeIn(ANIM.FADE_IN_MS, 6, 6, 20);
  }

  private createStarterCard(x: number, y: number, starter: StarterInfo): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const cardW = 100;
    const cardH = 125;

    // Card background with attribute-colored accent
    const bg = this.add.graphics();
    this.drawCardBg(bg, cardW, cardH, false);
    container.add(bg);
    this.cardBgs.set(starter.key, bg);

    // Highlight border (hidden initially)
    const highlight = this.add.graphics();
    highlight.lineStyle(2.5, COLORS.CYAN, 0.9);
    highlight.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 10);
    // Selection glow
    highlight.fillStyle(COLORS.CYAN, 0.04);
    highlight.fillRoundedRect(-cardW / 2 - 3, -cardH / 2 - 3, cardW + 6, cardH + 6, 12);
    highlight.setVisible(false);
    container.add(highlight);
    this.cardHighlights.set(starter.key, highlight);

    // Sprite
    const sprite = this.add.image(0, -18, starter.key);
    sprite.setScale(2.5);
    container.add(sprite);

    // Name label
    const nameText = this.add.text(0, 38, starter.name, {
      fontFamily: FONTS.BODY,
      fontSize: '12px',
      color: '#ccccdd',
    }).setOrigin(0.5);
    container.add(nameText);

    // Attribute color indicator
    const stats = DIGIMON_DATABASE.towers[starter.key];
    if (stats) {
      const attrColor = [COLORS.VACCINE, COLORS.DATA, COLORS.VIRUS, COLORS.FREE][stats.attribute];
      const attrBar = this.add.graphics();
      attrBar.fillStyle(attrColor, 0.6);
      attrBar.fillRoundedRect(-20, 50, 40, 3, 1);
      container.add(attrBar);
    }

    // Make the container interactive
    const hitArea = new Phaser.Geom.Rectangle(-cardW / 2, -cardH / 2, cardW, cardH);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    container.input!.cursor = 'pointer';

    container.on('pointerdown', () => {
      this.toggleSelection(starter.key);
    });

    container.on('pointerover', () => {
      if (!this.selected.has(starter.key)) {
        this.drawCardBg(bg, cardW, cardH, false, true);
        this.tweens.killTweensOf(container);
        this.tweens.add({
          targets: container,
          scaleX: 1.04, scaleY: 1.04,
          duration: 100, ease: 'Cubic.easeOut',
        });
      }
    });

    container.on('pointerout', () => {
      if (!this.selected.has(starter.key)) {
        this.drawCardBg(bg, cardW, cardH, false);
        this.tweens.killTweensOf(container);
        this.tweens.add({
          targets: container,
          scaleX: 1, scaleY: 1,
          duration: 100, ease: 'Cubic.easeOut',
        });
      }
    });

    this.starterContainers.set(starter.key, container);
    return container;
  }

  private drawCardBg(bg: Phaser.GameObjects.Graphics, w: number, h: number, selected: boolean, hovered: boolean = false): void {
    bg.clear();
    if (selected) {
      bg.fillStyle(COLORS.CYAN_DIM, 0.3);
    } else if (hovered) {
      bg.fillStyle(COLORS.BG_HOVER, 0.9);
    } else {
      bg.fillStyle(COLORS.BG_PANEL_LIGHT, 0.85);
    }
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 10);

    // Top highlight for depth
    bg.fillStyle(0xffffff, 0.03);
    bg.fillRoundedRect(-w / 2 + 2, -h / 2 + 1, w - 4, h / 3, { tl: 8, tr: 8, bl: 0, br: 0 });

    // Subtle border
    const borderColor = selected ? COLORS.CYAN_DIM : 0x334466;
    const borderAlpha = selected ? 0.6 : 0.3;
    bg.lineStyle(1, borderColor, borderAlpha);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
  }

  private toggleSelection(key: string): void {
    const container = this.starterContainers.get(key)!;
    const highlight = this.cardHighlights.get(key)!;
    const bg = this.cardBgs.get(key)!;

    if (this.selected.has(key)) {
      // Deselect
      this.selected.delete(key);
      highlight.setVisible(false);
      this.drawCardBg(bg, 100, 125, false);
      this.tweens.killTweensOf(container);
      container.setScale(1);
    } else {
      // Deselect any previously selected starter first
      for (const prevKey of this.selected) {
        const prevContainer = this.starterContainers.get(prevKey)!;
        const prevHighlight = this.cardHighlights.get(prevKey)!;
        const prevBg = this.cardBgs.get(prevKey)!;
        prevHighlight.setVisible(false);
        this.drawCardBg(prevBg, 100, 125, false);
        this.tweens.killTweensOf(prevContainer);
        prevContainer.setScale(1);
      }
      this.selected.clear();

      // Select the new one
      this.selected.add(key);
      highlight.setVisible(true);
      this.drawCardBg(bg, 100, 125, true);

      // Selection pop animation
      this.tweens.killTweensOf(container);
      this.tweens.add({
        targets: container,
        scaleX: 1.08, scaleY: 1.08,
        duration: 150,
        ease: 'Back.easeOut',
        yoyo: true,
        onComplete: () => {
          // Gentle breathing after selection
          this.tweens.add({
            targets: container,
            scaleX: 1.04, scaleY: 1.04,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });
        },
      });
    }

    this.updateStartButton();
  }

  private updateStartButton(): void {
    const count = this.selected.size;
    if (count === 0) {
      this.selectionCountText.setText('Choose Your Starter Digimon');
    } else {
      // Show the selected starter's name
      const selectedKey = Array.from(this.selected)[0];
      const starter = this.starters.find(s => s.key === selectedKey);
      this.selectionCountText.setText(`Selected: ${starter ? starter.name : '1 Starter'}`);
    }

    // Update selection indicator dot (single)
    this.selectionDots.forEach((dot, i) => {
      const { width } = this.cameras.main;
      const dx = width / 2;
      dot.clear();
      if (i < count) {
        dot.fillStyle(COLORS.CYAN, 0.9);
        dot.fillCircle(dx, 100, 6);
        dot.lineStyle(1, COLORS.CYAN_BRIGHT, 0.5);
        dot.strokeCircle(dx, 100, 6);
      } else {
        dot.lineStyle(1.5, COLORS.CYAN_DIM, 0.3);
        dot.strokeCircle(dx, 100, 6);
      }
    });

    if (count >= 1) {
      drawButton(this.startBtnBg, 220, 50, COLORS.SUCCESS);
      this.startBtnText.setColor('#ffffff');
    } else {
      drawButton(this.startBtnBg, 220, 50, COLORS.DISABLED);
      this.startBtnText.setColor(COLORS.DISABLED_TEXT);
    }
  }
}
