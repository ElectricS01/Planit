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

/*
 * Sequelize-TS Model file, these files manage the types of the database so they can be validated by TypeScript.
 * TypeScript types help with validation and protect the programmer from making mistakes with wrong DataTypes
 */

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
