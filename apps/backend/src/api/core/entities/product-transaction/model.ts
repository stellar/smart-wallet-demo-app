import { Column, Entity, JoinColumn, ManyToOne, ModelBase, PrimaryGeneratedColumn } from 'api/core/framework/orm/base'

import { Product } from '../product/model'

@Entity()
export class ProductTransaction extends ModelBase {
  @PrimaryGeneratedColumn('uuid')
  productTransactionId: string

  // Hash of the transaction
  @Column({
    type: 'varchar',
    nullable: false,
  })
  transactionHash: string

  @ManyToOne(() => Product, product => product.productTransactions)
  @JoinColumn({ name: 'product_id' })
  product: Product
}
