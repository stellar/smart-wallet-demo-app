import { createRoute } from '@tanstack/react-router'
import { rootRoute } from 'src/app/core/router/routeTree'
import { Welcome, Invite, InviteResend, Recover, RecoverConfirm } from '../pages'
import { AuthPagesPath } from './types'
import { getInvitationInfoOptions } from '../queries/use-get-invitation-info'

const welcomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: AuthPagesPath.WELCOME,
  component: Welcome,
})

const inviteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: AuthPagesPath.INVITE,
  component: Invite,
  beforeLoad: ({ context: { client: queryClient }, params }) =>
    queryClient.ensureQueryData(getInvitationInfoOptions({ uniqueToken: params.uniqueToken })),
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

export const authRoutes = [welcomeRoute, inviteRoute, inviteResendRoute, recoverRoute, recoverConfirmRoute]
