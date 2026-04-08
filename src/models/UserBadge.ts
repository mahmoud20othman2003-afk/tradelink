import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface UserBadgeAttributes {
  id: number;
  user_id: number;
  badge_id: number;
  awarded_at: Date;
}

export type UserBadgeCreationAttributes = Optional<UserBadgeAttributes, "id" | "awarded_at">;

export class UserBadge
  extends Model<UserBadgeAttributes, UserBadgeCreationAttributes>
  implements UserBadgeAttributes {
  public id!: number;
  public user_id!: number;
  public badge_id!: number;
  public awarded_at!: Date;
}

UserBadge.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
    badge_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "badges", key: "id" } },
    awarded_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { sequelize, tableName: "user_badges", timestamps: false }
);
