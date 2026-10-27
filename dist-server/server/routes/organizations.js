import { Router } from "express";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { pool } from "../db.js";
import { config } from "../config.js";
import { setTransactionUserContext } from "../lib/tenant-transaction.js";
const router = Router();
const createSchema = z.object({
    name: z.string().trim().min(1).max(150)
}).strict();
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: "Authentication required" });
    }
    return next();
}
function requireCsrf(req, res, next) {
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
router.get("/", requireAuth, async (req, res) => {
    const result = await pool.query(`SELECT o.id, o.name, o.plan, om.role, om.status
     FROM public.organizations o
     JOIN public.organization_members om ON om.organization_id = o.id
     WHERE om.user_id = $1 AND om.status = 'active'
     ORDER BY o.created_at ASC`, [req.session.userId]);
    return res.json({ organizations: result.rows });
});
router.post("/", requireAuth, requireCsrf, async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            error: "Please provide a valid organization name.",
            details: parsed.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message
            }))
        });
    }
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
    }
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await setTransactionUserContext(client, userId);
        const organization = await client.query(`INSERT INTO public.organizations (name)
       VALUES ($1)
       RETURNING id, name, plan`, [parsed.data.name]);
        const created = organization.rows[0];
        // The RLS policy on workspaces permits this insert only after the active
        // membership row is created in this same transaction.
        await client.query(`SELECT set_config('app.organization_id', $1, true)`, [created.id]);
        await client.query(`INSERT INTO public.organization_members (organization_id, user_id, role)
       VALUES ($1, $2, 'owner')`, [created.id, userId]);
        await client.query(`INSERT INTO public.workspaces (organization_id, updated_by)
       VALUES ($1, $2)`, [created.id, userId]);
        await client.query("COMMIT");
        return res.status(201).json({
            organization: { ...created, role: "owner" }
        });
    }
    catch (error) {
        await client.query("ROLLBACK").catch(() => undefined);
        throw error;
    }
    finally {
        client.release();
    }
});
export default router;
