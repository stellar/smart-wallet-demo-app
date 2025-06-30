import { cn } from 'src/helpers/style'

import { CustomIconNames } from './iconNames'

interface ICustomIconProps {
  /**
   * Icon name
   */
  name: CustomIconNames
  /**
   * A alternative text about the icon to help assistive technology
   */
  alt?: string
  /**
   * The icon size
   */
  size?: string
  /**
   * Icon color
   */
  color?: string
  /**
   * Classname to add custom css
   */
  className?: string
}

const CustomIcon = ({ name, alt, className, color, size }: ICustomIconProps): JSX.Element => {
  return (
    <i
      role="img"
      title={alt}
      aria-label={alt}
      className={cn(`icon-font-${name}`, className)}
      style={{ color, fontSize: size }}
    />
  )
}

export { CustomIcon, CustomIconNames }
export type { ICustomIconProps }
