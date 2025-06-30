import * as React from 'react'

import styles from './styles.module.css'

const Loading = () => {
  return (
    <span className={styles.loadingContainer} data-testid="loading-component">
      <span className={styles.loadingSpinner}></span>
    </span>
  )
}

const withLoading = (
  /**
   * The element (invoked component) to be rendered when loading is done
   */
  WrappedComponent: React.JSX.Element
) => {
  const WithLoadingComponent = (
    /**
     * Boolean that controls whether the component is loading or not
     */
    loading: boolean
  ) => (loading ? <Loading /> : WrappedComponent)

  WithLoadingComponent.displayName = 'WithLoadingComponent'
  return WithLoadingComponent
}

export { Loading, withLoading }
