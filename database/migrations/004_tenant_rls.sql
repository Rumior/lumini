-- Lumini tenant isolation phase 1.
-- Run this migration as the database owner/admin, NOT as lumini_runtime_rls.
-- This migration intentionally does not enable RLS on users, organizations,
-- organization_members, or session. Those tables need separate policy designs.

BEGIN;

-- The function is SECURITY DEFINER so its membership lookup is not subject to
-- the tenant-table policies. It only answers whether the transaction's
-- authenticated app.user_id has an active membership in the given org.
CREATE OR REPLACE FUNCTION public.lumini_is_active_org_member(p_organization_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members AS om
    WHERE om.organization_id = p_organization_id
      AND om.user_id::text = NULLIF(current_setting('app.user_id', true), '')
      AND om.status = 'active'
  );
$function$;

REVOKE ALL ON FUNCTION public.lumini_is_active_org_member(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lumini_is_active_org_member(uuid) TO lumini_runtime_rls;

-- Workspaces, businesses and audit events are tenant-owned by organization_id.
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lumini_workspaces_tenant_isolation ON public.workspaces;
CREATE POLICY lumini_workspaces_tenant_isolation
ON public.workspaces
FOR ALL
TO lumini_runtime_rls
USING (
  organization_id::text = NULLIF(current_setting('app.organization_id', true), '')
  AND public.lumini_is_active_org_member(organization_id)
)
WITH CHECK (
  organization_id::text = NULLIF(current_setting('app.organization_id', true), '')
  AND public.lumini_is_active_org_member(organization_id)
);

DROP POLICY IF EXISTS lumini_businesses_tenant_isolation ON public.businesses;
CREATE POLICY lumini_businesses_tenant_isolation
ON public.businesses
FOR ALL
TO lumini_runtime_rls
USING (
  organization_id::text = NULLIF(current_setting('app.organization_id', true), '')
  AND public.lumini_is_active_org_member(organization_id)
)
WITH CHECK (
  organization_id::text = NULLIF(current_setting('app.organization_id', true), '')
  AND public.lumini_is_active_org_member(organization_id)
);

DROP POLICY IF EXISTS lumini_audit_events_tenant_isolation ON public.audit_events;
CREATE POLICY lumini_audit_events_tenant_isolation
ON public.audit_events
FOR ALL
TO lumini_runtime_rls
USING (
  organization_id IS NOT NULL
  AND organization_id::text = NULLIF(current_setting('app.organization_id', true), '')
  AND public.lumini_is_active_org_member(organization_id)
)
WITH CHECK (
  organization_id IS NOT NULL
  AND organization_id::text = NULLIF(current_setting('app.organization_id', true), '')
  AND public.lumini_is_active_org_member(organization_id)
);

COMMIT;
