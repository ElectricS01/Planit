import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript"
import type { Embed } from "../types/embeds"
import Projects from "./projects"
import Users from "./users"

/*
 * Sequelize-TS Model file, these files manage the types of the database so they can be validated by TypeScript.
 * TypeScript types help with validation and protect the programmer from making mistakes with wrong DataTypes
 */

@Table
export default class Messages extends Model {
  @ForeignKey(() => Users)
  @Column(DataType.INTEGER)
  userId!: number

  @Column(DataType.TEXT)
  messageContents!: string

  @Column(DataType.JSON)
  embeds!: Embed[]

  @Column(DataType.BOOLEAN)
  edited!: boolean

  @Column(DataType.INTEGER)
  reply!: number

  @ForeignKey(() => Projects)
  @Column(DataType.INTEGER)
  projectId!: number

  @BelongsTo(() => Users)
  user!: Users

  @BelongsTo(() => Projects, "projectId")
  project!: Projects
}
