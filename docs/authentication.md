# Authentication

PRAMAAN accepts the existing portal identifier/credential pairs and issues a 10-minute access JWT plus a seven-day rotating refresh JWT. Both are `HttpOnly`, `Secure` in production, and `SameSite=Strict`; a readable CSRF cookie must match `X-CSRF-Token` on authenticated mutations.

```mermaid
sequenceDiagram
  participant U as User
  participant W as Next.js
  participant A as FastAPI
  participant D as PostgreSQL
  U->>W: Existing login form
  W->>A: POST /auth/login
  A->>D: Verify Argon2 credential, account and roles
  A-->>W: Access + refresh + CSRF cookies
  W->>A: Protected request
  A-->>W: 401 when access expires
  W->>A: POST /auth/refresh + CSRF
  A->>D: Revoke old token and persist rotated token
  A-->>W: New cookie set
```

Reuse of a rotated/revoked refresh token revokes its entire token family. Password changes, resets, deactivation and logout invalidate applicable sessions. Five failed attempts lock an account for 30 minutes by default.

Migration: `cd backend && alembic -c alembic.ini upgrade head`.
