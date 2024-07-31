import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript"
import Projects from "./projects"

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
}
