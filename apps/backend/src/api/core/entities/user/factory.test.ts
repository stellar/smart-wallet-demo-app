import { userFactory } from './factory'
import { passkeyFactory } from '../passkey/factory'

describe('User factory tests', () => {
  it('Should fill in random values', async () => {
    const mockedUser = userFactory({})

    expect(mockedUser.userId).not.toBeUndefined()
    expect(mockedUser.email).not.toBeUndefined()
    expect(mockedUser.uniqueToken).not.toBeUndefined()
    expect(mockedUser.contractAddress).not.toBeUndefined()
    expect(mockedUser.passkeys).toStrictEqual([])
  })

  it('Should fill in custom values', async () => {
    const passkey = passkeyFactory({})
    const mockedUser = userFactory({
      userId: 'abc123',
      email: 'test@email.com',
      uniqueToken: 'def456',
      contractAddress: 'CC2L43QJRYCUUEJNSKDEWZBDOOROOL6KSXDCMQKATWJX7YSWGJ2MDT7T',
      passkeys: [passkey],
    })

    expect(mockedUser.userId).toBe('abc123')
    expect(mockedUser.email).toBe('test@email.com')
    expect(mockedUser.uniqueToken).toBe('def456')
    expect(mockedUser.contractAddress).toBe('CC2L43QJRYCUUEJNSKDEWZBDOOROOL6KSXDCMQKATWJX7YSWGJ2MDT7T')
    expect(mockedUser.passkeys[0]).toBe(passkey)
  })
})
