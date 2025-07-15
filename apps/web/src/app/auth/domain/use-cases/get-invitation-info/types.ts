import { GetInvitationInfoResult as AuthServiceGetInvitationInfoResult } from 'src/app/auth/services/auth/types'

export type GetInvitationInfoInput = {
  uniqueToken: string
}

export type GetInvitationInfoResult = {
  email: string
  status: AuthServiceGetInvitationInfoResult['data']['status']
}
