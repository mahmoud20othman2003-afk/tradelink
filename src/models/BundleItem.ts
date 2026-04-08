import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface BundleItemAttributes {
  id: number;
  bundle_id: number;
  product_id: number;
  quantity: number;
}

export type BundleItemCreationAttributes = Optional<BundleItemAttributes, "id">;

export class BundleItem
  extends Model<BundleItemAttributes, BundleItemCreationAttributes>
  implements BundleItemAttributes {
  public id!: number;
  public bundle_id!: number;
  public product_id!: number;
  public quantity!: number;
}

BundleItem.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    bundle_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "product_bundles", key: "id" } },
    product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "products", key: "id" } },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }
  },
  { sequelize, tableName: "bundle_items", timestamps: false }
);
