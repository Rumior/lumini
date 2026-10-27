# API_REFERENCE

## Auth
- GET /api/auth/csrf - Get CSRF token
- POST /api/auth/register - Register user
- POST /api/auth/login - Login
- POST /api/auth/logout - Logout (requires CSRF + auth)
- GET /api/auth/me - Get current session

## Organizations
- GET /api/organizations - List user's organizations
- POST /api/organizations - Create organization (requires CSRF)

## Workspaces
- GET /api/organizations/:organizationId/workspace - Get workspace
- PUT /api/organizations/:organizationId/workspace - Update workspace (requires CSRF, tenant-scoped)

## Health
- GET /api/health - Health check

All protected endpoints require session auth. State-changing endpoints require CSRF token.