NETWORK ?= testnet
CONTRACT_NAME ?= nft
SOURCE ?= admin
CONTRACT_SYMBOL ?= TEST
CONTRACT_URI ?= https://ipfs.io/ipfs/to-be-replaced
CONTRACT_MAX_SUPPLY ?= 10000

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
		--wasm ../../target/wasm32v1-none/release/$(CONTRACT_NAME).wasm

deploy:
	@CONTRACT_ID=$$(stellar contract deploy --network $(NETWORK) --source-account $(SOURCE) --wasm ../../target/wasm32v1-none/release/$(CONTRACT_NAME).wasm -- --owner $(SOURCE) --name collection_test --symbol $(CONTRACT_SYMBOL) --uri $(CONTRACT_URI) --max-supply $(CONTRACT_MAX_SUPPLY) ); \
	echo "Deployed contract ID: $$CONTRACT_ID"
