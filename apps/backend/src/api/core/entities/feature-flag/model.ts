import { Column, Entity, ModelBase, PrimaryGeneratedColumn } from 'api/core/framework/orm/base'

@Entity()
export class FeatureFlag extends ModelBase {
  @PrimaryGeneratedColumn('uuid')
  featureFlagId: string

  @Column({
    type: 'varchar',
    unique: true,
  })
  name: string

  @Column({
    type: 'boolean',
    default: false,
  })
  isActive: boolean

  @Column({
    type: 'varchar',
    nullable: true,
  })
  description?: string

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  metadata?: object
}
