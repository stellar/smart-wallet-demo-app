import { Typography, TypographyVariant } from 'src/components/atoms'

type Props = {
  lines: string[]
  className?: string
  testId?: string
}

export const BrandTightHeading = ({ lines, className, testId }: Props) => {
  return (
    <Typography data-testid={testId} variant={TypographyVariant.h1Brand} className={className}>
      {lines.map((line, index) => (
        <div key={index} className={index !== lines.length - 1 ? '-mb-3' : ''}>
          {line}
        </div>
      ))}
    </Typography>
  )
}
