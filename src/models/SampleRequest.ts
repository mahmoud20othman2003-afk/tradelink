import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface SampleRequestAttributes {
  id: number;
  buyer_id: number;
  product_id: number;
  supplier_id: number;
  quantity: number;
  sample_type: "free" | "paid";
  cost: number;
  shipping_address: string;
  status: "pending" | "approved" | "shipped" | "delivered" | "rejected";
  notes: string | null;
  created_at: Date;
}

export type SampleRequestCreationAttributes = Optional<
  SampleRequestAttributes,
  "id" | "cost" | "status" | "notes" | "created_at"
>;

export class SampleRequest
  extends Model<SampleRequestAttributes, SampleRequestCreationAttributes>
  implements SampleRequestAttributes {
  public id!: number;
  public buyer_id!: number;
  public product_id!: number;
  public supplier_id!: number;
  public quantity!: number;
  public sample_type!: "free" | "paid";
  public cost!: number;
  public shipping_address!: string;
  public status!: "pending" | "approved" | "shipped" | "delivered" | "rejected";
  public notes!: string | null;
  public created_at!: Date;
}

SampleRequest.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    buyer_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
    product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "products", key: "id" } },
    supplier_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    sample_type: { type: DataTypes.STRING, allowNull: false, defaultValue: "free" },
    cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    shipping_address: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "pending" },
    notes: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { sequelize, tableName: "sample_requests", timestamps: false }
);
