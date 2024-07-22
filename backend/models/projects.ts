import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table
} from "sequelize-typescript"
import Messages from "./messages"
import Permissions from "./permissions"
import Users from "./users"

@Table
export default class Projects extends Model {
  @Column({
    allowNull: false,
    type: DataType.STRING
  })
  name!: string

  @Column({
    type: DataType.STRING
  })
  description!: string

  @Column({
    type: DataType.STRING
  })
  icon!: string

  @ForeignKey(() => Users)
  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  owner!: number

  @Column({
    allowNull: false,
    type: DataType.DATE
  })
  latest!: number

  @HasMany(() => Permissions)
  permissions!: Permissions[]

  @HasMany(() => Messages)
  messages!: Messages[]

  @BelongsTo(() => Users, {
    as: "ownerDetails",
    foreignKey: "owner"
  })
  ownerDetails!: Users
}
