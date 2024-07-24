import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript"
import Resources from "./resources"
import Tasks from "./tasks"

@Table
export default class ResourceAssociations extends Model {
  @ForeignKey(() => Resources)
  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  resourceId!: number

  @BelongsTo(() => Resources, "resourceId")
  resource!: Resources

  @ForeignKey(() => Tasks)
  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  taskId!: number

  @BelongsTo(() => Tasks, "taskId")
  task!: Tasks
}
