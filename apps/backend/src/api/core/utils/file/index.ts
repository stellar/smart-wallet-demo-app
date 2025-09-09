import fs from 'fs'

import { logger } from 'config/logger'

export const tryReadFile = (filePath: string) => {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch {
    logger.error(`Failed to read file: ${filePath}`)
    return undefined
  }
}
