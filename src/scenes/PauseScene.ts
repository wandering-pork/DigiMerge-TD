import Phaser from 'phaser';
import { COLORS, TEXT_STYLES } from '@/ui/UITheme';

/**
 * Simple pause overlay. Shows "PAUSED" text and resumes on click or ESC.
 */
export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Semi-transparent dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(COLORS.OVERLAY_BLACK, 0.6);
    overlay.fillRect(0, 0, width, height);

    // Glow behind text
    this.add.text(width / 2, height / 2, 'PAUSED', {
      ...TEXT_STYLES.SCENE_TITLE,
      fontSize: '56px',
    }).setOrigin(0.5).setAlpha(0.3);

    // PAUSED text
    this.add.text(width / 2, height / 2, 'PAUSED', {
      ...TEXT_STYLES.SCENE_TITLE,
      fontSize: '56px',
    }).setOrigin(0.5);

    // Hint
    this.add.text(width / 2, height / 2 + 50, 'Click or press ESC to resume', {
      ...TEXT_STYLES.SCENE_SUBTITLE,
      fontSize: '16px',
    }).setOrigin(0.5);

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
