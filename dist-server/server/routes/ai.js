import { Router } from "express";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { config } from "../config.js";
const router = Router({ mergeParams: true });
const querySchema = z.object({
    query: z.string().trim().min(1).max(1000),
    context: z.record(z.string(), z.unknown()).optional()
}).strict();
function requireAuth(req, res, next) {
    if (!req.session?.userId)
        return res.status(401).json({ error: "Authentication required" });
    return next();
}
function requireCsrf(req, res, next) {
    const origin = req.get("origin");
    if (origin && origin !== config.APP_ORIGIN)
        return res.status(403).json({ error: "Request origin not allowed" });
    const supplied = req.get("x-csrf-token");
    const expected = req.session?.csrfToken;
    if (!supplied || !expected)
        return res.status(403).json({ error: "Missing or invalid CSRF token" });
    const a = Buffer.from(supplied);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b))
        return res.status(403).json({ error: "Missing or invalid CSRF token" });
    return next();
}
router.post("/research", (req, res, next) => {
    if (req.session?.userId)
        return requireAuth(req, res, next);
    next();
}, (req, res, next) => {
    if (req.session?.userId)
        return requireCsrf(req, res, next);
    next();
}, async (req, res) => {
    const parsed = querySchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: "Invalid query", details: parsed.error.issues });
    const q = parsed.data.query.toLowerCase();
    const parts = [];
    if (q.includes("cash"))
        parts.push("Cash flow is the movement of money in and out of your business over time. Profit is accounting income (revenue minus expenses) but doesn't mean you have cash on hand.");
    if (q.includes("profit"))
        parts.push("You can be profitable on paper while running out of cash due to timing (receivables, payables, inventory). Track both separately.");
    if (parts.length === 0)
        parts.push("Focus on unit economics first: understand price, variable cost, contribution margin, and break-even. Track cash runway alongside profit.");
    const summary = parts.join(" ");
    return res.json({
        query: parsed.data.query,
        summary,
        sources: [{ title: "Practical guidance", source: "internal" }],
        confidence: "high",
        provider: "local",
        retrievedAt: new Date().toISOString()
    });
});
export default router;
