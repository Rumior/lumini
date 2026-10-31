-- LUMINI onboarding: core application schema
-- This migration is intended for authenticated users.

CREATE TABLE IF NOT EXISTS public.workspaces (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL CHECK (length(trim(name)) > 0),
    description text,
    logo_url text,
    timezone text NOT NULL DEFAULT 'Africa/Nairobi',
    priorities text[] NOT NULL DEFAULT '{}',
    goal jsonb NOT NULL DEFAULT '{}'::jsonb,
    project jsonb NOT NULL DEFAULT '{}'::jsonb,
    onboarding_data jsonb NOT NULL DEFAULT '{}'::jsonb,
    onboarding_completed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workspace_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    role text NOT NULL DEFAULT 'member'
        CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.businesses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name text NOT NULL CHECK (length(trim(name)) > 0),
    country text,
    currency text,
    industry text,
    offer text CHECK (offer IS NULL OR offer IN ('products', 'services', 'both')),
    stage text CHECK (stage IS NULL OR stage IN ('idea', 'early', 'established')),
    legal text,
    website text,
    description text,
    financial_year text,
    timezone text,
    team_size text,
    payment_methods text[] NOT NULL DEFAULT '{}',
    tax_registration text,
    starting_cash numeric(18,2),
    monthly_revenue numeric(18,2),
    average_price numeric(18,2),
    unit_cost numeric(18,2),
    additional_data jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.onboarding_drafts (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    current_step text NOT NULL DEFAULT 'welcome',
    draft jsonb NOT NULL DEFAULT '{}'::jsonb,
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_user
    ON public.workspace_members(user_id);

CREATE INDEX IF NOT EXISTS idx_businesses_workspace
    ON public.businesses(workspace_id);

-- Security helper functions. SECURITY DEFINER avoids recursive RLS checks.
CREATE OR REPLACE FUNCTION public.is_workspace_member(target_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.workspace_members
        WHERE workspace_id = target_workspace_id
          AND user_id = (SELECT auth.uid())
    );
$$;

CREATE OR REPLACE FUNCTION public.has_workspace_role(
    target_workspace_id uuid,
    allowed_roles text[]
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.workspace_members
        WHERE workspace_id = target_workspace_id
          AND user_id = (SELECT auth.uid())
          AND role = ANY(allowed_roles)
    );
$$;

-- Enable row-level security.
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_drafts ENABLE ROW LEVEL SECURITY;

-- Workspace policies.
DROP POLICY IF EXISTS workspaces_select_member ON public.workspaces;
CREATE POLICY workspaces_select_member
ON public.workspaces FOR SELECT TO authenticated
USING (public.is_workspace_member(id));

DROP POLICY IF EXISTS workspaces_update_admin ON public.workspaces;
CREATE POLICY workspaces_update_admin
ON public.workspaces FOR UPDATE TO authenticated
USING (public.has_workspace_role(id, ARRAY['owner', 'admin']))
WITH CHECK (public.has_workspace_role(id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS workspaces_delete_owner ON public.workspaces;
CREATE POLICY workspaces_delete_owner
ON public.workspaces FOR DELETE TO authenticated
USING (public.has_workspace_role(id, ARRAY['owner']));

-- Membership policies.
DROP POLICY IF EXISTS members_select_workspace ON public.workspace_members;
CREATE POLICY members_select_workspace
ON public.workspace_members FOR SELECT TO authenticated
USING (
    user_id = (SELECT auth.uid())
    OR public.is_workspace_member(workspace_id)
);



-- Business policies.
DROP POLICY IF EXISTS businesses_select_member ON public.businesses;
CREATE POLICY businesses_select_member
ON public.businesses FOR SELECT TO authenticated
USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS businesses_insert_manager ON public.businesses;
CREATE POLICY businesses_insert_manager
ON public.businesses FOR INSERT TO authenticated
WITH CHECK (
    public.has_workspace_role(
        workspace_id,
        ARRAY['owner', 'admin', 'manager']
    )
);

DROP POLICY IF EXISTS businesses_update_manager ON public.businesses;
CREATE POLICY businesses_update_manager
ON public.businesses FOR UPDATE TO authenticated
USING (
    public.has_workspace_role(
        workspace_id,
        ARRAY['owner', 'admin', 'manager']
    )
)
WITH CHECK (
    public.has_workspace_role(
        workspace_id,
        ARRAY['owner', 'admin', 'manager']
    )
);

DROP POLICY IF EXISTS businesses_delete_admin ON public.businesses;
CREATE POLICY businesses_delete_admin
ON public.businesses FOR DELETE TO authenticated
USING (
    public.has_workspace_role(workspace_id, ARRAY['owner', 'admin'])
);

-- Each user can access only their own onboarding draft.
DROP POLICY IF EXISTS onboarding_drafts_owner ON public.onboarding_drafts;
CREATE POLICY onboarding_drafts_owner
ON public.onboarding_drafts FOR ALL TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- Create a workspace, its owner membership and its initial businesses
-- as one transaction.
CREATE OR REPLACE FUNCTION public.create_lumini_workspace(p_draft jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id uuid;
    v_workspace_id uuid;
    v_business jsonb;
    v_business_count integer;
    v_key text;
    v_value text;
    v_amount numeric;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF p_draft IS NULL OR jsonb_typeof(p_draft) <> 'object' THEN
        RAISE EXCEPTION 'Invalid onboarding data';
    END IF;

    IF jsonb_typeof(p_draft->'ws') IS DISTINCT FROM 'object'
       OR jsonb_typeof(p_draft->'biz') IS DISTINCT FROM 'array'
       OR jsonb_typeof(p_draft->'pri') IS DISTINCT FROM 'array'
       OR jsonb_typeof(p_draft->'goal') IS DISTINCT FROM 'object'
       OR jsonb_typeof(p_draft->'proj') IS DISTINCT FROM 'object' THEN
        RAISE EXCEPTION 'Invalid onboarding data structure';
    END IF;

    IF length(trim(COALESCE(p_draft #>> '{ws,name}', ''))) < 2 THEN
        RAISE EXCEPTION 'Workspace name must contain at least 2 characters';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM jsonb_array_elements(p_draft->'pri') AS item(value)
        WHERE jsonb_typeof(item.value) <> 'string'
    ) THEN
        RAISE EXCEPTION 'Invalid workspace priorities';
    END IF;

    v_business_count := jsonb_array_length(p_draft->'biz');

    IF v_business_count < 1 THEN
        RAISE EXCEPTION 'At least one business is required';
    END IF;

    -- Serialize workspace creation attempts for this user.
    PERFORM pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended(v_user_id::text, 0)
    );

-- Validate every business before inserting anything.
    FOR v_business IN
        SELECT item.value
        FROM jsonb_array_elements(p_draft->'biz') AS item(value)
    LOOP
        IF jsonb_typeof(v_business) <> 'object' THEN
            RAISE EXCEPTION 'Invalid business information';
        END IF;

        IF length(trim(COALESCE(v_business->>'name', ''))) = 0 THEN
            RAISE EXCEPTION 'Every business must have a name';
        END IF;

        IF COALESCE(v_business->>'offer', '') NOT IN
           ('products', 'services', 'both') THEN
            RAISE EXCEPTION 'Choose a valid business offering';
        END IF;

        IF COALESCE(v_business->>'stage', '') NOT IN
           ('', 'idea', 'early', 'established') THEN
            RAISE EXCEPTION 'Invalid business stage';
        END IF;

        IF jsonb_typeof(COALESCE(v_business->'pay', '[]'::jsonb)) <> 'array' THEN
            RAISE EXCEPTION 'Invalid payment methods';
        END IF;

        IF EXISTS (
            SELECT 1
            FROM jsonb_array_elements(v_business->'pay') AS item(value)
            WHERE jsonb_typeof(item.value) <> 'string'
               OR COALESCE(item.value #>> '{}', '') NOT IN ('cash', 'mobile', 'card', 'bank')
        ) THEN
            RAISE EXCEPTION 'Choose valid payment methods';
        END IF;

        FOREACH v_key IN ARRAY ARRAY['cash', 'rev', 'price', 'cost']
        LOOP
            v_value := NULLIF(trim(v_business->>v_key), '');

            IF v_value IS NOT NULL THEN
                IF v_value !~ '^[0-9]+([.][0-9]+)?$' THEN
                    RAISE EXCEPTION 'Invalid financial value for %', v_key;
                END IF;

                v_amount := v_value::numeric;

                IF v_amount < 0 OR round(v_amount, 2) > 9999999999999999.99 THEN
                    RAISE EXCEPTION 'Financial value for % is outside the allowed range', v_key;
                END IF;
            END IF;
        END LOOP;
    END LOOP;

    INSERT INTO public.workspaces (
        owner_id,
        name,
        description,
        logo_url,
        timezone,
        priorities,
        goal,
        project,
        onboarding_data,
        onboarding_completed_at
    )
    VALUES (
        v_user_id,
        trim(p_draft #>> '{ws,name}'),
        NULLIF(p_draft #>> '{ws,desc}', ''),
        NULLIF(p_draft #>> '{ws,logo}', ''),
        COALESCE(NULLIF(p_draft #>> '{biz,0,tz}', ''), 'Africa/Nairobi'),
        ARRAY(
            SELECT jsonb_array_elements_text(p_draft->'pri')
        ),
        p_draft->'goal',
        p_draft->'proj',
        p_draft,
        now()
    )
    RETURNING id INTO v_workspace_id;

    INSERT INTO public.workspace_members (
        workspace_id,
        user_id,
        full_name,
        role
    )
    VALUES (
        v_workspace_id,
        v_user_id,
        NULLIF(p_draft #>> '{me,name}', ''),
        'owner'
    );

    FOR v_business IN
        SELECT item.value
        FROM jsonb_array_elements(p_draft->'biz') AS item(value)
    LOOP
        INSERT INTO public.businesses (
            workspace_id,
            name,
            country,
            currency,
            industry,
            offer,
            stage,
            legal,
            website,
            description,
            financial_year,
            timezone,
            team_size,
            payment_methods,
            tax_registration,
            starting_cash,
            monthly_revenue,
            average_price,
            unit_cost,
            additional_data
        )
        VALUES (
            v_workspace_id,
            trim(v_business->>'name'),
            NULLIF(v_business->>'country', ''),
            NULLIF(v_business->>'cur', ''),
            NULLIF(v_business->>'industry', ''),
            v_business->>'offer',
            NULLIF(v_business->>'stage', ''),
            NULLIF(v_business->>'legal', ''),
            NULLIF(v_business->>'web', ''),
            NULLIF(v_business->>'desc', ''),
            NULLIF(v_business->>'fy', ''),
            NULLIF(v_business->>'tz', ''),
            NULLIF(v_business->>'team', ''),
            ARRAY(
                SELECT jsonb_array_elements_text(v_business->'pay')
            ),
            NULLIF(v_business->>'tax', ''),
            NULLIF(trim(v_business->>'cash'), '')::numeric,
            NULLIF(trim(v_business->>'rev'), '')::numeric,
            NULLIF(trim(v_business->>'price'), '')::numeric,
            NULLIF(trim(v_business->>'cost'), '')::numeric,
            v_business
        );
    END LOOP;

    DELETE FROM public.onboarding_drafts
    WHERE user_id = v_user_id;

    RETURN v_workspace_id;
END;
$$;

-- Restrict RPC execution to authenticated users.
REVOKE ALL ON FUNCTION public.create_lumini_workspace(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_lumini_workspace(jsonb) TO authenticated;

REVOKE ALL ON FUNCTION public.is_workspace_member(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_workspace_member(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.has_workspace_role(uuid, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_workspace_role(uuid, text[]) TO authenticated;

-- Table access for authenticated users; RLS controls individual rows.
GRANT SELECT, UPDATE, DELETE ON public.workspaces TO authenticated;
GRANT SELECT ON public.workspace_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.businesses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_drafts TO authenticated;