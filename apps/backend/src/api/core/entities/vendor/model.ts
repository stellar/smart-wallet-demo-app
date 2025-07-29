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
  contractAddress?: string

  @Column({
    type: 'varchar',
    nullable: true,
  })
  profileImage?: string
}
