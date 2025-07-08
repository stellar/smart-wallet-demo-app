import { createRoute } from '@tanstack/react-router'
import { rootRoute } from 'src/app/core/router/routeTree'
import { Invite, InviteResend, Recover, RecoverConfirm } from '../pages'
import { AuthPagesPath } from './types'

const inviteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: AuthPagesPath.INVITE,
  component: Invite,
})
const inviteResendRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: AuthPagesPath.INVITE_RESEND,
  component: InviteResend,
})

const recoverRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: AuthPagesPath.RECOVER,
  component: Recover,
})

const recoverConfirmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: AuthPagesPath.RECOVER_CONFIRM,
  component: RecoverConfirm,
})

export const authRoutes = [inviteRoute, inviteResendRoute, recoverRoute, recoverConfirmRoute]
