import { Router } from "express";
import { randomBytes, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { pool } from "../db.js";
import { config } from "../config.js";
const router = Router();
const registerSchema = z.object({
    email: z.string().trim().email().max(254),
    password: z.string().min(12).max(128),
    displayName: z.string().trim().min(1).max(100),
    organizationName: z.string().trim().min(1).max(150).optional()
}).strict();
const loginSchema = z.object({
    email: z.string().trim().email().max(254),
    password: z.string().min(1).max(128)
}).strict();
function saveSession(req) {
    return new Promise((resolve, reject) => {
        req.session.save((error) => error ? reject(error) : resolve());
    });
}
function regenerateSession(req) {
    return new Promise((resolve, reject) => {
        req.session.regenerate((error) => error ? reject(error) : resolve());
    });
}
function destroySession(req) {
    return new Promise((resolve, reject) => {
        req.session.destroy((error) => error ? reject(error) : resolve());
    });
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
    const suppliedBuffer = Buffer.from(supplied);
    const expectedBuffer = Buffer.from(expected);
    if (suppliedBuffer.length !== expectedBuffer.length ||
        !timingSafeEqual(suppliedBuffer, expectedBuffer)) {
        return res.status(403).json({ error: "Missing or invalid CSRF token" });
    }
    next();
}
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: "Authentication required" });
    }
    next();
}
function publicUser(user) {
    return {
        id: user.id,
        email: user.email,
        displayName: user.display_name
    };
}
router.get("/csrf", (req, res, next) => {
    if (!req.session.csrfToken) {
        req.session.csrfToken = randomBytes(32).toString("hex");
    }
    saveSession(req)
        .then(() => res.json({ csrfToken: req.session.csrfToken }))
        .catch(next);
});
router.post("/register", requireCsrf, async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            error: "Please check your registration details.",
            details: parsed.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message
            }))
        });
    }
    const email = parsed.data.email.toLowerCase();
    const displayName = parsed.data.displayName;
    const organizationName = parsed.data.organizationName || `${displayName}'s Organization`;
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const client = await pool.connect();
    let user;
    try {
        await client.query("BEGIN");
        const insertedUser = await client.query(`INSERT INTO users (email, display_name, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, display_name`, [email, displayName, passwordHash]);
        user = insertedUser.rows[0];
        const organization = await client.query(`INSERT INTO organizations (name)
       VALUES ($1)
       RETURNING id`, [organizationName]);
        const organizationId = organization.rows[0].id;
        await client.query(`INSERT INTO organization_members (organization_id, user_id, role)
       VALUES ($1, $2, 'owner')`, [organizationId, user.id]);
        await client.query(`INSERT INTO workspaces (organization_id, updated_by)
       VALUES ($1, $2)`, [organizationId, user.id]);
        await client.query("COMMIT");
    }
    catch (error) {
        await client.query("ROLLBACK").catch(() => { });
        if (typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "23505") {
            return res.status(409).json({ error: "An account with that email already exists." });
        }
        throw error;
    }
    finally {
        client.release();
    }
    await regenerateSession(req);
    req.session.userId = user.id;
    req.session.csrfToken = randomBytes(32).toString("hex");
    await saveSession(req);
    return res.status(201).json({
        user: publicUser(user),
        csrfToken: req.session.csrfToken
    });
});
router.post("/login", requireCsrf, async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Please enter a valid email and password." });
    }
    const email = parsed.data.email.toLowerCase();
    const result = await pool.query(`SELECT id, email, display_name, password_hash, status
     FROM users
     WHERE LOWER(email) = $1
     LIMIT 1`, [email]);
    const user = result.rows[0];
    if (!user ||
        user.status !== "active" ||
        !user.password_hash ||
        !(await bcrypt.compare(parsed.data.password, user.password_hash))) {
        return res.status(401).json({ error: "Invalid email or password." });
    }
    await regenerateSession(req);
    req.session.userId = user.id;
    req.session.csrfToken = randomBytes(32).toString("hex");
    await saveSession(req);
    return res.json({
        user: publicUser(user),
        csrfToken: req.session.csrfToken
    });
});
router.get("/me", requireAuth, async (req, res) => {
    const result = await pool.query(`SELECT id, email, display_name
     FROM users
     WHERE id = $1 AND status = 'active'`, [req.session.userId]);
    if (!result.rows[0]) {
        await destroySession(req);
        res.clearCookie("lumini.sid");
        return res.status(401).json({ error: "Authentication required" });
    }
    const organizations = await pool.query(`SELECT o.id, o.name, o.plan, om.role
     FROM organizations o
     JOIN organization_members om ON om.organization_id = o.id
     WHERE om.user_id = $1 AND om.status = 'active'
     ORDER BY o.created_at ASC`, [req.session.userId]);
    return res.json({
        user: publicUser(result.rows[0]),
        organizations: organizations.rows
    });
});
router.post("/logout", requireCsrf, async (req, res) => {
    await destroySession(req);
    res.clearCookie("lumini.sid");
    return res.status(204).end();
});
export default router;
