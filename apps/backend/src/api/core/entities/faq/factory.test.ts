import { faqFactory } from './factory'

describe('Faq factory tests', () => {
  it('Should fill in random values', async () => {
    const mockedFaq = faqFactory({})

    expect(mockedFaq.faqId).not.toBeUndefined()
    expect(mockedFaq.title).not.toBeUndefined()
    expect(mockedFaq.description).not.toBeUndefined()
    expect(mockedFaq.order).not.toBeUndefined()
  })

  it('Should fill in custom values', async () => {
    const mockedFaq = faqFactory({
      faqId: 'xyz789',
      title: 'How do I create a wallet?',
      description: 'You can create a wallet by following these steps...',
      order: 1,
    })

    expect(mockedFaq.faqId).toBe('xyz789')
    expect(mockedFaq.title).toBe('How do I create a wallet?')
    expect(mockedFaq.description).toBe('You can create a wallet by following these steps...')
    expect(mockedFaq.order).toBe(1)
  })
})
