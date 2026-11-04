# Pharmuse

A bilingual Arabic/English pharmacy learning experience built in the existing Next.js + TypeScript repository.

The professional rebuild lives on `feature/pharmuse-professional-rebuild-2026-11-04`, based on `feature/capsule-mascot-redesign`. Original source assets and the legacy prototype are retained.

## Run

```sh
npm ci
npm run dev
```

## Validate

```sh
npm run typecheck
npm test
npm run build
```

Landing, student dashboard, sequential editorial lessons, local spaced review, practice interaction demonstrations, category search, real local statistics/achievements, and preferences are implemented. QMR7S artwork is a still character with 2D motion treatments, not real-time 3D.

## Operational status

This is a development preview, not a complete production platform. All progress/rewards are browser-local and non-authoritative. Scientific sample lessons await independent approval. Dedicated Supabase creation was blocked by the free-project limit. Account forms and remote features are not activated. Full admin editing/user management is not implemented.

`db/schema.sql` is an **unapplied design blueprint**, not an approved migration or a tested production security model. API routes fail closed without configuration. No service-role key is used in the client. Never import browser XP as trusted server progress.

Copy `.env.example` only after an isolated backend is provisioned and integration-tested. Configure allowed auth redirect URLs, email delivery and staff provisioning before enabling accounts.

Private Drive file identifiers and full source inventory are excluded from Git and public bundles. Never add complete protected books to public assets.

See [Arabic rebuild report](docs/REBUILD-REPORT-AR.md), [audit](docs/REBUILD-AUDIT.md), [scientific review](docs/SCIENTIFIC-REVIEW.md), and [design system](docs/DESIGN-SYSTEM.md).
