import { IAuthService } from 'src/app/auth/services/auth/types'
import { UseCaseBase } from 'src/app/core/framework/use-case/base'
import { GetInvitationInfoInput, GetInvitationInfoResult } from './types'
import { authService } from 'src/app/auth/services'
import { useEmailStore } from 'src/app/auth/store'

export class GetInvitationInfoUseCase extends UseCaseBase<GetInvitationInfoResult> {
  private authService: IAuthService

  constructor(authService: IAuthService) {
    super()
    this.authService = authService
  }

  async handle(input: GetInvitationInfoInput): Promise<GetInvitationInfoResult> {
    const { uniqueToken } = input

    const { data: invitationInfo } = await this.authService.getInvitationInfo({ uniqueToken })

    const email = invitationInfo.email
    useEmailStore.getState().setEmail(email)

    return { email, status: invitationInfo.status }
  }
}

const getInvitationInfoUseCase = new GetInvitationInfoUseCase(authService)

export { getInvitationInfoUseCase }
