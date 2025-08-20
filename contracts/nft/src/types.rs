use soroban_sdk::{contracttype, String};

#[contracttype]
pub enum DataKey {
    Owner,
    TotalMinted,
    MaxSupply,
    TokenData(u32),
}

#[contracttype]
pub enum AttributeValue {
    String(String),
    Number(u128),
}

#[contracttype]
pub struct TokenAttribute {
    pub display_type: String,
    pub trait_type: String,
    pub value: AttributeValue,
    pub max_value: u64,
}

#[contracttype]
pub struct TokenData {
    pub session_id: String,
    pub resource: String,
}

#[contracttype]
pub struct TokenMetadata {
    pub name: String,
    pub symbol: String,
    pub base_uri: String,
    // ! todo: should we add these here or separately?
    // pub description: String,
    // pub image: String,
    // pub external_url: String,
    // pub attributes: Vec<TokenAttribute>,
    // pub url: String,
    // pub issuer: String,
}
