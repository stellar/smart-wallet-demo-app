import { a } from 'src/interfaces/cms/useAssets'

type Props = {
  className?: string
}

export const OnboardingBackgroundImage = ({ className }: Props) => {
  return (
    <div
      className={`fixed inset-0 bg-cover z-[-1] ${className}`}
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(10, 10, 10, 0.5) 100%), url(${a('onboardingBackground')}`,
      }}
    />
  )
}
