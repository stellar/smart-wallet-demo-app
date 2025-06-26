#![cfg(test)]

extern crate std;

use soroban_sdk::{
  testutils::{Address as _, MockAuth},
  Address, Env, IntoVal, String,
};

use crate::contract::{
  NonFungibleTokenContract, NonFungibleTokenContractClient,
};

/// Creates a client for the NonFungibleTokenContract
///
/// # Arguments
///
/// * `e` - The environment
/// * `owner` - The owner of the contract
/// * `signer` - The signer of the contract, required to mint tokens
/// * `max_supply` - The maximum supply of tokens
///
/// # Returns
///
/// A client for the NonFungibleTokenContract
fn create_client<'a>(
  e: &Env,
  owner: &Address,
  max_supply: i32,
) -> NonFungibleTokenContractClient<'a> {
  let address = e.register(
    NonFungibleTokenContract,
    (
      owner,
      String::from_str(e, "Non Fungible Token"),
      String::from_str(e, "NFT"),
      String::from_str(e, "https://nft.com/"),
      max_supply,
    ),
  );
  NonFungibleTokenContractClient::new(e, &address)
}

/// Tests for the NonFungibleTokenContract
const MAX_SUPPLY: i32 = 2;

/// Test Case: Mint a token for the user
#[test]
fn test_mint_works() {
  let e = Env::default();
  let owner = Address::generate(&e);
  let client = create_client(&e, &owner, MAX_SUPPLY);

  let token_id = client
    .mock_auths(&[MockAuth {
      address: &owner,
      invoke: &soroban_sdk::testutils::MockAuthInvoke {
        contract: &client.address,
        fn_name: "mint",
        args: (&owner,).into_val(&e),
        sub_invokes: &[],
      },
    }])
    .mint(&owner);

  assert_eq!(token_id, 0);
}

/// Test Case: Should not allow to mint a token if signer is not authenticated
#[test]
#[should_panic(expected = "Error(Auth, InvalidAction)")]
fn test_mint_works_with_no_signer_auth() {
  let e = Env::default();
  let owner = Address::generate(&e);
  let client = create_client(&e, &owner, MAX_SUPPLY);

  client.mint(&owner);
}

/// Test Case: Should not allow to mint more tokens than the max supply
#[test]
#[should_panic(expected = "Error(Contract, #1)")]
fn test_mint_max_supply_reached() {
  let e = Env::default();
  let owner = Address::generate(&e);
  let client = create_client(&e, &owner, MAX_SUPPLY);

  e.mock_all_auths();

  client.mint(&owner);
  client.mint(&owner);
  client.mint(&owner);
}

/// Test Case: Should transfer a token from one address to another
#[test]
fn test_transfer_works() {
  let e = Env::default();
  let owner = Address::generate(&e);
  let recipient = Address::generate(&e);
  let client = create_client(&e, &owner, MAX_SUPPLY);

  e.mock_all_auths();
  client.mint(&owner);
  client.transfer(&owner, &recipient, &0);
  assert_eq!(client.balance(&owner), 0);
  assert_eq!(client.balance(&recipient), 1);
}

/// Test Case: Should return the metadata that was set in the constructor
#[test]
fn metadata_works() {
  let e = Env::default();
  let owner = Address::generate(&e);
  let client = create_client(&e, &owner, MAX_SUPPLY);

  e.mock_all_auths();

  assert_eq!(client.name(), String::from_str(&e, "Non Fungible Token"));
  assert_eq!(client.symbol(), String::from_str(&e, "NFT"));

  client.mint(&owner);

  assert_eq!(
    client.token_uri(&0),
    String::from_str(&e, "https://nft.com/0")
  );
}

/// Test Case: Should return the balance of the owner if the owner has a token
#[test]
fn test_balance_works() {
  let e = Env::default();
  let owner = Address::generate(&e);
  let client = create_client(&e, &owner, MAX_SUPPLY);

  e.mock_all_auths();
  let token_id = client.mint(&owner);
  assert_eq!(token_id, 0);

  let second_token_id = client.mint(&owner);
  assert_eq!(second_token_id, 1);

  assert_eq!(client.balance(&owner), 2);
}

/// Test Case: Should return the owner of a token
#[test]
fn test_owner_of_works() {
  let e = Env::default();
  let owner = Address::generate(&e);
  let client = create_client(&e, &owner, MAX_SUPPLY);

  e.mock_all_auths();

  let token_id = client.mint(&owner);
  assert_eq!(client.owner_of(&token_id), owner);
}

/// Test Case: Should approve a token for all
#[test]
fn test_aproove_for_all_works() {
  let e = Env::default();
  let owner = Address::generate(&e);
  let signer = Address::generate(&e);
  let client = create_client(&e, &owner, MAX_SUPPLY);

  e.mock_all_auths();

  client.approve_for_all(&owner, &signer, &1);
  assert_eq!(client.is_approved_for_all(&owner, &signer), true);

  client.approve_for_all(&owner, &signer, &0);
  assert_eq!(client.is_approved_for_all(&owner, &signer), false);
}

/// Test Case: Should approve a token for a specific address
#[test]
fn test_aproove_works() {
  let e = Env::default();
  let owner = Address::generate(&e);
  let signer = Address::generate(&e);
  let client = create_client(&e, &owner, MAX_SUPPLY);

  e.mock_all_auths();

  let token_id = client.mint(&owner);

  client.approve(&owner, &signer, &token_id, &1);
  assert_eq!(client.get_approved(&0), Some(signer));
}

/// Test Case: Should transfer a token from one address to another
#[test]
fn test_transfer_from_works() {
  let e = Env::default();
  let owner = Address::generate(&e);
  let signer = Address::generate(&e);
  let client = create_client(&e, &owner, MAX_SUPPLY);

  e.mock_all_auths();

  let token_id = client.mint(&owner);

  client.approve(&owner, &signer, &token_id, &1);

  client.transfer_from(&signer, &owner, &signer, &token_id);
  assert_eq!(client.owner_of(&token_id), signer);
}

/// Test Case: Should update the URI of the NFT Collection
#[test]
fn test_update_uri_works() {
  let e = Env::default();
  let owner = Address::generate(&e);
  let client = create_client(&e, &owner, MAX_SUPPLY);

  e.mock_all_auths();

  client.update_uri(&String::from_str(&e, "https://new-nft.com/"));

  client.mock_auths(&[MockAuth {
    address: &owner,
    invoke: &soroban_sdk::testutils::MockAuthInvoke {
      contract: &client.address,
      fn_name: "mint",
      args: (&owner,).into_val(&e),
      sub_invokes: &[],
    },
  }]);

  client.mint(&owner);

  assert_eq!(
    client.token_uri(&0),
    String::from_str(&e, "https://new-nft.com/0")
  );
}

/// Test Case: Should not allow to update the URI if the owner is not authenticated
#[test]
#[should_panic(expected = "Error(Auth, InvalidAction)")]
fn test_update_uri_works_no_auth() {
  let e = Env::default();
  let owner = Address::generate(&e);
  let client = create_client(&e, &owner, MAX_SUPPLY);

  client.update_uri(&String::from_str(&e, "https://new-nft.com/"));

  client.mint(&owner);

  assert_eq!(
    client.token_uri(&0),
    String::from_str(&e, "https://new-nft.com/0")
  );
}
