import { Column, Entity, ModelBase, PrimaryGeneratedColumn } from 'api/core/framework/orm/base'

@Entity()
export class Ngo extends ModelBase {
  @PrimaryGeneratedColumn('uuid')
  ngoId: string

  @Column({
    type: 'varchar',
  })
  name: string

  @Column({
    type: 'varchar',
  })
  description: string

  @Column({
    type: 'varchar',
  })
  walletAddress?: string

  @Column({
    type: 'varchar',
    nullable: true,
  })
  profileImage?: string
}
