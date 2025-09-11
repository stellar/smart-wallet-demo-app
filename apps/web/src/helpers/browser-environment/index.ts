/**
 * Browser and environment detection utilities
 */

/**
 * Detects if the current environment is running inside a webview
 * @returns {boolean} true if running in a webview, false otherwise
 */
export function isWebView(): boolean {
  const userAgent = navigator.userAgent.toLowerCase()

  // 1. Check for React Native WebView
  if ((window as unknown as { ReactNativeWebView?: unknown }).ReactNativeWebView !== undefined) {
    return true
  }

  // 2. Check for Android WebView (look for 'wv' in user agent)
  if (userAgent.includes('wv') && userAgent.includes('android')) {
    return true
  }

  // 3. Check for Google App on Android
  if (userAgent.includes('android') && userAgent.includes('googleapp')) {
    return true
  }

  // 4. Check for other Android webviews
  if (
    userAgent.includes('android') &&
    ((userAgent.includes('version/') && userAgent.includes('mobile safari')) ||
      (userAgent.includes('chrome/') && !userAgent.includes('crios/')))
  ) {
    return true
  }

  // 5. Check for iOS WebView (WKWebView)
  if (/iphone|ipad|ipod/.test(userAgent)) {
    // Exclude known browsers that have messageHandlers but aren't webviews
    const isKnownBrowser =
      userAgent.includes('crios/') || // Chrome iOS
      userAgent.includes('fxios/') || // Firefox iOS
      (userAgent.includes('version/') && userAgent.includes('safari/')) // Safari

    // If it's iOS and has webkit message handlers, but NOT a known browser
    if (
      (window as unknown as { webkit?: { messageHandlers?: unknown } }).webkit?.messageHandlers !== undefined &&
      !isKnownBrowser
    ) {
      return true
    }
    // If it's iOS standalone mode (added to home screen)
    if ((window.navigator as unknown as { standalone?: boolean }).standalone === true) {
      return true
    }
    // If it's iOS but missing typical Safari indicators AND not a known browser
    if (!userAgent.includes('version/') && !userAgent.includes('safari/') && !isKnownBrowser) {
      return true
    }
  }

  // 6. Check for specific webview user agents
  if (userAgent.includes('webview') || userAgent.includes('webviewapp')) {
    return true
  }

  // 7. Check for Cordova/PhoneGap
  if (
    (window as unknown as { cordova?: unknown; phonegap?: unknown }).cordova !== undefined ||
    (window as unknown as { cordova?: unknown; phonegap?: unknown }).phonegap !== undefined
  ) {
    return true
  }

  // 8. Check for Ionic
  if ((window as unknown as { Ionic?: unknown }).Ionic !== undefined) {
    return true
  }

  // 9. Check if we're in an iframe
  if (window !== window.top) {
    return true
  }

  return false
}

/**
 * Checks if WebAuthn/Passkey authentication is supported in the current environment
 * @returns {Promise<boolean>} true if WebAuthn is supported, false otherwise
 */
export async function isWebAuthnSupported(): Promise<boolean> {
  try {
    // Check if WebAuthn API is available
    if (!window.PublicKeyCredential) {
      return false
    }

    // Check if platform authenticator is available
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    return available
  } catch (_error) {
    return false
  }
}

/**
 * Attempts to redirect the user to the native browser from a webview
 * @param {string} url - The URL to redirect to
 */
export function redirectToNativeBrowser(url: string): void {
  const userAgent = navigator.userAgent.toLowerCase()

  if (/iphone|ipad|ipod/.test(userAgent)) {
    // iOS - try multiple methods to force Safari
    try {
      // Method 1: Try to use window.open with _blank (most reliable for iOS)
      const newWindow = window.open(url, '_blank')
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        throw new Error('Popup blocked')
      }
    } catch (_error) {
      try {
        // Method 2: Try to create a temporary link and click it
        const link = document.createElement('a')
        link.href = url
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (_error2) {
        // Method 3: Last resort - try window.open with different parameters
        try {
          window.open(url, '_system')
        } catch (_error3) {
          // If all else fails, try direct redirect as last resort
          window.location.href = url
        }
      }
    }
  } else if (userAgent.includes('android')) {
    // Android - try multiple methods
    try {
      // Method 1: Try Android Intent for Chrome
      const intentUrl = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`
      window.location.href = intentUrl
    } catch (_error) {
      try {
        // Method 2: Try window.open with _blank
        const newWindow = window.open(url, '_blank')
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          throw new Error('Popup blocked')
        }
      } catch (_error2) {
        try {
          // Method 3: Try to create a temporary link and click it
          const link = document.createElement('a')
          link.href = url
          link.target = '_blank'
          link.rel = 'noopener noreferrer'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        } catch (_error3) {
          // If all else fails, try direct redirect as last resort
          window.location.href = url
        }
      }
    }
  } else {
    // Generic fallback - try to open in new tab
    try {
      const newWindow = window.open(url, '_blank')
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        throw new Error('Popup blocked')
      }
    } catch (_error) {
      // Fallback: direct redirect
      window.location.href = url
    }
  }
}

/**
 * Opens the current URL in the native browser
 * Simplified version for use in UI components
 */
export function openInNativeBrowser(): void {
  const currentUrl = window.location.href
  redirectToNativeBrowser(currentUrl)
}
