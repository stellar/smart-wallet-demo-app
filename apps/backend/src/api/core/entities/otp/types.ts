import { Otp as OtpModel } from 'api/core/entities/otp/model'
import { FindOneOptions } from 'api/core/framework/orm/base'

import { User } from '../user/types'

export type Otp = OtpModel

export type OtpRepositoryType = {
  getOtpByCode(code: string, options?: FindOneOptions<Otp>): Promise<Otp | null>
  createOtp(user: User, save?: boolean): Promise<Otp>
  saveOtp(otp: Otp): Promise<Otp>
}
