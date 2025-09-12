use crate::{
    errors::NonFungibleTokenContractError,
    types::{DataKey, TokenData, TokenMetadata},
};
use soroban_sdk::{contract, contractimpl, panic_with_error, vec, Address, Env, String, Vec};
use stellar_default_impl_macro::default_impl;
use stellar_non_fungible::{
    burnable::NonFungibleBurnable, Base, NFTStorageKey, NonFungibleToken, NonFungibleTokenError,
};

#[contract]
pub struct Contract;
pub const WEEK_OF_LEDGERS: u32 = 60 * 60 * 24 / 5 * 7; // assumes 5 second ledger close times

#[contractimpl]
impl Contract {
    pub fn __constructor(env: &Env, owner: Address, max_supply: u32, metadata: TokenMetadata) {
        env.storage().instance().set(&DataKey::Owner, &owner);
        env.storage()
            .instance()
            .set(&DataKey::MaxSupply, &max_supply);
        env.storage().instance().set(&DataKey::TotalMinted, &0u32);

        Base::set_metadata(env, metadata.base_uri, metadata.name, metadata.symbol);
    }

    pub fn set_metadata_uri(env: &Env, base_uri: String) {
        Self::only_owner(env);

        let metadata = Base::get_metadata(env);

        Base::set_metadata(env, base_uri, metadata.name, metadata.symbol);
    }

    pub fn total_supply(env: &Env) -> u32 {
        env.storage().instance().get(&DataKey::TotalMinted).unwrap()
    }

    pub fn get_max_supply(env: &Env) -> u32 {
        env.storage().instance().get(&DataKey::MaxSupply).unwrap()
    }

    fn only_owner(env: &Env) {
        let owner: Address = env
            .storage()
            .instance()
            .get(&DataKey::Owner)
            .unwrap_or_else(|| panic_with_error!(env, NonFungibleTokenContractError::UnsetOwner));

        owner.require_auth();
    }

    fn set_token_data(env: &Env, token_id: u32, data: TokenData) {
        env.storage()
            .persistent()
            .set(&DataKey::TokenData(token_id), &data);
    }

    pub fn get_token_data(env: &Env, token_id: u32) -> TokenData {
        env.storage()
            .persistent()
            .get(&DataKey::TokenData(token_id))
            .unwrap_or_else(|| {
                panic_with_error!(env, NonFungibleTokenContractError::UnsetTokenData)
            })
    }

    pub fn get_owner_tokens(env: &Env, owner: Address) -> Vec<u32> {
        env.storage()
            .persistent()
            .get(&DataKey::OwnerTokens(owner))
            .unwrap_or_else(|| vec![&env])
    }

    pub fn mint_with_data(env: &Env, to: Address, token_id: u32, data: TokenData) -> u32 {
        let token_id = Self::mint(env, to.clone(), token_id);
        Self::set_token_data(env, token_id, data);
        token_id
    }

    pub fn mint(env: &Env, to: Address, token_id: u32) -> u32 {
        Self::only_owner(env);
        Self::do_mint(env, &to, token_id);
        token_id
    }

    fn do_mint(env: &Env, to: &Address, token_id: u32) {
        let current_supply = Self::total_supply(env);
        let max_supply = Self::get_max_supply(env);

        if current_supply >= max_supply {
            panic_with_error!(env, NonFungibleTokenContractError::SupplyExhausted);
        }
        if env
            .storage()
            .persistent()
            .has(&NFTStorageKey::Owner(token_id))
        {
            panic_with_error!(env, NonFungibleTokenContractError::AlreadyMinted);
        }
        increase_total_minted(env);
        add_token_to_owner_list(env, &to, token_id);
        Base::mint(env, &to, token_id);
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

    pub fn bulk_mint_with_data(env: &Env, tokens: Vec<(Address, u32, TokenData)>) -> () {
        Self::only_owner(env);

        for (to, token_id, data) in tokens.iter() {
            Self::do_mint(env, &to, token_id);
            Self::set_token_data(env, token_id, data);
        }
    }
}

#[contractimpl]
impl NonFungibleToken for Contract {
    type ContractType = Base;
    fn balance(e: &Env, owner: Address) -> u32 {
        Base::balance(e, &owner)
    }

    fn owner_of(e: &Env, token_id: u32) -> Address {
        Base::owner_of(e, token_id)
    }

    fn transfer(e: &Env, from: Address, to: Address, token_id: u32) {
        Base::transfer(e, &from, &to, token_id);
        remove_token_from_owner_list(e, &from, token_id);
        add_token_to_owner_list(e, &to, token_id);
    }

    fn transfer_from(e: &Env, spender: Address, from: Address, to: Address, token_id: u32) {
        Base::transfer_from(e, &spender, &from, &to, token_id);
        remove_token_from_owner_list(e, &from, token_id);
        add_token_to_owner_list(e, &to, token_id);
    }

    fn approve(
        e: &Env,
        approver: Address,
        approved: Address,
        token_id: u32,
        live_until_ledger: u32,
    ) {
        Base::approve(e, &approver, &approved, token_id, live_until_ledger);
    }

    fn approve_for_all(e: &Env, owner: Address, operator: Address, live_until_ledger: u32) {
        Base::approve_for_all(e, &owner, &operator, live_until_ledger);
    }

    fn get_approved(e: &Env, token_id: u32) -> Option<Address> {
        Base::get_approved(e, token_id)
    }

    fn is_approved_for_all(e: &Env, owner: Address, operator: Address) -> bool {
        Base::is_approved_for_all(e, &owner, &operator)
    }

    fn name(e: &Env) -> String {
        Base::name(e)
    }

    fn symbol(e: &Env) -> String {
        Base::symbol(e)
    }

    fn token_uri(e: &Env, token_id: u32) -> String {
        Base::token_uri(e, token_id)
    }
}

#[contractimpl]
impl NonFungibleBurnable for Contract {
    fn burn(e: &Env, from: Address, token_id: u32) {
        Base::burn(e, &from, token_id);
        remove_token_from_owner_list(e, &from, token_id);
    }

    fn burn_from(e: &Env, spender: Address, from: Address, token_id: u32) {
        Base::burn_from(e, &spender, &from, token_id);
        remove_token_from_owner_list(e, &from, token_id);
    }
}

fn add_token_to_owner_list(env: &Env, owner: &Address, token_id: u32) {
    let mut tokens: Vec<u32> = env
        .storage()
        .persistent()
        .get(&DataKey::OwnerTokens(owner.clone()))
        .unwrap_or_else(|| vec![env]);
    tokens.push_back(token_id);
    env.storage()
        .persistent()
        .set(&DataKey::OwnerTokens(owner.clone()), &tokens);
}

fn remove_token_from_owner_list(env: &Env, owner: &Address, token_id: u32) {
    let mut tokens: Vec<u32> = env
        .storage()
        .persistent()
        .get(&DataKey::OwnerTokens(owner.clone()))
        .unwrap_or_else(|| {
            panic_with_error!(env, NonFungibleTokenContractError::TokenDoesNotExist)
        });
    if let Some(pos) = tokens.first_index_of(&token_id) {
        tokens.remove(pos);
        env.storage()
            .persistent()
            .set(&DataKey::OwnerTokens(owner.clone()), &tokens);
    }
}

fn increase_total_minted(env: &Env) {
    // Unwrap is safe because TotalMinted is set in constructor
    let mut current_minted: u32 = env.storage().instance().get(&DataKey::TotalMinted).unwrap();
    current_minted += 1;
    env.storage()
        .instance()
        .set(&DataKey::TotalMinted, &current_minted);
}
