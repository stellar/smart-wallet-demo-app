import { AuthenticatorAttestationResponseJSON } from '@simplewebauthn/server'

export const extractPublicKey = (response: AuthenticatorAttestationResponseJSON): string | null => {
  // Try to extract public key from different response formats

  // Method 1: Direct publicKey field
  if (response.publicKey) {
    const publicKeyBuffer = Buffer.from(response.publicKey)
    // Check if it's already in the right format
    if (publicKeyBuffer.length === 65 && publicKeyBuffer[0] === 0x04) {
      return parsePublicKey(new Uint8Array(publicKeyBuffer))
    }
    // If it's DER encoded, extract the raw key
    if (publicKeyBuffer.length > 65) {
      for (let i = publicKeyBuffer.length - 65; i >= 0; i--) {
        if (publicKeyBuffer[i] === 0x04 && i + 65 <= publicKeyBuffer.length) {
          return parsePublicKey(new Uint8Array(publicKeyBuffer.slice(i, i + 65)))
        }
      }
    }
  }

  // Method 2: Parse from attestationObject
  if (response.attestationObject) {
    const attestationObject = Buffer.from(response.attestationObject)

    // Search for COSE key structure
    // Looking for the x and y coordinates in CBOR format
    for (let i = 0; i < attestationObject.length - 70; i++) {
      if (
        attestationObject[i] === 0x21 && // -2 (x coordinate key)
        attestationObject[i + 1] === 0x58 && // byte string
        attestationObject[i + 2] === 0x20 && // length 32
        i + 35 < attestationObject.length &&
        attestationObject[i + 35] === 0x22 && // -3 (y coordinate key)
        attestationObject[i + 36] === 0x58 && // byte string
        attestationObject[i + 37] === 0x20
      ) {
        // length 32
        const x = attestationObject.slice(i + 3, i + 35)
        const y = attestationObject.slice(i + 38, i + 70)

        // Create uncompressed public key
        const publicKey = new Uint8Array(65)
        publicKey[0] = 0x04
        publicKey.set(x, 1)
        publicKey.set(y, 33)
        return parsePublicKey(publicKey)
      }
    }
  }

  // Method 3: Parse from authenticatorData if available
  if (response.authenticatorData) {
    const authData = Buffer.from(response.authenticatorData)

    // Skip RP ID hash (32) + flags (1) + counter (4) = 37 bytes
    // Check if credential data is present (bit 6 of flags byte)
    if (authData.length > 37 && authData[32] & 0x40) {
      let offset = 37

      // Skip AAGUID (16 bytes)
      offset += 16

      // Get credential ID length (2 bytes, big-endian)
      if (offset + 2 <= authData.length) {
        const credIdLen = (authData[offset] << 8) | authData[offset + 1]
        offset += 2 + credIdLen

        // Now we should be at the public key in COSE format
        // Search for x and y coordinates
        for (let i = offset; i < authData.length - 70 && i < offset + 200; i++) {
          if (
            authData[i] === 0x21 &&
            authData[i + 1] === 0x58 &&
            authData[i + 2] === 0x20 &&
            i + 35 < authData.length &&
            authData[i + 35] === 0x22 &&
            authData[i + 36] === 0x58 &&
            authData[i + 37] === 0x20
          ) {
            const x = authData.slice(i + 3, i + 35)
            const y = authData.slice(i + 38, i + 70)

            const publicKey = new Uint8Array(65)
            publicKey[0] = 0x04
            publicKey.set(x, 1)
            publicKey.set(y, 33)
            return parsePublicKey(publicKey)
          }
        }
      }
    }
  }

  return null
}

const parsePublicKey = (publicKeyBytes: Uint8Array): string => {
  const publicKeyHex = Array.from(publicKeyBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return publicKeyHex
}
