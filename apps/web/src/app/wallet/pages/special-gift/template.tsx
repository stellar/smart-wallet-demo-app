import { Text, Button, Icon } from '@stellar/design-system'
import Skeleton from 'react-loading-skeleton'

import { Typography, TypographyVariant } from 'src/components/atoms'
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
    <div className="flex flex-col min-h-full">
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
            <div className="flex justify-between">
              <Button
                isLoading={isSharingImage}
                variant={'tertiary'}
                size="xl"
                onClick={onGoBack}
                icon={<Icon.Home01 />}
                iconPosition="left"
                isRounded
              />

              {isCheckingGiftEligibility ? (
                <Skeleton height={48} width={126} borderRadius={'1.25rem'} />
              ) : (
                <div className="flex flex-col gap-[10px]">
                  <Button
                    disabled={isGiftClaimed}
                    variant={'secondary'}
                    size="xl"
                    onClick={onClaimGift}
                    isRounded
                    style={{
                      paddingLeft: '25px',
                      paddingRight: '25px',
                    }}
                  >
                    {c('claimGift')}
                  </Button>
                </div>
              )}

              <Button
                isLoading={isSharingImage}
                variant={'tertiary'}
                size="xl"
                onClick={onShareImage}
                icon={<Icon.Share01 />}
                iconPosition="left"
                isRounded
              />
            </div>

            {isGiftClaimed && (
              <div className="text-center text-textSecondary">
                <Text as={'p'} size="sm">
                  {c('specialGiftClaimedDescription')}
                </Text>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
