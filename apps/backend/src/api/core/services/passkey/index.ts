import type { Base64URLString, CredentialDeviceType } from '@simplewebauthn/server'
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
      transports?: string
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

  async updatePasskey(id: string, data: Partial<Passkey>): Promise<Passkey> {
    await PasskeyModel.update(id, data)
    return this.getPasskeyById(id) as Promise<Passkey>
  }

  async deletePasskey(id: string): Promise<DeleteResult> {
    return PasskeyModel.delete(id)
  }

  async savePasskeys(passkeys: Passkey[]): Promise<Passkey[]> {
    return PasskeyModel.save(passkeys)
  }
}
