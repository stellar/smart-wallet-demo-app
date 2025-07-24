import { createRoute } from '@tanstack/react-router'
import * as yup from 'yup'

import { publicRootRoute } from 'src/app/core/router/routeTree'

import { Welcome, Invite, InviteResend, Recover, RecoverConfirm, LogIn } from '../pages'
import { AuthPagesPath } from './types'
import { getInvitationInfoOptions } from '../queries/use-get-invitation-info'
import { AuthRouteLoading } from './components/auth-route-loading'

const welcomeRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: AuthPagesPath.WELCOME,
  component: Welcome,
})

export const inviteRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: AuthPagesPath.INVITE,
  component: Invite,
  pendingComponent: AuthRouteLoading,
  validateSearch: search =>
    yup
      .object({
        token: yup.string().required(),
      })
      .validateSync(search),
  loaderDeps: ({ search }) => ({
    token: search.token,
  }),
  loader: ({ context: { client: queryClient }, deps }) =>
    queryClient.ensureQueryData(getInvitationInfoOptions({ uniqueToken: deps.token })),
})

const inviteResendRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: AuthPagesPath.INVITE_RESEND,
  component: InviteResend,
})

const logInRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: AuthPagesPath.LOGIN,
  component: LogIn,
})

const recoverRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: AuthPagesPath.RECOVER,
  component: Recover,
})

const recoverConfirmRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: AuthPagesPath.RECOVER_CONFIRM,
  component: RecoverConfirm,
})

export const authRoutes = [welcomeRoute, inviteRoute, inviteResendRoute, logInRoute, recoverRoute, recoverConfirmRoute]
