-- Migration 005: Organisation-scoped financial ledger.
-- Run as the database owner/admin, not as lumini_runtime_rls.

BEGIN;

CREATE TABLE public.financial_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL
    REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  account_type VARCHAR(30) NOT NULL
    CHECK (account_type IN ('cash', 'bank', 'mobile_money', 'other')),
  currency VARCHAR(3) NOT NULL DEFAULT 'KES'
    CHECK (currency ~ '^[A-Z]{3}$'),
  opening_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  opening_balance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes VARCHAR(500),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, id)
);

CREATE UNIQUE INDEX financial_accounts_org_name_unique
  ON public.financial_accounts (organization_id, LOWER(name));

CREATE INDEX financial_accounts_org_created_idx
  ON public.financial_accounts (organization_id, created_at);

CREATE TABLE public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL
    REFERENCES public.organizations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL,
  transfer_to_account_id UUID,
  transaction_type VARCHAR(20) NOT NULL
    CHECK (transaction_type IN (
      'income', 'expense', 'transfer', 'capital', 'withdrawal'
    )),
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category VARCHAR(100) NOT NULL,
  description VARCHAR(500) NOT NULL,
  reference VARCHAR(120),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT financial_transactions_source_account_fk
    FOREIGN KEY (organization_id, account_id)
    REFERENCES public.financial_accounts (organization_id, id)
    ON DELETE RESTRICT,

  CONSTRAINT financial_transactions_destination_account_fk
    FOREIGN KEY (organization_id, transfer_to_account_id)
    REFERENCES public.financial_accounts (organization_id, id)
    ON DELETE RESTRICT,

  CONSTRAINT financial_transactions_transfer_rules CHECK (
    (
      transaction_type = 'transfer'
      AND transfer_to_account_id IS NOT NULL
      AND transfer_to_account_id <> account_id
    )
    OR
    (
      transaction_type <> 'transfer'
      AND transfer_to_account_id IS NULL
    )
  )
);

CREATE INDEX financial_transactions_org_date_idx
  ON public.financial_transactions
    (organization_id, transaction_date DESC, created_at DESC);

CREATE INDEX financial_transactions_account_date_idx
  ON public.financial_transactions
    (organization_id, account_id, transaction_date DESC);

CREATE INDEX financial_transactions_transfer_date_idx
  ON public.financial_transactions
    (organization_id, transfer_to_account_id, transaction_date DESC)
  WHERE transfer_to_account_id IS NOT NULL;

ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS financial_accounts_tenant_isolation
  ON public.financial_accounts;

CREATE POLICY financial_accounts_tenant_isolation
ON public.financial_accounts
FOR ALL
TO lumini_runtime_rls
USING (
  organization_id::text =
    NULLIF(current_setting('app.organization_id', true), '')
  AND public.lumini_is_active_org_member(organization_id)
)
WITH CHECK (
  organization_id::text =
    NULLIF(current_setting('app.organization_id', true), '')
  AND public.lumini_is_active_org_member(organization_id)
);

DROP POLICY IF EXISTS financial_transactions_tenant_isolation
  ON public.financial_transactions;

CREATE POLICY financial_transactions_tenant_isolation
ON public.financial_transactions
FOR ALL
TO lumini_runtime_rls
USING (
  organization_id::text =
    NULLIF(current_setting('app.organization_id', true), '')
  AND public.lumini_is_active_org_member(organization_id)
)
WITH CHECK (
  organization_id::text =
    NULLIF(current_setting('app.organization_id', true), '')
  AND public.lumini_is_active_org_member(organization_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.financial_accounts TO lumini_runtime_rls;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.financial_transactions TO lumini_runtime_rls;

COMMIT;
