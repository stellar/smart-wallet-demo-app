import { Otp as OtpModel } from 'api/core/entities/otp/model'

import { User } from '../user/types'

export type Otp = OtpModel

export type OtpRepositoryType = {
  getOtpByCode(code: string): Promise<Otp | null>
  createOtp(user: User, save?: boolean): Promise<Otp>
  saveOtp(otp: Otp): Promise<Otp>
}
