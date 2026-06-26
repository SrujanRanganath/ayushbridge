MASTER FIX PLAN — AyushBridge (prioritized phases)

Overview
This plan sequences work to move the repository from its current state toward production readiness. Tasks are ordered by risk and dependency; Phase 1 items are critical and should be implemented first.

Phase 1 - Critical Bugs (sprint 1)
- Normalize API contracts between frontend and backend:
  - Update `mappingService` response normalization to accept `icd11Code`/`icd11Title` OR update backend `/map` to return `icdCode`/`icdTitle` (pick one canonical contract).
  - Update `dashboardService` to accept paginated `{ mappings: { data, ... }, bundles: { data, ... } }` and normalize to frontend shape.
- Ensure all frontend service clients use the centralized `api` axios instance:
  - Replace direct `axios.post('http://localhost:5000...')` calls with `api.post(...)` in `mappingService`, `fhirService`, `dashboardService`.
- Fix FHIR Bundle resource id references in `/fhir/bundle` so Provenance.target matches the created Condition id.
- Stop hardcoding mapping `confidence`: set to `null` or compute a score, and store source details.
- Add basic server-side validation for required env vars at startup and fail fast if missing (`JWT_SECRET`, `MONGODB_URI`).

Phase 2 - Architecture Fixes (sprint 2)
- Implement structured audit trail for mappings and bundle generation, including userId, timestamp, and action type.
- Remove `namasteCode` unique constraint or add versioning/history collection for mapping changes.
- Add DB indexes: `FHIRBundle.generatedAt`, `ICD11Mapping.cachedAt`, `FHIRBundle.patientId`.
- Add graceful shutdown handling and health-check endpoints beyond `/api/health` (readiness/liveness probes).

Phase 3 - API Alignment (sprint 2-3)
- Draft and publish an OpenAPI spec covering `/auth`, `/search`, `/map`, `/fhir/bundle`, `/dashboard`, `/enrich`.
- Version APIs (v1 stable) and implement compatibility shims if changing response shapes.
- Add per-endpoint request limits and structured error codes (RFC 7807 style) for easier client handling.

Phase 4 - UI Redesign & UX (sprint 3)
- Replace `RegisterPage` placeholder with real registration flow and email verification UI.
- Improve mapping UI to show multiple candidates, confidence scores, and "Request review" CTA for low confidence.
- Add confirmation and PHI awareness flow before generating and exporting FHIR Bundles.
- Add loading skeletons and error states with actionable user guidance on Dashboard and Mapping pages.

Phase 5 - Production Hardening (sprint 4)
- Implement RBAC and enforce per-route authorization checks; limit `fhir/bundle` exports to appropriate roles.
- Introduce refresh tokens and session revocation mechanisms.
- Add field-level encryption or separate secure storage for PII in FHIR bundles.
- Configure logging rotation and integrate with a centralized logging/monitoring system (ELK, Datadog).
- Containerize services and add deployment manifests (Dockerfile, docker-compose, Kubernetes manifests) with secrets integration.

Phase 6 - Clinical Validation Preparation (sprint 5+)
- Integrate FHIR validation (HAPI-FHIR or JSON Schema) with a validation pipeline and reject non-conformant bundles.
- Implement a human-in-the-loop review process: show candidate mappings, allow annotators to accept/reject, and store reviewer metadata.
- Calibrate mapping confidence using annotated training data and add a CI job that runs mapping accuracy checks on sample sets.
- Document clinical acceptance criteria, audit procedures, and retention policies for generated bundles.

Quick win checklist (can be tackled within days)
- Switch mapping/fhir/dashboard services to use `api` instance.
- Normalize response fields in service layer (no immediate backend changes required).
- Add server startup checks for env variables.
- Add index on `FHIRBundle.generatedAt`.

Estimated timeline
- Critical bugfixes & normalization: 1–2 weeks
- Architecture and API alignment: 2–4 weeks
- UI improvements & UX: 2–3 weeks
- Production hardening & security: 3–6 weeks
- Clinical validation and compliance: ongoing (3+ months depending on regulatory needs)

Generated from repository inspection on 2026-06-15
