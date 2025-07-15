import type { Base64URLString, CredentialDeviceType, AuthenticatorTransportFuture } from '@simplewebauthn/server'
import { Passkey, PasskeyRepositoryType } from 'api/core/entities/passkey/types'
import { Passkey as PasskeyModel } from 'api/core/entities/passkey/model'
import { SingletonBase } from 'api/core/framework/singleton/interface'
import { User } from 'api/core/entities/user/types'
import { DeleteResult } from 'typeorm'

export default class PasskeyRepository extends SingletonBase implements PasskeyRepositoryType {
  constructor() {
    super()
  }

  async getPasskeyById(id: string): Promise<Passkey | null> {
    return PasskeyModel.findOneBy({ credentialId: id })
  }

  async createPasskey(
    passkey: {
      credentialId: Base64URLString
      credentialPublicKey: Uint8Array
      webauthnUserId: Base64URLString
      counter: number
      label: string
      deviceType: CredentialDeviceType
      backedUp: boolean
      transports?: string // raw DB value
      transportsArray?: AuthenticatorTransportFuture[] // derived (not persisted)
      user: User
    },
    save?: boolean
  ): Promise<Passkey> {
    const newPasskey = PasskeyModel.create({ ...passkey })
    if (save) {
      return (await this.savePasskeys([newPasskey]))[0]
    }
    return newPasskey
  }

  async updatePasskey(id: string, passkey: Partial<Passkey>): Promise<Passkey> {
    await PasskeyModel.update(id, {
      ...(passkey.credentialId && { credentialId: passkey.credentialId }),
      ...(passkey.credentialPublicKey && { credentialPublicKey: passkey.credentialPublicKey }),
      ...(passkey.webauthnUserId && { webauthnUserId: passkey.webauthnUserId }),
      ...(passkey.counter && { counter: passkey.counter }),
      ...(passkey.label && { label: passkey.label }),
      ...(passkey.deviceType && { deviceType: passkey.deviceType }),
      ...(passkey.backedUp && { backedUp: passkey.backedUp }),
      ...(passkey.transportsArray && { transportsArray: passkey.transportsArray }),
      ...(passkey.user && { user: passkey.user }),
    })

    const updatedPasskey = await this.getPasskeyById(id)

    return updatedPasskey as Passkey
  }

  async deletePasskey(id: string): Promise<DeleteResult> {
    return PasskeyModel.delete(id)
  }

  async savePasskeys(passkeys: Passkey[]): Promise<Passkey[]> {
    return PasskeyModel.save(passkeys)
  }
}
