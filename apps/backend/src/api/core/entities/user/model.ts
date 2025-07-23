import { Column, Entity, ModelBase, OneToMany, PrimaryGeneratedColumn } from 'api/core/framework/orm/base'

import { Otp } from '../otp/model'
import { Passkey } from '../passkey/model'

@Entity()
export class User extends ModelBase {
  @PrimaryGeneratedColumn('uuid')
  userId: string

  @Column({
    type: 'varchar',
  })
  email: string

  @Column({
    type: 'varchar',
  })
  uniqueToken: string

  @Column({
    type: 'varchar',
    nullable: true,
  })
  contractAddress?: string

  @OneToMany(() => Passkey, passkey => passkey.user)
  passkeys: Passkey[]

  @OneToMany(() => Otp, otp => otp.user)
  otps: Otp[]
}
