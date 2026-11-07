# syntax=docker/dockerfile:1

# Node.js 24 LTS: Next.js 16 exige Node >= 20.9 y Node 20 dejó de recibir
# soporte en abril de 2026, por eso no se usa node:20-alpine.
ARG NODE_IMAGE=node:24-alpine

# ---------- deps: dependencias (incluidas las de desarrollo, necesarias para compilar) ----------
# Solo los manifiestos: esta capa se reutiliza mientras no cambie package-lock.json.
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# ---------- build: compilación de producción ----------
FROM ${NODE_IMAGE} AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* se incrusta en el JavaScript al compilar: solo datos públicos.
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- runtime: solo la salida standalone ----------
# Sin código fuente, sin dependencias de desarrollo y sin npm en uso: el
# servidor se inicia directamente con node server.js.
FROM ${NODE_IMAGE} AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "server.js"]
