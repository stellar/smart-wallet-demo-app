import { faker } from '@faker-js/faker'

import { Otp } from 'api/core/entities/otp/model'

import { userFactory } from '../user/factory'
import { User } from '../user/types'

interface OtpFactoryArgs {
  otpId?: string
  code?: string
  expiresAt?: Date
  user?: User
}

export const otpFactory = ({ otpId, code, expiresAt, user }: OtpFactoryArgs): Otp => {
  const otp = new Otp()
  otp.otpId = otpId ?? faker.string.uuid()
  otp.code = code ?? faker.string.alphanumeric({ casing: 'upper', length: 6 })
  otp.expiresAt = expiresAt ?? faker.date.soon()
  otp.user = user ?? userFactory({})
  return otp
}
