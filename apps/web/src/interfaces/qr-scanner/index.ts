import { Html5Qrcode } from 'html5-qrcode'
import { Html5QrcodeError, Html5QrcodeResult } from 'html5-qrcode/esm/core'

import logger from 'src/app/core/services/logger'
import { ErrorHandling } from 'src/helpers/error-handling'
import BaseError from 'src/helpers/error-handling/base-error'

const notTrackableErrors = ['NotFoundException', 'No barcode or QR code detected', 'already under transition']

class QrScanner {
  private scanner: Html5Qrcode | null = null
  private elementId: string = 'qr-scanner'

  async start(
    onScan: (decodedText: string, result: Html5QrcodeResult) => void,
    onError?: (errorMessage: string, error: Html5QrcodeError) => void
  ): Promise<void> {
    if (!this.scanner) {
      this.scanner = new Html5Qrcode(this.elementId)
    }

    if (this.scanner?.isScanning) return

    try {
      await this.scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: window.innerWidth, height: window.innerHeight } },
        onScan,
        (errorMessage, error) => {
          if (notTrackableErrors.some(value => errorMessage.includes(value))) return

          logger.error(`${this.constructor.name} | ${errorMessage}`, error)
          ErrorHandling.handleError({ error: new BaseError(errorMessage) })
          onError?.(errorMessage, error)
        }
      )
    } catch (error) {
      if (typeof error === 'string' && notTrackableErrors.some(value => error.includes(value))) return

      logger.error(`${this.constructor.name}.start | Failed`, error)
      ErrorHandling.handleError({ error: new BaseError('Failed to start scanner') })
    }
  }

  async stop(): Promise<void> {
    if (this.scanner && this.scanner.isScanning) {
      try {
        await this.scanner.stop()
        this.scanner.clear()
      } catch (error) {
        logger.error(`${this.constructor.name}.stop | Failed`, error)
        ErrorHandling.handleError({ error: new BaseError('Failed to stop scanner') })
      }
    }
  }

  isScannerRunning(): boolean {
    return this.scanner?.isScanning ?? false
  }

  getElementId(): string {
    return this.elementId
  }
}

const qrScanner = new QrScanner()

export { qrScanner }
