# DigiMerge TD

A Digimon-themed tower defense merge game built with Phaser 3 and TypeScript.

Spawn Digimon, level them up, merge same-attribute Digimon to earn DP (Digivolution Points), and digivolve at max level to create powerful defenders. Inspired by Digimon World 2 mechanics.

**[Play Now](https://wandering-pork.github.io/DigiMerge-TD/)**

## Game Loop

```
SPAWN -> LEVEL UP -> MERGE -> DIGIVOLVE -> DEFEND -> REPEAT
```

1. **Spawn** Digimon onto the grid using DigiBytes
2. **Level up** towers to increase their stats
3. **Merge** two same-attribute, same-stage Digimon to gain +1 DP
4. **Digivolve** at max level using DP to unlock stronger forms
5. **Defend** against 100 waves of enemies (+ endless mode)

## Features

- **141+ tower Digimon** across 21 starter evolution lines with alternate paths
- **65+ enemy Digimon** including 12 bosses with unique abilities
- **100 waves** across 5 phases plus endless mode (101+)
- **Attribute triangle** — Vaccine > Virus > Data > Vaccine (1.5x damage)
- **6 evolution stages** — In-Training, Rookie, Champion, Ultimate, Mega, Ultra
- **Origin system** — spawn stage caps maximum evolution tier
- **Merge ability inheritance** — inherited bonus effects with stacking
- **Status effects** — Burn, Poison, Slow, Freeze, Stun, Armor Break
- **Encyclopedia** — browsable Digimon catalog with filters and detail views
- **Tutorial** — 8-step guided overlay for new players
- **Save system** — auto-save + manual export/import as JSON
- **Game speed** — 1x / 2x / 3x toggle

## Controls

| Input | Action |
|-------|--------|
| Left click | Select tower, place tower, confirm actions |
| Right click | Cancel (merge mode, selection, spawn) |
| ESC | Pause / cancel |
| 1 / 2 / 3 | Game speed |
| Space | Start next wave |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- npm

### Install & Run

```bash
git clone https://github.com/wandering-pork/DigiMerge-TD.git
cd DigiMerge-TD
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Other Commands

```bash
npm run build      # Production build to dist/
npm run preview    # Preview production build
npm run test       # Run tests (479 tests across 18 suites)
```

## Tech Stack

- **[Phaser 3](https://phaser.io/)** — 2D game framework
- **TypeScript** — type-safe development
- **Vite** — build tool and dev server
- **Vitest** — unit testing
- **GitHub Pages** — auto-deploy on push to main

## Project Structure

```
src/
  config/       # Game config and constants
  data/         # Digimon database, wave data, evolution paths, status effects
  entities/     # Tower, Enemy, Projectile classes
  managers/     # GameState, Wave, Combat, Tower, Audio, Save managers
  scenes/       # Boot, Preload, MainMenu, StarterSelect, Game, Pause,
                  Settings, GameOver, Encyclopedia, Credits (10 scenes)
  systems/      # Attribute, BossAbility, DP, Level, Merge, Origin, Targeting
  ui/           # SpawnMenu, TowerInfoPanel, EvolutionModal, MergeModal,
                  TutorialOverlay, UITheme, UIHelpers
  utils/        # EventBus, GridUtils
  types/        # TypeScript type definitions
```

## Credits

- **Sprites** — Digimon sprite resources (fan community)
- **Tileset** — [Sprout Lands Asset Pack](https://cupnooble.itch.io/) by Cup Nooble
- **Music** — "Kawaii Dance" by Fassounds, "J-Rock Anime Opening" by JustSushi
- **Font** — Pixel Digivolve by Rikitik Studio
- **Built with** — [Claude Code](https://claude.ai/claude-code) by Anthropic

## Disclaimer

This is a fan-made project for educational purposes only. Not affiliated with, endorsed by, or associated with Bandai Namco, Toei Animation, or the Digimon franchise. All Digimon names and likenesses are trademarks of their respective owners.

## License

ISC
