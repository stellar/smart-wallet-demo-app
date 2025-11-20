import { Column, Entity, ModelBase, PrimaryGeneratedColumn } from 'api/core/framework/orm/base'

@Entity()
export class Faq extends ModelBase {
  @PrimaryGeneratedColumn('uuid')
  faqId: string

  @Column({
    type: 'varchar',
  })
  title: string

  @Column({
    type: 'varchar',
  })
  description: string

  @Column({ type: 'integer', default: 0 })
  order: number
}
