import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript"
import Projects from "./projects"
import Users from "./users"

@Table
export default class ChatAssociations extends Model {
  @ForeignKey(() => Users)
  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  userId!: number

  @BelongsTo(() => Users, "userId")
  user!: Users

  @ForeignKey(() => Projects)
  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  projectId!: number

  @BelongsTo(() => Projects, "chatId")
  project!: Projects

  @Column({
    allowNull: false,
    defaultValue: 2,
    type: DataType.SMALLINT.UNSIGNED
  })
  type!: number
}
