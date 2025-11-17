export enum WalletStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export type CreateWalletRequest = {
  token: string
  public_key: string
  credential_id: string
}

export type CreateWalletResponse = {
  status: WalletStatus
}

export type CheckWalletStatusResponse = {
  status: WalletStatus
  contract_address?: string
  receiver_contact: string
  contact_type: string
}

export type GetContractAddressResponse = {
  status: WalletStatus
  contract_address?: string
}

export type ResendInviteResponse = {
  message: string
}

export type CosignRecoveryResponse = {
  transaction_xdr: string
}

export type SDPEmbeddedWalletsType = {
  createWallet(input: CreateWalletRequest): Promise<CreateWalletResponse>
  checkWalletStatus(token: string): Promise<CheckWalletStatusResponse>
  getContractAddress(id: string): Promise<GetContractAddressResponse>
  resendInvite(email: string): Promise<ResendInviteResponse>
  cosignRecovery(contractAddress: string, xdr: string): Promise<CosignRecoveryResponse>
}
