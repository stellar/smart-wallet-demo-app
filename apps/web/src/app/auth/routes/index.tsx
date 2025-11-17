import { createRoute, redirect } from '@tanstack/react-router'
import * as yup from 'yup'

import { publicRootRoute } from 'src/app/core/router/routeTree'

import { Welcome, Invite, InviteResend, Recover, RecoverConfirm, LogIn } from '../pages'
import { AuthPagesPath } from './types'
import { getInvitationInfoOptions } from '../queries/use-get-invitation-info'
import { authService } from '../services'
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

export const logInRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: AuthPagesPath.LOGIN,
  component: LogIn,
  validateSearch: search =>
    yup
      .object({
        redirect: yup.string().optional(),
      })
      .validateSync(search),
})

const recoverRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: AuthPagesPath.RECOVER,
  component: Recover,
})

export const recoverConfirmRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: AuthPagesPath.RECOVER_CONFIRM,
  component: RecoverConfirm,
  pendingComponent: AuthRouteLoading,
  validateSearch: search =>
    yup
      .object({
        code: yup.string().required(),
      })
      .validateSync(search),
  loaderDeps: ({ search }) => ({
    code: search.code,
  }),
  loader: async ({ deps }) => {
    const { data } = await authService.validateRecoveryLink({ code: deps.code })

    // Redirect to welcome page if recovery link is not valid
    if (!data.is_valid)
      throw redirect({
        to: AuthPagesPath.WELCOME,
      })
  },
})

export const authRoutes = [welcomeRoute, inviteRoute, inviteResendRoute, logInRoute, recoverRoute, recoverConfirmRoute]
