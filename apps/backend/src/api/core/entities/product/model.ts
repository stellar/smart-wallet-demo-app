import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  ModelBase,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'api/core/framework/orm/base'

import { Asset } from '../asset/model'
import { ProductTransaction } from '../product-transaction/model'
import { UserProduct } from '../user-product/model'

@Entity()
export class Product extends ModelBase {
  @PrimaryGeneratedColumn('uuid')
  productId: string

  @Column({
    unique: true,
    type: 'varchar',
  })
  code: string

  @Column({
    nullable: true,
    type: 'varchar',
  })
  name?: string

  @Column({
    nullable: true,
    type: 'varchar',
  })
  imageUrl?: string

  @Column({
    type: 'varchar',
  })
  description: string

  @Column({
    type: 'boolean',
    default: false,
  })
  isSwag: boolean

  @Column({
    type: 'boolean',
    default: false,
  })
  isHidden: boolean

  @ManyToOne(() => Asset, asset => asset.products)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset

  @OneToMany(() => UserProduct, userProduct => userProduct.product)
  userProducts: UserProduct[]

  @OneToMany(() => ProductTransaction, productTransactions => productTransactions.product)
  productTransactions: ProductTransaction[]
}
