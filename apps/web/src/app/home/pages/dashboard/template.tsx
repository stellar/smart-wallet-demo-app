import { Typography, TypographyVariant, TypographyWeight } from 'src/components/atoms'

type Props = {
  onToast: () => void
}

export const DashboardTemplate = ({ onToast }: Props) => {
  return (
    <div className="text-text bg-primary h-screen flex flex-col gap-4 items-center justify-center">
      <Typography variant={TypographyVariant.h1} weight={TypographyWeight.bold}>
        Dashboard screen
      </Typography>
      <Typography>This is a private route</Typography>
      <button onClick={onToast}>show toast</button>
    </div>
  )
}
