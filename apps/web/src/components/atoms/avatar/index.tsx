import * as RadixAvatar from '@radix-ui/react-avatar'
import { useMemo } from 'react'

import { cn } from 'src/helpers/style'

type AvatarCommonProps = {
  className?: string
}

export type AvatarProps = (
  | {
      img: string
    }
  | {
      name: string
    }
  | {
      img: string
      name: string
    }
) &
  AvatarCommonProps

export const Avatar = ({ className, ...props }: AvatarProps) => {
  const fallback = useMemo(() => {
    if ('name' in props) {
      return props.name
        .split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .join('')
    }
    return undefined
  }, [props])

  return (
    <RadixAvatar.Root
      role="presentation"
      className={cn('rounded-full bg-secondary size-10 flex items-center justify-center', className)}
    >
      {'img' in props && <RadixAvatar.Image src={props.img} />}
      {fallback && <RadixAvatar.Fallback>{fallback}</RadixAvatar.Fallback>}
    </RadixAvatar.Root>
  )
}
