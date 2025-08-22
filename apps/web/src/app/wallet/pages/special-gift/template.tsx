import { Text, Button, Icon } from '@stellar/design-system'
import Skeleton from 'react-loading-skeleton'

import { Typography, TypographyVariant } from 'src/components/atoms'
import { GhostButton } from 'src/components/molecules'
import { SafeAreaView } from 'src/components/organisms'
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
    <SafeAreaView>
      {/* Centered component */}
      <div className="absolute flex flex-col inset-0 py-8 px-4 items-center justify-center gap-6">
        <div className="flex flex-col bg-background p-4 drop-shadow-lg items-center gap-4">
          <img src={imageUri} alt="Special gift image" />

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

      {/* Bottom component */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center py-8 px-4">
        <GhostButton size="lg" onClick={onGoBack}>
          {c('specialGiftGoBackButtonText')}
        </GhostButton>
      </div>
    </SafeAreaView>
  )
}
