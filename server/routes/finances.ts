import { Router, type Request, type Response, type NextFunction } from "express";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { withTenantTransaction } from "../lib/tenant-transaction.js";
import { config } from "../config.js";

const router = Router({ mergeParams: true });

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(
  (value) => {
    const d = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
  },
  "Use a valid calendar date in YYYY-MM-DD format"
);

const accountSchema = z.object({
  name: z.string().trim().min(1).max(120),
  accountType: z.enum(["cash", "bank", "mobile_money", "other"]),
  currency: z.string().trim().length(3).transform((v) => v.toUpperCase()),
  openingBalance: z.number().finite().min(0).max(999999999999.99),
  openingBalanceDate: dateSchema,
  notes: z.string().trim().max(500).optional()
}).strict();

const transactionSchema = z.object({
  accountId: z.string().uuid(),
  transferToAccountId: z.string().uuid().optional(),
  transactionType: z.enum(["income", "expense", "transfer", "capital", "withdrawal"]),
  amount: z.number().finite().positive().max(999999999999.99),
  transactionDate: dateSchema,
  category: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(500),
  reference: z.string().trim().max(120).optional()
}).strict().superRefine((data, ctx) => {
  if (Math.round(data.amount * 100) !== data.amount * 100) {
    ctx.addIssue({
      code: "custom",
      path: ["amount"],
      message: "Amount must have no more than two decimal places"
    });
  }

  if (data.transactionType === "transfer") {
    if (!data.transferToAccountId) {
      ctx.addIssue({
        code: "custom",
        path: ["transferToAccountId"],
        message: "Choose a destination account for a transfer"
      });
    } else if (data.transferToAccountId === data.accountId) {
      ctx.addIssue({
        code: "custom",
        path: ["transferToAccountId"],
        message: "Source and destination accounts must be different"
      });
    }
  } else if (data.transferToAccountId) {
    ctx.addIssue({
      code: "custom",
      path: ["transferToAccountId"],
      message: "A destination account is only allowed for transfers"
    });
  }
});

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  return next();
}

function requireCsrf(req: Request, res: Response, next: NextFunction) {
  const origin = req.get("origin");
  if (origin && origin !== config.APP_ORIGIN) {
    return res.status(403).json({ error: "Request origin not allowed" });
  }

  const supplied = req.get("x-csrf-token");
  const expected = req.session.csrfToken;
  if (!supplied || !expected) {
    return res.status(403).json({ error: "Missing or invalid CSRF token" });
  }

  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return res.status(403).json({ error: "Missing or invalid CSRF token" });
  }
  return next();
}

function getOrganizationId(req: Request): string {
  return Array.isArray(req.params.organizationId)
    ? req.params.organizationId[0]
    : req.params.organizationId;
}

function periodBounds(period: string, date: string) {
  const [year, month, day] = date.split("-").map(Number);

  if (period === "day") {
    const start = date;
    const end = new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
    return { start, end };
  }

  if (period === "year") {
    return {
      start: `${year}-01-01`,
      end: `${year + 1}-01-01`
    };
  }

  return {
    start: `${year}-${String(month).padStart(2, "0")}-01`,
    end: new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10)
  };
}

router.get("/dashboard", requireAuth, async (req, res) => {
  const organizationId = getOrganizationId(req);
  const date = typeof req.query.date === "string"
    ? req.query.date
    : new Date().toISOString().slice(0, 10);
  const period = typeof req.query.period === "string"
    ? req.query.period
    : "month";

  if (!["day", "month", "year"].includes(period)) {
    return res.status(400).json({ error: "Period must be day, month, or year" });
  }

  if (!dateSchema.safeParse(date).success) {
    return res.status(400).json({ error: "Date must be a valid YYYY-MM-DD date" });
  }

  const { start, end } = periodBounds(period, date);

  try {
    const result = await withTenantTransaction(
      req.session.userId!,
      organizationId,
      async (client) => {
        const trendResult = await client.query(
          `SELECT
             CASE
               WHEN $4::text = 'year'
                 THEN to_char(date_trunc('month', t.transaction_date), 'YYYY-MM')
               ELSE to_char(t.transaction_date::date, 'YYYY-MM-DD')
             END AS period_key,
             a.currency,
             COALESCE(SUM(t.amount) FILTER (WHERE t.transaction_type = 'income'), 0) AS income,
             COALESCE(SUM(t.amount) FILTER (WHERE t.transaction_type = 'expense'), 0) AS expenses
           FROM public.financial_transactions t
           JOIN public.financial_accounts a
             ON a.id = t.account_id AND a.organization_id = t.organization_id
           WHERE t.organization_id = $1
             AND t.transaction_date >= $2::date
             AND t.transaction_date < $3::date
             AND t.transaction_type IN ('income', 'expense')
           GROUP BY period_key, a.currency
           ORDER BY period_key, a.currency`,
          [organizationId, start, end, period]
        );

        const categoryResult = await client.query(
          `SELECT
             a.currency,
             t.category,
             SUM(t.amount) AS total
           FROM public.financial_transactions t
           JOIN public.financial_accounts a
             ON a.id = t.account_id AND a.organization_id = t.organization_id
           WHERE t.organization_id = $1
             AND t.transaction_type = 'expense'
             AND t.transaction_date >= $2::date
             AND t.transaction_date < $3::date
           GROUP BY a.currency, t.category
           ORDER BY a.currency, total DESC`,
          [organizationId, start, end]
        );

        const accountsResult = await client.query(
          `SELECT
             a.id, a.name, a.account_type, a.currency,
             a.opening_balance, a.opening_balance_date,
             a.opening_balance + COALESCE((
               SELECT SUM(
                 CASE
                   WHEN t.account_id = a.id
                     AND t.transaction_type IN ('income', 'capital')
                     THEN t.amount
                   WHEN t.account_id = a.id
                     AND t.transaction_type IN ('expense', 'withdrawal', 'transfer')
                     THEN -t.amount
                   WHEN t.transfer_to_account_id = a.id
                     AND t.transaction_type = 'transfer'
                     THEN t.amount
                   ELSE 0
                 END
               )
               FROM public.financial_transactions t
               WHERE t.organization_id = a.organization_id
                 AND t.transaction_date >= a.opening_balance_date
                 AND t.transaction_date < ($2::date + INTERVAL '1 day')
                 AND (t.account_id = a.id OR t.transfer_to_account_id = a.id)
             ), 0) AS current_balance
           FROM public.financial_accounts a
           WHERE a.organization_id = $1
             AND a.opening_balance_date::date <= $2::date
           ORDER BY a.created_at ASC`,
          [organizationId, date]
        );

        return {
          period,
          date,
          start,
          end,
          trend: trendResult.rows,
          expenseCategories: categoryResult.rows,
          accounts: accountsResult.rows
        };
      }
    );

    return res.json(result);
  } catch (error: any) {
    if (error.code === "TENANT_ACCESS_DENIED") {
      return res.status(404).json({ error: "Organization not found" });
    }
    throw error;
  }
});
router.get("/", requireAuth, async (req, res) => {
  const organizationId = getOrganizationId(req);
  const period = typeof req.query.period === "string" ? req.query.period : "month";
  const date = typeof req.query.date === "string"
    ? req.query.date
    : new Date().toISOString().slice(0, 10);

  if (!["day", "month", "year"].includes(period)) {
    return res.status(400).json({ error: "Period must be day, month or year" });
  }
  if (!dateSchema.safeParse(date).success) {
    return res.status(400).json({ error: "Date must be a valid YYYY-MM-DD date" });
  }

  const { start, end } = periodBounds(period, date);

  try {
    const result = await withTenantTransaction(
      req.session.userId!,
      organizationId,
      async (client) => {
        const accountsResult = await client.query(
          `SELECT
             a.id, a.name, a.account_type, a.currency,
             a.opening_balance, a.opening_balance_date, a.notes,
             a.created_at, a.updated_at,
             a.opening_balance + COALESCE((
               SELECT SUM(
                 CASE
                   WHEN t.account_id = a.id
                     AND t.transaction_type IN ('income', 'capital')
                     THEN t.amount
                   WHEN t.account_id = a.id
                     AND t.transaction_type IN ('expense', 'withdrawal', 'transfer')
                     THEN -t.amount
                   WHEN t.transfer_to_account_id = a.id
                     AND t.transaction_type = 'transfer'
                     THEN t.amount
                   ELSE 0
                 END
               )
               FROM public.financial_transactions t
               WHERE t.organization_id = a.organization_id
                 AND t.transaction_date >= a.opening_balance_date
                 AND (t.account_id = a.id OR t.transfer_to_account_id = a.id)
             ), 0) AS current_balance
           FROM public.financial_accounts a
           WHERE a.organization_id = $1
           ORDER BY a.created_at ASC`,
          [organizationId]
        );

        const transactionsResult = await client.query(
          `SELECT
             t.id, t.account_id, t.transfer_to_account_id,
             t.transaction_type, t.amount, t.transaction_date,
             t.category, t.description, t.reference, t.created_at,
             a.name AS account_name, a.currency,
             destination.name AS transfer_to_account_name
           FROM public.financial_transactions t
           JOIN public.financial_accounts a
             ON a.id = t.account_id AND a.organization_id = t.organization_id
           LEFT JOIN public.financial_accounts destination
             ON destination.id = t.transfer_to_account_id
             AND destination.organization_id = t.organization_id
           WHERE t.organization_id = $1
  AND t.transaction_date >= $2::date
  AND t.transaction_date < $3::date
ORDER BY t.transaction_date DESC, t.created_at DESC
LIMIT 100`,
          [organizationId, start, end]
        );

        const summaryResult = await client.query(
          `SELECT
             a.currency,
             COALESCE(SUM(t.amount) FILTER (WHERE t.transaction_type = 'income'), 0) AS income,
             COALESCE(SUM(t.amount) FILTER (WHERE t.transaction_type = 'expense'), 0) AS expenses,
             COALESCE(SUM(t.amount) FILTER (WHERE t.transaction_type = 'capital'), 0) AS capital_introduced,
             COALESCE(SUM(t.amount) FILTER (WHERE t.transaction_type = 'withdrawal'), 0) AS owner_withdrawals,
             COUNT(t.id)::int AS transaction_count
           FROM public.financial_accounts a
           LEFT JOIN public.financial_transactions t
             ON t.organization_id = a.organization_id
             AND t.account_id = a.id
             AND t.transaction_date >= $2::date
             AND t.transaction_date < $3::date
           WHERE a.organization_id = $1
           GROUP BY a.currency
           ORDER BY a.currency`,
          [organizationId, start, end]
        );

        return {
          accounts: accountsResult.rows,
          transactions: transactionsResult.rows,
          summary: summaryResult.rows.map((row) => ({
            ...row,
            operating_result: Number(row.income) - Number(row.expenses)
          })),
          period: { type: period, date, start, end }
        };
      }
    );

    return res.json(result);
  } catch (error: any) {
    if (error.code === "TENANT_ACCESS_DENIED") {
      return res.status(404).json({ error: "Organization not found" });
    }
    throw error;
  }
});

router.post("/accounts", requireAuth, requireCsrf, async (req, res) => {
  const organizationId = getOrganizationId(req);
  const parsed = accountSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid account data", details: parsed.error.issues });
  }

  try {
    const account = await withTenantTransaction(
      req.session.userId!,
      organizationId,
      async (client) => {
        const result = await client.query(
          `INSERT INTO public.financial_accounts
             (organization_id, name, account_type, currency,
              opening_balance, opening_balance_date, notes, created_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           RETURNING id, name, account_type, currency, opening_balance,
                     opening_balance_date, notes, created_at`,
          [
            organizationId,
            parsed.data.name,
            parsed.data.accountType,
            parsed.data.currency,
            parsed.data.openingBalance,
            parsed.data.openingBalanceDate,
            parsed.data.notes || null,
            req.session.userId
          ]
        );
        return result.rows[0];
      }
    );

    return res.status(201).json({ account });
  } catch (error: any) {
    if (error.code === "TENANT_ACCESS_DENIED") {
      return res.status(404).json({ error: "Organization not found" });
    }
    if (error.code === "23505") {
      return res.status(409).json({ error: "An account with that name already exists in this organisation" });
    }
    throw error;
  }
});

router.post("/transactions", requireAuth, requireCsrf, async (req, res) => {
  const organizationId = getOrganizationId(req);
  const parsed = transactionSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid transaction data", details: parsed.error.issues });
  }

  try {
    const transaction = await withTenantTransaction(
      req.session.userId!,
      organizationId,
      async (client) => {
        const data = parsed.data;
        const ids = [data.accountId, ...(data.transferToAccountId ? [data.transferToAccountId] : [])];

        const accountResult = await client.query(
          `SELECT id, currency, opening_balance_date::text AS opening_balance_date
           FROM public.financial_accounts
           WHERE organization_id = $1 AND id = ANY($2::uuid[])
           ORDER BY id
           FOR UPDATE`,
          [organizationId, ids]
        );

        if (accountResult.rows.length !== ids.length) {
          const error = new Error("One or more accounts were not found in this organisation");
          (error as any).statusCode = 400;
          throw error;
        }

        const accounts = new Map<string, { currency: string; opening_balance_date: string }>(
          accountResult.rows.map((row: any) => [
            row.id,
            { currency: row.currency, opening_balance_date: String(row.opening_balance_date).slice(0, 10) }
          ])
        );

        const source = accounts.get(data.accountId)!;
        if (data.transactionDate < source.opening_balance_date) {
          const error = new Error("Transaction date cannot be before the source account's opening balance date");
          (error as any).statusCode = 400;
          throw error;
        }

        if (data.transferToAccountId) {
          const destination = accounts.get(data.transferToAccountId)!;
          if (destination.currency !== source.currency) {
            const error = new Error("Transfers between accounts must use the same currency");
            (error as any).statusCode = 400;
            throw error;
          }
          if (data.transactionDate < destination.opening_balance_date) {
            const error = new Error("Transaction date cannot be before the destination account's opening balance date");
            (error as any).statusCode = 400;
            throw error;
          }
        }

        const result = await client.query(
          `INSERT INTO public.financial_transactions
             (organization_id, account_id, transfer_to_account_id,
              transaction_type, amount, transaction_date, category,
              description, reference, created_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
           RETURNING id, account_id, transfer_to_account_id,
                     transaction_type, amount, transaction_date,
                     category, description, reference, created_at`,
          [
            organizationId,
            data.accountId,
            data.transferToAccountId || null,
            data.transactionType,
            data.amount,
            data.transactionDate,
            data.category,
            data.description,
            data.reference || null,
            req.session.userId
          ]
        );

        return result.rows[0];
      }
    );

    return res.status(201).json({ transaction });
  } catch (error: any) {
    if (error.code === "TENANT_ACCESS_DENIED") {
      return res.status(404).json({ error: "Organization not found" });
    }
    if (error.statusCode === 400) {
      return res.status(400).json({ error: error.message });
    }
    throw error;
  }
});

export default router;
