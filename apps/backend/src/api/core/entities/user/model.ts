import { Column, Entity, ModelBase, PrimaryGeneratedColumn } from 'api/core/framework/orm/base'

@Entity()
export class User extends ModelBase {
  @PrimaryGeneratedColumn('uuid')
  userId: string

  @Column({
    nullable: true,
  })
  email: string

  @Column({
    nullable: true,
  })
  uniqueToken: string

  @Column({
    nullable: true,
  })
  publicKey: string
}
