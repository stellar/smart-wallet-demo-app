import type { Base64URLString, CredentialDeviceType } from '@simplewebauthn/server'
import { DeleteResult } from 'typeorm'

import { Passkey as PasskeyModel } from 'api/core/entities/passkey/model'

import { User } from '../user/types'

export type Passkey = PasskeyModel

export type PasskeyRepositoryType = {
  getPasskeyById(id: string): Promise<Passkey | null>
  createPasskey(
    passkey: {
      credentialId: Base64URLString
      credentialPublicKey: Uint8Array
      credentialHexPublicKey: string
      webauthnUserId: Base64URLString
      counter: number
      label: string
      deviceType: CredentialDeviceType
      backedUp: boolean
      transports?: string
      user: User
    },
    save?: boolean
  ): Promise<Passkey>
  updatePasskey(id: string, data: Partial<Passkey>): Promise<Passkey>
  deletePasskeys(ids: string[]): Promise<DeleteResult>
  savePasskeys(passkeys: Passkey[]): Promise<Passkey[]>
}
