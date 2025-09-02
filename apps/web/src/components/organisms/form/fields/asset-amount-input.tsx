import { Text, Heading } from '@stellar/design-system'
import { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Controller, useFormContext, ControllerRenderProps, FieldValues, FormState } from 'react-hook-form'

type Props = {
  name: string
  assetLabel: string
  placeholder?: string
  decimals?: number
  maxDigits?: number
}

const DEFAULT_DECIMALS = 2

const AssetAmountInputField = forwardRef<
  HTMLInputElement,
  {
    name: string
    field: ControllerRenderProps<FieldValues, string>
    formState: FormState<FieldValues>
    assetLabel: string
    placeholder: string
    decimals: number
    maxDigits: number
  }
>(({ name, field, formState, assetLabel, placeholder, decimals, maxDigits }, ref) => {
  const [rawDigits, setRawDigits] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  })

  const filterOnlyDigits = useCallback(
    (value: string | number) => {
      if (!value) return ''
      let onlyDigits = value.toString().replace(/\D/g, '')
      if (onlyDigits.length > maxDigits) {
        onlyDigits = onlyDigits.slice(0, maxDigits)
      }
      return onlyDigits
    },
    [maxDigits]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = filterOnlyDigits(e.target.value)
    setRawDigits(onlyDigits)

    if (!onlyDigits) {
      field.onChange('')
      return
    }

    const scaled = Number(onlyDigits) / Math.pow(10, decimals)
    field.onChange(scaled)
  }

  useEffect(() => {
    // only sync when form value changes externally (not while typing)
    if (!isFocused) {
      if (field.value == null || field.value === '') {
        setRawDigits('')
        return
      }

      const scaled = Number(field.value)
      const digits = Math.round(scaled * Math.pow(10, decimals)).toString()
      setRawDigits(digits)
    }
  }, [field.value, decimals, isFocused])

  useEffect(() => {
    const input = inputRef.current
    if (!input) return

    const handleFocus = () => setIsFocused(true)
    const handleBlur = () => setIsFocused(false)

    input.addEventListener('focus', handleFocus)
    input.addEventListener('blur', handleBlur)

    return () => {
      input.removeEventListener('focus', handleFocus)
      input.removeEventListener('blur', handleBlur)
    }
  }, [])

  const formattedValue = field.value && !isNaN(Number(field.value)) ? formatter.format(Number(field.value)) : ''
  const error = formState.errors[name]?.message as string | undefined

  return (
    <div>
      <div className="flex items-baseline justify-center gap-1 cursor-text" onClick={() => inputRef.current?.focus()}>
        {/* Hidden input for real typing */}
        <input
          ref={inputRef}
          value={rawDigits}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          inputMode="numeric"
          type="text"
          readOnly={false}
          className="absolute left-[-9999px] w-0 h-0 border-0 p-0 m-0 outline-none"
          aria-hidden="true"
        />

        {/* Visual display */}
        <span className="relative bg-transparent text-right tracking-tight">
          <Heading addlClassName="text-text" as="h1" size="xs" weight="semi-bold">
            {formattedValue || placeholder}
          </Heading>

          {isFocused && (
            <span className="absolute -right-[0.5px] top-1/2 -translate-y-1/2 h-[1.5em] w-[1px] bg-current animate-blink" />
          )}
        </span>

        {/* Asset label */}
        <Text addlClassName="text-textSecondary" size="md" weight="medium" as="span">
          {assetLabel}
        </Text>
      </div>

      {error && (
        <div className="text-left text-error mt-1">
          <Text as="p" size="sm">
            {error}
          </Text>
        </div>
      )}
    </div>
  )
})

export const AssetAmountInput = ({
  name,
  assetLabel,
  placeholder = '0.00',
  decimals = DEFAULT_DECIMALS,
  maxDigits = 18,
}: Props) => {
  const { control, formState } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <AssetAmountInputField
          ref={field.ref}
          name={name}
          field={field}
          formState={formState}
          assetLabel={assetLabel}
          placeholder={placeholder}
          decimals={decimals}
          maxDigits={maxDigits}
        />
      )}
    />
  )
}
