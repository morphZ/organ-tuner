export type TemperamentId = 'equal' | 'werckmeister3' | 'meantone';

export type TuningMode = 'absolute' | 'relative';

export type TemperamentTable = Record<number, number>;

export interface TuningConfig {
  temperament: TemperamentId;
  mode: TuningMode;
}
