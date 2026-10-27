-- Migration 002: Workspace persistence and audit events

CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE
    REFERENCES organizations(id) ON DELETE CASCADE,
  state_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workspaces_updated_at
  ON workspaces(updated_at DESC);

CREATE TABLE IF NOT EXISTS audit_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id UUID
    REFERENCES organizations(id) ON DELETE SET NULL,
  actor_user_id UUID
    REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  details_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  request_id VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_org_created
  ON audit_events(organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_events_actor_created
  ON audit_events(actor_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_email_lower
  ON users(LOWER(email));

CREATE INDEX IF NOT EXISTS idx_businesses_org_created
  ON businesses(organization_id, created_at DESC);
