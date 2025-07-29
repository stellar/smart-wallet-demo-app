export type AccountRequest = {
  address: string
}

export type TransactionRequest = {
  transaction: string
}

export type TransactionResponse = {
  transaction: string
  networkPassphrase: string
}

// https://petstore.swagger.io/?url=https://raw.githubusercontent.com/stellar/wallet-backend/refs/heads/main/openapi/main.yaml#/Transactions/post_transactions_build
export type TransactionOperation = {
  operations: string[]
  simulationResult: SimulationResponse
  timeout: number
}

export type SimulationResponse = {
  transactionData: string
  events: string[] // ✅
  minResourceFee: string // ✅
  /** present only for invocation simulation */
  results?: {
    auth: string[]
    xdr: string
  }[] // ✅
  /** State Difference information */
  stateChanges?: {
    type: string
    key: string
    before: string | undefined
    after: string | undefined
  }[] // ✅
  /** always present: the LCL known to the server when responding */
  latestLedger: number // ✅
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
}

export interface Transaction {
  hash: string
  envelopeXdr: string
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
  buildTransaction(transactions: TransactionBuildRequest): Promise<TransactionBuildResponse>
  createFeeBumpTransaction(transaction: TransactionRequest): Promise<TransactionResponse>
}
