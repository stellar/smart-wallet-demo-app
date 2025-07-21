import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary'

import styles from './styles.module.css'

export type ErrorBoundaryFallback = ({
  error,
  componentStack,
  eventId,
  resetError,
  message,
}: {
  error: Error
  componentStack: string | null
  eventId: string | null
  resetError(): void
  message?: string
}) => JSX.Element

export interface IErrorBoundaryProps {
  fallback?: ErrorBoundaryFallback
  displayMessage?: string
  children?: React.ReactNode
}

const DefaultFallbackComponent: ErrorBoundaryFallback = ({ error, componentStack, eventId, resetError, message }) => (
  <main data-testid="default-fallback">
    <div className={styles.error}>
      <p>{message}</p>
      <div>{eventId}</div>
      <div>{error.toString()}</div>
      <div>{componentStack}</div>
      <button onClick={resetError}>Click here to reset!</button>
    </div>
  </main>
)

const ErrorBoundary = ({
  fallback = DefaultFallbackComponent,
  displayMessage,
  children,
}: IErrorBoundaryProps): JSX.Element => {
  return (
    <ReactErrorBoundary
      fallbackRender={(props: FallbackProps) =>
        fallback({
          error: props.error,
          componentStack: null,
          eventId: null,
          resetError: props.resetErrorBoundary,
          message: displayMessage ?? props.error.message,
        })
      }
    >
      {children}
    </ReactErrorBoundary>
  )
}

export default ErrorBoundary
