FROM node:22.14-bullseye-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y make
COPY package*.json Makefile ./
COPY ./patches ./patches
COPY . .
RUN find apps/* -maxdepth 0 -type d ! -name "$(basename "apps/backend")" -exec rm -rf {} +
RUN make clean-setup-dev APP=backend

FROM base AS local
ENV DEPLOY_STAGE=local
ENTRYPOINT [ "./apps/backend/entrypoint.sh" ]

FROM base AS builder
ARG SENTRY_RELEASE
ENV SENTRY_RELEASE=${SENTRY_RELEASE:-}
RUN make build APP=backend

FROM node:22.14-bullseye-slim AS remote
WORKDIR /app
ENV DEPLOY_STAGE=remote
RUN apt-get update && apt-get install -y make openssl
COPY package*.json Makefile ./
COPY ./patches ./patches
COPY .husky/install.mjs ./.husky/
COPY apps/backend/package*.json apps/backend/entrypoint.sh ./apps/backend/
RUN make clean-setup APP=backend
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
ENTRYPOINT [ "./apps/backend/entrypoint.sh" ]
