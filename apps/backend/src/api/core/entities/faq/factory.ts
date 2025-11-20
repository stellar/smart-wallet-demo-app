import { faker } from '@faker-js/faker'

import { Faq } from 'api/core/entities/faq/model'

interface FaqFactoryArgs {
  faqId?: string
  title?: string
  description?: string
  order?: number
}

export const faqFactory = ({ faqId, title, description, order }: FaqFactoryArgs): Faq => {
  const faq = new Faq()
  faq.faqId = faqId ?? faker.string.uuid()
  faq.title = title ?? faker.lorem.sentence()
  faq.description = description ?? faker.lorem.paragraph()
  faq.order = order ?? 0
  return faq
}
