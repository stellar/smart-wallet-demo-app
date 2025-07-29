import { vendorFactory } from './factory'

describe('Vendor factory tests', () => {
  it('Should fill in random values', async () => {
    const mockedVendor = vendorFactory({})

    expect(mockedVendor.vendorId).not.toBeUndefined()
    expect(mockedVendor.name).not.toBeUndefined()
    expect(mockedVendor.contractAddress).not.toBeUndefined()
    expect(mockedVendor.profileImage).not.toBeUndefined()
  })

  it('Should fill in custom values', async () => {
    const mockedVendor = vendorFactory({
      vendorId: 'xyz789',
      name: 'Galactic Shop',
      contractAddress: 'ABCD1234EFGH5678IJKL9012MNOP3456QRST7890UVWX',
      profileImage: 'https://example.com/image.png',
    })

    expect(mockedVendor.vendorId).toBe('xyz789')
    expect(mockedVendor.name).toBe('Galactic Shop')
    expect(mockedVendor.contractAddress).toBe('ABCD1234EFGH5678IJKL9012MNOP3456QRST7890UVWX')
    expect(mockedVendor.profileImage).toBe('https://example.com/image.png')
  })
})
