## Copilot project instructions

You are pair‑programming in a Nuxt 3 + TypeScript project for an organ‑tuning tool. Follow these rules strictly.

### 1. Architecture & layering

- Respect the layering: **components → composables → core**, never the other way around.  
- `app/core/**`:
  - Pure TypeScript, framework‑agnostic.
  - No imports from `vue`, `nuxt`, browser APIs, or global DOM.
  - Only domain logic: tuning, music theory, numeric calculations, value objects.
- `app/composables/**`:
  - Bridge between core and Vue.
  - May use `ref`, `computed`, `watch` and Nuxt utilities.
  - No direct DOM manipulation, no UI code, no template strings.
- `app/components/**` and `app/pages/**`:
  - Presentation only.
  - Use `<script setup lang="ts">` and consume composables.
  - No business logic; push non‑trivial logic into core or composables.

Whenever you add code, first state which layer you are working in and keep code appropriate to that layer.

### 2. Code quality & style

When generating or editing code:

- Use modern, **idiomatic** TypeScript:
  - Prefer `const` and `readonly` where possible.
  - Use explicit types for public APIs and return types.
  - Avoid `any`; prefer precise types and discriminated unions.
- Keep functions and classes small and focused; apply SRP.
- Fail fast: validate inputs and throw typed errors for impossible states.
- Add JSDoc or short comments only where behavior is non‑obvious; do not narrate trivial code.
- Use clear, intention‑revealing names: `computeCentsDeviation`, not `doMath`.

For `core/`:

- Favor pure functions and immutable value objects.
- Avoid hidden state and side effects.
- Make algorithms deterministic and testable.

### 3. TDD and tests for every change

For **every implementation or change**, generate or update tests:

- Use Vitest for all tests.
- Put tests next to core files as `*.test.ts` in `app/core/**` for domain logic, or in an appropriate `tests/**` folder for composables/components.
- When you create or change:
  - `Note`, temperament tables, or tuning workflows → update `Note.test.ts`, `TuningWorkflow.test.ts`, or create new core tests.
  - Composables → write unit tests against composable functions (no DOM).
  - Components → only shallowly test props/emitted events if needed; avoid brittle snapshot tests.

Test design:

- Cover:
  - Happy path behavior with representative inputs.
  - Edge cases and validation failures (invalid note names, out‑of‑range octaves, missing referenceNote in relative mode, etc.).
- Use clear `describe` and `it` blocks with intention‑revealing test names.
- Prefer direct assertions on return values and state over snapshots.

Always show the tests together with the implementation and ensure they pass logically.

### 4. Running tests and checks

Assume the following scripts exist in `package.json`:

- `"test": "vitest"`  
- `"lint": "eslint ."`  
- `"typecheck": "nuxt typecheck"` or `"tsc --noEmit"`

When you propose changes:

- Indicate which commands the developer should run, typically:

  - `pnpm lint`  
  - `pnpm typecheck`  
  - `pnpm test`

- If adding new files or entry points, ensure imports and exports allow these commands to succeed (e.g., correct `~/core/...` paths, no DOM in node tests).

When adding Git hooks or CI config, wire them so that tests and linting must pass before merging or pushing (for example, Husky pre‑push hook running `pnpm lint && pnpm test`).[1][2][3]

### 5. Implementing from the stepwise plan

The project follows a numbered implementation plan (steps 1–11). For each Copilot task:

- Start by restating the exact step and sub‑step you are working on (e.g., “Step 2 — Temperaments & workflow (pure TS)”).
- Ensure the code matches the described file paths, responsibilities, and acceptance criteria in the plan.
- Do **not** jump ahead to later steps; keep each change minimal and focused.

Examples:

- When working on **Step 1**:
  - Implement `Note` and tuning `types` in `app/core/**` as pure TS.
  - Do not import Vue or touch any composables or pages.
  - Add or update core tests to cover MIDI/specifier conversions.

- When working on **Step 3** (`useTuning`):
  - Only bridge to existing core logic.
  - Keep it free of audio/DOM.
  - Add tests (where feasible) for navigation and computed behavior.

### 6. Copilot completion behavior

When Copilot suggests code in this repo:

- Prefer **small, incremental** edits that match the current step.
- If a suggestion violates:
  - The layering rule (core importing Vue, components doing domain logic),
  - The test‑with‑every‑change rule,
  - Or introduces `any` / weak typing,

  then revise the suggestion to comply before presenting it.

- When generating a file:
  - Include imports, exports, and types.
  - Add at least one corresponding test file or test case.
- When modifying a file:
  - Scan for opportunities to improve type safety and clarity while staying within the requested change.

### 7. Nuxt, Vue, and testing specifics

- Use the Vue Composition API (`ref`, `computed`, `watch`) with `script setup` in components and composables.
- Keep composables **headless**: manage state and logic only, no templates or direct DOM APIs.
- For tests that need Nuxt or Vue features, configure Vitest using Nuxt’s test utilities as recommended in the Nuxt docs.[4][5][6][7]
- For pure `core/` tests, use a plain `node` or `jsdom` environment and avoid Nuxt‑specific helpers.
