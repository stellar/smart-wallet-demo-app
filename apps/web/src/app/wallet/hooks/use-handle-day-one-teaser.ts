import { useMemo } from 'react'

import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'

import { BannerOptions } from '../pages/home/template'
import { useDayOneTeaserStore } from '../store'

type HandleDayOneTeaserProps = {
  enabled: boolean
}

type HandleDayOneTeaserReturn = {
  banner: BannerOptions | undefined
}

export const useHandleDayOneTeaser = ({ enabled }: HandleDayOneTeaserProps): HandleDayOneTeaserReturn => {
  const { isClosed: isDayOneTeaserClosed, setIsClosed: setIsDayOneTeaserClosed } = useDayOneTeaserStore()

  const banner: BannerOptions = useMemo(
    () => ({
      backgroundImageUri: a('dayOneTeaserBannerBackground'),
      label: {
        title: c('dayOneTeaserBannerTitle'),
        description: c('dayOneTeaserBannerDescription'),
        variant: 'secondary',
      },
      onClose: () => setIsDayOneTeaserClosed(true),
    }),
    [setIsDayOneTeaserClosed]
  )

  return {
    banner: enabled && !isDayOneTeaserClosed ? banner : undefined,
  }
}
