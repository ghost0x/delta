FROM oven/bun:1-debian AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
ENV DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
RUN bun install --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy

RUN bunx prisma generate
RUN bun run next build

# Production image
FROM base AS runner
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN useradd --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/package.json ./package.json

# Copy standalone output
COPY --from=builder --chown=nextjs:root /app/.next/standalone ./
COPY --from=builder --chown=nextjs:root /app/.next/static ./.next/static

# Copy full node_modules for prisma migrate deploy at startup
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/generated ./src/generated

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "bunx prisma migrate deploy && bun server.js"]
