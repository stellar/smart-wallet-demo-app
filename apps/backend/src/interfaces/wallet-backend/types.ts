export type AccountRequest = {
  address: string
}

export type TransactionRequest = {
  transaction: string
}

export type TransactionResponse = {
  // TODO: change to Transaction type when wallet-backend is updated
  transaction: string
  networkPassphrase: string
}

// https://petstore.swagger.io/?url=https://raw.githubusercontent.com/stellar/wallet-backend/refs/heads/main/openapi/main.yaml#/Transactions/post_transactions_build
export type TransactionOperation = {
  // TODO: change to Operation type when wallet-backend is updated
  operations: string[]
  timeout: number
}

export type TransactionBuildRequest = {
  transactions: TransactionOperation[]
}

export type TransactionBuildResponse = {
  transactionXdrs: string[]
}

export interface Operation {
  id: string
  operationXdr: string
  stateChanges: {
    accountId: string
    stateChangeCategory: string
    stateChangeReason: string
    tokenId: string
    amount: string
  }[]
}

export interface Transaction {
  hash: string
  envelopeXdr: string
  ledgerCreatedAt: string
  operations: Operation[]
}

export interface AccountWithTransactions {
  address: string
  transactions: Transaction[]
}

export interface GetTransactionsResponse {
  account: AccountWithTransactions
}

export type WalletBackendType = {
  registerAccount(account: AccountRequest): Promise<object>
  deregisterAccount(account: AccountRequest): Promise<object>
  getTransactions(account: AccountRequest): Promise<GetTransactionsResponse>
  buildTransaction(account: AccountRequest, transactions: TransactionBuildRequest): Promise<TransactionBuildResponse>
  createFeeBumpTransaction(account: AccountRequest, transactions: TransactionRequest): Promise<TransactionResponse>
}
