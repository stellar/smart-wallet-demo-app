NETWORK ?= testnet
CONTRACT_NAME ?= nft
SOURCE ?= admin
CONTRACT_SYMBOL ?= TEST
CONTRACT_URI ?= https://ipfs.io/ipfs/to-be-replaced
CONTRACT_MAX_SUPPLY ?= 10000
CONTRACT_WASM_PATH ?= ../target/wasm32v1-none/release/$(CONTRACT_NAME).wasm

default: build

all: test

test: build
	cargo test

build:
	stellar contract build

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
		--total-supply $(CONTRACT_MAX_SUPPLY) \
		--metadata "{\"name\": \"$(CONTRACT_NAME)\", \"symbol\": \"$(CONTRACT_SYMBOL)\", \"base_uri\": \"$(CONTRACT_URI)\"}" ); \
	echo "Deployed contract ID: $$CONTRACT_ID"
