# Lumini web client

AI-powered business mentor and business-intelligence platform. This package is the **web client**.

> **Status: prototype (Stage 0 complete).** The interface is built, but all data is mock data held in
> `src/data/mock-data.ts` and browser `localStorage`. There is no backend, authentication, database,
> real AI, or real financial engine yet. See the build plan in the project docs for what comes next.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # type-check + production build
npm run lint
```

Requires Node.js 20+.

## Structure

```
src/
  App.tsx                 Route table
  main.tsx                Entry point (BrowserRouter)
  config/navigation.ts    Route paths, nav items, titles
  context/                Workspace state shared by all views (prototype)
  components/app/         Layout, sidebar, top bar, modals
  components/ui/          shadcn/ui primitives (mostly unused so far)
  views/                  One file per screen
  data/mock-data.ts       ALL sample data - delete entries as real data replaces them
  types/                  Shared TypeScript types
  lib/                    Small utilities
```

## Routes

| Path | Screen |
|---|---|
| `/` | Overview |
| `/mentor` | Ask Lumini |
| `/business` | My business |
| `/finances` | Finances |
| `/plans` | Plans & actions |
| `/insights` | Insights |
| `/settings` | Settings |

## Known prototype limits

- The mentor chat returns keyword-matched canned replies.
- Financial maths runs in the browser using floating point (replaced in Stage 2 by a tested decimal engine).
- Health score, trends, forecast shape, notifications and reports are fabricated.
- Settings toggles do not change behaviour.
