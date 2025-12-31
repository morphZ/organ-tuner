Start with a **very small core** and grow from there: one core module for tuning, one main composable, then wire it into a single page and only then refine modes/temperaments/UI. Below is a step-wise plan phrased so you can directly turn steps into Copilot prompts.

***

## 1. Core folder & basic Note value object

**Goal:** Introduce a minimal `core/` with a pure `Note` value object and a tuning config interface.

**Filesystem changes**

- Create: `app/core/notes/Note.ts`
- Create: `app/core/tuning/types.ts` (for shared types)

**Copilot prompt idea**

> Create `app/core/notes/Note.ts` with a pure `Note` value object for a single musical note. It should:
> - Be constructed from `name` and `octave` (`"C" | "C#"` etc., `number`).
> - Validate name and octave (allowed names array, octaves 1–6).
> - Provide methods:
>   - `toMidi(): number`
>   - `toSpecifier(): string` (e.g. `"C4"`)
>   - `static fromSpecifier(spec: string): Note`
> - Contain zero imports from Vue or Nuxt; pure TypeScript only.

Then:

> Create `app/core/tuning/types.ts` exporting:
> - `export type TemperamentId = 'equal' | 'werckmeister3' | 'meantone'`
> - `export type TuningMode = 'absolute' | 'relative'`
> - An interface `TemperamentTable { [midi: number]: number }` for mapping MIDI to Hz.

***

## 2. Core temperaments & tuning workflow (minimal)

**Goal:** Add a small core “service” that computes reference Hz and cent deviations, without any Vue.

**Filesystem changes**

- Create: `app/core/tuning/Temperaments.ts`
- Create: `app/core/tuning/TuningWorkflow.ts`

**Copilot prompt**

> In `app/core/tuning/Temperaments.ts`, implement:
> - `EQUAL_TEMPERAMENT: TemperamentTable` that computes Hz from MIDI using equal temperament with A4=440.
> - Stub tables for `WERCKMEISTER_III` and `MEANTONE` as simple copies of equal temperament for now (TODO comments for real values).

> In `app/core/tuning/TuningWorkflow.ts`, implement a class:
> ```ts
> export class TuningWorkflow {
>   constructor(
>     private readonly temperament: TemperamentId,
>     private readonly mode: TuningMode,
>     private readonly referenceNote?: Note
>   ) {}
> 
>   getReferenceHz(note: Note): number
>   computeCentsDeviation(note: Note, measuredHz: number): number
> }
> ```
> - `getReferenceHz`:
>   - If `mode === 'absolute'`, look up `note.toMidi()` in the chosen temperament table (start with equal only).
>   - If `mode === 'relative'`, use `referenceNote.toHz()`.
> - `computeCentsDeviation` uses `1200 * Math.log2(measuredHz / referenceHz)`.

Keep everything in `core/` pure (no DOM, no browser APIs).

---

## 3. Nuxt composable: useTuning

**Goal:** Bridge core to the Vue world with a single composable, living in `composables/`.

**Filesystem changes**

- Create: `app/composables/useTuning.ts`

**Copilot prompt**

> Create `app/composables/useTuning.ts` using the Composition API. It should:
> - Import `ref`, `computed` from `vue`.
> - Import `Note` from `~/core/notes/Note`.
> - Import `TuningWorkflow`, `TemperamentId`, `TuningMode` from `~/core/tuning/...`.
> - Expose:
>   - `currentNote: Ref<Note>` (default C4).
>   - `temperament: Ref<TemperamentId>` (default `'equal'`).
>   - `mode: Ref<TuningMode>` (default `'relative'`).
>   - `referenceNote: Ref<Note | null>` (default `null`).
>   - `measuredHz: Ref<number | null>` (will be filled from AudioWorklet later).
>   - `pitchCents: ComputedRef<number | null>` using `TuningWorkflow`.
>   - Navigation helpers:
>     - `nextNote()` / `prevNote()` (wrap within C–B, keep octave stable).
>     - `nextOctave()` / `prevOctave()` (clamp 1–6).
> - Internally create a `computed` `workflow` that reinstantiates `TuningWorkflow` whenever `temperament`, `mode`, or `referenceNote` changes.

> Ensure there are no direct audio or DOM calls in this composable – only state and pure core calls.

***

## 4. Basic tuning page wiring (`pages/index.vue`)

**Goal:** A single page that uses `useTuning` to display current note and pitch deviation, even before audio is wired.

**Filesystem changes**

- Edit: `app/pages/index.vue`

**Copilot prompt**

> Update `app/pages/index.vue` to:
> - Use `<script setup lang="ts">`.
> - Call `const { currentNote, pitchCents, nextNote, prevNote, nextOctave, prevOctave, temperament, mode } = useTuning()`.
> - Render:
>   - Current note label (e.g. `{{ currentNote.toSpecifier() }}`).
>   - Buttons for prev/next note and prev/next octave using Nuxt UI `UButton`.
>   - A simple text display for `pitchCents` (e.g. `"0.0 ct"` or `"–"` if null).
> - No audio yet, just static values (set `measuredHz` in the composable to a dummy value for now).

This gives you a working UI that exercises core + composable.

***

## 5. Pitch display component

**Goal:** Extract the pitch UI into a reusable component that reads from the composable.

**Filesystem changes**

- Create: `app/components/tuning/PitchDisplay.vue`

**Copilot prompt**

> Create `app/components/tuning/PitchDisplay.vue`:
> - `<script setup lang="ts">` imports `useTuning`.
> - Uses Nuxt UI `UProgress` or a simple `<div>` for now.
> - Shows:
>   - Label: `"{{ pitchCents }} ct"` or `"—"` if null.
>   - Optional color logic: green near 0, yellow/orange otherwise.
> - Do not hold its own state – only consume `useTuning()`.

Then wire it into `pages/index.vue`:

> Replace inline pitch display in `pages/index.vue` with `<PitchDisplay />` from `~/components/tuning/PitchDisplay.vue`.

***

## 6. Navigation component

**Goal:** Encapsulate the note navigation UI.

**Filesystem changes**

- Create: `app/components/tuning/TuningNavigation.vue`

**Copilot prompt**

> Create `app/components/tuning/TuningNavigation.vue`:
> - `<script setup lang="ts">` + `useTuning()`.
> - Renders:
>   - Prev/next note buttons (left/right arrows).
>   - Prev/next octave buttons (up/down or separate row).
>   - Central label showing current note (e.g. `"C4"`).
> - Use Nuxt UI `UButton` with icons from the default icon set.

Then:

> Use `<TuningNavigation />` in `pages/index.vue` above `<PitchDisplay />`.

***

## 7. Mode & temperament selectors

**Goal:** Let the user choose equal vs. later temperaments and absolute vs. relative mode.

**Filesystem changes**

- Create: `app/components/tuning/TuningModeSelector.vue`
- Create: `app/components/tuning/TemperamentSelector.vue`

**Copilot prompt**

> Create `TuningModeSelector.vue`:
> - Use `useTuning()` to access `mode`.
> - Render a `URadioGroup` or `USelectMenu` with options `'absolute'` and `'relative'`.
> - Bind `v-model="mode"`.

> Create `TemperamentSelector.vue`:
> - Use `useTuning()` to access `temperament`.
> - Render a `USelectMenu` with options `['equal', 'werckmeister3', 'meantone']`.
> - Bind `v-model="temperament"`.

Add both to `pages/index.vue` under the navigation.

***

## 8. Audio integration via a separate composable

**Goal:** Keep audio completely separate from tuning logic; feed `measuredHz` into `useTuning`.

**Filesystem changes**

- Create: `app/composables/useAudioPitch.ts`
- Create: `public/pitch-processor.js` (or similar AudioWorklet file, if not already there)

**Copilot prompt**

> Create `app/composables/useAudioPitch.ts`:
> - Manage `isActive: Ref<boolean>` and `hz: Ref<number | null>`.
> - Provide `start()` and `stop()` that:
>   - Request microphone via `getUserMedia`.
>   - Create `AudioContext` and connect to an `AudioWorkletNode` or basic analyser (dummy implementation first).
>   - Update `hz.value` periodically (for now, mock with a constant or random around 440 Hz).
> - No reference to `useTuning` here.

Then connect both composables:

> Update `useTuning` to accept an optional `externalHz?: Ref<number | null>` parameter, or:
> - In `pages/index.vue`, call both `useTuning()` and `useAudioPitch()`.
> - Use a watcher in the page to set `measuredHz.value = hz.value` from `useAudioPitch`.

Example glue:

```ts
const tuning = useTuning()
const audio = useAudioPitch()

watch(audio.hz, (value) => {
  tuning.measuredHz.value = value ?? null
})
```

***

## 9. Tests for core

**Goal:** Lock down the math before the UI grows.

**Filesystem changes**

- Create: `app/core/notes/Note.test.ts`
- Create: `app/core/tuning/TuningWorkflow.test.ts`

**Copilot prompt**

> Add Vitest tests for:
> - `Note.toMidi()` and `Note.fromSpecifier('C4')`.
> - `TuningWorkflow.computeCentsDeviation`:
>   - C4 vs equal temperament reference → ~0 ct.
>   - 10% higher frequency → positive cents.

Configure Vitest if not yet done, but keep core tests independent of Nuxt.

---

## 10. Refine modes & relative tuning

**Goal:** Implement the real “relative” mode (Principal as reference → Oboe).

**Filesystem changes**

- Update: `TuningWorkflow` and `useTuning`

**Copilot prompt**

> Extend `TuningWorkflow`:
> - In `relative` mode, require `referenceNote` in the constructor.
> - `getReferenceHz` uses `referenceNote.toHz(a440)` instead of a temperament table.
> - Add a guard that throws if `mode === 'relative'` and `referenceNote` is missing.

> Update `useTuning`:
> - Add `setReferenceNote(note: Note)` helper.
> - Expose `referenceNote` as ref.
> - Update `workflow` computed so that in `relative` mode, it passes the `referenceNote` into the constructor.

For UI:

> In `index.vue`:
> - Add a button “Set reference from current note” that calls `setReferenceNote(currentNote.value)`.

***

## 11. Clean up architecture docs

**Goal:** Document your solo-dev architecture (core, composables, frontend) for future you.

**Filesystem changes**

- Create: `app/ARCHITECTURE.md`

**Copilot prompt**

> Create `app/ARCHITECTURE.md` describing:
> - `core/` as pure domain & tuning logic (no Vue/Browser).
> - `composables/` as bridges between core and UI (stateful).
> - `components/` and `pages/` as pure presentation using composables.
> - A short dependency rule: components → composables → core, never the other way around.
