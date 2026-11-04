# Pharmuse rebuild audit — 2026-11-04

Base: `feature/capsule-mascot-redesign`, commit `6ea78246f9ec195913c2b1630caf123c60df81d3`.
Independent branch: `feature/pharmuse-professional-rebuild-2026-11-04`.

## Findings
- Next.js and TypeScript already exist. Preserve repository and history; no separate product.
- Three sample lessons only; scientific editorial approval missing.
- All learning state was client-local; no auth, RLS, admin or cross-device sync.
- Approximate SVG mascot substituted for the actual supplied character.
- Emoji navigation, duplicated home sections, little mobile-specific design.
- Unknown lesson IDs in local storage could inflate XP.
- Wrong answers on incomplete lessons were excluded from due reviews.
- Unlimited repeated review submissions could inflate spacing.
- No lockfile or behavioral tests in the original branch.
- Legacy index.html coexists with Next.js. Retained, no original assets deleted.

## External services
Vercel existing project: pharmuse. Production must remain untouched; preview deployment only.
Supabase independent project creation attempted with user choice: free tier limit reached (2 active projects). No other project was paused, deleted, or modified. Auth, remote progress, and privileged administration cannot be called operational until an isolated database is available and validated.

## Scientific sources
Metadata inventory covers 24 direct category folders. Files may include duplicates and nested folders; counts represent direct listed entries, not reviewed books. Source contents, rights, edition dates and page mappings require review. Never expose private source inventory through the public bundle. No whole books are copied into public assets. The full connected inventory is excluded from Git, public assets, and frontend bundles. The source inventory API reads the future protected database only, requires a validated staff session, and fails closed when configuration is missing. Automated approval correctly blocked the initial push containing private Drive identifiers; the inventory was removed before publication.
