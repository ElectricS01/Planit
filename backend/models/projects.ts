import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table
} from "sequelize-typescript"
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

  @HasMany(() => Permissions)
  permissions!: Permissions[]

  @BelongsTo(() => Users, {
    as: "ownerDetails",
    foreignKey: "owner"
  })
  ownerDetails!: Users
}
