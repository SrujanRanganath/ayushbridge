CLINICAL READINESS AUDIT — FHIR & Clinical Safety

Scope
- Evaluates FHIR bundle generation, provenance, mapping integrity and clinical risks of automated mapping.

Findings

1) FHIR Bundle Construction
- Bundles are constructed in `server/src/routes/fhir.ts` as JS objects and saved to DB.
- No FHIR schema validation or use of a FHIR SDK / library.
- Provenance resource present but contains static `who` and may reference mismatched resource ids.
- Risk: Bundles may be non-conformant to target FHIR profiles leading to rejection by downstream systems.

2) Patient Identity & Consent
- API accepts arbitrary `patientId` string — no check for patient existence or consent.
- Risk: Creating bundles for non-consented or non-existent patients; potential privacy violations.

3) Mapping Integrity
- `/map` route searches ICD11 local DB and caches best result with hardcoded confidence (0.85).
- No machine-learned confidence, human review workflow, or multiple candidate results returned.
- Risk: Incorrect clinical mappings at scale; over-reliance on automated mapping may cause clinical misclassification.

4) Provenance & Auditability
- `FHIRBundle.auditLog` stores a free-text message; no structured actor identity (userId) recorded.
- Risk: Traceability gaps — cannot reliably determine who generated or approved a bundle.

5) Clinical Safety Controls
- No review/approval workflow implemented for automated mappings.
- No flagging for low-confidence mappings or human-in-the-loop verification.
- Risk: Unsafe automation for clinical reporting or billing.

Recommendations
- Add FHIR validation step before persisting/returning bundles (use HAPI-FHIR validator or a JSON schema for FHIR R4/R4B).
- Require explicit user identity and consent when `patientId` is provided; verify patient exists in source system.
- Replace hardcoded confidence with a calibrated metric or provide multiple matches with confidence scores and require human verification for < threshold.
- Include structured provenance (userId, role, timestamp, operation) in both bundle `Provenance` resource and `FHIRBundle.auditLog`.
- Implement clinical review workflows, acceptance criteria, and a manual override before exporting bundles to external systems.

Generated from repository inspection on 2026-06-15
