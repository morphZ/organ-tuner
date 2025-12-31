import type { TemperamentTable } from './types';

/**
 * Build an equal temperament table mapping MIDI note numbers to Hz (A4 = 440 Hz).
 */
export const EQUAL_TEMPERAMENT: TemperamentTable = (() => {
  const table: TemperamentTable = {};
  for (let midi = 0; midi <= 127; midi++) {
    table[midi] = 440 * 2 ** ((midi - 69) / 12);
  }
  return table;
})();

/**
 * Stubs for other temperaments. Replace with real lookup tables later.
 */
export const WERCKMEISTER_III: TemperamentTable = { ...EQUAL_TEMPERAMENT };
export const MEANTONE: TemperamentTable = { ...EQUAL_TEMPERAMENT };

export const TEMPERAMENT_MAP: Record<string, TemperamentTable> = {
  equal: EQUAL_TEMPERAMENT,
  werckmeister3: WERCKMEISTER_III,
  meantone: MEANTONE,
};

export default EQUAL_TEMPERAMENT;
