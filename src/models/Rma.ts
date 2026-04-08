import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface RmaAttributes {
  id: number;
  order_id: number;
  buyer_id: number;
  seller_id: number;
  reason: string;
  description: string | null;
  return_type: "full" | "partial";
  status: "requested" | "approved" | "shipped_back" | "received" | "refunded" | "rejected";
  refund_amount: number | null;
  damaged_images: string | null;
  created_at: Date;
}

export type RmaCreationAttributes = Optional<
  RmaAttributes,
  "id" | "description" | "refund_amount" | "damaged_images" | "status" | "created_at"
>;

export class Rma
  extends Model<RmaAttributes, RmaCreationAttributes>
  implements RmaAttributes {
  public id!: number;
  public order_id!: number;
  public buyer_id!: number;
  public seller_id!: number;
  public reason!: string;
  public description!: string | null;
  public return_type!: "full" | "partial";
  public status!: "requested" | "approved" | "shipped_back" | "received" | "refunded" | "rejected";
  public refund_amount!: number | null;
  public damaged_images!: string | null;
  public created_at!: Date;
}

Rma.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "orders", key: "id" } },
    buyer_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
    seller_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
    reason: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    return_type: { type: DataTypes.STRING, allowNull: false, defaultValue: "full" },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "requested" },
    refund_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    damaged_images: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { sequelize, tableName: "rmas", timestamps: false }
);
