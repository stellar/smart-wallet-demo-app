import DateAdapter from 'src/app/core/adapters/date/DateAdapter'
import logger from 'src/app/core/services/logger'
import { DialogTypes, dialogService } from 'src/components/molecules/dialog'

import { HomeTemplate } from './template'

const Home = () => {
  const onOpenDialog = () => {
    dialogService.openDialog({
      key: 'dialog-1',
      type: DialogTypes.default,
      dialogOptions: {
        title: 'Dialog Title',
        content: 'Dialog Content',
        actions: [
          {
            content: 'Action 1',
            onClick: () => {
              dialogService.closeDialog()
              logger.log('Action 1')
            },
          },
          {
            content: 'Action 2',
            onClick: () => {
              dialogService.closeDialog()
              logger.log('Action 2')
            },
          },
        ],
      },
    })
  }

  return <HomeTemplate onOpenDialog={onOpenDialog} formattedDate={DateAdapter.formatToDayMonthYear(new Date())} />
}

export default Home
