import { productFactory } from './factory'

describe('Product factory tests', () => {
  it('Should fill in random values', async () => {
    const mockedProduct = productFactory({})

    expect(mockedProduct.productId).not.toBeUndefined()
    expect(mockedProduct.code).not.toBeUndefined()
    expect(mockedProduct.name).not.toBeUndefined()
    expect(mockedProduct.description).not.toBeUndefined()
  })

  it('Should fill in custom values', async () => {
    const mockedProduct = productFactory({
      productId: 'abc123',
      code: 'def456',
      name: 'Stellar',
      description: 'Stellar product',
    })

    expect(mockedProduct.productId).toBe('abc123')
    expect(mockedProduct.code).toBe('def456')
    expect(mockedProduct.name).toBe('Stellar')
    expect(mockedProduct.description).toBe('Stellar product')
  })
})
