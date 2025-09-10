/* eslint-disable @typescript-eslint/no-explicit-any */
import { Html5Qrcode } from 'html5-qrcode'
import { Html5QrcodeError, Html5QrcodeResult } from 'html5-qrcode/esm/core'

import logger from 'src/app/core/services/logger'
import { ErrorHandling } from 'src/helpers/error-handling'
import BaseError from 'src/helpers/error-handling/base-error'

const notTrackableErrors = [
  'NotFoundException',
  'No barcode or QR code detected',
  'already under transition',
  'No MultiFormat Readers were able to detect the code',
]

/**
 * QR Scanner with pinch-to-zoom functionality
 * Supports two-finger pinch gestures to control camera zoom levels
 */

class QrScanner {
  private scanner: Html5Qrcode | null = null
  private elementId: string = 'qr-scanner'
  private videoTrack: MediaStreamTrack | null = null
  private minZoom: number = 1
  private maxZoom: number = 1
  private currentZoom: number = 1
  private touchStartDistance: number = 0
  private initialZoom: number = 1

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
        {
          fps: 20,
          qrbox: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        },
        onScan,
        (errorMessage: string, error: Html5QrcodeError) => {
          if (notTrackableErrors.some(value => errorMessage.includes(value))) return

          logger.error(`${this.constructor.name} | ${errorMessage}`, error)
          ErrorHandling.handleError({ error: new BaseError(errorMessage) })
          onError?.(errorMessage, error)
        }
      )

      // Get video track from the scanner after it starts
      this.setupZoomCapabilities()
      this.addPinchToZoomListeners()
      this.applyFullHeightStyles()
    } catch (error) {
      if (typeof error === 'string' && notTrackableErrors.some(value => error.includes(value))) return

      logger.error(`${this.constructor.name}.start | Failed`, error)
      ErrorHandling.handleError({ error: new BaseError('Failed to start scanner') })
    }
  }

  private setupZoomCapabilities(): void {
    // Get video track from the scanner's video element
    const videoElement = document.querySelector('#qr-scanner video') as HTMLVideoElement
    if (!videoElement || !videoElement.srcObject) return

    const stream = videoElement.srcObject as MediaStream
    this.videoTrack = stream.getVideoTracks()[0]

    if (!this.videoTrack) return

    const capabilities = this.videoTrack.getCapabilities()
    // Safely access zoom capabilities (not in standard TypeScript definitions yet)
    const zoomCapabilities = (capabilities as any).zoom
    this.minZoom = zoomCapabilities?.min || 1
    this.maxZoom = zoomCapabilities?.max || 1
    this.currentZoom = Math.max(this.minZoom, 1)
  }

  private addPinchToZoomListeners(): void {
    if (!this.videoTrack) return

    // Touch event handlers on window to ensure they work regardless of scanner DOM structure
    // Use capture phase and non-passive to ensure preventDefault works
    window.addEventListener('touchstart', this.handleTouchStart.bind(this), {
      passive: false,
      capture: true,
    } as AddEventListenerOptions)
    window.addEventListener('touchmove', this.handleTouchMove.bind(this), {
      passive: false,
      capture: true,
    } as AddEventListenerOptions)
    window.addEventListener('touchend', this.handleTouchEnd.bind(this), {
      passive: false,
      capture: true,
    } as AddEventListenerOptions)
  }

  private removePinchToZoomListeners(): void {
    // Remove event handlers from window with same options
    window.removeEventListener('touchstart', this.handleTouchStart.bind(this), {
      passive: false,
      capture: true,
    } as AddEventListenerOptions)
    window.removeEventListener('touchmove', this.handleTouchMove.bind(this), {
      passive: false,
      capture: true,
    } as AddEventListenerOptions)
    window.removeEventListener('touchend', this.handleTouchEnd.bind(this), {
      passive: false,
      capture: true,
    } as AddEventListenerOptions)
  }

  private handleTouchStart(event: TouchEvent): void {
    if (event.touches.length === 2) {
      // Prevent default browser zoom behavior
      event.preventDefault()
      event.stopPropagation()

      this.touchStartDistance = this.getTouchDistance(event.touches[0], event.touches[1])
      this.initialZoom = this.currentZoom
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    if (event.touches.length === 2 && this.videoTrack) {
      // Prevent default browser zoom behavior
      event.preventDefault()
      event.stopPropagation()

      const currentDistance = this.getTouchDistance(event.touches[0], event.touches[1])
      const distanceChange = currentDistance - this.touchStartDistance

      // Calculate zoom change based on distance change
      // Scale factor: adjust sensitivity (higher = more sensitive)
      const scaleFactor = 0.01
      const zoomChange = distanceChange * scaleFactor

      // Calculate new zoom level
      let newZoom = this.initialZoom + zoomChange

      // Clamp zoom to camera limits
      newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom))

      // Only apply zoom if it's significantly different to avoid excessive API calls
      if (Math.abs(newZoom - this.currentZoom) > 0.1) {
        this.currentZoom = newZoom
        this.applyZoom(newZoom)
      }
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    // Reset touch state when fingers are lifted
    if (event.touches.length < 2) {
      this.touchStartDistance = 0
      this.initialZoom = this.currentZoom
    }
  }

  private getTouchDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  private async applyZoom(zoom: number): Promise<void> {
    if (!this.videoTrack) return

    try {
      const constraints = {
        advanced: [{ zoom: zoom }],
      } as any
      await this.videoTrack.applyConstraints(constraints)
    } catch (error) {
      logger.error(`${this.constructor.name}.applyZoom | Failed to apply zoom ${zoom}`, error)
    }
  }

  private applyFullHeightStyles(): void {
    const scannerElement = document.getElementById(this.elementId)
    if (!scannerElement) return

    // Apply styles to the scanner container
    scannerElement.style.width = '100%'
    scannerElement.style.height = '100%'
    scannerElement.style.position = 'relative'

    // Prevent zoom behavior on Safari/iOS
    scannerElement.style.touchAction = 'none'
    scannerElement.style.userSelect = 'none'
    scannerElement.style.webkitUserSelect = 'none'
    ;(scannerElement.style as any).webkitTouchCallout = 'none'

    // Find and style the video element
    const videoElement = scannerElement.querySelector('video')
    if (videoElement) {
      videoElement.style.width = '100%'
      videoElement.style.height = '100%'
      videoElement.style.objectFit = 'cover'
      videoElement.style.position = 'absolute'
      videoElement.style.top = '0'
      videoElement.style.left = '0'

      // Additional Safari/iOS zoom prevention
      videoElement.style.touchAction = 'none'
      videoElement.style.userSelect = 'none'
      videoElement.style.webkitUserSelect = 'none'
      ;(videoElement.style as any).webkitTouchCallout = 'none'
    }

    // Style any child divs
    const childDivs = scannerElement.querySelectorAll('div')
    childDivs.forEach(div => {
      div.style.width = '100%'
      div.style.height = '100%'
      div.style.touchAction = 'none'
      div.style.userSelect = 'none'
      div.style.webkitUserSelect = 'none'
      ;(div.style as any).webkitTouchCallout = 'none'
    })
  }

  async stop(): Promise<void> {
    if (this.scanner && this.scanner.isScanning) {
      try {
        // Remove pinch-to-zoom listeners
        this.removePinchToZoomListeners()

        await this.scanner.stop()
        this.scanner.clear()

        // Reset zoom state
        this.videoTrack = null
        this.currentZoom = 1
        this.minZoom = 1
        this.maxZoom = 1
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
