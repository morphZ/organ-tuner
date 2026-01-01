import { describe, expect, it } from 'vitest';
import Note from '~/core/notes/Note';

describe('Note', () => {
  it('parses and formats specifier', () => {
    const n = Note.fromSpecifier('C4');
    expect(n.toSpecifier()).toBe('C4');
    expect(n.octave).toBe(4);
    expect(n.name).toBe('C');
  });

  it('toMidi for C4 equals 60', () => {
    expect(Note.fromSpecifier('C4').toMidi()).toBe(60);
  });

  it('toHz for A4 equals 440 Hz', () => {
    const a4 = Note.fromSpecifier('A4');
    expect(a4.toHz()).toBeCloseTo(440, 6);
  });
});
