import { EvolutionPath } from '@/types';

/**
 * Evolution paths for all MVP Digimon.
 *
 * Each key is a Digimon ID, and the value is an array of possible evolutions.
 * The `minDP` and `maxDP` define the DP range required to unlock that path.
 * The `isDefault` flag marks the primary/standard evolution for that Digimon.
 *
 * 8 Starter Lines:
 * - Koromon (Vaccine): Koromon -> Agumon -> Greymon/Tyrannomon -> MetalGreymon/SkullGreymon -> WarGreymon
 * - Tsunomon (Data): Tsunomon -> Gabumon -> Garurumon/BlackGarurumon -> WereGarurumon -> MetalGarurumon
 * - Tokomon (Vaccine): Tokomon -> Patamon -> Angemon/Unimon -> MagnaAngemon/Shakkoumon -> Seraphimon
 * - Gigimon (Virus): Gigimon -> Guilmon -> Growlmon -> WarGrowlmon -> Gallantmon/Megidramon/ChaosGallantmon
 * - Tanemon (Data): Tanemon -> Palmon -> Togemon/Woodmon/Sunflowmon -> Lillymon -> Rosemon
 * - DemiVeemon (Free): DemiVeemon -> Veemon -> ExVeemon/Flamedramon -> Paildramon -> ImperialdramonFM
 * - Pagumon (Virus): Pagumon -> DemiDevimon -> Devimon/IceDevimon/Bakemon -> Myotismon/NeoDevimon -> VenomMyotismon/Beelzemon
 * - Viximon (Data): Viximon -> Renamon -> Kyubimon -> Taomon -> Sakuyamon
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
  ],

  // ========================================
  // Tsunomon Line (Data)
  // ========================================

  tsunomon: [
    { resultId: 'gabumon', minDP: 0, maxDP: 999, isDefault: true },
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
  ],

  guilmon: [
    { resultId: 'growlmon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  growlmon: [
    { resultId: 'wargrowlmon', minDP: 0, maxDP: 999, isDefault: true },
  ],

  wargrowlmon: [
    { resultId: 'gallantmon', minDP: 0, maxDP: 5, isDefault: true },
    { resultId: 'megidramon', minDP: 12, maxDP: 999, isDefault: false },
    { resultId: 'chaosgallantmon', minDP: 9, maxDP: 999, isDefault: false },
  ],

  // ========================================
  // Tanemon Line (Data)
  // ========================================

  tanemon: [
    { resultId: 'palmon', minDP: 0, maxDP: 999, isDefault: true },
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
  ],

  paildramon: [
    { resultId: 'imperialdramon_fm', minDP: 0, maxDP: 999, isDefault: true },
  ],

  // ========================================
  // Pagumon Line (Virus)
  // ========================================

  pagumon: [
    { resultId: 'demidevimon', minDP: 0, maxDP: 999, isDefault: true },
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
