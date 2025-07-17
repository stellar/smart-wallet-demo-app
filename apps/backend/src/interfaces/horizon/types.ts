export type AccountRequest = {
  address: string
}

// Example: https://horizon.stellar.org/accounts/GA223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG
export type AccountResponse = {
  id: string
  account_id: string
  balances: Balance[]
}

// Example: https://horizon.stellar.org/accounts/GA223OFHVKVAH2NBXP4AURJRVJTSOVHGBMKJNL6GRJWNN4SARVGSITYG
export type Balance = {
  balance: string
  asset_type: string
  asset_code?: string
  asset_issuer?: string
}

export type HorizonType = {
  getAccountBalance(account: AccountRequest): Promise<AccountResponse>
}
