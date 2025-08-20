#![cfg(test)]

use crate::{
    contract::{Contract, ContractClient},
    types::TokenMetadata,
};
use soroban_sdk::{
    testutils::{Address as _, EnvTestConfig, Ledger as _, MockAuth, MockAuthInvoke},
    vec, Address, Env, IntoVal, String,
};

const INITIAL_SEQUENCE_NUMBER: u32 = 10;

pub fn setup_test_env() -> Env {
    let mut env = Env::default();

    env.set_config(EnvTestConfig {
        capture_snapshot_at_drop: false,
    });
    env.ledger().set_sequence_number(INITIAL_SEQUENCE_NUMBER);
    env.mock_all_auths();

    env
}

fn get_contract<'a>(env: &Env, owner: &Address, max_supply: u32) -> ContractClient<'a> {
    let address = env.register(
        Contract,
        (
            owner,
            max_supply,
            TokenMetadata {
                name: String::from_str(env, "Non Fungible Token"),
                symbol: String::from_str(env, "NFT"),
                base_uri: String::from_str(env, "https://nft.com/"),
            },
        ),
    );

    ContractClient::new(env, &address)
}

#[test]
fn test_deploy() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let total_supply = 1000u32;

    let contract = get_contract(&env, &owner, total_supply);

    assert_eq!(contract.total_supply(), 0);
    assert_eq!(contract.get_max_supply(), total_supply);

    let contract_metadata = contract.get_token_metadata();

    assert_eq!(
        contract_metadata.name,
        String::from_str(&env, "Non Fungible Token")
    );
    assert_eq!(contract_metadata.symbol, String::from_str(&env, "NFT"));
    assert_eq!(
        contract_metadata.base_uri,
        String::from_str(&env, "https://nft.com/")
    );
}

#[test]
fn test_mint_success() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);
    let contract_address = contract.address.clone();

    env.mock_auths(&[MockAuth {
        address: &owner,
        invoke: &MockAuthInvoke {
            contract: &contract_address,
            fn_name: "mint",
            args: (&recipient,).into_val(&env),
            sub_invokes: &[],
        },
    }]);

    let token_id = contract.mint(&recipient);

    assert_eq!(token_id, 0);
    assert_eq!(contract.total_supply(), 1);
    assert_eq!(contract.owner_of(&token_id), recipient);
}

#[test]
#[should_panic]
fn test_mint_max_supply_reached() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient = Address::generate(&env);
    let contract = get_contract(&env, &owner, 1u32);

    contract.mint(&recipient);
    contract.mint(&recipient);
}

#[test]
#[should_panic]
fn test_mint_unauthorized() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let unauthorized = Address::generate(&env);
    let recipient = Address::generate(&env);
    let contract = get_contract(&env, &owner, 1000u32);

    env.mock_auths(&[MockAuth {
        address: &unauthorized,
        invoke: &MockAuthInvoke {
            contract: &contract.address,
            fn_name: "mint",
            args: (&recipient,).into_val(&env),
            sub_invokes: &[],
        },
    }]);

    contract.mint(&recipient);
}

#[test]
fn test_multiple_mints() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient1 = Address::generate(&env);
    let recipient2 = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    let token_id1 = contract.mint(&recipient1);
    let token_id2 = contract.mint(&recipient2);

    assert_eq!(token_id1, 0);
    assert_eq!(token_id2, 1);
    assert_eq!(contract.total_supply(), 2);
    assert_eq!(contract.owner_of(&token_id1), recipient1);
    assert_eq!(contract.owner_of(&token_id2), recipient2);
}

#[test]
fn test_transfer() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient = Address::generate(&env);
    let new_owner = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    let token_id = contract.mint(&recipient);

    contract.transfer(&recipient, &new_owner, &token_id);

    assert_eq!(contract.owner_of(&token_id), new_owner);
}

#[test]
fn test_transfer_from() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient = Address::generate(&env);
    let new_owner = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    let token_id = contract.mint(&recipient);

    contract.transfer_from(&recipient, &recipient, &new_owner, &token_id);

    assert_eq!(contract.owner_of(&token_id), new_owner);
}

#[test]
fn test_approve_and_transfer() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient = Address::generate(&env);
    let spender = Address::generate(&env);
    let new_owner = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    let live_until_ledger = INITIAL_SEQUENCE_NUMBER + 3;

    let token_id = contract.mint(&recipient);

    assert_eq!(token_id, 0);

    contract.approve(&recipient, &spender, &token_id, &live_until_ledger);
    contract.transfer_from(&spender, &recipient, &new_owner, &token_id);

    assert_eq!(contract.owner_of(&token_id), new_owner);
}

#[test]
fn test_bulk_transfer() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient = Address::generate(&env);
    let new_owner = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    let token_ids = vec![
        &env,
        contract.mint(&recipient),
        contract.mint(&recipient),
        contract.mint(&recipient),
    ];

    contract.bulk_transfer(&recipient, &new_owner, &token_ids);

    for token_id in token_ids.iter() {
        assert_eq!(contract.owner_of(&token_id), new_owner);
    }
}

#[test]
#[should_panic]
fn test_bulk_transfer_incorrect_owner() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient = Address::generate(&env);
    let new_owner = Address::generate(&env);
    let wrong_owner = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    let token_ids = vec![&env, contract.mint(&recipient)];

    contract.bulk_transfer(&wrong_owner, &new_owner, &token_ids);
}

#[test]
#[should_panic]
fn test_bulk_transfer_unauthorized() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient = Address::generate(&env);
    let new_owner = Address::generate(&env);
    let wrong_owner = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    let token_ids = vec![&env, contract.mint(&recipient)];

    env.mock_auths(&[MockAuth {
        address: &wrong_owner,
        invoke: &MockAuthInvoke {
            contract: &contract.address,
            fn_name: "bulk_transfer",
            args: (&wrong_owner,).into_val(&env),
            sub_invokes: &[],
        },
    }]);

    contract.bulk_transfer(&recipient, &new_owner, &token_ids);
}

#[test]
fn test_set_metadata_uri() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    let new_uri = "https://new-uri.com/metadata/";
    contract.set_metadata_uri(&String::from_str(&env, new_uri));

    let metadata = contract.get_token_metadata();

    assert_eq!(metadata.base_uri, String::from_str(&env, new_uri));
}

#[test]
#[should_panic]
fn test_set_metadata_uri_unauthorized() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let unauthorized = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    let new_uri = "https://new-uri.com/metadata/";

    let uri = String::from_str(&env, new_uri);

    env.mock_auths(&[MockAuth {
        address: &unauthorized,
        invoke: &MockAuthInvoke {
            contract: &contract.address,
            fn_name: "set_metadata_uri",
            args: (&unauthorized,).into_val(&env),
            sub_invokes: &[],
        },
    }]);

    contract.set_metadata_uri(&uri);
}

#[test]
fn test_get_owner_tokens() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient1 = Address::generate(&env);
    let recipient2 = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    contract.mint(&recipient1);
    contract.mint(&recipient1);
    contract.mint(&recipient2);

    let recipient1_tokens = contract.get_owner_tokens(&recipient1);
    let recipient2_tokens = contract.get_owner_tokens(&recipient2);

    assert_eq!(recipient1_tokens.len(), 2);
    assert_eq!(recipient2_tokens.len(), 1);
    assert_eq!(recipient1_tokens.get(0), Some(&0u32).copied());
    assert_eq!(recipient1_tokens.get(1), Some(&1u32).copied());
}

#[test]
fn test_get_owner_tokens_empty() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient = Address::generate(&env);
    let empty_owner = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    contract.mint(&recipient);

    let empty_tokens = contract.get_owner_tokens(&empty_owner);
    assert_eq!(empty_tokens.len(), 0);
}

#[test]
fn test_burn() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    let token_id = contract.mint(&recipient);

    contract.burn(&recipient, &token_id);

    assert_eq!(contract.total_supply(), 0);
}

#[test]
fn test_revoke_approval() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient = Address::generate(&env);
    let spender = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    let live_until_ledger = INITIAL_SEQUENCE_NUMBER + 3;

    let token_id = contract.mint(&recipient);

    contract.approve(&recipient, &spender, &token_id, &live_until_ledger);
    contract.approve(&recipient, &spender, &0u32, &live_until_ledger);

    assert_eq!(contract.get_approved(&token_id), Some(&spender).cloned());
}

#[test]
fn test_enumeration() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    let token_id1 = contract.mint(&recipient);
    let token_id2 = contract.mint(&recipient);
    let token_id3 = contract.mint(&recipient);

    assert_eq!(contract.total_supply(), 3);
    assert_eq!(contract.get_token_id(&0u32), token_id1);
    assert_eq!(contract.get_token_id(&1u32), token_id2);
    assert_eq!(contract.get_token_id(&2u32), token_id3);
}

#[test]
fn test_owner_enumeration() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient1 = Address::generate(&env);
    let recipient2 = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    let token_id1 = contract.mint(&recipient1);
    let token_id2 = contract.mint(&recipient1);
    let token_id3 = contract.mint(&recipient2);

    assert_eq!(contract.get_token_id(&0u32), token_id1);
    assert_eq!(contract.get_token_id(&1u32), token_id2);
    assert_eq!(contract.get_token_id(&2u32), token_id3);
}

#[test]
fn test_balance_of() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient1 = Address::generate(&env);
    let recipient2 = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    contract.mint(&recipient1);
    contract.mint(&recipient1);
    contract.mint(&recipient2);

    assert_eq!(contract.balance(&recipient1), 2);
    assert_eq!(contract.balance(&recipient2), 1);
    assert_eq!(contract.balance(&owner), 0);
}

#[test]
fn test_constructor_edge_cases() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let zero_supply = 0u32;
    let max_supply = u32::MAX;

    let contract = get_contract(&env, &owner, zero_supply);
    assert_eq!(contract.get_max_supply(), 0);

    let contract = get_contract(&env, &owner, max_supply);
    assert_eq!(contract.get_max_supply(), u32::MAX);
}

#[test]
fn test_mint_sequential_ids() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    for i in 0..10 {
        let token_id = contract.mint(&recipient);
        assert_eq!(token_id, i);
    }
}

#[test]
fn test_transfer_to_self() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    let token_id = contract.mint(&recipient);

    contract.transfer(&recipient, &recipient, &token_id);

    assert_eq!(contract.owner_of(&token_id), recipient);
}

#[test]
fn test_approve_self() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    let live_until_ledger = INITIAL_SEQUENCE_NUMBER + 3;

    let token_id = contract.mint(&recipient);

    contract.approve(&recipient, &recipient, &token_id, &live_until_ledger);

    assert_eq!(contract.get_approved(&token_id), Some(&recipient).cloned());
}

#[test]
fn test_approve_for_all_self() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    let live_until_ledger = INITIAL_SEQUENCE_NUMBER + 3;

    contract.mint(&recipient);

    contract.approve_for_all(&recipient, &recipient, &live_until_ledger);

    assert!(contract.is_approved_for_all(&recipient, &recipient));
}

#[test]
fn test_metadata_persistence() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    let metadata = contract.get_token_metadata();

    assert_eq!(metadata.name, String::from_str(&env, "Non Fungible Token"));
    assert_eq!(metadata.symbol, String::from_str(&env, "NFT"));
    assert_eq!(
        metadata.base_uri,
        String::from_str(&env, "https://nft.com/")
    );
}

#[test]
fn test_set_token_data() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    let token_id = contract.mint(&recipient);

    let token_data = crate::types::TokenData {
        session_id: String::from_str(&env, "session_123"),
        resource: String::from_str(&env, "resource_456"),
    };

    contract.set_token_data(&token_id, &token_data);

    let retrieved_data = contract.get_token_data(&token_id);
    assert_eq!(retrieved_data.session_id, token_data.session_id);
    assert_eq!(retrieved_data.resource, token_data.resource);
}

#[test]
#[should_panic]
fn test_set_token_data_unauthorized() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient = Address::generate(&env);
    let unauthorized = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    let token_id = contract.mint(&recipient);

    let token_data = crate::types::TokenData {
        session_id: String::from_str(&env, "session_123"),
        resource: String::from_str(&env, "resource_456"),
    };

    env.mock_auths(&[MockAuth {
        address: &unauthorized,
        invoke: &MockAuthInvoke {
            contract: &contract.address,
            fn_name: "set_token_data",
            args: (&unauthorized,).into_val(&env),
            sub_invokes: &[],
        },
    }]);

    contract.set_token_data(&token_id, &token_data);
}

#[test]
fn test_get_token_data() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    let token_id = contract.mint(&recipient);

    let token_data = crate::types::TokenData {
        session_id: String::from_str(&env, "session_789"),
        resource: String::from_str(&env, "resource_abc"),
    };

    contract.set_token_data(&token_id, &token_data);

    let retrieved_data = contract.get_token_data(&token_id);
    assert_eq!(retrieved_data.session_id, token_data.session_id);
    assert_eq!(retrieved_data.resource, token_data.resource);
}

#[test]
fn test_mint_with_data() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    let token_data = crate::types::TokenData {
        session_id: String::from_str(&env, "session_mint"),
        resource: String::from_str(&env, "resource_mint"),
    };

    let token_id = contract.mint_with_data(&recipient, &token_data);

    assert_eq!(token_id, 0);
    assert_eq!(contract.owner_of(&token_id), recipient);

    let retrieved_data = contract.get_token_data(&token_id);
    assert_eq!(retrieved_data.session_id, token_data.session_id);
    assert_eq!(retrieved_data.resource, token_data.resource);
}

#[test]
#[should_panic]
fn test_mint_with_data_unauthorized() {
    let env = setup_test_env();
    let owner = Address::generate(&env);
    let recipient = Address::generate(&env);
    let unauthorized = Address::generate(&env);
    let contract = get_contract(&env, &owner, 100u32);

    let token_data = crate::types::TokenData {
        session_id: String::from_str(&env, "session_unauthorized"),
        resource: String::from_str(&env, "resource_unauthorized"),
    };

    env.mock_auths(&[MockAuth {
        address: &unauthorized,
        invoke: &MockAuthInvoke {
            contract: &contract.address,
            fn_name: "mint_with_data",
            args: (&unauthorized,).into_val(&env),
            sub_invokes: &[],
        },
    }]);

    contract.mint_with_data(&recipient, &token_data);
}
