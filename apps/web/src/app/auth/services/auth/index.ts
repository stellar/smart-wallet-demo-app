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
    const { email, registrationResponseJSON } = input

    const response = await http.post(`/api/embedded-wallets/register/complete`, {
      email,
      registration_response_json: registrationResponseJSON,
    })

    return response.data
  }

  async getLogInOptions(input: GetLogInOptionsInput): Promise<GetLogInOptionsResult> {
    const { email } = input

    const response = await http.get(`/api/embedded-wallets/login/options/${email}`)

    return response.data
  }

  async postLogIn(input: PostLogInInput): Promise<PostLogInResult> {
    const { email, authenticationResponseJSON } = input

    const response = await http.post(`/api/embedded-wallets/login/complete`, {
      email,
      authentication_response_json: authenticationResponseJSON,
    })

    return response.data
  }
}

const authService = new AuthService()

export { authService }
