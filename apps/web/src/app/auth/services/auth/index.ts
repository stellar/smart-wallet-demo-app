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
  SendRecoveryLinkInput,
  SendRecoveryLinkResult,
  ValidateRecoveryLinkInput,
  ValidateRecoveryLinkResult,
  GetRecoverWalletOptionsInput,
  GetRecoverWalletOptionsResult,
  PostRecoverWalletInput,
  PostRecoverWalletResult,
  ResendInviteLinkInput,
  ResendInviteLinkResult,
} from './types'

export class AuthService implements IAuthService {
  async getInvitationInfo(input: GetInvitationInfoInput): Promise<GetInvitationInfoResult> {
    const { uniqueToken } = input

    const response = await http.get(`/api/embedded-wallets/invitation-info/${uniqueToken}`)

    return response.data
  }

  async getRegisterOptions(input: GetRegisterOptionsInput): Promise<GetRegisterOptionsResult> {
    const { invitationToken } = input

    const response = await http.get(`/api/embedded-wallets/register/options`, {
      headers: {
        'x-invitation-token': invitationToken,
      },
    })

    return response.data
  }

  async postRegister(input: PostRegisterInput): Promise<PostRegisterResult> {
    const { invitationToken, registrationResponseJSON } = input

    const response = await http.post(
      `/api/embedded-wallets/register/complete`,
      {
        registration_response_json: registrationResponseJSON,
      },
      {
        headers: {
          'x-invitation-token': invitationToken,
        },
      }
    )

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

  async sendRecoveryLink(input: SendRecoveryLinkInput): Promise<SendRecoveryLinkResult> {
    const { email } = input

    const response = await http.post(`/api/embedded-wallets/send-recovery-link`, {
      email,
    })

    return response.data
  }

  async validateRecoveryLink(input: ValidateRecoveryLinkInput): Promise<ValidateRecoveryLinkResult> {
    const { code } = input

    const response = await http.post(`/api/embedded-wallets/validate-recovery-link`, {
      code,
    })

    return response.data
  }

  async getRecoverWalletOptions(input: GetRecoverWalletOptionsInput): Promise<GetRecoverWalletOptionsResult> {
    const { code } = input

    const response = await http.get(`/api/embedded-wallets/recover/options/${code}`)

    return response.data
  }

  async postRecoverWallet(input: PostRecoverWalletInput): Promise<PostRecoverWalletResult> {
    const { code, registrationResponseJSON } = input

    const response = await http.post(`/api/embedded-wallets/recover/complete`, {
      code,
      registration_response_json: registrationResponseJSON,
    })

    return response.data
  }

  async resendInviteLink(input: ResendInviteLinkInput): Promise<ResendInviteLinkResult> {
    const response = await http.post(`/api/embedded-wallets/resend-invite`, {
      email: input.email,
    })

    return response.data
  }
}

const authService = new AuthService()

export { authService }
