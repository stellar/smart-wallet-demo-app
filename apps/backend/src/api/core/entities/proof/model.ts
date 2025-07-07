import { Entity, Column, PrimaryColumn } from '../../framework/orm/base'

@Entity('proofs')
export class Proof {
  @PrimaryColumn({ name: 'receiver_address' })
  receiverAddress!: string

  @Column({ name: 'contract_address' })
  contractAddress!: string

  @Column({ name: 'index' })
  index!: number

  @Column({ name: 'receiver_amount', type: 'bigint' })
  receiverAmount!: string

  @Column({ name: 'proofs', type: 'text', array: true })
  proofs!: string[]

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date
}
