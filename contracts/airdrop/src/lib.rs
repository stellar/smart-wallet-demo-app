//! # Airdrop contract
//!
//! Based on https://github.com/OpenZeppelin/stellar-contracts/blob/857bd364a88c4e50faae8b2c160d91b108f1c53d/examples/fungible-merkle-airdrop/src/contract.rs

#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, panic_with_error,
    token::{self, TokenClient},
    Address, BytesN, Env, Vec,
};
use stellar_crypto::sha256::Sha256;
use stellar_merkle_distributor::{IndexableLeaf, MerkleDistributor};

pub const DAY_IN_LEDGERS: u32 = 17280;

pub const INSTANCE_EXTEND_AMOUNT: u32 = 7 * DAY_IN_LEDGERS;
pub const INSTANCE_TTL_THRESHOLD: u32 = INSTANCE_EXTEND_AMOUNT - DAY_IN_LEDGERS;

type Distributor = MerkleDistributor<Sha256>;

#[contracttype]
enum DataKey {
    Ended,
    TokenAddress,
    Funder,
}

#[contracterror]
enum AirdropError {
    Ended = 1000,
}

#[contracttype]
struct Receiver {
    pub index: u32,
    pub address: Address,
    pub amount: i128,
}

impl IndexableLeaf for Receiver {
    fn index(&self) -> u32 {
        self.index
    }
}

#[contract]
pub struct AirdropContract;

#[contractimpl]
impl AirdropContract {
    /// Initializes the contract with the root hash of the Merkle tree, the token address,
    /// the funding amount, and the funding source address.
    ///
    /// # Arguments:
    /// * `e` - The Soroban environment.
    /// * `root_hash` - The root hash of the Merkle tree.
    /// * `token` - The address of the token to be distributed.
    /// * `funding_amount` - The amount of tokens to be distributed.
    /// * `funding_source` - The address from which the funding amount will be transferred from.
    pub fn __constructor(
        e: Env,
        root_hash: BytesN<32>,
        token: Address,
        funding_amount: i128,
        funding_source: Address,
    ) {
        Distributor::set_root(&e, root_hash);
        e.storage().instance().set(&DataKey::Ended, &false);
        e.storage().instance().set(&DataKey::TokenAddress, &token);
        e.storage()
            .instance()
            .set(&DataKey::Funder, &funding_source);
        let token_client = Self::token_client(&e);
        token_client.transfer(
            &funding_source,
            &e.current_contract_address(),
            &funding_amount,
        );
    }

    /// Returns whether the airdrop has ended.
    ///
    /// # Arguments:
    /// * `e` - The Soroban environment.
    pub fn is_ended(e: &Env) -> bool {
        e.storage()
            .instance()
            .get::<_, bool>(&DataKey::Ended)
            .unwrap_or(false)
    }

    /// Returns whether an index has been claimed.
    ///
    /// # Arguments:
    /// * `e` - The Soroban environment.
    /// * `index` - The index of the claim in the Merkle tree.
    pub fn is_claimed(e: &Env, index: u32) -> bool {
        Distributor::is_claimed(e, index)
    }

    /// Claims the airdrop for a given index, transferring the specified amount of tokens to the receiver.
    ///
    /// # Arguments:
    /// * `e` - The Soroban environment.
    /// * `index` - The index of the claim in the Merkle tree.
    /// * `receiver` - The address of the receiver who will receive the tokens.
    /// * `amount` - The amount of tokens to be claimed.
    /// * `proof` - The Merkle proof that verifies the claim.
    pub fn claim(e: &Env, index: u32, receiver: Address, amount: i128, proof: Vec<BytesN<32>>) {
        if Self::is_ended(e) {
            panic_with_error!(e, AirdropError::Ended);
        }

        receiver.require_auth();

        let data = Receiver {
            index,
            address: receiver.clone(),
            amount,
        };
        Distributor::verify_and_set_claimed(e, data, proof);

        let token_client = Self::token_client(e);
        token_client.transfer(&e.current_contract_address(), &receiver, &amount);

        e.storage()
            .instance()
            .extend_ttl(INSTANCE_TTL_THRESHOLD, INSTANCE_EXTEND_AMOUNT);
    }

    /// Recovers any unclaimed tokens from the contract back to the funder and disables further claims.
    ///
    /// # Arguments:
    /// * `e` - The Soroban environment.
    pub fn recover_unclaimed(e: &Env) {
        if Self::is_ended(e) {
            panic_with_error!(e, AirdropError::Ended);
        }

        let funder = e
            .storage()
            .instance()
            .get::<_, Address>(&DataKey::Funder)
            .unwrap();
        funder.require_auth();
        e.storage().instance().set(&DataKey::Ended, &true);

        let token_client = Self::token_client(e);
        let remaining = token_client.balance(&e.current_contract_address());
        if remaining > 0 {
            token_client.transfer(&e.current_contract_address(), &funder, &remaining);
        }
    }

    fn token_client(e: &Env) -> TokenClient {
        let token_address = e
            .storage()
            .instance()
            .get::<_, Address>(&DataKey::TokenAddress)
            .unwrap();
        token::TokenClient::new(e, &token_address)
    }
}

mod test;
