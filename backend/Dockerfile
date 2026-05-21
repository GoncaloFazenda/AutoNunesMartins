# syntax=docker/dockerfile:1.7
# Multi-stage Dockerfile for the Express + Prisma backend.
# Built to be deployed on Fly.io but works on any container runtime.

ARG NODE_VERSION=20-alpine

# ─── Stage 1: deps + build ────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS builder

# Yarn 4 via Corepack
RUN corepack enable

WORKDIR /repo

# Copy workspace root + shared types + backend manifests for cacheable install
COPY package.json yarn.lock .yarnrc.yml ./
COPY shared/types/package.json ./shared/types/
COPY backend/package.json ./backend/

# Mark the frontend workspace as a noop placeholder so the install
# resolves the workspace tree without pulling SvelteKit deps.
RUN mkdir -p frontend && \
    printf '{"name":"@anm/frontend","version":"0.0.0","private":true}\n' > frontend/package.json

RUN yarn install --immutable --inline-builds

# Copy backend + shared sources
COPY shared/types/ ./shared/types/
COPY backend/ ./backend/

# Generate Prisma client + compile TypeScript
RUN yarn workspace @anm/backend prisma generate
RUN yarn workspace @anm/backend build

# ─── Stage 2: production runtime ──────────────────────────────────────────
FROM node:${NODE_VERSION} AS runtime

ENV NODE_ENV=production
ENV PORT=4000

# Install runtime tools: openssl for Prisma engine, tini for clean signal handling
RUN apk add --no-cache openssl tini

RUN corepack enable

WORKDIR /app

# Copy compiled output + node_modules + Prisma artifacts from builder
COPY --from=builder /repo/package.json /repo/yarn.lock /repo/.yarnrc.yml ./
COPY --from=builder /repo/shared ./shared
COPY --from=builder /repo/backend/package.json ./backend/
COPY --from=builder /repo/backend/dist ./backend/dist
COPY --from=builder /repo/backend/prisma ./backend/prisma
COPY --from=builder /repo/node_modules ./node_modules

# Drop dev-only deps to slim the image (skip if you need prisma migrate at runtime)
RUN yarn workspaces focus @anm/backend --production || true

EXPOSE 4000

# Use tini as PID 1 so SIGTERM cleanly stops node
ENTRYPOINT ["/sbin/tini", "--"]

# Run pending migrations before starting the server so deploys are zero-touch
CMD sh -c "yarn workspace @anm/backend prisma migrate deploy && node backend/dist/index.js"
