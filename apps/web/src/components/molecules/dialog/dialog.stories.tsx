import { Meta, StoryFn } from '@storybook/react'
import { useEffect, useState } from 'react'

import logger from 'src/app/core/services/logger'

import { docs } from './dialog.docs'
import { LoadingDialog, LoadingDialogProps } from './variants/loading'

import {
  ConfirmationDialog,
  ConfirmationDialogProps,
  Dialog,
  DialogProps,
  DialogProvider,
  DialogTypes,
  dialogService,
} from '.'

export default {
  title: 'Molecules/Dialog',
  component: Dialog,
  argTypes: {
    triggerElement: { control: 'object' },
    isOpen: {
      if: { arg: 'triggerElement', exists: false },
      control: 'boolean',
    },
    onClose: { if: { arg: 'triggerElement', exists: false }, type: 'function' },
  },
  parameters: {
    docs: {
      description: {
        component: docs,
      },
    },
  },
} as Meta

const DefaultTemplate: StoryFn<DialogProps> = args => <Dialog {...args} />

export const Default = DefaultTemplate.bind({})
Default.args = {
  title: 'Dialog Title',
  content: 'Dialog Content',
  triggerElement: <button>Open Dialog</button>,
  actions: [
    {
      content: 'Action 1',
      onClick: () => {
        logger.log('Action 1')
      },
    },
    {
      content: 'Action 2',
      onClick: () => {
        logger.log('Action 2')
      },
    },
  ],
}

const CustomElementsTemplate: StoryFn<DialogProps> = args => <Dialog {...args} />

export const CustomElements = CustomElementsTemplate.bind({})
CustomElements.args = {
  title: <h1 className="text-red-500">Custom Elements dialog</h1>,
  content: (
    <table className="table-auto">
      <tbody>
        <tr>
          <td>Table cell</td>
          <td>Table cell</td>
        </tr>
        <tr>
          <td>Table cell</td>
          <td>Table cell</td>
        </tr>
      </tbody>
    </table>
  ),
  triggerElement: <button>Open Dialog</button>,
  actions: [
    {
      content: 'Action 1',
      onClick: () => {
        logger.log('Action 1')
      },
    },
    {
      content: 'Action 2',
      onClick: () => {
        logger.log('Action 2')
      },
    },
  ],
}

const ConfirmationTemplate: StoryFn<ConfirmationDialogProps> = args => <ConfirmationDialog {...args} />

export const Confirmation = ConfirmationTemplate.bind({})
Confirmation.args = {
  title: 'Dialog Title',
  content: 'Dialog Content',
  triggerElement: <button>Open Dialog</button>,
  confirmAction: {
    content: 'Confirm',
    onClick: () => {
      logger.log('Confirmation action')
    },
  },
  destructiveAction: {
    content: 'Cancel',
    onClick: () => {
      logger.log('Destructive action')
    },
  },
}

const LoadingTemplate: StoryFn<LoadingDialogProps> = () => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setIsOpen(false)
      }, 2000)
    }
  }, [isOpen])

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Dialog (will be closed after 2s)</button>
      <LoadingDialog isOpen={isOpen} />
    </>
  )
}

export const Loading = LoadingTemplate.bind({})

const WithStateTemplate: StoryFn<DialogProps> = args => {
  const [isOpen, setIsOpen] = useState(false)

  const actions = args.actions?.map(action => ({
    ...action,
    onClick: () => {
      action?.onClick?.()
      setIsOpen(false)
    },
  }))

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Dialog</button>
      <Dialog {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} actions={actions} />
    </>
  )
}

export const WithState = WithStateTemplate.bind({})
WithState.args = {
  title: 'Dialog Title',
  content: 'Dialog Content - with state controlling',
  actions: [
    {
      content: 'Action 1',
      onClick: () => {
        logger.log('Action 1')
      },
      disabled: true,
    },
    {
      content: 'Action 2',
      onClick: () => {
        logger.log('Action 2')
      },
    },
  ],
}

const WithStateAndAsyncTemplate: StoryFn<DialogProps> = args => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const actions = args.actions?.map((action, index) => ({
    ...action,
    onClick: () => {
      if (index === (args.actions?.length ?? 0) - 1) {
        setIsLoading(true)
        action?.onClick?.()
        setTimeout(() => {
          setIsLoading(false)
          setIsOpen(false)
        }, 1000)
      } else {
        action?.onClick?.()
        setIsOpen(false)
      }
    },
  }))

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Dialog</button>
      <Dialog {...args} isLoading={isLoading} isOpen={isOpen} onClose={() => setIsOpen(false)} actions={actions} />
    </>
  )
}

export const WithStateAndAsync = WithStateAndAsyncTemplate.bind({})
WithStateAndAsync.args = {
  title: 'Dialog Title',
  content: 'Dialog Content - with state controlling and async',
  actions: [
    {
      content: 'Action 1',
      onClick: () => {
        logger.log('Action 1')
      },
      disabled: true,
    },
    {
      content: 'Action 2',
      onClick: () => {
        logger.log('Action 2')
      },
    },
  ],
}

const WithServiceTemplate: StoryFn<unknown> = () => {
  const openDialog = () =>
    dialogService.openDialog({
      type: DialogTypes.default,
      key: 'first-dialog',
      dialogOptions: {
        title: 'Dialog Title',
        content: 'Dialog Content - controlled by service',
        actions: [
          {
            content: 'Cancel',
            onClick: () => {
              dialogService.closeDialog()
              logger.log('Cancelled')
            },
          },
          {
            content: 'Confirm',
            onClick: () => {
              dialogService.closeDialog()
              logger.log('Confirmed')
            },
          },
        ],
      },
    })

  return (
    <DialogProvider>
      <button onClick={openDialog}>Open a Dialog from service</button>
    </DialogProvider>
  )
}

export const WithService = WithServiceTemplate.bind({})

const WithServiceUpdateTemplate: StoryFn<unknown> = () => {
  const onConfirm = async () => {
    dialogService.updateDialogOptions('first-dialog', {
      isLoading: true,
    })
    await new Promise(resolve => setTimeout(resolve, 1000))
    dialogService.updateDialogOptions('first-dialog', {
      isLoading: false,
    })
    dialogService.closeDialog()
  }

  const openDialog = () =>
    dialogService.openDialog({
      type: DialogTypes.default,
      key: 'first-dialog',
      dialogOptions: {
        title: 'Dialog Title',
        content: 'Dialog Content - controlled by service',
        actions: [
          {
            content: 'Cancel',
            onClick: () => {
              dialogService.closeDialog()
              logger.log('Cancelled')
            },
          },
          {
            content: 'Confirm',
            onClick: onConfirm,
          },
        ],
      },
    })

  return (
    <DialogProvider>
      <button onClick={openDialog}>Open a Dialog from service with update</button>
    </DialogProvider>
  )
}

export const WithServiceUpdate = WithServiceUpdateTemplate.bind({})

const WithServiceStackTemplate: StoryFn<unknown> = () => {
  const openSecondDialog = () => {
    dialogService.pushDialog({
      key: 'second-dialog',
      type: DialogTypes.confirmation,
      dialogOptions: {
        title: 'Second dialog Title',
        content: 'Second dialog Content - controlled by service',
        confirmAction: {
          content: 'Confirm',
          onClick: () => {
            dialogService.closeAllDialogs()
            logger.log('Confirmed second dialog')
          },
        },
        destructiveAction: {
          content: 'Cancel',
          onClick: () => {
            dialogService.closeDialog()
            logger.log('Cancelled second dialog')
          },
        },
      },
    })
  }

  const onOpenDialog = () =>
    dialogService.openDialog({
      type: DialogTypes.default,
      key: 'first-dialog',
      dialogOptions: {
        title: 'Dialog Title',
        content: 'Dialog Content - controlled by service',
        actions: [
          {
            content: 'Cancel',
            onClick: () => {
              dialogService.closeDialog()
              logger.log('Cancelled')
            },
          },
          {
            content: 'Confirm',
            onClick: openSecondDialog,
          },
        ],
      },
    })

  return (
    <DialogProvider>
      <button onClick={onOpenDialog}>Open a Dialog from service</button>
    </DialogProvider>
  )
}

export const WithServiceStack = WithServiceStackTemplate.bind({})
