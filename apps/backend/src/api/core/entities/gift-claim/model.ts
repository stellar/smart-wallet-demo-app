import { Column, Entity, ModelBase } from 'api/core/framework/orm/base'

@Entity('gift_claim')
export class GiftClaim extends ModelBase {
  @Column({ name: 'gift_id_hash', type: 'text', primary: true })
  giftIdHash!: string

  @Column({ name: 'wallet_address', type: 'text' })
  walletAddress!: string
}
