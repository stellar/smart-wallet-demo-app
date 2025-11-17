import {
  BaseEntity,
  BeforeInsert,
  Between,
  Column,
  CreateDateColumn,
  Entity,
  Equal,
  FindManyOptions,
  FindOneOptions,
  Index,
  JoinColumn,
  JoinTable,
  LessThanOrEqual,
  ManyToMany,
  ManyToOne,
  MoreThanOrEqual,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Repository,
  Unique,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm'

abstract class ModelBase extends BaseEntity {
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}

export {
  ModelBase,
  BeforeInsert,
  Between,
  Column,
  CreateDateColumn,
  Entity,
  Equal,
  FindManyOptions,
  FindOneOptions,
  Index,
  JoinColumn,
  JoinTable,
  LessThanOrEqual,
  ManyToMany,
  ManyToOne,
  MoreThanOrEqual,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Repository,
  Unique,
  UpdateDateColumn,
  DeleteDateColumn,
}
