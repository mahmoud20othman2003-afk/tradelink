import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface ShippingZoneAttributes {
  id: number;
  zone_name: string;
  governorates: string;
  base_cost: number;
  cost_per_kg: number;
  estimated_days_min: number;
  estimated_days_max: number;
}

export type ShippingZoneCreationAttributes = Optional<ShippingZoneAttributes, "id">;

export class ShippingZone
  extends Model<ShippingZoneAttributes, ShippingZoneCreationAttributes>
  implements ShippingZoneAttributes {
  public id!: number;
  public zone_name!: string;
  public governorates!: string;
  public base_cost!: number;
  public cost_per_kg!: number;
  public estimated_days_min!: number;
  public estimated_days_max!: number;
}

ShippingZone.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    zone_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    governorates: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    base_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    cost_per_kg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    estimated_days_min: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estimated_days_max: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "shipping_zones",
    timestamps: false
  }
);
