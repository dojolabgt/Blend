FROM node:20-alpine AS base
# Build tools needed for native addons (e.g. bcrypt)
RUN apk add --no-cache python3 make g++

# ── Dependencies (all, including dev for nest CLI) ────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Builder ───────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── Production node_modules only ─────────────────────────────────────────────
FROM base AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ── Runner ────────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/src/main"]
