import { http } from 'src/interfaces/http'
import {
  GetRegisterOptionsInput,
  GetRegisterOptionsResult,
  GetInvitationInfoInput,
  GetInvitationInfoResult,
  IAuthService,
  PostRegisterInput,
  PostRegisterResult,
  GetLogInOptionsInput,
  GetLogInOptionsResult,
  PostLogInInput,
  PostLogInResult,
} from './types'

export class AuthService implements IAuthService {
  async getInvitationInfo(input: GetInvitationInfoInput): Promise<GetInvitationInfoResult> {
    const { uniqueToken } = input

    const response = await http.get(`/api/embedded-wallets/invitation-info/${uniqueToken}`)

    return response.data
  }

  async getRegisterOptions(input: GetRegisterOptionsInput): Promise<GetRegisterOptionsResult> {
    const { email } = input

    const response = await http.get(`/api/embedded-wallets/register/options/${email}`)

    return response.data
  }

  async postRegister(input: PostRegisterInput): Promise<PostRegisterResult> {
    const { registrationResponseJSON } = input

    const response = await http.post(`/api/embedded-wallets/register/options/complete`, {
      registrationResponseJSON,
    })

    return response.data
  }

  async getLogInOptions(input: GetLogInOptionsInput): Promise<GetLogInOptionsResult> {
    const { email } = input

    const response = await http.get(`/api/embedded-wallets/login/options/${email}`)

    return response.data
  }

  async postLogIn(input: PostLogInInput): Promise<PostLogInResult> {
    const { authenticationResponseJSON } = input

    const response = await http.post(`/api/embedded-wallets/login/options/complete`, {
      authenticationResponseJSON,
    })

    return response.data
  }
}

const authService = new AuthService()

export { authService }
