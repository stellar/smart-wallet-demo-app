import { Button, Typography, TypographyVariant } from 'src/components/atoms'

import { SigninFormType, useSignInForm } from './form'

type Props = {
  fromPath: string
  onSubmit: (data: SigninFormType) => void
}

export const SigninTemplate = ({ fromPath, onSubmit }: Props) => {
  const { Form, handleSubmit } = useSignInForm()

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center">
      <Typography variant={TypographyVariant.p} className="mb-4">
        You must log in to view the page at {fromPath}
      </Typography>

      <Form id="myform" className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
        <Form.InputText name="email" label="Email" />

        <Form.InputText name="password" label="Password" htmlType="password" />

        <Button label="Login" type="submit" />
      </Form>
    </div>
  )
}
