# ── Stage 1: build ─────────────────────────────────────────────────────────────
FROM oven/bun:1.4.2-slim AS builder

# The oven/bun images define a bun user; the app writes into /app, so stay root.
USER root
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source and build
COPY . .
RUN bun run build

# ── Stage 2: production ────────────────────────────────────────────────────────
FROM oven/bun:1.4.2-slim AS production

USER root
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Runtime library the Minecraft Bedrock Server binary needs (libcurl4)
RUN apt-get update && apt-get install -y --no-install-recommends libcurl4 \
    && rm -rf /var/lib/apt/lists/*

# Copy built output from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Data directory for server files (mount a volume here in production)
RUN mkdir -p /app/data/servers

EXPOSE 3000
EXPOSE 19132/udp
EXPOSE 19133/udp

CMD ["bun", "build/index.js"]
