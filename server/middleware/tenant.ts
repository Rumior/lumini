import type { Request, Response, NextFunction } from "express";
import { pool } from "../db.js";

export async function requireOrganizationMember(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const rawOrganizationId = req.params.organizationId;
  const organizationId =
    typeof rawOrganizationId === "string" ? rawOrganizationId : undefined;
  const userId = req.session.userId;

  if (!organizationId || !userId) {
    return res.status(404).json({ error: "Organization not found" });
  }

  try {
    const result = await pool.query<{ role: string }>(
      `SELECT om.role
       FROM organization_members om
       WHERE om.organization_id = $1
         AND om.user_id = $2
         AND om.status = 'active'
       LIMIT 1`,
      [organizationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.locals.organizationRole = result.rows[0].role;
    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireOrganizationRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!allowedRoles.includes(res.locals.organizationRole)) {
      return res.status(403).json({ error: "Insufficient organization permissions" });
    }

    return next();
  };
}
