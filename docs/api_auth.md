# Authentication API

All paths are under `/api/v1`.

| Method | Path | Protection |
|---|---|---|
| POST | `/auth/login` | Rate limited |
| POST | `/auth/request-otp` | Rate limited; five-minute Redis challenge |
| POST | `/auth/logout` | CSRF |
| POST | `/auth/refresh` | Refresh cookie + CSRF |
| POST | `/auth/change-password` | Authenticated + CSRF |
| POST | `/auth/forgot-password` | Generic response |
| POST | `/auth/reset-password` | One-time token |
| GET | `/users/me` | Authenticated |
| GET | `/roles` | Authenticated |
| GET | `/permissions` | Authenticated |
| PATCH | `/roles/{role_code}` | `roles:manage` + CSRF |
| GET | `/users` | `users:manage` |
| POST/PATCH/DELETE | `/users...` | `users:manage` + CSRF |

Login accepts `{identifier, credential, district, language, mode}` so the preserved mobile/OTP and PSN/PIN portal can select OTP or Argon2 verification. Production OTP and reset-token delivery must use the approved government messaging/identity provider.
