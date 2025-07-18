import type { Base64URLString, CredentialDeviceType, AuthenticatorTransportFuture } from '@simplewebauthn/server'
import { faker } from '@faker-js/faker'
import { Passkey } from 'api/core/entities/passkey/model'
import { User } from '../user/types'
import { userFactory } from '../user/factory'

interface PasskeyFactoryArgs {
  credentialId?: Base64URLString
  credentialPublicKey?: Uint8Array
  webauthnUserId?: Base64URLString
  counter?: number
  label?: string
  deviceType?: CredentialDeviceType
  backedUp?: boolean
  transports?: AuthenticatorTransportFuture[]
  user?: User
}

export const passkeyFactory = ({
  credentialId,
  credentialPublicKey,
  webauthnUserId,
  counter,
  label,
  deviceType,
  backedUp,
  transports,
  user,
}: PasskeyFactoryArgs): Passkey => {
  const passkey = new Passkey()
  passkey.credentialId = credentialId ?? faker.string.uuid()
  passkey.credentialPublicKey =
    credentialPublicKey ??
    Uint8Array.from({ length: faker.number.int({ min: 65, max: 270 }) }, () => faker.number.int({ min: 0, max: 255 }))
  passkey.webauthnUserId = webauthnUserId ?? faker.string.uuid()
  passkey.counter = counter ?? faker.number.int()
  passkey.label = label ?? faker.word.noun()
  passkey.deviceType = deviceType ?? 'singleDevice'
  passkey.backedUp = backedUp ?? faker.datatype.boolean()
  passkey.transports = transports?.join(',') ?? ['ble', 'cable', 'usb'].join(',')
  passkey.user = user ?? userFactory({})
  return passkey
}
