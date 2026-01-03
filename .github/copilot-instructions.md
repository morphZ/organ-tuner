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

Whenever you add code, first state which layer you are working in and keep code appropriate to that layer.[1][2]

### 2. UI: always use Nuxt UI components

This project uses **Nuxt UI** for all visible UI elements.[3]

- Do **not** use raw HTML controls like `<button>`, `<input>`, `<select>`, `<textarea>` in new code, unless explicitly asked for a bare HTML example.
- Prefer:
  - `<UButton>` instead of `<button>`
  - `<UInput>` instead of `<input type="text">`
  - `<UTextarea>` instead of `<textarea>`
  - `<USelectMenu>` instead of `<select>`
  - `<URadioGroup>` instead of groups of `<input type="radio">`
  - `<USwitch>` instead of `<input type="checkbox">` for toggles
  - Other components from https://ui.nuxt.com/docs/components for layout, cards, forms, dialogs, etc.[3]
- When refactoring existing components that use native elements, suggest and use the matching Nuxt UI replacements.
- When generating templates, assume `Nuxt UI` is available and preferred.

When you propose a raw HTML element in a component or page, immediately replace it with the appropriate Nuxt UI component.

Add this section to your existing Copilot project instructions (right after the Nuxt UI part).

***

### 2b. Styling: use Tailwind CSS utility classes

This project uses **Tailwind CSS** for styling, together with Nuxt UI.[1][2][3]

- Prefer Tailwind utility classes over ad‑hoc CSS:
  - Use classes like `flex`, `items-center`, `justify-between`, `gap-2`, `p-4`, `rounded-lg`, `border`, `text-sm`, `font-medium`, `bg-primary-500`, etc.
  - Use responsive and state variants where appropriate, e.g. `md:flex-row`, `hover:bg-primary-600`, `focus-visible:ring-2`.
- When generating templates with Nuxt UI components:
  - Apply Tailwind classes via the `class` attribute, for example:

    ```vue
    <UButton
      icon="i-heroicons-arrow-right"
      class="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium"
    >
      Next note
    </UButton>
    ```

  - Use Tailwind for layout containers:
    ```vue
    <div class="flex flex-col gap-4 max-w-xl mx-auto p-4">
      <TuningNavigation />
      <PitchDisplay />
    </div>
    ```

- Avoid:
  - Inline `style` attributes for anything non‑trivial.
  - New custom CSS rules unless Tailwind utilities or config extensions cannot express the design.
- When suggesting new UI:
  - Make it reasonably spaced and aligned using Tailwind (`gap-*`, `space-y-*`, `px/py`, `grid`, `flex`).
  - Keep class names consistent with a clean, minimal Tailwind style rather than overly long, repetitive chains.

Whenever you generate or modify a component or page, include appropriate Tailwind classes on Nuxt UI components and layout wrappers instead of relying on default browser styling.

### 3. Code quality & style

When generating or editing code:

- Use modern, **idiomatic** TypeScript:
  - Prefer `const` and `readonly` where possible.
  - Use explicit types for public APIs and return types.
  - Avoid `any`; prefer precise types and discriminated unions.
- Keep functions and classes small and focused (single responsibility).
- Fail fast: validate inputs and throw typed errors for impossible states.
- Add JSDoc or short comments only where behavior is non‑obvious.

For `core/`:

- Favor pure functions and immutable value objects.
- Avoid hidden state and side effects.
- Make algorithms deterministic and testable.[1]

### 4. TDD and tests for every change

For **every implementation or change**, generate or update tests:

- Use Vitest.
- Put tests:
  - For domain logic: `app/core/**/*.test.ts`.
  - For composables or components: in an appropriate `tests` location, using Nuxt/Vue testing utilities where needed.[4][5][6]
- When you create or change:
  - `Note`, temperament tables, workflows → update or add core tests.
  - Composables → unit tests on composable behavior (no DOM).
  - Components → light tests on inputs/outputs if needed; avoid brittle snapshots.

Test design:

- Cover:
  - Representative happy paths.
  - Edge cases and validation cases (invalid notes, out‑of‑range octaves, missing reference note, etc.).
- Use intention‑revealing `describe`/`it` names.
- Prefer direct assertions over snapshots.

Always include or update tests together with the implementation.

### 5. Running tests and checks

Assume scripts:

- `"test": "vitest"`
- `"lint": "eslint ."`
- `"typecheck": "nuxt typecheck"` or `"tsc --noEmit"`

When proposing changes, ensure the code is compatible with:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

When adding Git hooks or CI configs, wire them so tests and linting must pass before commits or pushes.[7][8][9]

### 6. Stepwise implementation plan

The project follows a numbered implementation plan (steps 1–11). For each task:

- State which step (and sub‑step) you are implementing.
- Match the described file paths, responsibilities, and acceptance criteria.
- Do **not** jump ahead; keep changes minimal and focused on the current step.

Example:  
For “Step 3 — `useTuning` composable”:

- Only bridge to existing core logic.
- Keep it free of audio/DOM.
- Use Nuxt UI only in components/pages that consume this composable, not inside the composable itself.
- Add or update tests for navigation and computed behavior.

### 7. Copilot completion behavior

When suggesting code:

- Prefer **small, incremental** changes.
- If a suggestion:
  - Breaks the layer rule,
  - Uses native HTML elements where Nuxt UI exists,
  - Adds `any` or weak types,
  - Omits tests,

  then correct and tighten it before presenting.

- When creating a new file:
  - Include correct imports/exports.
  - Include at least one corresponding test file or test case.
- When editing a file:
  - Align with existing Nuxt UI usage and project conventions.

### 8. Nuxt, Vue, and testing specifics

- Use Vue Composition API with `<script setup lang="ts">` for components and pages.
- Keep composables headless (no templates, no DOM).
- For tests that need Nuxt or Vue, follow Nuxt’s testing guidance with Vitest and `@vue/test-utils`.[5][6][10][4]
- For pure `core/` tests, use a simple node/jsdom environment without Nuxt helpers.