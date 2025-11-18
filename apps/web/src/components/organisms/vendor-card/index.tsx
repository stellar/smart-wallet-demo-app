import { Text } from '@stellar/design-system'

type Props = {
  imageUri: string
  name: string
  description?: string
}

export const VendorCard = ({ imageUri, name, description }: Props): React.ReactNode => {
  return (
    <div>
      <div className="flex flex-col gap-4 p-4 rounded-lg bg-backgroundPrimary border border-borderPrimary">
        <div className="flex">
          <img src={imageUri} className="max-h-[56px] min-h-[56px] rounded-full object-cover" alt={name} />
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-text">
            <Text as="p" size={'md'} weight="medium">
              {name}
            </Text>
          </div>

          <div className="text-textSecondary">
            <Text as="p" size={'sm'}>
              {description}
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}
