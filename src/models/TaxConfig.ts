import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface TaxConfigAttributes {
  id: number;
  category_id: number | null;
  name: string;
  rate: number;
  is_inclusive: boolean;
  status: "active" | "inactive";
  updated_by: number | null;
  created_at: Date;
}

export type TaxConfigCreationAttributes = Optional<
  TaxConfigAttributes,
  "id" | "category_id" | "is_inclusive" | "status" | "updated_by" | "created_at"
>;

export class TaxConfig
  extends Model<TaxConfigAttributes, TaxConfigCreationAttributes>
  implements TaxConfigAttributes {
  public id!: number;
  public category_id!: number | null;
  public name!: string;
  public rate!: number;
  public is_inclusive!: boolean;
  public status!: "active" | "inactive";
  public updated_by!: number | null;
  public created_at!: Date;
}

TaxConfig.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    category_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: "categories", key: "id" } },
    name: { type: DataTypes.STRING, allowNull: false },
    rate: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    is_inclusive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "active" },
    updated_by: { type: DataTypes.INTEGER, allowNull: true, references: { model: "users", key: "id" } },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { sequelize, tableName: "tax_configs", timestamps: false }
);
