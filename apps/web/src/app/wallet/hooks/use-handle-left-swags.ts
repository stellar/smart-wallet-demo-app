import { useMemo } from 'react'

import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'

import { BannerOptions } from '../pages/home/template'
import { useLeftSwagsStore } from '../store'

type HandleLeftSwagsProps = {
  enabled: boolean
}

type HandleLeftSwagsReturn = {
  banner: BannerOptions | undefined
}

export const useHandleLeftSwags = ({ enabled }: HandleLeftSwagsProps): HandleLeftSwagsReturn => {
  const { isClosed: isLeftSwagsClosed, setIsClosed: setIsLeftSwagsClosed } = useLeftSwagsStore()

  const banner: BannerOptions = useMemo(
    () => ({
      backgroundImageUri: a('leftSwagsBannerBackground'),
      label: {
        title: c('leftSwagsBannerTitle'),
        description: c('leftSwagsBannerDescription'),
        variant: 'secondary',
      },
      onClose: () => setIsLeftSwagsClosed(true),
    }),
    [setIsLeftSwagsClosed]
  )
  return {
    banner: enabled && !isLeftSwagsClosed ? banner : undefined,
  }
}
