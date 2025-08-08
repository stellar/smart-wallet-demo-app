import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
  ModelBase,
} from 'api/core/framework/orm/base'

import { User } from '../user/model'

@Entity()
@Index(['tokenId', 'contractAddress'], { unique: true }) // TokenID unique inside a contract
@Index(['tokenId', 'contractAddress', 'user'], { unique: true }) // Only one user per TokenID on the same contract
export class Nft extends ModelBase {
  @PrimaryGeneratedColumn('uuid')
  nftId: string

  // TokenID that identify NFT inside a contract as per SEP-50 specs
  @Column({
    type: 'varchar',
  })
  tokenId: string

  @Column({
    type: 'varchar',
  })
  contractAddress: string

  @ManyToOne(() => User, user => user.userId, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User
}
