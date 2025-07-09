import { InviteResendTemplate } from './template'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { FormValues, schema } from './schema'

export const InviteResend = () => {
  const form = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: 'onSubmit',
  })

  const handleSendLink = () => {
    throw new Error('Function not implemented.')
  }

  return <InviteResendTemplate form={form} onSendLink={handleSendLink} />
}
