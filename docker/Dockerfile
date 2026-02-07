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
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
