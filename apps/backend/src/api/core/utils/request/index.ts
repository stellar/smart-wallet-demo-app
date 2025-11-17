import { Request } from 'express'

export const getRawBody = (request: Request, encoding: BufferEncoding = 'utf-8'): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    let data = ''
    request.setEncoding(encoding)
    request.on('data', chunk => {
      data += chunk
    })
    request.on('end', () => resolve(data))
    request.on('error', err => reject(err))
  })
}
