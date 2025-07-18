import { GetInvitationInfoResult as AuthServiceGetInvitationInfoResult } from 'src/app/auth/services/auth/types'

export type GetInvitationInfoInput = {
  uniqueToken: string
}

export type GetInvitationInfoResult = {
  status: AuthServiceGetInvitationInfoResult['data']['status']
  email?: string
}
