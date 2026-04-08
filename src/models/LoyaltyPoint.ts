import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface LoyaltyPointAttributes {
  id: number;
  user_id: number;
  points: number;
  action: string;
  order_id: number | null;
  description: string;
  created_at: Date;
}

export type LoyaltyPointCreationAttributes = Optional<
  LoyaltyPointAttributes,
  "id" | "order_id" | "created_at"
>;

export class LoyaltyPoint
  extends Model<LoyaltyPointAttributes, LoyaltyPointCreationAttributes>
  implements LoyaltyPointAttributes {
  public id!: number;
  public user_id!: number;
  public points!: number;
  public action!: string;
  public order_id!: number | null;
  public description!: string;
  public created_at!: Date;
}

LoyaltyPoint.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
    points: { type: DataTypes.INTEGER, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false },
    order_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: "orders", key: "id" } },
    description: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { sequelize, tableName: "loyalty_points", timestamps: false }
);
