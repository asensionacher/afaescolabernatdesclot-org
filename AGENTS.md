# AGENTS.md - Developer Guide for AMPA Bernat Desclot Website

This document provides guidelines for AI coding agents and developers working on this codebase.

## Project Overview

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **CMS**: Sanity v3
- **i18n**: next-intl (5 languages: ca, es, en, ar, ur)
- **Styling**: CSS Modules
- **Package Manager**: pnpm
- **Deployment**: Vercel

## Build & Development Commands

```bash
# Development
pnpm dev                    # Start dev server at http://localhost:3000

# Build & Production
pnpm build                  # Build for production (includes type checking)
pnpm start                  # Start production server

# Code Quality
pnpm lint                   # Run ESLint
pnpm lint --fix             # Fix auto-fixable lint issues

# Note: No test suite configured yet
```

## Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── [locale]/          # i18n routes (ca, es, en, ar, ur)
│   │   ├── page.tsx       # Homepage
│   │   ├── blog/          # Blog pages
│   │   └── layout.tsx     # Locale-specific layout
│   ├── sitemap.ts         # Dynamic sitemap generation
│   ├── favicon.ico        # Favicon (Next.js convention)
│   └── icon.png           # App icon
├── components/            # Shared React components
├── lib/                   # Utility functions & API clients
├── i18n/                  # Internationalization config
├── sanity/                # Sanity client configuration
└── middleware.ts          # i18n middleware

messages/                  # Translation files (ca.json, es.json, etc.)
schemas/                   # Sanity schema definitions
public/                    # Static assets
```

## Code Style Guidelines

### TypeScript

- **Strict Mode**: Enabled - always provide types
- **Interfaces over Types**: Use `interface` for object shapes
- **No `any`**: Avoid `any` type; use `unknown` if necessary
- **Explicit Return Types**: For exported functions

```typescript
// ✅ Good
export interface Post {
  _id: string
  title: Record<string, string>
}

export async function getPost(slug: string): Promise<Post | null> {
  // implementation
}

// ❌ Bad
export function getPost(slug) {
  // missing types
}
```

### Imports

**Order:**
1. React/Next.js imports
2. Third-party libraries
3. Internal aliases (@/)
4. Relative imports
5. CSS modules (always last)

```typescript
// ✅ Good
import { getTranslations } from 'next-intl/server';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Link } from '@/i18n/routing';
import { getUpcomingEvents } from '@/lib/sanity';
import styles from './page.module.css';

// ❌ Bad - mixed order
import styles from './page.module.css';
import { Link } from '@/i18n/routing';
import Navigation from '@/components/Navigation';
```

**Use Path Aliases**: Always use `@/` for src imports

```typescript
// ✅ Good
import { client } from '@/sanity/client';

// ❌ Bad
import { client } from '../../../sanity/client';
```

### Component Conventions

**Client vs Server Components:**
- Default to Server Components (no 'use client')
- Use `'use client'` only when necessary (useState, useEffect, event handlers)

```typescript
// Server Component (default)
export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // ...
}

// Client Component (when needed)
'use client';
export default function Navigation({ locale }: { locale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  // ...
}
```

**Naming:**
- Components: PascalCase (e.g., `Navigation.tsx`)
- Files: kebab-case or PascalCase (match component name)
- CSS Modules: match component name (e.g., `Navigation.module.css`)

### Async/Await Patterns

Always use `await params` in Next.js 15 App Router:

```typescript
// ✅ Good
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
}

// ❌ Bad
export default async function Page({ params }: { params: { locale: string } }) {
  const { locale } = params; // Will error in Next.js 15
}
```

### Internationalization (i18n)

**Supported Locales**: `ca` (default), `es`, `en`, `ar`, `ur`

```typescript
// Type-safe locale
type Locale = 'ca' | 'es' | 'en' | 'ar' | 'ur';

// Use translations
const t = await getTranslations('namespace');
const title = t('key');

// Multilingual content from Sanity
const title = post.title?.[locale as keyof typeof post.title] || post.title?.ca || '';
```

**RTL Support**: Arabic (`ar`) and Urdu (`ur`) use RTL direction automatically.

### Metadata & SEO

Always implement `generateMetadata` for SEO:

```typescript
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: 'Page Title',
    description: 'Page description',
    openGraph: {
      title: 'OG Title',
      description: 'OG Description',
      images: [{ url: imageUrl, width: 1200, height: 630 }],
      locale: locale,
    },
  };
}
```

### CSS Modules

- One CSS module per component
- Use CSS custom properties (defined in `globals.css`)
- Mobile-first responsive design

```css
/* Use CSS variables */
.button {
  background: var(--color-primary);
  border-radius: var(--radius);
  transition: var(--transition);
}

/* Mobile-first */
.container {
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}
```

### Error Handling

```typescript
// ✅ Good - explicit error handling
try {
  const post = await client.fetch(query, { slug });
  return post;
} catch (error) {
  console.error('Error fetching post:', error);
  return null;
}

// Use notFound() for 404s
if (!post) {
  notFound();
}
```

## Sanity CMS

- **Project ID**: `cpaqkfmb`
- **Dataset**: `production`
- **Studio**: Available at `/studio`

**Content Types:**
- `event`: Events with `eventDate`, multilingual fields, optional `externalUrl`
- `post`: Blog posts with `publishedAt`, `mainImage`, multilingual fields

## Environment Variables

Required variables (see `.env.local.example`):

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=cpaqkfmb
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-21
SANITY_API_TOKEN=<token>
NEXT_PUBLIC_GA_ID=<ga-id>
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## Git Workflow

```bash
# Make changes
git add -A
git commit -m "feat: descriptive message"
git push origin main
```

**Commit Message Format:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding tests

## Common Pitfalls

1. ❌ Don't forget `'use client'` for interactive components
2. ❌ Don't use `params` directly without `await` in Next.js 15
3. ❌ Don't forget multilingual fallbacks (always fallback to `ca`)
4. ❌ Don't hardcode text - use translations
5. ❌ Don't place favicons in `/public` - use `/src/app/`

## Resources

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Sanity.io Docs](https://www.sanity.io/docs)
- [next-intl Docs](https://next-intl-docs.vercel.app/)
