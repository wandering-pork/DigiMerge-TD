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
    this.cameras.main.setBackgroundColor('#060614');
    const gridGfx = this.add.graphics();
    drawDigitalGrid(gridGfx, width, height, 50, COLORS.CYAN, 0.02);

    const barWidth = 400;
    const barHeight = 10;
    const barX = (width - barWidth) / 2;
    const barY = height / 2;

    // Background bar (dark with subtle border)
    const barBg = this.add.graphics();
    barBg.fillStyle(COLORS.BG_DEEPEST, 1);
    barBg.fillRoundedRect(barX, barY, barWidth, barHeight, 5);
    barBg.lineStyle(1, COLORS.CYAN_DIM, 0.3);
    barBg.strokeRoundedRect(barX, barY, barWidth, barHeight, 5);

    // Fill bar (grows with progress)
    const barFill = this.add.graphics();

    // Glow effect behind bar
    const barGlow = this.add.graphics();

    // Loading text
    const loadingText = this.add.text(width / 2, barY - 40, 'Connecting to Digital World...', {
      fontFamily: FONTS.DISPLAY,
      fontSize: '18px',
      color: '#8899bb',
      shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 4, fill: true },
    }).setOrigin(0.5);

    // Pulsing dots animation on loading text
    let dotCount = 0;
    const dotTimer = this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        dotCount = (dotCount + 1) % 4;
        const dots = '.'.repeat(dotCount);
        loadingText.setText(`Connecting to Digital World${dots}`);
      },
    });

    // Percentage text
    const percentText = this.add.text(width / 2, barY + 30, '0%', {
      fontFamily: FONTS.MONO,
      fontSize: '16px',
      color: '#7788aa',
    }).setOrigin(0.5);

    // Update loading bar on progress
    this.load.on('progress', (value: number) => {
      barFill.clear();
      barFill.fillStyle(COLORS.CYAN, 0.85);
      const fillW = Math.max(4, (barWidth - 4) * value);
      barFill.fillRoundedRect(barX + 2, barY + 2, fillW, barHeight - 4, 3);

      // Bright leading edge
      if (value > 0.01 && value < 1) {
        barFill.fillStyle(COLORS.CYAN_BRIGHT, 0.6);
        barFill.fillRect(barX + 2 + fillW - 8, barY + 2, 8, barHeight - 4);
      }

      // Glow behind the progress
      barGlow.clear();
      barGlow.fillStyle(COLORS.CYAN, 0.06);
      barGlow.fillRoundedRect(barX - 4, barY - 4, fillW + 8, barHeight + 8, 8);

      percentText.setText(`${Math.round(value * 100)}%`);
    });

    this.load.on('complete', () => {
      dotTimer.destroy();
      loadingText.setText('Connected!');
      loadingText.setColor('#33ee77');
      percentText.setText('100%');
      percentText.setColor('#33ee77');
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
      viximon: 'Pokomon.png',

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

      // New Tower Lines (Tier 1 Expansion)
      nyaromon: 'Nyaromon.png',
      plotmon: 'Plotmon.png',
      tailmon: 'Tailmon.png',
      ophanimon: 'Ophanimon.png',
      gummymon: 'Gummymon.png',
      terriermon: 'Terriermon.png',
      galgomon: 'Galgomon.png',
      rapidmon: 'Rapidmon.png',
      saintgalgomon: 'SaintGalgomon.png',
      chocomon: 'Chocomon.png',
      lopmon: 'Lopmon.png',
      turuiemon: 'Turuiemon.png',
      andiramon: 'Andiramon_Data.png',
      cherubimon_virtue: 'Cherubimon_Virtue.png',
      pyocomon: 'Pyocomon.png',
      mochimon: 'Mochimon.png',
      pukamon: 'Pukamon.png',
      gomamon: 'Gomamon.png',
      ikkakumon: 'Ikkakumon.png',
      plesiomon: 'Plesiomon.png',
      dorimon: 'Dorimon.png',
      dorumon: 'DORUmon.png',
      dorugamon: 'DORUgamon.png',
      doruguremon: 'DORUguremon.png',
      alphamon: 'Alphamon.png',

      // Tier 2 Expansion
      sunmon: 'Sunmon.png',
      coronamon: 'Coronamon.png',
      firamon: 'Firamon.png',
      flaremon: 'Flaremon.png',
      apollomon: 'Apollomon.png',
      moonmon: 'Moonmon.png',
      lunamon: 'Lunamon.png',
      lekismon: 'Lekismon.png',
      crescemon: 'Crescemon.png',
      dianamon: 'Dianamon.png',
      kyokyomon: 'Kyokyomon.png',
      ryudamon: 'Ryudamon.png',
      ginryumon: 'Ginryumon.png',
      hisyaryumon: 'Hisyaryumon.png',
      ouryumon: 'Ouryumon.png',
      puroromon: 'Puroromon.png',
      funbeemon: 'Funbeemon.png',
      waspmon: 'Waspmon.png',
      cannonbeemon: 'Cannonbeemon.png',
      tigervespamon: 'TigerVespamon.png',
      budmon: 'Budmon.png',
      lalamon: 'Lalamon.png',
      lilamon: 'Lilamon.png',
      lotusmon: 'Lotusmon.png',
      caprimon: 'Caprimon.png',
      hackmon: 'Hackmon.png',
      reppamon: 'Reppamon.png',
      saviorhackmon: 'SaviorHackmon.png',
      jesmon: 'Jesmon.png',

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
      guardromon: 'Guardromon.png',
      andromon: 'Andromon.png',
      mamemon: 'Mamemon.png',
      metalmamemon: 'MetalMamemon.png',
      diaboromon: 'Diablomon.png',
      // Phase 2 Champion enemies
      leomon: 'Leomon.png',
      seadramon: 'Seadramon.png',
      birdramon: 'Birdramon.png',
      meramon: 'Meramon.png',
      kuwagamon: 'Kuwagamon.png',
      numemon: 'Numemon.png',
      monochromon: 'Monochromon.png',
      airdramon: 'Airdramon.png',
      darktyrannomon: 'DarkTyrannomon.png',
      kabuterimon: 'Kabuterimon.png',
      // Phase 3 Ultimate enemies
      megaseadramon: 'MegaSeadramon.png',
      zudomon: 'Zudomon.png',
      gigadramon: 'Gigadramon.png',
      warumonzaemon: 'WaruMonzaemon.png',
      ladydevimon: 'LadyDevimon.png',
      bluemeramon: 'BlueMeramon.png',
      megakabuterimon: 'AtlurKabuterimon_Blue.png',
      garudamon: 'Garudamon.png',
      megadramon: 'Megadramon.png',
      angewomon: 'Angewomon.png',
      // Phase 4 Mega enemies
      piedmon: 'Piemon.png',
      machinedramon: 'Mugendramon.png',
      daemon: 'Daemon.png',
      blackwargreymon: 'BlackWarGreymon.png',
      leviamon: 'Leviamon.png',
      boltmon: 'Boltmon.png',
      cherubimon: 'Cherubimon_Vice.png',
      saberleomon: 'SaberLeomon.png',
      puppetmon: 'Pinochimon.png',
      phoenixmon: 'Hououmon.png',
      herculeskabuterimon: 'HerakleKabuterimon.png',
      metalseadramon: 'MetalSeadramon.png',
      // Phase 5 Ultra enemies
      omegamon: 'Omegamon.png',
      omegamon_zwart: 'Omegamon_Zwart.png',
      imperialdramon_dm: 'Imperialdramon.png',
      armageddemon: 'Armagemon.png',
      millenniummon: 'Millenniumon.png',
      apocalymon: 'Apocalymon.png',
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
