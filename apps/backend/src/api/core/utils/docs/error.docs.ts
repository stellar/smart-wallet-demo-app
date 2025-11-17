import { HttpStatusCodes } from 'api/core/utils/http/status-code'

const defaultErrorDocStructure = (error: string) => ({
  description: `Error: ${error}`,
  content: {
    'application/json': {
      schema: {
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
})

export const unprocessableEntity = {
  [HttpStatusCodes.UNPROCESSABLE_ENTITY]: defaultErrorDocStructure('Unprocessable Entity'),
}

export const notFound = {
  [HttpStatusCodes.NOT_FOUND]: defaultErrorDocStructure('Not Found'),
}

export const forbidden = {
  [HttpStatusCodes.FORBIDDEN]: defaultErrorDocStructure('Forbidden'),
}

export const badRequest = {
  [HttpStatusCodes.BAD_REQUEST]: defaultErrorDocStructure('Bad Request'),
}

export const conflict = {
  [HttpStatusCodes.CONFLICT]: defaultErrorDocStructure('Conflict'),
}

export const unauthorized = {
  [HttpStatusCodes.UNAUTHORIZED]: defaultErrorDocStructure('Unauthorized'),
}
