import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript"
import Users from "../models/users"

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
