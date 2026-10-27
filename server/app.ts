import express from "express";
import helmet from "helmet";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { rateLimit } from "express-rate-limit";
import { pinoHttp } from "pino-http";
import { pool } from "./db.js";
import { config } from "./config.js";
import authRoutes from "./routes/auth.js";
import organizationRoutes from "./routes/organizations.js";
import workspaceRoutes from "./routes/workspaces.js";
import businessRoutes from "./routes/businesses.js";
import actionRoutes from "./routes/actions.js";
import aiRoutes from "./routes/ai.js";

const app = express();
const PgSession = connectPgSimple(session);

if (config.TRUST_PROXY) {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");

app.use(helmet());

app.use(cors({
  origin: config.APP_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-CSRF-Token"]
}));

app.use(express.json({ limit: "1mb" }));

app.use(pinoHttp({
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers.set-cookie"
  ]
}));

app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false
}));

app.use(session({
  name: "lumini.sid",
  secret: config.SESSION_SECRET,
  store: new PgSession({
    pool,
    tableName: "session",
    createTableIfMissing: false,
    pruneSessionInterval: 15 * 60
  }),
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/"
  }
}));

app.get("/api/health", async (_req, res) => {
  await pool.query("SELECT 1");
  res.json({ status: "ok", database: "connected" });
});

app.use("/api/auth", authRoutes);
app.use("/api/organizations/:organizationId/workspace", workspaceRoutes);
app.use("/api/organizations/:organizationId/businesses", businessRoutes);
app.use("/api/organizations/:organizationId/actions", actionRoutes);
app.use("/api/organizations/:organizationId/ai", aiRoutes);
app.use("/api/organizations", organizationRoutes);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

app.use((
  error: unknown,
  req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) => {
  req.log.error({ err: error }, "Request failed");

  if (res.headersSent) return;

  res.status(500).json({ error: "An unexpected server error occurred" });
});

export default app;