import { HttpResponse, http } from 'msw'

const BASE_HOST_URL = '*'

const handlers = [
  // The code below is an example about how you can use MSW to mock your requests
  http.get(`${BASE_HOST_URL}/ping`, () => {
    return HttpResponse.text('pong', { status: 200 })
  }),
]

export { handlers }
