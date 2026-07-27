# Vigil AI Ops — Frontend Assignment

A production-style **AI Operations Command Center** built with React 19, TypeScript, and Vite. Simulates live surveillance/AI ops data with no backend required.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Other scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run Oxlint |

## Features

### Core layout
- Responsive sidebar (desktop collapse + mobile drawer)
- Top navigation with search, notifications, theme toggle
- KPI cards, camera grid, incident timeline, analytics heatmap, alert panel, activity feed

### Dashboard
- Drag, resize, collapse, and reorder widgets (`react-grid-layout`)
- **Pin** widgets to lock position/size (cannot drag or resize until unpinned)
- Persist layout to **localStorage**
- Undo / redo layout changes
- Export / import layout JSON

### Live simulation
- Event engine generates events every **2–5 seconds**
- Seeds **1200** activity events on startup
- Updates alerts, cameras, incidents, notifications, analytics, and KPIs

### Search & commands
- **Ctrl+K** command palette
- Global search across navigation, widgets, cameras, alerts, and actions

### Notifications
- Unread badge counts
- Grouped by source: **Alerts**, **Cameras**, **System**

### Theming
- Light (default), dark, and system modes
- Customizable accent, font size, border radius, sidebar state (persisted)

### Performance
- Virtualized activity feed (`react-virtuoso`) for 1000+ events
- Zustand domain stores with narrow selectors
- Memoized widget frames and list rows

## Tech stack

- React 19 · TypeScript · Vite
- React Router · Zustand
- Tailwind CSS v4 · Framer Motion
- react-grid-layout · react-virtuoso
- Radix UI Dialog · Lucide Icons · date-fns

## Project structure

```
src/
  app/           # App shell, providers
  layouts/       # Shell, sidebar, top nav
  routes/        # Page routes
  features/      # dashboard, command-palette, notifications
  components/    # Shared UI
  store/         # Zustand stores
  services/      # Event engine
  types/         # Shared types
  utils/         # Helpers
```

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `⌘K` | Open command palette |
| `↑` / `↓` | Navigate palette results |
| `Enter` | Select command |
| `Esc` | Close palette / notifications / mobile nav |
| `Ctrl+Z` / `⌘Z` | Undo layout change |
| `Ctrl+Y` / `⌘⇧Z` | Redo layout change |

## Assignment coverage

React architecture, state management, performance, UI/UX, accessibility, and bonus features (export/import, undo/redo, pinned widgets, Framer Motion, command palette, grouped notifications) are implemented.
