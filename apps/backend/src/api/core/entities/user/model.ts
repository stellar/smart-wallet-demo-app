import { Column, Entity, ModelBase, PrimaryGeneratedColumn } from 'api/core/framework/orm/base'

@Entity()
export class User extends ModelBase {
  @PrimaryGeneratedColumn('uuid')
  userId: string

  @Column({
    type: 'varchar',
  })
  email: string

  @Column({
    type: 'varchar',
  })
  uniqueToken: string

  @Column({
    type: 'varchar',
    nullable: true,
  })
  publicKey: string
}
