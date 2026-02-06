import Phaser from 'phaser';
import { COLORS, TEXT_STYLES, FONTS } from '@/ui/UITheme';

/**
 * Simple pause overlay. Shows "PAUSED" text and resumes on click or ESC.
 * Enhanced with glass-panel effect and subtle animation.
 */
export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Semi-transparent dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(COLORS.OVERLAY_BLACK, 0.65);
    overlay.fillRect(0, 0, width, height);

    // Glass panel behind text for visual anchoring
    const panelW = 340;
    const panelH = 160;
    const panelX = (width - panelW) / 2;
    const panelY = (height - panelH) / 2;
    const panel = this.add.graphics();
    panel.fillStyle(COLORS.BG_PANEL, 0.6);
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 16);
    panel.lineStyle(1, COLORS.CYAN, 0.3);
    panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 16);
    // Subtle top highlight
    panel.fillStyle(0xffffff, 0.02);
    panel.fillRoundedRect(panelX + 2, panelY + 2, panelW - 4, panelH / 3, { tl: 14, tr: 14, bl: 0, br: 0 });

    // Entrance scale animation for the panel
    panel.setScale(0.8);
    panel.setAlpha(0);
    this.tweens.add({
      targets: panel,
      scaleX: 1, scaleY: 1, alpha: 1,
      duration: 250,
      ease: 'Back.easeOut',
    });

    // PAUSED text with glow
    const pauseGlow = this.add.text(width / 2, height / 2 - 15, 'PAUSED', {
      ...TEXT_STYLES.SCENE_TITLE,
      fontSize: '52px',
    }).setOrigin(0.5).setAlpha(0);

    const pauseText = this.add.text(width / 2, height / 2 - 15, 'PAUSED', {
      ...TEXT_STYLES.SCENE_TITLE,
      fontSize: '52px',
    }).setOrigin(0.5).setAlpha(0);

    // Entrance fade for text
    this.tweens.add({
      targets: [pauseText],
      alpha: 1,
      duration: 300,
      delay: 100,
    });
    this.tweens.add({
      targets: [pauseGlow],
      alpha: 0.2,
      duration: 300,
      delay: 100,
    });

    // Glow pulse
    this.tweens.add({
      targets: pauseGlow,
      alpha: { from: 0.15, to: 0.3 },
      scaleX: { from: 1, to: 1.04 },
      scaleY: { from: 1, to: 1.04 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 400,
    });

    // Hint
    const hint = this.add.text(width / 2, height / 2 + 40, 'Click or press ESC to resume', {
      fontFamily: FONTS.BODY,
      fontSize: '14px',
      color: '#6677aa',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: hint,
      alpha: 1,
      duration: 300,
      delay: 200,
    });

    // Click anywhere to resume
    this.input.on('pointerdown', () => {
      this.scene.resume('GameScene');
      this.scene.stop();
    });

    // ESC to resume
    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.resume('GameScene');
      this.scene.stop();
    });
  }
}
