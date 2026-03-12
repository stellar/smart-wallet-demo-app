import clsx from 'clsx'

import { a } from 'src/interfaces/cms/useAssets'
import { useLayout } from 'src/interfaces/layout'

type Props = {
  backgroundPosition?: 'center' | 'top' | 'bottom'
  isAnimated?: boolean
  className?: string
}

export const OnboardingBackgroundImage = ({ className, isAnimated = false, backgroundPosition }: Props) => {
  const layout = useLayout()
  const backgroundImage = layout === 'desktop' ? a('onboardingDesktopBackground') : a('onboardingBackground')

  return (
    <div
      className={clsx(
        'fixed',
        'inset-0',
        'bg-cover',
        'z-[-1]',
        backgroundPosition && `bg-${backgroundPosition}`,
        isAnimated && 'animate-background-move',
        className
      )}
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    />
  )
}
