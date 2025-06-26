use soroban_sdk::{
  contract, contracterror, contractimpl, contracttype, Address, Env, String,
};
use stellar_default_impl_macro::default_impl;
use stellar_non_fungible::{Base, NonFungibleToken};

#[contracterror]
pub enum NonFungibleTokenContractError {
  MaxSupplyReached = 1,
}

#[contracttype]
pub enum DataKey {
  Owner,
  TotalMinted,
  MaxSupply,
}

#[contract]
pub struct NonFungibleTokenContract;

#[contractimpl]
impl NonFungibleTokenContract {
  /// Name: __constructor
  /// # Description
  ///
  /// This function will set the owner and signer of the contract and set the
  /// metadata for the token.
  ///
  /// # Arguments
  ///
  /// * `e` - The environment
  /// * `owner` - The owner of the contract
  /// * `name` - The name of the token
  /// * `symbol` - The symbol of the token
  /// * `uri` - The URI of the token
  /// * `max_supply` - The maximum supply of tokens
  pub fn __constructor(
    e: &Env,
    owner: Address,
    name: String,
    symbol: String,
    uri: String,
    max_supply: i32,
  ) {
    let total_minted: i32 = 0;
    e.storage().instance().set(&DataKey::Owner, &owner);
    e.storage()
      .instance()
      .set(&DataKey::TotalMinted, &total_minted);
    e.storage().instance().set(&DataKey::MaxSupply, &max_supply);

    Base::set_metadata(e, uri, name, symbol);
  }

  /// Name: update_uri
  /// # Description
  ///
  /// This function will update the URI of the token metadata. It requires
  /// the owner of the contract to authorize the change.
  ///
  /// # Arguments
  ///
  /// * `e` - The environment
  /// * `uri` - The new URI for the token metadata
  pub fn update_uri(e: &Env, uri: String) {
    let owner: Address = e
      .storage()
      .instance()
      .get(&DataKey::Owner)
      .expect("owner should be set");

    owner.require_auth();

    let name = Base::name(e);
    let symbol = Base::symbol(e);

    Base::set_metadata(e, uri.clone(), name, symbol);
  }

  ///  Name: get_total_minted
  ///  # Description
  ///
  /// This function will return the total number of tokens minted.
  ///
  /// # Arguments
  ///
  /// * `e` - The environment
  pub fn get_total_minted(e: &Env) -> i32 {
    e.storage()
      .instance()
      .get(&DataKey::TotalMinted)
      .expect("total minted should be set")
  }

  /// Name: get_max_supply
  /// # Description
  ///
  /// This function will return the maximum supply of tokens.
  ///
  /// # Arguments
  pub fn get_max_supply(e: &Env) -> i32 {
    e.storage()
      .instance()
      .get(&DataKey::MaxSupply)
      .expect("max supply should be set")
  }

  /// Name: mint
  /// # Description
  ///
  /// This function will mint a new token to the given address. The token ID
  /// will be sequential starting from 0 and incrementing by 1 for each minted
  /// token.
  ///
  /// # Arguments
  ///
  /// * `e` - The environment
  /// * `to` - The address to mint the token to
  pub fn mint(
    e: &Env,
    to: Address,
  ) -> Result<u32, NonFungibleTokenContractError> {
    let owner: Address = e
      .storage()
      .instance()
      .get(&DataKey::Owner)
      .expect("owner should be set");

    let total_minted: i32 = e
      .storage()
      .instance()
      .get(&DataKey::TotalMinted)
      .unwrap_or(0);

    let max_supply: i32 = e
      .storage()
      .instance()
      .get(&DataKey::MaxSupply)
      .expect("max supply should be set");

    if total_minted >= max_supply {
      return Err(NonFungibleTokenContractError::MaxSupplyReached);
    }

    owner.require_auth();

    let token_id = Base::sequential_mint(e, &to);

    e.storage()
      .instance()
      .set(&DataKey::TotalMinted, &(total_minted + 1));

    Ok(token_id)
  }
}

#[default_impl]
#[contractimpl]
impl NonFungibleToken for NonFungibleTokenContract {
  type ContractType = Base;
}
