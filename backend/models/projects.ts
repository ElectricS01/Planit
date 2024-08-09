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
import Resources from "./resources"
import Tasks from "./tasks"
import Users from "./users"

/*
 * Sequelize-TS Model file, these files manage the types of the database so they can be validated by TypeScript.
 * TypeScript types help with validation and protect the programmer from making mistakes with wrong DataTypes
 */

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

  @HasMany(() => Resources)
  resources!: Resources[]

  @HasMany(() => Tasks)
  tasks!: Tasks[]

  @BelongsTo(() => Users, {
    as: "ownerDetails",
    foreignKey: "owner"
  })
  ownerDetails!: Users
}
