# Replace Lovable CRM with HubSpot

**Status:** Done (2026-07-18) — verified end-to-end locally and in production <!-- Not started | In progress | Blocked | Done -->

## Objective

Rip out the Lovable CRM webhook entirely and instead create/update a HubSpot
contact (email, name, company, plus a link to the admin results page) whenever a
respondent submits their email on the results page.

## Decisions (agreed 2026-07-17)

- **Integration:** HubSpot Contacts API via a private-app access token (server-side).
- **Payload:** contact info + results link only — **no** score data in HubSpot.
  Scores stay in Supabase; the full picture lives at `/admin/sessions/[sessionId]`.
- **Removal:** delete the Lovable code and env vars completely. Git history is the
  archive if we ever go back to Lovable — leave no dormant code behind.

## Methods / background

Read [application-flow.md](../application-flow.md) ("Sequence: email capture → CRM
record") first — the trigger point and failure semantics there must be preserved.
Also read the relevant guides in `node_modules/next/dist/docs/` (server actions)
before writing code — this Next.js version differs from convention.

Current Lovable footprint (all of it):

| Where | What |
| --- | --- |
| `src/lib/webhook.ts` | `sendResultsWebhook` — builds signed payload, POSTs to `LOVABLE_INGEST_URL`. Delete the file. |
| `src/app/results/[sessionId]/actions.ts` | `captureEmail` — the only caller. Swap in the HubSpot call. |
| `.env.local.example` | `LOVABLE_INGEST_URL`, `LOVABLE_API_KEY` (unused in code), `VAI_SIGNING_SECRET` (only used by webhook.ts). Remove all three; also scrub from `.env.local` / Vercel env. |
| `plans/application-flow.md` | Documents the Lovable flow — update diagrams + tables. |
| `docs/question-bank-export.md` | Two prose mentions of `LOVABLE_INGEST_URL` (~lines 657, 696) — update wording. |

### Behavior to preserve (from the current integration)

- CRM sync fires **only on email capture**, not on assessment completion.
- CRM failures are logged and never block the respondent's UX (keep the 5s
  timeout race in `captureEmail`).
- Missing env config → silent no-op (so local dev works with no HubSpot account).

### HubSpot specifics

- New env vars: `HUBSPOT_ACCESS_TOKEN` (private app token), `APP_BASE_URL`
  (to build the absolute admin results link).
- Use the contacts **upsert-by-email** pattern so repeat respondents update
  rather than duplicate: `POST /crm/v3/objects/contacts/batch/upsert` with
  `idProperty: "email"` (or single-record equivalent).
- Standard properties: `email`, `firstname`/`lastname` (split full name from
  answer A001 on first space), `company` (A002).
- One custom contact property to link results: `assessment_results_url`
  (single-line text) → `{APP_BASE_URL}/admin/sessions/{sessionId}`. Note the
  link is behind admin login — fine, it's for internal use.

### Manual setup in HubSpot (Bri, before/alongside the code)

1. Create a **private app** (Settings → Integrations → Private Apps) with scopes
   `crm.objects.contacts.read` + `crm.objects.contacts.write`; copy the token.
2. Create the custom contact property `assessment_results_url` (single-line text)
   in the Contact Information group.

## Implementation steps

- [x] Create `src/lib/hubspot.ts` with `upsertHubspotContact(sessionId, email, fullName, companyName)` — no-op without env vars, errors logged not thrown.
- [x] Update `captureEmail` in `src/app/results/[sessionId]/actions.ts` to call it (keep timeout race + try/catch).
- [x] Delete `src/lib/webhook.ts`.
- [x] Env cleanup: update `.env.local.example` (remove Lovable vars, add `HUBSPOT_ACCESS_TOKEN`, `APP_BASE_URL`); `.env.local` had no Lovable vars to remove. **Vercel env cleanup still manual (Bri).**
- [x] Update `plans/application-flow.md` (flowchart, sequence diagram, integration table, failure-mode notes).
- [x] Fix the two Lovable mentions in `docs/question-bank-export.md` (also updated the stale `webhook.ts` table row at ~line 654).
- [x] Verify end-to-end: complete an assessment locally, submit email, confirm the contact (with results link) appears in HubSpot; confirm no-email completion sends nothing. Verified 2026-07-18 (see Progress).

## Out of scope (follow-ups)

- Syncing scores/bands into HubSpot as custom properties (revisit if sales wants
  segmentation/automation on scores).
- Retry/queue for failed HubSpot calls — today a CRM outage silently drops the
  lead (same as Lovable behavior); a durable outbox is a separate task.
- Backfilling past respondents into HubSpot.

## Progress

Running log — check things off and note decisions as you go.

- 2026-07-17 — Implemented all code + doc changes. `npx tsc --noEmit` and
  `npm run build` pass; no Lovable references remain in `src/`, `docs/`, or env
  files. Decisions made along the way:
  - `src/lib/hubspot.ts` is a plain server module, **not** a `'use server'` file
    (the old `webhook.ts` was one, which made it a publicly POST-able endpoint;
    the sync is only ever invoked from the `captureEmail` server action).
  - Dropped the `calculateScores(sessionId)` call from `captureEmail`: it existed
    only to build the Lovable payload (scores were already persisted by
    `submitAssessment`), and HubSpot receives no scores. `captureEmail` now reads
    just the A001/A002 answers and passes them to the upsert.
  - Upsert only sends `firstname`/`lastname`/`company` when non-empty, so a repeat
    respondent with a blank name answer can't wipe existing HubSpot values.
  - No-op requires **both** `HUBSPOT_ACCESS_TOKEN` and `APP_BASE_URL` (mirrors the
    old two-var Lovable gate); trailing slashes on `APP_BASE_URL` are tolerated.
- 2026-07-17 (later) — HubSpot manual setup done in the Vail portal (246788887):
  - Private apps now live under **Development → Legacy Apps** ("Create legacy
    app" → Private); HubSpot pushes new "Service Keys" instead — we stayed on
    the agreed private-app token. Consider migrating to a Service Key as a
    follow-up (legacy apps get no new scopes/features).
  - Bri created the private app herself (scopes:
    `crm.objects.contacts.read` + `crm.objects.contacts.write`).
  - Created contact property **Assessment results URL**
    (`assessment_results_url`, single-line text, Contact information group) via
    browser automation — confirmed created.
- 2026-07-17 (later still) — Vercel env cleanup done (project
  `ownership-assessment` in the vai4 team): deleted `LOVABLE_INGEST_URL` +
  `VAI_SIGNING_SECRET`, added `APP_BASE_URL=https://ownership-assessment-delta.vercel.app`
  (Production and Preview).
- 2026-07-18 — Local end-to-end verify **passed** (browser automation):
  - Fixed `.env.local` paste glitch (HubSpot token was on a bare line without the
    `HUBSPOT_ACCESS_TOKEN=` prefix); restarted the stale dev server so the new
    env loaded.
  - Completed a full assessment as "Test Claude" / "HubSpot Sync Test Co"
    (session `48b740f1-9415-436b-a4b3-7eed3f2368f7`, all worst-case answers →
    Ownership Debt 100/100, Delegation Readiness 0/100).
  - Submitting the assessment alone sent nothing to HubSpot (no sync call until
    email capture — as designed).
  - Entering `brianne+claude-sync-test@workmansuccess.com` at the email gate
    created HubSpot contact **521420345051** with correct
    firstname/lastname/company and `assessment_results_url`
    (`http://localhost:3000/admin/sessions/…` — localhost because local
    `APP_BASE_URL`; prod builds from the Vercel value). `captureEmail` completed
    in ~1.3s, no errors logged. Test contact can be deleted from HubSpot.
- 2026-07-18 (later) — **Prod was silently broken, now fixed and verified.**
  Bri had added `HUBSPOT_ACCESS_TOKEN` + `APP_BASE_URL` to Vercel and redeployed,
  but a prod test submission produced no HubSpot contact and no error logs. Root
  cause: the HubSpot code had never been committed — it was sitting uncommitted
  in the working tree, so the redeploy shipped the old Lovable code (whose env
  vars were gone → silent no-op by design). Fix: committed the task (`c7b6879`),
  pushed to `main` (note: the Vercel project is **not** git-connected — deploys
  are CLI-only via `vercel --prod`), deployed, and re-verified end-to-end on
  prod: contact **521510905572** created for
  `brianne+claude-prod-test@workmansuccess.com` with the correct
  `https://ownership-assessment-delta.vercel.app/admin/sessions/…` results link.
  Both test contacts (521420345051 local-URL, 521510905572 prod) can be deleted
  from HubSpot.
