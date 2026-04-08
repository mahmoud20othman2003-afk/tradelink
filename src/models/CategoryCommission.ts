import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface CategoryCommissionAttributes {
  id: number;
  category_id: number;
  supplier_rate: number;
  wholesaler_rate: number;
  retailer_rate: number;
  updated_by: number | null;
  updated_at: Date;
}

export type CategoryCommissionCreationAttributes = Optional<
  CategoryCommissionAttributes,
  "id" | "supplier_rate" | "wholesaler_rate" | "retailer_rate" | "updated_by" | "updated_at"
>;

export class CategoryCommission
  extends Model<CategoryCommissionAttributes, CategoryCommissionCreationAttributes>
  implements CategoryCommissionAttributes {
  public id!: number;
  public category_id!: number;
  public supplier_rate!: number;
  public wholesaler_rate!: number;
  public retailer_rate!: number;
  public updated_by!: number | null;
  public updated_at!: Date;
}

CategoryCommission.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    category_id: {
      type: DataTypes.INTEGER, allowNull: false, unique: true,
      references: { model: "categories", key: "id" }
    },
    supplier_rate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 5.00 },
    wholesaler_rate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 3.00 },
    retailer_rate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 2.00 },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { sequelize, tableName: "category_commissions", timestamps: false }
);
