export const docs = `

The dialog component is a wrapper around the radix-ui/react-dialog, with some additional features.

### Dialog component

The Dialog component accepts some properties (described below). You can use the component directly
or with the service (described in the next section).

If you are using the component directly, you should:

- use the \`triggerElement\` property to define the element that will trigger the dialog. By default
then, any action passed via props when clicked will immediately close the dialog and trigger the action.

or

- use the \`isOpen\` property to control the visibility of the dialog. Then, you can use the \`onClose\`
property to define a callback that will be called when the dialog is closed (e.g. when the user clicks
on the close button, or outside the modal).

You can check the other props in the props docs below.

### Dialog service

The dialog service is a simple wrapper around the dialog component, and you can use
the following methods:

- \`openDialog\`: Opens a new dialog with the given props.
  It always opens the new dialog removing all other dialogs present in the stack.
  If you want to keep them, use the \`pushDialog\` method.

- \`pushDialog\`: Opens a new dialog with the given props and pushes it to the stack.
  It won't remove any other dialog present in the stack.

- \`updateDialogOptions\`: Updates the props of the dialog with the given key.
  It merges the given props with the existing props of the dialog.
  If the key is not found, it won't throw any error.

- \`closeDialog\`: Closes the last dialog in the stack.
  If there are multiple dialogs opened, it will only close the last one.
  If you want to close all dialogs, use the \`closeAllDialogs\` method.

- \`closeAllDialogs\`: Closes all dialogs present in the stack.
  It removes all the dialogs in the stack, no matter how many there are.

- \`removeDialog\`: Removes the dialog with the given key from the stack.
  If the key is not found, it won't throw any error.

The dialog service is a singleton, so you can import it wherever you want and use it.

#### Dialog options

The dialog options you can pass to the service methods are the props that you can pass
to the dialog components, except for the ones that controls the visibility (i.e.
\`isOpen\` and \`triggerElement\`).

The dialog options are:

- \`key\`: The key of the dialog, it's used to identify the dialog
- \`type\`: The type of the dialog, it's an Enum from \`DialogTypes\`
- \`dialogOptions\`: The props that will be passed to the dialog component
`
