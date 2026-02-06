import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Determine if victory or defeat based on data passed from GameScene
    const isVictory: boolean = this.registry.get('gameResult') === 'victory';
    const waveReached: number = this.registry.get('waveReached') || 1;

    // Title
    const titleText = isVictory ? 'Victory!' : 'Game Over';
    const titleColor = isVictory ? '#55ff55' : '#ff5555';

    this.add.text(width / 2, height / 3 - 30, titleText, {
      fontSize: '56px',
      color: titleColor,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Wave reached
    this.add.text(width / 2, height / 3 + 40, `Wave Reached: ${waveReached}`, {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Subtitle message
    const subtitle = isVictory
      ? 'You defended the Digital World!'
      : 'The Digital World has fallen...';

    this.add.text(width / 2, height / 3 + 80, subtitle, {
      fontSize: '18px',
      color: '#aaaacc',
    }).setOrigin(0.5);

    // Play Again button
    const playAgainBtn = this.add.text(width / 2, height / 2 + 60, 'Play Again', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#333366',
      padding: { x: 20, y: 10 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => playAgainBtn.setStyle({ backgroundColor: '#4444aa' }))
      .on('pointerout', () => playAgainBtn.setStyle({ backgroundColor: '#333366' }))
      .on('pointerdown', () => {
        this.scene.start('StarterSelectScene');
      });

    // Main Menu button
    const menuBtn = this.add.text(width / 2, height / 2 + 130, 'Main Menu', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#333366',
      padding: { x: 20, y: 10 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => menuBtn.setStyle({ backgroundColor: '#4444aa' }))
      .on('pointerout', () => menuBtn.setStyle({ backgroundColor: '#333366' }))
      .on('pointerdown', () => {
        this.scene.start('MainMenuScene');
      });
  }
}
