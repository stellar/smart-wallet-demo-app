import { Entity, Column, ManyToOne, JoinColumn, ModelBase, PrimaryGeneratedColumn } from 'api/core/framework/orm/base'

import { User } from '../user/model'

@Entity()
export class Otp extends ModelBase {
  @PrimaryGeneratedColumn('uuid')
  otpId: string

  @Column('varchar', { length: 6, unique: true })
  code: string

  @Column('timestamp')
  expiresAt: Date

  @ManyToOne(() => User, user => user.userId, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User
}
