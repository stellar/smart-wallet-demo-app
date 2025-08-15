import { userProductFactory } from './factory'
import { productFactory } from '../product/factory'
import { userFactory } from '../user/factory'

describe('UserProduct factory tests', () => {
  it('Should fill in random values', async () => {
    const mockedUserProduct = userProductFactory({})

    expect(mockedUserProduct.userProductId).not.toBeUndefined()
    expect(mockedUserProduct.user).not.toBeUndefined()
    expect(mockedUserProduct.product).not.toBeUndefined()
    expect(mockedUserProduct.status).not.toBeUndefined()
    expect(mockedUserProduct.claimedAt).toBeUndefined()
  })

  it('Should fill in custom values', async () => {
    const user = userFactory({})
    const product = productFactory({})
    const mockedUserProduct = userProductFactory({
      userProductId: 'abc123',
      user: user,
      product: product,
      status: 'claimed',
      claimedAt: new Date('2025-07-22T23:59:59Z'),
    })

    expect(mockedUserProduct.userProductId).toBe('abc123')
    expect(mockedUserProduct.user).toBe(user)
    expect(mockedUserProduct.product).toBe(product)
    expect(mockedUserProduct.status).toBe('claimed')
    expect(mockedUserProduct.claimedAt).toEqual(new Date('2025-07-22T23:59:59Z'))
  })
})
