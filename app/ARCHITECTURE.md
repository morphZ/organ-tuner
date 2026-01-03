# App Architecture

Overview
- This app follows a strict layering:
  1. `core/` — pure TypeScript domain logic and algorithms (no Vue or browser APIs).
  2. `composables/` — Composition API bridges exposing reactive state and wiring core logic for the UI.
 3. `components/` and `pages/` — Presentation only; consume composables and render UI.

Dependency rule
- Always: components -> composables -> core
- Never: core -> composables/components or composables -> components

Conventions
- `app/core/*` contains pure modules: `notes`, `tuning` (types, workflow, temperament tables).
- `app/composables/*` exposes reactive state and helpers (e.g. `useTuning`, `useAudioPitch`).
- `app/components/*` contains SFCs that import composables; components should not import core directly unless necessary (prefer composables).
- Use `~/` imports for cross-folder references (e.g. `~/core/notes/Note`).

Testing
- Keep core tests pure and framework independent (Vitest, run with Node env).
- Composable/component tests can target Nuxt test environment when needed.

Notes
- Audio and browser APIs live in composables (`useAudioPitch`) or `public/` (AudioWorklet files).
- Keep `core/` code small and well-tested — any browser concerns should be handled in composables.
