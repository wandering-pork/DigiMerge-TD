import Phaser from 'phaser';
import { DIGIMON_DATABASE } from '@/data/DigimonDatabase';
import { EVOLUTION_PATHS } from '@/data/EvolutionPaths';
import { DigimonStats, EnemyStats, Stage, Attribute, STAGE_NAMES, ATTRIBUTE_NAMES } from '@/types';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config/Constants';
import { COLORS, TEXT_STYLES, FONTS, ANIM } from '@/ui/UITheme';
import { drawPanel, drawButton, drawDigitalGrid, drawSeparator, animateButtonHover, animateButtonPress, animateModalIn, animateModalOut, createDigitalParticles } from '@/ui/UIHelpers';
import { ATTRIBUTE_COLORS_STR } from '@/ui/UITheme';

type FilterMode = 'all' | 'towers' | 'enemies';
type StageFilter = 'all' | Stage;

const SKILL_DISPLAY_NAMES: Record<string, string> = {
  'burn': 'Fire Attack',
  'burn_aoe': 'Fire Burst (AoE)',
  'poison': 'Poison',
  'poison_aoe': 'Poison Cloud (AoE)',
  'slow': 'Slow',
  'slow_pierce': 'Slow Pierce',
  'freeze': 'Freeze',
  'freeze_aoe': 'Blizzard (AoE)',
  'stun': 'Stun',
  'stun_aoe': 'Stun Burst (AoE)',
  'armor_break': 'Armor Break',
  'armor_pierce': 'Armor Pierce',
  'anti_air': 'Anti-Air',
  'burn_multishot': 'Fire Barrage',
  'slow_multishot': 'Slow Barrage',
  'freeze_multishot': 'Frost Barrage',
  'stun_multishot': 'Stun Barrage',
  'poison_multihit': 'Venom Strike',
  'burn_multihit': 'Flame Strike',
  'slow_aoe': 'Frost Wave (AoE)',
  'aura_damage': 'Damage Aura',
  'aura_all_holy': 'Holy Aura',
};

function getSkillDisplayName(effectType: string): string {
  return SKILL_DISPLAY_NAMES[effectType] || effectType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

interface DigimonEntry {
  id: string;
  name: string;
  stage: Stage;
  attribute: Attribute;
  isTower: boolean;
  stats: DigimonStats | EnemyStats;
}

export class EncyclopediaScene extends Phaser.Scene {
  private entries: DigimonEntry[] = [];
  private filteredEntries: DigimonEntry[] = [];
  private filterMode: FilterMode = 'towers';
  private stageFilter: StageFilter = 'all';

  // Pagination
  private page: number = 0;
  private readonly ITEMS_PER_PAGE = 24;
  private readonly GRID_COLS = 6;
  private readonly GRID_ROWS = 4;

  // UI elements
  private gridContainer!: Phaser.GameObjects.Container;
  private detailPanel!: Phaser.GameObjects.Container;
  private detailVisible: boolean = false;
  private pageText!: Phaser.GameObjects.Text;
  private filterBtnTexts: Phaser.GameObjects.Text[] = [];
  private filterBtnBgs: Phaser.GameObjects.Graphics[] = [];
  private stageBtnTexts: Phaser.GameObjects.Text[] = [];
  private stageBtnBgs: Phaser.GameObjects.Graphics[] = [];

  constructor() {
    super({ key: 'EncyclopediaScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#060614');

    // Build entry list
    this.buildEntries();
    this.applyFilters();

    // Digital grid bg
    const gridGfx = this.add.graphics();
    drawDigitalGrid(gridGfx, GAME_WIDTH, GAME_HEIGHT, 50, COLORS.CYAN, 0.02);

    // Subtle particles
    createDigitalParticles(this, GAME_WIDTH, GAME_HEIGHT, 10, COLORS.CYAN);

    // Title
    this.add.text(GAME_WIDTH / 2, 30, 'Encyclopedia', {
      ...TEXT_STYLES.SCENE_TITLE,
      fontSize: '36px',
    }).setOrigin(0.5);

    // Filter buttons row
    this.createFilterButtons();

    // Stage filter buttons
    this.createStageFilterButtons();

    // Back button
    this.createBackButton();

    // Grid container for Digimon sprites
    this.gridContainer = this.add.container(0, 0);

    // Page navigation
    this.pageText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 35, '', {
      fontFamily: FONTS.MONO,
      fontSize: '13px',
      color: '#8899bb',
    }).setOrigin(0.5);

    this.createPageButtons();

    // Detail panel (hidden by default)
    this.detailPanel = this.add.container(0, 0).setVisible(false).setDepth(20);

    // ESC to close detail or go back
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ESC', () => {
        if (this.detailVisible) {
          this.hideDetail();
        } else {
          this.scene.start('MainMenuScene');
        }
      });
    }

    this.renderGrid();
    this.cameras.main.fadeIn(ANIM.FADE_IN_MS, 6, 6, 20);
  }

  private buildEntries(): void {
    this.entries = [];

    // Towers
    for (const [id, stats] of Object.entries(DIGIMON_DATABASE.towers)) {
      this.entries.push({
        id,
        name: stats.name,
        stage: stats.stageTier,
        attribute: stats.attribute,
        isTower: true,
        stats,
      });
    }

    // Enemies
    for (const [id, stats] of Object.entries(DIGIMON_DATABASE.enemies)) {
      this.entries.push({
        id,
        name: stats.name,
        stage: stats.stageTier,
        attribute: stats.attribute,
        isTower: false,
        stats,
      });
    }

    // Sort by stage tier then name
    this.entries.sort((a, b) => {
      if (a.stage !== b.stage) return a.stage - b.stage;
      return a.name.localeCompare(b.name);
    });
  }

  private applyFilters(): void {
    this.filteredEntries = this.entries.filter(entry => {
      if (this.filterMode === 'towers' && !entry.isTower) return false;
      if (this.filterMode === 'enemies' && entry.isTower) return false;
      if (this.stageFilter !== 'all' && entry.stage !== this.stageFilter) return false;
      return true;
    });
    this.page = 0;
  }

  private renderGrid(): void {
    // Clear existing
    this.gridContainer.removeAll(true);

    const startIdx = this.page * this.ITEMS_PER_PAGE;
    const pageEntries = this.filteredEntries.slice(startIdx, startIdx + this.ITEMS_PER_PAGE);

    const cellW = 100;
    const cellH = 110;
    const gridStartX = (GAME_WIDTH - this.GRID_COLS * cellW) / 2;
    const gridStartY = 150;

    for (let i = 0; i < pageEntries.length; i++) {
      const entry = pageEntries[i];
      const col = i % this.GRID_COLS;
      const row = Math.floor(i / this.GRID_COLS);
      const cx = gridStartX + col * cellW + cellW / 2;
      const cy = gridStartY + row * cellH + cellH / 2;

      // Card background with refined styling
      const cardBg = this.add.graphics();
      this.drawEncyCard(cardBg, cx, cy, cellW, cellH, entry, false);
      this.gridContainer.add(cardBg);

      // Sprite
      const spriteKey = entry.isTower
        ? ((entry.stats as DigimonStats).spriteKey ?? entry.id)
        : entry.id.replace(/^(enemy_|boss_)/, '');
      if (this.textures.exists(spriteKey)) {
        const sprite = this.add.image(cx, cy - 16, spriteKey);
        sprite.setScale(3);
        this.gridContainer.add(sprite);
      } else {
        const placeholder = this.add.text(cx, cy - 16, '?', {
          fontSize: '22px',
          color: '#334455',
        }).setOrigin(0.5);
        this.gridContainer.add(placeholder);
      }

      // Name
      const nameText = this.add.text(cx, cy + 24, entry.name, {
        fontFamily: FONTS.BODY,
        fontSize: '10px',
        color: '#ccccdd',
        align: 'center',
        wordWrap: { width: cellW - 12 },
      }).setOrigin(0.5, 0);
      this.gridContainer.add(nameText);

      // Attribute color bar (thin accent at bottom)
      const attrColor = [COLORS.VACCINE, COLORS.DATA, COLORS.VIRUS, COLORS.FREE][entry.attribute];
      const attrBar = this.add.graphics();
      attrBar.fillStyle(attrColor, 0.7);
      attrBar.fillRoundedRect(cx - cellW / 2 + 10, cy + cellH / 2 - 10, cellW - 20, 3, 1);
      this.gridContainer.add(attrBar);

      // Make clickable
      const hitZone = this.add.zone(cx, cy, cellW - 8, cellH - 8).setInteractive({ cursor: 'pointer' });
      hitZone.on('pointerdown', () => this.showDetail(entry));
      hitZone.on('pointerover', () => {
        this.drawEncyCard(cardBg, cx, cy, cellW, cellH, entry, true);
      });
      hitZone.on('pointerout', () => {
        this.drawEncyCard(cardBg, cx, cy, cellW, cellH, entry, false);
      });
      this.gridContainer.add(hitZone);
    }

    // Update page text
    const totalPages = Math.max(1, Math.ceil(this.filteredEntries.length / this.ITEMS_PER_PAGE));
    this.pageText.setText(`Page ${this.page + 1} / ${totalPages}  |  ${this.filteredEntries.length} entries`);
  }

  private drawEncyCard(
    g: Phaser.GameObjects.Graphics, cx: number, cy: number,
    cellW: number, cellH: number, entry: DigimonEntry, hovered: boolean,
  ): void {
    g.clear();
    const x = cx - cellW / 2 + 4;
    const y = cy - cellH / 2 + 4;
    const w = cellW - 8;
    const h = cellH - 8;

    if (hovered) {
      g.fillStyle(COLORS.BG_HOVER, 0.9);
      g.fillRoundedRect(x, y, w, h, 8);
      g.lineStyle(1.5, COLORS.CYAN, 0.7);
    } else {
      g.fillStyle(COLORS.BG_PANEL_LIGHT, 0.75);
      g.fillRoundedRect(x, y, w, h, 8);
      // Top highlight
      g.fillStyle(0xffffff, 0.02);
      g.fillRoundedRect(x + 1, y + 1, w - 2, h / 3, { tl: 7, tr: 7, bl: 0, br: 0 });
      const borderColor = entry.isTower ? COLORS.CYAN_DIM : COLORS.DANGER;
      g.lineStyle(1, borderColor, 0.35);
    }
    g.strokeRoundedRect(x, y, w, h, 8);
  }

  private getEvolutionChain(digimonId: string): { prevIds: string[]; nextIds: string[] } {
    const prevIds: string[] = [];
    // Search all keys in EVOLUTION_PATHS for entries where resultId matches digimonId
    for (const [sourceId, paths] of Object.entries(EVOLUTION_PATHS)) {
      for (const path of paths) {
        if (path.resultId === digimonId) {
          prevIds.push(sourceId);
        }
      }
    }

    // Next evolutions: look up this Digimon's own paths
    const nextPaths = EVOLUTION_PATHS[digimonId] ?? [];
    const nextIds = nextPaths.map(p => p.resultId);

    return { prevIds, nextIds };
  }

  private showDetail(entry: DigimonEntry): void {
    this.detailPanel.removeAll(true);
    this.detailVisible = true;

    // Overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.65);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT), Phaser.Geom.Rectangle.Contains);
    overlay.on('pointerdown', () => this.hideDetail());
    this.detailPanel.add(overlay);

    // Panel container for animation
    const panelCont = this.add.container(0, 0);
    this.detailPanel.add(panelCont);

    // Determine card height: towers with evolution chains need more space
    const cardW = 420;
    let evoChain: { prevIds: string[]; nextIds: string[] } | null = null;
    if (entry.isTower) {
      evoChain = this.getEvolutionChain(entry.id);
    }
    const hasEvoData = evoChain && (evoChain.prevIds.length > 0 || evoChain.nextIds.length > 0);
    const cardH = entry.isTower && hasEvoData ? 480 : 380;
    const cardX = (GAME_WIDTH - cardW) / 2;
    const cardY = (GAME_HEIGHT - cardH) / 2;

    const cardBg = this.add.graphics();
    const borderColor = entry.isTower ? COLORS.CYAN : COLORS.DANGER;
    drawPanel(cardBg, cardX, cardY, cardW, cardH, { borderColor, borderAlpha: 0.5 });
    panelCont.add(cardBg);

    // Large sprite
    const spriteKey = entry.isTower
      ? ((entry.stats as DigimonStats).spriteKey ?? entry.id)
      : entry.id.replace(/^(enemy_|boss_)/, '');
    if (this.textures.exists(spriteKey)) {
      const sprite = this.add.image(cardX + 70, cardY + 80, spriteKey).setScale(4);
      panelCont.add(sprite);
    }

    // Name
    panelCont.add(this.add.text(cardX + 150, cardY + 30, entry.name, {
      fontFamily: FONTS.DISPLAY,
      fontSize: '22px',
      color: '#00ddff',
      fontStyle: 'bold',
    }));

    // Stage + Attribute
    const attrColor = ATTRIBUTE_COLORS_STR[entry.attribute] ?? '#ffffff';
    panelCont.add(this.add.text(cardX + 150, cardY + 60, `${STAGE_NAMES[entry.stage]}  |  ${ATTRIBUTE_NAMES[entry.attribute]}`, {
      fontFamily: FONTS.BODY,
      fontSize: '13px',
      color: attrColor,
    }));

    // Type badge
    const typeBadge = this.add.graphics();
    const isT = entry.isTower;
    typeBadge.fillStyle(isT ? 0x225533 : 0x552233, 0.8);
    typeBadge.fillRoundedRect(cardX + 150, cardY + 84, 60, 20, 4);
    panelCont.add(typeBadge);
    panelCont.add(this.add.text(cardX + 180, cardY + 94, isT ? 'Tower' : 'Enemy', {
      fontFamily: FONTS.BODY,
      fontSize: '11px',
      color: isT ? '#44dd66' : '#ff7788',
      fontStyle: 'bold',
    }).setOrigin(0.5));

    // Stats separator
    let statsY = cardY + 125;
    const sepGfx = this.add.graphics();
    drawSeparator(sepGfx, cardX + 20, statsY - 5, cardX + cardW - 20);
    panelCont.add(sepGfx);

    if (entry.isTower) {
      const ts = entry.stats as DigimonStats;
      const statLines = [
        { label: 'Damage', value: `${ts.baseDamage}` },
        { label: 'Atk Speed', value: `${ts.baseSpeed.toFixed(1)} atk/s` },
        { label: 'Range', value: `${ts.range.toFixed(1)} cells` },
      ];
      if (ts.effectType) {
        statLines.push({ label: 'Skill', value: `${getSkillDisplayName(ts.effectType)} (${Math.round((ts.effectChance ?? 0) * 100)}%)` });
      }
      for (const stat of statLines) {
        panelCont.add(this.add.text(cardX + 30, statsY, stat.label, {
          fontFamily: FONTS.BODY,
          fontSize: '12px',
          color: '#7788aa',
        }));
        panelCont.add(this.add.text(cardX + cardW - 30, statsY, stat.value, {
          fontFamily: FONTS.MONO,
          fontSize: '13px',
          color: '#ddddee',
        }).setOrigin(1, 0));
        statsY += 24;
      }

      // Evolution Chain section (towers only)
      if (evoChain && hasEvoData) {
        statsY += 8;
        const evoSep = this.add.graphics();
        drawSeparator(evoSep, cardX + 20, statsY, cardX + cardW - 20, COLORS.CYAN);
        panelCont.add(evoSep);
        statsY += 12;

        panelCont.add(this.add.text(cardX + 30, statsY, 'Evolution Chain', {
          fontFamily: FONTS.DISPLAY,
          fontSize: '14px',
          color: '#00ddff',
          fontStyle: 'bold',
        }));
        statsY += 24;

        // "From:" row - previous evolutions
        panelCont.add(this.add.text(cardX + 30, statsY + 10, 'From:', {
          fontFamily: FONTS.BODY,
          fontSize: '11px',
          color: '#7788aa',
        }));

        if (evoChain.prevIds.length === 0) {
          panelCont.add(this.add.text(cardX + 80, statsY + 10, '\u2014', {
            fontFamily: FONTS.MONO,
            fontSize: '13px',
            color: '#556677',
          }));
        } else {
          let prevX = cardX + 80;
          for (const prevId of evoChain.prevIds) {
            const prevEntry = this.entries.find(e => e.id === prevId && e.isTower);
            if (!prevEntry) continue;
            const prevSpriteKey = (prevEntry.stats as DigimonStats).spriteKey ?? prevEntry.id;

            // Clickable sprite + name group
            const evoContainer = this.add.container(prevX + 20, statsY + 10);

            if (this.textures.exists(prevSpriteKey)) {
              const evoSprite = this.add.image(0, 0, prevSpriteKey).setScale(2);
              evoContainer.add(evoSprite);
            } else {
              const placeholder = this.add.text(0, 0, '?', {
                fontSize: '14px', color: '#556677',
              }).setOrigin(0.5);
              evoContainer.add(placeholder);
            }

            const evoName = this.add.text(0, 18, prevEntry.name, {
              fontFamily: FONTS.BODY,
              fontSize: '9px',
              color: '#aabbcc',
              align: 'center',
            }).setOrigin(0.5, 0);
            evoContainer.add(evoName);

            // Hit zone for clicking
            const hitZone = this.add.zone(0, 6, 44, 42).setInteractive({ cursor: 'pointer' });
            hitZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
              pointer.event.stopPropagation();
              this.showDetail(prevEntry);
            });
            hitZone.on('pointerover', () => { evoName.setColor('#00ddff'); });
            hitZone.on('pointerout', () => { evoName.setColor('#aabbcc'); });
            evoContainer.add(hitZone);

            panelCont.add(evoContainer);
            prevX += 70;
          }
        }
        statsY += 40;

        // "To:" row - next evolutions
        panelCont.add(this.add.text(cardX + 30, statsY + 10, 'To:', {
          fontFamily: FONTS.BODY,
          fontSize: '11px',
          color: '#7788aa',
        }));

        if (evoChain.nextIds.length === 0) {
          panelCont.add(this.add.text(cardX + 80, statsY + 10, '\u2014', {
            fontFamily: FONTS.MONO,
            fontSize: '13px',
            color: '#556677',
          }));
        } else {
          let nextX = cardX + 80;
          for (const nextId of evoChain.nextIds) {
            const nextEntry = this.entries.find(e => e.id === nextId && e.isTower);
            if (!nextEntry) continue;
            const nextSpriteKey = (nextEntry.stats as DigimonStats).spriteKey ?? nextEntry.id;

            // Clickable sprite + name group
            const evoContainer = this.add.container(nextX + 20, statsY + 10);

            if (this.textures.exists(nextSpriteKey)) {
              const evoSprite = this.add.image(0, 0, nextSpriteKey).setScale(2);
              evoContainer.add(evoSprite);
            } else {
              const placeholder = this.add.text(0, 0, '?', {
                fontSize: '14px', color: '#556677',
              }).setOrigin(0.5);
              evoContainer.add(placeholder);
            }

            const evoName = this.add.text(0, 18, nextEntry.name, {
              fontFamily: FONTS.BODY,
              fontSize: '9px',
              color: '#aabbcc',
              align: 'center',
            }).setOrigin(0.5, 0);
            evoContainer.add(evoName);

            // Hit zone for clicking
            const hitZone = this.add.zone(0, 6, 44, 42).setInteractive({ cursor: 'pointer' });
            hitZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
              pointer.event.stopPropagation();
              this.showDetail(nextEntry);
            });
            hitZone.on('pointerover', () => { evoName.setColor('#00ddff'); });
            hitZone.on('pointerout', () => { evoName.setColor('#aabbcc'); });
            evoContainer.add(hitZone);

            panelCont.add(evoContainer);
            nextX += 70;
          }
        }
      }
    } else {
      const es = entry.stats as EnemyStats;
      const statLines = [
        { label: 'HP', value: es.baseHP.toLocaleString() },
        { label: 'Speed', value: `${es.moveSpeed}` },
        { label: 'Armor', value: `${Math.round(es.armor * 100)}%` },
        { label: 'Type', value: es.type },
        { label: 'Reward', value: `${es.reward} DB` },
      ];
      for (const stat of statLines) {
        panelCont.add(this.add.text(cardX + 30, statsY, stat.label, {
          fontFamily: FONTS.BODY,
          fontSize: '12px',
          color: '#7788aa',
        }));
        panelCont.add(this.add.text(cardX + cardW - 30, statsY, stat.value, {
          fontFamily: FONTS.MONO,
          fontSize: '13px',
          color: '#ddddee',
        }).setOrigin(1, 0));
        statsY += 24;
      }
      if (es.bossAbility) {
        statsY += 5;
        const abilitySep = this.add.graphics();
        drawSeparator(abilitySep, cardX + 20, statsY, cardX + cardW - 20, COLORS.GOLD);
        panelCont.add(abilitySep);
        statsY += 10;
        panelCont.add(this.add.text(cardX + 30, statsY, `Ability: ${es.bossAbility.name}`, {
          fontFamily: FONTS.DISPLAY,
          fontSize: '14px',
          color: '#ffaa44',
          fontStyle: 'bold',
        }));
        statsY += 20;
        panelCont.add(this.add.text(cardX + 30, statsY, es.bossAbility.description, {
          fontFamily: FONTS.BODY,
          fontSize: '12px',
          color: '#cc9944',
          wordWrap: { width: cardW - 60 },
        }));
      }
    }

    // Close button
    const closeBtn = this.add.container(cardX + cardW - 25, cardY + 20);
    const closeBg = this.add.graphics();
    drawButton(closeBg, 32, 32, COLORS.DANGER);
    closeBtn.add(closeBg);
    const closeText = this.add.text(0, 0, 'X', {
      fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    closeBtn.add(closeText);
    const closeHit = new Phaser.Geom.Rectangle(-16, -16, 32, 32);
    closeBtn.setInteractive(closeHit, Phaser.Geom.Rectangle.Contains);
    closeBtn.input!.cursor = 'pointer';
    closeBtn.on('pointerdown', () => this.hideDetail());
    closeBtn.on('pointerover', () => drawButton(closeBg, 32, 32, COLORS.DANGER_HOVER, { glowRing: true }));
    closeBtn.on('pointerout', () => drawButton(closeBg, 32, 32, COLORS.DANGER));
    panelCont.add(closeBtn);

    this.detailPanel.setVisible(true);

    // Animate panel entrance
    animateModalIn(this, panelCont);
  }

  private hideDetail(): void {
    this.detailVisible = false;
    this.detailPanel.setVisible(false);
    this.detailPanel.removeAll(true);
  }

  private createFilterButtons(): void {
    const filters: { label: string; mode: FilterMode }[] = [
      { label: 'All', mode: 'all' },
      { label: 'Towers', mode: 'towers' },
      { label: 'Enemies', mode: 'enemies' },
    ];

    const btnW = 85;
    const btnH = 30;
    const startX = GAME_WIDTH / 2 - (filters.length * (btnW + 10)) / 2 + btnW / 2;
    const y = 70;

    filters.forEach((f, i) => {
      const x = startX + i * (btnW + 10);
      const container = this.add.container(x, y);
      const bg = this.add.graphics();
      drawButton(bg, btnW, btnH, f.mode === this.filterMode ? COLORS.CYAN : COLORS.BG_PANEL_LIGHT);
      container.add(bg);
      this.filterBtnBgs.push(bg);

      const text = this.add.text(0, 0, f.label, TEXT_STYLES.BUTTON_SM).setOrigin(0.5);
      container.add(text);
      this.filterBtnTexts.push(text);

      const hitArea = new Phaser.Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH);
      container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
      container.input!.cursor = 'pointer';

      container.on('pointerdown', () => {
        this.filterMode = f.mode;
        this.updateFilterHighlights();
        this.applyFilters();
        this.renderGrid();
      });
    });
  }

  private createStageFilterButtons(): void {
    const stages: { label: string; filter: StageFilter }[] = [
      { label: 'All', filter: 'all' },
      { label: 'In-Trn', filter: Stage.IN_TRAINING },
      { label: 'Rook', filter: Stage.ROOKIE },
      { label: 'Chmp', filter: Stage.CHAMPION },
      { label: 'Ultm', filter: Stage.ULTIMATE },
      { label: 'Mega', filter: Stage.MEGA },
      { label: 'Ultra', filter: Stage.ULTRA },
    ];

    const btnW = 60;
    const btnH = 26;
    const startX = GAME_WIDTH / 2 - (stages.length * (btnW + 6)) / 2 + btnW / 2;
    const y = 108;

    stages.forEach((s, i) => {
      const x = startX + i * (btnW + 6);
      const container = this.add.container(x, y);
      const bg = this.add.graphics();
      drawButton(bg, btnW, btnH, s.filter === this.stageFilter ? COLORS.CYAN : COLORS.BG_PANEL_LIGHT);
      container.add(bg);
      this.stageBtnBgs.push(bg);

      const text = this.add.text(0, 0, s.label, {
        ...TEXT_STYLES.BUTTON_SM,
        fontSize: '10px',
      }).setOrigin(0.5);
      container.add(text);
      this.stageBtnTexts.push(text);

      const hitArea = new Phaser.Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH);
      container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
      container.input!.cursor = 'pointer';

      container.on('pointerdown', () => {
        this.stageFilter = s.filter;
        this.updateStageHighlights();
        this.applyFilters();
        this.renderGrid();
      });
    });
  }

  private updateFilterHighlights(): void {
    const modes: FilterMode[] = ['all', 'towers', 'enemies'];
    modes.forEach((m, i) => {
      if (this.filterBtnBgs[i]) {
        drawButton(this.filterBtnBgs[i], 85, 30, m === this.filterMode ? COLORS.CYAN : COLORS.BG_PANEL_LIGHT);
      }
    });
  }

  private updateStageHighlights(): void {
    const stages: StageFilter[] = ['all', Stage.IN_TRAINING, Stage.ROOKIE, Stage.CHAMPION, Stage.ULTIMATE, Stage.MEGA, Stage.ULTRA];
    stages.forEach((s, i) => {
      if (this.stageBtnBgs[i]) {
        drawButton(this.stageBtnBgs[i], 60, 26, s === this.stageFilter ? COLORS.CYAN : COLORS.BG_PANEL_LIGHT);
      }
    });
  }

  private createPageButtons(): void {
    // Previous page
    const prevBtn = this.add.container(GAME_WIDTH / 2 - 100, GAME_HEIGHT - 35);
    const prevBg = this.add.graphics();
    drawButton(prevBg, 50, 30, COLORS.BG_PANEL_LIGHT);
    prevBtn.add(prevBg);
    prevBtn.add(this.add.text(0, 0, '<', TEXT_STYLES.BUTTON_SM).setOrigin(0.5));
    prevBtn.setInteractive(new Phaser.Geom.Rectangle(-25, -15, 50, 30), Phaser.Geom.Rectangle.Contains);
    prevBtn.input!.cursor = 'pointer';
    prevBtn.on('pointerdown', () => {
      if (this.page > 0) {
        this.page--;
        this.renderGrid();
      }
    });
    prevBtn.on('pointerover', () => drawButton(prevBg, 50, 30, COLORS.BG_HOVER));
    prevBtn.on('pointerout', () => drawButton(prevBg, 50, 30, COLORS.BG_PANEL_LIGHT));

    // Next page
    const nextBtn = this.add.container(GAME_WIDTH / 2 + 100, GAME_HEIGHT - 35);
    const nextBg = this.add.graphics();
    drawButton(nextBg, 50, 30, COLORS.BG_PANEL_LIGHT);
    nextBtn.add(nextBg);
    nextBtn.add(this.add.text(0, 0, '>', TEXT_STYLES.BUTTON_SM).setOrigin(0.5));
    nextBtn.setInteractive(new Phaser.Geom.Rectangle(-25, -15, 50, 30), Phaser.Geom.Rectangle.Contains);
    nextBtn.input!.cursor = 'pointer';
    nextBtn.on('pointerdown', () => {
      const totalPages = Math.ceil(this.filteredEntries.length / this.ITEMS_PER_PAGE);
      if (this.page < totalPages - 1) {
        this.page++;
        this.renderGrid();
      }
    });
    nextBtn.on('pointerover', () => drawButton(nextBg, 50, 30, COLORS.BG_HOVER));
    nextBtn.on('pointerout', () => drawButton(nextBg, 50, 30, COLORS.BG_PANEL_LIGHT));
  }

  private createBackButton(): void {
    const btn = this.add.container(70, 30);
    const bg = this.add.graphics();
    drawButton(bg, 85, 32, COLORS.BG_PANEL_LIGHT);
    btn.add(bg);
    btn.add(this.add.text(0, 0, '< Back', TEXT_STYLES.BUTTON_SM).setOrigin(0.5));
    btn.setInteractive(new Phaser.Geom.Rectangle(-42, -16, 85, 32), Phaser.Geom.Rectangle.Contains);
    btn.input!.cursor = 'pointer';
    btn.on('pointerdown', () => this.scene.start('MainMenuScene'));
    btn.on('pointerover', () => {
      drawButton(bg, 85, 32, COLORS.BG_HOVER, { glowRing: true });
    });
    btn.on('pointerout', () => {
      drawButton(bg, 85, 32, COLORS.BG_PANEL_LIGHT);
    });
  }
}
