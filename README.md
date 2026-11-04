# Pharmuse 💜

An original, playful bilingual (Arabic/English) pharmacology learning prototype.

## Run
Open `index.html` in a modern browser. No build step or credentials required.

## Included in V1 prototype
- Responsive home dashboard and lesson path
- Three introductory pharmacology lessons with explanations and feedback
- Lesson completion, XP and progress stored in browser localStorage
- Review and progress pages
- Arabic/English language toggle with RTL/LTR
- Dark mode
- Account screen **preview only** (disabled inputs; no credentials collected)

## Important limitations
This is a **static prototype**, not a deployed production learning platform. It does not include real authentication, a backend, Google Drive content ingestion, AI tutoring, scientific review workflows, admin tools, or synchronized progress. Sample lesson content is illustrative and must be independently reviewed before publication. This is educational content, not clinical prescribing guidance.

## Next implementation milestones
1. Migrate to Next.js/TypeScript with tested components and accessibility checks.
2. Set up Supabase Auth and PostgreSQL with row-level security and migrations.
3. Build curriculum, lesson, question, answer-attempt, mastery and source-citation schemas.
4. Audit the private Pharmuse Drive reference library for licensing, provenance, duplicates, editions and scientific accuracy; publish only approved original or licensed material.
5. Build editorial/admin review, automated tests, staging and release pipelines.
6. Deploy a preview and verify mobile/desktop behavior before production launch.

The project is independent from Farmakon. Do not upload copyrighted reference books into this public repository.
