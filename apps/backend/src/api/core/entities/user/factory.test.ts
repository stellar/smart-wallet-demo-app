import { passkeyFactory } from '../passkey/factory'
import { userFactory } from './factory'

describe('User factory tests', () => {
  it('Should fill in random values', async () => {
    const mockedUser = userFactory({})

    expect(mockedUser.userId).not.toBeUndefined()
    expect(mockedUser.email).not.toBeUndefined()
    expect(mockedUser.uniqueToken).not.toBeUndefined()
    expect(mockedUser.publicKey).not.toBeUndefined()
    expect(mockedUser.passkeys).toStrictEqual([])
  })

  it('Should fill in custom values', async () => {
    const passkey = passkeyFactory({})
    const mockedUser = userFactory({
      userId: 'abc123',
      email: 'test@email.com',
      uniqueToken: 'def456',
      publicKey: 'xyz789',
      passkeys: [passkey],
    })

    expect(mockedUser.userId).toBe('abc123')
    expect(mockedUser.email).toBe('test@email.com')
    expect(mockedUser.uniqueToken).toBe('def456')
    expect(mockedUser.publicKey).toBe('xyz789')
    expect(mockedUser.passkeys[0]).toBe(passkey)
  })
})
