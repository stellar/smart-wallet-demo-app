import * as RadixSlider from '@radix-ui/react-slider'

import { THEME_STYLES } from 'src/config/theme/theme'
import { cn } from 'src/helpers/style'

export type ThemeColor = keyof typeof THEME_STYLES.theme.extend.colors
export interface ISliderProps extends RadixSlider.SliderProps {
  trackColor?: ThemeColor
  rangeColor?: ThemeColor
  thumbColor?: ThemeColor
}

const SLIDER_COLOR_STYLE: Record<ThemeColor, string> = {
  text: 'bg-text',
  textSecondary: 'bg-text-secondary',
  textTertiary: 'bg-text-tertiary',
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  tertiary: 'bg-tertiary',
  accent: 'bg-accent',
  accentBlack: 'bg-accent-black',
  accentWhite: 'bg-accent-white',
  accentMuted: 'bg-accent-muted',
  foreground: 'bg-foreground',
  background: 'bg-background',
  backgroundPrimary: 'bg-background-primary',
  backgroundSecondary: 'bg-background-secondary',
  backgroundTertiary: 'bg-background-tertiary',
  borderPrimary: 'bg-border-primary',
  borderSecondary: 'bg-border-secondary',
  whitish: 'bg-whitish',
  blackish: 'bg-blackish',
  muted: 'bg-muted',
  success: 'bg-success',
  danger: 'bg-danger',
  brandPrimary: 'bg-brand-primary',
}

export const Slider = ({
  step = 1,
  min = 0,
  max = 100,
  disabled = false,
  trackColor = 'primary',
  rangeColor = 'secondary',
  thumbColor = 'blackish',
  ...args
}: ISliderProps) => {
  return (
    <RadixSlider.Root
      aria-label="slider-root"
      data-testid="slider"
      step={step}
      min={min}
      max={max}
      disabled={disabled}
      className="flex relative items-center select-none touch-none h-5"
      {...args}
    >
      <RadixSlider.Track
        aria-label="slider-track"
        className={cn('relative flex-grow rounded-full h-1', SLIDER_COLOR_STYLE[trackColor])}
      >
        <RadixSlider.Range className={cn('absolute rounded-full h-full', SLIDER_COLOR_STYLE[rangeColor])} />
      </RadixSlider.Track>
      <RadixSlider.Thumb
        aria-label="slider-thumb"
        className={cn('block w-8 h-8 rounded-[50%] focus:outline-none', SLIDER_COLOR_STYLE[thumbColor])}
      />
    </RadixSlider.Root>
  )
}
