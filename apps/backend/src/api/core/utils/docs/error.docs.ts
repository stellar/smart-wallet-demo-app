import { HttpStatusCodes } from 'api/core/utils/http/status-code'

const defaultErrorDocStructure = {
  type: 'object',
  content: {
    'application/json': {
      schema: {
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
}

export const unprocessableEntity = {
  [HttpStatusCodes.UNPROCESSABLE_ENTITY]: defaultErrorDocStructure,
}

export const notFound = {
  [HttpStatusCodes.NOT_FOUND]: defaultErrorDocStructure,
}

export const forbidden = {
  [HttpStatusCodes.FORBIDDEN]: defaultErrorDocStructure,
}

export const badRequest = {
  [HttpStatusCodes.BAD_REQUEST]: defaultErrorDocStructure,
}

export const conflict = {
  [HttpStatusCodes.CONFLICT]: defaultErrorDocStructure,
}

export const unauthorized = {
  [HttpStatusCodes.UNAUTHORIZED]: defaultErrorDocStructure,
}
