import * as React from 'react'

import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons'
import * as RadixSelect from '@radix-ui/react-select'
import { cn } from 'src/helpers/style'

import { IFormControlCommonProps } from 'src/components/types/input'

const DUMMY_FORM_ID = 'dummy-form-for-activating-presence-of-hidden-native-select-and-keep-name-attr'

export interface ISelectProps
  extends IFormControlCommonProps<true, HTMLSelectElement, string, string, RadixSelect.SelectProps> {
  /**
   * The options to be rendered in the select
   */
  options: RadixSelect.SelectItemProps[]
  /**
   * The placeholder to be displayed when no option is selected
   */
  placeholder?: string
  /**
   * A custom component for the dropdown icon
   */
  triggerIcon?: JSX.Element
  /**
   * The className for the select. It will be applied to the Trigger component.
   */
  className?: string
  /**
   * The className for the content element
   * The component that pops out when the select is open
   */
  contentClassName?: string
  /**
   * The className for the viewport element
   * The scrolling viewport that contains all of the items
   */
  viewportClassName?: string
  /**
   * The className for the arrow element
   */
  arrowClassName?: string
  /**
   * The className for the scroll up button element
   */
  scrollUpButtonClassName?: string
  /**
   * The className for the scroll down button element
   */
  scrollDownButtonClassName?: string
  /**
   * The className for the item element
   * The component that contains the select items
   */
  itemClassName?: string
}

const Select = React.forwardRef<HTMLButtonElement, ISelectProps>(
  (
    {
      name,
      options,
      placeholder,
      triggerIcon,
      className,
      onChange,
      value,
      contentClassName,
      viewportClassName,
      arrowClassName,
      scrollUpButtonClassName,
      scrollDownButtonClassName,
      itemClassName,
      ...restProps
    },
    ref
  ) => (
    <RadixSelect.Root
      {...restProps}
      form={DUMMY_FORM_ID}
      name={name}
      value={value}
      aria-labelledby={name}
      onValueChange={onChange}
    >
      <RadixSelect.Trigger
        className={cn(
          'inline-flex bg-white h-[35px] p-3 items-center justify-between rounded border-2 border-black w-full',
          className
        )}
        ref={ref}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon className={cn('ml-2', arrowClassName)}>{triggerIcon || <ChevronDownIcon />}</RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          className={cn(
            'overflow-hidden bg-white rounded shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]',
            contentClassName
          )}
        >
          <RadixSelect.ScrollUpButton
            className={cn('flex cursor-default items-center justify-center bg-white p-1', scrollUpButtonClassName)}
          >
            <ChevronUpIcon />
          </RadixSelect.ScrollUpButton>
          <RadixSelect.Viewport className={cn('px-3 py-4', viewportClassName)}>
            {options.map(({ textValue, value, disabled }) => (
              <RadixSelect.SelectItem
                key={value}
                value={value}
                disabled={disabled}
                className={cn(
                  'relative flex h-[25px] hover:bg-primary select-none items-center rounded px-1',
                  itemClassName
                )}
              >
                <RadixSelect.ItemText>{textValue}</RadixSelect.ItemText>
              </RadixSelect.SelectItem>
            ))}
          </RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton
            className={cn('flex cursor-default items-center justify-center bg-white p-1', scrollDownButtonClassName)}
          >
            <ChevronDownIcon />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
)

Select.displayName = 'Select'

export { Select }
