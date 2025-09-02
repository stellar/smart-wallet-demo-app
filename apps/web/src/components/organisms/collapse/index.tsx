import { Icon, Text } from '@stellar/design-system'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

type CollapseItemProps = {
  title: {
    text: string
    size?: React.ComponentProps<typeof Text>['size']
    weight?: React.ComponentProps<typeof Text>['weight']
  }
  description?: { text: string }
  children: React.ReactNode
  defaultOpen?: boolean
}

export const CollapseItem = ({ title, description, children, defaultOpen = false }: CollapseItemProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        className="w-full flex flex-col gap-3 py-3 text-left cursor-pointer"
        onClick={() => setIsOpen(prev => !prev)}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setIsOpen(prev => !prev)}
      >
        <div className="w-full flex items-center justify-between">
          <Text as="span" size={title.size || 'sm'} weight={title.weight || 'medium'}>
            {title.text}
          </Text>

          <div className="text-lg text-foreground">
            <Icon.ChevronDown className={clsx('transition-transform duration-300', isOpen && 'rotate-180')} />
          </div>
        </div>

        {description && !isOpen && (
          <div className="text-textSecondary">
            <Text as="p" size="sm">
              {description?.text}
            </Text>
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-4 pt-2 text-textSecondary">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
CollapseItem.displayName = 'CollapseItem'

type CollapseProps = {
  title?: string
  children: React.ReactElement | React.ReactElement[]
  className?: string
}

export const Collapse = ({ title, children, className }: CollapseProps) => {
  const childrenList = Array.isArray(children) ? children : [children]

  const validChildren = childrenList.every(child => {
    const type = child.type
    return typeof type === 'function' || typeof type === 'object'
      ? (type as typeof CollapseItem).displayName === 'CollapseItem'
      : false
  })

  if (!validChildren) {
    throw new Error('Collapse only accepts children of type <CollapseItem />')
  }

  return (
    <div className={clsx('flex flex-col gap-6', className)}>
      {title && (
        <Text as="span" size="md" weight="semi-bold">
          {title}
        </Text>
      )}
      <div>
        {childrenList.map((child, index) => (
          <div key={index}>
            {child}
            {index < childrenList.length - 1 && <hr className="border-borderPrimary my-2" />}
          </div>
        ))}
      </div>
    </div>
  )
}
