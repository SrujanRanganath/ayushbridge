SECURITY AUDIT — AyushBridge

Scope
- Examines server-side authentication, authorization, secrets management, transport, logging, and rate limiting based on repository code.

Findings

1) Authentication
- JWT-based auth implemented via `server/src/middleware/auth.ts` and issued in `server/src/routes/auth.ts`.
- Strengths: Passwords hashed with `bcryptjs`; JWT expiry set (7d).
- Weaknesses: No refresh token workflow, no single-session revoke table, no account verification.
- Risk: Long-lived tokens and lack of revocation create session takeover windows.

2) Authorization
- `protect` middleware only verifies token and extracts `role` into `req.userRole`.
- No RBAC enforcement applied in route handlers — endpoints like `/fhir/bundle`, `/dashboard`, `/map` accept any authenticated user.
- Risk: Unauthorized users could generate/export PHI bundles or view mappings.

3) Secrets & Configuration
- `JWT_SECRET` & `MONGODB_URI` read from env; code assumes presence but no checks or Key Vault integration.
- Risk: Secrets mismanagement in deployment could lead to leaks.

4) Transport & Network
- CORS configured in `index.ts` with `CLIENT_ORIGIN` defaulting to http://localhost:5173.
- No enforcement of TLS at app layer; rely on deployment termination.
- Risk: If deployed without TLS termination, tokens and PHI may be exposed in transit.

5) Rate limiting & DoS
- Global rate limiter (100 req / 15 minutes) present via `express-rate-limit`.
- No per-endpoint or per-user throttling for sensitive ops (e.g., `/auth`, `/fhir/bundle`).
- Risk: Abuse via burst requests; brute force on auth endpoint possible.

6) Logging & Audit
- Winston logger configured (console + file). Files located at `logs/error.log` and `logs/combined.log`.
- `FHIRBundle.auditLog` is a free-text field recorded at bundle creation, but no structured audit trail linking userId, ip, or action.
- Risk: Insufficient structured audit trails for forensic analysis; log retention/rotation not configured.

7) Data Protection
- Bundles stored as mixed JSON in DB with no field-level encryption or PIi redaction.
- No policy for data retention or archival.
- Risk: Storage of unencrypted PII and regulatory non-compliance (depending on jurisdiction).

8) Validation & Injection
- Zod used for input validation in routes — good practice.
- Some routes perform text search with user-supplied strings — ensure search input sanitization although MongoDB text search is less injection-prone than raw queries.

Recommendations
- Implement refresh tokens and a token revocation / session table.
- Add RBAC checks per-route and role-aware authorization middleware.
- Use managed secrets store (Azure Key Vault, AWS Secrets Manager) in production and fail fast if critical env vars missing.
- Harden rate limits per-endpoint and add IP-based throttling for auth endpoints.
- Encrypt sensitive fields in DB (`bundleJSON`, `patientId`) or store PHI in a secure vault.
- Add structured audit logs capturing userId, timestamp, action, IP, and resource id; integrate with SIEM.
- Enforce TLS at application layer or ensure deployment enforces TLS termination.

Generated from repository inspection on 2026-06-15
