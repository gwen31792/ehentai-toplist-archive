# AI Coding Agent Instructions

## Project Overview
This is an E-Hentai toplist archive website built with React 19 + Next.js 15, deployed on Cloudflare Pages with Edge Runtime. It displays historical E-Hentai gallery rankings with bilingual support (English/Chinese).

## Architecture & Key Patterns

### Edge Runtime Requirement
**CRITICAL**: All App Router pages and API routes MUST export `runtime = 'edge'` for Cloudflare Workers compatibility:
```typescript
export const runtime = 'edge';
```

### Database Design
- **Cloudflare D1 (SQLite)** with Drizzle ORM
- **Year-partitioned tables**: `toplist_items_2023`, `toplist_items_2024`, `toplist_items_2025`
- **Dynamic table selection** in API routes based on date year (see `src/app/api/data/route.ts`)
- **Join pattern**: toplist tables link to `galleries` table via `gallery_id`

### Development Workflow
```bash
# Essential dev setup (regenerates DB + types)
pnpm dev

# Before any DB work
pnpm generate-db  # Creates local D1 with mock data

# Before deployment
pnpm generate-types  # Updates Cloudflare Workers types
```

### Cloudflare Integration
- Uses `@cloudflare/next-on-pages` adapter
- D1 database binding accessed via `getRequestContext().env.DB`
- Development platform auto-setup in `next.config.mjs`
- Force cache API responses: `{ cache: 'force-cache' }`

### Component Patterns
- **Bilingual state**: Language stored in localStorage, passed down as props
- **Data fetching**: Client-side fetch with loading states (no SSR due to dynamic filtering)
- **Image optimization**: `ImageWithSkeleton` component handles E-Hentai image loading
- **Background preloading**: Hidden `PreloadImage` components for performance

### shadcn/ui Integration
- Tailwind CSS v4 + shadcn/ui components in `src/components/ui/`
- Custom components wrap shadcn/ui: `DataTable`, `DatePicker`, `TypeSelect`
- Theme toggle with dark mode support

## File Structure Rules
- `src/app/` - Next.js App Router (all files need `runtime = 'edge'`)
- `src/components/ui/` - shadcn/ui base components (DO NOT modify)
- `src/components/` - Custom business components
- `src/db/schema.ts` - Drizzle table definitions (year-based tables)
- `src/lib/types.ts` - TypeScript interfaces for Gallery and UI types

## Common Tasks

### Adding New Year Support
1. Add table in `src/db/schema.ts`: `toplistItems{YEAR}Table`
2. Update `tableMap` in `src/app/api/data/route.ts`
3. Update `src/db/mock.sql` with sample data

### Component Development
- Always support both `en` and `zh` languages
- Use `Language` and content objects for translations
- Wrap external images with `ImageWithSkeleton`
- Follow existing pagination patterns in `DataTable`

### Database Queries
- Use Drizzle's `getTableColumns()` to exclude fields from selection
- Always join with `galleriesTable` for complete data
- Order by `rank` for toplist results

Never modify shadcn/ui components directly - create wrapper components instead.
