import { createRoute } from '@tanstack/react-router'
import * as yup from 'yup'
import { rootRoute } from 'src/app/core/router/routeTree'
import { Welcome, Invite, InviteResend, Recover, RecoverConfirm, LogIn } from '../pages'
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
  getParentRoute: () => rootRoute,
  path: AuthPagesPath.INVITE_RESEND,
  component: InviteResend,
})

const logInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: AuthPagesPath.LOGIN,
  component: LogIn,
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

export const authRoutes = [welcomeRoute, inviteRoute, inviteResendRoute, logInRoute, recoverRoute, recoverConfirmRoute]
