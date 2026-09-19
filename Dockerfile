# ── Stage 1: build ─────────────────────────────────────────────────────────────
FROM node:24-bookworm-slim AS builder

# Bun provides the package manager and build tool; Node still runs the app.
COPY --from=oven/bun:1.4.2 /usr/local/bin/bun /usr/local/bin/bun

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source and build
COPY . .
RUN bun run build


# ── Stage 2: production ────────────────────────────────────────────────────────
FROM node:24-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Install dependencies for Minecraft Bedrock Server (libcurl4)
RUN apt-get update && apt-get install -y libcurl4 && rm -rf /var/lib/apt/lists/*

# Copy built output from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Data directory for server files (mount a volume here in production)
RUN mkdir -p /app/data/servers

EXPOSE 3000
EXPOSE 19132/udp
EXPOSE 19133/udp

CMD ["node", "build/index.js"]
