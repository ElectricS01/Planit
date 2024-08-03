import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript"
import Users from "../models/users"

/*
 * Sequelize-TS Model file, these files manage the types of the database so they can be validated by TypeScript.
 * TypeScript types help with validation and protect the programmer from making mistakes with wrong DataTypes
 */

@Table
export default class Sessions extends Model {
  @Column({
    type: DataType.STRING
  })
  token!: string

  @ForeignKey(() => Users)
  @Column({
    type: DataType.INTEGER
  })
  userId!: number

  @BelongsTo(() => Users)
  user!: Users

  @Column({
    type: DataType.STRING
  })
  userAgent!: string

  @Column({
    type: DataType.DATE
  })
  expiredAt!: Date
}
