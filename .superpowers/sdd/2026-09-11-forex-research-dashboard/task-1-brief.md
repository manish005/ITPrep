# Task 1: Project Initialization & Dependencies

## Task Description

Initialize the Next.js 15 project with all required dependencies and configuration.

## Requirements

1. Run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"`
2. Install `surre`, `@tanstack/react-query`
3. Install dev dependencies: `typescript`, `@types/node`, `jest`, `@types/jest`, `ts-jest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `playwright`
4. Run `npx shadcn-ui@latest init` and add components: `button`, `card`, `badge`, `tabs`, `label`, `separator`, `skeleton`
5. Create `.env.local` with `OPENROUTER_API_KEY`, `FIRECRAWL_API_KEY`, `NEXT_PUBLIC_API_BASE_URL`
6. Verify project starts with `npm run dev`

## Files to Create/Modify

- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`
- Create: `.env.local`
- Modify: `package.json` scripts to add `test`, `test:e2e`, `test:all`

## Interfaces

- This is the foundation task. All subsequent tasks depend on this being complete.
- TypeScript strict mode must be enabled.
- Import alias `@/*` must work.

## Global Constraints

- TypeScript strict mode enabled
- Environment variables: `OPENROUTER_API_KEY`, `FIRECRAWL_API_KEY`
- Self-hosted locally
- Polling interval: 60s default
- Pairs: XAUUSD, BTCUSD, EURUSD, GBPJPY, GBPUSD, USDJPY
- Free model tier: `inclusionai/ling-3.0-flash-fin-free`

## Work Directory

F:/Angular

## Before You Begin

This is a mechanical scaffolding task with a complete spec. No questions needed. Just execute the steps.

## Report File

F:/Angular/.superpowers/sdd/2026-09-11-forex-research-dashboard/task-1-report.md
