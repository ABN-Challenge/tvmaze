# TVmaze Explorer

Frontend developer assessment for ABN AMRO — a Vue 3 TV show dashboard powered by the [TVmaze API](https://www.tvmaze.com/api).

**Live app:** [https://abn-challenge.github.io/tvmaze/](https://abn-challenge.github.io/tvmaze/)

## Requirements

| Tool | Version |
| --- | --- |
| Node.js | `20.19.0+` (engines: `>=20.19.0`; Storybook 10) |

| npm | `10.2.4+` |

## Architecture

Three repositories share Vue / Pinia / vue-router as Module Federation singletons:

```text
tvmaze (host shell)
  ├── loads tvmaze_ui     → design-system remote
  └── loads tvmaze_catalog → feature remote (dashboard / search / details)
         └── loads tvmaze_ui
```

| Repo | Role | Local port | Pages URL |
| --- | --- | --- | --- |
| [tvmaze](https://github.com/ABN-Challenge/tvmaze) | Host shell, hash router, Pinia | `5173` | `/tvmaze/` |
| [tvmaze-ui](https://github.com/ABN-Challenge/tvmaze-ui) | Design system + theme (Storybook root) | `5001` | `/tvmaze-ui/` |
| [tvmaze-catalog](https://github.com/ABN-Challenge/tvmaze-catalog) | API, grouping, pages (API Storybook root) | `5002` | `/tvmaze-catalog/` |

Why this split:

- **tvmaze-ui** is a reusable design-system remote (how product teams share UI without copying components). It owns the ABN theme (`./styles` / `./theme`); host and catalog import those styles and stay styling-agnostic. Components are documented in [Storybook](https://abn-challenge.github.io/tvmaze-ui/).
- **tvmaze-catalog** owns domain logic and feature pages so the host stays a thin shell. Its [API Storybook](https://abn-challenge.github.io/tvmaze-catalog/) playgrounds live TVmaze calls (index / search / details).
- We did **not** add a fourth remote for search/details/shared types — that would be architecture theater for this app size. Types and the API client live inside catalog as normal TypeScript.

Stack: Vue 3 + TypeScript + Vite + Pinia + Vue Router + Tailwind CSS v4 + `@module-federation/vite` + Vitest.

Hash routing (`createWebHashHistory`) keeps GitHub Pages simple without rewrite rules.

## Features

- Dashboard of shows from the Show Index (`/shows?page=0`, optional page 1)
- Grouped by genre into horizontal scroll-snap rows
- Sorted by rating within each genre (unrated last; pure, tested sort)
- Search by name with debounce + AbortController
- Details page with cast embed and sanitised HTML summary
- Responsive layout, skip link, keyboard-focus styles, reduced-motion support
- Loading skeletons, retryable errors, empty states

## Run locally

You need three terminals (or run the remotes in the background):

```bash
# 1) Design system remote
cd ../tvmaze-ui
npm install
npm run dev

# 2) Catalog remote
cd ../tvmaze-catalog
npm install
npm run dev

# 3) Host
cd ../tvmaze
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Optional remote URL overrides (see `.env.example`):

```bash
VITE_UI_REMOTE_URL=http://localhost:5001/remoteEntry.js
VITE_CATALOG_REMOTE_URL=http://localhost:5002/remoteEntry.js
```

### Scripts (host)

```bash
npm test
npm run lint
npm run build
```

## Deploy

Each repo has a GitHub Actions workflow that builds and deploys to GitHub Pages.

1. Enable **Settings → Pages → Source: GitHub Actions** on all three repos.
2. Deploy **tvmaze-ui**, then **tvmaze-catalog**, then **tvmaze** (host points at the production remote entries).

Production remote entries:

- `https://abn-challenge.github.io/tvmaze-ui/remoteEntry.js`
- `https://abn-challenge.github.io/tvmaze-catalog/remoteEntry.js`

## Attribution

TV show data from [TVmaze](https://www.tvmaze.com/) (CC BY-SA).

## Known limits

- The dashboard loads Show Index page 0 (and page 1 when available) — not the entire TVmaze catalog — to stay within the public rate limit.
- Remotes must be reachable at the configured URLs; locally that means ports `5001` and `5002`.
