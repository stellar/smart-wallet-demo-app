import * as React from 'react'

import { AppIcon, AppIconNames, Avatar, Button, Typography } from 'src/components/atoms'

type Props = {
  isAuthenticated: () => boolean
  loggedInLabel?: string
  userName?: string
  onSignOut?: () => Promise<void>
  children: React.ReactNode
  links?: React.ReactNode
}

export function Header({ isAuthenticated, loggedInLabel, userName, onSignOut, links, children }: Props) {
  const authStatus = () => {
    if (!isAuthenticated()) {
      return <Typography>You are not logged in</Typography>
    }

    if (!(userName || loggedInLabel || onSignOut)) {
      return <Typography>Welcome</Typography>
    }

    return (
      <div className="flex flex-row gap-2 items-center">
        {userName && <Avatar name={userName} />}
        {loggedInLabel && <Typography>{loggedInLabel}</Typography>}
        {onSignOut && (
          <Button
            icon={<AppIcon name={AppIconNames.logOut} />}
            iconPosition={'right'}
            onClick={onSignOut}
            label="Sign out"
          />
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="bg-primary py-4 px-2 flex flex-row justify-between">
        {links}

        {authStatus()}
      </div>

      {children}
    </div>
  )
}
