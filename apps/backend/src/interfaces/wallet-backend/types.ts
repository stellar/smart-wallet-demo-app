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
  timeout: number
}

export type TransactionBuildRequest = {
  transactions: TransactionOperation[]
}

export type TransactionBuildResponse = {
  transactionXdrs: string[]
}

export type PaymentResponse = {
  payments: object[]
  _links: object // Pagination links
}

export type WalletBackendType = {
  registerAccount(account: AccountRequest): Promise<any>
  deregisterAccount(account: AccountRequest): Promise<any>
  getPayments(account: AccountRequest): Promise<PaymentResponse>
  buildTransaction(account: AccountRequest, transactions: TransactionBuildRequest): Promise<TransactionBuildResponse>
  createFeeBumpTransaction(account: AccountRequest, transactions: TransactionRequest): Promise<TransactionResponse>
}
