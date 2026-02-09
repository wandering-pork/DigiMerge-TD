import { EvolutionPath, DNADigivolutionPair } from '@/types';

/**
 * Evolution paths for all MVP Digimon.
 *
 * Each key is a Digimon ID, and the value is an array of possible evolutions.
 * The `minDP` and `maxDP` define the DP range required to unlock that path.
 * The `isDefault` flag marks the primary/standard evolution for that Digimon.
 *
 * 21 Starter Lines:
 * - Koromon (Vaccine): Koromon -> Agumon -> Greymon/Tyrannomon -> MetalGreymon/SkullGreymon -> WarGreymon
 * - Tsunomon (Data): Tsunomon -> Gabumon -> Garurumon/BlackGarurumon -> WereGarurumon -> MetalGarurumon
 * - Tokomon (Vaccine): Tokomon -> Patamon -> Angemon/Unimon -> MagnaAngemon/Shakkoumon -> Seraphimon
 * - Gigimon (Virus): Gigimon -> Guilmon -> Growlmon -> WarGrowlmon -> Gallantmon/Megidramon/ChaosGallantmon
 * - Tanemon (Data): Tanemon -> Palmon -> Togemon/Woodmon/Sunflowmon -> Lillymon -> Rosemon
 * - DemiVeemon (Free): DemiVeemon -> Veemon -> ExVeemon/Flamedramon -> Paildramon -> ImperialdramonFM
 * - Pagumon (Virus): Pagumon -> DemiDevimon -> Devimon/IceDevimon/Bakemon -> Myotismon/NeoDevimon -> VenomMyotismon/Beelzemon
 * - Viximon (Data): Viximon -> Renamon -> Kyubimon -> Taomon -> Sakuyamon
 * - Nyaromon (Vaccine): Nyaromon -> Plotmon -> Tailmon -> Angewomon -> Ophanimon
 * - Gummymon (Vaccine): Gummymon -> Terriermon -> Galgomon -> Rapidmon -> SaintGalgomon
 * - Chocomon (Free): Chocomon -> Lopmon -> Turuiemon -> Andiramon -> Cherubimon (Virtue)
 * - Pyocomon (Data): Pyocomon -> Piyomon -> Birdramon -> Garudamon -> Hououmon
 * - Mochimon (Data): Mochimon -> Tentomon -> Kabuterimon -> AtlurKabuterimon -> HerakleKabuterimon
 * - Pukamon (Vaccine): Pukamon -> Gomamon -> Ikkakumon -> Zudomon -> Plesiomon
 * - Dorimon (Data): Dorimon -> Dorumon -> Dorugamon -> DoruGreymon -> Alphamon
 * - Sunmon (Vaccine): Sunmon -> Coronamon -> Firamon -> Flaremon -> Apollomon
 * - Moonmon (Data): Moonmon -> Lunamon -> Lekismon -> Crescemon -> Dianamon
 * - Kyokyomon (Vaccine): Kyokyomon -> Ryudamon -> Ginryumon -> Hisyaryumon -> Ouryumon
 * - Puroromon (Free): Puroromon -> Funbeemon -> Waspmon -> Cannonbeemon -> TigerVespamon
 * - Budmon (Data): Budmon -> Lalamon -> Sunflowmon -> Lilamon -> Lotusmon
 * - Caprimon (Vaccine): Caprimon -> Hackmon -> Reppamon -> SaviorHackmon -> Jesmon
 */
export const EVOLUTION_PATHS: Record<string, EvolutionPath[]> = {
  // ========================================
  // Koromon Line (Vaccine)
  // ========================================

  koromon: [
    { resultId: 'agumon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  agumon: [
    { resultId: 'greymon', minDP: 0, maxDP: 2, isDefault: true },
    { resultId: 'tyrannomon', minDP: 5, maxDP: 6, isDefault: false },
  ],

  greymon: [
    { resultId: 'metalgreymon', minDP: 0, maxDP: 3, isDefault: true },
    { resultId: 'skullgreymon', minDP: 7, maxDP: 9, isDefault: false },
  ],

  metalgreymon: [
    { resultId: 'wargreymon', minDP: 0, maxDP: 999, isDefault: true },
    { resultId: 'kaisergreymon', minDP: 3, maxDP: 999, isDefault: false },
  ],

  // ========================================
  // Tsunomon Line (Data)
  // ========================================

  tsunomon: [
    { resultId: 'gabumon', minDP: 0, maxDP: 999, isDefault: true },
    { resultId: 'elecmon_tower', minDP: 3, maxDP: 5, isDefault: false },
    { resultId: 'gotsumon_tower', minDP: 6, maxDP: 8, isDefault: false },
  ],

  gabumon: [
    { resultId: 'garurumon', minDP: 0, maxDP: 2, isDefault: true },
    { resultId: 'blackgarurumon', minDP: 5, maxDP: 999, isDefault: false },
  ],

  garurumon: [
    { resultId: 'weregarurumon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  weregarurumon: [
    { resultId: 'metalgarurumon', minDP: 0, maxDP: 999, isDefault: true },
    { resultId: 'magnagarurumon', minDP: 3, maxDP: 999, isDefault: false },
  ],

  // ========================================
  // Tokomon Line (Vaccine)
  // ========================================

  tokomon: [
    { resultId: 'patamon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  patamon: [
    { resultId: 'angemon', minDP: 0, maxDP: 2, isDefault: true },
    { resultId: 'unimon', minDP: 3, maxDP: 4, isDefault: false },
  ],

  angemon: [
    { resultId: 'magnaangemon', minDP: 0, maxDP: 3, isDefault: true },
    { resultId: 'shakkoumon', minDP: 4, maxDP: 6, isDefault: false },
  ],

  magnaangemon: [
    { resultId: 'seraphimon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  // ========================================
  // Gigimon Line (Virus)
  // ========================================

  gigimon: [
    { resultId: 'guilmon', minDP: 0, maxDP: 999, isDefault: true },
    { resultId: 'goblimon_tower', minDP: 3, maxDP: 4, isDefault: false },
    { resultId: 'impmon_tower', minDP: 5, maxDP: 7, isDefault: false },
  ],

  guilmon: [
    { resultId: 'growlmon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  growlmon: [
    { resultId: 'wargrowlmon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  wargrowlmon: [
    { resultId: 'gallantmon', minDP: 0, maxDP: 5, isDefault: true },
    { resultId: 'titamon', minDP: 3, maxDP: 999, isDefault: false },
    { resultId: 'megidramon', minDP: 12, maxDP: 999, isDefault: false },
    { resultId: 'chaosgallantmon', minDP: 9, maxDP: 999, isDefault: false },
  ],

  // ========================================
  // Tanemon Line (Data)
  // ========================================

  tanemon: [
    { resultId: 'palmon', minDP: 0, maxDP: 999, isDefault: true },
    { resultId: 'floramon_tower', minDP: 6, maxDP: 8, isDefault: false },
  ],

  palmon: [
    { resultId: 'togemon', minDP: 0, maxDP: 2, isDefault: true },
    { resultId: 'woodmon', minDP: 3, maxDP: 4, isDefault: false },
    { resultId: 'sunflowmon', minDP: 5, maxDP: 999, isDefault: false },
  ],

  togemon: [
    { resultId: 'lillymon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  lillymon: [
    { resultId: 'rosemon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  // ========================================
  // DemiVeemon Line (Free)
  // ========================================

  demiveemon: [
    { resultId: 'veemon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  veemon: [
    { resultId: 'exveemon', minDP: 0, maxDP: 2, isDefault: true },
    { resultId: 'flamedramon', minDP: 0, maxDP: 2, isDefault: false },
  ],

  exveemon: [
    { resultId: 'paildramon', minDP: 0, maxDP: 999, isDefault: true },
    { resultId: 'magnamon', minDP: 3, maxDP: 999, isDefault: false },
  ],

  paildramon: [
    { resultId: 'imperialdramon_fm', minDP: 0, maxDP: 999, isDefault: true },
    { resultId: 'ulforcevdramon', minDP: 3, maxDP: 999, isDefault: false },
  ],

  // ========================================
  // Pagumon Line (Virus)
  // ========================================

  pagumon: [
    { resultId: 'demidevimon', minDP: 0, maxDP: 999, isDefault: true },
    { resultId: 'wormmon', minDP: 1, maxDP: 3, isDefault: false },
    { resultId: 'gazimon_tower', minDP: 3, maxDP: 4, isDefault: false },
    { resultId: 'betamon_tower', minDP: 5, maxDP: 7, isDefault: false },
    { resultId: 'kunemon_tower', minDP: 8, maxDP: 10, isDefault: false },
  ],

  demidevimon: [
    { resultId: 'devimon', minDP: 0, maxDP: 2, isDefault: true },
    { resultId: 'icedevimon', minDP: 5, maxDP: 999, isDefault: false },
    { resultId: 'bakemon', minDP: 3, maxDP: 4, isDefault: false },
  ],

  devimon: [
    { resultId: 'myotismon', minDP: 0, maxDP: 3, isDefault: true },
    { resultId: 'neodevimon', minDP: 5, maxDP: 999, isDefault: false },
  ],

  myotismon: [
    { resultId: 'venommyotismon', minDP: 0, maxDP: 5, isDefault: true },
    { resultId: 'beelzemon', minDP: 6, maxDP: 8, isDefault: false },
  ],

  // ========================================
  // Viximon Line (Data)
  // ========================================

  viximon: [
    { resultId: 'renamon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  renamon: [
    { resultId: 'kyubimon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  kyubimon: [
    { resultId: 'taomon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  taomon: [
    { resultId: 'sakuyamon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  // ========================================
  // Nyaromon Line (Vaccine) — Holy / Healing
  // ========================================

  nyaromon: [
    { resultId: 'plotmon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  plotmon: [
    { resultId: 'tailmon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  tailmon: [
    { resultId: 'angewomon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  angewomon: [
    { resultId: 'ophanimon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  // ========================================
  // Gummymon Line (Vaccine) — Multi-hit / Pierce
  // ========================================

  gummymon: [
    { resultId: 'terriermon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  terriermon: [
    { resultId: 'galgomon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  galgomon: [
    { resultId: 'rapidmon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  rapidmon: [
    { resultId: 'saintgalgomon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  // ========================================
  // Chocomon Line (Free) — CC / Support
  // ========================================

  chocomon: [
    { resultId: 'lopmon', minDP: 0, maxDP: 999, isDefault: true },
    { resultId: 'hawkmon', minDP: 1, maxDP: 3, isDefault: false },
  ],

  lopmon: [
    { resultId: 'turuiemon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  turuiemon: [
    { resultId: 'andiramon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  andiramon: [
    { resultId: 'cherubimon_virtue', minDP: 0, maxDP: 999, isDefault: true },
  ],

  // ========================================
  // Pyocomon Line (Data) — Fire / Flying
  // ========================================

  pyocomon: [
    { resultId: 'piyomon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  piyomon: [
    { resultId: 'birdramon_tower', minDP: 0, maxDP: 999, isDefault: true },
  ],

  birdramon_tower: [
    { resultId: 'garudamon_tower', minDP: 0, maxDP: 999, isDefault: true },
  ],

  garudamon_tower: [
    { resultId: 'hououmon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  // ========================================
  // Mochimon Line (Data) — Electric / Pierce
  // ========================================

  mochimon: [
    { resultId: 'tentomon_tower', minDP: 0, maxDP: 999, isDefault: true },
  ],

  tentomon_tower: [
    { resultId: 'kabuterimon_tower', minDP: 0, maxDP: 999, isDefault: true },
  ],

  kabuterimon_tower: [
    { resultId: 'atlurkabuterimon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  atlurkabuterimon: [
    { resultId: 'heraklekabuterimon_tower', minDP: 0, maxDP: 999, isDefault: true },
  ],

  // ========================================
  // Pukamon Line (Vaccine) — Ice / Tank Support
  // ========================================

  pukamon: [
    { resultId: 'gomamon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  gomamon: [
    { resultId: 'ikkakumon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  ikkakumon: [
    { resultId: 'zudomon_tower', minDP: 0, maxDP: 999, isDefault: true },
  ],

  zudomon_tower: [
    { resultId: 'plesiomon', minDP: 0, maxDP: 999, isDefault: true },
    { resultId: 'marineangemon', minDP: 3, maxDP: 999, isDefault: false },
  ],

  // ========================================
  // Dorimon Line (Data) — Pierce / Royal Knight
  // ========================================

  dorimon: [
    { resultId: 'dorumon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  dorumon: [
    { resultId: 'dorugamon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  dorugamon: [
    { resultId: 'doruguremon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  doruguremon: [
    { resultId: 'alphamon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  alphamon: [
    { resultId: 'examon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  // ========================================
  // Sunmon Line (Vaccine) — Fire / Burst
  // ========================================

  sunmon: [
    { resultId: 'coronamon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  coronamon: [
    { resultId: 'firamon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  firamon: [
    { resultId: 'flaremon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  flaremon: [
    { resultId: 'apollomon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  // ========================================
  // Moonmon Line (Data) — Ice / CC
  // ========================================

  moonmon: [
    { resultId: 'lunamon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  lunamon: [
    { resultId: 'lekismon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  lekismon: [
    { resultId: 'crescemon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  crescemon: [
    { resultId: 'dianamon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  // ========================================
  // Kyokyomon Line (Vaccine) — Pierce / Armor Break
  // ========================================

  kyokyomon: [
    { resultId: 'ryudamon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  ryudamon: [
    { resultId: 'ginryumon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  ginryumon: [
    { resultId: 'hisyaryumon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  hisyaryumon: [
    { resultId: 'ouryumon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  // ========================================
  // Puroromon Line (Free) — Multi-hit / Speed
  // ========================================

  puroromon: [
    { resultId: 'funbeemon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  funbeemon: [
    { resultId: 'waspmon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  waspmon: [
    { resultId: 'cannonbeemon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  cannonbeemon: [
    { resultId: 'tigervespamon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  // ========================================
  // Budmon Line (Data) — Poison / Support
  // ========================================

  budmon: [
    { resultId: 'lalamon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  lalamon: [
    { resultId: 'sunflowmon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  sunflowmon: [
    { resultId: 'lilamon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  lilamon: [
    { resultId: 'lotusmon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  // ========================================
  // Caprimon Line (Vaccine) — Royal Knight
  // ========================================

  caprimon: [
    { resultId: 'hackmon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  hackmon: [
    { resultId: 'reppamon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  reppamon: [
    { resultId: 'saviorhackmon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  saviorhackmon: [
    { resultId: 'jesmon', minDP: 0, maxDP: 999, isDefault: true },
    { resultId: 'dynasmon', minDP: 3, maxDP: 999, isDefault: false },
    { resultId: 'craniummon', minDP: 5, maxDP: 999, isDefault: false },
  ],

  // ========================================
  // Roster Expansion — Wormmon Line (Virus)
  // ========================================

  wormmon: [
    { resultId: 'stingmon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  stingmon: [
    { resultId: 'jewelbeemon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  // ========================================
  // Roster Expansion — Hawkmon Line (Free)
  // ========================================

  hawkmon: [
    { resultId: 'aquilamon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  aquilamon: [
    { resultId: 'silphymon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  // ========================================
  // Roster Expansion — Magnamon → Susanoomon (Free)
  // ========================================

  magnamon: [
    { resultId: 'susanoomon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  // ========================================
  // Roster Expansion — KaiserGreymon → AncientGreymon (Vaccine)
  // ========================================

  kaisergreymon: [
    { resultId: 'ancientgreymon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  // ========================================
  // Roster Expansion — MagnaGarurumon → AncientGarurumon (Data)
  // ========================================

  magnagarurumon: [
    { resultId: 'ancientgarurumon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  // ========================================
  // New Rookie → Champion Paths (Expanded Roster)
  // ========================================

  impmon_tower: [
    { resultId: 'darktyrannomon_tower', minDP: 0, maxDP: 3, isDefault: true },
    { resultId: 'airdramon_tower', minDP: 4, maxDP: 999, isDefault: false },
  ],

  elecmon_tower: [
    { resultId: 'leomon_tower', minDP: 0, maxDP: 3, isDefault: true },
    { resultId: 'meramon_tower', minDP: 4, maxDP: 999, isDefault: false },
  ],

  gotsumon_tower: [
    { resultId: 'monochromon_tower', minDP: 0, maxDP: 3, isDefault: true },
    { resultId: 'guardromon_tower', minDP: 4, maxDP: 999, isDefault: false },
  ],

  betamon_tower: [
    { resultId: 'seadramon_tower', minDP: 0, maxDP: 3, isDefault: true },
    { resultId: 'numemon_tower', minDP: 4, maxDP: 999, isDefault: false },
  ],

  kunemon_tower: [
    { resultId: 'kuwagamon_tower', minDP: 0, maxDP: 999, isDefault: true },
  ],

  gazimon_tower: [
    { resultId: 'ogremon_tower', minDP: 0, maxDP: 999, isDefault: true },
  ],

  goblimon_tower: [
    { resultId: 'darktyrannomon_tower', minDP: 0, maxDP: 999, isDefault: true },
  ],

  floramon_tower: [
    { resultId: 'meramon_tower', minDP: 0, maxDP: 3, isDefault: true },
    { resultId: 'seadramon_tower', minDP: 4, maxDP: 999, isDefault: false },
  ],

  // ========================================
  // New Champion → Ultimate Paths (Expanded Roster)
  // ========================================

  leomon_tower: [
    { resultId: 'mamemon_tower', minDP: 0, maxDP: 3, isDefault: true },
    { resultId: 'andromon_tower', minDP: 4, maxDP: 999, isDefault: false },
  ],

  seadramon_tower: [
    { resultId: 'megaseadramon_tower', minDP: 0, maxDP: 999, isDefault: true },
  ],

  ogremon_tower: [
    { resultId: 'gigadramon_tower', minDP: 0, maxDP: 3, isDefault: true },
    { resultId: 'warumonzaemon_tower', minDP: 4, maxDP: 999, isDefault: false },
  ],

  monochromon_tower: [
    { resultId: 'megaseadramon_tower', minDP: 0, maxDP: 3, isDefault: true },
    { resultId: 'andromon_tower', minDP: 4, maxDP: 999, isDefault: false },
  ],

  darktyrannomon_tower: [
    { resultId: 'gigadramon_tower', minDP: 0, maxDP: 3, isDefault: true },
    { resultId: 'megadramon_tower', minDP: 4, maxDP: 999, isDefault: false },
  ],

  airdramon_tower: [
    { resultId: 'megadramon_tower', minDP: 0, maxDP: 999, isDefault: true },
  ],

  meramon_tower: [
    { resultId: 'bluemeramon_tower', minDP: 0, maxDP: 999, isDefault: true },
  ],

  kuwagamon_tower: [
    { resultId: 'ladydevimon_tower', minDP: 0, maxDP: 999, isDefault: true },
  ],

  numemon_tower: [
    { resultId: 'warumonzaemon_tower', minDP: 0, maxDP: 999, isDefault: true },
  ],

  guardromon_tower: [
    { resultId: 'andromon_tower', minDP: 0, maxDP: 999, isDefault: true },
  ],

  // ========================================
  // New Ultimate → Mega Paths (Expanded Roster)
  // ========================================

  megaseadramon_tower: [
    { resultId: 'metalseadramon_tower', minDP: 0, maxDP: 999, isDefault: true },
  ],

  gigadramon_tower: [
    { resultId: 'blackwargreymon_tower', minDP: 0, maxDP: 999, isDefault: true },
  ],

  warumonzaemon_tower: [
    { resultId: 'piedmon_tower', minDP: 0, maxDP: 3, isDefault: true },
    { resultId: 'leviamon_tower', minDP: 4, maxDP: 999, isDefault: false },
  ],

  ladydevimon_tower: [
    { resultId: 'piedmon_tower', minDP: 0, maxDP: 3, isDefault: true },
    { resultId: 'puppetmon_tower', minDP: 4, maxDP: 999, isDefault: false },
  ],

  bluemeramon_tower: [
    { resultId: 'boltmon_tower', minDP: 0, maxDP: 999, isDefault: true },
  ],

  megadramon_tower: [
    { resultId: 'blackwargreymon_tower', minDP: 0, maxDP: 3, isDefault: true },
    { resultId: 'diaboromon_tower', minDP: 4, maxDP: 999, isDefault: false },
  ],

  mamemon_tower: [
    { resultId: 'saberleomon_tower', minDP: 0, maxDP: 3, isDefault: true },
    { resultId: 'metalmamemon_tower', minDP: 4, maxDP: 999, isDefault: false },
  ],

  andromon_tower: [
    { resultId: 'metalseadramon_tower', minDP: 0, maxDP: 3, isDefault: true },
    { resultId: 'boltmon_tower', minDP: 4, maxDP: 999, isDefault: false },
  ],
};

/**
 * Returns all evolution paths available for a given Digimon at a given DP level.
 *
 * @param digimonId - The ID of the Digimon to look up evolutions for.
 * @param currentDP - The current DP of the Digimon.
 * @returns An array of EvolutionPath objects whose DP range includes currentDP.
 */
export function getEvolutions(digimonId: string, currentDP: number): EvolutionPath[] {
  const paths = EVOLUTION_PATHS[digimonId] ?? [];
  return paths.filter(path => currentDP >= path.minDP && currentDP <= path.maxDP);
}

/**
 * DNA Digivolution pairs — combine two specific Mega Digimon to create an Ultra.
 * Both partners must be at max level and meet the DP requirement.
 */
export const DNA_PAIRS: DNADigivolutionPair[] = [
  // WarGreymon + MetalGarurumon = Omegamon (the iconic fusion)
  { partnerAId: 'wargreymon', partnerBId: 'metalgarurumon', resultId: 'omegamon', minDPRequired: 3 },
  // Gallantmon + ChaosGallantmon = Gallantmon Crimson Mode
  { partnerAId: 'gallantmon', partnerBId: 'chaosgallantmon', resultId: 'gallantmon_cm', minDPRequired: 5 },
  // Alphamon + Ouryumon = Alphamon Ouryuken
  { partnerAId: 'alphamon', partnerBId: 'ouryumon', resultId: 'alphamon_ouryuken', minDPRequired: 5 },
  // Ophanimon + Cherubimon (Virtue) = Susanoomon (angels fuse)
  { partnerAId: 'ophanimon', partnerBId: 'cherubimon_virtue', resultId: 'susanoomon_dna', minDPRequired: 5 },
  // Rosemon + Lotusmon = Rafflesimon
  { partnerAId: 'rosemon', partnerBId: 'lotusmon', resultId: 'rafflesimon', minDPRequired: 4 },
  // Beelzemon → Beelzemon Blast Mode (DP-only upgrade, partner with self attribute)
  { partnerAId: 'beelzemon', partnerBId: 'venommyotismon', resultId: 'beelzemon_bm', minDPRequired: 6 },
];

/**
 * Find a DNA pair that matches two given Digimon IDs (order doesn't matter).
 */
export function findDNAPair(digimonAId: string, digimonBId: string): DNADigivolutionPair | undefined {
  return DNA_PAIRS.find(
    pair =>
      (pair.partnerAId === digimonAId && pair.partnerBId === digimonBId) ||
      (pair.partnerAId === digimonBId && pair.partnerBId === digimonAId)
  );
}

/**
 * Get all DNA pairs where a given Digimon is one of the partners.
 */
export function getDNAPairsFor(digimonId: string): DNADigivolutionPair[] {
  return DNA_PAIRS.filter(
    pair => pair.partnerAId === digimonId || pair.partnerBId === digimonId
  );
}
