# Delta

Business Requirements Management application.

## Tech Stack

- **Framework**: Next.js 16 (React 19, RSC enabled)
- **Runtime/Package Manager**: Bun
- **Language**: TypeScript
- **Database**: PostgreSQL via `pg` with Prisma 7 (`@prisma/adapter-pg`)
- **Auth**: better-auth
- **UI**: shadcn/ui (new-york style), Tailwind CSS 4, Radix UI
- **Icons**: Tabler Icons, Lucide
- **Forms**: React Hook Form + Zod
- **Tables**: TanStack React Table
- **Drag & Drop**: dnd-kit
- **Charts**: Recharts
- **Email**: Resend + React Email
- **AI**: Anthropic SDK (Claude)

## Deployment

- Deployed on Railway using bun
- When adding or removing dependencies, always run `bun install` to regenerate `bun.lock` before committing. Railway uses `bun install --frozen-lockfile` and will fail if the lockfile is stale.
