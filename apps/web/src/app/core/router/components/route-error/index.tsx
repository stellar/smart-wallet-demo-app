import { Button, Icon, Text } from '@stellar/design-system'
import { useNavigate } from '@tanstack/react-router'

import { c } from 'src/interfaces/cms/useContent'

export const RouteError = () => {
  const navigate = useNavigate()

  const goHome = () => {
    navigate({ to: '/' })
  }

  return (
    <div className="flex justify-center items-center h-full">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center gap-6">
          <div className="text-danger">
            <Icon.XCircle width={'5vh'} height={'5vh'} />
          </div>

          <Text as="h1" size="lg" weight="medium" addlClassName="text-center">
            {c('routeErrorTitle')}
          </Text>

          <Text as="p" size="sm" addlClassName="text-center text-textSecondary">
            {c('routeErrorDescription')}
          </Text>

          <Button
            onClick={goHome}
            variant={'secondary'}
            size={'lg'}
          >
            {c('goHome')}
          </Button>
        </div>
      </div>
    </div>
  )
}
