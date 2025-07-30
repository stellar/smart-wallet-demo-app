import { Icon, Text } from '@stellar/design-system'

import { c } from 'src/interfaces/cms/useContent'

export const EmailSent = () => {
  return (
    <div className="flex gap-1">
      <div className="text-success mt-1">
        <Icon.CheckCircle width={16} height={16} />
      </div>
      <Text addlClassName={'text-whitish'} size={'sm'} as="span">
        {c('resetLinkSent')}
      </Text>
    </div>
  )
}
