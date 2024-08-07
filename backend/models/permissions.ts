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

/*
 * Sequelize-TS Model file, these files manage the types of the database so they can be validated by TypeScript.
 * TypeScript types help with validation and protect the programmer from making mistakes with wrong DataTypes
 */

@Table
export default class Permissions extends Model {
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

  @Column({
    allowNull: false,
    defaultValue: 2,
    type: DataType.SMALLINT.UNSIGNED
  })
  type!: number

  @BelongsTo(() => Projects, "projectId")
  project!: Projects
}
