import { act, render } from 'src/helpers/tests'

import { DialogOptions, DialogProvider, DialogTypes, dialogService } from '.'

describe('dialog service', () => {
  it('opens a new dialog', () => {
    const dialogOptions: DialogOptions = {
      key: 'test',
      type: DialogTypes.default,
      dialogOptions: {
        title: 'Test Dialog',
        content: 'This is a test dialog',
      },
    }
    const view = render(<DialogProvider />)
    act(() => dialogService.openDialog(dialogOptions))
    expect(view.getByText('Test Dialog')).toBeInTheDocument()
    expect(view.getByText('This is a test dialog')).toBeInTheDocument()
  })

  it('opens a new confirmation dialog', () => {
    const dialogOptions: DialogOptions = {
      key: 'test',
      type: DialogTypes.confirmation,
      dialogOptions: {
        title: 'Test Confirmation Dialog',
        content: 'This is a test confirmation dialog',
        confirmAction: {
          content: 'Confirm',
        },
        destructiveAction: {
          content: 'Cancel',
        },
      },
    }
    const view = render(<DialogProvider />)
    act(() => dialogService.openDialog(dialogOptions))
    expect(view.getByText('Test Confirmation Dialog')).toBeInTheDocument()
    expect(view.getByText('This is a test confirmation dialog')).toBeInTheDocument()
    expect(view.getByText('Confirm')).toBeInTheDocument()
    expect(view.getByText('Cancel')).toBeInTheDocument()
  })

  it('opens a new loading dialog', () => {
    const dialogOptions: DialogOptions = {
      key: 'test',
      type: DialogTypes.loading,
      dialogOptions: {},
    }
    const view = render(<DialogProvider />)
    act(() => dialogService.openDialog(dialogOptions))
    expect(view.getByTestId('loading-component')).toBeInTheDocument()
  })

  it('closes the last dialog', () => {
    const dialogOptions: DialogOptions = {
      key: 'test',
      type: DialogTypes.default,
      dialogOptions: {
        title: 'Test Dialog',
        content: 'This is a test dialog',
      },
    }
    const view = render(<DialogProvider />)
    act(() => dialogService.openDialog(dialogOptions))
    act(() => dialogService.closeDialog())
    expect(view.queryByText('Test Dialog')).not.toBeInTheDocument()
    expect(view.queryByText('This is a test dialog')).not.toBeInTheDocument()
  })

  it('closes all dialogs', () => {
    const dialogOptions1: DialogOptions = {
      key: 'test1',
      type: DialogTypes.default,
      dialogOptions: {
        title: 'Test Dialog 1',
        content: 'This is a test dialog 1',
      },
    }
    const dialogOptions2: DialogOptions = {
      key: 'test2',
      type: DialogTypes.default,
      dialogOptions: {
        title: 'Test Dialog 2',
        content: 'This is a test dialog 2',
      },
    }
    const view = render(<DialogProvider />)
    act(() => dialogService.openDialog(dialogOptions1))
    act(() => dialogService.openDialog(dialogOptions2))
    act(() => dialogService.closeAllDialogs())
    expect(view.queryByText('Test Dialog 1')).not.toBeInTheDocument()
    expect(view.queryByText('This is a test dialog 1')).not.toBeInTheDocument()
    expect(view.queryByText('Test Dialog 2')).not.toBeInTheDocument()
    expect(view.queryByText('This is a test dialog 2')).not.toBeInTheDocument()
  })

  it('updates the props of a dialog', () => {
    const dialogOptions: DialogOptions = {
      key: 'test',
      type: DialogTypes.default,
      dialogOptions: {
        title: 'Test Dialog',
        content: 'This is a test dialog',
      },
    }
    const view = render(<DialogProvider />)
    act(() => dialogService.openDialog(dialogOptions))
    act(() =>
      dialogService.updateDialogOptions('test', {
        title: 'Updated Test Dialog',
        content: 'This is an updated test dialog',
      })
    )
    expect(view.getByText('Updated Test Dialog')).toBeInTheDocument()
    expect(view.getByText('This is an updated test dialog')).toBeInTheDocument()
  })

  it('removes a dialog', () => {
    const dialogOptions: DialogOptions = {
      key: 'test',
      type: DialogTypes.default,
      dialogOptions: {
        title: 'Test Dialog',
        content: 'This is a test dialog',
      },
    }
    const view = render(<DialogProvider />)
    act(() => dialogService.openDialog(dialogOptions))
    act(() => dialogService.removeDialog('test'))
    expect(view.queryByText('Test Dialog')).not.toBeInTheDocument()
    expect(view.queryByText('This is a test dialog')).not.toBeInTheDocument()
  })
})
