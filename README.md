# Nexical Documentation System

This project is the centralized documentation hub for the **Nexical Ecosystem**. It uses **Starlight** (built on Astro) and a custom aggregation engine to create a unified documentation site from multiple sources across the monorepo.

## 🏗️ Architecture: The Aggregation Engine

Unlike traditional documentation sites where all content lives in one place, Nexical uses a **Modular Documentation** approach. Content is authored near the code it describes and then aggregated into this project for publishing.

### How it Works (`gather-docs.ts`)

The `npm run gather-docs` script performs the following:
1.  **Discovery**: It scans the following locations for `docs/` directories:
    -   `core/docs` (Global architecture & standards)
    -   `apps/docs` (Site-specific landing pages and assets)
    -   `apps/backend/modules/{name}/docs` (Backend module documentation)
    -   `apps/frontend/modules/{name}/docs` (Frontend module documentation)
2.  **Aggregation**: Content is merged into `src/content/docs/`.
    -   **Sorting**: Folders prefixed with `01-`, `02-`, etc., are sorted numerically, and the prefix is stripped from the final URL.
    -   **Assets/Public**: `docs/assets/` and `docs/public/` folders in modules are merged into the main assets and public directories.
3.  **Sidebar Generation**: A `src/sidebar.json` is automatically generated based on the folder structure.
4.  **Metadata Injection**: Site settings (title, social links) are read from `apps/docs/meta.yaml`.

## ⚙️ Configuration

The documentation site is configured via `apps/docs/meta.yaml`.

```yaml
title: Nexical Ecosystem
social:
  - icon: github
    label: GitHub
    href: https://github.com/nexical/registry
sidebar:
  header:
    - label: Overview
      link: /
  footer:
    - label: Status
      link: https://status.nexical.com
```

-   **title**: The name of the documentation site.
-   **social**: Social media links displayed in the header.
-   **sidebar**: Custom links to inject at the beginning (`header`) or end (`footer`) of the auto-generated sidebar.

## 📝 Writing Documentation

### In a Module
Add a `docs/` directory to your module. Any `.md` or `.mdx` files will be automatically picked up.

```text
apps/backend/modules/auth/
└── docs/
    ├── 01-overview.md  -> /auth/overview/
    └── identity/
        └── setup.md    -> /auth/identity/setup/
```

### Assets
-   **Static Files**: Place in `docs/public/` within your module. Access them via `/filename.ext`.
-   **Images**: Place in `docs/assets/` within your module. Reference them relatively in your markdown: `![Alt](../assets/image.png)`.

## 🧞 Commands

| Command            | Action                                                                              |
| :----------------- | :---------------------------------------------------------------------------------- |
| `npm run gather-docs` | Manually run the aggregation script.                                                |
| `npm run dev`      | Runs `gather-docs`, `generate-llms`, and starts the dev server.                     |
| `npm run build`    | Prepares content and builds the static site to `./dist/`.                          |
| `npm run preview`  | Preview the production build locally.                                              |

## 🤖 AI Context (`llms.txt`)

This project automatically generates context files for LLMs (like ChatGPT or Claude) to help them understand the Nexical Ecosystem.

-   **`/llms.txt`**: A concise map of all documentation.
-   **`/llms-full.txt`**: The entire documentation content in a single file for deep context.

These are updated every time you run `npm run dev` or `npm run build`.
