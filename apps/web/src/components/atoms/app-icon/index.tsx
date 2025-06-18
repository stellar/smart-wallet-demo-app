import * as LucideIcons from 'react-icons/lu'

import { cn } from 'src/helpers/style'

export enum AppIconNames {
  chevronDown = 'chevron-down',
  chevronLeft = 'chevron-left',
  chevronRight = 'chevron-right',
  chevronUp = 'chevron-up',
  arrowUp = 'arrow-up',
  arrowDown = 'arrow-down',
  arrowLeft = 'arrow-left',
  arrowRight = 'arrow-right',
  logOut = 'log-out',
}

const IconMap = {
  [AppIconNames.chevronDown]: LucideIcons.LuChevronDown,
  [AppIconNames.chevronLeft]: LucideIcons.LuChevronLeft,
  [AppIconNames.chevronRight]: LucideIcons.LuChevronRight,
  [AppIconNames.chevronUp]: LucideIcons.LuChevronUp,
  [AppIconNames.arrowUp]: LucideIcons.LuArrowUp,
  [AppIconNames.arrowDown]: LucideIcons.LuArrowDown,
  [AppIconNames.arrowLeft]: LucideIcons.LuArrowLeft,
  [AppIconNames.arrowRight]: LucideIcons.LuArrowRight,
  [AppIconNames.logOut]: LucideIcons.LuLogOut,
}

export type AppIconProps = {
  name: AppIconNames
  disabled?: boolean
  alt?: string
} & React.ComponentProps<typeof LucideIcons.LuChevronDown>

export const AppIcon = ({ name, className, disabled = false, alt, ...props }: AppIconProps) => {
  const Icon = IconMap[name]
  return <Icon aria-label={alt} className={cn('text-slate-800', disabled && 'text-slate-500', className)} {...props} />
}
