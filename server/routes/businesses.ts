import { Router, type Request, type Response, type NextFunction } from "express";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { withTenantTransaction } from "../lib/tenant-transaction.js";
import { config } from "../config.js";

const router = Router({ mergeParams: true });

const createSchema = z.object({
  name: z.string().trim().min(1).max(255),
  industry: z.string().trim().max(100).optional(),
  stage: z.string().trim().max(50).optional(),
  businessModel: z.string().trim().max(100).optional(),
  locationOrServiceArea: z.string().trim().max(255).optional(),
  baseCurrency: z.string().trim().length(3).optional()
}).strict();

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

router.get("/", requireAuth, async (req, res) => {
  const organizationId = Array.isArray(req.params.organizationId) ? req.params.organizationId[0] : req.params.organizationId;
  try {
    const result = await withTenantTransaction(req.session.userId!, organizationId, async (client) => {
      const r = await client.query(
        `SELECT id, name, industry, stage, business_model, location_or_service_area, base_currency, created_at, updated_at
         FROM public.businesses
         WHERE organization_id = $1 AND archived_at IS NULL
         ORDER BY created_at ASC`,
        [organizationId]
      );
      return r.rows;
    });
    return res.json({ businesses: result });
  } catch (error: any) {
    if (error.code === "TENANT_ACCESS_DENIED") {
      return res.status(404).json({ error: "Organization not found" });
    }
    throw error;
  }
});

router.post("/", requireAuth, requireCsrf, async (req, res) => {
  const organizationId = Array.isArray(req.params.organizationId) ? req.params.organizationId[0] : req.params.organizationId;
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid business data", details: parsed.error.issues });
  }
  try {
    const result = await withTenantTransaction(req.session.userId!, organizationId, async (client) => {
      const r = await client.query(
        `INSERT INTO public.businesses (organization_id, name, industry, stage, business_model, location_or_service_area, base_currency)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING id, name, industry, stage, business_model, location_or_service_area, base_currency, created_at`,
        [
          organizationId,
          parsed.data.name,
          parsed.data.industry || null,
          parsed.data.stage || null,
          parsed.data.businessModel || null,
          parsed.data.locationOrServiceArea || null,
          parsed.data.baseCurrency || "KES"
        ]
      );
      return r.rows[0];
    });
    return res.status(201).json({ business: result });
  } catch (error: any) {
    if (error.code === "TENANT_ACCESS_DENIED") {
      return res.status(404).json({ error: "Organization not found" });
    }
    throw error;
  }
});

export default router;