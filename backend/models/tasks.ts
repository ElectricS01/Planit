import {
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table
} from "sequelize-typescript"
import Projects from "./projects"
import ResourceAssociations from "./resourceAssociations"

/*
 * Sequelize-TS Model file, these files manage the types of the database so they can be validated by TypeScript.
 * TypeScript types help with validation and protect the programmer from making mistakes with wrong DataTypes
 */

@Table
export default class Tasks extends Model {
  @ForeignKey(() => Projects)
  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  projectId!: number

  @Column({
    allowNull: false,
    type: DataType.STRING
  })
  name!: string

  @Column(DataType.STRING)
  description!: string

  @Column(DataType.STRING)
  icon!: string

  @Column({
    allowNull: false,
    defaultValue: 2,
    type: DataType.SMALLINT.UNSIGNED
  })
  type!: number

  @Column(DataType.DATE)
  startAt!: Date

  @Column(DataType.DATE)
  dueAt!: Date

  @HasMany(() => ResourceAssociations)
  resources!: ResourceAssociations[]
}
