import fs from 'fs'

export const tryReadFile = (filePath: string) => {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch {
    return undefined
  }
}
