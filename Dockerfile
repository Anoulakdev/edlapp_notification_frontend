# Base image
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# --- Build Stage ---
FROM base AS builder

COPY package.json ./
COPY pnpm-lock.yam[l] ./

RUN pnpm install

# Copy source and config files
COPY next.config.ts tsconfig.json postcss.config.mjs eslint.config.mjs next-env.d.ts ./
COPY app ./app/
COPY components ./components/
COPY lib ./lib/
COPY public ./public/
COPY schemas ./schemas/

# Copy .env file so Next.js can bake NEXT_PUBLIC_ variables during build
COPY .env ./

# Build Next.js
RUN pnpm run build

# Remove development dependencies
RUN pnpm prune --prod

# --- Production Stage ---
FROM base AS runner

WORKDIR /app

# Copy built app and dependencies
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/.env ./.env

# Expose port (Next.js is configured to 4600 in start script)
EXPOSE 4600

# Set environment variables
ENV PORT=4600
ENV NODE_ENV=production

# Start server
CMD ["pnpm", "run", "start"]
