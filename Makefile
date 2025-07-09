#!make

COMPOSE = docker compose
DETACH =

PROFILE ?= all    # backend | web | all
APP ?= backend    # backend | web

help:
	@echo ""
	@echo "Usage:"
	@echo "  make <command> [PROFILE=backend|web|all] [APP=backend|web] [TEST=<file-name>|<folder-name>]"
	@echo ""
	@echo "Docker Compose:"
	@echo "  docker-setup-dev      																		Build containers using profile"
	@echo "  docker-start-dev    																		  Start containers using profile"
	@echo "  docker-stop-dev    																		  Stop containers using profile"
	@echo ""
	@echo "App workspace commands:"
	@echo "  clean-setup-dev       																		Run clean-setup-dev on given APP"
	@echo "  clean-setup           																		Run clean-setup on given APP"
	@echo "  setup-dev             																		Run setup-dev on given APP"
	@echo "  build                 																		Run build on given APP"
	@echo "  start                 																		Run start on given APP"
	@echo "  start-dev             																		Run start-dev on given APP"
	@echo "  start-staging         																		Run start-staging on APP"
	@echo "  test                  																		Run test on given APP"
	@echo "  test-coverage         																		Run test-coverage on given APP"
	@echo "  type-check            																		Run type-check on given APP"
	@echo "  lint                  																		Run eslint"
	@echo "  lint-fix              																		Run eslint with --fix"
	@echo "  format-code           																		Run prettier on codebase"
	@echo ""
	@echo "Web exclusive commands:"
	@echo "  serve                 																		Run serve"
	@echo ""
	@echo "Backend exclusive commands:"
	@echo "  migration-run        																		Run the migrations"
	@echo "  migration-generate NAME={migration_name} 								Generate a new migration based on entities changes"
	@echo "  docker-run-migration-run        													Run the migrations"
	@echo "  docker-run-migration-generate NAME={migration_name} 			Generate a new migration based on entities changes"

# Docker Compose commands
docker-setup-dev:
	$(COMPOSE) --profile $(PROFILE) build

docker-start-dev:
	$(COMPOSE) --profile $(PROFILE) up $(DETACH)

docker-stop-dev:
	$(COMPOSE) --profile $(PROFILE) stop

# App workspace commands
clean-setup-dev:
	npm run clean-setup-dev --workspace=apps/$(APP)

clean-setup:
	npm run clean-setup --workspace=apps/$(APP)

setup-dev:
	npm run setup-dev --workspace=apps/$(APP)

build:
	npm run build --workspace=apps/$(APP)

start:
	npm run start --workspace=apps/$(APP)

start-dev:
	npm run start-dev --workspace=apps/$(APP)

start-staging:
	npm run start-staging --workspace=apps/$(APP)

test:
	npm run test ${TEST} --workspace=apps/$(APP)

test-coverage:
	npm run test-coverage --workspace=apps/$(APP)

type-check:
	npm run type-check --workspace=apps/$(APP)

lint:
	npx --no-install eslint .

lint-fix:
	npx --no-install eslint . --fix

format-code:
	npx prettier --write "**/*.{js,jsx,ts,tsx,json,md}"

# Web exclusive commands
serve:
	npm run serve --workspace=apps/web

# Backend exclusive commands
migration-run:
	npm run migration-run --workspace=apps/backend

migration-generate:
	npm run migration-generate --workspace=apps/backend --name=$(NAME)

docker-run-migration-run:
	docker exec smart-wallet-backend npm run migration-run --workspace=apps/backend

docker-run-migration-generate:
	docker exec smart-wallet-backend npm run migration-generate --workspace=apps/backend --name=$(NAME)

# Others
default: help
