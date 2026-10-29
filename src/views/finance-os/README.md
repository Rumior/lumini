# Lumini Finance OS: Home dashboard (prototype)

Static front-end prototype. No build step or dependencies.

## Run
Open `index.html` in a browser (Google Fonts load from the web; fallbacks are set).
`single-file/lumini-finance-os.html` is the same page in one file.

## Files
- `index.html`: page structure (sidebar, header, KPI row, cash forecast, intelligence, tiles, dialogs)
- `styles.css`: design tokens (`:root`, light and dark), layout, responsive rules
- `app.js`: sample data and rendering (`rKPI`, `rHero`/`rChart`, `rFin`, `rTiles`, dialogs, command palette)
- `SPEC.md`: the original Finance OS home dashboard specification

## Demo data
All figures are sample data, labelled "Demo data" in the UI. Sample data sits in the
"Sample data" block at the top of `app.js` (P, M, INS, FC, FL, BUD, ACT, DQ).
Replace it with organization-scoped API data; do not assume any endpoint exists.
Every module/action button opens a "Prototype destination" dialog until built.
The "State" dropdown previews loading, partial, stale, error and empty states.
