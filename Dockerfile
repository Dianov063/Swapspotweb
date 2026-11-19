FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM dependencies AS build
COPY . .
ARG NEXT_PUBLIC_APP_PLATFORM_URL=https://platform.hubmail.vip
ARG NEXT_PUBLIC_APP_PLATFORM_APP_SLUG=swapspot
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_APP_PLATFORM_URL=$NEXT_PUBLIC_APP_PLATFORM_URL \
    NEXT_PUBLIC_APP_PLATFORM_APP_SLUG=$NEXT_PUBLIC_APP_PLATFORM_APP_SLUG \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
RUN test -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" && npm run build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
COPY --chown=node:node deploy/appplatform/bootstrap.mjs ./bootstrap.mjs
COPY --chown=node:node deploy/appplatform/runtime-keys.json ./runtime-keys.json
COPY --chown=node:node deploy/appplatform/report.mjs ./report.mjs
USER node
EXPOSE 3000
CMD ["node", "bootstrap.mjs"]
