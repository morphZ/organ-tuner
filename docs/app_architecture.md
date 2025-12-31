# App directory — Architecture overview

Purpose
- The `app` folder contains the UI and app-level configuration for the Nuxt-style site: root app entry, global error handling, layouts, pages (routes), components, composables, shared utils, types, and assets.

Entry & config
- `app.vue` — root application wrapper providing global providers and mounting point for pages.
- `app.config.ts` — app-level configuration used by the framework (routes, meta, runtime config hooks, etc.).
- `error.vue` — global error page used for uncaught errors and SSR failures.

Layouts
- `layouts/default.vue` — primary page chrome (header, nav, global slots) used by pages unless overridden.

Pages & routing
- `pages/` maps filesystem routes to UI routes:
  - Top-level: `index.vue`, `customers.vue`, `inbox.vue`, `settings.vue`.
  - Nested settings: `pages/settings/index.vue`, `members.vue`, `notifications.vue`, `security.vue` (grouped, nested route structure and layout reuse).

Components
- Global/utility components: `NotificationsSlideover.vue`, `TeamsMenu.vue`, `UserMenu.vue`.
- Feature folders:
  - `customers/` — `AddModal.vue`, `DeleteModal.vue` (CRUD modals scoped to customers feature).
  - `home/` — widgets and charts: `HomeChart.client.vue`, `HomeChart.server.vue` (explicit client/server split), `HomeDateRangePicker.vue`, `HomePeriodSelect.vue`, `HomeSales.vue`, `HomeStats.vue`.
  - `inbox/` — `InboxList.vue`, `InboxMail.vue`.
  - `settings/` — `MembersList.vue`.
- Note: Single-file components (SFCs) used throughout; `.client` / `.server` suffixes indicate SSR/hydration decisions for performance.

Composables & utils
- `composables/useDashboard.ts` — Composition API logic for dashboard state and reactivity.
- `utils/index.ts` — shared helper functions and small utilities used across components/pages.

Types
- `types/index.d.ts` — shared TypeScript types / ambient declarations for the app.

Assets
- `assets/css/main.css` — global CSS imported by `app`/layout.

Patterns & concerns
- Feature-organized components make features self-contained and maintainable.
- Composition API + composables for shared logic; utilities for pure helpers.
- Client/server component splitting in `home` indicates careful SSR/hydration and performance concerns (render charts server-side or hydrate client-side as appropriate).
- Nested `settings` pages imply grouped routes and possible per-section state or nested layouts.

Next steps (suggested)
- Confirm auto-import/global registration behavior for components and composables in the Nuxt config.
- Verify hydration/SSR behavior for `.client` / `.server` chart components and data fetching patterns.
