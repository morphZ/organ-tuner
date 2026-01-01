import { computed, ref } from 'vue';
import Note from '~/core/notes/Note';
import TuningWorkflow from '~/core/tuning/TuningWorkflow';
import type { TemperamentId, TuningMode } from '~/core/tuning/types';

export function useTuning() {
  const currentNote = ref(new Note('C', 4));
  const temperament = ref<TemperamentId>('equal');
  const mode = ref<TuningMode>('relative');
  const referenceNote = ref<Note | null>(null);
  const measuredHz = ref<number | null>(null);

  const workflow = computed(() => {
    return new TuningWorkflow(temperament.value, mode.value, referenceNote.value ?? undefined);
  });

  const pitchCents = computed<number | null>(() => {
    if (measuredHz.value == null) return null;
    try {
      return workflow.value.computeCentsDeviation(currentNote.value, measuredHz.value);
    } catch (_) {
      return null;
    }
  });

  function nextNote() {
    const names = Note.ALLOWED_NAMES;
    const idx = names.indexOf(currentNote.value.name);
    const nextIdx = (idx + 1) % names.length;
    currentNote.value = new Note(names[nextIdx], currentNote.value.octave);
  }

  function prevNote() {
    const names = Note.ALLOWED_NAMES;
    const idx = names.indexOf(currentNote.value.name);
    const prevIdx = (idx - 1 + names.length) % names.length;
    currentNote.value = new Note(names[prevIdx], currentNote.value.octave);
  }

  function nextOctave() {
    const next = Math.min(6, currentNote.value.octave + 1);
    currentNote.value = new Note(currentNote.value.name, next);
  }

  function prevOctave() {
    const prev = Math.max(1, currentNote.value.octave - 1);
    currentNote.value = new Note(currentNote.value.name, prev);
  }

  function setReferenceNote(note: Note | null) {
    referenceNote.value = note;
  }

  return {
    currentNote,
    temperament,
    mode,
    referenceNote,
    measuredHz,
    pitchCents,
    nextNote,
    prevNote,
    nextOctave,
    prevOctave,
    setReferenceNote,
  } as const;
}

export default useTuning;
