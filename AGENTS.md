# Repository Guidelines

## Project Structure & Modules
- `pages/`: Next.js (Pages Router) pages and API routes under `pages/api/*`.
- `components/`: Reusable UI (e.g., `components/ui/button.tsx`) and auth widgets.
- `lib/`: Client libraries (e.g., `lib/supabaseClient.ts`).
- `styles/`: Global CSS (`styles/globals.css`).
- `supabase/`: SQL and metadata (e.g., `supabase/schema.sql`).
- Config: `next.config.js`, `tailwind.config.ts`, `.eslintrc.json`, `tsconfig.json`.

## Build, Test, and Development
- `npm run dev` — Start local dev at `http://localhost:3000`.
- `npm run build` — Production build (Next.js).
- `npm start` — Run the built app.
- `npm run lint` — ESLint (Next Core Web Vitals rules).
- `npm run typecheck` — TypeScript checks (no emit).

## Coding Style & Naming
- TypeScript, strict mode on; 2‑space indentation.
- React components use PascalCase (`MyComponent.tsx`); hooks/useful utils in `lib/` use camelCase.
- Paths use TS aliases: `@/components/*`, `@/lib/*`, etc.
- TailwindCSS for styling; prefer utility classes over custom CSS.
- ESLint extends `next/core-web-vitals`; fix warnings before PR.

## Testing Guidelines
- No test framework is configured yet. If adding tests, prefer Vitest/RTL or Playwright.
- Co‑locate unit tests next to files as `*.test.ts(x)` or in `tests/` mirroring structure.
- Target critical auth and API flows first; aim for meaningful coverage over total %.

## Commit & Pull Requests
- Commits: short, imperative (“Add Google OAuth button”). Group related changes.
- Branches: feature branches per change (`feat/google-oauth-button`).
- PRs: clear description, linked issue, steps to verify, and screenshots for UI.
- Keep diffs focused; update docs and configs when behavior changes.

## Security & Configuration
- Required env vars (Vercel → Project → Settings → Environment Variables):
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Do not commit secrets (Google OAuth client secrets, service role keys).
- Supabase Auth redirect URLs must include local and production domains.

## Agent Notes
- Follow this guide when editing files within the repo.
- If you add new modules, respect the existing structure/naming and update this file when patterns change.
