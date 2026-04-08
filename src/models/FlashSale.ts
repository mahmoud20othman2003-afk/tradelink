import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface FlashSaleAttributes {
  id: number;
  product_id: number;
  sale_price: number;
  original_price: number;
  quantity_limit: number;
  quantity_sold: number;
  starts_at: Date;
  ends_at: Date;
  status: string;
  created_by: number;
  created_at: Date;
}

export type FlashSaleCreationAttributes = Optional<
  FlashSaleAttributes,
  "id" | "quantity_sold" | "status" | "created_at"
>;

export class FlashSale
  extends Model<FlashSaleAttributes, FlashSaleCreationAttributes>
  implements FlashSaleAttributes {
  public id!: number;
  public product_id!: number;
  public sale_price!: number;
  public original_price!: number;
  public quantity_limit!: number;
  public quantity_sold!: number;
  public starts_at!: Date;
  public ends_at!: Date;
  public status!: string;
  public created_by!: number;
  public created_at!: Date;
}

FlashSale.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    product_id: {
      type: DataTypes.INTEGER, allowNull: false,
      references: { model: "products", key: "id" }
    },
    sale_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    original_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    quantity_limit: { type: DataTypes.INTEGER, allowNull: false },
    quantity_sold: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    starts_at: { type: DataTypes.DATE, allowNull: false },
    ends_at: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "scheduled" },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { sequelize, tableName: "flash_sales", timestamps: false }
);
