import { IHTTPResponse } from 'src/interfaces/http/types'
import { WalletStatus } from '../../domain/models/user'

export interface IAuthService {
  getInvitationInfo: (input: GetInvitationInfoInput) => Promise<GetInvitationInfoResult>
  getRegisterOptions: (input: GetRegisterOptionsInput) => Promise<GetRegisterOptionsResult>
  postRegister: (input: PostRegisterInput) => Promise<PostRegisterResult>
  getLogInOptions: (input: GetLogInOptionsInput) => Promise<GetLogInOptionsResult>
  postLogIn: (input: PostLogInInput) => Promise<PostLogInResult>
}

export type GetInvitationInfoInput = {
  uniqueToken: string
}
export type GetInvitationInfoResult = IHTTPResponse<{
  status: WalletStatus | 'NOT_ALLOWED'
  email: string
}>

export type GetRegisterOptionsInput = {
  email: string
}
export type GetRegisterOptionsResult = IHTTPResponse<{
  optionsJSON: string
}>

export type PostRegisterInput = {
  registrationResponseJSON: string
}
export type PostRegisterResult = IHTTPResponse<{
  token: string
}>

export type GetLogInOptionsInput = {
  email: string
}
export type GetLogInOptionsResult = IHTTPResponse<{
  optionsJSON: string
}>

export type PostLogInInput = {
  authenticationResponseJSON: string
}
export type PostLogInResult = IHTTPResponse<{
  token: string
}>
