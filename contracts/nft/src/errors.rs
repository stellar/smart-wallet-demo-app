use soroban_sdk::contracterror;

#[contracterror]
pub enum NonFungibleTokenContractError {
  MaxSupplyReached = 1,
  UnsetMaxSupply = 2,
  UnsetTotalMinted = 3,
  UnsetOwner = 4,
}
