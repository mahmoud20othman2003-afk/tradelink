import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface ProductBundleAttributes {
  id: number;
  name: string;
  description: string | null;
  supplier_id: number;
  bundle_price: number;
  original_total: number;
  status: "active" | "inactive";
  created_at: Date;
}

export type ProductBundleCreationAttributes = Optional<
  ProductBundleAttributes,
  "id" | "description" | "status" | "created_at"
>;

export class ProductBundle
  extends Model<ProductBundleAttributes, ProductBundleCreationAttributes>
  implements ProductBundleAttributes {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public supplier_id!: number;
  public bundle_price!: number;
  public original_total!: number;
  public status!: "active" | "inactive";
  public created_at!: Date;
}

ProductBundle.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    supplier_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
    bundle_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    original_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "active" },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { sequelize, tableName: "product_bundles", timestamps: false }
);
