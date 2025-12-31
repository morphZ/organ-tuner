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

---

## Detailed implementation plan & tracking

This section turns the high-level steps above into an actionable checklist with file paths, acceptance criteria, and small sub-tasks so progress is easy to track. Each step is intentionally minimal so we can iterate safely.

Step 1 — Core: `Note` and types (pure TS)
- Files to add:
  - `app/core/notes/Note.ts`
  - `app/core/tuning/types.ts`
- Subtasks:
  - Implement `Note` class: constructor(name, octave), validate allowed names and octave range (1–6).
  - Methods: `toMidi(): number`, `toSpecifier(): string`, `static fromSpecifier(spec: string): Note`.
  - Export types in `types.ts`: `TemperamentId`, `TuningMode`, `TemperamentTable`.
- Acceptance: All code is framework-agnostic (no Vue imports). Unit tests later assert MIDI/specifier conversions.

Step 2 — Temperaments & workflow (pure TS)
- Files to add:
  - `app/core/tuning/Temperaments.ts`
  - `app/core/tuning/TuningWorkflow.ts`
- Subtasks:
  - Provide `EQUAL_TEMPERAMENT` table computed from MIDI → Hz (A4=440).
  - Stub `WERCKMEISTER_III` and `MEANTONE` as copies of equal (TODO to replace later).
  - Implement `TuningWorkflow` with `getReferenceHz(note)` and `computeCentsDeviation(note, measuredHz)`.
- Acceptance: `computeCentsDeviation` returns expected numeric results for known inputs (tested in Step 9).

Step 3 — `useTuning` composable (bridge)
- File to add:
  - `app/composables/useTuning.ts`
- Subtasks:
  - Expose `currentNote`, `temperament`, `mode`, `referenceNote`, `measuredHz` as `ref`s.
  - Provide `pitchCents` as `computed` using `TuningWorkflow`.
  - Add navigation helpers: `nextNote`, `prevNote`, `nextOctave`, `prevOctave` (clamped 1–6).
  - Keep composable free of DOM/audio APIs.
- Acceptance: Composable can be imported and used in a page to read reactive values.

Step 4 — Page wiring (`pages/index.vue`)
- File to edit:
  - `app/pages/index.vue`
- Subtasks:
  - Use `<script setup lang="ts">` and call `useTuning()`.
  - Render note specifier, nav buttons, and a text pitch display (dummy `measuredHz` initially).
  - Insert `PitchDisplay` and `TuningNavigation` later.
- Acceptance: Page renders without runtime errors in dev (static values visible).

Step 5 — `PitchDisplay` component
- File to add:
  - `app/components/tuning/PitchDisplay.vue`
- Subtasks:
  - Consume `useTuning()` and display `pitchCents` with basic color logic near zero.
  - Keep stateless.
- Acceptance: Visual indicator updates when `pitchCents` changes.

Step 6 — `TuningNavigation` component
- File to add:
  - `app/components/tuning/TuningNavigation.vue`
- Subtasks:
  - Render prev/next note and octave buttons using project UI kit or plain buttons.
  - Consume composable helpers to perform navigation.
- Acceptance: Buttons update `currentNote` in `useTuning`.

Step 7 — Mode & Temperament selectors
- Files to add:
  - `app/components/tuning/TuningModeSelector.vue`
  - `app/components/tuning/TemperamentSelector.vue`
- Subtasks:
  - Bind UI selects/radios to `mode` and `temperament` refs from `useTuning()`.
- Acceptance: Changing selectors updates the workflow computed value.

Step 8 — Audio composable and worklet placeholder
- Files to add:
  - `app/composables/useAudioPitch.ts`
  - `public/pitch-processor.js` (placeholder Worklet)
- Subtasks:
  - Provide `hz` ref and `start()`/`stop()` functions (mocked Hz initially).
  - Document how to wire a real AudioWorklet later.
- Acceptance: `hz` is reactive and can be watched; integration with `useTuning` shows changes in UI.

Step 9 — Core tests (Vitest)
- Files to add:
  - `app/core/notes/Note.test.ts`
  - `app/core/tuning/TuningWorkflow.test.ts`
- Subtasks:
  - Assert `toMidi()` / `fromSpecifier()` behavior and cents math.
  - Keep tests pure TS (no DOM).
- Acceptance: Tests run via `pnpm test` (adjust Vitest config if necessary).

Step 10 — Relative mode refinements
- Files to update:
  - `app/core/tuning/TuningWorkflow.ts`
  - `app/composables/useTuning.ts`
- Subtasks:
  - Ensure `relative` mode requires `referenceNote` and uses it to compute reference Hz.
  - Add `setReferenceNote` helper in composable and a page button to set it from `currentNote`.
- Acceptance: Relative mode computes deviations relative to chosen reference note.

Step 11 — Architecture doc
- File to add:
  - `app/ARCHITECTURE.md`
- Subtasks:
  - Describe the dependency rule and placement of core/composables/components.
  - Add a short diagram and examples of import paths.
- Acceptance: Developer-facing doc present in `app/`.

Tracking & workflow notes
- Work in small commits per step; run TypeScript checks and Vitest after adding core files.
- Verify editor/IDE resolves `~/core/...` imports; if not, add tsconfig paths or rely on Nuxt generated config.
- Audio worklet and microphone usage must be tested in browser — prepare stubbed implementations for local dev.

If you want, I can start implementing Step 1 now (create `Note.ts` and `types.ts`) and mark it in the todo list as in-progress. Reply with "start step 1" to begin, or tell me which step to start with.
