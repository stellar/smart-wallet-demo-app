import { Column, Entity, PrimaryColumn } from '../../framework/orm/base'

@Entity('proofs')
export class Proof {
  @PrimaryColumn({ name: 'receiver_address', type: 'text' })
  receiverAddress!: string

  @PrimaryColumn({ name: 'contract_address', type: 'text' })
  contractAddress!: string

  @Column({ name: 'index', type: 'integer' })
  index!: number

  @Column({ name: 'receiver_amount', type: 'bigint' })
  receiverAmount!: string

  @Column({ default: false, name: 'is_claimed', type: 'boolean' })
  isClaimed!: boolean

  @Column({ name: 'proofs', type: 'text', array: true })
  proofs!: string[]

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date
}
