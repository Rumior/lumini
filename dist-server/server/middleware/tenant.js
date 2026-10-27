import { pool } from "../db.js";
export async function requireOrganizationMember(req, res, next) {
    const rawOrganizationId = req.params.organizationId;
    const organizationId = typeof rawOrganizationId === "string" ? rawOrganizationId : undefined;
    const userId = req.session.userId;
    if (!organizationId || !userId) {
        return res.status(404).json({ error: "Organization not found" });
    }
    try {
        const result = await pool.query(`SELECT om.role
       FROM organization_members om
       WHERE om.organization_id = $1
         AND om.user_id = $2
         AND om.status = 'active'
       LIMIT 1`, [organizationId, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Organization not found" });
        }
        res.locals.organizationRole = result.rows[0].role;
        return next();
    }
    catch (error) {
        return next(error);
    }
}
export function requireOrganizationRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.session.userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        if (!allowedRoles.includes(res.locals.organizationRole)) {
            return res.status(403).json({ error: "Insufficient organization permissions" });
        }
        return next();
    };
}
