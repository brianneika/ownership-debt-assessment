This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Planning & tasks

This repo tracks its roadmap and work-in-progress as markdown in [`plans/`](plans/) —
a lightweight, in-repo issue tracker:

- [`plans/master-plan.md`](plans/master-plan.md) — the north-star vision for the codebase.
- [`plans/tasks/`](plans/tasks/) — one file per unit of work; start from
  [`TEMPLATE.md`](plans/tasks/TEMPLATE.md).

**Before changing code, work against a task.** If there isn't one yet, define it in
`plans/tasks/` first. See the "Planning workflow" section of
[`AGENTS.md`](AGENTS.md) for the full convention.

## Application Flow

For a full walkthrough of the app — assessment → email capture → CRM record → booking —
including mermaid diagrams and per-stage entry points, see
[plans/application-flow.md](plans/application-flow.md).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
