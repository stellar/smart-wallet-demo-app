export type SignInParams = {
  email: string
  password: string
}

// import { http } from "interfaces/http"

// type SignInResponse = {
//   token: string
//   user: {
//     name: string
//     email: string
//   }
// }

class AuthService {
  static instance: AuthService

  async signIn({ email }: SignInParams) {
    // TODO: Implement the actual authentication logic
    // const result = await http.post<SignInResponse>('/auth/signin', params)
    // do some serialization if necessary
    // return result.data
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { token: 'some-token', user: { name: 'John Doe', email } }
  }

  async signOut() {
    // TODO: Implement the actual signout logic
    // const result = await http.post('/auth/signout')
    // do some serialization if necessary
    // return result.data
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

const authService = new AuthService()

export default authService
