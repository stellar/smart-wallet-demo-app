import { User } from 'src/app/auth/domain/models/user'

export type CurrentUser = {
  token: string
  data: User
}

export type AuthStoreState = {
  currentUser?: CurrentUser
}

export type AuthStoreActions = {
  setCurrentUser: (currentUser: CurrentUser | null) => void
  isAuthenticated: () => boolean
}

export type AuthStore = AuthStoreState & AuthStoreActions
