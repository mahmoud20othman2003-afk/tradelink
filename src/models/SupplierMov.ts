import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface SupplierMovAttributes {
  id: number;
  supplier_id: number;
  min_order_value: number;
  currency: string;
  message: string | null;
  created_at: Date;
}

export type SupplierMovCreationAttributes = Optional<
  SupplierMovAttributes,
  "id" | "currency" | "message" | "created_at"
>;

export class SupplierMov
  extends Model<SupplierMovAttributes, SupplierMovCreationAttributes>
  implements SupplierMovAttributes {
  public id!: number;
  public supplier_id!: number;
  public min_order_value!: number;
  public currency!: string;
  public message!: string | null;
  public created_at!: Date;
}

SupplierMov.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    supplier_id: { type: DataTypes.INTEGER, allowNull: false, unique: true, references: { model: "users", key: "id" } },
    min_order_value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: DataTypes.STRING, allowNull: false, defaultValue: "EGP" },
    message: { type: DataTypes.STRING, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { sequelize, tableName: "supplier_movs", timestamps: false }
);
