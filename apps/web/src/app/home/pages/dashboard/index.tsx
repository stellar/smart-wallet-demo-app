import * as React from 'react'

import { ErrorHandling } from 'src/helpers/error-handling'
import BaseError from 'src/helpers/error-handling/base-error'

import { DashboardTemplate } from './template'

const Dashboard = (): React.JSX.Element => {
  const handleTest = () => {
    throw new BaseError('test')
  }

  const handleTestError = () => {
    try {
      handleTest()
    } catch (error) {
      ErrorHandling.handleError({ error })
    }
  }

  return <DashboardTemplate onToast={handleTestError} />
}

export default Dashboard
