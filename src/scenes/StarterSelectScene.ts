import Phaser from 'phaser';

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
  private startBtn!: Phaser.GameObjects.Text;
  private selectionCountText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'StarterSelectScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    this.selected.clear();
    this.starterContainers.clear();

    // Background
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Title
    this.add.text(width / 2, 40, 'Choose Your Starters', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Instruction
    this.selectionCountText = this.add.text(width / 2, 80, 'Select 4 Digimon (0 / 4)', {
      fontSize: '18px',
      color: '#aaaacc',
    }).setOrigin(0.5);

    // Starter grid: 4 columns x 2 rows
    const cols = 4;
    const cellWidth = 160;
    const cellHeight = 180;
    const gridStartX = (width - cols * cellWidth) / 2 + cellWidth / 2;
    const gridStartY = 160;

    this.starters.forEach((starter, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = gridStartX + col * cellWidth;
      const y = gridStartY + row * cellHeight;

      this.createStarterCard(x, y, starter);
    });

    // Start Game button (disabled initially)
    this.startBtn = this.add.text(width / 2, height - 60, 'Start Game', {
      fontSize: '28px',
      color: '#666666',
      backgroundColor: '#222233',
      padding: { x: 30, y: 12 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        if (this.selected.size === 4) {
          this.startBtn.setStyle({ backgroundColor: '#4444aa' });
        }
      })
      .on('pointerout', () => {
        if (this.selected.size === 4) {
          this.startBtn.setStyle({ backgroundColor: '#333366' });
        } else {
          this.startBtn.setStyle({ backgroundColor: '#222233' });
        }
      })
      .on('pointerdown', () => {
        if (this.selected.size === 4) {
          this.registry.set('selectedStarters', Array.from(this.selected));
          this.scene.start('GameScene');
        }
      });

    // Back button
    const backBtn = this.add.text(80, height - 60, 'Back', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#333366',
      padding: { x: 20, y: 10 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => backBtn.setStyle({ backgroundColor: '#4444aa' }))
      .on('pointerout', () => backBtn.setStyle({ backgroundColor: '#333366' }))
      .on('pointerdown', () => {
        this.scene.start('MainMenuScene');
      });
  }

  private createStarterCard(x: number, y: number, starter: StarterInfo): void {
    const container = this.add.container(x, y);

    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(0x222244, 1);
    bg.fillRoundedRect(-60, -70, 120, 140, 8);
    container.add(bg);

    // Highlight border (hidden initially)
    const highlight = this.add.graphics();
    highlight.lineStyle(3, 0x55ff55, 1);
    highlight.strokeRoundedRect(-60, -70, 120, 140, 8);
    highlight.setVisible(false);
    container.add(highlight);

    // Sprite
    const sprite = this.add.image(0, -20, starter.key);
    sprite.setScale(3);
    container.add(sprite);

    // Name label
    const nameText = this.add.text(0, 45, starter.name, {
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);
    container.add(nameText);

    // Make the container interactive
    const hitArea = new Phaser.Geom.Rectangle(-60, -70, 120, 140);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    container.input!.cursor = 'pointer';

    container.on('pointerdown', () => {
      this.toggleSelection(starter.key, highlight, bg);
    });

    container.on('pointerover', () => {
      if (!this.selected.has(starter.key)) {
        bg.clear();
        bg.fillStyle(0x333366, 1);
        bg.fillRoundedRect(-60, -70, 120, 140, 8);
      }
    });

    container.on('pointerout', () => {
      if (!this.selected.has(starter.key)) {
        bg.clear();
        bg.fillStyle(0x222244, 1);
        bg.fillRoundedRect(-60, -70, 120, 140, 8);
      }
    });

    this.starterContainers.set(starter.key, container);
  }

  private toggleSelection(key: string, highlight: Phaser.GameObjects.Graphics, bg: Phaser.GameObjects.Graphics): void {
    if (this.selected.has(key)) {
      // Deselect
      this.selected.delete(key);
      highlight.setVisible(false);
      bg.clear();
      bg.fillStyle(0x222244, 1);
      bg.fillRoundedRect(-60, -70, 120, 140, 8);
    } else {
      // Only allow selecting up to 4
      if (this.selected.size >= 4) {
        return;
      }
      this.selected.add(key);
      highlight.setVisible(true);
      bg.clear();
      bg.fillStyle(0x2a2a55, 1);
      bg.fillRoundedRect(-60, -70, 120, 140, 8);
    }

    this.updateStartButton();
  }

  private updateStartButton(): void {
    const count = this.selected.size;
    this.selectionCountText.setText(`Select 4 Digimon (${count} / 4)`);

    if (count === 4) {
      this.startBtn.setStyle({
        color: '#ffffff',
        backgroundColor: '#333366',
      });
    } else {
      this.startBtn.setStyle({
        color: '#666666',
        backgroundColor: '#222233',
      });
    }
  }
}
