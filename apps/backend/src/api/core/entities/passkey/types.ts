import type { Base64URLString, CredentialDeviceType, AuthenticatorTransportFuture } from '@simplewebauthn/server'
import { Passkey as PasskeyModel } from 'api/core/entities/passkey/model'
import { DeleteResult } from 'typeorm'
import { User } from '../user/types'

export type Passkey = PasskeyModel

export type PasskeyRepositoryType = {
  getPasskeyById(id: string, options?: Record<string, unknown>): Promise<Passkey | null>
  createPasskey(
    passkey: {
      credentialId: Base64URLString
      credentialPublicKey: Uint8Array
      webauthnUserId: Base64URLString
      counter: number
      label: string
      deviceType: CredentialDeviceType
      backedUp: boolean
      transportsArray?: AuthenticatorTransportFuture[]
      user: User
    },
    save?: boolean
  ): Promise<Passkey>
  updatePasskey(id: string, passkey: Partial<Passkey>): Promise<Passkey>
  deletePasskey(id: string): Promise<DeleteResult>
  savePasskeys(passkeys: Passkey[]): Promise<Passkey[]>
}
