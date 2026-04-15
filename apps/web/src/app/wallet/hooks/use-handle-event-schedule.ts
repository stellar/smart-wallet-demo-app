import { Icon } from '@stellar/design-system'
import { useMemo } from 'react'

import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'

import { BannerOptions } from '../pages/home/template'
import { useEventScheduleStore } from '../store'

type HandleEventScheduleProps = {
  enabled: boolean
}

type HandleEventScheduleReturn = {
  banner: BannerOptions | undefined
}

export const useHandleEventSchedule = ({ enabled }: HandleEventScheduleProps): HandleEventScheduleReturn => {
  const { isClosed: isEventScheduleClosed, setIsClosed: setIsEventScheduleClosed } = useEventScheduleStore()

  const banner: BannerOptions = useMemo(
    () => ({
      backgroundImageUri: a('eventScheduleBannerBackground'),
      label: {
        title: c('eventScheduleBannerTitle'),
        description: c('eventScheduleBannerDescription'),
        variant: 'secondary',
      },
      button: {
        title: c('eventScheduleBannerButtonTitle'),
        icon: Icon.ArrowUpRight({ className: 'text-whitish' }),
        onClick: () => {
          const url = c('eventScheduleUrl')
          if (url) {
            window.open(url, '_blank', 'noopener,noreferrer')
          }
        },
      },
      onClose: () => setIsEventScheduleClosed(true),
    }),
    [setIsEventScheduleClosed]
  )

  return {
    banner: enabled && !isEventScheduleClosed ? banner : undefined,
  }
}
