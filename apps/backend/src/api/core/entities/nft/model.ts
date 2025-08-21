import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  JoinColumn,
  ModelBase,
} from 'api/core/framework/orm/base'

import { NftSupply } from '../nft-supply/model'
import { User } from '../user/model'

@Entity()
@Index(['nftSupply'], { unique: true })
@Index(['tokenId', 'contractAddress'], { unique: true })
export class Nft extends ModelBase {
  @PrimaryGeneratedColumn('uuid')
  nftId: string

  // TokenID that identify NFT inside a contract as per SEP-50 specs
  @Column({
    type: 'varchar',
    nullable: true,
  })
  tokenId: string

  @Column({
    type: 'varchar',
  })
  contractAddress: string

  @ManyToOne(() => User, user => user.userId, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User

  @ManyToOne(() => NftSupply, nftSupply => nftSupply.nftSupplyId, { nullable: false })
  @JoinColumn({ name: 'nft_supply_id' })
  nftSupply: NftSupply
}
