import Phaser from 'phaser';
import { SaveManager } from '@/managers/SaveManager';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Title text
    this.add.text(width / 2, height / 3, 'DigiMerge TD', {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height / 3 + 60, 'A Digimon Tower Defense Merge Game', {
      fontSize: '18px',
      color: '#aaaacc',
    }).setOrigin(0.5);

    let btnY = height / 2 + 20;

    // Continue button (only shown if save exists)
    if (SaveManager.hasSave()) {
      const save = SaveManager.load();
      if (save) {
        const continueBtn = this.add.text(width / 2, btnY, `Continue (Wave ${save.gameState.currentWave})`, {
          fontSize: '28px',
          color: '#ffffff',
          backgroundColor: '#336633',
          padding: { x: 30, y: 12 },
        })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .on('pointerover', () => continueBtn.setStyle({ backgroundColor: '#44aa44' }))
          .on('pointerout', () => continueBtn.setStyle({ backgroundColor: '#336633' }))
          .on('pointerdown', () => {
            // Set flag so GameScene knows to load the save
            this.registry.set('loadSave', true);
            // Use the saved starters if available (fallback to defaults)
            this.scene.start('GameScene');
          });

        btnY += 65;
      }
    }

    // New Game button
    const playBtn = this.add.text(width / 2, btnY, 'New Game', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#333366',
      padding: { x: 40, y: 14 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => playBtn.setStyle({ backgroundColor: '#4444aa' }))
      .on('pointerout', () => playBtn.setStyle({ backgroundColor: '#333366' }))
      .on('pointerdown', () => {
        // Clear any save flag
        this.registry.remove('loadSave');
        this.scene.start('StarterSelectScene');
      });

    // Version text
    this.add.text(width / 2, height - 30, 'v0.1.0 - MVP', {
      fontSize: '14px',
      color: '#666688',
    }).setOrigin(0.5);
  }
}
