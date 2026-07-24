# Role-based access control

Permissions are database records connected to roles through `role_permissions` and users through `user_roles`. Routes request permission codes through `require_permission`; they do not contain role-name checks.

Seed roles are Super Admin, SCRB Admin, District Admin, Investigation Officer, Analyst and Read-Only Auditor. Seed permission codes cover FIR viewing/search, case creation/editing, report export, analytics, AI access, user/role management, audit viewing and system configuration. Administrators may change role-permission assignments without rewriting protected routes.

Permission denial returns 403 and produces an audit event with user, route, method, IP, user agent and request ID.
