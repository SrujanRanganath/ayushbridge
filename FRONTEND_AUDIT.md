FRONTEND AUDIT — client/src

Summary
- React + TypeScript frontend (Vite). Uses @tanstack/react-query, react-router-dom, TailwindCSS, axios.
- Central axios instance present at `client/src/services/api.ts` but several services bypass it.
- React Query configured in `client/src/main.tsx` and used in pages.

Per-file analysis

- client/src/vite-env.d.ts
  1. Purpose: Type hints for Vite environment.
  2. Used by: TypeScript compiler only.
  3. Depends on: None.
  4. Status: Working.
  5. Bugs: None.
  6. Production risks: None.

- client/src/App.tsx
  1. Purpose: Route definitions and top-level router.
  2. Used by: `main.tsx`.
  3. Depends on: pages and `RootLayout`.
  4. Status: Working.
  5. Bugs: None observed.
  6. Production risks: None.

- client/src/main.tsx
  1. Purpose: Application bootstrap and React Query provider.
  2. Used by: app entry.
  3. Depends on: `App.tsx`, `index.css`.
  4. Status: Working.
  5. Bugs: None.
  6. Production risks: None.

- client/src/index.css
  1. Purpose: Tailwind imports and base CSS.
  2. Used by: entire frontend.
  3. Depends on: tailwind build.
  4. Status: Working.
  5. Bugs: None.
  6. Production risks: None.

- client/src/services/api.ts
  1. Purpose: Centralized axios instance with baseURL, auth/request and response interceptors.
  2. Used by: `LoginPage.tsx` and intended for all service clients.
  3. Depends on: `localStorage` token conventions.
  4. Status: Working.
  5. Bugs: None in file; inconsistent usage by other service files reduces effectiveness.
  6. Production risks: Some services bypass this instance, risking missing Authorization header handling and unified error handling.

- client/src/services/searchService.ts
  1. Purpose: Exposes `searchNAMASTECodes(q)` -> GET `/search?q=` using `api` instance.
  2. Used by: `SearchPage.tsx`.
  3. Depends on: `client/src/services/api.ts` and backend `/api/v1/search` contract.
  4. Status: Working.
  5. Bugs: None.
  6. Production risks: None beyond normal API contract assumptions.

- client/src/services/mappingService.ts
  1. Purpose: `mapNAMASTECode(namasteCode, conditionName)` POST to `/map`.
  2. Used by: `MappingPage.tsx` (via React Query).
  3. Depends on: backend `/api/v1/map` response shape.
  4. Status: Partially working.
  5. Bugs:
     - Uses raw `axios.post('http://localhost:5000/api/v1/map')` (bypasses `api` instance), so it does not inherit auth interceptors or baseURL configuration.
     - Type `MappingResult` expects fields `icdCode`/`icdTitle` but backend returns `icd11Code`/`icd11Title` (field mismatch).
  6. Production risks: Unauthorized calls if token required, runtime undefined fields in UI leading to incorrect displays.

- client/src/services/fhirService.ts
  1. Purpose: `generateFHIRBundle` posts to `/fhir/bundle`.
  2. Used by: `MappingPage.tsx` (mutation) and possibly other pages.
  3. Depends on: backend `/api/v1/fhir/bundle` contract.
  4. Status: Partially working.
  5. Bugs: Uses raw axios URL (bypasses `api` instance). No typed response; returns `any`.
  6. Production risks: Missing auth propagation and inconsistent error handling.

- client/src/services/dashboardService.ts
  1. Purpose: `fetchDashboard()` -> GET `/api/v1/dashboard` and normalize to `DashboardResponse`.
  2. Used by: `DashboardPage.tsx`.
  3. Depends on: backend `/api/v1/dashboard` contract.
  4. Status: Partially working.
  5. Bugs: Frontend expects `recentMappings`/`recentBundles` arrays, but server returns paginated `{ mappings: {data,...}, bundles: {data,...} }` — mismatch will cause runtime errors.
  6. Production risks: UI breakage and missing data presentation.

- client/src/components/ProtectedRoute.tsx
  1. Purpose: Route protection wrapper; redirects to `/login` when unauthenticated.
  2. Used by: `App.tsx` for protected routes.
  3. Depends on: `useAuth` hook.
  4. Status: Working.
  5. Bugs: None.
  6. Production risks: None beyond relying on correct token storage.

- client/src/components/Navbar.tsx
  1. Purpose: Top navigation bar with auth actions.
  2. Used by: `RootLayout.tsx`.
  3. Depends on: `useAuth` hook and `react-router` navigation.
  4. Status: Working.
  5. Bugs: None.
  6. Production risks: None.

- client/src/types/index.ts
  1. Purpose: Shared TypeScript types (NAMASTECode, User, MappingJob, BundleMetadata).
  2. Used by: multiple pages and services.
  3. Depends on: none.
  4. Status: Working.
  5. Bugs: Some type definitions don't fully match backend field names (e.g., bundle metadata vs server FHIR bundle shape).
  6. Production risks: Type confusion leading to runtime mismatch.

- client/src/layouts/RootLayout.tsx
  1. Purpose: App shell containing Navbar and Outlet.
  2. Used by: `App.tsx`.
  3. Depends on: `Navbar`.
  4. Status: Working.
  5. Bugs: None.
  6. Production risks: None.

- client/src/hooks/useAuth.ts
  1. Purpose: Local auth management (localStorage token/user), login/logout helpers.
  2. Used by: `Navbar`, `ProtectedRoute`, `LoginPage`.
  3. Depends on: `localStorage` conventions.
  4. Status: Working.
  5. Bugs: No refresh-token handling; `isAuthenticated` checks only `user` state (not token expiry).
  6. Production risks: Token expiry not handled causing silent logout or invalid sessions.

- client/src/pages/SearchPage.tsx
  1. Purpose: Search UI; queries `/search` via `searchService` and navigates to mapping for selection.
  2. Used by: user navigation.
  3. Depends on: `searchService`, React Query and routing.
  4. Status: Working.
  5. Bugs: None in implementation; ensure backend search returns expected fields.
  6. Production risks: User experience depends on backend search latency; no pagination controls.

- client/src/pages/RegisterPage.tsx
  1. Purpose: Registration form (UI-only) — uses no API call (form `onSubmit` prevents default).
  2. Used by: routing.
  3. Depends on: none.
  4. Status: Dummy/mock.
  5. Bugs: Form does not call backend `/auth/register` — unimplemented.
  6. Production risks: UX misleading; users cannot actually register.

- client/src/pages/MappingPage.tsx
  1. Purpose: Mapping UI; auto-invokes mapping service when a NAMASTE term is selected; shows mapping result and FHIR bundle generation action.
  2. Used by: route `/mapping` and `SearchPage` via navigation state.
  3. Depends on: `mappingService`, `fhirService`, React Query, Router state/sessionStorage.
  4. Status: Partially working.
  5. Bugs:
     - Relies on `mappingService` field names `icdCode`/`icdTitle` but backend returns `icd11Code`/`icd11Title` — inconsistent usage in the file (`mappingResult.icdCode` used in bundleMutation while map returns `icd11Code`). This causes potential runtime errors.
     - Uses `bundleMutation.status === 'pending'` (react-query v5 uses `status` values like 'pending' — OK), but no explicit error handling UI for mutation failures besides console.error.
     - Contains hardcoded sample `mappings` array used as UI data (mocked) — acceptable for demo but not real data.
  6. Production risks: Mapping display may show `undefined` for ICD fields; FHIR generation may fail silently if mapping fields mismatch.

- client/src/pages/LoginPage.tsx
  1. Purpose: Login form; posts to `/auth/login` via centralized `api` instance.
  2. Used by: routing.
  3. Depends on: `api` and `useAuth` hook.
  4. Status: Working.
  5. Bugs: None; error handling displays `err.message` which may be generalized by `api` interceptor.
  6. Production risks: No brute-force protections client-side; relies on backend.

- client/src/pages/DashboardPage.tsx
  1. Purpose: Dashboard UI; expects `fetchDashboard()` to supply `recentMappings` and `recentBundles` arrays.
  2. Used by: routing.
  3. Depends on: `dashboardService`.
  4. Status: Partially working.
  5. Bugs: Frontend expects `recentMappings`/`recentBundles` but backend returns paginated `mappings`/`bundles` object shape — mismatch.
  6. Production risks: Dashboard will show empty/missing data or runtime errors.

- client/src/pages/BundleViewerPage.tsx
  1. Purpose: Display FHIR bundle passed via Router state; allow download/copy.
  2. Used by: `MappingPage` navigation on bundle generation.
  3. Depends on: router state and returned bundle structure.
  4. Status: Working (as viewer) but dependent on correct bundle shape.
  5. Bugs: Assumes `bundle.entry` exists; safe defaults exist but metadata mapping can be imprecise.
  6. Production risks: If backend changes bundle shape, viewer may show inaccurate metadata.

Conclusions & Recommendations (frontend)
- Critical fixes:
  - Normalize API usage: update `mappingService.ts` and `fhirService.ts` and `dashboardService.ts` to use `api` instance (ensures auth and consistent baseURL/error handling).
  - Align types and response normalization in services: map backend `icd11Code`/`icd11Title` and dashboard pagination to frontend expected shapes.
- Medium:
  - Implement real register call in `RegisterPage`.
  - Add retry/backoff and better error UI for mutations (bundle generation).
- Long-term:
  - Add e2e tests for the mapping flow, and snapshot tests for `BundleViewerPage`.

Generated from repository inspection on 2026-06-15
