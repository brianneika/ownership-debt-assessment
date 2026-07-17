<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Planning workflow (`plans/`)

This repo tracks its roadmap and work-in-progress as markdown in `plans/` — a
lightweight issue tracker that lives in the repo:

- **`plans/master-plan.md`** — the north-star vision for the codebase. Read it first;
  it's the "why" every task should ladder up to.
- **`plans/tasks/`** — one file per unit of work (a feature, fix, or refactor). Each
  task file defines the scope and tracks progress as it's implemented. Start from
  `plans/tasks/TEMPLATE.md`.
- **`plans/*.md`** (e.g. `application-flow.md`) — longer-lived reference docs.

## Before you start changing code

**Always work against a task.** If you're asked to build or change something and
there's no task file for it yet, don't dive straight into edits. Pause and say
something like:

> "I don't see a task for this in `plans/tasks/` yet. Want me to help define one
> before we start making changes?"

Then either point to the existing task, or draft a new one from
`plans/tasks/TEMPLATE.md` and confirm the goal and scope with the user *before*
writing code. (Trivial one-offs — a typo, a one-line tweak — don't need a task; use
judgment.)

## Working a task

1. Read `plans/master-plan.md` and the relevant task file before editing.
2. Keep the task file current as you go: check off steps, record decisions and
   deviations, and note follow-ups. **The task file — not the chat history — is the
   source of truth for status.**
3. When the work is done, set the task's status to `Done` (with the date) rather than
   deleting the file. Completed tasks are the project's history.

## Creating a task

Copy `plans/tasks/TEMPLATE.md` to `plans/tasks/<short-kebab-name>.md` and fill it in
with the user. A good task has a one-sentence **Objective** and a **Methods /
background** section that points at the right files and the relevant part of the
master plan.

**Interview the user before you write the task doc — don't just transcribe the first
ask.** Ask clarifying questions until the objective and the intended user experience
are genuinely clear, then draft the doc. Probe things like:

- **What & why** — what does "done" look like, and what problem does it solve? How
  does it ladder up to the master plan?
- **User experience** — who's the user here, what should the flow feel like from
  their side, and what are the edge cases or states we need to handle?
- **Scope** — what's explicitly in vs. out for this task? What's a follow-up?
- **Where it lives** — which files/areas are involved, and are there existing
  patterns to follow?

Ask a few at a time, reflect the answers back, and only write the task file once the
two of you agree on the shape. It's fine to say "before I write this up, a few
questions…"
