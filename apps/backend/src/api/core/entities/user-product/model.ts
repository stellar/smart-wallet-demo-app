import { Column, Entity, JoinColumn, ManyToOne, ModelBase, PrimaryGeneratedColumn } from 'api/core/framework/orm/base'

import { Product } from '../product/model'
import { User } from '../user/model'

export type UserProductStatus = 'claimed' | 'unclaimed'

@Entity()
export class UserProduct extends ModelBase {
  @PrimaryGeneratedColumn('uuid')
  userProductId: string

  @ManyToOne(() => User, user => user.userProducts)
  @JoinColumn({ name: 'user_id' })
  user: User

  @ManyToOne(() => Product, product => product.userProducts)
  @JoinColumn({ name: 'product_id' })
  product: Product

  @Column({ default: 'unclaimed', type: 'varchar' })
  status: string

  @Column({ nullable: true, type: 'timestamp' })
  claimedAt?: Date
}
