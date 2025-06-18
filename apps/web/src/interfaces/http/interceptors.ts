import { http } from '.'

http.interceptors.request.use(config => {
  // Get the token from some here
  const token = null
  if (token) {
    config.headers.common.Authorization = `${token}`
  }
  return Promise.resolve(config)
})
