import type { CredentialDeviceType, Base64URLString } from '@simplewebauthn/server'

import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, Index, ModelBase } from 'api/core/framework/orm/base'

import { User } from '../user/model'

@Entity()
@Index(['webauthnUserId', 'user'], { unique: false })
export class Passkey extends ModelBase {
  @PrimaryColumn('varchar', { length: 255 })
  credentialId: Base64URLString

  @Column('bytea')
  credentialPublicKey: Uint8Array

  @Column('varchar', { nullable: true })
  credentialHexPublicKey: string

  @Column('varchar', { length: 255 })
  webauthnUserId: Base64URLString

  @Column('bigint')
  counter: number

  @Column('varchar')
  label: string

  @Column('varchar', { length: 32 })
  deviceType: CredentialDeviceType

  @Column('boolean')
  backedUp: boolean

  // SQL: `VARCHAR(255)` and store string array as a CSV string
  // Ex: "ble,cable,hybrid,internal,nfc,smart-card,usb"
  @Column('varchar', { length: 255, nullable: true })
  transports?: string

  @ManyToOne(() => User, user => user.userId, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User
}
