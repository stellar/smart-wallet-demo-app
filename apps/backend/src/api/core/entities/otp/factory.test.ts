import { otpFactory } from './factory'
import { userFactory } from '../user/factory'

describe('Otp factory tests', () => {
  it('Should fill in random values', async () => {
    const mockedOtp = otpFactory({})

    expect(mockedOtp.otpId).not.toBeUndefined()
    expect(mockedOtp.code).not.toBeUndefined()
    expect(mockedOtp.expiresAt).not.toBeUndefined()
    expect(mockedOtp.user).not.toBeUndefined()
  })

  it('Should fill in custom values', async () => {
    const mockedOtp = otpFactory({
      otpId: '12345678-1234-1234-1234-123456789012',
      code: 'ABC123',
      expiresAt: new Date('2025-07-22T23:59:59Z'),
      user: userFactory({
        userId: 'abc123',
        email: 'test@email.com',
      }),
    })

    expect(mockedOtp.code).toBe('ABC123')
    expect(mockedOtp.expiresAt).toEqual(new Date('2025-07-22T23:59:59Z'))
    expect(mockedOtp.user.userId).toBe('abc123')
    expect(mockedOtp.user.email).toBe('test@email.com')
  })
})
