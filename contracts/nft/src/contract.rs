use crate::{
    errors::NonFungibleTokenContractError,
    types::{DataKey, TokenData, TokenMetadata},
};
use soroban_sdk::{contract, contractimpl, panic_with_error, Address, Env, String, Vec};
use stellar_default_impl_macro::default_impl;
use stellar_non_fungible::{
    burnable::NonFungibleBurnable,
    enumerable::{Enumerable, NonFungibleEnumerable},
    Base, NonFungibleToken, NonFungibleTokenError,
};

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn __constructor(env: &Env, owner: Address, total_supply: u32, metadata: TokenMetadata) {
        env.storage().instance().set(&DataKey::Owner, &owner);
        env.storage()
            .instance()
            .set(&DataKey::MaxSupply, &total_supply);

        Base::set_metadata(env, metadata.base_uri, metadata.name, metadata.symbol);
    }

    pub fn set_metadata_uri(env: &Env, base_uri: String) {
        let owner: Address = env
            .storage()
            .instance()
            .get(&DataKey::Owner)
            .expect("owner should be set");

        owner.require_auth();

        let metadata = Base::get_metadata(env);

        Base::set_metadata(env, base_uri, metadata.name, metadata.symbol);
    }

    pub fn get_max_supply(env: &Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::MaxSupply)
            .unwrap_or(0u32)
    }

    pub fn only_owner(env: &Env) {
        let owner: Address = env
            .storage()
            .instance()
            .get(&DataKey::Owner)
            .unwrap_or_else(|| panic_with_error!(env, NonFungibleTokenContractError::UnsetOwner));

        owner.require_auth();
    }

    pub fn set_token_data(env: &Env, token_id: u32, data: TokenData) {
        Self::only_owner(env);

        env.storage()
            .instance()
            .set(&DataKey::TokenData(token_id), &data);
    }

    pub fn get_token_data(env: &Env, token_id: u32) -> TokenData {
        env.storage()
            .instance()
            .get(&DataKey::TokenData(token_id))
            .unwrap()
    }

    pub fn mint_with_data(env: &Env, to: Address, data: TokenData) -> u32 {
        let token_id = Self::mint(env, to);

        Self::set_token_data(env, token_id, data);

        token_id
    }

    pub fn mint(env: &Env, to: Address) -> u32 {
        Self::only_owner(env);

        let total_minted = Enumerable::total_supply(env);
        let total_supply = Self::get_max_supply(env);

        if total_minted >= total_supply {
            panic_with_error!(env, NonFungibleTokenContractError::MaxSupplyReached);
        }

        Enumerable::sequential_mint(env, &to)
    }

    pub fn get_token_metadata(env: &Env) -> TokenMetadata {
        let metadata = Base::get_metadata(env);

        if metadata.base_uri.is_empty() {
            panic_with_error!(env, NonFungibleTokenError::UnsetMetadata);
        }

        TokenMetadata {
            name: metadata.name,
            symbol: metadata.symbol,
            base_uri: metadata.base_uri,
        }
    }

    pub fn get_owner_tokens(env: &Env, owner: Address) -> Vec<u32> {
        let mut ids = Vec::new(env);
        let total_minted = Enumerable::total_supply(env);

        for token_id in 0..total_minted {
            if Base::owner_of(env, token_id) == owner {
                ids.push_back(token_id);
            }
        }

        ids
    }

    pub fn bulk_transfer(env: &Env, from: Address, to: Address, token_ids: Vec<u32>) {
        Self::only_owner(env);

        for token_id in token_ids {
            let token_owner = Base::owner_of(env, token_id);

            if token_owner != from {
                panic_with_error!(env, NonFungibleTokenError::IncorrectOwner);
            }

            Enumerable::transfer_from(env, &token_owner, &token_owner, &to, token_id);
        }
    }
}

#[default_impl]
#[contractimpl]
impl NonFungibleToken for Contract {
    type ContractType = Enumerable;
}

#[default_impl]
#[contractimpl]
impl NonFungibleEnumerable for Contract {}

#[default_impl]
#[contractimpl]
impl NonFungibleBurnable for Contract {}
