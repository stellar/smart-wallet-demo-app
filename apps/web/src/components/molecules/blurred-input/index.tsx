import { Input, InputProps } from '@stellar/design-system'

interface Props extends InputProps, React.InputHTMLAttributes<HTMLInputElement> {
  id: string
}

export const BlurredInput = (props: Props) => {
  return (
    <div className={'blurred-input-container'}>
      <Input {...props} />
    </div>
  )
}
