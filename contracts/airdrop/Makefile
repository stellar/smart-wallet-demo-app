NODE_TLS_REJECT_UNAUTHORIZED=0
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smart_wallet_db
RECIPIENTS_FILE=#full-path-to/recipients.txt
TOKEN_CONTRACT_ADDRESS=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
ADMIN_IDENTITY=admin
FUNDER_IDENTITY=#G...
NETWORK=testnet
AMOUNT=10000000
RPC_URL=https://soroban-testnet.stellar.org
MERKLE_ROOT_HASH=# obtained from the `generate-proofs` step
CONTRACT_ADDRESS=# obtained from the `deploy` step


deploy-airdrop:
	npm run --workspace=scripts deploy-airdrop -- \
		--addresses $(RECIPIENTS_FILE) \
		--amount $(AMOUNT) \
		--token $(TOKEN_CONTRACT_ADDRESS) \
		--network $(NETWORK) \
		--rpc-url $(RPC_URL) \
		--source $(ADMIN_IDENTITY) \
		--funder $(FUNDER_IDENTITY) \
		--database-url $(DATABASE_URL)

build:
	stellar contract build --package airdrop

generate-proofs:
	npm run --workspace=scripts generate-proofs -- \
		--addresses $(RECIPIENTS_FILE) \
		--proofs proofs.json \
		--amount $(AMOUNT)

deploy:
	stellar contract deploy \
		--wasm ../../wasms/airdrop.optimized.wasm \
		--network $(NETWORK) \
		--source $(ADMIN_IDENTITY) \
		-- \
		--root_hash $(MERKLE_ROOT_HASH) \
		--token $(TOKEN_CONTRACT_ADDRESS) \
		--admin $(ADMIN_IDENTITY) \
		--funder $(FUNDER_IDENTITY)

upload-proofs:
	npm run --workspace=scripts upload-proofs -- \
		--proofs proofs.json \
		--contract $(CONTRACT_ADDRESS) \
		--database-url $(DATABASE_URL)
