-- Reconstructed migration: Universal Project Core
-- Original deployment was applied in Supabase SQL Editor.
-- This file records the verified schema and security configuration.
-- Do not execute this reconstruction against the already-migrated database.

BEGIN;

-- 1. Extend existing businesses
ALTER TABLE public.businesses
    ADD COLUMN status text NOT NULL DEFAULT 'active';

ALTER TABLE public.businesses
    ADD CONSTRAINT businesses_status_check
    CHECK (status IN ('active', 'paused', 'attention', 'completed'));

ALTER TABLE public.businesses
    ADD CONSTRAINT businesses_workspace_id_id_key
    UNIQUE (workspace_id, id);

-- 2. Universal projects
CREATE TABLE public.projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    project_type text NOT NULL DEFAULT 'general',
    status text NOT NULL DEFAULT 'planned',
    start_date date,
    target_end_date date,
    actual_end_date date,
    progress numeric(5,2) NOT NULL DEFAULT 0,
    configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_by uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT projects_workspace_id_fkey
        FOREIGN KEY (workspace_id)
        REFERENCES public.workspaces(id) ON DELETE CASCADE,
    CONSTRAINT projects_workspace_id_id_key
        UNIQUE (workspace_id, id),
    CONSTRAINT projects_name_check
        CHECK (char_length(btrim(name)) BETWEEN 1 AND 200),
    CONSTRAINT projects_type_check
        CHECK (char_length(btrim(project_type)) BETWEEN 1 AND 80),
    CONSTRAINT projects_status_check
        CHECK (status IN ('planned', 'active', 'on_hold', 'completed', 'cancelled')),
    CONSTRAINT projects_progress_check
        CHECK (progress >= 0 AND progress <= 100),
    CONSTRAINT projects_dates_check
        CHECK (target_end_date IS NULL OR start_date IS NULL OR target_end_date >= start_date)
);

-- 3. Business team membership
CREATE TABLE public.business_members (
    workspace_id uuid NOT NULL,
    business_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'member',
    created_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT business_members_pkey
        PRIMARY KEY (workspace_id, business_id, user_id),
    CONSTRAINT business_members_business_fkey
        FOREIGN KEY (workspace_id, business_id)
        REFERENCES public.businesses(workspace_id, id) ON DELETE CASCADE,
    CONSTRAINT business_members_workspace_user_fkey
        FOREIGN KEY (workspace_id, user_id)
        REFERENCES public.workspace_members(workspace_id, user_id) ON DELETE CASCADE,
    CONSTRAINT business_members_role_check
        CHECK (role IN ('manager', 'member', 'viewer'))
);

-- 4. Project team membership
CREATE TABLE public.project_members (
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'member',
    created_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT project_members_pkey
        PRIMARY KEY (workspace_id, project_id, user_id),
    CONSTRAINT project_members_project_fkey
        FOREIGN KEY (workspace_id, project_id)
        REFERENCES public.projects(workspace_id, id) ON DELETE CASCADE,
    CONSTRAINT project_members_workspace_user_fkey
        FOREIGN KEY (workspace_id, user_id)
        REFERENCES public.workspace_members(workspace_id, user_id) ON DELETE CASCADE,
    CONSTRAINT project_members_role_check
        CHECK (role IN ('manager', 'member', 'viewer')),
    CONSTRAINT project_members_assignment_key
        UNIQUE (user_id, workspace_id, project_id)
);

-- 5. Link projects to businesses
CREATE TABLE public.project_businesses (
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    business_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT project_businesses_pkey
        PRIMARY KEY (workspace_id, project_id, business_id),
    CONSTRAINT project_businesses_project_fkey
        FOREIGN KEY (workspace_id, project_id)
        REFERENCES public.projects(workspace_id, id) ON DELETE CASCADE,
    CONSTRAINT project_businesses_business_fkey
        FOREIGN KEY (workspace_id, business_id)
        REFERENCES public.businesses(workspace_id, id) ON DELETE CASCADE
);

-- 6. Project tasks
CREATE TABLE public.tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    status text NOT NULL DEFAULT 'todo',
    priority text NOT NULL DEFAULT 'medium',
    start_date date,
    due_date date,
    completed_at timestamptz,
    assigned_to uuid,
    created_by uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT tasks_project_fkey
        FOREIGN KEY (workspace_id, project_id)
        REFERENCES public.projects(workspace_id, id) ON DELETE CASCADE,
    CONSTRAINT tasks_assignee_fkey
        FOREIGN KEY (assigned_to, workspace_id, project_id)
        REFERENCES public.project_members(user_id, workspace_id, project_id),
    CONSTRAINT tasks_title_check
        CHECK (char_length(btrim(title)) BETWEEN 1 AND 300),
    CONSTRAINT tasks_status_check
        CHECK (status IN ('todo', 'in_progress', 'blocked', 'done', 'cancelled')),
    CONSTRAINT tasks_priority_check
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    CONSTRAINT tasks_dates_check
        CHECK (due_date IS NULL OR start_date IS NULL OR due_date >= start_date)
);

-- 7. Project milestones
CREATE TABLE public.project_milestones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    status text NOT NULL DEFAULT 'pending',
    due_date date,
    completed_at timestamptz,
    created_by uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT project_milestones_project_fkey
        FOREIGN KEY (workspace_id, project_id)
        REFERENCES public.projects(workspace_id, id) ON DELETE CASCADE,
    CONSTRAINT project_milestones_name_check
        CHECK (char_length(btrim(name)) BETWEEN 1 AND 200),
    CONSTRAINT project_milestones_status_check
        CHECK (status IN ('pending', 'in_progress', 'blocked', 'completed'))
);

-- 8. Indexes
CREATE INDEX idx_projects_workspace
    ON public.projects(workspace_id);
CREATE INDEX idx_projects_workspace_status
    ON public.projects(workspace_id, status);
CREATE INDEX idx_projects_created_by
    ON public.projects(created_by);

CREATE INDEX idx_business_members_business
    ON public.business_members(workspace_id, business_id);
CREATE INDEX idx_business_members_user
    ON public.business_members(user_id);

CREATE INDEX idx_project_members_project
    ON public.project_members(workspace_id, project_id);
CREATE INDEX idx_project_members_user
    ON public.project_members(user_id);

CREATE INDEX idx_project_businesses_business
    ON public.project_businesses(workspace_id, business_id);

CREATE INDEX idx_tasks_project
    ON public.tasks(workspace_id, project_id);
CREATE INDEX idx_tasks_status
    ON public.tasks(workspace_id, project_id, status);
CREATE INDEX idx_tasks_assignee
    ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_due_date
    ON public.tasks(workspace_id, due_date)
    WHERE status NOT IN ('done', 'cancelled');

CREATE INDEX idx_project_milestones_project
    ON public.project_milestones(workspace_id, project_id);
CREATE INDEX idx_project_milestones_due_date
    ON public.project_milestones(workspace_id, due_date);

-- 9. Security helper functions
CREATE OR REPLACE FUNCTION public.can_access_project(
    target_workspace_id uuid,
    target_project_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
    SELECT
        EXISTS (
            SELECT 1
            FROM public.workspace_members wm
            WHERE wm.workspace_id = target_workspace_id
              AND wm.user_id = (SELECT auth.uid())
              AND wm.role IN ('owner', 'admin')
        )
        OR EXISTS (
            SELECT 1
            FROM public.project_members pm
            WHERE pm.workspace_id = target_workspace_id
              AND pm.project_id = target_project_id
              AND pm.user_id = (SELECT auth.uid())
        )
        OR EXISTS (
            SELECT 1
            FROM public.projects p
            WHERE p.workspace_id = target_workspace_id
              AND p.id = target_project_id
              AND p.created_by = (SELECT auth.uid())
        );
$function$;

CREATE OR REPLACE FUNCTION public.can_manage_project(
    target_workspace_id uuid,
    target_project_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
    SELECT
        EXISTS (
            SELECT 1
            FROM public.workspace_members wm
            WHERE wm.workspace_id = target_workspace_id
              AND wm.user_id = (SELECT auth.uid())
              AND wm.role IN ('owner', 'admin')
        )
        OR EXISTS (
            SELECT 1
            FROM public.project_members pm
            WHERE pm.workspace_id = target_workspace_id
              AND pm.project_id = target_project_id
              AND pm.user_id = (SELECT auth.uid())
              AND pm.role = 'manager'
        )
        OR EXISTS (
            SELECT 1
            FROM public.projects p
            WHERE p.workspace_id = target_workspace_id
              AND p.id = target_project_id
              AND p.created_by = (SELECT auth.uid())
        );
$function$;

CREATE OR REPLACE FUNCTION public.has_project_role(
    target_workspace_id uuid,
    target_project_id uuid,
    allowed_roles text[]
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
    SELECT
        EXISTS (
            SELECT 1
            FROM public.workspace_members wm
            WHERE wm.workspace_id = target_workspace_id
              AND wm.user_id = (SELECT auth.uid())
              AND wm.role IN ('owner', 'admin')
        )
        OR EXISTS (
            SELECT 1
            FROM public.project_members pm
            WHERE pm.workspace_id = target_workspace_id
              AND pm.project_id = target_project_id
              AND pm.user_id = (SELECT auth.uid())
              AND pm.role = ANY(allowed_roles)
        );
$function$;

CREATE OR REPLACE FUNCTION public.can_manage_business(
    target_workspace_id uuid,
    target_business_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
    SELECT
        EXISTS (
            SELECT 1
            FROM public.workspace_members wm
            WHERE wm.workspace_id = target_workspace_id
              AND wm.user_id = (SELECT auth.uid())
              AND wm.role IN ('owner', 'admin')
        )
        OR EXISTS (
            SELECT 1
            FROM public.business_members bm
            WHERE bm.workspace_id = target_workspace_id
              AND bm.business_id = target_business_id
              AND bm.user_id = (SELECT auth.uid())
              AND bm.role = 'manager'
        );
$function$;

-- Match the verified function ACLs.
REVOKE ALL ON FUNCTION public.can_access_project(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_manage_project(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_project_role(uuid, uuid, text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_manage_business(uuid, uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_access_project(uuid, uuid)
    TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_manage_project(uuid, uuid)
    TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_project_role(uuid, uuid, text[])
    TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_manage_business(uuid, uuid)
    TO anon, authenticated, service_role;

-- 10. Enable RLS
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

-- 11. Business member policies
CREATE POLICY business_members_select_workspace
ON public.business_members FOR SELECT TO authenticated
USING (public.is_workspace_member(workspace_id));

CREATE POLICY business_members_insert_manager
ON public.business_members FOR INSERT TO authenticated
WITH CHECK (public.can_manage_business(workspace_id, business_id));

CREATE POLICY business_members_update_manager
ON public.business_members FOR UPDATE TO authenticated
USING (public.can_manage_business(workspace_id, business_id))
WITH CHECK (public.can_manage_business(workspace_id, business_id));

CREATE POLICY business_members_delete_manager
ON public.business_members FOR DELETE TO authenticated
USING (public.can_manage_business(workspace_id, business_id));

-- 12. Project policies
CREATE POLICY projects_select_accessible
ON public.projects FOR SELECT TO authenticated
USING (public.can_access_project(workspace_id, id));

CREATE POLICY projects_insert_manager
ON public.projects FOR INSERT TO authenticated
WITH CHECK (
    created_by = (SELECT auth.uid())
    AND public.has_workspace_role(
        workspace_id,
        ARRAY['owner', 'admin', 'manager']::text[]
    )
);

CREATE POLICY projects_update_manager
ON public.projects FOR UPDATE TO authenticated
USING (public.can_manage_project(workspace_id, id))
WITH CHECK (public.can_manage_project(workspace_id, id));

CREATE POLICY projects_delete_admin
ON public.projects FOR DELETE TO authenticated
USING (
    public.has_workspace_role(
        workspace_id,
        ARRAY['owner', 'admin']::text[]
    )
);

-- 13. Project member policies
CREATE POLICY project_members_select_accessible
ON public.project_members FOR SELECT TO authenticated
USING (public.can_access_project(workspace_id, project_id));

CREATE POLICY project_members_insert_manager
ON public.project_members FOR INSERT TO authenticated
WITH CHECK (public.can_manage_project(workspace_id, project_id));

CREATE POLICY project_members_update_manager
ON public.project_members FOR UPDATE TO authenticated
USING (public.can_manage_project(workspace_id, project_id))
WITH CHECK (public.can_manage_project(workspace_id, project_id));

CREATE POLICY project_members_delete_manager
ON public.project_members FOR DELETE TO authenticated
USING (public.can_manage_project(workspace_id, project_id));

-- 14. Project/business link policies
CREATE POLICY project_businesses_select_accessible
ON public.project_businesses FOR SELECT TO authenticated
USING (public.can_access_project(workspace_id, project_id));

CREATE POLICY project_businesses_insert_manager
ON public.project_businesses FOR INSERT TO authenticated
WITH CHECK (public.can_manage_project(workspace_id, project_id));

CREATE POLICY project_businesses_delete_manager
ON public.project_businesses FOR DELETE TO authenticated
USING (public.can_manage_project(workspace_id, project_id));

-- 15. Task policies
CREATE POLICY tasks_select_accessible
ON public.tasks FOR SELECT TO authenticated
USING (public.can_access_project(workspace_id, project_id));

CREATE POLICY tasks_insert_project_member
ON public.tasks FOR INSERT TO authenticated
WITH CHECK (
    created_by = (SELECT auth.uid())
    AND (
        public.can_manage_project(workspace_id, project_id)
        OR public.has_project_role(
            workspace_id,
            project_id,
            ARRAY['manager', 'member']::text[]
        )
    )
);

CREATE POLICY tasks_update_assignee_or_manager
ON public.tasks FOR UPDATE TO authenticated
USING (
    public.can_manage_project(workspace_id, project_id)
    OR assigned_to = (SELECT auth.uid())
)
WITH CHECK (
    public.can_manage_project(workspace_id, project_id)
    OR assigned_to = (SELECT auth.uid())
);

CREATE POLICY tasks_delete_manager
ON public.tasks FOR DELETE TO authenticated
USING (public.can_manage_project(workspace_id, project_id));

-- 16. Milestone policies
CREATE POLICY project_milestones_select_accessible
ON public.project_milestones FOR SELECT TO authenticated
USING (public.can_access_project(workspace_id, project_id));

CREATE POLICY project_milestones_insert_manager
ON public.project_milestones FOR INSERT TO authenticated
WITH CHECK (
    created_by = (SELECT auth.uid())
    AND public.can_manage_project(workspace_id, project_id)
);

CREATE POLICY project_milestones_update_manager
ON public.project_milestones FOR UPDATE TO authenticated
USING (public.can_manage_project(workspace_id, project_id))
WITH CHECK (public.can_manage_project(workspace_id, project_id));

CREATE POLICY project_milestones_delete_manager
ON public.project_milestones FOR DELETE TO authenticated
USING (public.can_manage_project(workspace_id, project_id));

-- 17. Table permissions for authenticated application users
GRANT ALL PRIVILEGES
ON TABLE public.projects,
         public.business_members,
         public.project_members,
         public.project_businesses,
         public.tasks,
         public.project_milestones
TO anon, authenticated, service_role;

COMMIT;
