use soroban_sdk::contracterror;

#[contracterror]
pub enum NonFungibleTokenContractError {
    SupplyExhausted = 1,
    UnsetMaxSupply = 2,
    UnsetTotalMinted = 3,
    UnsetOwner = 4,
    UnsetTokenData = 5,
    AlreadyMinted = 6,
    TokenDoesNotExist = 7,
}
