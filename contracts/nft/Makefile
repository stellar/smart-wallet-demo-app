CONTRACT_WASM_PATH = ../target/wasm32v1-none/release/nft.wasm
OPTIMIZED_WASM_PATH = ../target/wasm32v1-none/release/nft.optimized.wasm

# Default values for parameters
TOKEN_ID ?= 0
OWNER ?= $(SOURCE)
BASE_URI ?= $(CONTRACT_URI)
CONTRACT_ID ?= $(STELLAR_NFT_CONTRACT_ID)

debug:
	@echo "=== Environment Variables ==="
	@echo "NETWORK: $(NETWORK)"
	@echo "SOURCE: $(SOURCE)"
	@echo "CONTRACT_NAME: $(CONTRACT_NAME)"
	@echo "CONTRACT_SYMBOL: $(CONTRACT_SYMBOL)"
	@echo "CONTRACT_URI: $(CONTRACT_URI)"
	@echo "CONTRACT_MAX_SUPPLY: $(CONTRACT_MAX_SUPPLY)"
	@echo "CONTRACT_WASM_PATH: $(CONTRACT_WASM_PATH)"
	@echo "TOKEN_ID: $(TOKEN_ID)"
	@echo "OWNER: $(OWNER)"
	@echo "BASE_URI: $(BASE_URI)"
	@echo "CONTRACT_ID: $(CONTRACT_ID)"
	@echo "=============================="

default: build

all: test

test: build
	cargo test

build:
	stellar contract build

optimize: build
	stellar contract optimize --wasm $(CONTRACT_WASM_PATH) --wasm-out $(OPTIMIZED_WASM_PATH)

fmt:
	cargo fmt --all

clean:
	cargo clean

upload:
	stellar contract upload \
		--network $(NETWORK) \
		--source-account $(SOURCE) \
		--wasm $(CONTRACT_WASM_PATH)

deploy:
	@CONTRACT_ID=$$(stellar contract deploy \
		--network $(NETWORK) \
		--source-account $(SOURCE) \
		--wasm $(CONTRACT_WASM_PATH) \
		-- \
		--owner $(SOURCE) \
		--max-supply $(CONTRACT_MAX_SUPPLY) \
		--metadata "{\"name\": \"$(CONTRACT_NAME)\", \"symbol\": \"$(CONTRACT_SYMBOL)\", \"base_uri\": \"$(CONTRACT_URI)\"}" | tr -d '\n'); \
	echo "Deployed contract ID: $$CONTRACT_ID";

set-metadata-uri:
	stellar contract invoke \
		--id $(CONTRACT_ID) \
		--source-account $(SOURCE) \
		--network $(NETWORK) \
		-- \
		set-metadata-uri \
		--base-uri $(BASE_URI)
