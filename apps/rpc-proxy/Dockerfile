FROM node:22.14-bullseye-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22.14-bullseye-slim
WORKDIR /app
ENV NODE_ENV=production \
    RPC_PROXY_PORT=8301
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 8301 8302
HEALTHCHECK --interval=30s --timeout=25s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://localhost:$RPC_PROXY_PORT/health/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/index.js"]
