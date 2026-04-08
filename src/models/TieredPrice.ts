import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface TieredPriceAttributes {
  id: number;
  product_id: number;
  min_qty: number;
  max_qty: number | null;
  price_per_unit: number;
}

export type TieredPriceCreationAttributes = Optional<TieredPriceAttributes, "id" | "max_qty">;

export class TieredPrice
  extends Model<TieredPriceAttributes, TieredPriceCreationAttributes>
  implements TieredPriceAttributes {
  public id!: number;
  public product_id!: number;
  public min_qty!: number;
  public max_qty!: number | null;
  public price_per_unit!: number;
}

TieredPrice.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    product_id: {
      type: DataTypes.INTEGER, allowNull: false,
      references: { model: "products", key: "id" }
    },
    min_qty: { type: DataTypes.INTEGER, allowNull: false },
    max_qty: { type: DataTypes.INTEGER, allowNull: true },
    price_per_unit: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
  },
  { sequelize, tableName: "tiered_prices", timestamps: false }
);
