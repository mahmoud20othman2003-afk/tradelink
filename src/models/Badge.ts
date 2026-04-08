import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface BadgeAttributes {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  criteria: string;
  created_at: Date;
}

export type BadgeCreationAttributes = Optional<BadgeAttributes, "id" | "icon" | "created_at">;

export class Badge
  extends Model<BadgeAttributes, BadgeCreationAttributes>
  implements BadgeAttributes {
  public id!: number;
  public name!: string;
  public slug!: string;
  public description!: string;
  public icon!: string | null;
  public criteria!: string;
  public created_at!: Date;
}

Badge.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.STRING, allowNull: false },
    icon: { type: DataTypes.STRING, allowNull: true },
    criteria: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { sequelize, tableName: "badges", timestamps: false }
);
