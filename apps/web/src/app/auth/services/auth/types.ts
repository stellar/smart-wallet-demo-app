import { IHTTPResponse } from 'src/interfaces/http/types'

import { WalletStatus } from '../../domain/models/user'

export interface IAuthService {
  getInvitationInfo: (input: GetInvitationInfoInput) => Promise<GetInvitationInfoResult>
  getRegisterOptions: (input: GetRegisterOptionsInput) => Promise<GetRegisterOptionsResult>
  postRegister: (input: PostRegisterInput) => Promise<PostRegisterResult>
  getLogInOptions: (input: GetLogInOptionsInput) => Promise<GetLogInOptionsResult>
  postLogIn: (input: PostLogInInput) => Promise<PostLogInResult>
  sendRecoveryLink: (input: SendRecoveryLinkInput) => Promise<SendRecoveryLinkResult>
  validateRecoveryLink: (input: ValidateRecoveryLinkInput) => Promise<ValidateRecoveryLinkResult>
  getRecoverWalletOptions: (input: GetRecoverWalletOptionsInput) => Promise<GetRecoverWalletOptionsResult>
  postRecoverWallet: (input: PostRecoverWalletInput) => Promise<PostRecoverWalletResult>
}

export type GetInvitationInfoInput = {
  uniqueToken: string
}
export type GetInvitationInfoResult = IHTTPResponse<{
  status: WalletStatus | 'NOT_ALLOWED'
  email?: string
}>

export type GetRegisterOptionsInput = {
  email: string
}
export type GetRegisterOptionsResult = IHTTPResponse<{
  options_json: string
}>

export type PostRegisterInput = {
  email: string
  registrationResponseJSON: string
}
export type PostRegisterResult = IHTTPResponse<{
  token: string
}>

export type GetLogInOptionsInput = {
  email: string
}
export type GetLogInOptionsResult = IHTTPResponse<{
  options_json: string
}>

export type PostLogInInput = {
  email: string
  authenticationResponseJSON: string
}
export type PostLogInResult = IHTTPResponse<{
  token: string
}>

export type SendRecoveryLinkInput = {
  email: string
}
export type SendRecoveryLinkResult = IHTTPResponse<{
  email_sent: boolean
}>

export type ValidateRecoveryLinkInput = {
  code: string
}
export type ValidateRecoveryLinkResult = IHTTPResponse<{
  is_valid: boolean
}>

export type GetRecoverWalletOptionsInput = {
  code: string
}
export type GetRecoverWalletOptionsResult = IHTTPResponse<{
  options_json: string
}>

export type PostRecoverWalletInput = {
  code: string
  registrationResponseJSON: string
}
export type PostRecoverWalletResult = IHTTPResponse<{
  token: string
}>
