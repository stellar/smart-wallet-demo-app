import { Column, Entity, ModelBase, OneToMany, PrimaryGeneratedColumn } from 'api/core/framework/orm/base'

import { Product } from '../product/model'

@Entity()
export class Asset extends ModelBase {
  @PrimaryGeneratedColumn('uuid')
  assetId: string

  @Column({
    type: 'varchar',
  })
  name: string

  @Column({
    type: 'varchar',
  })
  code: string

  @Column({
    type: 'varchar',
  })
  type: string

  @Column({
    type: 'varchar',
  })
  contractAddress: string

  @OneToMany(() => Product, product => product.asset)
  products: Product[]
}
