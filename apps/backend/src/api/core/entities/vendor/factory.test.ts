import { vendorFactory } from './factory'

describe('Vendor factory tests', () => {
  it('Should fill in random values', async () => {
    const mockedVendor = vendorFactory({})

    expect(mockedVendor.vendorId).not.toBeUndefined()
    expect(mockedVendor.name).not.toBeUndefined()
    expect(mockedVendor.description).not.toBeUndefined()
    expect(mockedVendor.isActive).not.toBeUndefined()
    expect(mockedVendor.displayOrder).not.toBeUndefined()
    expect(mockedVendor.walletAddress).not.toBeUndefined()
    expect(mockedVendor.profileImage).not.toBeUndefined()
  })

  it('Should fill in custom values', async () => {
    const mockedVendor = vendorFactory({
      vendorId: 'xyz789',
      name: 'Galactic Shop',
      description: 'Galactic Shop description',
      isActive: true,
      displayOrder: 1,
      walletAddress: 'ABCD1234EFGH5678IJKL9012MNOP3456QRST7890UVWX',
      profileImage: 'https://example.com/image.png',
    })

    expect(mockedVendor.vendorId).toBe('xyz789')
    expect(mockedVendor.name).toBe('Galactic Shop')
    expect(mockedVendor.description).toBe('Galactic Shop description')
    expect(mockedVendor.isActive).toBe(true)
    expect(mockedVendor.displayOrder).toBe(1)
    expect(mockedVendor.walletAddress).toBe('ABCD1234EFGH5678IJKL9012MNOP3456QRST7890UVWX')
    expect(mockedVendor.profileImage).toBe('https://example.com/image.png')
  })
})
