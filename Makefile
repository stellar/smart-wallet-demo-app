#!make
# Find all Makefiles in contracts directory
CONTRACT_MAKEFILES := $(shell find contracts -name Makefile)
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
	@echo "  docker-setup-dev      Build containers using profile"
	@echo "  docker-start-dev      Start containers using profile"
	@echo "  docker-stop-dev       Stop containers using profile"
	@echo ""
	@echo "Stellar Smart Contracts:"
	@echo "  build-contracts       Build all contracts using stellar contract build"
	@echo "  test-contracts        Run tests for all contracts using cargo test"
	@echo "  fmt-contracts         Format all contracts using cargo fmt"
	@echo "  clean-contracts       Clean contracts target from cargo"
	@echo ""
	@echo "App workspace commands:"
	@echo "  clean-setup-dev       Run clean-setup-dev on given APP"
	@echo "  clean-setup           Run clean-setup on given APP"
	@echo "  setup-dev             Run setup-dev on given APP"
	@echo "  build                 Run build on given APP"
	@echo "  start                 Run start on given APP"
	@echo "  start-dev             Run start-dev on given APP"
	@echo "  start-staging         Run start-staging on APP"
	@echo "  serve                 Run serve on APP (only for web)"
	@echo "  test                  Run test on given APP"
	@echo "  test-coverage         Run test-coverage on given APP"
	@echo "  storybook             Run storybook on given APP"
	@echo "  build-storybook       Run build-storybook on given APP"
	@echo "  type-check            Run type-check on given APP"
	@echo "  lint                  Run eslint"
	@echo "  lint-fix              Run eslint with --fix"
	@echo "  format-code           Run prettier on codebase"

# Execute 'build' target in all contract Makefiles
build-contracts:
	@for makefile in $(CONTRACT_MAKEFILES); do \
		echo "Executing 'build' in $$(dirname $$makefile)"; \
		$(MAKE) -C $$(dirname $$makefile) build; \
	done

# Execute 'test' target in all contract Makefiles
test-contracts:
	@for makefile in $(CONTRACT_MAKEFILES); do \
		echo "Executing 'test' in $$(dirname $$makefile)"; \
		$(MAKE) -C $$(dirname $$makefile) test; \
	done

# Execute 'fmt' target in all contract Makefiles
fmt-contracts:
	@for makefile in $(CONTRACT_MAKEFILES); do \
		echo "Executing 'fmt' in $$(dirname $$makefile)"; \
		$(MAKE) -C $$(dirname $$makefile) fmt; \
	done

# Execute 'clean' target in all contract Makefiles
clean-contracts:
	@for makefile in $(CONTRACT_MAKEFILES); do \
		echo "Executing 'clean' in $$(dirname $$makefile)"; \
		$(MAKE) -C $$(dirname $$makefile) clean; \
	done

# Docker Compose commands
docker-setup-dev:
	$(COMPOSE) --profile $(PROFILE) build

docker-start-dev:
	$(COMPOSE) --profile $(PROFILE) up $(DETACH)

docker-stop-dev:
	$(COMPOSE) --profile $(PROFILE) stop

# NPM workspace commands
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

serve:
	npm run serve --workspace=apps/$(APP)

test:
	npm run test ${TEST} --workspace=apps/$(APP)

test-coverage:
	npm run test-coverage --workspace=apps/$(APP)

storybook:
	npm run storybook --workspace=apps/$(APP)

build-storybook:
	npm run build-storybook --workspace=apps/$(APP)

type-check:
	npm run type-check --workspace=apps/$(APP)

lint:
	npx --no-install eslint .

lint-fix:
	npx --no-install eslint . --fix

format-code:
	npx prettier --write "**/*.{js,jsx,ts,tsx,json,md}"
