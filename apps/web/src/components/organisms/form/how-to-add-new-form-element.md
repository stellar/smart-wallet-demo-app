# How to add a new Form Element

To connect new inputs to the form, you need to follow some steps

## 1: Create abstraction/wrapper in atoms/molecules for the new input

By following `src/components/atoms/input-checkbox` or `src/components/atoms/select` as examples, you need to create a component wrapping the logic for the input.

You also need to follow an expected format of props.

So, you need to use the `IFormControlCommonProps` interface from `src/components/types/input.ts` as a helper for typing the component props and follow the expected format from the Form.

The `IFormControlCommonProps` interface "accepts" some types as generics. They are the following:

- `TIsControlled extends boolean = false`: It says if the component is controlled or not. If it's controlled, the `ref` prop is omitted.
- `TElement extends HTMLElement = HTMLInputElement`: It says which HTML Element the component is based on. It is used for the `TChangeEvent` and `TBlurEvent` args.
- `TValue = string`: The type of the `value` prop
- `TChangeEvent = React.ChangeEvent<TElement>`: The type of the argument of `onChange` prop. Helpful mainly for controlled components, where you can pass `string` or `number`, or anything you want.
- `TBlurEvent = React.FocusEvent<TElement>`: The type of the argument of `onBlur` prop.
- `TExtendsProps = object`: It says which props we should extend. It's optional. Also, by default, we already omit the `name` attribute of this props.

For convenience, there is an `IInputProps` in the same file, helpful for components using the native inputs elements.

## 2: Connect the component in the form

To connect the component in the form, you need:

1. Add the component and its type to the right interface in `types.ts` file
   You need to either add it to `IControlledFormElements` or to `IUncontrolledFormElements`.
2. Add the component to the `connected-form-elements.ts` file, in its correspondent array:
   - if it's a controlled component, add it to `CONTROLLED_FORM_ELEMENTS`
   - else, add it to `UNCONTROLLED_FORM_ELEMENTS`
3. Update tests accordingly
4. Update storybook accordingly

## Some DOs and DONTs

- If necessary, you can change the form component to accomplish the project necessities
- Remember that controlled components are components where we explicitly control the component state (with `onChange` and `value` props), and uncontrolled ones are up to the native behavior, being controlled by events and refs.
- Try to keep semantics natural: if you are creating a Slider component for example, it probably should follow the props of a numeric input.
