export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export class Note {
  public static readonly ALLOWED_NAMES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  public readonly name: NoteName;
  public readonly octave: number;

  constructor(name: string, octave: number) {
    if (!Note.ALLOWED_NAMES.includes(name as NoteName)) {
      throw new TypeError(`Invalid note name: ${name}`);
    }
    if (!Number.isInteger(octave) || octave < 1 || octave > 6) {
      throw new RangeError(`Octave must be an integer between 1 and 6 (received ${octave})`);
    }
    this.name = name as NoteName;
    this.octave = octave;
  }

  private static semitoneIndex(name: NoteName): number {
    const map: Record<NoteName, number> = {
      C: 0,
      'C#': 1,
      D: 2,
      'D#': 3,
      E: 4,
      F: 5,
      'F#': 6,
      G: 7,
      'G#': 8,
      A: 9,
      'A#': 10,
      B: 11,
    };
    return map[name];
  }

  /**
   * Convert to MIDI note number. Uses C4 = 60 convention.
   */
  public toMidi(): number {
    const semitone = Note.semitoneIndex(this.name);
    return (this.octave + 1) * 12 + semitone;
  }

  /**
   * Convert to specifier like "C4".
   */
  public toSpecifier(): string {
    return `${this.name}${this.octave}`;
  }

  /**
   * Create a Note from a specifier like "C4". Throws on invalid input.
   */
  public static fromSpecifier(spec: string): Note {
    const m = /^([A-G]#?)([1-6])$/.exec(spec.trim());
    if (!m) {
      throw new TypeError(`Invalid note specifier: ${spec}`);
    }
    const name = m[1] as NoteName;
    const octave = Number(m[2]);
    return new Note(name, octave);
  }

  /**
   * Convert this note to a frequency in Hz given reference A4 (default 440 Hz).
   */
  public toHz(a4 = 440): number {
    const midi = this.toMidi();
    return a4 * 2 ** ((midi - 69) / 12);
  }
}

export default Note;
