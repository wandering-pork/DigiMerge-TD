import Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Semi-transparent dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);

    // Panel background
    const panelWidth = 300;
    const panelHeight = 280;
    const panelX = (width - panelWidth) / 2;
    const panelY = (height - panelHeight) / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 1);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 12);
    panel.lineStyle(2, 0x444488, 1);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 12);

    // PAUSED text
    this.add.text(width / 2, panelY + 50, 'PAUSED', {
      fontSize: '42px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Resume button
    const resumeBtn = this.add.text(width / 2, panelY + 130, 'Resume', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#333366',
      padding: { x: 30, y: 10 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => resumeBtn.setStyle({ backgroundColor: '#4444aa' }))
      .on('pointerout', () => resumeBtn.setStyle({ backgroundColor: '#333366' }))
      .on('pointerdown', () => {
        this.scene.resume('GameScene');
        this.scene.stop();
      });

    // Main Menu button
    const menuBtn = this.add.text(width / 2, panelY + 200, 'Main Menu', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#663333',
      padding: { x: 20, y: 10 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => menuBtn.setStyle({ backgroundColor: '#aa4444' }))
      .on('pointerout', () => menuBtn.setStyle({ backgroundColor: '#663333' }))
      .on('pointerdown', () => {
        this.scene.stop('GameScene');
        this.scene.start('MainMenuScene');
      });

    // ESC to resume
    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.resume('GameScene');
      this.scene.stop();
    });
  }
}
