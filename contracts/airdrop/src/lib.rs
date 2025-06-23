//! # Airdrop contract
//!
//! Based on https://github.com/OpenZeppelin/stellar-contracts/blob/857bd364a88c4e50faae8b2c160d91b108f1c53d/examples/fungible-merkle-airdrop/src/contract.rs

#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype,
    token::{self, TokenClient},
    Address, BytesN, Env, Vec,
};
use stellar_crypto::sha256::Sha256;
use stellar_merkle_distributor::{IndexableLeaf, MerkleDistributor};

type Distributor = MerkleDistributor<Sha256>;

#[contracttype]
enum DataKey {
    TokenAddress,
    Funder,
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

    /// Returns whether an index has been claimed.
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
        let data = Receiver {
            index,
            address: receiver.clone(),
            amount,
        };
        Distributor::verify_and_set_claimed(e, data, proof);

        let token_client = Self::token_client(e);
        token_client.transfer(&e.current_contract_address(), &receiver, &amount);
    }

    /// Recovers any unclaimed tokens from the contract back to the funder.
    ///
    /// # Arguments:
    /// * `e` - The Soroban environment.
    pub fn recover_unclaimed(e: &Env) {
        let funder = e
            .storage()
            .instance()
            .get::<_, Address>(&DataKey::Funder)
            .unwrap();
        funder.require_auth();

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
