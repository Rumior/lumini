# FRONTEND_BACKEND_AUDIT

## Baseline
- Frontend: React 19 + TypeScript + Vite
- Backend: Express 5 + TypeScript (server/, built to dist-server/)
- DB: PostgreSQL (Neon) with migrations in database/migrations/
- Auth: session-based, CSRF protection in api client
- RLS: enabled on workspaces, businesses, audit_events (verified)

## Scripts

>   "scripts": {
      "dev": "vite",
      "build": "tsc -b && vite build",
      "lint": "eslint .",
      "preview": "vite preview",
      "typecheck": "tsc -b --noEmit",
      "test": "vitest run",
      "test:watch": "vitest",
      "server:dev": "tsx watch server/index.ts",
      "server:build": "tsc -p tsconfig.server.json",
      "server:start": "node dist-server/server/index.js",
      "typecheck:server": "tsc -p tsconfig.server.json --noEmit"
    },
    "dependencies": {
      "@hookform/resolvers": "^5.2.2",
      "@radix-ui/react-accordion": "^1.2.12",
      "@radix-ui/react-alert-dialog": "^1.1.15",
      "@radix-ui/react-aspect-ratio": "^1.1.8",
      "@radix-ui/react-avatar": "^1.1.11",
      "@radix-ui/react-checkbox": "^1.3.3",
      "@radix-ui/react-collapsible": "^1.1.12",
      "@radix-ui/react-context-menu": "^2.2.16",
      "@radix-ui/react-dialog": "^1.1.15",
      "@radix-ui/react-dropdown-menu": "^2.1.16",
      "@radix-ui/react-hover-card": "^1.1.15",
      "@radix-ui/react-label": "^2.1.8",
      "@radix-ui/react-menubar": "^1.1.16",
      "@radix-ui/react-navigation-menu": "^1.2.14",
      "@radix-ui/react-popover": "^1.1.15",
      "@radix-ui/react-progress": "^1.1.8",
      "@radix-ui/react-radio-group": "^1.3.8",
      "@radix-ui/react-scroll-area": "^1.2.10",
      "@radix-ui/react-select": "^2.2.6",
      "@radix-ui/react-separator": "^1.1.8",
      "@radix-ui/react-slider": "^1.3.6",
      "@radix-ui/react-slot": "^1.2.4",
      "@radix-ui/react-switch": "^1.2.6",
      "@radix-ui/react-tabs": "^1.1.13",
      "@radix-ui/react-toggle": "^1.1.10",
      "@radix-ui/react-toggle-group": "^1.1.11",
      "@radix-ui/react-tooltip": "^1.2.8",




## Structure (key)
- Frontend: src/ (views, components, contexts, lib, types)
- Backend: server/ (app.ts, routes/, middleware/, services/, db.ts)
- API client: src/lib/api/client.ts
- Auth context: src/context/AuthContext.tsx