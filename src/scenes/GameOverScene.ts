import Phaser from 'phaser';
import { GameStatistics } from '@/types';
import { COLORS, TEXT_STYLES, FONTS, ANIM } from '@/ui/UITheme';
import { drawDigitalGrid, drawPanel, drawButton, drawSeparator, LayoutStack, createDigitalParticles, animateButtonHover, animateButtonPress, animateStaggeredEntrance } from '@/ui/UIHelpers';
import { HighScoreManager, calculateScore, HighScoreEntry, getLastPlayerName, setLastPlayerName } from '@/managers/HighScoreManager';

export class GameOverScene extends Phaser.Scene {
  private gameData: {
    wave: number;
    won: boolean;
    lives?: number;
    statistics?: GameStatistics;
    mvpTower?: { name: string; kills: number; damage: number };
  } = { wave: 1, won: false };

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { wave: number; won: boolean; lives?: number; statistics?: GameStatistics; mvpTower?: { name: string; kills: number; damage: number } }) {
    this.gameData = data || { wave: 1, won: false };
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.cameras.main.setBackgroundColor('#0f0a14');

    // Determine if victory or defeat
    const isVictory: boolean = this.gameData.won;
    const waveReached: number = this.gameData.wave || 1;

    // Calculate score (save deferred until player enters name)
    const gameStats = this.gameData.statistics;
    const livesRemaining = this.gameData.lives ?? (isVictory ? 20 : 0);
    const score = calculateScore(waveReached, gameStats?.enemiesKilled ?? 0, livesRemaining);

    // Digital grid with tinted color
    const gridGfx = this.add.graphics();
    const gridColor = isVictory ? COLORS.VACCINE : COLORS.DANGER;
    drawDigitalGrid(gridGfx, width, height, 50, gridColor, 0.02);

    // Themed particles
    createDigitalParticles(this, width, height, 20, isVictory ? COLORS.GOLD : COLORS.DANGER);

    // Central result panel with glass effect
    const hasStats = !!this.gameData.statistics;
    const hasMvp = !!this.gameData.mvpTower;
    const panelW = 420;
    const panelH = hasStats ? (hasMvp ? 620 : 570) : 450;
    const panelX = (width - panelW) / 2;
    const panelY = (height - panelH) / 2 - 10;
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

    // Statistics section
    const stack = new LayoutStack(panelY + 240);
    const stats = this.gameData.statistics;
    if (stats) {
      const statsBaseY = stack.y;
      const leftX = panelX + 40;
      const rightX = panelX + panelW / 2 + 20;
      const valueOffsetX = 150;
      const lineH = 22;

      // Separator before stats
      const statsSepGfx = this.add.graphics();
      drawSeparator(statsSepGfx, panelX + 30, statsBaseY - 10, panelX + panelW - 30, isVictory ? COLORS.GOLD : COLORS.DANGER);

      // Format playtime
      const playtime = stats.playtimeSeconds || 0;
      const minutes = Math.floor(playtime / 60);
      const seconds = playtime % 60;
      const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

      const statEntries = [
        { label: 'Enemies Killed', value: `${stats.enemiesKilled}`, x: leftX, color: '#ff6666' },
        { label: 'Towers Placed', value: `${stats.towersPlaced}`, x: leftX, color: '#44ccff' },
        { label: 'Merges', value: `${stats.mergesPerformed}`, x: leftX, color: '#00ddff' },
        { label: 'Digivolutions', value: `${stats.digivolutionsPerformed}`, x: rightX, color: '#ffaa44' },
        { label: 'DB Earned', value: `${stats.totalDigibytesEarned}`, x: rightX, color: '#ffdd44' },
        { label: 'Playtime', value: timeStr, x: rightX, color: '#aabbcc' },
      ];

      // Arrange in two columns, 3 rows each
      statEntries.forEach((entry, i) => {
        const row = i % 3;
        const y = statsBaseY + row * lineH;

        const label = this.add.text(entry.x, y, entry.label, {
          fontFamily: FONTS.MONO,
          fontSize: '12px',
          color: '#7788aa',
          resolution: 2,
        }).setAlpha(0);

        const value = this.add.text(entry.x + valueOffsetX, y, entry.value, {
          fontFamily: FONTS.MONO,
          fontSize: '12px',
          color: entry.color,
          fontStyle: 'bold',
          resolution: 2,
        }).setOrigin(1, 0).setAlpha(0);

        // Staggered fade-in
        this.tweens.add({
          targets: [label, value],
          alpha: 1,
          duration: 300,
          delay: 700 + i * 80,
        });
      });

      stack.y = statsBaseY + 3 * lineH + 5;

      // MVP Tower section
      const mvp = this.gameData.mvpTower;
      const hasMvpData = !!mvp;
      if (hasMvpData) {
        stack.gap(5);
        const mvpSepY = stack.y;

        // Separator
        const mvpSepGfx = this.add.graphics();
        drawSeparator(mvpSepGfx, panelX + 30, mvpSepY, panelX + panelW - 30, isVictory ? COLORS.GOLD : COLORS.DANGER);

        stack.gap(10);
        const mvpTitle = this.add.text(width / 2, stack.y, 'MVP Tower', {
          fontFamily: FONTS.MONO,
          fontSize: '11px',
          color: '#ffdd44',
          resolution: 2,
        }).setOrigin(0.5, 0).setAlpha(0);
        stack.gap(16);

        const mvpInfo = this.add.text(width / 2, stack.y, `${mvp!.name}  -  ${mvp!.kills} kills, ${mvp!.damage} dmg`, {
          fontFamily: FONTS.MONO,
          fontSize: '13px',
          color: '#ffffff',
          fontStyle: 'bold',
          resolution: 2,
        }).setOrigin(0.5, 0).setAlpha(0);
        stack.gap(22);

        this.tweens.add({
          targets: [mvpTitle, mvpInfo],
          alpha: 1,
          duration: 400,
          delay: 1200,
        });
      }
    }

    // --- Name Input & Save Section ---
    stack.gap(15);
    const nameInputY = stack.y;

    // "Enter your name:" label
    const nameLabel = this.add.text(width / 2, nameInputY, 'Enter your name:', {
      fontFamily: FONTS.MONO,
      fontSize: '13px',
      color: '#8899bb',
      resolution: 2,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: nameLabel,
      alpha: 1,
      duration: 300,
      delay: 900,
    });

    // HTML input element
    const inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.maxLength = 16;
    inputEl.className = 'digimerge-name-input';
    inputEl.value = getLastPlayerName();
    inputEl.placeholder = 'Player';

    const domInput = this.add.dom(width / 2, nameInputY + 30, inputEl).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: domInput,
      alpha: 1,
      duration: 300,
      delay: 950,
    });

    // Save Score button
    const saveBtn = this.createMenuButton(
      width / 2, nameInputY + 70, 160, 38,
      'Save Score',
      COLORS.GOLD_DIM, COLORS.SUCCESS_HOVER,
      () => {
        const playerName = (inputEl.value || '').trim() || 'Player';
        setLastPlayerName(playerName);

        const hsEntry: HighScoreEntry = {
          wave: waveReached,
          score,
          enemiesKilled: gameStats?.enemiesKilled ?? 0,
          livesRemaining,
          playtimeSeconds: gameStats?.playtimeSeconds ?? 0,
          date: new Date().toISOString(),
          won: isVictory,
          playerName,
        };
        const rank = HighScoreManager.addScore(hsEntry);

        // Replace input section with saved confirmation
        nameLabel.setText(`Saved! Rank #${rank}`);
        nameLabel.setColor('#ffdd44');
        domInput.destroy();
        saveBtn.destroy();
      },
    );
    saveBtn.setAlpha(0);
    saveBtn.y += 10;
    this.tweens.add({
      targets: saveBtn,
      alpha: 1,
      y: saveBtn.y - 10,
      duration: 300,
      delay: 1000,
    });

    stack.y = nameInputY + 110;

    // Action buttons with staggered entrance
    stack.gap(20);
    const btnStartY = stack.y;
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
