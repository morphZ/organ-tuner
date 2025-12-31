import type Note from '~/core/notes/Note';
import { TEMPERAMENT_MAP } from './Temperaments';
import type { TemperamentId, TuningMode } from './types';

export class TuningWorkflow {
  constructor(
    private readonly temperament: TemperamentId,
    private readonly mode: TuningMode,
    private readonly referenceNote?: Note,
  ) {}

  /**
   * Return the reference Hz for a given note depending on mode/temperament.
   */
  public getReferenceHz(note: Note): number {
    if (this.mode === 'absolute') {
      const table = TEMPERAMENT_MAP[this.temperament];
      const midi = note.toMidi();
      const hz = table[midi];
      if (typeof hz !== 'number') {
        throw new Error(`No temperament entry for MIDI ${midi}`);
      }
      return hz;
    }

    // relative mode
    if (!this.referenceNote) {
      throw new Error('Relative mode requires a referenceNote');
    }
    return this.referenceNote.toHz();
  }

  /**
   * Compute cents deviation between measuredHz and reference for note.
   */
  public computeCentsDeviation(note: Note, measuredHz: number): number {
    const referenceHz = this.getReferenceHz(note);
    return 1200 * Math.log2(measuredHz / referenceHz);
  }
}

export default TuningWorkflow;
