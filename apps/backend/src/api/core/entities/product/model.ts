import { Column, Entity, ModelBase, PrimaryGeneratedColumn } from 'api/core/framework/orm/base'

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
    type: 'varchar',
  })
  description: string
}
