import { Button, Typography, TypographyVariant, TypographyWeight } from 'src/components/atoms'

import { Select } from '../../../../components/atoms/select'

type Props = {
  onOpenDialog: () => void
  formattedDate: string
}

export const HomeTemplate = ({ onOpenDialog, formattedDate }: Props) => {
  return (
    <div className="text-text bg-background h-screen flex flex-col gap-4 items-center justify-center">
      <Typography variant={TypographyVariant.h1} weight={TypographyWeight.bold}>
        Home screen
      </Typography>
      <Typography>This is not a private route</Typography>

      <Typography>Today is: {formattedDate}</Typography>

      <Button label="Open Dialog" onClick={onOpenDialog} />

      <Select
        name="aaa"
        options={[
          { textValue: 'Carrot', value: 'Carrot' },
          { textValue: 'Potato', value: 'Potato' },
          { textValue: 'Onion', value: 'Onion' },
          { textValue: 'Tomato', value: 'Tomato' },
        ]}
      />
    </div>
  )
}
