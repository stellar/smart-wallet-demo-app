import { Text } from '@stellar/design-system'

import { a } from 'src/interfaces/cms/useAssets'

type Props = {
  title: string
  description: string
}

export const EmptyList = ({ title, description }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center gap-8 pt-6 pb-10">
      <img src={a('emptyList')} alt={title} className="max-w-[75%]" />
      <div className="flex flex-col text-center gap-2">
        <Text as="h3" size="lg" weight="semi-bold">
          {title}
        </Text>
        <div className="text-textSecondary">
          <Text as="p" size="md">
            {description}
          </Text>
        </div>
      </div>
    </div>
  )
}
