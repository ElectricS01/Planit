import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table
} from "sequelize-typescript"
import Projects from "./projects"
import ResourceAssociations from "./resourceAssociations"
import Tasks from "./tasks"

@Table
export default class Resources extends Model {
  @ForeignKey(() => Projects)
  @Column(DataType.INTEGER)
  projectId!: number

  @Column(DataType.TEXT)
  name!: string

  @Column(DataType.TEXT)
  description!: string

  @Column(DataType.STRING)
  icon!: string

  @HasMany(() => ResourceAssociations)
  associations!: ResourceAssociations[]

  @BelongsTo(() => Projects, "projectId")
  project!: Projects
}
