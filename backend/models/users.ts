import { Column, DataType, Model, Table } from "sequelize-typescript"

@Table({
  tableName: "Users",
  timestamps: true
})
export default class Users extends Model {
  @Column({
    unique: true,
    type: DataType.STRING
  })
  username!: string

  @Column({
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    },
    type: DataType.STRING
  })
  email!: string

  @Column(DataType.STRING)
  password!: string

  @Column({
    defaultValue: false,
    type: DataType.BOOLEAN
  })
  emailVerified!: boolean

  @Column(DataType.STRING)
  emailToken!: string

  @Column({
    defaultValue: false,
    type: DataType.BOOLEAN
  })
  admin!: boolean

  @Column(DataType.STRING)
  avatar!: string

  @Column(DataType.TEXT)
  description!: string

  @Column(DataType.STRING)
  status!: string

  @Column(DataType.STRING)
  statusMessage!: string

  @Column(DataType.BOOLEAN)
  saveSwitcher!: boolean

  @Column({ defaultValue: [], type: DataType.JSON })
  switcherHistory!: boolean
}
