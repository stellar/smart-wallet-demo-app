import { UseCaseBase } from 'src/app/core/framework/use-case/base'
import logger from 'src/app/core/services/logger'
import BaseError from 'src/helpers/error-handling/base-error'
import { c } from 'src/interfaces/cms/useContent'

import { ShareImageInput } from './types'

export class ShareImageUseCase extends UseCaseBase<void> {
  async handle(input: ShareImageInput): Promise<void> {
    const { imageUri } = input

    const filename = this.getFilenameFromUrl(imageUri)

    const response = await fetch(imageUri)
    const blob = await response.blob()

    const file = new File([blob], `${filename}.jpg`, { type: blob.type })

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: c('shareImageTitle'),
          text: c('shareImageText'),
          files: [file],
        })
      } catch (error) {
        logger.error(`${this.constructor.name}.handle | Failed`, error)
        throw new BaseError(c('shareImageError'))
      }
    } else {
      throw new BaseError(c('shareImageNotSupportedDevice'))
    }
  }

  private getFilenameFromUrl(uri: string): string {
    const parts = uri.split('/')
    const filenameWithExt = parts.pop() || ''
    const [filename] = filenameWithExt.split('.')
    return filename
  }
}

const shareImageUseCase = new ShareImageUseCase()

export { shareImageUseCase }
