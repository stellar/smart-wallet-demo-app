import { c } from 'src/interfaces/cms/useContent'

import { HomeTemplate } from './template'

export const Home = () => {
  const handleNavbarButtonClick = (_item: 'nft' | 'history' | 'profile') => {
    throw new Error('Function not implemented.')
  }

  return (
    <HomeTemplate
      balanceAmount={0}
      products={[]}
      faq={{
        title: c('frequentlyAskedQuestions'),
        items: [],
      }}
      onNavbarButtonClick={handleNavbarButtonClick}
    />
  )
}
