import * as React from 'react'

import { THEME_COLORS } from 'src/constants/theme/colors'

import styles from './styles.module.css'

type LoadingProps = {
  size?: 'sm' | 'md' | 'lg'
  color?: keyof typeof THEME_COLORS
}
const Loading = ({ size = 'md', color = 'whitish' }: LoadingProps) => {
  // Define sizes
  const sizes = {
    sm: {
      '--bar-width': '3px',
      '--bar-height': '6px',
      '--center-radius': '6px',
      '--duration': '2.5s',
    },
    md: {
      '--bar-width': '4px',
      '--bar-height': '10px',
      '--center-radius': '10px',
      '--duration': '2.5s',
    },
    lg: {
      '--bar-width': '5px',
      '--bar-height': '14px',
      '--center-radius': '14px',
      '--duration': '2.5s',
    },
  }

  const spinnerStyle: React.CSSProperties = {
    ...sizes[size],
    '--spinner-size': `calc(2 * (${sizes[size]['--center-radius']} + ${sizes[size]['--bar-height']}))`,
    '--bar-color': THEME_COLORS[color],
  } as unknown as React.CSSProperties

  return (
    <div className={styles.loadingContainer} data-testid="loading-component">
      <div className={styles.spinner} style={spinnerStyle}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={styles.bar}
            style={
              {
                ['--angle']: `${i * 45}deg`,
                ['--delay']: `${-(i * (2.4 / 8))}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
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
