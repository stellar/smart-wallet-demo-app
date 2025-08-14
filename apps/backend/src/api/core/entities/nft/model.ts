import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, ModelBase } from 'api/core/framework/orm/base'

import { User } from '../user/model'

@Entity()
export class Nft extends ModelBase {
  @PrimaryGeneratedColumn('uuid')
  nftId: string

  // TokenID that identify NFT inside a contract as per SEP-50 specs
  @Column({
    type: 'varchar',
    nullable: true,
  })
  tokenId: string

  // Session ID: 'sometalk', 'treasure01', etc
  @Column({
    name: 'session_id',
    type: 'varchar',
  })
  sessionId: string

  @Column({
    type: 'varchar',
  })
  contractAddress: string

  @ManyToOne(() => User, user => user.userId, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User
}
