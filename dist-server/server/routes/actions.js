import { Router } from "express";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { withTenantTransaction } from "../lib/tenant-transaction.js";
import { config } from "../config.js";
const router = Router({ mergeParams: true });
const createSchema = z.object({
    title: z.string().trim().min(1).max(255),
    area: z.string().trim().max(100).optional(),
    due: z.string().trim().max(20).optional(),
    impact: z.string().trim().max(50).optional()
}).strict();
function requireAuth(req, res, next) {
    if (!req.session.userId)
        return res.status(401).json({ error: "Authentication required" });
    return next();
}
function requireCsrf(req, res, next) {
    const origin = req.get("origin");
    if (origin && origin !== config.APP_ORIGIN)
        return res.status(403).json({ error: "Request origin not allowed" });
    const supplied = req.get("x-csrf-token");
    const expected = req.session.csrfToken;
    if (!supplied || !expected)
        return res.status(403).json({ error: "Missing or invalid CSRF token" });
    const a = Buffer.from(supplied);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b))
        return res.status(403).json({ error: "Missing or invalid CSRF token" });
    return next();
}
router.get("/", requireAuth, async (req, res) => {
    const organizationId = Array.isArray(req.params.organizationId) ? req.params.organizationId[0] : req.params.organizationId;
    try {
        const result = await withTenantTransaction(req.session.userId, organizationId, async (client) => {
            const r = await client.query(`SELECT id, title, area, due, done, impact FROM public.actions WHERE organization_id=$1 ORDER BY created_at DESC`, [organizationId]);
            return r.rows;
        });
        return res.json({ actions: result });
    }
    catch (error) {
        if (error.code === "TENANT_ACCESS_DENIED")
            return res.status(404).json({ error: "Organization not found" });
        throw error;
    }
});
router.post("/", requireAuth, requireCsrf, async (req, res) => {
    const organizationId = Array.isArray(req.params.organizationId) ? req.params.organizationId[0] : req.params.organizationId;
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: "Invalid action", details: parsed.error.issues });
    try {
        const result = await withTenantTransaction(req.session.userId, organizationId, async (client) => {
            const r = await client.query(`INSERT INTO public.actions (organization_id, title, area, due, done, impact) VALUES ($1,$2,$3,$4,false,$5) RETURNING *`, [organizationId, parsed.data.title, parsed.data.area || 'General', parsed.data.due || new Date(Date.now() + 86400000).toISOString().slice(0, 10), parsed.data.impact || 'medium']);
            return r.rows[0];
        });
        return res.status(201).json({ action: result });
    }
    catch (error) {
        if (error.code === "TENANT_ACCESS_DENIED")
            return res.status(404).json({ error: "Organization not found" });
        throw error;
    }
});
router.patch("/:id", requireAuth, requireCsrf, async (req, res) => {
    const organizationId = Array.isArray(req.params.organizationId) ? req.params.organizationId[0] : req.params.organizationId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
        const result = await withTenantTransaction(req.session.userId, organizationId, async (client) => {
            const r = await client.query(`UPDATE public.actions SET done = COALESCE($3, done), updated_at=NOW() WHERE id=$1 AND organization_id=$2 RETURNING *`, [id, organizationId, req.body.done]);
            if (r.rowCount === 0)
                return null;
            return r.rows[0];
        });
        if (!result)
            return res.status(404).json({ error: "Action not found" });
        return res.json({ action: result });
    }
    catch (error) {
        if (error.code === "TENANT_ACCESS_DENIED")
            return res.status(404).json({ error: "Organization not found" });
        throw error;
    }
});
export default router;
