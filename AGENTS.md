# AGENTS.md - AFA Bernat Desclot Website

## Stack

- **Framework**: Next.js 15 (App Router) + TypeScript 5 (strict mode)
- **CMS**: Sanity v3 (Studio at `/studio`, project `cpaqkfmb`, dataset `production`)
- **i18n**: next-intl (locales: `ca` [default], `es`, `en`, `ar`, `ur`)
- **Styling**: CSS Modules (mobile-first), no Tailwind
- **PDF**: jsPDF + pdf-lib
- **Package Manager**: pnpm
- **Deployment**: Vercel

## Commands

```bash
pnpm dev          # Dev server at localhost:3000 (Studio at /studio)
pnpm build        # Production build (includes type check + lint)
pnpm start        # Start production server
pnpm lint         # ESLint (uses eslint-config-next defaults, no custom config)
pnpm lint --fix   # Auto-fix lint issues

# Lint a single file
npx next lint --file src/path/to/file.tsx

# Clean rebuild
rm -rf .next && pnpm build

# No test suite configured. No Prettier configured.
```

## Project Structure

```
src/
  app/
    layout.tsx, page.tsx          # Root layout + redirect to /ca
    robots.ts, sitemap.ts         # SEO
    [locale]/                     # i18n pages (see routes below)
    api/                          # API routes (outside i18n)
    studio/[[...tool]]/           # Sanity Studio
    actas/                        # Meeting minutes (password-protected, outside i18n)
  components/                     # 14 React components (each with .module.css)
  lib/
    sanity.ts                     # Sanity client, interfaces, all GROQ queries
    auth.ts                       # JWT auth (jose), bcrypt, rate limiting, sessions
    generateActaPDF.ts            # PDF generation for meeting reports
  i18n/
    routing.ts                    # Locale config, exports Link/redirect/usePathname/useRouter
    request.ts                    # Server-side locale resolution
  sanity/client.ts                # Sanity client + urlFor() image helper
  middleware.ts                   # next-intl middleware (excludes /studio, /actas)
schemas/                          # Sanity schemas (event, post, meetingReport, youtube, inlineImage)
messages/                         # Translation JSON files (ca.json, es.json, en.json, ar.json, ur.json)
```

**Locale routes** under `[locale]/`: `/` (home), `/blog`, `/blog/[slug]`, `/calendario`, `/inscripcion`, `/cookies-policy`, `/legal`, `/privacy`

**API routes**: `/api/register` (POST), `/api/calendar.ics` (GET), `/api/meeting-minutes` (GET/POST), `/api/meeting-minutes/[id]` (PATCH/DELETE), `/api/meeting-minutes/[id]/close` (POST), `/api/meeting-minutes/[id]/pdf` (GET)

## TypeScript

- Strict mode is ON. Always provide types; never use `any` (use `unknown` if needed).
- Use `interface` for object shapes, not `type` aliases for objects.
- Exported functions must have explicit return types.
- Path alias: always use `@/` for `src/` imports (never relative `../`).

## Import Order

1. React / Next.js imports
2. Third-party libraries
3. Internal `@/` aliases
4. Relative imports
5. CSS modules (always last)

```typescript
import { getTranslations } from 'next-intl/server';
import Navigation from '@/components/Navigation';
import { Link } from '@/i18n/routing';
import styles from './page.module.css';
```

## Component Conventions

- **Default to Server Components** (no `'use client'`). Only add `'use client'` when you need hooks or event handlers.
- **Next.js 15 params**: Always `await` the `params` prop -- it's a `Promise`.
  ```typescript
  export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
  }
  ```
- **Naming**: PascalCase for components (`Navigation.tsx`), matching CSS module (`Navigation.module.css`).
- **SEO**: Every page should export `generateMetadata` with title, description, and openGraph.

## Internationalization

- 5 locales: `ca` (default, no URL prefix), `es`, `en`, `ar`, `ur`
- RTL: `ar` and `ur` use right-to-left direction automatically.
- Always fallback to `ca` for multilingual Sanity content:
  ```typescript
  const title = post.title?.[locale] || post.title?.ca || '';
  ```
- Never hardcode user-visible text. Use `getTranslations('namespace')` and translation keys.
- Add new strings to all 5 `messages/*.json` files.

## CSS Modules

- One `.module.css` per component. Use CSS custom properties from `globals.css`.
- Mobile-first: base styles for mobile, then `@media (min-width: 768px)` for desktop.
- No Tailwind, no styled-components for page components (styled-components is only for Sanity Studio).

## Sanity CMS

- **Schema types**: `event`, `post`, `meetingReport` (documents); `localeString`, `localeText`, `localeBlockContent`, `youtube`, `inlineImage` (objects)
- Multilingual fields use `localeString`/`localeText`/`localeBlockContent` objects with `ca`, `es`, `en`, `ar`, `ur` subfields.
- `meetingReport` is NOT multilingual (Catalan only, used internally).
- Client config in `src/sanity/client.ts`; queries and interfaces in `src/lib/sanity.ts`.

## Error Handling

- Wrap Sanity fetches in try/catch; log errors with `console.error`; return `null` on failure.
- Use `notFound()` from `next/navigation` for missing content (404).
- API routes for meeting-minutes require JWT auth via `isAuthenticated()` from `@/lib/auth`.
- Registration API route: `maxDuration = 60`, `dynamic = 'force-dynamic'`.

## Environment Variables

Required in `.env.local` (see `.env.local.example`):
- `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, `SANITY_API_TOKEN`
- `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_BASE_URL`
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`

## Git Commits

Use conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`

## Common Pitfalls

1. Forgetting `'use client'` for interactive components.
2. Not `await`-ing `params` in Next.js 15 page/layout props.
3. Missing multilingual fallbacks (always fall back to `ca`).
4. Hardcoding text instead of using translation keys.
5. Placing favicons in `/public` instead of `/src/app/`.
6. Using relative imports instead of `@/` path alias.
7. Forgetting to add translation strings to all 5 locale JSON files.
