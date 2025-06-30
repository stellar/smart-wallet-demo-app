FROM node:22.14-bullseye-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y make
COPY package*.json Makefile ./
COPY . .
RUN find apps/* -maxdepth 0 -type d ! -name "$(basename "apps/web")" -exec rm -rf {} +
RUN make clean-setup-dev APP=web

FROM base AS local
ENV DEPLOY_STAGE=local
ENTRYPOINT [ "./apps/web/entrypoint.sh"]

FROM base AS builder
ENV PROD=REPLACE_PROD
ENV VITE_API_URL=REPLACE_VITE_API_URL
RUN make build APP=web

FROM alpine:3.20.3 AS remote
WORKDIR /app
ENV DEPLOY_STAGE=remote
ENV ENVS_TO_REPLACE="PROD VITE_API_URL"
RUN apk add make bash npm
RUN npm install -g serve@14.2.3
COPY package*.json Makefile ./
COPY .husky/install.mjs ./.husky/
COPY apps/web/package*.json apps/web/entrypoint.sh ./apps/web/
RUN make clean-setup APP=web
COPY --from=builder /app/apps/web/dist/ ./apps/web/dist/
ENTRYPOINT [ "./apps/web/entrypoint.sh"]
