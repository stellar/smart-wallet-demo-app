import { Entity, ModelBase, PrimaryColumn, ManyToOne, JoinColumn } from 'api/core/framework/orm/base'

import { User } from '../user/model'

@Entity('gift_claim')
export class GiftClaim extends ModelBase {
  @PrimaryColumn('text', { name: 'gift_id_hash' })
  giftIdHash!: string

  @ManyToOne(() => User, user => user.userId, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User
}
