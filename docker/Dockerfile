FROM registry.access.redhat.com/ubi10/nodejs-24:latest AS deps
WORKDIR /app
USER 0
RUN npm install -g bun
COPY src/package.json src/bun.lock ./
RUN bun install --frozen-lockfile
USER 1001

FROM registry.access.redhat.com/ubi10/nodejs-24:latest AS builder
WORKDIR /app
USER 0
RUN npm install -g bun
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY src/ .
RUN bun run build
USER 1001

FROM registry.access.redhat.com/ubi10/nodejs-24-minimal:latest AS runner
WORKDIR /app
USER 0

# Install PostgreSQL client for health checks and Bun for migrations
RUN microdnf install -y postgresql && microdnf clean all
RUN npm install -g bun

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy database migrations and configuration
COPY --from=builder /app/lib/db/migrations ./lib/db/migrations
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/node_modules ./node_modules

# Copy entrypoint script
COPY docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

USER 1001

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server.js"]
