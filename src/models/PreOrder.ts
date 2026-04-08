import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface PreOrderAttributes {
  id: number;
  buyer_id: number;
  product_id: number;
  quantity: number;
  deposit_amount: number;
  total_amount: number;
  expected_date: Date;
  status: "pending" | "confirmed" | "ready" | "completed" | "cancelled";
  notes: string | null;
  created_at: Date;
}

export type PreOrderCreationAttributes = Optional<
  PreOrderAttributes,
  "id" | "status" | "notes" | "created_at"
>;

export class PreOrder
  extends Model<PreOrderAttributes, PreOrderCreationAttributes>
  implements PreOrderAttributes {
  public id!: number;
  public buyer_id!: number;
  public product_id!: number;
  public quantity!: number;
  public deposit_amount!: number;
  public total_amount!: number;
  public expected_date!: Date;
  public status!: "pending" | "confirmed" | "ready" | "completed" | "cancelled";
  public notes!: string | null;
  public created_at!: Date;
}

PreOrder.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    buyer_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
    product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "products", key: "id" } },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    deposit_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    expected_date: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "pending" },
    notes: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { sequelize, tableName: "pre_orders", timestamps: false }
);
