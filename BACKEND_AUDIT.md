BACKEND AUDIT — server/src

Summary
- Express + TypeScript backend using Mongoose, zod validation, winston logging.
- Routes mounted under `/api/v1/*` in `server/src/index.ts`.
- JWT `protect` middleware applied to most routes.

Per-file analysis

- server/src/index.ts
  1. Purpose: App bootstrap, middleware, route mounting, DB connection.
  2. Used by: app start.
  3. Depends on: route modules, `protect` middleware, logger, env variables.
  4. Status: Working.
  5. Bugs: None in file. Relies on `process.env.MONGODB_URI` and `JWT_SECRET` being present; no graceful retry for DB.
  6. Production risks: No clustering, no graceful shutdown logic, no metrics/health beyond /api/health.

- server/src/utils/logger.ts
  1. Purpose: Central winston logger with Console and File transports.
  2. Used by: server files for logging.
  3. Depends on: filesystem path for logs directory.
  4. Status: Working.
  5. Bugs: Writes to `logs/` path; ensure folder exists and rotation configured.
  6. Production risks: No log rotation, potential disk growth; file permissions not enforced.

Models

- server/src/models/FHIRBundle.ts
  1. Purpose: Persist generated FHIR bundles and metadata.
  2. Used by: `/fhir` route and `/dashboard` route.
  3. Depends on: Mongoose.
  4. Status: Working.
  5. Bugs: `bundleJSON` stored as mixed with no validation; `auditLog` is free text.
  6. Production risks: Storing PII without encryption; lack of schema validation permits malformed bundles.

- server/src/models/AyurvedicEnrichment.ts
  1. Purpose: Store enrichment rows from CSV.
  2. Used by: `/enrich` route and ingest script.
  3. Depends on: Mongoose.
  4. Status: Working.
  5. Bugs: None.
  6. Production risks: Text index is present; consider field limits for long text.

- server/src/models/ICD11Code.ts
  1. Purpose: ICD-11 code repository used for text search.
  2. Used by: `/map` route, ingestion script.
  3. Depends on: ingest scripts.
  4. Status: Working.
  5. Bugs: None.
  6. Production risks: Large dataset — ensure indexes and sharding strategy when scaling.

- server/src/models/ICD11Mapping.ts
  1. Purpose: Cache namaste->icd11 mappings.
  2. Used by: `/map`, `/dashboard` routes.
  3. Depends on: none beyond Mongoose.
  4. Status: Working.
  5. Bugs: `namasteCode` unique constraint prevents multiple mappings or history tracking.
  6. Production risks: No provenance (who created mapping), inability to store multiple candidate mappings per NAMASTE code.

- server/src/models/User.ts
  1. Purpose: User accounts.
  2. Used by: `/auth` route.
  3. Depends on: none beyond Mongoose and bcrypt in routes.
  4. Status: Working.
  5. Bugs: No email verification, no indices beyond unique email.
  6. Production risks: No password policy enforcement server-side beyond length.

- server/src/models/NAMASTECode.ts
  1. Purpose: Holds NAMASTE terminology dataset.
  2. Used by: `/search` route, ingestion scripts.
  3. Depends on: ingest scripts.
  4. Status: Working.
  5. Bugs: None.
  6. Production risks: Large collection size impacts text search; need query optimization.

Scripts

- server/src/scripts/ingestEnrichment.ts
  1. Purpose: Load `data/ayurvedic_enrichment.csv` into DB.
  2. Used by: initial data population.
  3. Depends on: `data/` CSV being present and valid.
  4. Status: Working.
  5. Bugs: Parsing uses simplistic CSV regex — may fail on complex quoted fields; uses insertMany with ordered:false so duplicates skipped.
  6. Production risks: Missing validation on imported text.

- server/src/scripts/ingestData.ts
  1. Purpose: Ingest NAMASTE CSVs into `NAMASTECode` collection.
  2. Used by: initial data population.
  3. Depends on: CSV file names in `data/` folder.
  4. Status: Working.
  5. Bugs: Mapping functions assume specific CSV headers; brittle if CSV schema changes.
  6. Production risks: Import failures could result in partial datasets.

- server/src/scripts/ingestICD11.ts
  1. Purpose: Ingest `ICD-11.csv` into `ICD11Code` collection.
  2. Used by: initial data population.
  3. Depends on: `data/ICD-11.csv`.
  4. Status: Working.
  5. Bugs: None obvious.
  6. Production risks: Large CSV ingestion needs batching and monitoring.

Middleware & Routes

- server/src/middleware/auth.ts
  1. Purpose: JWT `protect` middleware extracting `userId` and `userRole`.
  2. Used by: most protected routes as applied in `index.ts`.
  3. Depends on: `JWT_SECRET` env var.
  4. Status: Working.
  5. Bugs: No token refresh support, no role-check helpers (RBAC must be added separately).
  6. Production risks: No centralized error codes or consistent unauthorized responses beyond 401 messages.

- server/src/routes/search.ts
  1. Purpose: GET `/api/v1/search` text-search NAMASTECode.
  2. Used by: `SearchPage`.
  3. Depends on: text-index on `NAMASTECode`.
  4. Status: Working.
  5. Bugs: No pagination; only returns top 10.
  6. Production risks: Unbounded text queries might be abused; add rate limiting per IP.

- server/src/routes/map.ts
  1. Purpose: POST `/api/v1/map` — return cached mapping or find best ICD11 match and cache it.
  2. Used by: `MappingPage`.
  3. Depends on: `ICD11Mapping`, `ICD11Code` text index.
  4. Status: Working.
  5. Bugs:
     - Cached `confidence` is hardcoded to `0.85` for new entries.
     - Returns `icd11Code`/`icd11Title` field names which mismatch some frontend expectations.
     - No provenance data (who/when/why) stored beyond `cachedAt`.
  6. Production risks: Hardcoded confidence misleads users; unique `namasteCode` prevents tracking mapping history; lack of verification.

- server/src/routes/fhir.ts
  1. Purpose: POST `/api/v1/fhir/bundle` — construct FHIR Bundle and persist.
  2. Used by: `MappingPage` and `BundleViewerPage`.
  3. Depends on: `FHIRBundle` model.
  4. Status: Working.
  5. Bugs:
     - Bundle assembled in code with no FHIR schema validation.
     - Provenance `target` references a `Condition/condition-<timestamp>` but `Condition` id used in bundle uses a different generated id, leading to mismatch.
  6. Production risks: Non-compliant FHIR bundles, inconsistent resource id references, storing PII without access controls.

- server/src/routes/dashboard.ts
  1. Purpose: GET `/api/v1/dashboard` returns paginated `mappings` & `bundles`.
  2. Used by: `DashboardPage`.
  3. Depends on: `ICD11Mapping`, `FHIRBundle`.
  4. Status: Working.
  5. Bugs: Response shape is paginated `mappings`/`bundles` objects; frontend expects `recentMappings`/`recentBundles` arrays — mismatch.
  6. Production risks: Unauthorized data exposure if RBAC absent.

- server/src/routes/enrich.ts
  1. Purpose: GET enrichment data by `conditionName`.
  2. Used by: enrichment UI (not present) and scripts.
  3. Depends on: `AyurvedicEnrichment` text index.
  4. Status: Working.
  5. Bugs: None obvious.
  6. Production risks: Text search accuracy and potential for stale data.

- server/src/routes/auth.ts
  1. Purpose: User registration and login; bcrypt password hashing and JWT issuance.
  2. Used by: `LoginPage` and intended `RegisterPage`.
  3. Depends on: `User` model, `JWT_SECRET`.
  4. Status: Working.
  5. Bugs: No email verification, no account locking, no refresh tokens.
  6. Production risks: Account takeover risk if password policies and verification not enforced.

Conclusions & Recommendations (backend)
- Critical fixes:
  - Remove hardcoded confidence and record mapping provenance with userId and method.
  - Add FHIR schema validation and ensure resource id references in bundles are consistent.
  - Align API response shapes with frontend expectations or publish OpenAPI and versioned APIs.
- Medium:
  - Add role-based access control for sensitive endpoints and per-endpoint rate limits.
  - Add log rotation, health checks, graceful shutdown.
- Long-term:
  - Add metrics, request tracing, and automated FHIR conformance tests.

Generated from repository inspection on 2026-06-15
