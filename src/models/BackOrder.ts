import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface BackOrderAttributes {
  id: number;
  buyer_id: number;
  product_id: number;
  quantity: number;
  expected_delivery: Date;
  status: "pending" | "confirmed" | "available" | "fulfilled" | "cancelled";
  notify_buyer: boolean;
  created_at: Date;
}

export type BackOrderCreationAttributes = Optional<
  BackOrderAttributes,
  "id" | "status" | "notify_buyer" | "created_at"
>;

export class BackOrder
  extends Model<BackOrderAttributes, BackOrderCreationAttributes>
  implements BackOrderAttributes {
  public id!: number;
  public buyer_id!: number;
  public product_id!: number;
  public quantity!: number;
  public expected_delivery!: Date;
  public status!: "pending" | "confirmed" | "available" | "fulfilled" | "cancelled";
  public notify_buyer!: boolean;
  public created_at!: Date;
}

BackOrder.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    buyer_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
    product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "products", key: "id" } },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    expected_delivery: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "pending" },
    notify_buyer: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { sequelize, tableName: "back_orders", timestamps: false }
);
