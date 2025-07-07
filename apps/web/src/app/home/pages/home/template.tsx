import { Button, Heading, Text } from '@stellar/design-system'

type Props = {
  onOpenDialog: () => void
  formattedDate: string
}

export const HomeTemplate = ({ onOpenDialog, formattedDate }: Props) => {
  return (
    <div className="text-text bg-background h-screen flex flex-col gap-4 items-center justify-center">
      <Heading as={'h1'} size={'xs'}>
        Home screen
      </Heading>

      <Text as={'p'} size={'xs'}>
        Today is: {formattedDate}
      </Text>

      <Button onClick={onOpenDialog} variant={'primary'} size={'lg'}>
        Open Dialog
      </Button>
    </div>
  )
}
