# Dependencies Stage
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages
# @gateway-experience/contracts is published from the Seagull-gateway repo to
# GitLab's Package Registry; .npmrc reads the token from this variable. It is
# confined to this stage — only node_modules is carried into the builder — so
# it does not reach the final image.
ARG GITLAB_NPM_TOKEN
ENV GITLAB_NPM_TOKEN=${GITLAB_NPM_TOKEN}
RUN npm ci --ignore-scripts

# Builder Stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Next.js resolves these at BUILD time: NEXT_PUBLIC_* are inlined into browser
# code and next.config.ts rewrites (/core/*) are baked into the routes
# manifest. Railway passes service variables to a Docker build only when they
# are declared as ARG, so without these the build silently used the
# 127.0.0.1 fallbacks.
ARG GATEWAY_PROXY_URL
ARG GATEWAY_ENGINE_URL
ARG REFERENCE_SERVICE_URL
ARG NEXT_PUBLIC_GATEWAY_PROXY_URL
ARG NEXT_PUBLIC_GATEWAY_ENGINE_URL
ENV GATEWAY_PROXY_URL=$GATEWAY_PROXY_URL     GATEWAY_ENGINE_URL=$GATEWAY_ENGINE_URL     REFERENCE_SERVICE_URL=$REFERENCE_SERVICE_URL     NEXT_PUBLIC_GATEWAY_PROXY_URL=$NEXT_PUBLIC_GATEWAY_PROXY_URL     NEXT_PUBLIC_GATEWAY_ENGINE_URL=$NEXT_PUBLIC_GATEWAY_ENGINE_URL
RUN npm run build --workspace=apps/web

# Runner Stage
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
