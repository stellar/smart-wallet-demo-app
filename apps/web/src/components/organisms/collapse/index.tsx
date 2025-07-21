import { useState, useRef, useEffect, useMemo } from 'react'
import clsx from 'clsx'
import { Icon, Text } from '@stellar/design-system'

type CollapseItemProps = {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export const CollapseItem = ({ title, children, defaultOpen = false }: CollapseItemProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [height, setHeight] = useState('0px')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setHeight(`${contentRef.current.scrollHeight}px`)
    } else {
      setHeight('0px')
    }
  }, [isOpen])

  return (
    <div className="w-full">
      <button
        className="w-full flex items-center justify-between py-3 text-left border-b border-borderPrimary"
        onClick={() => setIsOpen(prev => !prev)}
      >
        <Text as="span" size="sm" weight="medium">
          {title}
        </Text>

        <div className="text-lg text-foreground">
          <Icon.ChevronDown className={clsx('transition-transform duration-300', isOpen && 'rotate-180')} />
        </div>
      </button>

      <div ref={contentRef} className="overflow-hidden transition-all duration-300 ease-in-out" style={{ height }}>
        <div className="pb-4 pt-2 text-textSecondary">{children}</div>
      </div>
    </div>
  )
}
CollapseItem.displayName = 'CollapseItem'

type CollapseProps = {
  title: string
  children: React.ReactElement | React.ReactElement[]
  className?: string
}

export const Collapse = ({ title, children, className }: CollapseProps) => {
  const validChildren = useMemo(() => {
    const childrenList = Array.isArray(children) ? children : [children]

    return childrenList.every(child => {
      const type = child.type
      return typeof type === 'function' || typeof type === 'object'
        ? (type as typeof CollapseItem).displayName === 'CollapseItem'
        : false
    })
  }, [children])

  if (!validChildren) {
    throw new Error('Collapse only accepts children of type <CollapseItem />')
  }

  return (
    <div className={clsx('flex flex-col gap-6', className)}>
      <Text as="span" size="md" weight="semi-bold">
        {title}
      </Text>
      <div>{children}</div>
    </div>
  )
}
