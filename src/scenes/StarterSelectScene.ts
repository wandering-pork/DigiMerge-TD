import Phaser from 'phaser';
import { COLORS, TEXT_STYLES, FONTS, ANIM } from '@/ui/UITheme';
import { drawDigitalGrid, drawPanel, drawButton, animateButtonHover, animateButtonPress } from '@/ui/UIHelpers';

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
  ];

  private selected: Set<string> = new Set();
  private starterContainers: Map<string, Phaser.GameObjects.Container> = new Map();
  private startBtn!: Phaser.GameObjects.Container;
  private startBtnBg!: Phaser.GameObjects.Graphics;
  private startBtnText!: Phaser.GameObjects.Text;
  private selectionCountText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'StarterSelectScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    this.selected.clear();
    this.starterContainers.clear();

    // Background
    this.cameras.main.setBackgroundColor('#0a0a18');
    const gridGfx = this.add.graphics();
    drawDigitalGrid(gridGfx, width, height);

    // Title
    this.add.text(width / 2, 40, 'Choose Your Starters', TEXT_STYLES.SCENE_TITLE).setOrigin(0.5);

    // Instruction
    this.selectionCountText = this.add.text(width / 2, 95, 'Select up to 3 Starter Digimon', TEXT_STYLES.SCENE_SUBTITLE).setOrigin(0.5);

    // Starter grid: 4 columns x 2 rows
    const cols = 4;
    const cellWidth = 160;
    const cellHeight = 180;
    const gridStartX = (width - cols * cellWidth) / 2 + cellWidth / 2;
    const gridStartY = 210;

    this.starters.forEach((starter, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = gridStartX + col * cellWidth;
      const y = gridStartY + row * cellHeight;

      this.createStarterCard(x, y, starter);
    });

    // Start Game button (disabled initially)
    const btnW = 200;
    const btnH = 48;
    this.startBtn = this.add.container(width / 2, height - 60);
    this.startBtnBg = this.add.graphics();
    drawButton(this.startBtnBg, btnW, btnH, COLORS.DISABLED);
    this.startBtn.add(this.startBtnBg);

    this.startBtnText = this.add.text(0, 0, 'Start Game', {
      fontFamily: FONTS.DISPLAY,
      fontSize: '22px',
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
    const backBtnW = 120;
    const backBtnH = 40;
    const backBtn = this.add.container(80, height - 60);
    const backBtnBg = this.add.graphics();
    drawButton(backBtnBg, backBtnW, backBtnH, COLORS.PRIMARY);
    backBtn.add(backBtnBg);

    const backBtnText = this.add.text(0, 0, 'Back', TEXT_STYLES.BUTTON).setOrigin(0.5);
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
    this.cameras.main.fadeIn(ANIM.FADE_IN_MS, 10, 10, 24);
  }

  private createStarterCard(x: number, y: number, starter: StarterInfo): void {
    const container = this.add.container(x, y);

    // Card background — themed panel
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.BG_PANEL_LIGHT, 1);
    bg.fillRoundedRect(-60, -70, 120, 140, 8);
    container.add(bg);

    // Highlight border (hidden initially) — cyan glow
    const highlight = this.add.graphics();
    highlight.lineStyle(3, COLORS.CYAN, 1);
    highlight.strokeRoundedRect(-60, -70, 120, 140, 8);
    highlight.setVisible(false);
    container.add(highlight);

    // Sprite
    const sprite = this.add.image(0, -20, starter.key);
    sprite.setScale(3);
    container.add(sprite);

    // Name label
    const nameText = this.add.text(0, 45, starter.name, {
      fontFamily: FONTS.DISPLAY,
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);
    container.add(nameText);

    // Make the container interactive
    const hitArea = new Phaser.Geom.Rectangle(-60, -70, 120, 140);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    container.input!.cursor = 'pointer';

    container.on('pointerdown', () => {
      this.toggleSelection(starter.key, highlight, bg, container);
    });

    container.on('pointerover', () => {
      if (!this.selected.has(starter.key)) {
        bg.clear();
        bg.fillStyle(COLORS.BG_HOVER, 1);
        bg.fillRoundedRect(-60, -70, 120, 140, 8);
      }
    });

    container.on('pointerout', () => {
      if (!this.selected.has(starter.key)) {
        bg.clear();
        bg.fillStyle(COLORS.BG_PANEL_LIGHT, 1);
        bg.fillRoundedRect(-60, -70, 120, 140, 8);
      }
    });

    this.starterContainers.set(starter.key, container);
  }

  private toggleSelection(
    key: string,
    highlight: Phaser.GameObjects.Graphics,
    bg: Phaser.GameObjects.Graphics,
    container: Phaser.GameObjects.Container,
  ): void {
    if (this.selected.has(key)) {
      // Deselect
      this.selected.delete(key);
      highlight.setVisible(false);
      bg.clear();
      bg.fillStyle(COLORS.BG_PANEL_LIGHT, 1);
      bg.fillRoundedRect(-60, -70, 120, 140, 8);
      this.tweens.killTweensOf(container);
      container.setScale(1);
    } else {
      // Allow up to 3 starters
      if (this.selected.size >= 3) return;

      this.selected.add(key);
      highlight.setVisible(true);
      bg.clear();
      bg.fillStyle(COLORS.CYAN_DIM, 0.4);
      bg.fillRoundedRect(-60, -70, 120, 140, 8);

      // Selected bounce tween
      this.tweens.add({
        targets: container,
        scaleX: 1.06, scaleY: 1.06,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    this.updateStartButton();
  }

  private updateStartButton(): void {
    const count = this.selected.size;
    if (count === 0) {
      this.selectionCountText.setText('Select up to 3 Starter Digimon');
    } else {
      this.selectionCountText.setText(`Selected: ${count}/3`);
    }

    if (count >= 1) {
      drawButton(this.startBtnBg, 200, 48, COLORS.SUCCESS);
      this.startBtnText.setColor('#ffffff');
    } else {
      drawButton(this.startBtnBg, 200, 48, COLORS.DISABLED);
      this.startBtnText.setColor(COLORS.DISABLED_TEXT);
    }
  }
}
