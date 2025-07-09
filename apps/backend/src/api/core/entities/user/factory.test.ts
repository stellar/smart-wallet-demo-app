import { userFactory } from './factory'

describe('User factory tests', () => {
  it('Should fill in random values', async () => {
    const mockedUser = userFactory({})

    expect(mockedUser.userId).not.toBeUndefined()
    expect(mockedUser.email).not.toBeUndefined()
    expect(mockedUser.uniqueToken).not.toBeUndefined()
    expect(mockedUser.publicKey).not.toBeUndefined()
  })

  it('Should fill in custom values', async () => {
    const mockedUser = userFactory({
      userId: 'abc123',
      email: 'test@email.com',
      uniqueToken: 'def456',
      publicKey: 'xyz789',
    })

    expect(mockedUser.userId).toBe('abc123')
    expect(mockedUser.email).toBe('test@email.com')
    expect(mockedUser.uniqueToken).toBe('def456')
    expect(mockedUser.publicKey).toBe('xyz789')
  })
})
