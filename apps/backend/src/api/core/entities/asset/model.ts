import { Column, Entity, ModelBase, PrimaryGeneratedColumn } from 'api/core/framework/orm/base'

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
}
