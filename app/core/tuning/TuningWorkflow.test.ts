import { describe, expect, it } from 'vitest';
import Note from '~/core/notes/Note';
import TuningWorkflow from '~/core/tuning/TuningWorkflow';

describe('TuningWorkflow', () => {
  it('absolute mode: zero cents when measured equals reference', () => {
    const workflow = new TuningWorkflow('equal', 'absolute');
    const note = Note.fromSpecifier('C4');
    const refHz = workflow.getReferenceHz(note);
    const cents = workflow.computeCentsDeviation(note, refHz);
    expect(cents).toBeCloseTo(0, 6);
  });

  it('absolute mode: positive cents for 10% higher freq', () => {
    const workflow = new TuningWorkflow('equal', 'absolute');
    const note = Note.fromSpecifier('C4');
    const refHz = workflow.getReferenceHz(note);
    const measured = refHz * 1.1;
    const cents = workflow.computeCentsDeviation(note, measured);
    expect(cents).toBeGreaterThan(150);
    expect(cents).toBeLessThan(180);
  });

  it('relative mode uses referenceNote.toHz', () => {
    const refNote = Note.fromSpecifier('A4');
    const workflow = new TuningWorkflow('equal', 'relative', refNote);
    const note = Note.fromSpecifier('C4');
    const refHz = workflow.getReferenceHz(note);
    expect(refHz).toBeCloseTo(refNote.toHz(), 6);
  });
});
