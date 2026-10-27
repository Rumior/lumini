# SECURITY_AUDIT
- CSRF protection on state-changing endpoints
- Session cookies httpOnly, sameSite=lax
- Helmet, CORS configured
- Zod validation
- Rate limiting present
- Tenant isolation via withTenantTransaction + RLS
- Membership recheck in transaction
- Secrets server-side only
- Parameterized queries