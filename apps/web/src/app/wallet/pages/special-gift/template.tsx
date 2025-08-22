import { Text, Button, Icon } from '@stellar/design-system'
import Skeleton from 'react-loading-skeleton'

import { Typography, TypographyVariant } from 'src/components/atoms'
import { GhostButton } from 'src/components/molecules'
import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'

type Props = {
  isCheckingGiftEligibility: boolean
  isSharingImage: boolean
  isGiftClaimed: boolean
  imageUri: string
  onGoBack: () => void
  onClaimGift: () => void
  onShareImage: () => void
}

export const SpecialGiftTemplate = ({
  isCheckingGiftEligibility,
  isSharingImage,
  isGiftClaimed,
  imageUri,
  onGoBack,
  onClaimGift,
  onShareImage,
}: Props) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Scrollable + Centerable content */}
      <div className="flex-1 overflow-y-auto flex justify-center items-center">
        <div className="flex flex-col items-center justify-center gap-6 py-8 px-4 min-h-full">
          <div className="flex flex-col bg-background p-4 drop-shadow-lg items-center gap-4">
            <img src={imageUri} alt="Special gift image" className="max-w-full h-auto object-contain" />

            <div className="flex gap-4">
              <img className="text-primary" src={a('yellowLogo')} width={32} alt="Logo" />
              <Typography variant={TypographyVariant.h1Brand} className="text-3xl">
                {c('specialGiftTitle')}
              </Typography>
            </div>
          </div>

          <div className="flex flex-col w-full gap-4">
            {isCheckingGiftEligibility ? (
              <Skeleton height={40} borderRadius={'1.25rem'} />
            ) : (
              <div className="flex flex-col gap-[10px]">
                <Button
                  disabled={isGiftClaimed}
                  variant={'secondary'}
                  size="lg"
                  onClick={onClaimGift}
                  isRounded
                  isFullWidth
                >
                  {c('claimGift')}
                </Button>
                {isGiftClaimed && (
                  <div className="text-center text-textSecondary">
                    <Text as={'p'} size="sm" weight="medium">
                      {c('specialGiftClaimedDescription')}
                    </Text>
                  </div>
                )}
              </div>
            )}

            <Button
              isLoading={isSharingImage}
              variant={'tertiary'}
              size="lg"
              onClick={onShareImage}
              icon={<Icon.Share01 />}
              iconPosition="left"
              isRounded
              isFullWidth
            >
              {c('shareImage')}
            </Button>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 left-0 right-0 flex justify-center bg-background pt-4 pb-8 px-4 shadow-[0_-2px_8px_rgba(0,0,0,0.1)]">
        <GhostButton size="lg" onClick={onGoBack}>
          {c('specialGiftGoBackButtonText')}
        </GhostButton>
      </div>
    </div>
  )
}
