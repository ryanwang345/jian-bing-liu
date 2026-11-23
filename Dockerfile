# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# libc6-compat is required by Next.js / sharp native bindings on Alpine.
RUN apk add --no-cache libc6-compat \
  && corepack enable \
  && corepack prepare pnpm@11.0.9 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Keep pnpm store across dependency-layer rebuilds. Limit network concurrency
# and retry transient registry failures. The optional extra-ca secret supports
# TLS-inspecting networks without copying any certificate into the final image.
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store,sharing=locked \
    --mount=type=secret,id=extra-ca,required=false \
    sh -ec 'if [ -s /run/secrets/extra-ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/extra-ca; fi; \
      pnpm config set store-dir /pnpm/store; \
      pnpm install --frozen-lockfile \
        --network-concurrency=5 \
        --fetch-retries=8 \
        --fetch-retry-factor=2 \
        --fetch-retry-mintimeout=1000 \
        --fetch-retry-maxtimeout=30000'

FROM base AS builder
ARG NEXT_PUBLIC_SITE_URL=https://jianbingliu.uk
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN --mount=type=secret,id=extra-ca,required=false \
    sh -ec 'if [ -s /run/secrets/extra-ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/extra-ca; fi; \
      pnpm build'

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache libc6-compat \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=1001:1001 /app/public ./public
COPY --from=builder --chown=1001:1001 /app/.next/standalone ./
COPY --from=builder --chown=1001:1001 /app/.next/static ./.next/static

# Writable cache directory for next/image optimization (mounted as emptyDir in K8s).
RUN mkdir -p /app/.next/cache && chown -R 1001:1001 /app/.next/cache

USER 1001:1001
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/healthz >/dev/null || exit 1

CMD ["node", "server.js"]
