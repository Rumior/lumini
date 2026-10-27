import type { PoolClient } from "pg";
import { pool } from "../db.js";

/**
 * Run tenant-owned queries in a transaction with request-scoped PostgreSQL
 * settings. `true` makes set_config transaction-local, so values cannot leak
 * to the next request when the pooled connection is reused.
 *
 * The caller must supply userId from the authenticated server-side session,
 * never from request JSON or an untrusted header.
 */
export async function withTenantTransaction<T>(
  userId: string,
  organizationId: string,
  work: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `SELECT
         set_config('app.user_id', $1, true),
         set_config('app.organization_id', $2, true)`,
      [userId, organizationId]
    );

    // Re-check membership inside the same transaction. This closes the gap
    // between middleware authorization and the protected database operation.
    const membership = await client.query(
      `SELECT 1
       FROM public.organization_members
       WHERE organization_id::text = $1
         AND user_id::text = $2
         AND status = 'active'
       LIMIT 1`,
      [organizationId, userId]
    );

    if (membership.rowCount !== 1) {
      const error = new Error("Organization not found") as Error & { code?: string };
      error.code = "TENANT_ACCESS_DENIED";
      throw error;
    }

    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

/** Set the authenticated user context for a transaction that creates a new
 * organization before a membership row exists. Use only inside BEGIN/COMMIT.
 */
export async function setTransactionUserContext(
  client: PoolClient,
  userId: string
): Promise<void> {
  await client.query(
    "SELECT set_config('app.user_id', $1, true)",
    [userId]
  );
}
