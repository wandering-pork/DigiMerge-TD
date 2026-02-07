import Phaser from 'phaser';
import { HighScoreManager } from '@/managers/HighScoreManager';
import { COLORS, TEXT_STYLES, FONTS, ANIM } from '@/ui/UITheme';
import { drawDigitalGrid, drawPanel, drawButton, drawSeparator, createDigitalParticles, animateButtonHover, animateButtonPress } from '@/ui/UIHelpers';

export class HighScoresScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HighScoresScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor('#0f0a14');

    // Background
    const gridGfx = this.add.graphics();
    drawDigitalGrid(gridGfx, width, height, 50, COLORS.GOLD, 0.015);
    createDigitalParticles(this, width, height, 15, COLORS.GOLD);

    // Title
    this.add.text(width / 2, 50, 'High Scores', {
      ...TEXT_STYLES.SCENE_TITLE,
      fontSize: '36px',
    }).setOrigin(0.5);

    // Panel
    const panelW = 600;
    const panelH = 520;
    const panelX = (width - panelW) / 2;
    const panelY = 90;
    const panelBg = this.add.graphics();
    drawPanel(panelBg, panelX, panelY, panelW, panelH, {
      borderColor: COLORS.GOLD_DIM,
      borderAlpha: 0.4,
    });

    // Column headers
    const headerY = panelY + 15;
    const cols = {
      rank: panelX + 20,
      wave: panelX + 55,
      score: panelX + 130,
      kills: panelX + 230,
      time: panelX + 330,
      date: panelX + 430,
      result: panelX + panelW - 30,
    };

    const headers = [
      { text: '#', x: cols.rank },
      { text: 'Wave', x: cols.wave },
      { text: 'Score', x: cols.score },
      { text: 'Kills', x: cols.kills },
      { text: 'Time', x: cols.time },
      { text: 'Date', x: cols.date },
    ];

    headers.forEach(h => {
      this.add.text(h.x, headerY, h.text, {
        fontFamily: FONTS.MONO,
        fontSize: '12px',
        color: '#7788aa',
        fontStyle: 'bold',
        resolution: 2,
      });
    });

    // Separator
    const sepGfx = this.add.graphics();
    drawSeparator(sepGfx, panelX + 10, headerY + 20, panelX + panelW - 10, COLORS.GOLD_DIM);

    // Score entries
    const scores = HighScoreManager.getHighScores();
    const startY = headerY + 30;
    const rowH = 42;

    if (scores.length === 0) {
      this.add.text(width / 2, startY + 80, 'No scores yet!\nPlay a game to see your scores here.', {
        fontFamily: FONTS.BODY,
        fontSize: '16px',
        color: '#667799',
        align: 'center',
        resolution: 2,
      }).setOrigin(0.5, 0);
    } else {
      scores.forEach((entry, i) => {
        const y = startY + i * rowH;
        const isTop3 = i < 3;
        const rankColor = i === 0 ? '#ffdd44' : i === 1 ? '#cccccc' : i === 2 ? '#cc8844' : '#667799';

        // Rank number
        this.add.text(cols.rank, y, `${i + 1}`, {
          fontFamily: FONTS.MONO,
          fontSize: '14px',
          color: rankColor,
          fontStyle: isTop3 ? 'bold' : 'normal',
          resolution: 2,
        });

        // Wave
        this.add.text(cols.wave, y, `${entry.wave}`, {
          fontFamily: FONTS.MONO,
          fontSize: '13px',
          color: '#ffffff',
          fontStyle: isTop3 ? 'bold' : 'normal',
          resolution: 2,
        });

        // Score
        this.add.text(cols.score, y, `${entry.score}`, {
          fontFamily: FONTS.MONO,
          fontSize: '13px',
          color: rankColor,
          fontStyle: 'bold',
          resolution: 2,
        });

        // Kills
        this.add.text(cols.kills, y, `${entry.enemiesKilled}`, {
          fontFamily: FONTS.MONO,
          fontSize: '13px',
          color: '#ff6666',
          resolution: 2,
        });

        // Playtime
        const mins = Math.floor(entry.playtimeSeconds / 60);
        const secs = entry.playtimeSeconds % 60;
        const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
        this.add.text(cols.time, y, timeStr, {
          fontFamily: FONTS.MONO,
          fontSize: '13px',
          color: '#aabbcc',
          resolution: 2,
        });

        // Date
        const dateStr = entry.date ? new Date(entry.date).toLocaleDateString() : '--';
        this.add.text(cols.date, y, dateStr, {
          fontFamily: FONTS.MONO,
          fontSize: '11px',
          color: '#667799',
          resolution: 2,
        });

        // Victory/Defeat indicator
        const resultText = entry.won ? 'W' : 'L';
        const resultColor = entry.won ? '#44ff44' : '#ff4444';
        this.add.text(cols.result, y, resultText, {
          fontFamily: FONTS.MONO,
          fontSize: '13px',
          color: resultColor,
          fontStyle: 'bold',
          resolution: 2,
        }).setOrigin(1, 0);

        // Row separator (subtle)
        if (i < scores.length - 1) {
          const rowSep = this.add.graphics();
          rowSep.lineStyle(1, COLORS.GOLD_DIM, 0.1);
          rowSep.lineBetween(panelX + 15, y + rowH - 6, panelX + panelW - 15, y + rowH - 6);
        }
      });
    }

    // Back button
    this.createMenuButton(
      width / 2, height - 50, 200, 44,
      'Back to Menu',
      COLORS.BG_PANEL_LIGHT, COLORS.BG_HOVER,
      () => this.scene.start('MainMenuScene'),
    );

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
