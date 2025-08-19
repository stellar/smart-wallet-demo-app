import { Entity, Column, PrimaryGeneratedColumn, ModelBase, Index, OneToMany } from 'api/core/framework/orm/base'

import { Nft } from '../nft/model'

@Entity('nft_supply')
@Index(['sessionId', 'resource', 'contractAddress'], { unique: true })
export class NftSupply extends ModelBase {
  @PrimaryGeneratedColumn('uuid')
  nftSupplyId: string

  @Column({
    type: 'varchar',
  })
  name: string

  @Column({
    type: 'varchar',
  })
  description: string

  // NFT image URL: ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/I/m/SomeImage.png, https://some.site/img/SomeImage.jpg, etc
  @Column({
    type: 'varchar',
  })
  url: string

  // Token symbol
  @Column({
    type: 'varchar',
  })
  code: string

  // Token contract address
  @Column({
    name: 'contract_address',
    type: 'varchar',
  })
  contractAddress: string

  // Session ID: 'sometalk', 'treasure01', etc
  @Column({
    name: 'session_id',
    type: 'varchar',
  })
  sessionId: string

  // Resource descriptor: 'talk', 'treasure_hunt', 'vip_lounge', etc
  @Column({
    type: 'varchar',
  })
  resource: string

  // Total supply (max) of this token to mint
  @Column({
    name: 'total_supply',
    type: 'integer',
  })
  totalSupply: number

  // Current amount of tokens already minted
  @Column({
    name: 'minted_amount',
    type: 'integer',
    nullable: true,
    default: 0,
  })
  mintedAmount: number

  @Column({
    type: 'varchar',
    nullable: true,
  })
  issuer: string

  @OneToMany(() => Nft, nft => nft.nftSupply)
  nfts: Nft[]
}
