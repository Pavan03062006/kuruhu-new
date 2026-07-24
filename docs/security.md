# Authentication security decisions

- Argon2id stores credentials; plaintext credentials and reset tokens are never persisted.
- JWTs require issuer, audience, type, expiry, issued-at, subject and JTI claims.
- Refresh JWT hashes, rotation families and revocation timestamps are stored server-side.
- Redis limits login attempts per source IP; database counters enforce per-account lockout.
- Request IDs, restrictive browser headers, strict CORS and structured audit events provide defense in depth.
- Cookie authentication requires double-submit CSRF validation for refresh, logout, password change and admin mutations.
- Production refuses the default JWT secret. Secrets belong in the approved secret manager.
- Forgot-password responses do not reveal account existence. Reset-token delivery must use an approved secure channel; only its hash is stored.

Run the focused checks with `pytest backend/tests/test_auth_security.py backend/tests/test_rbac.py` and `ruff check backend/app/modules/auth backend/app/models/auth.py backend/app/core/security_middleware.py`.
