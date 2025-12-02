import { ngoFactory } from './factory'

describe('Ngo factory tests', () => {
  it('Should fill in random values', async () => {
    const mockedNgo = ngoFactory({})

    expect(mockedNgo.ngoId).not.toBeUndefined()
    expect(mockedNgo.name).not.toBeUndefined()
    expect(mockedNgo.description).not.toBeUndefined()
    expect(mockedNgo.isActive).not.toBeUndefined()
    expect(mockedNgo.displayOrder).not.toBeUndefined()
    expect(mockedNgo.walletAddress).not.toBeUndefined()
    expect(mockedNgo.profileImage).not.toBeUndefined()
  })

  it('Should fill in custom values', async () => {
    const mockedNgo = ngoFactory({
      ngoId: 'xyz789',
      name: 'NGO Name',
      description: 'NGO Description',
      isActive: true,
      displayOrder: 0,
      walletAddress: 'ABCD1234EFGH5678IJKL9012MNOP3456QRST7890UVWX',
      profileImage: 'https://example.com/image.png',
    })

    expect(mockedNgo.ngoId).toBe('xyz789')
    expect(mockedNgo.name).toBe('NGO Name')
    expect(mockedNgo.description).toBe('NGO Description')
    expect(mockedNgo.isActive).toBe(true)
    expect(mockedNgo.displayOrder).toBe(0)
    expect(mockedNgo.walletAddress).toBe('ABCD1234EFGH5678IJKL9012MNOP3456QRST7890UVWX')
    expect(mockedNgo.profileImage).toBe('https://example.com/image.png')
  })
})
