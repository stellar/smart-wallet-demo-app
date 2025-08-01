import { Button, Icon, Text } from '@stellar/design-system'
import clsx from 'clsx'
import Skeleton from 'react-loading-skeleton'

import ProductMock02 from 'src/assets/images/mock/ecobag.png'
import ProductMock01 from 'src/assets/images/mock/jacket.png'
import { modalService } from 'src/components/molecules/modal/provider'
import { Carousel, SafeAreaView, ImageCard, Collapse, CollapseItem } from 'src/components/organisms'
import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'

import { Amount } from '../../components'

type NavbarItemType = 'nft' | 'history' | 'profile'

type Props = {
  isLoadingBalance: boolean
  balanceAmount: number
  products?: React.ComponentProps<typeof ImageCard>[]
  faq?: {
    title: string
    items: {
      title: string
      description: string
    }[]
  }
  banner?: {
    backgroundImageUri: string
    label: {
      title: string
      description: string
      variant: 'primary' | 'secondary'
    }
    button: Omit<React.ComponentProps<typeof Button>, 'variant' | 'size' | 'isRounded'>
  }
  onNavbarButtonClick: (item: NavbarItemType) => void
  onPayClick: () => void
}

export const HomeTemplate = ({
  isLoadingBalance,
  balanceAmount,
  faq = {
    title: c('frequentlyAskedQuestions'),
    items: [
      {
        title: 'What is your return policy?',
        description: 'You can return any item within 30 days of purchase for a full refund, no questions asked.',
      },
      {
        title: 'Do you offer international shipping?',
        description: 'Yes, we ship to most countries worldwide. Shipping times and costs may vary by destination.',
      },
    ],
  },
  products = [
    {
      imageUri: ProductMock01,
      name: 'Jacket',
      leftBadge: { label: c('walletHomeProductListLeftBadgeOptionALabel'), variant: 'success' },
    },
    {
      imageUri: ProductMock02,
      name: 'Ecobag',
      leftBadge: { label: c('walletHomeProductListLeftBadgeOptionBLabel'), variant: 'disabled' },
    },
  ],
  banner = {
    backgroundImageUri: a('airdropBannerBackground'),
    label: {
      title: c('airdropBannerTitle'),
      description: c('airdropBannerDescriptionA'),
      variant: 'primary',
    },
    button: {
      title: c('airdropBannerButtonTitle'),
      onClick: () =>
        modalService.open({
          key: 'airdrop-modal',
          title: {
            text: c('airdropBannerTitle'),
            image: {
              source: 'blank-space',
            },
          },
          description: c('airdropBannerDescriptionB'),
          backgroundImageUri: a('airdropDefaultBackground'),
          button: {
            children: c('airdropBannerButtonTitle'),
            variant: 'secondary',
            size: 'lg',
            isRounded: true,
            onClick: () => {
              alert('Airdrop claim button pressed')
            },
          },
        }),
    },
  },
  onNavbarButtonClick,
  onPayClick,
}: Props) => {
  const HorizontalRule = () => <div className="border-t border-borderPrimary w-full" />

  const Navbar = () => {
    const NavbarButton = ({ navbarItem, children }: { navbarItem: NavbarItemType; children: React.ReactNode }) => (
      <Button
        onClick={() => onNavbarButtonClick(navbarItem)}
        variant={'tertiary'}
        size={'md'}
        style={{ border: 0 }}
        isFullWidth
      >
        {children}
      </Button>
    )

    return (
      <nav className="w-full gap-2 flex justify-between items-center">
        <NavbarButton navbarItem="nft">
          <div className="flex items-center gap-2">
            <Icon.Image01 />
            {c('navbarItemATitle')}
          </div>
        </NavbarButton>
        <NavbarButton navbarItem="history">
          <div className="flex items-center gap-2">
            <Icon.ClockRewind />
            {c('navbarItemBTitle')}
          </div>
        </NavbarButton>
        <NavbarButton navbarItem="profile">
          <div className="flex items-center gap-2">
            <Icon.UserCircle />
            {c('navbarItemCTitle')}
          </div>
        </NavbarButton>
      </nav>
    )
  }

  const Balance = () =>
    isLoadingBalance ? (
      <div className="justify-center items-center h-[73px]">
        <Skeleton height={73} />
      </div>
    ) : (
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-4">
          <Text addlClassName={'text-textSecondary'} as={'h4'} size={'md'} weight="medium">
            {c('balance')}
          </Text>
          <Amount amount={balanceAmount} asset={'XLM'} />
        </div>

        <Button variant={'secondary'} size={'lg'} icon={<Icon.Scan />} iconPosition="left" onClick={onPayClick}>
          {c('pay')}
        </Button>
      </div>
    )

  const Banner = () =>
    banner && (
      <div
        className="flex flex-col rounded-[10px] p-4 gap-4 bg-cover"
        style={{ backgroundImage: `url(${banner.backgroundImageUri})` }}
      >
        <div className="flex flex-col">
          <Text
            addlClassName={clsx(banner.label.variant === 'secondary' && 'text-whitish')}
            as={'h4'}
            size={'md'}
            weight="bold"
          >
            {banner.label.title}
          </Text>
          <Text
            addlClassName={clsx(banner.label.variant === 'secondary' && 'text-textTertiary')}
            as={'span'}
            size={'sm'}
          >
            {banner.label.description}
          </Text>
        </div>
        <div className="flex">
          <Button variant={'secondary'} size={'sm'} isRounded {...banner.button}>
            {banner.button.title}
          </Button>
        </div>
      </div>
    )

  const ProductList = () => (
    <Carousel title={c('walletHomeProductListTitle')} className="gap-3 py-2 px-4 -mx-4">
      {products.map((product, index) => (
        <ImageCard key={index} {...product} />
      ))}
    </Carousel>
  )

  const ProductActionButton = () => (
    <div className="flex flex-col items-center gap-3">
      <Button variant={'secondary'} size={'lg'} isRounded isFullWidth>
        {c('walletHomeProductListButtonText')}
      </Button>
      <div className="text-textSecondary">
        <Text as={'p'} size={'xs'} weight="medium">
          {c('walletHomeProductListButtonDescription')}
        </Text>
      </div>
    </div>
  )

  const Faq = () => (
    <Collapse title={faq.title}>
      {faq.items.map((item, index) => (
        <CollapseItem key={index} title={item.title}>
          <Text as={'p'} size={'sm'}>
            {item.description}
          </Text>
        </CollapseItem>
      ))}
    </Collapse>
  )

  return (
    <SafeAreaView>
      <div className="flex flex-col gap-8 mb-7">
        <Navbar />
        <Balance />
        <Banner />
        <HorizontalRule />
        <ProductList />
        <ProductActionButton />
        <HorizontalRule />
        <Faq />
      </div>
    </SafeAreaView>
  )
}
