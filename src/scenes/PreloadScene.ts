import Phaser from 'phaser';
import { COLORS, TEXT_STYLES, FONTS } from '@/ui/UITheme';
import { drawDigitalGrid } from '@/ui/UIHelpers';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // -- Create loading bar --
    const { width, height } = this.cameras.main;

    // Background
    this.cameras.main.setBackgroundColor('#0a0a18');
    const gridGfx = this.add.graphics();
    drawDigitalGrid(gridGfx, width, height);

    const barWidth = 400;
    const barHeight = 32;
    const barX = (width - barWidth) / 2;
    const barY = height / 2;

    // Background bar (dark)
    const barBg = this.add.graphics();
    barBg.fillStyle(COLORS.BG_PANEL, 1);
    barBg.fillRoundedRect(barX, barY, barWidth, barHeight, 6);
    barBg.lineStyle(1, COLORS.CYAN, 0.3);
    barBg.strokeRoundedRect(barX, barY, barWidth, barHeight, 6);

    // Fill bar (grows with progress)
    const barFill = this.add.graphics();

    // Loading text
    this.add.text(width / 2, barY - 40, 'Connecting to Digital World...', TEXT_STYLES.SCENE_SUBTITLE).setOrigin(0.5);

    // Percentage text
    const percentText = this.add.text(width / 2, barY + barHeight + 20, '0%', {
      fontFamily: FONTS.MONO,
      fontSize: '18px',
      color: COLORS.TEXT_LABEL,
    }).setOrigin(0.5);

    // Update loading bar on progress
    this.load.on('progress', (value: number) => {
      barFill.clear();
      barFill.fillStyle(COLORS.CYAN, 1);
      barFill.fillRoundedRect(barX + 4, barY + 4, (barWidth - 8) * value, barHeight - 8, 4);
      percentText.setText(`${Math.round(value * 100)}%`);
    });

    this.load.on('complete', () => {
      // Text already shown as subtitle, just leave it
    });

    // -- Load Digimon sprites --
    const spritePath = 'assets/sprites/Idle Frame Only';

    const sprites: Record<string, string> = {
      // In-Training
      koromon: 'Koromon.png',
      tsunomon: 'Tsunomon.png',
      tokomon: 'Tokomon.png',
      gigimon: 'Gigimon.png',
      tanemon: 'Tanemon.png',
      demiveemon: 'Chibimon.png',
      pagumon: 'Pagumon.png',
      viximon: 'Kyaromon.png',

      // Rookie
      agumon: 'Agumon.png',
      gabumon: 'Gabumon.png',
      patamon: 'Patamon.png',
      guilmon: 'Guilmon.png',
      palmon: 'Palmon.png',
      veemon: 'V-mon.png',
      demidevimon: 'PicoDevimon.png',
      renamon: 'Renamon.png',

      // Champion
      greymon: 'Greymon.png',
      garurumon: 'Garurumon.png',
      angemon: 'Angemon.png',
      growlmon: 'Growmon.png',
      togemon: 'Togemon.png',
      exveemon: 'XV-mon.png',
      devimon: 'Devimon.png',
      kyubimon: 'Kyubimon.png',

      // Ultimate
      metalgreymon: 'MetalGreymon.png',
      weregarurumon: 'WereGarurumon.png',
      magnaangemon: 'HolyAngemon.png',
      wargrowlmon: 'MegaloGrowmon.png',
      lillymon: 'Lilimon.png',
      paildramon: 'Paildramon.png',
      myotismon: 'Vamdemon.png',
      taomon: 'Taomon.png',

      // Mega
      wargreymon: 'WarGreymon.png',
      metalgarurumon: 'MetalGarurumon.png',
      seraphimon: 'Seraphimon.png',
      gallantmon: 'Dukemon.png',
      rosemon: 'Rosemon.png',
      imperialdramon_fm: 'Imperialdramon_Fighter.png',
      venommyotismon: 'VenomVamdemon.png',
      sakuyamon: 'Sakuyamon.png',

      // Alternate Evolution sprites
      tyrannomon: 'Tyrannomon.png',
      skullgreymon: 'SkullGreymon.png',
      blackgarurumon: 'Garurumon_Black.png',
      unimon: 'Unimon.png',
      shakkoumon: 'Shakkoumon.png',
      megidramon: 'Megidramon.png',
      chaosgallantmon: 'ChaosDukemon.png',
      woodmon: 'Woodmon.png',
      sunflowmon: 'Sunflowmon.png',
      flamedramon: 'Fladramon.png',
      icedevimon: 'IceDevimon.png',
      bakemon: 'Bakemon.png',
      neodevimon: 'NeoDevimon.png',
      beelzemon: 'Beelzebumon.png',

      // Enemy-only sprites
      goblimon: 'Goblimon.png',
      gazimon: 'Gazimon.png',
      impmon: 'Impmon.png',
      elecmon: 'Elecmon.png',
      gotsumon: 'Gotsumon.png',
      kunemon: 'Kunemon.png',
      biyomon: 'Piyomon.png',
      tentomon: 'Tentomon.png',
      betamon: 'Betamon.png',
      floramon: 'Floramon.png',
      ogremon: 'Ogremon.png',
    };

    for (const [key, filename] of Object.entries(sprites)) {
      this.load.image(key, `${spritePath}/${filename}`);
    }

    // -- Load SFX --
    const sfxNames = [
      'attack_hit',
      'attack_miss',
      'boss_spawn',
      'button_click',
      'button_hover',
      'enemy_death',
      'enemy_escape',
      'game_over',
      'insufficient_funds',
      'merge_success',
      'tower_evolve',
      'tower_level_up',
      'tower_sell',
      'tower_spawn',
      'victory',
      'wave_complete',
      'wave_start',
    ];

    for (const name of sfxNames) {
      this.load.audio(name, `assets/sfx/${name}.wav`);
    }

    // -- Load Tileset sprites --
    this.load.spritesheet('tiles_grass', 'assets/tiles/grass.png', {
      frameWidth: 16, frameHeight: 16,
    });
    this.load.spritesheet('tiles_dirt', 'assets/tiles/dirt.png', {
      frameWidth: 16, frameHeight: 16,
    });
    this.load.spritesheet('tiles_water', 'assets/tiles/water.png', {
      frameWidth: 16, frameHeight: 16,
    });
    this.load.spritesheet('tiles_decor', 'assets/tiles/decorations.png', {
      frameWidth: 16, frameHeight: 16,
    });
  }

  create() {
    this.scene.start('MainMenuScene');
  }
}
