# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy monorepo configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy package sources and API app source
COPY packages ./packages
COPY apps/api ./apps/api

# Install monorepo dependencies
RUN pnpm install --frozen-lockfile

# Build dependencies and Fastify API app
RUN pnpm --filter @boardgametime/api build

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy full workspace build artifacts and node_modules from builder
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api ./apps/api

EXPOSE 3000

CMD ["node", "apps/api/dist/server.js"]
