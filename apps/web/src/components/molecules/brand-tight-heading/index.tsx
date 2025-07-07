import { Typography, TypographyVariant } from 'src/components/atoms'

type Props = {
  lines: string[]
  className?: string
}

export const BrandTightHeading = ({ lines, className }: Props) => {
  return (
    <Typography variant={TypographyVariant.h1Brand} className={className}>
      {lines.map((line, index) => (
        <div key={index} className={index !== lines.length - 1 ? '-mb-3' : ''}>
          {line}
        </div>
      ))}
    </Typography>
  )
}
