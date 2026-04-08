import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface LotTrackingAttributes {
  id: number;
  product_id: number;
  lot_number: string;
  qr_code: string;
  quantity: number;
  manufacture_date: Date | null;
  expiry_date: Date | null;
  warehouse_id: number | null;
  bin_location: string | null;
  status: "active" | "recalled" | "expired";
  created_at: Date;
}

export type LotTrackingCreationAttributes = Optional<
  LotTrackingAttributes,
  "id" | "manufacture_date" | "expiry_date" | "warehouse_id" | "bin_location" | "status" | "created_at"
>;

export class LotTracking
  extends Model<LotTrackingAttributes, LotTrackingCreationAttributes>
  implements LotTrackingAttributes {
  public id!: number;
  public product_id!: number;
  public lot_number!: string;
  public qr_code!: string;
  public quantity!: number;
  public manufacture_date!: Date | null;
  public expiry_date!: Date | null;
  public warehouse_id!: number | null;
  public bin_location!: string | null;
  public status!: "active" | "recalled" | "expired";
  public created_at!: Date;
}

LotTracking.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "products", key: "id" } },
    lot_number: { type: DataTypes.STRING, allowNull: false, unique: true },
    qr_code: { type: DataTypes.STRING, allowNull: false, unique: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    manufacture_date: { type: DataTypes.DATE, allowNull: true },
    expiry_date: { type: DataTypes.DATE, allowNull: true },
    warehouse_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: "warehouses", key: "id" } },
    bin_location: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "active" },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { sequelize, tableName: "lot_trackings", timestamps: false }
);
