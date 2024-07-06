import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript"
import Users from "../models/users"

@Table
export default class Notifications extends Model {
  @ForeignKey(() => Users)
  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  userId!: number

  @ForeignKey(() => Users)
  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  otherId!: number

  @Column({
    allowNull: false,
    defaultValue: 0,
    type: DataType.INTEGER
  })
  type!: number

  @Column({
    allowNull: false,
    defaultValue: false,
    type: DataType.BOOLEAN
  })
  isRead!: boolean
}
