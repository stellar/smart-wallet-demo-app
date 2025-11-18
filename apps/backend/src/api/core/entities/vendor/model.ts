import { Column, Entity, ModelBase, PrimaryGeneratedColumn } from 'api/core/framework/orm/base'

@Entity()
export class Vendor extends ModelBase {
  @PrimaryGeneratedColumn('uuid')
  vendorId: string

  @Column({
    type: 'varchar',
  })
  name: string

  @Column({
    type: 'varchar',
    nullable: true,
  })
  description?: string

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean

  @Column({ type: 'integer', default: 0 })
  displayOrder: number

  @Column({
    type: 'varchar',
    nullable: true,
  })
  walletAddress?: string

  @Column({
    type: 'varchar',
    nullable: true,
  })
  profileImage?: string
}
