# Application Flow

This document outlines the end-to-end flow of the Ownership Debt Assessment app:
from landing on the intake form through completing the assessment, capturing an
email, recording the lead in the CRM, and booking a consultation.

## High-level flow

```mermaid
flowchart TD
    Start([Visitor arrives]) --> Landing["/assessment<br/>Intake form: name + business name"]
    Landing -->|createAssessmentSession| Session["Create assessment_sessions row<br/>Save A001 name, A002 business"]
    Session --> SecA["/assessment/[id]/a<br/>Section A"]

    SecA -->|advanceSectionA| DrsProfile["Detect DRS profile from A006"]
    DrsProfile --> SecB["/assessment/[id]/b<br/>Section B"]
    SecB -->|advanceSectionB| Modes["Compute per-workflow modes A/B/C<br/>Refine DRS profile"]
    Modes --> Workflows["/assessment/[id]/c … f<br/>Workflow sections C–F<br/>(questions vary by mode)"]
    Workflows --> SecGH["/assessment/[id]/g … h<br/>Sections G–H"]

    SecGH -->|submitAssessment| Submit["Save free-text Q089/Q090<br/>completeSession()<br/>calculateScores() → dimension_scores"]
    Submit --> Results["/results/[id]"]

    Results --> HasEmail{respondent_email<br/>on session?}
    HasEmail -->|No| Gate["EmailGate<br/>ODS shown as teaser,<br/>DRS gated behind email"]
    HasEmail -->|Yes| Full["FullResults<br/>ODS + DRS + Booking CTA"]

    Gate -->|captureEmail| Capture["Save respondent_email<br/>Re-derive scores"]
    Capture --> Webhook["sendResultsWebhook()<br/>(5s timeout, errors swallowed)"]
    Webhook --> CRM[["POST to LOVABLE_INGEST_URL<br/>HMAC-SHA256 signed payload<br/>= CRM / lead record"]]
    Capture --> Full

    Full --> Booking[["Book a Session CTA<br/>→ Google Calendar link<br/>(off-platform conversion)"]]

    Scores{{"Scores missing?"}}
    Results -.no scores yet.-> Calculating["Calculating… page<br/>(manual refresh)"]

    classDef external fill:#eef,stroke:#66c,color:#223;
    class CRM,Booking external;
```

## Sequence: email capture → CRM record

```mermaid
sequenceDiagram
    participant U as User
    participant EG as EmailGate (client)
    participant CA as captureEmail (server action)
    participant DB as Supabase
    participant WH as sendResultsWebhook
    participant CRM as Lovable Ingest (CRM)

    U->>EG: Enter email, submit
    EG->>EG: Validate ("@" and ".")
    EG->>CA: captureEmail(sessionId, email)
    CA->>DB: UPDATE assessment_sessions SET respondent_email
    CA->>DB: calculateScores(sessionId) — re-derive from rows
    CA->>WH: sendResultsWebhook(sessionId, scoring, email)
    Note over CA,WH: Wrapped in Promise.race with 5s timeout;<br/>errors logged, never block the UI
    WH->>DB: Read session modes, answers, dimension_scores
    WH->>WH: Build result.completed payload
    WH->>WH: HMAC-SHA256(secret, "{timestamp}.{body}")
    WH->>CRM: POST LOVABLE_INGEST_URL (signed headers)
    CRM-->>WH: 2xx / error (logged only)
    CA-->>EG: return
    EG->>U: Unlock full results + Booking CTA
```

## Key steps

| Stage | Entry point | What happens |
| --- | --- | --- |
| **Intake** | `src/app/assessment/page.tsx` → `createAssessmentSession` (`actions.ts`) | Creates session, saves name (A001) + business (A002), redirects to Section A. |
| **Sections A–H** | `src/app/assessment/[sessionId]/{a…h}/page.tsx` | Answers saved as-you-go via `saveRadioAnswer`. Section A sets DRS profile; Section B computes per-workflow modes that branch questions in C–F. |
| **Submit** | `submitAssessment` (`actions.ts:144`) | Saves free-text (Q089/Q090), `completeSession()`, `calculateScores()` → `dimension_scores`, redirects to results. **No webhook here.** |
| **Results** | `src/app/results/[sessionId]/page.tsx` | Loads scores. No scores → Calculating page. Has email → `FullResults`; no email → `EmailGate`. |
| **Email capture** | `captureEmail` (`results/[sessionId]/actions.ts`) | Saves `respondent_email`, re-derives scores, fires webhook (5s timeout, errors swallowed). |
| **CRM record** | `sendResultsWebhook` (`src/lib/webhook.ts`) | Builds signed `result.completed` payload, POSTs to `LOVABLE_INGEST_URL`. Requires `LOVABLE_INGEST_URL` + `VAI_SIGNING_SECRET`. |
| **Conversion** | `BookingCTA` (`EmailGate.tsx`) | "Book a Session" → Google Calendar link. No in-app payment; the sale happens in the booked call. |

## Notes & caveats

- **CRM record is tied to the email gate, not to completion.** A completed assessment
  with no email entered stores scores in Supabase but sends **nothing** to the CRM.
  The webhook has exactly one trigger: `captureEmail`.
- **Fire-and-forget delivery.** The webhook runs under a 5s timeout with swallowed
  errors — a CRM outage silently drops the lead (visible only in server logs). No
  retry or queue. The email is still saved in Supabase, so it could be re-driven.
- **Webhook is a no-op without env config.** If `LOVABLE_INGEST_URL` or
  `VAI_SIGNING_SECRET` is unset (e.g. local dev), `sendResultsWebhook` returns early.
- **Email validation is superficial** — client-side `includes('@')` only; no
  server-side validation before persisting or sending onward.
- **"Purchase" is a booking, not a transaction.** Conversion is a Google Calendar
  consultation link; monetization happens off-platform.
