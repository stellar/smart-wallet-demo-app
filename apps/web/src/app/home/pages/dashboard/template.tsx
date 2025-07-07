import { Heading, Text } from '@stellar/design-system'

type Props = {
  onToast: () => void
}

export const DashboardTemplate = ({ onToast }: Props) => {
  return (
    <div className="text-text bg-primary h-screen flex flex-col gap-4 items-center justify-center">
      <Heading as={'h1'} size={'sm'} weight="bold">
        Dashboard screen
      </Heading>
      <Text as={'p'} size={'sm'}>
        This is a private route
      </Text>
      <button onClick={onToast}>show toast</button>
    </div>
  )
}
