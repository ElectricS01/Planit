import {
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table
} from "sequelize-typescript"
import Resources from "./resources"
import Projects from "./projects"
import Users from "./users"

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

  @Column(DataType.DATE)
  dueAt!: Date
}
