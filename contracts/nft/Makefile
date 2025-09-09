CONTRACT_WASM_PATH = ../target/wasm32v1-none/release/nft.wasm
OPTIMIZED_WASM_PATH = ../target/wasm32v1-none/release/nft.optimized.wasm

# Default values for parameters
TOKEN_ID ?= 0
OWNER ?= $(STELLAR_SOURCE_ACCOUNT)
BASE_URI ?= $(STELLAR_NFT_CONTRACT_BASE_URI)
CONTRACT_ID ?= $(STELLAR_NFT_CONTRACT_ID)

debug:
	@echo "=== Environment Variables ==="
	@echo "NETWORK: $(STELLAR_NETWORK)"
	@echo "SOURCE: $(STELLAR_SOURCE_ACCOUNT)"
	@echo "CONTRACT_NAME: $(STELLAR_NFT_CONTRACT_NAME)"
	@echo "CONTRACT_SYMBOL: $(STELLAR_NFT_CONTRACT_SYMBOL)"
	@echo "CONTRACT_URI: $(STELLAR_NFT_CONTRACT_BASE_URI)"
	@echo "CONTRACT_MAX_SUPPLY: $(STELLAR_NFT_CONTRACT_MAX_SUPPLY)"
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
		--network $(STELLAR_NETWORK) \
		--source-account $(STELLAR_SOURCE_ACCOUNT) \
		--wasm $(CONTRACT_WASM_PATH)

deploy:
	@CONTRACT_ID=$$(stellar contract deploy \
		--network $(STELLAR_NETWORK) \
		--source-account $(STELLAR_SOURCE_ACCOUNT) \
		--wasm $(CONTRACT_WASM_PATH) \
		-- \
		--owner $(STELLAR_SOURCE_ACCOUNT) \
		--max-supply $(STELLAR_NFT_CONTRACT_MAX_SUPPLY) \
		--metadata "{\"name\": \"$(STELLAR_NFT_CONTRACT_NAME)\", \"symbol\": \"$(STELLAR_NFT_CONTRACT_SYMBOL)\", \"base_uri\": \"$(STELLAR_NFT_CONTRACT_BASE_URI)\"}" | tr -d '\n'); \
	echo "Deployed contract ID: $$CONTRACT_ID";

set-metadata-uri:
	stellar contract invoke \
		--id $(CONTRACT_ID) \
		--source-account $(STELLAR_SOURCE_ACCOUNT) \
		--network $(STELLAR_NETWORK) \
		-- \
		set-metadata-uri \
		--base-uri $(BASE_URI)
