import { Otp as OtpModel } from 'api/core/entities/otp/model'
import { Otp, OtpRepositoryType } from 'api/core/entities/otp/types'
import { User } from 'api/core/entities/user/types'
import { FindOneOptions } from 'api/core/framework/orm/base'
import { SingletonBase } from 'api/core/framework/singleton/interface'
import { randomAlphaNumeric } from 'api/core/utils/random'

export default class OtpRepository extends SingletonBase implements OtpRepositoryType {
  constructor() {
    super()
  }

  async getOtpByCode(code: string, options?: FindOneOptions<Otp>): Promise<Otp | null> {
    return OtpModel.findOneBy({ code, ...options })
  }

  async createOtp(user: User, save?: boolean): Promise<Otp> {
    const code = randomAlphaNumeric(6)
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 5) // OTP valid for 5 minutes

    const newOtp = OtpModel.create({ code, expiresAt, user })
    if (save) {
      return this.saveOtp(newOtp)
    }
    return newOtp
  }

  async saveOtp(otp: Otp): Promise<Otp> {
    return OtpModel.save(otp)
  }
}
